# 实施评审：composer-writing-modes（r2，第 1 次）

- review_target: impl
- impl_round: r2
- review_seq: 1
- review_date: 2026-10-03
- 实施报告：[impl_report_r2.md](impl_report_r2.md)
- 前轮：[review_notes_impl_r1_1.md](review_notes_impl_r1_1.md)（REVISE / IMPL_DEFECT，原报告与失败保留）
- 协议结论：**REVISE**
- 业务结论：**IMPL_DEFECT**

原列表 caret 与空阅读模板两条短例有 root 真实复测证据；但 reviewer 新发现“引用只含普通标签”的同一保存链仍泄露裸 `>`，当前源码不能发布。该缺陷属于 S1/R2 既定规范化链未实现到位，尚不能称“实现已经完整对齐当前 LW 仍失败”。暂停自动补实施/发布，交 root 全文复核本报告与下述停止条款 drift 后，按持续授权手动限定补修。不是全功能、整体 MVP 或平台稳定性验收。

## 输入、差量与证据边界

本轮完整读取 feedback_20261003、clarifications 全部十节、LW R2.1–R2.7、LW 第2轮审查、r1实施报告与审查、已终结 r2 实施报告、verification（含最终清理/截图/全部失败）、feature README。重载完整 plan-review 与 verification-before-completion；为停止条款差异另读当前 coordinator 薄入口及正式 core“实施后审查编排规则”374–407行。长输出截断/丢项已分块补读，未把隐藏或截断部分算作完整证据。

- 实际源与测试：NoteComposer、noteCodec、noteFormat、noteText、noteTemplates、recordTools、styles 及两个新增测试已读；对照专用 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-baseline-20261003/src`。本 feature 总体 src 差量仍是两个新增纯模块、五个修改文件，其他当前 src 文件 SHA256 相同。CSS diff 包含 r1 的局部样式与 r2 的柔和 focus-visible，减弱动态规则未删。未用旧混合 Git diff 作为本轮纯差量。
- 版本对照 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-r2-metadata-before-20261003` 的实际**扁平**五文件副本。独立逐行断言/JSON root 校验 **exit0**：package.json:4、package-lock.json:3/9、Cargo.toml:3、Cargo.lock:2804、tauri.conf.json:4，仅六行 0.5.1→0.5.2，行数不变、其他行完全相同；无依赖升级。版本一致不是 EXE 构建或启动证明。
- 临时诊断检查 `rg -n 'console\.(debug|log)|composer-list-caret' src/NoteComposer.tsx`：exit1 无匹配是预期；校验包装命令最终 exit0。当前无该临时诊断正文/元信息输出。

### reviewer 本轮独立纯命令

| 实际命令 | 退出与完整输出结论 | 能证明的范围 |
|---|---|---|
| `node --test --test-concurrency=1 tests/*.test.mjs` | **exit0；62/62、fail0、cancel0、skip0**；TAP 全文已读，既有 stripTypeScriptTypes ExperimentalWarning 保留 | 当前纯 codec/标签/模板及既有消费合同；没有 DOM/原生 undo 测试 |
| `./node_modules/.bin/tsc.cmd --noEmit --project tsconfig.json` | **exit0**，无诊断 | 当前类型检查；不生成发布包 |
| 五元数据逐行及 JSON root 版本断言 | **exit0**，仅六行，其他字行不变 | 元数据局部差量及版本一致 |
| 本文 R3 的真实 production helper 反例 | **exit1，AssertionError** | 标签规范化后的引用裸标记仍存在；不能被62项绿色覆盖 |

初次元数据验证把扁平副本误当 src-tauri 子目录，Get-Content 缺 Cargo.toml，整体 **exit1**；先 `rg --files` 核对实际库存，再按 basename 完整复跑为 exit0。CSS no-index diff exit1 表示存在差量，不是应用测试失败；已读差量并检查非异常返回。没有隐藏本 reviewer 的失败。

