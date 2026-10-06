# 0.5.4 排序与置顶验证记录

日期：2026-10-04。最终源码的Web测试/实际操作、Windows体验制品与本机旧库核验已有以下证据；fresh独立实施审查对本轮声明范围PASS/PASS，root全文复核，不代表完整原生平台/MVP验收。初始混合工作区以本轮开始的 before54 文件快照比较，未使用 HEAD 代替实际基线，未提交或推送该混合范围。

## 本轮行为

记录抓手从历史的轻拉归位变为同一区域实际排序，置顶通过按钮进入独立区域。规范顺序来自完整 notes 数组，筛选中的排序仅替换可见 ID 的原槽位；置顶只改 pinned。网格和阅读的普通区、各日期的普通组及置顶区分别排序，跨分区不会自动修改日期或置顶状态。关闭动态效果仍可排序。具体存储兼容和选型见[记录排序](Note.Ordering.md)。

## Root 本轮独立命令

|命令|实际结果|说明|
|---|---|---|
|改动前 npm test|exit0，69/69|本轮旧源码基线，不冒充最终新源码验证|
|改动前 npm run build|exit0|入口138.58 kB gzip、CSS8.72、图26.17、Worker7.03；PWA closeBundle耗时警告保留|
|cargo check --locked --manifest-path src-tauri/Cargo.toml --jobs 1 --tests|exit0|测试模块也编译；后端冻结对象|
|cargo test --locked --manifest-path src-tauri/Cargo.toml --jobs 1|exit0，9/9，0 fail|九项实际生产数据库 helper 测试，main/doc仍0项；有linker_messages警告|
|焦点修正2后 npm test|exit0，78/78，0 fail/skip/cancel|root工具a50ebb；保留Node ExperimentalWarning|
|焦点修正2后 npm run build|exit0|root工具981511；入口176.93 kB gzip，CSS8.90，图26.17，Worker7.03；新的大于500 kB chunk警告|
|首轮 npm run release:windows -- --ci，CARGO_BUILD_JOBS=1|root主动中断，exit1|在发现新的取消清理错误后停止自有session78496；不能把此次当发布成功或使用旧制品冒充|

最后两项前端绿色后仍实际发现React取消清理错误。以下是修正后的新证据，制品、旧库与最终独立实施审查核验见下文。

### 最终生命周期修正后的验证

新增短父层SortLifetime，layout cleanup先使owner/session失效并公开stop canceled，再由同次卸载的子Provider insertion cleanup真正destroy。固定库的Renderer会在dragend callback返回后仍setState；所以仅让旧业务回调return不能阻止旧警告。没有修改node_modules、延后销毁或压制日志。

- root独立 `npm test`：df16b5，exit0，80/80、fail/skip/cancel均0，完整输出已读并保存在TEMP/root-final-tests.log。新增2项执行实际生产边界setup/cleanup，但不代替React遍历或真实sensor验收。
- root独立 `npm run build`：d6ca0f，exit0，2487 modules。入口550.00 kB/gzip176.96（相对本轮138.58增加38.38）、CSS41.22/gzip8.90（增加0.18）、图75.59/gzip26.18（增加0.01，共享入口链接/hash变化）、Worker7.03保持；PWA7项664.09 KiB。完整输出TEMP/root-final-build.log。大于500 kB chunk警告与Node ExperimentalWarning保留，未调整阈值掩盖。
- root实际修后reload起点 `2026-10-03T19:11:45.265Z`：键盘拖动中Ctrl K、切换阅读、进入关联图后返回、点击其他记录完成状态四类取消，规范排列均不误提交；查找输入框获焦点、预览消失。随后合法双向Enter与Esc连续三次保持抓手000焦点；实际指针双向交换、刷新保持并恢复。新起点后的error/warn日志为空，旧两条错误继续作为历史过程保留。不扩推未实际输入的原生blur/hidden/触屏场景。
- 用户5175原页面实际reload新源：原8条记录抓手首/次交换、刷新保持、反向恢复。最终原8条的date/state/tags/text及ID顺序与本轮原始可见JSON基线严格相同；没有向该origin导入夹具或编辑正文。用户页新阶段error/warn为空，并保留为交付页。
- 独立夹具最后加载全70条，可见正文与原基线严格相同、ID000–069完整同序。暂时新增草稿样例仅留可恢复回收站，不影响原70条。
- root独立静态审计47b6f3 exit0：54份before快照与manifest匹配、7份编辑器/存储/图保护源码hash不变、497个旧依赖version不变、新7个lock条目、8份许可证与实际原文hash逐份匹配、全部产品元数据0.5.4。源码冻结SHA：NoteSorter `9256B0050A135ABE869A59B515D5E9110203881B52115C410D42CA5BC13DC23D`，Rustlib `42FECE3E6F3EB501C0DEB48B649CABFE55C122BEF33ECA449FD7BA7D98DCE54E`；完整审计TEMP/root-audit.json。

