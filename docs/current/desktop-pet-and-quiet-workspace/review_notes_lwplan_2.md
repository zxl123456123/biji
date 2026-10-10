# 低层方案评审记录（第 2 轮）

**评审对象**：`lwplan.md` 2026-10-07 原地修订版；`review_target=lwplan`
**评审时间**：2026-10-07
**评审结论**：PASS
**前一轮**：[第 1 轮](review_notes_lwplan_1.md)

## 输入及证据边界

分段复核当前 423 行 LWPlan、industry 补查及首轮报告，保留上轮已核对的完整基线、HL/Readiness 和实际业务代码事实。独立读取本机 `tao-0.35.3/src/platform_impl/windows/window.rs:529` 的 `handle_os_dragging`、`event_loop.rs:1028/1036` 的 enter/exit，以及 `windows-sys-0.61.2/src/Windows/Win32/UI/Shell/mod.rs` 的 subclass 三个函数位置。读取退出 0；最初组合读取曾截断，关键段随后单独重读。无代码、模型、EXE 变更，无构建或原生测试；本 PASS 仅允许实施，不代表 Windows 效果或模型满意度已验证。

## 首轮问题复核

| 项目 | 结论 | 当前依据 |
| --- | --- | --- |
| L1 原生拖动结束未闭合 | PASS | §6.2/6.3/6.6 固定 pet HWND 的 UI 线程 subclass 接收 WM_ENTER/EXITSIZEMOVE；pending→loop→lastExited 用 dragId 绑定。finish 只接受匹配退出证据，位置稳定后 fresh 边界；不再靠 pointerup 或按键0。消息早于 Promise 返回、旧退出不终止新拖动、安装失败隐藏和缺消息故障均明列。 |
| L2 自有 moved 通知取消自身 | PASS | 自主 step 在 UI 线程写 expected ID/物理位置、释放锁、同步 SetWindowPos（不带 ASYNC），WM_MOVE 用完整 signed GetWindowRect 分类。owned 不取消，external 带被取消 ID；raw tauri move 只观察。旧 ID 事件不清新段，placement 独立于自主活动。 |
| 新增原生内存/重入风险 | PASS | §6.2 写明所属 UI 线程安装、固定 subclass ID/Box context；安装0释放、NCDESTROY remove/唯一释放、正常 DefSubclassProc 转发、panic 不穿 FFI。业务 mutex 不跨 SetWindowPos、拖动或 DefSubclassProc；callback 复制数据后释放锁才 emit。 |
| 安装源码是否支持假设 | PASS | 实读 Tao：ReleaseCapture、设置 dragging、Post WM_NCLBUTTONDOWN(HTCAPTION)；原生 enter/exit 已处理，exit 还补 WM_LBUTTONUP。直接 subclass 可观察本窗 native 消息，API 位于 windows-sys UI::Shell；采用本窗消息没有引入全局 hook。最终是否实际收到仍须 EXE 测试。 |

## Gate-2

**Required Set 复核结果**：PASS。T3 满足 T1 结构、T2 输入/输出与 handler/验证分层、T3 接口/状态/兼容/降级；S1–S4 目标、步骤、验收、回滚、依赖、作者体验与证据责任齐备，L1/L2 的缺失接口语义已补足。

**目标锁 / 反目标复核结果**：PASS。三目标逐包映射，独立桌面最小化可见、标题/滚动与首屏收敛、唯一保存者和实际 EXE 身份均未遗漏。

| 禁止项 | 核查依据 | 结论 |
| --- | --- | --- |
| 正文宠物扩展、商城/养成/聊天/第二待办 | §1 N1，§4 删除专用链，§6.5 复用业务入口 | 未踩中 |
| pet 挂 App、业务/偏好双写、自动 AI | §6.1 动态入口，§6.2 actual caller，§6.3 有限摘要 | 未踩中 |
| schema/identifier/备份变化、全库 token 替换 | §1 N2/不影响层，§4 legacy 往返，§7 数据比较 | 未踩中 |
| 全局键盘/其他应用监控、托盘/自启/服务 | §1 N1；§6.2/6.6 本窗 subclass 替换按钮探测 | 未踩中 |
| Web/格式冒充原生/视觉，公开私有模型或制品 | §5 忽略映射与视觉责任；§7 精确进程、旧库、私有来源和缺证据约束 | 未踩中 |

### 关键复核

