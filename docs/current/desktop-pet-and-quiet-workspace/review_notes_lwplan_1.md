# 低层方案评审记录（第 1 轮）

**评审对象**：`lwplan.md`，2026-10-07；`review_target=lwplan`
**评审时间**：2026-10-07
**评审结论**：REVISE

## 输入与证据边界

独立读取本目录 README、完整基线、research、industry、HLPlan、第二轮 HL/Readiness、LWPlan，以及 plan-review 和 implementation-planning 合同。分段读取以消除组合输出截断。核对实际 `src/main.tsx`、`src/App.tsx:90–95`、`src/desktop.ts`、`src-tauri/src/lib.rs`、`src/NoteComposer.tsx`、`src/noteCodec.ts:19`、`src/noteFormat.tsx:38/83` 和 `src/Pet3DScene.ts`。本轮只读源文件，未运行应用、Blender 或构建；下述结论只评价实施输入，不代表功能验收。

## 可行性分析

S1–S4 工作包可识别，目标、改动、验证、依赖和回滚均存在。独立入口动态导入、Rust actual caller、main 唯一业务保存、有限只读摘要、私有 GLB 的实际存在映射、精简首屏与 legacy 文本符合当前需求。StrictMode 初始化尾和逐 await 取消、owner/revision、真实展示后提醒确认及单次结果语义有具体契约，未重新落入正文宠物方向。

## 阻断点与修订建议

### L1：原生拖动结束路径未闭合（高）

证据：LW §6.3 `pet_geometry` 将主按钮分为 `down/not-reported/unknown`，没有可靠的 `released`；`pet_drag_finish` 写“仍按住或未知时拒绝”。§6.6 要求本窗 pointerup 加 300ms 稳定，但也明确 OS 原生循环可能吞 pointerup，此时保持 dragging，等待下一次完整点击/休息/唤醒。这里缺少两个具体判定：真实 pointerup 与 `not-reported` 合起来是否能结束；OS 吞 pointerup 后如何自然恢复。若把 not-reported 也当未知拒绝，下一次真实点击仍不能结束；若接受它，契约应明确。即使后者可接受，常态原生拖动后也可能永久停动作，直到额外点击，不能满足 §6.7“松手结束”的实际验收。

恢复动作：明确 native drag begin/end 的真实可观察信号和有限后端状态流转，优先选 Windows 原生移动循环结束事件或经过实读源码证明具有结束语义的已有事件；正常 mouseup/完整点击作为明确定义的备用证据。若需要补证，通过 coordinator 只读核查 API。按钮高位 down 必须阻止误结束，0 不可单独冒充释放，但不应使已取得真实释放证据的正常路径永远失败。需给出至少“按住停住”“原生循环吞 pointerup 后松手”“真实 pointerup+0”“未知/事件失败”的判定骨架与自动测试、原生验证落点。无需新增用户产品决策。

### L2：自主位移的 moved 事件可能把自身运动取消（高）

证据：§6.2 pet 监听 `tauri://move`；§6.6 写“位置/monitor变更、scaleChanged均取消本段”，同时每个 `pet_move_step` 调用 `set_position`。自身位置更新也会形成 moved 事件。计划未规定如何区分本段预期位置通知与人工/外部移动，因此按文字实现可第一步即取消整段，无法完成 1.5 秒活动。

恢复动作：定义有限的 movementId/预期物理位置与事件处理关系；本段自身匹配的 moved 仅更新实际坐标，不取消；人工拖动开始、外部偏移、scale/monitor 改变取消。后端状态和前端事件处理顺序须说明，避免晚到上一段通知终止新段。补一个目标 handler 骨架，以及“自身15步不取消、人工拖动立即取消、旧 moved 不误取消新段”的自动验证；最终真实 EXE 观察仍由 coordinator 承接。

## 非阻断关注点

- Legacy：实际编辑器没有专用 Backspace 删除代码，依靠 contenteditable 原生历史；固定非编辑 DIV 和 root-host 序列化保留后该路径可行，计划已经指定真实删除/CtrlZ/CtrlY 验证。不能以 JSDOM 往返宣称浏览器可删除；若实际失败，使用原生历史支持的局部删除动作，不能直接 DOM remove 后假称原生可撤销。当前不因未实施就阻断。
- 初始化：SQLite/listener 成功 AND protocolReady 的区分、取消 load 不写 App、旧 end_owner 幂等已覆盖。实现时保持 begin/listener 失败仍加载主业务，不能让桌宠故障阻塞记事；不得把现有业务 fallback 变成 pet 的成功摘要。
- 五模型：实际资源解析、公开缺资源回退、私有文件不提交、actual clips 和装饰节点有证据约束。模型质量仍需真实多视角/桌面尺寸，不由 GLB 格式通过代替。
- 每日提醒：资格不等于展示、Rust 同日期稳定 token、pet 已显示 session 标识及重载再确认、main 最新资格复核有闭环。提醒确认独立于显式动作 busy；实现不得把 token 发布时刻当已展示。

## Gate-2

