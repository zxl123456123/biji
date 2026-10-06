# 新建记录排版与写作入口：低层实施方案

日期：2026-10-03。任务分型：**T3**；规划路径。输入为本目录README、原始反馈及模板答复、clarifications完整实现基线、research、readiness第1轮PASS与verification改前记录。本文只规定待实现结构，不表示功能已完成；Gate-2通过前不得进入实施。

## 1. 范围与对齐

目标锁沿基线编号为G1（常用格式四方一致及中英文斜体）、G2（3种空白新记录模板且保留输入/选区/撤销/快捷保存）、G3（保存区层级、浅深390px及当轮证据）。反目标编号为N1（不换编辑器、不堆复杂工具、不持久化任意HTML）、N2（不覆盖正文/草稿、不改schema/图评分/AI边界）、N3（不复用旧证据、不声称全平台零bug）。

正文、标题、小标题、粗体、斜体、无序列表、编号列表、引用、行内代码是本轮全部工具。沿用contentEditable、execCommand和纯文本Note.content；日记、会议纪要、阅读随记是最新用户确认的模板，research中的“灵感”候选不生效。局部允许italic synthesis；不改根字体栈。没有新依赖、数据库迁移或模板ID字段。

[修订: PLAN_DEFECT-R1.1] 不影响层：recordTools普通正文/末尾标签与日期规则、store草稿键与字段、types、App保存Note入口、账本、AI、D3/Motion监听ownership、图关系算法。唯一标签辅助修正是tagsFor/withoutTags排除codec认可的行内/围栏代码区，防止代码`#name`误识别和删除；normaliseTag/contentWithTags/selectNotes不改。plainNoteText的格式抽取随codec修正，图/快开继续消费相同接口。原unknown工作保留；以`C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-baseline-20261003`比对本轮增量，不恢复或清理原工作区。

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.1] 依据clarifications §7的2026-10-03补充与root真实recordTools源码，局部纠正“不改标签语义”的过宽表述，目标/反目标与四包划分不变；没有已实施支撑文本删除。

## 2. 核心链路总览与事实映射

现状：草稿优先读取 → 纯文本转受控HTML仅挂载回填 → contentEditable原生命令/input → DOM序列化 → React正文状态 → 草稿与commit → Note.content → React预览/plainNoteText。缺口为各方向单独正则、假列表、命令后RAF与立即保存状态不同步。

改后：一个有限纯codec解析正文块及inline → 受控编辑HTML/React节点/纯正文共享语义；DOM序列化输出同一语法 → 每次input和命令结束同步采样活动DOM → 草稿保持现契约；commit再采样DOM直接构造payload。模板只经显式原生插入命令进入同一采样链。正文DOM仍由浏览器拥有，React重渲染只更新工具反馈/状态，不重新写innerHTML。

| 事实与来源 | 实现首落点 | 验证锚点及口径 |
|---|---|---|
| Heading1图标实际formatBlock h2，已有# / ##（Composer:53；noteFormat:9/24） | S1保持#→h2、##→h3；S2正文/标题/小标题明确命名 | impl两级黄金夹具；root切正文后保存回填 |
| li统一转-，回填div.visual-list（noteFormat:24/28） | S1真实ul/ol及按块序列化 | impl编号/分组合同；rootEnter续写、ul↔ol、回填 |
| inline不递归，root第9条卡片em内显示**（verification追加） | S1共享递归inline，保护code文字 | impl两种粗斜嵌套顺序、代码literal；root样例回填/卡片/图详情 |
| 旧色字号、围栏code和未知HTML已经存在 | S1白名单语法兼容及escapeHTML | impl旧夹具、未知标记、危险HTML；root旧格式编辑 |
| 命令后RAF同步，commit读content状态（Composer:32–36/53） | S2同步采样与commit直接读DOM | root格式后立即CtrlEnter、撤销后立即保存；纯测试不能证明原生命令 |
| execCommand可能不触发input且保留undo（research E/MDN） | S2显式sync；S3命令插模板，非innerHTML覆盖 | root原生CtrlZ/CtrlY与连续输入；不能用返回true当undo证据 |
| 草稿优先且可能正文视觉空白（Composer:10–16；store:25–29） | S3入口和执行双重保护 | impl模板资格表；root非空/恢复草稿/旧记录保护 |
| 全局font-synthesis:none；真实em近正体（styles:4、verification） | S3只在.visual-editor/.markdown-preview允许style | root中英真实glyph四个上下文浅深；computed值只辅助 |
| footer已有两行，status包含静态small（Composer:49；styles:166–167） | S3状态、提示、保存分层 | root390px/浅深/Tab/关闭还焦点，不宣称读屏 |
| plainNoteText被图/快开消费；旧50项仅改前 | S1同一解析，S4新证据与发布 | impl既有黄金输出/consumer回归；root独立test/build/UI |
| [修订: PLAN_DEFECT-R1.2] recordTools:7–8全内容hashtag正则会删除code内#name（root/当前源码） | S1共享protected-code扫描，仅tagsFor/withoutTags跳过代码区 | impl行内/围栏code hashtag与正文标签共存合同；root保存/回填/草稿/快开无丢字 |
| [修订: PLAN_DEFECT-R2.1] review_notes_lwplan_1 R1：真实contentWithTags.trim会把尾空项标记的空格裁掉；R2：只增长delimiter会与内容边缘backtick合并 | S1空项只作编辑暂态，序列化跳过；inline encoder隔离边界，scanner/parser共享最大run识别 | impl经真实保存规范化的列表黄金夹具、边缘backtick/空格/块首code往返；root列表续写/保存重开 |

