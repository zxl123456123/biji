# 实施后独立评审：luminous-note-map r2 / 第1次

- review_target=impl；impl_round: 2；review_seq: 1；review_date: 2026-10-03。
- review_scope: LW三个R2块规定的有限源码补丁及其纯验证；最终GUI/Windows交付验收另列，未纳为已通过。
- 输入：[impl_report_r2.md](impl_report_r2.md)、[impl_validation_r2.md](impl_validation_r2.md)、[r1正式缺陷](review_notes_impl_r1_1.md)、[LW第三轮评审](review_notes_lwplan_3.md)。
- 协议结论：PASS
- 业务结论：PASS
- overall_mvp_acceptance: 未验证；本稿允许root继续真实验证与构建，不支持完成/归档/发布全MVP的声明。

## 必填检查

| 字段 | 结果与范围 |
|---|---|
| goal_lock_alignment | aligned；三处修补对应原R1/R2/R3，不改变G1–G3。实际工作台/图体验仍待root。 |
| anti_goals_touched | none；证据见禁止项表。 |
| authoring_ergonomics_check | pass；保留既有具名请求/模型/几何边界，不新增配置框架或生产计数接口。 |
| declaration_readability_check | pass；pan start/end与取消顺序直接可读；阈值不做用户配置。 |
| plan_defect_checkpoint_recommended | no |
| plan_defect_checkpoint_reason | 本轮已按独立放行的R2合同闭合三项源码问题；未发现需再回LW的新增缺陷。预算和真实验收不足继续原S5承接，不伪造成功或无故重开产品决策。 |
| plan_defect_trigger_reason | n/a；本轮未再命中PLAN_DEFECT，r1结论保持历史。 |
| impl_safe_validation_check | pass；本轮reviewer实际独立串行41/41、Web build0及历史fixture来源核验0。 |
| coordinator_handoff_check | missing（最终实测证据）；impl交接责任/产物/不足约束完整，root本轮纯验证有记录，但GUI/真实Worker和制品验收未齐。此字段不以源码PASS升格为交付PASS。 |

## 三项源码缺陷复核

| 缺陷 | 实际实现与独立证据 | 本范围结论 |
|---|---|---|
| R1：同步80/40000边界 | useNoteGraph#createGraphRequests仅large判定改为≥24 OR UTF16≥8000。生产控制器测试覆盖23/7999同步、24/24及1/8000异步、76/39166异步；原1在途/最新pending、版本/epoch/实例、失败/重试/取消用例全部保留并独立运行 | 闭合 |
| R3：完整posting评分扫描 | noteGraphModel评分每gram取posting/candidates较短集合，访问≤min(bucket长度,候选数)≤64；外层gram顺序不变，各候选同项乘法/累加顺序不变。完整历史模型和逆输入deepEqual；实际生产评分段插桩100/200重复正文为1000/2000访问，旧50000/200000反例不再存在于该段 | 闭合，限评分段 |
| R2：活动背景pan清理 | NoteGraph真实mousedown start捕获非空自有.zoom move/up身份；mouseup正常end清引用；非鼠标/程序变换不覆盖。cleanup先disposed→生产cancelOwnedPanGesture身份校验/只移除自有监听→dragEnable→清引用→原node drag清理。真实安装D3受控测试证明取消后晚move不preventDefault、不改camera；正常end/接管/非鼠标边界保留他人资源 | 闭合，限受控D3及源码接线 |

生产pan helper直接使用D3 selection读取身份，并调用真实dragEnable；没有影子取消实现。测试的Canvas/EventTarget只提供D3所需表面，组件注册/teardown胶水在夹具中有同形复现，reviewer另读实际NoteGraph核对该接线；未把该夹具称作React实际卸载或原生GUI操作。

评分测试读取当前生产noteGraphModel源码，仅在两条实际评分循环插入计数，再通过Node stripTypeScriptTypes在内存执行，仍导入生产noteText/recordTools；插桩输出再次与完整model比较。冻结JSON是测试输入与历史输出，没有第二套生产算法。reviewer独立运行`%TEMP%/qingjian-review-r2-fixture-source.mjs`：只读r1模型SHA256为`02279cae3e067a6bed927b68a28a3df3a97ce04ee59f5c140c86f7536da962fd`，4组expected均与该历史模型实际输出deepEqual，退出0。验证了expected来源，没有根据新代码猜旧输出。

## 基线与澄清一致性复核结果：PASS

当前clarifications未回答产品列表为空；标签+本地正文、成熟D3、全节点和本地纯文本决策未变。24/8000为已批准LW的工程how，不保证任意内容/设备同步都<50ms。继续开发/EXE授权仍有效；Git未知初始工作的确认边界保持。

