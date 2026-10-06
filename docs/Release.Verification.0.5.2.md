# 0.5.2 排版体验版验证

记录日期：2026-10-03。源码元数据为0.5.2；最终r4源码已独立执行69项/Web构建及实际编辑回归，Windows新制品已核验，fresh[源码审查](current/composer-writing-modes/review_notes_impl_r4_1.md)为PASS/PASS，root全文复核必填字段。本文将当前证据与未测项分开，不能用旧候选安装包代替最终结果。

## 本轮能力

✅ 正文/标题/小标题、粗体/斜体、两种列表、引用、行内代码共9项工具；全新空白提供日记、会议纪要、阅读随记3个起笔模板。恢复草稿和编辑旧记录不出现覆盖模板入口。

✅ 中英斜体实际可见；草稿状态、静态快捷键与主要保存动作分开，浅深主题和窄屏工具换行。笔记继续保存有限纯文本，不持久化任意HTML、不改SQLite/备份schema，不新增编辑器依赖。

## 自动与实际编辑证据

✅ root最终r4独立执行全量 `npm test -- --test-concurrency=1`：69项，fail/cancel/skip均0，exit0；Web build exit0。入口index-Dktrhydh.js gzip138.44kB、CSS8.36kB、图26.17kB、Worker7.03kB；PWA7项544.21KiB。Node类型擦除ExperimentalWarning保留。此前r3的65项绿色未覆盖空标题缺陷，不能代替最终r4结果。

✅ root本轮 `cargo check` 与 `cargo test --manifest-path src-tauri/Cargo.toml --locked --jobs 1` 均exit0。lib/main/doc三个目标均0测试，保留linker_messages warning；没有Rust业务/迁移自动化覆盖。

✅ 浏览器实际检查连续中英输入、两种粗斜组合、列表末尾/中间输入与Enter续项、原生撤销重做、引用回填状态与退出、引用转标题两次撤销、格式后立即快捷保存；卡片、图详情和编辑回填保持格式。代码中的标签符号、反引号、HTML样文字和尾反斜杠作为字面量保留，跨段代码工具禁用。

✅ 三模板、模板一次撤销、草稿关闭恢复、日期/标签/完成状态保持；浅深主题和实际CSS390无水平溢出，CtrlK不抢编辑器，Esc还焦点。本轮隔离样例使用可恢复回收站，首次永久删除只显示确认提示，没有执行永久删除。8条原有活动记录的完整可见textContent与完成状态逐条严格相同。

✅ r3原标签引用反例按生产helpers复验：只有标签的引用关闭恢复/保存无裸标记，标签仍在；首/中/尾标签与代码混合在编辑、保存、图详情、回填一致。详细证据在[本轮验证流水](current/composer-writing-modes/verification.md)。

✅ r4当前源码页真实h2/br与h3/br清空→关闭→新建，正文空、3模板、保存禁用；阅读模板全部清空同样正确。标签标题与有字相邻段落恢复/保存无裸前缀，旅行标签保持。有字h2+h3/中英斜体即时、卡片、图详情、回填同HTML/文字；R1列表末尾X/Enter续项、R2阅读草稿与R3引用标签短例保持。新隔离记录可恢复清理后原8条textContent/完成状态严格相同。

## 已见失败与补修

- 初始粗斜组合泄露标记、尾反斜杠兼容断言、TS2339和黄金夹具失败，均保留原实施报告及退出码，随后局部修复。纯测试绿色曾漏掉真实列表命令替换Text后光标回开头；生产DOM实测发现后限定相同文字/所有权恢复，原症状和原生撤销重做复测。
- 空引用、引用回填状态/正文退出、引用转标题仍嵌套，以及仅含普通标签的引用经规范化后留下裸`>`，依次阻断发布并补修。r3三项黄金先红，第一次补后行尾空格夹具仍红，按原helper规则修夹具后绿色；未删除失败记录。
- r3最后真实清空标题后关闭→新建恢复`#`，模板消失；已用独立单h2/br短例复现。r4补前又实测仅含`#旅行`的h2关闭恢复裸`#`和旅行chip，说明资格需沿现标签规范化闭环。r4新增有效红测17项14pass/3fail exit1；最小guard后17/17绿色，root上述当前模块原症状得到正确结果。附加兼容诊断将换行误当旅行标签的夹具exit1，修诊断期望后exit0，生产代码未因诊断失败放宽。
- r2低并行Windows构建exit0，但包含后发现的引用缺陷，候选包失效；r3再构建exit1 E0460，`qingjian_lib`与`windows_sys`旧编译哈希冲突。root读取本机rustc/Cargo解释，验证target绝对路径后仅包级release清缓存exit0（263文件428.8MiB）。清理不等于最终构建成功。
- r4首轮旧预览仍复现裸标记；清自己的草稿后reload ERR_CONNECTION_REFUSED，5175无listener（查询exit1），浏览器仍持有旧已载模块。启动当前工作区同5175 Vite并用同浏览器新页加载后才做最终真实回归；生成data错误页受工具URL策略阻断的AX/goto失败也保留，未绕过策略。此证据解释本次旧页未更新，不推定历史预览崩溃原因。
- 工具选区/disabled控件/selector期限、长批量操作n/aan文字根因未定位、暂时binding丢失、错误快照字段比较等均记录；后续短例或正确口径复检不能推定长期预览稳定性。原8条最终同口径严格比对保持。
- coordinator薄入口与正式core连续两轮IMPL_DEFECT停机条件措辞漂移已明示；自动链路停止，后续按用户持续开发授权手动限定补修，不改共享技能或降级旧正式feature。

