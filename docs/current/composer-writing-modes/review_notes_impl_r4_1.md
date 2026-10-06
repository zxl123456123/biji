# 实施评审：composer-writing-modes（r4，第 1 次）

- review_target: impl
- impl_round: r4
- review_seq: 1
- review_date: 2026-10-03
- 实施报告：[impl_report_r4.md](impl_report_r4.md)
- 前轮：[review_notes_impl_r3_1.md](review_notes_impl_r3_1.md)（REVISE / IMPL_DEFECT；原报告与失败保留）
- 协议结论：**PASS**
- 业务结论：**PASS**

**r4 空 heading 的最小补修符合已冻结 S1/G1/G2/N2，当前三文件差量没有发现阻断缺陷。** 新独立纯验证及 root 当前模块的原症状、四方和旧短例证据支持关闭 r3 D1。此结论允许进入源码收口和 Archive/PR；最终桌面新包的版本、哈希、启动与旧库只读证据已由 root 落盘，不能使用失效 r2 候选。本报告不是全平台、原生 IME 或长期稳定性验收。

## 输入与实际差量

本 reviewer 未参与实施，完整读取 plan-review 与 verification-before-completion；消费本目录 README、clarifications 完整十节、有效 LW S1/R2.1–R2.7、source_materials/feedback_r4_20261003.md、impl_report_r4.md、r3 正式审查及 verification 最后 r4 段。首次合并长输出及 LW 单次输出被工具截断，已分块补读 S1 全文和 r4 末段；未将截断输出当完整证据。不重复 research/LW 链，不递归委派。

独立检查真实 noteCodec、noteFormat、recordTools、noteText、NoteComposer、模板与测试，以及卡片/图详情/快开调用点。生产主链是 `NoteComposer.syncFromEditor:47–54 → editorHtmlToMarkdown:85–88 → headingLiteral:68–71 → withoutTags/tagsFor → contentWithTags → parseNote → React 预览/安全 HTML/plain`；草稿与保存仍使用原入口，未增加第二套标签规则。

