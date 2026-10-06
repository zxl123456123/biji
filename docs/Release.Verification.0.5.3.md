# 0.5.3 阅读与卡片体验版验证

实施/构建日期：2026-10-03，收尾日期：2026-10-04，Windows x64。用户要求继续优化操作体验与页面排版，且此前已授权开发与生成EXE。本轮限定记录展示和已有控件反馈，不变更存储、编辑器规则或图算法；旧正式feature、失败与未测保持。

## 最终改动

✅ 新增会话内阅读排版；网格保留七行视觉预览，阅读/日期单列展开全文、最大820px行宽，日期组显示年份和本批数量。卡片按状态/日期、正文、标签/横向动作分层，旧回调/ARIA与独立抓手保持；排版/筛选复用SoftButton，去掉重复选中标签提示。当前行为与官方参考取舍见[工作台排版](Workbench.Layout.md)。

与本轮before基线的46项文件比对，只有5项前端与5项自身版本元数据改变，文本差分+64/-31，其余36项（含全部测试）字节相同。依赖、identifier、CSP及Rust业务未改。严格字节审计另发现styles.css原414行/当前437行的相同窄屏网格规则由CRLF变LF，只有一行额外换行差分，无额外语义变化；不称全文件换行字节完全保持。

最终NotesView SHA256：`A2468F503548858CDFBDE6ABD33C1EF3716F0997D521A70FADABE9D9D15471F1`；styles：`DB05DB2B5374B849CF82CB8287EFFDB221CDD2858BC572F9BAA3E70735F5FF31`。本轮清单/完整日志/实际差分/独立审查存于`C:/Users/ZXL/AppData/Local/Temp/qingjian-reading-layout-20261003/`，该临时位置不作为长期规范入口。

## Root独立自动验证

以下命令在最终冻结源码上本轮执行，完整输出与退出码已读，不用子代理结果代替root验证。

| 命令 | 结果 | 实际边界 |
| --- | --- | --- |
| `npm test -- --test-concurrency=1` | exit0，69/69，fail/cancelled/skipped0 | 原完整纯函数/格式/交互合同集合；Node ExperimentalWarning保留，不能替代真实UI |
| `npm run build` | exit0，tsc/Vite/PWA完成 | 2473模块；不是GPU或帧率测试 |
| `$env:CARGO_BUILD_JOBS='1'; npm run release:windows -- --ci` | exit0，Rust release、MSI/NSIS完成 | linker_messages warning保留；不等于安装/完整原生GUI验收 |
| 最终清单/SHA/版本审计 | exit0，10允许文件变化，其余36字节相同，0.5.3自身版本 | 严格EOL诊断的失败与一行额外字节差分如下保留 |

Web入口`index-DqYhdgUf.js`430.81kB/gzip138.58kB；CSS`index-CkusHaiI.css`40.31/gzip8.72；Graph75.59/gzip26.17；Worker7.03；PWA7项546.79KiB。相对0.5.2入口gzip138.44与CSS8.36，仅报告体积变化，不声称总体性能预算通过。Rust业务本轮未改，未另跑cargo check/test；项目仍无Rust业务测试用例，0.5.2的check/test是历史证据。

## 真实浏览器验收

✅ 同一IAB有效tab2访问当前5175服务并重新加载最终模块：

- 1280px实际三列卡宽389.6px，1000px两列453.4px，390px单列343.2px，无横向溢出；操作始终可见且33×33px。阅读卡宽820/正文766.4，段落15px、行高2；日期为单列，年份/本批数量可读，正文h2保持20px。
- 仅创建唯一测试记录：真实h2、中文/英文斜体、连续输入、12段与末尾标记。实际保存正文468字符，CtrlEnter保存；网格预览clientHeight229/scrollHeight634，阅读614/614全文展开。复制严格等于完整预览innerText，含第12段和全文末尾，不含标签元数据；独立编辑入口回填h2/EM/全文末尾，深色390px编辑器无横溢。
- 图中按实际UUID选择新记录，9节点/3条关系，详情同一格式正文；旧图算法未改。精确标签+正文查询只返回样例一条，旁边重复active-filter为0；完成→未完成筛选为空，清除回到全部，只恢复自建样例原未完成状态。
- 鼠标独立抓手轻拉10/8px后释放，观测回弹中间matrix位移0.198689/0.158951、正文/状态保持；随后导航触发既有卸载取消，不能把此观测称为新全程自然回弹或GPU测量。关闭动态后抓手aria-disabled、transform none、按钮过渡0s，排版切换仍有效；浅色/动态已恢复。
- 自建样例软删除后即时撤销恢复；回收站恢复有效；首次永久删除仅显示确认入口、样例仍存在，没有确认永久删除。最后样例仅进入可恢复回收站。原8条活动记录逐条比较previewHTML、标签/日期、完成状态严格相同。