### 接口矩阵与片段闭环

| 接口 | 输入→输出 | 兼容/ownership |
|---|---|---|
| 新`noteCodec.ts`有限解析及安全HTML生成 | 纯字符串→有限块/inline节点→受控HTML或纯文字 | 无React/存储依赖，直接被已有三个方向复用及Node合同测试；无插件/配置层 |
| `noteFormat.tsx`已有3个exports | string→React节点；string→安全HTML；HTMLElement→string | 保留renderMarkdown/markdownToEditorHtml/editorHtmlToMarkdown名与调用方；内部薄adapter |
| [修订: PLAN_DEFECT-R1.2] `noteText.ts`已有正文接口 | content→plainNoteText/normaliseBody | withoutTags API保留且跳过代码区；NFKC/大小写规则不改；删除内部单层regex依赖，由共享解析替代 |
| [修订: PLAN_DEFECT-R1.2] `noteCodec.splitProtectedCode`→recordTools.tagsFor/withoutTags | 原字符串→顺序完整的受保护代码/普通文字片段→标签数组或去标签正文 | codec不依赖recordTools，避免循环；只有非代码片段沿用现hashtag正则，代码文字原样保留 |
| `NoteComposer.syncFromEditor/commit` | 活动DOM＋当前tags/date→body/保存payload | DOM为正文真值，React状态供显示/草稿，不作为立即保存唯一来源 |
| `noteTemplates.ts`常量与资格函数 | 3个固定模板；note/draft/活动正文→可插入 | 直接供Composer与安全合同测试，非模板引擎；元数据仍在现标签/日期状态 |
| store/App/Modal | loadNoteDraft/saveNoteDraft/clearNoteDraft、现有NoteDraft、Note、onSave、焦点约束 | 无新字段或跨层API，Modal不新增全局监听 |

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.2] 事实映射/接口矩阵补入code hashtag主链；扫描是纯codec的直接复用helper，没有第二套代码识别正则或插件层。Composer初始化tagsFor/withoutTags、plainNoteText、图与快开均获得同一修正，消费方API不变。

[修订: PLAN_DEFECT-R2.1] 正式Gate-2第1轮REVISE后按clarifications §10局部收敛两处词法/保存合同；新增事实映射明确包含storage trim，不改contentWithTags或扩大接口。原四包/代码hashtag主链保留。

以下S1语法/adapter、S2命令与commit、S3模板入口片段串起“输入→同步→保存→预览/回填/抽取”；不是只给局部按钮示例。实际DOM与undo由root验收补闭环。替换的私有函数为noteFormat的renderInline/inlineToHtml/walk内部实现及noteText单层regex抽取；三个public exports、plainNoteText、normaliseBody保留。INLINE_TOKEN_PATTERN当前只由noteFormat内部消费，迁走后不保留第二套规则。没有整条业务函数链删除或外部接口收缩。

## 3. 工作包与目标代码形态

### S1：有限codec与真实格式往返

[修订: PLAN_DEFECT-R1.3] **消费G1、N1/N2/N3。**关键文件：`src/noteCodec.ts`（新增）、`src/noteFormat.tsx:2–28`、`src/noteText.ts:3–18`、`src/recordTools.ts:7–8`（仅tagsFor/withoutTags）、`tests/noteCodec.test.mjs`（新增）、`tests/noteGraph.test.mjs:8–12`。先看现li/inline转换与全内容hashtag正则，能预判改后只有一份格式语义和代码保护边界；新纯模块仅为三方向/两个标签helper直接复用和Node测试，不加入通用编辑器框架。

冻结合同如下，未知或未闭合语法按普通文字保留，HTML只作为文字escape。纯codec不接收任意HTML。块节点只需paragraph/blank/heading/list/quote/code；inline只需text/bold/italic/code/旧color/旧size，组合节点递归。代码节点的子内容是原文字串，永不再做inline替换。

