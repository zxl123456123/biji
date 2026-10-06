# 0.7.1 装扮布局体验版验证

## 最终交付 r3-4 · 2026-10-05

最终隔离源为 `C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005/release-source-r3-4`，预览为 [5200](http://127.0.0.1:5200/)，交付目录为 `E:/project-funny/biji/src-tauri/target/deliveries/0.7.1-release/`。旧 `0.7.1` 与 `0.7.1-final` 是保留的候选制品。工作区的月历、主题探索与关联阅读源码保留，本包仅从固定旧 5190 的 150 个源文件中改变两产品文件及五份自身 0.7.1 元数据；143 个源文件逐字节保持。用户要求的宠物、空间配置边界和旧数据本机保存均保持。

| 最终身份 | SHA256 |
| --- | --- |
| `src/PetCompanion.tsx` | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 |
| `src/pet.css` | 0357631935DFCFEB556EAC556658B60A51F9076B2FE06C7B7823CDF7B0A64D6A |
| `packaging-r3-4/manifest.json` | 25898B8FD5B9E584E5DBCB68AC7A41BC73876F6B69D4BDFC05029C28F4DC2219 |
| `packaging-r3-4/final-150.json` | 42501A00C01FFBB8BAEB5D890346583D7489E3397F874A3D8DBCECEA9F3ED4A8 |

最终 CSS 在高度 ≤600px 的宽屏将 sticky 底栏收进右侧配置列，舞台/画像分别为 136/96px；原先休息后唤醒焦点被底栏盖住及反向招呼画像上沿裁切的真实缺陷由此修复。宽屏左侧预览、窄屏紧凑预览、240ms 外观反馈和原来的动作/动态许可沿用。产品只改两文件；无新业务状态、存储字段、依赖或定时测量。最初网格方案有 PLAN_DEFECT；r3-3 的 500px 唤醒被遮挡与 r3-5 的画像裁切确实发生过，旧候选测试/安装包不能作最终验收。

根命令原始日志及实际退出码在 `TEMP/root-commands/`（`TEMP=C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005`）：`workspace-r3-4-test` exit0、145/145；`workspace-r3-4-build` exit0；`candidate-r3-4-test` exit0、118/118；`candidate-r3-4-build` exit0；`native-r3-4-build` exit0、537.515 秒，包含同源前端构建。前端 2504 modules，main 590.28/gzip189.02kB、3D 587.45/148.85kB、CSS 59.22/12.00kB，PWA 10 项/1307.50KiB。Node 实验警告、>500kB chunk、外置 outDir 与 Rust linker_messages 保留；体积及命令成功不证明 FPS、GPU 或长时间性能。

工作区最终 0357 源的真实浏览器记录 `ui-workspace-r3-6.json` 覆盖五角色 500/600px 休息、唤醒、正反 Tab、招呼与试穿焦点。隔离发布预览 5200 又测伙伴页 500px 休息/唤醒、375×500 末项/底栏、应用后刷新保留。500px 伙伴页画像 16..108、休息后唤醒按钮 349..387；右底栏从 x418.8 起，按钮至 x244.4，不发生二维覆盖；逆向招呼画像顶端 8.5875px。手机末项聚焦后底栏顶部 363.51、按钮底部 299.51px，完整保存状态 scrollHeight=clientHeight=15。`ui-r3-3.json` 中旧唤醒红例和 `ui-workspace-r3-5-red.json` 中裁切例均保留。先前受控 CSS 字号 2x 与长失败提示验证同一手机规则，属于夹具测试，不等于系统 200% 缩放。最新浏览器进程未实测全部原生 GUI。

最终三个文件在新目标目录构建，`root-native-artifacts-r3-4.json` 全文记录 ProductVersion、字节、SHA256：

| 交付文件 | 字节 | ProductVersion | SHA256 |
| --- | ---: | --- | --- |
| `qingjian.exe` | 13705728 | 0.7.1 | DE86AC941DA71A71672AEB74B9AAD9F4800DB97BB26E5D97930A5A0C85A886B7 |
| `晴笺_0.7.1_x64-setup.exe` | 3913551 | 0.7.1 | D59A68437627A3A15C79654C39FF80A410C802492067441B19D2E305A99D5F3F |
| `晴笺_0.7.1_x64_zh-CN.msi` | 5337088 | 0.7.1 | 3BA3291AD4B2E443995CAC598A3E068C5163F21ACDE62AC2670D002AFB73DB05 |

隐藏启动自身 EXE 的 PID 20232 十秒存活且 Responding=true，随后仅终止此受控进程，退出码 -1；这不是正常退出或完整原生 GUI/安装测试。真实 SQLite 只读对比前后 notes3/transactions0 的 schema 与所有字段完全相同，规范 SHA256 `3460a09a76d0d8b4d737cee2c5fe9cbce0f02705b14b8950e7b2986b56396e48`。交付目录复制后三文件哈希/长度再核对，`source-manifest.json`、`source-files.json`、`native-proof.json`、`delivery-proof.json` 同目录留存。

失败记录：前序压力遮挡、r3-3 休息后唤醒遮挡、r3-5 画像裁切均是实际红例；曾有一次 CUA 长批次超时导致会话重置，随后拆批重测。一次鼠标休息旧标签写 500，实际视口 780，排除该条；一次验收脚本将焦点在底栏自身「穿上这套」误判为底栏遮挡，原始检测失败保留，DOM 实测按钮位于底栏内部且完整可见。上一名打包代理的对话压缩远程流断开，fresh 代理先试错旧路径 exit1 后重新完成隔离源；这些故障不代替最终根命令。原生安装/卸载、完整原生 GUI、正常关闭、真实 200% 与系统减少动态、触屏/读屏、PWA 更新、弱 GPU 和长期性能均未测。混合工作区未整包提交或推送；[R3 最终独立报告](current/pet-space-customization/review_notes_impl_r3_1.md) 对最终 r3-4 的协议与业务均为 PASS，用户体验验收未关闭。

最终预览服务在会话传输中断后退出；从浏览器缓存显示的页面不作为服务在线证据。一次内联 `Start-Process` 重启调用被自动审查拒绝且未执行；改用固定路径的 `start-preview-r3-4-restart.ps1` 后启动自有 PID 35524，`http://127.0.0.1:5200/` 现场 HEAD 200、命令行端口核对和浏览器重载均成功。该脚本只启动本地最终预览服务，未碰旧 5190。此段是 r3-4 收尾补记，不属于下文 r3-3 候选。

## r3-3 历史候选记录（以下原文仅按当时候选解读）

2026-10-05，最终来源是 `TEMP/release-source-r3-3`，PetDFFA/CSS77CA；先前 r3、r3-1、r3-2 均为保留候选，不能替代本次定稿。`TEMP=C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005`。用户「继续吧」承接装扮布局/柔和反馈及同源 EXE；Q1「先保留源码，本轮 EXE 只包含宠物和空间配置」继续有效。月历、主题探索/局部关联阅读源码保留且没有混入本包，不关闭完整 MVP 或用户体验验收。

## 最终来源与实现

宽屏左侧预览随滚动保持，右侧选择；720px 以下为顶部紧凑预览。底栏保留应用/撤销/原装和状态全文。外观切换使用 240ms 淡入缩放，按钮轻压弹回；关动态、休息和局部许可沿用原策略。五角色、动作、试穿/应用、存储与笔记逻辑保持。只改 `src/PetCompanion.tsx`、`src/pet.css`，无新依赖、业务状态、schema 或测量计时器。

固定旧 5190 的150源文件中143保持原字节，仅两产品+五自身版本字段改变。版本元数据只设自身0.7.1，其他依赖/脚本/identifier及换行保持；工作区版本没有整体升级或整包发布。真实七差量、150源与metadata语义由根独立脚本核对。

| 身份 | SHA256 |
| --- | --- |
| PetCompanion.tsx | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 |
| pet.css | 77CA75C7A1A4EE3D0D14E4F20E941F3287C2EDAF358418EAC77C127BEA255EBA |
| packaging-r3-3/manifest.json | EC955B8BB520E2293A10BD860FA40B30DCDDEC5F5FD1D272F459F57AF1C9CEF4 |
| packaging-r3-3/final-150.json | D0EE2D24B535C93C411963D3056AF33BB338E2B00BEA0715FFF16D44651FCFF1 |
| preview-before.json（旧5190） | 4EE372D3AFB2176B3BC5F52243A0186C984A1AD90CD4BBAADAA6225C8818EA90 |
| lwplan.md 最终 S6 | C714ABA584F7E5ABE651C8808188D2B6D401698FBD60C2E55681DC63D080689E |

首轮网格方案 REVISE/PLAN_DEFECT 后修成 flex/block，Gate-2 PASS/PASS 经根全文消费。四次补实施只调整 S6 同范围尺寸/焦点值，旧方案55106字节前缀和历史报告保留。事实与审查身份见[功能验证](current/pet-space-customization/verification_layout_r3.md)。

## 本轮根命令

root 在这一轮执行并读过完整 `.log` 与退出码，子代理结果不替代根命令。原始命令/目录/耗时 `.json` 在 `TEMP/root-commands/`，没有用管道收尾替换退出码。

| 最终命令与cwd | 标签 | 结果 |
| --- | --- | --- |
| 工作区 `node --test --test-reporter=spec tests/*.test.mjs` | workspace-r3-3-test | exit0，145 pass，fail/skip/cancel 0 |
| 工作区 `npm.cmd run build -- --outDir TEMP/root-workspace-r3-3-dist` | workspace-r3-3-build | exit0，9.984秒 |
| 最终隔离源同一测试命令 | candidate-r3-3-test | exit0，118 pass，fail/skip/cancel 0 |
| 最终隔离源 `npm.cmd run build` | candidate-r3-3-build | exit0，9.985秒 |
| 最终隔离源 `npm.cmd run release:windows -- --ci` | native-r3-3-build | exit0，245.797秒，包含同源前端构建 |
| bundled pwsh 执行 root-native-proof-r3-3.ps1 | native-r3-3-smoke | exit0，版本/哈希和十秒响应 |
| `python TEMP/native-db-proof-r3-3.py after` | 根690937 / native-after-r3-3-report.json | exit0，schema/全部字段相同 |
| `python TEMP/deliver-r3-3.py` | 根b76822 / delivery-proof.json | exit0，复制后三哈希相同 |
| `python TEMP/root-closeout-check.py` | 根41ca33 / root-closeout-check.json | exit0，264/9/255、历史450源/12制品及两交付保持 |

CARGO_TARGET_DIR=`E:/project-funny/biji/src-tauri/target/wardrobe-layout-0.7.1-r3-3`、CARGO_BUILD_JOBS=1；只复制编译缓存，没有把旧EXE/bundle作新产物。最终前端2504 modules，main590.28/gzip189.02kB、3D587.45/148.85kB、CSS59.13/11.98kB，PWA10项1307.42KiB。Node ExperimentalWarning、>500kB chunk、外置outDir和Rust linker_messages警告保留；体积不是FPS/GPU或长期性能证明。

## 实际页面、失败与闭环

最终同源预览 [5198](http://127.0.0.1:5198/)。媒体根 `C:/Users/ZXL/.codex/visualizations/2026/10/02/01a0fc52-c082-7c00-b650-78e2c95b7cfa/qingjian-wardrobe-layout-20261005`。原 `ui-r3-initial.json`、`ui-r3-final.json`、`ui-r3-2.json` 和候选截图保留；定稿为 `ui-r3-3.json`、`ui-r3-3-pressure.json`。另有工作区开发页 `ui-workspace-r3-4.json`，不与隔离源混作同一App。

最终源实际测试伙伴页与原3D宠物入口、375×667/500、1100×780/600/500、首尾与正反Tab、休息/唤醒及试穿离页/应用/刷新。五角色在伙伴页600/500高度逐个逆向配置→休息→招呼、正向回配置并休息/唤醒；3D入口另测奶龙600/500同路径。实际内容宽360/1085，按JSON的client尺寸判断。

真实红与补修依次保留：

1. 手机CSS文字2倍，初底栏188.8、末卡187.95超过可用168；横向留白缩小后底栏160，仍有约6.85px末卡底边遮挡。增加手机选项margin184后复测完整，字体/提示全文保持。
2. 独立审查指出短桌面互动被底栏盖住。根1100×600反向Tab休息542.925..580.525，footer506.8..592，确认为真实IMPL_DEFECT。短桌面stage190→152、画像184→112后600五角色路径可达。
3. 额外1100×500，copy按钮margin184导致逆向招呼额外滚动，焦点341.587..379.187在footer324.987后；改仅该margin为96，手机184保持。

最终77CA源500高度休息bottom404.225（3D404.325）低于footer406.8，招呼bottom401.925，画像完整可见，五角色均能休息/唤醒；600高度对应休息504.225（3D504.325）低于footer506.8。使用实际截图与原红路径核对，不由估算或绿色build抵消失败。

最终两倍字号夹具复用与发布副本相同的冻结两产品，不写真实偏好。375×500下预览8..135.2、末卡138.7..326.65、footer332..492；焦点在应用，完整长失败提示393.2..483.2高90，font20、scrollHeight=clientHeight=90。成功重试状态高30且全文可见。是受控CSS文字2倍，不是系统/浏览器200%zoom。刚按应用时末卡可移出窗口，重新聚焦末卡再Tab的路径另有证据，不宣称所有卡片一直同时可见。

两组初稿3D标签实际1265×720，排除1100×600证据；两条旧helper仍绑旧fixture而无效，原记录保留并排除。另一次成功测量实际1265×720标签已修正；重复push空项在最终整理去除。最新23号固定页函数与24号压力函数分别直接绑定新页，实际尺寸和原始值保留，不转用这些错误记录。

五角色不同招呼、静态缩略图、休息/关动态与弹层局部暂停在初稿真实测试；最后补修仅短桌面尺寸/焦点，TSX与旧关键帧完整字节保持。定稿重新实测休息/唤醒、手机保持与应用刷新；浅深主题与两入口的前序实测分列，不伪称全部历史场景再次执行。安装器、完整原生GUI与真正系统设置未测。

## 制品、数据与保护

最终交付仅 `E:/project-funny/biji/src-tauri/target/deliveries/0.7.1-final/`，同目录source-manifest/source-files/native-proof/delivery-proof可追溯。旧 `deliveries/0.7.1` 是手机补修后的历史候选，不含最后桌面焦点修订，保持原文件但不交付；原0.7.0及三轮候选12制品也保持。

| 文件 | 字节 | ProductVersion | SHA256 |
| --- | ---: | --- | --- |
| qingjian.exe | 13705728 | 0.7.1 | D74A6ECD88AFD965FBE2D137074F910CD9E7087D66C3BA856D8FEE9C03D9F88E |
| 晴笺_0.7.1_x64-setup.exe | 3912496 | 0.7.1 | 863D490543074D08CD2F0D50C2B1B828E5C191A42C720839F5C07B01E8C6DAFE |
| 晴笺_0.7.1_x64_zh-CN.msi | 5337088 | 0.7.1 | 5A5635FA60F59661B599C935827B8FBC55E3875FB1F6737DD17F287092B93130 |

EXE/NSIS ProductVersion与只读MSI Property核验均为0.7.1。新隐藏PID60504十秒后存活、Responding=true；仅受控终止自建进程，exit-1，不算正常关闭或完整原生GUI，安装器没有运行。

真实库 `C:/Users/ZXL/AppData/Roaming/com.zxl.qingjian/qingjian.db` 只读比较两表schema和按id排序的所有字段。前后notes3/transactions0相同，规范JSON SHA256仍 `3460a09a76d0d8b4d737cee2c5fe9cbce0f02705b14b8950e7b2986b56396e48`；未导入夹具或运行迁移。

根保护核264基线：允许的2产品、4当前文档、3本功能过程文档变化，其余255保持；旧5190的150源、三历史候选450源、12历史制品、两交付均核实际字节。旧LW55106字节前缀保留。未整包提交/推送混合工作区或恢复/清理他人文件。

## 失败、修正与未测

下列前序记录原文保留。旧287.5秒烟测与首次446.453秒构建均只属于旧候选，另有r3-2构建309.515秒exit0；都不替代245.797秒的最终源构建。旧原文提到初目标/媒体路径时按当轮候选解读。

- 除上述真实压力失败，保留首轮 PLAN_DEFECT、旧候选构建及全部原日志。初 Windows 候选 exit0、446.453 秒，只能证明旧候选编译，不替代最终修正包。
- 读取时曾出现错误 skill 路径、报告尚未落盘、错误 patch/manifest 名称、GBK 解码失败、输出截断和 inline Python/PowerShell 表达式错误；纠正路径/编码/分段完整读取后重跑，未据截断输出作完整结论。ccba23 读不存在 final-manifest.json exit1，之后 ee00c0 完整读取实际 manifest.json exit0。
- 实施/审查辅助脚本出现 Windows ESM 路径、TypeScript 路径、不存在 tsconfig、rg Windows glob 和审查 max-height 正则误报，修正后另跑；不作为产品失败或删除历史输出。
- CUA 旧 tab ID 有歧义、body Control+Home 聚焦超时、奶龙标签/角色严格匹配歧义；使用明确 tab 与范围定位。字号开关一次鼠标点击无效，改为 Enter 后先核对 20px，原 10px 记录不作为两倍字号结果。
- 一次内联启动夹具命令被自动批准审查以“blocked by policy”拒绝；未执行。改用固定路径脚本后允许启动。新版夹具首次 extensionless 绝对 import 导致 Vite pretransform 空页，补 explicit .tsx/.ts 后重新加载。均为验收工具问题，不改产品导入策略。
- native-final-smoke 首次调用旧 Windows PowerShell 因 Get-FileHash 不可用 exit1，发生在启动前；改用已配置的 bundled pwsh 后 native-final-smoke-pwsh exit0。临时服务清理首次因命令行不含 cwd 而所有权校验拒绝，exit1、没有停止进程；读取真实命令与本轮启动记录，改为 PID/端口/创建时间核对后 exit0。
- 连续 3D 动图、navigator/performance 与资源/SW/Worker 现场读取的历史限制保留；无新增 FPS、GPU、内存、耗电或长期稳定性证明。安装/卸载、完整原生交互、正常关闭、触屏、读屏、真实系统 reduce/200% 缩放、弱 GPU、PWA 更新仍未全面测。静态 CSS 政策和浏览器实测不替代系统设置测试。

独立实施审查待 root 全文消费 [R3 最终报告](current/pet-space-customization/review_notes_impl_r3_1.md)；报告落盘前不写 PASS。混合工作区没有整体提交或推送，保护与最终复核见对应功能验证。
