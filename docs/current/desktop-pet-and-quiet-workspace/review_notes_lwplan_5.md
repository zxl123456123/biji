# 方案评审记录：lwplan（第 5 轮）

**评审对象**：[lwplan.md](lwplan.md) PLAN_DEFECT-R2.9；review_target=lwplan  
**评审时间**：2026-10-07  
**评审结论**：⚠️ 需修订  
**前序评审**：[第 3 轮](review_notes_lwplan_3.md)、[第 4 轮](review_notes_lwplan_4.md)

## 输入与证据边界

本轮重新完整读取 `plan-review/SKILL.md`、`implementation-planning/SKILL.md`、feature `README.md`、`clarifications.md`、`review_notes_lwplan_3.md`、`review_notes_lwplan_4.md`，以及 `lwplan.md` §3、§6.8、§7.1、§9。重新查看 `src/main.tsx`、`src/desktop.ts`、`src-tauri/src/lib.rs`、`src-tauri/src/desktop_pet.rs`、`src-tauri/tauri.conf.json`、`package.json`、`package-lock.json`、`vite.config.ts` 和 `src-tauri/Cargo.lock`。本轮只读；未修改实现/方案，未运行测试、构建或原生验证。

版本证据：`package.json` 声明 `@tauri-apps/api: ^2.10.1`，`package-lock.json` 锁定 `2.11.1`（package-lock.json:2782–2785）；`src-tauri/Cargo.lock` 锁定 Tauri `2.11.5`。R2.9 所称锁版本与 lockfile 相符，package.json 的范围声明不等于实际安装版本，不构成版本冲突。

