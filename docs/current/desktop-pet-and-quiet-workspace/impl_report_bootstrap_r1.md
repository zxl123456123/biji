# Bootstrap implementation report r1

## Basic information

- `feature_name`: `desktop-pet-and-quiet-workspace`
- `impl_round`: `bootstrap_r1`
- `date`: `2026-10-07`
- `lwplan_version`: `PLAN_DEFECT-R2.10` (`review_notes_lwplan_6.md`, Gate-2 PASS)
- Implementation boundary: §3, §6.8, §7.1 and §9, bootstrap only. No process was launched and no user profile, database, localStorage, credential vault, or backup was read or modified.

## Change facts

| path | change_type | change_purpose | key_changes | related_tasks |
| --- | --- | --- | --- | --- |
| `src-tauri/src/native_bootstrap.rs` | added | Own native startup state and cache gate | Pending/Ready/Failed state; two fresh entry handshakes; expected origin/path/query validation; terminal failure broadcast; 30-second watchdog; Windows WebView2 clear mask `0x8110` (service workers, CacheStorage, disk cache); main and pet profiles are cleared sequentially before either window navigates; stale completion callbacks cannot navigate after failure; shared serialized migration gate | §6.8, §7.1 |
| `src-tauri/src/lib.rs` | modified | Move credential migration behind Ready and gate business commands | Removed setup-time credential migration; gates `load_data`, `save_data`, AI commands, and the startup migration; executes credential reads/writes with `spawn_blocking`; maps migration failures to fixed safe codes; registers bootstrap command/state and propagates setup errors | §6.8 |
| `src-tauri/src/desktop_pet.rs` | modified | Make pet entry safe before bootstrap | Creates pet at `about:blank`; gates every pet business/window command on Ready | §6.8 |
| `src-tauri/tauri.conf.json` | modified | Prevent automatic main-window business navigation | Gives main an explicit label and `create:false`; bootstrap creates it from the existing window config at `about:blank` | §6.8 |
| `src/main.tsx` | modified | Keep the Tauri entry minimal until startup gates pass | No static React/App/store/business-style imports; Web branch dynamically imports the existing app and explicitly registers PWA; native windows register failure listener, await fresh handshake, then dynamically import render runtime; main awaits the single migration result before importing App/styles; pet imports its own runtime and component after shared Ready | §6.8, §7.1 |
| `index.html` | modified | Provide an inert startup shell | Initial root is a static status message; no app script runs until the native bootstrap navigates to the current entry | §6.8 |
| `vite.config.ts` | modified | Stop automatic service-worker registration injection | Sets `injectRegister:false`; the explicit Web `virtual:pwa-register` path remains | §6.8 |
| `src-tauri/Cargo.toml` | modified | Add the planned WebView2/async primitives | Adds Tokio sync/time and Windows-target `windows 0.61.3` / `webview2-com 0.38.2` dependencies; preserves the existing `windows-sys` dependency | §6.8 |
| `src-tauri/Cargo.lock` | modified | Lock bootstrap dependencies | Records direct dependency graph; Cargo check/test used this lockfile | §6.8 |
| `tests/nativeBootstrap.test.mjs` | added | Test client import and mount ordering without launching a desktop app | Covers both-window handshake wait, main migration pending and safe failure result, pet parallel mount, failed handshake, listener failure, and Web PWA registration | §7.1 |
| `docs/current/desktop-pet-and-quiet-workspace/impl_report_bootstrap_r1.md` | added | Preserve implementation evidence and handoff limits | This report | N/A — required implementation report |

The worktree already contained other uncommitted 0.9.0 feature changes. This implementation did not restore or discard them. Existing 0.9.0 version edits visible in the touched Cargo/Tauri files predate this bootstrap change; the bootstrap-specific edits are the dependencies, main label, and `create:false`.

## Goal and boundary checks

- `goal_lock_check`: Preserved one main business/data owner. The main and pet begin blank; localStorage/SQLite formats, database schema, backup version, app identifier, and user profile path are unchanged. Business commands reject while Pending or Failed. The PWA registration remains on the ordinary Web path. The native mask is limited to service workers, CacheStorage, and disk cache (`0x8110`); it excludes localStorage, IndexedDB, cookies, and SQLite.
- `anti_goal_touch_check`: No second business store, new user cache setting, new profile/identifier, automatic AI request, or pet business ownership was added. No profile cleanup was run in this implementation turn.
- `authoring_ergonomics_notes`: N/A — no user-authored product content or declaration format was introduced.
- `rollback`: 可直接回滚代码文件及 Cargo manifest/lock changes with a dedicated revert. Do not restore any user profile or data as part of rollback. No commit was made.

