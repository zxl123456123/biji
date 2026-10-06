# 本轮实际界面验证记录

2026-10-03，coordinator 承接。当前处于实施阶段；以下仅为已经观察到的准备与基线，不代表新功能已通过。

## 修改前现场

- 重新打开 5173，页面包含 Ctrl K、复制与组合筛选，但仍为侧栏与单列记录；CSS 底色 `#f8f7f3`，实际 Canvas 可见且透明度 0.8。证据支持原设计过于保守，不能将问题归因于缓存。
- 修改前实际截图：`C:/Users/ZXL/.codex/visualizations/2026/10/02/01a0fc52-c082-7c00-b650-78e2c95b7cfa/qingjian-graph-before.jpg`。候选 HTML 不作为真实实现证据。
- root 本轮独立基线 `npm test` 退出 0：原 12 项、0 失败；`npm run build` 退出 0。这些只证明旧 0.4.0 基线。

## 隔离验证准备

- 单独的 5175 开发预览已启动；通过产品“导入”入口导入合成夹具，真实 DOM 为 7 条有效记录、1 条回收站记录。包含同标签、正文相近、孤立、同名不同 UUID；未修改 5173 的用户笔记。
- 临时 UI 夹具：`%TEMP%/qingjian-graph-ui-fixture-20261003.json`；压力夹具：`%TEMP%/qingjian-graph-perf-1000-20261003.json`，1,000 条、每条 500 个随机汉字、20 个标签。后者只测计算负载，不支持语义质量结论。
- 桌面库只读备份及语义行快照：`%TEMP%/qingjian-pre-graph-native-20261003/`，3 条笔记、0 条账目；行 JSON SHA256 `c5b32d9daf035826beea5293e4d768c97075544424d9724e4ce7b718b5bd7f2b`。新 EXE 启动前后比较仍待执行。

## 当前证据边界

- 原生 Canvas 拖拽/触屏、系统减弱或后台模拟、GPU 帧率、Windows IME/缩放没有可用的当前 UI 操作证据。实际能承接的是 DOM 动作、文字节点选择、缩放/适配按钮、编辑流程、布局与截图；纯几何/受控清理测试不能替代原生手势。
- 本轮 root 一次源码读取误用不存在的 `tsconfig.app.json`，命令退出 1；随后 `rg --files` 定位并完整读取实际 `tsconfig.json`，退出 0。这是读取路径错误，未将其误报为构建失败或通过。
- 两轮低层审查的 R1/R2 缺口及脚本误报保留在各自评审与修订记录中，不抹除第 1 轮 Gate-2 FAIL。

## r1 承接实测

- root 独立 `npm test` 退出 0：35 项、0 失败；`npm run build` 退出 0：初始 JS gzip 87.53KB，图 chunk 25.56KB，Worker 未压缩 3.57KB，CSS gzip 7.68KB。这证明纯合同和构建，不证明真实观感。
- 10 轮 Node 压力计时保留优化前后结果：随机汉字 500 条 p95 从 2620.79ms 降至 1265.95ms；1000 条从 7312.58ms 降至 4301.45ms。500≤300ms 候选未达到。自然中文重复模板 100/500/1000 条 p95 分别 31.14/360.24/1145.02ms。不得把模板结果泛化为语义或 UI 质量。
- 76 条随机汉字、UTF16 共39166，旧计划 80/40000 阈值会走同步，p95 114.05ms，超过主线程50ms候选；15 条7720字符17.60ms、23条11845字符22.76ms。请求 ReviewImpl 明确评判阈值计划缺口。
- r1 界面承接时隔离 IAB tab 5 显示 `This page crashed`，导航恢复及关闭均被 crash data URL 的浏览器策略阻断；同浏览器新建页等待 WebView attach 超时，原 tab4 CDP focus 命令也超时。原因尚不明，不能宣称是应用代码或缓存导致，也不能将此当作界面通过。使用同一浏览器的文档化恢复方式继续验收。
- root 一次误读 `impl_report.md` 退出1；定位正确 `impl_report_r1.md` 后完整读取退出0。
- root两次在评审文件尚未落盘时读取退出1；收到正式交接后完整读取正确report退出0。状态README补丁一次因无关上下文行不匹配被拒绝，未改文件；移除错误上下文重做。

新界面的观感、连续动画和交互结果待实际页面恢复后补充。

## Windows 验证故障

- root `cargo check --manifest-path src-tauri/Cargo.toml` 退出0，实际0.5.0检查完成。
- 首次 `cargo test` 退出1：E0463 无法找到tauri；独立 `cargo test -v` 退出1，进一步报E0786，mmap tauri rlib失败，系统 `os error 1455`（页面文件太小）。尚不能称Rust测试通过，也不删除构建缓存掩盖失败。
- `open_in_codex` 原浏览器恢复调用也返回Codex app tool request failed；原tab4 reload/CDP观察继续超时。此记录保留故障，不将HTTP200当UI证据。
- `cargo test --jobs 1`仍在2MB内存分配时报失败，最终退出1，rustc退出0xc0000409。系统剩余虚拟内存后降至303568KB。root关闭本轮专用Vite session2135（CtrlC退出1属主动停止），用户5173服务不变；没有修改页面文件、杀用户程序或清理Rust缓存。

## r2 承接

