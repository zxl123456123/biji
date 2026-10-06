# 实施评审：柔和交互工作台 r1

- review_target：impl
- impl_round：r1
- review_seq：1
- review_date：2026-10-03
- 输入：[impl_report_r1.md](impl_report_r1.md)、[impl_validation.md](impl_validation.md)、[lwplan.md](lwplan.md)（Gate-2 r2版）、[clarifications.md](clarifications.md)、[root_observations.md](root_observations.md)、[0.5.1最终发布验证](../../Release.Verification.0.5.1.md)、README、readiness/LW记录及原始feedback。
- **协议结论：PASS**。
- **业务结论：PASS**。
- **结论范围：本轮S1–S5有限源码改动与0.5.1 Windows体验版交付。** 不等于全部Rust测试通过、总体MVP完成、全平台无bug或触屏/IME/GPU已验收。
- **收尾补录后仍为限定PASS/PASS**：新增IAB预览页未定位崩溃明确列为未关闭的稳定性边界；此结论不验收长期稳定性，也不把新页恢复视作崩溃已修复。

## 必填判定字段

| 字段 | 结论 | 证据/边界 |
|---|---|---|
| goal_lock_alignment | aligned | G1真实抓手回弹/首屏、G2全部标签/UUID打开与定位、G3精确成熟API/证据分层/新制品均有本轮证据；未测边界仍保留 |
| anti_goals_touched | none | 独立抓手、业务button siblings、不改排序/存储/关系算法；见禁止项核验表 |
| authoring_ergonomics_check | pass | 原业务handler可直读，有限Motion适配和纯合同，无动画DSL或新图/UI框架 |
| declaration_readability_check | pass | allowed、统一token、latest ref和明确UUID入口职责保持；用户不见存储语法/内部协议 |
| plan_defect_checkpoint_recommended | no | 未发现需改变阶段目标、任务结构、验收或回撤的新缺陷 |
| plan_defect_checkpoint_reason | 无新增计划缺陷 | 三处LW风险已按r2落地；首屏2px/原生RAF是既定包内局部修复，历史失败不被删除 |
| plan_defect_trigger_reason | n/a | 未触发PLAN_DEFECT/PROBLEM_DEFECT |
| impl_safe_validation_check | pass | 独立50项纯测试0；实际源/确切依赖/许可证/差量/版本核验；最终build由root承接0。不能推出native手感 |
| coordinator_handoff_check | pass | root最终Web/UI/Windows/旧库证据已落盘；Rust test失败与各原生未测明确保留，不冒充全绿 |

## 独立读取与本轮自证

已完整加载plan-review及验证技能；完整读上述阶段材料，实际查看SoftInteraction/softMotion、NotesView、App、QuickOpen/TagPicker、recordNavigation、NoteFilters、Modal/Composer、graphFocus/NoteGraph/graphGeometry、相关测试/有效CSS、确切Motion包的功能/取消源码及许可。

| 本reviewer实际命令 | 退出/结果 | 证明范围 |
|---|---|---|
| `node --test --test-concurrency=1 tests/*.test.mjs` | **0，50项、0失败**；完整TAP已读，1455.885ms；stripTypeScriptTypes ExperimentalWarning保留 | 当前纯生产合同/原回归，不是React DOM/native/GPU |
| 收尾新增事实后再次执行同一纯测试命令 | **0，50项、0失败**；完整TAP已读，1470.5648ms；ExperimentalWarning保留 | 本补录时点纯合同仍成立；不能诊断浏览器进程崩溃或证明稳定性 |
| 10个保留文件与本轮改前专用副本SHA256对照 | 0，全相同 | store、desktop、Composer、Modal、useNoteGraph、Worker、noteGraphModel、noteFormat、recordTools、main未被本轮改写 |
| 当前lock与专用改前package-lock逐路径版本核对 | 0，仅新增motion/framer-motion/motion-dom/motion-utils四包，各14.0.0；既有版本无漂移 | 未擅自升级其他依赖 |
| 四安装包LICENSE与public随包文本SHA256核对、六产品版本字段核对 | 0，许可证字节相同、六字段0.5.1；motion MIT正文已读 | 确切许可/元数据，不替代法律或安装验收 |
| 新EXE/NSIS/MSI实际读取字节/哈希/可用PE版本 | 0，与root最终记录一致，见下表 | 制品真实存在且是0.5.1；MSI无PE版本，未伪造 |
| `git diff --check`本轮既有六源码路径 | 0；App/styles LF→CRLF提示保留 | 空白检查，不恢复/提交混合原始工作 |