实施方 0.5.2 最终 build 完整日志 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r2-0.5.2-build.log` 已读：2473 modules，entry index-BHAzeTfY.js gzip138.33kB、CSS8.36kB、Graph26.17kB、PWA7项543.92KiB；退出责任与记录见 impl_report_r2。root 最新回传自身全量62/0与Web build exit0、cargo check/test locked jobs1 exit0；cargo test三个targets均0tests并有 linker_messages warning，不能当 Rust 业务覆盖。reviewer 未运行 build/Rust/release；Windows新制品/哈希/启动/旧库核对仍由 root 承接，任何进行中或随后成功的构建都不能抵消本 R3。

## 必填判定字段

| 字段 | 结果 | 核验依据与限制 |
|---|---|---|
| goal_lock_alignment | aligned | G1有限格式四方闭环、G2三模板/原生输入、G3局部视觉仍是实现目标；R3是该目标的局部未达标，不是另选目标 |
| anti_goals_touched | confirmed | 当前 R3 确认违反“不把格式语法展示给用户”的结果约束；没有引擎/schema/图/AI或权限扩张，必须纠正而非接受裸标记 |
| authoring_ergonomics_check | pass | offset补丁仅在当前UL/OL命令；quoteLiteral由薄adapter和纯测试直接复用；模板直接常量，没有通用控制器/history/selection模型；此为实现作者体验，不替代用户手感 |
| declaration_readability_check | pass | 白名单、ownedQuote、有限词法和双模板资格可以沿调用链顺读；新声明仍有界 |
| plan_defect_checkpoint_recommended | no | 当前可在已定义S1引用序列化/两helper消费边界补修；没有需要重写目标/验收/回滚的证据。连续两轮及停机差异另列，不自动继续 |
| plan_defect_checkpoint_reason | 原规范化链尚未实现完整 | 若局部补修必须重定义普通标签/引用语义、删除既有支撑或引入新风险，则不能延续此结论，应停止并回PLAN_DEFECT |
| impl_safe_validation_check | pass | 当前纯全量/类型/版本检查已有独立记录；额外反例失败同样落盘。字段确认执行合规，不代表功能全绿 |
| coordinator_handoff_check | pass | 真实DOM/undo/glyph/窄屏/平台/release明确归root；r2报告把root浏览器结果分列，没有充作impl独立自证；新R3必须补同责任链 |
| 基线与澄清一致性复核结果 | FAIL（局部实现结果） | 未回答为空、用户三模板决策未违反、目标形态未漂移；R3违反G1/N2现有保存/回填不露标记要求 |
| 设计味道扫描结果 | FAIL | quoteLiteral只以标签规范化前的可见文字判非空，未覆盖后续既有withoutTags改变可见正文的边界；局部引用结果被误判为可持久化，需要实现补丁 |

判定顺序：证据足以收敛，不是 BLOCKED；不是请用户替工程师判断的低风险确认；有限写作/模板均可追溯原始需求，没有 PROBLEM_DEFECT。R3满足后述局部/低风险/无新决策三条件。虽有禁止结果确认违反，但修正不需要改写计划目标形态或约束，按 plan-review/core 完整判定顺序分流 IMPL_DEFECT；r1已报告简写字段口径差异，本轮继续如实留痕，未修改技能或放宽 N2。

### 反目标禁止项表

| 禁止内容（基线§2） | 可核查证据 | 当前结论 |
|---|---|---|
| 堆全部按钮/换重量引擎/任意HTML持久化 | NoteComposer:12/144–156九个工具，三模板；noteFormat安全React/codec；六行元数据无依赖改动 | 未采取禁止工程路径；不宣称任意粘贴无损 |
| 覆盖正文/旧记录/草稿 | NoteComposer:125–134再次检查活动正文/hasNote/hasDraft；root恢复草稿入口0/三模板undo；原8条可见快照严格相同 | 未发现覆盖；实际平台/全部竞态不冒称通过 |
| 向用户显示内部标记 | noteFormat:79–82→quoteLiteral:63–75→recordTools:10–18→parseNote:208–215；本轮R3 exit1 | **FAIL**，普通标签只占引用一行仍露裸 `>` |
| 扩改schema/图评分/AI/其他标签helper | TEMP src库存；recordTools仍只两helper差量，其他helper与r1契约保持；六元数据行 | 未命中；R3补修不能藉机重构标签系统 |
| 旧包/旧50项当新验收或全平台零bug | 0.5.2版本、当前独立62项；原生/安装/GPU未测、旧失败与新增反例单列 | 未冒用旧证据；当前发布被本报告阻断 |

Q&A/头脑风暴映射保持：有限格式→S1/S2，明确“排版＋轻量模板”→三常量S3，局部italic/footer/390px→CSS与root截图。没有新的用户决策缺口，不重复请求阶段许可。

## r1及r2局部修正复核

| 项目 | 实际源锚点 | 证据及判断 |
|---|---|---|
| 原UL caret前置 | NoteComposer:56–90 | 活动owned selection优先，键盘缓存范围仍connected/owned；UL/OL collapsed Text记录原数值offset。原节点仍owned可用；替换分支只取命令后owned、collapsed Text且文字全等，不猜复杂新树。root相同两call“定位样例X”及中间caret/Enter/UL↔OL/undo/redo/键盘恢复已有实际证据，关闭该已测短例；不能推定所有浏览器caret行为 |
| connected-only首次补修失败 | r2失败沿革3–5、verification r2阶段复测 | 初次62项/build绿色后原症状仍在。原Text断开、新Text offset0的诊断有真实元信息，最终源码临时日志已移除；没有把第一次绿色描述为修好 |
| 原空阅读模板引用 | noteCodec:63–75；noteFormat:79–82 | quoteLiteral全空返回空串，非空内部空行普通空白；fence opening/closing共享已有词法，代码保literal，bare `>`仍普通文字。新两项纯合同与root原模板日期/标签/关闭恢复/保存证据支持原短例已纠正；**R3说明其规范化闭环仍不完整** |
| 回填quote状态/取消/标题 | NoteComposer:19–24/45/78–81 | 两端同一owned quote才pressed，不改code同段资格；quote→正文一次outdent，→h2/h3先outdent再formatBlock；root干净短调用回填/末尾追加/CtrlZ/Y/立即保存/回填有记录。跨quote标题明确两步原生undo，无新history框架 |
| 同步提交/草稿/IME | NoteComposer:47–54/101–123/140 | input/command同步采样，commit再读DOM；committed阻止草稿复写；selection监听及30ms timer清理；composition/isComposing/229/repeat守卫保留。root即刻保存、标签焦点不修改正文、完成状态保持有实际记录；不是Windows原生IME证据 |
| 工具/模板/视觉 | NoteComposer:144–160；styles局部差量 | 九工具、三模板、动态status/静态kbd分离、局部italic synthesis及柔和focus。root即时/卡片/graph详情/重开四方粗斜字形截图、实际CSS390深色无溢出、CtrlK不抢dialog/Esc还焦点有记录；reviewer未操作UI，root为执行责任人 |

## R3 / P1：引用内容仅有普通标签时，规范化后仍泄露裸前缀

生产路径不是假DOM：blockquote中普通Text“#旅行”经noteFormat inline仍是“#旅行”（escapeLiteral不转义hashtag）；block调用 quoteLiteral(body, node.textContent)，产生 `> #旅行`。后续真实 contentWithTags/withoutTags 按已冻结普通规则提取/删除标签，剩 `>`，parseNote必须按普通literal处理而显示。此处不能用“bare `>`本来就应该可见”解释，因为它来自作者没输入的引用保存前缀。

