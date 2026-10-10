# 0.9.2 图片与文件附件发布验证 · 2026-10-10

用户明确要求更新 EXE，本轮从当前工作区构建含已审查附件功能的 Windows 程序和安装包。只更新版本元数据及发布说明，没有额外功能源码变更。工作区此前未提交的桌宠、托盘等代码继续包含在构建内，不将这些既有改动混入 Git 提交；个人模型及二进制不上传。

## 当轮命令和结果

- `node --test --test-reporter=spec tests/*.test.mjs`：exit 0，170/170，fail/cancel/skip 均 0。
- `cargo test --locked --manifest-path src-tauri/Cargo.toml --jobs 1`：exit 0，30/30；main/doc 各 0 测试，不当作新增覆盖。
- `npm run desktop:build -- --ci`，`CARGO_BUILD_JOBS=1`：exit 0，包含 TypeScript、Vite、Rust release、WiX MSI 和 NSIS；Rust optimized 阶段 2 分 30 秒。
- 本机 `src-tauri/target/attachment-release-0.9.2/verify.ps1`：exit 0，核对 EXE ProductVersion、MSI ProductVersion、字节数和 SHA-256；交付副本与构建原件哈希相同。
- 完整输出已读取，分别保存在上述忽略目录 `tests.log`、`rust.log`、`build.log`。版本统一为 package/package-lock/Cargo/Cargo.lock/Tauri 的 0.9.2。

附件源码的独立审查、浏览器实测、曾见失败和修复范围见 [附件说明](Note.Attachments.md)；本轮不把既有浏览器证据称为 Windows WebView 验收。

## 制品

本机交付目录：`src-tauri/target/deliveries/0.9.2-attachments/`。三份版本均为 0.9.2，副本校验均为 true。

| 制品 | 字节数 | SHA-256 |
| --- | ---: | --- |
| [程序 EXE](../src-tauri/target/deliveries/0.9.2-attachments/qingjian.exe) | 16763392 | `EAEBDE9BE2F07109A6008587A0591257429D4850F4D2586954DDD9CC08221B10` |
| [NSIS 安装包](../src-tauri/target/deliveries/0.9.2-attachments/晴笺_0.9.2_x64-setup.exe) | 6018704 | `F34D4B08CFE90BFEFA27F25ECBBF99BDD2117026B104947FF5EE7BB29080460F` |
| [MSI](../src-tauri/target/deliveries/0.9.2-attachments/晴笺_0.9.2_x64_zh-CN.msi) | 7565312 | `D35183009616DD761B6D95930EC6227F07BCE2AC54EDF786574C1D46FF6C9259` |

机器可读清单为该目录 `manifest.json`。旧交付目录和旧包未覆盖；当前 `target/release/qingjian.exe` 更新为本轮新程序。

## 失败、警告与未测

- 首次 Python 内联版本替换命令因 PowerShell 引号转义产生 SyntaxError，未修改文件；改为保存 `bump.py` 后执行 exit 0。该次外层 shell 因后续测试成功返回 0，不以此掩盖替换失败。
- 一次旧包探测同时读取尚未生成的独立审查报告，因文件未生成返回 exit 1；随后单独重跑旧 0.9.1 三制品哈希比较 exit 0，旧交付保持不变。此为探测脚本问题，不作为产品构建失败。
- 保留 Node 类型擦除实验提醒、Three 大于 500 kB chunk 提醒、Rust linker stdout 提醒；最终测试和 Windows 构建无失败。
- 当前安装版 PID 33332 在另一目录运行。本轮未结束其进程、替换安装目录或自动启动新程序，避免两个版本同时回写真实库。因此本轮不声称新 EXE 启动、真实 WebView 附件选择/下载/重启或原库现场迁移已测。
- 未运行安装器覆盖升级/卸载，未测 IME、真实截图粘贴、多屏 DPI、长期资源开销及真实资料库压力。
- 运行新版前从旧版托盘退出。新版本保存附件后禁止再用旧 EXE 写同一库；建议升级前导出备份。方案已有对旧 SQLite 的自动迁移/字段保持及非空附件文件库重开测试，不能替代真实用户库验收。
- 未提交或推送此前多个功能的未提交工作区。英文提交建议：`chore(release): build 0.9.2 with note attachments`。
