# 记录移动与置顶：只读代码调研

日期：2026-10-04。任务来源：用户“这个拖拽好像被禁止了，没办法和其他的一块，拖拽移动，此外就是置顶这个功能是不是也可以搞一下”。范围：当前工作区真实代码与相关文档；未修改生产代码、既有feature、浏览器、数据库或Git；未运行构建/测试。依照codebase-research仅收集事实和兼容边界，具体数据模式、交互库与验收门槛由root后续方案决定。本报告中的候选能力不代表已实现。

需求追溯补充：root回传用户已选择“调整排列顺序，重启保留（推荐）”；提问题干明确“拖动抓手调整排列顺序、在重启后保留、置顶记录放在独立区域”。已经读取当前新feature `docs/current/note-order-and-pinning/README.md:3–6`，与该答复一致。本轮业务目标由此明确为真正卡片重排、持久化和独立置顶区域，不扩展成自由画布摆放或多选移动。

## A. 系统边界与现有能力

- 晴笺现为React前端 + Tauri SQLite本地记录/账本应用。记录有内容、状态、创建/更新日期、计划日期、完成、软删除字段；没有记录置顶或手工排序字段（`src/types.ts:3–12`）。
- 当前“拖拽”实际为装饰轻拉：左右12px、上下10px，释放弹簧回原点；不存在拖到另一张卡片、交换顺序或排序持久化能力（`src/SoftInteraction.tsx:42–64`）。该行为和文案在 `docs/Soft.Interaction.md:3`、`docs/Workbench.Layout.md:16` 一致。
- 抓手真实名称为“轻拉记录，松手归位”，暂停时`aria-disabled=true`，仍是一个button但start函数不执行；回收站不渲染抓手（`src/NotesView.tsx:39–44`）。所以用户期待的真正移动不属于前次实现的能力；即使动画开启也不会改变排序。
- 当前只有“固定标签”，保存在独立`luma-pinned-tags`本地偏好，固定的是标签快捷入口（`src/App.tsx:28,57,122,176`；`src/NotesView.tsx:35`）。它不等同记录置顶，且不进入AppData备份或SQLite。

## B. 入口与主流程

### B1. 数据加载、保存与记录更新

1. App初始使用`loadNotes/loadTransactions`读浏览器本地存储；桌面环境`ready=false`，随后调用`load_data`（`src/App.tsx:24,27,53`；`src/desktop.ts:4–7`）。
2. 桌面加载结果只有notes或transactions非空时才覆盖初始浏览器状态，随后ready=true（`src/App.tsx:53`）。这个空库回退行为已是旧边界，不能擅自借本轮改写。
3. notes变化保存整个notes数组到localStorage，再调用`save_data`保存完整notes+transactions；transactions另有同型effect（`src/App.tsx:54–55`）。拖动过程中频繁更新notes会直接触发保存effects，现有装饰拖动因此使用MotionValue而不更新业务状态（`src/SoftInteraction.tsx:46–59`）。
4. 新建记录前插数组；编辑按id映射合并现有对象和draft，不重新排列（`src/App.tsx:123`）。现NoteComposer输出正文/日期/完成/软删除，草稿仅Pick content/status/scheduledDate；它不会主动产出排序或置顶（`src/NoteComposer.tsx:27–32,109–123`；`src/types.ts:14–16`）。
5. 软删除、撤销、恢复都按id映射，因此保留原数组位置；永久删除过滤id；目前回收站“恢复后会回原来的位置”依赖此事实（`src/App.tsx:127–129`；`src/NotesView.tsx:28`）。

### B2. 列表展示

- App对完整notes做query/tag/unfinished/trash过滤，`selectNotes`仅filter，保留源顺序（`src/App.tsx:82–83,156–163`；`src/recordTools.ts:23–32`）。
- NotesView首批60，每次增加60；query、selectedTag、unfinished、layout、isTrash变化时重置60（`src/NotesView.tsx:22–24,34`）。全量过滤先于批次。
- 网格/阅读直接使用过滤后的数组顺序；日期模式先按日期组降序再flatten、然后取limit。每组内保持输入顺序，日期key优先scheduledDate，非法日期归“未指定日期”（`src/notePresentation.ts:4–17`）。
- NotesView实际`shown.map(card)`和date分组`group.map(card)`都没有重排回调；props也没有排序/记录置顶入口（`src/NotesView.tsx:11–18,25,31`）。