报告收尾时完整补读 root verification:82–90。root 已独立同helpers断言exit1，并通过实际 UI 复现：空编辑器填“标签引用回归20261003\n#旅行”→CtrlEnd→引用，DOM首行文字＋blockquote #旅行；保存卡片后一个p为`&gt;`，可见正文末尾裸`>`，metadata仍旅行/10月3。第13条是新root隔离样例，未编辑原8条，尚待补修后回填/保存及可恢复清理。该UI证据执行者是root，reviewer没有操作UI。

### 本轮实际命令原文

在 `E:/project-funny/biji` 执行，下列PowerShell命令最后由node提供退出码，没有tail管道；只读生产纯函数、不改文件/DB/UI：

```powershell
$taskReviewCode=@'
import assert from "node:assert/strict";
import {quoteLiteral,parseNote,noteHtml,notePlain} from "./src/noteCodec.ts";
import {contentWithTags,tagsFor,withoutTags} from "./src/recordTools.ts";
const input = "#旅行";
const saved = contentWithTags(quoteLiteral(input, input), ["外部"]);
const restored = withoutTags(saved);
const actual={saved,restored,tags:tagsFor(saved),html:noteHtml(parseNote(restored)),plain:notePlain(parseNote(restored))};
console.log(JSON.stringify(actual));
assert.equal(actual.html.includes("<div>&gt;</div>"),false,"a quote emptied by the existing ordinary-tag normalization must not leak its internal prefix");
'@
node --input-type=module -e $taskReviewCode
```