## Verification records

All commands below were local and repeatable (`impl-safe`). No application, service, browser, profile, or external service was started.

| command | exit | observed output / evidence | owner | conclusion_if_missing |
| --- | ---: | --- | --- | --- |
| `npm test` | 0 | `1..161`; `# tests 161`; `# pass 161`; `# fail 0`; `# cancelled 0`; `# skipped 0`; `# todo 0`. Node emitted the existing experimental `stripTypeScriptTypes` warning. | impl | If absent, Web regressions and the bootstrap client harness are unverified. |
| `node --test tests/nativeBootstrap.test.mjs` | 0 | 6 tests passed: main waits for handshake/migration; migration failure still mounts only after result; pet mounts independently; failed handshake keeps safe shell; listener must register first; Web keeps PWA registration. `# pass 6`, `# fail 0`. Node emitted the experimental `stripTypeScriptTypes` warning. | impl | If absent, client-side import/mount ordering is unverified. |
| `npm run build` | 0 | TypeScript and Vite production build succeeded. Vite emitted `index-Dn2JN8Ck.js` (19.95 kB), separate `react-DRhMetwu.js`, `react-dom-CPgfiSgT.js`, `App-Bty_xayr.js`, `DesktopPet-B5sMAw2x.js` chunks, plus `dist/sw.js` and workbox for Web. Generated HTML references the entry bundle and manifest; no injected SW registration script. Entry bundle's React/App imports are asynchronous `import()` calls; React/App/DesktopPet chunks remain distinct. Vite reported the existing large `three.module-D0TC_2zN.js` chunk (737.15 kB, >500 kB advisory). | impl | If absent, chunk boundaries and Web PWA generation are unverified. Build output is not evidence of native WebView behavior. |
| `cargo check --manifest-path src-tauri/Cargo.toml` | 0 | `Checking qingjian v0.9.0`; `Finished dev profile`. | impl | If absent, native Rust/WebView2 bindings are unverified. |
| `cargo test --manifest-path src-tauri/Cargo.toml` | 0 | 24 tests passed, 0 failed; includes four `native_bootstrap` state/gate tests. Linker emitted one informational warning that it was creating `.dll.lib` and `.dll.exp`. | impl | If absent, Rust state/failure transition tests are unverified. |
| `git diff --check` | 0 | No whitespace errors. Git printed CRLF normalization notices for modified worktree files. | impl | If absent, patch whitespace is unverified. |

### Failed or unavailable checks observed