## Windows制品与数据

✅ root在最终r4源码上重新执行 `CARGO_BUILD_JOBS=1 npm run release:windows -- --ci`，exit0；读取完整Web/Rust/WiX/NSIS输出。qingjian release重新编译2m20s，E0460没有再次出现，linker_messages warning保留。EXE与中文两种安装器均为本轮新产物；旧0.5.1程序已备份，失效r2候选没有作为最终交付。

| 制品 | 大小（bytes） | 本机修改时间 | 版本 | SHA256 |
|---|---:|---|---|---|
| src-tauri/target/release/qingjian.exe | 13512704 | 2026-10-03 16:04:45 | File/Product 0.5.2 | 16AF83202B3B4D666444D833C5F476DE5DBB6756E7B627426A341860DC47FADF |
| bundle/nsis/晴笺_0.5.2_x64-setup.exe | 3722679 | 2026-10-03 16:04:45 | File/Product 0.5.2 | 84D0CD852A263B14FAB03FBAC31377D4A399C4E415DEBCA31C78BBB5A85B305D |
| bundle/msi/晴笺_0.5.2_x64_zh-CN.msi | 5148672 | 2026-10-03 16:04:31 | MSI ProductVersion 0.5.2 | 53779AC854A4FC8BF854BB75D72E821A5628CA6592662F04E9B91E9A7B37CD61 |

制品路径中的bundle均位于src-tauri/target/release下。版本/时间/哈希读取命令exit0；MSI通过WindowsInstaller只读OpenDatabase(0)查询ProductVersion，未安装。

✅ root `Start-Process -WindowStyle Hidden -PassThru`仅启动自建新EXE，10秒后own_process_alive=True；随后只终止自己启动的进程做烟测清理。不是正常关闭退出0或完整原生UI验收。启动与只读快照脚本命令exit0。

数据库前后只读事务快照：notes3条、transactions0条，schema及SELECT全部字段按id规范化JSON逐字节相等true；前后SHA256均为 `948bc77f536283a9e50317edf6226dfc61de213ab77e29db6c550516119f719f`。不读出密钥、不恢复或覆盖原库；只证明本机这份数据库在本次启动烟测中保持。

## 实际截图

本轮实际媒体位于 `C:/Users/ZXL/.codex/visualizations/2026/10/02/01a0fc52-c082-7c00-b650-78e2c95b7cfa/qingjian-composer-20261003/`。

- `composer-after-light.jpg`：9工具和中英粗斜体实际编辑。
- `composer-card-after.jpg`、`composer-graph-after.jpg`、`composer-refill-after.jpg`：保存/图详情/回填。
- `composer-after-dark-390.jpg`：实际CSS390深色与底部保存布局。
- `composer-templates-after.jpg`、`composer-templates-light-390.jpg`：全新空白3模板和窄屏布局。
- `composer-final-0.5.2.jpg`：r4当前源码重新载入并实际回归后的默认1280×720空白编辑器；已保留当前预览页供体验。

图片只证明对应观察，不能代替GPU帧率、原生输入法或安装器验收。

## 未测与发布范围

⛔ Windows原生中文IME、macOS、读屏/触屏、系统reduce/后台中途取消、100/125/150%缩放、GPU/耗电、长期稳定性及安装器安装卸载未验收。原生进程存活也不能证明WebView交互全部通过。

⛔ 关联图原有500条p95与入口增量候选预算未全部达标；本轮没有重做算法或存储。现有JSON损坏/导入替换、空桌面库/双保存议题未扩大本轮范围。旧os1455分页失败和未定位预览崩溃继续保留在[0.5.1记录](Release.Verification.0.5.1.md)。不声称完整MVP全部验收或零bug。

最初工作区含来源未隔离的混合改动，保留全部，未混合提交/推送，也不提交生成制品。