**实际exit1**。完整失败输出：

```text
{"saved":"> #旅行\n#外部","restored":">","tags":["旅行","外部"],"html":"<div>&gt;</div>","plain":">"}
node:internal/modules/run_main:123
    triggerUncaughtException(
    ^

AssertionError [ERR_ASSERTION]: a quote emptied by the existing ordinary-tag normalization must not leak its internal prefix

true !== false

    at file:///E:/project-funny/biji/[eval1]:9:8
    at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:282:26)
    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:278:20)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5) {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: true,
  expected: false,
  operator: 'strictEqual',
  diff: 'simple'
}

Node.js v22.23.1
```

### 可直接交付的局部补实施任务

首落点为 noteFormat blockquote采样/quoteLiteral与现新增codec测试。引用是否有正文须消费既有普通标签归一化结果；规范化后无正文的行不加引用格式前缀，但原标签文字仍保留供现 tagsFor 提取，不能吞标签或改变普通提取规则。有字段落、空行/顺序、样式/code literal及代码 hashtag继续保留。复用当前规范化helper/词法，避免在codec再复制第三套hashtag正则或造成循环依赖；不要将所有 bare `>`改为引用，不改第三个helper/schema/引擎。

新增黄金夹具走**生产helper→contentWithTags→withoutTags→parse→HTML/plain**：仅普通标签的引用、标签独占首/中/尾行且其他行有字、外部同名标签/空外部标签、普通literal `>`、code里的`#旅行`、原空引用/非空引用。既有普通标签仍按顺序/重复/大小写提取，代码hashtag仍literal；不得只改期望让裸 `>`变“允许”。root随后实际输入引用标签，关闭恢复/保存/卡片/详情/重开核对无前缀、标签仍在、有字内容不丢，重测原R1/R2短例。真实DOM不能由新增纯夹具替代。

### IMPL_DEFECT三条件与第二轮事实判断

1. **局部**：R3是R2同一引用DOM→纯文本→现两helper规范化→回填链的遗漏，限S1已定义adapter/helper及其测试；九工具、三模板、S1–S4结构不变。
2. **低风险**：不改普通标签规则、literal `>`契约、公开存储API或数据schema，只避免生成已确定会在现规范化后泄露的空引用前缀；保留标签及正文，原回滚与兼容读取不变。若做不到这些限制，应立即升级PLAN_DEFECT，不让补丁扩大成格式/标签系统迁移。
3. **无新决策**：基线G1/N2早已要求四方一致不露标记，LW明确同一两helper/真实保存规范化边界；不需要用户重新选格式/库/测试数量，不调整验收定义。

因此当前没有 PROBLEM_DEFECT/需改写目标形态的 PLAN_DEFECT 证据。**连续两轮IMPL_DEFECT成立（r1、r2），但“第二轮实现已完整对齐当前LW仍失败”不成立**：quoteLiteral的持久化资格尚未消费本已存在的普通标签规范化，功能合同仍未实现到位，不是按全套合同实现正确却需求本身不可满足。此判断只用于正式core的限定停止条件，不能藉此无限自动迭代。

## contract drift / stale / mirror mismatch与停止边界