| 内容 | 保存合同 | 编辑/预览/抽取合同 |
|---|---|---|
| 正文/两级标题 | 普通行、`# `、`## ` | p或编辑div、h2、h3；抽取去对应前缀 |
| [修订: PLAN_DEFECT-R2.2] 无序/编号 | 连续`- 非空正文`或`正整数. 非空正文`成同类列表；首项start保留，其后规范连续编号；全部无正文空项在序列化时跳过 | 真ul/ol/li，ol start；相邻不同类拆块；空li仅编辑暂态，不承诺保存回填；普通literal `-`/`2.`仍正文，抽取逐个有文字项 |
| 引用 | 每行`> `；连续引用成blockquote | 多段保持换行，抽取去引用前缀 |
| 粗斜组合 | `**...**` / `_..._`，两种合法嵌套均解析 | strong/em递归，抽取递归去样式；保留中文/英文/emoji及空白 |
| [修订: PLAN_DEFECT-R2.3] 行内code | 等长最大backtick run闭合；新encoder长度大于正文最长run，边缘tick或非全空格正文两端ASCII空格时使用至少2 run并两边各补一层ASCII space | single-backtick旧内容空格不裁剪；多run仅当两端space且非全space时各去1层pad；中文字、tick、#name、格式/HTML均literal |
| [修订: PLAN_DEFECT-R2.3] 围栏code | 行首至多3空格后至少3 backtick，opener剩余info不可含backtick，闭合长度与开头一致；兼容既有```及合法语言标注；序列化选大于正文最长run的围栏 | pre/code原文字；块首inline同一行含闭合tick不会成为fence opener；未闭合代码正文保留，plain保留原测试围栏占位空行 |
| 旧色字号 | 仅red/orange/green/blue/purple及sm/lg/xl | 有限span data/class，内部inline可组合；未知值作为literal，不作为属性拼接 |
| literal | DOM普通text序列化时escape反斜杠及会触发inline的`* _ \` [`；块首会匹配标题/列表/引用的普通文本escape首标记 | parser只消费认可的反斜杠escape；未知escape保留反斜杠；HTML生成escape & < > "；未知HTML/未知[[...]]文字不执行 |
| 嵌套列表/粘贴复杂块 | 不新增层级工具；按DOM顺序展平所有父/子项，分离父项直接正文和子列表，避免丢项/重复 | 无需保留缩进，但每项/每段正文与code完整；未知元素保留子正文/必要块换行，不保存任意属性 |

来源`noteCodec.ts`与`noteFormat.tsx`的目标骨架（用于共享规则/边界审查，不要求照抄命名）：

```ts
// The codec owns the supported text grammar; code contents stay literal.
const blocks = parseNoteBody(source)
export const markdownToEditorHtml = (source: string) => blocksToSafeHtml(parseNoteBody(source))
export const renderMarkdown = (source: string) => renderBlocks(parseNoteBody(source))
// noteText still separates tags at the existing boundary.
export const plainNoteText = (content: string) => blocksToPlainText(parseNoteBody(withoutTags(content)))

// DOM serializer: recognize code/pre before recursing into formatting.
if (tag === 'pre') return fencedLiteral(readCodeText(element))
if (tag === 'code') return inlineLiteral(element.textContent ?? '')
if (tag === 'ol' || tag === 'ul') return serializeEveryListItem(element)
if (isText(node)) return escapeLiteralText(node.textContent ?? '')
return serializeAllowedElementOrChildren(node)
```

[修订: PLAN_DEFECT-R2.2] 空项是浏览器Enter续写的编辑暂态，codec不得为它生成保存标记。先按DOM顺序展平父/子项，再仅删除`visibleText.trim()`为空的项；父项本身为空也必须继续遍历子列表，任何有文字的子项仍输出一次。visibleText只取本项直接正文（包括格式节点文字），不把子列表正文重复算入父项。保存后空项不占编号序列，全部空列表输出空串；不把没有分隔空格的普通`-`/`2.`推断为列表。已有纯文本中无正文`- `或`2. `按空项丢弃而非生成回填li，普通字面符号保持可见。来源`editorHtmlToMarkdown`列表分支目标片段：

```ts
const items = flattenListItemsInDomOrder(element) // Always visits nested children.
const nonempty = items.filter(item => item.visibleText.trim().length > 0)
return serializeNonemptyItems(nonempty) // Preserve each item's body and list kind; no empty marker.
// Tests must cross the actual persistence normalization, not parse an untrimmed fixture only.
const stored = contentWithTags(serializeNonemptyItems(nonempty), externalTags)
const restoredBody = withoutTags(stored)
const restoredBlocks = parseNoteBody(restoredBody)
```

[修订: PLAN_DEFECT-R2.3] code边界采用[CommonMark 0.31.2 §6.1](https://spec.commonmark.org/0.31.2/#code-spans)的等长最大run与ASCII space隔离经验，明确局部兼容而不声称完整CommonMark：旧single-backtick decode不裁空格；新encoder正文边缘含tick，或两端ASCII space且含非space字符时，delimiter至少2并各加一个space。内容全为ASCII space时不补pad，single-run保留原空格。多run decoder仅当两端space且非全space时各去1层，其余不裁剪。来源`noteCodec.ts`目标片段：

```ts
function inlineLiteral(value: string) {
  if (!value) return ''
  const longest = Math.max(0, ...(value.match(/`+/g) ?? []).map(run => run.length))
  const bothSpaces = value.startsWith(' ') && value.endsWith(' ') && /[^ ]/.test(value)
  const pad = value.startsWith('`') || value.endsWith('`') || bothSpaces
  const delimiter = '`'.repeat(Math.max(longest + 1, pad ? 2 : 1))
  return delimiter + (pad ? ' ' : '') + value + (pad ? ' ' : '') + delimiter
}
function decodeCodeSpan(raw: string, runLength: number) {
  return runLength > 1 && raw.startsWith(' ') && raw.endsWith(' ') && /[^ ]/.test(raw)
    ? raw.slice(1, -1) : raw
}
// Shared by the block parser and protected-code scanner; info cannot contain a tick.
const opener = /^ {0,3}(`{3,})([^`]*)$/.exec(line)
```

[修订: PLAN_DEFECT-R2.3] scanner/parser匹配整个最大run而不是在更长run内截取短closing，且fence opener只接受整行合法info。因新inline同一行还有closing ticks，即使delimiter≥3且位于块首，剩余info含tick，不能成为围栏；随后按inline识别。padding只解码code文字，splitProtectedCode保留原串边界/pad，拼接不变。未知/未闭合inline保留literal，不删除字符；围栏原未闭合保护策略不变。

[修订: PLAN_DEFECT-R2.3] `noteCodec.ts`提供简单`splitProtectedCode(content)`：按原串顺序返回`{text, code:boolean}`片段，拼接严格等于输入。先按上述同一合法fence opener/闭合规则保护围栏（未闭合保护至末尾），再扫描非围栏部分的未escape最大inline backtick run（完整闭合run等长，其他长度run不是该span边界，未闭合视普通文字）；保护包含delimiter与原始padding但不解码，只有解析code节点时按同一规则解码。parser/scanner共享code词法helper，不在recordTools再写近似regex。codec不import recordTools；recordTools import此纯helper；noteText仍import withoutTags与codec，依赖无环。来源`recordTools.ts:7–8`目标片段（保留前轮代码hashtag修正）：

```ts
const TAG_PATTERN = /#[\p{L}\p{N}_-]+/gu
export const tagsFor = (content: string) => splitProtectedCode(content)
  .flatMap(part => part.code ? [] : (part.text.match(TAG_PATTERN) ?? []).map(tag => tag.slice(1)))
