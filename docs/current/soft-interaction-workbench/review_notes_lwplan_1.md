# 方案评审记录：lwplan（第 1 轮）

**评审对象**：[lwplan.md](lwplan.md)，2026-10-03版本，规划路径、T3。
**评审时间**：2026-10-03。
**评审结论 / 协议结论**：REVISE。
**业务结论**：n/a（Review(LW)未发现PROBLEM_DEFECT，不扩展为Review(Impl)双结论）。

## 输入与证据边界

- 完整读取lwplan、clarifications、research、root_observations、readiness r2和source_materials/feedback_20261003；沿原主链复读App、NotesView、NoteFilters、Modal、useNoteGraph、NoteGraph、graphGeometry、recordTools的实际相关实现。
- 已完整加载plan-review；对照implementation-planning的Required Set/锚点/片段canonical。分批读取命令退出0，初次并行合并输出截断后关键源码及research另读；不以截断部分作为核查证据。
- 只检查方案可执行性，未安装Motion、未改应用、未操作UI/DB或运行新功能验收。已记录的baseline 41测试/build与24有效记录异步观察属于root改前证据。
- 无新用户决策，不要求再次确认Motion库名、任意测试数量或阶段许可；缺确切包类型/源码和原生/GPU结果由已规划前置Gate及root承接。

## 可行性分析

- 独立抓手 + MotionValue/公开spring + 原生业务button的方向符合软反馈与输入边界；同步domMax、strict+m消除了异步功能未注册的计划复杂度，确切14.0.0 API/LICENSE仍由S1安装前置Gate核对。
- 全量标签/有效笔记UUID选择器和两个简单Modal无需新增组件框架。原搜索、精确标签与当前数据格式保留，范围足够小。
- token图定位可复用现D3相机，基础节点可在关系error时继续访问。现NoteGraph长期owner effect仅依赖session，必须通过latest ref读取变化状态；当前骨架存在一处直接违反该事实的闭包。

## 风险点及必须修订

### R1（阻断）：定位骨架读取初次graph.status

- 原文：lwplan §2 `tryLocateLatest`使用`if (graph.status === 'idle' || graph.status === 'updating' || !width || !height) return`；S4正文却要求“latest ref→ready/error”。
- 实际源码：`NoteGraph.tsx` owner effect以`[session]`保持D3/Canvas生命周期，`latest.current = {...props, shown, selectedId}`逐render更新；现`reconcileGraph`正是读取`latest.current.graph.status`。`useNoteGraph`首次24条请求走updating→ready。
- 影响：如把该骨架插入既有owner，首次updating被闭包永久捕获，ready/status重试仍waiting，正好破坏本轮需要验收的异步定位路径。单纯“在status变化重试”不能更新已捕获值。
- 恢复：目标骨架明确从`latest.current`同次读取当前request、graph及回报函数；维持disposed/latest-token检查，状态effect、reconcile后的nodes和ResizeObserver的重试顺序显式落盘。禁止为此重建整个D3 owner或改Worker算法。
- 验证：受控合同必须包含owner保持不重建，初次updating→ready/尺寸迟到后仅最新token成功一次；旧请求/卸载后的回报不生效。root再用24条真实Worker路径观察，不能用合同代替真实Canvas。

### R2（阻断）：RAF打开编辑器仍可能使用旧notes闭包

- 原文：App骨架在动作当下用`notes.find`核对，随后`scheduleAfterModalCleanup(() => editLatestNote(id))`。S3文字要求“再由受控单个RAF打开最新UUID”，但未说明RAF执行时最新状态读取入口。
- 实际源码：`App.tsx:90–93`现`editLatestNote`虽然名称含latest，实际读取本render的`notes`。新RAF若仅闭包保存这个函数，Modal cleanup完成后仍可能打开已删/已替换前的笔记对象。
- 恢复：骨架和S3明确RAF执行当下从受控latest notes ref/最新执行入口按UUID再核对有效目标，失效提示并取消交接；单个RAF身份和unmount清理保持，不借名称假定最新。无需编辑器或存储重构。
- 验证：受控编辑交接合同包括选行后、RAF前目标更新/软删/替换及旧RAF取消，不同名回退；root保留Modal→编辑器焦点/IME/连续输入/保存回填承接。

### R3（阻断）：详情定位返回waiting后缺可核查的持有/重试入口

- 原文：S4详情“调用同controls.locate；缺尺寸等候”，接口`locate(id):'located'|'waiting'|'missing'`；上方`tryLocateLatest`却只消费App的`latest.current.locateRequest`。
- 影响：详情直接调用locate在0尺寸/updating返回waiting后，文档没有保证该id进入任何pending来源；Resize/status重试可能只看到null App请求，等候变为静默丢失。不能由实施作者脑补第二套请求状态。
- 恢复：明确详情定位也进入同一App token请求或同一有界pending入口，并给最小目标片段；若选择App统一请求，详情不得顺手清当前筛选，需要保留S3跨视图QuickOpen动作才清阻挡filters的区别。消费/取消/一次应用仍同一合同。
- 验证：详情点击→尺寸迟到/updating→ready成功一次、离开图/目标删除取消，与QuickOpen旧token互斥；保持监听身份清理。

## Gate-2

### Required Set 复核结果：PASS

S1–S5为显式语义主要包。T1目标/文件/步骤/验收/责任/回撤/依赖/作者体验/门禁/提问/降级均存在；T2输入输出与回归、T3矩阵/状态/兼容/不迁移/即时降级均存在。此为存在性核验；不能覆盖下列片段闭环缺陷。

### 目标锁 / 反目标复核结果：PASS

G1–G3逐包映射，延期项保持，不改变数据或Canvas引擎。原生/GPU缺证据被明确承接，没有伪造通过。

