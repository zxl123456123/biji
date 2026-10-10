# 实施审查记录：native bootstrap r2

**评审对象**：R2.10 bootstrap r2 增量、`impl_report_bootstrap_r2.md` 及相关源码/测试  
**评审时间**：2026-10-07  
**评审结论**：⚠️ 需修订（setup 失败路径已补；测试与实现闭环仍不足）  
**前一轮评审**：[review_notes_impl_bootstrap_r1.md](review_notes_impl_bootstrap_r1.md)

## 输入与证据边界

只读核对 r2 实现报告、`lwplan.md` §6.8/§7.1、`native_bootstrap.rs`、`lib.rs`、`desktop_pet.rs`、`main.tsx`、`desktop.ts`、现有 Rust/JS 测试，以及 r1 评审。没有改文件、运行测试、启动应用或访问 profile、数据库、localStorage、凭据库。命令结果引用 r2 实现报告；根任务随后独立重跑命令的结果不作为本报告的亲自验证。

r2 报告记录 `cargo check` exit 0、`cargo test` 29 passed/0 failed、`git diff --check` exit 0；首次修订运行出现 unused variable 警告后已移除参数并重跑。格式检查仍因 `cargo-fmt.exe` 不可用而未验证。报告明确未运行 WebView2、Profile2、实际双窗、凭据库、旧缓存 fixture 或正式 EXE。本轮不把纯 Rust/JS 测试等同于原生实测。

## r1 缺陷复核

| r1 项 | r2 观察 | 结论 |
|---|---|---|
| P2：setup 提前返回未进 Failed | `native_bootstrap.rs:163-190` 中 main config、blank URL、main 创建、pet setup、pet lookup 和非 Windows拒绝均经 `setup_failure`；它调用 `fail_bootstrap`，再由 `NativeBootstrap::fail` 写 Failed 并通知等待者。 | **实现分支已关闭**。非 Windows 分支也采用统一失败语义。 |
| P2：URL组合无纯测试 | 新测试调用生产 `base_entry_url`、`compose_entry_url`、`entry_matches`，覆盖 dev、HTTP、HTTPS、main/pet URL、未知 label 和 query 不匹配。 | **对应 helper 已覆盖**；未覆盖 `expected_entry_url(app, ...)` 的配置读取，也未通过真实 `WebviewWindow` 测试 command 的完整校验。 |
| P2：迁移并发/幂等无测试 | 新并发测试调用生产 `MigrationGate::run`，用 in-memory flag/counter 模拟已配置检查和凭据写入；`lib.rs:119-127` 的 `run_import_serialized` 与 `import_deepseek_config_inner` 未被该测试调用。 | **锁原语已测，生产导入 helper/prepareAi 竞争未测**；只部分关闭。 |
| P1：WebView2/profile/EXE 未实测 | r2 报告将其继续交给 coordinator，并明确未触碰原 profile/凭据。 | **仍开放，实用版交付阻断**。 |

## 实现符合度与证据锚点

### 1. Setup 失败状态

生产控制流已把六类失败路由到 `setup_failure`，再进入 `fail_bootstrap`/`NativeBootstrap::fail`。就源码分支而言，r1 指出的 Pending 遗留已经修复；启动失败仍会由 Tauri setup 返回 Err，且不会启动后续缓存清理和入口导航。

但新增测试 `every_setup_failure_class_records_failed_and_keeps_gate_closed`（`native_bootstrap.rs:346-353`）只调用 `record_failure(&state, code)`，其实现直接是 `state.fail(code)`（约 `:123`）。它没有调用生产 `setup_failure`，也没有实际触发 `setup()` 的六类早退分支。因此测试证实状态原语的 Failed/command phase gate，而不能证实生产 setup helper 的通知副作用、错误传播或早退控制流。报告对此应描述为纯状态原语覆盖，而不是 setup failure injection。

### 2. URL 与 Ready 命令门禁

URL 单测直接使用生产组合/匹配 helper，覆盖核心纯函数；`bootstrap_entry_ready` 再把预期 URL 与 `window.url()` 比对、检查真实 label，双方报告后才 Ready。仍没有配置对象到 `expected_entry_url` 的测试，也没有真实窗口的 origin/path/query 验收。