### B3. 动效禁止条件

- `motionAllowed = ambientEnabled && !reducedMotion && pageVisible && !composer && !quickOpen && !tagPickerOpen && !aiOpen`（`src/App.tsx:85`），传入SoftPolicy（同文件:165）。开关来自`luma-ambient-motion`，系统reduce来自媒体查询，页面后台来自visibilitychange（同文件:30–33,46–64）。
- `useSoftDrag`实际allowed为SoftPolicy AND enabled；start仅primary左键，当前NotesView传`!trash`（`src/SoftInteraction.tsx:43,60–63`；`src/NotesView.tsx:42`）。
- 关动效、系统reduce、后台及弹层会使装饰抓手不工作。window blur会取消当前手势并复位，但blur本身不改变motionAllowed布尔值（`src/SoftInteraction.tsx:14–19`）。
- lostpointercapture、pointercancel、抓手blur、组件卸载都走reset；cancelSoftMotion先取消控制器，再stop动画、MotionValue.stop/jump归位（`src/NotesView.tsx:44`；`src/SoftInteraction.tsx:48–54`；`src/softMotion.ts:5–8`）。
- 没有真实浏览器取证，本报告不能确认用户当时具体是动态开关、系统reduce、失焦还是本来就只能轻拉。上述条件是已读源码事实，当前运行态归U1。

## C. 关键模块与职责划分

| 模块 | 当前职责 | 本轮相关边界 |
| --- | --- | --- |
| `types.ts` | Note、NoteDraft、AppData形状 | 没有pin/order；AppData TS version固定1 |
| `App.tsx` | 权威notes数组、展示筛选、数据effects | 业务更新触发全量保存；new前插/edit合并/软删映射 |
| `store.ts` | localStorage、旧格式映射、JSON导出导入 | 保存整个对象/数组，导入只是数组级检查；字段级迁移未有独立工具 |
| `desktop.ts` | Tauri invoke桥接 | 传整个AppData；没有排序专用命令 |
| `lib.rs` | SQLite开表、load/save、AI凭据/网络 | 记录SQL当前只有8列；每次读按created_at DESC；写全表事务 |
| `NotesView.tsx` | 列表/日期、卡片、60批次 | 当前只有装饰抓手；卡片动作保留原id回调 |
| `notePresentation.ts` | 日期分组与批次前展示顺序 | 阅读/网格源顺序，日期跨组强制降序 |
| `SoftInteraction.tsx` | 按压及装饰拖动、统一策略与取消 | 两轴小范围拖后归位，不写notes |
| `noteGraphModel.ts/useNoteGraph.ts` | 内容与标签语义模型/Worker | 语义快照只id/content，按id排序，不应因纯顺序或pin重算 |

## D1. 数据与最低兼容边界（不是实施方案）

### 浏览器与JSON

- 浏览器KEY仍`luma-notes-v1`，saveNotes直接JSON.stringify(notes)，loadNotes使用map及`...note`保留现有额外属性/数组次序（`src/store.ts:3,13–24`）。load同时会重设status并处理原prototype文字/日期，这是旧迁移，不能称读取完全无变换。
- exportData直接返回version1、原notes、transactions；parseBackup只确认两数组并类型断言，没有逐字段校验/默认化/去重（`src/store.ts:36–44`）。因此浏览器路径可以携带附加字段，但当前实现不保证其类型有效；需明确旧backup缺字段时的语义。
- 当前JSON导入是替换整个notes/transactions集合，不是合并（`src/App.tsx:126`）。本轮若测试导入，应隔离样本，不用原用户数据做 destructive 替换。

### SQLite与桥接

