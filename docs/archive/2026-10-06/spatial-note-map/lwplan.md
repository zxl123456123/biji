# 3D 记录空间与动态宠物：低层实施合同

日期：2026-10-04。任务分型：**T3 跨模块变更**。本文定义待实施结构，不代表功能验证通过。

## 1. 范围与对齐

输入为 [clarifications.md](clarifications.md) 的完整实现基线、[hlplan.md](hlplan.md)、[research.md](research.md)、[research_industry.md](research_industry.md) 与 [review_notes_readiness_1.md](review_notes_readiness_1.md)。Readiness 为 PASS、`allow_enter_lwplan: yes`，只允许规划；实施仍等 Gate-2。

真实差量基线是 `C:/Users/ZXL/AppData/Local/Temp/qingjian-spatial-20261004/before`，同级 `manifest.json` 有 89 项。保持 HL 的四项核心取舍；所有细化是用户「自主开发实现」授权内的可逆选择，不新增逐阶段许可问题。

- **G1**：真透视 3D 记录空间、关联/时间视角、旋转/平移/缩放、全匹配 UUID 选择/查看/原编辑、共享筛选。
- **G2**：原创晴小团、大小展示、呼吸/眨眼/目光/轻触、拖动、休息/唤醒、收起恢复，暂停/弹层不妨碍主操作。
- **G3**：原能力保持，根验证、文档、fresh 审查及 0.6.0 Windows 制品对应冻结源码，保留失败/未测。
- **A1–A3**：几何不冒充语义/地理、宠物不读笔记或调用 AI；不新增业务 schema/备份/保存链、不顺修/覆盖未知工作；不引入外部角色、平台/养成/OS 跟踪、重后处理或第二物理/关系引擎。
- **不影响项**：2D NoteGraph/graphSession/Ctrl K、关系算法/Worker 协议、编辑/排序/置顶、SQLite/备份/AI 路径。没有业务数据迁移，也无大规模函数删除。

#### 本轮修订说明

[修订: LW-R1.D1/D2] 输入为 [review_notes_lw_1.md](review_notes_lw_1.md)：Gate-2 第1轮 FAIL/REVISE，阻断仅为 S3 的标签留页与顶栏搜索入口遗漏。尚无实施，本轮只补计划锚点/主链/根验，不删除主体或修改基线/HL；初次 Gate-1 自检未识别这两项，历史失败保留，修订后仍须 fresh Gate-2。

## 2. 核心链路总览

现状：`App notes → activeNotes/visibleNotes → useNoteGraph → projectGraph → 2D owner → UUID → editLatestNote → 原 Composer/保存`。

本轮：原链继续；App 扩展关系启用条件及新增 space 分支，`visibleNotes + 当前关系 → projectGraph → buildSpatialLayout → Three owner → 同一 UUID/文字详情 → editLatestNote`。独立 `PetCompanion/PetShowcase → 原创 SVG + 有限行为` 只消费宿主政策。

[修订: LW-R1.D1/D2] 筛选操作主链一并闭合：`space 顶栏 query 输入/清除或 TagPicker→selectTag 保持 space → 原筛选状态/visibleNotes → 当前关联/时间展示`。子视角不因筛选动作切换；pet 模式仍显示同一 query 输入，角色不读筛选数据，切回记录视角继续消费原 visibleNotes。

App 仅编排入口、受控空间子视角、主题/动态/可见/业务交互政策与宠物显示偏好；S1 拥有空间坐标、镜头、选择、调度和 GPU 资源；S2 拥有角色/行为/手势。这样不再复制业务保存或关系请求，不用跨包修改旧 2D。

### research 事实映射表

