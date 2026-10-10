# Bootstrap implementation report r3

## Basic information

- `feature_name`: `desktop-pet-and-quiet-workspace`
- `impl_round`: `bootstrap_r3`
- `date`: `2026-10-07`
- `lwplan_version`: `PLAN_DEFECT-R2.10` (Gate-2 PASS)
- Input: `review_notes_impl_bootstrap_r2.md`, two P2 findings on setup-failure test closure and production importer test closure.
- Scope: only Rust startup/importer source and this report. No program was started; no profile, database, localStorage, backup, user data, or real credential vault was accessed. No commit was created.

## Change facts

| path | change_type | change_purpose | key_changes | related_tasks |
| --- | --- | --- | --- | --- |
| `src-tauri/src/native_bootstrap.rs` | modified | Make setup-failure state and importer behavior test the same pure helpers used by production | Added `setup_failure(state, code, message)` returning phase/code/message and transition status; production `setup_error` calls it before broadcasting. Added `run_import(gate, configured, read_source, write_secret)`; it holds the gate while checking configured state, reading/parsing source, and writing the key, and maps errors to fixed safe outcomes. Updated setup-failure cases and concurrent/retry tests to call these production-shared helpers with in-memory state. | §6.8, §7.1, review r2 P2 findings |
| `src-tauri/src/lib.rs` | modified | Route the production credential import through the tested closure-injected helper | `run_import_serialized` now supplies the production keyring configured check, source-file reader, and keyring writer to `native_bootstrap::run_import`. Startup migration and explicit import continue sharing the same `MigrationGate`; explicit import remains a bool API. | §6.8, §7.1 |
| `docs/current/desktop-pet-and-quiet-workspace/impl_report_bootstrap_r3.md` | added | Record R3 changes, evidence, failures, and handoff boundary | This report. R1/R2 reports remain untouched. | N/A — required implementation report |

No JS test was changed. The new importer helper and the setup failure state are Rust code paths; relevant Rust tests invoke those exact pure helpers. Existing JS tests and build were rerun as requested.

## Plan alignment and review findings

- `goal_lock_check`: §6.8 requires the startup migration result to preserve `{ configured, outcomeCode }` with fixed safe outcome codes, and requires the same serialized/idempotent import path to be reused. §7.1/R2.10 requires pure tests of failure and concurrency with `prepareAi()`. Production startup migration and explicit import still share `run_import_serialized` and the app's single `MigrationGate`; `run_import` now performs the configured check inside that gate. The in-memory concurrent test calls that same `run_import` helper and observes one successful write across eight callers. A vault-write failure is not cached: a later call retries and succeeds.
- `anti_goal_touch_check`: No user profile, user data, SQLite database, localStorage, backup, process, or real keyring was touched. Tests use only in-memory mutexes/counters and a synthetic JSON string. No release, cache, UI, or product behavior was changed.
- `authoring_ergonomics_notes`: N/A — no declarative/configuration/manifest/rule sample changes.
- `contract_drift_reports`: No plan/source drift found. The reviewer’s explicit-import result concern is bounded by exact §6.8 wording: the fixed `{ configured, outcomeCode }` contract applies to **startup migration**; `prepareAi()` is required to reuse the same serialized/idempotent import path. The contract does not require the AI panel's explicit import API to expose outcome codes. The existing `import_deepseek_config -> bool` and TypeScript call shape are therefore retained and this boundary is recorded here; no unsupported API/UI change was made.

## Verification results

Commands were run in this R3 turn. All Rust commands ran from `src-tauri`; npm and Git commands ran from the repository root.

| command | exit | observed output | owner | conclusion_if_missing |
| --- | ---: | --- | --- | --- |
| `cargo check` | 0 | `Checking qingjian v0.9.0`; `Finished dev profile` in 1.45s. | impl | Production Rust type-check remains unverified if absent. |
| `cargo test` | 0 | 29 passed, 0 failed; main and doc test targets each had 0 tests and 0 failures. The R3-updated setup and migration tests passed. Linker emitted an informational `.dll.lib`/`.dll.exp` creation warning. | impl | Pure setup/importer helper coverage remains unverified if absent. This is not native runtime evidence. |
| `npm test` | 0 | Node test runner: 161 passed, 0 failed, 0 cancelled, 0 skipped. Node printed an existing experimental `stripTypeScriptTypes` warning. | impl | Existing JS behavior suite remains unverified if absent. |
| `npm run build` | 0 | `tsc -b && vite build`; Vite transformed 2532 modules and built successfully; PWA generated. Vite printed its existing warning that some minified chunks exceed 500 kB. | impl | Web bundle compilation remains unverified if absent. Build output does not prove native cache behavior. |
| `cargo fmt --check` | 1 | `cargo-fmt.exe` is not installed for `stable-x86_64-pc-windows-msvc`; rustup suggested installing the rustfmt component. No component was installed and no alternative formatter was run. | impl | Rust formatting is unverified. |
| `git diff --check` | 0 | No whitespace errors. Git emitted CRLF normalization notices for files already modified in the shared worktree. | impl | Patch whitespace remains unverified if absent. |

