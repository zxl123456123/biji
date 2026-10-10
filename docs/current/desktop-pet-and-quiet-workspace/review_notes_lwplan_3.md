# 方案评审记录：lwplan（第 3 轮）

**评审对象**：[lwplan.md](lwplan.md) PLAN_DEFECT-R2.7 增补版；review_target=lwplan
**评审时间**：2026-10-07
**评审结论**：⚠️ 需修订
**前一轮评审**：[第 2 轮](review_notes_lwplan_2.md)

## 输入与证据边界

按本轮要求读取 plan-review、implementation-planning 技能，feature 的 README.md、clarifications.md、本 lwplan.md，以及 src/main.tsx、src-tauri/src/lib.rs、src-tauri/src/desktop_pet.rs、src-tauri/tauri.conf.json、package.json、vite.config.ts。另核对第 2 轮 Gate-2 报告。以上均按当前工作区读取；未改实现、未运行构建/测试，也未做原生缓存验证。

官方 Tauri 配置文档确认 create:false 会阻止启动时自动创建窗口，之后可由 WebviewWindowBuilder::from_config 手动创建；窗口省略 label 时默认 main。[Tauri 配置文档](https://v2.tauri.app/reference/config/) Vite PWA 文档确认 injectRegister 控制自动注入注册脚本，virtual module 可承担显式注册。[Vite PWA 注册文档](https://vite-pwa-org.netlify.app/guide/register-service-worker)

## 可行性分析

§6.8 的核心路径可实现：主窗禁用自动创建，在 setup 中建立 main/pet 两个 about:blank 窗口并隐藏 pet；两窗都存在后，通过 WebView2 Profile2 异步清理所选缓存类型；所有清理成功且启动仍有效时才导航到同源应用入口。同步失败、异步失败、超时、关闭竞态和导航失败都转为终态 Failed，安全页不加载旧业务脚本。该路径能针对“EXE 路径及版本正确但实际显示旧 UI”的已观察现象。

清理范围和普通 Web PWA 的边界写得具体：固定 SERVICE_WORKERS | CACHE_STORAGE | DISK_CACHE（0x8110），不清 LOCAL_STORAGE，并承认 API 按 profile 清理而非按 origin 过滤；两窗各自清理并等待完成，除非实现证据证明共享同一 profile。Web 继续通过 virtual:pwa-register 注册，Tauri 入口不注册，构建产物禁止自动注入额外注册脚本。§7.1 将隔离 fixture、正式 identifier、原用户 profile、localStorage 与 SQLite 证据分开，能防止用隔离包或构建 hash 冒充正式升级验证。

### 当前实现对照

现有实现尚未含本轮 bootstrap，这是计划要实施的差异，不是本轮实施验收：

- [src/main.tsx](../../../src/main.tsx) 第 11–14 行在所有非 pet 分支加载 App 并调用 registerSW，目前原生 main 也会注册 service worker。
- [vite.config.ts](../../../vite.config.ts) 第 7–19 行未设置 injectRegister；[tauri.conf.json](../../../src-tauri/tauri.conf.json) 窗口配置未设 create:false，默认会自动创建，且没有显式 label（默认 main）。
- [desktop_pet.rs](../../../src-tauri/src/desktop_pet.rs) 第 92 行仍用 WebviewUrl::App("index.html?pet=1") 创建 pet 窗。
- [lib.rs](../../../src-tauri/src/lib.rs) 第 128–135 行在 setup 前先调用凭据迁移，并在 setup 中吞掉 desktop_pet::setup 错误后继续启动。现有业务 commands 只检查 actual window label；尚无 NativeBootstrap Ready 门禁。

这些代码差异正是 §6.8 应修改的锚点；不能把当前源码当作新方案已实现。Tauri 文档支持 create:false / 从配置建窗的设计，Vite PWA 文档也支持阻断注入、保留显式 virtual module 的设计。原生 WebView2 顺序/COM callback 仍须按计划中的编译、状态测试和真实 profile 证据验证。

## 风险点

1. **阻断：Ready 门禁未覆盖 setup 前的凭据迁移。** 当前 lib.rs::run() 在创建 Tauri builder、进入 setup 之前执行 import_deepseek_config_inner()（约第 130 行）；该函数可读取旧 OpenCode 配置并写 OS credential vault（约第 97–105 行）。§6.8 第 5 步把五个 command 的凭据副作用纳入 Ready gate，却在同段允许“内部 run 凭据迁移”保持现状。结果是启动缓存清理失败时仍可能先发生凭据读取/写入，与同一方案“Ready 前任何 DB/凭据/网络副作用不发生”的门禁语义不一致。**修订**：将该一次性迁移移至 Ready 后执行，并明确调用时序/失败语义；若确需保留前置例外，应给出精确副作用、其不影响升级安全的依据和单独验收，不能一边写“任何凭据副作用”一边豁免。
2. **阻断/需明确：pet setup 失败目前会被吞掉。** run().setup 对 desktop_pet::setup 错误只 eprintln! 后返回 Ok(())。§6.8 指定窗口创建失败要转 Failed、安全不加载业务页，但没有明确本轮必须移除该“记录后继续”的旧错误处理并测试。若实现沿用当前调用方式，pet 窗/原生 helper 建立失败可能绕过计划的双窗清理启动契约。**修订**：明确 setup 失败应使 bootstrap 进入 Failed 并阻止任一业务 URL 导航；加入此失败路径的纯状态/入口测试。
3. **测试责任已分层，但应将以上两条加入闭环。** 现有 impl-safe 列出同步/异步错误、timeout/close 迟到回调、业务命令 Ready 拒绝、mask/构建注册脚本断言；coordinator 承接隔离旧 profile、草稿/偏好/SQLite 保持及正式 EXE 身份。缺少对 run 凭据迁移顺序和 pet setup 错误传播的明示断言。

这些是计划遗漏的失败闭环，并不改变完整实现基线中的用户目标；未发现需要新的用户产品决策。

## 遗漏或需补充

- §6.8 的目标片段展示了 main command gate，但 run 前一次性 credential import 与 setup 错误吞掉没有进入片段/责任矩阵；应在修订后覆盖“无副作用地停留安全页”。
- 将 Ready gate 的准确覆盖列成清单：业务 commands、桌宠 owner/publish 入口、run 启动副作用；并说明命令拒绝发生在读库/凭据/发网络前。
- 缓存验证范围已有清晰的隔离/正式身份划分。实际 Profile2 API 的按 profile 范围和未取证 controller 边界已诚实记录；不要求对真实用户 profile 注入 COM 故障。

## Gate-2

**Required Set 复核结果**：PASS。计划为 T3；§1 与工作包中有目标/反目标/不影响项，S1–S4 有输入输出、处理边界、步骤、验收、回滚、依赖、测试分层；§9 的 Gate-1 Required Set 自检有具体落点。

**目标锁 / 反目标复核结果**：PASS。G1–G3、N1–N3 在 §1、§2 和相关包中被映射；缓存修复未扩成清业务存储、换 identifier、托盘/自启、另一套业务存储或正文宠物。§7.1 明确旧新增记录均保留，失败时不自动恢复/删除用户数据。

| 反目标禁止项 | 验证方式（lwplan 锚点） | 结论 |
|---|---|---|
| 清除 localStorage/草稿或 SQLite 用户业务数据 | §6.8 mask 排除 LOCAL_STORAGE；§7.1 对 localStorage 与 SQLite 独立 before/after 比较 | 未踩中 |
| 更换正式 identifier / 用隔离 profile 代替正式升级 | §6.8 保留 profile/identifier；§7.1 明确隔离 EXE 不作正式身份凭证 | 未踩中 |
| 让旧入口先运行或失败后退回旧 App | §6.8 blank 双窗、清理全成功后导航；Failed 留安全页 | 未踩中 |
| 让普通 Web PWA 失去注册或原生 main 继续注册 | §6.8 区分 Web 主动注册与 native 不注册，Vite 禁止自动注入 | 未踩中 |
| 以版本/hash/Web 截图替代 EXE 与旧数据验收 | §7.1 正式进程路径、身份、旧 profile 和字段证据 | 未踩中 |

### Gate-2 关键复核

| 项目 | 结果 | 说明 |
|---|---|---|
| 关键实现锚点复核 | PASS | §6.8 定位 native_bootstrap.rs、lib.rs::run.setup 与五命令、config、desktop_pet.rs::setup、main.tsx、vite.config.ts；§7.1 定位 profile、制品、数据库与证据落点。当前代码位置可直接核验。 |
| 代码片段充分性复核 | PASS | §6.8 的目标骨架表达 blank 窗、异步 callback、终态失败和 Ready command gate；配置/API/URL/mask 语义有配套步骤说明。此次缺口在凭据迁移与 setup 失败路径，不是主链顺序无法读懂。 |
| 作者体验门复核 | PASS | 启动保障是本次故障的专属小模块，状态仅 Pending/Ready/Failed，保留现有 PWA、桌宠与业务结构；不引入版本迁移平台或新用户设置。 |
| 人工 review 对齐复核（总括项） | FAIL | 核心链路顺读 PASS，research 事实映射 PASS，但跨包脑补需求 FAIL：§6.8 门禁需要 reviewer 自行把 run() 前置凭据迁移及 swallowed pet setup failure 补入启动副作用闭环。 |
| 核心链路顺读复核 | PASS | §2 入口→清理→App/pet→验证主链可顺读；§6.8 顺序与 §7.1 真实旧缓存验证相接。 |
| research 事实映射复核 | PASS | §3 的旧 SW/bundle、旧 UI、profile scope、数据边界事实，分别映到 bootstrap/config/PWA 入口和隔离/正式验证。 |
| 跨包脑补需求复核 | FAIL | 必须将已存在的 import_deepseek_config_inner() 与 desktop_pet::setup 失败传播纳入 §6.8 的变更/验收，否则方案门禁覆盖面和当前启动链不一致。 |

**P1-P9 协议合规核验表**：PASS

| 协议项 | 结果 | 说明 |
|---|---|---|
| P1 | PASS | §1–§9 未设置最低任务数作为质量门槛。 |
| P2 | PASS | §9 Required Set 按必备内容存在性自检；放行不是评分制。 |
| P3 | PASS | Gate-1/Gate-2 使用缺项不放行与失败回环，没有阈值打分。 |
| P4 | PASS | 文件开头标 T3，§9 明确 T1/T2/T3 Required Set。 |
| P5 | PASS | §8 说明范围、验收或回滚口径不唯一时委托提问；当前修订不产生新的产品选择。 |
| P6 | PASS | §8 记录新假设、新风险、阶段切换的留痕位置和本轮对齐。 |
| P7 | PASS | 不设澄清问题数量上下限。 |
| P8 | PASS | §8 有 P0/P1/P2 批量优先级与一次回复模板，未触发及原因有说明。 |
| P9 | PASS | §9 明确 Gate-1、独立 Gate-2+root 复核、失败回 LW 修订；未安排递归派发 subagent/task。 |

**基线与澄清一致性复核结果**：PASS。clarifications 中未回答项为空；用户授权继续开发和独立桌面目标未变。启动缓存保障未扩展产品目标，也没有冲突的头脑风暴决策；上述缺口是实施计划的技术完整性问题。

**设计味道扫描结果**：WARN（不阻断独立于本次 Gate 缺口）。三状态、固定清理 mask、原生一次性 bootstrap 与当前问题相称；方案没有泛化成迁移 registry 或通用事件总线。WARN 依据是启动层新增 COM callback/watchdog 需要保持单一状态所有者和终态转换，不要形成两套 Ready 标志。

### Gate-2 结论

- 架构顺序、profile 清理范围、localStorage/PWA 边界及 §7.1 正式验证分工方向正确。
- 但“Ready 前所有副作用不发生”尚未闭环：凭据迁移在 run/setup 前执行，且 pet setup 错误当前会吞掉继续。两项都需要从当前真实实现映射到新 bootstrap 的变更与测试。
- Required Set、目标锁、关键锚点、代码片段、作者体验、P1-P9、澄清一致性各项已有；人工 review 总括项因跨包脑补为 FAIL。

**Gate-2**：FAIL

**协议结论**：REVISE
**业务结论（Review(LW) 扩展）**：未触发（未发现 PROBLEM_DEFECT；完整实现基线与功能方向没有需求映射失败或核心假设矛盾）。

## 修订建议

1. 在 §6.8 的实际启动顺序和代码骨架内，把 import_deepseek_config_inner() 移至 Ready 后，或明确且有证据地将它列为不触及本次启动安全边界的前置例外；并写出失败语义。
2. 将 desktop_pet::setup 与 main/bootstrap 创建失败传播纳入 Failed 状态，不允许沿用当前 log-only + Ok(())，补充状态和 impl-safe 验证。
3. 更新 §3 cache research 映射、§6.8 snippet/测试、§7.1 证据清单与 §9 Gate-2 复核入口，使上述两条均可追溯；标注本轮修订标签与“本轮修订说明”。Root 在下一轮重新核 Gate-2 前仍不可进入 bootstrap implementation。

## contract drift / stale / mirror mismatch

- feature README 第 37 行持续记录 readiness 必备章节计数与 core 模板计数不一致。它不是本轮 bootstrap 行为的依据，本报告按 implementation-planning 的 canonical T3/存在性门禁及 plan-review 的显式 Gate-2 字段核对；此共享技能口径漂移仍需 coordinator 单独决定是否收口。
- 第 2 轮报告 review_notes_lwplan_2.md 的 Gate-2 PASS 是上一方案版本的结论。本轮 R2.7 新增启动保障必须重新过门；不把旧 PASS 当当前方案可实施授权。

## 后续行动

LWPlan 作者按上列三项原地修订 §3、§6.8、§7.1、§9 并保留已实施支撑与旧失败记录，修订后重新独立 Review(LW)。此报告不放行 bootstrap 实施，也不替代后续真实 profile/正式 EXE 验收。