| 已观察事实 | 本轮实现锚点 | 测试/验证锚点与口径 |
| --- | --- | --- |
| App 唯一 notes、最新 UUID 编辑复核（B1/B5） | S3 App `editLatestNote` 作为 S1 `onEdit` | S3 类型/构建；root 实际编辑保存并只读对照，纯测试不证明真实库 |
| 全活动集合关系、共享筛选且不限 60 条（B2） | S3 `useNoteGraph` 启用与完整 `visibleNotes`；S1 `projectGraph` | S1 全 UUID/孤立点/筛选测试；root 实际搜索/标签/未完成 |
| [修订: LW-R1.D1] App `selectTag` 仅graph留页，TagPicker直接调用它（before App `:95/:200`） | S3只扩展该handler导航条件为graph/space保持当前view；原设置标签/关闭picker行为复用 | root在关联/时间选择、清除标签后仍在space及原mode，过滤UUID与visibleNotes一致；旧graph/all行为回归 |
| [修订: LW-R1.D2] 顶栏query输入只在all/trash/graph出现，其他按钮跳all（before App `:190`） | S3搜索显示条件加入space，复用原value/onChange/清除；pet仍显示该输入，不将query传宠物 | root关联/时间输入、清除query不离开space或切mode；pet输入/切回记录视角不重置原筛选状态 |
| 无坐标 GraphModel，pending 保留节点、旧结果不暴露（A2/B2） | S1 `buildSpatialLayout` 与关系状态展示 | S1 冻结输入、pending/失效边/度数测试；root 更新/筛选画面 |
| 现有安全正文和文字选择（B5） | S1 DOM select/详情复用 `renderMarkdown/withoutTags` | S1 字面安全夹具；root 无画布选择/编辑、正文可见 |
| motionAllowed 不含 blur（B4） | S1/S2 owner 各监听 blur/focus，停止并取消手势 | S1 scheduler/S2取消逻辑；root 实际窗口切换及弹层 |
| 关闭动画不等于关闭业务输入（B4） | `motionAllowed` 与 `businessEnabled` 分离 | S1/S2政策测试；root 关动态仍旋转/选中/轻触 |
| 旧层级/窄屏/局部 touch-action（D2） | S1 spatial.css；S2 pet.css；S3最小导航接入 | root 390px、modal/AI/Tab；触屏未执行则未测 |
| PWA默认缓存、Three新增依赖/GPU未知（E/U2/U4） | S3精确依赖、许可证；S1自有资源清理/降级 | root bundle/gzip/precache/实际WebGL/原生；不预调缓存上限 |

## 3. 接口、文件 owner 与政策

