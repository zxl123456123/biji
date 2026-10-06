# 十二个月记录年轮：低层实施计划

2026-10-06。输入为本目录 `clarifications.md` 的完整实现基线、`hlplan.md`、`research.md` 和 `review_notes_readiness_2.md`。本文件是待实施计划，不表示代码或设备验收已经完成。任务分型为 T3：跨 `App`、卡片入口、纯模型、Three.js 场景、文字导航与文档。readiness 已通过；其中“年份导航”仅落实为**入口笔记创建年份标识与该年 12 个月导航**，不得扩成跨年浏览。

## 1. 范围与对齐

**目标锁 L1**：单条未删除记录的可选入口；以其创建年份的 12 个真实月份、365/366 个有效日期格和本地真实记录组成可核查年轮。**L2**：同心层、环间差速、平面/立体往复、日期聚焦、有限光晕；可暂停且文字路径始终可操作。**L3**：仅消费现有 UUID、创建日期和 `useNoteGraph` 的直接边；点记录走原编辑流程；不改正文、顺序、备份或网络边界。

**反目标 N1**：无术数/卦象/算卦。**N2**：不让空日或日期距离伪装成语义关系；没有虚构记录。**N3**：不复制原项目的逐格独立贴图、常驻 60fps 或无 owner 的全局指针监听。**不影响项**：`NoteComposer` 的序列化、`Note`/SQLite/备份 schema、现有关联算法和排序、原有记录筛选均保持；不修改 3D 空间场景为通用轮盘引擎。仅新视图读取全部未删除记录，因此当前搜索/标签筛选不裁剪年轮。

兼容：旧库没有年轮字段，本功能完全派生，零迁移。当前工作区已有大量非本功能未提交变更；实施时先保留现状快照，编辑共享文件只触碰本功能片段，不清理或覆盖他人变更。

## 2. 核心链路总览

现状：`App` 的 `notes` → `activeNotes` / `visibleNotes` → `NotesView` 每批最多 60 张卡片；`useNoteGraph` 只在 `graph`/`space` 激活；`editLatestNote(id)` 打开原 `NoteComposer`。本轮：卡片按钮传 `id` → `App` 校验 `currentRecord` 并设置 `wheelEntryId`；`view='all'` 且 `NotesView` 保持挂载，宽幅模态覆盖层打开 → 以**全部** `activeNotes` 和入口 `createdAt` 生成单年纯模型；图谱只在覆盖层活跃时开启 → 懒加载 `CelestialNoteWheel`，其场景和文字清单读同一日期模型、共用选中日期 → 清单中的 UUID 经 `App` 当前记录校验、关闭模态后由现有 edit handoff 打开原编辑器。关闭仅卸载覆盖层，原筛选、分页和滚动自然保留；模态恢复焦点至入口按钮。若入口记录变为回收站或被导入覆盖，关闭覆盖层并提示失效。

分层理由：日期与邻居归属是可测试业务模型；React 持有选择和导航；Three.js 仅把稳定日期键映射到格位与动画。WebGL 失败时不能损失日期或 UUID 路径。关系未 ready 时依然有完整日期清单，绝不沿用过期模型。

### research 事实映射

| 已核对事实 | 实现锚点 | 验证锚点与口径 |
| --- | --- | --- |
| 卡片每批 60 条、`visibleNotes` 受筛选 | `NotesView`/`App`；wheel 取 `activeNotes` | 模型测试及界面用 >60 条与筛选核对全年总数；coordinator 人工复核 |
| `buildRecordGardenModel(notes,'created')` 处理删除、非法 civil date 和本地日期 | 新 `celestialWheelModel.ts` 调用该函数、`monthDays` | 闰年、月底、时区跨日、非法日期、回收站测试；不得改写日期语义 |
| `GraphState` 用 key 防旧关系外露，边为 `source`/`target` | `App` wheel 启用 graph；模型从 `ready` 且当前模型中取一跳 UUID | updating/error 时零关联标记，ready 时恰等于中心直接边；不得按同日推断 |
| 空间使用 `createSpatialScheduler`、`spatialPixelRatio`、独立 scene owner | 新 `celestialWheelScene.ts` 复用预算函数和生命周期模式 | scheduler/拾取映射测试；coordinator 观察暂停、失焦、重开与资源 |
| 原作 MIT、十二环与相机变化；本项目已有 Three.js | 独立懒加载组件、场景；文档写借鉴来源 | 视觉人工核对 12 环及四个关键动作；无逐格资源 |
| `NoteComposer` 是原编辑入口，内容是受限文本 | `App.editLatestNote(id)`；中心预览用 `plainNoteText` | 点击 UUID 回原编辑、正文和备份不变；静态源码/运行观察 |

