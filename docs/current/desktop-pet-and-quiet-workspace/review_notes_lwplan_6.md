# 方案评审记录：lwplan（第 6 轮）

**评审对象**：[lwplan.md](lwplan.md) PLAN_DEFECT-R2.10；review_target=lwplan  
**评审时间**：2026-10-07  
**评审结论**：✅ 通过（Gate-2）  
**前序复核**：[第 5 轮](review_notes_lwplan_5.md)

## 输入与证据边界

重新读取完整 `plan-review/SKILL.md`、`implementation-planning/SKILL.md`、feature `README.md`、`clarifications.md`、`review_notes_lwplan_5.md`，以及最终 `lwplan.md` §3、§6.8、§7.1、§9。另核对本方案引用的真实当前源码：`src/main.tsx`、`src/desktop.ts`、`src-tauri/src/lib.rs`、`src-tauri/src/desktop_pet.rs`、`src-tauri/tauri.conf.json`、`package.json`、`package-lock.json`、`vite.config.ts` 和 `src-tauri/Cargo.lock`。只读审查；没有修改文件、运行测试/构建或执行原生验证。

lock 版本已核实：`package.json` 声明 `@tauri-apps/api: ^2.10.1`，`package-lock.json:2782–2785` 锁定 `2.11.1`；`Cargo.lock` 中 Tauri 为 `2.11.5`。与 §6.8:414 及 R2.10 的 API 依据一致。