- 系统FreeVirtual恢复至7885424KB（约7.5GB），无需用户重复批准已有开发/构建。root重开自有5175 Vite session9593；IAB原tab4仍CDP focus超时、同浏览器新页仍WebView attach超时。内存恢复没有自动恢复浏览器连接，UI仍不声称通过。
- root独立串行全量 `node --test --test-concurrency=1 tests/*.test.mjs` 退出0：41项、0失败；`npm run build`退出0。初始JS gzip87.56KB，图25.65KB，Worker未压缩3.67KB，CSS7.68KB；初始加图相对S1至少+27.51KB，Worker另计，未达25KB候选。
- root同一500随机汉字夹具10轮，100/500/1000节点p95=110.97/881.34/2188.19ms，完整节点/边集合断言通过。500仍未达300ms候选。7条小样例仍为7节点/3边，正文边分数0.9154030619445876及标签/独立组不变。这是纯模型计时，不是Worker等待/主线程/GPU。
- r2首轮串行41项40过1失败及Node capture归一化修复完整保留在impl_report_r2/validation；root最终看到的独立41项为全部通过，不抹掉先前失败。评分插桩100/200条实际访问1000/2000次，限于评分段，不声称全算法线性。

## r2 root Windows承接与浏览器缺口

- root内存恢复后`cargo test --manifest-path src-tauri/Cargo.toml --jobs 1`退出0，lib/main/doc均0用例；链接器warning保留。随后子进程CARGO_BUILD_JOBS=1正式`npm run release:windows -- --ci`退出0，前端build/PWA、Rust release 2分16秒、WiX和NSIS完整输出已读，已生成真实0.5.0三个制品，不再使用0.4.0作为本轮成果。
- root制品元数据首查末尾误带不存在命令，退出1；删除错误命令后重新完整核验退出0，版本均0.5.0，MZ/PE/x64断言退出0。制品未因读取失败被修改。一次TEMP文件搜索遇拒绝访问错误5，后续同命令读取技能成功，不据组合退出0判断搜索成功。
- root只读原库新备份/完整schema和数据快照，退出0：3条notes/0条transactions，与pre-graph历史只读库相同。新release Hidden运行8秒响应、标题晴笺、句柄非0，正常关闭退出0；随后完整结构与字段逐行相同，退出0。备份在`%TEMP%/qingjian-native-0.5-20261003-r2-v1/`。详尽哈希和制品大小见[0.5.0验证](../../Release.Verification.0.5.0.md)。不把响应进程称作实际原生UI已观察。
- root独立运行历史夹具来源检查退出0：固定r1源SHA与4组完整输出一致；独立src逐文件对比退出0，仅计划四源不同。源码边界与CPU测试证据不取代GUI。
- 内存恢复后第二次open_in_codex仍失败；遵循同一浏览器的文档化恢复，最后新建空白页也WebView attach超时。没有更换控制机制或绕过crash URL策略。已请求用户重开右侧5173页面，未收到恢复结果；此时仍无新UI截图、Worker实际加载、连续动画或图编辑手测证据。

新体验版已交付构建证据，整体MVP仍待真实页面验收。旧库保持只覆盖本机3条笔记，未进行安装/卸载、凭据/AI请求、原生IME/缩放、GPU/触屏/系统减弱/后台模拟。

收尾：root仅停止自己的5175 session9593，CtrlC退出1为主动停止，日志仅打包codegen文件导致的开发reload，不是release失败；原5173监听164808保持。原生校验进程已正常退出，临时浏览器viewport已reset、预览页保留。8份当前文档24个相对链接/版本/D3锁定校验退出0；diff-check退出0带LF→CRLF提示，三个制品与dist被Git ignore。

## 后续实际效果图与动图（2026-10-03）

- 用户请求：“效果如何，来张图动图之类的”。本次只捕获真实界面和同步当前事实，不改产品源码、编辑笔记、访问原库或调用AI。
- 5173探测无监听（静默查询退出1）；root重开专用5175 session72325，Vite ready。IAB初始无tab，同浏览器新页能响应，恢复原因没有证据，不归因于缓存或声称连接代码已修复。隔离域中保留原7有效/1回收站合成样例，没有替换用户域或真实库。
- 实际三列网格与7条计数，切日期后6组日期、10月3日组2条，回到网格仍7条。真实浅深关联图均7点3边；选择图谱设计讨论显示正文/编辑入口与92%词面推断依据，再清选择。未把展示编辑入口称作保存回归已测。
- 默认viewport1265×712，不改尺寸；完整截图包括网格/日期、浅深图。连续80次CUA截图无中间UI动作，约4.97秒；JPEG为真实应用画面，编码保持顺序/采样间隔、无插帧，GIF为80个不同解码帧/4.9秒/2086231字节，SHA256=`22b9a25c059e660e4b3dff7d517157f04b113423de66723fa0a8d50eb0379ee1`；WebP80帧/1201252字节。编码/解码断言退出0，实际查看静帧；采样率不是GPU或应用帧率。
- 媒体目录：`C:/Users/ZXL/.codex/visualizations/2026/10/02/01a0fc52-c082-7c00-b650-78e2c95b7cfa/qingjian-0.5-effects-20261003/`，有records-light.jpg、records-by-date.jpg、graph-light.jpg、graph-dark.jpg、graph-motion.gif、graph-motion.webp及原JPEG帧/采样manifest/解码结果。保留浅色网格tab和预览服务作为用户效果入口。
- 工具失败：body按Control+End超时，随后读取当前DOM、点击Canvas自动滚入可见区域；不是应用功能错误。本机默认Python无PIL，退出1；改用已配置工作区Python/Pillow12.3，未安装依赖。首版GIF量化损失光点颜色，原截图与解码像素对比定位后更换颜色调色板并另提供WebP；最终编码和节点颜色核验退出0。ffmpeg未安装，未调用。旧浏览器/Rust和候选预算失败仍保留。
- 这次证据仅覆盖示例的实际外观、切换、选择和连续效果；大任务Worker、完整编辑/筛选/建删恢复、窄屏/原生/后台和GPU仍需后续承接，不归档、不混合提交初始未知改动。