| owner / 文件 | 必须导出的契约与消费方 |
| --- | --- |
| S1 `src/SpatialNoteMap.tsx` | default `SpatialNoteMap`、type `SpatialNoteMapProps`；S3 lazy 加载。Props：`notes: readonly Note[]`、`graph: ReturnType<typeof useNoteGraph>`、`mode: SpatialMode`、`onModeChange(mode):void`、`theme:'light'|'dark'`、`motionAllowed:boolean`、`visible:boolean`、`businessEnabled:boolean`、`onEdit(id:string):void`、`onOpenGraph():void`。 |
| S1 `src/spatialLayout.ts` | types `SpatialMode = 'relations'|'time'|'pet'`、`SpatialNode`、`SpatialLayout`；`buildSpatialLayout(notes, projected, mode)`，projected 是 `ReturnType<typeof projectGraph>`、mode 限 relations/time；结果包含 id/坐标/group/degree/done/创建时间有效性、可见边与 bounds，不含保存对象。S3只 type import SpatialMode。 |
| S1 `src/spatialRuntime.ts` | `createSpatialScheduler`：注入 request/cancel/draw，返回 `invalidate/setContinuous/setActive/dispose`；自有一条去重 RAF，disposed 后永不排帧。导出可测试的显示政策计算；不做通用渲染平台。 |
| S1 样式/测试 | `src/spatial.css` 由 SpatialNoteMap 引入；`tests/spatialLayout.test.mjs`、`tests/spatialRuntime.test.mjs`，按现有测试装载 TS 的方式接入。 |
| S2 `src/PetCompanion.tsx` | named `PetCompanion`、`PetShowcase` 与各 Props。共享 props：`theme`、`motionAllowed`、`visible`、`businessEnabled`；小宠物增加 `shown:boolean`、`hidden:boolean`、`onHide():void`。S3消费小组件，S1 `import { PetShowcase }` 在 pet 分支消费大展示。 |
| S2 `src/petBehavior.ts` | `PET_VISIBLE_KEY = 'luma-pet-visible'`；types `PetMood/PetEvent`，纯 `reducePetMood/clampPetPosition/isPetTap`，供组件/测试消费，S3只导入显示键。角色 SVG 与行为 hook 留 PetCompanion 内部，无 controller 平台。 |
| S2 样式/测试 | `src/pet.css` 由 PetCompanion 引入；`tests/petBehavior.test.mjs`。S2不修改 App、全局 CSS、依赖、版本或 README。 |
| S3 `src/SpatialEntryBoundary.tsx` | default `SpatialEntryBoundary`，props `children:ReactNode/onBackToNotes():void/onOpenGraph():void`；只捕获入口模块加载/渲染异常，给出记录/2D入口，不吞编辑器错误。 |
| S3 既有筛选接入 | 已读快照 `src/NoteFilters.tsx`，named `NoteFilters`/type `NoteFiltersProps`。S3在space分支外层 `<section className="spatial-workspace">` 内渲染它，仅 `spatialMode !== 'pet'` 时显示记录筛选；此wrapper样式由S1的spatial.css提供，不改NoteFilters。传 `query/selectedTag/unfinished/count=visibleNotes.length/onUnfinished/onClear/onPickTags` 原App状态/回调，`isTrash=false`；S1始终只收同一筛选后的visibleNotes，不新增filters prop。[修订: LW-R1.D2] query由加入space条件后的原顶栏输入/清除控制，pet模式仍显示输入但角色不消费query，模式切换不重置筛选。 |
| [修订: LW-R1.D1/D2] S3 筛选导航入口 | `src/App.tsx` before `selectTag:95`、顶栏搜索条件 `:190`、`TagPicker onTag:200`。selectTag导航从graph唯一保持扩为graph/space保持当前view，其他视图仍all；顶栏输入从all/trash/graph扩为all/trash/graph/space。既有query/selectedTag/onClear状态链复用，不新建空间筛选副本。 |
| S3 唯一共享文件 | `src/App.tsx`（含内联 SettingsView）、必要的 `src/styles.css` 导航微调、`package.json/package-lock.json`、`src-tauri/tauri.conf.json/Cargo.toml/Cargo.lock`、`public/third-party-licenses/three.txt`。锁与版本按顺序写入；无单独 SettingsView 文件。 |
| root S4 | 所有当前文档、实际 UI/性能/原生/真实库证据和 fresh 审查；impl 不并发写 README/CHANGELOG/Project.Progress 或根验证文档。 |

`graph` 沿用 hook 实际返回结构，不自行重声明第二 GraphState；S1只读其当前模型/分析状态/重试，不触碰请求协议。所有记录类型导自现有 `types.ts`，布局边导自 `projectGraph`，不得追加 Note 字段。

政策口径：`businessEnabled = pageVisible && 无 composer/quickOpen/tagPicker/AI`；`motionAllowed` 继续使用 App 原公式，不把它当交互许可。owner 内部再与 window focus、局部暂停和当前显示状态合并。

| 状态 | 空间 owner | 宠物 owner |
| --- | --- | --- |
| 仅关全局动态、reduce 或局部暂停 | 无自动旋转/粒子连续帧；controls 禁 damping 后按交互一帧渲染，仍可相机/点选/编辑 | 停呼吸/眨眼/漂浮定时调度，静态轻触/休息按钮仍可用，短反馈不循环 |
| hidden、blur、弹层/AI、离开空间或 pet 子视角 | 取消 owner 手势/持续 RAF；hidden不画，模态不接输入；pet分支释放3D owner | 取消 capture/短反馈/定时动作；弹层或 hidden 隐藏小浮层并退出 Tab，不穿透 |
| 恢复活动 | 重设时间基准，只恢复当前允许的调度；手势不自动续接 | 保留会话位置/休息状态，恢复允许的轻量动态；手势需重新开始 |