| 禁止内容 | 可核查实际证据 | 结论（确认本补丁未踩中） |
|---|---|---|
| 上传/任意HTML/改存储或schema | 四源修订仅请求阈值、评分和pan资源；helper无网络/存储调用，模型仍id/content副本 | 未命中 |
| 随机假关系、截正文或图节点 | 模型全部nodes、候选/IDF/top2/阈值/合并/分组原链保留，冻结完整输出和旧集合测试通过 | 未命中 |
| 逐帧setState/构图/保存、无限边 | NoteGraph loop仍只绘制/推进副本；≤4N与投影测试保留；新增计数仅测试内存 | 未命中 |
| 新通用框架/第二引擎或声明负担 | 两个具名pan helper复用手势数据类型；无新配置/依赖/业务接口 | 未命中 |
| 丢弃未知工作、真实DB/Git/发布生成物 | 本review只读实际四源/测试/文档与历史模型，写评审/TEMP核验；未运行这些操作 | 本review未执行，不授权后续混合提交 |

## 独立验证及责任

- reviewer本轮执行`node --test --test-concurrency=1 tests/*.test.mjs`：退出0，41项、0失败，完整TAP已读（tool chunk fa1a35，750.5935ms）。包含原35项，新增6项；不是只跑新增测试。
- reviewer随后执行`npm run build`：退出0，tsc/Vite/PWA完整输出已读（chunk 8c0389）。初始JS gzip87.56KB，图25.65KB，Worker未压缩3.67KB，CSS7.68KB，PWA384.00KiB。
- reviewer历史fixture来源核验：退出0（chunk f66126），4组完整模型相等；没有压力计时、GUI、服务、Rust、EXE、真实DB或Git操作。
- impl完整输出/首次失败见r2 validation；root独立41/41、build0及同夹具性能见UI观察。它们与reviewer自证分开记录，未将子代理声称当独立成功。

## 设计味道扫描结果：WARN

三处r1阻断异味在本次修补范围已消除。剩余候选发现/标签及重复桶索引、正文提取和整体构图仍有成本；较短集合只限定评分段，不代表全算法线性或500条初建≤300ms。root当前同夹具100/500/1000 p95=110.97/881.34/2188.19ms，500候选仍未达到；相对S1初始JS加图增量至少27.51KB且Worker另计，25KB候选仍未达到。这些是明确保留的性能/包体限制，不是新增用户审批或本轮必须扩建架构的理由。

## 失败保留、drift与待承接证据

- r2首次串行全量40过1失败、exit1，pan取消后晚move的defaultPrevented断言true≠false。validation保留完整失败项/栈和汇总；impl独立Node诊断发现capture boolean移除适配差异，改测试DOM表面后41/41，生产D3取消代码未改。reviewer看到当前适配把boolean转换为显式capture字典，实际取消仍走生产helper；不把这次夹具红绿称作旧生产缺陷的变异回归。
- stripTypeScriptTypes ExperimentalWarning及impl diff-check LF/CRLF提示保留。首次本review技能/报告组合输出截断；技能已在本会话完整加载可复用，r2报告完整可见；后续调整输出预算，正式r1报告/LW块/测试/源码均完整读。没有把工具exit0当作未截断自证。
- r1解码/首轮类型构建、PowerShell/内联引号/rg、工具截断、预算失败仍在正式r1报告；root路径误读/评审尚未落盘读取失败、一次README上下文补丁拒绝，以及IAB crash/attach-CDP/open_in_codex、Rust E0463/E0786/mmap os1455/2MB分配失败记录仍在UI观察。内存恢复约7.5GB不代表IAB或应用验收恢复；浏览器当前仍超时。未省略失败，也不据其推断新的应用缺陷。
- contract drift / stale / mirror mismatch：本轮源码24/8000与LW覆盖合同一致，旧80/40000明确只作历史；评分/pan锚点已落实。r2报告没有将root/人工成果记为impl执行；未发现本轮新合同漂移。README“最新核对”仍引用旧现场，但状态和UI观察明确其修改前/历史用途，不作r2GUI证据。

真实新工作台浅深/宽窄/日期/网格、多帧动效、图DOM选择/编辑最新UUID/筛选/建删恢复/跨视图镜头、暂停静态按钮及实际module Worker加载仍待root实际观察。GPU帧率、原生Canvas drag/pinch、中途切页后选择、系统减弱/hidden、IME/缩放没有新实测；纯D3/几何/CPU测试不替代它们。新0.5 Windows构建/hash/可行启动和旧库语义比较由root继续承接；未在本稿验证，不用旧0.4包或HTTP200替代。

## 后续动作与放行边界

本次三个源码缺陷可以关闭，无需再次原地LW或新增产品问题。允许root以已验证源码继续既有授权的GUI/Rust/新EXE取证，制品不能倒置成源码审查前置。该阶段顺序不等于最终交付已放行：剩余证据补齐后由root更新发布事实；若真实界面/Worker发现新缺陷，再以事实恢复对应修补/评审。任何未测及候选未达必须仍明确列出，不能据本稿完成MVP归档或宣称全平台丝滑。无跨功能事实。
