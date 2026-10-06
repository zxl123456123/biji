# 笔记视图分工：低层实施方案

日期：2026-10-05。任务类型：T3，既有前端视图与 UUID 接口的跨模块增量。唯一输入基线为 `clarifications.md` 的完整实现基线；`review_notes_readiness_1.md` 已 PASS 且根全文核读。本文是待 Gate-2 审核的计划，所有目标行为均未实施、未产品验收。

## 1. 范围与对齐

| 目标锁 | 本轮落点 |
| --- | --- |
| G1：二维全图 / 当前一层 / 当前两层、依据过滤、准确数量及失效定位 | S1 的纯展示投影、当前选中中心、同源 Canvas / 详情；S3 的兼容定位协议 |
| G2：三维主题导览 / 聚焦 / 恢复、克制连线、UUID 阅读回路及原能力保持 | S2 的主题投影与导览、完整布局与绘制布局分离；S3 的空间到二维接线 |
| G3：浅深主题 / 390px、原能力和并发修改保留、真实证据及 fresh review | 三包的独立样式、最新文件小补丁；根验证与实施后独立审查 |

反目标 A1（不重复密集图、不冒充语义、不复制日历/宠物）、A2（不增加 schema/存储/网络/依赖/版本/安装包、不覆盖并发改动）、A3（不增加关系引擎/renderer/RAF/全局筛选副本、不冒充设备实测）是三包共同硬边界。不影响编辑/保存/格式/排序、原 Worker/token/latest-record、原 Ctrl K 清筛选、Record*、Pet*、pet*、spatialModels、scene、spatialRuntime、外观枚举、SQLite/备份与版本元数据。

采用 Obsidian 官方全图/局部图的用途分工与既有 Three 按需绘制；按最终基线增加一层/两层，不照搬链接语义、力参数配置或自动巡航。行业建议的保留非组淡背景不纳入本轮：既有 scene 无独立弱化接口，明确的主题范围 / 总数 / 返回全部提供可解释的子集，不改 renderer。

## 2. 核心链路总览

现状：App 唯一 notes → 共享搜索/标签/未完成 → `visibleNotes`；`useNoteGraph(activeNotes)` → 原 GraphModel → `projectGraph` → 二维 D3/Canvas 或三维 `buildSpatialLayout`/scene → UUID 原编辑器。现在两图均强调关系并重复逐条依据，空间返回二维不携 UUID。

改动后：二维在共享筛选之后再做依据与邻接范围投影，Canvas、模拟、数量和逐条证据使用同一 `shown`；三维以共享筛选全集的完整布局派生主题导览，主题子集保留原坐标/度数，仅裁节点、绘制边和 bounds；正文与关联总数仍查完整布局。空间选中 UUID → App 请求 `local: true` → 二维在旧中心裁剪前采用新 UUID → 原 locator 消费 token → 原编辑入口。

不改关系分析、Worker、scene/model/scheduler 与业务状态，因为用途分工可在展示层和既有回调上闭环；三维节点 degree 来自完整布局，不把“少画线”送回布局算法。共享筛选变化仍可按既有算法重算完整布局，本轮仅保证主题聚焦 / 恢复期间坐标连续，不承诺跨搜索布局固定。

### research 事实映射

