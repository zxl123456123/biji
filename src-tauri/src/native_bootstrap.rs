use serde::Serialize;
use std::{collections::HashSet, sync::{Arc, Mutex}, time::Duration};
use tauri::{AppHandle, Emitter, Manager, Url, WebviewWindow, WebviewWindowBuilder, WebviewUrl};
use tokio::sync::Notify;

const FAILURE_EVENT: &str = "native-bootstrap-failed";
const READY_TIMEOUT: Duration = Duration::from_secs(30);
const CACHE_MASK: i32 = 0x8110;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Phase { Pending, Ready, Failed }

impl Default for Phase { fn default() -> Self { Self::Pending } }

#[derive(Default)]
struct RuntimeState {
    phase: Phase,
    entries: HashSet<String>,
    failure_code: Option<&'static str>,
}

pub struct NativeBootstrap {
    state: Mutex<RuntimeState>,
    changed: Notify,
    migration_gate: Arc<MigrationGate>,
}

impl Default for NativeBootstrap {
    fn default() -> Self {
        Self { state: Mutex::new(RuntimeState::default()), changed: Notify::new(), migration_gate: Arc::new(MigrationGate::default()) }
    }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BootstrapResult { status: &'static str, code: Option<&'static str> }

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SafeMigrationOutcome { pub configured: bool, pub outcome_code: &'static str }

impl SafeMigrationOutcome {
    pub fn failed(code: &'static str) -> Self { Self { configured: false, outcome_code: code } }
}

#[derive(Default)]
pub struct MigrationGate(Mutex<()>);

impl MigrationGate {
    pub fn run(&self, work: impl FnOnce() -> SafeMigrationOutcome) -> SafeMigrationOutcome {
        let Ok(_guard) = self.0.lock() else { return SafeMigrationOutcome::failed("worker_failed") };
        work()
    }
}

#[derive(Clone, Copy)]
pub enum ImportFailure { SourceMissing, VaultUnavailable }

pub fn run_import<C, R, W>(
    gate: &MigrationGate,
    configured: C,
    read_source: R,
    write_secret: W,
) -> SafeMigrationOutcome
where
    C: FnOnce() -> bool,
    R: FnOnce() -> Result<String, ImportFailure>,
    W: FnOnce(&str) -> Result<(), ImportFailure>,
{
    gate.run(|| {
        if configured() {
            return SafeMigrationOutcome { configured: true, outcome_code: "configured" };
        }
        let raw = match read_source() {
            Ok(raw) => raw,
            Err(error) => return migration_failure(error),
        };
        let value: serde_json::Value = match serde_json::from_str(&raw) {
            Ok(value) => value,
            Err(_) => return SafeMigrationOutcome::failed("source_invalid"),
        };
        let Some(key) = value.pointer("/provider/deepseek/options/apiKey").and_then(|value| value.as_str()).filter(|key| !key.is_empty()) else {
            return SafeMigrationOutcome::failed("key_unavailable");
        };
        match write_secret(key) {
            Ok(()) => SafeMigrationOutcome { configured: true, outcome_code: "configured" },
            Err(error) => migration_failure(error),
        }
    })
}

fn migration_failure(error: ImportFailure) -> SafeMigrationOutcome {
    match error {
        ImportFailure::SourceMissing => SafeMigrationOutcome::failed("source_missing"),
        ImportFailure::VaultUnavailable => SafeMigrationOutcome::failed("vault_unavailable"),
    }
}

fn code_for_label(label: &str) -> Result<(), &'static str> {
    if label == "main" || label == "pet" { Ok(()) } else { Err("unexpected_window") }
}

impl NativeBootstrap {
    fn phase(&self) -> Result<Phase, String> {
        self.state.lock().map(|s| s.phase).map_err(|_| "启动状态不可用".into())
    }

    fn report(&self, label: &str) -> Result<(), &'static str> {
        code_for_label(label)?;
        let mut state = self.state.lock().map_err(|_| "state_unavailable")?;
        if state.phase != Phase::Pending { return Err("startup_closed"); }
        if !state.entries.insert(label.to_owned()) { return Err("duplicate_entry"); }
        if state.entries.contains("main") && state.entries.contains("pet") {
            state.phase = Phase::Ready;
            self.changed.notify_waiters();
        }
        Ok(())
    }

    async fn wait_for_result(&self) -> BootstrapResult {
        let wait = async {
            loop {
                let changed = self.changed.notified();
                tokio::pin!(changed);
                changed.as_mut().enable();
                let status = { self.state.lock().ok().map(|state| (state.phase, state.failure_code)) };
                match status {
                    Some((Phase::Ready, _)) => return BootstrapResult { status: "ready", code: None },
                    Some((Phase::Failed, code)) => return BootstrapResult { status: "failed", code },
                    Some((Phase::Pending, _)) => changed.await,
                    None => return BootstrapResult { status: "failed", code: Some("state_unavailable") },
                }
            }
        };
        match tokio::time::timeout(READY_TIMEOUT, wait).await {
            Ok(result) => result,
            Err(_) => BootstrapResult { status: "failed", code: Some("entry_timeout") },
        }
    }

    fn fail(&self, code: &'static str) -> bool {
        let Ok(mut state) = self.state.lock() else { return false };
        if state.phase != Phase::Pending { return false; }
        state.phase = Phase::Failed;
        state.failure_code = Some(code);
        self.changed.notify_waiters();
        true
    }
}

pub fn require_ready(app: &AppHandle) -> Result<(), String> {
    require_phase_ready(app.state::<NativeBootstrap>().phase()?)
}

fn require_phase_ready(phase: Phase) -> Result<(), String> {
    match phase { Phase::Ready => Ok(()), Phase::Pending => Err("应用仍在安全启动".into()), Phase::Failed => Err("应用启动失败".into()) }
}

pub fn migration_gate(app: &AppHandle) -> Arc<MigrationGate> {
    app.state::<NativeBootstrap>().migration_gate.clone()
}

pub fn fail_bootstrap(app: &AppHandle, code: &'static str) {
    let state = app.state::<NativeBootstrap>();
    if record_failure(&state, code) {
        let payload = serde_json::json!({ "code": code });
        let _ = app.emit_to("main", FAILURE_EVENT, payload.clone());
        let _ = app.emit_to("pet", FAILURE_EVENT, payload);
        eprintln!("Native bootstrap failed: {code}");
    }
}

fn record_failure(state: &NativeBootstrap, code: &'static str) -> bool { state.fail(code) }

#[derive(Debug, PartialEq, Eq)]
struct SetupFailure { phase: Phase, code: &'static str, message: &'static str, newly_failed: bool }

fn setup_failure(state: &NativeBootstrap, code: &'static str, message: &'static str) -> SetupFailure {
    let newly_failed = record_failure(state, code);
    let phase = state.phase().unwrap_or(Phase::Failed);
    SetupFailure { phase, code, message, newly_failed }
}

fn setup_error(app: &AppHandle, code: &'static str, message: &'static str) -> String {
    let state = app.state::<NativeBootstrap>();
    let failure = setup_failure(&state, code, message);
    if failure.newly_failed {
        let payload = serde_json::json!({ "code": failure.code });
        let _ = app.emit_to("main", FAILURE_EVENT, payload.clone());
        let _ = app.emit_to("pet", FAILURE_EVENT, payload);
        eprintln!("Native bootstrap failed: {}", failure.code);
    }
    failure.message.to_owned()
}

pub fn window_closed(app: &AppHandle) {
    fail_bootstrap(app, "window_closed");
}

#[tauri::command]
pub async fn bootstrap_entry_ready(window: WebviewWindow, app: AppHandle) -> BootstrapResult {
    let label = window.label().to_owned();
    let expected = expected_entry_url(&app, &label);
    let current = window.url().map_err(|_| "entry_url_unavailable");
    match (expected, current) {
        (Ok(expected), Ok(current)) if entry_matches(&expected, &current) => {}
        _ => {
            fail_bootstrap(&app, "unexpected_entry");
            return BootstrapResult { status: "failed", code: Some("unexpected_entry") };
        }
    }
    if let Err(code) = app.state::<NativeBootstrap>().report(&label) {
        fail_bootstrap(&app, code);
        return BootstrapResult { status: "failed", code: Some(code) };
    }
    let result = app.state::<NativeBootstrap>().wait_for_result().await;
    if result.code == Some("entry_timeout") { fail_bootstrap(&app, "entry_timeout"); }
    result
}

pub fn setup(app: &AppHandle) -> Result<(), String> {
    let Some(mut main_config) = app.config().app.windows.iter().find(|w| w.label == "main").cloned() else {
        return Err(setup_error(app, "main_config_missing", "main window config missing"));
    };
    main_config.create = true;
    main_config.url = match Url::parse("about:blank") {
        Ok(url) => WebviewUrl::External(url),
        Err(_) => return Err(setup_error(app, "blank_url_invalid", "blank startup URL invalid")),
    };
    let main = match WebviewWindowBuilder::from_config(app, &main_config).and_then(|builder| builder.build()) {
        Ok(window) => window,
        Err(_) => return Err(setup_error(app, "main_window_failed", "main window creation failed")),
    };
    if crate::desktop_pet::setup(app).is_err() {
        return Err(setup_error(app, "pet_setup_failed", "pet window setup failed"));
    }
    let Some(pet) = app.get_webview_window("pet") else {
        return Err(setup_error(app, "pet_window_missing", "pet window missing"));
    };

    #[cfg(windows)]
    {
        start_cache_cleanup(app.clone(), main, pet);
        Ok(())
    }
    #[cfg(not(windows))]
    {
        let _ = (main, pet);
        Err(setup_error(app, "unsupported_platform", "native bootstrap is only configured for Windows"))
    }
}

fn base_entry_url(dev_url: Option<Url>, is_dev: bool, use_https: bool) -> Result<Url, &'static str> {
    if is_dev { return dev_url.ok_or("dev_url_missing"); }
    Url::parse(if use_https { "https://tauri.localhost/" } else { "http://tauri.localhost/" })
        .map_err(|_| "entry_url_invalid")
}

fn compose_entry_url(base: &Url, label: &str) -> Result<Url, &'static str> {
    match label {
        "main" => {
            let mut url = base.clone();
            url.set_query(None);
            url.set_fragment(None);
            Ok(url)
        }
        "pet" => base.join("index.html?pet=1").map_err(|_| "entry_url_invalid"),
        _ => Err("unexpected_window"),
    }
}