取消边界新增测试首跑因当前TypeScript7默认入口不含旧createSourceFile/ScriptTarget而exit1（9 pass、1 failed file），改用既有Node类型擦除加载实际生产函数后11项绿；root最终80项另独立验证。旧失败完整输出保留在[前端实施报告](current/note-order-and-pinning/impl_report_r1.md)，没有新增依赖来解决测试加载。

数据库九项覆盖旧7/8列保旧字段、当前10列重复初始化、已有位置与NULL回退、完整数组含回收站反转、pin/正文/计划日期/完成状态与非空账目往返、笔记插入失败及账目插入失败的完整事务回滚、旧JSON缺字段，以及真正临时文件关闭后重开。它们使用与生产相同的初始化/读取/写入入口，不能代替本机真实用户库或原生GUI。

最终独立审查请求可亲读的Rust原输出：最初24a65b完整输出只保留在工具记录、TEMP仅有摘要，root不据摘要补造原文。对相同冻结Rust源码补跑上述locked/jobs1 check含tests及全量test，afa408/248fa2最终exit0；check耗时3.17秒、test编译14.87秒，9 passed/0 failed/0 ignored，main/doc仍0。这次真实完整输出与退出码保存为TEMP/root-final-cargo-check.log、root-final-cargo-test.log及对应.exit，linker_messages警告保留。

## 已实际操作的 Web 范围

使用独立5181 origin导入本轮72条有效夹具：70活动、2回收站、3置顶和1账目。用户5175原页没有导入夹具。浏览器交互使用真实抓手和键盘，没有直接写 localStorage、React状态或执行脚本模拟动作。

- 置顶区和普通网格抓手双向移动，刷新后仍保存排列；普通003/004交换刷新保持后再恢复。阅读单列实际指针双向移动；日期组003/006键盘双向移动。
- 普通拖往置顶区、指针放在区域外，以及10月4日的009拖往10月3日的004，均保持规范顺序。最终指针落点的纯测试另覆盖视口交集和键盘独立判据，不声称观察到工具未提供的每一帧路径。
- 标签验收甲 + 查询“排序验收 00” + 未完成得到002/004/006/008；004/006调整后清除筛选与加载70条，隐藏005仍在原槽位、未加载067–069保持。恢复后70条ID及展示正文和顺序与实际操作前基线相同。
- 显式置顶003加入顶部，取消回普通区原位置。置顶001编辑回填、Ctrl Enter保存后仍置顶；软删除撤销，以及回收站恢复后均回置顶原排列。回收站无抓手/置顶入口。
- 永久删除首次点击仅显示“永久删除后无法恢复”和“确认删除”；未执行最终永久删除。
- 关闭动态、返回记录、实际键盘排序成功并刷新保持；重新进入设置仍显示“开启动效”，随后恢复动态开启。
- 键盘Space/箭头/Enter实际改变顺序，Esc保持；曾出现两次合法结束焦点为BODY，焦点修正2后连续正向Enter、反向Enter、Esc均留在000抓手。
- 拖动中Ctrl K打开查找，输入框获得焦点、排序未提交；拖动中切换阅读布局无预览、无晚排序。随后控制台发现两条清理错误，取消矩阵不能据表面状态称已验收。
- 独立新草稿连续输入“排序交互草稿验收 ABC123”，关闭/重开恢复且提示已恢复草稿；Ctrl Enter保存后再次新建为空。该样例最终软删除留在可恢复回收站，没有永久清理。
- 深色390px测试，文档clientWidth和scrollWidth均375（滚动条占15px），无横向溢出；恢复默认viewport和浅色。关联图实际显示70节点/175关联和全量文字选择，不能据此称GPU性能已达标。

