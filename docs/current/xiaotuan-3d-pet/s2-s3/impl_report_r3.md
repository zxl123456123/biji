# S2–S3 补实施报告 r3

- feature_name：xiaotuan-3d-pet
- impl_round：r3（Review(Impl) 指出的晴小团装扮不可见缺陷）
- date：2026-10-06
- lwplan_version：`docs/current/xiaotuan-3d-pet/lwplan.md`，2026-10-06 版

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/Pet3DScene.ts` | 修改 | `show()` 同时控制装扮节点的 `scale` 与 `visible`：选中为单位缩放，隐藏为零缩放。初次相机定界前暂将四组恢复单位缩放，使帽、星环、围巾、蝴蝶结在统一相机范围内；首次实际显示前仍由当前 `PetAppearance` 决定显隐 | S2、S3 |

## 目标对齐

- goal_lock_check：晴小团头饰和配件试穿可通过同一 `PetAppearance` 显隐；无第二份装扮状态。
- anti_goal_touch_check：未改 `.blend/.glb`、App、持久化、笔记或第三方模型；浮层与大展示共用场景逻辑。
- authoring_ergonomics_notes：源脚本明确导出零缩放分组，运行时集中于 `show()` 处理，无新增配置。

## 资产合同与验证证据

| evidence | owner | 结果 | conclusion_if_missing |
| --- | --- | --- | --- |
| 直接解析 `public/pets/xiaotuan.glb` JSON：Beret、Halo、Scarf、Bow 四个 node 均 `scale: [0,0,0]`；`idle/happy` 各仅驱动 PetRoot translation/rotation 与 ArmRight rotation | S2–S3 impl | 四组需在运行时恢复缩放，动画轨不会覆盖其缩放 | 不能声称缩放修复与模型合同一致 |
| `assets-source/pets/xiaotuan.py:109–124` 注释与构造：可选装扮以 `scale=0` 导出，应用负责显示；`group()` 默认缩放为 1 | S2–S3 impl | 选中恢复单位缩放与源设计一致 | 不能声称单位缩放是建模意图 |
| `npm test`，退出码 0；137 tests、137 pass、0 fail | S2–S3 impl | 现有回归通过 | 不能声称现有策略回归通过 |
| `npm run build`，退出码 0；TypeScript/Vite 构建完成，保留大 chunk 警告 | S2–S3 impl | 静态构建通过 | 不能声称构建通过 |

## coordinator_handoff_verifications

| 验证 | 移交原因 / 建议承接方式 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 实际大展示与浮层分别试穿 beret/halo/scarf/bow，核对位置、配色、互斥与无遮挡 | 真实 UI 与视觉验收非 impl-safe；root 复测 | 四组显隐截图或实际观察记录 | root | 不能声称装扮视觉问题解决 |
| 浅深主题、小尺寸画布下帽和星环不裁剪 | 真实渲染与视觉验收；root 复测 | 多尺寸观察记录 | root | 不能声称相机取景正确 |

## contract_drift_reports

- r1 的节点名合同未变。发现 GLB 的装扮分组初始缩放为零，而 r1 运行时仅改 `visible`；r3 按源脚本修正运行时合同。已告知 S1 建模方核对单位缩放意图。

## 未完成与风险

- root 的实际 UI 复测尚未返回；本报告只证明静态合同与编译，不宣称最终观感已通过。
- 回滚：可直接回滚 `src/Pet3DScene.ts` 本轮两处缩放处理；无数据迁移。

建议提交信息：`fix(pet): restore accessory scale when selected`