### 最小闭环片段（目标伪代码，非最终实现）

来源锚点：快照 App 视图/关系启用 `:21/85/144–175`、最新编辑 `:136`；新 S1投影/选择；新 S2政策。[修订: LW-R1.D1/D2] 还覆盖App `selectTag:95/TagPicker:200` 与顶栏搜索 `:190`；这些修改既有分支，命中必填片段规则。

```text
App: view += space; spatialMode = relations
  selectTag: setSelectedTag(tag || null); nav(view in {graph, space} ? view : all)
  topbar: view in {all, trash, graph, space} -> 原query输入 + 清除setQuery('')
  space: 仅mode != pet显示NoteFilters；mode切换不重置query/selectedTag/unfinished
  graph = useNoteGraph(activeNotes, view == graph || view == space)
  space -> EntryBoundary -> Suspense -> SpatialNoteMap(
    visibleNotes, graph, spatialMode, policies, onEdit = editLatestNote)
  PetCompanion(shown = petPreference, hidden = space && mode == pet, policies)
S1: mode == pet -> PetShowcase(policies); 不创建 renderer
  否则 projected = projectGraph(当前模型, visible UUIDs)
  layout = buildSpatialLayout(notes, projected, mode); render(layout)
  canvas/文字选择 -> selected UUID -> 安全详情 -> onEdit(UUID)
S2: 可见且允许 -> 有限行为；cancel/blur/modal -> 取消并静止/隐藏
```

片段闭环充分性：上述骨架连通 App唯一源/启用 → 投影 → 几何 → 真3D/文字选择 → 原编辑，以及政策 → 大/小宠物 → 取消。[修订: LW-R1.D1/D2] 现同时覆盖标签/搜索操作→保持space与mode→共享筛选→空间结果，pet不另造query语义；下列包补齐资源、失败与验证，不需 reviewer 跨包猜输入或保存方向。

## 4. 主要工作包

### S1：空间地图 owner