export const withoutTags = (content: string) => {
  const parts = splitProtectedCode(content)
  return parts.map((part, index) => {
    if (part.code) return part.text
    let text = part.text.replace(TAG_PATTERN, '').replace(/[ \t]+\n/g, '\n')
    if (index === 0) text = text.trimStart()
    if (index === parts.length - 1) text = text.trimEnd()
    return text
  }).join('')
}
```

[修订: PLAN_DEFECT-R1.3] 原普通正文/末尾标签正则、数组顺序与重复、外部空白清理保持；不对code片段做标签删除/空白清理，未闭合围栏末尾literal也保留。没有storage迁移，仅修正旧代码区域误识别的派生标签；内容已被旧版本删除则不虚构可恢复。代码中的`#name`、`#中文`留在正文，不进入tagsFor结果，外部同名标签仍按原规则提取/删除。

[修订: PLAN_DEFECT-R1.3] 实施步骤：先加语义黄金夹具；实现小型inline扫描（escape与code优先、闭合样式才递归）和按行块分组；将同一代码保护helper接入tagsFor/withoutTags；接安全HTML/React/纯抽取adapter；修DOM walker及legacy visual-list读取。不要继续用按HTML字符串顺序replace的多套规则。旧`<kbd>`兼容去标签逻辑保持，其他HTMLliteral保留；recordTools只有两个hashtag helper跳过代码区，其余函数不改。本轮不宣称任意Markdown/任意粘贴HTML无损；正文字符及上述有限格式必须闭合。

[修订: PLAN_DEFECT-R2.2] 验收：两种粗斜顺序、旧色字号嵌套、code含格式标记/HTML/backtick、编号start/ul↔ol/quote、未闭合delimiter、未知HTML与标记、普通输入的literal符号；空项只编辑暂态、保存跳过，复杂嵌套所有有文字项保留。已有plainNoteText黄金输出与图/快开tests继续成立；只纠正格式抽取，不改图评分。

[修订: PLAN_DEFECT-R1.3] 补验code hashtag：行内`#name`/Unicode hashtag、围栏代码内`#name`、更长backtick run、escaped/未闭合inline、未闭合围栏、外部正文/末尾同名标签混合。impl断言protected片段拼回原文、tagsFor只取外部标签、withoutTags保留code文字/空白、plainNoteText保留代码hashtag，现普通标签黄金行为不变。root实际选代码→保存→卡片/图详情→编辑回填→关闭恢复草稿，核对`#name`不丢字/不变标签，补到原`verification.md`，缺真实DOM证据不称四方通过。

[修订: PLAN_DEFECT-R2.2] impl新增列表黄金夹具经真实`contentWithTags`及`withoutTags`再parse/安全HTML/plain：ul/ol首、中、尾、全部空项，分别有/无外部标签；空父项＋有文字子项、文字父项＋空子项；普通literal `-`/`2.`仍p/文字；不得输出裸空项标记，现保存helper不改。source与storage都测，不能仅用未trim文本证明往返。root承接Enter续写/退出列表、尾空项时保存/关闭/草稿恢复/再次编辑，所有有文字项仍在、空项不冒裸标记。

[修订: PLAN_DEFECT-R2.3] impl新增code语义黄金夹具：正文首tick、尾tick、both-edge ticks、内含长run、仅leading/trailing space、两端space、全space、旧single-run空格、`#name`/HTML/格式literal；encoder→实际保存规范化→parser→安全HTML/plain还原原文字，受保护片段拼回原串、tagsFor只含外部标签。另测块首delimiter≥3 inline不是fence、合法语言fence/opener info含tick反例、不同长度closing run与未闭合span。root保存/卡片/图详情/回填依旧按上述分层记录，测试模型不代替真实DOM。

