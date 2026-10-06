# Composer Writing Modes — Impl r2

- feature_name: composer-writing-modes
- impl_round: r2
- date: 2026-10-03
- lwplan_version: R2（R2.1–R2.7），并消费review_notes_impl_r1_1.md正式REVISE/IMPL_DEFECT；目标/格式/验收/回滚不变。
- owner: /root/soft_impl；coordinator: /root。
- 本轮局部补实施与既定S4元数据包已落盘。root实际原症状与四方往返证据见verification.md；root据此明确放行S4。源码版本0.5.2，最终独立Review(Impl)、root新测试及0.5.2 Windows EXE仍待承接，本报告不是发布放行。

## 文件变更事实

r1源码和报告保留；专用改前TEMP副本仍用于本feature总体增量比较。本轮不调用Git、不触真实UI/DB/服务/安装器，不递归委派。

| path | change_type | change_purpose | key_changes | related_tasks |
|---|---|---|---|---|
| src/NoteComposer.tsx | 局部修改 | 保持列表caret与回填引用状态/块切换 | 鼠标仍active owned selection优先；键盘工具connected恢复；仅UL/OL保存Text数值offset并对替换Text作全等守护；quote两端同一owned祖先才pressed；已有quote→正文使用一次native outdent，→h2/h3再formatBlock（两次原生undo）；不影响粗斜typing style或code同段资格 | R1/R2追加/S2/G1/G2 |
| src/noteCodec.ts | 局部新增生产helper | 空引用不产生保存标记 | quoteLiteral供真实DOM adapter和纯测试共用；无可见文字空串；非空引用空行输出普通空白；旧fenced code保持literal块；不把bare `>`重新解释为引用 | R2/S1/G1/N2 |
| src/noteFormat.tsx | 局部修改 | 活动blockquote采样消费同一修正 | blockquote分支调用quoteLiteral；不修改编辑DOM/原生undo | R2/S1 |
| src/styles.css | 局部修改 | 柔和编辑器键盘焦点 | visual-editor:focus-visible圆角12px、1px低对比内圈，保留清楚焦点；全局控件规则不变，无新动画 | S3/G3 |
| tests/noteCodec.test.mjs | 追加 | quote实际持久化边界 | 两个有意义合同：全空与首/中/尾空、非空样式/code/换行、外部标签、普通literal `>`；实际contentWithTags/withoutTags→parse/HTML/plain | R2/S1/S4自证 |
| package.json | 版本修改 | 应用版本一致 | 根version 0.5.1→0.5.2，一行 | S4 |
| package-lock.json | 版本修改 | npm根元数据一致 | 顶层version与packages[""].version 0.5.1→0.5.2，两行；依赖不变 | S4 |
| src-tauri/Cargo.toml | 版本修改 | 原生package版本一致 | qingjian package version 0.5.1→0.5.2，一行 | S4 |
| src-tauri/Cargo.lock | 版本修改 | 原生lock自身版本一致 | 只改qingjian crate version 0.5.1→0.5.2，一行；其他crate版本不变 | S4 |
| src-tauri/tauri.conf.json | 版本修改 | 打包版本一致 | 根version 0.5.1→0.5.2，一行；配置不变 | S4 |
| docs/current/composer-writing-modes/impl_report_r2.md | 新增 | r2增量、失败及承接 | 保留局部补修、root真实复测和S4事实；r1报告不覆盖 | 实施报告要求 |

## 对齐核对

- goal_lock_check: R1纠正G1/G2文字顺序和选区，R2纠正G1/N2无裸内部标记；G3焦点局部柔化。没有扩展工具/模板或更换编辑器。
- anti_goal_touch_check: 无新依赖/schema/history/selection框架、全局offset映射或treewalking；不重写innerHTML、不用固定延时遮蔽caret；recordTools本轮未改，不扩第三helper。其他r1兼容支撑保留。
- authoring_ergonomics_notes: caret只在当前runCommand几行局部处理，quoteLiteral是现adapter直接消费的有限纯规则，测试不搭假DOM。S4只有六行版本变更，配置/声明规模没有增长为通用框架。

## 实际验证与失败

