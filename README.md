# 晴笺

一个本地优先、可离线安装的轻量笔记与生活账本。

## 运行

```bash
npm install
npm run dev
```

浏览器访问终端显示的本地地址。

原生桌面开发版：

```bash
npm run desktop
```

生成 Windows 安装包：

```bash
npm run desktop:build
```

一次执行前端构建与 Rust 检查：

```bash
npm run check
```

## 已实现

- 今日、明天、准备中和全部记录；可为记录指定日期
- 快速记录、编辑、完成状态、回收站恢复、删除撤销、`#标签` 自动提取和搜索
- 未正式保存的编辑内容自动作为本机草稿保留，再次打开可继续书写
- 本月账本、收入/支出、分类、编辑/删除、月度汇总与支出分布
- 深浅主题、响应式布局、键盘快捷键 `Ctrl/⌘ + Enter` 与 `Ctrl/⌘ + K`
- JSON 数据备份与恢复
- PWA 离线缓存，可从浏览器安装为独立应用
- 本地持久化（浏览器 `localStorage`）；不上传任何数据
- 标签可直接打开筛选，并可固定到侧栏
- 所见即所得编辑器：标题、粗体、斜体、颜色和字号会在输入时直接呈现
- 年/月/日三列滚轮式日期选择器

## 原生端与 AI

桌面端使用 Tauri 2 + SQLite（WAL 模式）存储数据，数据库位于应用数据目录。AI 功能使用官方 `deepseek-flash` 模型，即 DeepSeek V4.1-Flash；模型名和 API 地址不会放在前端。

首次启动桌面端时，程序会从 `%USERPROFILE%\.config\opencode\opencode.json` 的 DeepSeek provider 迁移现有密钥至 Windows 凭据库 `deepseek_api_key.com.zxl.qingjian`。密钥不会写入本仓库、SQLite 或浏览器本地存储。只有在用户向“晴笺 AI”提交问题时，相关的本地笔记/账本摘要才会发送到 DeepSeek API。

编辑器直接展示最终排版，不会向用户暴露 Markdown 或内部格式标记。底层仍保存安全、可迁移的纯文本，并兼容已有记录。

## 下一阶段

下一阶段优先增加笔记历史版本、收藏与组合筛选；全文索引、附件和可选多端同步在验证真实需求后逐步加入。
