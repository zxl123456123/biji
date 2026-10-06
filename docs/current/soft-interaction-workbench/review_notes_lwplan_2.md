# 方案评审记录：lwplan（第 2 轮）

**评审对象**：[lwplan.md](lwplan.md)，R1.1–R1.3原地修订版，T3规划路径。
**评审时间**：2026-10-03。
**评审结论 / 协议结论**：PASS。
**业务结论**：PASS（方向与原始需求对齐，未发现PROBLEM_DEFECT）。
**前一轮**：[review_notes_lwplan_1.md](review_notes_lwplan_1.md)，保留原REVISE/FAIL证据。

## 输入与复检范围

完整读取最新方案及clarifications（含LW评审收敛记录）；复用第1轮已独立读取的research、root_observations、readiness r2、source_materials及实际App/Modal/NoteGraph/useNoteGraph/graphGeometry事实。此轮只核查R1–R3补丁闭环及原门禁保持，不安装依赖、改应用或执行UI/DB动作。

## 第1轮修订闭环

| 原风险 | 最新方案可核查证据 | 复检结论 |
|---|---|---|
| R1：长期owner捕获首次graph.status | §2 `tryLocateLatest`同次`current=latest.current`，读取current.graph.status/locateRequest；finishLatest再次核对最新token、disposed及消费，读取current.onLocateResult；S4保持owner `[session]`，reconcile安装当前nodes后、Resize赋尺寸后、status/request effect均重试 | 关闭；初次updating不会成为永久旧闭包，waiting不消费 |
| R2：编辑RAF使用旧notes对象 | §2 notesRef每render更新，入口与RAF执行点均findCurrent(UUID)，使用当前对象；pending身份/mounted防旧回调；S3新动作/导航/另开编辑器/卸载取消单个RAF，软删/替换消失提示而非同名回退 | 关闭；复核落实到实际执行点，而非函数名称 |
| R3：详情waiting缺持有来源 | §2 App统一requestLocate/locateRequest/token；详情props.onLocate→requestLocate(id,false)，QuickOpen传true；S4详情禁止直接controls.locate，0尺寸/updating保留App pending且继续同一tryLocateLatest | 关闭；详情等待可重试并保持当前筛选，无第二套pending |

S3/S4验证条目分别增加更新/删除/替换/旧RAF取消，以及owner不重建、尺寸迟到/error基础节点/旧callback/详情请求互斥/卸载。它们是待执行证据入口，此报告不宣称这些实现测试已通过。

## Gate-2

### Required Set 复核结果：PASS

S1–S5主要工作包仍各含目标映射、文件/函数/接口、理解与目标形态、步骤、验收、责任、回撤、依赖、作者体验及降级。T1全项、T2输入输出/回归、T3接口矩阵/兼容/不迁移/即时降级均存在；§2主链/事实映射/片段闭环、§4对齐/提问、§5双阶段门禁保持。

### 目标锁 / 反目标复核结果：PASS

G1软反馈/首屏、G2完整标签/UUID/定位、G3成熟能力与分层制品责任未变。SQLite/Worker关系算法/回顾等延期项没有进入本轮。

| 禁止内容 | 最新lwplan可核查锚点 | 结论（方案未踩中） |
|---|---|---|
| 全卡/正文抢拖动、滚动/IME/动作、排序或每帧存储 | §1 A1；抓手dragListener=false；S2 siblings/仅抓手touch-action/不改排序；S3 IME | 确认未采用 |
| 新UI/图引擎、3D/云模型、自制物理/pointer状态机或数据迁移 | §1 A2/不改层；S1公开API；S4现D3；S5无迁移 | 确认未纳入 |
| Node/源码冒充native/GPU、回退未知/混合发布/提交生成物 | §3分层合同；S5 root证据、未测和局部回撤；§4不以synthetic event冒充 | 确认未指挥或认可 |

### 关键实现锚点复核结果：PASS

S1精确包/SoftInteraction/App许可；S2 NoteCard/有效CSS；S3 recordNavigation/QuickOpen/TagPicker/App notesRef与RAF；S4 requestLocate/NoteGraph latest/controls/reconcile/Resize/centeredCamera；S5元数据及发布文档均可直接定位。修订明确执行点与状态来源，不再靠函数名称推断最新状态。

### 代码片段充分性复核结果：PASS

