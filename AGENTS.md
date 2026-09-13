# 晴笺项目协作说明

## 项目定位

晴笺是本地优先的轻量笔记与生活账本，前端采用 React + TypeScript + Vite，桌面端采用 Tauri 2 + SQLite。界面文案与项目文档默认使用中文。

## 工作边界

- 用户可见的编辑体验必须是所见即所得，不展示 Markdown 或内部格式标记。
- 笔记底层仍保存可迁移的纯文本格式；不得把编辑器生成的任意 HTML 直接持久化或渲染。
- 数据默认保存在本机。只有用户主动向晴笺 AI 提问时，才允许发送必要的本地摘要。
- 不提交密钥、`node_modules/`、`dist/`、`src-tauri/target/` 或其他生成产物。
- 修改功能后同步 `README.md`、`CHANGELOG.md` 和 `docs/Project.Progress.md` 中受影响的当前事实。

## 代码入口

- `src/App.tsx`：界面、笔记编辑器、账本及 AI 面板。
- `src/styles.css`：主题、布局、响应式与交互动效。
- `src/store.ts`：浏览器本地存储、备份与迁移。
- `src/desktop.ts`：Tauri 数据与 AI 桥接。
- `src-tauri/src/`：桌面端 SQLite、凭据和网络能力。

## 架构文档索引

- `README.md`：面向使用者的当前能力和运行方式。
- `docs/Project.Progress.md`：当前完成状态、验证结果和下一阶段。
- `docs/Docs.Maintenance.Conventions.md`：文档维护与归档规范。
- `CHANGELOG.md`：版本级变更记录。

## 变更与验证

1. 修改前先核对当前实现与文档，不把计划写成已实现。
2. 保持交互克制、舒适、可发现；优先直接呈现结果，避免向用户暴露存储语法。
3. Web 变更至少运行 `npm run build`。
4. 编辑器变更还需手测：连续输入顺序、选区格式、保存后展示、编辑回填、快捷键与深色主题。
5. 文档有实际变更时与对应代码一起提交；提交信息不得包含 AI 标识。

