# 0.6.0 空间与宠物体验版验证

日期：2026-10-04。✅ 本轮已实现并构建可验收体验版；⛔ 不据此关闭完整 MVP、全部硬件或原生 GUI 验收。当前行为见 [空间与宠物](Spatial.Experience.md)。

## 范围与身份

用户纠正为动态宠物，并授权自主完成；机器人/第一人称漫游退出范围，3D记录空间当时继续保留。正式 Gate2 首轮 FAIL 的搜索/标签留页遗漏已修订，r2 PASS 后实施。S1地图、S2宠物、S3宿主分别实施，根独立验证；完整报告现保留在 `docs/archive/2026-10-06/spatial-note-map/`，作为 0.6.0 历史证据。

差量基线是 TEMP 的 `before/` 与同级 `manifest.json` 对应89文件，而非混合 Git HEAD。最终 App SHA256 为 `02BF0FDAFFCCBC74E836385A5FFCF9AE48E2FCE702E816F4B25B9366B24F4DCD`；65项源冻结清单 `s3-source-sha-r4.json` SHA为 `6A2434DD7373E09C14577B674044FC3B77D9FA4726C39B78941448357BFBDC81`。根终检另生成 `root-source-final.json`。业务模型、SQLite/备份/保存、编辑器、排序及旧图保持基线；既有修改及未跟踪文件不被重置、整包提交或推送。

## 根独立命令

原始日志目录：`C:/Users/ZXL/AppData/Local/Temp/qingjian-spatial-20261004/`。完整 stdout/stderr 和工具退出码均已读取，命令未以管道收尾。

| 命令 | 结果 | 证据 / 工具输出 |
| --- | --- | --- |
| `npm test`，最后门控后 | ✅ exit0；105/105，fail/cancel/skip/todo均0 | `root-test-r4.log`，5bd21c |
| `npm run build`，同一源码 | ✅ exit0，tsc/Vite/PWA | `root-build-r4.log`，a4997a |
| `CARGO_BUILD_JOBS=1 npm run release:windows -- --ci`，最后再次构建 | ✅ exit0，optimized3分54秒，两安装包；包含同源Web构建 | `root-release-final.log/.exit`，72a403 |
| 原生版本/哈希/自建进程证明 | ✅ exit0；3制品0.6.0；自建PID25180十秒存活并响应，再受控终止exit-1 | `root-native-artifacts.json`，e5a568；不是正常关闭或原生GUI验收 |
| 真实SQLite只读前后核验 | ✅ notes3/transactions0，两表schema和所有字段/行严格相同，无迁移 | `native-before-report.json`、`native-after-report.json`，f7c73a/e5a568 |
| 89基线保护比对 | ✅ 受保护模块零变化；最终文档及源差量见根终检 | `root-baseline-comparison.json`、`root-source-final.json` |

最终产物：

| 路径（均位于 src-tauri/target/release） | bytes | SHA256 |
| --- | --- | --- |
| `qingjian.exe` | 13693440 | `6B447B51FE797BB5AAFD7325C529EF7E0165CA6B59699FAB3F95926F8FB73533` |
| `bundle/nsis/晴笺_0.6.0_x64-setup.exe` | 3900712 | `95FFC68EA231DE76EAA59368800A7B307D992DCD0F181A684D0886E4CA6EC884` |
| `bundle/msi/晴笺_0.6.0_x64_zh-CN.msi` | 5328896 | `98BC59838230DE629D9B1ABE98E05FF77BA81CFDC8F9E5D6211B3FC920C3F203` |

真实库规范JSON SHA为 `3460a09a76d0d8b4d737cee2c5fe9cbce0f02705b14b8950e7b2986b56396e48`，没有输出私有正文或上传数据库。只启动根自建新进程、未运行安装器、未处理用户原有进程。

## 实际浏览器验收

✅ 隔离生产预览5185确认加载最后的 `index-SaqF4g7p.js`，与最终Web/Windows构建一致，使用合成记录；原用户5175未导入夹具或编辑记录。其原8张卡片的正文HTML与完成/置顶控件状态，前后只读比较严格相同（`root-user-display.json`）；该DOM证明不冒充全部持久字段证明。

