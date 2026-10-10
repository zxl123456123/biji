# 实施审查记录：native bootstrap r3

**评审对象**：PLAN_DEFECT-R2.10 bootstrap r3、r1/r2/r3 实施报告、当前 bootstrap 源码及测试  
**评审时间**：2026-10-07  
**评审结论**：✅ 通过（impl-safe 源码与测试闭环；原生验收仍待 coordinator）  
**前一轮评审**：[review_notes_impl_bootstrap_r2.md](review_notes_impl_bootstrap_r2.md)

## 输入与审查边界

独立读取 `impl_report_bootstrap_r1.md`、`impl_report_bootstrap_r2.md`、`impl_report_bootstrap_r3.md`、r1/r2 Review(Impl) 报告、当前 `native_bootstrap.rs`/`lib.rs`/`desktop_pet.rs`/`main.tsx`/`desktop.ts`、bootstrap 测试及 `lwplan.md` §6.8。只读审查；没有运行命令、启动应用、访问 profile、SQLite、localStorage 或凭据库。

r3 报告记录：`cargo check`、`cargo test`（29 passed）、`npm test`（161 passed）、`npm run build`、`git diff --check` 均 exit 0；`cargo fmt --check` exit 1，原因是当前 stable toolchain 没有 `cargo-fmt.exe`。首轮 cargo test 曾 exit 0 但有未使用 enum variant 警告，移除后重新 check/test。此处只引用报告中的证据，本轮没有复跑。真实 WebView2/Profile2、双窗运行、OS keyring、旧缓存 fixture、正式 EXE 和原 profile 均未验证。

## r1/r2 P2 关闭情况

| 前轮发现 | 当前证据 | 结论 |
|---|---|---|
| Setup 早退没有进入统一 Failed 状态 | `setup()` 六个失败点均经 `setup_error(app, code, message)`；生产 `setup_error` 调用 `setup_failure(&state, code, message)`，再广播固定 code。更新后的 `every_setup_failure_class_records_failed_and_keeps_gate_closed` 对六类 code 调用同一个生产 `setup_failure`，检查 phase、code、message、首次失败标志和 Ready gate。 | **P2 关闭（纯 helper 范围）**。测试未构造 AppHandle，也未测试 setup_error 的原生事件广播/真实早退；这些是 coordinator 原生验证项，不再是 helper 未共用的问题。 |
| Migration 测试未经过生产导入逻辑 | `lib.rs::run_import_serialized` 实际调用 `native_bootstrap::run_import`，并传入生产 keyring configured check、用户来源配置 reader 和 keyring writer。`run_import` 在 `MigrationGate` 锁内执行 configured check、JSON parse/key extraction、write，并映射固定安全结果。新并发测试八线程调用这个生产共享 helper，以内存 backend 提供配置检查/JSON/写入；验证八次返回 configured、一次成功写入。重试测试验证 vault 写失败后重试成功、随后 configured 状态不再读写。 | **P2 关闭（生产 helper/注入 backend 范围）**。没有验证真实 OS vault，也没有从 Tauri IPC 同时启动两个 command；报告明确保留此限制。 |

### 测试与生产 helper 的精确关系

- Setup 测试不是直接调用整个 Tauri setup 或事件发送，但调用生产 `setup_failure`；生产 `setup_error` 也调用同一 helper。故它能证明共享状态/code/message 映射，不能证明 `AppHandle::emit_to` 和真实 `setup()` 的平台行为。
- 导入并发测试没有直接调用 `lib.rs::run_import_serialized`，但测试与生产 wrapper 调用同一 `native_bootstrap::run_import` helper。生产 wrapper 供应真实配置读取/keyring闭包；测试供应内存闭包。`run_import` 自身包含锁、configured 检查、JSON/key parse、write 调度和 outcome 映射。它证明共享算法在注入 backend 上并发只成功写一次及失败后可重试；不证明 OS keyring 或两个 Tauri command 的实际调度。
- 两个 command（startup migration 与 explicit import）都经 `run_import_serialized` 获取同一个 app `MigrationGate` 并调用该 helper；Ready/label gate 在具体 command 入口静态可见，既有 Rust phase gate 测试仍为 pure phase helper。

## §6.8 合同核对

**显式 import 的 bool API 符合当前方案边界。** §6.8 明确规定 startup migration command 在启动门槛后返回 `{ configured, outcomeCode }`，而 `prepareAi()` 在用户打开 AI panel 时复用同一串行/幂等导入路径。当前 `startup_ai_migration` 保留安全 outcome code；显式 `import_deepseek_config` 维持既有 `Result<bool, String>`/TypeScript boolean 形状并共用锁和导入 helper。方案没有要求显式 AI panel API也暴露启动错误码，因此 r2 报告中的 P2 口径疑虑已由 §6.8 原文收敛，不构成 drift 或实现缺陷。

其他检查：main/pet/business command 在源码入口处检查调用 label 与 Ready；Ready 由两窗 fresh entry report 共同打开，失败为终态。URL 测试调用生产 `base_entry_url`、`compose_entry_url`、`entry_matches`；配置提取 `expected_entry_url`、真实 `WebviewWindow.url()` 和 IPC command wrapper 仍未被纯测试直接覆盖。双窗 Profile2 清理顺序、main/pet导航、静态/动态 chunk 与 PWA边界沿用前轮源码审查；r3 没改该主链。

## 剩余验证和文档状态

### P1 — 原生验收仍待完成（交付状态未通过）

r3 没有运行真实 Profile2 `ClearBrowsingData`、COM completion、WebView2 origin/path、双窗 handshake/失败注入、实际 OS keyring 并发、隔离旧 cache sentinel、正式 0.9.0 EXE 或原 profile。故只能确认源码与 impl-safe helper 测试符合计划，不能确认旧 UI 缓存升级已解决，也不能证明用户草稿/SQLite/凭据在原生启动后保持。按 §7.1 由 coordinator 承接隔离 fixture 与正式包/数据保持验证；在其证据落盘前，实用版 Release 仍未验证。

### P3 — feature 阶段镜像尚未同步

当前 feature `README.md:4-5` 仍描述“原 LW 修订中”；`verification.md:3` 仍称 S1/S2/S3 正在实施。实际已有 R2.10 Gate-2 PASS 和 bootstrap r1-r3 实施/审查记录。该文档状态不改变本轮源码审查结论，但应在后续阶段文档同步中更新，并保留“原生缓存/正式 EXE 尚未验证”的事实。

## Protocol / business 双结论

**Protocol 结论：PASS（impl-safe Review(Impl)）。** r2 两项 P2 已由生产共享 helper 与注入 backend 测试闭合；显式 import bool API 与 §6.8 一致；当前未发现新增源码绕过 Ready gate 或改变缓存清理/凭据迁移顺序的缺陷。P1 真实原生验证由计划明确交 coordinator，作为独立的交付前置条件继续开放，不把本轮实现审查 PASS 当作原生验收 PASS。

**Business 结论：PASS（仅限当前代码审查范围）。** 未发现业务数据、profile 或凭据的新增删除/覆盖路径，也没有发现失败时开放业务 command 的静态绕过。此结论不表示真实原生环境的数据保持和界面效果已验证。

**交付结论限制**：旧 UI 缓存升级、WebView2 Profile2行为、用户数据/凭据保持和正式 EXE身份仍未实测；在 coordinator 完成 §7.1 证据前，不能声称 0.9.0 已修复缓存升级问题或可作实用版交付。
