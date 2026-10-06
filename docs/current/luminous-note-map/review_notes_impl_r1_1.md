# 实施后独立评审：luminous-note-map r1 / 第1次

- review_target=impl
- impl_round: 1
- review_seq: 1
- review_date: 2026-10-03
- 实施输入：[impl_report_r1.md](impl_report_r1.md)、[impl_validation_r1.md](impl_validation_r1.md)。
- 协议结论：REVISE
- 业务结论：PLAN_DEFECT
- defect_source: plan（原同步阈值合同需修订）；附带局部implementation缺陷（pan清理、评分成本）和coordinator待补证据。

## 判断与边界

问题方向正确，当前局部证据足以收敛为修订，无需重新定义产品或新增用户批准。S1–S5已有实际落地，35项纯测试及Web构建不能证明新界面的观感、连续交互或Windows制品完成。计划中的80条/40000字符同步边界已被实测反例击穿；改变该合同需要原地修订LW，因此本轮整体不能仅归为IMPL_DEFECT。平移清理和评分扫描是其中可局部修补的实现问题。

| 必填字段 | 结论与依据 |
|---|---|
| goal_lock_alignment | aligned；真实顶部工作台、网格/日期、独立关联图已接入App；实际视觉和交互验收尚缺。 |
| anti_goals_touched | none；见下表。候选边数有界不等于计算成本有界，评分缺陷另列。 |
| authoring_ergonomics_check | pass；原笔记展示迁至NotesView，共享NoteFilters/noteText，模型、请求控制、几何与Canvas职责可定位，没有新增通用配置框架。 |
| declaration_readability_check | pass；NoteGraph通过普通props/ref接入，保存仍回到App单一入口；无需拼装第二套编辑/存储声明。 |
| plan_defect_checkpoint_recommended | yes |
| plan_defect_checkpoint_reason | 在已实现基础上收敛同步阈值、评分工作量、D3平移所有权和后续真实验证口径，避免计划与下一轮源码矛盾。 |
| plan_defect_trigger_reason | 原80/40000阈值允许76条、39166字符同步执行，独立p95为152.51ms；修改原LW明确阈值与边界验证，已超出“不改计划”的IMPL_DEFECT适用范围。 |
| impl_safe_validation_check | pass；reviewer本轮独立35/35测试、Web构建、diff检查及下述诊断均实际执行；不扩张为所有需求通过。 |
| coordinator_handoff_check | missing；责任划分正确，但新GUI/真实Worker加载/新Windows制品证据未齐；浏览器及系统内存故障属于待承接边界。 |

## 输入与实际代码核验

已读取当前clarifications完整基线、README、research、两份原始feedback、HL、LW、两轮LW评审、实施报告/验证/UI观察。核对实际App、NotesView、NoteFilters、notePresentation、noteText、noteGraphModel、useNoteGraph、Worker、graphGeometry、NoteGraph、样式与测试，以及当前只读diff和实施前TEMP快照中的App差异。未修改生产源码、计划、Git、GUI、服务或真实数据；未使用旧0.4测试代替新功能证据。

- 模型只接收有效Note的id/content副本；标签按文档去重计频，正文提取复用显示规则并做Unicode正规化；事实边与正文推断边区分，主动top2及全局≤4N，孤立节点保留。分组基于全有效语料，筛选只是可见投影。元数据变化不重算关系。
- 卡片60条分批不截断筛选或关联图节点；默认网格、日期布局和移动断点有实际结构/样式。App仍持有原保存、草稿、回收站、账本和AI主链，编辑按最新UUID读取。
- Worker请求保留1在途/1最新pending、版本及实例身份校验、10秒终态、重试和取消。旧响应、失败、关闭视图行为已有纯合同测试；StrictMode效果清理链可追踪，但本轮没有真实React StrictMode挂载/卸载交互证据。
- D3只修改模型副本；Canvas使用局部CSS像素、逆变换和DPR独立绘制，同UUID位置/镜头放在App会话ref。动画禁用仍保留静态按钮/选择；隐藏、卸载停止RAF/模拟，资源清理存在下述平移缺口。原生手势并未实测。

## 基线与澄清一致性复核结果：PASS

产品未回答列表为空；原始“明显改变形态、多色、大图、每笔记节点、标签+正文关联”决策未被新需求替换。继续实施/EXE授权已记录；Git初始工作的归属边界不在本评审授权内。目标锁在源码落点上遵守，验收仍未齐，不将本字段理解为发布放行。