### 主链片段闭环

以下四段目标伪码覆盖「入口 UUID → 有效年份/日模型 → 图谱一跳 → 稳定拾取 → 原编辑」的关键状态分支；工作包再细化清理、文字回退和证据。片段为实现约束，不要求逐字照写。

```ts
// App.tsx: card -> modal overlay; currentRecord is checked again on every record action.
const openWheel = (id: string) => {
  if (!currentRecord(notesRef.current, id)) return show('这条记录已不可用')
  setWheelEntryId(id) // keep view === 'all' and NotesView mounted
}
const graph = useNoteGraph(activeNotes, view === 'graph' || view === 'space' || !!wheelEntryId)
// wheel receives activeNotes, never visibleNotes or NotesView.shown.
```

```ts
// celestialWheelModel.ts: stable business key and no invented relation.
const center = activeNotes.find(note => note.id === entryId)
const key = center && buildRecordGardenModel([center], 'created').days.keys().next().value
if (!key) return { kind: 'undated', center } // no guessed current year
const year = key.slice(0, 4)
const garden = buildRecordGardenModel(activeNotes, 'created')
const neighborIds = graph.status === 'ready' && graph.model
  ? new Set(graph.model.edges.flatMap(edge => edge.source === entryId ? [edge.target] : edge.target === entryId ? [edge.source] : []))
  : new Set<string>()
const months = [1, /* ... */, 12].map(month => monthDays(`${year}-${pad2(month)}`, garden)
  .map(day => ({ key: day.date, noteIds: (garden.days.get(day.date) ?? []).map(n => n.id),
    count: day.count, relatedIds: (garden.days.get(day.date) ?? []).filter(n => neighborIds.has(n.id)).map(n => n.id) })))
```

```ts
// celestialWheelScene.ts: 12 ring groups; local per-ring instance indices never change with motion.
ringGroups = months.map((days, monthIndex) => {
  const slots = days.map((day, dayIndex) => ({ key: day.key, angle: 2 * Math.PI * dayIndex / days.length }))
  return { group: new Group(), mesh: new InstancedMesh(sharedGeometry, sharedMaterial, days.length), slots, monthIndex }
})
// Each frame changes group transforms; mesh local matrices and slots stay paired.
const hit = raycaster.intersectObjects(ringGroups.map(r => r.mesh), false)[0] // nearest visible surface
const ring = ringGroups.find(r => r.mesh === hit?.object)
if (ring && hit.instanceId !== undefined && isClickWithoutDrag) onSelectDate(ring.slots[hit.instanceId].key)
// Text month/day button invokes the same onSelectDate(key).
```

```ts
// CelestialNoteWheel.tsx: date selection is stable while visual rings move.
const selectedDay = model.daysByKey.get(selectedDate)
selectedDay?.noteIds.map(id => <button onClick={() => onOpenNote(id)}>打开记录</button>)
// App.onOpenNote validates id, closes Modal, then createEditHandoff.open(id) opens original composer.
```

## 3. 详细设计与工作包

### S1 — 纯派生日期与关联模型

**目标与接口**：新增 `src/celestialWheelModel.ts`，导出 `buildCelestialWheelModel(entryId, activeNotes, graphState)`，返回 discriminated union：`missing`、`undated`、`ready { year, months[12], daysByKey, centerId, relationStatus }`。日期格字段为稳定 `YYYY-MM-DD`、`count`、`noteIds`、`relatedIds`；关联状态来自图谱 `idle/updating/ready/error`，不能把 `null` 模型解释成“无关联”。入口 `createdAt` 无效则 `undated`，文字页说明并仍可打开入口记录；不猜年份、不生成十二圈。入口缺失则由 `App` 退出。每月日期来自 `monthDays`，月份索引固定一至十二；年份只取入口创建时间的**本地创建日**，不取 `scheduledDate`，不跨年浏览。创建日期异常的其他记录落在 `undated`，不会被某个月误收纳。`graph.model.edges` 仅中心直接边，双方任意方向均计入；只有 `ready` 才输出强调，删除记录的 UUID 即使边残留也不得显示。

**锁映射**：消费 L1/L3、N1/N2；L2 由模型的稳定日期键支撑，视觉实现留给 S4；不触碰 N3 所限场景资源。

