# S3 提醒确认竞态补实施（第 3 轮）

feature_name: desktop-pet-and-quiet-workspace
impl_round: S3 r3
date: 2026-10-07
lwplan_version: 423 行 PLAN_DEFECT-R1.1–R1.5；输入独立 review_notes_impl_s3_r2_1.md 的 M1 / REVISE / IMPL_DEFECT

## 历史缺陷及范围

r1/r2 真实提醒事件可早于main `pet_publish`返回，accepted.current仍null/旧token，合法确认被拒为过期且日键未记。独立reviewer已实际执行真实hook源码复现。本轮保留该错误、原报告和REVISE，不能把旧8项绿结果当作不存在M1。

三项局部条件：①局部，只修改既有hook提醒分支和实际hook测试；②低风险，等待一个当前发布promise再复查，无数据库/窗口/资产或协议变化；③无新决策，落实LW已规定的晚到确认、有效Rust token与latest资格，不重定义验收/回滚或询问新许可。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| src/useMainPetBridge.ts | 修改 | publisher记录当前owner的inflight completion；completion先更新accepted，再供确认等待。reminder-shown捕获当时一个同owner completion，仅await一次，随后重新取current/latest+accepted检查cancelled、owner、day、due、shown、token、每日key；发布失败/owner失效不写key | S3 §6.4/6.5，M1 |
| tests/desktopPetInit.test.mjs | 修改 | adapter继续执行真实hook源码，资格函数使用真实protocol；有限内存Storage、publish deferred与真实listener callback，支持已有owner rerender。新增6个故障顺序：ACK先返回后、正常只写一次、等待期间日期/显示/due改变、owner取消、发布失败 | S3 §6.7，M1 |

等待的是当前一次publish completion，不是可以持续接收新pending的running队列；没有循环重试、ACK自动重放或快记/待办/收起重放。等待后的latest summary重新读取，避免await前捕获的summary陈旧。Rust/public protocol/window/App/assets/业务保存接口均未修改。

goal_lock_check: 修复G3真实提醒后日键闭环，保留G1本地实用提醒和单owner。anti_goal_touch_check: 无新消息框架、无双份业务数据、无数据迁移/全局hook。authoring_ergonomics_notes: N/A（没有配置/规则样本变更），有限inflight字段只解决已复现的跨窗时序。

## 本轮 impl-safe 验证

owner: S3 impl。以下本轮fresh运行；缺证据不称成功。

- `node --test --test-reporter=spec tests/desktopPetInit.test.mjs`：exit0，10/10、0失败；完整输出读取。覆盖实际hook的6新时序及原4初始化用例。conclusion_if_missing：不能称M1回归绿。
- `npm test`：exit0，155项/0失败。组合tool输出总预算导致中间212 tokens被截断，因此又运行下述紧凑全量命令并完整读，不以被截断输出作最终完整Gate。
- `node --test --test-reporter=spec tests/*.test.mjs`：同npm test实际测试集，仅切换reporter；exit0，155/155、0失败，完整输出读取。Node stripTypeScriptTypes experimental提示保留。conclusion_if_missing：不称全量测试通过。
- `npm run build`：exit0，TS/Vite/PWA完成；Three约737KB与>500KB chunk warning保留。conclusion_if_missing：不称可构建。
- `git diff --check`：exit0，仅既有LF→CRLF提示。conclusion_if_missing：不称空白门通过。
- Rust无本轮代码变化，未在r3重新执行Rust；此前r1自身20项和root已有独立20项不伪称r3 fresh。

本轮新增测试初跑即10/10，无新增产品失败。r1测试adapter错索引失败/rustfmt缺组件及工具失败历史仍保留；M1复现成功属于产品缺陷证据并已作为修复输入。

## coordinator_handoff_verifications

实际0.9.0原生提醒：休息/隐藏不耗日key、真实显示8秒、main日键、重载不重弹，由root在包含M1补丁的最终候选承接。evidence_expected=实际双窗/隔离数据消息与主窗键/截图；owner=root；conclusion_if_missing=纯时序测试不能声称原生提醒验收。其余r1/r2原生/旧库/caller/模型移交清单保持。

contract_drift_reports: 无新漂移，原LW已涵盖M1，不需回退方案。未完成与风险：待原reviewer复核，不能把本补实施直接宣布发布PASS；原生结果仍归root。
rollback: 可直接回滚hook与对应测试的局部补丁，无数据回滚。未commit/push。
建议英文提交消息：`fix(desktop): await published reminder before confirming display`

无新增跨功能事实。
