# 0.9.3 历史账本发布验证 · 2026-10-10

当前状态：实现、构建和独立审查已核验；Git 提交及推送状态以仓库记录为准。

用户批准历史账目补记、按月/年查看、布局优化、提交推送及新版 EXE 构建；已取消总资金功能。

## 来源与提交边界

EXE 从当前工作区构建，包含此前尚未提交的附件、桌宠与托盘代码。Git 提交只包含本轮账本、版本和对应文档的差异；EXE 不等于远端干净提交可重现的制品。已有修改保留，本轮前快照在忽略目录 `src-tauri/target/ledger-release-0.9.3/baseline/`，未提交文件的完整 patch 在同目录上一级。

旧交付包保留。正在运行的安装版为 PID 33332，本轮不替换其文件或启动第二份程序写入真实库。

## 验证

- root 执行 `node --test --test-reporter=spec tests/*.test.mjs`：exit 0，175/175，失败/取消/跳过均为 0，完整输出已读。
- root 执行 `cargo test --locked --manifest-path src-tauri/Cargo.toml --jobs 1`：exit 0，30/30；main/doc 各 0 项，不算新增覆盖。数据库旧格式、完整事务回滚和文件重开用例通过；未对真实用户库写入。
- root 两次执行 `npm run desktop:build -- --ci`，`CARGO_BUILD_JOBS=1`：均 exit 0。第一次完成后发现其源码快照不包含随后修正的伙伴占位；交付使用重新构建的第二次结果，其 Rust release 阶段 2 分 48 秒。包含 TypeScript、Vite、Rust、MSI 和 NSIS。
- root 验证隔离的准备提交源码：`npm run build` exit 0，146/146 前端测试 exit 0；使用本机既有 node_modules，未另行验证干净环境 npm install。
- 隔离 Edge 脚本 `src-tauri/target/ledger-release-0.9.3/ui.cjs` 最终 exit 0：历史月默认日期、2024 闰日补记、收入/支出/结余一致、年度十二个月下钻、跨年改日期及导航、刷新保留、JSON 导出导入日期保持、删除后年度统计、375px 深色正常滚动点击；pageerror 为空。
- 已查看月度浅色、年度浅色和深色窄屏截图；伙伴显示时能滚动到末月并正常点击，不使用强制点击。
- `git diff --cached --check` exit 0。暂存内容从本轮前快照提取，只包含账本相关源码、版本字段与本次文档；其余工作区修改保留。
- [独立实施审查](current/ledger-history-funds/review.md)结论为 `reviewed_no_open_findings`；审查者读取实际最终差异，独立执行日期/月份/备份相关 25 项测试，并核验三制品身份。原生验收边界保持。

## 制品

交付目录 `src-tauri/target/deliveries/0.9.3-ledger/`。root 核对程序 EXE、NSIS 与 MSI ProductVersion 均为 0.9.3，三个副本与构建原件的 SHA-256 相同，核验命令 exit 0。机器可读清单在交付目录 `manifest.json`；旧交付目录未覆盖，旧 0.9.2 程序哈希与原记录相同。

| 制品 | 字节数 | SHA-256 |
| --- | ---: | --- |
| [程序 EXE](../src-tauri/target/deliveries/0.9.3-ledger/qingjian.exe) | 16763392 | `9C0AB664823D8A6DE9CF04CA3C36935658B69305C7F0F7747ACABAB05B3130C1` |
| [EXE 安装包](../src-tauri/target/deliveries/0.9.3-ledger/晴笺_0.9.3_x64-setup.exe) | 6019758 | `B638639D3802997983301D686DEE327D4CE6424A0B25261D32AF4EBC13B3D47E` |
| [MSI](../src-tauri/target/deliveries/0.9.3-ledger/晴笺_0.9.3_x64_zh-CN.msi) | 7565312 | `A7BC25C41295104E7DDE899CAD60B5992AC74AAB3784BFCAB88E7F282A6EE757` |

## 已见失败与限制

- 验收工具首次动态导入 Playwright 的 ESM 入口失败（default export）；改用 createRequire 加载。
- 随后使用 Playwright 的 msedge channel 启动失败，其默认路径不存在；改为本机实际 `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`，隔离浏览器已启动。以上是验收环境问题，不作为产品测试通过证据。
- 一次 REPL UI 脚本超时导致会话重置，改为保存的 CLI 验收脚本；脚本确实发现伙伴遮住年度末月，修正条件占位与滚动空间后正常点击通过。新增收入用例曾因分类 label 精确匹配失败，改用表单 select 后完整重跑 exit 0。
- 提取暂存差异的脚本首次因旧 Ledger 函数与 HEAD 按钮差异拒绝执行；随后限定为删除被替换的三个旧账本函数。暂存 lockfile 曾误替换两个同版本依赖，root 在检查 diff 时发现并修正；工作区依赖未改动，最终暂存只改变两个应用版本字段。
- 第一次全量 TAP 输出被工具截断，随后改用 spec reporter 重跑并读取完整输出。实现者读取不存在的 tsconfig.app.json 失败已在实施交接记录。
- 保留 Three 大 chunk、Node 类型擦除实验和 Rust linker stdout 提醒。
- 新 EXE 原生 WebView 现场操作、真实库重启、安装升级、IME 和长期性能尚未验收。
