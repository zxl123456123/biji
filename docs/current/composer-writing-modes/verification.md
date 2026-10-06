# 新建记录排版验证记录

日期：2026-10-03。以下区分改前、实施报告与root独立证据，持续追加，不将计划记为通过。

## 改前事实

- root `npm test`：0.5.1全量50项，0失败，退出0；仅改前合同基线，不能证明新增编辑能力。
- root真实5175页面：8条有效记录，含用户“111”；新建首次为空，测试草稿“斜体观察 Italic sample”加斜体后DOM em、font-style=italic、font-synthesis=none，视觉近正体。草稿关闭后保留，未保存用户记录。
- 改前截图：`C:/Users/ZXL/.codex/visualizations/2026/10/02/01a0fc52-c082-7c00-b650-78e2c95b7cfa/qingjian-composer-20261003/composer-before.jpg`；footer为两行，层级和间距弱。
- `%TEMP%/qingjian-composer-baseline-20261003/`已复制改前src与当前文档/包元数据，用于局部diff。原工作区混合unknown修改均保留。

## 当前独立验证

S1–S3 r1已实施；新增格式/模板/保存区按下述root证据核验，未将agent自证替代root新测试。

### 改前追加：组合格式真实复现

原IAB tab2随后不再属于会话，库存中无tab，未看到崩溃页或原因，不等同于已复现旧崩溃；按官方排障在同浏览器创建tab3，原8条与本轮测试草稿均恢复。将仅root草稿“斜体观察 Italic sample”加粗后保存为隔离样例，第9条；原8条未编辑。卡片DOM为`<em>**斜体观察 Italic sample**</em>`，可见粗体标记，复现组合格式不递归。截图combined-format-before.jpg保存于上述媒体目录。后续只以此root样例测回填，用户“111”不修改。

### 新制品前的原生基线

root只读SQLite备份与完整schema/rows快照，退出0：3条notes、0条transactions，SHA256 `948bc77f536283a9e50317edf6226dfc61de213ab77e29db6c550516119f719f`。旧0.5.1程序另存，后续新构建不会丢掉此改前程序。文件位于`%TEMP%/qingjian-native-0.5.2-composer-20261003/`；未启动新包、未输出正文/凭据或修改数据库。

### 代码标签字面量补证

root直接调用当前recordTools的纯函数，合成输入为行内`#code`、围栏`#fenced`及末尾`#meta`。Node命令退出0，实际tags为code/fenced/meta，withoutTags删掉两处代码文字，仅剩围栏/空backtick；不是测试通过，而是新增代码工具需要关闭的数据保留缺口。已回写基线§7与LW补丁请求，不扩改图评分或普通标签规则。

## 已见失败与未测边界

### S1–S3 r1真实UI（root，2026-10-03）

