# S2–S3 补实施报告 r5

- feature_name：xiaotuan-3d-pet
- impl_round：r5（独立 Review(Impl) 的上下文丢失与静态姿态修复）
- date：2026-10-06
- lwplan_version：`docs/current/xiaotuan-3d-pet/lwplan.md`，2026-10-06 版

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/Pet3DView.tsx` | 修改 | WebGL context lost 时标记本次画布不可用、断开 ResizeObserver、释放已建场景并显示 SVG；异步 import 或 GLB 加载晚于丢失事件时，不接受成功结果并释放新建场景，避免重新启动 RAF 或覆盖失败状态 | S2 |
| `src/Pet3DScene.ts` | 修改 | `setAnimate(false)` 取消 RAF 后把当前 action 的 mixer 时间设为 0，绘制确定静态首帧；当前 mood 对应的 idle/happy clip 仍由 `setMood` 选择 | S2 |

## 目标对齐

- goal_lock_check：失去 WebGL 上下文时 SVG 继续提供可用画像；停止动态后当前 mood 保持确定静态姿态。
- anti_goal_touch_check：未改 App、`petPolicy`、持久化、笔记、模型资产或第三方预览入口。
- authoring_ergonomics_notes：只在现有 view 生命周期与 scene 动画门中增加状态处理，没有新配置或第二业务状态源。

## impl-safe 验证

| evidence | owner | 结果 | conclusion_if_missing |
| --- | --- | --- | --- |
| `npm test`，退出码 0；137 tests、137 pass、0 fail | S2–S3 impl | 现有回归通过 | 不能声称既有行为回归通过 |
| `npm run build`，退出码 0；TypeScript 与 Vite 构建完成；Vite 对大 chunk 警告 | S2–S3 impl | 静态构建通过 | 不能声称构建通过 |
| `git diff --check`，退出码 0；仅见仓库 LF/CRLF 转换提示 | S2–S3 impl | 无 diff 空白错误 | 不能声称差量格式正确 |
| 代码路径核对：contextLost 先置 `unusable=true`；异步 import 前及 create 结束后均检查 `cancelled || unusable`，后到场景执行 `dispose` 而不赋给 `scene.current` | S2–S3 impl | race 分支在代码上闭合 | 不能声称晚到成功已被隔离 |
| 代码路径核对：`setMood` 先选择当前 idle/happy action；`setAnimate(false)` 在取消 RAF 后 `mixer.setTime(0)` 再 `render()` | S2–S3 impl | 当前 clip 的首帧成为静态姿态 | 不能声称静态帧确定 |
| Node 直接加载当前 GLB 并用 Three AnimationMixer 播放 idle/happy 各 0.5 秒后 `setTime(0)`；两段的 PetRoot y 分别从 0.01636、0.13000 回到 0，再 `update(0)` 均保持 0；退出码 0 | S2–S3 impl | 当前模型两段动作的首帧复位行为已实测 | 不能声称首帧复位对当前模型有效 |

## coordinator_handoff_verifications

| 验证 | 移交原因 / 建议承接方式 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 真实浏览器模拟 `webglcontextlost`，覆盖加载中与加载后两种时序，检查 SVG 回退及无持续 RAF | 真实 WebGL/浏览器状态，非 impl-safe；root 或独立审查实测 | 两种时序下的画布状态、错误与帧请求观察 | root | 不能声称真实上下文丢失恢复链通过 |
| 休息、拖动、失焦和减少动态时画面停在确定姿态，恢复后继续对应 mood 动作 | 真实 UI 动画观察；root 实测 | 画面与动作记录 | root | 不能声称视觉动作策略通过 |

## contract_drift_reports

- 无新的 S1 模型或持久化合同漂移；本轮修正 r1 场景生命周期实现与既定方案间的两处差距。

## 未完成与风险

- 真实 WebGL context loss 和动作姿态的 UI 观察仍由 root 承接；本报告不把编译与代码核对解释为浏览器实测。
- context lost 后维持 SVG 回退，页面重挂载后才重新尝试新 WebGL 上下文；本轮没有原位恢复流程。
- 回滚：可直接回滚上述两文件本轮差量，无数据迁移。

建议提交信息：`fix(pet): guard lost WebGL context and freeze animation pose`