独立`git diff --no-index`比较NoteGraph及graphGeometry返回1，因存在预期定位/helper差量，完整diff已读；这是有差异的正常状态，不转述成失败检查已通过。reader没有做Git mutation、服务/DB/UI/系统操作。

## 实现与计划对齐

- **S1/S2**：同步LazyMotion strict/domMax、轻量m；SoftButton保留onClick/type/disabled/aria/键盘。grab通过dragListener=false、primary/main-button入口，只在原生独立把手启动；上下10/左右12、无momentum/elastic，MotionValue官方spring归位。cancelSoftMotion实际生产调用controls.cancel、停止自有动画及value.stop/jump，不依赖onDragEnd。policy/blur/卸载清理、自有handle保持有限，原编辑器/Canvas无Motion手势。
- **确切API**：已读14.0.0 features-max（domAnimation+drag+layout）、VisualElementDragControls.cancel（结束PanSession/锁，未派发end）与stop（postRender派发end）、MotionValue.jump/stop。纯合同使用实际MotionValue。减少动态仍保留业务button/键盘/D3入口；暂停CSS与JS策略均有接线，真实系统/后台中途组合未全部实测。
- **S3**：全量collectTags无截断；底部仅紧凑展示10但有全部入口，精确标签值不被大小写检索改变。QuickOpen查全体activeNotes后批量，UUID key/activeId和trash隔离；IME/229/repeat guard与原生button保持。createEditHandoff在入口与RAF执行时从notesRef读取，取消旧身份/unmount；App effect每setup创建新控制器，StrictMode不会复用永久disposed对象。原生RAF/cancel现为arrow调用，已独立读源，root实际失败复检不以纯mock掩盖。
- **S4**：App唯一locateRequest/token；QuickOpen清阻挡filter，详情false保留。graphFocus读取最新request/status/finish，waiting不消费、结果前再次核对最新token/disposed；NoteGraph owner仍[session]，reconcile当前nodes后、Resize赋尺寸后与status/request effect重试。D3镜头立即应用、selected冻结沿既有effect，原owned监听身份保护不变。原D3真实函数受控回归0；原生触摸所有权仍不是这类测试证明。
- **S5**：产品字段一致0.5.1；未改Rust业务/数据格式。新增许可文本随前端静态产物。impl报告正确区分最后补丁前build与root最终build；本轮不会提交生成物或混合初始工作。

## 基线与澄清一致性复核结果：PASS

- 未回答列表为空。连续开发授权不重复索取许可，但独立readiness/LW/impl和root证据保留。
- 目标锁遵守、反目标未命中，7项取舍未违反。没有加入SQLite增量/图算法/回顾/历史等延期项。
- 证据不足的原生输入/性能按原风险边界继续未测；此次PASS不静默把未测改成通过。

| 禁止内容 | 实际可核查证据 | 结论（确认本轮未命中） |
|---|---|---|
| 全卡/正文/动作启动装饰drag、抢选区/滚动、重排或每帧业务写 | NotesView:41–47原生siblings；SoftInteraction dragListener=false/start guard；styles:325只把手touch-action，MotionValue不setNotes/调用保存 | 确认不存在本轮新增越界入口 |
| 自制物理/pointer状态机、第二UI/图引擎、3D/云embedding、存储迁移 | 官方Motion调用；D3定位diff；十文件baseline哈希及Rust业务无diff；lock仅四新增包 | 确认未扩入 |
| Node/源码假装原生/GPU、回退未知/提交生成物 | impl报告/验证、root最终记录分别归属；本review无restore/reset/clean/commit；未测明确 | 确认未认可这些操作或结论 |

