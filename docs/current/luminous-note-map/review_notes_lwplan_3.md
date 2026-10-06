# 低层方案独立评审（第3轮：局部R2回审）

- review_target=lwplan；review_iteration=3；review_date=2026-10-03。
- 对象：[lwplan.md](lwplan.md) S2/S4/S5 `[修订: PLAN_DEFECT-R2]`。
- 前置缺陷：[review_notes_impl_r1_1.md](review_notes_impl_r1_1.md)（REVISE / PLAN_DEFECT）；原支撑：[review_notes_lwplan_2.md](review_notes_lwplan_2.md)。
- 协议结论：PASS
- 业务结论：PASS
- 此PASS仅放行局部r2补实施，不改变r1实施评审结论，不代表功能、性能预算或发布验收通过。

## 输入与局部核验

本轮读当前完整LW、clarifications、feature README、正式r1实施评审与impl_report_r1；对照实际useNoteGraph、noteGraphModel、graphGeometry和NoteGraph交互/cleanup落点。沿用已读研究和原基线，不重调研、不修改计划/源码、不递归委派；未运行压力、GUI、服务、DB、Rust、EXE或Git。

| 正式缺陷 | 本次计划闭环 | 结果 |
|---|---|---|
| R1 / defect_source=plan，同步阈值80/40000反例 | S2只替换dispatchLatest的large为≥24 OR UTF16≥8000；23/7999同步、两个等于边界、76/39166走Worker直接测试生产控制器。保留1在途/1最新pending、版本/实例/epoch、10秒失败及取消 | PASS |
| R3，候选后的完整posting扫描 | S2保留外层gram次序，每gram遍历posting/candidates较短集合，访问≤min(bucket长度,候选数)≤64；两分支仅累加相同乘积，单候选加法次序不变。完整模型deepEqual含分数/顺序/分组，100/200重复正文评分访问计数覆盖原5N²反例 | PASS |
| R2，活动背景pan卸载残留 | S4真实mousedown start后捕获非空window .zoom move/up身份；mouseup正常end清引用，wheel/touch/程序变换不覆盖。disposed先行→只取消自有pan→dragEnable恢复→清引用，既有node drag独立保留；实际D3受控start→取消/迟到事件/正常end/接管测试 | PASS |
| R4及预算/环境证据缺口 | S5先局部实施与ReviewImpl，再由root在内存恢复后承接GUI、多帧、真实Worker、Rust和新0.5 EXE/hash/启动/旧库比较；不把异步、受控EventTarget或旧0.4制品当最终成功 | PASS（验证责任合同，不是实际验收） |

评分修订只约束评分段；候选发现、标签/重复桶索引仍可能有较高成本，计划明确不声称整个构图线性。这是诚实的局部收敛，不要求本轮扩大优化范围。pan选择具名helper而非通用资源管理器，原局部CSS坐标、屏幕subject、逆变换、UUID会话镜头及暂停静态合同保留。

## Gate-2

**Required Set 复核结果：PASS**。原S1–S5工作包、输入/输出/依赖/验收/回滚保留；新增内容附着S2/S4/S5，有明确r2证据产物，不以任务数量放行。

**目标锁 / 反目标复核结果：PASS**。G1–G3不变；24/8000、评分循环和pan资源清理属于已授权how，没有新产品问题。

| 禁止内容 | 本轮可核查计划锚点 | 结论（确认LW未踩中） |
|---|---|---|
| 改成随机装饰、忽略孤立/截断图节点 | §1主链、S2全部节点/投影、S3全图与60卡片分批分离；R2明确不截正文/节点 | 未命中 |
| 上传/任意HTML/schema/双引擎或框架扩建 | S2纯快照/Worker、S4具名pan helper；R2无新增依赖/配置/模型接口 | 未命中 |
| 逐帧构图/setState/保存或无限边 | S2原top2/≤4N完整保留；S4原副本/单循环不变 | 未命中 |
| 删原支撑或覆盖未知工作 | S2/S4/S5本轮说明与回滚均保留已实施文本；S4 R1.1仍完整；S5不触碰未知工作/.serena | 未命中 |
| 用CPU/旧版本/候选预算代替GUI与新制品 | S5 R2失败及承接顺序明确；README仍标未验收 | 未命中 |

**关键实现锚点复核结果：PASS**。S2=createGraphRequests/dispatchLatest、buildNoteGraph评分段与graphRequests/noteGraph测试；S4=zoomBehavior start/end、capturePanGesture/cancelOwnedPanGesture及graphGeometry测试；S5=r2报告、UI观察和0.5发布证据。

**代码片段充分性复核结果：PASS**。实际large替换、评分两分支、pan注册与disposed取消顺序都有局部before/after判断所需片段。capture接受非空身份、正常end及非鼠标不覆盖在相邻文字明示，无需另造完整实现全文。