| 禁止内容 | lwplan可核查锚点 | 结论（方案未踩中） |
|---|---|---|
| 全卡/正文拖动、抢选区/IME/页面滚动、重排或每帧保存 | §1 A1、抓手片段dragListener=false、S2原动作siblings/只抓手touch-action、S3 IME | 确认未提出这些改造 |
| 新UI/图引擎、3D/云模型、自制物理/pointer状态机、纯文本/SQLite/算法迁移 | §1 A2、不改层、S1公开API Gate、S4 D3、S5不迁移 | 确认未纳入本轮 |
| 源码/Node冒充原生手感、回退未知/混合发布/提交生成物 | §3分层合同、S1–S5 root承接、S5保留失败和未测、局部回撤 | 确认未指挥这些动作 |

### 关键实现锚点复核结果：PASS

| 包 | 首个复核位置/目标形态 |
|---|---|
| S1 | SoftInteraction、App许可、精确package/lock：同步domMax+m、原生button业务、cancel/stop/jump |
| S2 | NotesView NoteCard、CSS有效后段：独立抓手、有限x/y、单transform owner、首卡<=380候选 |
| S3 | recordNavigation/TagPicker/QuickOpen、App keys/Modal：完整标签与UUID/键盘/焦点交接 |
| S4 | App request、NoteGraph owner/reconcile/Resize、graphGeometry：token、异步ready、一次相机应用 |
| S5 | 各产品元数据/文档/发布验证：0.5.1一致、分块证据、root制品 |

### 代码片段充分性复核结果：FAIL

S1/S2成熟库、抓手与cancel骨架满足规划形态；S5元数据文字足够。跨S3/S4必要片段存在，但R1旧status、R2旧notes RAF和R3详情waiting来源未闭合，不能视为主链充分。只需有限补丁，不要求最终实现全文。

### 作者体验门复核结果：PASS

原业务onClick保留，一个allowed和有限owned动画适配，简单Modal/UUID选择器/D3定位，不引入DSL或总线。中文使用说明不暴露UUID/token；这些取舍比自行维护物理/pointer状态机直观。

### 人工 review 对齐复核结果：FAIL

汇总下表：核心链路顺读FAIL、research事实映射FAIL、跨包脑补FAIL，因此总项FAIL；不能由总体结构清楚抵消异步主链缺口。

| 子项 | 结果 | 依据 |
|---|---|---|
| 核心链路顺读复核 | FAIL | 许可→抓手→取消主链可顺读，UUID→RAF/最新状态及定位→ready/详情pending被R1–R3打断 |
| research 事实映射复核 | FAIL | U1–U7表有映射，但U6长期owner/latest事实与骨架graph.status不一致，U5最新UUID要求没落实到RAF执行点 |
| 跨包脑补需求复核 | FAIL | R2需作者猜测latest入口，R3需自行创造或选择pending来源；修订应统一有限合同 |

### P1-P9 协议合规核验表：PASS

| 协议项 | 结果 | 说明 |
|---|---|---|
| P1 | PASS | 5包按语义识别，禁止任意任务数门槛 |
| P2 | PASS | §5 Required Set任一缺失不得放行 |
| P3 | PASS | 纯存在性门禁，无加权抵消 |
| P4 | PASS | T1/T2/T3维护，当前T3且矩阵/兼容/迁移触点/降级均列 |
| P5 | PASS | §4/5关键范围/验收/回撤不唯一触发DELEGATE_QUESTION |
| P6 | PASS | §4新假设/风险/阶段切换即时留痕位置明确 |
| P7 | PASS | 不设澄清数量上下限 |
| P8 | PASS | §4 P0/P1/P2批量模板、当前未触发原因明确 |
| P9 | PASS | planner Gate-1后review/root Gate-2、失败回退明确，不能互代 |

方案未指挥后续递归subagent/task；impl明确不能操作用户UI/DB/密钥。

### 基线与澄清一致性复核结果：PASS

- 未回答为空；连续授权与独立Gate并存。
- 目标锁方向aligned，反目标未命中；7项取舍被S1–S5消费。
- 同步domMax是候选加载取舍的有界收敛，并非新产品范围。保存/图算法/回顾不进入实现。
- R1–R3是正确方向上的方案落实缺口，未发现核心功能不能追溯原始需求，故无PROBLEM_DEFECT。

### 设计味道扫描结果：WARN: 三个异步边界依赖函数名称或文字保证

见R1–R3；这些缺口阻断Gate-2的片段/主链核查，但不要求新抽象。应以最新ref、单一token入口和有限执行时复核恢复，不引入状态总线或再造图引擎。

### Gate-2：FAIL

协议REVISE；allow_enter_impl=no。修复R1–R3并独立复检之后才可实施。

## 后续行动及证据责任

- 原地有限补丁修订§2目标骨架及S3/S4，保留当前范围和验证/回撤。无需用户决策，也无需当前阶段实际native/GPU操作。
- Motion14类型/源码/LICENSE、cancel/jump公开行为在S1前置Gate核验；不提前宣称API已实测。真实首屏、输入、触屏、动态取消、Canvas和0.5.1制品由root按既定责任承接。
- 旧readiness r1/r2与本报告保留，修订后恢复同一reviewer。此次未实施，无已落地代码需收敛或回收；不重排旧功能支撑事实。

## contract drift / stale / mirror mismatch

- R1是S4目标文字与目标骨架的局部不一致，R2/R3是最新状态/等待合同未闭合；无需更改shared技能。
- baseline旧构建待完成文本已由最新覆盖段解释，readiness r2有效；没发现新增平台契约冲突。

无新增跨功能事实。
