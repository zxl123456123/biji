# 方案评审记录：lwplan（第 2 轮）

**评审对象**：[lwplan.md](lwplan.md)，PLAN_DEFECT-R2.1–R2.7修订版。
**评审时间**：2026-10-03。
**协议结论**：PASS。无PROBLEM_DEFECT，按默认Review(LW)契约不新增业务字段。
**前一轮**：[review_notes_lwplan_1.md](review_notes_lwplan_1.md)（REVISE / Gate-2 FAIL，原记录保留）。

## 输入与证据范围

完整读最新版LW、r1报告、clarifications末尾§7/§10及口径说明；复用已完整读取的research/source/readiness和plan-review/Required Set原文，复核相关实际源锚点。八个Composer/codec原适配/标签/草稿/Modal/CSS相关源文件SHA256仍与本feature改前副本相同，命令退出0；未实施，旧源码缺陷没有被本Gate宣称修复。

本review从当前LW实际提取inlineLiteral/decodeCodeSpan目标片段作纯演算，结合真实现contentWithTags规范化；首/尾/两端tick、长run、#name、单边/双边space、全space、NBSP等12个合成边界原字串还原，命令退出0、完整输出已读，ExperimentalWarning保留。**这只验证指定计划片段，不是生产codec、全部scanner、React或原生DOM测试**。R1实际DOM遍历与S2/S3的手感仍按原root承接责任验收。

## Required Set 复核结果：PASS

T3、S1–S4主要工作包保持。T1十三项在§1–5与逐包目标/文件/函数锚点/目标形态/步骤/验收/回滚/依赖/作者体验/证据责任存在；T2 I/O及边界/回归有S1修订黄金夹具；T3接口矩阵、原API/无schema迁移、兼容和降级/发布责任保持。无任务数/测试数质量门槛。

## 目标锁 / 反目标复核结果：PASS

G1仍为有限格式四方一致；空li按最新§10定义为编辑暂态，规范保存跳过，未取消任何有文字项保留。G2无draft空白新记录模板/原生输入选区撤销，G3局部字体/footer/浅深390px及新证据保持。

| 禁止内容 | 修订版可核查锚点 | 结论（确认方案未踩中） |
|---|---|---|
| 引擎迁移/任意HTML/复杂工具 | §1、S1有限codec/受控HTML、S2白名单 | 确认未命中；仅复用code-span边界经验，不宣称完整CommonMark |
| 覆盖旧记录/恢复空或非空draft/默认模板 | S3原展示＋执行双检查，tags/date不reset | 确认未命中；空项规范化不放宽恢复draft限制 |
| 扩改schema/图评分/AI/普通标签 | §1/S1仅tagsFor、withoutTags跳过代码区；contentWithTags/normaliseTag/selectNotes保留 | 确认未命中；无需第三个helper改动 |
| 旧证据当新验收/清理unknown/生成物入提交 | S4新test/build/UI/version/hash及失败记录；基线比较规则 | 确认未命中 |

## 关键实现锚点复核结果：PASS

S1 parse/inlineLiteral/decodeCodeSpan/shared code词法/flattenListItems/serializeNonemptyItems与两标签helper直接可查；S2 syncFromEditor/commit/Range/IME，S3资格/insertHTML/footer/CSS，S4版本与真实证据入口保留。实际recordTools:10的trim作为不改的保存边界已显式进入片段与夹具，不再靠读者补全。

## 代码片段充分性复核结果：PASS

R2.2列表“遍历全部父子→筛无正文项→保存经真实contentWithTags/withoutTags→parse”片段；R2.3 encoder/padding/decoder及合法fence opener片段，与原四方向adapter、S2同步commit、S3模板片段构成最小闭环。无需实现全文；S4纯元数据更新文字足够，无新增行为分支。

## 作者体验门复核结果：PASS

DOM空li不被sync删除，仍可原生Enter续写/退出/撤销；保存不露空项标记。有文字父/子项逐个保留；普通literal符号仍正文。code字符/原空白不被边界吞掉，工具/模板/status依然直接且有界，无新光标/history/配置框架。此为方案作者体验门，实际undo、选区、glyph和窄屏并未提前判通过。

## 人工 review 对齐复核结果：PASS

- **核心链路顺读复核：PASS**：§2现状→有限codec/代码保护→活动DOM同步→草稿/commit→回填/预览/plain→root证据清楚。
- **research 事实映射复核：PASS**：原事实映射全部保留，新增R2.1明确记录真实trim及backtick反例，连接实现与验证口径。
- **跨包脑补需求复核：PASS**：S1存储规范化及同源scanner/parser的边界规则已冻结，S2/S3消费说明同步；不再需自行发明空项持久化或padding规则。人工总项由三子项共同支持。