最后重置临时viewport覆盖，真实恢复1000×800；页面为浅色网格、8条活动记录、无横向溢出，已标记保留。本轮截图目录：`C:/Users/ZXL/.codex/visualizations/2026/10/02/01a0fc52-c082-7c00-b650-78e2c95b7cfa/qingjian-reading-layout-20261003/`，含before、grid-light-1280、reading-light-1280、date-light-1280、grid-light-long-390、editor-dark-390与final-default.jpg；原/最终UI快照也在该目录。截图不作为动态性能证明。

## Windows新制品与本机数据

✅ root读取最终构建exit0（工具chunk7060a9），版本/哈希命令exit0（010f53）：

| 制品 | 字节 | 版本证据 | SHA256 |
| --- | ---: | --- | --- |
| `src-tauri/target/release/qingjian.exe` | 13512704 | FileVersion/ProductVersion0.5.3 | `9A94CD651E85A21E5D174A97EF9BEAA3244812799ECA11F314C1F727DFDD41D8` |
| `src-tauri/target/release/bundle/nsis/晴笺_0.5.3_x64-setup.exe` | 3726712 | FileVersion/ProductVersion0.5.3 | `41E166457A0C051B1D07F43EDF693B7A1A78C68D20C0D1EE6C7A2EE17F42A5A3` |
| `src-tauri/target/release/bundle/msi/晴笺_0.5.3_x64_zh-CN.msi` | 5152768 | WindowsInstaller只读Property ProductVersion0.5.3 | `9905D26FB6179D9C1E545D504492AC01ABC501374F1D9E0FB63FDAD9E62549E5` |

程序与NSIS修改时间2026-10-03 23:50:20+08:00，MSI23:50:06+08:00。制品为忽略的本机构建产物，不提交。

只启动本轮新EXE自建PID273332（Hidden），10秒后alive/Responding均true，随后只受控终止该自有进程（exitCode -1）；此项不是正常关闭或完整原生UI测试。命令整体exit0（03e65e）。原数据库仅以SQLite mode=ro读取，前后notes3/transactions0，结构+所有记录字段严格相同，规范化快照SHA256均`948bc77f536283a9e50317edf6226dfc61de213ab77e29db6c550516119f719f`；原库未覆盖或恢复。快照与安全副本只保留TEMP，不输出正文或凭据。

## 已见失败与限制

- 合并读取输出被截断，随后实际合同/源码分段完整读取；猜测的两处代码/文档路径不存在，rg定位实际入口。收尾猜测的reviewer-release-docs日志名不存在、读取exit1，改按已读报告的实际artifact-readonly/docs-native-snapshot日志复核。合并读取最后exit0曾掩盖前项读取错误，不作为已读证据。
- 初始页仍持有旧模块，但5175无listener且诊断exit1；root启动当前服务再reload后才验新源码。保留原错误tab1，不推断更早预览崩溃原因。
- 首实现日期遗漏年份、网格去掉裁切，root预读要求保留旧行为，最终修正后才重新验证。临时70项重复测试已仅撤销本轮自增行，最终69项/全部测试字节相同；首Web build的PWA closeBundle28.4s诊断保留，不据后次耗时称性能改善。
- 自动化全局“阅读”匹配原阅读标签、“清除筛选”匹配两个入口，改为已知容器定位；长批按键在末尾长英文词处工具超时，先检查已输入部分再以短调用补末尾，实际回归仅基于最终468字符。没有把工具超时直接定位为应用bug。
- 深色诊断只选i节点为空导致TypeError，实际EM以em,i复查italic；截图疑似文字辨认与随后DOM不一致，未据此改原记录。computedStyle镜像的webkitLineClamp为空，不把空值作为七行数值证明；裁切视觉、最终源码与完整复制分别记录。
- root首次PowerShell版本审计exit1，因为package-lock空键需ConvertFrom-Json -AsHashtable；修正诊断重新审计exit0，未改源码。reviewer严格EOL诊断exit1，定位为上述单行CRLF→LF，精确审计结果保留。
- 原生IME、触屏/读屏、系统reduce/后台取消、Windows100/125/150%缩放、安装卸载、GPU/内存/耗电和长期稳定性未测；60+加载和大量长记录本轮无真实UI压力验收。旧0.5.0的500条p95约881ms未达300ms候选，0.5.1入口增量46.87kB未达40KiB候选仍保留。完整MVP不据本轮构建或截图视为全部验收。
- 原JSON损坏/导入替换、桌面空库/双保存议题与本轮无关，未改。初始工作区有大量来源未确认的混合改动，未混合提交或推送，历史正式文档不归档。

✅ 独立reading_layout_review最终PASS：实际源码差分、7项当前文档、原8条UI快照、三项新制品字节/SHA及只读SQLite快照保持均已复核；root已读取完整报告、补充报告与实际日志/退出码，并自行重跑最终SHA/精确EOL与文档链接审计exit0。git diff --check exit0，保留Git的LF/CRLF提示。仅限本轮展示与体验制品，不代表旧正式验收、完整原生UI或性能预算关闭。提交建议：`feat(notes): add reading layout and clearer card actions`。