- tab3也在会话库存中消失，无崩溃页/原因；同浏览器2创建tab4并markDeliverable。原8条正文/完成状态快照已通过可见DOM保存，未编辑；root第9条隔离样例重命名为“排版回归20261003”。
- 旧组合正文现在卡片为em>strong，无可见内部标记。实际两种粗斜顺序、连续中英ABC123、标题→小标题→正文、引用→正文、CtrlZ/CtrlY、格式后立即CtrlEnter保存、重新编辑回填观察正常。中英em计算font-style italic/synthesis style，实际glyph截图尚待。
- 有序列表两项+空尾li：保存卡片为ol start1两项，空项省略；重开CtrlEnd/Enter输入第三项，序号与文字正确。尚不能推断其他列表链通过。
- **阻断发布的稳定复现**：CtrlA/Backspace清空root样例→正文→输入标题行/Enter/输入“无序要点”→点击无序列表，DOM为p>ul>li“无序要点”；直接在正文Enter/输入“保留想法”，变成ul中空首li+次li“保留想法无序要点”。说明原光标从文字末尾变到开头，需独立审查与局部补实施，不能把现输入顺序列为通过。
- 此前长串联中一次CUA Input.dispatchKeyEvent超时，随后短操作无超时也复现上述问题。dev.logs error为空；工具超时与应用根因不等同。
- root直接new codec复现尾反斜杠编码丢失（Node退出0仅输出失败事实，非通过），通知impl后修复并加纯用例；需独立新全量回归。
- 辅助工具失败保留：误读src/noteFormat.ts与tests/noteCodec.test.ts退出1，实际为tsx/mjs，随后完整重读；git diff --no-index输出差量退出1为预期不同，非测试失败；CUA未声明变量及readonly DOM不提供document.getSelection导致观察请求失败，随后只读DOM观察成功。
- root新全量`npm test -- --test-concurrency=1` 60/60 fail0 exit0；root新`npm run build` exit0，entry gzip137.97kB。没有把绿色纯测试/构建替代下述UI失败。
- 最小列表复现分两次工具调用：新正文fill“定位样例”→End→无序列表→DOM ul/li“定位样例”；后续独立pressSequentially“X”→“X定位样例”。非长串联/超时引起的判断。
- 三模板真实插入/原生CtrlZ一次清空、标签“起笔验收”保持、新建保存后空正文且模板恢复正常。恢复非空草稿模板按钮为0，不覆盖已有文字。
- 新局部缺陷：阅读随记中的空blockquote/div/br序列化成空引用标记，关闭→新建恢复后为两个可见“>”普通段落，保存仍泄露。代码`edge`/#code/**literal**/<script>/尾反斜杠在同一真实case正确literal回填和卡片显示，普通标签仅“起笔验收”。root第10条“模板回归20261003 阅读随记”为隔离样例，原8条未改。
- 原生Tab.pressKey/typeText补测出现进一步错序/旧字重复，不能以此判定新增应用根因；只以上述稳定locator例作为阻断依据。一次close按钮无匹配，刷新可见DOM后已无弹层，按真实状态继续，无盲重试。
- viewport.set 390/844在本机现有缩放下得到可见DOM CSS clientWidth434；首次截图只为窄屏候选，不能冒称CSS390已验证。后续按真实CSS宽度换算再观察。第一张候选图composer-empty-after-light.jpg，最终图须使用补修后结果。
- 换算viewport351/760后实际html CSS clientWidth390，html/composer均无水平溢出，footer实际高57.39px且保存按钮/独立快捷键可见；深色候选图已保存，随后恢复浅色与默认viewport（实际CSS334）。补修后再取最终图。
- 多段正文“代码甲\n代码乙”真实DOM为文本+div，CtrlA后code按钮disabled，未插入代码，边界保护正确；root误点disabled按钮导致工具deadline，按DOM条件清空自己的未保存样例并关闭，未保存用户数据。
- root完整读取r1独立审查REVISE/IMPL_DEFECT，认可两项局部/低风险/无新决策；技能反目标字段简写与详细判定顺序差异已在正式报告明示，按详细顺序消费，不编辑全局规则、不重新解释允许裸标记。

### r2实际补修与阶段复测（尚未终结）

- 首次只恢复仍connected原Text的补修，root同两call仍得“X定位样例”，不能用同期62项/构建绿色声明修好。
- 经临时仅元信息诊断：命令前Text offset4/length4；原Text disconnected/non-owned；命令后新Text offset0/length4，非sameNode且collapsed。日志无正文/标签/密钥。初始Object日志不能展开，改JSON元字符串后真实读到此证据；不是推断源码未加载。临时日志随后移除。
- 补替换Text分支：限定collapsed UL/OL、同文字且post owned Text才恢复原位置。root同两call得“定位样例X”，Enter续写、UL↔OL后Y末尾、中间输入“下一中项Y”正常。真实CtrlZ两次返回前列表状态，CtrlY两次恢复；ShiftTab到引用/再ShiftTab到OL/Space后输入K为“下一中K项Y”，键盘恢复正确。
- 在添加标签input里点粗体，正文DOM不变并提示先在正文选择；清自己的tag input后立即CtrlEnter保存，卡片真实ul+ol且文字相同。root第11条“定位样例X”为隔离样例。
- r2空阅读模板：先选10月4日、标签“写作”，插入阅读模板、输入首标题后关闭→新建恢复，标题/日期/标签保持，无裸“>”；模板入口0，状态为“已恢复草稿 · 保留在本机”。保存卡片仍无裸标记，日期标签正确。root第12条样例后改名“引用回归20261003”。
- **新发现既定回填验收局部缺陷**：有字引用首次collapsed续写X正确，保存后编辑DOM blockquote/div，引用aria-pressed false；CtrlEnd点击正文只把内部div改p，blockquote仍在，不能退出。已通知impl在r2未终结包内限定修块状态/退出，不扩框架/新范围。版本仍0.5.1，S4未放行。