fn entry_matches(expected: &Url, current: &Url) -> bool {
    current.origin() == expected.origin() && current.path() == expected.path() && current.query() == expected.query()
}

fn expected_entry_url(app: &AppHandle, label: &str) -> Result<Url, &'static str> {
    let dev_url = app.config().build.dev_url.clone();
    let https = app.config().app.windows.iter().find(|w| w.label == "main").map(|w| w.use_https_scheme).unwrap_or(false);
    let base = base_entry_url(dev_url, tauri::is_dev(), https)?;
    compose_entry_url(&base, label)
}

#[cfg(windows)]
fn start_cache_cleanup(app: AppHandle, main: WebviewWindow, pet: WebviewWindow) {
    let watchdog_app = app.clone();
    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(READY_TIMEOUT).await;
        if watchdog_app.state::<NativeBootstrap>().phase().ok() == Some(Phase::Pending) {
            fail_bootstrap(&watchdog_app, "entry_timeout");
        }
    });
    clear_profile(main.clone(), {
        let app = app.clone();
        let pet = pet.clone();
        Box::new(move |result| match result {
            Ok(()) if bootstrap_is_pending(&app) => clear_profile(pet, {
                let app = app.clone();
                Box::new(move |second| match second {
                    Ok(()) if bootstrap_is_pending(&app) => navigate_to_entries(app, main),
                    Ok(()) => (),
                    Err(()) => fail_bootstrap(&app, "cache_clear_failed"),
                })
            }),
            Ok(()) => (),
            Err(()) => fail_bootstrap(&app, "cache_clear_failed"),
        })
    });
}

