# 0.8.0 Windows 体验版验证

2026-10-06。此记录对应当前工作区同源构建，制品只保存在本机 `src-tauri/target/deliveries/0.8.0-release/`；该目录被 Git 忽略。

## 来源与命令

- `package.json`、`package-lock.json`、`src-tauri/Cargo.toml`、`src-tauri/Cargo.lock`、`src-tauri/tauri.conf.json` 均使用 0.8.0。构建前未改写既有用户笔记，也未运行旧 EXE 写库。
- `npm test`：exit 0，137/137 pass、fail 0；Node 的 `stripTypeScriptTypes` 实验性提示保留。
- `cargo test --locked --manifest-path src-tauri/Cargo.toml --jobs 1`：exit 0，11/11 数据库用例通过；Windows 链接器提示保留。
- `npm run release:windows -- --ci`：exit 0。先执行 TypeScript/Vite Web 构建，再由 Tauri 编译程序 EXE，生成 x64 NSIS 与 MSI。Vite 仍提示部分代码包超过 500 kB；该提示没有阻断构建，不代表长期性能已验收。
- `git diff --cached --check`：exit 1，报告若干既有过程 Markdown 新增文件的行尾空格和末尾空白行，其中双空格含 Markdown 硬换行语义；本次保留历史材料原文。仅检查源码、配置和测试路径时 exit 0。提交范围另在 Git 收尾时核对；本文件不预写尚未发生的提交、推送结果。

## 同源制品

| 制品 | 字节 | SHA256 | 版本核对 |
| --- | ---: | --- | --- |
| `qingjian.exe` | 13,758,976 | `6E68181B7D37D94BFE370EFDC6234372571E59EC3DE26519CD477AE67DC44299` | Windows FileVersion / ProductVersion 均为 0.8.0 |
| `晴笺_0.8.0_x64-setup.exe` | 3,923,484 | `137E35E276073AC002C8B0BA99AEF1725BCE3A11279E263BCF29D7D4EB9484A9` | Windows FileVersion / ProductVersion 均为 0.8.0 |
| `晴笺_0.8.0_x64_zh-CN.msi` | 5,349,376 | `24D251BA98976B183426AA88FC1A0EB56A867430245FB8C326ECE398A49D6C9B` | MSI Property 表 `ProductVersion=0.8.0` |

三份文件已从构建输出复制到独立交付目录，并逐一比对复制前后 SHA256 一致。当前 `target/release/qingjian.exe` 会被后续构建覆盖，交付目录为本次固定副本。

## 已见界面与剩余验收

构建前在本地 Web 页面确认旧「3D空间」入口消失；记录卡片可打开十二个月记录年轮，二维关联图、记录时光和独立伙伴页仍可打开。年轮模型、文字导航和编辑移交的更早现场证据见[年轮验证](current/celestial-note-wheel/verification.md)。这次没有安装 NSIS/MSI，也没有从新 EXE 完成原生窗口、旧库迁移、触屏、读屏、弱 GPU 或长期性能实测；不能把 Web 预览和构建成功写作这些项目通过。

0.8.0 已不包含旧 3D 空间。旧空间的 0.6.0 设计与验证保留在[历史归档](archive/2026-10-06/spatial-note-map/README.md)；旧版制品证据仍以各自发布记录为准。
