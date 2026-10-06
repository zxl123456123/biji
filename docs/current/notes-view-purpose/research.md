# 记录视图用途：代码事实调研

调研日期：2026-10-05。职责：只读指定 2D/3D 模块及直接依赖和相关测试；不修改实现、不调研日历主体、不递归委派。源码是进行中工作区快照，空间外观与宠物功能已存在未提交实现，均保留。

## A. 系统边界与现有能力

### 共用事实与关系来源

- `App.tsx:109-112` 从唯一 notes 状态得到未删除全集 `activeNotes`、统一搜索/标签/未完成筛选 `visibleNotes`；只在 graph/space 入口启用 `useNoteGraph`。图视图使用全部匹配记录，不受网格的分批数量限制。
- `noteGraphModel.ts:19-20` 的语义快照只包含 id/content，排除删除记录并稳定排序；done、日期、源数组顺序不使图关系重新计算。
- `noteGraphModel.ts:22` 的 `buildNoteGraph` 派生两种证据：真实共同标签、Unicode 2/3gram TF-IDF 余弦词面相近；后者不是语义理解。每个 UUID 均保留，包括空正文、独立记录和同文不同 UUID。
- 每条记录主动选择最多 2 个标签邻居和 2 个正文邻居，去重后的全图边数不超过 4N；正文候选最多 64 个，阈值 0.32。无标签记录仅在双方均选择且相似度至少 0.55 时合并正文分组。主标签取相对稀有标签。该模型是稀疏展示关系，不能视为穷尽的笔记语义知识图谱。
- `GraphEdge` 允许一条边同时含 `sharedTags` 和 `similarity`；绘图实线/虚线以是否有 sharedTags 决定，详情会分别列出两种证据。
- `projectGraph` 保留指定可见 UUID，复制证据数组，只保留两端均可见的边。模型未就绪时仍提供 pending 节点。
- 本次读取的图模块没有 SQLite 写入、笔记格式改写、远程请求或另一套笔记数据来源。

### 2D 关联图

- `NoteGraph.tsx:40` 将统一图模型投影到当前筛选记录；D3 force 独立模拟副本和 Canvas 2D 自行绘制。
- 支持节点拖动、空白平移、缩放、适配全图、点击与文字 select 选择；暂停动态时仍可静态操作。位置和相机保存在 `App.tsx:72` 的会话 ref，不保存到笔记。
- 选中记录突出直接关联边、显示正文、标签、分组及可见关联证据，可跳转原编辑器、定位或移至回收站。
- `graphFocus.ts` 使用 token 消费定位请求，等待 ready/error 与画布尺寸，避免旧 token 或已卸载 owner 回报；原生 D3 自有鼠标拖动和平移监听有受控取消逻辑。
- 当前没有按证据类型的显示过滤、1/2 跳局部范围、局部范围计数或跨多跳阅读说明。选择后的淡化仅限直接邻居，全部边仍继续画在底层。
- 节点标签在选中或直接邻居时显示；全图不超过 80 节点且缩放至少 0.55 时也显示所有标签。标签截 16 个可见文本码点，没有碰撞避让。

### 3D 空间

- `SpatialNoteMap.tsx:38-46` 有 relations/time/pet 三种模式；pet 分支独立于记录 MapView。relations 和 time 共用外观配置、文字选择器、完整正文与关联证据及编辑入口。
- `SpatialNoteMap.tsx:63-64` 继续消费同一 `projectGraph`，没有第二套关系分析和物理图布局。
- `spatialLayout.ts:23-65` 稳定排序 UUID，relations 按既有分组构造确定性 3D 坐标；time 的 x 是创建时间，y 是分组，z 是 done 状态，未知日期保留独立区域。位置仅表达展示维度。
- `spatialScene.ts:19-23` 公开 `setLayout`、`setTheme`、`setPolicy`、`setAppearance`、`select(UUID)`、`focus(UUID)`、fit/zoom/rotate/dispose。没有主题分组聚焦、未选点淡化、节点文字/悬停标签或单独渲染边输入接口。
- 透视相机 + OrbitControls 支持旋转、平移、缩放，InstancedMesh 支持 UUID 点选；节点尺寸表达 done 与当前可见边度数，选中记录增加面向相机的圆环、邻边强调。
- 当前所有基础边均显示；流光才受 128/32 数量预算限制。选中后的其他基础边仍显示，不对未选节点淡化。
- 主题小条 `SpatialNoteMap.tsx:98,138` 只显示最多 6 个标签/正文分组名称，没有每组条数、展开、主题过滤或主题阅读操作；独立分组不逐个显示，只以“其他分组仍在图中”文字提示。
- WebGL 创建/渲染失败时文字详情仍可用，有重试和回到 2D 入口；3D 到 2D 目前仅无参数 `onOpenGraph()`，不携带选中 UUID。

