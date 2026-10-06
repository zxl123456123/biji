# 实施评审：composer-writing-modes（r1，第 1 次）

- review_target: impl
- impl_round: r1
- review_seq: 1
- review_date: 2026-10-03
- 实施报告：[impl_report_r1.md](impl_report_r1.md)
- 协议结论：**REVISE**
- 业务结论：**IMPL_DEFECT**

本轮 S1–S3 已落地，但有两条真实编辑路径失败，暂不进入发布/Archive。限定为当前计划内补实施，不改需求、格式集合、验收或回滚。S4 元数据、最终文档、0.5.2 新 EXE 及剩余实际 UI 验证由 root 承接，不能将当前 0.5.1 构建视为新制品。

## 输入与独立证据

完整读取本目录 README、clarifications、lwplan、review_notes_lwplan_2、impl_report_r1、verification 和原始反馈；重载完整 plan-review 与 verification-before-completion。审查七个相关 src 文件及两个新增测试，与专用 TEMP 基线比较，未将旧混合工作区差量混入本轮。

- TEMP 全 src SHA256 对照实际差量只有新增 noteCodec/noteTemplates，修改 NoteComposer/noteFormat/noteText/recordTools/styles。五个修改文件 diff 已读；两个新增源及两个测试全文已读。其余现存 src 文件相同；package.json/package-lock.json/Cargo.toml/tauri.conf.json 均与副本相同。该证据不证明任何原生输入行为。
- reviewer 本轮 `node --test --test-concurrency=1 tests/*.test.mjs`：**60/60，fail 0，skip 0，exit 0**，完整输出已读。既有 stripTypeScriptTypes ExperimentalWarning 保留；不是 DOM/IME 测试。
- reviewer 本轮 `./node_modules/.bin/tsc.cmd --noEmit --project tsconfig.json`：**exit 0**、无诊断，不生成发布产物。
- reviewer 本轮空引用反例使用真实 contentWithTags/withoutTags → parseNote/noteHtml/notePlain：**断言 exit 1**。两行 `> ` 经 helper 后为两行 `>`，HTML 为两个 `<div>&gt;</div>`，plain 也含两个 `>`。没有自造 DOM，也没有改生产源或测试。该失败与 root 真实草稿恢复/保存观察相互支持。
- 实施方最终 build 日志全文已读：tsc/Vite/PWA 完整，entry gzip 137.97 kB、CSS 8.34 kB、Graph 26.17 kB、PWA 542.58 KiB；exit 0 的责任/原始记录在实施报告。root 本轮另有独立 test 60/0 与 build exit 0，见 verification 第 39 行。reviewer 没有重新执行 Web/Rust/release，不冒称自身新构建成功。
- root 真实 UI 的独立证据见 verification 第 33–44 行：粗斜两个顺序、块切换、原生 undo/redo、立即快捷保存和部分回填观察正常；UL 后输入前置、空引用裸标记两项失败。reviewer 未操作用户 UI；这些 UI 结果的执行者是 root。

## 必填判定字段

| 字段 | 结果 | 依据与限制 |
|---|---|---|
| goal_lock_alignment | aligned | 工具、三模板、局部字体/footer与四方链仍沿 G1–G3；R1/R2 是已定义体验尚未实现正确，不是改为另一目标 |
| anti_goals_touched | confirmed | N2“不把模板或格式语法展示给用户”的结果约束被空引用裸 `>` 确认违反；没有引擎/schema/AI/权限或产品范围扩张。必须修正，不能自证反目标全部通过 |
| authoring_ergonomics_check | pass | 实现作者可直接维护有限 codec、薄 adapter 与三正文常量，无控制器/history/配置框架；这是代码作者体验，**不表示用户输入手感通过**，实际 caret 回退见 R1 |
| declaration_readability_check | pass | Inline discriminated variants、白名单、模板直接资格检查可读；声明与调用边界可以顺读，不需跨包猜 API |
| plan_defect_checkpoint_recommended | no | 两处均能在 S1/S2/S3 已定义锚点修补；未出现需求/验收/回滚口径的新决策 |
| plan_defect_checkpoint_reason | 当前证据支持局部补实施 | 若修复需要新增光标模型、换引擎、修改引用合同或放宽验收，应停止本分流并回 PLAN_DEFECT，不依持续授权越门 |
| impl_safe_validation_check | pass | 纯测试/类型检查有新独立 exit 0；已保留新增反例 exit 1。字段只确认自证执行与责任合规，不能抵消功能失败 |
| coordinator_handoff_check | pass | 报告与 LW 明确把真实命令/undo/草稿/glyph/窄屏/平台/release交 root；root 正在执行并如实记失败，未把纯 AST 当浏览器通过 |
| 基线与澄清一致性复核结果 | FAIL（局部实现结果） | 未回答为空，三模板等选择未违反；G1/G2 的输入顺序和 N2 的无裸标记验收失败，见 R1/R2；无新的用户决策缺口 |
| 设计味道扫描结果 | WARN | 鼠标命令一律 focus/removeAllRanges/addRange，重复替换浏览器仍有效的选区增加失步风险；应在现局部命令链收敛，不能发展成通用 selection/history 框架 |