## P1-P9 协议合规核验表：PASS

| 项 | 结果 | 当前独立存在性复核 |
|---|---|---|
| P1 | PASS | §5按语义包，无任务数硬门槛 |
| P2 | PASS | Required Set缺必需项即失败 |
| P3 | PASS | 存在性，不用篇幅/分数抵消 |
| P4 | PASS | T1/T2/T3分型及增量项保留 |
| P5 | PASS | §4关键口径不唯一DELEGATE_QUESTION；本轮执行细节已唯一 |
| P6 | PASS | §4 R2.6事件留痕及后续假设/风险/阶段即时对齐 |
| P7 | PASS | 无澄清数上下限 |
| P8 | PASS | §4 P0/P1/P2批问模板、未触发原因保留 |
| P9 | PASS | §5 R2.7新Gate-1→独立Gate-2＋root复核，失败回环，不凭自检实施 |

## 基线与澄清一致性复核结果：PASS

未回答为空。最新§7两helper代码区保护、§10空项暂态/code padding收敛与LW逐段一致；三模板/两级标题/局部字体/footer、本地草稿/日期/标签/done/deletedAt及禁改层不漂移。root最新执行细节仍由原用户目标与授权推导，不需要新产品决策。没有把旧0.5.1结果、当前50项改前基线或未测原生平台当新实现证据。

## 设计味道扫描结果：PASS

共享有限codec、薄adapter与单一DOM同步保持可读；新增规则只服务实际反例和现存持久化边界，不建立通用Markdown/编辑器引擎。计划复杂度有界，未发现新的阻断异味；实现阶段仍需查实际规模与合同，不以此替代源review。

## Gate-2：PASS

### r1修订闭环

| 原缺口 | 当前修订证据 | 判断与后续执行边界 |
|---|---|---|
| R1尾空项被trim成裸标记 | S1 R2.2冻结仅有正文项持久化、全部父子先遍历再筛空；实际保存规范化黄金夹具；S2 R2.4不删除编辑DOM且全空不能保存；S3 R2.5草稿保护不放宽 | 计划缺口关闭。首/中/尾/全空、空父有字子、普通`-`/`2.`、外部标签和Enter立即保存由impl/root按既定责任落证据 |
| R2边缘tick与delimiter合并 | S1 R2.3等长最大run、至少2 delimiter＋ASCII一层pad、新decoder保旧single空格，编码原双端space额外加pad；parser/scanner共享词法；fence info禁tick保证块首inline不误判；保存规范化往返夹具 | 计划缺口关闭。目标片段有本review有限演算0；生产保护片段拼串、#name、完整四方与DOM仍待实施/root，不提前称全部通过 |

### 原地修订附加复核

- 修订章节均有`本轮修订说明`：§2、S1、S2、S3、§4、§5；未修改的S4保留。
- R2.1–R2.7标签明确；冲突表述被覆盖，新增文字是本轮差量，不删除历史r1失败。
- 首轮支撑保留：三个public exports、plainNoteText/normaliseBody、protected-code/two-helper补丁、原生Range/同步commit/IME/undo、无draft模板/局部CSS/0.5.2发布责任均仍存在。
- 收敛任务已显式纳入S1语法/夹具、S2保存规范化、S3模板消费、§2事实映射与新Gate-1。
- 无已实施功能需要迁移/回收、无大规模删除或重排；八源哈希相同，不触发升级处理。

## contract drift / stale / mirror mismatch

clarifications末尾已准确解释首轮PLAN_DEFECT是coordinator分流标签，正式Review(LW)仍REVISE/GateFAIL；本轮按默认协议仅PASS/GatePASS，无非法业务组合。该差异已留痕。旧research候选/旧失败状态不改写为已测事实，当前权威范围唯一。

## 后续行动

- allow_enter_impl: **yes**，root复核本报告后按既定S1–S4推进，无新用户问题。
- impl只做自身纯合同/build/实际差量证据；root承接原生DOM/undo/输入/glyph/浅深390px及0.5.2新包/version/hash/启动。保留全部已见失败和未测边界，不用本Gate冒称功能、Windows安装或整体MVP验收。
- 本review只新增此报告，未修改功能/Git/UI/DB，无新增跨功能事实。
