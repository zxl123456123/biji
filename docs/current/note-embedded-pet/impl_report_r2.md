# 正文晴小团实施报告 r2：React 卸载时机补修

- feature_name: `note-embedded-pet`
- impl_round: 2（`IMPL_DEFECT`，保留 [r1](impl_report_r1.md)）
- date: 2026-10-06
- lwplan_version: `lwplan.md` 第二轮修订，S2 单宿主资源清理合同
- owner: `/root/note_pet_impl`

## 缺陷输入与变更事实

coordinator 在隔离 IAB 5321 真实浏览器日志观察到反复 React 错误：`Attempted to synchronously unmount a root while React was already rendering`，覆盖保存、关闭和撤销等路径。r1 的 `MutationObserver` 回调与父组件 effect cleanup 直接调用 `petRoot.current.root.unmount()`，可能与 React 对 canvas 子树的提交重叠。本报告记录该失败，不以编译或单测掩盖。

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/NoteComposer.tsx` | 修改 | Observer 仅调度下一宏任务对账；同一任务中先卸载已移除宿主，再按当前编辑 DOM 挂载；父 cleanup 取消待执行对账、断开 Observer，并在下一宏任务卸载原 3D 根，避免 React 正在渲染时同步卸载 | S2, U2 |
| `docs/current/note-embedded-pet/impl_report_r2.md` | 新增 | 保留真实失败、补修证据与交回验收项 | S2 |

## 目标对齐

- goal_lock_check: 保留每条唯一编辑宿主、原生插入/撤销路径、当前衣橱外观和静态回退；只改变挂载对账与卸载时机。
- anti_goal_touch_check: 未改纯文本格式、存储、其它阅读入口或 WebGL 场景逻辑；未引入新依赖/数据库字段。
- authoring_ergonomics_notes: N/A，本轮没有声明式格式、配置或作者语法变更。
- contract_drift_reports: 未发现 lwplan/shared skill/镜像漂移。r1 的实际 React warning 是实施缺陷，非规划口径变化。

## impl-safe 验证

| 检查 | exit | evidence | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| `npm test` | 0 | 141/141，fail 0；Node `stripTypeScriptTypes` ExperimentalWarning 保留 | impl | 不得声称本地单测通过 |
| `npm run build` | 0 | `tsc -b && vite build` 完成；2519 模块、PWA 19 条预缓存；>500kB chunk 警告保留 | impl | 不得声称 Web 编译通过 |

## coordinator_handoff_verifications

| 未执行项 | 移交原因/建议 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 清日志新 IAB 重测插入、撤销/重做、保存/关闭、重开、删除与再次关闭 | React warning 只在真实浏览器交互中出现，超出 impl-safe | 新会话控制台完整错误记录、DOM/画布数量、操作步骤 | coordinator | 不得声称 warning 消失或此缺陷修复通过 |
| 确认宿主移除与 modal 关闭后 `Pet3DView` dispose、RAF 停止，页面仅剩预期全局浮层 canvas | GPU 与动画调度运行态，超出 impl-safe | 移除前后 canvas/场景与 RAF 观察结果 | coordinator | 不得声称资源清理在实机通过 |

## 风险与回滚

- 使用下一宏任务清理会使旧 3D 场景在一次事件循环内短暂保留；下次对账先卸载旧根再挂载新根。真实 canvas/RAF 计数仍由 coordinator 核查。
- 未完成：新 IAB 现场复测、独立实施审查；不能用本报告的单测/build 推断 React warning 已消失。
- 回滚信息：源变更可直接回滚；r1 历史报告保留。
- 建议英文提交信息：`fix(notes): defer embedded pet root cleanup`
