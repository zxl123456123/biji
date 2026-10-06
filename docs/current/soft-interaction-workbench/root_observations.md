# 本轮root独立观察与验证

日期：2026-10-03。以下按实际阶段追加，不把基线验证当新功能验收。

## 改前基线

- 源码冻结在本轮专用 `%TEMP%/qingjian-soft-baseline-20261003/`；不包含node_modules/target，不回退未知工作。
- `node --test --test-concurrency=1 tests/*.test.mjs`：root本轮独立执行，最终退出0，41项、0失败。完整TAP分两次返回，已读；Node stripTypeScriptTypes有ExperimentalWarning。
- `npm run build`：root本轮独立执行，最终退出0。初始JS gzip87.56KB、图25.65KB、CSS7.68KB、Worker原始3.67KB，PWA7项384KiB。Vite主体19.86秒；closeBundle有约74.5秒PWA插件耗时告警。它不是新动效包体或启动延迟。
- IAB2/tab1、root此前自建5175隔离预览：7条有效/1条回收站合成记录，浅色网格；1280×720首卡top479.5px。实际改前截图：`C:/Users/ZXL/.codex/visualizations/2026/10/02/01a0fc52-c082-7c00-b650-78e2c95b7cfa/qingjian-0.5.1-soft-20261003/before-records.jpg`。
- 本轮扩大UI夹具另存为 `%TEMP%/qingjian-soft-ui-fixture-20261003.json`：65条（64有效/1回收站），新增57个测试标签；原8条夹具保留。本阶段只是生成文件，尚未导入。
- Motion registry metadata root独立读取：14.0.0、MIT、unpacked750887B；不是实际gzip。官方GitHub LICENSE页面读取超时，后续须读确切安装包LICENSE而不是视作正文已核验。
- 中途两次尝试读尚未生成的阶段报告返回退出1，均没有修改应用；后续采用Test-Path。研究阶段自己遇到的目录/JSON读取与旧URL失败保留在research.md。

## 后续承接

新功能测试/build、实际UI与包体、新Windows制品尚待实施后追加。本阶段不支持“软回弹已实现”“实际drag已通过”或“总体MVP完成”的结论。

## 改前UI补充证据

- 两次filechooser等待超时：第一次导致CUA状态重置；恢复后对实际input[type=file]点击，提前捕获拒绝，仍超时10秒。两次都未到setFiles，65条夹具没有导入。没有修改真实桌面SQLite。
- 改用实际编辑器新增一条“柔和交互验收记录”，含主题01–18共18标签；保存后8条有效。原旅行/阅读仍存在，但旧标签下拉只呈现主题01–10，实际重现slice(0,10)缺陷。
- contentEditable fill带换行被存成一段连续文本；本轮该夹具不用于证明多行输入。后续编辑器验收使用真实pressSequentially/Enter。
- 继续使用实际编辑器新增快捷定位测试01–16，每条只含合成单行正文；当前24有效/1回收站。进入关联图观察到“正在更新本地关联…”后消失，实际Canvas绘制存在。后续将用这一数据量验收新UUID定位等待异步模型，而不是只用小图同步路径。

## Motion包前置独立复核

- root读取实际node_modules/motion/LICENSE.md正文、package.json 14.0.0/MIT、react与react-m导出、framer-motion公开domMax/cancel声明退出0。
- 后续查cancel/jump源码时误用不存在dom-max路径，组合命令退出1；cancel/jump读取本身返回，但不以此组合失败称完整源码Gate通过。使用rg --files重新找实际路径。
- 改正路径后实际features-max.mjs读取退出0：domMax由domAnimation、drag、layout组成；VisualElementDragControls.cancel只结束pan/锁，不派发onDragEnd，stop才排入postRender回调；MotionValue.jump源码重置速度并停止动画。
- 原生进程库存Get-Process -Name qingjian无匹配时组合退出1（SilentlyContinue）；并非启动/崩溃失败。本阶段未启动任何原生进程。

## 实施中实际UI（未当最终验收）

