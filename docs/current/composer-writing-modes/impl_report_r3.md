# Composer Writing Modes — Impl r3

- feature_name: composer-writing-modes
- impl_round: r3（root手动限定承接，非自动继续）
- date: 2026-10-03
- lwplan_version: 有效R2（R2.1–R2.7）；完整消费clarifications、正式review_notes_impl_r2_1.md的REVISE / IMPL_DEFECT及其“可直接交付的局部补实施任务”。
- owner: /root/soft_impl；coordinator: /root。
- 结论边界：R3局部源码/黄金合同自证已落盘，版本保持0.5.2。真实引用标签关闭恢复/保存/四方、root新独立命令、mandatory Review(Impl) r3及新Windows包仍由root承接。r2候选EXE/MSI/NSIS含R3缺陷，虽release exit0也失效，不能作为本轮制品交付。

## 变更事实与局部落点

修改前复制完整src、tests及五个扁平元数据文件至 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-r3-before-20261003`，exit0；副本是已终结r2源码，保留未知混合工作。源码范围逐文件SHA256检查exit0：只有下述两个src文件与一个test变化，其他src/tests、recordTools、NoteComposer、styles以及五个0.5.2元数据文件完全相同。未调用Git、真实UI、DB、服务、安装器或递归委派。

| path | change_type | change_purpose | key_changes | related_tasks |
|---|---|---|---|---|
| src/noteCodec.ts:63 | 局部修改 | 引用资格消费既有去标签结果 | quoteLiteral接收既有withoutTags/tagsFor，按行规范化后判断；同一splitProtectedCode保护代码，escaped保护作者字面符号；无正文行不加引用前缀，按原tagsFor结果保留标签序列 | R3 / S1 / G1 / N2 |
| src/noteCodec.ts:139 | 局部修改 | 格式标签行不留下空包装 | parseInline的emptyStyles默认false；仅引用资格采样true，消费去标签产生的空颜色/字号包装；既有公开解析调用及普通literal规则不变，不输出新的语法 | R3 / S1 |
| src/noteFormat.tsx:82 | 局部修改 | 真实DOM采样接入同一规则 | 直接传已有withoutTags/tagsFor；codec不反向import recordTools，依赖无环；不改活动DOM/命令/undo | R3 / S1 |
| tests/noteCodec.test.mjs:100 | 追加并调整旧调用签名 | 覆盖真实保存规范化边界 | 三个新增黄金合同；旧quote用例传相同生产helper；生产helper→contentWithTags→withoutTags→parse→HTML/plain | R3 / S1 / S4自证 |
| docs/current/composer-writing-modes/impl_report_r3.md | 新增 | 本轮证据及承接 | 不覆盖r1/r2报告，保留本轮红/绿/错误夹具和候选包失效事实 | 正式实施报告 |

生产调用签名为 `quoteLiteral(body, node.textContent ?? '', withoutTags, tagsFor)`。函数参数只是现helper依赖入口，未新增用户配置/标签引擎。只有规范化后无正文的引用行输出原提取标签（包括顺序、重复、大小写），去掉没有正文的样式包装；不吞掉标签。未知HTML/literal按已有规则保留，code仍用同一词法。原始裸 `>` 继续是普通文字，不清洗旧记录或第13条已经保存的坏样例；root须用自己的隔离样例重新输入原症状验收。

## goal_lock_check / anti_goal_touch_check

- goal_lock_check: 只关闭G1同一引用保存/回填链的普通标签遗漏；有字正文/样式/code/空行保持；G2九工具、三模板、R1列表caret、quote块切换、原生history完全未改。
- anti_goal_touch_check: 不新增依赖/schema/任意HTML/格式引擎/通用光标模型，不复制第三套hashtag正则，不改recordTools任何函数，不改metadata/根功能文档或降低既定验收。不是全局清洗或标签迁移。
- authoring_ergonomics_notes: 两个生产文件的局部差量可沿调用顺读；emptyStyles仅是引用资格的内部采样，默认解析仍保留普通字面符号。新增夹具验证生产结果，没有源码文本镜像或假DOM，未为测试创建框架。

## impl-safe证据与黄金矩阵

所有命令完整输出/退出码已读，测试与build串行；以下日志位于 `C:/Users/ZXL/AppData/Local/Temp/`。

| evidence | owner | conclusion_if_missing |
|---|---|---|
| 源码未补时 `node --test --test-concurrency=1 tests/noteCodec.test.mjs`，13项10pass/3fail、exit1；完整日志qingjian-composer-impl-r3-red-test.log，真实 `#旅行` 恢复plain为`>`、首行标签为`>\n正文` | impl | 不声称黄金用例捕获原症状 |
| 第一次补后同命令12/13、exit1；日志qingjian-composer-impl-r3-first-test.log，剩余失败是我夹具误保留普通标签删除后的行尾space | impl | 失败不得略去或算绿色 |
| 修正夹具后同命令13/13、fail0/cancel0/skip0、exit0；日志qingjian-composer-impl-r3-green-test.log | impl | R3定向合同未自证 |
| fresh `npm test -- --test-concurrency=1` 全量65/65、fail0/cancel0/skip0、exit0；日志qingjian-composer-impl-r3-test.log | impl | 不声称最终全量回归通过 |
| fresh `npm run build` tsc/Vite/PWA、exit0；日志qingjian-composer-impl-r3-build.log | impl | 不声称最终生产构建可用 |
| 原review反例按当前生产签名重新Node断言exit0：saved为`#旅行\n#外部`、restored/html/plain均空串，tags为旅行/外部 | impl | 原纯症状未闭合 |
| TEMP改前副本逐文件SHA256/库存断言exit0，只有两src与一test变化；五metadata字节完全相同 | impl | 差量/版本边界未核实 |