基线是 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-r4-before-20261003` 的三文件；其余 src/tests 及五个扁平元数据与 `qingjian-composer-r3-before-20261003` 比较。reviewer 新库存/SHA256/LCS 命令 **exit0**，完整差量已读：[scope-diff.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-review-r4-scope-diff.log)。41 个源/测试库存相同，仅三文件变化，其他 38 个字节相同；package.json、package-lock.json、src-tauri/Cargo.toml、Cargo.lock、tauri.conf.json 均字节相同，仍 0.5.2，没有依赖、配置或 schema 增量。未使用混合 Git diff。

| 当前源码锚点 | exact delta | 独立复核 |
|---|---|---|
| noteCodec.ts:63–71、84、146 | +12/-4；抽出原 quote 资格表达式为私有 hasInlineBody，增加 headingLiteral；quote 输出分支不变；仅扩大说明注释 | 生成前去普通标签判空，空正文只保留现 tagsFor 序列；code 与 escaped 作者符号仍参与资格。codec 不反向 import recordTools |
| noteFormat.tsx:2、85–88 | +5/-2；h2/h3 直接调用生产 headingLiteral，非空返回值才附块换行 | inline 采样不变，DOM/history/选区/命令不变；空结构不会生成保存前缀 |
| tests/noteCodec.test.mjs:3、154–236 | +85/-1；增加四个直接语义合同 | 用生产 headingLiteral、contentWithTags、withoutTags、tagsFor 后再 parse/HTML/plain；未造 DOM、镜像源码或加依赖 |

新命令得到的三个 SHA256 与实施报告完全一致：noteCodec `1192573df81e1efdc4ea5fe4d36cd35a2a9d1fcc862ceb4d91c807aab67caf99`，noteFormat `369b50b1cf3bc740daedce656cd9d6e0a48e6b75bac80b2758e24e7e75ff59f2`，测试 `5270306738cc0418a15cd92328fd63a194f883e65309da6ba21e6298f0421bed`。

## reviewer 本轮独立 impl-safe 验证

以下命令在本轮真实执行，完整输出和退出码均已读，无尾部管道。纯命令不证明浏览器 DOM、原生撤销或 IME；reviewer 未运行 UI、Windows 打包、数据库或服务操作。

| evidence | owner | 实际结果与缺证据约束 |
|---|---|---|
| `node --test --test-concurrency=1 tests/*.test.mjs`；[test.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-review-r4-test.log) | reviewer | **exit0；69/69，fail/cancel/skip0**。stripTypeScriptTypes ExperimentalWarning 保留；不是 DOM 自动化覆盖 |
| `./node_modules/.bin/tsc.cmd --noEmit --project tsconfig.json`；[types.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-review-r4-types.log) | reviewer | **exit0，无诊断**。不构建或核验桌面包 |
| Node 库存、SHA256 与逐行 LCS；上述 scope-diff.log | reviewer | **exit0**；41 文件只三文件变化、五元数据相同。未核验用户 DB |
| Node 导入当前与 r4-before 纯 codec；[compatibility.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-review-r4-compatibility.log) | reviewer | **exit0**；16 原子两两组合 × 6 包装 = 1,536 个源串，默认 parseInline、parseNote、quoteLiteral 三种输出严格相同；同命令断言两级空包装、格式标签、有字样式/code、相邻段落与作者 literal。不宣称完整 Markdown 支持 |
| Node 生产 headingLiteral→实际保存 helpers→parse→HTML/plain；[symptoms.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-review-r4-symptoms.log) | reviewer | **exit0**；h2/h3 的空串、br 换行和仅 #旅行 均恢复空正文，旅行/外部 metadata 保持。独立复核原症状下游，不伪称真实 DOM 测试 |

原症状新结果：空/换行 h2、h3 的 source 都为空；仅标签输入的 source 为 `#旅行`，saved 为 `#旅行\n#外部`，restoredBody/html/plain 均空，tags 为旅行/外部。普通作者 `#`/`##` 仍作为文字可见，有字两级 heading、组合粗斜、旧颜色字号和 code `#代码 **literal** _ <script> path\` 均保留。兼容日志中 `body` 字段是恢复正文；补充 symptoms 日志以 `inputBody/restoredBody` 明确区分，不把恢复后的空值当原输入。

## 红绿证据与 root 承接验证

实施红/绿原日志完整亲读：[red-test.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r4-red-test.log) 是 17 项14pass/3fail，报告记录 exit1；失败分别为原生成 `# `、`# #旅行` 和相邻空标题 plain `#\n首段\n#\n尾段\n#`。这是生产抽取后尚无 guard 的行为失败，非缺失 import 或假 DOM。随后 [green-test.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r4-green-test.log) 17/17、fail/cancel/skip0，报告记录 exit0；原13项和新增有字合同保留，未放宽断言。

实施 compatibility 初次诊断失败原日志也已读：期待旅行/外部而实际只有外部，报告解释为用 `\n` truthy 构造错误期望；修诊断期望后绿色原日志显示1,536比较及六个下游样例。该失败保留，不能归因当前函数吞标签。reviewer 自己新比较和原症状断言另列，不用作者自称替代独立证据。

root 的承接责任与证据已在 [verification.md](verification.md) r4 当前源码段第125–131行落盘：

- h2、h3 分别有字→全选 Backspace，真实 DOM 只剩对应 heading/br；关闭→新建正文空、三模板、保存 disabled。阅读模板 h2/h3/空 quote 全清空同样不复活前缀。
- 相邻有字首行＋标签 heading 关闭恢复仅有首行，旅行 chip 保持；立即 CtrlEnter 保存卡片首行及旅行/日期，无裸前缀。有字 h2/h3＋中英 em 即时、卡片、graph-note UUID 选择、详情编辑回填保持同 HTML/文字。
- R1 两 call 列表末尾 X/Enter/下一项顺序正确；R2 阅读草稿无裸 `>`；R3 有字首行 h2＋blockquote #旅行 恢复只剩首行 h2和旅行 chip，无裸 `>`。首行沿模板 h2，不冒称普通 p。
- 新隔离样例移至可恢复回收站，原8条卡片同口径完整 textContent/done 严格 JSON 相同 true，未永久删除。最后新建正文空、日记/会议纪要/阅读随记三入口、保存 disabled。
- root 新全量69/69 exit0与 Web build exit0已记录，entry index-Dktrhydh.js gzip138.44kB、PWA7项544.21KiB。reviewer 未重跑 build，不能称自己的 Web 构建或 Windows 结果。

这些是真实 UI 由 root 执行、reviewer 消费落盘证据，未记成 impl-safe。收尾已补读 verification 第133–138行与 Release.Verification.0.5.2 全文：root 当前 release exit0，新EXE/NSIS/MSI版本、大小、时间与哈希读取exit0，隐藏自建进程10秒存活后仅终止自有进程；SQLite mode=ro/事务的schema及全部字段快照，notes3/transactions0，前后规范化JSON逐字节相同true且哈希保持。它们属于 root 包级证据，不冒称 reviewer 独立构建，也不把进程存活写成正常退出、安装卸载或完整 native UI通过。

### 当前能力文档与局部源码边界

按root追加请求核对 README:32–70、CHANGELOG:3–9、Project.Progress:3–12、Release.Testing:19–23/59–68/87，以及 Note.Formatting和Release.Verification.0.5.2全文；没有改这些文件。九工具/三模板/空标题与标签heading/quote规范化、纯文本与原生撤销职责均能追溯实现和当轮证据。69项、包体、新制品hash/自有进程烟测/本机只读数据保持与verification一致；原生IME、安装、GPU、全MVP未测及旧失败明确保留。Progress/发布文档此时“fresh源码审查待收口”是写作时真实状态，root据本报告更新即可，未发现新增文档drift。包级记录只证明本机本次烟测，不扩r4源代码任务。

## 必填判定字段与作者体验门

| 字段 | 结果 | 核验依据与限制 |
|---|---|---|
| goal_lock_alignment | aligned | r4 关闭原 G1/G2 规范化遗漏，有限九工具/三模板/纯文本目标与 S1 任务结构未改变 |
| anti_goals_touched | none | 当前差量及当前模块已测链没有裸内部前缀；未扩引擎/HTML/schema/AI/图/模板或普通标签语义。历史泄露保留，不清洗作者 bare 符号或旧坏草稿 |
| authoring_ergonomics_check | pass | 生成前资格直接服务两个现消费者；无需追踪新控制器/history/配置。root 清空可重新从三模板起笔，原输入/保存短例保持 |
| declaration_readability_check | pass | heading/quote 使用同一现资格，两个生产 helper 显式注入，默认 parse 不变；共享私有表达式不是泛化框架 |
| plan_defect_checkpoint_recommended | no | 无新决策/风险/验收/回滚变化，原 D1 在现 S1 h2/h3 分支关闭。自动链仍保持此前停止边界 |
| plan_defect_checkpoint_reason | 已冻结规范化边界内的最小生成资格补修 | 若收口后又需改标签规则、模板保护、裸符号解析、DOM/history/schema 或验收，应重新分流，不以本 PASS 授权无限补修 |
| impl_safe_validation_check | pass | reviewer 新全量、类型、库存/差量、兼容与原症状断言退出码/完整输出均已读；作者红测/诊断失败保留 |
| coordinator_handoff_check | pass | impl 报告清楚交 root 真实 DOM/四方/平台/release；root r4 当前模块与旧页问题分别落盘，未冒充 impl 自证 |
| 基线与澄清一致性复核结果 | **PASS** | 未回答为空；排版＋三模板答复与持续“继续进度”授权未变；G1/G2/N2 的 D1 当前链关闭，无新头脑风暴决策违背 |
| 设计味道扫描结果 | **PASS** | 只加资格 guard及直接黄金合同；没有早抽象、第二标签词法、清洗持久化数据或修改草稿保护掩盖问题 |

协议证据足够收敛，没有工程缺口需要用户判断，不是 BLOCKED/USER_CONFIRMATION_NEEDED。需求、计划和当前实现可追溯，没有 PROBLEM_DEFECT，也没有需改写计划形态的 PLAN_DEFECT；当前范围无需新增 IMPL_DEFECT。合法双结论为 PASS→PASS。

### 反目标禁止项清单

| 禁止内容 | 可核查证据 | 结论 |
|---|---|---|
| 重量编辑器/全部按钮/任意 HTML 持久化 | 新 LCS 三文件；noteFormat:5–29 受控 React/安全 HTML仍不变；其他38文件及五元数据相同 | 未命中；不承诺任意粘贴无损 |
| 覆盖正文/草稿、放松模板保护 | NoteComposer:28–36、107–135字节冻结；root r4 原8 textContent/done严格相同、三模板原症状记录 | 未命中；没有清洗用户旧草稿 |
| 暴露模板/内部格式标记 | noteFormat:85–88、生产症状 exit0、root 当前 h2/h3与阅读清空/四方；literal #/##新合同 | 已测当前生成链未命中；作者符号继续可见，不放宽N2 |
| schema/图评分/AI/普通标签扩改 | 41文件库存/五metadata新hash核对；recordTools/noteText/模板/Composer相同，codec无反向依赖 | 未命中；普通标签名字/顺序/重复照原helpers |
| 冒用旧包/旧50项、全平台零bug | 本轮新69项、类型、compatibility与root当前模块分列；r2失效候选、r3 release失败、未测明确保留 | 未命中；本报告不是包级PASS |

Q&A/头脑风暴映射：常用有限格式→S1/S2；用户指定日记、会议纪要、阅读随记→S3；footer/局部italic/390px→S3及既有root当轮证据。r4只服务空结构在草稿/保存链的G1/G2，不借继续授权改变目标或风险。

## contract drift / stale / mirror mismatch 与停止边界

- 已正式上报的薄 coordinator 入口“连续两轮 IMPL_DEFECT 停止”与正式 core附加“且第二轮证据已对齐LW仍失败”的停止语义差异继续保真。root 已停止自动/发布链，依据持续授权手动限定 r4；reviewer 未修改 shared skill、平台入口或镜像，本PASS不解释为drift已修，也不重新开启自动补修。
- 反目标简写字段与完整判序差异、LW默认单协议与coordinator导航标签差异沿r3正式审查保留；没有静默放宽裸标记合同或重算产品边界。
- README与impl_report_r4写pending_review/移交未执行是各自产生时的真实状态；root须根据正式结论与最终发布证据更新当前事实，不能把原失败删成绿色。新report不会自动改变旧候选有效性。

## 已见失败与未验证

- 本reviewer新纯命令未见测试/类型失败。初始读取长输出截断已分块补齐；compatibility输出字段body为恢复正文，另出明确inputBody/restoredBody短例，未改断言或功能。
- r4红测17项14pass/3fail exit1、compatibility错误诊断期望exit1及后续绿色保留。root首次旧已载模块仍红、reload ERR_CONNECTION_REFUSED、工具错误页URL阻断、5175无listener exit1都保留；同5175当前Vite启动后新tab当前模块原短例绿色。不能把旧模块当当前patch缺陷，不能把无listener/旧页失效归因编辑器崩溃或绕过URL限制。
- r3空heading独立反例exit1/真实裸#，r3红13项10pass/3fail、夹具行尾space错误12/13 exit1；r2标签引用原反例exit1/真实裸>及62绿色后漏项；原r1/r2列表caret、尾反斜杠、空quote、connected-only补后仍错、有字quote状态/退出和quote→heading丢样式，及辅助读取/TS2339/ConvertFrom-Json/metadata层级错误等继续引用旧报告和verification，不抹去。
- r3Windows release exit1 E0460、qingjian_lib/windows_sys编译哈希不一致，随后包级release缓存清理exit0仍是历史事实。旧r2 release exit0候选已失效，不能交付为当前r4；清缓存不等于新包验证。root新release/hash/启动/旧库只读已分别落盘，reviewer未操作生成缓存或独立执行这些包级动作。
- 旧Rust os1455、旧IAB崩溃/tab消失、长批量未主动输入n/aan、native工具错序/超时仍未定位；有限短链和Rust 0tests不证明这些已修。原生Windows中文IME、macOS、读屏/触摸、系统减弱/hidden、GPU、安装卸载与长期预览继续缺实测，保持未测。

## 后续行动

允许root按既有授权收口源码和当前事实、进入Archive/PR，并依据已落盘的新制品版本/哈希/启动/旧库只读证据交付本机体验包；继续明确原生IME、安装卸载、GPU和完整native UI未验收，不转交用户做工程正确性判断。保持旧失败与手动停止drift，不使用r2失效候选。

本reviewer仅新增此报告与Temp证据日志，未改功能/tests/metadata/根能力文档/Git/UI/服务/DB/安装器或生成缓存。英文提交建议：`fix(composer): omit empty heading prefixes after tag normalization`。

无新增跨功能事实；既有停机语义差异不重复进入项目事实池。