1. 实际新版 `C:/Users/ZXL/.codex/skills/coordinator/SKILL.md`“核心停机条款”4写：`…以及连续两轮 IMPL_DEFECT，都停止自动链路`；但同入口“正式流程入口”要求正式任务继续用core规则，并要求平台仅补API/编排差异。实际 `C:/Users/ZXL/.codex/skills/development-workflow/SKILL.md:398` 写：`连续两轮 IMPL_DEFECT 且第二轮证据显示“实现已对齐当前 lwplan 仍失败”`。**无条件入口与带条件正式core存在停止语义drift**。正式旧feature不降级；按core详细判据判断本轮事实如上，暂停自动/发布结论，原样报root，不改任何共享skill/镜像。root全文复核后可按用户持续授权手动限定补实施；若出现新风险/新决定/需要改计划则保持停止并回正式LW。
2. r1已明示 plan-review反目标最小字段简写与完整业务判定顺序的差异；root verification已记录按详细顺序消费。本轮N2失败仍如实confirmed，不伪称反目标全部通过。
3. LW默认单协议Gate与coordinator PLAN_DEFECT导航标签差异保留原澄清说明，未伪造LW非法双结论。
4. `impl_report_r2`原“无裸标记”只适用于root当时已测空模板/有字quote等例，不能覆盖新R3。下一轮报告须追加此exit1和补修证据，保留前轮全部绿色后仍失败沿革。root进行中的功能文档/制品不能提前把本轮记为最终通过。

## 已见失败与仍未验证

- r1：patch多操作拒绝、错误raw空项夹具9/10、TS2339、尾反斜杠丢字、列表caret和空quote UI失败均保留；r2：最初connected-only绿色后仍错，诊断Object不能展开，有字quote pressed/正文退出失败，quote→标题保存丢样式，以及S4 ConvertFrom-Json空键脚本exit1均保留。最后有限修正/复跑不删除这些失败。
- root长批量header/undo未主动输入的n/aan、native工具错序和超时原因未定位；后续干净短链正常不等于它们已修复。旧IAB崩溃/tab消失、旧Rust os1455 exit1也不由新绿色推定解决。root最新Rust test exit0但0tests，只是编译/测试target运行证据。
- root最终CSS390与四方glyph截图、metadata/done保持、回收站撤销/恢复/永久删除仅进入确认、四条隔离样例可恢复清理及原8条快照相同均已记录，执行责任root；reviewer未碰UI或DB。工具status两节点strict-mode观察错误已改成局部选择器，不混作应用故障或通过。
- 收尾最新 root verification:84–90 已落盘：root全量62/0、Web/check/test exit0；release:windows低并行ci **exit0**，EXE/MSI/NSIS已生成，均为含R3的**失效候选**，未启动或交付，不是修补后制品。root元数据比对也曾误用副本目录层级exit1，改叶文件名完整复跑exit0，保留失败。
- 原生Windows中文IME、macOS、读屏/触摸、系统减弱/hidden、GPU、安装卸载缺实测；修补后新包/哈希/启动/旧库对比仍须root承接。不得以源码、版本或绿色Web纯测宣称平台通过，也不得交付含R3的候选包。

## 后续行动

- 当前不得进入发布/Archive/PR，既有MVP也不能借本轮审查作整体完成声明。
- root读取本报告全文、记录停止契约drift与连续计数，手动选择现S1有界补修后触发新 mandatory Review(Impl)。保持原已实施支撑与两原症状UI记录；审查后任何源码变化都需新全量/构建与对应原症状实测，旧62项/build/候选EXE失去最终发布证据效力。
- 若下一轮无法保持上述局部/低风险/无新决策边界，输出PLAN_DEFECT并保留当前源/测试/LW支撑回原地修订，禁止硬塞IMPL_DEFECT。
- 本review只新增此文件，未改功能、metadata、依赖、根文档、Git、服务、UI、真实DB或安装器。提交建议仍为 `feat(composer): add safe writing formats and starter templates`，不表示当前可提交。
- 无新增跨功能事实；停止契约差异为当前工作流drift，已单列上报，不重复入项目事实池。
