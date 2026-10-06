# 低层方案评审记录（第 1 轮）

- review_target: lwplan
- review_iteration: 1
- review_date: 2026-10-03
- 评审对象：`lwplan.md` 2026-10-03 版，166 行，Gate-1=PASS。
- 协议结论：REVISE；本次 Gate-2=FAIL，尚不放行实施。

## 输入与证据边界

本轮按序完整读取最新 clarifications、feature README、research、两份原始 feedback、HL、HL 第1轮评审、Readiness 第1轮评审、LW；读取 plan-review 全文，并核对 implementation-planning 的 T1/T2/T3 Required Set。实际复核 App 的唯一笔记源、过滤/保存/删除恢复/编辑入口、noteFormat、recordTools、types、store、NoteComposer、package/TS配置及 Tauri/Cargo 版本。读取正式 [D3 drag 文档](https://d3js.org/d3-drag#drag_container)核查坐标和临时选区状态；没有改方案或生产代码、Git写、GUI、发布或递归委派。

这是一轮方案评审，不宣称新图测试、实际手势、性能或 EXE 已通过。root 提供的隔离夹具准备状态只是后续承接背景，旧0.4.0证据不算0.5.0成果。CUA可承接文字选择、按钮缩放/fit、编辑、布局与多帧实际截图；原生Canvas拖拽、触屏、系统减弱、hidden/GPU/原生缩放/IME缺操作接口时必须明确未测。Node纯计时、DOM入口与源码证明不能替代这些手势或平台实证。

## 必须修订的局部工程合同

| 项 | 证据、影响 | 最简修订与复核口径 |
| --- | --- | --- |
| R1：D3拖拽坐标原点缺绑定 | LW第124、135–136行采用屏幕subject及camera.invert(e.x/e.y)，但没有给drag.container。D3默认container是parentNode，拖拽事件坐标与Canvas局部坐标可能有边距/工具栏偏移，subject和逆变换因此不能形成确定闭环。 | 在S4绑定锚点及片段明确 `.container(canvas)`；subject、pointer命中、drag事件采用同一Canvas局部CSS像素，Canvas缓冲DPR独立。给出非零容器偏移、k≠1、x/y平移的纯坐标夹具；原生拖拽未能实测就保留未测。 |
| R2：中途卸载未明确恢复D3选区状态 | LW第140行明确移除所属window临时drag监听，但未说明恢复dragDisable产生的dragstart/selectstart限制或文档user-select。仅去掉监听不等于恢复全部原生交互状态；中途切页可能影响后续笔记正文选择。 | 在S4写明当前组件拥有活动手势时的取消清理顺序与 `dragEnable(window)` 恢复；包含window临时监听、拥有权和D3原生选择状态，禁止无条件扫掉其他组件行为。给出start→卸载的状态/清理锚点及可行测试；实际原生组合不能测时如实限定。 |

依据：[drag.container](https://d3js.org/d3-drag#drag_container)定义事件坐标原点；[dragDisable/dragEnable](https://d3js.org/d3-drag#dragEnable)定义文本选择及原生拖拽状态的成对恢复。两个缺口属于既定S4内的工程实现合同，不改变产品目标、依赖路线、数据模型或审批边界。

## 已核验的主要闭环

S1限定为现有NotesView/NoteCard/Empty等价提取及共享token表达式，保留saveNote、持久化、草稿和格式转换；明确搬移而非整链删除。S2纯显示提取与当前renderMarkdown的标题/列表/代码/颜色字号规则一致，保留未知标记字面内容、不依赖DOM或任意HTML；空正文不作重复关系，NFKC/Unicode码点、标签Set与按记录DF、同分确定排序都有具体规则和测试口径。

正文候选先限64，不临时建全部成对集合；非空完整文本键处理重复内容，标签环骨架与两通道主动top2解释清楚，最终无向度数可大于2而全局边≤4N。全部节点与诱导子图、孤立/pending节点、稳定主标签/关联组键及颜色与事实/推断文案闭合，不把空间布局称为真实语义。

Worker阈值明确为≥80记录或≥40,000 UTF-16长度，一个在途加一个可替换最新pending；语义版本守卫、清陈旧边、timeout/error/messageerror/创建失败/error回应、重试/取消和静态节点降级均有终态。专用createGraphRequests用于真实实现合同测试，避免影子队列或通用框架。工程实现需依正文合同处理error回应与版本，不把精简onReply骨架当完整异常分支。

S3把侧栏改顶部导航，默认2–3列Grid、日期模式、大图与主体紫青粉光场，浅深窄屏有形态与回归责任。60条批次先完整筛选再展示，计数/加载更多明确；图仍取全部visibleNotes，所以不触犯静默截断节点。App会话ref持有UUID位置/镜头跨视图，操作按最新id进入原Composer；Note/AppData/SQLite/AI不增加图持久化。

S4独立D3模拟副本、初始铺点、显式stop默认timer、单30fps rAF、缓冲上限、冷却物理/持续流光、暂停静态drawOnce、hidden禁绘、时间重置和大图减特效均有边界。R1/R2补齐后才能认定手势/取消片段闭环充分。S5锁定0.5.0全部元数据，备份version仍1；当前输出/哈希/EXE与MSI区别、未测边界、只回撤本轮补丁均明确。

## Gate-2

**Required Set 复核结果**：FAIL。

T3已识别S1–S5主要工作包；目标/反目标、文件/实体/接口、依赖、输入输出、兼容不迁移、停机降级、各包验收回滚、作者体验及统一证据合同存在。主链、研究事实表、Gate1/2和澄清机制均在工作包之前或§3明确。必需的S4坐标/中途取消状态合同仍缺R1/R2，不能以Gate1自报PASS替代独立放行。

**目标锁 / 反目标复核结果**：PASS。

G1落在S3，G2在S2/S3/S4，G3在S1/S2/S4/S5；相互没有目标漂移。以下是规划存在性检查，实施后仍需审实际代码。

| 禁止内容 | LW可核查依据 | 结论（确认LW未踩中） |
| --- | --- | --- |
| 随机边缘点冒称脑图、只换颜色 | 第91–101行顶部/网格/主体光场/大图；第101行不再挂载AmbientNodes | 未命中 |
| 自动上传、任意HTML、远程模型、3D/插件/双引擎、关系schema | 第7/44/46/118/146行纯显示、独立本地模型、唯一D3子包、备份version=1 | 未命中 |
| 每帧构图/setState/保存、完全成对关系 | 第46/61–70/128行语义键、候选上限、请求状态与私有循环 | 未命中 |
| 静默漏笔记节点 | 第63/95/99/126行完整投影、卡片批次计数与图全节点区分 | 未命中 |
| 丢弃现场、提交生成物或密钥、触碰.serena/强推 | 第38/114/154/158行有限补丁回滚、Git及制品边界 | 未命中 |

**关键实现锚点复核结果**：PASS。

S1 props/import/token；S2 plainNoteText/buildNoteGraph/projectGraph/createGraphRequests/Worker字段；S3 View/nav/NoteFilters/Grid/session；S4 reconcileGraph/drawOnce/syncMotion/fit/drag；S5具体元数据与验证路径均能定位首个复核落点。实体存在性充分，R1/R2是其内部合同遗漏。

**代码片段充分性复核结果**：FAIL。

S1导入迁移、S2纯类型/请求/投影、S3顶部结构/共享集合/App session、S4副本/subject/invert/循环及S5无需片段理由存在。主保存链无需猜测，但S4没有明确container和恢复原生选区状态的绑定/清理片段，命中跨层状态规则的必需闭环未满足；需只补这两处骨架，勿扩成最终源码全文。

**作者体验门复核结果**：PASS。

平铺模块、原props回调、一个专用调度边界/一个运行谓词，避免第二笔记源、公共View枚举、通用renderer与复杂手势框架；用户动作有名称与文字入口，界面不露候选/队列工程术语。未发现作者需机械填配置或跨包反复拼图的回退。

**人工 review 对齐复核结果**：PASS。

| 子项 | 结果 | 独立复核依据 |
| --- | --- | --- |
| 核心链路顺读复核 | PASS | §1先给旧状态/唯一notes→派生模型→完整当前集合→独立Canvas→原保存，不改层在第7/9行明确 |
| research 事实映射复核 | PASS | 第11–19行把旧排版、已有12项、格式、D3 mutation/坐标、TF-IDF/稠密风险、Worker/后台、旧制品映射至实现与分层验证；S4内部R1/R2另由片段门阻断 |
| 跨包脑补需求复核 | PASS | 第21/23行统一闭环和证据合同，随后各包给接口与目标形态；不用读者自行造第二状态源或验证责任 |

总项引用三个子项PASS；它不代替坐标/取消合同充分性的失败结论。

**P1-P9 协议合规核验表**：PASS。

| 协议项 | 结果 | LW依据 |
| --- | --- | --- |
| P1 | PASS | 无最低任务数；S1–S5按职责而非数量门槛 |
| P2 | PASS | 第160行必备内容存在性自检及缺任一回LW |
| P3 | PASS | 同第160行存在性双门禁，不按评分放行 |
| P4 | PASS | 第3行T3；§1/各包/§3覆盖T1/T2继承与跨模块接口、兼容、停机 |
| P5 | PASS | 第160/162行口径不唯一或新阻塞假设触发DELEGATE_QUESTION |
| P6 | PASS | 第162–164行事件触发/留痕位置与当前阶段交接，无固定次数 |
| P7 | PASS | 无问题数上下限；本轮零新增产品问题不作为永久禁止提问 |
| P8 | PASS | 第162行未触发原因与P0/P1/P2批量模板 |
| P9 | PASS | 第160行Gate1作者自检，Gate2 reviewer主检/root复核；失败禁止impl并回评审 |

没有要求下游递归委派。

**基线与澄清一致性复核结果**：PASS。

未回答阻塞产品Q&A为空；既有Git未知现场合并确认仅约束提交。目标锁遵守、反目标未命中、头脑风暴六项决策落实。标签+本地正文、成熟D3路线、可见多色/默认网格/大图和新EXE均可溯源原反馈、最新基线与HL；阈值/候选/颜色属于已授权how，不新增产品审批。

**设计味道扫描结果**：PASS。

没有双引擎、存储迁移、全局逐帧状态、通用队列/renderer、无界成对关系或假想未来抽象。两个阻断项是成熟API绑定/恢复合同遗漏，非需求扩张或产品问题建模错误。

**Gate-2**：FAIL。

## contract drift / stale / mirror mismatch

旧装饰-only/关系延后明确被本轮范围覆盖，当前源0.4.0与目标0.5.0区分清楚。Readiness报告“当前feature README的Review(HL)/ReadinessCheck”是上一阶段快照；本轮已核对README最新Review(LW)，不以历史阶段语句判断当前状态。共享readiness模板的编号缺core定义继续留痕，不在本任务改shared技能。

本轮一次源码读取尝试不存在的tsconfig.app.json，输出明确报Cannot find path，整批命令末尾退出0不代表该读取成功；随后rg定位并完整读取真实tsconfig.json，退出0。其余读取没有错误。上游已见GitHub403/页面失败、多命令截断补读与多包查询只返回首包均保留为上游检索限制，未当成功证据。本轮没有运行新功能构建或测试。

## 后续动作

architect仅补S4的R1/R2坐标/取消恢复锚点与必要片段，保留主链/其余工作包；root复核后重新Review(LW)第2轮。无需产品重审批，无PROBLEM_DEFECT，不把实际原生手势或打包变成本次方案评审前置。Gate-2 PASS后按既有授权实施并承接当前验证/0.5.0制品。

无新增跨功能事实。