| 事实 / 约束 | 实现锚点 | 验证锚点、责任及口径 |
| --- | --- | --- |
| 所有 UUID、空正文、独立点保留；混合边有两种证据 | S1 `graphView.ts`；S2 `spatialExplore.ts` | impl 冻结输入、空/独立/混合边纯测试；根文字选择与正文现场 |
| 二维 locate 当前只查模拟节点，旧中心可能先隐藏新 UUID | S1 `NoteGraph` 范围前的 effectiveCenter；S3 请求字段 | impl 新中心范围测试、原 token 测试；根图内 Ctrl K 与空间跨视图回路 |
| degree 控制 3D 点大小，scene 与旧详情同用 layout.edges | S2 `fullLayout` / `displayLayout` 分离 | impl degree/坐标/完整边不变测试；根选中线、点大小、详情总数 |
| 子集重跑 buildSpatialLayout 会改 groupRanks/槽位/坐标 | S2 从 fullLayout 裁节点并重算 bounds | impl 两组→单组→全部非变异与 bounds 包围测试；根主题适配 |
| scene 已有 setLayout/fit，fit 消费当前 bounds | S2 布局更新后处理明确 fit 意图 | 根主题/全部按钮实际镜头覆盖；不能以纯测试声称 GPU 适配体验 |
| pending 不是主题；single 每 UUID 一组；原仅列前六组 | S2 主题导览聚合 single、区分 pending、全部可访问 | impl 数量/未完成/序号/UUID 测试；根多组与独立点导航 |
| App 原 Ctrl K 清筛选、空间路径需保留筛选 | S3 `requestLocate` 和 SpatialNoteMap props | impl 原 graphFocus / recordNavigation 回归；根两来源实际操作 |
| 外观/宠物/日历正在并发修改 | 三包独占文件清单；S2/S3 最新小补丁 | 根 before/current 差量逐段审计；无法安全合并即 handoff |
| 3D 时间用创建时间，日历按天/月记录口径 | S2 模式文案、时间事实保持 | 根创建时间 / 记录时光 / 宠物入口现场；不增加日历状态 |

### 最小接口矩阵与闭环片段

| owner / 文件 | 输入 → 输出 | 消费方 / 兼容边界 |
| --- | --- | --- |
| S1 `src/graphView.ts` | `GraphModel` + `{scope, evidence, centerId}` → 新 `GraphModel` | 仅 NoteGraph；scope 为 `all / one-hop / two-hop`，evidence 为 `all / tags / text`；不改 GraphModel |
| S2 `src/spatialExplore.ts` | notes + 完整 `SpatialLayout` → `SpatialTheme[]`；完整布局 + `{ids, selectedId}` → 新 `SpatialLayout` | 仅 SpatialNoteMap；ids 为 `readonly string[] \| null`，null 表示全部；不重跑布局 |
| S3 `src/graphFocus.ts` | `LocateRequest` 增加 `local?: boolean` | absent / false 兼容旧请求；true 只要求二维一层范围；locator 状态机/返回协议不改 |
| S2 SpatialNoteMap props | `onOpenGraph(id?: string): void` | 有 id 是查看此条关联；无 id 是普通打开图；禁止将 click event 当 UUID 传出 |
| S3 App | `requestLocate(id, clearBlockingFilters, local = false)` | 空间选中调用 `(id, false, true)`；旧 Ctrl K `(id, true)` 和二维定位 `(id, false)` 保持 |

接口片段仅展示顺序和契约，不是近全文实现。来源锚点为 `graphFocus.ts:LocateRequest`、`App.tsx:requestLocate / SpatialNoteMap props`、`NoteGraph.tsx:shown / latest / locator`、`SpatialNoteMap.tsx:MapView layout / setLayout effect`：

```ts
// S3: optional field and caller distinction; existing locator remains unchanged.
type LocateRequest = { id: string; token: number; local?: boolean }
requestLocate(id, false, true) // selected space record, preserve shared filters
requestLocate(id, true)        // existing Ctrl K graph action
onOpenGraph={id => id ? requestLocate(id, false, true) : nav('graph')}

// S1: requested UUID wins before the old local range can hide it.
const effectiveCenter = locateRequest?.id ?? selectedId
const effectiveScope = locateRequest?.local ? 'one-hop' : scope
const shown = projectGraphView(projected, {
  centerId: effectiveCenter, scope: effectiveScope, evidence,
})
// On a local request token, adopt one-hop state; successful locator adopts UUID.
// Reconcile simulation from shown BEFORE locator retry; never consume early.

// S2: complete geometry/evidence first; scene only receives display projection.
const fullLayout = buildSpatialLayout(notes, projected, mode)
const displayLayout = projectSpatialExplore(fullLayout, { ids, selectedId })
owner.setLayout(displayLayout)
// Only an explicit theme / restore-all fit intent invokes fit after setLayout.
const relationCount = fullLayout.edges.filter(isIncidentToSelected).length
```

片段闭环充分性：请求来源和可选协议 → 新中心优先的投影 → 同源模拟先更新再 token 定位 → 三维完整/绘制职责分离与主题 fit 顺序均已覆盖。原 locator 的等待、latest token、卸载和 currentRecord 校验被保留，无需贴其完整实现。

