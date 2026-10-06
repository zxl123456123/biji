# 正文晴小团：coordinator 现场验证

2026-10-06，浏览器隔离来源 `http://127.0.0.1:5321/`（Vite 开发预览、独立 localStorage 原点，初始仅 3 条示例记录）；使用 Codex in-app browser 实际操作。未读取或改写 `5175` 已有 8 条记录。

## 已观察的 UI 路径

- 新建记录，输入「前文后文」，将光标置于「后文」前，点击「插入晴小团」：编辑区显示「前文 / 晴小团 / 后文」。只读 DOM 核对编辑根直接子级为 `<div data-note-pet="xiaotuan" contenteditable="false">`，内部 `canvas[data-engine="three.js r186"]` 的 `data-ready="true"`。继续输入「继续」后仍保留前后正文与宠物。
- Ctrl+Z 先撤继续输入，再撤宠物块；Ctrl+Y 重做宠物块。保存后卡片显示原位置静态预览；重开编辑区恢复单个直接子级宿主与加载完成的三维画布。
- 重开后再次点击插入按钮，出现「晴小团只能在普通正文光标处插入一次」且正文未新增第二块。将光标置于后文起点，Backspace 整块删除；Ctrl+Z 恢复宠物块。
- 在后文追加「草稿测试」但不保存，关闭再打开显示「已恢复草稿」并保留宠物；选中前文点粗体，DOM 为 `<b>前文</b>`；Ctrl+Enter 保存后重开为 `<strong>前文</strong>`，宠物仍在原位且画布加载完成。
- 深色主题下重开同一笔记，三维晴小团和正文均可见，已查看实际截图。搜索「晴小团」得到 1 条；搜索内部字符串 `pet:xiaotuan` 得到 0 条。
- 记录时光当日条目显示 1 个 `.embedded-pet-preview`，该正文内 canvas 为 0；关联图选择该记录后详情显示 1 个静态预览，详情内 canvas 为 0。

## 已见失败

- r1 操作后的浏览器 error 日志多次出现 `Attempted to synchronously unmount a root while React was already rendering... may lead to a race condition.`。r2 将 MutationObserver 后的协调及组件卸载延后到下一任务；以下复测未再复现。r1 失败保留在此，不能省略。
- 浏览器只读 evaluate 不允许读取 localStorage（访问 `localStorage.getItem` 报 `undefined`）；纯文本存储的直接现场读取未得到。codec/备份测试、保存回填和正文可见搜索是间接证据，不替代原生数据库验证。

## r2 修补后复测及本轮命令

- 新开隔离来源浏览器标签页后，打开已保存的宠物记录：编辑区有 1 个直接子级宿主、1 个 `canvas[data-engine="three.js r186"]`，`.pet-3d-view[data-ready="true"]`，浏览器 error/warn 日志为空。
- 光标在「后文」前按 Backspace，宠物宿主与编辑器画布都变为 0；Ctrl+Z 恢复宿主和画布；Ctrl+Y 再删除；Ctrl+Z 再恢复。每步检查 error/warn 日志均为空。
- 关闭编辑器后，编辑器画布为 0；重新加载隔离来源，卡片仍有宠物静态预览；重开编辑器加载为 `data-ready="true"`；点击「保存记录」后编辑器画布为 0，卡片静态预览 1 个。整个 r2 复测浏览器 error/warn 日志为空。页面其他区域保留浮动宠物画布，属于原有桌面伙伴。
- 本轮在仓库根运行 `npm test`：退出码 0，141/141 通过；运行 `npm run build`：退出码 0；`git diff --check`：退出码 0。构建仍报告现有大 chunk 提示（`index` 与 `three.module` 超过 500 kB），未当作通过之外的性能结论。Node 测试也输出原有 TypeScript strip 的 ExperimentalWarning。

## 尚未现场验证

- 真正的中文输入法组合事件、其他浏览器/Windows WebView、触屏和读屏。
- 模型加载失败、WebGL 上下文丢失、长期 GPU/内存、系统减少动态或页面隐藏后的恢复。
- 非默认衣橱装扮在各阅读入口的实测、同形 HTML 粘贴及跨块复杂选区。
- 旧 EXE 对新指令的读取/回写；未使用真实用户库测试。
- 复制正文按钮曾显示「正文已复制」，但自动化浏览器剪贴板读取未返回文本；复制内容未取得直接证据。

## 承接结论边界

以上 UI 路径只证明 IAB 当前 Chromium 开发预览中的观察。r2 已通过所述循环复测；[独立实施后审查 r2](review_notes_impl_r2_1.md)给出协议与业务双 PASS，并保留嵌套 React root 生命周期复杂度 WARN。`git log --oneline origin/main..HEAD` 在功能提交推送前只列出 `fd400fc`；`git push` 退出码 0，远端从 `9f0b9d3` 前进到 `fd400fc`。本段状态同步将以独立文档提交推送。