- 25活动/1回收记录：星图25节点/48关联，真实画布有透视节点与流光。文字选择包含独立节点；点击实际蓝色独立节点后 UUID为`spatial-single`，正文/创建日期/0条依据对应，拖动旋转不误选。放大确实变大，缩小、方向按钮与适配可操作；暂停后仍能选择、旋转和编辑。
- 从详情打开原编辑器，Ctrl+Enter保存回到空间；时间层搜索「沿途」6条，标签「工作」+未完成4条，标签选择/清除均保持空间及时间模式。弹层期间空间控件禁用。
- 最后源码500和1000活动记录：501/1001个option含占位，分别1292/2792条可见关联；文字可选末条UUID `spatial-scale-0499/0999`，时间层画布ready，所有记录保留。空备份呈现空空间提示，随后恢复25条合成样本。
- 宠物实际轻触/键盘Enter招呼、休息/唤醒；关闭全局动态后data-animate=false，仍可拖动和招呼。拖动270×140后位置改变、状态idle，没有误招呼；390px缩屏后完整控件夹限且休息状态保留，编辑弹层隐藏小宠物。收起后刷新仍隐藏，设置恢复可用。大角色动态展示可招呼和休息，空间不出现重复小浮层。
- 深色390×844记录/空间无页面横溢（document scrollWidth375、innerWidth390），空间单列；主导航在自身区域滚动。1280×720和1280×960也已观察。连续8轮「星图→时间→宠物」后，本次隔离页warn/error为空；不外推长期资源结果。
- Ctrl K开快开，查询独立并Ctrl Enter后原二维关联图实际选择`spatial-single`；原2D显示25节点/48关联。首次过早读取只到lazy加载，随后待真实显示复验，不据中间态声称成功。

真实媒体保存在 `C:/Users/ZXL/.codex/visualizations/2026/10/02/01a0fc52-c082-7c00-b650-78e2c95b7cfa/qingjian-spatial-20261004/`：`space-dark.jpg/time-dark.jpg/space-view.jpg/pet-dark.jpg`。`space-live.gif`为40个实际不同帧、约3.77秒；`pet-live.gif`为48个实际不同帧、约4.48秒，包含呼吸/招呼/休息。帧顺序及采集间隔保留，原JPEG仍在；GIF编码为960×720，不是生成概念图、30fps测试或动作量承诺。命令3027eb exit0，`media-proof.json`含hash/bytes。

## 包体与规模测量

最终main564.92/gzip181.81kB，空间579.83/gzip146.48kB，主CSS47.56/gzip10.19kB，空间CSS9.18/gzip2.37kB；PWA precache10项1260.42KiB生成成功。保留两个>500kB chunk警告、Node实验性类型擦除提示和Rust linker_messages警告。没有提高警告阈值或缓存上限，PWA可能预缓存空间资源，lazy仅指运行时加载/执行。

✅ 根单次Node合成测量ee9182 exit0：500条构关系96.66ms，星图/时间布局5.99/2.22ms；1000条157.98ms，布局5.47/4.19ms，断言全部坐标有限、UUID完整、输入不变。原始 `root-layout-benchmark.json` 保留；不含DOM、GPU、网络，不是p95。实例批绘、30绘制/秒与DPR/像素/光点上限只是代码预算。

## 已见失败与恢复

1. 首Gate2遗漏空间query/tag留页，FAIL报告保留，补明后r2 PASS；不是静默跳过。
2. 实际1280×720设置页宠物挡住导入，按名称点击聚焦宠物、filechooser等候3秒失败；收起后同操作成功。首次修为设置及space/pet隐藏，继而发现空间select仍被覆盖，最后修为整个space和settings隐藏。5185默认显示偏好开启时实际导入成功、空间select无遮挡；第一份3分20秒Windows候选不作为最终包，最后重新测试/构建/打包。
3. 开发HMR/依赖优化期间space回all，未见应用console错误；不确定因果。首次生产5183reload仍加载旧SW缓存的`index-aLFjAUI4.js`，未将其用于最终源验收；改独立新origin5185且读实际script核验。既有PWA更新接管体验未改、未全面验收，不以刷新一次保证升级。
4. 初稿镜头放大方向、首ready适配、失焦首帧与StrictMode主动forceContextLoss问题已按原合同修正，各子报告保留；真实context-loss故障仍未注入。
5. 系统Python无PIL（c4d855 exit1），改使用已配置捆绑Python编码exit0，未安装系统包。取证曾有空JSON键解析、Array.Sort、GBK字符编码失败、错误路径、输出截断、CUA旧绑定/旧tab、首坐标未命中以及首次文档patch锚点不匹配（未写入）；后续正确路径/完整重读/实际UUID命中证据分别保留于子报告及工具历史，不把取证失败当测试失败，也不省略。

## 审查与未测

✅ fresh独立 Review(Impl) 的协议/业务结论均PASS，见[实施审查](archive/2026-10-06/spatial-note-map/review_notes_impl_1.md)。root全文读取最终报告（8f3164 exit0，5301 tokens，无截断），核对必填字段、65项源冻结与3制品及当时文档；只放行本轮有界0.6.0交付，不代表用户验收或关闭完整MVP。提交审查时的根报告保持原样，当前状态另按实际结论更新。

⛔ 安装/卸载、正常原生关闭、完整原生GUI、系统减少动态/真实失焦后台中断/多指及取消全部组合、无WebGL/真实context-loss、lazy网络失败、IME/触屏/读屏/Windows缩放/弱GPU/长期内存耗电与PWA离线更新未全面实测。对应实现和纯政策测试不能替代这些现场项；当前提供可验收体验包。
