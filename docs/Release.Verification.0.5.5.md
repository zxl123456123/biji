# 0.5.5 搜索体验验证记录

日期：2026-10-04。用户“继续优化实施吧”授权接续“搜索一致性 + 命中摘要”。按coordinator bounded路径实施，不新增依赖、不迁移数据；本轮基线为TEMP/qingjian-search-experience-20261004/before的83个文件快照。初始工作区包含大量前轮与未知来源修改，未整包提交/推送。

## 已实现与命令证据

✅ 主搜索与Ctrl K共用可见正文+标签子串匹配，快开有首命中摘要、安全轻量高亮和明确创建年月日；缓存派生搜索串与当前结果摘要，保持40条批次、源顺序和UUID动作。具体边界见[搜索体验](Search.Experience.md)。

|Root实际命令|结果|边界|
|---|---|---|
|初红相关测试|exit1，20项17pass/3fail|旧主搜索与可见正文不一致；首版斜体夹具写错，另补正确基线红跑|
|首次实现后相关测试|exit1，26项24pass/2fail|root测试误将有限斜体写为单`*`；读真实codec后改为`_`，未改格式协议|
|纠正夹具后相关测试|exit0，26/26|完整输出search-green-corrected.log，工具4e2191|
|纠正夹具对before真实源码的红跑|exit1，15项12pass/3fail|工具72dddb，search-red-corrected.log；跨格式短语、隐藏格式符和组合筛选三项真实红例|
|首次npm test / npm run build|均exit0，89/89|010567/7bb07c；build在摘要性能修正前，保留大chunk与PWA慢hook提示|
|摘要早停及memo修正后npm test|exit0，89/89，0fail/skip/cancel|1271cc，npm-test-final.log；Node类型擦除ExperimentalWarning保留|
|CARGO_BUILD_JOBS=1; npm run release:windows -- --ci（早停版v1）|exit0|a231fa，release-window-v1.log/.exit；含当时Web构建、原生编译与MSI/NSIS两包，最终随机窗口版见下文|

上表a231fa为窗口早停版v1制品证据：Web build为2488 modules；入口551.19kB/gzip177.49、CSS41.66/gzip8.98、图75.59/gzip26.18、Worker7.03；PWA7项665.67KiB。大于500kB chunk与Rust linker_messages警告保留；原生optimized编译3分00秒。随后root对末尾摘要继续性能修正，v1原始输出/.exit与制品元数据另存release-window-v1.log/.exit及root-native-artifacts-v1.json，不把它们作为最终算法制品证据。

最终随机字形窗口版：root再次完整npm test，074f0e exit0，89/89、0fail/skip/cancel，npm-test-window-final.log保留原输出。root再次执行同版本release --ci，6e4f47 exit0；最终Web为2488 modules，入口551.35kB/gzip177.54（比0.5.4 +0.58）、CSS41.66/gzip8.98（+0.08）、图75.59/gzip26.17、Worker7.03，PWA7项665.83KiB；optimized编译2分51秒，MSI/NSIS均成功。release.log/.exit现为这次最终原输出，warning均保留。下方制品表对应此最终源码。

## 实际浏览器验收

只在隔离5181 origin通过真实备份选择器导入54条合成记录（53活动、1回收站、2置顶、45条批次）。原用户5175未导入或修改正文。没有脚本写localStorage/React状态或模拟事件。收尾确认原5175无监听后重新启动新版服务，并打开新的可见预览页；原8条记录仍显示，只读快开“图谱”得到2条高亮、创建年份2026，Esc关闭后回到8条列表，新warn/error为空。

