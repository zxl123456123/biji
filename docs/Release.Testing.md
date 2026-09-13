# 测试与 Windows 发布

## 自动检查

```powershell
npm ci
npm run check
```

`npm run check` 会执行 TypeScript 构建、Vite 正式构建和 Rust 编译检查。开发预览使用 `npm run dev`，桌面联调使用 `npm run desktop`。

## 里程碑人工验收

1. 新建记录，输入内容后直接关闭，再次新建时应恢复草稿。
2. 保存草稿后再次新建，旧草稿不应继续出现。
3. 删除记录后点击“撤销”，记录应回到原列表。
4. 不撤销时记录应进入回收站，点击恢复后回到原日期。
5. 永久删除第一次点击只显示风险提示，必须再次确认才删除。
6. 旧版 SQLite 数据库打开后，原有笔记和账目仍然存在。
7. 浅色、深色以及 Windows 100%、125%、150% 缩放下检查弹窗和按钮。

## 发布节奏

- 普通样式微调不单独发布安装包。
- 一组可完整验收的功能形成里程碑后更新一次安装包与版本号。
- 数据迁移、安全问题或崩溃修复完成后立即发布修订版。
- 活跃开发阶段原则上每周最多一个对外测试安装包。

## Windows 产物

```powershell
npm run release:windows
```

- 程序本体：`src-tauri/target/release/qingjian.exe`
- MSI：`src-tauri/target/release/bundle/msi/`
- NSIS EXE：`src-tauri/target/release/bundle/nsis/`

当前版本为 0.3.0。NSIS 首次构建需要从 Tauri 官方发布源下载打包组件，网络不稳定时可重试；MSI 与程序本体不受影响。