- **目标/映射**：G1/G3、A1/A2/A3；新模块拥有只读可视化及可验收视觉，不改旧2D/关系/保存。
- **关键锚点/形态**：先看 SpatialNoteMap 受控 mode/props 与 `projectGraph`，再看 layout/runtime；可预见普通 DOM 控件/详情包围单 canvas，Three只在地图分支拥有资源，UUID回调闭环明确。已附主链片段，新增模块内部文字合同足够，不贴最终渲染代码。
- **依赖/顺序**：S3安装锁定依赖后做纯布局/runtime与测试，再场景、控制/命中、详情/降级；S2先提供固定 PetShowcase 接口，S1不创建或修改宠物 stub 文件。
- **布局**：同输入确定；group排序提供簇中心、UUID排序与稳定扰动提供簇内三维点，具有明确纵深；degree只数当前可见边。时间视角创建时间沿一轴单调编码，另两轴体现group/完成状态；无效时间进明确「时间未知」区，保留全部UUID。不得通过采样丢业务节点。
- **视觉**：真 PerspectiveCamera、柔和星簇/稀疏连线、浅深主题配色、少量流光光点；分组图例、大小/完成图例、创建时间说明与选中点高亮。简单几何与透明材质形成光感，不用 Bloom/远程素材；初版须明显可见且能操作。
- **批绘/预算**：共享低面数节点几何、InstancedMesh及instance→UUID表；LineSegments批绘稀疏边，少量选中光环，粒子≤128、≥500节点减至32。连续动态≤30fps、dt≤50ms、DPR≤1.5、总绘制像素≤250万；静态输入按需帧，不把限额称GPU实测。
- **输入/状态**：`loading/ready/failed/disposed` owner状态；选择独立UUID state，过滤移除才清空。OrbitControls只绑定canvas，拖动越过阈值不点选，pointercancel/lost capture/blur/业务禁用取消；完成状态和图例不能只靠颜色。文字select含所有匹配记录，可在静态/失败时继续查看编辑。
- **详情**：复用安全正文与标签抽取；显示共同标签或正文词面依据、group/时间/完成事实；只提供原编辑/原2D入口，不扩展删除或AI操作。分析pending/error时说明关系状态并保留节点/清除旧边，沿原重试回调。
- **资源/降级**：控件change→去重invalidate，不同步递归render；resize/主题/筛选/选中请求静态帧。卸载、StrictMode、初始化异常、context loss先失效owner再取消RAF/observer/自有监听，释放controls/renderer/geometry/material/自建texture各一次。失败保留DOM列表，显式重试通过新owner代际重建；旧异步回调不能更新新owner。
- **作者体验/声明可读性**：图例说明几何与关系含义，直接可选可编辑；控件有中文名称/焦点，正文可滚动可选，≤720px图/详情单列；不暴露存储标记或用「语义/地理/零bug」虚构能力。
- **验收/回滚**：所有匹配UUID、孤立/pending/未知时间、模式/选中/原编辑均在合同内；仅撤销S1新增文件与S3本轮入口引用，保留业务库与旧图；未获root许可不执行还原未知工作。
- **impl-safe三元组**：S1负责 `node --test tests/spatialLayout.test.mjs tests/spatialRuntime.test.mjs` 与集成就绪后的 `npm run build`；冻结输入不变、完整UUID/投影边、单调时间/无效保留、去重调度/停止/销毁/旧回调测试。原始日志 `TEMP/qingjian-spatial-20261004/s1-*`，摘要 `impl_report_s1.md`，含命令/完整输出/exit/源SHA；缺项仅判逻辑未验证，不进入根验收。
- **root承接三元组**：root验证真3D/相机/命中/无画布/筛选/更新时间/主题/390px、重复进入与故障降级，并记录真实浏览器截图/测量于S4证据；impl不得控制用户UI、真实DB或宣称GPU结果，root缺项保持未测。

### S2：动态宠物 owner

- **目标/映射**：G2/G3、A2/A3；原创角色与有限互动，无笔记数据/AI/外部资产。
- **关键锚点/形态**：先看 PetCompanion/PetShowcase exports，再看内部共享SVG与有限行为、petBehavior纯取消/边界工具。App无需controller；两种呈现复用同一角色和规则，各自然持有有限会话状态。新增模块不修改旧分支，主链政策片段已足够说明输入/输出。
- **依赖/顺序**：无需新依赖；先声明导出接口，做SVG/行为工具与测试，再小浮层/大展示/样式，向S1/S3通知可消费接口。不得临时下载或复制Codex/VPet/Shimeji角色。
- **角色视觉**：原创圆润半透明小团、可辨五官/小耳或芽、柔和炫彩光点；大展示有明显舞台/名字/短反馈。共享内部SVG用独立id避免多实例渐变冲突；本地路径/CSS/Motion，不把普通emoji当最终角色。
- **有限状态**：`idle/happy/resting/dragging`，目光/眨眼为局部表达；轻触→短happy→idle，休息按钮→resting，唤醒→idle；drag结束/取消回原休息或idle。只做本轮四态与有限取消工具，不引入通用状态机/可配置事件框架。取消清除反馈计时，不产生挂起happy/dragging；暂停/reduce保留静态点击反馈和明确休息状态。
- **拖拽/边界**：只在小角色/抓手绑定Pointer Events，capture指针且区分6px阈值轻触/拖动；只追踪owned pointerId。up/cancel/lost capture/blur/隐藏/弹层/卸载都结束，拖完不再触发点击。窗口/viewport尺寸变更将角色限入8px安全边距；窄屏控制条不溢出。
- **会话/显示**：小组件保持挂载，shown/hidden只隐藏外观和停调度，位置/休息不随主页面切换丢失；只由App保存显示偏好。大展示独立有限状态不读记录；浮动层z低于AI/modal且弹层时不呈现/不可Tab，正文滚动与IME不被全局监听劫持。
- **作者体验/声明可读性**：轻触、休息/唤醒、收起有明确中文按钮；设置可恢复。各可聚焦控件名称清楚，隐藏时不留焦点陷阱；短反馈不覆盖编辑操作、不宣称宠物理解记录。
- **验收/回滚**：大小可见、自然轻量动态、轻触/拖动/休息/恢复/全取消路径和主题窄屏；只撤销S2文件与S3/S1本轮引用、独立偏好不影响业务数据。不得清空其他localStorage。
- **impl-safe三元组**：S2负责 `node --test tests/petBehavior.test.mjs` 及集成构建；测试休息/反馈/取消/6px/owned pointer/clamp/resize与禁用策略。日志 `TEMP/.../s2-*`、摘要 `impl_report_s2.md` 含完整输出/exit/源SHA；缺证据则相应逻辑未验证，不称实机动作通过。
- **root承接三元组**：root实际看SVG/呼吸眨眼目光、轻触/拖动、休息唤醒、收起/设置恢复、大展示、blur/hidden/弹层/Tab/reduce/390px；证据落S4。触屏/读屏/长时耗电等非impl-safe由root承接或保留未测，不用pure测试代替。