- First `cargo check --manifest-path src-tauri/Cargo.toml` exited 1. Full compiler diagnostics:

  ```text
  error[E0282]: type annotations needed
    --> src\desktop_pet.rs:92:104
  92 | ... "about:blank".parse().map_err(|e|e.to_string())?
  help: consider giving this closure parameter an explicit type

  error[E0282]: type annotations needed
    --> src\native_bootstrap.rs:150:75
  150 | ... "about:blank".parse().map_err(|e| e.to_string())?
  help: consider giving this closure parameter an explicit type

  error: future cannot be sent between threads safely
    --> src\native_bootstrap.rs:124:1
  cause: std::sync::MutexGuard<'_, RuntimeState> is not Send
  note: the guard-containing status result could live across changed.await in wait_for_result

  error: could not compile `qingjian` (lib) due to 4 previous errors
  ```

  Fixed by parsing with `tauri::Url::parse` and mapping the mutex state into owned values before awaiting. The final Cargo check and test both exited 0.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` exited 1 because the configured stable toolchain does not have rustfmt installed:

  ```text
  error: 'cargo-fmt.exe' is not installed for the toolchain 'stable-x86_64-pc-windows-msvc'.
  help: run `rustup component add rustfmt` to install it
  ```

  Rustfmt was not installed. Formatting check remains unavailable.
- The first `npm run build` and final build both exited 0 with the same >500 kB Three.js advisory described above; it was not changed because chunk optimization is outside this bootstrap task.

## R2.10 alignment

- Startup creates main and pet at `about:blank`; main's configured auto-create is disabled. Cache cleanup on both existing windows is sequential. Navigation starts only if both clear APIs and completion callbacks succeed.
- Native readiness is owned by one Pending/Ready/Failed state. Both window labels must report the current expected origin/path and pet query. The first async command waits without holding the state mutex; timeout, setup/navigation/clear failure, unexpected URL, and startup window close move to Failed. Business commands gate against the same state.
- The Tauri entry has only Tauri API imports. React/render runtime and business chunks are dynamic imports after handshake. The main startup migration is invoked once and its safe outcome is awaited before App/styles import. Pet can mount after shared Ready while migration is pending. `prepareAi()` still runs on explicit user entry and calls the same serialized/idempotent import worker.
- The Web entry retains explicit service-worker registration; Vite no longer injects it into the shared HTML entry.
- The two window navigations are not atomic. If one window has begun executing the minimum bootstrap bundle before the other fails, the implemented promise is to block business imports, commands, and user-data/credential/network side effects. No claim is made that entry bundle bytes were never downloaded or executed.

## Coordinator handoff verifications

| verification | why impl did not run it | suggested owner/action | evidence_expected | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| Isolated WebView old-cache upgrade fixture with valid old service worker, CacheStorage and disk cache | Requires a real WebView2 profile and controlled browser storage; explicitly outside `impl-safe`. | coordinator: build same-source temporary-identifier candidate and run against a dedicated isolated profile. | Read-only before/after cache metadata; callback ordering before both navigations; old-entry sentinel absent; no old controller/response; localStorage draft/preferences and SQLite fixture fields unchanged. | Cache upgrade safety remains unverified; do not claim the old UI/cache issue is resolved. |
| Isolated main-ready/pet-failed navigation harness | Requires real/failure-injected WebViews and native event observations. | coordinator: inject pet navigation failure after main entry and collect counters. | Failed state/event; static main shell; App/DesktopPet/store import sentinels 0; business command, localStorage, SQLite, credential-vault and network counters 0; fixture data unchanged. | Partial-navigation failure safety remains unverified. |
| Native profile API failure/timeout/late completion and real profile preservation | Depends on WebView2 callback/runtime and actual profile. | coordinator: isolated profile only; do not manufacture COM failure in the original user profile. | API synchronous result plus completion result; timeout/late-callback state sequence; original localStorage/SQLite/credential content compared without exposing secrets. | Profile preservation and callback failure behavior remain unverified. |
| Formal `com.zxl.qingjian` 0.9.0 EXE identity, original-profile launch and old UI disappearance | Starts the actual app and touches the original user profile; forbidden for this impl stage. | coordinator: perform §7.1 evidence sequence after isolated fixture passes. | Exact process path, FileVersion and SHA; same-source formal package; current UI after launch; profile/localStorage/SQLite field comparisons; no secret values in logs. | Cannot claim the delivered 0.9.0 app is refreshed or ready for practical delivery. |
| Visual pet and existing workflow regression in the formal EXE | Requires interactive native UI and user-visible confirmation. | coordinator/user: inspect required windows, five models, drag, minimize/focus, and existing note/ledger behavior. | §7.1 native screenshots/observations, exact executable identity, database field preservation, and explicit visual satisfaction record. | Native visual/workflow acceptance remains open. |

`coordinator_handoff_verifications` above are not implementation passes. `verification.md` and `Release.Verification.0.9.0.md` should receive the native evidence only after coordinator-run checks; this impl did not edit them.

## Contract drift reports

- None found between the implemented startup sequence and the current R2.10 Gate-2 contract. Rustfmt availability is an environment limitation, not plan drift.

## Incomplete items, risks, and review focus

- Incomplete: no real WebView2 cache deletion, callback timing, two-window navigation, isolation profile failure fixture, original profile, or official executable was exercised. Current cache bug fix is therefore **not verified as resolved**.
- Risk for independent review: confirm Profile2 interface availability on the supported runtime, callback/UI-thread sequencing, the actual production Tauri origin/path including `useHttpsScheme`, and the app's current capabilities when main is created manually.
- Review the added bootstrap unit tests and native command gate coverage alongside the dynamic import order. Review one-time startup migration and concurrent `prepareAi()` using the shared gate; pure local tests do not exercise the OS credential vault.

## Cross-functional facts

No cross-functional facts identified.
