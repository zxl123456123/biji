# S3 实施后评审（r1 + r2，第 1 次）

review_target: impl  
impl_round: S3 r2（包含 r1 最终源码）  
review_seq: 1  
review_date: 2026-10-07  
协议结论: REVISE  
业务结论: IMPL_DEFECT

## 输入及本次范围

- 当前 `clarifications.md`、423 行 `lwplan.md` 的 S3、`review_notes_lwplan_2.md`。
- `impl_report_s3_r1.md` 和 `impl_report_s3_r2.md`，实际当前工作树和相关 diff。
- `main.tsx`、App 的初始化/保存/摘要/动作入口、`useMainPetBridge.ts`、`desktopPetProtocol.ts`、`DesktopPet.tsx`、`desktopPetMotion.ts`、独立 CSS、共享 Figure/View。
- Rust `desktop_pet.rs`、`desktop_pet_windows.rs`、lib 的五业务 wrapper/注册/setup/关闭、pet capability 和 windows-sys 直接依赖。
- 两个 JS 测试文件 8 项及 Rust 9 个新增测试实际源码；未改源码、未递归委派、未调用真实用户数据库或凭据。

本结论是 S3 源码/impl-safe 审查，不是最终 0.9.0 发布审查。root 正在承接隔离原生候选、真实旧库与最终版本身份；这些未完成结果不在此伪称通过。

## 明确字段

| 字段 | 结果 | 依据 |
| --- | --- | --- |
| goal_lock_alignment | aligned | 独立 220×260 透明窗口、已有快记/待办和唯一 main 保存者均可追溯；提醒局部竞态待修 |
| anti_goals_touched | none | 精确 native label 入口、pet 没有 App/store/AI/业务存储，没有额外任务系统 |
| authoring_ergonomics_check | pass | App 传有限摘要/回调；平台 helper 专属固定 pet，不改笔记作者格式 |
| declaration_readability_check | pass | 有限 TS/Rust 字段和字面意图，精确两条事件 ACL，非任意命令框架 |
| plan_defect_checkpoint_recommended | no | M1 修补限当前已定义的提醒确认处理与测试，不改变阶段目标、验收或回滚 |
| plan_defect_checkpoint_reason | 局部提醒确认异步顺序缺陷 | 当前计划已经要求确认晚到、当前 token/latest 资格及真实显示后主窗记键 |
| impl_safe_validation_check | pass | reviewer fresh 运行 8 项实际测试及故障顺序复现；完整 npm/Rust 门由 root 承接 |
| coordinator_handoff_check | pass | 报告明确原生/调用者/视觉/数据责任及缺证据约束，没有冒充现场已验 |
| 基线与澄清一致性复核结果 | PASS | 用户授权和独立桌面答复无未答项，关闭/首版动作仍标为 coordinator 实现判断 |
| 设计味道扫描结果 | WARN | 新增平台和并发代码体量较大，但限本窗循环/取消/唯一保存者；不阻断的局部范围理由成立，避免再扩泛用重试平台 |

## 阻断缺陷 M1：真实提醒确认可能早于 main 的 publish 返回

**优先级 P1；局部实现缺陷。**

当前顺序：

1. `desktop_pet.rs:122–131` 在 `pet_publish` 内更新当前 snapshot、成功 show/visibility、`emit_snapshot`，最后才返回结果。
2. `useMainPetBridge.ts:21–24` 只在 `await invoke('pet_publish')` 返回后把有效 Rust snapshot 写入 `accepted.current`。
3. pet 的 snapshot 事件在另一个 webview 接收。`DesktopPet.tsx:152–174` 可在通知真实 render 后写 session token 并发 `reminder-shown`；没有契约保证这个跨窗确认晚于 main 的 invoke completion。
4. main `useMainPetBridge.ts:65–66` 立即校验 `accepted.current`，其仍可能是 null 或旧 token，返回 unavailable “提醒已过期”，不记每日键。
5. pet `sendAck` 只处理 `pet_action` invoke rejection；Rust 发出的 unavailable result 被当前 result handler 的显式 `inflight` 匹配过滤。ACK 标识继续为同 owner/token，session 已显示 token 也已写入。publish 后来成功并不触发再次确认。这次确实展示的提醒无法闭合每日键，直到后续重载等偶然路径。

### 本轮实际复现（非推测）

reviewer 用 Node `stripTypeScriptTypes` 执行**真实 hook 源码**，有限 adapter 与现有初始化测试一致，没有复制待测 handler。顺序为 begin/load 成功 → owner rerender 发 publish（保留未 resolve）→ 已知当前 Rust token 的 reminder-shown 事件 → publish resolve。

命令 `node --input-type=module -e $reviewScript` 退出 0，完整输出：

```json
{
  "results": [{
    "cmd": "pet_action_result",
    "arg": {"result": {
      "owner": 1,
      "requestId": "pet:ack:1",
      "status": "unavailable",
      "reason": "提醒已过期"
    }}
  }],
  "reports": ["提醒已过期"],
  "dailyKey": null
}
```