### S3：唯一 App、依赖与版本集成 owner

- **目标/映射**：G1/G2/G3、A1/A2/A3；只接入口、共享政策和偏好，保证原链保持；不写当前文档。
- **关键锚点/形态**：App的View/导航/viewContent、hook启用、原motionAllowed、内联SettingsView、lazy/Suspense；[修订: LW-R1.D1/D2] 加入before `selectTag:95/TagPicker onTag:200` 和顶栏搜索条件 `:190`，可预见space受控子视角与原筛选留页/小宠物政策接入，不重构原App/存储。已附修改分支目标片段；新增Boundary只捕获空间入口。
- **执行步骤**：顺序 `npm install --save-exact three@0.186.1`、`npm install --save-dev --save-exact @types/three@0.186.0`，通知S1；按实际包MIT保存three.txt与现有许可入口。再对接S1/S2 exports，新增明确3D空间导航与 `spatialMode` state，按§3在space分支外层渲染现有NoteFilters，关系在graph/space启用。
- [修订: LW-R1.D1/D2] **筛选入口步骤**：selectTag只将导航判定扩为 `view==='graph'||view==='space' ? view : 'all'`，既有标签更新/picker关闭复用；顶栏已有搜索input显示条件加入space，value/onChange/清除按钮继续原query链，其他旧视图行为保持。pet模式也显示此框且不跳all；pet展示不读取query/标签/记录内容，输入只改变共享筛选，切回关联/时间仍用原visibleNotes，切mode不重置过滤状态。
- **政策/偏好**：保留原motionAllowed公式，另推导businessEnabled传两owner；PetCompanion常驻App壳层，hidden在space/pet大展示时为true。独立 `PET_VISIBLE_KEY` 首次默认显示，设置新增「宠物伙伴」开关，onHide同一状态/键；不新增通用配置层，不写位置或情绪。
- **失败/兼容**：SpatialEntryBoundary局限space分支，加载失败提供返回记录/原2D入口；renderer/context错误由S1处理。正常暂停仍保留业务输入。版本元数据统一0.6.0，仅更新包/root lock、Tauri配置与Cargo本项目条目，不顺改Rust业务；不预调PWA缓存上限，实际bundle越界再报告root。
- **作者体验/声明可读性**：主导航入口可发现，设置说明显示偏好独立；已有记录/图/账本仍直接进入，原Ctrl K保持2D。文案为中文、无内部格式/新schema术语，暂停不暗中关闭业务动作。
- **依赖/验收/回滚**：等S1/S2接口再联调；无缺失export、各版号/锁一致、新测试纳入npm test、原入口与快捷键未被替换。只移除自己新增依赖/本轮引用/版本差量；混合文件需逐hunk核对来源后再回退，不执行全文件restore。
- **impl-safe三元组**：S3负责 `npm test`、`npm run build`、版本/锁/许可及无新网络调用的静态核对；日志 `TEMP/.../s3-*`、`impl_report_s3.md` 含完整输出/exit/源SHA/依赖清单。编译绿只说明结构就绪，缺证据不得交付可验收结论。
- **root承接三元组**：root实际入口/设置/刷新偏好/模态/原快捷键、bundle/gzip/precache与冻结原生制品；[修订: LW-R1.D1/D2] 在space关联/时间选择与清除标签、输入与清除query后保持view和mode，结果匹配visibleNotes；验证pet搜索仍留页及切回记录视角筛选延续，旧graph/all筛选保持。证据S4。S3不控制用户UI、不打开真实DB、不提交混合工作区；外部依赖真实缓存/原生不能由源码核对放行。

