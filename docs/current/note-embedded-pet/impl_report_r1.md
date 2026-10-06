# 正文晴小团实施报告 r1

- feature_name: `note-embedded-pet`
- impl_round: 1
- date: 2026-10-06
- lwplan_version: `lwplan.md` 第二轮修订，`review_notes_lwplan_2.md` Gate-2 PASS
- owner: `/root/note_pet_impl`；真实浏览器与原生平台证据由 coordinator `/root` 承接。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/noteCodec.ts` | 修改 | 仅首个独占行指令解析为宠物块，回填受控宿主，纯正文转为可见名称 | S1 |
| `src/noteFormat.tsx` | 修改 | 阅读安全静态预览；仅编辑根直接子级合法宿主序列化为一次受限指令 | S1, S2 |
| `src/NoteComposer.tsx` | 修改 | 工具栏原生命令插入、输入条件拒绝、单个 React/3D 挂载与移除清理 | S2, S3 |
| `src/pet.css` | 修改 | 静态与三维卡片尺寸、视觉回退 | S1, S2 |
| `src/App.tsx`, `src/NotesView.tsx`, `src/NoteGraph.tsx` | 修改 | 衣橱外观显式传给编辑器、卡片、拖拽覆盖层、花园与图详情；编辑动效独立门禁 | S3 |
| `tests/noteCodec.test.mjs`, `tests/searchPreview.test.mjs`, `tests/todoBackup.test.mjs` | 修改 | 精确语义、代码/转义/重复、标签/检索、JSON 导入纯文本证据 | S1, S2 |
| `README.md`, `CHANGELOG.md`, `docs/Project.Progress.md`, `docs/Note.Formatting.md` | 修改 | 同步当前源码能力、持久化边界和未验收项 | S3 |

未增加第三方模型、schema、附件字段或产品依赖；`dist` 为忽略的生成物，未纳入变更。

## 目标对齐

- goal_lock_check: 代码路径含单条一次、普通正文光标、原创 3D、阅读静态、当前位置存储、当前衣橱装扮与可见名称；其中原生插入/撤销及 UI 效果仍以真实浏览器验收为准，不能仅凭代码声称通过。
- anti_goal_touch_check: 未发布第三方 GLB、未持久化 HTML、未增加数据表/字段、未迁移编辑框架，阅读入口无 WebGL。
- authoring_ergonomics_notes: 受限声明式指令由工具栏产生，用户编辑区显示不可编辑块；不能在列表、引用、标题、代码、非折叠选区、IME 中插入，拒绝时用草稿状态提示。HTML 严格同形宿主可规范化为固定原创 token，额外字段或任意子节点不参与持久数据。

## impl-safe 验证

| 检查 | exit | evidence | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| `npm test` | 0 | 141/141，fail 0；Node `stripTypeScriptTypes` ExperimentalWarning 保留；最终源码执行输出已读取 | impl | 不得声称纯文本语义和既有本地单测通过 |
| `npm run build` | 0 | `tsc -b && vite build` 完成；2519 模块，PWA 19 条预缓存；>500kB chunk 警告保留 | impl | 不得声称 Web 编译通过 |
| `rg -n 'renderMarkdown\(' src` | 0 | 四个实际阅读调用点均显式传入当前 appearance；函数保留默认外观 | impl | 不得声称全阅读入口装扮接线完成 |
| `Get-ChildItem dist/pets` | 0 | 构建目录仅 `xiaotuan.glb`（766924 字节） | impl | 不得声称生产资源仅有原创 GLB |
| `git diff --check` | 0 | 无空白错误；Git 提示 LF/CRLF 转换 | impl | 不得声称 diff 无空白错误 |

初次实现后 `npm run build` exit 0、140/140 `npm test` exit 0；加入 JSON 备份测试与标题插入拒绝后重跑，最终证据以 141/141 和最后一次 build 为准。曾用 `apply_patch` 修改 `NoteGraph.tsx` 长行两次未匹配，随后只对该文件准确字符串替换；这两次 patch 失败没有写入文件。无测试失败被忽略。

## coordinator_handoff_verifications

coordinator 已回传一轮隔离 IAB 现场初步结果：段中插入形成编辑根直接子级宿主、三维 canvas ready、续写、两次撤销/重做、保存静态预览、重开三维、Backspace 整块删除及撤销恢复均观察成功。该证据由 coordinator 另写 `verification.md` 归档；本 impl 报告不将其列为自身 `impl-safe` 已验证。IME、草稿、主题、检索及其它入口仍在承接中。

| 未执行项 | 移交原因/建议 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 浏览器真实编辑：连续输入、中段插入、前后光标与删字、Backspace/Delete、Ctrl/⌘+Z/Y、IME、选区格式、粘贴合法/重复/非法宿主、保存重开、草稿恢复、快捷键 | 真实浏览器状态，超出 impl-safe；coordinator 在隔离本地数据现场执行 | 步骤、DOM 形态、正文字符串、截图或录屏、失败记录 | coordinator | 不得宣称编辑交互可放行 |
| 浅深主题、降动效、页面隐藏、模型故障/上下文丢失、编辑 canvas 数量及删除/关闭资源清理 | WebGL/系统运行态，超出 impl-safe | 现场状态与 canvas/renderer 数，错误/回退结果 | coordinator | 不得宣称 GPU/视觉稳定性 |
| Windows WebView/旧 EXE 回写 | 真实平台与历史程序，数据副本才可测 | 副本和程序身份、操作前后正文及备份 | coordinator | 保持未验证，不宣称旧版双向兼容 |

## 未完成、风险与回滚

- 未完成：真实浏览器编辑与视觉验收、独立实施审查；它们属于后续 gate，不由本报告代判。
- 主要风险：`execCommand('insertHTML')` 在不同浏览器对段中块的结构化结果、不可编辑节点原生 undo、React 子树与浏览器历史的相互作用尚未现场证实。若宿主不能成为编辑根直接子级或撤销丢失，按 lwplan 停止放行并重审插入交互。
- contract_drift_reports: 未观察到 lwplan/shared skill/平台入口镜像漂移；如现场证据改变 DOM 假设，应由 coordinator 更新计划并通知实施者。
- 回滚信息：源码与文档可直接用独立提交 `git revert` 回滚；尚未提交，不得丢弃他人更改。
- 建议英文提交信息：`feat(notes): embed original pet in note bodies`

---

## 跨功能事实（待确认）

### 架构与约束

- [2026-10-06] 有限正文格式同时经 `noteCodec`、活动 DOM 序列化、静态 React 阅读和 `notePlain` 流向检索；新增语义不能只改一处。