`lib.rs:57-76,93-144` 对 main 数据、AI 与启动迁移 commands 检查 main label/Ready；`desktop_pet.rs:111-186` 中 pet business commands 检查 Ready（相关入口也检查 pet label）。静态源码未见绕过 Ready gate 的业务 command。新增 `business_gate_only_opens_after_ready` 和 setup 测试检查的是 `require_phase_ready(Phase)`，没有调用 Tauri command wrappers；command 覆盖仍由源码检查支撑，不是集成测试。

### 3. MigrationGate 与幂等

`NativeBootstrap` 持有一个 `Arc<MigrationGate>`；启动迁移和显式 `import_deepseek_config` 都在 `spawn_blocking` 中调用 `run_import_serialized`，后者使用同一个 `MigrationGate::run`，其闭包执行 `import_deepseek_config_inner`。该导入函数先在锁内检查 `ai_configured_inner()`，之后才读本地来源配置并写 OS vault；因此源码结构实现了同一锁与成功后再检查的幂等路径。

新增八线程测试只测 `MigrationGate::run` 的串行调用，并在测试闭包里自行模拟 configured 标志和 write counter；没有经过 `run_import_serialized`、keyring configured 检查、`import_deepseek_config_inner` 或 `prepareAi()` command 路径。失败重试测试同样只调用 gate。故报告中的“模拟成功只写一次”不能提升为生产 importer 最多一次写入的自动测试证据；应补一个可注入存储/导入闭包的生产 helper 测试，或把实现报告结论限定到锁原语和模拟模型。

### 4. 显式 AI 配置入口的结果映射

`startup_ai_migration` 返回 `SafeMigrationOutcome` 并保留脱敏 `outcomeCode`，前端在失败码下继续挂载并记录固定 code，符合启动迁移合同。显式 `import_deepseek_config` 则在 `lib.rs:100-105` 返回 `run_import_serialized(&gate).configured`，把 `source_missing`、`source_invalid`、`key_unavailable`、`vault_unavailable` 等结果全部压成 `Ok(false)`；`src/desktop.ts:8-12` 的 `prepareAi()` 也只得到 boolean，AI panel 将其视为“尚未配置”。这保持原 bool API，但无法区分导入失败原因。R2.10 §6.8 要求错误码用于 startup migration 并保留 `prepareAi()` 复用锁；若“迁移错误明确暴露”也包括用户触发的 `prepareAi()` 路径，则当前结果映射仍需修正或由计划/实现报告澄清其边界。此项是 **P2 口径/可观察性风险**，不是凭据泄露或数据损坏证据。

## 缺陷、证据缺口与严重度

### P1 — 原生缓存升级和 EXE 身份仍无实测

- **事实**：r2 报告明确没有真实 WebView2 `ClearBrowsingData`、Profile2 callback、两窗实际 URL、失败注入、旧 cache fixture、正式 0.9.0 EXE 和原 profile 证据。
- **影响**：不能证明 Profile2 清理成功、生产 origin/path 握手有效、旧 service worker/cache 被清理、或用户数据/凭据保持；不能声称旧 UI 缓存升级已解决。
- **所需证据/责任**：coordinator 按 §7.1 先运行隔离 profile 和 main-ready/pet-failed 场景，再核正式 EXE 路径/版本/hash、旧 cache 与 SQLite/localStorage/credentials 保持。未完成前交付保持未验证。

### P2 — setup 状态测试未调用生产 setup helper/失败分支

- **事实**：测试直接 `record_failure(&state, code)`，而生产六个早退点调用 `setup_failure(app, code, message)`；测试没有执行后者。
- **影响**：源码显示修复已落地，但报告所称“setup failure classes test”不能证明各实际早退点都传入对应固定 code 并返回 setup Err。相同终态原语覆盖不等于控制流覆盖。
- **建议**：把失败状态/code 的映射抽为生产 helper 并由 setup 与测试共同调用，或增加可注入 setup 操作的测试；实现报告明确现有测试仅覆盖 `NativeBootstrap::fail` 状态迁移。

