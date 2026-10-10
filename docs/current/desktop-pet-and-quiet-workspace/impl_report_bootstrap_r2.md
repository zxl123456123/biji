# Bootstrap implementation report r2

## Basic information

- `feature_name`: `desktop-pet-and-quiet-workspace`
- `impl_round`: `bootstrap_r2`
- `date`: `2026-10-07`
- `lwplan_version`: `PLAN_DEFECT-R2.10` (`review_notes_lwplan_6.md`, Gate-2 PASS)
- Input: `review_notes_impl_bootstrap_r1.md`, specifically P2 setup Failed state and P2 pure test closure.
- Boundary: only the setup failure-state paths and impl-safe tests requested by the review. No application was started; no isolated or original profile, database, localStorage, credential vault, or backup was accessed.

## Change facts

| path | change_type | change_purpose | key_changes | related_tasks |
| --- | --- | --- | --- | --- |
| `src-tauri/src/native_bootstrap.rs` | modified | Close setup failure state gaps and make plan-required decisions testable | Main config missing, blank URL construction, main creation, pet setup/lookup, and non-Windows refusal now pass through the common Failed/broadcast path with fixed codes before returning setup error. Extracted base/entry URL composition and exact URL matching. Added a serialized migration gate abstraction used by both startup and explicit AI import. Added pure tests for setup failure codes, dev/HTTP/HTTPS URLs, fail-after-main-ready/timeout/late pet report and business gate, concurrent idempotent migration, and retry after failure. | §6.8, §7.1 |
| `src-tauri/src/lib.rs` | modified | Route the existing credential importer through the tested shared gate | `run_import_serialized` now supplies the existing idempotent importer to `MigrationGate::run`; startup migration and `import_deepseek_config` continue to use this same function. | §6.8 |
| `docs/current/desktop-pet-and-quiet-workspace/impl_report_bootstrap_r2.md` | added | Record this revision and evidence limits | This report; r1 report remains unchanged. | N/A — required implementation report |

## Plan and finding alignment

- `goal_lock_check`: R2.10 §6.8:424 requires each main/pet/bootstrap setup error to set Failed and return setup error. Missing main config, pet setup/lookup and non-Windows refusal now use `setup_failure`; main creation and blank URL failures also use it. §7.1:581 requires pure state evidence for migration pending/concurrent AI import, and §6.8:428 requires one shared serial/idempotent import path. The gate serializes calls; the existing import function checks `ai_configured_inner()` while inside the gate, so a concurrent second importer sees the first success and skips a second credential write. URL helpers now encode the plan’s main base and pet `base.join("index.html?pet=1")` for dev, production HTTP, and configured HTTPS.
- `anti_goal_touch_check`: No data/profile/credential operation was run. The migration concurrency test uses an in-memory configured flag and counter only. No schema, identifier, profile, PWA, user-facing setting, or application behavior was otherwise changed.
- `authoring_ergonomics_notes`: N/A — no declaration format or user-authored product content changed.
- `contract_drift_reports`: None observed. The changes implement the current R2.10 contract; no plan edits were made.
- `rollback`: 可直接回滚 `native_bootstrap.rs`/`lib.rs` and this r2 report. No commit was made. Keep the earlier r1 report intact.

## Verification records

All commands were local impl-safe checks. No program, service, browser, or profile was started.

| command | exit | observed output / evidence | owner | conclusion_if_missing |
| --- | ---: | --- | --- | --- |
| `cargo check --manifest-path src-tauri/Cargo.toml` | 0 | Final run: `Checking qingjian v0.9.0`; `Finished dev profile`. No Rust compiler warnings. | impl | If absent, revised Rust/API bindings remain unverified. |
| `cargo test --manifest-path src-tauri/Cargo.toml` | 0 | `running 29 tests`; `test result: ok. 29 passed; 0 failed; 0 ignored`; main and doc tests each 0 failed. New coverage includes setup failure terminal state, URL composition, main-ready then failure/timeout/late entry, concurrent serialized idempotent importer and retry after failure. Linker prints its existing informational `.dll.lib`/`.dll.exp` creation warning. | impl | If absent, revised pure state/URL/concurrency tests remain unverified. |
| `git diff --check` | 0 | No whitespace errors; Git emitted CRLF normalization notices for modified worktree files. | impl | If absent, final patch whitespace is unverified. |

### First revision-run warning and correction