## 3. 工作包与实施步骤

Gate-2 后 S1、S2、S3 由三个独立 impl agent 分别作为产品文件唯一 owner，可以平行；各包只改所列 owner 文件，不互改，也不递归委派。先接受上述接口合同再开工；构建必须根串行调度，避免多包同时写 dist/tsbuildinfo。root default canonical 只负责文档、验证、集成编排与 fresh 独立实施审查，不直接多源文件实施或代改产品代码；代码修订仍交对应 impl owner。任一修改后的新差量重新验证并复审。不存在数据库迁移步骤；新增状态均为会话展示状态，不持久化，无开关/schema 迁移。

### S1：二维局部证据阅读

- **目标/映射**：消费 G1、G3 与 A1/A2/A3。全图看匹配记录总览，当前一层/两层围绕当前选中逐条读依据。
- **owner 文件/首读锚点**：`src/NoteGraph.tsx` 的 shown/latest、reconcileGraph→locator.retry、picker/relations；新 `src/graphView.ts`、`src/graphView.css`、`tests/graphView.test.mjs`。不改 `styles.css`、graphGeometry、graphFocus；S3 负责可选字段。
- **目标形态**：一个纯投影加两个本地状态（scope/evidence），直接的中文按钮和范围数量；原 Canvas owner、会话 positions/camera、正文和业务回调保留。`NoteGraph` import `./graphView.css` 与 `projectGraphView`/`GraphScope`/`GraphEvidence`，新 CSS 类限定图视图。
- **步骤/边界**：① `projected = projectGraph(graph.model, 全部匹配 UUID)`；② `projectGraphView` 先筛边（tags 为 sharedTags 非空，text 为 similarity 非 undefined，混合边可同时通过两类），再按 center 做无向 BFS 一/两跳，最后保留该节点集合内符合类型的边。全图保留所有节点；局部保留有效中心，即使零边；无中心时禁用局部按钮并展示全图，文案提示先选择记录；明确请求存在但不在 projected 时不得回退旧中心来定位，等待原 locator 报 missing。③ 新外部 id 优先，local true 的一层状态在 token 变更时采纳，local absent 不重置用户范围/依据；模拟重建后再 retry，不能先报 missing。④ 画布、文字 picker、依据列表点选邻居共用 selectedId；新选中就是局部新中心，不能再新增固定中心。picker 仍列全部匹配 UUID；取消/筛选移除选择回到无中心全图。⑤ 显示当前范围节点/边数及匹配总条数，二层注明“当前筛选与依据中的两层关系”，不称完整知识/因果；适配按钮显示“适配当前范围”。选择/依据变化不自动飞镜头，主动定位继续走原 locator。
- **输入/输出边界**：纯函数不修改 model、nodes、edge.sharedTags 或记录；空模型/更新/error 的 pending 节点仍能显示。scope=all始终保留全部节点；局部centerId为空按无中心全图处理，非空却不存在则返回空nodes/edges，让明确请求由原locator报missing，不替换为旧中心。局部失效中心与新请求均不引入全局筛选副本。详情依据来自 shown，与画线一致，混合边保留真实两类说明。
- **作者体验/可读性**：2×3 小组按钮、aria-pressed、清晰范围说明，窄屏换行；标签事实/词面推断图例保留。新增规则集中纯模块与 shown 入口，避免将 BFS 塞进渲染循环或重构 D3 owner。
- **impl 自证（impl-safe）**：`node --test tests/graphView.test.mjs tests/noteGraph.test.mjs tests/graphFocus.test.mjs tests/graphGeometry.test.mjs`。覆盖链/环的一两跳、混合边双过滤、纯词面/纯标签、零边/空输入/无中心、同名不同 UUID、新中心覆盖旧中心输入、冻结输入及源证据不变；保留原 token/取消/坐标回归。原始完整 TAP/exit 保存 TEMP `impl-s1-tests.log`，摘要及未测写 `impl_report_s1.md`；缺输出/exit 仅未验证。
- **根承接/验收**：合成数据中全图→一层→两层→依据→邻居新中心；全体 picker 选局部外记录；筛选删除中心、更新/error、图内 Ctrl K 跳另一组、定位/编辑/删除原回调；浅深/390px、静态拖动缩放。证据落根 UI 记录/截图与 fresh test/build，不由 impl 现场操作或写真实数据。缺任一关键回路不写 G1/G3 已满足。
- **依赖/失败/回滚**：依赖 S3 字段合同，最终类型检查在合并后；纯测试失败先修本包，界面布局/投影问题回到本包，token 原流程不改。需要回滚时仅撤本轮 NoteGraph 小补丁与新模块/样式/测试，不 restore 整文件或外部改动；无法保留并发差量时 handoff。
- **片段判断**：必填；上述 effectiveCenter→shown→reconcile/retry 顺序已给，覆盖修改分支/优先级；不删除整条函数链。

