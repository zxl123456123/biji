# 低层方案评审记录（第1轮）

- review_target: lwplan
- review_seq: 1
- review_date: 2026-10-04
- 评审对象：[lwplan.md](./lwplan.md)，本轮独立读取的241行版本。
- 对象SHA256：`8D246F51BE4BADA4C92904CE7C5ED9963AB1630E98BA897588F4AFE125D546DA`。
- 评审结论（协议）：**REVISE**。
- allow_enter_impl: **no**。
- 独立性：本reviewer未参与本feature规划或实现；root接管规划的事实不改变fresh Gate-2要求。未发现PROBLEM_DEFECT，按Review(LW)默认合同不输出实施业务结论。

## 输入与证据范围

已完整读取本feature的README、clarifications十章、research导航与code/industry/cancel/modern-cancel四报告、readiness第2轮及当前lwplan；核对实际App/NotesView/types/store/desktop/notePresentation和Rust lib.rs，源代码尚未实施本feature。采用plan-review完整合同、implementation-planning的T3/Gate规则和verification-before-completion。

公开API证据为TEMP目录中固定发布物`@dnd-kit/react 0.5.0`、`@dnd-kit/dom 0.5.0`及abstract闭包的JS和类型：Provider使用InsertionEffect销毁manager；stop取消不是sensor cleanup；destroy经registry清理活动sensor；sortable source直接公开initialIndex/index/group；pointerup通过nativeEvent传入dragend；type/accept在碰撞前限定合法组。没有套用legacy active/over接口。

本轮只进行文件/源码/固定发布物读取和报告核验，命令输出及exit已读。未运行服务、build、GUI、SQLite迁移或安装器，也未执行Git。下面的PASS仅为规划对应项复核，不是功能、平台或发布验收。既有readiness1 REVISE、两次planner中断未落盘、PWA/ExperimentalWarning、旧构图超预算、下载超时等历史未被本轮覆盖或删除。

## 可行性与阻断项

完整notes数组作为唯一顺序权威、同组可见ID替换原槽位、pin只改字段、SQLite投影position的主链可追溯到需求。三布局、共同批次、Trash保留、旧JSON和数据库迁移均有明确入口；S0保行为提取与S1元数据功能分步，未扩成repository。两处阻断均可在当前计划内修订，无需新增用户产品决策。

### R1：正常sensor取消与已失效旧回调被合并，收口片段不闭合

- 具体内容：lwplan:92为`if (!session.current.valid || event.canceled) return;`。但:54、:169、:171要求取消/拒绝后临时DOM回到权威顺序、失效session并安全重建Provider；同时禁止InsertionEffect销毁中的旧回调setState。正常Esc等sensor取消时session仍可能有效，直接return未说明由谁关闭该session、恢复焦点以及落实所声明的重建路径。
- 影响：S2实现者必须自行选择普通取消与销毁晚回调的不同处理时序；核心片段与正文不能直接顺读成唯一闭环。这里是计划缺口，不是已经实测的实现缺陷。
- 证据限制：固定dom发布物`sortable.js:523–570`确有正常canceled时的异步optimistic回滚。不能据此声称Esc必然残留DOM，也不能把这个异步、实例有效条件下的回滚等同于计划承诺的完整session/Provider收口。Pointer/Keyboard自身正常结束会cleanup，应用强制stop仍必须走真实destroy。
- 最小修订：分开“invalid/旧generation回调立即return且不得setState”与“有效session收到正常canceled事件”。后者先失效、无onReorder，明确安全收口的责任和时序（采用已支持的正常结束/回滚路径或声明安全Provider重建，但不得在destroy回调里调度状态）。保留应用中断的invalidate→stop→真实卸载→新manager链。有效drop、拒绝drop、正常取消分别可定位，不能仅共用一句canceled直接return。
- 体验边界：键盘drop/cancel后的焦点恢复应明确由生命周期拥有者承接，只在没有接管焦点的modal时恢复仍连接的原抓手；不把焦点从弹层夺回。验证补入正常Esc后权威顺序不变、旧session失效、下次拖动可用及该焦点条件。

### R2：实施后分流使用非canonical的CODE_DEFECT

