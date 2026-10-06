# 3D 记录空间与动态宠物：代码库调研

日期：2026-10-04。阶段：Researching。本文仅记录源码、配置和已有证据的事实，不包含方案或实现。

需求以本目录 README 的最新纠正为准：动态宠物属于晴笺自己的功能；原先“机器人”的理解已撤销，3D 地图与多维动态展示仍在范围内。用户授权自主执行常规技术选择，不存在等待用户答复的调研阻断。

## 基线与调研方法

- 唯一实现基线为 `C:/Users/ZXL/AppData/Local/Temp/qingjian-spatial-20261004/before`，对应同级 `manifest.json` 的 89 个文件。本文 `src/...:行号`、`package...`、普通 `docs/...` 锚点均指这份快照，不能解释为 HEAD 或后续实施源码。
- 本 agent 独立逐文件 SHA256 核对：89 份快照、0 份不匹配，PowerShell 命令退出 0。未读取 Git 历史、未运行 Git 操作、未接触真实数据库、未安装依赖、未控制用户 UI。
- 当前目录 README 是任务授权资料；另只读搜索工作区 `docs/current`、`docs/archive`，用于查找此前宠物/机器人记录。相关生产实现仍以快照为准。
- `Get-Content`/`rg` 读取了下列实际实现。大批输出曾被工具截断，关键文件随后按文件或行段重新读取。一次 `ConvertFrom-Json` 读取 lock 失败：npm lock 根包使用空字符串键，PowerShell 需要 `-AsHashtable`；当次非终止错误令命令末尾显示 exit 0，不能视为解析成功。已用 `ErrorActionPreference=Stop` 和 `-AsHashtable` 重跑，读取实际锁定版本与哈希核对命令退出 0。
- 没有运行构建或业务测试；本文引用旧测试/界面/制品结果时均明确属于已有文档证据，不作为本轮验收结论。

## A. 系统边界与现有能力

### A1. 已观察到的产品与存储边界

晴笺是本地优先 React + TypeScript + Vite 笔记/账本，Tauri 2 桌面版本桥接 SQLite。所见即所得编辑器持久化受限纯文本，不能直接保存或展示任意 HTML；只有主动向晴笺 AI 提问才允许发送本地摘要（`AGENTS.md` 工作边界，`App.tsx:54–56、212–217`，`desktop.ts`）。

App 当前视图只有 `graph | all | trash | ledger | settings`，默认进入记录页。主导航只有记录、关联图、账本；回收站和设置位于工具区（`App.tsx:21、26、144–175、178–185`）。没有 3D 视图、宠物页面、浮动宠物、角色状态机、机器人模型或宠物素材注册入口。

`README.md:36–56` 与 `docs/Project.Progress.md:72–85` 记录当前能力：有限格式、日期、完成、草稿、回收、精确标签/正文查找、排序/置顶、账本、浅深主题、PWA、2D 关联图。没有独立阅读入口、附件、同步、历史版本或地理坐标功能。

### A2. 当前图的语义边界

- 图表示**笔记记录之间的本地关系**，不是现实地理地图。现有 `Note` 没有经纬度、地名、空间坐标、附件或机器人/宠物字段（`types.ts:3–15`）。
- `GraphInput` 仅为 `{ id, content }`；`GraphNode` 为 `{ id, group }`；`GraphEdge` 为 `{ source, target, sharedTags, similarity? }`。模型没有布局坐标、时间轴、任务状态或完成度（`noteGraphModel.ts:4–7`）。
- 共同标签来自原记录内容，属于事实依据；正文相近来自本地 Unicode 2/3gram TF-IDF/余弦计算，属于词面推断，不能称为语义理解（`noteGraphModel.ts:23–59、74–113`）。
- 每条有效记录保留一个 UUID 节点；标签/正文各主动选择少量邻居，合并成稀疏边。分组为稀有主标签、相互较强的无标签正文关联组，或独立记录；这些分组不证明主题正确（`noteGraphModel.ts:74–77、111–133`，`docs/Note.Graph.md` 数据边界）。
- 无标签/空正文/同名不同 ID/孤立记录不会被图删除。当前筛选只投影节点和两端都可见的关系，不重新解释分组（`noteGraphModel.ts:137–143`）。

### A3. 与动态宠物有关的现有能力