The first revised `cargo check` and `cargo test` each exited 0 but reported `unused variable: label` in `entry_matches`. I removed that parameter and reran both commands; the final check is warning-free and final tests pass. The linker informational warning remains during `cargo test`.

`cargo fmt --check` was previously attempted during r1 and failed because the stable toolchain lacks `cargo-fmt.exe`. I did not install rustfmt or run an alternative formatter in r2; formatting remains unverified. The previous full tool output is preserved in `impl_report_bootstrap_r1.md`.

## Added test evidence and limits

- Setup failure test runs the same phase transition used by `fail_bootstrap` for `main_config_missing`, `blank_url_invalid`, `main_window_failed`, `pet_setup_failed`, `pet_window_missing`, and `unsupported_platform`; every case reaches Failed and the Ready gate rejects it. This is a pure state test, not an actual Tauri setup failure injection.
- URL tests exercise dev `http://localhost:1420/`, production `http://tauri.localhost/`, configured `https://tauri.localhost/`, pet `index.html?pet=1`, unknown labels, and exact pet query matching. They test pure URL construction/matching, not a live WebView URL.
- Failure sequence tests record main ready, then simulate `pet_navigation_failed`, `entry_timeout`, or `cache_clear_failed`; each becomes terminal Failed, rejects the business gate, makes the actual cleanup continuation predicate false, rejects a late pet entry, and cannot be turned back to Ready by a later failure callback. They do not execute Tauri events, watchdog timing, or a callback.
- Migration test starts eight worker threads together. Each invokes the same `MigrationGate`; inside the serialized closure, an in-memory configured flag represents the existing `ai_configured_inner()` idempotence check and increments a write counter only on the first transition. It observes one simulated write and eight configured results. A separate test confirms failure is not cached and a later invocation can retry. These tests do not access keyring, call `prepareAi()`, or prove real OS credential writes.

## Coordinator handoff verifications

| verification | why impl did not run it | suggested owner/action | evidence_expected | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| Real main-config/pet-setup failure and emitted native event | Requires a running Tauri application and failure injection; outside impl-safe. | coordinator: validate in an isolated test app/profile or harness. | Setup returns error; shared state is Failed with fixed code; no business entry navigation; pending handshake receives failure if a window exists. | Actual setup error reporting remains unverified despite pure state coverage. |
| WebView2 `navigate` and observed main/pet URL, including packaged HTTPS setting | Requires live WebView2 runtime and packaging. | coordinator: capture each window's actual `window.url()` during isolated startup. | Values match the pure URL expectations and actual Tauri protocol normalization. | Runtime URL acceptance remains unverified. |
| Concurrent startup migration and explicit `prepareAi()` against credential vault | Requires actual OS vault and app invocation path. | coordinator: isolated credential fixture; do not read or mutate original profile credentials. | Concurrent invocation order, one successful vault write, fixed outcome codes, and no secret in logs. | The actual worker/keyring path remains unverified; pure test only proves the serialization abstraction and modeled idempotence. |
| Main-ready/pet-failed, watchdog, and late WebView2 callback behavior | Requires two real/failure-injected WebViews. | coordinator: run controlled isolated failure fixture. | Failed state/event; late callback cannot navigate or Ready; all business commands reject; zero import/local data/credential/network side effects. | Native partial-navigation safety remains unverified. |
| Old-cache fixture and formal 0.9.0 EXE/original-profile check | Requires isolated WebView2 profile first, then actual formal executable and original-profile evidence. | coordinator: continue §7.1 sequence after isolated checks. | Old entry sentinel absent; selected cache cleared; localStorage/SQLite/credential fields retained; exact process path/version/SHA; current UI. | Cache issue remains unverified; do not claim practical delivery readiness. |

These handoff items do not become passes because the pure tests pass. No native/cache/profile behavior is claimed as actually verified in r2.

## Incomplete items, risks, and review focus

- No real Tauri setup failure, WebView2 callback, URL, migration/keyring concurrency, old-cache profile, or executable was exercised.
- The concurrent importer test models the keyring's configured check with an in-memory flag; it must not be cited as evidence of one real credential-vault write.
- The URL test follows `lwplan.md` §6.8:426's explicit pet `index.html?pet=1` target; coordinator should compare it with the actual production WebView URL during isolated runtime verification.
- Rust formatting was not run in r2; `cargo fmt` is unavailable in this toolchain, and no alternate formatter was run.

## Cross-functional facts

No cross-functional facts identified.