| 禁止内容 | 可核查依据 | 结论（确认impl未踩中） |
|---|---|---|
| 任意HTML持久化/渲染、更换存储格式或迁移schema | App保存仍调用既有store/desktop；NoteComposer/Modal保持原入口；noteText提取显示文本，Worker仅接id/content | 未发现新增路径 |
| 上传正文、远程嵌入服务、双重图引擎 | noteGraphModel/useNoteGraph/Worker/NoteGraph无网络调用；实际依赖D3 force/drag/zoom/selection | 未命中 |
| 用随机装饰声称笔记关联或静默截断节点 | 模型nodes逐id创建；可见投影按全部visibleNotes；边显式标注标签/正文证据；卡片分批单独处理 | 未命中 |
| 全对全输出边或逐帧React重算模型/保存 | 模型top2/≤4N；draw/loop只绘制、推进副本模拟和会话ref，不写Note/App保存 | 未命中；评分内部扫描成本另列缺陷 |
| 完整3D、自研第二套物理引擎、过早插件框架 | 实际Canvas+D3普通模块，没有新增上述入口 | 未命中 |
| 丢弃初始未提交工作、触碰.serena或发布生成物 | 当前只读status/diff保留历史与未知工作；本review只有评审文档写入 | 本review未执行这些操作，不能据此授权后续Git范围 |

## 修订项

### R1 — 同步阈值合同需要收敛（PLAN_DEFECT，P1）

`useNoteGraph.ts`仍依LW以80条或40000字符进入Worker。root的76条/39166字符p95=114.05ms；reviewer在同一合成数据独立10轮p95=152.5144ms，请求控制器factory调用为0，确证走同步。两次都超过50ms候选，足以否定旧同步边界的舒适性假设，不代表所有机器的延迟。

采用24条或8000 UTF16字符进入Worker是合理的最小工程修订，无需新产品决策，也不承诺该值保证所有输入<50ms。LW明确OR及等于边界、1在途/1最新pending保持；补23条/7999字符同步与24条/8000字符Worker边界，76条反例必须走Worker。总构图耗时、真实Worker启动/CSP加载由coordinator随后承接；不要把异步化写成算法已满足300ms候选。

### R2 — 活动背景平移未清理（局部IMPL_DEFECT，P1）

`NoteGraph.tsx`允许背景mousedown进入D3 zoom；cleanup只取消node drag的OwnedMouseGesture及Canvas `.zoom/.drag`监听。安装的d3-zoom/src/zoom.js在mousedown把mousemove.zoom/mouseup.zoom放到window，并调用dragDisable；只解绑Canvas不会移除它们或恢复选择。

reviewer使用实际安装D3与受控EventTarget启动平移，再执行当前卸载路径：window的mousemove.zoom、mouseup.zoom及selectstart.drag仍在；卸载后的mousemove仍preventDefault，而disposed guard只阻止应用回调。正常mouseup才恢复。这是受控Node诊断，不是原生GUI拖拽证据。

最小修复：在真实鼠标平移start捕获自有window监听身份；正常end清引用。cleanup先disposed，再仅在身份仍属本实例时移除自有zoom move/up并dragEnable恢复，随后清引用。无活动、正常结束、别人接管不得扫window。保留已正确的node drag容器/屏幕subject/逆变换和R1.1所有权保护。补真实D3受控pan-start→cleanup、正常end、接管和迟到事件测试，不引入通用资源管理框架。该项单独满足局部、低风险、无需新产品决策三条件；整体仍因R1需改LW而归PLAN_DEFECT。

### R3 — 稀疏候选后的评分仍平方扫描（局部实现成本缺陷，P1）

`noteGraphModel.ts`评分阶段对每个gram遍历完整postings bucket，再做candidates.has；候选≤64并没有限制这一步扫描。独立临时诊断统计实际Set.has：100条相同“甲乙丙丁”正文为50000次，200条为200000次，恰为5N²；输出仍分别只有100/200节点和100/200边。不是稠密输出问题。

改为只对既定候选做稀疏向量点积或等价的有界计算，保留IDF、候选选择、主动top2、≤4N、稳定排序及事实/推断语义；复用现有模型等价比较。加入小规模工作量核验，不能只用包体或一次墙钟测试自证。无需截断正文/节点、替换D3或重设计关系引擎。它单独也可局部低风险修补；LW补入该成本锚点，和R1一并收敛。

### R4 — 真实界面与新制品仍未验证（证据缺口）

当前IAB crash、恢复/新建attach/CDP操作失败；没有新工作台多色观感、图中DOM选择、按钮缩放/适配、跨视图镜头、过滤/编辑最新UUID、Worker实际加载等完整新GUI证据。HTTP200、源码检查和旧界面截图均不替代这些结果。不要把缺少原生Canvas手势、系统减弱/hidden、GPU帧率、IME/缩放API口头升为PASS。

后续由root恢复隔离环境后承接可操作GUI及截图；原生项目仍列未测。新0.5.0正式EXE/hash/启动及备份前后语义比较另行承接，不能倒置为代码审查前置，也不能在本轮声称交付完成。低内存阻塞不妨碍先完成以上局部LW/源码修订。

## 设计味道扫描结果：FAIL

有界候选之后仍扫描全倒排列表，造成稀疏外观掩盖平方工作量；D3活动平移的window所有权清理未闭环。两者影响已授权的舒适和性能目标，应阻断本轮总体放行。其余职责拆分与成熟依赖可保留，不建议扩建框架。500条耗时/25KB增量仅为候选预算，不据此强迫大型架构重写或新增审批。

## 本轮验证与失败记录