## B. 入口与主流程

1. `App` 持有统一笔记、共享筛选与页面状态。
2. `useNoteGraph` 获取正文快照；少于 24 条且正文总 UTF16 小于 8000 时在主线程调用纯关系模型，否则専用 Worker。
3. 请求边界最多一个在途请求、一个可替换的最新待请求；旧版本结果不被采用。更新/错误时关系模型置空，保留当前 UUID 节点；错误/10 秒超时终止 Worker 并允许重试。
4. 2D 将投影模型复制给 D3，手动 tick/Canvas；3D 将投影模型派生成布局给单一 Three scene。
5. 两个视图的详情都按 UUID 找原记录，受限渲染器显示完整正文，再回调原编辑器。

`App.tsx:186-197` 是空间入口，已有共享筛选、Boundary、按需加载和 appearance/petAppearance props。`App.tsx:206-211` 是 2D 入口，已有会话布局、定位请求和原业务回调。

## C. 关键模块、责任与可核查集成锚点

| 模块 | 当前责任 | 可复用事实/边界 |
| --- | --- | --- |
| `noteGraphModel.ts` | 全集派生关系及可见投影 | `GraphModel`/`GraphEdge` 是纯数据；展示过滤不必改变原推断算法 |
| `useNoteGraph.ts` / Worker | 语义快照、版本、异步边界和错误 | 已有模型供两视图共享；日期/状态不引起关系重建 |
| `NoteGraph.tsx:40,256,324` | 2D 投影、模拟 owner、证据详情 | 当前显示模型 `shown` 同时驱动绘制、模拟和详情列表，局部范围需保持这些用途一致 |
| `graphFocus.ts` / `graphGeometry.ts` | 定位、坐标和自有手势 | 定位要兼容局部视图隐藏的 UUID；当前 locator 只认识 ready/error 与 locate outcome |
| `SpatialNoteMap.tsx:63-64,95-98` | 选择、布局、详情、外观和相机控制 UI | 内部持有 selectedId、ownerRef 和投影；外部目前不能读取选择或直接控制相机 |
| `spatialLayout.ts` | 纯确定性坐标、度数、分组、bounds | 可独立测试；边度数来自输入显示边，减少输入边会改变点尺寸/度数 |
| `spatialScene.ts` / `spatialModels.ts` | GPU、输入 owner、材质/模型、生命周期 | 已有 setLayout 可接受独立派生布局；该主体正在由空间外观工作占用，不宜并行改写 |
| `spatialRuntime.ts` | RAF/政策与像素预算 | 可独立测试；展示适配不能破坏 hidden/失焦/弹层/暂停规则 |
| `styles.css:389-400` / `spatial.css:15-90` | 图布局、详情和响应式 | 2D 样式与空间样式分离；空间外观在 spatial.css:95 后追加，处于并行任务范围 |

### 对 parent 补充要求的事实约束（不是已采纳方案）