| 项目 | 结果 | 依据 |
| --- | --- | --- |
| 关键实现锚点复核结果 | PASS | S1 删除名单/保留链，S2 URL/renderer，S3 entry/main初始化/bridge/windows helper，S4 身份/验证均有具体文件/函数；native 状态新增落点明确 |
| 代码片段充分性复核结果 | PASS | legacy、GLB resolver、owner初始化、展示确认、同步定位和 native handler 骨架组成主链最小闭环；正常拖动结束和自身通知分类无需 reviewer 代作选择 |
| 作者体验门复核结果 | PASS | 保留业务结构，有限功能模块/字段；Windows helper 仅处理本窗具体风险，未扩窗口框架；文档顺序和工作包依赖清楚 |
| 人工 review 对齐复核结果 | PASS | 核心链路顺读 PASS、research事实映射 PASS、跨包脑补需求 PASS，三项均满足 |
| 核心链路顺读复核 | PASS | §2 明确现状→入口/bridge/renderer→用户动作→验证，不改层和分层理由存在 |
| research 事实映射复核 | PASS | §3 将原全量保存、focus策略、GLB缺口、legacy、原生 drag/moved、ACL和误开旧EXE映射到实现/验证责任 |
| 跨包脑补需求复核 | PASS | 字段唯一契约与 §6.6 对 native 分类/拖动 ID 的顺序描述一致；其余初始化/提醒责任延续上轮已成立闭环 |

**P1-P9 协议合规核验表**：PASS。

| 项 | 结果 | 依据 |
| --- | --- | --- |
| P1 | PASS | 按实际四工作包组织，无任务数硬门槛 |
| P2 | PASS | §9 必备内容存在性检查 |
| P3 | PASS | 无分数/比例放行 |
| P4 | PASS | 明确 T3，并包含 T1/T2/T3 Required Set |
| P5 | PASS | §8 关键范围/验收/回滚不唯一强制委托提问 |
| P6 | PASS | §8 新风险/假设/阶段切换留痕；本轮 L1/L2 修订有标签与说明 |
| P7 | PASS | 不设问答数量门槛 |
| P8 | PASS | §8 P0/P1/P2 批量模板、未触发原因 |
| P9 | PASS | §9 Gate-1自检→独立Gate-2+root复核，失败回环；无递归委派计划 |

**基线与澄清一致性复核结果**：PASS。未回答列表为空；用户继续开发与 Windows 独立桌面答复保持。关闭习惯/首版动作仍正确标明 coordinator 授权内实现选择。新 helper 只修技术路径，不新增产品决策；无重新请求用户许可的必要。

**设计味道扫描结果**：WARN（不阻断）。Windows subclass/同步定位增加平台代码，但对应两个已证明的体验缺口，限定固定 HWND、有限 ID/expected position，必要性成立。实现应维持该范围，避免迁移成全局输入监控或通用事件框架。mutex/FFI/context 需真实代码独立审查，不能用此计划 PASS 省略。

**Gate-2**：PASS。

## 原地修订复核

修订 §3、§6.1/6.2/6.3/6.6/6.7、§8/9 均有“本轮修订说明”及统一标签。S1/S2/S4、owner/revision、主数据唯一保存、真实提醒、旧正文保持未被删；源代码尚未实施，替换的是未落地的按钮猜测路径，无已实施支撑文本被删除，不需升级回滚处理。新增 native 安装/分类/销毁测试和实际 EXE 清单纳入原执行包。首轮 FAIL 历史保留。

## 验证责任与实施注意

- impl 需实际完成 native handler 测试：按住停住无exit不结束、无pointerup但exit结束、旧ID不结束新drag、安装0与NCDESTROY唯一释放、自有15步不取消、外部/人工拖动取消、完整负坐标与锁不跨 Win32 调用。
- coordinator 承接最终 EXE：真正松手/取消后的自然恢复、完整短段/人工优先、双窗透明/最小化存活、五角色GLB、标题/主题细条/简洁首屏、真实提醒和旧库字段；未做不能宣称已改善或交付。
- Legacy 的删除/撤销仍依浏览器原生 contenteditable 历史，S1 已要求真测；纯往返测试不能替代。StrictMode 数据取消、listener失败不ready、提醒真实展示链、实际 caller/权限负向验证继续按原计划执行。
- `rename_all=cameCase` 是正文笔误，紧邻明确 TS camelCase / Rust 字段契约已足以确定应为 Rust 合法值 `camelCase`；实现直接采用合法形式，不需要改协议或另问用户。

## contract drift / stale / mirror mismatch

前轮已留痕的共享 readiness 章节数字、委托问答数量与 canonical P7 张力未扩大，本计划仍按 canonical 内容存在性和真实不确定性判断。LW 中按钮0/pointerup仅保留为历史拒绝判断及移除说明，不再是正常结束判据；未发现新的阻断陈旧语义。

## 放行与后续

allow_enter_impl: yes（仍由 root 独立复核 Gate-2）。无需新用户问题。按 S1/S2/S3 既定归属实施、独立 Review(Impl)、真实环境承接后再判断发布；此次放行不能替代任何完成前 fresh 验证。

## 跨功能事实（待确认）

无新增；修订中的自身 Moved 与人工 Moved 分类事实已进入 LW 候选池。