- Rust Note当前同样无pin/order，camelCase桥接；只有deleted_at带serde(default)，其余Optional日期字段依现有反序列化行为（`src-tauri/src/lib.rs:12–19`）。Rust AppData不包含TS端version。
- 新DB表只创建8列；旧DB迁移当前只有“pragma检测deleted_at是否存在 → ADD COLUMN deleted_at”（同文件:30–38）。没有schema version/user_version跟踪，也没有排序元数据表。
- 读回`ORDER BY created_at DESC`，并未保存数组索引（同文件:44–45）。只把Web数组移位后调用原save_data，下一次桌面启动会按创建日期重新排，手工顺序不能跨重启往返。相同created_at没有第二排序key，这是观察到的查询，是否实际存在时间相同数据未查库。
- save_data以一个SQLite事务DELETE两表，然后逐条INSERT再commit（同文件:52–59）。它没有逐记录增量写入，也没有可由前端用来单独确认顺序保存的返回元信息。
- （推断）只加前端字段仍无法经Rust当前Note结构和显式8列SQL保存/读回，因此桌面兼容必须贯通至少“TS形状 → invoke入参 → Rust序列化 → SQLiteschema/读写 → UI展示”；浏览器额外localStorage排序偏好并不是现有SQLite/备份的一部分。
- 最低兼容约束应明确：旧Web记录、旧version1 backup、现8列SQLite及更旧7列SQLite在新读取后仍保留原正文/日期/完成/删除字段，缺失新metadata不能导致拒绝旧记录；新metadata往返需在同一既有存储边界内验收。这是兼容要求，不规定新增列、数组rank或独立metadata表的具体选型。

### Root指定最低候选的代码适配检查

以下仅核对root提出的待评审候选与当前事实是否矛盾，不替代正式方案，也没有实施：`Note`增加可选`pinned`，SQLite新增pinned默认0、内部position可空列；Web/backup继续以数组顺序为权威，桌面写入数组索引、读取已有position优先，旧NULL回退created_at DESC。

- **候选不要求公开sortOrder字段有实际依据**：Web的JSON数组保存顺序、selectNotes保序、App编辑/软删保原位置、exportData原数组输出已形成一致路径（store:17–24,36–44；App:123,127–129；recordTools:25–32）。SQLite恰好是目前丢失该顺序的边界（lib.rs:44–45,57）。因此内部position表达同一数组次序可补足桌面往返，而公开额外sortOrder将建立第二个现代码没有的顺序来源。（推断）
- **可选pinned与旧前端兼容有现有合并依据**：loadNotes的`...note`、App编辑的`{...n,...draft}`、软删/恢复的`{...n,...}`均保留额外属性。现NoteComposer没有输出pinned，新增可选字段不要求改编辑正文；但必须验证编辑不会清掉已有pin（store:17–22；App:123,127–128；NoteComposer:123）。（推断）
- **SQLite默认必须与Rust旧入参一致**：列默认0并不能独自使旧backup/旧invoke可反序列化；当前Rust仅deleted_at有显式serde(default)，若pinned新增为必需bool而不提供旧输入默认，旧未含pin记录的兼容仍是缺口（lib.rs:14）。这个边界需在方案/测试明确。
- **旧NULL回退可延续当前原查询语义**：现唯一持久顺序是created_at DESC。NULL回退符合“不改旧记录创建日期”的需求；NULL与已有非NULL混合、同created_at、旧schema重复打开及第一轮保存后转为position的具体稳定排序还需方案定义和测试，不能把“优先”二字当完整排序合同。
- **position保存范围应纳入所有notes的事实链**：当前App权威数组包含活动和回收站，save_data接收完整数组，恢复只是deletedAt变化。如果仅针对显示子集或活动子集写position，现恢复回原位置承诺可能失去相同顺序来源；filtered/shown永远不是全量权威集合（App:24,83,127–128,157；NotesView:24）。这是一项需readiness明确的完整性约束。
- **置顶独立区域属于派生展示的潜在适配边界**：现exportData传App原notes、图semanticSnapshot不含pinned，candidate无需把置顶后的UI拼接序列写回正文或图坐标。具体pin/非pin区是否保持一套canonical数组、取消pin回哪处、跨区拖动是否自动pin，仍由方案决定；用户只确认独立区域，尚未定义跨区动作。
- **兼容方向须真实报告**：新版本读旧库/旧backup与旧版本运行新库后仍保留新metadata是两件事。当前旧save_data全DELETE后只INSERT旧8字段，会让新增列使用默认/NULL，因此降级运行可能丢新pin/position；原正文等旧字段可保留，不能承诺旧exe完整往返新功能（lib.rs:55–57）。（推断）

### 图模型

- semanticSnapshot明确过滤软删除、只投影id/content后按id排序（`src/noteGraphModel.ts:18–21`）；hook只按enabled/key提交Worker（`src/useNoteGraph.ts:109–123`）。现测试明确done/date/sourceorder不变语义key（`tests/noteGraph.test.mjs:59–62`）。
- （推断）保持只改metadata/顺序而不改正文与id时可以沿用该语义缓存，纯pin/order不需要改变算法；图节点投影与下拉列表仍接收visibleNotes，不能误把列表顺序当作图的持久坐标。

