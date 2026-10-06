# 笔记正文内三维宠物：代码库调研

2026-10-06。范围：只核对现有编辑、纯文本往返、保存、备份、展示与搜索链路；下文“落点”是受现有代码约束的最小接入边界，不是实施方案。

## A. 系统边界与现有能力

- 用户已明确“每条笔记正文中可插入”。本功能记录要求重新打开仍能看到插入结果，编辑所见即所得，底层保留可迁移纯文本，不能保存或渲染任意 HTML；模型限已接入的原创晴小团 GLB。见 [README.md](README.md)。
- `Note.content` 是单个字符串，`NoteDraft.content` 沿用该字段，`AppData` 将 `Note[]` 放入版本 1 备份；现有类型没有正文附件或嵌入节点字段。见 `src/types.ts:3-16,38-43`。
- 现有有限语义包括文本、代码、粗斜体、颜色、字号，以及段落、标题、空行、列表、引用、代码块；没有宠物或通用嵌入节点。见 `src/noteCodec.ts:1-16,147-180,193-231`。
- 现有三维宠物通过 `Pet3DView` 的 canvas、动态加载 `Pet3DScene` 和 GLB 显示；晴小团 URL 固定为 `pets/xiaotuan.glb`，其他角色模型仅开发态预览 URL。见 `src/PetCompanion.tsx:11-16,114-120`、`src/Pet3DView.tsx:7-14,18-75`。当前 `PetCompanion` 位于应用顶层，与笔记正文视图分离，见 `src/App.tsx:300-307`。

## B. 入口与主流程

1. **回填**：打开 `NoteComposer` 时优先读取该笔记草稿，其次读取 `note.content`；`withoutTags` 从正文分离普通标签；`markdownToEditorHtml` 通过 `parseNote`/`noteHtml` 生成受控 HTML 后写入 contentEditable。见 `src/NoteComposer.tsx:27-36,101-106`、`src/noteFormat.tsx:29`、`src/noteCodec.ts:232-244`。
2. **编辑与序列化**：contentEditable 的输入、组合结束及格式命令调用 `syncFromEditor`，由 `editorHtmlToMarkdown` 遍历活动 DOM，转成有限纯文本；保存时重新读取 DOM，不只依赖 React state。见 `src/NoteComposer.tsx:47-55,72-100,117-124,139-160`、`src/noteFormat.tsx:32-96`。
3. **草稿与提交**：正文变化时 `contentWithTags` 把正文和标签拼成字符串存入 localStorage 草稿；提交清除草稿，将同一字符串交给 `App.saveNote` 更新或新增 `Note`。见 `src/recordTools.ts:20-21`、`src/NoteComposer.tsx:107-124`、`src/App.tsx:206`、`src/store.ts:26-30`。
4. **持久化与备份**：`App` 在 notes 变化后保存 localStorage；桌面版同时把 `AppData` 交给 Tauri `save_data`。SQLite `notes.content` 是 TEXT，桌面端在事务中重写 notes 并按位置写入。导出 JSON 使用 `exportData`，导入把 `notes` 数组设为当前状态。见 `src/App.tsx:90-91,206,208-209`、`src/store.ts:14-25,42-57`、`src/desktop.ts:4-7`、`src-tauri/src/lib.rs:14,38-50,58-81`。
5. **展示与检索**：卡片、拖动预览、日期花园、图详情都调用 `renderMarkdown(withoutTags(note.content))`；年轮、图节点等摘要调用 `plainNoteText`。主搜索与快速打开共享 `noteSearchData`，它对去标签后的内容使用 `parseNote`/`notePlain`，再拼标签；缓存以 `Note` 对象与 `content` 为界。见 `src/NotesView.tsx:36-40,48-61`、`src/App.tsx:249-254`、`src/NoteGraph.tsx:156,363-367`、`src/CelestialNoteWheel.tsx:13,59`、`src/noteText.ts:5-9`、`src/recordTools.ts:25-43`、`src/QuickOpen.tsx:12-16,37-41`。

## C. 关键模块与接入边界

| 模块 | 已观察到的职责与事实 |
| --- | --- |
| `noteCodec.ts` | 有限纯文本语法、解析 AST、受控 HTML 回填、纯正文抽取；未知文本按字面保留，HTML 字符在输出时转义。`src/noteCodec.ts:147-190,193-253` |
| `noteFormat.tsx` | React 安全预览节点和活动 DOM → 字符串。对未知 HTMLElement 递归其子节点；空 `body` 直接丢弃。因此把 canvas/组件 DOM 直接塞进编辑器会在序列化时丢失，或只留下其文字。（推断）`src/noteFormat.tsx:5-29,42-57,75-96` |
| `recordTools.ts` | `#标签` 在代码区外识别与剔除；纯文本中若新增含 `#` 的标记，可能进入标签机制，必须核对。`src/recordTools.ts:8-21`、`src/noteCodec.ts:90-127` |
| `NoteComposer.tsx` | 编辑 DOM 由浏览器保有，React 不在每次输入时重写；格式工具依赖选区与原生 `execCommand`，组合期间禁止执行。插入交互节点会触及选区、光标、输入法和浏览器 undo 的既有边界。`src/NoteComposer.tsx:38-100,101-106,117-156` |
| `Pet3DView.tsx` / `Pet3DScene.ts` | 每个视图建立 WebGL renderer、ResizeObserver 与可选动画帧，卸载时清理资源；多个正文/卡片实例可能产生多个 WebGL 上下文和 GPU 开销。（推断）`src/Pet3DView.tsx:18-69`、`src/Pet3DScene.ts:19-26,65-82,121-137` |