- 新标签选择器显示20/20（18主题+旅行阅读），搜索主题18显示1/20，Enter后原精确筛选仅1卡。CtrlK在该受阻筛选下可查全部24有效，重复“读书随记”按9/29与9/28分别显示，ArrowDown+CtrlEnter选到UUID...007；关联图等待真实24条Worker完成后选中该UUID并清原标签，稳定画布中心显示选中节点。详情重复定位可用。
- 早期连续动作后截图曾返回上一帧QuickOpen画面，不能作为Graph证明；后续稳定getScreenshot重拍 graph-located-stable-24.jpg，不把早期截图当当前事实。
- 完整reload排除依赖热更新状态后，页顶1280x720、scrollY=0首卡top380.100006；不是之前scrollY=161.6时误读的218.5。实施补2px后需复测。
- 新增Motion依赖优化期间01:53浏览器报Invalid hook call/useRef，root整页reload后恢复。02:05快捷Enter编辑独立失败：QuickOpen关闭但无编辑dialog，真实console Illegal invocation，App向helper传递未绑定requestAnimationFrame/cancelAnimationFrame。已回传impl修正两处，尚待真实回归。不能因纯50项测试通过忽略这一故障。
- 一次过早读取尚未生成graphFocus.test.mjs导致组合退出1；源camera/helper读取返回，测试文件待实施完再读。

## 最终源码独立回归（root）

- 最终2px/RAF补丁与实施收尾之后，本轮root实际执行 `node --test --test-concurrency=1 tests/*.test.mjs`：退出0，50项、0失败，完整TAP已读；ExperimentalWarning保留。随后 `npm run build` 退出0，包含PWA尾声7项528.47KiB；入口gzip134.43kB、图26.18kB、CSS8.14kB、Worker原始3.67kB。入口相对基线增46.87kB，40KiB候选未达。
- RAF修复后真实CtrlK搜索“快捷定位测试16”再Enter，确实显示编辑记录dialog，document.activeElement aria-label为记录正文。早期连续批量中文键盘/选区操作出现文本与即时观察不一致，留下了该测试记录草稿；不能当中文IME验收。采用逐步观察重新验证：新建Editor verification ABC123，连续追加XYZ789次序正确；CtrlA选区准确、粗体按钮实际形成strong/b、按钮保存后卡片strong展示、再次编辑正文与粗体回填一致；编辑中CtrlK仍只有编辑dialog，CtrlEnter保存关闭。未新增错误日志；既有早期错误仍保留。异常测试草稿通过实际编辑器回填原合成正文再保存处理，不改浏览器存储。
- 实际标签20/20与主题18精确选择已确认；QuickOpen全局#主题18在记录页受阻筛选下仍返回1条，随机无匹配词显示0条/无结果，Escape关闭后焦点回搜索记录。
- 一次快捷键回归误用不存在`.search-box input`选择器，工具deadline/no_matches，未执行键盘；读取当前DOM后改用真实搜索记录角色继续成功，不视作应用失败。
- 真实Tab.drag抓手：释放后DOM transform依次约(10.97,9.14)、(5.55,4.63)、(2.10,1.75)、(0.61,0.51)、(0.14,0.12)px，再为none；无编辑dialog、正文与日期保持。证据帧soft-return-00–10.jpg只录实际浏览器，没有合成位移。鼠标拖拽归位得到真实证据；触屏implicit capture正常释放与lostpointercapture顺序仍未测，不能由鼠标证明触屏回弹。
- 页顶1280×720/scrollY0最终首卡top378.100006，比基线提前101.4px。浅深主题真实截图、深色编辑器文字rgb(237,240,255)、打开编辑器所有抓手aria-disabled=true；网格与按日期切换保留。390×844实际窄屏无横向溢出、抓手40px、QuickOpen面板left12/width366.4；临时viewport已reset，恢复浅色。18条仅本轮临时合成记录通过正常“移至回收站”可恢复清理，原7有效合成记录保留，真实SQLite不受此夹具影响。
- 图暂停后实际文案为“开启动态”（一次查询“继续动态”返回0，不是暂停失效）；旅行筛选2节点，选择UUID...001、放大再详情定位，标签仍#旅行、选中仍该UUID，暂停仍保持。随后清筛选/开启动态/适配全图实际可用，录制24张当前页面截图（约24.97秒），不作为60fps或GPU性能证明。