## E. 外部依赖与系统边界

- Motion精确14.0.0已安装用于LazyMotion/domMax、dragControls、MotionValue和spring；D3独立用于图；当前package.json没有排序库（`package.json:dependencies`；`docs/Soft.Interaction.md:11`）。是否现Motion可满足双轴网格真正排序需要业界/API调研，本报告不假定Reorder适用网格。
- notes/transactions均本地读写。排序/置顶不需要改变AI请求，也不需要向外发送笔记。AI独立网络路径（`src-tauri/src/lib.rs:63–93`）不在本轮范围。
- 本轮无运行时配置新增依据，不建议为排序添加云端/多端框架；root需要按用户实需划定行为。

## F. 已阅读文件与文档

已完整读取相关短模块：`src/types.ts`、`store.ts`、`desktop.ts`、`SoftInteraction.tsx`、`softMotion.ts`、`NotesView.tsx`、`notePresentation.ts`、`recordTools.ts`、`useNoteGraph.ts`、`src-tauri/src/lib.rs`、package.json。App读取1–195（所有notes业务与视图入口），NoteComposer/NoteGraph/recordNavigation相关入口用rg定位；noteGraphModel读取1–65（语义投影）。

已读实际测试：`tests/recordTools.test.mjs`、`softInteraction.test.mjs`、`noteGraph.test.mjs`，并rg扫描整个tests与Rust源。已读文档：`docs/Soft.Interaction.md`、`Workbench.Layout.md`、`current/soft-interaction-workbench/README.md`、`Release.Testing.md`、`Release.Verification.0.5.3.md`、`Release.Verification.0.4.0.md:1–46`；soft-interaction-workbench/lwplan相关交互和验证入口由rg定位，没有将旧计划当现状。

文档与当前实现一致：装饰抓手不排序、关闭动态暂停装饰、记录60批次、日期先排序；0.5.3未改存储。此次用户想要的真正移动/置顶是新增业务能力，而不是当前排序能力回归。

## G. 不确定点与验收缺口

- U1 用户当时真实motionAllowed/ambient/reduce/pageVisible/overlay状态：本agent按只读任务不操作浏览器。root需查看实际UI/可观察disabled状态，不能凭源码说当前一定是设置关闭。
- U2 已由本轮用户选项关闭：目标是调整排列顺序并重启保留，置顶独立区；不把原句扩为自由画布或多选。现代码没有多选state，本轮也无用户确认多选要求。
- U3 日期布局跨日期移动如何定义：日期顺序由scheduledDate决定；真正重排不能暗中改变日期。需在方案里明确日期模式、筛选、置顶区、跨区移动的业务语义。
- U4 旧数据与新metadata缺字段/冲突、pin取消后回原位置、新记录插入以及软删恢复规则还没有可复用实现或测试；需要方案明确后新增针对行为的验证，不能只测库API能调用。
- U5 迁移自动覆盖为空：Rust业务没有测试用例（`docs/Release.Testing.md:19`），本轮rg未发现测试模块或测试函数；当前Node tests也没有store/backup/SQLite迁移测试。0.5.3的读库对比只证明没改schema时同字段保持（`Release.Verification.0.5.3.md:50`），不能冒充新迁移验收。
- U6 现有created_at相同值/损坏JSON/重复id等数据是否实际存在未知；禁止为了假想异常顺带改导入、业务存储或历史排序，先维持任务范围。
- U7 原生触屏/键盘排序、motion关闭后业务拖动、滚动途中取消、60+过滤批次与持久化性能等真实证据尚不存在。纯Node回归和CSS截图不能证明拖拽手感。

### 具体验收建议（验证范围，不是实现细节）