分流说明：`anti_goals_touched=confirmed` 如实表示 R2 的禁止结果已经出现。按 plan-review“业务结论判定顺序”第 4 项及第 5 项的“**且需要改写计划目标形态或约束**”条件，这里无需改变任何目标/反目标才能纠正；因此是 IMPL_DEFECT。不是接受该违反，也不是把 N2 改成允许显示标记。最低字段模板中“若命中→PLAN_DEFECT”的简写与上述带限定的判定顺序存在口径差异，本报告显式上报并按完整判定顺序分流；若 coordinator 采用更严格的无条件消费规则，应回 LW 原地收敛，不静默改字段或共享技能。

### 禁止项核对

| 禁止内容（基线 §2） | 可核查依据 | 结论 |
|---|---|---|
| 重量引擎、堆全部工具、任意 HTML 持久化 | package/lock 相同；NoteComposer 命令白名单；noteFormat 只输出有限纯文本，HTML入口由 codec escape/React 安全节点生成 | 未采用禁止路径；不宣称任意粘贴无损 |
| 覆盖已有正文/恢复草稿 | NoteComposer:100–109 展示及活动 DOM 二次资格；noteTemplates:7；root 恢复草稿按钮 0、模板一次 undo | 未发现覆盖；输入竞态/全部 metadata 链仍需 root 留证据 |
| 向用户展示模板/格式内部标记 | noteFormat:78–80 → recordTools:12–15 → noteCodec:193–200；root verification:42；reviewer 反例 exit 1 | **FAIL，R2 已确认**，必须补修后再测 |
| 改 schema、图评分、AI发送边界、普通标签规则 | 全 src 对照没有 store/desktop/App/图/AI 差量，Rust元数据相同；recordTools仅两 helper 代码保护，contentWithTags/selector原样 | 未命中工程边界；代码与普通标签区分仍须四方向逐类实测 |
| 用旧 0.5.1 包/50项冒充新功能、声称全平台零 bug | 实施报告明确 S4未执行；本轮独立60项与两失败单列；旧失败保留 | 未命中证据冒用；整体 MVP/全平台未验收 |

头脑风暴与用户选择映射仍一致：常用有限排版→S1/S2；日记/会议纪要/阅读随记明确选择→noteTemplates 三常量及 S3；局部斜体合成与保存区层级→两处选择器及 footer。阅读随记空引用不能因模板纯测试绿色而豁免。

## 阻断缺陷与最小補实施边界

### R1 / P1：切换无序列表后 collapsed caret 回到旧文字前

证据：root 将新正文 fill“定位样例”→End→点击 UL，DOM 为 `<ul><li>定位样例</li></ul>`；下一独立工具调用 pressSequentially“X”后变为“X定位样例”，应是“定位样例X”。更早 Enter 续写得到空首 li + “保留想法无序要点”。此稳定短例没有工具超时，不依赖复杂嵌套，列表点击后正文仍 active；不是仅凭 native Tab.pressKey/typeText 的混乱追加结果断言。

实现首落点：NoteComposer:34–41 captureSelection，52–64 restoreRange/runCommand，112 toolMouseDown。鼠标 mousedown 已 preventDefault 保焦点，但 restoreRange 仍无条件 focus、清空当前 selection、加入缓存 cloneRange；同步采样随后又更新 savedRange。Range 对 DOM 重排是活动的，不能把缓存“节点仍连接”当作视觉位置仍正确。**源码只能确定危险顺序，不能确定 focus 是唯一根因**，execCommand 的原生重排也要以原症状复测定位。

最小任务：在当前命令链区分仍有效的活动编辑选区与键盘工具恢复；鼠标保留原有效 editor-owned selection，避免不必要的 focus/替换；键盘恢复仍需 connected/ownership/外部焦点检查。命令前后实际 caret 应保持原文字位置，立即 sync/commit 继续采样活动 DOM。不要直接写 innerHTML、按字符串重置正文、另建 offsets/history/framework，或用固定延时隐藏错误。

验收：root 重跑上述两调用末尾追加例、Enter 新项/退出、UL↔OL、选区格式、Tab键盘工具、外部选区不改、undo/redo、格式后立即保存。必须以实际编辑/保存/重开文字顺序证明原症状消失；pure test 不能代替。

### R2 / P1：空引用标记被保存规范化成可见“>”

真实链：阅读模板 `<blockquote><div><br></div></blockquote>` → serializer 给每空行添加 `> ` → withoutTags 清行尾空白或 contentWithTags.trim → bare `>` → parseNote 只识别 `> ` → 普通段落 `<div>&gt;</div>`。root 关闭重开草稿、保存卡片均复现；reviewer 新纯断言独立失败，现测试的 quote fixture 没有经过这条真实 trim 链，故60项绿色未覆盖。