验证责任：impl运行新纯codec合同＋已有全量`npm test`、`npm run build`，完整输出/退出码/失败落`impl_report_r1.md`。Node环境没有DOM库，不新增库或以自造DOM镜像假称真实往返；安全HTML/AST/纯抽取可纯测，真实DOM序列化→保存→回填由root在`verification.md`逐类记录实际DOM/文字/截图。缺任一方向证据不能称四方验收通过。作者体验门：输入视图永不出现内部语法，literal可看见、可再编辑，列表能按Enter续写。失败停用新增格式入口并保留正文；回滚S1与消费adapter作为一组，不单退解析器使新内容变裸标记；新格式已保存时不得用旧版本编辑并覆盖，优先修兼容adapter。依赖：无新包，S2/S3依赖本codec。

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.3] 针对root发现的确定丢字路径，仅扩S1两个现标签helper和相应合同，保留四方格式/原生编辑/三模板支撑文本。若回滚新增工具，已有代码保护仍保留，避免恢复全内容正则再次删除正文；不扩展成标签系统重构。

[修订: PLAN_DEFECT-R2.2/R2.3] 正式review第1轮R1/R2依据已确认clarifications §10最简覆盖：取消空li持久化承诺、保有字项；增加新code padding和共享词法。只替换冲突语法表/识别段、补必要片段和夹具，保留先前代码hashtag/四方向/验证责任支撑；没有应用已实施区域被删除。

### S2：选区、原生命令、活动DOM同步与立即保存

**消费G1/G2、N1/N2/N3。**关键文件：`src/NoteComposer.tsx:15–45/53`；必要的直接命令/资格纯合同可放现测试可导入`.ts`，不拆控制器架构。先看run的RAF和commit的content closure，改后可预见同一个syncFromEditor供input/command使用、commit再读取真实DOM，无受控DOM重写。

工具栏使用清楚标注的正文/标题/小标题按钮或紧凑三项选择，再并列粗/斜、两列表、引用、行内code。为避免select夺走选区，本轮优先三个简单块样式按钮，不新增popover。粗斜/列表用aria-pressed，块样式用对应状态；状态只反映当前编辑选区，混合选区不假称全选一致。复用document.queryCommandState/selection祖先检测，不构建自有history或光标模型。

来源`NoteComposer`目标顺序片段，所有命令只作用当前editor：

```ts
function syncFromEditor() {
  const editor = ref.current
  if (!editor) return latestBody.current
  const body = editorHtmlToMarkdown(editor)
  latestBody.current = body
  setContent(body)
  refreshToolbarSelection()
  return body
}
function runEditorCommand(command: AllowedCommand, value?: string) {
  const editor = ref.current
  if (!editor || committed.current || composing.current) return
  if (!restoreConnectedEditorRange(editor, savedRange.current)) return
  editor.focus({ preventScroll: true })
  const accepted = document.execCommand(command, false, value)
  syncFromEditor() // input is not guaranteed; no RAF-only writeback.
  if (!accepted) showCommandUnavailable()
}
function commit() {
  if (committed.current || composing.current || !ref.current) return
  const body = syncFromEditor()
  if (!body.trim()) return
  const payload = contentWithTags(body, tags) // current tags/date, not savedContent closure.
  committed.current = true
  clearNoteDraft(draftKey)
  onSave({ content: payload, status: 'none', scheduledDate: date,
    done: note?.done ?? false, deletedAt: note?.deletedAt }, note?.id)
}
```

selectionchange监听仅挂载于Composer生命周期，保存Range.cloneRange仅当anchor/focus和range两端都在editor内；工具按钮mousedown仅preventDefault保选区（不阻止键盘Tab），键盘按钮执行恢复最后有效编辑选区。range失效/节点脱离时早退并提示聚焦正文，不把标签输入选区或页面选区替换掉。mousedown捕获前先记当前编辑范围；原生selectionchange更新状态但不写正文。卸载删除监听/取消原30ms聚焦timer；不新增RAF正文同步或卸载后setState。仅若真实浏览器命令需要延后一帧反馈，可延迟工具状态而不能延迟正文采样/保存，记录并取消该frame。

命令白名单：formatBlock(p/h2/h3/blockquote)、bold、italic、insertUnorderedList、insertOrderedList。行内code只对单段非空编辑选区用`insertHTML`插受控`<code>${escapeHtml(selectedText)}</code>`，把文字当literal；不从选区HTML拷任意属性。已有code继续原生编辑；按钮在code内或跨块/空选区禁用并说明“选择同一段文字后使用”，不承诺复杂反向解包。正文按钮负责取消块格式；粗斜可再次切换取消。undo/redo保留浏览器CtrlZ/CtrlY/⌘Z，不新造撤销栈，也不必增两个占位按钮。

input同步；compositionstart/end维护composing ref，end再同步。现Ctrl/⌘Enter继续跳过native isComposing、229、repeat，保存按钮和格式命令也检查composing。不要把编辑器内Enter列表行为改成保存；标签Enter现行为保留。挂载HTML写入只一次（初始草稿优先），状态effect绝不回填正文。保留localStorage失败提示；提交后草稿effect如仍运行先检查committed，避免清除后重新写草稿。done/deletedAt/id与日期标签照原payload。

验收及责任：impl通过build、纯命令资格/IME guard适用合同（仅直接复用的规则，不写源码字符串测试），报告`impl_report_r1.md`；真实浏览器selection/execCommand/undo不能由impl纯测证明。root在`verification.md`记录连续中英输入、选一段格式、键盘Tab进入工具、外部选区不改、粗斜两个顺序、列表转换/续写/退出、引用、code选区、格式后立即快捷保存、撤销后立即保存、草稿关闭恢复、关闭还焦点。缺真实原生IME或平台即标未测；不阻断可用Web实测。作者体验门是原输入顺序、光标/选区/原生撤销不中断，工具提示不暴露语法。命令拒绝时保留DOM正文并显示短状态，不退回直接DOM替换。回滚为S2工具/采样逻辑局部增量，S1解析兼容保留；依赖S1。

