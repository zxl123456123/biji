# 0.9.1 托盘与伙伴恢复验证 · 2026-10-09

本轮按用户要求使用短方案、直接实施和测试。保留工作区此前未提交的 0.9.0 桌宠/启动修补，不重置、不把历史正式流程写成已关闭。本轮范围是托盘、主窗关闭驻留、伙伴召唤和关闭恢复；采用 Tauri 官方 Rust TrayIconBuilder，不引入新的后台服务。

## 实施与自动验证

- 启用 Tauri tray-icon；托盘左键打开主窗，右键菜单提供打开、召唤、收起和退出。主窗关闭改为隐藏，退出菜单才结束应用。
- 关闭伙伴不再把 native bootstrap 标记为关闭；主窗仍唯一保存显示偏好。召唤重新定位可见工作区、开启偏好并等待实际发布。
- 独立审查发现等待召唤时旧摘要覆盖新状态的竞态，已改为等待后重读最新状态并串行处理普通动作；新增真实 hook 时序测试。
- `node --test --test-reporter=spec tests/*.test.mjs` exit 0：164/164，fail/cancel/skip 均 0；完整输出已读，日志见本机 `src-tauri/target/tray-fix-0.9.1/js-tests-final.log`。
- `cargo test --locked --manifest-path src-tauri/Cargo.toml --jobs 1` exit 0：29/29，main/doc 各 0 用例不算覆盖。完整输出 `rust-tests.log`。
- `npm run build` exit 0；最终 `npm run desktop:build -- --ci` exit 0，含 Web 类型检查和构建，产出 0.9.1 EXE、NSIS、MSI。完整输出 `build-final.log`。
- 未参与实施的 reviewer 读取本轮真实源码并独立运行 hook 回归，13/13、exit 0；修正后的源码未发现确定的待修缺陷。此结论不替代原生验收。

## 最终 EXE 现场

精确启动路径 `E:/project-funny/biji/src-tauri/target/release/qingjian.exe`，最终测试 PID 16996。实际画面为新主导航和 4 条原笔记；伙伴窗显示三维晴小团与更多操作。

只读 Win32 `Shell_NotifyIconGetRect` 查询当前 PID：托盘内部 ID 2，HWND 22544958，通知区物理矩形 `[2064,1528,2112,1600]`，exit 0。此证据证明图标真实注册且有系统位置，不能替代菜单点击。

computer-use 真实操作：

1. 点击主窗「关闭窗口」，随后窗口清单只保留伙伴；进程响应、托盘注册保持。
2. 伙伴「更多 → 待办」重新打开主窗并显示待办页。
3. 伙伴 Alt+F4 后只保留主窗；设置显示「显示伙伴」。
4. 点击设置「显示伙伴」，伙伴窗再次出现，设置变为「收起伙伴」，未触发启动失败。

真实本机 SQLite 启动前只读备份；启动后及关闭/恢复后逐表、逐字段、逐行比较均 exit 0。notes=4、todos=0、transactions=0，semantic SHA256 为 `bd89f6d1aa1818aea178dd3ca794620ca64784443fbfdb07dad91055b02974f1`。

## 已见失败、警告与未测

- 审查临时脚本第一次有字符串转义 SyntaxError，修正后测试通过；非产品失败。
- 最终制品独立核验脚本曾误要求 MSI 具有 EXE FileVersion 而退出 1；纠正检查口径后退出 0，三份字节数/哈希与 manifest 一致。root 另以 Windows Installer ProductVersion 确认 MSI 为 0.9.1。
- 一次伙伴点击因 computer-use 缺少输入几何返回 `coordinate input geometry is unavailable`，重新获取截图状态后成功；未隐去工具失败。
- 初次启动截图捕捉到启动前背景，激活并重新观察后看到正确新主窗；不把初次背景图作验证。
- 首次候选 PID 21352 在竞态修正前受控终止以允许重建，不能算正常退出测试。
- 保留 Node 类型擦除实验警告、Three 大于 500kB chunk 警告、Rust linker warning；没有构建/测试失败。
- 调研搜索曾因不存在的 scripts 目录和 Windows rg 路径中未展开的星号报错，改为实际目录定位后读取；Git 提示 LF/CRLF 转换，`git diff --check` 无空白错误。
- 未逐项人工点击 Windows 托盘菜单；召唤协议、状态持久化失败与动作竞态有自动测试，托盘注册与关闭恢复有实际原生证据。当前 helper 不提供可选择的任务栏窗口，不能以源码审查宣称菜单现场全通过。
- 未执行安装器覆盖升级/卸载，未全面测试多屏混合 DPI、长期运行和资源开销。新安装器已生成，未自动覆盖用户安装。
- 工作区含多个此前未提交的功能文件，本轮不将它们混入提交/推送。英文提交建议：`fix(desktop): add system tray and restore desktop pet visibility`。

产物存放在本机忽略目录 `src-tauri/target/deliveries/0.9.1-tray-fix/`；个人角色模型和二进制不上传 Git。
