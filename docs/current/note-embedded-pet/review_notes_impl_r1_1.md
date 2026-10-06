# 正文晴小团实施后独立审查：r1 第 1 轮

- review_target: `impl`
- impl_round: `1`
- review_seq: `1`
- review_date: `2026-10-06`
- 评审输入：`clarifications.md`、`lwplan.md`、`review_notes_lwplan_2.md`、`impl_report_r1.md`，当前产品代码及测试差异。
- 协议结论：`REVISE`
- 业务结论：`IMPL_DEFECT`

## 实现与计划的对齐证据

| 链路 | 独立核对 | 证据边界 |
| --- | --- | --- |
| 纯文本及回填 | `src/noteCodec.ts:18-19,196-211,237-252` 只把围栏外首个精确独占行解析为受限 pet 块；`noteHtml` 生成固定宿主，`notePlain` 给出「晴小团」。`tests/noteCodec.test.mjs:69-88` 覆盖首个、围栏、转义、行内、未知和重复。 | 纯解析测试，不能代替真实 DOM 往返。 |
| 编辑 DOM 序列化 | `src/noteFormat.tsx:36-38,81-85` 仅将编辑根直接子级、固定 `data-note-pet` 且 `contenteditable=false` 的 `DIV` 转成一次固定指令；其它 HTML 不原样存储。第二个同形宿主序列化成转义字面行。 | 合法同形 HTML 粘贴可形成固定宠物语义，符合修订计划；具体原生粘贴、撤销与删块结果需 coordinator 现场记录。 |
| 安全阅读与检索 | `src/noteFormat.tsx:18-20` 使用 React 节点和静态 `PetPortrait`，无宠物 `innerHTML` 或阅读 WebGL；`src/noteCodec.ts:251-253`、`src/noteText.ts:5-9` 把搜索正文投影为可见名称。卡片复制读取预览的可见 DOM（`src/NotesView.tsx:60-63`）。`tests/searchPreview.test.mjs` 和备份测试覆盖可见检索与字符串导入。 | 未见从存储正文直接执行 HTML。卡片复制与各阅读入口视觉效果仍需 coordinator 实测。 |
| 外观及入口 | `src/App.tsx:251,258,266,307` 将已应用外观传给花园、图、卡片、编辑器；`src/NotesView.tsx:41,60` 与 `src/NoteGraph.tsx:365` 使用它；`renderMarkdown` 一处强制原创角色。编辑动效门 `ambientEnabled && !reducedMotion && pageVisible` 未复用包含 `!composer` 的全局门。 | 非默认衣橱状态跨入口一致性尚待现场观察。 |
| React 与 WebGL 生命周期 | `src/NoteComposer.tsx:128-143` 观察宿主加入/移除，只保留一套 React root；`src/Pet3DView.tsx` 有场景和 ResizeObserver 清理；阅读层不创建 renderer。 | coordinator 现场已观察到 React console 多次 `Attempted to synchronously unmount a root while React was already rendering`。同步 `root.unmount()` 的时序不可靠，属于本轮已见缺陷；资源释放仍待修复后复测。 |

本人在本轮独立执行 `npm test`，退出码 0；总计 141 项、通过 141 项、失败 0 项。测试输出包含 Node `stripTypeScriptTypes` ExperimentalWarning；命令和末尾汇总已读取。`impl_report_r1.md` 另记录 `npm run build` 退出码 0、构建体量警告以及原创 GLB 产物检查；这属于 impl 自证，不是本人重新执行的构建。coordinator 向本审查回传真实浏览器 console 的同步卸载报错；这是 coordinator 现场证据而非本人操作，不能被单测成功掩盖。`verification.md` 尚未落盘，其余现场结果仍未算作本人证据。

## 双结论字段