### S4：root 根验证、文档与 fresh 审查

- **目标/映射**：G3并核验G1/G2与A1–A3；跨包证据闭环而非第四个实现模块。关键锚点是89快照差量、最终源SHA、日志、实际UI、制品身份与验证文档；此包无代码片段需求，证据表能预判目标形态。
- **顺序/依赖**：三个报告就绪→root独立 `npm test/npm run build`→实际UI/故障与有界测量→同步当前文档→冻结源→低并行Windows构建/自建进程烟测/只读旧库对照→fresh reviewer。源码补修要重测复审，不沿用子agent成功声明。
- **证据三元组**：root持有完整命令日志/exit/SHA与截图、范围明确的测量、bundle/gzip/precache清单；落 `TEMP/qingjian-spatial-20261004/root-*`，摘要 `docs/Release.Verification.0.6.0.md`。fresh reviewer写 `review_notes_impl_1.md`，消费源/日志/当前文档/制品；缺证据只能相应未验证。
- **真实UI验收**：关联星簇/透视纵深/流光、相机与全部节点文字路径、创建时间方向/孤立点/筛选/原编辑；宠物原创视觉/大小/拖完不误触/休息/收起恢复；关动态/reduce/hidden/blur/弹层/Tab/深色/390px；原2D、查找、排序、记录展示/保存基本保持。
- [修订: LW-R1.D1/D2] **筛选留页验收**：在关联星图与时间层分别选择/清除标签、输入/清除正文query，均留space及当前mode，文字节点/画布UUID结果符合现有selectNotes；pet模式顶部query仍可输入/清除而不离页，切回关联/时间不自行重置query/标签/未完成。旧graph/all相同操作保持原行为，记录筛选bar仍不显示于pet。
- **性能/失败**：有界合成500/1000记录分开记录关系等待、进入/交互观察与调度停止，不拿30fps上限当实测。按可用工具验证重复进入、无WebGL/初始化失败/context loss，缺现场项标未测；故障注入限合成数据/自建进程。
- **发布/原库**：冻结后 `npm run desktop:build` 低并行，核新EXE/MSI/NSIS实际产生项、0.6.0/version/hash与自建进程；真实用户SQLite只读核字段/顺序，不以旧EXE写迁移后库。安装卸载、完整原生MVP/广泛GPU/触屏读屏/长期耗电保持未测或单列证据。
- **文档/作者体验/回滚**：root唯一写根README/CHANGELOG/Project.Progress、版本验证及feature状态，保留历史失败；验收文案可顺读能力、限制和产物，不把计划变成事实。回退只撤本轮已知差量、不动用户数据；未知来源工作不整包提交/推送，是否提交由root核范围。

## 5. 执行、风险与事件留痕

执行序列：Gate-2→S3依赖锁就绪→S1/S2新模块并行→S3接入口/设置/版本→S4根验。S1/S2只写自有新文件和各自报告；共享文件和锁不得并发写。所有impl在动手前读 safe-code-changes，完成前读 verification-before-completion。

