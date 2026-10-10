# 方案评审记录：lwplan（第 4 轮）

**评审对象**：[lwplan.md](lwplan.md) PLAN_DEFECT-R2.8；review_target=lwplan
**评审时间**：2026-10-07
**评审结论**：⚠️ 需修订
**前一轮评审**：[第 3 轮](review_notes_lwplan_3.md)

## 输入与证据边界

重新读取完整的 plan-review 与 implementation-planning 技能，以及 feature README、clarifications、review_notes_lwplan_3.md、lwplan §3/§6.8/§7.1/§9 和相关当前源码。方案与源码按当前工作区只读核对；未改文件，未运行实现测试、构建或原生验证。方案描述的是待实施状态，不以源码仍旧为由判定实施不一致；但用真实调用链检查方案能否落地。

关键源码锚点：
- lib.rs:128–145：run() 在 Builder/setup 前执行 credential import；setup 中现有 desktop_pet::setup 错误被 log 后返回 Ok。
- lib.rs:97–105：迁移读取 USERPROFILE 下旧 OpenCode 配置，并可能写 OS credential vault。
- desktop_pet.rs:91–96：pet setup 创建原生窗口并安装 native helper。
- src/main.tsx:5–14：当前 main 分支先加载 App 和 virtual:pwa-register 并注册；目前没有本轮 bootstrap。
- tauri.conf.json：main 窗口当前省略 create/label，PWA Vite 配置当前省略 injectRegister。
- src/desktop.ts:8–11：App 的 prepareAi() 先查询 ai_configured，之后仍会调用现有 import_deepseek_config command。

## 可行性分析

R2.8 已明确修订前轮两个发现的计划落点：

1. §3:84–85 将启动前 credential import 和 swallowed pet setup error 映射到实现与验证。
2. §6.8:396–400 明确 main/pet 创建、pet setup/helper 安装失败进入 Failed；缓存成功、双窗建立之后才开导航；Ready 命令门禁和凭据迁移后置都有文字定义。
3. §6.8:429–435 给出迁移 Result 错误处理骨架，声明失败不撤销 Ready、不标记成功、不覆盖旧配置或凭据。
4. §6.8:451、§7.1:480、489、§9:517、530 为失败注入、命令拒绝、无导航及证据责任补了测试与报告要求。
5. §6.8:388–399 的 profile mask、profile 粒度、双窗清理顺序、超时和迟到 callback 处理仍然明确；Web PWA 继续显式注册，native 不注册，Vite 不自动注入。

因此，R2.8 对之前的两个事实缺口已做实质性计划修补，且没有改变目标锁或触碰已实施的 S1–S4 支撑。现在仍有启动链本身的时序歧义：COM 清理在 setup 中异步完成，而示例把迁移写成 run() 中“Ready 之后”的顺序代码；Tauri 的 .run() 启动事件循环并阻塞至应用退出，setup 返回后没有这样的同步续执行点。若实现者自行决定从 COM callback 同步调用，可能阻塞 UI/COM 线程；若改在主窗 App 内调用，则需说明如何保留“启动迁移”语义、如何避免它与既有 prepareAi() 重复/并发迁移。文档目前没有选定其中任一可实施触发点。

## 风险点

1. **阻断：凭据迁移的 post-Ready 触发点与 run() 控制流不相容。** §6.8:429–435 的伪代码看似直接放在 run() 里，但异步清理由 setup callback 完成；随后 Builder::run() 进入事件循环，不能在“Ready 后”回到该代码。若实现者自行决定从 COM callback 同步调用，可能阻塞 UI/COM 线程；若改在主窗 App 内调用，则需说明如何保留“启动迁移”语义、如何避免它与既有 prepareAi() 重复/并发迁移。**三元组**：
   - 具体不一致：方案要求异步 Ready 后再调用迁移，却只给出 run() 同步顺序片段，未给出从 async completion 到迁移函数的可执行调度边界。
   - 对 lwplan 的影响：实现者必须自行决定状态/线程/触发入口，且有与 AI 首次调用竞态的可能，违反“无需再做架构决策”的低层计划要求。
   - 建议恢复：指定一个确定的 post-Ready 调用路径及线程（例如通过受控 runtime worker 或现有 main command 入口），规定迁移最多触发一次、与 prepareAi() 串行/幂等；给出对应片段和测试口径。不要在 COM/UI callback 中同步读文件或调用 keyring。

