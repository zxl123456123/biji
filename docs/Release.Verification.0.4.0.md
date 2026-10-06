# 晴笺 0.4.0 MVP 发布验证

验证日期：2026-10-02。本文件记录主代理本轮证据，不代替原生人工验收。

阶段历史见[实际界面步骤](archive/2026-10-02/gentle-experience-refresh/ui-observations.md)、[实施报告](archive/2026-10-02/gentle-experience-refresh/impl_report_r1.md)及[独立审查](archive/2026-10-02/gentle-experience-refresh/review_notes_impl_r1_1.md)。本文件作为此次制品证据入口，正文中的阶段文件名均指向该历史目录。

## 打包准备

- 本机 Node v22.23.1、npm 10.9.8、Tauri CLI 2.11.4，现有产品版本原为0.3.0。
- 先前项目0.3.0的NSIS下载超时是历史事实，不作为本轮结果。
- 主代理检查CLI 2.11.4官方NSIS源与SHA1： https://github.com/tauri-apps/tauri/blob/tauri-cli-v2.11.4/crates/tauri-bundler/src/bundle/windows/nsis/mod.rs 。官方打包说明： https://v2.tauri.app/distribute/windows-installer/ 。
- 官方NSIS插件下载退出0，SHA1 `75197FEE3C6A814FE035788D1C34EAD39349B860` 与CLI源码相同。
- NSIS 3.11 ZIP首次预下载60秒超时，命令退出1，curl报告28；收到244853/2361546字节。随后进行有限续传，尚未把不完整文件用于打包。
- 续传命令退出0；完整ZIP的SHA1为 `EF7FF767E5CBD9EDD22ADD3A32C9B8F4500BB10D`，与本机CLI版本官方源码完全一致。随后解压到临时目录并复制到之前不存在的 `%LOCALAPPDATA%/tauri/NSIS`，插件复制前再次校验SHA1。准备命令退出0；只准备官方构建组件，未运行安装器。

## 独立验证

- ✅ 主代理最终 `npm test` 退出0：12项、12通过、0失败，完整TAP已读取；标签近似名、组合条件、回收站、顺序不变性、本机跨月/跨年/空月份覆盖。
- ✅ 主代理最终 `npm run build` 退出0：1876模块，主JS270.15KB/gzip85.64KB，CSS25.33KB/gzip5.99KB，PWA5项缓存294.59KiB。
- ✅ `cargo check --manifest-path src-tauri/Cargo.toml` 退出0；`cargo test --manifest-path src-tauri/Cargo.toml` 退出0，但lib/main/doc均0用例，有1条Windows链接器warning，不能证明数据库迁移已测试。
- ✅ `git diff --check` 退出0，仅原App/store/styles的LF→CRLF提示。独立Review(Impl)协议/业务双PASS，报告为review_notes_impl_r1_1.md。
- ✅ 真实Web验收：连续输入、格式选区、草稿恢复、保存展示/回填、快捷键、复制、软删除撤销和恢复、第一步永久删除保护、浅深色、390px布局、光粒连续开关/关闭重载。步骤及实际截图见ui-observations.md。
- ⛔ 永久删除第二步、真实IME、原生缩放、复制失败、真实触屏、系统减弱/后台恢复、GPU/内存/耗电与AI网络未实测。生命周期停止边界有独立源码审查。
- 开发中曾出现缺少导入与Canvas无效RGB错误，已修复并重载验证；工具失败/隔离变异红灯完整保留在实现及评审报告。根代理等待评审文件时有3次文件尚未落盘读取失败，随后读取正式报告成功。

主代理纯计算性能检查：Node v22.23.1，1000条各500个中文字符的隔离记录，精确标签+正文查找，50次预热后200次采样，结果必须唯一id=999。`node %TEMP%/qingjian-pre-mvp-20261002/query-bench.mjs` 退出0，p50=1.0958ms，p95=1.2296ms，最大1.8555ms。这是纯筛选CPU时间，不是浏览器输入到列表展示延迟，也不是Canvas/GPU帧耗时。

## 制品与限制

- ✅ `npm run release:windows -- --ci` 退出0，读取完整输出：前端构建退出0，Rust release优化构建49.14秒，WiX candle/light及NSIS makensis均产出制品。仍有1条链接器创建dll.lib/exp的warning，无构建失败。

| 制品（仓库根目录下） | 字节 | SHA256 |
| --- | ---: | --- |
| src-tauri/target/release/qingjian.exe | 13434880 | 01EBCAD1E88C9E1792E969AF4F0A0E435C9D75D842722B484BBCD5973E86FEB7 |
| src-tauri/target/release/bundle/nsis/晴笺_0.4.0_x64-setup.exe | 3640797 | C60855D2C3ACC6FEEF63E537420FE6EACCE377AB79AEE44A1A2AC2D3A0987543 |
| src-tauri/target/release/bundle/msi/晴笺_0.4.0_x64_zh-CN.msi | 5070848 | CB755A7797AE2604080E4D8A10F835B322C78B9253151FEED23003C03BA2FECD |

- 文件核验命令退出0；两份EXE的FileVersion/ProductVersion均0.4.0，写入时间2026-10-02 23:39，非9月21日旧产物。
- ✅ 新release程序以Hidden启动，8秒后进程未退出、Responding=true、窗口标题晴笺、窗口句柄非0；CloseMainWindow=true并5秒内正常退出。检查命令退出0，只关闭本轮创建的进程。未执行安装器，也未冒称检查了原生每个控件。
- 启动前只读SQLite备份到临时目录。首次全表SELECT星号哈希断言退出1：旧notes表只有7列，新表新增deleted_at导致序列哈希变化；只读逐字段定位发现原有值无变化。
- ✅ 随后固定原7列及所有transactions列逐行比较，命令退出0：原3条notes/0条transactions完全相同，notes原字段SHA256仍为707632b9d78ad9abac0617c30f33ee0ecf242de89d29ae1a42475806e3c182fe；新增deleted_at的3条值均NULL。实际验证了这份旧7列数据库的既有迁移，不扩大为任意损坏数据库兼容保证。
- ⛔ 未验证安装/卸载、Windows缩放、原生IME、凭据迁移/AI网络、全面数据库故障恢复。EXE构建与原库保留证据不代表这些项目完成。
- Git：保留初始App/store/styles及.serena工作，初始来源合并提交确认未获答复；本轮源代码和文档保留在工作区，未把来源未确认的hunk提交/推送。生成物被ignore，不提交安装包。
- 文档收尾一次多文件patch因README上下文缺失被整批拒绝，读取精确段落后重试；这是工具操作失败，源码/发布制品未因此修改。
- 收尾本地文档链接检查退出0：11个相对链接存在；程序MZ/PE签名及machine=0x8664检查退出0。原store与会话前快照逐字节一致，生成EXE/dist已被Git忽略。
- 主代理创建的5174验收页及Vite服务已关闭；服务收到Ctrl+C退出1是主动停止，回显的是开发期已有错误日志，不是正式release构建失败。用户原5173页保留。
