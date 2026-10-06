# 实施评审：composer-writing-modes（r3，第 1 次）

- review_target: impl
- impl_round: r3
- review_seq: 1
- review_date: 2026-10-03
- 实施报告：[impl_report_r3.md](impl_report_r3.md)
- 前轮：[review_notes_impl_r2_1.md](review_notes_impl_r2_1.md)（REVISE / IMPL_DEFECT，原报告与失败保留）
- 协议结论：**REVISE**
- 业务结论：**IMPL_DEFECT**

**r3 的标签引用局部补修有独立纯命令及 root 真实四方证据，限定差量未发现新的阻断缺陷；当前 feature 仍有空标题草稿泄露 `#` 的实质阻断，不允许发布、Archive 或 PR。** 新阻断不是 r3 修改引入，也不能因其分支未在三文件差量中变化而把整个 G1/G2/N2 宣称通过。本报告不是整体 MVP 或平台稳定性验收。

## 输入与实际差量

完整读取 plan-review 与 verification-before-completion 技能；消费本目录 README、clarifications 十节、有效 LW R2.1–R2.7、source_materials/feedback_20261003.md、r2 正式审查、已终结 r3 实施报告及 verification。长输出曾被工具截断，随后分块补齐关键原文，没有把截断输出当完整证据。收尾重新读取 verification 的“r3最后短例与新增空标题遗漏”和“r3 Windows构建失败与定向缓存处理”。未重新规划或递归委派。