## Windows 0.5.1 独立制品与旧库

- root `CARGO_BUILD_JOBS=1; npm run release:windows -- --ci` 最终退出0，完整beforeBuild/PWA、release编译3m20s、两安装器输出已读；linker创建库提示产生warning，非失败。新版qingjian.exe为13508608字节，PE FileVersion/ProductVersion0.5.1，SHA256 2E4EA8F7D239DEA57ECDF135EBF4D39A00B5793E4CC071EC1B72D67063CF91B3。NSIS 3718564字节、0.5.1，SHA256 319DCCAF7FFF0069EBA5D50327A93047814010D884BE528944F306C154A1B8E3；MSI 5144576字节，SHA256 D4C394F5788F70043C43B7FB0E23D7846207CAD455B6342051D081FB0BCDB675。MSI没有PE版本字段，不伪造；版本文件与实际产物名另核对。
- root `cargo check --manifest-path src-tauri/Cargo.toml --locked` jobs1退出0；`cargo test --manifest-path src-tauri/Cargo.toml --locked` jobs1退出1：E0786 serde/tauri mmap失败、std metadata stub，明确Windows os1455“页面文件太小”。当时系统只剩923MiB可用虚拟内存/4352MiB物理内存，没有停止用户应用或修改系统分页配置，不能称Rust测试通过；release编译与check的退出0不掩盖此失败。
- 真实新版EXE通过Start-Process Hidden启动，仅自身PID168468，8秒后Responding=true、窗口晴笺、非0句柄；CloseMainWindow正常退出，两步组合命令退出0。未安装/卸载安装器，未用进程响应推断原生手势/GPU验收。
- 启动前只读SQLite备份与完整notes/transactions schema+rows规范快照在本轮专用TEMP目录；启动关闭后只读复核退出0，3条notes/0条transactions与完整结构、行完全一致，SHA256前后均948bc77f536283a9e50317edf6226dfc61de213ab77e29db6c550516119f719f。没有覆盖DB、读取/输出凭据或私密正文。
- 补充只读打开MSI Property表，WindowsInstaller OpenDatabase模式0，ProductVersion实际0.5.1，命令退出0，未运行安装。真实截图编码soft-return.gif为11张/11不同像素帧，graph-motion.gif为24张/24不同像素帧，实际帧已视觉检查；不能将每秒约1帧截图的图GIF当性能录像。
- 文档同步遇到两次apply_patch整行上下文不匹配，均没有部分写入；rg复核后按完整行重新补丁。同步仅当前事实/索引，不归档旧MVP、不恢复混合工作区。
- 最后追加Tab验证前，原IAB tab1变为“This page crashed”异常页，工具策略阻止当前data页上的点击和导航；未执行Tab、没有证据判定崩溃原因。读取浏览器故障指南后在同IAB2创建新的允许URL页tab2恢复正常，合成7条仍在、UI正常。真实12次Tab循环及ShiftTab焦点始终在QuickOpen内，Escape关闭焦点回快速打开。不能据恢复推断长期稳定性；异常保留为未闭合稳定性边界。新版tab2已展示并标记为本轮交付，未改用户原服务或停止用户进程。
- 最终root git diff --check退出0（LF/CRLF告警保留）；dist/target/node_modules忽略规则核对退出0。独立许可/版本检查首次Python未指定UTF-8读中文JSON，默认GBK触发UnicodeDecodeError退出1；明确UTF-8后重新执行退出0，四原MIT文本/public/dist字节均相同、产品JSON版本均0.5.1、六当前文档链接无缺失。没有修改源码来修工具编码。新页最终console error列表为空、截图records-light-final.jpg已保存；不据空日志掩盖旧页崩溃。