#### 本轮修订说明

[修订: PLAN_DEFECT-R2.4] syncFromEditor只是序列化活动DOM：跳过空li不删除浏览器DOM，用户仍能Enter续写/退出、撤销。草稿与commit都消费S1规范后的正文，再经原contentWithTags/trim；全部空列表不能使保存按钮可用，不新增第三个recordTools修改。立即保存与选区/原生undo片段原样保留。

### S3：显式空白模板与保存区/斜体层级

**消费G1/G2/G3、N1/N2/N3。**关键文件：`src/noteTemplates.ts`（新增，3常量＋可纯测资格）、`src/NoteComposer.tsx:10–16/44–49`、`src/styles.css:126–169/269–279`、`tests/noteTemplates.test.mjs`。先看草稿优先初始化和status内small，改后为非空即消失的三个轻量起笔按钮，动态状态与键盘提示独立，没有模板引擎或弹层。

固定模板只提供可编辑正文：日记“今日记录/发生了什么/此刻感受”；会议纪要“会议纪要/讨论要点/后续行动”；阅读随记“阅读随记/阅读内容/摘录/我的想法”。使用标题/小标题与少量真实列表/引用作为示范，不放随机日期、变量、虚拟内容或模板ID。用户自行改正文，标签日期始终保留现状态。

来源`NoteComposer`模板入口及命令目标片段：

```ts
// Eligibility is checked for display AND execution; a recovered draft is never overwritten.
const canOfferTemplates = !note && !draft && !content.trim()
function applyTemplate(template: NoteTemplate) {
  const editor = ref.current
  if (!editor || note || draft || committed.current || composing.current) return
  const activeBody = editorHtmlToMarkdown(editor)
  if (editor.textContent?.trim() || activeBody.trim()) return
  // Tags/date stay untouched; never set innerHTML for this command.
  editor.focus({ preventScroll: true })
  selectEmptyEditorContents(editor)
  const accepted = document.execCommand('insertHTML', false, markdownToEditorHtml(template.body))
  syncFromEditor()
  if (!accepted) showCommandUnavailable()
}
```

空白资格同时检查新建/初始draft对象不存在（即使空草稿也禁止）/当前活动DOM与序列化正文空白。展示状态可以用content，执行必须重新采样防止点击前输入尚未render。格式化空结构可视为blank但已有非空code/unknown文字不能被当空；三个模板自身含非空标题，插入后入口立即消失。用户预选标签日期不被reset；测试这些元数据不变。execCommand失败只提示，保留原空白状态，不直接innerHTML兜底。模板是一个原生命令，CtrlZ应撤销起稿，随后可继续输入；须root实际验证。关闭重开已存模板草稿则不再提供覆盖入口。

footer目标片段（原role=status只包动态文字）：

```tsx
<footer className="composer-footer">
  <div className="composer-save-info">
    <span role="status" className="draft-status">{draftStatus}</span>
    <span className="save-shortcut"><kbd>Ctrl / ⌘</kbd> + <kbd>Enter</kbd> 保存</span>
  </div>
  <button className="save" disabled={!content.trim()} onClick={commit}>保存记录</button>
</footer>
```

CSS只局部`.visual-editor, .markdown-preview { font-synthesis: style; }`，保留根none与字体栈，不合成全界面粗体。工具栏分组间距/换行，按钮状态对比、focus-visible和可读名称；正文/预览ul/ol/blockquote共用轻量主题变量，列表marker用浏览器真实marker。保存信息区min-width:0、动态状态与快捷键相隔8px左右，主保存保持明确；390px工具换行/footer必要换行、不得裁字或横向溢出。模板按钮为可选轻量入口，无默认预览/新动画系统；不回退0.5.1软交互/减弱动态CSS。

验收责任：impl模板资格表覆盖编辑note、恢复空/非空draft、活动非空、空白新建、输入未同步、既有标签日期；codec测试三个模板输出真实块且无内部标记，build与报告`impl_report_r1.md`。root在`verification.md`实测3模板、撤销/继续输入/立即保存/草稿恢复保护、浅深390px真实截图、四处中英glyph（编辑即时、保存卡片、图详情、再次回填）、Tab与关闭还焦点。computed synthesis值不算字形通过，缺读屏/IME证据只标未测。作者体验门：用户主动起稿、正文优先、写作区可用高度与保存可见、提示短且独立。回滚模板入口与局部CSS增量不影响既存模板纯文本；命令失败保留空白，合成不支持时记环境限制而不全局换字体。依赖S1/S2。

#### 本轮修订说明

[修订: PLAN_DEFECT-R2.5] 模板原生命令可含空li起笔暂态，但保存/草稿与编辑回填遵循S1跳过空项，不承诺空项持久化；标题和任何有文字项保留。恢复draft对象优先禁模板的双检查不变，不因空项规范化允许覆盖草稿。

### S4：独立验证、当前文档与0.5.2发布包