1. 真移动：隔离至少3张不同高度样例，在网格/阅读分别从首→尾、尾→首、中间插入；只抓手启动，正文点击/文字选择/完成/复制/编辑/回收不被拖动抢走；右键与非primary不启动；完成移动后只顺序/必要metadata改变，正文/日期/完成不变。
2. 动效可用性：关动态与系统reduce时业务移动/置顶仍可完成，装饰反馈关闭；编辑/标签/快开/AI弹层、导航离开、失焦、后台、pointercancel、中途删除时没有悬浮卡/残留监听/错误业务提交；触屏没有实测能力则标未测。
3. 置顶与顺序：分别验证两条pin、取消pin、同pin区再排、pin与非pin间操作、新建/编辑/删除撤销/恢复及永久删除首步；验方案定义的行为而不是凭视觉觉得合理。
4. 筛选与批次：标签+query+unfinished组合、隐藏记录、60→120加载、同名不同UUID、排序和pin后清除筛选；禁止误把过滤子数组全量覆盖权威notes，清除后隐藏记录仍完整。
5. 持久化：Web reload、桌面load/save再load以及程序重启保留新metadata/顺序；backup导出→隔离导入往返保持；旧version1 backup不含新metadata仍可读取且原字段不变。
6. SQLite：在临时目录建7列旧库、8列现库、已有新schema库，包含不同创建时间/日期/完成/删除、非空transactions；分别新迁移→读→写→再读，逐字段比较旧数据并核对新metadata默认与排序；重复启动迁移应不再重复ADD；不得改真实用户库或凭0用例cargo test声称通过。
7. Root验证：最终源码重新npm全量tests/build，新增Rust真正迁移/读写测试；正式Windows构建及自有新进程烟测，旧真实库先安全备份和只读快照，schema新增时比较旧列/新列分别正确而非SELECT*旧hash相等。记录实际失败与未测项。

## H. 给readiness reviewer的最小证据

| 需核查事实 | 最小锚点 | 事实/推断 |
| --- | --- | --- |
| 不是已有真正排序功能坏了 | `SoftInteraction.tsx:58–64`；`NotesView.tsx:44`；`Soft.Interaction.md:3` | 已观察源码/文档 |
| 动效策略目前禁用抓手 | `App.tsx:85,165`；`SoftInteraction.tsx:43,61` | 条件已观察，实际运行态U1 |
| 没有记录置顶 | `types.ts:3–12`；`App.tsx:122,176` | 已观察；当前仅固定标签 |
| 数组重排无法穿透旧SQLite往返 | `store.ts:24`；`desktop.ts:6–7`；`lib.rs:14,33,44–45,57` | 具体代码已观察；往返结论为推断 |
| 日期模式强制日期组顺序 | `notePresentation.ts:4–17` | 已观察；新增语义U3 |
| 拖动若写notes触发全量保存 | `App.tsx:54–55`；`lib.rs:52–59` | 已观察；需要避免频繁业务变更为约束 |
| 图语义不依赖源顺序 | `noteGraphModel.ts:18–21`；`useNoteGraph.ts:121–123`；`tests/noteGraph.test.mjs:59–62` | 已观察源码与现测试 |
| 迁移测试缺口 | `Release.Testing.md:19`；`lib.rs:30–38`；`Release.Verification.0.4.0.md:40–41` | 没有自动用例；旧单库历史不能替新迁移 |

U2已关闭；仍未关闭U1、U3–U7，本报告不做readiness PASS判断。不存在阻塞此次只读调研的用户决策；root后续需明确的产品问题应由root统一落入新feature clarifications而不是改旧feature。该最低候选与现有数组顺序事实相容（推断），但上述缺失默认、混合排序、隐藏记录、恢复位置、区间动作与降级边界必须在正式方案/验证合同补足。

## 观察失败与范围外问题

- 批量源文件输出曾被工具预算截断；已将App与Rust/包配置单独完整重读，未把截断当已读证据。
- 曾猜测`src/noteGraph.ts`、`src/graphModel.ts`，实际不存在；前者rg报错，后者Get-Content报错（最后整体exit0不能证明该路径读成功）。已按useNoteGraph真实import定位并读取`src/noteGraphModel.ts`。
- 发现但未改动：`store.ts:40–44`仅数组级校验、`App.tsx:126`导入直接替换、`App.tsx:53`桌面空库回退、`App.tsx:54–55`双effect保存整个两表。旧0.5.3验证:61已明确这类议题不在展示优化范围，本轮只报告，不擅改。
- 未访问真实库、未跑build/test，所有“现测试覆盖”仅指所读测试代码和历史报告，不能当作本轮运行结果。

无新的跨功能事实候选：已有本地优先/存储边界/动效取消事实已在项目文档，不重复提议写入AGENTS。