2. **阻断：双窗导航失败时“任何业务 URL 均不得加载”无法由当前顺序保证。** §6.8:398 在两次清理成功后先切 Ready，再导航两个窗口；§6.8:399 又承诺任一导航错误进入 Failed、“两窗不导航应用”。若第一个窗口 navigate 成功而第二个窗口 navigate 失败，第一个页面可能已开始执行；Ready 已短暂开放，页面的业务命令可能先于 Failed 通过。两个独立 WebView 的导航不是原子操作。R2.8 新增状态测试列创建/setup失败、迟到 callback 和凭据顺序，没有明确覆盖“第一窗导航成功、第二窗导航失败”的部分成功场景。
   - 具体不一致：§6.8:398–399 的先 Ready/导航顺序与“任何失败下两业务 URL 均不加载、命令拒绝”验收无法同时保证。
   - 对 lwplan 的影响：失败路径可能在切到 Failed 前运行 App 代码/业务命令，违背本轮安全启动目标与 R2.8 的 §9 入口。
   - 建议恢复：明确定义导航阶段状态和命令许可点，并把双窗部分导航失败纳入失败注入。若无法保证两窗 URL 的原子提交，应调整承诺为可证明的安全边界（例如失败时命令始终 fail-closed、不给业务数据/凭据/网络副作用），同步调整目标骨架、验收和 §7.1 报告；不能保留不可兑现的“任何业务 URL 均不得加载”表述。任何调整需维持旧缓存脚本不能在清理前执行的核心目标。

3. **错误展示边界尚不够具体（非单独阻断项）**：迁移失败现在明确不回滚 Ready、不标成功、不删除/覆盖旧内容，语义与 lib.rs:97–105 的现有函数一致；但 record_credential_migration_error 的记录位置、可观测性和如何避免记录敏感 API key 尚未定义。计划需给实现者一个最小、非敏感错误记录位置（或明确返回给现有 UI），否则“错误暴露”无法独立验收。

没有发现需要新增用户产品决策；上述问题均可在已授权范围内由方案作者作技术收敛。

## 遗漏或需补充

- 用可实现的异步调度替代“run() Ready 后直落代码”的片段；纳入现有 prepareAi() 与 import command 的一次性/串行策略。
- Ready 不能在任一窗口的业务 URL 导航之前无条件打开。明确清理完成、双窗创建成功、两次导航提交、业务命令可用之间的状态顺序，并说明第二个导航失败时第一窗的行为及命令结果。
- 扩充 R2.8 impl-safe 状态测试：迁移触发线程/次数、迁移失败无成功标记且原凭据不变；main 与 pet 导航部分成功后另一侧失败，断言终态、命令拒绝和无数据/凭据/网络副作用。coordinator 仍只承接真实 profile/UI/存储证据。
- 将迁移错误记录位置与脱敏规则写入 §6.8、§7.1 和实现报告证据清单。

## Gate-2

**Required Set 复核结果**：PASS。T3 分类保持；目标、输入输出、关键接口、执行顺序、回滚、验证责任和缺证据边界存在。R2.8 为新风险提供专门事实映射、执行步骤、目标骨架与验证矩阵。

**目标锁 / 反目标复核结果**：PASS。缓存修复仍服务 G3、N2/N3：不换 identifier、不清 localStorage/SQLite、不让 pet 成为业务保存者；五角色和桌面独立活动的其他目标仍保留。

| 反目标禁止项 | 验证方式（lwplan 锚点） | 结论 |
|---|---|---|
| 清理或迁移时删除用户笔记、草稿、localStorage 或 SQLite 业务值 | §6.8:392 mask排除 LOCAL_STORAGE；§7.1:485–489 独立比对偏好与数据库字段 | 未踩中 |
| 以隔离 identifier 替代正式升级 | §7.1:485、487–488 分离隔离 fixture 与正式 identifier/profile | 未踩中 |
| 旧缓存未清理就加载旧业务入口 | §6.8:396–400 要求 blank、profile清理成功后再导航 | 未踩中（正常成功路径） |
| PWA 自动注入让原生入口绕开 gate | §6.8:390、400、438–445 明确 native 不注册、Vite禁注入、Web显式注册 | 未踩中 |
| 用构建 hash/版本或 Web 截图代替原生证据 | §7.1:484–489 要求进程身份、原profile、UI与字段证据 | 未踩中 |

### Gate-2 关键复核

| 项目 | 结果 | 说明 |
|---|---|---|
| 关键实现锚点复核 | PASS | §6.8 指向 native_bootstrap.rs、lib.rs::run.setup/业务命令、tauri.conf.json、desktop_pet.rs::setup、main.tsx、vite.config.ts；§7.1 指向 profile、原生 EXE 与数据证据。 |
| 代码片段充分性复核 | FAIL | R2.8 新增迁移片段没有可执行的异步触发点；旧入口状态片段还在两个独立 navigate 调用前切 Ready，没有覆盖第二个导航失败的部分成功闭环。 |
| 作者体验门复核 | PASS | bootstrap 保持功能专属、有限状态；没有加版本迁移 registry、通用 event bus 或用户侧开关。后续需把异步调度收敛到单一 owner，勿再加第二份 ready/migration 状态。 |
| 人工 review 对齐复核（总括项） | FAIL | 核心链路顺读 PASS，research 事实映射 PASS，跨包脑补需求 FAIL；失败在 async completion 如何触发迁移以及两个 URL 导航非原子时的安全结果。 |
| 核心链路顺读复核 | PASS | §2/§3/§6.8/§7.1 可顺读旧 UI 事实→blank/清理→导航→隔离与正式证据；但顺读不消除上述部分失败语义。 |
| research 事实映射复核 | PASS | §3:84–85 将凭据导入和 swallowed setup failure 映到实现锚点与测试/现场验证；主链映射完整。 |
| 跨包脑补需求复核 | FAIL | reviewer 仍需选择如何从异步 callback 把迁移调用调度到 Ready 后，并推演第一窗已导航、第二窗失败时的 ready/命令竞态。 |

