# 0.5.1 体验版验证

日期：2026-10-03。root本轮独立执行并读取以下最终结果；源码版本0.5.1，不迁移存储格式。✅ 有限鼠标体验及制品已核验；⛔ 总体MVP、全平台手感与完整安装流程尚未验收。

## 最终命令与包体

| root命令 | 实际结果 |
| --- | --- |
| `node --test --test-concurrency=1 tests/*.test.mjs` | 退出0，50项、0失败；完整TAP已读，保留ExperimentalWarning |
| `npm run build` | 退出0，最终CSS/原生RAF修复后完整TypeScript/Vite/PWA尾声 |
| `cargo check --manifest-path src-tauri/Cargo.toml --locked` | CARGO_BUILD_JOBS=1，退出0 |
| `cargo test --manifest-path src-tauri/Cargo.toml --locked` | CARGO_BUILD_JOBS=1，退出1；Windows os1455分页文件不足，见失败记录 |
| `npm run release:windows -- --ci` | CARGO_BUILD_JOBS=1，退出0，release编译3m20s及两安装器完成 |

最终入口gzip134.43kB、图26.18kB、CSS8.14kB、Worker原始3.67kB；PWA缓存7项528.47KiB。入口相对本轮87.56kB基线增加46.87kB（约45.77KiB），40KiB候选未达到。Motion同步加载；不以包体/构建证明GPU帧率、耗电或大图延迟。

## 实际UI

✅ IAB隔离5175预览，未覆盖用户原5173页或真实SQLite。最初7有效/1回收站合成数据，通过正常编辑器增加17条测试记录达到24条，另加1条ASCII编辑回归记录；本轮新增18条最终通过正常回收站可恢复清理，保留原7条。

- 鼠标真实抓手轻拉，释放后连续DOM变换约(10.97,9.14)→(5.55,4.63)→(2.10,1.75)→(0.61,0.51)→(0.14,0.12)px→none；没有打开编辑器或改变正文/日期，不改变排序。
- 同1280×720、页顶scrollY0首卡top378.1px，原479.5px，提前101.4px；浅深、网格/日期与390×844窄屏检查，无横向溢出，抓手40px，窄屏查找面板保持视口内；临时视口已恢复。
- 全部20个有效标签，搜索主题18并Enter精确筛到1卡；快捷打开按#主题18全局找到1条、无结果与Esc回搜索焦点正确。同名读书记录ArrowDown/CtrlEnter选到9/28的UUID...007，真实24条Worker更新后居中，清除阻挡筛选。
- 原生RAF修复后CtrlK→Enter显示编辑器并聚焦记录正文；逐步ASCII连续输入顺序、CtrlA粗体选区、保存展示、再次编辑回填、编辑中CtrlK不抢输入及CtrlEnter保存实际确认。深色编辑器可读，编辑时抓手aria-disabled=true。
- 12次真实Tab循环和ShiftTab始终位于QuickOpen内，Escape关闭后焦点回快速打开。
- 暂停图、旅行筛选2点、选择UUID...001、放大与详情定位后筛选/暂停/选中身份保持；开启动态、清筛选、适配全图可用。24条路径与最终7条展示分别留证据，不用小图同步路径替代Worker验收。

真实截图与媒体目录：`C:/Users/ZXL/.codex/visualizations/2026/10/02/01a0fc52-c082-7c00-b650-78e2c95b7cfa/qingjian-0.5.1-soft-20261003/`。

- `records-light-final.jpg`、`records-light.jpg`、`records-dark.jpg`、`records-mobile-dark.jpg`：当前实际页面，final为收尾新页恢复后的稳定截图。
- `soft-return.gif`：11张实际释放回弹帧，1265×712，1535315字节；只编码真实截图，未合成位移。
- `graph-motion.gif`：24张实际全页图帧，1264×880，4710155字节；约24.97秒真实采样，不是60fps录屏或GPU性能报告。
- `graph-located-stable-24.jpg`：实际24条Worker定位后的稳定画面；早期同名fresh截图曾是上一帧查找面板，不能作为定位证据。

## 新Windows制品