## Root承接证据（已读；非本reviewer重新操作UI/DB）

- 最终50测试0、完整Web build0含PWA；入口gzip134.43kB，图26.18kB、CSS8.14kB、Worker原3.67kB，PWA528.47KiB。入口增46.87kB约45.77KiB，**40KiB候选未达**，不能声称包体预算通过。
- 新实际鼠标drag释放位移约10.97/9.14→5.55/4.63→2.10/1.75→0.61/0.51→0.14/0.12→none；真实帧录取，正文/日期不变，无误开编辑器。1280×720首卡378.100006，较479.5提前101.4px，满足本轮<=380候选；浅深与390px无横向溢出、抓手40px、Modal有界。
- 标签20/20及主题18精确筛选；QuickOpen跨阻挡filter与同名UUID选择；24条真实Worker后居中、详情保旅行filter/暂停定位、放缩/适配/重新开启。真实Enter编辑修复后焦点正文，逐步ASCII连续输入/粗体选区/保存展示/编辑回填/CtrlK不抢/CtrlEnter保存已有观察。中文快速操作异常与IME未测未被ASCII回归消除。
- root正式release jobs1退出0、cargo check jobs1/locked0；**cargo test jobs1/locked退出1**，E0786 serde/tauri mmap、std metadata stub及os1455页面文件不足，当时可用虚拟内存923MiB。不能称Rust测试通过；root未停止用户app或改分页配置。由于本轮未改Rust业务、当前正式编译/check及EXE路径已有证据，此环境失败不冒充源码缺陷，也不扩大为新计划；资源恢复后Rust test仍需重试补证。
- 新EXE自身PID启动8秒Responding、窗口晴笺/非0handle、正常close退出0；只读旧库完整schema/rows规范快照3notes/0transactions前后相同，SHA256为948bc77f536283a9e50317edf6226dfc61de213ab77e29db6c550516119f719f。reviewer不重复读取私密DB、启动程序或推断安装器/原生手势已经验收。

| 制品 | 本reviewer独立核对字节 / SHA256 / 版本 |
|---|---|
| `src-tauri/target/release/qingjian.exe` | 13508608；2E4EA8F7D239DEA57ECDF135EBF4D39A00B5793E4CC071EC1B72D67063CF91B3；PE File/Product 0.5.1 |
| `bundle/nsis/晴笺_0.5.1_x64-setup.exe` | 3718564；319DCCAF7FFF0069EBA5D50327A93047814010D884BE528944F306C154A1B8E3；PE File/Product 0.5.1 |
| `bundle/msi/晴笺_0.5.1_x64_zh-CN.msi` | 5144576；D4C394F5788F70043C43B7FB0E23D7846207CAD455B6342051D081FB0BCDB675；MSI无PE版本字段，按产物名与一致元数据核对 |

### 收尾新增事实补录（r1原结论后，2026-10-03）

已实际读root_observations末条及0.5.1发布页失败6，并读取其MSI补证原文：

- 在追加焦点验证前，原IAB2/tab1显示“This page crashed”。root没有在该异常页执行点击或Tab；data异常页上的导航受工具策略阻止。该崩溃是真实已见异常，**原因未定位**，没有证据归因于分页/系统资源、App/Motion/Worker或具体动作。
- root依据浏览器故障指南在同浏览器新建允许的localhost:5175页tab2，UI与7条合成数据恢复；随后实际12次Tab循环及ShiftTab保持在QuickOpen内，Escape回快速打开焦点。此为新页中的焦点边界证据，**不能关闭旧页崩溃、证明长时稳定或宣称未再发生错误即无bug**；本review未复操作UI。
- root以WindowsInstaller OpenDatabase模式0只读MSI Property表，ProductVersion实际0.5.1、命令退出0，没有运行安装。该证据完善MSI版本，但与reviewer独立文件hash/字节证据分开归属，不转述为本reviewer直接读取了Property表。
- 本补录无代码修改。已见崩溃不能仅凭新页恢复定性为IMPL_DEFECT或排除源码缺陷；目前缺少可复现触发、进程日志及原因证据，保留诊断责任，不虚构计划缺陷或要求新产品决策。限定源码与体验制品PASS保持，**整体稳定性仍未验收**；若后续复现或归因，需按原缺陷边界重新评审，不能引用本PASS回避。