**关键锚点**：`src/recordGardenModel.ts:20-35,43-51` 是合法日期/闰年/本地归组依据；`src/noteGraphModel.ts:5-7` 是边契约；`src/useNoteGraph.ts:109-126` 是状态时效契约。目标结构是一个无 Three/React/持久化依赖的模型。上述主链片段已给出；这里的关键早退分支需按片段落地。作者体验：显示“入口笔记创建于 YYYY 年”“全年全部未删除记录”；关联可解释为“本地关联图中的直接关联”，避免暗示因日期近而相似。

**依赖/执行**：无前置；先写纯模型和数据测试，再接 UI。**验收**：平年 365、闰年 366；2 月 28/29；空日 `count=0` 且无 UUID；同日多条数量正确；跨时区日期与现有 `recordGardenModel` 一致；非法入口无年份；回收站无记录；direct neighbor 唯一正确；图谱更新/错误无过期标记。**回滚**：删除仅新模型及其测试，不更改既有日期或图谱函数。

**验证责任与证据**：impl 运行 `npm test` 中本模型相关用例或项目现有 test 命令及 `npm run build`，在 `impl_report_r1.md` 写命令、退出码和完整失败，`verification.md` 记每个数据用例结果；证据缺失即“未验证”。coordinator 独立复跑并用真实包含非法时间/回收站的样本核对日期计数，证据写 `verification.md`；真实设备体验不属于 impl-safe，未测不能写通过。

### S2 — 单条卡片入口、宽幅模态与原编辑导航

**目标与接口**：`src/NotesView.tsx` 的 `NotesViewProps`/`NoteCard` 增 `onOpenWheel(id)`，仅未删除卡片操作区提供明确“查看记录年轮”按钮，沿用 `SoftButton`、键盘焦点和操作区布局，不把入口放入正文。`src/App.tsx` 仅增临时 `wheelEntryId`，只允许在 `view==='all'` 打开；`view` 始终为 `all`，`NotesView` 持续挂载，局部 `limit` 与 `.workspace` 滚动位置自然保留，**禁止**提升 limit 或建立滚动快照/恢复状态。`App` 用 `currentRecord(notesRef.current,id)` 验证入口/选择/打开，`graph` enabled 条件加 `!!wheelEntryId`，向懒加载覆盖层传 `activeNotes`、图谱、主题及动态许可；只关闭/卸载覆盖层，不更改查询、标签、未完成筛选。任何主导航切换先清空 `wheelEntryId`。入口被删除或导入覆盖时关闭并提示。选中清单 UUID 时先关闭覆盖层并调用既有 `createEditHandoff.open(id)`，让 Modal cleanup 先恢复入口焦点，下一帧重新校验 UUID 后打开原 `NoteComposer`；不产生新编辑器。直接同步调用 `editLatestNote` 会与 Modal cleanup 争焦点，故不用于这条 handoff。
`sortingEnabled/businessEnabled` 对背景记录页额外合并 `!wheelEntryId`，防止模态覆盖时排序与卡片操作；传给年轮场景的交互许可单独由可见/焦点/上层弹层推导，不复用这个背景禁用值，否则模态内部也无法拾取日期。

覆盖层复用 `src/Modal.tsx` 的 Tab 焦点陷阱与卸载焦点恢复；只给 Modal 加可选 `className` 传给 `modal-frame`（如 `celestial-wheel-frame`），CSS 设近全屏宽高并保留手机安全边距，避免默认编辑器弹窗的狭窄宽度。打开前的 `document.activeElement` 即卡片按钮；关闭时原卡片仍挂载，Modal cleanup 恢复该按钮焦点。覆盖时给主导航、顶部工具条、记录工作区等背景容器设 `inert`/`aria-hidden`，背景不能键盘聚焦、点击或拖拽排序；模态 backdrop 拦截指针，Modal 自身仍可操作。若入口已删除且按钮不再连接，Modal 焦点恢复无效，此时关闭后由 `App` 聚焦记录标题或安全的“记录”导航，不能落在消失节点。`App.tsx:106-119` 的 Escape 顺序明确为 composer → quickOpen → AI → tagPicker/todoReminder 等更上层弹层 → wheel；只在没有上层弹层时关闭 wheel，按键只处理一个顶层对象。Modal 只处理 Tab，Escape 仍由 App 统一 owner 处理。