### First-run failure and correction

The first `cargo test` run exited 0 with 29 passing tests but warned that `ImportFailure::SourceInvalid` and `ImportFailure::KeyUnavailable` were never constructed. Parsing and key extraction already map those cases directly to fixed safe outcomes inside `run_import`, so the unused enum variants were removed. The subsequent `cargo check` and final `cargo test` both exited 0. The linker informational warning remained; no Rust source warning remained.

### R3 test scope

- Setup: each of the six setup failure classes invokes the same pure `setup_failure` helper used by production `setup_error`; assertions cover Failed phase, fixed code, message, first-transition flag, and closed Ready gate. This remains a pure helper test; it does not construct a Tauri `AppHandle`, execute actual setup branches, or observe native event delivery.
- Import concurrency: eight threads call the exact production `run_import` helper using in-memory configured/read/write closures and a synthetic source document. The helper's lock encloses the configured check through successful write; the test observes eight configured results and one successful write.
- Import retry: the same helper first receives an injected vault-write failure, then a successful retry, then a configured call that skips source read and write. It observes `vault_unavailable`, then `configured`, then `configured`, and two attempted writes (one failed, one successful). No real OS keyring is opened.
- New Rust test count: 0 new test functions; 2 existing Rust test functions were updated to exercise the production-shared helpers. Total suite remains 29. No JS tests were added or modified.
- These tests do not execute `startup_ai_migration` and `prepareAi()` concurrently through Tauri IPC or prove actual OS-vault semantics. They verify that their shared production helper holds the same gate and applies the tested configured/read/write logic.

## Coordinator handoff verifications

| verification | why impl did not run it | suggested owner/action | evidence_expected | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| Concurrent startup migration and explicit AI import against a real credential vault | Requires the app, OS keyring, and Tauri IPC; outside impl-safe and real keyring access was expressly excluded from this R3 task. | coordinator: use an isolated profile and test credential identity; never point at the user's credential store. | Startup and explicit import overlap through production paths; one successful vault write; fixed startup outcome code; no secret in logs. | Real keyring concurrency and migration behavior remain unverified. |
| Actual setup failure branches and native failure broadcasts | Requires Tauri runtime/window creation and native event observation. | coordinator: exercise controlled isolated setup failure paths. | Setup returns error, state reports Failed with the expected fixed code/message path, and existing windows receive the safe error event where available. | Native setup failure propagation remains unverified. |
| WebView2 cache clearing, fresh two-window handshakes, old-cache sentinel, real profile data retention, and formal EXE identity | Requires Windows WebView2, isolated cache/profile fixture, then the specified formal executable/profile sequence. | coordinator: continue the §7.1 isolated and formal EXE validation; preserve all user data. | Cache mask/API result and callback ordering; old entry sentinel absent; both fresh handshakes; exact EXE path/version/hash; localStorage/SQLite/credential field comparisons. | The old-UI cache issue and practical release status remain unverified; no cache-fix claim follows from these impl-safe results. |

## Incomplete items, risks, and rollback

- No native setup failure, real WebView2, profile/cache, executable, Tauri IPC, or actual keyring validation was run. This R3 work does not establish that the desktop cache upgrade issue is fixed.
- The test uses the production generic import helper with injected in-memory closures; it does not prove the OS keyring itself is reliable or that the complete native command scheduling matches the model.
- Rust formatting remains unverified because the installed toolchain lacks `cargo-fmt`; no alternate formatter was run.
- Rollback: directly reversible by reverting only the R3 hunks in `src-tauri/src/native_bootstrap.rs` and `src-tauri/src/lib.rs` and removing this report. No user state needs restoration.

## Handoff summary

Files changed for R3: `src-tauri/src/native_bootstrap.rs`, `src-tauri/src/lib.rs`, and this report. No profile/process/data/keyring access and no commit. The work is ready for independent review and the coordinator’s isolated/native validation, with the limits above retained.

Suggested commit message (English):

```text
test(bootstrap): exercise shared setup and import helpers

- Route setup failures through a testable phase and message helper
- Inject importer backends into the serialized production path
- Verify concurrent idempotence and retry with in-memory state
```