### r2收敛后的root真实证据

- quote祖先状态及native outdent：引用回填pressed true；正文点击后div，追加Y在末尾；CtrlZ两次回到引用X（一次撤销输入、一次outdent），CtrlY两次及即刻保存为pXY，正常。
- 接着发现引用→标题仍为blockquote/h2，保存丢h2样式；限定quote内h2/h3先outdent再formatBlock后补修。最终干净样例：回填quote→h2正确；CtrlZ一次div/两次quote，CtrlY两次h2；保存为h2，重新编辑改h3并保存为h3。此跨quote的标题切换有两个原生命令/undo步骤，未造自有history。
- 首次长批量header/undo观察到未主动输入的n/aan附加字，根因未定位，不解释为codec生成或已修复。转后台并分短调用新建干净的root隔离引用样例后，上述原生history链逐步观察正常；该有限复检不保证长期预览稳定性。
- 实际四方中英粗斜：root样例“排版回归20261003 · 把此刻留下 / 慢慢记录，轻轻整理。Soft writing feels comfortable.”即时编辑b/i、保存strong/em、graph-note详情strong/em、再次编辑strong/em均无内标记且字形实际倾斜。对应截图composer-after-light.jpg、composer-card-after.jpg、composer-graph-after.jpg、composer-refill-after.jpg位于本轮媒体目录。
- 最终CSS390/844深色：html CSS宽390，无composer水平溢出，工具换行/状态/快捷键/保存按钮可见，composer-after-dark-390.jpg。CtrlK时仍只有编辑dialog，无快开抢输入；Esc关闭后图详情编辑按钮focused true。已恢复浅色与默认viewport。
- 当前本轮共有4条root隔离样例，原8条未编辑；后续通过回收站恢复流程核验并清理到可恢复回收站，绝不永久清理。
- 上述既定链通过后root明确放行S4五文件0.5.2版本元数据，最终新全量/构建/独立审查与Windows新包仍待；旧版本制品仍不能作为新增格式的证据。

- 本轮早期合并源码/搜索输出过长截断，随后已针对关键源码分块重读。没有把截断内容当完整证据。
- 旧0.5.1 Rust test因os1455分页资源不足退出1；旧IAB tab1出现未定位预览崩溃。保留原发布记录，不由本轮前端合同通过推断原因或已修复。
- Windows原生IME、macOS、读屏/触摸、系统减弱/hidden、GPU与安装器安装卸载未测。现浏览器真实输入不能冒称原生IME。
- Git未提交/推送：既有混合改动来源未隔离，不能自动将全部发布。

### r2最终清理与移交（root）

- root第11条列表样例移入回收站→撤销恢复→再移入回收站；首次永久删除按钮仅切换成“确认删除”，记录仍在，没有执行最终不可逆确认；随后恢复，ul/ol和文字保持。
- root第12条标记完成→编辑保存，完成状态仍true；再恢复false。日期/标签和完成状态不因编辑器保存丢失。
- 四条root隔离样例全部移到可恢复回收站，未永久删除。8条原有活动记录可见正文/完成状态与改前DOM快照逐条严格相同，活动数量8。用户原记录未编辑。
- 最终新建编辑器正文为空，日记/会议纪要/阅读随记三个入口可见，状态“草稿仅保留在本机”。浅色桌面与实际CSS390窄屏图为composer-templates-after.jpg、composer-templates-light-390.jpg。viewport已reset、浏览器已恢复可见，tab4 markDeliverable。
- 清理后全局status观察遇到toast与编辑status两个节点的strict-mode错误；清理动作已发生，改用.composer .draft-status核对得到上述最终状态，未重复删除。工具观察错误不当作应用功能通过或失败。
- r2实施报告和S4已收齐：源码0.5.2；agent62项和build绿色仅为实施自证，root新命令和独立审查仍另行执行。S4辅助脚本一次ConvertFrom-Json空字符串键错误exit1，改-AsHashtable后exit0；原失败保留。

### r2最终命令与审查追加缺陷（root）