```tsx
// App.tsx: NotesView stays mounted; apply inert to existing background containers.
<header className="workbench-header" inert={!!wheelEntryId} aria-hidden={!!wheelEntryId}>{/* existing nav */}</header>
<section className="workspace" inert={!!wheelEntryId} aria-hidden={!!wheelEntryId}>{viewContent}</section>
{wheelEntryId && <Modal className="celestial-wheel-frame" title="记录年轮" onClose={() => setWheelEntryId(null)}>
  <Suspense fallback={<p role="status">正在打开记录年轮…</p>}><CelestialNoteWheel /* activeNotes, graph, policy, UUID actions */ /></Suspense>
</Modal>}
// In Escape handler, after all higher overlays: else if (wheelEntryId) setWheelEntryId(null).
// On record choice: setWheelEntryId(null); editHandoff.current?.open(id).
```

**锁映射**：消费 L1/L3 与 N2；L2 的大画布留给 S3/S4；N1/N3 由入口不引入术数或场景逻辑保护。

**关键锚点**：`src/App.tsx:35,106-151,184-190,246-255,285`；`src/NotesView.tsx:12-29,48-63`；`src/Modal.tsx` 焦点陷阱/恢复；`src/recordNavigation.ts:currentRecord/createEditHandoff`。目标结构是 `App` 为唯一导航 owner，`NotesView` 不卸载，wheel 仅发 UUID；上节 App 伪码及本段 Modal→handoff 顺序是目标片段。作者体验：卡片操作可发现、不会触发排序拖动；关闭回原筛选和滚动位置，焦点回原入口；删除/失效有明白提示；在轮盘中看记录不会修改正文。

**依赖/执行**：依赖 S1 输出契约；先接入口和宽幅静态模态，再挂 S3/S4。**验收**：三种卡片排版的活跃卡片可打开，回收站无入口；筛选和 60 条分页不改变年轮全量；打开前已“加载更多”并滚动时，关闭后显示数量、滚动与焦点均保留；模态背景不可操作；Escape 一次只关闭最上层；打开当天 UUID 进入相同原编辑器；删除/导入覆盖无幽灵中心。**回滚**：移除 wheel state、模态调用、Modal 可选 className 和卡片回调，不改源数据。影响为前端 UI，无 schema 迁移。

**验证责任与证据**：impl 做组件/导航测试和 `npm run build`，记录每条路径的命令/输出、失败；能运行的浏览器界面截图/操作结果写 `verification.md`，不能运行则未测。coordinator 在实际 UI 复核三排版、筛选恢复、原编辑和键盘/Esc，并独立复跑关键命令；Windows WebView/触摸由 coordinator 承接，缺设备逐项写未测和承接人。

### S3 — 独立懒加载视图、文字导航与降级

**目标与接口**：新增 `src/CelestialNoteWheel.tsx` 与 `src/celestial-wheel.css`，由 `App` `lazy(() => import(...))` 并以 `Suspense` 在宽幅 `Modal` 内展示加载状态。React 组件从 S1 模型生成中心摘要、年份只读标识、12 个**该年**月份按钮、选中月有效日期的文字按钮和选中日真实记录清单；`selectedDate` 是唯一选择状态，场景和文字按钮调用同一 `onSelectDate`。日期按钮语义包含月份/日、记录数、是否有直接关联；记录按钮显示由 `plainNoteText` 派生的安全短预览与标签/关系说明，不 `dangerouslySetInnerHTML`。空日明确“当天无记录”；`undated` 入口说明时间不可解析并提供“打开原记录”“返回记录”；图谱更新/错误的文字状态准确，不显示旧关联；`graph.status` 从 ready 变 updating 时，同一次模型更新令场景与文字立即清除关联强调。WebGL 不支持、初始化失败、context 丢失时保留完整文字导航和重试场景按钮；无 WebGL 时不把文字视图隐藏。

**锁映射**：消费 L1/L2 的静态可操作路径、L3、N1/N2；N3 通过独立懒加载/失败回退约束场景归属。

**关键锚点**：`src/SpatialNoteMap.tsx:75-109,155-188` 的 owner/fallback 模式；`src/noteText.ts` 的纯文本预览；`src/styles.css` 的全局主题与 `.content` 布局。目标形态是左/中央大画布与始终可操作的文字日期/记录区域，视觉层卸载不影响选择。上节 `selectedDay` 片段已覆盖共享选择，余下组件布局文字足够。作者体验：默认可读、有明确范围、焦点顺序“返回→月份→日期→记录→暂停”；窄屏线性排列；浅深色对比度；减少动态时不出现自动姿态转换。样式只用本 feature 命名空间，避免污染现有卡片/空间 CSS。