现有全局动态偏好、页面可见性、系统减少动态效果和交互暂停状态由 App 所有；Motion 只负责按钮反馈与既有装饰拖动 helper。不存在宠物生命值、养成、通知、聊天代理、后台进程或 OS 桌面悬浮窗口。

`AmbientNodes.tsx` 虽有 `depth` 字段和 Canvas 光点 sprite，但仅为 2D 视差装饰；全源码引用搜索只有它自身导出，App 当前没有挂载它。App 背景实际使用 `.workbench-light` 的三个 CSS 光场（`App.tsx:176–177`，`styles.css:300–308`）。它不能作为已实现宠物或真 3D 的证据。

### A4. 历史检索范围

对快照 `src`/`docs`/`README`/`package` 搜索 `pet|robot|机器人|宠物|3d|three|babylon|gltf|r3f|sprite`；对工作区全部 Markdown 文档追加搜索 `机器人|宠物|robot|codex.*pet|WebGL|three`。除本轮新需求 README，未找到宠物/机器人实现或旧宠物需求稿。既有 Three.js/Sigma 文档只是曾比较或明确未选的候选；`sprite` 命中仅为光点贴图，英文 `three` 的测试标题不是 3D 引擎。

该结论仅覆盖可读工作区与上述快照，不声称查遍聊天历史、远端分支或 Git 历史。此前“我之前说的”具体外观没有可核查资料；最新授权允许自主实现，不构成阻断。

## B. 入口与主流程

### B1. 启动与 App 状态

`main.tsx` 立即注册 PWA Service Worker，再在 React StrictMode 中挂载 App。`package.json` 提供 `npm run dev/build/test/desktop/desktop:build`；桌面配置 dev URL 为 localhost:1420、构建目录为 dist，默认窗口 1200×780、最小 780×600（`vite.config.ts`，`src-tauri/tauri.conf.json`）。

App 从浏览器存储加载 `notes/transactions`；桌面就绪后加载 Tauri 数据。笔记及交易变动仍走原 `saveNotes/saveTransactions` 和桌面保存路径。显示层、筛选及图模型不拥有第二份业务记录（`App.tsx:25、54–56`）。

`viewContent` 单分支渲染当前页面；NoteGraph 通过 `lazy + Suspense` 只在图页挂载，离开时卸载，而 App 仍存活（`App.tsx:19、144–175`）。App 外壳依次含背景、顶栏、快捷标签、workspace、文件导入 input、编辑器、AI drawer、快开、标签 picker、toast（`App.tsx:176–202`）。这些是现存的应用级呈现位置事实，尚未给宠物分配入口或层级。

### B2. 记录、筛选与图模型

1. `activeNotes` 由完整 `notes` 排除回收站；`visibleNotes` 使用 `selectNotes` 做 query/精确标签/未完成/回收站组合筛选（`App.tsx:83–84`）。
2. `selectNotes` 保留源数组顺序。搜索从受限解析器提取可见正文，连接原标签并小写字面查找；精确标签仍使用原名称比较（`recordTools.ts:25–43`）。
3. `useNoteGraph(activeNotes, view === 'graph')` 目前仅在关联图视图启用（`App.tsx:85`）。关系模型基于全活动集合；给 NoteGraph 的 `notes` 则是全量筛选结果，**不受卡片 60 条显示批次限制**（`App.tsx:157、165–174`）。
4. `semanticSnapshot` 排除已删记录、只抽取 id/content，并按 ID 排序。done、日期、pin 和源数组顺序不进入模型 key；正文或 ID/删除变化才改变语义输入（`noteGraphModel.ts:18–21`）。
5. 小输入同步运行同一纯模型；≥24 条或原正文总 UTF16≥8000 使用专用 module Worker。请求单在途、只保留最新待处理项，版本/取消守卫拒绝旧结果；失败或 10 秒超时终止 Worker，当前关系清空并支持 retry（`useNoteGraph.ts:22–106`）。
6. Hook 仅在 enabled 时提交最新输入；enabled 变化或卸载取消请求。key 不同的旧模型不会暴露给当前 render（`useNoteGraph.ts:109–127`）。`projectGraph(null, visibleIds)` 仍生成全部可见 `pending` 节点且无边（`noteGraphModel.ts:137–143`）。