矩阵包括：仅普通标签、重复及Travel/travel大小写、无外部标签/外部同名/外部不同名；标签独占首/中/尾及中间空行；粗/斜/组合、旧颜色/字号包装仅标签；有字组合格式与标签同行；行内/围栏代码包含hashtag、格式符号、HTML和尾反斜杠；代码单独含`_`；作者普通literal `>`/`**`/`_`/旧标记；`#`与粗体片段相邻但原规则不识别为标签的反例。标签的旧规则未改变：例如 `_#旅行_` 原提取名为 `旅行_`，本轮照原tagsFor保留，不藉此改名字。原10项codec与原模板/图/快开/保存等全量合同一并回归。

最新Web build版本0.5.2：entry `index-s3tjEZAR.js`430.13kB/gzip138.41kB，CSS `index-Dj4Xd2YQ.css`38.22kB/gzip8.36kB，Graph `NoteGraph-DWGmsbqG.js`75.59kB/gzip26.17kB，Worker `noteGraph.worker-C1x8NuDj.js`7.03kB，PWA7项544.09KiB。既有Node stripTypeScriptTypes ExperimentalWarning保留；不是Windows包或真实DOM/undo证据。

## 失败保留与contract_drift_reports

- r2正式review及root Node均exit1：引用仅有`#旅行`生成`> #旅行`，真实contentWithTags/withoutTags恢复裸`>`；root第13条真实输入保存同样末尾泄露，metadata仍旅行/10月3。旧62项及Web/Rust/release绿色不能覆盖此漏项，原候选包失效，未启动或交付。此为S1已冻结规范化未实现完整，非新的用户决定。
- 本轮初次合并读取skills/报告及LW出现工具输出截断，随后分块重读补齐；没有把截断当完整输入。新增红测试真实失败后，首次补后另有夹具行尾space错误：原withoutTags有冻结的`[ \t]+\n`清理，我曾误写`正文 \n`期望；只纠正夹具为`正文\n`，未改规则或把裸`>`放宽允许。红/第一次失败/最终绿色日志均保留。
- r1全部失败继续保存在impl_report_r1及verification：patch拒绝、错误raw空项夹具9/10、TS2339、尾反斜杠丢字、列表caret与空quote真实失败。r2全部失败继续保存在impl_report_r2及verification：connected-only绿色后仍错、diagnostic Object不可展开、有字quote pressed/正文退出、quote→标题保存样式丢失、ConvertFrom-Json空键exit1、root/reviewer元数据副本目录层级错误exit1。前轮报告不覆盖。
- root长批量n/aan附加字、native工具错序/超时、旧IAB崩溃/tab消失、旧Rust os1455 exit1、观察API/strict-mode选择器失败均保留原verification；后续干净短链/新Rust绿色（0 tests且linker_messages warning）不解释这些未知根因已修复。
- 已正式上报root的停止语义drift保持原审查记录：新版薄入口连续两轮IMPL_DEFECT无条件停机，与正式core附加“第二轮已对齐当前LW仍失败”条件不同；root全文复核后已暂停自动/发布并手动限定此R3遗漏。本agent不修改共享技能/镜像、不降级流程或借局部补修无限自动继续。若不得不改目标/规则/风险，须停止回root，不硬续IMPL_DEFECT。

## coordinator_handoff_verifications

| 验证及移交原因 | evidence_expected | owner | conclusion_if_missing |
|---|---|---|---|
| 真实引用普通标签（纯/首中尾/格式包装/代码）关闭草稿恢复、保存卡片、graph-note详情、再次编辑；非impl-safe | root自己的隔离样例新输入，正文无作者未输入的前缀，标签/日期/有字正文/代码保持；四方DOM/文字及失败记录 | root自行执行 | 不声称R3真实四方闭环通过 |
| R1/R2已修原短例保持、原生undo/快捷保存 | 相同短步骤、实际输入顺序/空阅读模板/块切换/保存回填证据 | root自行执行 | 不以65项证明浏览器原生行为 |
| mandatory独立Review(Impl) r3及root新test/build | 未参与实现reviewer的新差量审查、root完整命令exit和所有失败 | root调度/执行 | 未审查，不发布/归档/PR |
| 修补后0.5.2 Windows release/哈希/启动/旧库只读核对 | 新包来自当前源、命令exit、实际版本/制品路径/SHA256/启动及DB只读快照 | root自行执行 | 不交付r2失效候选或宣称已有修补后EXE |
| 原生中文IME/mac/读屏/触摸/系统减弱与hidden/GPU/安装卸载 | 对应平台可观察实测或明确未测 | root | 未测，不默认通过 |

## 风险、未完成与回滚

- 本agent完成有界源码/测试/报告自证；上述真实UI、mandatory独立审查和重新Windows打包未由本agent执行，责任已交root。根文档由root依据最终证据同步。
- 不迁移/清洗已保存的裸`>`，普通literal合同保持；旧坏隔离样例不会自动修正。代码/格式标签边界由矩阵约束，不宣称任意粘贴HTML或全平台零bug。
- rollback: **需人工介入**。只依据r3改前副本撤这三个文件的本轮局部差量，不restore/reset/clean未知混合工作；保留r1/r2兼容codec与code hashtag保护，不能用旧解析编辑覆盖新增格式。
- 英文提交建议：`fix(composer): omit quote prefixes after tag normalization`（非当前发布/提交许可）。
- 无新增跨功能事实。