- 新全量62/62 fail0/cancel0/skip0 exit0；Web build exit0，entry index-BHAzeTfY.js gzip138.33kB、CSS8.36kB。Node类型擦除ExperimentalWarning保留。
- cargo check --locked --jobs 1 exit0；cargo test同参数exit0，lib/main/doc均0 tests，linker_messages warning保留。不是Rust业务或迁移自动化覆盖，历史os1455不删。
- 低并行npm run release:windows -- --ci exit0，0.5.2 EXE/MSI/NSIS已生成；这是r2源码候选，随后的独立缺陷使其不交付，不能当作修补后的制品。
- root独立元数据比对首次误用TEMP原目录层级导致Cargo.toml路径不存在/exit1；rg实际库存为五个扁平文件，改用叶文件名后完整校验exit0：五文件exact六行0.5.1→0.5.2，没有依赖/配置增量。诊断搜索没有console.debug/composer-list-caret。
- r2独立review追加同一有限引用链缺陷：只有普通标签的引用经标签规范化后为空却留下裸标记。root独立Node真实helpers断言exit1：quoteLiteral('#旅行','#旅行')→contentWithTags得到'> #旅行\n#外部'，withoutTags变成'>'，html='<div>&gt;</div>'、plain='>'。62项绿色未覆盖该反例，暂不发布。
- 用户同步新版全局AGENTS后，root全文重载当前coordinator/core/runtime。旧正式feature保持Gate。发现薄入口将连续两轮IMPL_DEFECT简写为无条件停机，与正式core§实施后审查7“且第二轮已对齐当前lwplan仍失败”条件不同；立即暂停发布结论并向独立review上报。以入口明确指向的正式core详细合同核对实际缺陷，不静默改技能或降级有界任务。
- root真实UI独立同原症状：全新正文fill“标签引用回归20261003\n#旅行”→CtrlEnd→引用，实际DOM是首行文字+blockquote #旅行；点击保存后卡片两个p，后一个为&gt;，可见正文“标签引用回归20261003\n\n>”，metadata仍旅行/10月3。第13条为本轮新隔离样例，不编辑原8条，待局部修补后回填/保存与恢复清理。

### r3局部补修后root独立证据

- r2报告全文复核后，停止自动/发布；以已冻结S1局部、低风险、无新决策及用户持续开发授权手动承接r3，不改技能或产品边界。r3仅两个源码/一个测试，新增黄金三项先红13项10pass/3fail exit1；首次补后夹具误保留行尾space12/13 exit1、按既有withoutTags规则修夹具后13/13 exit0；保留作者完整日志，不将失效r2候选交付。
- root新全量npm test -- --test-concurrency=1 **65/65 fail0/cancel0/skip0 exit0**，完整TAP已读；新npm run build **exit0**，entry index-s3tjEZAR.js gzip138.41kB、CSS8.36kB、Graph26.17kB、Worker7.03kB、PWA7项544.09KiB。Node ExperimentalWarning保留。
- root按实际生产签名quoteLiteral(body,visibleText,withoutTags,tagsFor)对同原反例重新断言exit0：saved='#旅行\n#外部'、body/html/plain为空，tags旅行/外部；两个既有helper参与，未改变普通提取语义或吞标签。
- root第14条新隔离样例“引用标签通过20261003\n#旅行”→CtrlEnd→引用，真实DOM仍含blockquote #旅行；关闭→新建恢复只剩标题div，无裸>，旅行标签仍在、状态已恢复草稿。CtrlEnter保存卡片p标题、metadata旅行/10月3；重开同文字，无裸标记。
- 同第14条混合首/中/尾标签与代码：正文标题/#首/引用正文/#中/#代码/#尾；通过同段选区把#代码加code，再全选引用，原生DOM生成blockquote/br/code。立即保存后卡片三个有字blockquote（标题/引用正文/code#代码），无空>；metadata首/中/尾/旅行，代码没有成为标签。图详情graph-note的同三块HTML/文字和再次编辑的blockquote/div/code保持，代码文字没有丢失。
- 观察错误保留：代码资格在同一批键盘后即时查询false，下个独立观察true，未盲点disabled；图详情首次误用.graph-note .markdown-preview而实际graph-note本身是预览，selector deadline。按新AX和.graph-note本体核对成功，选择动作已生效，未重复改选择/保存。不是应用失败的自造归因。