#[cfg(windows)]
type ClearDone = Box<dyn FnOnce(Result<(), ()>) + Send>;

#[cfg(windows)]
fn clear_profile(window: WebviewWindow, done: ClearDone) {
    let app = window.app_handle().clone();
    let failed_app = app.clone();
    let done = Arc::new(Mutex::new(Some(done)));
    let callback_done = done.clone();
    if let Err(_) = window.with_webview(move |platform| {
        use windows::core::Interface;
        use webview2_com::{ClearBrowsingDataCompletedHandler, Microsoft::Web::WebView2::Win32::{ICoreWebView2_13, ICoreWebView2Profile2, COREWEBVIEW2_BROWSING_DATA_KINDS}};
        let result = (|| -> windows::core::Result<()> {
            let core = unsafe { platform.controller().CoreWebView2()? };
            let core13 = core.cast::<ICoreWebView2_13>()?;
            let profile = unsafe { core13.Profile()? }.cast::<ICoreWebView2Profile2>()?;
            let callback_app = app.clone();
            let handler = ClearBrowsingDataCompletedHandler::create(Box::new(move |result| {
                let outcome = if result.is_ok() { Ok(()) } else { Err(()) };
                let callback_done = callback_done.clone();
                let _ = callback_app.run_on_main_thread(move || {
                    if let Ok(mut callback) = callback_done.lock() { if let Some(callback) = callback.take() { callback(outcome); } }
                });
                Ok(())
            }));
            unsafe { profile.ClearBrowsingData(COREWEBVIEW2_BROWSING_DATA_KINDS(CACHE_MASK), &handler) }
        })();
        if result.is_err() {
            let callback_done = done.clone();
            let _ = app.run_on_main_thread(move || {
                if let Ok(mut callback) = callback_done.lock() { if let Some(callback) = callback.take() { callback(Err(())); } }
            });
        }
    }) {
        fail_bootstrap(&failed_app, "cache_clear_unavailable");
    }
}

