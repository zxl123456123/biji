# 实施记录 r1

- feature_name: note-pet-todos
- impl_round: r1
- date: 2026-10-06
- lwplan_version: 未建立；本轮依据用户需求、现有调研与协调者给出的实现基线推进。此流程缺口已上报 coordinator。

## 本轮实际编辑文件与改动锚点

工作区起始已有大量 `M`/`??`，下列路径中已有内容不属于本轮；开始修改前未单独保存 SHA 或快照，不能用相对 HEAD 的整份差量代表本轮。没有清理、还原、提交或推送既有改动。

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/types.ts`, `src/store.ts` | edit | 新增 `Todo` / `AppData.todos`，`loadTodos`/`saveTodos` 和旧备份空数组兼容 | 独立待办持久化 |
| `src-tauri/src/lib.rs`, `src-tauri/src/database_tests.rs` | edit | 独立 `todos` 表、读写事务；旧 EXE 保存和失败回滚测试 | SQLite 与旧版兼容 |
| `src/TodoView.tsx` | add | 待办的添加、编辑、完成、删除和日期展示 | 待办列表 |
| `src/App.tsx`, `src/PetCompanion.tsx`, `src/styles.css`, `src/pet.css` | edit | 主导航、待办状态与备份、每日提示、宠物快捷入口、标题栏 JSX/样式 | 伙伴与桌面 UI |
| `src-tauri/tauri.conf.json`, `src-tauri/capabilities/default.json` | edit | 关闭原生装饰，开放拖动和三个窗口控制权限 | 标题栏 |
| `README.md`, `CHANGELOG.md`, `docs/Project.Progress.md` | edit | 同步工作区当前能力及未测边界 | 文档 |

## 目标对齐

- goal_lock_check: 待办独立于笔记；桌面顶部与主题衔接，仍有最小化/最大化/关闭和拖动。
- anti_goal_touch_check: 未导入授权不明的第三方模型；没有账号、同步或 AI 待办提取。
- authoring_ergonomics_notes: N/A；未新增规则或配置作者流程。

## 验证

| evidence | owner | result | conclusion_if_missing |
| --- | --- | --- | --- |
| `npm test`，145 passed、0 failed，exit 0 | impl | 通过；Node 有 ExperimentalWarning | 无此证据不能声称前端回归通过 |
| `npm run build`，TypeScript/Vite/PWA exit 0 | impl | 通过；>500 kB chunk 警告 | 无此证据不能声称前端可构建 |
| `cargo test --lib`，11 passed、0 failed，exit 0 | impl | 通过，含新 SQLite 测试 | 无此证据不能声称数据库单测通过 |
| `git diff --check`，exit 0 | impl | 通过；仅有 LF/CRLF 提示 | 无此证据不能声称差量格式检查通过 |

## coordinator_handoff_verifications

| 验证 | 原因 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 原生 Windows 标题栏拖动、缩放、三个窗口按钮、浅深主题 | 真实 GUI，非 impl-safe | 实际操作记录/截图 | coordinator | 不得声称顶部问题现场修复 |
| 真实旧库隔离迁移、待办往返与备份恢复 | 真实平台和持久状态，非 impl-safe | 隔离数据库与前后数据比对 | coordinator | 只可称单测覆盖，不称迁移现场通过 |
| 宠物提醒、快捷打开与窄屏焦点实际交互 | GUI，非 impl-safe | 实际页面交互记录 | coordinator | 不得声称交互体验验收通过 |

## 风险与回滚

- contract_drift_reports: 本 feature 尚无 `lwplan.md`；已向 coordinator 说明实施依据与缺口。用户关于待办独立/提醒方式的澄清尚未正式回复，本实现采用记录中的暂定口径。
- 未完成：未生成新 Windows 安装制品；没有现场 GUI 验收；第三方模型许可不明，未接入。
- 回滚：源码可逐文件回滚，但混合工作区中的他人改动需人工区分，不能执行整体 `git restore`。
- 建议提交消息：`feat(todos): add local task list and companion reminders`
