# 笔记窗口、伙伴操作与待办调研

日期：2026-10-06。范围：当前工作区源码及相关当前文档；未对原生 GUI 做现场复现。此文只记录事实，不作方案设计。

## A. 系统边界与现有能力

- 晴笺是 React/TypeScript + Vite 前端与 Tauri 2 + SQLite 桌面端。笔记正文、计划日期、完成状态、删除状态、置顶状态统一保存在 `Note` 对象中（`src/types.ts:3-12`；`src-tauri/src/lib.rs:14,37,55,71`）。
- 当前工作区的主导航包含记录、记录时光、3D 空间、伙伴、账本；`View` 不含待办页（`src/App.tsx:34,237-246`）。记录页仍将“想法、待办和生活里的微光”并列描述，并可按“未完成”筛选（`src/NotesView.tsx:31-36`；`src/recordTools.ts:31,46-53`）。
- `PetCompanion` 目前有轻触、拖动、休息、唤醒、收起；轻触触发宠物心情反馈，未接笔记打开或今日事项（`src/PetCompanion.tsx:115-185`；`src/petBehavior.ts:1-22`）。独立的 `QuickOpen` 已支持正文/标签搜索、选择后编辑或图定位（`src/QuickOpen.tsx:1-44`）。
- 当前五位角色是代码 SVG 画像，文档明确说明不是真三维宠物（`docs/Spatial.Experience.md:23-27`；`README.md:56-58`）。工作区使用 Three.js 绘制记录空间，宠物画像由 `PetCharacters.tsx`/`PetCompanion.tsx` 负责，现有角色模型接入尚未实现。

## B. 入口与主流程

- 桌面窗口由 `src-tauri/tauri.conf.json:11-23` 声明，配置了标题、宽高与最小尺寸；没有显式 `decorations`、`transparent` 等主窗口属性。源码搜索未发现自绘标题栏或 `data-tauri-drag-region`。由此只能确认当前配置状态，不能在缺少原生 GUI 截图/复现时断言顶部黑边的具体来源。
- Web 根界面在 `src/App.tsx:235-267` 中绘制工作台页眉、搜索顶栏、内容视图、浮层宠物与弹层。`src/styles.css:301-330` 定义全窗口背景和页眉，`:323` 的 `.topbar` 无底边。用户已说明黑色区域位于“整个桌面窗口顶部”；它不能被直接等同于笔记卡片边框。
- 记录卡片点击正文调用编辑入口（`src/NotesView.tsx:48-61`），`App` 的 `editLatestNote`/`openRecord` 最终打开 `NoteComposer`（`src/App.tsx:139-147,168-173,262-265`）。后者仍是 `Modal` 弹层（`src/NoteComposer.tsx:1-2,35`）。
- 当前日期由 `recordTools.today()` 按本机时区产出 `YYYY-MM-DD`（`src/recordTools.ts:4-6`）；记录的日期字段为 `scheduledDate`，完成字段为 `done`。现有 `selectNotes` 只按搜索、标签、完成与回收站筛选，不单独识别待办类别（`src/recordTools.ts:31-53`）。

## C. 关键模块与职责

| 文件 | 已观察到的职责 |
| --- | --- |
| `src/App.tsx` | 主视图、记录/账目状态、桌面加载与保存、导航、编辑入口、宠物显示政策、快捷打开和弹层。 |
| `src/NotesView.tsx` / `src/NoteComposer.tsx` | 记录列表展示、完成切换、编辑弹层、日期与正文编辑。 |
| `src/PetCompanion.tsx` / `src/petBehavior.ts` / `src/PetCharacters.tsx` | 伙伴画像、拖动与轻触交互、动态/焦点政策、角色 SVG。 |
| `src/QuickOpen.tsx` / `src/recordNavigation.ts` | 快速查找记录及选择后编辑/定位。 |
| `src/types.ts` / `src/store.ts` / `src-tauri/src/lib.rs` | 数据对象、Web 本机存储/备份、原生 SQLite 持久化。 |
| `src-tauri/tauri.conf.json` / `src/styles.css` | 主窗口配置、Web 工作台样式。 |