### S2：三维主题探索与积累轨迹

- **目标/映射**：消费 G2、G3 与 A1/A2/A3。主题空间用于发现主题与记录，积累轨迹用于长期创建时间回顾；详情只给正文/事实/总数及进入二维的阅读入口。
- **owner 文件/首读锚点**：`src/SpatialNoteMap.tsx` 的 MapView projected/layout、scene latest/create/setLayout、summary/groups/detail、原 appearance section；新 `src/spatialExplore.ts`、`src/spatialExplore.css`、`tests/spatialExplore.test.mjs`。不改 `spatial.css`、spatialLayout、spatialScene、spatialModels、spatialAppearance/外观枚举、PetShowcase 或角色接线。
- **目标形态**：`fullLayout` 保有共享筛选全集的节点/证据/degree，`displayLayout` 是只给 scene 的浅层展示投影；主题导览和观察窗从 fullLayout 读事实。SpatialNoteMap import `./spatialExplore.css` 与 `buildSpatialThemes` / `projectSpatialExplore` / `SpatialTheme`。主题状态只在 MapView，不新增 App 全局筛选。
- **纯模块接口**：`SpatialTheme = { key: string; label: string; kind: 'tag'|'text'|'single'|'pending'; ids: string[]; count: number; unfinished: number }`；`buildSpatialThemes(notes: readonly Note[], layout: SpatialLayout): SpatialTheme[]`。tag key 保留原 group、正文组 key 保留 text UUID 并按完整布局稳定 group 顺序命名“词面分组 1…”；所有 single:* 合并 key `independent` 的“独立记录”，ids 不合并/丢失；pending 单列“关联待更新”，不冒充已推断主题。计数基于当前共享筛选的全部匹配节点，unfinished 以同 UUID 的 note.done 为准。
- **步骤/边界**：① buildSpatialLayout 仅针对全部匹配 notes/projected 构建，不把减量边或主题 notes 输入此函数。② 全部主题可访问，显示条数/未完成；多项容器限高滚动、按钮 aria-pressed，长名换行。点击主题选 ids，显示“该主题 N / 匹配总数”并通过布局 effect 在 setLayout 后 fit；“全部主题 / 适配全部”先恢复 ids=null 再 fit。③ `projectSpatialExplore(fullLayout,{ids,selectedId})` 裁节点但复制其 x/y/z/degree/done/date 原值，不重排；nodes 为空则 center=0/radius=90，否则按原 AABB 中点与最大距离+22、最小90重算 bounds。groups 为现有节点 group 的原顺序子集，timeRange 保留完整布局口径以符合未改的创建时间坐标。无选中时 edges=[]；有选中只保留 fullLayout 中 incident 且两端在显示节点内的边，复制 sharedTags；不修改完整布局。④ 主题范围隐藏当前选择时清空选择；全体文字 picker 保留全部匹配记录，若选择不在当前主题内，恢复全部范围以显示 UUID，选择本身不触发 fit/飞镜头，明确“定位”按钮仍可用。无效主题 key（更新/筛选移除）回全部、失效 UUID 清空；pending/error 用原提示/重试，不沿用旧关系。⑤ 保留完整正文、安全渲染、标签、created/done/pinned 事实；关联总数从 fullLayout 的 selected incident 边算，说明“当前筛选内的关联”，移除逐条列表，增加 `onOpenGraph(selected.id)` 的“查看此条关联”；原编辑/定位保留。无参数普通图入口/失败入口必须 `() => props.onOpenGraph()` 包裹。
- **舒适度与原配置**：relations/time 中文分别“主题空间 / 积累轨迹”，模式对应说明直接交代用途；pet 分支与角色名称原样保留。MapView paused 初始 true，按钮“开启动态 / 暂停动态”，继续满足 motionAllowed/visible/businessEnabled policy；不新增 RAF。仅把原模型与氛围 section 包在默认闭合 details/summary，保留 draft、全部形状/背景/光晕/流光、预览/应用/撤销/恢复与保存结果；外观变化不触发 theme fit 或选择清空。时间事实、未知时间区、时间轴与维度说明保留，说明按天查记录使用记录时光；不加日期网格或计划状态。
- **作者体验/可读性**：图前导览与用途说明、完整正文稳定旁栏、独立 CSS 命名空间；纯派生模块中明确 full/display 名字，不能把关联总数取自 display edges。不在 scene 引入主题业务或外观条件。
- **impl 自证（impl-safe）**：`node --test tests/spatialExplore.test.mjs tests/spatialLayout.test.mjs tests/spatialRuntime.test.mjs tests/spatialAppearance.test.mjs tests/spatialModels.test.mjs`。覆盖 tag/text/single/pending、全组计数与未完成、空/未知时间/同文 UUID；冻结完整布局后主题投影的坐标/degree保持、bounds 包围、恢复全部等价节点、无选中零边/选中仅 incident/跨主题边裁剪、完整证据不变、既有外观/实例 UUID/资源/policy 回归。完整 TAP/exit 保存 TEMP `impl-s2-tests.log`，摘要及未测写 `impl_report_s2.md`；缺证据仅未验证。
- **根承接/验收**：全部→不同主题→独立记录→恢复全部，实际镜头覆盖、默认静态/开启动态与仍可操作；选中仅相关线、完整总数与正文、跨主题 picker/定位；创建轨迹/未知时间；details 初始闭合、所有外观预览与应用保持镜头选择；宠物/记录时光入口保持，浅深与390px。根合成浏览器现场/截图承担遮挡舒适度；impl 不能宣称 GPU/原生/耗电实测。缺关键现场仅 G2/G3 未验证。
- **依赖/失败/回滚**：依赖 S3 App 的可选 UUID callback，scene API 不扩展。scene失败仍保留 picker/正文/编辑/二维 fallback；范围空显示解释与恢复全部。回滚仅最新文件本轮导览/投影/文案/details外包/回调小补丁及新文件，保留原配置与 pet 实现；出现无法安全合并的外观变化交根，不自行删回。
- **片段判断**：必填；已给 full→display→setLayout→明确 fit→完整计数闭环；删除仅旧逐条依据 JSX，无整条函数链或≥50行专用逻辑删除。