### r3最后短例与新增空标题遗漏（root）

- 最终R1原两call重新复测：新建fill“定位样例”→End→UL，下一call输入X/Enter/“下一项”，真实DOM为ul/li“定位样例X”/li“下一项”，输入顺序保持。只自己的未保存草稿，随后清空关闭，没有保存新记录。
- 新建阅读模板→关闭→恢复，HTML是h2阅读随记、h3阅读内容/摘录/我的想法和空div，没有裸>，状态已恢复草稿；原R2短例保持。
- **新增实际遗漏**：对恢复的模板CtrlA/Backspace清空→关闭→新建，却恢复div '#'，模板入口0。noteFormat h2/h3分支直接输出'# '或'## '，trimEnd/现规范化后成裸标记；不因它未在r3修改范围内而忽略当前G1/G2/N2。
- 另用干净单标题分短call独立复现：全新空编辑器fill“空标题清理”→全选→标题，实际h2有字；下一call全选/Backspace，DOM仅h2/br、innerText换行；关闭→新建为div '#'。未保存任何用户记录。已通知独立r3 reviewer判同一规范化边界，不擅自修改代码。
- 两条本轮新增的第13/14隔离记录已移到可恢复回收站，未永久删除。首次原快照比较误用markdown-preview.innerText（不含metadata且与原textContent口径不同），得到false；核对字段/口径后对全部8条原卡片textContent及.check aria-pressed严格JSON比较true，原卡片和note-body两个textContent口径均true。误比较不归因用户数据变化。
- 自己的'#'草稿通过fill空清除，再次新建正文空、三个模板入口可见、状态草稿仅保留在本机；没有清理用户草稿或原记录。

### r3 Windows构建失败与定向缓存处理（root）

- r3低并行 `CARGO_BUILD_JOBS=1 npm run release:windows -- --ci` 最终exit1：Rust主程序链接报E0460，`qingjian_lib`与已生成`windows_sys`的编译版本哈希不一致。库阶段有linker_messages warning。旧r2候选包仍失效，不能当作r3成功制品。
- 本机 `rustc --explain E0460` 明确说明依赖编译哈希不一致及重新编译办法；`cargo clean --help`支持包级/仅release清理。先解析确认绝对target路径在项目src-tauri内，再对qingjian包级release做dry-run（exit0，268文件449.8MiB）；verbose输出过长截断，不把该截断当完整构建验证。后续只处理生成缓存，不改依赖、源代码或用户数据。
- 正式包级release清理exit0，Removed 263 files/428.8MiB；与dry-run时库存差异保持实际输出，不把清理成功当构建成功。缓存只在已验证绝对workspace内。
- 压缩恢复后CUA旧binding不存在（softBrowser is not defined）；按当前URL重新连接现有IAB页。当前实际8条活动记录与前述清理后一致；重新采集同口径textContent/完成状态只供下一轮验证，不改记录。不把binding丢失推定为应用崩溃。

### r4补修前同一heading规范化追加观察（root）

- 新空记录fill '#旅行'→CtrlA→标题，实际DOM `<h2>#旅行</h2>`；关闭→新建恢复`<div>#</div>`与旅行chip，尚未保存任何记录。证明空正文资格需要按现withoutTags/tagsFor闭环，不能只查DOM textContent是否为空；不得吞metadata或复制regex。已原文回传impl纳入同一G1/G2/N2黄金，未扩大标签规则/草稿保护。

### r4当前源码实际回归（root）