#[cfg(windows)]
fn navigate_to_entries(app: AppHandle, main: WebviewWindow) {
    if !bootstrap_is_pending(&app) { return; }
    let pet = match app.get_webview_window("pet") { Some(window) => window, None => { fail_bootstrap(&app, "pet_window_missing"); return; } };
    let main_url = match expected_entry_url(&app, "main") { Ok(url) => url, Err(code) => { fail_bootstrap(&app, code); return; } };
    let pet_url = match expected_entry_url(&app, "pet") { Ok(url) => url, Err(code) => { fail_bootstrap(&app, code); return; } };
    if main.navigate(main_url).is_err() { fail_bootstrap(&app, "main_navigation_failed"); return; }
    if pet.navigate(pet_url).is_err() { fail_bootstrap(&app, "pet_navigation_failed"); }
}

fn bootstrap_is_pending(app: &AppHandle) -> bool {
    app.state::<NativeBootstrap>().phase().ok().is_some_and(phase_is_pending)
}

fn phase_is_pending(phase: Phase) -> bool { phase == Phase::Pending }

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ready_requires_both_fresh_window_entries() {
        let state = NativeBootstrap::default();
        assert_eq!(state.phase().unwrap(), Phase::Pending);
        state.report("main").unwrap();
        assert_eq!(state.phase().unwrap(), Phase::Pending);
        state.report("pet").unwrap();
        assert_eq!(state.phase().unwrap(), Phase::Ready);
    }

    #[test]
    fn failure_is_terminal_and_late_entry_cannot_ready() {
        let state = NativeBootstrap::default();
        state.report("main").unwrap();
        assert!(state.fail("pet_navigation_failed"));
        assert!(!state.fail("entry_timeout"));
        assert_eq!(state.phase().unwrap(), Phase::Failed);
        assert_eq!(state.report("pet"), Err("startup_closed"));
    }

    #[test]
    fn duplicate_and_unexpected_window_reports_fail() {
        let state = NativeBootstrap::default();
        state.report("main").unwrap();
        assert_eq!(state.report("main"), Err("duplicate_entry"));
        let other = NativeBootstrap::default();
        assert_eq!(other.report("other"), Err("unexpected_window"));
    }

    #[test]
    fn business_gate_only_opens_after_ready() {
        assert!(require_phase_ready(Phase::Pending).is_err());
        assert!(require_phase_ready(Phase::Failed).is_err());
        assert!(require_phase_ready(Phase::Ready).is_ok());
    }

    #[test]
    fn every_setup_failure_class_records_failed_and_keeps_gate_closed() {
        let failures = [
            ("main_config_missing", "main window config missing"),
            ("blank_url_invalid", "blank startup URL invalid"),
            ("main_window_failed", "main window creation failed"),
            ("pet_setup_failed", "pet window setup failed"),
            ("pet_window_missing", "pet window missing"),
            ("unsupported_platform", "native bootstrap is only configured for Windows"),
        ];
        for (code, message) in failures {
            let state = NativeBootstrap::default();
            let failure = setup_failure(&state, code, message);
            assert_eq!(failure.phase, Phase::Failed, "{code}");
            assert_eq!(failure.code, code, "{code}");
            assert_eq!(failure.message, message, "{code}");
            assert!(failure.newly_failed, "{code}");
            assert_eq!(state.phase().unwrap(), Phase::Failed, "{code}");
            assert!(require_phase_ready(Phase::Failed).is_err(), "{code}");
        }
    }

    #[test]
    fn entry_url_composition_covers_dev_http_and_https() {
        let dev = Url::parse("http://localhost:1420/").unwrap();
        let dev_main = compose_entry_url(&base_entry_url(Some(dev.clone()), true, false).unwrap(), "main").unwrap();
        let dev_pet = compose_entry_url(&base_entry_url(Some(dev), true, false).unwrap(), "pet").unwrap();
        assert_eq!(dev_main.as_str(), "http://localhost:1420/");
        assert_eq!(dev_pet.as_str(), "http://localhost:1420/index.html?pet=1");
        let http = base_entry_url(None, false, false).unwrap();
        let https = base_entry_url(None, false, true).unwrap();
        assert_eq!(compose_entry_url(&http, "pet").unwrap().as_str(), "http://tauri.localhost/index.html?pet=1");
        assert_eq!(compose_entry_url(&https, "main").unwrap().as_str(), "https://tauri.localhost/");
        assert_eq!(compose_entry_url(&http, "unknown"), Err("unexpected_window"));
        assert!(entry_matches(&compose_entry_url(&http, "pet").unwrap(), &Url::parse("http://tauri.localhost/index.html?pet=1").unwrap()));
        assert!(!entry_matches(&compose_entry_url(&http, "pet").unwrap(), &Url::parse("http://tauri.localhost/index.html?pet=0").unwrap()));
        assert!(!entry_matches(&compose_entry_url(&http, "main").unwrap(), &Url::parse("http://tauri.localhost/?unexpected=1").unwrap()));
    }

    #[test]
    fn failure_after_main_ready_timeout_or_late_pet_callback_never_opens_gate() {
        for code in ["pet_navigation_failed", "entry_timeout", "cache_clear_failed"] {
            let state = NativeBootstrap::default();
            state.report("main").unwrap();
            assert_eq!(state.phase().unwrap(), Phase::Pending);
            assert!(record_failure(&state, code));
            assert_eq!(state.phase().unwrap(), Phase::Failed);
            assert!(!phase_is_pending(state.phase().unwrap()));
            assert!(require_phase_ready(Phase::Failed).is_err());
            assert_eq!(state.report("pet"), Err("startup_closed"));
            assert!(!state.fail("late_callback"));
            assert_eq!(state.phase().unwrap(), Phase::Failed);
        }
    }

    #[test]
    fn migration_gate_serializes_concurrent_idempotent_import_to_one_write() {
        use std::sync::{atomic::{AtomicUsize, Ordering}, Barrier};
        use std::thread;
        let gate = Arc::new(MigrationGate::default());
        let writes = Arc::new(AtomicUsize::new(0));
        let secret = Arc::new(Mutex::new(None::<String>));
        let barrier = Arc::new(Barrier::new(8));
        let workers = (0..8).map(|_| {
            let gate = gate.clone(); let writes = writes.clone(); let secret = secret.clone(); let barrier = barrier.clone();
            thread::spawn(move || {
                barrier.wait();
                run_import(
                    &gate,
                    || secret.lock().unwrap().is_some(),
                    || Ok(r#"{"provider":{"deepseek":{"options":{"apiKey":"test-secret"}}}}"#.to_owned()),
                    |key| {
                        *secret.lock().unwrap() = Some(key.to_owned());
                        writes.fetch_add(1, Ordering::SeqCst);
                        Ok(())
                    },
                )
            })
        }).collect::<Vec<_>>();
        for worker in workers {
            let result = worker.join().unwrap();
            assert!(result.configured);
            assert_eq!(result.outcome_code, "configured");
        }
        assert_eq!(writes.load(Ordering::SeqCst), 1);
        assert_eq!(secret.lock().unwrap().as_deref(), Some("test-secret"));
    }

    #[test]
    fn migration_gate_serializes_each_invocation_and_allows_retry_after_failure() {
        use std::sync::atomic::{AtomicUsize, Ordering};
        let gate = MigrationGate::default();
        let secret = Mutex::new(None::<String>);
        let writes = AtomicUsize::new(0);
        let first = run_import(
            &gate,
            || false,
            || Ok(r#"{"provider":{"deepseek":{"options":{"apiKey":"retry-secret"}}}}"#.to_owned()),
            |_| { writes.fetch_add(1, Ordering::SeqCst); Err(ImportFailure::VaultUnavailable) },
        );
        let second = run_import(
            &gate,
            || secret.lock().unwrap().is_some(),
            || Ok(r#"{"provider":{"deepseek":{"options":{"apiKey":"retry-secret"}}}}"#.to_owned()),
            |key| {
                writes.fetch_add(1, Ordering::SeqCst);
                *secret.lock().unwrap() = Some(key.to_owned());
                Ok(())
            },
        );
        let third = run_import(
            &gate,
            || secret.lock().unwrap().is_some(),
            || panic!("configured importer must not reread source"),
            |_| panic!("configured importer must not write secret"),
        );
        assert_eq!(first.outcome_code, "vault_unavailable");
        assert_eq!(second.outcome_code, "configured");
        assert_eq!(third.outcome_code, "configured");
        assert_eq!(writes.load(Ordering::SeqCst), 2);
        assert_eq!(secret.lock().unwrap().as_deref(), Some("retry-secret"));
    }
}