### P2 — Migration 并发测试未穿过生产导入 helper

- **事实**：并发测试覆盖生产 `MigrationGate::run`，但闭包是测试自造的 configured flag/write counter；未调用 `run_import_serialized`/`import_deepseek_config_inner`，也未并发执行实际 `startup_ai_migration` 与 `prepareAi()` 调用路径。
- **影响**：证明 mutex 会序列化任意闭包，不证明生产导入分支在锁内完成检查、成功后第二调用跳过写入。r2 报告需保留“模拟模型”限制。
- **建议**：给生产导入 helper 注入测试存储/写入计数，在并发下调用同一生产 helper，验证成功最多一次写、失败允许重试；真实 OS vault 仍交 coordinator 隔离验证。

### P2 — 显式 importer 丢弃脱敏错误码（需对齐合同）

- **事实**：`import_deepseek_config` 将 `SafeMigrationOutcome` 降为 bool，显式 AI panel 路径无法区分来源缺失、格式错误与 vault 错误；startup command 保留 code。
- **影响**：如 §6.8“迁移错误明确暴露”覆盖用户触发导入，则该实现只在 startup 路径满足；如果计划仅要求启动迁移保留 code，则这是边界未写明。没有证据显示错误被误报为成功：失败仍为 `configured=false`。
- **建议**：明确合同适用范围；需要区分时让显式命令也返回安全 outcome，或保留 bool 并在计划中说明 AI panel 有意只显示未配置状态。

### P3 — feature 阶段镜像仍旧

feature `README.md:4-5` 仍称“原LW修订中”；`verification.md:3` 仍称 S1/S2/S3 正在实施。已有 R2.10 Gate-2 PASS、bootstrap r1/r2 实施报告与原生验收交接项。该状态不会改变代码行为，但与当前阶段镜像不一致；后续文档同步应标为实现审查/原生验收待完成，避免把方案阶段和实现阶段混淆。

## 测试和平台范围

r2 报告记录的 Rust 数字为 `cargo test` 29 passed/0 failed，URL/setup 状态/migration gate 新测试均为纯逻辑；JS `tests/nativeBootstrap.test.mjs` 6 项通过，覆盖 handshake 后 main migration 返回前不 import App、pet 可并行 mount、失败握手不加载业务 chunk 和普通 Web PWA 注册。后者是对 `main.tsx` 的替换 import harness，不是真实 WebView、Tauri IPC 或 Vite chunk 网络拦截。

真实 WebView2、Profile2、双窗导航、watchdog/callback、实际 command invocation、OS keyring并发、旧 cache、正式 EXE及原 profile均未测。`cargo-fmt` 仍不可用。报告中 first revised run 的 warning 和修复、最终运行结果、linker informational warning、CRLF 提示均予保留。本轮没有重跑任何命令。

## Protocol / business 双结论

**Protocol 结论：REVISE。** r1 的 setup Failed 生产分支修复和 URL helper 测试已落地；但 setup 测试没有经过生产 helper/分支，migration 测试只证明 gate 锁原语而非 production importer 幂等，显式 AI 导入错误码范围也需对齐；此外 P1 原生验收证据尚未完成。`impl_report_bootstrap_r2.md` 应按这些限制准确表述，不把模拟状态测试称作实际 setup/importer 注入测试。

**Business 结论：IMPL_DEFECT。** 发现的是局部实现/验证闭环问题，没有发现新的业务数据丢失、非 Ready 命令副作用或 profile 清理范围扩张。测试可通过注入生产 helper 修正，无需改变功能目标或用户数据策略。显式 AI 导入结果映射是否违反计划取决于 §6.8 适用范围，先作为口径风险列出，不据此单独断言业务故障。

**原生验证边界**：本次实现审查不能替代隔离 WebView2/profile 和正式 EXE 实测。即使命令与纯状态测试通过，旧 UI 缓存升级和数据/凭据保持仍未得到原生证据。