### S3：独立第三 impl owner 的 UUID 接线与根收口

- **目标/映射**：消费 G1/G2/G3 与 A1/A2/A3；由独立第三 impl agent 作为 App/graphFocus 产品接线及 graphFocus tests 的唯一 owner，在最新文件做最小兼容补丁，跨图使用同 UUID，不改旧业务。root仅编排集成、文档与验证，不代改此包代码。
- **owner 文件/首读锚点**：第三 impl agent：`src/graphFocus.ts:LocateRequest`；`src/App.tsx:requestLocate / SpatialNoteMap onOpenGraph`；`tests/graphFocus.test.mjs` 的旧请求与 token 案例。根文档 owner：`README.md`、`CHANGELOG.md`、`docs/Project.Progress.md`、`docs/Note.Graph.md`、`docs/Spatial.Experience.md`；feature README 状态及最终 impl/review 记录。三个 impl 包均不写这些根文档，各自产品 owner 文件不互改。
- **步骤/目标形态**：① 第三 impl 添加可选 local 字段及 requestLocate 第三个默认 false 参数；保留 currentRecord(notesRef) 校验、clearBlockingFilters、token递增、finishLocate 最新 token。② 第三 impl 在 App 的 SpatialNoteMap callback 有 id 调 `(id,false,true)`，无 id 调 nav；Boundary 普通 fallback 保持无参数。原 Ctrl K/原二维 detail locate 的两个参数不变，无清筛选反向回退。③ 根合并编排后串行类型/build与独立全量 test，逐段核对 before/current 差量，发现代码问题交原 impl owner 修订。④ 根当前事实文档写清两图用途、范围/依据及稀疏边口径、主题坐标/总数、日历分工、静态默认与外观可展开；保留并发段落、原版本失败与未测，不声称已发版/原生安装验证。
- **作者体验/可读性**：沿用已有 requestLocate 入口，新增字段可选/默认兼容，参数用途有英文简短注释；不抽象导航平台。面向使用者文档只写可用动作，测试/设备边界写进进度/证据，编辑和存储语法不暴露给用户。
- **impl 自证（impl-safe）**：`node --test tests/graphFocus.test.mjs tests/recordNavigation.test.mjs`，保留未带 local 的旧请求行为并增加带 local 的请求仍按相同 token 等待/最新/消费/卸载路径案例；不以源码字符串匹配替代行为测试。完整输出/exit 保存 TEMP `impl-s3-tests.log`，报告写 `impl_report_s3.md`；最终类型与构建由根串行承担并在报告区分责任，缺证据仅未验证。
- **根承接/验收**：独立 `npm test` 与 `npm run build` 本轮 fresh 完整日志/exit；同最终差量的实际 UI 回路“空间主题→记录→查看此条关联→二维一层相同 UUID→编辑”，共享 query/tag/unfinished 保持；图内 Ctrl K 跨旧局部中心正确清筛选/定位，快速替代请求/删除/latest-record/关闭弹层保持。UI 用独立合成数据，不写真实用户库；当前原生、多设备、长时GPU/耗电/触屏/读屏保留未测。fresh reviewer 使用 before/current 差量、原始日志、截图与本文独立审查；缺现场或 fresh review 不宣布总体完成。
- **依赖/降级/回滚**：S1/S2 可依合同并行，S3 不改它们实现，根统一收口编排；有 id 不可用由原 toast与token错误回路解释，无 id 保留全图入口。必要时由第三 impl owner 撤本轮 App 两处与可选字段补丁，根同步文档当前状态，保留并发新增接口。禁止整包提交/推送或构建覆盖并发 EXE；提交须根额外判断本轮独立差量与授权范围，不由包自行提交。
- **片段判断**：必填；可选字段与两个来源的请求片段已给，原协议状态机无改动；无函数链删除。