§2两个目标骨架覆盖domMax注册→许可→抓手→取消stop/jump→UUID→RAF最新复核/统一定位请求→ready/尺寸→最新token回报。S3/S4正文明确retry顺序、取消和身份；S5字段变更使用文字足够，未要求最终实现全文。R1–R3片段缺口已关闭。

### 作者体验门复核结果：PASS

原业务button handler保留，单个allowed/owned动画适配、简单Modal/纯选择器和单一App请求。ref/token只承担有界异步身份，不扩成动画DSL或事件总线；中文界面不暴露内部格式/UUID/Worker。修订没有增加实施作者的跨包拼图负担。

### 人工 review 对齐复核结果：PASS

以下三个子项均PASS，故总项PASS。

| 子项 | 结果 | 依据 |
|---|---|---|
| 核心链路顺读复核 | PASS | §2现状→不改层→目标主链→骨架→S1–S5证据，可顺读两种定位共享pending和编辑执行时复核 |
| research 事实映射复核 | PASS | U1–U7表保留；U5最新UUID落实notesRef RAF；U6长期owner落实latest/status/nodes重试；D3身份清理和实测分层不变 |
| 跨包脑补需求复核 | PASS | R2最新数据入口、R3详情等待来源和清筛选区别已显式给出，无需作者再选一套状态来源 |

### P1-P9 协议合规核验表：PASS

| 协议项 | 结果 | 说明 |
|---|---|---|
| P1 | PASS | 语义工作包，不以任意任务数判质量 |
| P2 | PASS | §5必备项存在性硬门禁 |
| P3 | PASS | 缺项不得放行，无加权抵消 |
| P4 | PASS | T1/T2/T3维护，当前T3接口/兼容/迁移触点/降级存在 |
| P5 | PASS | 关键范围/验收/回撤不唯一才DELEGATE_QUESTION，不脑补 |
| P6 | PASS | §4新假设/风险/阶段切换留痕及基线更新；此次修订已留标记 |
| P7 | PASS | 无澄清数量上下限 |
| P8 | PASS | P0/P1/P2批量模板与当前未触发原因保留 |
| P9 | PASS | planner Gate-1后独立review/root Gate-2，r1 FAIL未被自检替代 |

未出现指挥后续递归委派的计划。

### 基线与澄清一致性复核结果：PASS

- 未回答为空；clarifications明确三项为G2既定实施细节，目标/范围/验收责任未变。
- G1–G3 aligned，反目标未命中，7项取舍未违反；持续授权不取消独立Gate。
- 同步domMax与精确Motion14公开类型安装前置Gate保留，未宣称确切行为已验证。

### 设计味道扫描结果：PASS

第1轮依赖名称/文字保证的三个异步边界已被当前ref、单一token和执行时复核替代；没有新抽象、状态总线或存储重构。未发现阻断设计异味。

### Gate-2：PASS

- allow_enter_impl=yes，仍需root按既定协议复核后委派实施。
- 仅是可实施方案放行。确切包API/LICENSE、受控合同、真实交互/性能和0.5.1构建尚须各自执行，不由本报告认证通过。

## 原地修订附加核验

虽本次是Review(LW)回环而非已落地Review(Impl)回退，方案采用了更严格修订留痕：§2、S3、S4、§5均有“本轮修订说明”和统一PLAN_DEFECT-R1标签；原S1/S2/S5与主链支撑保留。没有已实施代码需回收/迁移；仅替换未实施错误骨架，无删除已实施支撑或升级处理需求。

## 后续行动及证据责任

- S1先关闭Motion14精确锁、安装包LICENSE、m/domMax、cancel/stop/jump/animate公开API前置Gate；若不符，有限修订后再review，不能换latest或自制物理。
- impl按计划受控源码/测试/build并完整保留失败/告警；root独立测试/build、隔离UI、动画与0.5.1 EXE/NSIS/MSI。原生drag/触屏/系统reduce/GPU无法实测则继续未测，不能用本Gate-2或Node替代。
- 原readiness与r1报告均保留，不归档此前总体MVP，不发布来源不明混合修改。

## contract drift / stale / mirror mismatch

第1轮S4文字/骨架不一致和S3/S4等待合同缺口已关闭；clarifications收敛记录与最新计划一致。未发现新增shared/platform冲突。

无新增跨功能事实。
