# S2–S3 补实施报告 r4

- feature_name：xiaotuan-3d-pet
- impl_round：r4（S1 装扮资产重导后的接口复核）
- date：2026-10-06
- lwplan_version：`docs/current/xiaotuan-3d-pet/lwplan.md`，2026-10-06 版

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `docs/current/xiaotuan-3d-pet/s2-s3/impl_report_r4.md` | 新增 | 记录旧 GLB 缺陷、新资产接口和 root 的刷新复测；本轮未再改运行时代码 | S1/S2/S3 接口复核 |

## 目标对齐

- goal_lock_check：晴小团两入口的三维展示继续复用 `Pet3DScene`；装扮父组在当前 GLB 为单位缩放，`show()` 的 0/1 缩放和可见性可作用于正确位置的配件。
- anti_goal_touch_check：未改 App、持久化、笔记、SQLite、备份或第三方资产；本轮未改相机公式。
- authoring_ergonomics_notes：S1 源脚本改为完整导出可选装扮局部变换，运行时仍按节点名控制显隐；无需运行时推算配件位置。

## 缺陷原因与证据

- 旧 GLB 的 Beret/Halo/Scarf/Bow 父组及子网格均导出为 `scale:[0,0,0]`，子网格平移也丢失；仅将父组恢复为单位缩放不会显示正确位置的装扮。r3 的静态源脚本证据对应**旧资产**，不再代表当前导出状态。
- S1 重导后，本轮直接解析 `public/pets/xiaotuan.glb`：四父组和每个子节点均为 `scale:[1,1,1]`，动作恰好为 `happy`、`idle`。GLTFLoader 复算位置：Beret y=2.01–2.42、Halo y=2.365–2.515、Scarf y=0.12–0.75、Bow y=0.52–0.78；配件落在角色相应位置。
- 旧 GLB 下的浮层“只显示底部深色半圆”不能由 R3 相机范围扩大解释：当时将四父组设为单位缩放前后的角色 Box3 完全相同；166×159 与 244×234 两尺寸按现有相机公式投影的眼/耳 NDC 基本一致。本轮不改相机。
- root 在新 GLB 到位后对页面做完整 reload，实际观察：记录页浮层恢复完整耳、脸、脚；当前薄荷配色、画家帽与围巾均可见。root 还逐个从 E 盘选择四个第三方 GLB，开发预览 `ready=true` 且截图看到完整角色。上述 UI 观察由 root 负责，非 impl 的静态验证。

## impl-safe 验证

| evidence | owner | 结果 | conclusion_if_missing |
| --- | --- | --- | --- |
| 新 GLB JSON 解析命令，退出码 0；四父组及其子节点单位缩放，动作 `happy/idle` | S2–S3 impl | 当前资产的结构合同对齐 | 不能声称当前 GLB 装扮结构正确 |
| `npm run build`，退出码 0；TypeScript 与 Vite 构建完成；保留大 chunk 警告 | S2–S3 impl | 新资产下静态构建通过 | 不能声称当前源码与资产可构建 |

## coordinator_handoff_verifications

| 验证 | 移交原因 / 建议承接方式 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 当前 GLB 的浮层和大展示实际显示、装扮可见 | 真实 UI，不属 impl-safe；root 已复测并记录上述观察 | root 截图/页面观察记录 | root | 不能由 impl 独立声称视觉验收通过 |
| 四个第三方开发预览实际显示 | 真实 UI 与仓库外模型，root 已逐个复测 | root 四角色截图与状态记录 | root | 不能由 impl 独立声称四角色造型达标 |
| Windows 原生安装包的实际显示与资源隔离 | 真实原生运行，仍由 root 承接 | 原生 UI 与安装包扫描记录 | root | 不能声称原生通过 |

## contract_drift_reports

- r3 发现的零缩放资产合同已由 S1 重导解决；运行时保持父组按 0/1 缩放和 `visible` 显隐。旧 GLB/HMR 场景状态与完整刷新后观察不同，页面实测应以刷新后的当前 GLB 为准。

## 未完成与风险

- 四角色外形仍需用户视觉验收；root 的开发预览可加载观察不等于用户认可造型。
- 原生安装包和长期资源释放由 root 按计划核验。
- 回滚：本轮只有报告新增；R3 运行时代码可直接回滚，无数据迁移。

建议提交信息：`fix(pet): preserve accessory transforms in Xiaotuan model`