**依赖/执行**：依赖 S1/S2；先实现文字路径，之后附加 canvas。**验收**：禁用 WebGL、仅键盘、空日期、未就绪关系、非法日期入口、窄屏均可从月份到日期到原记录；年标识不可点击切换跨年；场景选择与文字选中同步。**回滚**：移除懒加载组件和专用 CSS、S2 的调用口，不动记录。

**验证责任与证据**：impl 的组件测试覆盖标签/状态/键盘回调，运行 `npm run build`，在可用浏览器检查禁用 WebGL 的路径；日志和截图/观察写 `impl_report_r1.md`、`verification.md`，缺观测写未测。coordinator 用真实浏览器和 Windows WebView（如有）核对键盘焦点、浅深色、窄屏、屏幕阅读器可读标签与无 WebGL；无设备写承接人和复测步骤，不推断通过。

### S4 — Three.js 十二环场景、动作、拾取与资源 owner

**目标与接口**：新增 `src/celestialWheelScene.ts`，导出 `createCelestialWheelScene(canvas,{ model, selectedDate, theme, policy, onSelectDate, onFailure })` 和有 `setModel/select/setTheme/setPolicy/dispose` 的 owner。React 仅在 S1 为 `ready` 时创建；失败回 S3 文字路径。12 个 `Group` 分别承载一个月环，每环一个 `InstancedMesh` 绘制 28-31 日期格，合计 365/366 格；12 个 mesh 共享几何/材质，每个 mesh 的本地 `instanceId → YYYY-MM-DD` 表在 model 不变时稳定。组变换驱动转动、倾斜和高度，格位矩阵只在 model/尺寸变化时重建，不为每帧逐格写矩阵；关系状态变化时只更新共享实例颜色/标记或有限关联覆盖层，不能改变 slot 顺序。空日低亮但仍可拾取。有记录数量用分级高度/大小与清单精确计数；直接关联用描边/形状和文字，不仅靠颜色。

**锁映射**：消费 L1 的 12 圈真实日期、L2 全部关键动作、L3 纯展示边界以及 N1/N2/N3；不引入持久化或第二套关系算法。

12 条环基座以共享几何/材质绘制，月名固定 12 个，日期刻度每月最多 3 个（如 1 日、月中、月末）共最多 36 个；总文字对象上限 48，使用一个共享小图集或等价批量文字，不为 365/366 个日期建立文本纹理。精确日期由选中/悬停提示及文字清单给出，场景静止与运动时月名和刻度应读得清；环遮挡严重时调整相机倾角/标签朝向，不增无限标签。其他装饰粒子固定上限 32，允许零粒子。不得把全文转纹理。

视觉状态机：`flat → opening → orbital → closing → flat` 周期往复；首次打开、且 `motionAllowed`/可见/聚焦/无上层弹层时，**默认 `paused=false`**，先从清晰俯视平面进入展开，再在立体姿态停留、收合，随后自动往复。12 环以小幅不同角速度顺/逆转，中心与相机协同俯视到倾斜立体。用户可“暂停/继续”和手动“展开/收合”；手动姿态操作先停自动周期，保留选中日期，继续后从当前姿态平滑接回。系统减少动态、全局关闭动态、失焦、隐藏、上层弹层优先于自动动作：立即停止持续帧并冻结当前可读姿态，仍允许文字/日期静态操作；恢复许可时从冻结进度继续，不突跳。用户主动暂停在本次覆盖层内保持；关闭后场景销毁，**重新打开复位**为 flat 并在许可满足时再次首次展开。若打开时许可禁止，则呈静态俯视（保留十二圈）且不积累后台时间；之后许可开启，从 flat 入场。聚焦选中日期时先锁定 date key/文字清单，再缓动视角与高亮，不在动画中重新解释日期或关系。有限光晕采用共享 halo/颜色与透明描边即可；Bloom 可选，只有测量预算足够且确实改善画面才加。不能用光效捏造记录。