- 3D 当前按分组摆放，但并不按边的长度/强度计算空间关系。节点空间距离不能解释为关联强弱。
- 分组计数可从投影后的节点 group 汇总；`single:<UUID>` 是一条记录一个独立分组，不能以原始 group 为全部主题按钮，否则大量独立记录产生大量选项。pending 状态也不代表真实主题。
- 原 `SpatialNoteMap` 公开 props 接受 notes 和 graph；新外围组件能够只派生这两项并保留现有 appearance/pet props（推断）。但现有 selectedId 在内部，外围组件无法获知点击选择；内部详情从 `layout.edges` 读取，因此把 graph edges 减量也会减掉所显示的证据。
- 真正“只减少画线、完整依据仍保留”的窄集成需要两个明确输入用途；当前没有这个公开接口。单靠外围传递减量 graph 不能声称实现二者分离。
- scene 只有 UUID 聚焦。主题代表记录可使用已有 focus(UUID)（推断）；它距离固定 180，不能保证涵盖整组 bounds。真实整组适配需要提供组 bounds，现有 `fit()` 用的是当前 layout.bounds。
- 二维局部 1/2 跳及依据类型过滤可由 `GraphModel` 构建邻接/遍历（推断）；当前不存在该函数或状态。边可能同时有标签和正文证据，类型筛选不能把两种证据误定义为互斥。
- 局部 2 跳是在稀疏展示图内的 2 跳，不能标成全量语义知识或真实因果路径。
- pet-space-customization 当前拥有 `SpatialNoteMap.tsx` 的外观配置、`spatialScene/spatialModels` 与 `App` 偏好接入；日历拥有 Record* 模块。本调研未修改这些文件，最小跨任务接入只能由相应 owner 合并窄 import/props/UI 接口。

## D. 文档对照与已观察的问题

- 已读 `docs/Note.Graph.md`、`docs/Spatial.Experience.md`。与当前源码的共享本地关系、无持久化布局、资源预算、暂停与静态操作原则相符。
- Spatial 文档描述 0.6.0；当前 package.json 是 0.7.0，源码已有模型/背景/光晕/流光及宠物形象 props。说明这些进行中事实尚未反映在旧版本 Spatial 文档，不把其误写为正式发布能力。
- 2D 与 3D relations 的数据、线型和详情用途高度重叠，主要区别是空间坐标与相机操作；源码尚没有“主题概览 vs 局部证据阅读”的职责划分。
- time 使用创建时间，源码明确提示“不是什么计划日期”。与日历到底重叠多少还需另一只读调查，未读取 Record* 主体，不作事实结论。
- 筛选保留 GraphNode group，却不保留 3D 坐标：`spatialLayout.ts:27-28` 根据当前筛选集合重算 groups/groupRanks，组槽位与 reach 也依据当前集合重新计算。
- 本轮最小实际命令复现：原两组 a/b 的 b 坐标为 (-119.40,109.55,42.63)；只筛选 b 后同 UUID 为 (34.71,17.79,-56.4)。相机保留不能表述成点位置保留；主题过滤也面临同一空间连续性边界。
- time 模式相同创建日期下 x 相同，同分组 y 扰动只有 ±13、同 done 的 z 扰动只有 ±18。1000 点测试只证明有限坐标和全节点，不证明无遮挡（由坐标范围推断可能拥挤）。
- 2D 每帧显示标题时逐节点 notes.find，3D 详情逐边 notes.find；此处仅记录当前事实，未测性能影响，未改动。

## E. 验证入口及本轮结果

项目测试入口是 `npm test`（`node --test tests/*.test.mjs`），Web 构建是 `npm run build`。本调研没有修改代码，没有运行全项目构建或 native 验证。

本轮实际执行：

```powershell
node --test tests/noteGraph.test.mjs tests/graphRequests.test.mjs tests/graphFocus.test.mjs tests/graphGeometry.test.mjs tests/graphScoring.test.mjs tests/spatialLayout.test.mjs tests/spatialRuntime.test.mjs
```

退出码 0；完整 TAP 输出 44 tests / 44 pass / 0 fail / 0 skipped。计分访问实际日志为 100 点 1000 次、200 点 2000 次。输出保留 Node `stripTypeScriptTypes` ExperimentalWarning，不能把 warning 省略成无警告。