**P1-P9 协议合规核验表**：PASS

| 协议项 | 结果 | 说明 |
|---|---|---|
| P1 | PASS | 无最低工作包数质量门槛。 |
| P2 | PASS | Required Set 与 Gate-1 以必备内容存在性判定。 |
| P3 | PASS | Gate 使用缺项不放行，没有评分阈值。 |
| P4 | PASS | T3 分类及 T1/T2/T3 Required Set 均保留。 |
| P5 | PASS | 现有范围/用户决策明确；剩余问题是技术时序，方案可自行收敛，无需新用户问题。 |
| P6 | PASS | §8 对新假设、新风险和阶段切换有事件触发留痕位置；R2.8 在§3/§6.8/§7.1/§9 留有本轮修订说明。 |
| P7 | PASS | 不设澄清数量上下限。 |
| P8 | PASS | §8 给出 P0/P1/P2 批量提问模板并说明本轮未触发原因。 |
| P9 | PASS | §9 区分 Gate-1、独立 Gate-2/root复核和失败回 LW；无计划递归派发下级 agent/task。 |

**基线与澄清一致性复核结果**：PASS。clarifications 未回答项为空；R2.8 未改变用户目标、桌面位置、数据保持要求或已授权的继续开发范围。技术缺口不构成用户需求冲突。

**设计味道扫描结果**：WARN（不独立阻断）。一次性 bootstrap 与固定三态符合问题范围；当前设计风险是 Ready 语义同时表示“profile清理完成”和“可执行业务命令”，但双窗 navigate 尚未形成可证明的原子阶段。修订应由同一个 bootstrap owner 管理状态，不引入独立 migration 状态机。

### Gate-2 结论

- R2.8 已把前轮“启动前凭据迁移”改到 Ready 后并补了不覆盖原内容的失败语义；也明确 setup/窗口创建失败到 Failed、无业务导航、命令拒绝与测试证据。两项在文本层面的补充齐备。
- 仍不能放行：run() 在 setup 后启动阻塞事件循环，现有迁移片段没有 async Ready 后的可执行触发点；并且在两个 WebView 顺序导航时，第一窗成功、第二窗失败会破坏“失败下两业务 URL 都不加载”的保证。测试闭环没有覆盖这个部分失败路径。
- 缺口属于方案执行时序与验收范围，需要修订目标骨架、状态顺序及测试，不是要求真实 profile 实测后再判断。

**Gate-2**：FAIL

**协议结论**：REVISE
**业务结论（Review(LW) 扩展）**：未触发（未发现 PROBLEM_DEFECT；功能方向和完整实现基线映射保持一致）。

## 修订建议

1. 将凭据迁移挂到一个明确、非阻塞的 post-Ready 执行点；说明它与 App 的 prepareAi()/import command 如何一次性串行，并明确无敏感内容的错误记录落点。
2. 收敛 bootstrap 状态：profile 清理完成、窗口创建成功、navigation 调用结果、业务命令可用应有单一明确时序。加入第二窗导航失败时第一窗已接受导航的行为和 command gate 断言；若不能保证零业务 URL，则按可验证的安全副作用边界改写验收。
3. 更新 §3、§6.8、§7.1、§9 并加 R2.9 标签与本轮修订说明。保留已实施 S1–S4支撑、旧UI失败与之前 review 记录。修订后重新独立 Review(LW)，Gate-2 PASS 前不进入 bootstrap implementation。

## contract drift / stale / mirror mismatch

- feature README:37 已记录 readiness 必备章节计数与 core 模板计数漂移；前轮 reviewer 还记录 plan-review 中“2–3个问题、超过3个建议拆轮”与 implementation-planning P7“不设问答上下限”的共享技能口径不一致。本轮 lwplan 按 canonical 不设数量阈值，故该共享契约漂移未造成新 Gate 项，但仍应由 coordinator 收口。
- review_notes_lwplan_3.md 的 REVISE 对应 R2.7；R2.8 当前已经落实其中两项要求，不能把该旧轮结论当当前唯一阻断依据；本轮阻断来自新增的执行时序分析。

## 后续行动

lwplan 作者按上述三项做最小原地修订；修订后再次 Gate-2。当前未放行实施，也未执行真实 profile/EXE 验证。