最小任务首落点：noteFormat blockquote 分支（78–80）及必要的 codec 纯合同夹具。空引用保留为编辑暂态，序列化不要输出没有正文的格式标记；有文字的引用、原文字/格式/code及内部换行必须保留，空行可输出普通空白分隔，不能把所有 quote 行无条件删除。保持普通 literal `>` 可见，不为吞已泄露标记把 bare `>` 普遍重新解释成引用；不扩改第三个标签 helper、存储或schema。新模板与草稿都消费同一修正。

验收：纯夹具经真实 contentWithTags/withoutTags 再 parse/HTML/plain，覆盖全空、首/中/尾空引用、有字多段及代码 literal/hashtag、普通 literal `>`；root 在原阅读模板路径输入、关闭恢复、保存卡片/详情、重开，既无裸内部标记也无有字段落/换行丢失。不编辑原8条或用户“111”，修测试样例通过现编辑 UI 处理。

### IMPL_DEFECT 三条件

1. **局部**：R1 限 NoteComposer 已计划的 Range/命令/同步点；R2 限 S1 的引用序列化与现纯合同测试，S3 模板自动消费。未改变 S1–S4 工作包或用户目标。
2. **低风险**：保留浏览器 DOM/undo ownership、现 API/metadata、代码保护与存储/schema。修正可以由现孤立 UI 样例和真实 helper 反例验证，无跨模块迁移或主要回滚重评。
3. **无新决策**：现 G1/G2/N2 已要求正文顺序、四方一致、无内部标记；空编辑结构不输出裸标记是实现纠偏。原验收与回滚不放宽，无需再让用户决定库名、测试条数或阶段许可。

如补修越出以上边界，不能延续 IMPL_DEFECT；必须带已有源/测试与 LW 支撑回 PLAN_DEFECT。

## 已见失败、证据时点与未完成

- 本 reviewer 新空引用断言 exit 1 保留；标准60项与 tsc exit 0 不能将其覆盖。no-index diff exit 1 表示文件不同，已读差量，不是应用测试失败；批量读取一处长输出截断已分块补读，未把截断当完整证据。
- 实施报告的 patch 多操作拒绝、首次9/10空项夹具失败、首次 TS2339、早期绿色后尾反斜杠实际丢字 exit 1 全部保留；最后反斜杠用例已在 reviewer 新60项运行中通过。不得称第一次就全部绿色。
- root 稳定列表/空引用失败是本轮应用阻断；CUA 输入超时、错误路径、未声明变量/readonly API不支持、native工具追加混乱等分别保留，不用来猜应用根因。
- 当前 tab3 消失无原因与旧 tab1 crashed、旧 Rust test os1455 exit 1 仍保留原证据；本轮未定位或修复。禁止凭源码或构建推定平台稳定性。
- root 已验证模板显式插入/一次CtrlZ、标签保持、恢复非空草稿不提供按钮；没有把这些有限链扩写为全部输入竞态、日期/metadata、空草稿或真实原生IME通过。
- 中英 italic computed style 已变，但实际 glyph 四上下文截图仍待；390/844 候选页面真实 CSS width434，不能冒称 CSS390已验收。浅深/最终窄屏/关闭焦点/外部选区等按 LW 继续补实际证据。
- Windows/mac原生 IME、读屏/触摸/GPU/系统减弱与hidden/安装卸载没有本轮证据；0.5.2 元数据/新 release/hash/启动/旧库只读对比尚未完成。缺失不转为通过，也不要求为局部补修新增产品决策。

## contract drift / stale / mirror mismatch

1. 正式LW仍按默认单协议 PASS/GatePASS，clarifications末尾已解释 coordinator PLAN_DEFECT分流与ReviewLW正式字段不同，不伪造LW双结论。
2. 本次 Impl 的反目标结果字段与技能简写/详细判定顺序差异已经在必填字段后显式说明；未改共享技能、镜像或基线。
3. 实施报告末尾仍是较早的长串联“待定位”时点；root verification 已新增两调用稳定复现与模板空引用失败。本报告以新实际记录为准，补实施报告须追加这两个阻断及本轮修复/原症状复测，不能删旧失败或只保留早期绿色。

## 后续行动

- 允许在现 LW 边界内针对 R1/R2 局部补实施；不放行当前发布/Archive/提交包。root 可将本报告直接交实施者，不需新用户确认。
- 补实施保留当前 codec/hashtag/原生 undo/草稿/metadata 支撑，运行新纯反例与全量/构建，再由 root 重测两原始 UI 症状和剩余既定验证；交下次 mandatory Review(Impl)，不得以本报告作为修好证据。
- 本 review 只新增此报告；未动功能、依赖、版本、Git、UI或真实 DB。英文提交建议仍为 `feat(composer): add safe writing formats and starter templates`，不是当前可提交声明。
- 无新增跨功能事实。