- `goal_lock_alignment: aligned`：单次普通正文插入、编辑三维、阅读静态、纯文本保存、可见检索均有代码落点。
- `anti_goals_touched: none`：差异没有第三方 GLB、新 schema/附件、HTML 持久化或编辑框架迁移；阅读宠物分支仅是 SVG。
- `authoring_ergonomics_check: pass`：工具栏按钮在光标处插入，非法位置给状态提示；原生历史是否可靠列在 coordinator 验收，不由静态审查代判。
- `declaration_readability_check: pass`：只有固定单行指令与一种角色语义；作者不用手写指令。
- `plan_defect_checkpoint_recommended: no`
- `plan_defect_checkpoint_reason: 同步卸载问题限于现有 S2/S3 已规划的 React root 生命周期处理，无需改变目标、任务或验收定义。`
- `impl_safe_validation_check: pass`：实施报告列出自证命令、退出码和不足结论；本审查独立复跑了测试。
- `coordinator_handoff_check: pass`：实施报告将浏览器、WebGL、主题、IME、旧版程序等真实环境验证逐项交接，且 coordinator 已在现场发现同步卸载报错；该失败已进入本审查结论。
- `基线与澄清一致性复核结果: PASS`：`clarifications.md` 没有未回答项；单条最多一处、原创角色、编辑三维及阅读静态符合用户答复后形成的基线。
- `设计味道扫描结果: FAIL: 嵌套 React root 在 MutationObserver 或 effect cleanup 中同步卸载，现场已见 React render 时序报错。另有非阻断观察：直接子级 DOM 宿主通过固定属性判别，额外子节点会被忽略；这是 lwplan 明示的同形粘贴合同，现场粘贴验收需包含人为构造的同形块。`

### 反目标禁止项核验

| 禁止内容 | 可核查证据 | 结论 |
| --- | --- | --- |
| 发布第三方模型 | `git diff --stat` 只有源码、测试、文档及 CSS；`src/NoteComposer.tsx:35` 固定原创 `xiaotuan.glb` | 未触及 |
| 任意 HTML 持久化/渲染 | `src/noteFormat.tsx:18-20,38,83-85` 固定指令和 React 节点；`src/noteCodec.ts:18-19` 固定宿主 | 未触及 |
| 新附件/数据库结构、重写编辑器 | 当前差异不含 `src/store.ts`、`src/desktop.ts`、`src-tauri` 或数据库文件；`NoteComposer` 仍用原 contentEditable | 未触及 |
| 列表大量 WebGL | `renderMarkdown` 宠物分支只调用 `PetPortrait`；`Pet3DView` 仅在编辑器宿主内 | 未触及 |

## 尚需 coordinator 承接的验证

`verification.md` 在本轮审查时尚未落盘。已见 React 同步卸载报错必须先修补，随后在删除宠物块、撤销/重做、关闭编辑器、改变外观与动效时复查 console、React root 和 canvas 资源。其余需据真实浏览器检查段中插入、合法及畸形粘贴、IME、草稿、非默认装扮全阅读入口、亮暗主题、降动效、页面隐藏、模型故障和 context loss。旧 EXE 回写必须仅使用数据副本；未做则明确保留未验证，不得宣称双向兼容。若其中任何结果与计划冲突，应恢复实施审查并重定结论。

## contract drift / stale / mirror mismatch

未见 shared runtime contract 或平台入口漂移。README、CHANGELOG、`docs/Project.Progress.md`、`docs/Note.Formatting.md` 均把当前源码能力与未验收项分开；`docs/current/note-embedded-pet/README.md` 的阶段状态仍须由 coordinator 在现场验证后更新。

## 后续行动

**补实施任务**：仅修正 `NoteComposer` 中 React root 在 observer 与 effect cleanup 的卸载时序，避免 React 正在 render 时同步卸载；保留同一宿主唯一 root 和及时释放 WebGL 的合同。此缺陷局部（限当前 S2/S3 生命周期锚点）、低风险（无需跨模块改造）、无新决策（计划已有资源释放与现场验证口径），三条件同时成立，故判 `IMPL_DEFECT`。补实施后记录新一轮代码差异、测试与 coordinator 现场 console/资源结果，再做实施复审。不得以本轮 `npm test` 通过宣称浏览器稳定或进入归档/发布。