基线为 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-r3-before-20261003` 的实际 r2 完整 src/tests 与五个**扁平**元数据文件；未使用旧混合 Git diff。reviewer 新库存与 SHA256 断言 **exit0**：核对 41 个源/测试文件，文件库存无新增/删除，恰为以下三文件变化；其他 src/tests，包括 NoteComposer、recordTools、noteText、noteTemplates、styles 完全相同。五元数据 package.json、package-lock.json、src-tauri/Cargo.toml、Cargo.lock、tauri.conf.json 字节相同，仍 0.5.2；没有依赖/schema/配置增量。

逐行 LCS 差量输出 **exit0**，全文已读：

| 当前源码锚点 | 本轮实际差量 | 复核结果 |
|---|---|---|
| noteCodec.ts:63、74–78 | quoteLiteral 增加既有 normalise/extractTags 参数；逐行用去标签结果判断正文；无正文行仅输出原 tagsFor 标签序列 | PASS，未复制 hashtag regex，未反向 import recordTools |
| noteCodec.ts:138–164 | parseInline 的 emptyStyles 默认 false，仅资格采样 true；递归传递此开关 | PASS，默认解析兼容；不是新格式/用户配置 |
| noteFormat.tsx:3、82 | import 既有 withoutTags/tagsFor，直接注入生产 quoteLiteral 调用 | PASS，DOM/history/命令/选区没有变更 |
| tests/noteCodec.test.mjs:76、89、100–152 | 旧引用合同传生产 helpers，新增三个真实保存规范化黄金合同 | PASS，断言结果/字面量/metadata，未用假 DOM 或源码字符串镜像 |

## reviewer 本轮独立 impl-safe 命令

所有命令在 `E:/project-funny/biji` 执行，完整输出及退出码均已读；没有尾部管道。纯命令不证明真实 DOM、原生撤销或 IME。

| 实际命令 | 退出码与结果 | 证据范围 |
|---|---|---|
| `node --test --test-concurrency=1 tests/*.test.mjs` | **exit0；65/65，fail0、cancel0、skip0** | 当前 codec/标签/模板及既有消费合同；stripTypeScriptTypes ExperimentalWarning 保留 |
| `./node_modules/.bin/tsc.cmd --noEmit --project tsconfig.json` | **exit0**，无诊断 | 当前类型检查，未构建 Windows 包 |
| Node 库存/SHA256 断言及逐行差量读取 | **exit0**，41 文件中仅三文件变化，五元数据不变 | 本轮补修边界，未核验用户 DB/UI |
| Node 当前生产 helpers 原反例与默认解析兼容矩阵 | **exit0**；1,536 个源字符串的默认 parseInline/parseNote 与 r3 改前结果严格相同；原反例及五种格式标签、作者 escaped 符号、首中尾标签/code 合同成立 | 引用补修及默认解析局部兼容，不是完整 Markdown/任意粘贴合同 |
| Node 空 h2/h3 输出的生产保存/回填下游反例 | **exit1，AssertionError**；实际 plain 分别 `#`、`##`，HTML 为普通 div | 支撑下述 D1，未伪称 DOM 序列化自动化测试 |

原引用反例本轮新命令的实际输出：`saved="#旅行\n#外部"`，`withoutTags(saved)=""`，tags 为 `["旅行","外部"]`。默认兼容矩阵用 r3 改前纯 codec 直接导入比较：16 个 literal/code/标签/旧包装/空包装原子两两组合、六种现样式包装；不改生产文件。针对作者输入 `>`、`**`、`_`、反斜杠、空颜色语法和 `<script>`，经 escapeLiteral→quoteLiteral→现 helpers→parse→plain 仍为原字面量。混合首/中/尾标签和 code 得到标签 `["首","中","尾","外部"]`，代码 `#代码 _ ** <script> path\` 未被删除或变成 metadata。

root 自己的新 65/65 fail0、Web build exit0 已在 verification 落盘：entry index-s3tjEZAR.js gzip138.41kB、CSS8.36kB、Graph26.17kB、Worker7.03kB、PWA7项544.09KiB。reviewer 未重跑 build、Rust/release，不能用 root 记录冒称自己的命令。当前 Web build 绿色也不能抵消 D1。

## 必填判定字段与作者体验门

| 字段 | 结果 | 核验依据与限制 |
|---|---|---|
| goal_lock_alignment | aligned | 九工具/三模板/本地纯文本目标未漂移；D1 是已定义 G1/G2 的局部实现未达标 |
| anti_goals_touched | confirmed | root 空 h2 草稿真实恢复裸 `#`，违反 N2 不展示格式语法；未采取引擎/schema/AI/图扩张路径 |
| authoring_ergonomics_check | pass | r3 只沿现 adapter→纯 codec 采样链注入已有 helper，未引入控制器/history/标签模型；实现作者可直接顺读。用户清空体验由 D1 单独判失败，不能混同本字段 |
| declaration_readability_check | pass | 默认 false 与资格 true 的边界明确，标签顺序沿现 API 传递；无新配置或插件机制 |
| plan_defect_checkpoint_recommended | no | D1 可在既定 S1 的 h2/h3 输出分支及直接合同测试关闭；没有证据要求重写目标、任务结构、验收或回滚。连续局部失败仍必须保持手动暂停边界，不能自动无限继续 |
| plan_defect_checkpoint_reason | 同一已冻结规范化边界的空标题遗漏 | 若补修须修改标签规则、模板保护、默认裸符号读取、DOM/history/schema 或验收，立即停止并回 PLAN_DEFECT |
| impl_safe_validation_check | pass | 本 reviewer 新全量、类型、差量/兼容及失败反例已执行并保真；字段表示执行合规，非所有行为绿色 |
| coordinator_handoff_check | pass | r3 报告将真实 UI/undo/平台/release 明确交 root；root 原症状与 D1 的记录分别保留，未冒充 impl 自证 |
| 基线与澄清一致性复核结果 | **FAIL（局部实现结果）** | 未回答为空、用户“排版＋轻量模板”决策不变；D1 违反 G1/G2/N2 的清空/草稿/不露内部标记合同 |
| 设计味道扫描结果 | **FAIL: 空 h2/h3 未按正文资格决定是否生成持久化前缀** | r3 quote 资格已有现 helper 闭环，但 noteFormat:85 仍无空正文判定；无需扩成通用格式框架 |

判定顺序：当前证据足够收敛，不是 BLOCKED；不要求用户替工程师判断代码，不是 USER_CONFIRMATION_NEEDED。有限格式、模板与清空草稿行为能直接追溯用户需求及 G1/G2/N2，没有 PROBLEM_DEFECT。D1 满足下述局部/低风险/无新决策三条件。虽裸标记结果确认触及 N2，但修正无需改写计划目标形态或约束，按技能完整业务判定顺序分流 IMPL_DEFECT；前轮简写字段与完整判序差异继续保真，不降低 N2。

### 反目标禁止项表

| 禁止内容 | 可核查证据 | 结论 |
|---|---|---|
| 重量引擎/全部按钮/任意 HTML 持久化 | r3 三文件逐行差量；noteFormat:5–29 受控 React/安全 HTML；其余 38 文件及元数据不变 | 未命中工程路径；不承诺任意粘贴无损 |
| 覆盖原正文/草稿或改模板资格 | NoteComposer:28–36、107–135 未变；root 原8条卡片 textContent/done 严格相同 | 未发现原数据覆盖；空标题错误恢复见 D1，不能称草稿完整通过 |
| 显示内部格式标记 | quoteLiteral:63–79 的原反例新 exit0/root 四方；noteFormat:85/93 的空 heading 新 exit1/root 真实裸 `#` | **FAIL：D1 未修**；原始作者 bare `>`/`#`/`##` 不应被清洗 |
| schema/图评分/AI/普通标签规则扩改 | 库存/hash 41 文件及五元数据断言；recordTools 与改前完全相同，codec 没有反向 import | 未命中；下一补修不得借机改第三 helper 或迁移数据 |
| 冒用旧制品/旧测试、全平台零 bug | 新65项、当前Web build与独立反例分列；旧 r2 候选失效、r3 release exit1；未测与历史失败单列 | 未冒用；本报告不放行发布 |

Q&A/头脑风暴映射保持：有限格式→S1/S2；用户选择三模板→S3；footer/局部 italic/390px→S3与 root 证据。没有新的需求决策缺口，不重复请求阶段许可。

## r3 标签引用及旧短例复核

- quoteLiteral:66–78 按行调用 withoutTags，以 splitProtectedCode 保留代码片段，剥离非 escaped 样式标记只做资格采样；parseInline(emptyStyles=true) 消费规范化后的空色/字号包装。非空输出仍用原 line；空正文标签行用 tagsFor 的原序列，包括重复、大小写及旧 `_#旅行_` 名字 `旅行_`，不更改普通标签含义。
- fenceOpening/fenceClosing:46–47 与 quoteLiteral:67–73 未变化；围栏块按原词法原样输出。parseInline 默认 false，调用 parseNote/render/HTML/plain 的默认语义本轮 1,536 例与改前严格相同。普通 bare `>` 仍是 literal，不靠改解析规则掩盖前轮泄漏。
- root 记录：第14条新隔离引用标签关闭→新建无裸 `>`、旅行标签保持；快捷保存卡片及重开保持。混合首/中/尾标签/code 经真实 formatBlock 后，保存卡片、graph-note 详情、编辑回填同三块有字引用，metadata 首/中/尾/旅行，代码 `#代码` 未丢。真实执行责任是 root，本 reviewer 未操作 UI。
- 收尾原 R1 两 call“定位样例”→UL→X/Enter/下一项，DOM 为“定位样例X”及“下一项”；阅读模板关闭恢复 h2/三个 h3/空 div，无裸 `>`。这些有限已测短例保持；本轮不新增原生 undo/IME 证明。
- 第13/14条样例移至可恢复回收站；root 原8条完整卡片 textContent 与 done 严格相同。初次误用 preview.innerText 比较 false 后校准为同口径 textContent=true，观察失败保留，不能推定用户数据曾变动。

## D1 / P1：清空标题后仍持久化裸 `#`/`##`

root verification 的干净分步复现：空新建 fill“空标题清理”→全选→标题，DOM h2 有字；下一 call 全选/Backspace，只剩 h2/br、visible 为换行；关闭→新建，DOM 普通 div 文本 `#`，三模板消失。恢复阅读模板后全选清空同样发生。root 未保存用户记录，已用 fill 空清除自己的错误草稿；清理并不修复代码。

源码首落点 noteFormat.tsx:85：h2/h3 不检查正文就输出 `# ` / `## `；:93 全局 trimEnd 将其变成 bare marker。NoteComposer:50–52 将其作为非空状态，:111–114 保存而非清除草稿；:29/:102 经 withoutTags/markdownToEditorHtml 回填为普通 div。:125 的 hasDraft/body 保护因此阻止模板入口，这个保护本身正确，不能改成允许覆盖草稿来掩盖问题。

reviewer 独立下游反例完整命令如下。输入为已读 serializer 分支在空标题产生的文本，只验证生产保存/回填后果，**不是伪造 DOM 测试**：

```powershell
$taskReviewCode = @'
import assert from 'node:assert/strict';
import {contentWithTags,withoutTags,tagsFor} from './src/recordTools.ts';
import {parseNote,noteHtml,notePlain} from './src/noteCodec.ts';
const results=['#','##'].map(prefix=>{const source=`${prefix} \n`.trimEnd();const saved=contentWithTags(source,[]);const body=withoutTags(saved);return {prefix,source,saved,body,html:noteHtml(parseNote(body)),plain:notePlain(parseNote(body)),tags:tagsFor(saved)};});
console.log(JSON.stringify({evidence:'pure downstream consequence of the empty h2/h3 serializer output at noteFormat:85/93; not a DOM test',results},null,2));
assert.equal(results.every(result=>result.plain===''),true,'an empty heading must not persist its internal prefix or restore as visible content');
'@
node --input-type=module -e $taskReviewCode
```

**实际 exit1**；两组实际 `source/saved/body/plain` 分别为 `#`、`##`，HTML `<div>#</div>` / `<div>##</div>`，tags 均空；AssertionError `false !== true`。65 项绿色没有覆盖此反例。

### 最小补实施边界与 IMPL_DEFECT 三条件

1. **局部**：限定 noteFormat 的现 h2/h3 序列化分支以及直接复用的纯资格/序列化合同和 tests/noteCodec.test.mjs；空标题结构只作为编辑暂态，不生成保存前缀。有字 h2/h3、两级语义、顺序/空行、现样式/code literal 保持。不得改模板/草稿规则或全局裸符号解析；不要为此加通用编辑器模型。
2. **低风险**：不改 DOM、formatBlock、历史、选区、schema、依赖或用户记录；只在生成前判定空正文，保留现保存/草稿接口。有标签的资格不得吞标签或复制第三套 hashtag regex；普通作者 literal `#`/`##` 保持可见。回滚仍只撤局部新增差量，不 restore/reset/clean 混合工作。
3. **无新决策**：G1/G2/N2 已要求四方不露标记、空白起笔和草稿保持。用户最新“继续进度”延续实施授权；不新增产品语义、不改 LW 任务结构/验收/回滚，不需要用户选择新编辑器或接受泄漏。

补修须先新增能捕获空 h2/h3 的黄金反例，再通过实际 helpers→parse→HTML/plain；包括全空、仅 br/格式空包装、标题与有字段落相邻、有字两级标题及作者 literal `#`/`##`。真实 DOM 方向由 root 承接，不以手写假树当浏览器。root 必须新建两级标题分别清空→关闭恢复，核对正文空、空新建三模板恢复、草稿不错误复活；同轮保留引用标签原症状与 R1/R2 短例。r3 局部标签黄金和已有默认解析兼容不能倒退。补实施报告、fresh 全量/build、未参与实现的下一轮强制 review 必须先于发布。

若实现不得不改既有标签规则、模板保护或目标/风险口径，上述三条件不再同时成立，应停止并回 PLAN_DEFECT，保留已实施支撑；本报告不能当无限自动补修许可。

## contract drift / stale / mirror mismatch 与停止边界

- r2 已正式列出 coordinator 薄入口“连续两轮 IMPL_DEFECT 都停止自动链路”与正式 core 附加“且第二轮证据显示实现已对齐当前 lwplan 仍失败”的停止语义差异。r3 报告/verification 记明 root 全文核对、自动/发布已暂停，按持续授权手动限定补修；本 reviewer 未修改 shared skill、入口或镜像。D1 表明当前整体规范化仍有明确实现遗漏，不能宣称整个实现已完整对齐 LW 或凭局部引用绿色绕过停机边界。
- 反目标简写字段与完整业务判序差异、LW 默认单协议与 coordinator 导航标签差异继续引用前轮原记录；不静默改规则或把 N2 裸符号放宽。
- README/impl_report_r3 仍是 pending_review/承接状态，属于当时事实；root 须据本 REVISE 和 D1 更新当前状态/下一轮报告，不能提前把本轮整体写成已通过。旧 r2 构建候选和此次已生成的 Web 构建不是最终发布制品证据。

## 已见失败与未验证

- 本 reviewer 见到的失败是 D1 新纯断言 **exit1**；工具合并长输出截断已补读，未混成应用失败。当前全量/类型/边界检查 exit0 不抵消该失败。
- r3 实施红测试 13项10pass/3fail exit1、第一次补后夹具空格错误12/13 exit1、最终13/13绿色均保留；原 r2 反例 exit1 与真实裸 `>`、62绿色后仍漏项、失效 release exit0 候选保留。
- r1 patch 拒绝、空项错误夹具、TS2339、尾反斜杠丢字、列表 caret/空 quote；r2 connected-only 绿色后仍错、诊断 Object不可展开、有字 quote pressed/退出、quote→标题丢样式、ConvertFrom-Json空键及元数据目录层级错误 exit1 均在旧报告/verification 保留，不被本轮覆盖。
- root 最新 r3 Windows release **exit1 E0460**，qingjian_lib/windows_sys 编译哈希不一致；随后官方解释核对及包级 release 缓存清理 exit0，263文件/428.8MiB。清缓存不是新包构建成功；不改源码/依赖，不将它归因编辑器 D1。长 verbose 输出截断、CUA binding丢失/按URL重连与 dry-run/实际库存差异也保真。新的 release/hash/启动/旧库只读核对由 root 承接，reviewer 未执行。
- 长批量未主动输入 n/aan、native 工具错序/超时、旧 IAB 崩溃/tab消失、旧 Rust os1455 均未定位；后续短链和 Rust 0 tests绿色不证明已修复。原生 Windows中文IME、macOS、读屏、触屏、系统减弱/hidden、GPU、安装卸载及长期预览缺实测，继续未测。

## 后续行动

当前保持发布/Archive/PR 停止。root 按用户持续授权手动承接上述空 heading 局部补实施，再走 fresh 验证及 mandatory Review(Impl)；不交付 r2 失效候选，不把尚未成功的 r3 Windows 构建当新包。本轮标签引用局部结果可作为下一轮支撑证据，不能替代整体放行。

本 reviewer 仅新增此报告，未改功能、tests、metadata、根功能文档、Git、UI、服务、DB、安装器或生成缓存。英文提交建议：`fix(composer): omit empty heading prefixes from drafts`，仅供补修收口使用，不表示当前可提交。

无新增跨功能事实；停机语义差异是已正式上报的当前工作流 drift，不重复入项目事实池。