| 执行方 | 实际结果 | 能证明及不能证明 |
|---|---|---|
| impl | impl_validation记录35/35、build0、diff检查0 | 实施自证；reviewer没有以自述代替独立检查 |
| reviewer本轮 | npm test退出0，35项、0失败；npm run build退出0；git diff --check退出0，仅LF/CRLF提示 | 纯合同和Web构建；未证明GUI/桌面发布 |
| reviewer本轮 | TEMP/qingjian-review-impl-r1.mjs退出0；实际D3平移泄漏、5N²扫描、76条同步反例均复现 | 受控诊断和CPU计时；非原生手势/帧率证据 |
| root | UI观察记录测试35/35、build0，cargo check0；未完成新GUI | 责任承接中，不能借旧0.4证据替代 |

本轮独立build：初始JS gzip87.53KB，图chunk25.56KB，Worker未压缩3.57KB，CSS gzip7.68KB，PWA383.30KiB。按原基线初始JS85.70KB计算，新JS+图增量至少27.39KB，尚未加Worker；25KB候选未达到。root随机500条p95从2620.79降至1265.95ms、1000条7312.58降至4301.45ms；自然重复模板100/500/1000为31.14/360.24/1145.02ms。500≤300ms候选未达到，模板不证明语义质量或GUI顺畅。

保留已见失败，不将随后绿灯抹掉红灯：impl早期Python GBK解码失败→UTF8修正；首轮build出现drag subject/geometry函数签名/MessageEvent及错误处理类型错误→修正后build0；PowerShell npm路径失败及.NET Globalization fatal0xC0000005→cmd执行；内联Node引号错误→临时文件执行。reviewer首轮PowerShell源码读取OutOfMemory/FailFast、一次cmd内联Node引号SyntaxError，随后改用cmd完整文件读取/临时诊断文件。部分组合输出截断后已分段回读；App无索引diff退出1表示差异存在，不冒充测试失败。没有执行红绿变异回归，不能声称其有效性已验证。

收口阶段一条带空格正则的cmd rg行号查询因引号拆分退出2；其部分输出不作为完整查询成功证据。此前已完整读实际源码，缺陷证据来自该源码、D3源码和成功诊断，不依赖这条失败查询。

root已记录误读tsconfig.app.json、impl_report.md退出1后定位正确文件退出0；IAB崩溃/恢复策略阻断、新页attach和原tab CDP超时、open_in_codex工具请求失败。Rust测试首次E0463，-v进一步E0786、mmap rlib系统os1455；root后续消息报告--jobs1仍2MB allocation failed、退出0xc0000409，系统FreeVirtual约844832KB。后两项来自root消息，未由reviewer独立运行；不得据OOM推断应用缺陷或称Rust测试通过。root已停自有Vite进程，保留原用户5173并请求释放内存；不要求重复压力运行掩盖环境故障。

## contract drift / stale / mirror mismatch

- 源码80/40000忠实旧LW，但旧性能假设与新实测不匹配：需同步LW S2阈值、边界测试及README/实施记录的当前事实；不要先改码留下旧合同。
- S4声明活动资源清理，R1.1主要覆盖node drag；实际zoom pan所有权遗漏需补锚点。不是产品方向漂移。
- 模型候选和边数合同满足，但“等价优化”未形成有界评分工作量。语义等价证据不替代成本证据。
- 当前0.5.0版本元数据已落地；正式制品、真实启动及当前GUI未验证，阶段文档不得以S1–S5代码已落地表述为MVP已交付。旧0.4发布记录保持历史。

## PLAN_DEFECT原地修订输入包

- 是否需要澄清：否。human既有why/boundary/risk不变；阈值和局部修补是agent的how，无新增产品问题或批准前置。
- 原地修订点：LW S2添加24/8000及稀疏评分成本锚点；S4补活动zoom pan身份/清理/恢复验证；S5/验证章节保留真实GUI、预算未达和环境故障承接顺序。
- 已部分落地与偏差：保留现有S1–S5、Worker调度、全节点、UUID会话镜头、显示提取、分批和全部35测试；偏差仅以上三处合同/实现及证据缺口，不回收已实现功能。
- 收敛任务：先Review(LW)局部修订→有限源码/测试补实施→独立ReviewImpl；root环境恢复后补GUI/Worker运行与实际0.5.0Windows构建/hash/启动安全证据。不要启动服务、真实DB或Git作为局部patch必要条件。
- 必须保留：LW原核心链路、S1–S5任务与片段、S4 R1.1修订支撑、研究事实映射、两轮LW失败/恢复记录及原实施证据；各修订章节新增“本轮修订说明”及统一修订标签，覆盖更新而非删除整段。没有必要删除这些支撑文本；若实际出现整链删除/大重排，需升级处理，不能按普通局部PLAN回环。
- 回滚保持局部graph/工作台代码和现有动效开关/视图切换口径，不改变存储/schema、不触碰未知初始改动或.serena。候选预算如仍未达到如实记录，不改写为已达到或强制用户接受。

本轮不允许进入完成/归档/发布结论；允许coordinator继续上述最小LW回环。无跨功能事实。