## 失败、风险和未测必须保留

- 首卡380.100006曾超候选、原生RAF曾Illegal invocation、Motion依赖HMR曾Invalid hook call；补丁与实际复检有后续证据，原失败不能删除。
- 快速批量中文输入/选区的DOM观察异常尚未成为可靠IME验收；root按原编辑UI处理合成草稿，未改存储或Composer。触屏、笔/二指、系统reduce、后台中途取消/恢复、125%等缩放、GPU/耗电/内存、安装/卸载仍未完成。
- **触屏回弹专项风险未关闭**：抓手lostpointercapture无条件reset/jump；正常implicit capture释放与中断capture事件顺序未实测，可能影响触屏正常回弹。鼠标真实归位不能证明触屏，后续需观察后再判bug或限定支持；目前没有已复现证据，不编造缺陷、不擅改代码。
- Rust test实际退出1及包体候选未达需原样报告。旧图构建预算/总体MVP未验收保持。npm audit既有5项（非新Motion）发现继续范围外留待后续，不能自动升级。
- 收尾IAB原页“This page crashed”异常未定位，恢复新页不等于修复；长期运行/崩溃原因边界未关闭，不借此前资源不足记录推测因果。
- 读取路径不存在/合并输出截断、镜像审计404、CRLF/no-index误判、chooser/选择器超时等工具失败已在impl/root原文保留；本review独立no-index exit1是预期差量而非测试失败。

## 设计味道扫描结果：WARN: 包体候选未达、触屏capture未测及预览崩溃未定位

实现未扩成框架、业务职责和声明可读性保持。上述体验/性能/稳定性边界需要后续对应测量及诊断；不以当前PASS宣称预算、长期稳定或全平台通过。未发现已归因的局部源码缺陷需要IMPL_DEFECT，亦无目标漂移、反目标、作者体验回退或新决策要求触发PLAN_DEFECT/PROBLEM_DEFECT；这不排除未定位崩溃的后续源码归因。

## contract drift / stale / mirror mismatch

- 无新增shared/platform范围漂移；LW三处最新状态/pending补丁与实际源一致。
- impl_report.md命名在实际core落为impl_report_r1.md并已明确映射。root最终结果以root_observations为当前证据，早期“待承接”段保留作时点历史。
- 最终发布验证页已完整复读，当前UI/制品、Rust失败、包体候选未达及原生未测均有明确事实，无当前状态“待承接”占位；与root最终记录及本review独立制品读取一致。root另已报告README/CHANGELOG/Progress/Release.Testing/Soft.Interaction/AGENTS索引同步，本review此处仅对实际复读的发布页作确认。两GIF真实文件存在，录帧来源和手感观察由root证据承担，不把媒体存在视作GPU验收。

## 后续动作

- 允许root交付本轮0.5.1体验制品和已实测效果，准确同步最终发布事实；不得写“全检查通过 / Rust测试通过 / 总体MVP完成 / 所有设备丝滑”。旧整体MVPcurrent目录继续保留。
- 资源恢复后补Rust test；触屏capture/IME/系统和GPU需各自实测，不能靠此报告或源推断；若复现再按局部/风险/新决策三条件判断IMPL_DEFECT，否则回计划。
- 保留IAB原页崩溃记录，后续取得运行/资源/浏览器故障证据再判原因；不得在最终交付中声称稳定性已验收或以新页恢复隐藏异常。
- 此次无补代码任务、无计划回退或新用户决策。PASS所允许的归档仅限本轮明确范围及风险记录，不自动归档前轮总体MVP；不混合commit/push来源不明的原始工作。

无新增跨功能事实。