- 具体内容：lwplan:191写“失败按CODE_DEFECT→下一impl”。plan-review正式Review(Impl)业务枚举为PASS/IMPL_DEFECT/PLAN_DEFECT/PROBLEM_DEFECT，没有CODE_DEFECT。
- 影响：后续fresh Review(Impl)与root消费合同漂移；仅按“代码问题”即可补实施，会绕过局部、低风险、无新决策的三条件。
- 最小修订：改为IMPL_DEFECT，并显式同时核验三个条件；不满足则PLAN_DEFECT，问题建模错误按PROBLEM_DEFECT恢复，BLOCKED/USER_CONFIRMATION_NEEDED留空业务结论并遵守合法组合。修订本feature计划，不编辑shared技能。此为契约缺口，不需重开需求或换库。

## Gate-2

### Required Set 复核结果：PASS

这是存在性结果；不覆盖R1技术充分性判断。

|Required Set层|可核查落点|结论|
|---|---|---|
|T1通用必备|lwplan:5–14目标/不影响项；:16–39主链/research；:127–193任务/验收/回滚/作者体验；:195–239依赖、委托和双Gate|PASS|
|T2输入输出/边界/回归|:41–54接口矩阵；:60–125关键片段；:153–155槽位与数据回归；:169–173drop/UI分层|PASS|
|T3跨模块/兼容/迁移/停机|:45–52字段与权威；:151旧7/8/10列和旧EXE限制；:171生命周期；:201迁移异常停机|PASS|
|verification责任三元组|每包指定impl报告、root TEMP证据、未验证约束；:187–191root独立验证与fresh ReviewImpl|PASS|

### 目标锁 / 反目标复核结果：PASS

G1映射S1/S2/S3的真实排序与重启；G2映射字段、pin区、备份及恢复；G3映射原对象槽位、单事务、原字段比较和不改层。范围无漂移；技术R1阻断单独列示。

|禁止内容|lwplan核验锚点|结论|
|---|---|---|
|装饰回弹冒充排序、motion关闭业务|:10、:28、:51、:165、:175；businessEnabled独立、OFF仅过渡|未踩中|
|跨pin/日期自动改元数据|:46、:48、:153、:167、:169，type/accept及最终验组|未踩中|
|自由画布、多选、云/CRDT、分数秩、第二顺序权威|:11、:22、:143、:157、:199，完整数组权威|未踩中|
|顺修导入校验、空库回退、双effect或编辑/图/交易/AI|:11、:14、:110、:147，明确保留原链|未踩中|
|清理混合工作区、删除旧失败、提交生成物|:12、:139、:185、:193、:203；只撤本轮差量|未踩中|
|零用例/旧SELECT*hash证明迁移、降级旧EXE写库|:151、:155、:157、:187，生产helper及旧列逐字段比较|未踩中|
|递归委派review/impl下级agent|:207–216只受控QUESTION/ACTION，没有递归任务指令|未踩中|

### 关键实现锚点复核结果：PASS

|包|目标形态/首读落点|必要片段|责任/产物/不足约束|作者体验|
|---|---|---|---|---|
|S0|lib.rs connection/load_data/save_data→三个薄连接helper，保SQL行为|:113–125与:133–135定位调用迁移|impl backend报告静态/check；root实际同生产helper测试；缺证不称迁移通过|顺读wrapper→SQL，避免两份测试SQL|
|S1|types/noteOrder/presentation/App及Rust字段/显式SQL；唯一数组投影|:60–73、:104–125；:145–153入口/规则|impl Node/type/build报告；rootRust/旧库TEMP证据，失败停机|有限数组函数和显式列，无秩/配置框架|
|S2|NotesView/可选NoteSorter/styles/App；Provider生命周期拥有者及合法组|:75–102、:163–171；R1需修|impl纯判据/类型；root真实UI及逐项未测边界|抓手可发现、正文操作保留，生命周期集中|
|S3|package/lock/版本/许可及明确root文档章节|:183–193；版本/许可不需运行代码片段|impl闭包/build；root全量/制品/哈希/旧库；fresh ReviewImpl；失败保留|版本和证据可追溯，不能写假完成|

### 代码片段充分性复核结果：FAIL