拾取用 canvas 局部 pointer 事件、短移动阈值区分拖动/点击；`Raycaster` 对 12 个日期 mesh 取最近可见命中，命中的 mesh 对应月环，再以该 mesh 的 `instanceId` 查本月 slots 表。每帧先更新环 `Group` 的 world matrix 再渲染/拾取；旋转或倾斜只改变世界变换，slot key 不变。遮挡后的远侧格不穿透前侧环；点击空白不改选择；触屏轻点遵守同一最近命中，拖动取消选择；场景高亮、提示和文字清单必须显示同一个 key。若倾角使可选格被遮挡，用户可用文字日期按钮完成导航。模型日期变化时整体重建 slots/mesh 并按 key 校正选中日；ready→updating 时仅清除关系视觉，slots 不动。`createSpatialScheduler` 限约 30fps，`spatialPixelRatio` 限 DPR≤1.5/约 250 万像素；`policy` 合并全局动态、系统减少动态、页面可见、业务弹层、窗口焦点和轮盘内暂停。暂停/隐藏/失焦时 `setContinuous(false)`，仅数据/选择变化触发单次静态重绘。窗口焦点恢复必须重新核对许可。

资源 owner 持有唯一 RAF、`ResizeObserver`、canvas pointer 监听、窗口焦点/文档可见性监听、所有 geometry/material/texture、controls/renderer；`dispose()` 幂等释放，取消 pointer capture。WebGL context lost 触发失败并停止 owner；重试重新创建。严禁全局 pointer 监听和未取消的 RAF。`renderer.dispose()` 后若需要 `forceContextLoss`，仅在确认不会影响别的 canvas 时使用。切换入口/退出视图都调用 dispose。
React effect cleanup 与 `onFailure` 可能先后调用同一个 owner，二者均只调幂等 `dispose()`；失败状态先让 canvas 退出交互并保留文字清单，重试用新的 `key/attempt` 创建新 canvas/owner，不复用已丢失 context。Strict Mode mount→cleanup→mount 必须留下一套 owner。

**关键锚点**：`src/spatialScene.ts:23-40,64-90,193-235,237-273`、`src/spatialRuntime.ts:1-45` 为预算/owner 模式；`src/CelestialNoteWheel.tsx` 的 effect 创建与 cleanup 是 owner 边界。目标形态是新场景文件单一 owner，业务 key 独立于相机矩阵。主链 slots 伪码给出拾取不变量，下面状态片段给出运动许可关键顺序：

```ts
// celestialWheelScene.ts: scene policy; static invalidation survives stopped motion.
const continuous = visible && focused && businessEnabled && motionAllowed && !paused
scheduler.setActive(visible)
scheduler.setContinuous(continuous)
if (!continuous && modelOrSelectionChanged) scheduler.invalidate()
// dispose: scheduler -> observers/listeners/pointer captures -> controls -> GPU objects -> renderer
```

**依赖/执行**：依赖 S1 稳定日期 slots、S3 文字选择；先 12 圈/实例/拾取，再姿态与聚焦，再有限光晕，最后测量是否需更低成本降级。**验收**：12 环及正确格数、实例映射准确，月名/日期刻度在许可姿态中可读；默认许可下首次打开能观察入场展开、差速、自动往复、聚焦与有限光晕；暂停/减少动态/失焦/隐藏冻结且无持续绘制，重开复位后再次入场；最近命中不穿透遮挡，触屏轻点/拖动正确；图谱 ready→updating 同步清除场景与文字关系标记；重复开关和 React Strict Mode 重挂载不累积 listener/RAF/GPU 对象；context lost 回文字后重试正常。若弱设备无法承载 12 圈，上报 coordinator 回上游重审，不擅自减圈。**回滚**：卸载独立场景并保留 S3 文字路径可作为受控降级；最终要交付完整视觉目标，不能将临时降级宣称完成。

**验证责任与证据**：impl-safe 测试稳定 slots/instanceId 和 scheduler policy，`npm run build`；可用浏览器做小样原型测量并在 `verification.md` 记录数据规模、帧率/帧时、DPR、观察环境、截图或录屏位置、重开次数、资源观察及失败。coordinator 承接 Windows WebView、弱 GPU、鼠标/触摸、浅深色、减少动态、长时重开测量，独立核验实际效果；未测逐项写明，不能拿构建代替。现场表现不合目标须回 S4 调整或升级风险。

### S5 — 文档、证据与交付收口

**目标与文件**：功能实际落地后同步根 `README.md` 的功能/使用入口、`CHANGELOG.md` 的版本变更、`docs/Project.Progress.md` 的当前完成状态与未测项；专题 `docs/current/celestial-note-wheel/verification.md` 与 `impl_report_r1.md` 保留命令、退出码、完整失败、实际体验和设备边界。必要时 `docs/Spatial.Experience.md` 仅补充年轮是独立视图的链接，不改旧空间既有事实。文档不能提前写“已实现”。借鉴原仓库视觉时记 MIT 来源和链接，不贴其术数数据。