媒体保留在 `C:/Users/ZXL/.codex/visualizations/2026/10/02/01a0fc52-c082-7c00-b650-78e2c95b7cfa/qingjian-note-order-20261004/`：before.jpg、new-pinned-grid.jpg、keyboard-lifted.jpg、dark-390.jpg、final-pinned-grid.jpg；原用户8条与隔离70条的可见基线另有JSON。截图展示实际运行界面，不是设计稿。

## 已见失败与恢复

1. 最初抓手启用但只轻拉归位，实际拖向另一卡片不改变顺序；历史功能不符合此次用户选择。
2. 旧取消方案Readiness R1 REVISE，改用固定modern发布物后R2 PASS；Gate2 R1因正常取消闭环和缺陷分类REVISE，R2才PASS。失败报告保留，规划放行不等于运行验证。
3. 原planner未交付文件，root两次中断后接管；两个新agent调度受thread limit影响，复用已有agent。不把未落盘当交付。研究错误路径/正则/404与输出截断在各原报告保留。
4. 夹具初版status无效，随后PowerShell DateTime.Substring产生72条非终止错误而进程exit0；改用Python生成有效字段并实际重新导入，不能据exit0认定早期夹具正确。
5. 备份下载等待曾超时，未拿到路径，不称浏览器导出下载通过；实际独立导入和生产exportData/parseBackup纯测试是不同证据。
6. 初次前端类型检查有两处TS7006，显式事件类型修后重跑；曾猜错tsconfig.app.json路径，root另猜错src/components/NoteSorter.tsx，真实文件为src/NoteSorter.tsx。元数据LF整理只限本轮自身修改文件，保留CRLF警告。
7. 18:31:57安装/接线阶段旧页出现Invalid hook call/useRef null，原日志保留，未确定因果。18:33:59重新加载后早期指针检验无新错误，但后续18:55:53.968与18:56:39.534出现真实“useInsertionEffect must not schedule updates.”，属于本轮阻断，不能归入旧HMR后忽略。
8. 键盘合法drop首次确实排序但焦点为BODY；仅先reset再commit的首修仍红。加预期数据/组内顺序落地的焦点消费条件后实际三次连续操作绿，保留两次红例。只读document.hasFocus被浏览器proxy拒绝TypeError属于工具限制，没有据此推测页面是否获焦；DOM role-description中文正常，AX工具文字乱码没有擅改源码。
9. 置顶记录删除后首次检查完整页面耗时令撤销toast过期，点击等待超时；实际从回收站恢复后改为立即撤销的确定动作，置顶和位置保持。测试恢复隔离顺序时ArrowUp在三列网格按空间方向跨行，root用相反方向恢复再回同一组合筛选还原，最后70条严格对照相同；不是产品排序错误。
10. root公开API源码搜索曾包含不存在utilities/index.js，rg有os error3；实际index.js已读。前端实施阶段同类路径失败也留原报告。文档承接者曾猜tests/sortLifetime.test.mjs及impl_report_front_r3/r4不存在，rg报os2，随后rg --files确认实际noteSortLifetime.test.mjs/impl_report_r1；审查者预读错旧报告名/root-verification路径exit1后确认正确文件。没有把这些失败当接口缺失。库Provider destroy在insertion cleanup，monitor的Renderer更新不因应用回调return就消失，最终局部生命周期修正的真实复测证据见上文。
11. 最终文档审计增加报告冻结断言时，Windows的str(relative_path)生成反斜杠键，与预期正斜杠键不一致，251da7因KeyError退出1；属于root临时审计脚本错误。改为as_posix后412040退出0，11份文档/80本地链接有效、历史CHANGELOG逐字保持、无行尾空白，16份已审源码和3制品未变，最终报告/计划SHA匹配。没有把首次失败隐藏或当作产品故障。

## 真实用户库与制品

本轮修改前已只读BEGIN快照和SQLite backup：本机旧8列notes3条、transactions0条，归一化旧字段SHA256为 `948bc77f536283a9e50317edf6226dfc61de213ab77e29db6c550516119f719f`。备份、before.json与验证脚本只保留TEMP，不提交真实内容。没有自动恢复/覆盖用户数据库。

最终 `CARGO_BUILD_JOBS=1; npm run release:windows -- --ci` 的原生构建为session78087，root读取完整输出810e6e，exit0；optimized编译12分34秒、MSI/NSIS两包成功，完整原输出在TEMP/root-final-release.log。该命令自身再次执行Web build，最终资源与独立d6ca0f相同。保留Rust linker_messages和大chunk警告；首轮主动中断exit1没有被改写成成功。