### B3. 当前绘制、交互与生命周期

`NoteGraph` 目前是 Canvas 2D + d3-force/zoom/drag/selection。它把纯模型复制成独立模拟节点，手动 tick 停止默认 D3 timer；每帧只更新闭包数据与会话 ref，不 setNotes 或写 SQLite（`NoteGraph.tsx:47–75、153–170、256–273`，`graphGeometry.ts:simulationCopies`）。

选中 ID 是 NoteGraph 自身 state；节点不再可见时清空。位置和 `{k,x,y}` 相机存在 App 的 `graphSession` ref，切换页面后的再挂载可恢复；选中 ID、动态 phase 没有同样的跨页保存（`App.tsx:46`，`NoteGraph.tsx:39–45、54–55、71–74`）。

滚轮/多触点用于缩放，非节点空白用于移动视野，单触点节点可以拖动；命中坐标通过相机反变换。触屏实际表现尚没有本轮证据（`NoteGraph.tsx:172–225`）。当前 scaleExtent 为 0.2–4，适配全图与居中定位通过 D3 transform；布局本质仍是 x/y（`NoteGraph.tsx:178、226–255`）。

图卸载先失效 owner，再取消自身鼠标 pan/drag 监听、RAF 和 simulation，断开 ResizeObserver、移除自身事件并缓存镜头/位置。`graphGeometry` 取消操作核对监听函数身份，避免清空其他 owner（`NoteGraph.tsx:302–317`，`graphGeometry.ts:capture/cancelOwnedMouseGesture、capture/cancelOwnedPanGesture`）。

图 RAF 最多 30fps、dt≤50ms，DPR≤1.5、Canvas 总像素≤250 万，≥500 节点减少装饰粒子和非邻近发光，但保留节点/基础边（`NoteGraph.tsx:111–146、153–170、281–290`）。这些属于实现限额，不能当作 GPU/耗电或新 3D 性能测量。

### B4. 全局动态与弹层边界

- `ambientEnabled` 默认开启，存 `luma-ambient-motion`；`reducedMotion` 实时监听 media query；`pageVisible` 实时监听 document.visibilitychange（`App.tsx:31–34、47–51、60–66`）。
- `motionAllowed = ambientEnabled && !reducedMotion && pageVisible && !composer && !quickOpen && !tagPickerOpen && !aiOpen`。它供 `SoftInteraction`、app-shell CSS、NotesView 和图 animate 使用（`App.tsx:86、158、166、176`）。
- `sortingEnabled` 独立于 ambient/reduced；业务排序在关闭动态时仍可用，但后台/弹层时禁用（`App.tsx:87、125–129`）。
- 图 `animate=false` 会停止持续帧调度并画静态帧；`visible=false` 连静态画也跳过。暂停不移除静态缩放/文字选择/节点业务拖动入口（`NoteGraph.tsx:75、85–86、164–170、178–225、322`）。
- App 的 `motionAllowed` 没有 window blur 状态；`SoftButton/useSoftDrag` 单独监听 blur 取消自身反馈。不能把这些 helper 的 blur 边界推为图、未来宠物或全应用 RAF 的事实（`SoftInteraction.tsx:14–19`）。
- Modal 锁定 body 滚动、圈定 Tab 焦点、关闭恢复原焦点；编辑器/快开/标签 picker 使用现有 modal 通道，AI 是单独的固定 drawer（`Modal.tsx:3–30`，`App.tsx:196–200、217`）。
- 全局 Escape 与 Ctrl/⌘ K 忽略 IME/repeat；现有编辑/AI/标签状态可阻止快开（`App.tsx:67–82`，`recordNavigation.ts:13`）。

### B5. 记录查看与编辑入口

图文字 select 可选全部可见 UUID；详情使用既有 `renderMarkdown(withoutTags(...))` 展示安全正文，已有标签、关系依据、编辑、定位、移至回收站（`NoteGraph.tsx:324–343`）。

App 的 `editLatestNote(id)` 从 `notesRef.current` 再查有效记录后打开原 NoteComposer；`trashNote` 走已有软删/撤销；`saveNote` 仍通过唯一 notes state 写入（`App.tsx:132、136、139–143`）。详情回调接收 ID，不需要生成另一份持久笔记。