覆盖：关系模型/全 UUID/投影/安全纯文本；请求旧响应、取消、超时、错误、Worker 阈值；token 定位；真实 D3 受控鼠标拖动和平移 owner；历史关系模型完全等价/计分访问预算；空间确定性/度数/日期/空及 1000 点有限坐标；RAF 30fps 调度、dt、政策和像素预算。

额外测试已读取但本轮未执行：`spatialAppearance.test.mjs` 的偏好读写/损坏值；`spatialModels.test.mjs` 的几何/实例 UUID 命中/资源释放。它们属并行空间外观范围，不将只读阅读当作验证。

工具失败保留：一次 `rg -n 'test\(' tests/graph*.test.mjs tests/spatial*.test.mjs` 在 Windows 报文件名语法错误，退出 1；改为 `rg -n 'test\(' tests -g 'graph*.test.mjs' -g 'spatial*.test.mjs' -g 'noteGraph.test.mjs'` 后退出 0。失败是命令参数通配符展开，不是功能测试失败。

## G. 不确定点与验证未知

- U1：当前真实浏览器/WebView 的多节点标题、深浅主题、拖动/缩放、节点重叠、阅读舒适度。本轮只读代码与纯测试；需实际图界面操作及截图确认。
- U2：2D 1/2 跳过滤和 3D 主题导览的最终行为/命名尚未设计；本轮只列现有数据和接口，不把推断写成实现。
- U3：完整证据与减少画线能否通过空间 owner 的窄接口隔离；当前 props 无单独显示边接口，需 owner 确认接入形状。
- U4：3D 与日历的最终职责是否重叠；需合并日历 agent 的 Record* 事实，不能由本报告断言日历能力。
- U5：WebGL/GPU 帧率、耗电、长期切换内存、原生 GUI 与多点触摸。RAF 限制和资源释放代码、纯测试均不构成设备实测。
- U6：筛选/主题聚焦后空间坐标移动是否接受，以及 group focus 的视野覆盖。已复现坐标变化，但没有产品约定或实际舒适度证据。
- U7：并行空间外观和日历提交的最终合并形态。这里是读取时的工作树事实，变更接入前应复核 owner 最新实现，禁止覆盖既有工作。

## H. readiness reviewer 最小证据

| 核查项 | 最小锚点 | 结论类型 |
| --- | --- | --- |
| 唯一笔记与筛选数据 | `src/App.tsx:109-112,186-211` | 观察事实 |
| 两种证据/稀疏边/全节点 | `src/noteGraphModel.ts:22-153`、`tests/noteGraph.test.mjs` | 源码观察 + 本轮测试 |
| 更新不能冒充旧关联 | `src/useNoteGraph.ts:30-128`、`tests/graphRequests.test.mjs` | 源码观察 + 本轮测试 |
| 2D 投影及全图底层线 | `src/NoteGraph.tsx:40,76-155,324-343` | 观察事实 |
| 3D 选择/详情与外观 owner | `src/SpatialNoteMap.tsx:61-104,118-158` | 观察事实 |
| 3D 接口无独立显示边/组聚焦 | `src/spatialScene.ts:19-23,103-165,286-299` | 观察事实 |
| 筛选重排点坐标 | `src/spatialLayout.ts:25-56`，本轮两组→单组命令输出 | 已复现事实 |
| 当前纯测试状态 | 上述完整 node --test 命令，44/44，退出 0 | 本轮直接证据 |
| 用户可见舒适度和设备能力 | U1/U5/U6 | 尚未验证 |
| 外围组件/局部遍历可行性 | C 末尾的明确推断段 | 推断，未实施 |

本报告不能单独给 readiness PASS；U2/U3/U4/U6/U7 需 parent 在方案/合同阶段合并事实或明确取舍，U1/U5 需纳入实施后验收边界。未发现必须现在向用户拍板才能继续只读调研的问题，不新增无阻塞 clarifications。

无新增跨功能事实候选：本报告的长期约束已存在项目协作说明或现有文档；其余为本任务局部事实、进行中状态和未验证观察。