**消费G1/G2/G3、N1/N2/N3。**关键文件：`tests/noteCodec.test.mjs`、`tests/noteTemplates.test.mjs`、根`README.md`、`CHANGELOG.md`、`docs/Project.Progress.md`、`docs/Release.Testing.md`、`docs/Note.Formatting.md`（若无现有编辑格式说明则新增）、本目录`impl_report_r1.md`/`verification.md`；发布元数据`package.json`、`package-lock.json`（顶层/root包）、`src-tauri/Cargo.toml`、`src-tauri/Cargo.lock`（qingjian entry）、`src-tauri/tauri.conf.json`。先看实际报告和本轮差量，不把旧MVP证据夹在新能力结论；目标形态是当前能力说明＋明确新证据/未测＋一致0.5.2，不改依赖版本。

顺序：S1–S3实施自证及报告 → 独立Impl review读取TEMP基线差量/报告 → root新一轮test/build和真实UI → 文档写实际已实现/已测内容 → 独立发布包元数据0.5.2 → root构建/核哈希/启动。代码评审未通过或四方数据丢失阻断不发布；只因原生平台不能观察不夸大承诺。发布步骤与功能包分开，禁止生成产物进入源码提交。

自动测试矩阵由impl执行：保留现50项；新增断言是语义黄金结果/反例，不是JSX/source字符串镜像。纯parse→安全HTML/纯正文与规范化storage可Node测；真实DOM序列化方向在root UI逐类补足，报告明确拆分，不能写“纯测试覆盖全部浏览器往返”。运行`npm test`、`npm run build`并读完整输出/退出码；记录所有失败及修复复跑，不只记最终绿色。impl只写自身证据`impl_report_r1.md`，不执行真实用户UI/数据库/安装器。作者体验门是root实际写一条混合格式→关闭恢复→保存→打开卡片/图详情→编辑续写，不以单个静态截图替代。

root承接：独立新`npm test`/`npm run build`；S2/S3人工链＋390px浅深截图，只用root隔离样例，用户原8条不改；可用环境`cargo test --manifest-path src-tauri/Cargo.toml`、`cargo check --manifest-path src-tauri/Cargo.toml`及`npm run release:windows`，最后核新EXE/安装包路径、0.5.2、SHA256与桌面启动。发布记录可为`docs/Release.Verification.0.5.2.md`，包括旧库只读观察/是否实际执行，不为验证重建或迁移用户库。制品不含新版本/未新构建则只能交付Web增量并报告桌面发布未完成，不能指旧0.5.1包为新包。

发布元数据无需代码片段：各文件现version0.5.1→0.5.2，同步lock root与qingjian crate entry，无其他依赖锁变动；文字已足够预判目标字段。root最终证据`verification.md`及发布记录三元组：责任=root；产物=完整命令/退出码＋真实UI/制品核对；缺证据=对应“未验证/构建受阻”，不默认通过。保留旧Rust os1455、旧未定位IAB崩溃、原生中文IME/mac/读屏/触摸/GPU/安装卸载未测；新tab可用不等于旧崩溃修好。

回滚：只回本轮文档/元数据局部差量，保留失败记录；发布失败不回退用户正文或擦除草稿。无schema迁移/停机需要；若codec显示损坏先暂停新增工具入口及发布，保留内容，修复兼容后复验，避免旧codec编辑覆盖新语法。混合unknown变动仍不得一并commit/push；root依据授权仅发布可追溯本轮差量。英文提交建议：`feat(composer): add safe writing formats and starter templates`。依赖S1–S3及独立Impl review。

## 4. 风险、不确定点与失败路径

| 项 | 关闭责任/方法 | 缺证据结论 |
|---|---|---|
| U1合成italic实际glyph | root截图比对中英四上下文浅深 | CSS已改不等于视觉已验证 |
| U2格式/模板范围 | 最新clarifications已经冻结；本计划明确3模板和有限语法 | 无新用户决策，旧候选不再生效 |
| U3命令/选区/undo/IME | impl类型与资格；root真实命令/立即保存/撤销 | 原生IME/mac不可观察保持未测；不自行造输入引擎 |
| U4模板保护 | impl资格矩阵；root输入竞态/恢复草稿/元数据/撤销 | 任何正文/草稿覆盖阻断发布 |
| U5四方literal/旧格式/嵌套 | impl语义反例；root实际DOM往返 | 任一丢字/丢项/HTML执行/裸内部标记阻断相应功能 |
| U6状态/键盘/窄屏 | root浅深390px/Tab/关闭焦点 | 读屏不声称已测 |
| U7性能/制品/旧资源失败 | 无新依赖；implbuild；root新Rust/release/hash | 旧失败保留，桌面受阻不伪称有新EXE |

界面命令失败走“保留现正文＋短提示＋继续普通编辑”，不直接DOM重置。parser未识别的有限语法保留literal；粘贴复杂层级可展平，但文字/item不得丢失。没有额外线上开关服务；停发新制品/临时隐藏新增命令是本地降级边界。已经保存新语法时回滚显示adapter需继续识别，不能靠旧编辑器重存消除数据。

