# 方案评审记录：lwplan（第 1 轮）

**评审对象**：[lwplan.md](lwplan.md)，含code-hashtag局部补丁。
**评审时间**：2026-10-03。
**协议结论**：REVISE。**Gate-2：FAIL**。无PROBLEM_DEFECT：问题方向与最新用户需求一致，需原地修正两处有限codec规则，不能进入实施。
**coordinator分流**：计划缺陷，原地修订（仅导航，不添加Review(LW)默认契约未定义的业务结论）。

## 输入与实际证据

已完整读LW、最新clarifications（含§7两hashtag helper授权）、source模板问答、readiness报告、verification新增组合格式与代码丢字记录；实际复读Composer、noteFormat、noteText、recordTools及消费者引用。复用本轮完整加载的plan-review；再读取implementation-planning的Required Set/片段/双Gate原文。无递归委派、无功能/Git/UI/DB操作。

本review独立Node合成输入命令退出0，完整输出已读；用于核实保留函数和指定构造规则，不是新增功能通过：

- 真实`contentWithTags('- item\n- \n', ['meta'])`输出`'- item\n-\n#meta'`；编号输入`'1. item\n2. \n'`输出`'1. item\n2.\n#meta'`。当前`recordTools.ts:10`的整串trim不变，会去掉尾空项的分隔空格。
- 按S1“更长delimiter”构造：正文首backtick加edge、末backtick及两端backtick，使用双backtick包装分别得到run长度3/2、2/3、3/3；两端情形即` ```edge``` `，内容backtick被吸入边界。不能由该规则保证原文字还原。
- 真实现tagsFor/withoutTags对合成行内`#code`、围栏`#fenced`、外部`#meta`仍提取三标签并删掉代码文字；与root新增证据一致。计划新增共享保护helper是必要的局部修正，不要求扩大普通标签规则。

## Required Set 复核结果：PASS

主要工作包明确S1–S4，T3。T1十三项在§1–5及逐包目标/步骤/验收/回滚/依赖/作者体验/分层责任存在；T2输入输出、边界、回归范围存在；T3接口矩阵、兼容/无schema迁移、发布/降级存在。此PASS仅为资料存在性，不抵消下述技术合同缺陷。

## 目标锁 / 反目标复核结果：FAIL

G1四方一致、literal与空项保留，在R1/R2的现目标规则下不能闭合。G2/G3和N1/N2/N3的范围指令明确，未发现模板覆盖或引擎/数据库扩张。

| 禁止内容 | 方案验证锚点 | 结论（确认未包含越界指令） |
|---|---|---|
| 任意HTML持久化/重量编辑引擎/复杂工具 | §1；S1有限AST及escape；S2受控code插入 | 确认未命中；code边界修订仍只在既定codec |
| 模板覆盖旧记录/恢复草稿或默认应用 | S3展示与执行同时`!note&&!draft`＋活动DOM空白，保留tags/date | 确认未命中 |
| schema/图评分/AI/普通标签规则重构 | §1最新两helper例外；S1共享保护无循环；S4仅0.5.2元数据 | 确认未命中；例外与clarifications §7一致 |
| 旧证据代替本轮或清未知工作 | S4独立test/build/UI/版本hash，旧失败未测保留 | 确认未命中 |

## 关键实现锚点复核结果：PASS

S1旧li/inline及recordTools:7–10→codec/adapters；S2 run/commit→syncFromEditor/选区/IME；S3草稿初始化/footer→资格/insertHTML/局部CSS；S4当前报告、版本六字段/构建/hash可直接定位。新模块只供当前三方向/标签helper共享，不建立插件或光标框架。

## 代码片段充分性复核结果：FAIL

有来源和目标骨架，覆盖通常输入/同步/保存/模板主链；但R1的保存trim前后语法及R2的边界构造未闭合，尚不足以预判四方目标结果。修订应补必要小片段/规则与夹具，不要求最终实现全文。

## 作者体验门复核结果：FAIL

原生DOM/undo、简明工具/反馈、无draft空白模板、status分离的意图可读且有界；但R1会把续写后的尾空项转成文字标记，R2会丢失或暴露代码边界，违反“不显示内部标记、可继续编辑”的既定作者体验。修复后沿原S2/S3真实选区和撤销验收，无需新的UX决策。

## 人工 review 对齐复核结果：FAIL

- **核心链路顺读复核：PASS**。§2明确现状→共享codec→同步活动DOM→草稿/commit→四方向；无须自行猜模块职责。
- **research 事实映射复核：PASS**。四按钮/假列表/组合格式/字体/footer/草稿/命令事件及新增代码标签均有实现与验证锚点。
- **跨包脑补需求复核：FAIL**。需reviewer自行补出S1格式语法与S2保留contentWithTags.trim之间的规范化规则，以及code serializer/scanner/parser边界隔离；当前文本不能直接决定这两组往返结果。人工总项因此FAIL。

## P1-P9 协议合规核验表：PASS