| 文件 | 字节数 | SHA256 |
| --- | ---: | --- |
| `src-tauri/target/release/qingjian.exe` | 13508608 | `2E4EA8F7D239DEA57ECDF135EBF4D39A00B5793E4CC071EC1B72D67063CF91B3` |
| `src-tauri/target/release/bundle/nsis/晴笺_0.5.1_x64-setup.exe` | 3718564 | `319DCCAF7FFF0069EBA5D50327A93047814010D884BE528944F306C154A1B8E3` |
| `src-tauri/target/release/bundle/msi/晴笺_0.5.1_x64_zh-CN.msi` | 5144576 | `D4C394F5788F70043C43B7FB0E23D7846207CAD455B6342051D081FB0BCDB675` |

程序与NSIS的PE FileVersion/ProductVersion均0.5.1；本机生成时间分别10:22:24，MSI为10:22:04（+08:00）。MSI没有PE版本字段，root另以WindowsInstaller只读打开其Property表，ProductVersion实际为0.5.1，命令退出0，没有执行安装。四新增Motion14.0.0包的MIT原文随前端dist/桌面静态文件保留；生成文件不纳入Git。

✅ 新程序实际Start-Process Hidden启动，自有PID168468，8秒后Responding=true、标题晴笺及非0窗口句柄；CloseMainWindow正常退出，命令退出0。此为进程/窗口烟测，不是原生触屏或安装验收。

✅ 启动前只读备份SQLite，启动关闭后再次只读逐行核对notes/transactions全部schema和字段；原3条notes/0条transactions完整一致。规范快照SHA256前后均`948bc77f536283a9e50317edf6226dfc61de213ab77e29db6c550516119f719f`。没有覆盖数据库或输出凭据/私密正文。

## 已见失败和未测

1. 真实快捷Enter曾关闭面板却不编辑，控制台Illegal invocation。原因为原生RAF当作helper对象方法调用的receiver错误；两处改为显式原生调用，最终类型/构建及原始UI症状复检通过。纯50测试没覆盖原生浏览器receiver，保留此失败。
2. Motion依赖优化期间Invalid hook call/useRef，完整reload恢复。早期批量中文键盘/选区观察出现异常并留下测试草稿，逐步ASCII编辑回归通过；该记录用实际编辑器回填原合成正文保存。不能据ASCII推断中文IME验收。
3. Rust test退出1：serde/tauri mmap报E0786、std metadata stub，明确os1455“页面文件太小”；当时只有923MiB可用虚拟内存。没有停止用户应用或修改系统分页设置，资源恢复后需重试。Rust check/release退出0不抹去测试失败；项目尚无Rust业务测试用例。
4. npm默认镜像audit 404退出1；显式npmjs audit退出1，既有5项依赖漏洞，非新Motion四包，没有顺手升级。原有PWA基线closeBundle慢告警、链接器/Node warning及工具错误保留于原始记录。
5. 两次文件选择器超时，65条JSON夹具未导入，改正常编辑器创建数据；不存在路径读取、一次错误选择器deadline和两次文档patch上下文不匹配均保留。文档patch失败没有部分写入，经实际上下文复读后正确补丁。
6. 最后追加焦点验证前，内置预览tab1出现“This page crashed”；崩溃原因尚未确定。当前data异常页导致工具阻止点击/导航，在同一浏览器创建允许localhost新页tab2后恢复，7条数据与UI正常，焦点回归实际通过。恢复不等于长期稳定性验收，此异常需要后续资源/运行证据定位。

⛔ 触屏正常implicit capture释放可能触发lostpointercapture立即复位，未实测其回弹顺序；中文IME、二指、系统reduce/后台/中途取消、原生缩放、GPU/耗电/大任务性能、安装卸载仍未验收。原有500条构图p95及包体候选未达项延续，不宣称零bug、总算法线性或完整MVP已验收。

完整本轮责任证据：[root独立记录](current/soft-interaction-workbench/root_observations.md)、[实施验证](current/soft-interaction-workbench/impl_validation.md)、[实施报告](current/soft-interaction-workbench/impl_report_r1.md)、[独立评审](current/soft-interaction-workbench/review_notes_impl_r1_1.md)。限定S1–S5/体验制品PASS不等于整体稳定性或MVP验收；历史[0.5.0验证](Release.Verification.0.5.0.md)保持，不以旧包或历史检查替代本轮结果。混合初始工作区保留，未把来源未知改动一并提交/推送。