本轮事件触发对齐留痕：readiness→LW已获root指令；最新阅读模板答复优先于research候选；root新组合格式复现采纳为事实（见§2）。本轮无范围/验收/回滚口径新冲突，无阻塞提问。后续出现新假设、不可满足保正文合同、新风险或阶段切换，实施报告/本节＋clarifications留痕并交root收口；需要方案改动回LW/Gate-2，不以授权跳门。

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.4] 首稿后root发现code hashtag丢字风险，已更新clarifications §7再交本次局部修订；具体来源/接口/合同落§1、§2、S1，现基线唯一，无新增用户决策。LW继续交Gate-2，不绕过独立评审。

[修订: PLAN_DEFECT-R2.6] 正式Gate-2第1轮FAIL留痕：Required Set/P1–P9存在性PASS但R1/R2技术合同失败，不进入Impl；已完整读取review_notes_lwplan_1及clarifications §10，采纳coordinator执行细节，不新增用户决策或普通标签重构。

批量提问模板与优先级：本轮未触发，因用户模板选择和完整基线已唯一；若后续阻塞，按P0数据/范围、P1兼容/回滚、P2优化一次列真实问题，数量由不确定性决定：`【DELEGATE_QUESTION】需要用户确认：…；优先级：P0/P1/P2；影响阶段：…；A推荐及理由/B权衡；请一次回复Q1=A…`。仅执行环境低风险辅助用`【DELEGATE_ACTION】`，不递归委派。新产品决策先回root，不能用临时实现偷改基线。

## 5. Gate-1 Required Set与Gate-2入口

本T3自检按存在性，不按任务条数。T1十三项定位：目标/反目标/不影响§1；文件/首落点/目标形态/步骤/验收/回滚/依赖§3各S；逐包目标映射§3；验证分层与证据三元组§3各S；作者体验各S；主链、事实映射、片段闭环§2及S1–S3；自检本节；双门禁本节；澄清/批问§4；风险/失败降级与review方法§4/本节。T2 I/O/边界§2接口矩阵及§3，测试分层/回归S1–S4。T3跨模块依赖与接口§2；兼容/无schema迁移/S1语法及S4版本字段；降级/停发与回滚§3–4。不存在任一必需项即Gate-1失败。

| P1–P9 | 本方案规则/落点 |
|---|---|
| P1 | 四包按语义边界组织，无至少任务条数质量门槛 |
| P2/P3 | Required Set纯存在性；缺任一不放行，不以篇幅/分数补偿 |
| P4 | T3包含T1十三项＋T2 I/O/边界/测试＋接口/兼容/降级 |
| P5 | 关键范围/验收/回滚不唯一先DELEGATE_QUESTION；当前基线已唯一 |
| P6 | 事件即时对齐，留痕§4/clarifications/实施报告，不按次数 |
| P7 | 无澄清条数上下限 |
| P8 | §4优先级批问模板及本轮未触发原因 |
| P9 | Gate-1作者自检；Gate-2独立review主检＋root复核，未PASS不得Impl |

Gate-1检查结论：目标锁/反目标逐包映射、验证责任分层、证据产物/责任归属/缺证据约束、作者体验门、核心主链/事实映射/片段闭环均已提供；仅为方案资料自检，不是功能PASS。Gate-2复核十字段：目标、消费G/N、文件、函数/接口首落点、目标形态、步骤与依赖、片段触发及链路顺读、分层证据、作者体验、验收/风险/回滚。重点顺读S1真实ul/ol/code literal→S2命令采样/commit→S3空白资格/模板插入→S4实际UI和制品责任，核对没有依赖状态closure、DOM覆写或旧证据替代。

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.5] 本次Gate-1追加核对：修订章节都有说明/标签，原支撑脉络与S2/S3/S4保持，不删除已实施支撑；§1/§2/S1不再禁止已授权的两helper修正；代码识别规则共享/无循环，代码hashtag与普通标签合同/验证责任齐备。Gate-2还需顺读tagsFor/withoutTags→Composer初始正文/草稿→codec→保存/回填，复核保护不因外层trim或独立regex失效。

[修订: PLAN_DEFECT-R2.7] Gate-1本次补核：冲突空li回填承诺已取消，普通literal `-`/`2.`不误识别，实际保存规范化夹具明确；edge backtick padding/旧single-run空格/新多run decode/fence info词法及同源scanner完整，测试保字/保hashtag。修订章节说明和标签存在、原S1–S4/代码hashtag支撑未删，仍须第2轮独立Gate-2复核，不将资料检查当技术PASS。

失败回环：Review(LW)具体缺陷→原地最简PLAN_DEFECT修订、章节修订说明/标签→新Gate-1→独立Gate-2；口径不唯一先回完整基线。不凭本文自检直接进入Impl。

方案证据说明：本阶段仅读源码/文档并写此文件。一次合并读取因宽泛version搜索产生截断且tsconfig.app.json不存在退出1，随后按实际tsconfig.json/关键源码分块重读退出0。首次文档存在性检查因缺saveNoteDraft全名退出1，已在接口矩阵补入真实草稿API后重查；未把这些失败省略或当应用失败。未运行本轮功能tests/build/UI/新EXE，当前所有功能证据仍待实施及root承接。

[修订: PLAN_DEFECT-R2.7] 本次首个文档patch因末尾多余定位hunk未匹配被拒绝，未改变源码；去掉该hunk后重试。正式review已见R1/R2失败记录保留，不以本次文档自检替代实施后的tests/UI。

无新增跨功能事实（research已有的四方格式合同与原生undo事实不重复登记）。
