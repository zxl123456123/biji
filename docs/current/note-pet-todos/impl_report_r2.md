# 实施记录 r2

- feature_name: note-pet-todos
- impl_round: r2
- date: 2026-10-06
- lwplan_version: 未建立；按独立审查反馈实施局部补修。

## 本轮变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/App.tsx` | edit | 空 SQLite 数据覆盖浏览器缓存；待办删除可撤销；提醒避开其他弹层、实际显示后标记、Escape 与焦点返回；设置备份说明 | 审查 P1/P2 |
| `src/styles.css` | edit | 1200px 导航改换行，提醒移到右上并限制高度 | 原生 GUI 所见问题 |
| `src/store.ts`, `tests/todoBackup.test.mjs` | edit/add | 导入旧备份保留本机待办，新备份完整替换；覆盖旧/新/格式错误 | 后续审查 P2 |
| `README.md`, `CHANGELOG.md`, `docs/Project.Progress.md` | edit | 同步补修事实和未测边界 | 文档同步 |

## 目标与边界

- goal_lock_check: 空桌面库不再被 Web 缓存填入；删除能撤销；提醒可关闭并返回焦点；导航和伙伴不互挡。
- anti_goal_touch_check: 未修改笔记、账目、宠物拖动或模型资源。
- authoring_ergonomics_notes: N/A。
- 工作区原有混合 `M`/`??` 未清理；本轮只记录以上改动锚点，不能把相对 HEAD 的整份差量算作本轮。

## 验证

下列结果见本轮实际命令输出；缺任一证据，不得声称对应检查通过。

| evidence | owner | result | conclusion_if_missing |
| --- | --- | --- | --- |
| `npm test` | impl | 145/145 exit 0，原有 Node ExperimentalWarning | 前端回归未证实 |
| `npm run build` | impl | exit 0，仍有 >500 kB chunk 警告 | 构建未证实 |
| `cargo test --lib` | impl | 11/11 exit 0 | SQLite 单测未证实 |
| `git diff --check` | impl | exit 0；仅 LF/CRLF 提示 | 差量格式未证实 |

## coordinator_handoff_verifications

| 验证 | 原因 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 1200px 导航、提醒与宠物位置、弹层焦点/Escape、空 SQLite 启动与待办删除撤销 | 真实 GUI/平台状态，非 impl-safe | 隔离原生窗口与数据库记录 | coordinator | 不得声称现场体验修复 |

## 风险与回滚

- contract_drift_reports: 本 feature 仍无 `lwplan.md`；本轮按明确审查意见局部补修，已告知 coordinator。
- 没有新安装制品；原生现场复测和 fresh reviewer 由 coordinator 承接。
- 原生 1200×783 复测额外发现待办首行操作被右下伙伴遮挡；只在 `src/styles.css` 的 `.content.todo-view` 添加随视口变化的右侧预留（>720px），不改宠物定位或待办交互。该 CSS 补修待 coordinator 复测。
- 该局部 CSS 补修后重新运行 `npm run build` exit 0（仍有 >500 kB chunk 警告）、`git diff --check` exit 0（仅 LF/CRLF 提示）；未重跑与 CSS 无关的测试。
- 后续 P2：`src/App.tsx` 导入备份改用 `importBackupData`，旧备份保留当前待办并提示；提醒使用布局 effect，只有焦点仍在提醒内部时才恢复旧焦点。异步保存顺序风险仅记录，本轮未扩范围处理。
- 后续 P2 补修后重跑 `npm test`：148/148 exit 0（新增旧备份保留、新备份替换空数组、非法旧备份拒绝三例）；`npm run build` exit 0（>500 kB chunk 警告）；`git diff --check` exit 0（LF/CRLF 提示）。这三条覆盖新增逻辑与最终代码。Rust 逻辑未变。
- 异步保存顺序风险：前端对连续状态变化调用 `saveDesktopData` 没有显式串行化；若请求完成顺序与状态顺序相反，可能写回旧快照。依审查范围仅记录，待独立处理。
- 最终 reviewer 补边界：提醒布局 effect 捕获建立时的面板节点，卸载清理不依赖可能已清空的 ref；备份显式 `todos` 为 null、对象或字符串时拒绝导入，避免误当空数组清除本机待办。新增 1 个测试覆盖三种坏类型。最终验证结果以下轮命令为准。
- 最终补边界后实跑 `npm test` 149/149 exit 0、`npm run build` exit 0（>500 kB chunk 警告）、`git diff --check` exit 0（LF/CRLF 提示）；无新增失败。
- 回滚：只可按本轮锚点人工回滚，不能整体还原混合工作区。
- 建议提交消息：`fix(todos): protect empty desktop data and task reminders`

## 协调者最终复测

- 使用隔离 Tauri 标识 `com.zxl.qingjian.devtest` 启动 1200×783 原生窗口，未触碰用户现有数据库。浅色与深色主题下顶部栏均与页面连贯，没有原生黑色条；最小化、最大化/还原控件可见，最大化/还原已操作。
- 在隔离数据库中创建当日待办，宠物“今日待办”显示清单并可进入待办页；宠物“打开记录”进入快速打开。1200px 待办列表的编辑、删除按钮不再被宠物面板遮住。提醒显示时按 Ctrl+K，提醒关闭且快速打开输入框可继续接收文字。
- 最终源码由协调者独立运行 `npm test` 149/149、`npm run build`、`cargo test --lib` 11/11、`git diff --check`，退出码均为 0；构建仍提示大于 500 kB 的 chunk，Git 仅有 LF/CRLF 提示。`tauri.conf.json` 格式整理后单独验证 JSON 解析成功与 `git diff --check` 退出 0。
- 未验证用户真实旧 SQLite 库、安装器制品、提醒焦点在所有窗口组合下的行为。独立审查在最终补丁后给出代码复核通过，仍记录既有桌面异步保存顺序风险。