官方依据：Tauri 官方文档说明 async command 在 async runtime task 执行、JS `invoke` 返回 Promise；事件为异步、无返回值，`listen` 返回 Promise 化的 unlisten handle，因此以 command Promise 承担双窗握手、以事件广播失败是合理分工。[Calling Rust from the Frontend](https://v2.tauri.app/develop/calling-rust/)；锁定版本 `tauri 2.11.5` 的 `spawn_blocking` 接受 `Send + 'static` 闭包并返回 JoinHandle，[Tauri 2.11.5 spawn_blocking](https://docs.rs/tauri/2.11.5/tauri/async_runtime/fn.spawn_blocking.html)；`Emitter::emit_to` 返回 `Result<()>`，[Tauri 2.11.5 Emitter](https://docs.rs/tauri/2.11.5/tauri/trait.Emitter.html)。这些资料支持计划选用的机制，不证明尚未实现的 COM、profile 或双窗运行效果。

## 当前实现对照

方案明示是待实施状态。当前源码没有 R2.9 bootstrap，不将这一预期差异当作本轮实现失败；它意味着本次评审只能判断方案是否足以指导后续实施，不能声称缓存升级问题已解决。

- [src/main.tsx](../../../src/main.tsx:1) 仍先静态导入 React/`createRoot`/window API，再通过 `import('./App')`、PWA virtual module、样式加载和注册 SW；当前没有 `bootstrap_entry_ready`、启动迁移或失败壳。
- [src/desktop.ts](../../../src/desktop.ts:8) 的 `prepareAi()` 确实先调用 `ai_configured`，未配置才调用 `import_deepseek_config`，印证 §3 所记真实触发链。
- [src-tauri/src/lib.rs](../../../src-tauri/src/lib.rs:97) 的 `import_deepseek_config_inner()` 会读旧 OpenCode 配置并可能写 credential vault；`run()` 在 setup 前调用它（约 128–132 行）。`run().setup` 对 `desktop_pet::setup` 错误只打印日志并返回 `Ok(())`（约 134 行）。尚无统一 Ready gate。
- [src-tauri/src/desktop_pet.rs](../../../src-tauri/src/desktop_pet.rs:91) 仍直接用应用入口 URL 建 pet 窗。
- [src-tauri/tauri.conf.json](../../../src-tauri/tauri.conf.json:1) 当前未配置 `create:false`；[vite.config.ts](../../../vite.config.ts:1) 当前未配置 `injectRegister:false`。

以上现状与 R2.9 的待实施目标清楚可区分。实际缓存/数据库/凭据安全结果依 §7.1 留给隔离 profile 与 root 的正式原 profile 验证，不能由文本或本轮读取推断。

## 可行性与前轮缺口复核

R2.9 实质关闭了第 4 轮提出的两个阻断点：

1. **post-Ready 调度已有明确入口。** §3:89 指向真实 `prepareAi()` 链及 `run()` 生命周期限制；§6.8:420 指定双方 `bootstrap_entry_ready` Promise 完成后，由 main bootstrap 在 `import('./App')` 前只调用一次 `startup_ai_migration` 并等待结果。Rust async command 校验 main+Ready 后用 `spawn_blocking` 执行本地文件/keyring 工作，复用串行锁和幂等导入实现；§6.8:463–473 给出片段。官方 Tauri 文档与锁定版本 API 支持该调度形状。它避免了把文件/keyring访问塞进 COM/UI callback，也避免依赖 `.run()` 后不存在的同步续行点。
2. **双窗导航部分成功的承诺已修正为可证边界。** §6.8:418–420 先保持 Pending 导航，再要求两窗各自从当前入口报告 fresh handshake，只有共享状态在双方报告后才转 Ready；失败/超时/关闭进 Failed 并广播安全错误。§6.8:419 明确独立 WebView 导航非原子，允许已启动最小入口 bundle 执行，只保证不导入业务组件、不开放命令、不触发业务副作用。§7.1:549、554 将 main-ready/pet-failed 作为隔离实测路径，§9:599 保留同一边界。R2.8“任一失败下无业务 URL”仅保留在历史段并在 §3:88、§9:597 明示被 R2.9 supersede，没有发现它仍作为当前验收承诺。

Profile 方案仍清晰规定：两窗先以 `about:blank` 创建；main/pet 各自对专用 profile 执行所选清理并等待每次异步完成；固定 mask `0x8110` 只包括 service workers、CacheStorage、disk cache，不包含 LOCAL_STORAGE；不以 origin 粒度清理作承诺，也不换 identifier/profile。普通 Web 继续显式 `virtual:pwa-register`；原生不注册 SW，Vite 禁止自动注入注册脚本。其边界与 §7.1 草稿、偏好及 SQLite 的独立前后比较一致。

## 阻断缺口（三元组）

### 1. 宠物挂载时点在 §6.8 与 §7.1 口径不同

- **具体不一致**：§6.8:420 的目标片段让 main 在双窗握手成功后等待启动迁移，再导入/挂载 App；同一段只要求 pet 握手成功后导入并挂载 `DesktopPet`。其 §6.8:476–500 代码骨架也是两个分支：pet 可在 main 的 `startup_ai_migration` Promise 尚未完成时直接动态导入并挂载。相反，§7.1:554 写成“main…完成一次启动迁移命令……随后两边才挂载业务组件”；§7.1:552 的证据只要求核迁移与 App 动态 import 先后，没有核 pet mount 顺序。§9:599 也只顺读 main migration→App import/mount，未说明 pet 是否等待。
- **对计划的影响**：成功时序契约和真实验收不能同时由当前骨架满足。审查者/实现者无法判断这是预期并行（pet 与凭据迁移无依赖）还是要求两窗业务 mount 都晚于迁移结果。该歧义也影响“双方业务组件挂载前启动迁移”的成功状态证据。
- **所需修订**：在 §6.8/§7.1/§9 选定并统一一个契约。若 pet 可与 main migration 并行，明确 §7.1 只要求 main `App` import 晚于 migration result，并明确 pet mount 的独立 gate；若两边都必须等 migration 返回，则给出 pet 等待同一结果的最小可执行协调方法，并把纯状态测试及隔离证据补上，禁止新增第二个 Ready owner。补充 migration 失败时是否继续挂载两边的同一结论（当前文字看起来是继续）。

### 2. TypeScript 代码骨架没有给出渲染依赖的延后加载

- **具体不一致**：§6.8:410 声明 Tauri 静态依赖仅识别 label、`invoke`/`listen`，React 及业务模块均在 handshake 后动态导入；但 §6.8:476–500 的示例在 Ready 后调用 `createRoot`、`StrictMode`，没有声明其来源，也没有动态导入 `react`/`react-dom/client`。当前 `src/main.tsx` 的这些标识来自静态导入（源码第 1–3 行）。若照当前片段直接实现，补回静态导入会违背最小入口承诺，严格照文字则片段不能独立运行。
- **对计划的影响**：R2.9 的核心安全保证依赖“React/业务依赖仅在 Ready 后进入执行图”。代码锚点没有把该要求闭合到实际依赖图，无法直接据片段实施或审查 bundle chunk 边界。
- **所需修订**：在 §6.8 片段中明确 Ready 后动态加载 React、`createRoot` 与对应业务组件/样式，并给出 main/pet 的最小 import 形态；同步 §7.1 sentinel/构建证据和 §9 reviewer 锚点，证明 React 与业务 chunk 不在 Tauri 初始入口静态依赖链中。无需运行本轮实现验证即可完成此计划澄清。

## Gate-2

### Required Set

**结果：PASS（存在性与可执行输入齐备）**。文件标明 T3；§1 有目标/反目标/不影响项，工作包列出目标、接口、步骤、验收/回滚/依赖；§6.8 有启动状态/接口/错误语义及片段，§7.1 有隔离验证、正式身份、数据保持、责任和证据不足边界。该 PASS 只说明 Gate-2 所需计划内容存在，不代表 bootstrap 已实现或通过验证。

### 目标锁 / 反目标

**结果：PASS**。§1 G1–G3、N1–N3 与 clarifications:24–55 保持一致。此次缓存修复限定在原生入口、profile 缓存和业务 Ready 门禁；不更换 identifier、不删除本地草稿/偏好/业务库、不让 pet 持有第二份业务状态、不改变普通 Web PWA 注册，也不以版本/hash 或隔离 EXE 代替正式原 profile 证据。§7.1 的清理范围、fixture 与正式包分工没有扩张目标。

| 反目标 | 方案锚点 | 结论 |
|---|---|---|
| 清草稿、localStorage、SQLite 或改用户业务数据 | §6.8:412、417；§7.1:548–551 | 未踩中，且规定逐项前后验证 |
| pet 挂载 App/读取业务数据或启动 AI | §6.8:410、420–421；§7.1:549 | 未踩中（待实现与实测） |
| 用隔离 identifier 代替正式安装验证 | §7.1:548、550–552 | 未踩中 |
| 普通 Web PWA 失去注册，或原生绕过 gate 注册 SW | §6.8:410、421、476–484 | 未踩中 |
| 部分导航失败仍运行业务逻辑 | §6.8:419–421；§7.1:549、554 | 目标承诺已收敛，待上述代码片段/挂载时序修订后验证 |

### 关键锚点与片段

**关键实现锚点：PASS。** §6.8 指向 `native_bootstrap.rs`、`lib.rs::run/setup` 和业务命令、`tauri.conf.json`、`desktop_pet.rs::setup`、`main.tsx`、Vite PWA 配置；§3 将真实凭据迁移和 pet setup 错误映射到这些入口；§7.1 分开实现自证与 root 原生证据。

**代码片段充分性：FAIL。** Rust profile 清理、handshake 命令门禁和 `spawn_blocking` 迁移的结构足以理解；TS 片段未闭合 React/render 依赖的动态加载，并且 pet mount 与 main migration 的排序和 §7.1 不一致。需要对上述两项作局部修订，不能仅凭作者意图假定片段会被安全地改写。

### 作者体验

**PASS（修订后需保持）。** 目标为专属、一次性、三态 bootstrap，继续保留现有业务链、Web PWA、桌宠协议和已实施 S1–S4 支撑。没有引入用户侧清缓存设置、profile迁移框架或通用事件总线。后续修订应只补齐 mount 顺序与延后依赖边界，不增加第二套 Ready/migration 状态。

### 人工 review 对齐

| 子项 | 结果 | 证据 |
|---|---|---|
| 核心链路能否顺读 | FAIL | blank→profile 清理→双导航→双 handshake→Ready/Failed可读；但 main migration 与 pet mount 的先后存在上述文档冲突。 |
| research 事实映射 | PASS | §3:85–90 对应旧 SW/cache、真实凭据迁移调用、setup swallowed error、非原子导航及验证锚点。 |
| 是否需跨包脑补 | FAIL | 需自行决定 pet 是否等待迁移、并推断 React/createRoot 如何在不提前加载的情况下到达 TS 渲染代码。 |
| **总括项** | **FAIL** | 两项均可在计划内最小修补，但现状不满足直接实现无需决策的 Gate-2 要求。 |

### P1–P9 协议核验

**协议核验表整体：PASS（不等于 Gate-2 放行）**

| 协议项 | 结果 | 说明 |
|---|---|---|
| P1 | PASS | 未将最低工作包/任务数量作为质量门槛。 |
| P2 | PASS | Required Set 按内容存在性核验，未以评分替代必备项。 |
| P3 | PASS | Gate-1/Gate-2 是缺项不放行的硬门，不使用总分阈值。 |
| P4 | PASS | 文件标记 T3，§9 列 T1/T2/T3 对应 Required Set。 |
| P5 | PASS | 剩余问题是可由作者在授权范围内决定的技术时序，不需要新的用户产品选择。 |
| P6 | PASS | §8 有新风险/阶段切换留痕；§3/§6.8/§7.1/§9 具 R2.9 修订标签与复核入口。 |
| P7 | PASS | 未设置澄清问题数量上下限。 |
| P8 | PASS | §8 有 P0/P1/P2 批量提问模板和本轮无新问题说明。 |
| P9 | PASS | §9 区分 Gate-1 与独立 Gate-2/root 复核，要求失败回 LW；没有递归委派安排。 |

### 基线澄清

**结果：PASS。** `clarifications.md:3–20` 保留用户继续开发授权、独立 Windows 桌宠与既有范围；:24–55 约束目标、数据所有权及验证责任。README:4–5 仍说明当前是启动缓存保障的 PLAN_DEFECT 原地 LW 修订，状态与 R2.9 待 Gate-2 的阶段相符。没有发现需重问用户的产品选择。

### 设计味道扫描

**WARN（不独立阻断）**。单一 bootstrap 状态、固定 profile mask、异步COM清理和本地迁移锁与风险相称。需要确保新增两个 handshake waiter 由同一个状态 owner 解除，不持有状态互斥锁跨 `.await`；计划已有“单一状态 owner/非阻塞”的语义，但应在实现时验证。不建议新增第二个 pet-ready/migration 状态机。该扫描不是本轮 FAIL 原因。

## 双结论

**协议结论：REVISE。Gate-2：FAIL。** R2.9 已解决第 4 轮两个实质缺口：迁移有可执行 post-Ready 调用入口、双窗导航的安全承诺已诚实改为“阻断业务导入和副作用”，而非虚称原子导航。R2.8 的“没有任何业务 URL 加载”仍只作为历史记录，并已显式标成 superseded。

仍需在 lwplan 中统一 main migration 与 pet mount 时序，并补全 TS 片段里 React/`createRoot` 的 Ready 后动态依赖链。这些是低层方案内部的代码片段/验收口径缺口，修复后再做新一轮独立 Gate-2；当前不可依据本报告进入 bootstrap 实施，也不能宣称缓存升级已修复。

**业务结论（Review(LW) 扩展）：未触发。** 未发现 PROBLEM_DEFECT 或与用户目标/完整实现基线冲突。缺口属于方案内部的技术时序与依赖图完整性。

## contract drift / stale docs / mirror mismatch

- `README.md:37` 记录 readiness 章节计数与 core 模板计数漂移；前序报告还记录 plan-review 与 implementation-planning 对澄清问题数量边界的共享口径差异。当前 lwplan 按 implementation-planning 的 P7“不设问题数量上下限”执行，没有把此技能镜像漂移带入新 Gate 项；仍应由 coordinator 收口共享契约。
- §9:582 保留 R2.8 的 Gate-1 自检文字，其中“main/pet/setup创建失败…不加载任何业务URL”只针对创建/setup 在首次入口导航之前失败；§9:597 明确任何失败下无业务 URL 的旧泛化承诺已被 R2.9 supersede。当前段落上下文足以区分历史与新边界，属于可读性风险而非当前结论矛盾；修订时可在 R2.8 自检句旁再加“仅限首导航前失败”的说明。
- §6.8:420 与 §7.1:554 的 pet 挂载时序不同，是本轮发现的有效文档 contract drift，已计入 Gate-2 FAIL，不可视为旧轮历史口径。
- 源码仍是未改前状态；这是计划的实施差异，不构成“方案与实现声称已一致”。任何实现进展都需另行更新实现报告和当前事实，不能以本报告代替。

## 修订要求

1. 原地修订 §3/§6.8/§7.1/§9 并增加新轮 `本轮修订说明` 与 R2.10 标签，保留 R2.8/R2.9 历史与 S1–S4 已实施支撑。
2. 统一 pet mount 是否等待 main 启动迁移结果，更新顺序骨架、测试断言、§7.1 证据及 §9 复核入口。
3. 闭合 Tauri 初始 TS 依赖链：React、`createRoot` 及业务组件/样式必须在对应 Ready 条件后动态加载；同步说明两窗失败时入口 shell 允许执行但不触发业务导入/副作用。
4. R2.10 先由计划作者完成修订，之后重新独立 Gate-2。修订前不启动 bootstrap 实施；本报告不宣称 native/profile/data 已验证。
