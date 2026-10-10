# 高层方案评审记录（第 2 轮）

**评审对象**：`hlplan.md` 2026-10-07 修订版；`review_target=hlplan`
**评审时间**：2026-10-07
**评审结论**：PASS
**前一轮**：[第 1 轮](review_notes_hlplan_1.md)

## 输入与证据边界

读取当前 hlplan、clarifications、README、industry、用户原话和前轮审查；复核 `App.tsx:90–95`、`main.tsx`、`desktop.ts`、Rust `lib.rs:54–99`、noteCodec/noteFormat/NoteComposer 的旧 host 与嵌套 root、安装 API 的 workArea/startDragging/onMoved/onScaleChanged。读取命令退出 0，完整输出已核对。本轮没有代码或模型变更，没有运行 EXE/Blender/build；此 PASS 仅为高层方案可进入 readiness，不是功能成功或原生验收。

## 前轮缺口复核

| 项目 | 结论 | 本轮证据与影响 |
| --- | --- | --- |
| H1 提醒资格与展示确认 | PASS | §5 明列日期/token 资格、pet 真实提示提交后确认、main 校验后写既有 key；桌面旧自动 effect/记键停用、Web 路径保留。显式待办独立于自动提示资格。 |
| H1 重载与去重 | PASS | Rust 当前日期稳定 token；pet sessionStorage 只存真实展示过的最后 token，重载不再展开但可重传确认；main 旧日期/失效/未就绪确认不记键。main 重载不改变同日 token，闭合已显示但确认丢失的情况。 |
| H2 协议 ready | PASS | §4 明确既有业务 UI ready 保留，SQLite 成功和 main listener 就绪同时成立才 protocolReady；catch 不发布浏览器旧摘要，伙伴隐藏并有错误反馈。无需改变 schema 或原有 fallback。 |
| revision / main 代次 | PASS | §5 Rust 唯一递增 revision；main 初始化先失效旧协议、隐藏 pet、建立本次 owner 代次；拒绝旧发布和旧结果；pet 监听后读取、拒绝晚到旧快照。 |
| 动作结果 | PASS | 有限动作结果与 request ID、单个处理中、main 去重、业务阻塞保留原上下文、恢复窗失败可见、短超时只解除按钮不自动重放；不拿 show/focus 代替业务打开成功。 |

## 目标与整体可行性

用户纠正的桌宠用途、独立 Windows 桌面且最小化仍可见、简化首屏和标题/滚动条均保持。仅 main 挂 App 与保存，Rust actual caller 门禁覆盖业务保存/加载/AI及伙伴命令；pet 独立入口不 import 主业务副作用。模型用本机忽略资源按存在映射，公开缺资源回退 SVG，个人构建逐角色真实 GLB 验证。旧正文只保留固定短文字与纯文本往返，不再扩正文画布。

窗口最小化与关闭生命周期明确；自动动作不聚焦主窗，显式快记/待办才恢复聚焦。物理工作区、负坐标、outerSize、跨屏 scale 变化和人工拖动优先权均进入方案。有限状态和受控帧率比移植整套桌宠平台适合当前实用目标。

## 设计味道扫描结果

**WARN（不阻断）**：revision、owner 代次、提醒 token 和请求标识各负责一项确定的重载/晚到问题，当前理由成立，但 LW 应维持局部结构和有限枚举；不扩成总线、消息持久队列、通用 ack 框架或 heartbeat。已明确只保留最近必要标识和小摘要，符合简洁目标。

## LW 必须落实的可核查点

- 写清 Rust 自动附加 token/revision 后 main 如何得到当前有效资格；不能在 main 自造另一份 token。测试日期转换、隐藏/休息未展示、pet 重载/main重载确认、重复与旧确认。
- 将 StrictMode effect 清理和 main begin/load/listener 的代次与取消条件落到具体函数；旧 load 不能仅拒绝发布却更新新 App 数据。main 初始化失败、取消、listener注册失败均保持伙伴未就绪。
- 动作结果需按 owner/request ID 验证，定时超时和晚到结果不得触发新请求的状态变化；主窗清理后 pet 不重放业务动作。收起结果须与真实隐藏/偏好状态一致。
- 给出精确 pet capability/API 列表及测试 actual caller；不能只信 payload label。进一步权限来源核对属于 LW 的必要实现锚点。
- 主窗前端重载、 pet 真实隐藏/显示必须有资源和 listener 清理路径；blur 不是隐藏。人工拖动 owner、晚到 setPosition 取消、DPI 边界和 focusable 选择需落实并原生测。
- 固定 legacy host 的转义/未知/fence/首个token规则保留，列出删除入口与嵌套 root 的确切函数链；旧正文保存/草稿/删除撤销、连续输入和选区不能省略。
- refined 视觉质量和新增 clip 只按实物判断；无 clip 则使用诚实 fallback。五角色模型不能只通过类型/GLB格式就声称精细或动作满意。

## 验证与契约一致性

impl 负责 fresh Web/Rust自证和模型导出/重导，review负责独立实现核验，coordinator负责真实浏览器、精确 EXE、双窗/透明/焦点/最小化/拖动和旧库比较；用户判断造型满意度。原生、混合 DPI 和多屏没有证据时仅记未测，不用网页截图代替。

前轮共享 readiness 章节计数漂移仍存在于技能文本，当前任务按 canonical 已明确的五类基线内容核查；README 已留痕，无需凑章节或修改共享技能。计划当前无新的 baseline drift；旧正文功能文档待对应实施同步，历史报告保留。

## 放行

H1/H2 已补足，不需要新的用户决策。允许执行独立 second-pass readiness；readiness PASS 后进入 LW，而非立即实现。保持五项 0.8.1 旧工作，交付统一 0.9.0 的身份仍待实施验收。

## 跨功能事实（待确认）

无新增；前轮提醒实际展示与发布不同的事实继续有效。