快速打开可直接编辑，或清筛选后切到关联图定位；图详情定位保留筛选。定位 token 单次消费，等待模型/尺寸，旧请求/卸载不回报新目标（`App.tsx:103–118`，`graphFocus.ts:1–25`）。这是目前 **2D 关联图** 定位契约，尚没有 3D 镜头或跨展示模式定位行为。

## C. 关键模块与职责划分

| 模块 | 当前职责与依赖 |
| --- | --- |
| `src/App.tsx` | 业务数据、视图/筛选/主题/动态政策、弹层、图 session 与原编辑/保存/回收回调；唯一页面编排 |
| `src/useNoteGraph.ts` / `noteGraph.worker.ts` | 生命周期有界的本地关系请求；小输入同步/大输入 Worker；拒绝旧结果/重试 |
| `src/noteGraphModel.ts` | 纯 id/content → 无坐标 GraphModel；projectGraph 依可见 UUID 投影 |
| `src/NoteGraph.tsx` | 当前 2D Canvas、D3 模拟和交互、静态/动态调度、文字详情与可解释依据 |
| `src/graphGeometry.ts` | 2D 坐标/相机、颜色、独立模拟副本、受控鼠标 gesture 清理；不是空间或宠物模型 |
| `src/graphFocus.ts` | token 驱动的单次定位等待/消费状态；镜头实现由画布 owner 提供 |
| `src/recordTools.ts` / `noteText.ts` | 正文/标签安全抽取、共享查找与词面标准化 |
| `src/recordNavigation.ts` | 全标签、UUID 查找/最新编辑复核/输入法键守卫与焦点移交 |
| `src/NoteFilters.tsx` | 共享全部/未完成、标签、query 结果数与清除界面 |
| `src/SoftInteraction.tsx` / `softMotion.ts` | Motion button 按压、旧装饰轻拉与取消复位；context 授权来自 App |
| `src/Modal.tsx` | 锁滚动、Tab trap、焦点恢复和 backdrop 关闭 |
| `src/types.ts` / `store.ts` / `desktop.ts` | 业务 Note/交易/备份类型、浏览器持久化和 Tauri 调用边界；没有宠物/布局持久 schema |
| `src/styles.css` | 主题/工作台/图布局、动效禁用、响应式、层级与有限手势区 |
| `src/main.tsx` / `vite.config.ts` | StrictMode/Service Worker 注册、PWA manifest 与构建配置 |

## D1. 可以观察到的维度与状态

`Note` 当前具有 `id/content/status/createdAt/updatedAt?/scheduledDate?/done/deletedAt?/pinned?`。标签由 content 提取而非独立字段，顺序就是 App 完整数组；这些是现存的事实维度，不是已经存在的多维空间布局（`types.ts`，`recordTools.ts:8–21`，`docs/Note.Ordering.md`）。

GraphModel 独立于 date/done/pin；图纯模型不携带这些字段。App 仍同时持有原 Note，所以读取原记录元数据与关系模型是两个现存数据通道。关系不会因 UI 坐标变化生成，布局不会改变 Note/关系证据。

当前图 session 类型为 `positions: Map<string,{x,y}>; camera:{k,x,y}|null; fitted:boolean`；没有 z、相机 target、投影方式或跨刷新持久化。`AppData.version=1` 只含 notes 和 transactions（`types.ts:30–34`，`graphGeometry.ts:5–7`）。

## D2. 现有配置与界面约束

- `styles.css:11–16` 定义深色主题；`App.tsx:57` 将主题写入 document dataset 与 `luma-theme`。
- `.app-shell` 建立隔离层；最终 workbench 规则从 `styles.css:299` 开始，覆盖较早 sidebar 布局。不能仅根据旧 sidebar CSS 推断当前 UI。
- 当前层级：背景 z=-1、AI drawer z=30、排序浮层 z=35、Modal z=40、toast z=50（`styles.css:27、143、229、232、301、378`）。没有宠物覆盖层级。
- 桌面 workbench 最大 1520px/content 最大 1440px；≤900px 导航换行；≤720px 内容 16px padding、单列图/详情、图高 max(340px,52vh)；body 最小 320px（`styles.css:19、309、324、434–459`）。
- `touch-action:none` 仅用于独立排序抓手和现有图 Canvas；普通正文没有全局手势禁用。旧 coarse-pointer CSS 展示常显动作；基线没有宠物 PointerEvent/capture 手势（`styles.css:260、350、391`）。
- `.motion-disabled` 对本 shell 的所有动画/transition/scroll-behavior 统一禁用，系统 reduce 也有 CSS 规则；JS RAF 仍需要 owner 自己响应停止（`styles.css:295–298、307–308、460`）。

