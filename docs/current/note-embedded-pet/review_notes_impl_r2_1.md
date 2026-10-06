# 正文晴小团实施后独立审查：r2 第 1 轮

- review_target: `impl`
- impl_round: `2`
- review_seq: `1`
- review_date: `2026-10-06`
- 评审输入：`clarifications.md`、`lwplan.md`、`impl_report_r2.md`、`review_notes_impl_r1_1.md`、`verification.md` 与当前未提交代码差异。
- 协议结论：`PASS`
- 业务结论：`PASS`

## r1 缺陷的复核

`src/NoteComposer.tsx:125-151` 中，MutationObserver 现在仅安排 `setTimeout(0)` 对账；对账读取编辑根当前直接子级，先卸载旧宿主的 React root，再为当前合法宿主建立唯一 root。组件清理时先断开 observer、取消未执行的对账，再将旧 root 卸载安排到下一任务。这样消除了 r1 在 observer 回调或父 React 清理过程中同步卸载嵌套 root 的路径。`src/Pet3DView.tsx` 清理 effect 会断开 ResizeObserver、注销 context-loss 监听并调用 scene.dispose；`src/Pet3DScene.ts:121-137` 的 dispose 取消动画帧并释放几何、材质及 renderer。

coordinator 在隔离 IAB 5321 的 [现场记录](verification.md) 中复测了打开、删除、撤销、重做、关闭、重开和保存：宠物在编辑器内呈单个宿主与单个已加载 canvas，删除和关闭后编辑器 canvas 为零，各步浏览器 error/warn 日志为空。此为 coordinator 的现场证据，不冒充本审查亲自操作；只能证明该 Chromium 开发预览路径，不能证明所有 WebView 或长期 GPU 情况。

## 实现与目标锁

| 链路 | 独立核对结果 |
| --- | --- |
| 存储与回填 | `src/noteCodec.ts:16-19,196-211,236-253` 只把围栏外第一个精确独占行 `[[pet:xiaotuan]]` 识别为宠物块；未知、行内、转义及重复内容保持字面文本。`noteHtml` 只生成固定非编辑宿主，`notePlain` 返回「晴小团」。 |
| 编辑器往返 | `src/noteFormat.tsx:36-39,80-89` 仅将编辑根直接子级、固定角色且 `contenteditable=false` 的 DIV 序列化为一次固定指令；第二个同形节点成为转义字面文本，不保留任意 HTML。`src/NoteComposer.tsx:112-123` 仅在普通正文折叠光标且尚无宿主时调用原生 `insertHTML`，拒绝组合输入、列表、标题、引用、代码和重复插入。 |
| 阅读、检索和外观 | `src/noteFormat.tsx:18-20` 阅读块只创建静态 `PetPortrait` 并强制原创角色；`src/App.tsx:251,258,266,307` 将当前衣橱外观传到花园、图、卡片和编辑器，编辑动画条件单独排除了隐藏页/降动效。`src/NotesView.tsx:41,60` 的卡片及拖拽预览使用静态块；检索使用 `notePlain` 可见名称。 |
| 资源上界 | 每个编辑器只保留 `petRoot.current` 一个嵌套 root；阅读层无 `Pet3DView`。本审查静态核对了 `Pet3DView`/`Pet3DScene` 的释放路径，现场仅观察 DOM canvas 数与日志，未直接量测 GPU 或 RAF 长期占用。 |

本审查独立运行 `npm test`：退出码 0，141/141 通过、失败 0；输出含 Node `stripTypeScriptTypes` ExperimentalWarning。独立运行 `git diff --check`：退出码 0，只有 Git LF→CRLF 工作区提示。`impl_report_r2.md` 与 coordinator 的 `verification.md` 分别记录 `npm run build` 退出码 0；构建仍有现存超过 500 kB 的 chunk 警告，本审查未将构建当成自己重跑的命令。

## 双结论字段与边界

- `goal_lock_alignment: aligned`：一条笔记至多一个原创块、编辑时 3D、阅读静态、纯文本存储与位置恢复均有实现及相应证据。
- `anti_goals_touched: none`：差异未新增数据库列/附件/编辑框架，也未加入第三方模型或阅读列表 WebGL。
- `authoring_ergonomics_check: pass`：工具栏在既有编辑器中提供「插入晴小团」，非法位置提示原因；现场证据涵盖段中插入、继续输入、原生撤销/重做、格式与回填。
- `declaration_readability_check: pass`：作者无需看到或手写内部指令；阅读和搜索显示可见名称。
- `plan_defect_checkpoint_recommended: no`
- `plan_defect_checkpoint_reason: r1 问题是计划 S2 已定义的根节点清理时序缺陷；r2 只改该局部实现，不需重定目标或回滚边界。`
- `impl_safe_validation_check: pass`：实施报告给出命令、退出码和警告；本审查独立复跑测试和 diff 检查。
- `coordinator_handoff_check: pass`：现场复测已落盘，未测范围和结论限制也已明确列出。
- `基线与澄清一致性复核结果: PASS`：`clarifications.md` 无未回答事项；用户授权的可选、每条至多一次、正文作者定位以及原创角色边界得到遵守，头脑风暴决策未见违反。
- `设计味道扫描结果: WARN: contentEditable 内的嵌套 React root 与 MutationObserver 增加生命周期复杂度；当前实现限制为单一宿主且延迟对账，现场循环未再出现 r1 警告。后续若改变编辑 DOM 结构，应复测宿主替换与根节点清理。`

### 反目标禁止项核验

| 禁止内容 | 可核查证据 | 结论 |
| --- | --- | --- |
| 第三方角色模型进入发布 | `src/NoteComposer.tsx:35` 固定 `pets/xiaotuan.glb`；当前 `git diff --stat` 无模型文件 | 未触及 |
| 任意 HTML 持久化或阅读注入 | `src/noteFormat.tsx:18-20,38,83-88` 只使用固定指令与 React 静态节点；保存仍经 `editorHtmlToMarkdown` | 未触及 |
| 附件、数据库结构或编辑器迁移 | 当前差异不含 `src/store.ts`、`src/desktop.ts`、`src-tauri` 和 schema；仍用原有 contentEditable | 未触及 |
| 列表大量 WebGL | `renderMarkdown` 宠物分支只创建 `PetPortrait`；现场花园/图详情正文 canvas 为零 | 未触及 |

## 尚未验证及后续

coordinator 已在 `verification.md` 保留中文 IME、其他浏览器/Windows WebView、触屏/读屏、同形 HTML 粘贴、非默认衣橱、系统降动效与隐藏页、模型加载失败/上下文丢失、长期 GPU/内存、直接剪贴板内容和旧 EXE 写回为未测。这些不能作为通过或旧版兼容的证据；任何后续现场失败需恢复实施与审查。现有证据允许本轮实施审查进入归档/提交，但不支持声称上述环境或故障路径已验证。

## contract drift / stale / mirror mismatch

未发现 shared runtime contract、平台入口或镜像副本漂移。feature README 的阶段文字仍为实施中，应由 coordinator 在阶段迁移时更新；这属于状态同步，不改变本轮代码结论。