**Required Set 复核结果**：FAIL。T3 内容结构齐全，但原生拖动结束与自主 moved 通知两个关键状态/接口落点不能按当前文字稳定实施（L1/L2）。

**目标锁 / 反目标复核结果**：PASS。G1/G2/G3 均逐包映射，问题在具体路径而非需求建模。

| 禁止内容 | 核查证据 | 结论 |
| --- | --- | --- |
| 扩正文宠物、养成、商城、聊天、第二待办 | §1 N1，§4 删除入口/root，§6.5 回已有记事/待办 | 未踩中 |
| pet 挂 App、业务/偏好双写、自动 AI | §6.1 动态入口与不 import 边界，§6.2 actual caller，§6.3 有限摘要 | 未踩中 |
| 改 schema/identifier/备份或全库改 token | §1 N2、不影响层，§4 固定 legacy 往返，§7 数据比较 | 未踩中 |
| 全局键盘/其他应用监控、托盘/自启/服务 | §1 N1，§6.6 仅显式拖动期间主鼠标键观察 | 未踩中 |
| Web/文件身份冒充 native/模型质量；提交私有资源 | §5 忽略映射和视觉责任，§7 独立原生清单/私有来源/缺证据不得成功 | 未踩中 |

### 关键复核

| 项目 | 结果 | 说明 |
| --- | --- | --- |
| 关键实现锚点复核结果 | FAIL | S1/S2/S4 文件与函数明确；S3 native drag 结束来源及自有 moved 识别缺少关键 handler/状态语义（L1/L2） |
| 代码片段充分性复核结果 | FAIL | legacy、URL解析、初始化、提醒、movementId 的片段均存在；原生结束与自身 moved 取消的主链缺少可判定骨架 |
| 作者体验门复核结果 | PASS | 功能专属模块与有限枚举，SVG 只移动渲染边界避免循环，App 未整体拆重构；工作包顺序明确 |
| 人工 review 对齐复核结果 | FAIL | 核心链路顺读 PASS；research 事实映射 FAIL；跨包脑补需求 FAIL，合并结论 FAIL |
| 核心链路顺读复核 | PASS | §2 现状→改动→不改层→结果/验证按主链组织 |
| research 事实映射复核 | FAIL | §3 映射多数事实充分，但 startDragging 无结束保障虽被识别，§6.6 没有可完成正常结束的可靠落点 |
| 跨包脑补需求复核 | FAIL | reviewer 必须替作者决定 §6.3 finish 与 §6.6 pointerup/Win32 的组合语义，并补 moved handler 的自有事件分类 |

**P1-P9 协议合规核验表**：PASS。

| 项 | 结果 | 依据 |
| --- | --- | --- |
| P1 | PASS | 无任务数量硬门槛，S1–S4 按实际职责划分 |
| P2 | PASS | §9 存在性 Required Set，缺项不放行 |
| P3 | PASS | Gate 不采用分数或比例放行 |
| P4 | PASS | 开头 T3，§9 明确包含 T1/T2/T3 Required Set |
| P5 | PASS | §8 范围/验收/回滚不唯一强触发委托问题 |
| P6 | PASS | §8 新假设/风险/阶段切换留痕位置与当前触发事实 |
| P7 | PASS | 无问答数额；未触发解释不把数量当门槛 |
| P8 | PASS | §8 P0→P1→P2 批量模板及当前未触发原因 |
| P9 | PASS | §9 Gate-1自检、独立Gate-2+root复核、失败回LW；无递归委派指令 |

**基线与澄清一致性复核结果**：PASS。未回答列表为空；独立 Windows 桌面/最小化可见与继续开发授权保留，旧正文目标纠正落实；具体窗口/关闭/首版动作选择被标明为 coordinator 范围内决策，未伪称额外用户问答。L1/L2 是实现路径缺陷，无新范围决策，不应再次问用户是否继续。

**设计味道扫描结果**：WARN。owner/revision/requestId/reminderToken/movementId 分别对应真实晚到与数据安全风险，目前是功能局部状态，未形成通用总线或持久动作队列。应维持当前有限边界；Win32 观察若没有完整拖动终止语义，容易变成多余防御复杂度，需按 L1 收敛。

**Gate-2**：FAIL。

## contract drift / stale / mirror mismatch

已知 readiness 数字章节计数与 canonical 内容类别漂移，README 已留痕，按 canonical 明确类别判断。另 plan-review 委托提问段写“2–3个、超过3个建议拆轮”，与 canonical P7 不设上下限有口径张力；本计划正确按实际不确定性和优先级处理，未采数量门槛。本轮不修改共享技能。LW 的 native drag 结束要求与“松手结束”验收不一致是本次须修的局部契约缺口。

## 后续行动

回原 lwplan 文件补丁式修订 §3、§6.3/6.6/6.7 和相关风险，关闭 L1/L2 后执行第 2 轮独立 Review(LW)。源代码尚未实施，无已落地代码需要回收；无需问题重定义、无需新用户许可。其他工作包和已修 H1/H2 契约保留。

## 跨功能事实（待确认）

无新增；原生拖动结束及单写者事实已在上游候选池记录。
