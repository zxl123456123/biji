# 0.9.4 专属晴小团发布验证 · 2026-10-10

当前状态：源码测试和 Windows 构建已核验。安装升级、原生窗口现场操作和长期性能未验收。

## 来源

EXE 从当前工作区构建。构建前源码包含专属晴小团动作、代码入口说明、设置页和 AI 面板拆分，以及 0.9.4 版本字段。旧 0.9.3 交付目录未覆盖。

动画预览 PNG、GIF 和联系表留在本机忽略目录 `assets-source/pets/previews/motion/`，不进入 Git。

## 验证

- root 执行 `node --test --test-reporter=spec tests/*.test.mjs`：exit 0，175/175，失败、取消、跳过和待办均为 0。完整输出已读。Node `stripTypeScriptTypes` ExperimentalWarning 保留。
- root 执行 `cargo test --locked --manifest-path src-tauri/Cargo.toml --jobs 1`：exit 0，库测试 30/30，主程序和文档测试各 0 项。未对真实用户库写入。
- root 执行 `CARGO_BUILD_JOBS=1 npm run desktop:build -- --ci`。前两次 exit 1：第一次下载 WiX 超时，第二次使用本机 WiX 缓存后下载 NSIS 超时。程序编译和 MSI 生成并未失败。
- 第三次使用本机已有 WiX 3.14 与 NSIS 3.11 缓存，exit 0。Web 构建包含既有大于 500 kB chunk 警告。Rust release 阶段 4 分 55 秒。
- 程序 EXE 与 NSIS 的 ProductVersion 均为 `0.9.4`。MSI 属性表中的 `ProductVersion` 为 `0.9.4`。

## 制品

交付目录 `src-tauri/target/deliveries/0.9.4-xiaotuan/`。三份副本与构建原件的 SHA-256 相同。

| 制品 | 字节数 | SHA-256 |
| --- | ---: | --- |
| 程序 EXE | 16591360 | `11DFD828D672C3F7F0E1F27DBCBD9F1795E4DBD203D4F5F1FB7215CE7334D189` |
| EXE 安装包 | 5878347 | `4C3595E0B9DC110044A8844AE449BEA2B135156437B9BFE7F33FEC45F1D83CC4` |
| MSI | 7413760 | `7C439EB62ABECFF0ADE73A5F9DC9560779B3345A16BC5114181A60805A85DB2B` |

## 已见失败与限制

- Tauri 首次下载 WiX、随后下载 NSIS 均报 `timeout: global`。改用本机缓存后打包 exit 0。这是构建工具下载问题，不是应用测试失败。
- 一次直接下载 WiX 的 curl 在 180 秒后超时，已中止，不作为制品来源。
- 保留 Three 大 chunk、Node 类型擦除实验和 Rust linker 提醒。
- 新 EXE 的原生窗口现场操作、安装升级、真实输入法、GPU 和长期性能尚未验收。配色渲染仍待后续调整。