- 首次旧页仍复现h2/br清空恢复'#'；独立实际源码已是新guard。清自己的草稿/关闭后reload返回ERR_CONNECTION_REFUSED，并触发工具对生成data错误页的URL阻断；同旧页AX/goto也被该当前错误页限制，未绕过安全策略。Get-NetTCPConnection5175无listener/exit1，不能把旧已载模块算当前patch失败。
- 在当前项目按同5175启动vite0.5.2（session35396，ready）；依所选浏览器故障恢复文档，以同browser2新tab2打开当前地址，8原记录保留。没有修改配置或清浏览器存储，旧页失效/服务停止事实不归因编辑器崩溃。
- 新当前模块原短例：h2“空标题清理”→全选Backspace真实h2/br；关闭新建正文空、三个模板、保存disabled。h3“空小标题清理”同样真实h3/br→恢复正文空、模板3、状态草稿仅保留在本机。原症状均得到实际正确结果。
- 阅读模板真实h2/h3/空blockquote插入后全选Backspace→关闭新建正文空、模板3，无裸前缀；未保存任何原记录。
- 当前源码新全量 `npm test -- --test-concurrency=1` 69/69，fail/cancel/skip0，exit0，完整TAP已读；新build exit0，entry index-Dktrhydh.js gzip138.44kB、CSS8.36/图26.17/Worker7.03、PWA7项544.21KiB。Node ExperimentalWarning保留。没有用impl自证代替root验证。
- 真实相邻有字正文+标签heading：fill“标题边界回归20261003\n#旅行”→末尾标题，DOM首行文字+h2#旅行；关闭恢复只剩首行div，旅行chip保持。立即CtrlEnter保存卡片p首行、metadata旅行/日期，无裸前缀。本轮新的隔离记录，后续四方与可恢复清理，不编辑原8条。
- 同隔离记录改为h2“排版最终回归20261003”+h3/i“Soft 与 中文斜体”，旅行chip保持；立即CtrlEnter卡片实际h2+h3/em；图文字选择UUID117120e3-047f-4ef0-8cf3-ee160e2d8fcb后graph-note同h2/h3/em；详情编辑回填同HTML/文字，无标记。有字两级heading四方保持。
- 当前R1短例两call：定位样例→End→UL，再X/Enter/下一项，实际ul/li“定位样例X”/“下一项”。R2阅读模板关闭恢复h2/三h3/空div，无裸>。R3有字首行+blockquote#旅行关闭恢复只剩首行h2，旅行chip保持，无裸>（首行沿此前模板h2，不伪称原始普通p）。都只自己的未保存草稿，最后清空并重新新建。
- 新隔离样例已移可恢复回收站，原8卡片同口径完整textContent/完成状态与本轮前快照严格JSON相等true；没有永久删除。最后正文空、日记/会议纪要/阅读随记3入口、保存disabled、草稿仅保留在本机。

### r4 Windows新制品与只读数据核验（root）

- 最终源码 `CARGO_BUILD_JOBS=1 npm run release:windows -- --ci` exit0，完整Web/Rust/WiX/NSIS输出已读。qingjian重新编译2m20s；E0460没有复现，linker_messages warning保留。版本、大小、时间和SHA256已读，MSI只读COM查询ProductVersion=0.5.2、命令exit0；精确三制品值见Release.Verification.0.5.2，不把失效r2候选交付。
- 仅自己启动新qingjian.exe（Start-Process WindowStyle Hidden/PassThru），10秒后own_process_alive=True，随后只Kill自己的进程做烟测清理；不是正常关闭或完整native UI验收。
- 新程序后snapshot.py SQLite URI mode=ro/BEGIN读取schema及全部字段，notes3/transactions0、SHA256948bc77f536283a9e50317edf6226dfc61de213ab77e29db6c550516119f719f，与before规范化JSON逐字节相等true；命令exit0。不读密钥，不恢复/覆盖原库。
- 新当前模块默认1280×720实际截图composer-final-0.5.2.jpg已保存；正文空/3模板/分开保存区，浏览器恢复可见、tab2 markDeliverable。预览服务继续在同5175运行，不修改用户服务/全局设置。

### 最终源码审查与文档收口（root）

- root全文复核fresh r4报告PASS/PASS，全10字段、反目标/作者体验/双结论合规；独立reviewer自己的69项/tsc/41库存三文件/1536默认解析引用兼容与生产症状exit0均另列，不冒称root命令。源码三hash与impl/reviewer严格一致，没有审查后功能修改。
- README/CHANGELOG/Project.Progress/Release.Testing/Note.Formatting/Release.Verification.0.5.2已上收当前事实、失败和未测，AGENTS只补相应文档索引。初始混合工作区未确认来源，未混合提交/推送；current保留用于原生专项验收交接，未擅自归档其他功能。
- 7当前文档的本地Markdown引用存在断言exit0，package/lock/lock-root/Tauri0.5.2一致，三源码最终hash与报告一致。tracked git diff --check exit0，仅已有LF→CRLF warning；不据该命令声称未跟踪源码已被Git检查或已提交。
