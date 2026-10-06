# 晴笺 0.5.0 体验版验证

验证日期：2026-10-03，root实际执行。✅ 已生成新Windows制品并核验启动/原库；⛔ 真实新界面、连续动画与完整MVP验收尚缺证据，不作为已验收正式版。

## 选型与源码

GitHub五类成熟方案及当前采用D3 + Canvas的取舍见[关联图架构](Note.Graph.md)。原React/Tauri/SQLite保存边界保持，本轮没有新增数据库表或改变备份version=1。

✅ root完整读[r2实施评审](current/luminous-note-map/review_notes_impl_r2_1.md)，协议/业务PASS限于三个局部源码补丁；总体MVP未验证。root逐文件哈希复核仅四个生产源不同于只读r1快照：NoteGraph、graphGeometry、noteGraphModel、useNoteGraph。root独立历史夹具来源检查退出0：r1源码SHA256为`02279cae3e067a6bed927b68a28a3df3a97ce04ee59f5c140c86f7536da962fd`，4组完整历史模型相等。

## root独立命令证据

- ✅ `node --test --test-concurrency=1 tests/*.test.mjs`退出0：41项、0失败，完整TAP已读；包含原35项与新阈值/平移清理/等价和评分检查。
- ✅ `npm run build`退出0；发布前beforeBuildCommand再次构建退出0。2054模块，主JS gzip87.56KB，按需图25.65KB，CSS7.68KB，Worker未压缩3.67KB，PWA 7项/384.00KiB。
- ✅ `cargo check --manifest-path src-tauri/Cargo.toml`退出0。内存恢复后`cargo test --manifest-path src-tauri/Cargo.toml --jobs 1`退出0，lib/main/doc均0用例，有Windows链接器创建库/对象的warning；不代表数据库/原生界面自动测试覆盖。
- ✅ 子进程`CARGO_BUILD_JOBS=1`，执行`npm run release:windows -- --ci`退出0，完整输出已读。Rust release优化构建2分16秒，WiX candle/light与NSIS makensis生成两个bundle；仅保留链接器warning。恢复原环境变量，未安装NSIS/MSI、未修改页面文件或清理Rust缓存。

## 新制品

| 制品（仓库根目录下） | 字节 | SHA256 |
| --- | ---: | --- |
| src-tauri/target/release/qingjian.exe | 13463552 | 4D6B47CDCFD15B97F4B2A9E255109E867144DDBDFF28C8690D1BFCC67FFF9BD4 |
| src-tauri/target/release/bundle/nsis/晴笺_0.5.0_x64-setup.exe | 3672551 | 130E61DD6CBF59AAFC53B59140F4D183AB97EB946985E0CA5BF6E6BB9DB56A04 |
| src-tauri/target/release/bundle/msi/晴笺_0.5.0_x64_zh-CN.msi | 5099520 | CFF3D985C7DF31438D34E2AB2D929238D641EF39751142E8E4136BAA6CC60607 |

✅ root制品核验命令最终退出0。程序与安装EXE FileVersion/ProductVersion均0.5.0，写入2026-10-03 02:23:23，MSI写入02:23:09。程序MZ/PE签名与machine=0x8664检查退出0。旧0.4安装包只作历史，程序本体路径现已为0.5。

## 原生启动与数据

✅ root启动前只读SQLite备份/全表结构与行快照到`%TEMP%/qingjian-native-0.5-20261003-r2-v1/`，退出0；3条notes、0条transactions，与本轮pre-graph只读库完全相同。未打印正文、读取凭据或恢复/覆盖原库。

✅ root仅启动自己的新release进程，Hidden运行8秒后Responding=true、标题晴笺、窗口句柄非0；CloseMainWindow=true，5秒内正常退出0。该检查退出0，未冒称观察了窗口里的控件或图像。

✅ 启动后只读比较notes/transactions完整schema和所有字段逐行相同，退出0；前后规范化JSON SHA256同为`4756fe8857b724c585bb911a85732fe5fc1e81bcfdd9d208d19938933d4202ae`。这只验证本机当前8列库保持；没有新增迁移或任意损坏库保证。

## 性能、故障与未验收

- ⛔ 同一1000条×500随机汉字夹具，root预热后10次纯Node构图，100/500/1000节点p95为110.97/881.34/2188.19ms。500条相对r1的1265.95ms下降，但未达300ms候选。主JS加图相对S1增量至少27.51KB gzip，Worker另计，未达25KB候选。新同步边界24条/8000字符有路由测试，不保证任意输入/设备都<50ms；评分有界不代表总算法线性。
- ⛔ IAB测试页crash、原页CDP focus/reload超时、同浏览器新页/空白页WebView attach超时，`open_in_codex`两次失败。系统虚拟内存从不足0.8GB恢复约7.5GB后连接仍失败；已请求用户重开面板，未收到恢复结果。没有新界面截图，不用旧0.4截图、HTTP200、纯函数或启动响应代替真实UI/Worker/GPU验收。
- ⛔ 图选择/编辑/筛选/建删恢复、真实Worker加载、多帧持续、浅深/宽窄/日期布局与原编辑回归未完成本轮手测；原生Canvas drag/pinch、Windows缩放/IME、系统减弱/后台、GPU/耗电、安装/卸载、AI凭据/网络亦未验证。清单见[测试说明](Release.Testing.md)。
- 历史LW Gate失败、r1构建/工具与预算失败、r2首次41项中1项受控capture夹具失败及修正均保留在[承接记录](current/luminous-note-map/ui-observations.md)与对应报告。root Rust先后E0463、E0786/mmap os1455、2MB分配失败三个退出1，也保留；恢复内存后的新退出0不抹去历史故障。
- 本轮root一次TEMP文件搜索遇权限错误5；读取技能在同命令后成功，未将组合退出0当搜索成功。制品元数据首查末尾误带不存在的命令，退出1；移除错误后重新完整核验退出0，制品未被修改。这些是工具操作错误。
- Git初始App/store/styles及.serena工作持续保留，来源混合发布未获确认；未提交/推送源码或文档。生成物按项目ignore，不入Git。规划目录保持current，等待真正的界面验收。
- ✅ root收尾8份文档24个相对链接、产品版本和4个D3锁定版本检查退出0；`git diff --check`退出0，仅LF→CRLF提示；三个制品和dist均被Git ignore。主代理专用5175服务已CtrlC停止（退出1为主动终止），原5173监听/进程164808保留；新原生进程已正常退出，浏览器临时viewport覆盖已reset，用户预览页已保留。

## 后续效果图承接（2026-10-03）

✅ 用户请求图/动图后，同一IAB新页能响应，先前连接失败保留为历史。root重开隔离5175预览，实际7条示例显示三列网格、日期分组、浅深图的7点3边、文字选择及92%词面依据。截图与80帧4.9秒GIF/WebP已导出/解码核验，详见[承接记录](current/luminous-note-map/ui-observations.md)。没有修改产品源码或用户笔记，没有借截图更新旧构建/测试结论；完整编辑/筛选/建删恢复、大任务Worker、窄屏/原生和GPU仍未验证，整体MVP不据此宣称验收。