- 主搜索“柔和交互”得到粗体/斜体两条，Ctrl K同样两条并连续高亮，无回收站泄漏。
- 两篇长记录的末尾“报销凭证”在摘要中可见；首行帮助区分记录，创建2025/12/31与2026/10/4清晰，区别于卡片计划10月8日。
- “收尾 #旅行”主查询与快开均1条，快开保留跨界高亮；“#旅行”包含仅标签记录与正文记录，2条正确。
- 实际代码查询`</mark><img`保留字面文本，DOM只有文本/mark、没有img或script；Unicode`İ ABC`查询abc确实高亮ABC，没有向后错移。
- 45条查询，连续41次ArrowDown后渲染42条、选择“批次验收41”；Enter编辑实际回填41，未修改/保存正文。Ctrl Enter打开44后，关联图文字选择实际选44，图53节点/47关联。
- Esc关闭后焦点回快速打开按钮；编辑关闭后搜索输入获焦点。关闭动态仍可主搜索/快开/方向键选择，业务操作不依赖动画。
- 深色390×844：clientWidth/scrollWidth均390，无横向溢出；两个高亮位于摘要可见两行内。随后恢复默认viewport。浅色与深色截图均root实际查看；该阶段warn/error日志为空。

截图：C:/Users/ZXL/.codex/visualizations/2026/10/02/01a0fc52-c082-7c00-b650-78e2c95b7cfa/qingjian-search-experience-20261004/quick-open-light.jpg与quick-open-dark-390.jpg。实际运行截图，不是设计稿。

## 查询测量与性能修正

相同1000条、每条457 UTF16字符的合成记录，12次交替查询“报销凭证”/“工作安排”，命中334/1000一致。root benchmark.mjs两次独立运行exit0：旧首次42.89ms、后11次中位27.93/最大30.00；新首次44.27ms、热中位0.167/最大0.269。原始benchmark-before/after.json保留。只计Node纯匹配，不包含摘要、布局、绘制、GPU或真实用户长文。

独立审查真实发现首版摘要全量展开：40篇20002字形前置命中的preview-only单次Node耗时307.06ms。root首先采用原生迭代早停并memo当前行摘要，重新跑全量89项。root进一步实测早停仍逐字遍历末尾前缀：40篇20002字形尾命中357.67ms（b3f29a exit0完整输出）。据实继续修正为原生containing定位局部字形窗口及默认小写偏移的前缀二分映射，没有新增全文索引。

最终相同脚本40行摘要探针074f0e exit0：502/5002/10002/20002字形前命中约3.14/3.08/3.83/5.31ms，尾命中约1.68/5.39/12.22/26.65ms，全部断言命中保留。原始preview-benchmark-final.json。单次Node合成计时不是p95或浏览器帧率；40只是默认批次，既有ArrowUp环绕末项可一次扩展至末项，40行探针不代表任意显示量性能。长文首次小写、解析、查找和完整UI/GPU/内存预算仍未验收，不能据此称整体丝滑。

最终随机窗口源码在新页面真实复测：末尾报销凭证、İ后的ABC、部分emoji查询“👩”突出完整家庭字形、跨界收尾 #旅行，以及深色390两条摘要和无横溢均与预期一致；新warn/error为空。最终quick-open-final.jpg与quick-open-dark-390.jpg来自此源码，旧键盘/图交接源未变。

## 已见失败与未测

上述两次红/首次绿失败均保留原输出。另见：一次读不存在tsconfig.app.json的PowerShell非终止错误（进程exit0不能代替读取成功），随后真实tsconfig.json已读；首个组合输出截断测试472tokens，随后完整两文件重读。另一次组合读取因manifest过大截断历史文档输出，最终当前文档单独重读。边界调研误猜tests/noteFormat.test.mjs，rg exit1；文档agent枚举尚未创建的新docs，rg exit1，未制造失效链接。审查者临时diff脚本默认GBK编码失败，改UTF8后重读；Cargo.lock临时审计先误改同版本其他依赖而断言失败，改准确定位后因cargo将旧5510个CRLF转LF的字节差再次失败，纳入真实换行差后语义/字节检查正确通过，未改变其他依赖，原失败留审查报告。root主动停止自有测试dev服务的exit1为受控清理，未作为构建失败或通过。另有收尾使用旧CUA tab2绑定时“Tab2 not part of browser session”工具错误，当前浏览器库存无该tab；重新启动5175并创建新可见页恢复预览，不能从旧绑定失效推断产品崩溃。最后一次五文档组合读取再次截断Progress历史部分，随后单独完整重读当前段并严格核验历史字节。root扩展历史字节审计时误假设before具有新增历史标题，首次281c69因anchor不存在而IndexError exit1；查实际旧正文锚点后f961a1 exit0，README/Progress/CHANGELOG历史正文与EOL严格保持，非产品失败。