这证明合法故障顺序下**现有主确认实现**拒绝已显示 token。它不声称真实 Windows 每次发生；跨 webview 顺序不受此代码约束，UI 恰好通过一次不能消除此缺陷。已在发现时立即向 root 回报。

### 可执行补实施边界

- 在 main 的 `reminder-shown` 分支，对当前 owner 正在执行的 publish 做**有限等待**，完成后重新取最新 `current.current`/accepted snapshot 并复核 cancelled、owner、day、due、shown、token 和每日键。或提供等价、严格有证据的顺序修补；不能因等待而使用 await 前的陈旧 summary。
- 等待 publish 失败或 owner 失效时仍返回 unavailable，不写键；不增加循环 retry，不自动重放快记/待办/收起，不绕过 latest 资格判断。
- 在实际 hook 测试加入上述先事件后返回顺序，另校验等待期间 owner/日期/shown/due 变化不误消费键及正常完成只记一次。
- 若采用 ACK 结果有限重确认替代方案，必须匹配独立 ACK requestId/token 并保持提示不重弹、显式动作不重放；不能仅清一个 ref 却没有合法触发源。
- 本报告保持 REVISE，补实施报告与 fresh 验证后再由原 reviewer 复核，不直接进入正式发布。

### IMPL_DEFECT 三条件

1. **局部**：缺陷在既有 `useMainPetBridge` 提醒分支与已定义测试锚点；不改角色、窗口、数据库或业务入口。
2. **低风险**：有限异步顺序/重新资格判断修补，不引入跨模块状态平台、数据迁移或主要回滚变更。
3. **无新决策**：LW §6.4–6.5 已要求有效 Rust token、latest business ref、确认晚到与每日闭环；无需用户新决策、改任务结构、验收定义或回滚。

不命中 PROBLEM_DEFECT；实际目标仍符合用户纠正。暂无需回退 LW 的 PLAN_DEFECT 证据。

## 其余关键链路复核

| 复核项 | 源码证据与判断 | 证据限制 |
| --- | --- | --- |
| 唯一入口/保存者 | `main.tsx` 使用实际 `getCurrentWindow().label`；pet 分支动态 import 独立组件，不执行 App/styles/SW。App 唯一保存 effect 未移入 pet；Rust pet 模块不访问 SQLite | 不是实际 IPC caller 负向实测 |
| caller 门禁 | lib 五业务 command 的 `require_label(...,"main")` 均先于 connection/secret/network；迁移用内部 helper。pet-only wrappers 固定实际 window；payload 无 caller label | 纯 caller 测试仅判断函数；root 仍需实际 webview 负向调用 |
| StrictMode/cancelled load | main 初始化尾串行，每个 begin/listen/load await 后检查 cancelled，旧 load 不 commit 或 ready；listen 晚返回 off；旧 end 不终止新 owner。listener 与 SQLite AND 才设置 protocol owner | 本轮真实 hook 4 项支持此边界，不是人工 SQLite 故障注入 |
| publisher / revision | 单 running + latest pending；返回只更新同 owner/较高 revision，Rust owner 校验且全进程 revision 单调，pet 丢弃旧 snapshot；动作 result 按 owner/requestId | 提醒 M1 是此处尚缺的确认先事件竞态；必须修 |
| 业务动作与草稿 | 最新 ref 持 composer/quickOpen/tagPicker/AI/wheel 阻塞；blocked 不换编辑状态。快记/待办只复用入口，hide 主窗偏好+确认 native publish；5 秒显式超时不重放 | 真实双窗结果/草稿仍由 root 观察 |
| 实际显示资格 | pet 先建立所有监听，再 read；hidden/unready 不 mount Figure，不以 document.hasFocus 或 main minimize 判 visible；visibility 在 Rust show/hide 成功后发。read 的旧 snapshot revision 不降级新值 | visibility payload 本身无 revision，按同 UI 线程现有 sync native 调用顺序发送；需真实 reload/show/hide时序观察，不能称已验证所有事件乱序 |
| 休息/提醒资源 | 只有 present 且非 manual/auto rest 才开 notice/写 session token；减少动态保留静态提醒；owner/ready 变化清显式 timeout/notice/ack；通知 8 秒 timer，不要求 main 聚焦 | session token 在 React effect 后写，证明 DOM commit，不等于已现场观察；M1 阻断每日主键完整闭环 |
| 有限自主活动 | 30–50 秒延迟及60/30/10分支；60–90 logical px仅乘monitor scale一次；100 ms单 step await；interaction/rest/reduced/hidden取消且不追赶欠步 | 实际 timer/Win32 路径 root 承接；多屏/混合DPI未测 |
| native thread / 重入 | 固定 pet HWND 的 UI-thread `on_ui`；step/placement/drag 均在 OS 调用前释放锁；callback 先锁内复制 event，后 emit/DefSubclassProc；同步 SetWindowPos 的 expected 来源分类及完整 GetWindowRect signed 坐标 | 源码审查无发现 mutex 跨 SetWindowPos/start_dragging/DefSubclassProc 的确定死锁；未注入 Win32 失败 |
| Context/FFI | 安装0 Box回收；正常 WM_NCDESTROY remove subclass 并回收 Context、转发；其它 handler 有 catch_unwind，锁 poison走错误。每个窗口只 install 一次 | 原生安装/销毁0/NCDESTROY路径没有专门测试执行，不能用 Rust纯状态4项冒充；需 root 销毁实证/限制记录 |
| 拖动 ID / hover复位 | pending→loop→lastExited单真源；promise返回不是松手；旧ID被newest/lastExited保护，native exit后300ms稳定才finish。finish成功清pointer/dragging/hover。r2 10秒只反馈，显式操作 fresh query 不猜松手 | 真实正常exit、吞pointerup、按住停住、Esc和异常消息缺失尚未此 reviewer 实测 |
| 生命周期/清理 | 异步 listener 完成后若 cancelled立即 off，卸载清 action/drag/watch/移动计时器；happy/autorest/decision/notice/media/blur各effect cleanup；unpresent卸载scene。main CloseRequested app.exit，minimize无隐藏 handler | pointer capture依元素/浏览器结束释放；真实资源/GPU/进程退出 root 承接 |