**作者体验门复核结果：PASS**。直接改已有具名实体，保留用户原文案；没有可配置阈值、namespace通用框架或影子生产模型。作者可在同一修订段读实现和验收，维护负担没有回退。

**人工 review 对齐复核结果：PASS**，汇总以下三个子项均PASS。

| 子项 | 结果 | 依据 |
|---|---|---|
| 核心链路顺读复核 | PASS | 原§1主链→三个局部落点→不改语义/存储→r2自证与root后续承接可直接顺读 |
| research 事实映射复核 | PASS | 原映射表保留；D3 mutation/窗口清理、稀疏成本、旧Worker/预算限制继续落在S2/S4/S5 |
| 跨包脑补需求复核 | PASS | 每块直接绑定正式缺陷、源码/测试、收敛及回滚，不需要猜第二数据源或新产品决策 |

**P1-P9 协议合规核验表：PASS**。

| 项 | 结果 | 存在性依据 |
|---|---|---|
| P1 | PASS | §3存在性自检，不用至少X项任务作门槛 |
| P2 | PASS | §3与R2追加Gate1列必要锚点/合同/责任/原支撑 |
| P3 | PASS | 缺任一回LW，Gate1不自代Gate2 |
| P4 | PASS | 原T3主链及S1–S5 Required Set保持，R2附着既有任务而非任意拆数量 |
| P5 | PASS | §3基线不唯一/新阻塞决策触发DELEGATE_QUESTION |
| P6 | PASS | §3事件对齐及新假设/新风险/阶段切换留痕，R2明确来自正式实施评审 |
| P7 | PASS | 未设澄清数量上下限；当前无新产品问题 |
| P8 | PASS | §3批量未触发原因及P0/P1/P2模板保留 |
| P9 | PASS | R2追加Gate1交独立回审；§3 Gate2独立主检+root回读，缺项不实施 |

**基线与澄清一致性复核结果：PASS**。未回答产品列表为空；G1–G3、标签+正文和成熟D3头脑风暴未改变；反目标未命中见表。Git未知工作确认仍仅影响其提交边界，不添加产品审批。

**设计味道扫描结果：PASS**。原全posting评分及pan清理缺口在规划合同上已闭合；保留小规模等价/成本验证，不扩建通用抽象。实际修复成效须r2源码与新证据再审，不能借本字段给r1绿灯。

**Gate-2：PASS**。允许root独立回读后进入有限r2补实施。

## PLAN_DEFECT原地修订专项复核

| 必检项 | 结果 | 依据 |
|---|---|---|
| 修订章节新增本轮修订说明 | PASS | S2、S4、S5三个R2块均有该标题 |
| 新增/改写统一标签 | PASS | 新合同段落使用[修订: PLAN_DEFECT-R2]，代码在该带标签引导段下 |
| 已实施支撑仍在，覆盖更新而非删除 | PASS | 当前LW完整保留§1、S1–S5与S4 R1.1正文/片段；旧80/40000明确被R2覆盖，保留作历史不是双合同 |
| 收敛/回收/迁移/对齐任务明确 | PASS | 局部阈值/评分/pan补丁、旧输出等价、r2报告和回滚风险已写；无需schema/数据迁移或功能回收 |
| 删除/大重排升级处理 | PASS | 未见需要整链删除/大重排，未触发升级；原支撑禁止回收仍保留 |

## drift、失败与后续边界

当前源码仍为r1的80/40000、旧评分和缺pan helper，属于Gate2后尚待补实施的预期差异，不称已经修好。新LW明确覆盖旧工程阈值；README同步Review(LW)及GUI/新EXE未验收状态，未发现新增产品或镜像合同漂移。

首次批量读取总输出被截断，LW随后单独完整读取退出0；impl_report截断后单独完整回读，未把部分输出自证完整。部分more输出出现控制台中文编码替换，本轮关键合同依据完整type输出与实际英文代码落点。未跑新测试/基准，因此35项/build0及152.51ms、5N²、D3残留均引用正式r1评审，不宣称本轮重测。

正式r1报告的早期解码/类型构建/PowerShell与引号失败、截断/rg失败、预算未达、IAB crash/attach-CDP/open_in_codex故障、Rust E0463/E0786/mmap os1455/内存分配失败仍保留在那里；没有将后续绿灯覆盖这些记录。当前GUI、真实Worker加载、GPU/native drag/触屏/减弱/hidden/IME/缩放及新0.5 EXE仍未验证。环境不足只限制后续承接，不作为应用缺陷或预算通过证据。

下一步：root回读本稿及R2 → 有限r2实现/纯验证完整失败记录 → 独立ReviewImpl；系统恢复后root补真实界面与Windows证据。无需新的用户产品确认，候选预算未达如实保留。无跨功能事实。