官方 Tauri 文档支持方案选择：async command 在 async runtime task 执行，`invoke` 返回 Promise；事件异步且不能返回结果，`listen` 返回 Promise 化的 unlisten handle；`spawn_blocking` 可承载本地同步文件/keyring工作，锁定版本函数约束为 `Send + 'static` 闭包。[Tauri Calling Rust from the Frontend](https://v2.tauri.app/develop/calling-rust/)、[Tauri 2.11.5 spawn_blocking](https://docs.rs/tauri/2.11.5/tauri/async_runtime/fn.spawn_blocking.html)、[Tauri 2.11.5 Emitter](https://docs.rs/tauri/2.11.5/tauri/trait.Emitter.html)。此依据验证 API 机制和方案的调度可行性；不代表项目尚未落地的代码、COM callback、profile 清理或 Windows EXE 已通过。

## 当前源码对照

源码仍处于 R2.10 待实施之前，方案对比清楚，没有把目标状态写成当前事实：

- [src/main.tsx](../../../src/main.tsx:1) 仍静态导入 React、`createRoot` 和 window API；当前入口仍加载 App、样式及 `virtual:pwa-register`，没有 R2.10 门槛。
- [src/desktop.ts](../../../src/desktop.ts:8) 的 `prepareAi()` 实际顺序仍是先 `ai_configured`，未配置时才 `import_deepseek_config`，与 §3:92 对真实调用链的记录一致。
- [src-tauri/src/lib.rs](../../../src-tauri/src/lib.rs:97) 的凭据迁移函数会读旧 OpenCode 配置并可能写 OS credential vault；`run()` 仍在 setup 前调用它，setup 中仍只记录 `desktop_pet::setup` 错误并返回 `Ok(())`（约 128–145 行）。当前无 R2.10 Ready gate。
- [src-tauri/src/desktop_pet.rs](../../../src-tauri/src/desktop_pet.rs:91) 仍以应用 URL 创建 pet 窗；[tauri.conf.json](../../../src-tauri/tauri.conf.json:1) 未设 `create:false`；[vite.config.ts](../../../vite.config.ts:1) 未设 `injectRegister:false`。

这些是 §6.8/§7.1 的待实施差异，不作为 Gate-2 失败；实现是否遵守方案和最终原生效果仍需后续实施审查、测试及 root 的真实环境证据。

## R2.10 对第五轮缺口的复核

**两项前轮缺口均已关闭。**

1. **pet 与 main migration 的挂载顺序统一。** §3:70、94–95、§6.8:428、§7.1:568、581、584、§9:634 同一口径：双窗 handshake 成功后，pet 可在 main migration pending 时动态载入 React/render runtime、DesktopPet/样式并挂载；main 必须等待 `startup_ai_migration` 返回成功或脱敏失败结果，之后才请求 App/样式 chunk 并挂载。§7.1 纯状态测试明确暂停迁移 Promise、观察 pet 已挂载且 App sentinel 为 0，再分别释放成功/脱敏失败结果。§9 的独立复核入口复述此顺序。未发现 §6.8/§7.1/§9 的时序矛盾。
2. **React/渲染依赖已经显式延后。** §6.8:485–508 的 Tauri静态入口仅静态导入 Tauri `invoke`、`listen`、`getCurrentWindow`。双窗 Ready 后才动态导入 `react` 与 `react-dom/client` 并取得 `StrictMode`、`createRoot`；main 在 migration 结果返回后才动态导入 App/样式；pet 在共同 handshake Ready 后动态导入 DesktopPet/样式。§3、§7.1 和 §9:634 以相同依赖边界和次序作交叉约束，补齐了第 5 轮“直接引用未声明 createRoot/StrictMode”问题。

### 静态依赖、动态 chunk 与 sentinel 证据充分性

**PASS（方案层充分，仍待实现取证）。** §3:95 与 §7.1:581、584 明确要求三类互补证据：

- Vite 构建 module graph/chunk 清单用于检查 Tauri 初始静态入口依赖不含 React、`react-dom/client`、App、DesktopPet、store 或业务样式；动态 import 的目标作为独立 chunk 识别。
- 运行时隔离 WebView 记录 chunk 请求和 module import sentinel，证明在到各自门槛前对应业务模块未请求/未执行；双窗 Ready 后暂停 migration 时 pet 可先加载，而 main App sentinel 保持 0；migration 成功或脱敏失败返回后 main 才加载 App/样式。
- 非原子导航的失败 fixture 检查失败侧不加载业务 chunk、不运行组件、不开放业务 command，并以数据库/localStorage/凭据/网络副作用计数与数据前后比对支撑安全结论。

这里的“静态依赖图不含”按静态 import 关系理解，动态 import 引用和独立生成的动态 chunk 由构建清单识别、由运行时网络请求/sentinel 证明门槛前未加载；计划没有把产物中“存在 App 动态 chunk”误写成“构建中不生成 App chunk”。§7.1 将缺少任一依赖图、chunk、sentinel 或顺序证据判为未验证，不预设成功。故它能支撑方案验收所需的“静态入口不含业务 chunk、未过门槛时业务 chunk 未请求/执行”，并留有真实构建/隔离运行证据要求。

### R2.9 非原子导航边界及历史残留

**PASS。** §6.8:427 明言两窗 navigate 非原子，部分失败可以已有最小入口 bundle 加载/执行，只保证业务组件与副作用不启动；§7.1:565、579、581、584 和 §9:632、634 均保留同一承诺。R2.8“任何失败下没有业务 URL”在 §3:91、§9:630 标注为历史响应且范围限定在首个入口导航前创建/setup失败；R2.9历史验收边界也注明挂载时序后来由 R2.10 修改。没有找到仍作为当前要求的旧泛化承诺或与 R2.9 边界矛盾的片段。

## Gate-2

### Required Set

**PASS。** 方案标 T3；目标/反目标、不影响项、工作包输入输出/handler/步骤/验证责任、接口与状态、失败/回滚、作者体验、依赖和缺证据策略均存在。§9 Required Set 表将各项落到具体章节；§6.8 与 §7.1 有对应低层骨架和测试/报告责任。此为方案存在性结论，不是实现成功结论。

### 目标锁 / 反目标

**PASS。** §1 G1–G3、N1–N3 与 `clarifications.md:24–55` 一致；§3/§6.8 的原生缓存启动修复不改变业务目标、数据 owner、SQLite schema、备份版本、identifier、Web PWA 或已实施 S1–S4 支撑。真实原 profile、localStorage、SQLite 及正式制品身份仍由 §7.1 分层验证。

| 反目标 | 方案锚点 | 结论 |
|---|---|---|
| 清除草稿、LOCAL_STORAGE、SQLite 用户数据或更换 identifier/profile | §6.8:420、425–426；§7.1:572–576 | 未踩中：mask、原 profile 和数据前后证据明确 |
| pet 承担 App/store 或成为业务保存者 | §6.8:418、428–429；§7.1:581、584 | 未踩中：pet 只加载 DesktopPet 自身链，挂载后依旧受业务边界约束 |
| 原生业务入口在清理前启动或失败后越过 gate | §6.8:424–429；§7.1:574、579、581 | 未踩中：入口前 profile 清理，双方握手后统一 Ready；部分导航失败限定到无业务导入/副作用 |
| Web PWA 丢失显式注册，或原生继续由入口注册 SW | §6.8:418、429、§6.8 TS 片段 Web 分支 | 未踩中：Web 主动注册保留，原生没有 registerSW 路径，Vite 禁止自动注入 |
| 用隔离包/源码 hash 代替正式身份及原生证据 | §7.1:572–577 | 未踩中：隔离 fixture、正式 identifier/profile 和证据报告分工清晰 |

### 关键锚点

**PASS。** §3 将真实旧 UI/SW cache、Ready 前凭据迁移、setup 错误吞掉、`prepareAi()` 实际调用和部分导航失败分别映射到 `lib.rs`、`desktop_pet.rs`、`main.tsx`、Vite config、`native_bootstrap.rs` 和 §7.1 证据；§6.8 锚点覆盖 blank 双窗、Profile2 清理、调用方校验、状态门禁和业务命令；§7.1 锚定隔离 WebView、构建产物、正式 EXE/用户数据证据。

### 代码片段

**PASS。** §6.8 Rust profile callback、单一 handshake owner、`startup_ai_migration`/`spawn_blocking` 与五类业务门禁相接；TS 骨架覆盖 Web/native 两条入口、失败监听先于 async invoke、Ready 后获取 React/createRoot、main await migration outcome 再导入 App/styles，以及 pet 独立 gate 并行挂载。失败值固定脱敏、迁移失败不伪报成功且继续安全启动；没有要求实现者再决定 main/pet gate 或 async 调度方式。

### 作者体验

**PASS。** R2.10 仅增加此次 bootstrap 所需的独立挂载时序和依赖证据；仍是单一三态 NativeBootstrap owner，main migration 串行复用既有 `prepareAi()` 导入逻辑。没有引入新用户设置、通用迁移 registry/event bus 或第二套业务状态；已实施功能与旧失败证据保留。

### 人工 review 对齐

| 子项 | 结果 | 说明 |
|---|---|---|
| 核心链路顺读 | PASS | §2/§3/§6.8/§7.1/§9 可顺读 profile 完成→双入口 handshake→单一 Ready/Failed→独立 mount gate→失败副作用边界。 |
| 事实映射 | PASS | §3:88–95 对应旧 cache 证据、当前源码入口、凭据副作用及 R2.10 静态依赖/mount 风险。 |
| 片段是否闭合 | PASS | 迁移触发、动态 render runtime、业务 chunk 导入点、pet 并行顺序及失败结果均有目标片段和验收锚点。 |
| 是否需跨包脑补 | PASS | 无需自行推断 migration 与 pet mount 次序、React 加载时间或失败承诺范围。 |
| **总括项** | **PASS** | 第 5 轮两项 contract gap 已逐项反映到事实映射、骨架、验证和 Gate-2 复核入口。 |

### P1–P9 协议核验

**PASS。**

| 项目 | 结果 | 说明 |
|---|---|---|
| P1 | PASS | 不以最低任务数作为质量要求。 |
| P2 | PASS | Required Set 按内容/材料是否存在评估。 |
| P3 | PASS | 门禁为缺项不放行，不用评分总值替代硬条件。 |
| P4 | PASS | 文件显式标 T3，§9 列 T1/T2/T3 Required Set 对应关系。 |
| P5 | PASS | 用户目标及开发授权清楚；当前无需新增产品澄清。 |
| P6 | PASS | 新事实、风险及阶段变化有修订说明/事件触发留痕。 |
| P7 | PASS | 没有问题数量上下限。 |
| P8 | PASS | §8 有 P0/P1/P2 批量澄清模板及本轮未触发原因。 |
| P9 | PASS | §9 要求独立 Gate-2 与 root 复核、失败回 LW；不含递归委派。 |

### 基线澄清

**PASS。** `clarifications.md:3–20` 保留继续开发授权、Windows 独立桌宠及既定范围；`:24–55` 的目标锁、反目标、原数据和验证责任与 R2.10 一致。feature README:4–5 当前阶段仍为 PLAN_DEFECT 原地 LW 修订，符合 Gate-2 完成前状态；没有待确认的产品决策。

### 设计味道扫描

**PASS（保留实现关注点）。** 三态 gate、固定清理 mask、单一失败广播、双 handshake 与局部 migration lock 均是当前启动风险所需的最小机制。两窗等待必须由同一个状态 owner 管理，不在互斥锁持有期间跨 `.await`；迁移锁仅序列化凭据导入，不形成第二个 Ready owner。§6.8 已要求单一 state/非阻塞行为，测试可验证此约束。未发现过度抽象或额外产品平台。

## contract drift / stale docs / mirror mismatch

- 第 5 轮报告所列 §6.8 与 §7.1 pet mount 时序差异，已由 R2.10 在 §3:70/94、§6.8:428、§7.1:568/581/584、§9:634 同步修订并给出验证证据，不再是当前 drift。
- 第 5 轮所列 React/createRoot 未定义问题，已由 §6.8:508 的门槛后动态导入修复；§7.1 构建 module graph/chunk/sentinel 责任和 §9 复核入口同步更新。
- README:37 及前轮报告所记 shared-skill readiness 章节计数、问题数量口径漂移仍存在于共享技能镜像层；本计划依 implementation-planning 的 P7 口径执行。本项由 coordinator 收口，不影响当前 Gate-2。
- R2.8/R2.9 历史文本均标有历史/被 supersede 语义；没有把已过时的“任何失败都不加载入口 URL”作为当前产品合同。
- 源码本身仍未落地本方案，报告明确区分计划与实现，没有 contract drift 的伪完成陈述。

## 双结论

**Gate-2：PASS。** R2.10 已针对第 5 轮两个具体三元组完成最小修订：pet 在共同 Ready 后可与 main migration 并行挂载；main 严格等待启动迁移成功或固定脱敏失败结果后才加载 App/样式；React 和 `react-dom/client` 在握手门槛后动态加载；依赖图、chunk 请求和 sentinel 有分层证据与失败边界。R2.9 非原子导航承诺仍诚实保留，未发现当前版本遗留矛盾。允许进入 bootstrap implementation；本次 Gate-2 不表示实现、测试、profile 数据安全或正式 0.9.0 原生体验已通过。

**协议结论：PASS。** Required Set、目标锁、关键锚点、片段、作者体验、人工 review 对齐、P1–P9、澄清一致性与设计味道扫描均通过。

**业务结论（Review(LW) 扩展）：未触发。** 未发现 PROBLEM_DEFECT 或用户目标/完整实现基线冲突。

## 后续门禁

进入实现后，按 §6.8/§7.1 留下完整命令、构建 module graph/chunks、握手和动态导入顺序、双窗失败 harness、迁移错误码/并发与副作用计数；再由独立 implementation review 与 root 做真实隔离 profile、原 profile 数据保持、正式进程身份及原生窗口验证。缺任何证据继续标未验证，不以本次计划 Gate-2 PASS 替代。