## 4. 证据、风险与失败分流

TEMP 根：`C:/Users/ZXL/AppData/Local/Temp/qingjian-view-purpose-20261005`，输入 `before` 与 manifest 276项为本轮差量基准，不能用混合 HEAD 替代。impl 报告只放本包文件、实际命令/exit、失败与未测；根在 TEMP 留最终 after manifest、raw test/build 日志、UI 记录并在本聊天 visualizations 目录留截图。review 必须绑定同一 final SHA 集合，文档将命令/纯行为证据与现场/设备结论分开；任一证据不足只可标未验证/待 handoff。

| 风险 / U | 收口责任与失败处理 |
| --- | --- |
| U1/U5：遮挡、390px舒适度、镜头、GPU/原生/长期资源 | 根现场检查上述回路并截图；本轮未承诺的广泛设备与耗电仍未测，不能用构建关闭 |
| U2：范围/依据最终规则 | 本方案 BFS/混合证据/无中心/计数规则锁定，S1纯测试+根现场；不额外新增关系算法 |
| U3：减少画线与完整依据 | full/display明确分离，S2不改degree/coords且总数读full；失败回S2纯模块修补，不改scene接口 |
| U4：与日历分工 | readiness已读真实Record实现；只创建时间空间回顾，不复制日历网格/计划/统计 |
| U6：主题聚焦空间连续性与适配 | 复用已派生坐标+重算bounds+显式fit；纯非变异测试与根实际镜头缺一则对应结论未验证 |
| U7：共享文件继续变化 | 每次修改前重读最新与snapshot差异；保存对方区块。发现不兼容接口先留痕交根重算基线，再补审，不覆盖回滚 |

