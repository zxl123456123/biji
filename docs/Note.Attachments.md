# 笔记图片与文件附件

## 方案与范围

2026-10-10，按用户要求采用短方案后直接实施，不初始化正式 feature。目标是把图片、PDF、Office 文档及其他本地文件保存到笔记，并能取回原件；暂不解析文档、OCR 或提供在线 Office 编辑。

- 正文继续使用既有有限排版纯文本。`Note.attachments` 保存独立的原文件名、类型、大小和 Base64 数据；附件区不持久化编辑器 HTML。
- 选择多个文件、粘贴剪贴板文件、拖入文件均进入同一个附件区；支持只含附件的记录。PNG、JPEG、GIF、WebP、BMP、AVIF 可预览，其他类型（包括 SVG、HTML）只提供原件下载。
- 单个文件最多 20 MB，每条记录附件合计最多 50 MB。整批读取成功才加入，不产生半批附件；超限明确反馈。
- 浏览器笔记及草稿使用 IndexedDB，读取不到新记录时兼容原 localStorage。旧数据保留，不主动删除。桌面正式笔记写 SQLite 的新增 `attachments` 列，旧行默认空数组；桌面草稿保存在当前 WebView 的 IndexedDB。
- 桌面 SQLite 读取失败时沿用浏览器存储回退，但先读取 IndexedDB 再开放操作；回退期间写浏览器本机存储，禁止以回退快照覆盖未读成功的 SQLite。回退数据不会自动与 SQLite 合并。
- 草稿与记录分开；保存成功后才清除草稿和关闭编辑器。保存失败保留编辑器，支持重试。后续删除、撤销、回收站恢复沿用整条记录，JSON 备份直接包含文件数据；导入检查附件结构、Base64 和长度。
- 附件不会发送给 AI，也不会自动从网络加载。搜索、复制和关联图仍依据正文；文件名及文件内容尚未纳入搜索。卡片与编辑器提供完整附件入口，年轮、时光和图详情仍是正文导航。

采用 [FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL) 与 [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) 的标准能力；保留现有 Rust SQLite 事务。此次采用自包含附件，方便备份和删除保持一致，不引入文件目录与数据库之间的双重同步。代价是 Base64 约增加三分之一体积，保存和备份会处理完整记录，不适合大型资料库。

## 兼容与验证边界

升级前建议导出备份。**新增附件后禁止用旧 EXE 回写同一 SQLite 库，也不要把含附件的新备份交给旧版本编辑保存**：旧版全表重写会丢弃新增附件字段。新版本仍可读取无附件的旧库与旧备份。

本轮没有修改真实用户 SQLite 数据。0.9.2 已生成包含附件功能的新版 EXE、NSIS 和 MSI，并核验三份版本/哈希；旧 0.9.1 交付包保持原身份，不含附件功能。Windows WebView 文件下载、真实剪贴板截图、中文输入法及安装升级仍需在新版桌面包验收，详见 [发布记录](Release.Verification.0.9.2.md)。

最终命令：`npm run build`、`node --test --test-reporter=spec tests/*.test.mjs`、`cargo test --manifest-path src-tauri/Cargo.toml --lib`。隔离 Edge 验收还包含文件选择、粘贴/拖入、仅附件保存、草稿/刷新保持、原文件下载字节对比、图片预览、选区格式/原生撤销、快捷键、深色、回收站撤销/恢复、永久删除二次确认、备份往返、移除附件以及模拟磁盘失败后重试。

历史失败：首次 Web 构建的 JSX 括号与文件名大小写错误；Rust 旧列数断言；浏览器脚本的空格与菜单定位断言；默认 Playwright Chromium 未安装，改用本机 Edge；20 MB 校验触发正则栈溢出，已改为简单字符校验并新增上限回归。独立审查发现保存期间标签/日期仍可编辑，已统一锁定编辑区；焦点转到 BODY 后 Escape 可提前关闭，已在 App 全局关闭入口增加操作锁；桌面回退持久化路由也已同步修正。一次 Playwright `fill` 可修改 inert input 的审查脚本失败，随后改用真实 pointer click 验证控件锁定。最终结果和审查结论以本轮当前进度记录为准。