## E. 外部依赖与构建边界

| 已锁定包 | 基线 lock 版本 | lock 许可 |
| --- | --- | --- |
| React / React DOM | 19.3.0 / 19.3.0 | MIT |
| Motion | 14.0.0 | MIT |
| d3-force / zoom / drag / selection | 各 3.0.0 | ISC |
| Vite | 8.3.0 | MIT |
| vite-plugin-pwa | 1.3.0 | MIT |

`package.json` 不存在 Three.js、R3F、Babylon、react-force-graph、宠物 SDK 或 glTF loader；lock 中 `three` 和 `@react-three/fiber` 也不存在。`public/third-party-licenses` 的 12 份快照文件为现有 Motion/dnd-kit 闭包及 tslib/preact 许可文本，没有新 3D/宠物素材许可。

`vite.config.ts` PWA 配置为 `registerType:'autoUpdate'` 与中文 standalone manifest；没有自定义运行时缓存/远程资源缓存、precache 体积覆写或更新提示流程。`main.tsx` 使用 `registerSW({immediate:true})`。从源码能证明现有 SW 接入，不能证明未来大 3D chunk、WebGL 或外部资产离线可用。

Tauri 使用本地 dist，不提供宠物后台窗口或特殊 3D bridge。CSP 当前为 null；前端可见网络路径是 `desktop.ts` 的主动 AI invoke，3D/宠物没有任何当前网络通道。研究可读信息没有证明实际用户 GPU、WebGL 上下文兼容或长期耗电。

## F. 已阅读文档与已有验证范围

- 项目 `AGENTS.md`、本轮 `docs/current/spatial-note-map/README.md`。
- 基线 `README.md`、`CHANGELOG.md`、`docs/Project.Progress.md`、`docs/Note.Graph.md`、`docs/Soft.Interaction.md`、`docs/Workbench.Layout.md`；关系/排序事实同时核查实际源码，不把历史计划当现状。
- 只读检索工作区 `docs/current` 和 `docs/archive`；Three/Sigma 旧比较命中为历史参考，未拿它们替代本轮业界调研。
- 快照测试 `noteGraph.test.mjs`、`graphRequests.test.mjs`、`graphGeometry.test.mjs`、`graphFocus.test.mjs` 的测试名/契约与相应真实函数核查。它们覆盖纯模型、可见投影、请求/取消、坐标和 mouse D3 清理/定位；没有真实 WebGL、宠物、GPU/触屏测试。

`README.md:69–77` 与 `docs/Project.Progress.md:10–18` 记录 0.5.5 89 项纯测试及构建/UI/Windows制品证据，也明确保留初红、夹具错误、工具错误、chunk 警告和原生/GPU/触屏未测。本文没有重跑这些历史测试，未把旧绿色证据用作本轮新功能通过。

`docs/Note.Graph.md` 标出旧关联图性能限制：500 条随机汉字构图 p95 881.34ms、1000 条 2188.19ms，500 条未达 300ms 候选；Worker 解决主线程位置不等于总等待预算达标。文档的 30fps/DPR/像素上限也不是实际 GPU 帧率。新增展示不能从历史截图或这些上限推导性能结论。

## G. 不确定点清单