⛔ 未测：中文真实IME、读屏、触屏、系统减少动态、旧WebView/浏览器Intl.Segmenter兼容、Windows缩放、安装卸载、正常原生关闭与完整原生GUI、GPU/内存/耗电和长期稳定性。搜索仍字面子串，无模糊/重音等价；独立阅读窗未实现。原有数组级备份校验等跨功能问题只报告不顺修，历史0.5.4完整失败与排序/降级边界保留。

## 制品与收口状态

✅ root于01db22独立重新核验程序/NSIS的PE ProductVersion，以及只读MSI Property/ProductVersion均0.5.5。以下为最终随机字形窗口源码的新制品，替代v1体验包：

|制品|字节|SHA256|
|---|---:|---|
|src-tauri/target/release/qingjian.exe|13,554,176|B4B285C14C1D4E114832C8178F8ED32CEF390B1F27E79CF29239742060796BF0|
|src-tauri/target/release/bundle/nsis/晴笺_0.5.5_x64-setup.exe|3,759,287|29F43445AB384F46FB9CEBBC2A855162EC556B8B07F5E4CCC30819200F5016F5|
|src-tauri/target/release/bundle/msi/晴笺_0.5.5_x64_zh-CN.msi|5,189,632|57976C503AE3E0B001B6A4E5B3BB88E36199573F4DAD36926E4971E0A03A69DC|

没有既有qingjian进程时只启动自建隐藏PID190020，10秒后存活且Responding=true，随后只受控终止该PID，进程exit -1。检查脚本exit0，完整结果root-native-artifacts.json；受控终止不代表正常关闭、完整原生UI或安装器验收。此前v1的同类PID205576烟测在root-native-artifacts-v1.json保留，不能代替最终程序烟测。

烟测前通过只读BEGIN快照与SQLite backup保留本机库，烟测后再次只读比较：notes3/transactions0、两表结构和所有字段完全相同，包括pinned/position。前后规范JSON SHA均3460a09a76d0d8b4d737cee2c5fe9cbce0f02705b14b8950e7b2986b56396e48；真实内容只保存在TEMP，不提交或展示。native-before/after-report.json来自实际命令exit0，不自动覆盖/恢复用户库。本轮没有数据库业务变更，不把旧轮9项数据库测试当本轮新跑证据。

✅ 独立最终实施审查PASS：需求对齐与本轮整体质量均PASS，无当前阻断。root在a6f59b全文读取最终62行报告并核验SHA256 F6760F02293941B48674AA4641C2692860FB1BE160C3513849177AD20B94C396；报告保存在TEMP/qingjian-search-experience-20261004/search-review.md。审查对象为12项冻结源码/测试/metadata及最终0.5.5随机字形窗口制品，覆盖83文件基线差量、当前文档、89项测试与952组独立窗口探针，并明确root与reviewer的证据责任。

root收口审计再次核验83个基线、12项冻结对象、3制品SHA、依赖保持、六份当前文档的有效链接与行尾空白，以及README/Progress/CHANGELOG历史正文与EOL保持（root-audit.json）；git diff --check退出0，已有LF/CRLF提示保留。本轮PASS仅覆盖已授权的搜索一致性、命中摘要、安全高亮、创建日期和对应体验制品；不放行安装器、完整原生GUI、长期性能或完整MVP。