## D1. 数据与状态

- `Note` 没有 `kind` 或独立待办对象；`status` 类型虽保留 today/tomorrow/later/none，但 Web 载入旧记录时统一改为 none，并给缺少日期的记录补日期（`src/types.ts:1-16`；`src/store.ts:13-24`）。
- Web 端 `exportData` 仅含 `notes`、`transactions`，备份版本为 1（`src/store.ts:38-49`）。原生保存通过整份数据写 SQLite，表结构和写入路径见 `src-tauri/src/lib.rs:37,55,71`。
- 浮层伙伴的位置和心情只在当前会话；显示偏好与已应用装扮各自保存在浏览器本机偏好中。已有文档说明伙伴不读取笔记（`docs/Pet.Wardrobe.md:59-65`）。

## E. 外部依赖与边界

- GitHub 上的第三方角色 3D 模型、文件格式、授权条款、原作者与再分发权尚待外部调研。本调研未作可用/可商用结论。
- 当前桌面窗口顶部外观仍需原生 Tauri 运行截图/行为证据确认。历史进度文档明确 0.7.1 制品仅做受控隐藏进程启动，未完成原生 GUI 验收（`docs/Project.Progress.md:3-9`）。

## F. 已阅读文档

`README.md`、`docs/Project.Progress.md`、`docs/Pet.Wardrobe.md`、`docs/Spatial.Experience.md`，以及本任务关联的源码文件。

## G. 不确定点清单

- **U1：顶部黑色区域的实际成因与尺寸。** 用户已定位为整个桌面窗口顶部；root 后续只读激活已安装的晴笺窗口并观察截图，确认黑色 Windows 原生标题栏含“晴笺”标题和最小化/最大化/关闭按钮，网页从其下方开始。已安装制品来源不同于当前工作区，当前源码改动仍须独立原生 GUI 复验。
- **U2：待办与笔记的关系。** 用户要求“待办事项之类的分明、列 todo list”，尚需确认待办是否独立数据类型，及现有记录的 `done`/`scheduledDate` 是否参与今日提醒。此项须落入 `clarifications.md` 并由 coordinator 记录用户答复。
- **U3：提醒触发范围。** “弹窗”可指应用内提示、系统通知或启动/跨日提醒；未见用户明确触发时机与静默策略。
- **U4：第三方角色 3D 资源的权利与技术适配。** 需核实仓库、许可、模型格式、动画、包体与运行性能；不能仅凭 GitHub 可见断言可复用。
- **U5：原生发布基线。** 当前工作区有大量已有修改与未跟踪文件，历史 0.7.1 隔离发布源和当前源码不同；需要 coordinator 确定后续验收与发布来源。

## H. 给 readiness reviewer 的最小可核查证据

- 已观察事实：`src-tauri/tauri.conf.json:11-23` 主窗口配置；`src/App.tsx:34-40,111-124,235-265` 视图、状态与入口；`src/types.ts:1-16` 和 `src-tauri/src/lib.rs:14,37,55,71` 数据边界；`src/PetCompanion.tsx:115-185` 当前交互。
- 用户已给出的事实：黑色区域在整个桌面窗口顶部。root 对当前已安装桌面版做了只读截图确认原生标题栏；由于版本来源未核对，这只能定位现象，不能替代本轮新源码验收。
- 未关闭 U2-U5；其中 U2/U3 为产品语义决策，U4 为外部资源核验，不能按本简报直接判定 readiness PASS。
- 执行调研前 `git status --short --branch` 显示 `main...origin/main`，且 `AGENTS.md`、README/CHANGELOG、多份源码及配置已修改，`docs/current/` 等大量文件未跟踪。本任务未还原、清理或覆盖这些已有内容；只新增本文件。

---

## 跨功能事实（待确认）

### 架构与约束

- [2026-10-06] 0.7.1 桌面制品来源是隔离发布副本，工作区还保留多条未发布源码增量；每次验收需写明来源，不能把旧制品当作当前工作区的原生 GUI 证据。