**最小安全落点（推断）**：正文位置需要可往返的、受限且可识别的纯文本语义，经 `noteCodec` 解析为专用节点，并在 `noteFormat` 的活动 DOM 序列化、回填及 React 预览中保持同一语义；搜索和标签抽取需要定义该节点对应的可见文本与保护边界。只在预览层插入三维组件，无法保证编辑保存往返；直接持久化 canvas/任意 HTML 与项目约束冲突。依据为上述 A/B 链路及 `docs/Note.Formatting.md` 的“新增格式应同时验证”活动 DOM→纯文本、编辑回填、安全预览、正文抽取规定。

## D. 受影响面与风险

- **格式往返**：解析器目前没有嵌入语义；`editorHtmlToMarkdown` 对普通未知元素只保留子文字，空 DOM 返回空串。需验证插入后立即保存、重开、草稿恢复、复制、导入导出均不丢位置和身份。`src/noteCodec.ts:1-13,193-253`、`src/noteFormat.tsx:42-57,75-96`、`src/NoteComposer.tsx:107-124`、`src/NotesView.tsx:61`。
- **预览的交互容器**：卡片正文整体是 `button`，若渲染宠物的交互按钮或焦点控件，会形成嵌套交互内容。（推断）卡片、拖动覆盖层、花园、图详情都复用 `renderMarkdown`，各处是否启用互动需分别核对。`src/NotesView.tsx:39,58-61`、`src/App.tsx:249-254`、`src/NoteGraph.tsx:364`。
- **搜索/标签/摘要**：`notePlain` 决定搜索、快速打开、图谱和年轮可见文字；标签识别仅保护代码 span/围栏。嵌入标记若被当正文可被搜索和复制；若包含 `#` 还可能被识别为标签。（推断）`src/noteCodec.ts:90-127,245-253`、`src/recordTools.ts:8-18,25-43`、`src/noteText.ts:5-9`。
- **撤销与焦点**：当前格式和模板使用原生命令，浏览器持有撤销历史；选区只在编辑器拥有且节点仍连接时恢复。三维组件若在 contentEditable 内拿走焦点或经 React 改写 DOM，可能影响原生撤销、光标与输入法。（推断）`src/NoteComposer.tsx:38-100,101-106,126-156`；`docs/Note.Formatting.md`“原生编辑与撤销”。
- **资源与动画**：现有单个三维视图的装载/卸载已有完整生命周期；嵌入到多笔记预览时实例数量及页面隐藏、降动效策略需要核查。`src/Pet3DView.tsx:18-75`、`src/Pet3DScene.ts:65-82,121-137`、`src/App.tsx:300-302`。
- **旧版与备份**：当前备份结构可原样携带 `content` 字符串，但 `parseBackup` 只验证数组存在，不校验逐条正文；旧版本打开新语义时显示/再保存行为未证。`src/store.ts:42-57`、`src/types.ts:3-16,38-43`。

## E. 已读文档与测试证据

- 文档：`docs/current/note-embedded-pet/README.md`、`docs/Note.Formatting.md`。
- `tests/noteCodec.test.mjs:7-24,30-68,154-236` 覆盖现有行内/块级语义、代码保护、HTML 字面安全、纯正文；未见宠物嵌入往返用例。
- `tests/recordTools.test.mjs:34-49`、`tests/searchPreview.test.mjs:43-64` 覆盖现有可见字搜索、代码字面量、标签与首命中摘要；未见嵌入节点用例。
- `tests/todoBackup.test.mjs:5-30` 覆盖旧新版备份的 notes 数组和待办兼容；`src-tauri/src/database_tests.rs:104-125` 覆盖当前 SQLite 数据往返。上述测试不能替代 contentEditable 的真实 DOM、原生 undo 和 GPU 多实例验收。

## G. 不确定点清单

- U1：正文宠物是单个固定晴小团，还是每处保存外观/状态；用户只明确“每条笔记正文中可插入”。需要产品语义确认后确定持久化内容。
- U2：卡片、花园、图详情和拖动预览是否都显示可交互三维，还是其中仅展示静态替代。需要体验边界确认，并实测嵌套 button、焦点及性能。
- U3：插入点允许位于段落内、列表项、引用或代码区的哪些位置。需要确认编辑语义，再用真实编辑器验证跨块插入、删除、撤销与输入法。
- U4：旧 EXE 对新增纯文本语义的读取、再次编辑保存与备份往返行为未证；需用旧程序和升级数据副本实测。
- U5：同时可见多个嵌入宠物时 WebGL 上下文数量、显存、降动效及页面隐藏表现未证；需真实设备测量。

## H. 给 readiness reviewer 的最小可核查证据

- **已观察事实**：`Note.content` 为字符串 `src/types.ts:3-16`；DOM→字符串 `src/noteFormat.tsx:32-96`；字符串→编辑 DOM `src/noteFormat.tsx:29`、`src/noteCodec.ts:232-244`；保存与草稿 `src/NoteComposer.tsx:107-124`；SQLite `content TEXT` `src-tauri/src/lib.rs:38-40,58-81`；安全预览 `src/noteFormat.tsx:5-29`；搜索 `src/recordTools.ts:25-43`。
- **推断**：必须保持这组语义往返，并不能直接把三维 DOM 当持久内容；卡片按钮内互动与 WebGL 多实例存在风险。上文已分别标注。
- **未关闭**：U1–U5。它们涉及产品交互及兼容边界，不能据本调研直接认定方案就绪。

---

## 跨功能事实（待确认）

### 架构与约束

- [2026-10-06] 笔记所有主要入口共享 `Note.content` 的有限纯文本语义；新增正文格式需同步编辑 DOM 序列化、回填、预览和纯正文抽取。见 `docs/Note.Formatting.md`、`src/noteFormat.tsx:15-32`、`src/noteText.ts:5-9`。