U1/U6已由授权和本合同细化，不阻塞；U2/GPU、U3真实规模、U4缓存/实际产物、U5触屏/缩放/读屏仍由S4现场承接。调度/几何/取消测试不能关闭现场未知；本轮不新增数值性能承诺或PWA上限配置。

**P6事件触发对齐留痕位置**：本节；root后续将新风险/假设回写clarifications完整基线再通知owner，阶段事件另记review/impl报告。已触发 `HL→Readiness PASS→LW`，继承四项决策、证据边界与授权；当前无新增核心假设。接口漂移、包体出界、失败路径不可达时立即上报，不静默改合同。

[修订: LW-R1.D1/D2] 本次事件：`Review(LW)-1 FAIL → 局部LW修订 → 待复核`；已独立读取before App `:95/:190/:200` 实际条件，D1/D2为原入口遗漏，无基线/架构/新授权变化。由root重新冻结并交fresh reviewer，首轮FAIL不会被Gate-1文本覆盖。

**P8批量提问模板与优先级组织方式**：当前未触发，原因是范围/验收/回滚可由完整基线唯一确定，常规细化已获自主授权。真正超授权/口径冲突时按P0阻塞、P1高风险、P2优化一次批量交root，不将可逆技术细节重复问用户。

```text
【DELEGATE_QUESTION】需要用户确认：Q1… / Q2…
优先级：Q1=P0、Q2=P1；影响阶段：Review(LW)|Impl
A) 推荐选择与原因；B) 另一选择与影响
请一次性回复：Q1=A, Q2=B
```

取证失败保留：LW首次猜测 `readiness_review.md` 不存在，Get-Content非终止报错但末尾另文件成功令总体exit0；该0不证明读取成功。已用rg定位实际 `review_notes_readiness_1.md`，完整重读exit0。无源码或产品验证命令在本阶段执行。

## 6. T3 RequiredSet 与双阶段 Gate

| 必备存在性项 | Gate-1自检落点 |
| --- | --- |
| 目标/反目标/不影响项，逐主要包映射 | §1、S1–S4，已存在 |
| 文件/首读锚点、函数/handler、目标形态与片段判断 | §3、闭环骨架、各包关键锚点，已存在 |
| 任务目标/步骤/依赖/验收/回滚 | §4各包、§5序列，已存在 |
| impl-safe/root/非impl-safe分层与证据三元组 | S1–S4：产物/责任/不足约束，已存在 |
| 作者体验门与声明可读性证据 | 各包中文控件/直接路径/政策/图例/限制合同，已提供设计证据；实际视觉由S4验证 |
| 主链/研究事实映射/最小片段闭环 | §2事实表、§3完整数据/政策/编辑骨架，已存在 |
| T2输入输出/边界/测试分层/回归 | §3 props/exports/状态表、各包测试/根验，已存在 |
| T3跨模块接口/兼容迁移/降级停机 | §3矩阵、无业务迁移、S1资源失效与S3边界/旧入口，已存在 |
| P6事件留痕/P8模板优先级与未触发原因 | §5，已存在 |
| 风险/失败降级、Gate执行人/时机/回退 | 各包失败/§5风险/本节，已存在 |

Gate-1：本planner按T1全部13项及T2/T3补充做存在性自检；以上全部存在，**Gate-1 PASS**只允许交Review(LW)，不允许据此实施。正文结构/链接/契约文本的本轮验证证据由返回简报给root。

Gate-2：fresh review_plan 主检、root复核；必须顺读 App源→关系投影→空间/宠物→选择/取消→原编辑→证据闭环，逐包核锚点/目标形态/片段触发/验证三元组/作者体验与RequiredSet。任一缺项FAIL则LW修订回环，禁止impl；口径不唯一交委托提问，核心基线冲突先回clarifications/readiness。

未发现有效基线/平台入口/mirror契约漂移；真实before与Readiness路径纠偏已留痕。没有新增跨功能事实。
