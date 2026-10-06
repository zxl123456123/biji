# Composer Writing Modes — Impl r1

- feature_name: composer-writing-modes
- impl_round: r1
- date: 2026-10-03
- lwplan_version: 当前已评审R2，消费R2.1–R2.7修订及clarifications §7/§10；root确认review_notes_lwplan_2.md Gate-2=PASS后实施。
- 本次范围：S1–S3源码与纯合同测试。S4版本/当前功能文档/独立review/实际UI/桌面发布尚未在本报告声称完成。
- owner: /root/soft_impl；coordinator: /root。

## 文件变更事实

基线为 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-baseline-20261003`。仅读取副本比对；未使用Git恢复、清理、提交、推送；未启动服务、修改真实UI/DB或运行安装器。

| path | change_type | change_purpose | key_changes | related_tasks |
|---|---|---|---|---|
| src/noteCodec.ts | 新增 | 有限格式的共享词法与语义 | paragraph/blank/heading/ul/ol/quote/code；递归行内样式；最大等长backtick run与ASCII padding；安全HTML/纯正文；共享code保护；literal编码 | S1/G1/N1/N2 |
| src/noteFormat.tsx | 修改 | 编辑回填、展示和活动DOM序列化使用同一语义 | 三公开入口保留；React安全节点；真实ul/ol/blockquote；pre/code先采样literal；列表跳过空项且遍历子项；普通文本escape；普通块首literal保护 | S1/G1/N1/N2 |
| src/noteText.ts | 修改 | 关联图纯正文复用同一解析 | plainNoteText/normaliseBody公开接口保持；旧fence占位空行黄金结果保持 | S1/G1/N1 |
| src/recordTools.ts | 修改 | 代码中的hashtag不被当作标签或删除 | 仅tagsFor/withoutTags调用共享code保护；普通标签顺序/重复/大小写保持；contentWithTags/selectNotes等未改 | S1/CODE-TAGS |
| src/NoteComposer.tsx | 修改 | 有限排版、选区恢复、即刻保存与空白模板 | 正文/标题/小标题、粗斜、ul/ol、引用、行内代码；connected editor-owned Range；同步DOM采样；commit重读；committed草稿保护；composition守卫；模板显示/执行两次资格；静态快捷键与动态状态分离 | S2/S3/G1/G2/G3/N1/N2/N3 |
| src/noteTemplates.ts | 新增 | 三个明确的起笔正文与最小资格合同 | 日记/会议纪要/阅读随记常量；无note/无draft对象/空body与空可见文字资格；无schema/模板ID/引擎 | S3/G2/N1/N2 |
| src/styles.css | 修改 | 排版与保存区局部视觉层级 | editor/preview局部font-synthesis:style；列表/引用主题；工具分组换行与pressed/focus；起笔按钮；footer独立状态、kbd与窄屏换行；保留既有软交互/减弱动态规则 | S3/G1/G3/N3 |
| tests/noteCodec.test.mjs | 新增 | 语义黄金与反例 | 两种粗斜顺序、旧color/size递归、代码空格/tick/尾反斜杠/hashtag/HTML、实际contentWithTags/withoutTags、fence与inline同源、真实列表/引用HTML、raw空标记literal、旧graph黄金 | S1/S4自证 |
| tests/noteTemplates.test.mjs | 新增 | 起笔资格与三个固定正文合同 | note/空和非空draft/已输入/未同步可见字均拒绝；三正文真实标题与纯正文；实际标签持久化helper | S3/S4自证 |
| docs/current/composer-writing-modes/impl_report_r1.md | 新增 | 自证与移交事实 | 本报告；包含失败、范围、证据、责任及未测限制 | S1–S3/实施报告要求 |

本轮未改store/desktop/Rust/Modal/App/Worker/关系模型算法、依赖与版本元数据、根README/CHANGELOG/Project.Progress/Release文档。DateWheelPicker/Wheel保持原实现。旧单正则INLINE_TOKEN_PATTERN唯一消费已迁移，无并行格式规则。页面不呈现储存语法作为工具提示。

## 目标与范围核对

- goal_lock_check: S1接通编辑HTML/存储纯文本/安全展示/图纯正文，S2负责原生选区命令与提交当下DOM，S3提供显式空白模板与footer/局部italic。当前仅源码及纯合同可自证，真实四方DOM链由root承接。
- anti_goal_touch_check: 无新依赖、schema、UI框架、模板引擎、通用插件/光标/history框架；无新格式集合；contentEditable仍由浏览器持有，除初始挂载外不由React effect回填innerHTML；模板只用一个原生insertHTML命令，拒绝时没有DOM替换兜底；无每帧业务保存。
- authoring_ergonomics_notes: 三模板是可直接编辑的正文常量，标题提示加少量空白起笔结构，不携带日期/标签变量；模板资格直接在显示与执行处消费。格式工具用中文可读名称和aria-pressed；行内code仅允许同段非空且不包含既有code/pre的选区。源码按pure codec、现DOM adapter和Composer三个责任保留直接实现，没有配置DSL。
- 空li口径：DOM serializer采样时跳过无文字项，但不删除编辑DOM；子列表仍遍历；原contentWithTags/withoutTags会将未经serializer的raw `- `、`2. `裁成literal `-`/`2.`，解析必须保留。纯测试对此明确拆分，未以raw字符串声称覆盖真实DOM空li回填。

## impl-safe实际验证

所有命令本轮实际执行并完整读取输出及退出码；最终两日志由PowerShell捕获 `$LASTEXITCODE` 后读取原文件再exit，没有尾部管道改写退出码。

| evidence | owner | conclusion_if_missing |
|---|---|---|
| `node --test --test-concurrency=1 tests/noteCodec.test.mjs tests/noteTemplates.test.mjs`，最后定向复跑10/10、fail0、exit0（尾反斜杠修复后） | impl | 缺失则新增文本/模板合同未验证 |
| `npm test -- --test-concurrency=1`，最后全量60/60、fail0、skip0、exit0；保留原50项，新10项；完整日志 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r1-test.log` | impl | 缺失则不声称全量回归通过 |
| `npm run build`，最后tsc/Vite/PWA完整退出0，2473 modules；完整日志 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r1-build.log` | impl | 缺失则不声称生产构建可用 |
| TEMP实际SHA256增量对照＋rg核对保留DateWheelPicker/Wheel；已读当前相关源码、R2计划及r2评审 | impl | 缺失则不能声称只改授权文件与原有流程保持 |

最终build仍为0.5.1（按root分包指令）：entry `index-qmPZ_YcE.js` 428.74kB/gzip137.97kB；CSS38.08kB/gzip8.34kB；Graph75.59kB/gzip26.17kB；Worker7.01kB；PWA precache7项542.58KiB。没有新增第三方包。该包不是0.5.2 EXE制品证据。Node既有stripTypeScriptTypes ExperimentalWarning仍出现，未当失败或隐去。

### 本轮失败与修复复跑

1. 首个adapter合并patch使用同一路径delete+add，被apply_patch拒绝 `multiple operations target .../noteFormat.tsx`，未写入该patch内容。改为单文件准确写入及独立update；不是运行期故障。
2. 首次10项定向测试9过1失败、exit1：raw空 `- `、`2. `先过旧withoutTags会裁空格，实际plain为 `-\n有字\n2.\n子项\n-\n2.`，错误夹具预期只含有字项。按已批准literal边界纠正预期并明确纯测试不能替代DOM空项采样验收；复跑10/10 exit0。
3. 首次 `npx tsc -b` exit1：noteCodec三处、noteFormat两处TS2339，联合kind分组无法收窄children/value。改成明确的六种discriminated variant；随后tsc＋定向测试exit0，后续最终build exit0。
4. root独立发现并通知尾反斜杠丢字；impl实际 `node --input-type=module -e ...` 复现exit1，输出 `{"value":"path\\","stored":"`path\\`","parsed":"`path`"}`。code内backslash是literal，移除closing-run的escaped判断，仅opening识别转义；加入尾反斜杠、中文hashtag与反斜杠组合经实际storage helpers的黄金夹具。定向10项及最终全量60项/build均exit0。该失败发生在早期已绿的60项/build之后，因此旧绿色不作最终证据。

## coordinator_handoff_verifications

真实浏览器/平台属于safe-code-changes非impl-safe；impl未运行用户UI、fakeDOM或数据库。本报告不把纯AST→HTML测试描述成浏览器DOM往返。

| 验证 | 移交原因/建议承接 | evidence_expected | owner | conclusion_if_missing |
|---|---|---|---|---|
| 独立Review(Impl)＋新test/build | root独立读取TEMP差量/报告，调度非递归review并新跑命令 | 新review结论、失败列表、完整命令/exit | root | 未独立评审，不进入发布包 |
| 连续中英输入、选区/Tab命令、外部选区、粗斜两个顺序、ul/ol转换续写退出、引用与inlinecode | selection/execCommand真实平台行为不能纯Node证明；root仅用隔离样例 | 实际DOM→保存纯文本→卡片/图详情→再次编辑的内容与样式证据；字与有字父子项保留 | root | 实际输入/格式四方链未验证；丢字/裸内部标记阻断发布 |
| 格式后立即CtrlEnter、撤销后立即保存、模板一次撤销、草稿关闭恢复/空草稿保护、输入未同步竞态、标签日期保持、关闭还焦点 | 浏览器原生undo、localStorage UI流程；root实际操作 | 每次操作前后正文、草稿、metadata与焦点；草稿清除后不复写 | root | 原生undo与保存竞态/草稿安全未验证 |
| 四处中英italic glyph、浅深390px、工具换行/footer/保存可见 | computed style不是字形与可用性证据 | 编辑即时/保存卡片/图详情/重开截图与窄屏实际尺寸 | root | 局部CSS已实现但视觉体验未验证 |
| 原生中文IME/mac/读屏/触摸/GPU | 此环境不由impl实际观察 | 能观察的平台实测记录，否则明确未测 | root | 对应平台未验证，不默认通过 |
| S4元数据/当前文档/0.5.2 Windows release与旧库只读核对 | 本轮未授权S4源码/发布包，root真实功能核验后另指令 | 一致版本、新release完整exit、制品路径/SHA256/启动证据与未测边界 | root | 0.5.2 EXE尚未构建交付；旧0.5.1包不能替代 |

## contract_drift_reports

- 没有尚阻塞实施的计划/源码接口漂移；公开入口与限定工具按R2接线。
- raw空列表夹具与旧trim的实际行为差异已报告root并按R2边界纠正，没有扩改contentWithTags/标签系统。
- 尾反斜杠属于现有literal合同实现缺陷，root通知后本轮局部修复；未改格式范围或绕过Gate。

## 未完成、风险与回滚

- S1–S3源码和impl-safe自证已交接；原生DOM序列化、撤销/IME、italic实际glyph、390px、模板实际metadata安全尚待root，不声称没有bug。
- Native execCommand存在浏览器差异；只保留正文并短提示，不引入自有history兜底。粘贴复杂嵌套可展平，但有字父子项保留仍需真实DOM逐类核对。
- review重点：code delimiter/space/backslash/hashtag；DOM父子列表顺序与空项；初始草稿保护；selection失效/外部输入；同步采样与commit草稿effect守卫；模板原生命令与样式回填。
- root移交中通知：简单粗斜/块样式/有序列表与立即保存已观察；“有序退出→无序→引用→正文”的串联出现ul嵌套到blockquote/p、文字顺序待定位，且CUA按键超时。根因尚不明确，root正拆分观察，本报告不将这段原生DOM链列为通过。
- S4暂未执行；根功能文档和版本未变化，不能把计划写成当前已发布事实。
- 旧Rust os1455、旧未定位IAB崩溃及既有未测平台仍由root旧证据保留，本轮未运行或声称修复。
- rollback: **需人工介入**。工作区含未知未提交改动，只按TEMP核对本轮局部增量；禁restore/reset/clean。S2/S3工具/入口/CSS可撤局部差量；已存新格式必须保留S1兼容读取与code hashtag保护，不能让旧codec重存抹去语义。无schema回滚。
- 英文提交建议：`feat(composer): add safe writing formats and starter templates`
- 无新增跨功能事实（既有四方合同/原生undo事实不重复登记）。