## 基线与澄清一致性

未回答项为空。用户“继续开发”及“Windows 独立活动”被遵守，未新增重复权限问题；窗口关闭整 app 和有限能力仍正确标为授权内实现选择，未伪称用户逐项问答。

| 禁止内容 | 可核查依据 | 结论 |
| --- | --- | --- |
| 正文宠物扩展、游戏/商城/投喂/聊天/第二任务系统 | S1旧正文由文字兼容；S3有限 `PetIntent` 4项、App原 todo/compose回调 | 未踩中 |
| pet 挂整 App/写业务快照/自动AI | `main.tsx` actual-label独立 import；pet文件依赖和 Rust pet模块；五业务caller拒绝先于副作用 | 未踩中 |
| 全局键盘/应用监控/托盘/自启/后台服务 | Win32 API仅固定HWND subclass/定位；无全局hook或键鼠轮询；lib关闭退出 | 未踩中 |
| schema/identifier/备份变化、用户全库替换 | lib diff仅commands/setup；S3无schema/identifier变动；评审没有数据写入 | 未踩中 |
| 全桌面透明遮罩/任意窗口控制 | builder220×260、pet.json仅event listen/unlisten、native固定window | 未踩中 |
| 把Web或编译当原生/模型质量证据 | r1/r2明确原生交接与conclusion_if_missing；本报告保持源码/测试与真实环境分层 | 未踩中 |

## 本轮证据与失败

- reviewer **fresh** `node --test tests/desktopPet.test.mjs tests/desktopPetInit.test.mjs`，退出0；完整8/8、0失败、0取消/跳过，Node stripTypeScriptTypes experimental提示保留。该8项未覆盖 M1，不能用其绿结果否定新增竞态复现。
- reviewer **fresh** 实际 hook 故障顺序脚本，退出0，输出上述 unavailable/dailyKey=null，证明 M1。这是故障复现成功，不是产品验收成功。
- reviewer **fresh** `git diff --check`，退出0；既有 LF→CRLF 提示保留。
- impl报告/root verification记载149项JS、20项Rust和build结果；reviewer读实际测试源码和报告，但未冒充本次独立执行完整 npm/Rust或原生测试。最终 fresh 门仍归 root。
- 初次组合大输出被工具截断；Rust关键 commands、S3计划关键契约、测试和实际调用边界已针对性重新读。registry wildcard直接交 rg 失败、候选 tauri-macros2.6.1不存在；获取实际registry根后读2.6.3 command wrapper。失败未当成功证据。
- r1已见测试fixture失败、缺rustfmt组件及工具锚点失败仍由原报告保留；本次未删除历史记录。

## coordinator 承接清单

root 继续隔离候选实测，可与 M1 补实施并行准备，但最终正式源必须含修补：双窗透明、最小化、单屏完整短段/人工打断/自然松手/Esc、菜单与草稿阻塞、提醒 rest→due→显示8秒→每日键及reload不重弹、收起恢复/close退出。真实 caller负向、旧库各字段、五角色ready和0.9.0精确路径/version/hash单列证据。异常Win32/事件组合、混合DPI/多屏等缺实测的限制应保留。

不因缺某硬件组合要求用户承担专业验收，也不输出 USER_CONFIRMATION_NEEDED。本报告已能合法收敛为局部 REVISE。

## contract drift / stale / mirror mismatch

原 LW `rename_all=cameCase` 笔误依上轮明确审查解释采用合法 `camelCase`，不构成产品协议变更。原共享 readiness章节/问题数量张力已有历史记录，本次不改共享skill。新增 M1 是实现遗漏，既有 LW 已覆盖真实确认和晚到资格，不需改写上游任务结构。

## 后续

允许按上述局部任务补实施，保留当前实现和计划锚点；补报告/fresh回归后恢复本 reviewer 再审，不能把这次 REVISE 包装为发布PASS。无新增跨功能事实。