| evidence | owner | conclusion_if_missing |
|---|---|---|
| 定向codec/templates测试12/12、fail0、exit0 | impl | quote新增合同未自证 |
| 初次仅原Text connected分支的 `npm test -- --test-concurrency=1` 62/62 exit0及build exit0；日志TEMP/qingjian-composer-impl-r2-{test,build}.log；**之后root实际仍失败，不能用此绿色证明caret修好** | impl（纯命令）；root（UI失败） | caret原症状未闭合 |
| Text被替换局部补分支、移除临时diagnostic后最终 `npm test -- --test-concurrency=1` 62/62、fail0/skip0、exit0；完整日志 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r2-final-test.log` | impl | 不声称最终回归通过 |
| 同源码最终 `npm run build` tsc/Vite/PWA exit0；完整日志 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r2-final-build.log` | impl | 不声称生产构建可用 |
| hydrated quote状态/退出补丁后最新全量62/62 fail0/skip0 exit0与build exit0；完整日志 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r2-quote-final-test.log` / `.../qingjian-composer-impl-r2-quote-final-build.log` | impl | 最新quote接线未自证，不复用之前build |
| 同一已定义quote→h2/h3补点后最新全量62/62 fail0/skip0 exit0与build exit0；完整日志 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r2-block-final-test.log` / `.../qingjian-composer-impl-r2-block-final-build.log` | impl | 最终块转换接线未自证，不复用quote→p绿色 |
| 临时诊断清理检查exit0，NoteComposer没有console.debug/composer-list-caret；源码的实际清理已读 | impl | 诊断未确认移除，不交发布 |
| S4逐行对比 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-r2-metadata-before-20261003` 五文件改前副本：行数不变、exact六行0.5.1→0.5.2；JSON根版本和Rust自身package校验exit0 | impl | 版本包未经验证，不交发布 |
| 0.5.2最终 `npm test -- --test-concurrency=1` 全量62/62、fail0/cancel0/skip0、exit0；完整日志 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r2-0.5.2-test.log` | impl | 不声称最终源码回归通过 |
| 0.5.2最终 `npm run build` tsc/Vite/PWA exit0；完整日志 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r2-0.5.2-build.log` | impl | 不声称最终生产构建可用 |

最新源码build为0.5.2：entry `index-BHAzeTfY.js`429.98kB/gzip138.33kB，CSS `index-Dj4Xd2YQ.css`38.22kB/gzip8.36kB，Graph `NoteGraph-CRvZ_tdk.js`75.59kB/gzip26.17kB，Worker `noteGraph.worker-SNimIYMI.js`7.01kB，PWA7项543.92KiB。完整输出/exit已读；既有Node stripTypeScriptTypes ExperimentalWarning仍保留。这不是0.5.2 EXE证据，纯合同测试不冒称真实DOM/undo验证。

### 失败沿革（不覆盖r1记录）

1. r1正式review明确R1列表caret前置、R2空quote泄露，REVISE/IMPL_DEFECT；包括原8条不改等验收边界，全文已消费。r1 patch拒绝、错误夹具、TS2339和尾反斜杠丢字仍保存在impl_report_r1.md。
2. r2独立纯反例先实际复现：两行 `> `经原真实helpers后输出body `>\n>`、HTML两个`<div>&gt;</div>`、plain `>\n>`，命令exit1。quoteLiteral生产helper和新增合同后定向12/12、最终全量62/62/build exit0；普通literal `>`仍可见。
3. **r2第一次caret修补未消除原症状**：root相同两call填“定位样例”→End→UL，独立输入X仍前置，Enter又移动旧字；即使当时62项与build绿色，也未闭合原生输入问题。S4因此保持未授权。
4. root授权短期纯元信息diagnostic；首次console.debug对象在CUA dev.logs仅显示Object无法展开，是观察证据不足。改为JSON字符串后root实际取得beforeType3/offset4/length4，原Text connected=false/owned=false，postType3/offset0/length4/sameNode=false/collapsed=true/accepted=true；源码命中确认。这确认当前浏览器列表命令替换Text，不能只保留旧节点引用。
5. 按该实证加局部分支：仅collapsed UL/OL且命令accepted，post点仍connected/editor-owned Text并与命令前原Text值**完全相同**才恢复原offset；复杂不等不猜。原节点仍connected分支保留。原文仅本地比较、不日志、不持久化；所有临时console.debug已移除。之后重新全量62项与build exit0。root通知相同两call得到“定位样例X”、中间caret/UL↔OL/Enter/undo/redo/键盘cached恢复/外部标签焦点守护/立即保存均正常；执行者为root，见其verification，不列为impl自验。
6. 只读准备Cargo.lock时严格带引号rg模式在PowerShell没有匹配输出，随后按实际qingjian名称定位2803/2804行成功；未改锁文件依赖。不是应用测试失败。
7. root随后确认空阅读模板设置日期10月4＋标签后关闭恢复/保存无裸`>`且metadata保持；但**有字quote保存回填**后blockquote>div使quote pressed错误为false，正文只换div成p仍在quote。此既定S2链的局部失败不能被此前62项/build覆盖。root授权本轮同局部点继续补：ownedQuote仅检查两端同一owned祖先，code同段rangeBlock保持；仅已有quote→正文替换成一次native outdent，无DOM/history框架。采用[MDN execCommand](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand)当前行原生命令思路，未凭文档推断真实浏览器通过。最新62项/build exit0；root随后实际验pressed、尾部追加、CtrlZ/Y和立即存取均正常。
8. root随后实际quote→正文正常；但quote→标题得到blockquote>h2，保存展示降为blockquote>p，字号消失，仍属已定S2/G1块切换失败。按root明确授权仅同ownedQuote扩展p/h2/h3转换：先outdent，h2/h3再formatBlock，明确需要两次原生undo恢复，不造history引擎。最终62项/build exit0；root干净隔离样例分call实际quote回填→h2、CtrlZ一次div/两次quote、CtrlY两次h2、保存h2和再编辑保存h3均正常，未丢字/露标记。真实证据属root，不以纯测试替代。
9. root首次长批量标题/undo调用出现未主动输入的n/aan附加字符，根因未定位；随后转后台、缩短分call建立干净隔离样例验证上述原生链。未将工具/并发输入未知现象归因源码，也不声称本轮修复或保证长期稳定。
10. S4辅助版本校验首次PowerShell ConvertFrom-Json未加-AsHashtable，package-lock的空字符串键使脚本exit1；逐行差量部分已正确输出六行，但该次整体不能算通过。改为-AsHashtable读取后重新完整逐行/JSON/Rust校验exit0，五文件只有六行版本差量。此为自身校验脚本错误，不是应用失败；随后0.5.2全量62项和build均exit0。

## coordinator_handoff_verifications

| 验证与移交原因 | evidence_expected | owner | conclusion_if_missing |
|---|---|---|---|
| 原两call UL末尾追加、Enter续写/退出、中间caret、UL↔OL、选区/Tab/外部选区、undo/redo、立即保存；原生命令不是impl-safe | root实际DOM/文字→保存→重开及完整失败记录 | root | R1仍未验收，不声称输入顺滑或放行版本 |
| 阅读模板空quote关闭恢复/保存/卡片/详情/重开；有字段落/换行/code和metadata保留 | root实际正文与截图，空结构无裸`>` | root | R2未完成真实四方闭环 |
| hydrated quote pressed/正文退出、两级标题切换、后续输入、undo/redo与立即保存 | 原已存有字quote→回填→三块切换后实际DOM/文字/metadata；h2/h3两次原生undo | root | 未具对应实际证据不能声称回填块切换通过 |
| 最终浅深390px、柔和焦点圈、四处中英glyph、关闭还焦点；computed不代表视觉 | 实际CSS宽度与截图/焦点记录 | root | 对应视觉/可用性未验证 |
| 独立r2Review(Impl)＋root新test/build；Windows release/哈希/启动/旧库只读对比 | 评审结论、命令exit、实际0.5.2制品和未测边界 | root | 不发布、不把旧包称0.5.2 |
| 原生中文IME/mac/读屏/触摸/GPU/安装卸载 | 可观察平台实测，否则明确未测 | root | 未测，不默认通过 |

上述浏览器项由root实际执行，已有证据落于本feature verification.md：R1原症状和keyboard/外部焦点保护、R2模板空结构及日期/标签、引用回填和三种块切换；即时编辑/卡片/graph-note详情/再次编辑四方中英粗斜字形与安全DOM、CSS390深色无overflow、CtrlK不抢编辑dialog、Esc关闭还焦点GraphEdit true。对应截图由root保存。本agent没有操作真实UI；这些事实不列作impl-safe独立自证。独立r2Review及原生发布验收继续由root承接。

## contract_drift_reports

- r1功能结果违反既定输入顺序/无内部标记，不需要改写目标，正式分流为局部IMPL_DEFECT；本轮未改技能/镜像/基线。review的完整判定顺序与简写字段口径按root已明确消费，不擅自重新决策。
- 初次connected-only caret守护被原生替换Text实证否定，已如实通知root并补局部全等分支；没有转为全局光标模型。
- 空引用只做编辑暂态，serializer不输出空标记；非空内部空行经普通空白保持，不扩parseNote吞普通bare `>`或标签规则。
- 已回填quote的内层div遮住状态及formatBlock无法退出外层，是同一已规定quote→正文/两级标题实现缺陷；root授权局部owned祖先/native outdent后按需formatBlock，不修改格式/用户需求/验收；两步原生undo是实际操作边界，需在当前格式说明同步。

## 未完成与回滚

- S4经root真实浏览器既定链验收后明确授权，五元数据已0.5.2、仅六行版本变更；最终62项/build为0.5.2并exit0。独立r2review、root最终新命令、0.5.2 Windows新制品及旧库启动仍待承接，不能由本agent纯测试/build替代。
- README/CHANGELOG/Project.Progress与当前排版说明等根功能文档由root同步，含跨quote标题两步undo的实际边界；本agent仅维护r2报告，未越界改根文档。
- post Text不存在/不等/脱离editor时不猜恢复；该边界和复杂浏览器差异按原症状实测约束。原生IME/mac/读屏/触摸/GPU/安装卸载仍未测。
- 旧Rust os1455、旧未定位IAB崩溃及r1全部失败保留，不声称本轮修复。
- rollback: **需人工介入**；未知混合未提交工作不恢复/清理；只按TEMP撤本輪局部差量，保留r1 codec兼容和code hashtag保护，不能用旧解析编辑覆盖新格式。
- 英文提交建议：`feat(composer): add safe writing formats and starter templates`
- 无新增跨功能事实。