root执行TEMP/root-native-proof.ps1，cc52fa exit0。程序/NSIS PE ProductVersion和只读MSI Property/ProductVersion均0.5.4；下列时间为UTC，2026-10-03晚对应本地2026-10-04凌晨：

|制品|字节|最后写入UTC|SHA256|
|---|---:|---|---|
|src-tauri/target/release/qingjian.exe|13,554,176|2026-10-03T19:28:50.6738013Z|FD24A3AAD197DCE00A1482983CA96AC093F4B0F98F260E4AC5B2E0BBC99172D3|
|src-tauri/target/release/bundle/nsis/晴笺_0.5.4_x64-setup.exe|3,761,909|2026-10-03T19:28:50.5525910Z|BB0A2880DBE17F4580A2250B299AB4EF81B9AE0CF2911E6AC4E8CAB147FFC24F|
|src-tauri/target/release/bundle/msi/晴笺_0.5.4_x64_zh-CN.msi|5,189,632|2026-10-03T19:28:08.7070000Z|46841AD41BC84B768FA5DDAB69A4DEF7FAE11EE3F41190485E1DE2D847AE99E9|

烟测前确认无已有qingjian进程。仅Start-Process -WindowStyle Hidden启动这份新程序，自己创建的PID146716在10秒后存活且Responding=true，随后只受控终止自有PID，exit -1。脚本exit0证明检查步骤执行，进程exit -1不是正常关闭通过；未运行安装器，也未称完整原生UI或原生排序手势实际验收。原始元数据和烟测结果在TEMP/root-native-artifacts.json。

之后root执行只读BEGIN比较脚本verify-native-after.py，8ee1b0 exit0：notes3/transactions0、两表原schema前缀及所有旧列/所有行严格相同；新增末两列为pinned/position，原3条pinned均false，位置为[0,1,2]。结果TEMP/native-after-report.json。与隔离九项迁移/回滚/真实文件重开互为不同范围证据；未覆盖真实库或自动恢复备份，未执行旧EXE降级写回。

## 最终独立实施审查

[fresh ReviewImpl r1](current/note-order-and-pinning/review_notes_impl_r1.md)协议/业务均PASS：最终需求/LW对齐、整体质量在本轮声明范围内通过，无当前源码阻断。root以ad5dad exit0全文读取119行报告，独立核验SHA256 `985EF3852C75F59E3912B32AD0DE2137D29917CBD0A3EE2D18864036C3784CFB`，十个必填字段、作者操作负担、S0–S3逐包差量与禁止项、原失败/未测均有直接依据。reviewer本轮另独立80项/tsc/冻结源码、许可、真实制品及前后可见JSON，root原始Rust日志缺口用真实补跑关闭，没有编造旧输出。

报告对最终冻结源码和审查时文档得出结论；随后root只同步当前状态句并追加本段，源码、计划和制品保持冻结，文档另做本地链接/历史/空白检查。未扩大为正常关闭、安装、原生完整GUI或性能验收；其他专项计划继续current交接。shared技能连续两轮缺陷停止条件的差异仅报告，本feature手动链未据其自动迁移，未越权修改shared规则。

收口静态检查：root `git diff --check` 456e9b退出0，LF→CRLF提示保留；最终当前状态未残留独立审查待完成口径。root临时文档审计及JSON在TEMP/root-final-doc-audit.py/json，审查前快照另存为root-audit-review-input.json和root-final-doc-audit-review-input.json，保留当时对象，不将收口文档hash冒称报告输入hash。

## 未测与当前边界

触屏、真实中文IME、读屏、系统减少动态、原生失焦/hidden、Windows100/125/150%缩放、安装卸载、AI凭据/网络、GPU/内存/耗电及长期稳定性仍需现场验收。旧图500条p95及历史包体候选未达保留；最终入口gzip增38.38 kB、CSS增0.18只是包体测量，不能代表丝滑性能。

旧版EXE写新库会丢失排序/置顶元数据，具体降级边界见[记录排序](Note.Ordering.md)。原备份数组级校验、桌面空库回退、双保存effect等议题仅报告，未顺修。总体MVP不能由自动测试、截图或EXE启动替代全部人工验收。