正常数据链覆盖呈现→sensor→最终门禁→App完整数组合并→原保存→迁移/读回，S0职责迁移有薄helper骨架。取消共享状态与生命周期强触发片段，但:92混合两类事件，不能覆盖正常取消的最小闭环；R1补齐后重审。没有要求把计划扩写为最终实现全文。

### 作者体验门复核结果：PASS

四个有边界工作包、主链前置、简单字段/数组/SQL、一个排序生命周期拥有者可读可写；保行为提取与功能分开，无新抽象框架或机械配置层。R1属于流程技术缺口，不能用本项PASS替代闭环。舒适度和读屏/触屏效果仍需root/human真实验证。

### 人工 review 对齐复核结果：FAIL

|子项|结论|依据|
|---|---|---|
|核心链路顺读复核|FAIL|:18–22已给顺读总览，但:92与:54/:169/:171取消收口不一致，R1|
|research事实映射复核|PASS|:28–39逐项映射实际抓手、数组/60/Trash、日期、SQLite、现代取消/坐标/accept/键盘和许可到实现、责任与验证；正常取消的技术片段缺口另判FAIL|
|跨包脑补需求复核|FAIL|需要自行补出S2正常canceled与失效旧回调的不同收口；其余数据/存储/验证路径不需跨包拼图|

总括项引用以上两项FAIL、一项PASS，因此FAIL。

### P1-P9 协议合规核验表：PASS

|协议项|结果|存在性证据|
|---|---|---|
|P1|PASS|:220–239按必备项，不以任务数/行数作质量门槛|
|P2|PASS|:222–237 T3必备内容表与:239缺口重Gate|
|P3|PASS|:220明确存在性入口不直接impl，无评分放行|
|P4|PASS|:3声明T3，:236–237在通用集合上补T2/T3|
|P5|PASS|:207、:210–213新阻塞决策强制QUESTION|
|P6|PASS|:200新假设/风险/阶段切换即时记录README/clarifications；无固定次数|
|P7|PASS|:207–216问题不设数量上下限|
|P8|PASS|:211–213批量按P0/P1/P2，一次提交同阶段阻塞|
|P9|PASS|:197–198、:218–239规划Gate1→fresh Gate2+root复核后才impl|

P1–P9存在性PASS不消除R1的技术充分性FAIL或R2的后续分流契约错误。

### 基线与澄清一致性复核结果：PASS

- 澄清“未回答”列表为空；readiness2输入未变。
- Q0持续开发/EXE与Q1“调整排列顺序，重启保留”、独立置顶区落实于:7–9、:20、:167、:185–189，未重新索取阶段确认。
- 目标锁被遵守；反目标未命中（见禁止项表）；没有违反已落盘头脑风暴决策。
- modern0.5.0、公开销毁链与duration0是readiness/how证据，不新增产品要求。R1/R2是当前具体计划修订，不是PROBLEM_DEFECT或新的用户决策。

### 设计味道扫描结果：FAIL

R1用同一早return吞掉“正常取消”和“失效旧回调”两种生命周期状态，使调用者必须补脑结束责任；这会影响session有效性、临时DOM和焦点恢复。其余有限纯函数、单权威、单生命周期拥有者与薄SQLhelper未发现阻断设计味道。

### Gate-2：FAIL

Required Set、目标/反目标、锚点、作者体验、P1–P9及基线一致性通过对应复核；代码片段充分性、人工review对齐和设计味道未通过，另有R2正式分流契约漂移。因此不得进入实施或发布。

## 修订与承接

root原地修订当前lwplan的S2状态/取消片段和S3 ReviewImpl分流，保留现有主链、迁移/回滚、责任三元组与失败历史。若按PLAN_DEFECT恢复口径留痕，修改章节加入“本轮修订说明”及统一修订标签；当前未实施本feature，无已落地代码需要回收/迁移，不得假造这类任务。更新Gate1后交fresh第2轮Gate2，复核R1/R2及改后主链；只有技术Gate放行才按既有用户授权进入实施。

正常取消/有效drop后的条件焦点恢复属于既定鼠标键盘体验的细化，无需重开规划或用户提问。本reviewer只新增本报告；不修改lwplan、shared技能、源码或既有功能文档。无跨功能事实。
