# 笔记圆环导航：代码库调研摘要

调研时间：2026-10-06。范围：晴笺当前工作区与 `zaoxu001/celestial-wheel` 公开仓库。本文只记录观察事实和标明的推断，不表示功能已实施。

## A. 系统边界与现有能力

- 晴笺是 React + TypeScript + Vite 前端、Tauri 2 + SQLite 桌面端；当前 `Note` 仅有 UUID、纯文本内容、创建/更新/计划时间、完成/删除/置顶状态，没有圆环所需的独立持久化字段。见 `src/types.ts:3-13`、`src/App.tsx:38-40`、`src/App.tsx:88-89`。
- 记录正文在原编辑器所见即所得操作，提交时序列化为受限纯文本格式；详情渲染走 `renderMarkdown(withoutTags(...))`。见 `src/NoteComposer.tsx:31-36,53-61,148-158,181-189`、`src/SpatialNoteMap.tsx:181-185`。
- 当前“我的记录”有网格、阅读、日期三排版及每批 60 条；已有独立的二维关联图、三维空间的主题/创建时间/宠物三个视角。见 `src/NotesView.tsx:25-44`、`src/SpatialNoteMap.tsx:39-48`、`src/App.tsx:214-240`。
- 原仓库 README 称十二层同心环由 Three.js 实时绘制，字格运行时绘入 Canvas 纹理，支持平面/立体往复、聚焦、`dispose()`；MIT 许可，需 Three.js ≥0.160。来源：[项目 README](https://github.com/zaoxu001/celestial-wheel#readme)。晴笺已依赖 `three@0.186.1`，见 `package.json:30`。

## B. 入口与主流程

1. `App` 持有唯一 `notes` 状态；桌面启动时从 `loadDesktopData` 替换浏览器初始值，变化后写浏览器存储并调用桌面保存。`activeNotes` 排除回收站，`visibleNotes` 共用搜索/标签/未完成筛选。见 `src/App.tsx:38-40,88-89,120-123`、`src/recordTools.ts:23-44`。
2. `view === 'space'` 进入 `SpatialEntryBoundary`、`Suspense` 延迟加载的 `SpatialNoteMap`。它收到 `visibleNotes`、本地关系模型、可见性/动态许可、编辑和二维图跳转回调。见 `src/App.tsx:31-32,214-228`。
3. `SpatialNoteMap` 用 `projectGraph` → `buildSpatialLayout` → `buildSpatialThemes` / `projectSpatialExplore`，再把布局交给 `createSpatialScene`。选中 UUID 时右侧以原记录全文呈现，可编辑或转到二维图。见 `src/SpatialNoteMap.tsx:63-74,84-109,176-188`。
4. 二维关系模型仅在关联图或空间视图启用；少量输入主线程计算，达到 24 条或 8000 UTF16 字符的输入走 Worker。请求有版本、超时和取消边界。见 `src/App.tsx:122`、`src/useNoteGraph.ts:21-106,109-126`。

## C. 关键模块与可复用事实

| 模块 | 已观察到的责任与证据 |
| --- | --- |
| `App.tsx` | 导航、共享筛选、持久化、动态许可、UUID 编辑/定位回调；`src/App.tsx:120-149,214-240` |
| `SpatialNoteMap.tsx` | 三维展示模式、主题导航、当前选择/详情、文字选择和失败回退；`src/SpatialNoteMap.tsx:36-49,63-109,127-190` |
| `spatialLayout.ts` / `spatialExplore.ts` | 源记录与关系的派生坐标/主题，展示裁剪不写源数据；`src/spatialLayout.ts:22-65`、`src/spatialExplore.ts:9-44` |
| `spatialScene.ts` / `spatialRuntime.ts` | 独立 Three 场景、OrbitControls、拾取、动态许可、30fps 调度、DPR/像素限制及资源清理；`src/spatialScene.ts:23-40,79-90,193-235,237-287`、`src/spatialRuntime.ts:1-45` |
| `NoteComposer.tsx` / `NotesView.tsx` | 原编辑与卡片操作；`src/NoteComposer.tsx:31-36,165-193`、`src/NotesView.tsx:25-44,48-63` |

（推断）若圆环表示**记录主题、时间或关联**，空间视图是最接近的接入位置：已有懒加载、唯一笔记状态和筛选、Three.js、选择/详情/编辑回调以及失败回退。若“嵌入到笔记里”是指**编辑器正文内嵌可交互圆环**，现有纯文本保存与受限渲染边界不支持直接持久化该场景；是否要做嵌入块属于产品与数据模型决策，不能从现有代码推定。

## D1. 核心数据、状态和绘制边界

- `selectNotes` 先按删除、未完成、标签、正文/标签搜索筛选；当前空间传入完整匹配集，不能误用卡片的首批 60 条。见 `src/recordTools.ts:36-44`、`src/App.tsx:120-123,221`、`src/NotesView.tsx:25-29,43`。
- 当前三维主题来自原关系图的 group；标签分组显示原名，正文分组标为“词面分组”，独立记录保留各 UUID。积累轨迹使用 `createdAt`，不是计划日期。见 `src/spatialExplore.ts:9-26`、`src/spatialLayout.ts:36-57`、`docs/Spatial.Experience.md`“使用方式”。
- 三维场景目前用共享几何与 `InstancedMesh` 画记录点、批量线段和最多 128 个流光粒子（≥500 节点时最多 32 个）；点选通过 `instanceId` 映射 UUID。见 `src/spatialScene.ts:131-164,202-212`。这与原项目“每字格可聚焦”的展示对象不同，不能直接视作现成的多文字圆环引擎。
- 动态默认暂停；全局关闭动态、系统减少动态、页面隐藏、弹层、失焦共同控制持续绘制或交互。最多 30fps、DPR≤1.5、约 250 万像素；静态状态按需绘制。见 `src/SpatialNoteMap.tsx:75,123,163-170`、`src/App.tsx:63-66,120-125`、`src/spatialRuntime.ts:1-45`、`src/spatialScene.ts:64,79-90`。
- 卸载时释放 RAF、ResizeObserver、事件监听、pointer capture、Three 几何/材质/纹理、controls 和 renderer；context 丢失走失败状态。见 `src/SpatialNoteMap.tsx:84-96`、`src/spatialScene.ts:219-273`。圆环若新增独立场景，需要与这些现有资源边界协调（推断）。
- 图关系是本地派生，不写笔记或远程服务；当前空间错误时仍保留文字选择/编辑，入口加载错误可回记录或二维图。见 `src/useNoteGraph.ts:109-126`、`src/SpatialNoteMap.tsx:155-160,176-188`、`src/SpatialEntryBoundary.tsx:9-26`。

## E. 外部依赖与参考实现

- 运行时依赖 Three.js；现有项目本机使用它，无新增服务必需。`package.json:30,44`。
- 原 `celestial-wheel` 的接口将环内容、视图变换与页面宿主绑定为一个可创建/销毁对象，README 明确 `dispose()` 释放事件与 WebGL 资源。来源：[原仓库 README](https://github.com/zaoxu001/celestial-wheel#api)、[原源码](https://github.com/zaoxu001/celestial-wheel/blob/main/src/celestial-wheel.js)。原内容为固定典籍字格，晴笺内容为可增删筛选的 UUID 记录；直接复制其语义数据不适用（推断）。
- 现有文档已记录选型：空间采用 Three.js 按需绘制与 OrbitControls，未引入另一图布局 owner。见 `docs/Spatial.Experience.md`“选型及责任”。

## F. 已阅读文档

- `docs/Spatial.Experience.md`、`docs/Note.Graph.md`、`docs/Workbench.Layout.md`、`docs/Record.Garden.md`、`docs/current/celestial-note-wheel/README.md`。
- 原仓库 README 和源码页（上文链接）。

## G. 不确定点清单

- **U1 入口语义**：“嵌入到笔记里”指每条笔记正文内的小组件、记录页的新视图，还是现有 3D 空间的新模式？需用户确定，之后才能判定是否涉及持久化与编辑器。
- **U2 信息映射**：环层是主题/标签、时间、完成状态、关系层级或其它维度？需产品选择；当前数据可以派生多种视图，但各自传达的含义不同。
- **U3 操作目标**：用户看完圆环应能做什么：导航至记录、聚焦关联、回顾时间、还是进行筛选/整理？需用户选择；现有编辑器没有圆环内容块协议。
- **U4 效果强度**：是否要求原项目的自动立体展开和持续环转？现有空间默认暂停且全局减少动态有效；需确认期望与可访问性优先级。
- **U5 实测性能**：固定字格原项目与大量动态笔记数量/字长不同；本机 WebView、弱 GPU、长时切换与内容规模下尚无圆环实测，需原型验证。

上述待用户拍板项应进入 `clarifications.md`；本调研不将其视为已关闭。

## H. 给 readiness reviewer 的最小可核查证据

- **已观察事实**：入口及数据源 `src/App.tsx:120-123,214-228`；信息派生 `src/spatialLayout.ts:22-65`、`src/spatialExplore.ts:9-44`；生命周期 `src/spatialRuntime.ts:1-45`、`src/spatialScene.ts:219-273`；原编辑格式 `src/NoteComposer.tsx:148-158,181-189`。
- **推断**：现有空间适合作为圆环导航候选入口，但不是已批准方案；不确认 U1-U4 前不能宣称准备实施。
- **工作区保护**：调研开始时 `git status --short` 显示 `App.tsx`、`src/styles.css`、`src/store.ts`、多个文档和众多新增文件已有未提交变更；本次未覆盖这些文件，仅新增本调研文档。

---

## 跨功能事实（待确认）

### 架构与约束

- [2026-10-06] 三维空间已有集中式资源 owner、动态许可和文本回退；后续可视化应复核这些边界，不能只在场景中加入持续 RAF。来源：`src/spatialScene.ts:23-40,79-90,219-273`、`src/SpatialNoteMap.tsx:155-188`。