| 项 | 结果 | 独立存在性依据 |
|---|---|---|
| P1 | PASS | §5明确按四包语义，无任务数门槛 |
| P2 | PASS | Required Set缺一不放行 |
| P3 | PASS | 存在性门禁，无篇幅/评分补偿 |
| P4 | PASS | T3含T1/T2及接口/兼容/降级 |
| P5 | PASS | §4关键范围/验收/回滚不唯一DELEGATE_QUESTION；当前无新决策 |
| P6 | PASS | §4事件留痕及阶段/新风险触发，不设次数 |
| P7 | PASS | 无澄清数上下限 |
| P8 | PASS | §4 P0/P1/P2批问模板、未触发原因 |
| P9 | PASS | §5作者自检→独立review主检＋root复核；失败回LW，未PASS不得Impl |

## 基线与澄清一致性复核结果：PASS

未回答为空；范围/目标锁声明、两级标题、三模板（阅读随记而非灵感）、空白无draft、保留草稿、局部字体、两helper例外与最新权威基线一致。连续授权不能替代Gate。R1/R2为实现规则缺陷，不是需求方向错误；root组合格式/代码丢字只是改前复现，旧50项、0.5.1包和旧SQLite快照不成为新能力证据。

## 设计味道扫描结果：WARN: 有限codec新增语法需与保存规范化共享闭合

当前小型共享codec/薄adapter/单一sync路径比继续堆独立正则清楚；无过早编辑器框架。但语法若只在局部parser内自洽、未考虑现存trim及delimiter词法，会形成表面共享、实际方向不一致。具体阻断由R1/R2承担，不增加性能/平台或旧MVP门槛。

## Gate-2：FAIL

### R1：尾空列表项与contentWithTags.trim冲突

- **原文/锚点**：LW:66“连续`- `或`正整数. `…空li可回填”；LW:11“contentWithTags…不改”；S2:156保存直接调用该函数。真实函数整串`trim()`，独立输出已证明最后`- ` / `2. `变为`-` / `2.`。
- **影响**：草稿和保存payload不再匹配冻结列表语法；含正常正文的末尾空li可能变段落裸标记，四方/列表Enter续写回填承诺不成立。
- **最简恢复**：可按root收敛建议将无正文空li定义为编辑暂态，serializer跳过首/中/尾及全空项，并显式更新“空li可回填”承诺；有文字的所有父子项完整保留。不要求修改contentWithTags或改变普通字面`-`/`2.`规则。补“列表→storage经真实contentWithTags→parse/HTML/plain”的语义黄金夹具，含有/无外部标签、首/中/尾空项、全空、普通字面标记和草稿回填；root再实测Enter后立即保存/重开。

### R2：code内容边缘backtick与delimiter合并

- **原文/锚点**：LW:69“原文字含backtick时使用更长同长闭合delimiter”，S1 inlineLiteral与splitProtectedCode按backtick run识别。只增加delimiter长度不分离内容边缘run。
- **影响**：首/末backtick构造无同长闭合；两端backtick会被吸入开闭run，可能吞字并失去代码保护，恢复`#name`误识别风险。更长inline delimiter出现在块首时还须明确与围栏开头区分，不能由保护scanner和block parser各自猜测。
- **最简恢复**：借鉴[CommonMark 0.31.2 §6.1](https://spec.commonmark.org/0.31.2/#code-spans)的等长run与ASCII空格隔离/一层去padding，由serializer、splitProtectedCode、parser共享识别。只采用本问题所需规则，不扩成全CommonMark。旧single-backtick的空格字面量保持；新多run使用一层padding解码时，encoder必须补齐对应保护，尤其内容本身首尾都有空格时不得误删真实空格，全空格/NBSP也不能被通用trim吞掉。补首/末/两端backtick、长run、代码空白/HTML/`#name`、块首inline与围栏/语言标注的黄金往返，保护片段拼回原串与plain保字也需覆盖。无需换引擎或新依赖。

## contract drift / stale / mirror mismatch

- root指出core以LW计划缺陷进入checkpoint，但plan-review默认Review(LW)仅在发现PROBLEM_DEFECT时扩展业务双结论。本轮未发现PROBLEM_DEFECT，root已核对原文并撤回新增正式业务字段要求；因此只保留协议REVISE/GateFAIL及coordinator分流导航，不修改共享技能、不伪造默认合法组合。该阶段字段/导航口径差异已上报，不阻断R1/R2局部修订。
- 最新模板与两helper授权已在LW落盘，readiness前的“灵感”候选和旧不改标签的过宽表述不再作下游约束；旧验证失败和混合工作区记录仍保留。

## 后续行动

- 原地最简修订S1语法/片段/夹具及相应§2事实映射、S2/S3保存规范化说明、Gate-1；保留本轮支撑文本及修订标签/说明，重新交Review(LW)。不删除已有code-hashtag补丁，不擅改功能。
- 原生范围保护、有效Range、input不保证触发时同步、commit再采DOM、composition与committed草稿防回写、模板双检查/原生命令、局部斜体/footer均有可实施边界；其真实效果依旧由实施后root验收，不能以本阶段缺实测另判阻断。
- S4可保持独立0.5.2元数据/新构建包责任。root承接UI/native/hash；保留旧Rust失败、未定位IAB异常及不可观察平台边界。本报告不新增整体MVP要求或用户问题。
- allow_enter_impl: **no**。所需修订均来自现目标锁，不触发DELEGATE_QUESTION；无PROBLEM_DEFECT。

无新增跨功能事实。