新假设/风险/阶段切换的即时对齐留痕位置为本节“事件对齐记录”，根同步 clarifications 后决定是否重开 readiness/Gate。当前无新增阻断假设；已有 U 点分别被具体契约或根验证承接。已见命令失败保留：根误读不存在的 tests/spatial.test.mjs exit1；调研/评审 Windows glob rg exit1，之后修正命令exit0；读取批量输出曾截断后已补读。Node stripTypeScriptTypes ExperimentalWarning 保留；均不是新产品测试结论。

### 事件对齐记录与批量委托模板

- 2026-10-05：规划落地 full/display 与新UUID优先、local可选兼容，均为基线细化，无基线漂移；LW→Review(LW) 由根收到 Gate-1 后执行，进入 impl 仍需 Gate-2。
- 2026-10-05：根明确 default canonical 的实施主体：S3 产品接线与 graphFocus tests 改由独立第三 impl 唯一 owner；根仅文档/验证/集成编排。接口、文件、目标、验收均保持，本轮仅修订执行责任，Gate-2读取最新稿。
- 本轮未触发 DELEGATE_QUESTION：没有新增范围/验收/回滚的歧义，接口已可确定且符合最终基线。后续同时出现阻塞时按 P0阻塞、P1高风险、P2优化一次批量发送，不能自行扩大范围；补充调研使用 DELEGATE_ACTION，禁止递归派研究。

```text
【DELEGATE_QUESTION】
需要用户确认：Q1 [具体范围/约束/验收/回滚问题]
优先级：P0 | P1 | P2；影响阶段：LWPlan | Review(LW) | Impl
A) [推荐项及一句原因]
B) [权衡项及一句影响]
请一次性回复：Q1=A, Q2=B ...
```

无需新降级开关或停机：均是可逆展示小补丁，既有图错误的pending节点、3D失败文字/二维入口是降级路径。若纯测试/build失败，先保留完整日志并修对应包；若实际UI失败，禁止用静态结果代替，修后重复相关现场和fresh review。回滚以输入快照和逐段补丁恢复本轮结构，不执行 git restore/reset/clean。

## 5. Gate-1 与 Gate-2

Gate-1 由 LW planner 在本文落盘后按存在性自检；无“至少任务数”门槛。失败不得交付可进入实施；Gate-2 由 fresh review_plan 主检、根全文复核，在 PASS 前禁止改产品源码；失败走 LW→Review(LW)修订，口径不唯一先批量 DELEGATE_QUESTION。若新实现契约/并发事实改变先回写基线，不静默绕过。

| Required Set 自检 | 本文锚点 / 判定 |
| --- | --- |
| 目标锁 / 反目标 / 不影响项存在且三包消费 | §1、S1/S2/S3 映射；已落盘 |
| 受影响文件、首读章节/函数、目标结构与任务步骤 | §2接口矩阵、三包owner/首读/步骤/目标形态；已落盘 |
| 每包验收、依赖、失败/降级、回滚 | 三包责任与回滚、§4；已落盘 |
| impl-safe与根非impl-safe验证分层 | 三包impl自证/根承接；已落盘 |
| 证据产物 / 责任归属 / 证据不足约束 | 三包日志/报告/结论约束及§4；已落盘 |
| 作者体验门证据 | 纯入口与独立CSS结构、三包可读性与根浅深/390px现场清单；计划证据已提供，产品证据待实施 |
| 核心链路 / research映射 / 最小片段闭环 | §2完整；已落盘 |
| T2模块输入输出/边界、测试分层/回归范围 | 接口矩阵、S1/S2纯函数和三包回归；已落盘 |
| T3依赖接口矩阵、兼容/迁移/降级与协议字段 | §2 local optional、无数据迁移、§3/§4降级；已落盘 |
| 双阶段执行主体、时机、失败回退 | 本节；已落盘 |
| 澄清/批量优先级/事件对齐模板及未触发原因 | §4；已落盘 |
| 风险缓解及 Gate-2 复核口径 | §4、本节下段；已落盘 |