**锁映射**：文档逐项声明 L1-L3 的已实现/未测事实，检查 N1-N3 未被描述为功能；不更新无关历史事实。

**关键锚点**：根文档对应功能/验证章节；专题 `verification.md` 为场景/无 WebGL/键盘/设备实测的证据账本。目标形态是用户能找入口和操作、审查者能逐项定位证据。本文已给出需写的文案事实，无代码片段。作者体验：文案说“记录年轮”“当前笔记创建年份”，不称算卦，不把未测性能包装成结论。

**依赖/执行**：S1-S4 实际完成且结果明确后写当前事实；每轮代码修复后重跑相关验证并更新证据。**验收**：三份根文档与代码现状一致，所有实际失败保留；专题证据表区分通过、失败、未测、承接人。**回滚**：撤销本功能文档段落/新增文件，不动历史版本事实。

**验证责任与证据**：impl 自查文档链接、命令/退出码/输出的对应性并提交报告；证据不足不写通过。coordinator 独立复跑关键命令、读最终 diff 和设备记录，再由独立审查者核查最终 diff、报告与验证表；若审查后改代码，重验再审。实施前将相关文件 `git status --short` 与 `git diff -- App.tsx NotesView.tsx Modal.tsx styles.css README.md CHANGELOG.md docs/Project.Progress.md` 的已有差异记录到 `impl_report_r1.md`（新增未跟踪文件另列），实施后逐 hunk 比对归属，仅暂存本功能 hunk（共享文件用 `git add -p` 或等价精确暂存），逐项核对 `git diff --cached`；无法区分来源时停止暂存并交 coordinator，不对共享文件整文件 `git add`。提交/推送仅在归属可辨识、验证 Gate 满足时按项目规定执行；推送前核对 `git log --oneline origin/main..HEAD` 范围，不能夹带既有未提交工作。

## 4. 验证计划与 Gate

`impl` 自证（impl-safe）：纯模型测试（365/366、月份天数、跨日、非法时间、删除与邻居）；导航/组件测试（卡片入口、全量、Esc、日期/记录按钮与 WebGL 失败文字路径）；场景索引/动态调度测试；本轮新鲜 `npm run build`。按项目现有测试脚本选择命令，不存在的脚本不得伪造通过。每条命令在 `impl_report_r1.md` 记环境、完整命令、退出码、失败原文位置；在 `verification.md` 记对应 case 与观察结果。输出缺失＝未验证。

coordinator 承接：独立重跑关键命令，实际 UI 核对三排版/筛选恢复/原编辑、浅深色/窄屏/键盘、禁用 WebGL/减少动态、Windows WebView、弱 GPU、鼠标触摸与长时重复打开。性能以具体设备、记录数、画布尺寸、DPR、测量时段和帧时/帧率记录，不以“感觉流畅”代替。缺设备写 `unverified`、责任人和复测步骤。独立审查者在上述新鲜证据后读最终 diff 与全部失败，评估数据真实性、12 圈视觉、生命周期和文档；后续代码变更使旧审查失效。

### P1-P9 与双阶段门禁留痕

