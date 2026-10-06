# S2–S3 补实施报告 r2

- feature_name：xiaotuan-3d-pet
- impl_round：r2（Review(Impl) 指出的隐藏浮层画布缺陷）
- date：2026-10-06
- lwplan_version：`docs/current/xiaotuan-3d-pet/lwplan.md`，2026-10-06 版

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/PetCompanion.tsx` | 修改 | 浮层的 `PetFigure3DOrSvg` 仅在 `pet.policy.present` 时挂载。伙伴页隐藏浮层时卸载其 `Pet3DView`，触发原场景 `dispose`；外层容器、位置、button、手势及行为状态保留 | S2、S3 |

## 目标对齐

- goal_lock_check：晴小团仍在可见浮层与伙伴大展示使用 3D；隐藏浮层不持有 WebGL canvas。
- anti_goal_touch_check：未改 App、持久化、笔记或 S1 模型；缩略图及记录时光不变。
- authoring_ergonomics_notes：直接复用已有 `petPolicy.present`，没有新增状态或配置。浮层再显示时按现有图像槽重新加载模型。

## impl-safe 验证

| evidence | owner | 结果 | conclusion_if_missing |
| --- | --- | --- | --- |
| `npm test`，退出码 0；137 tests、137 pass、0 fail | S2–S3 impl | 现有回归通过 | 不能声称既有策略回归通过 |
| `npm run build`，退出码 0；TypeScript 与 Vite 构建完成，有大 chunk 警告 | S2–S3 impl | 静态构建通过 | 不能声称构建通过 |
| 代码核对：`pet-companion` 的 `hidden={!pet.policy.present}` 与图像槽 `{pet.policy.present && ...}` 使用同一布尔值 | S2–S3 impl | 静态挂载边界对齐 | 不能声称隐藏浮层不挂载画布 |

## coordinator_handoff_verifications

| 验证 | 移交原因 / 建议承接方式 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 实际伙伴页、记录页的 `.pet-3d-canvas` 数量，以及切换页后的 WebGL 上下文释放 | 真实浏览器 UI 验证不属 impl-safe；root 复测 | 每页画布数量与切换观察记录 | root | 不能声称实际 WebGL 生命周期修复 |
| 浮层重新出现后的模型加载、轻触、拖动及保存状态 | 真实 UI 手测；root 复测 | 实际交互记录 | root | 不能声称复现路径全通 |

## contract_drift_reports

- 无新合同漂移。r1 的动画轨问题已由 S1 重导并在 r1 静态复核。

## 未完成与风险

- Root 已观察到 r1 伙伴页存在两张 canvas（隐藏浮层 79×75、展示 149×142）。r2 通过挂载条件修正代码，但实际浏览器复测尚未由 impl 执行；由 root 承接。
- 浮层重新显示时会重新加载 GLB，可能出现短暂 SVG 回退；这是现有加载回退机制，实际体验待 root 观察。
- 回滚：可直接回滚这一处条件挂载改动；无需迁移数据。

建议提交信息：`fix(pet): unmount hidden companion canvas`
