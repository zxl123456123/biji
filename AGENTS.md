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

- `src/main.tsx`：按浏览器、桌面主窗和桌面伙伴窗分流。
- `src/App.tsx`：主窗状态、八个页面分流和弹层挂载；编辑器、账本与伙伴本体在各自文件。
- `src/styles.css`：主题、布局、响应式与交互动效。
- `src/store.ts`：浏览器本地存储、备份与迁移。
- `src/desktop.ts`：Tauri 数据与 AI 桥接。
- `src-tauri/src/`：桌面端 SQLite、凭据和网络能力。

## 架构文档索引

- `README.md`：面向使用者的当前能力和运行方式。
- `docs/Project.Progress.md`：当前完成状态、验证结果和下一阶段。
- `docs/Release.Testing.md`：测试指令、人工验收清单与 Windows 发布节奏。
- `docs/Note.Graph.md`：本地关联图的技术选型、派生关系与绘制/存储边界。
- `docs/Soft.Interaction.md`：柔和反馈、排序取消与快速定位的当前边界。
- `docs/Note.Formatting.md`：有限排版、起笔模板、纯文本与原生撤销边界。
- `docs/Workbench.Layout.md`：网格/阅读/日期与三层卡片、控件反馈的当前边界。
- `docs/Note.Ordering.md`：同分区排序、独立置顶区、唯一数组顺序、SQLite/备份兼容和旧EXE降级写入限制。
- `docs/Search.Experience.md`：统一可见正文/标签查找、首命中摘要、字形高亮与内存缓存边界。
- `docs/current/celestial-note-wheel/`：十二个月记录年轮的当前方案与验证；`docs/Spatial.Experience.md`：旧 3D 空间历史文档的归档入口。
- `docs/Code.Entry.md`：启动分流、主窗页面和伙伴文件职责。
- `docs/Pet.Wardrobe.md`：五角色、免费试穿与已应用外观、共享画像及局部动态许可。
- `docs/Note.Attachments.md`：本机图片和文件附件、大小限制、IndexedDB/SQLite 兼容及旧版回写限制。
- `docs/Release.Verification.0.9.0.md` 至 `docs/Release.Verification.0.9.3.md`：0.9.x 制品身份、已测和未测边界。
- `docs/Release.Verification.0.8.0.md`：0.8.0 同源测试、程序 EXE/NSIS/MSI 身份、失败与未测。
- `docs/archive/2026-10-06/spatial-note-map/`：已移除旧 3D 空间的 0.6.0 历史设计与验证。
- `docs/Release.Verification.0.7.0.md`：隔离发布来源、角色/空间及月历快照证据、制品、失败和未测。
- `docs/Release.Verification.0.6.0.md`：0.6.0根命令、实际空间/宠物验收、规模测量、媒体、新制品/旧库保持、失败与未测。
- `docs/Release.Verification.0.5.5.md`：0.5.5搜索体验的命令、实际界面、查询测量、新制品与未测边界。
- `docs/Release.Verification.0.5.4.md`：0.5.4排序/置顶与焦点实测、实际命令、Windows体验制品/真实旧库证据，以及独立实施审查状态；保留失败和未测边界。
- `docs/Release.Verification.0.5.3.md`：0.5.3卡片/阅读实测、新制品、失败与未测证据。
- `docs/Release.Verification.0.5.2.md`：0.5.2新增排版、实际编辑回归与新版制品证据。
- `docs/Release.Verification.0.5.1.md`：0.5.1体验版制品、实际UI与失败/未测记录。
- `docs/Release.Verification.0.5.0.md`：0.5.0体验版制品与当前验证/未测边界。
- `docs/Release.Verification.0.4.0.md`：0.4.0制品、验证证据、已见失败与未测边界。
- `docs/Product.Direction.md`：市场对齐结论与晴笺产品边界。
- `docs/Docs.Maintenance.Conventions.md`：文档维护与归档规范。
- `CHANGELOG.md`：版本级变更记录。

## 变更与验证

1. 修改前先核对当前实现与文档，不把计划写成已实现。
2. 保持交互克制、舒适、可发现；优先直接呈现结果，避免向用户暴露存储语法。
3. Web 变更至少运行 `npm run build`。
4. 编辑器变更还需手测：连续输入顺序、选区格式、保存后展示、编辑回填、快捷键与深色主题。
5. 数据安全变更还需手测：草稿恢复、删除撤销、回收站恢复、永久删除二次确认和旧 SQLite 数据迁移。
6. 文档有实际变更时与对应代码一起提交；提交信息不得包含 AI 标识。
7. 排序/置顶变更需验证同区双向、跨区拒绝、取消/键盘焦点、筛选/加载隐藏槽位、刷新/重启、备份顺序与旧字段保持；迁移后禁止用旧EXE写回丢失新增元数据。