- **P1/P2/P3**：质量以 Required Set **纯存在性硬门禁**判定，无任务数下限；任一必备项缺失即 Gate 失败，不能用整体“质量不错”抵消。澄清问题不设数量上下限（P7）。
- **P4 分型**：T1 为流程/文档/提示词变更，需目标/反目标/不影响、文件和章节锚点、工作包与验证证据、作者体验、主链/事实映射/片段（触发时）、风险降级、双门禁和澄清机制；T2 在 T1 上加模块输入输出、边界、函数接口与测试分层；T3 在 T2 上加跨模块接口矩阵、兼容/迁移和降级策略。本案 T3 的接口矩阵为 `NotesView.onOpenWheel(id) → App.wheelEntryId → Modal/CelestialNoteWheel(activeNotes,graph,policy) → celestialWheelModel → celestialWheelScene(onSelectDate) → App.editHandoff.current?.open(id)`；兼容为零迁移，降级为文字导航。S1-S5 均消费 L1-L3/N1-N3 中适用项；未消费项在包内明确不影响，不允许新增持久化或关系算法。
- **P5/P6 事件触发对齐**：出现新假设、新风险、模型/入口/动态许可变更或阶段切换时，立即在本节下表追加「时间、触发事件、受影响基线条目、代码/文档锚点、确认人、结论及是否回退」；后续实施阶段在 `impl_report_r1.md` 续记。本轮已触发的是 Review(LW) 第 1 轮：`view='all'` 覆盖层和默认自动入场为计划修订，未改用户确认的目标/反目标，记录见下表；U5 仍待设备测量。其余事件未触发，原因是无新的用户需求或外部接口变化。
- **P8 批量澄清**：同阶段出现多个阻塞点时按「基线矛盾/安全或数据风险 → 接口/迁移 → 体验/视觉 → 性能」一次性发给 coordinator，格式为 `【DELEGATE_QUESTION】背景与证据；Q1…（选项/推荐/影响）；Q2…；依赖顺序；未回答期间可独立推进的包`。若只需执行交接用 `【DELEGATE_ACTION】事项、文件、证据、阻塞范围`。本轮未触发提问，因为评审给出不改变基线的明确修订路径；不虚构用户回答。
- **P9 Gate-1**：lwplan 作者在每次写完/修订后立即对 T3 Required Set 强校验，结果留于 `lwplan.md` 本节；任一缺项则不交付“可进入 impl”。**Gate-2**：review_plan 在 Review(LW) 放行前独立强校验，coordinator 复核，结果落 `review_notes_lwplan_{n}.md`；失败回本文件修订并再审。第 1 轮 Gate-2 为 FAIL（`review_notes_lwplan_1.md`），本轮不能自行宣称 Gate-2 通过。

本轮 Gate-1 自检：目标/反目标映射、主链、research 映射、片段闭环、每包接口/依赖/验收/回滚、impl-safe 与 coordinator 责任和证据不足约束、作者体验、T3 兼容/降级均已写入；S2 单一覆盖层方案、S4 自动入场和拾取/标签预算已补。此为作者自检，待第 2 轮独立 Gate-2 复核；U5 实测性能仍是待验证风险。

Gate-2 复核顺序：先 `App` 卡片入口和模态焦点/背景 inert，再模型直接边与 updating 清除，再 12 环组变换/稳定拾取和动态许可，最后原编辑、文字回退、资源清理、证据与逐 hunk 归属。关键锚点、目标形态、片段触发、作者体验和链路级顺读任一缺失即失败；失败回 `LWPlan → Review(LW)` 修订；基线口径不唯一则交 coordinator 澄清，不自行扩张。

| 时间与触发事件 | 受影响基线及锚点 | 结论、责任与回退 |
| --- | --- | --- |
| 2026-10-06 Review(LW) 第 1 轮发现 S2 导航/滚动状态扩张 | L1/L3；`review_notes_lwplan_1.md` 风险 1/4、本文件 S2 | 保持 `view='all'`、NotesView 挂载、Modal 焦点恢复；lwplan 作者修订，待 reviewer 复核；无需回退基线 |
| 2026-10-06 Review(LW) 第 1 轮发现默认动态与 L2 张力 | L2；同报告风险 2、本文件 S4 | 许可满足时首次自动展开并周期往复；lwplan 作者修订，待现场验收；无需回退基线 |
| 2026-10-06 Review(LW) 第 1 轮发现标签/拾取预算缺口 | L1/L2/N3；同报告风险 3、本文件 S4 | 12 组/共享资源/最多 48 标签/最近命中；lwplan 作者修订，待测量；无需回退基线 |

## 5. 风险、降级与剩余不确定性

- **U5 实测性能**：未关闭。S4 测 365/366 格与 12 环、光晕与长时重开；优先降低标签/粒子/后处理成本并停止自动运动，12 圈不能减。无法承载则上报目标风险，文字路径仍可用。
- **日期语义**：沿用 `recordGardenModel` 本地创建日。若现有 `Date` 对极端年份有边界，测试记录实际结果，不能为本功能偷偷改全局日期模型；必要时向 coordinator 报 contract 差异。
- **关系异步与词面边**：只在 ready 时标记当前中心直接邻居，状态文字如实说明；不宣称因同日或视觉距离产生关联。
- **资源与交互**：失焦/隐藏/弹层/减少动态停连续帧，WebGL 失败退文字导航；场景重试须创建新 owner。窗口设备证据不足时保持未测。
- **工作区保护**：`App.tsx`、`styles.css`、根文档等已有未提交修改；不重置、不覆盖、不把其混入提交。若实施中发现已改的同一区块无法判断归属，先比对 diff 并向 coordinator 报告具体冲突，不自行丢弃。