Gate-2 必须顺读 App 唯一数据→二维当前UUID优先→范围证据同源→原token消费，以及三维完整布局→主题投影/显示边→bounds/fit→UUID→二维的闭环；逐包复核 owner边界、函数/字段/目标形态、代码片段触发充分性、impl/根证据职责与作者体验门，不能只数章节。特别复核不存在修改scene/models/日历/宠物/存储/版本的实施任务，没有把无UI证据写成验收。

Gate-1 自检结论：Required Set 存在性满足；只可进入独立 Review(LW)，不等于 Gate-2 或产品验证通过。方案文件与锚点验证的本轮原始命令/exit由planner交接给根，根核读本文全文后继续正式链。

## 6. G3 现场视觉收口（增补，保留初稿及已实施支撑）

#### 本轮修订说明

[修订: PLAN_DEFECT] 本节消费 `clarifications.md` 的“实施期现场补充：阅读遮挡”，补充 §1 G3 与 §3 S2/S3，不改变接口、数据或功能架构。前文“未实施”是初稿时态；当前三个工作包已有实施报告，初版 Gate-2 PASS（SHA `010B1CC29720AB67FB53E9A1F9E4A4EB862F733E1EBB37ED3C240387BF78B63E`）的正文与已实施支撑均保留。原范围继续根验证，仅新增下述 App 政策补丁等待原独立 Gate-2 补审。

[修订: PLAN_DEFECT] **保留已见现场失败**：2026-10-05 根在 1265×713 浏览器看到二维右下浮层宠物覆盖正文、定位与部分关联依据；三维新主题导览过高，图主体被挤到首屏下方。纯测试与已有构建结果没有关闭这两项 G3 舒适度不足。S2 仅由原 owner 收紧自己的新导览 CSS，所有主题仍可滚动访问，数量/未完成/动作/外观能力保持；已见 `impl_report_s2.md` 补实施 r2，但效果仍待根现场复测，不将 CSS 参数写成体验已验收。

[修订: PLAN_DEFECT] **S3 唯一当前实现锚点**：第三 impl owner 只在 `src/App.tsx:249-251` 的既有 `<PetCompanion>` `hidden` 视图谓词加入 graph。实际 `visible={pageVisible}` 不改；不修改宠物组件、角色、行为、偏好、shown/onHide，记录页浮层与空间大展示继续保留。这是 G3 阅读区域不遮挡的显示政策，与 settings/space/garden 现有排除方式一致，无新增接口/状态/存储。关键分支比对仅此一处：

```tsx
// src/App.tsx: PetCompanion hidden policy; all other props stay unchanged.
// Before:
hidden={view === 'settings' || view === 'space' || view === 'garden'}
// After:
hidden={view === 'settings' || view === 'space' || view === 'garden' || view === 'graph'}
```

[修订: PLAN_DEFECT] **验证、作者体验与证据职责**：S3 impl 保留原协议回归、核对最新 App 单处差量并在本包报告记录，不增加映射这行谓词的镜像测试，不执行浏览器现场；根对最终源码 fresh test/build，并以同 1265×713 与 390px、浅深主题实际确认二维全文/定位/依据可读且可点、主题导览可滚动且图主体恢复首屏可见。根还复核记录页原浮层显示与原关闭偏好、space/garden/settings 既有政策和空间大宠物展示保持。截图/原始日志归既定 TEMP 与 visualizations；缺相关现场只能标“视觉收口未验证”，不能用纯测试声称遮挡修好。规则留在现有 App 视图入口，避免把笔记阅读业务放进宠物组件，保护其并发可读性与作者职责。

[修订: PLAN_DEFECT] **回滚、依赖与 Gate**：S3 政策依原独立 Gate-2 对本增补 PASS 才执行；S2 在原 owner 独占 CSS 范围内收紧不扩大功能。若复测失败交对应 owner 最小修订，根不代改代码；需要回滚时只由 S3 owner 撤 `|| view === 'graph'`，或由 S2 owner 撤本轮收紧片段，保留已实施图能力与并发宠物/日历成果。root 更新 final SHA/失败留痕并承接 fresh 实施审查。Gate-1 本轮追加核对修订标签与说明、已实施支撑未删、单处 App 分支/owner/验收/证据不足/回滚齐备；Gate-2补审必须核对该片段实际对应 hidden 而非 visible 生命周期。无阻断歧义，无新增用户审批或递归委派。