| 编号 | 未知 | 确认途径与当前影响 |
| --- | --- | --- |
| U1 | 用户此前提及宠物的具体外观/行为不在当前工作区记录中 | 已搜索所有可读 Markdown 与基线源码，未找到旧稿；最新“自主开发”授权允许常规选择，无需阻断。验收时可据成品确认喜好 |
| U2 | 本机原生 WebView/GPU 对新的 3D 渲染与上下文丢失的实际表现 | 需要新实现的浏览器/生产 WebView 现场验证；当前只证明 2D Canvas 通路 |
| U3 | 用户真实活动记录规模及正文长度分布 | 只读调研没有读取真实数据库/UI，不能拿示例或旧合成测量代表真实规模；由 root 授权范围内现场验证承接 |
| U4 | 新渲染/宠物外部参考的版本、许可、资源体积、离线缓存与生命周期能力 | 由独立业界/GitHub调研提供原始来源；本库目前没有这些依赖/资产 |
| U5 | 窄屏/触屏、系统 reduce/hidden/blur/弹层及拖拽中途切换的新功能表现 | 需要新 owner 的验证与实际 UI，不沿用现有 helper/2D 鼠标绿例 |
| U6 | 3D 页的具体多维编码、入口命名、宠物行为与是否保存其位置 | 属于尚未出现的实现/设计，而非当前代码事实；用户已授权 root 自主技术选择，本报告不提前给出方案 |

U1/U6 无等待用户问题；其余为实现/验收资料未知，不阻断源码调研交接，但 readiness 不能将其视作已获现场证据。

## H. 给 readiness reviewer 的最小可核查证据

以下均是**已观察到的源码事实**；根目录均为只读 baseline `C:/Users/ZXL/AppData/Local/Temp/qingjian-spatial-20261004/before`：

| 要核查的事实 | 最小锚点 |
| --- | --- |
| 当前入口、单视图分支与 App 级 UI 层 | `src/App.tsx:19、21、144–202` |
| 唯一 Note/交易来源、原持久化路径 | `src/App.tsx:25、54–56、132`；`src/types.ts:3–15、30–34` |
| 共享筛选与全活动集合图分析、仅图视图启用 | `src/App.tsx:83–88、157–162`；`src/recordTools.ts:25–43` |
| 无坐标关系模型、事实/词面、分组及完整可见投影 | `src/noteGraphModel.ts:4–7、18–25、74–77、111–143` |
| Worker 阈值、请求版本/取消/错误重试 | `src/useNoteGraph.ts:22–106、109–127` |
| 2D 会话 ref 与独立模拟副本 | `src/App.tsx:46`；`src/graphGeometry.ts:5–7、simulationCopies`；`src/NoteGraph.tsx:54–75、256–273` |
| 全局 motion 政策与 CSS/JS 的分别停止 | `src/App.tsx:31–34、47–51、60–66、86–87、176`；`src/styles.css:307–308`；`src/NoteGraph.tsx:75、153–170、322` |
| blur 只在 Soft helper 而非 App 连续动画政策 | `src/SoftInteraction.tsx:14–19`；`src/App.tsx:86` |
| static/touch/owned cleanup 边界 | `src/NoteGraph.tsx:172–225、302–317`；`src/graphGeometry.ts:capture/cancelOwned...`；`src/styles.css:350、391` |
| 原查看/编辑/回收与 token 定位 | `src/NoteGraph.tsx:324–343`；`src/App.tsx:103–118、136、139–143`；`src/graphFocus.ts:1–25` |
| 已有层级/响应式/主题 | `src/styles.css:11–16、143、229、232、299–324、378、434–460` |
| 现有依赖、PWA/Tauri 构建边界与不存在 3D 包 | `package.json`；`package-lock.json` 指定包记录；`vite.config.ts`；`src/main.tsx`；`src-tauri/tauri.conf.json` |
| 历史证据的保留失败和未测 | `README.md:69–77`；`docs/Project.Progress.md:10–18、95、108`；`docs/Note.Graph.md` 当前验证与限制 |

没有未标注的业务推断；U1–U6 仍未关闭。尤其“新的 3D/宠物可兼容/流畅/离线/暂停可靠”不是这份调研的事实结论，需 root 后续方案、实施和验证承接。

---

## 跨功能事实（待确认）

### 架构与约束

- [2026-10-04] App 的全局 `motionAllowed` 管开关、系统 reduce、hidden 与弹层，window blur 只由 SoftInteraction helper 处理；其他连续动画 owner 不能从 helper 推定自己已受 blur 管理。
- [2026-10-04] 当前关系模型严格基于 id/content，日期/done/pinned 不进入语义 key；新增记录展示若读取这些元数据，应区分业务 Note 与无坐标 GraphModel 的职责。
- [2026-10-04] 现有 PWA 使用默认 autoUpdate 配置且没有自定义大资源缓存条款；新图形/媒体制品是否进入离线缓存需要具体构建产物验证。
