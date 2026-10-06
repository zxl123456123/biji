# 晴笺柔和体验改造：调研摘要

调研时间：2026-10-02。本文件只记录现状、差异与参考依据，不替代后续高层/低层方案。文件行号对应本轮实施前工作区。

## A. 系统边界与现有能力

晴笺已经具备个人笔记、完成状态、日期、标签搜索与固定、生活账本、主题切换、备份、PWA、桌面 SQLite 与主动 AI 提问。用户可见输入为所见即所得，持久化仍为受限纯文本格式（`src/App.tsx:75-104`），没有直接持久化编辑器 HTML。产品边界为本地优先，不扩展团队协作、数据库工作台或插件市场（`docs/Product.Direction.md:5,24-26`）。

### 现场保留

- 调研开始 `git status --short` 已有 `src/App.tsx`、`src/store.ts`、`src/styles.css` 修改与未跟踪 `.serena/`。当前功能资料为新建 `docs/current/`。
- `git diff` 可见既有修改主动精简导航为记录/回收站/账本，移除日期分组与快捷键入口，增加显式标签编辑、列表工具、滚轮滚动选择，清理样例与旧状态内容。不能以“修文档”为由恢复这些删除，也不能将它们计入本次成果。
- 应用源码本次调研未改动，未进行 Git 写操作。

### 进度与文档差异

| 能力 | 实际实现与证据 | 当前文档差异 |
| --- | --- | --- |
| 导航 | `View` 仅 all/trash/ledger/settings；记录/回收站主导航，账本弱化，设置位于侧栏底部（`src/App.tsx:7,49-58`） | README:38、Progress:9 仍列今日/明天/准备中视图，已与工作区不符 |
| 日期 | 编辑器默认今日，滚轮年/月/日，可保存日期；新保存记录 status=none（`src/App.tsx:110-120`） | 不再具有日期独立视图；不要把保留日期能力描述为恢复旧导航 |
| 快捷键 | 当前全局仅 Escape 关闭编辑器和移动导航（`src/App.tsx:32`） | README:43 与 CHANGELOG:24 声称 Ctrl/⌘+Enter、Ctrl/⌘+K；工作区未实现这些监听 |
| 编辑格式 | 当前工具栏为标题、粗体、斜体、列表；颜色字号转换/展示兼容仍保留（`src/App.tsx:76-103,118`） | README:49、CHANGELOG:21 仍称可编辑颜色与字号；实际没有操作入口 |
| 安全笔记 | 草稿写入/恢复、删除撤销、回收站恢复、永久删除再次确认（`src/App.tsx:45-47,107-115`；`src/store.ts:25-29`） | 基本一致；永久删除确认以 5 秒 toast 提供，非独立确认弹窗 |
| 账本 | CRUD、收入支出汇总、分类图与流水（`src/App.tsx:36-37,121-123`） | 汇总按当前月；传入 Ledger 的 items 是全部交易，图表与流水按全部 items，标题/图例却标本月。不能笼统声称完整“月度支出分布”一致 |
| AI | 主动点击提交才 askAi；摘要最多 50 条未删除笔记和 80 条交易；Web 仅显示桌面能力提示（`src/App.tsx:127-132`；`src/desktop.ts:8-15`） | 当前未提供会话历史、流式答案或筛选上下文；“分析本月”提示实际仍发送未按月筛选的交易摘要 |
| 后续能力 | 未观察到收藏、历史版本、附件、组合筛选、FTS5、多端同步实现；类型只有 Note/Transaction/AppData（`src/types.ts:1-32`） | README:64、Product.Direction:9-12 将其放在下一阶段，符合现状 |
| 发布验证 | package 0.3.0，build/check/desktop/release 命令存在（`package.json:4-14`） | Progress:15-22 的构建/MSI 与 NSIS 超时记录是 2026-09-13 历史验证，不能代表本轮验证 |

## B. 入口与主流程

- Web：`src/main.tsx:7-10` 注册 PWA service worker 后挂载 React StrictMode/App；`vite.config.ts:6-18` 端口 1420，PWA 自动更新、独立窗口 manifest。
- 笔记：侧栏新建/顶栏加号/内容捕获入口 → NoteComposer → 纯文本转换 → 草稿 localStorage → 保存更新 App 状态 → 浏览器保存及可选桌面 SQLite 保存（`src/App.tsx:20-28,41,51,61,65,106-116`）。点击卡片进入编辑；回收站卡片正文点击直接恢复（`src/App.tsx:85`）。
- 查找：顶栏 query 对笔记 content 大小写不敏感 includes，标签入口也只是将 query 设置为标签文本（`src/App.tsx:34,55,61,73`）。不是精确标签匹配，也不是全文索引；当前没有单独清除筛选按钮。
- 账本：侧栏 → 本月摘要 → 记一笔/点流水编辑 → 金额、收入支出、分类、备注 → 保存。删除交易直接过滤，没有撤销或回收站（`src/App.tsx:42,62,121-123`）。
- AI：顶栏 AI → 抽屉检测本机凭据 → 快捷提问或文本提交 → 桌面命令 → 答案；打开抽屉会检查/迁移凭据但不提交笔记摘要（`src/App.tsx:129-132`；`src/desktop.ts:8-15`）。
- 设置：侧栏底部齿轮 → 主题/导出/导入。导入直接替换记录与账目，UI 提示了替换语义（`src/App.tsx:44,58,124`）。

## C. 关键模块与职责划分

| 模块 | 职责及边界 |
| --- | --- |
| `src/App.tsx`（133 行，约 32.8 KB） | 应用状态、持久化触发、导航、四个视图、两个编辑器、富文本转换、日期滚轮、AI 全部内聚；多行被压缩到一行，行数低不代表体积小 |
| `src/styles.css`（34 行，约 28.9 KB） | 布局、控件、浅深主题、响应式、编辑器、AI；一行多规则，后续补丁通过重复覆盖追加 |
| `src/store.ts`（44 行） | 浏览器 localStorage、草稿、样例、旧状态迁移、备份解析。迁移是既有未提交现场，本次不扩写 |
| `src/desktop.ts`（15 行） | Tauri invoke 桥接、是否桌面判断、AI 配置与请求 |
| `src/types.ts`（32 行） | 笔记、草稿、交易和备份结构；仍保留旧 NoteStatus 兼容 |
| `src-tauri/src/lib.rs` | SQLite 初始化/迁移/load/save，Windows 凭据，DeepSeek 请求；`32-37` WAL 与 deleted_at 兼容迁移，`100` 命令注册 |

当前已有纯 props 视图边界（NotesView、Ledger、SettingsView），NoteComposer、日期滚轮与 AI 抽屉也以 props 接入，富文本转换为纯函数（`src/App.tsx:72-133`）。这提供受控提取的既有边界；不是必须重写全局状态或更换编辑器的证据。CSS 的主题硬编码、连续重复选择器与压缩写法会提高调试成本（观察事实）；全面拆分和新设计系统的成本需后续方案单独衡量。

## D. 视觉与交互现状

- 桌面侧栏固定 255px，顶栏 74px；内容最大 860px、水平 padding 48px、上方 padding 61px。主色米白和紫，卡片白底、细边、圆角 13-24px、轻阴影（`src/styles.css:5-16`）。当前没有光粒、Canvas 或持续动画。
- 现有渐变是 capture-entry、focus-card、AI 图标；主要动画为 hover 上移、弹窗入场、日期展开、滚轮平滑滚动（`src/styles.css:12-15,29,34`）。没有 prefers-reduced-motion 规则，没有动效暂停入口。
- rich-composer 宽度先 620px 再 680px，但 Modal 的直接 grid 子元素是无 class 包装 div，没有显式宽度（`src/App.tsx:86`；`src/styles.css:15,29,34`）。主代理在 1265×712 浏览器观察编辑器约 300px 宽。**（推断）** `place-items:center` 的包装元素按内容固有尺寸收缩，内部百分比宽度不能为包装建立预期可用宽度；需实测包裹层 rect/CSS 或移除该约束后对照确认，不能只改 inner width 宣称已修复。
- 顶栏搜索和加号对所有视图保持相同；账本/设置下搜索仍为笔记搜索且不影响当前内容，加号仍新建笔记（`src/App.tsx:61-62`）。场景语义不统一是现状。
- 标签列表位于笔记底部，最多 10 个；正文卡片显示标签但其 chip 不是筛选按钮；搜索态隐藏底部标签区（`src/App.tsx:35,73,85`）。固定标签是更可见的再次访问入口。
- 搜索无结果复用“这里还很安静”的首次记录空态（`src/App.tsx:73-74`），没有明确结果数量或清空搜索入口。
- `.note-actions` 和交易删除默认透明，仅 hover 可见；移动端只对旧 `.remove` 特例放开，没有 `.note-actions` / `.delete-transaction` 对应规则（`src/styles.css:18,22,24`）。键盘 focus-within 也未观察到。
- Modal 没有 dialog role、aria-modal、focus trap、关闭后焦点恢复（`src/App.tsx:86`）；部分图标按钮没有可访问名称，编辑区只有 data-placeholder（`src/App.tsx:50,58,61,85,116,123,132`）。Escape 不关闭 AI；移动侧栏 z-index20、弹窗10、AI25（`src/styles.css:15,18,26`）。
- 深色规则覆盖大部分容器，但预览段落/标题仍使用 `.markdown-preview` 的浅色深字规则，dark `.note-body>p` 不匹配实际 preview 内段落（`src/styles.css:28,30`；`src/App.tsx:85`）。对比度需实际测量，不能仅以存在深色开关为验收。
- 移动断点 720px 将侧栏移出屏幕；390px 再微调字号。最后追加 `.ledger .stat-grid` 规则会覆盖先前移动 `.stat-grid` 列定义，同时 first-child span2 仍生效（`src/styles.css:18-19,34`）；有移动账本排列不一致风险，需截图确认。

## E. 官方参考与采用取舍依据

此处是调研结论，供后续方案选择，不是已实现或用户已确认。

| 官方资料 | 可采纳依据 | 取舍 |
| --- | --- | --- |
| [W3C WCAG 1.4.3 对比度](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | 普通文字目标 ≥4.5:1，大字 ≥3:1；软色背景与清晰正文可同时成立 | 舒适不应靠所有文字变浅；装饰色与内容文字按用途区别对待 |
| [W3C C39 减弱动效](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)；[web.dev 动效可访问性](https://web.dev/learn/accessibility/motion) | 尊重系统 prefers-reduced-motion；非必要移动可关闭，保留内容与操作完整 | 不以减慢速度代替停止粒子；CSS 与日期选择里的 JS smooth 都需覆盖 |
| [W3C WCAG 2.2.2 暂停/停止/隐藏](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) | 自动启动、持续超过5秒且伴随其他内容的运动信息需要暂停/停止/隐藏机制，除非必要 | 如采用长循环装饰光粒，提供明确停止选项作为低干扰边界；纯装饰是否严格落入运动信息需按实际形态判断，不能把条文过度扩大 |
| [web.dev 高性能 CSS 动画](https://web.dev/articles/animations-guide) | 优先 transform/opacity，避免反复触发布局或绘制；性能面板确认成本 | 少量 CSS 点/静态柔光与现有 React/CSS 更匹配；大范围 blur、动态阴影、Canvas 引擎或粒子依赖的价值目前没有证据，不能先引入 |
| [GOV.UK Details](https://design-system.service.gov.uk/components/details/) | 渐进披露适用于只有部分用户需要的信息，不隐藏大多数用户都需要的操作 | 日期滚轮、次级说明可折叠；新建、保存、筛选清除与已有数据安全操作需直接可发现。借用原则即可，无需照搬政务视觉 |
| [W3C APG Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | 对话框标识、初始焦点、Tab 留在对话框、Escape 关闭、关闭后回到触发点 | 复用既有 Modal 边界比所有面板各自实现更易核验；完整状态框架没有必要证据 |

**有界体验候选（推断）**：保持现有记录中心导航，优先让搜索/清除/标签入口和新建动作对应所在视图，修复编辑区可用宽度与深色阅读，给操作明确的文字/焦点/状态，再用可暂停、少量、低频的环境光点满足视觉气氛。不要恢复用户已经删除的日期导航，不混入历史版本、同步、附件或整套状态架构迁移。具体候选是否进入本轮由 coordinator 在方案阶段裁决。

## F. 已阅读文档与验证方式

已阅读 README.md、CHANGELOG.md、docs/Project.Progress.md、docs/Release.Testing.md、docs/Product.Direction.md、docs/Docs.Maintenance.Conventions.md、本功能 README.md；并读取 App/styles/store/desktop/types/main、package、Vite 配置及 Rust 关键入口。

- 现有自动检查：`npm run build`=TypeScript + Vite/PWA；`npm run check`再 cargo check；`cargo test --manifest-path src-tauri/Cargo.toml` 没有实际用例（`package.json:6-14`；`docs/Release.Testing.md:9-18`）。未发现前端测试 runner 配置。
- 主代理已告知本轮 `npm run build` 退出码0、PWA产出成功、closeBundle插件计时提示；**这是协调回传，不作为本调研 agent 独立验证成功的证据**。最终实现必须由主代理再次运行验证、读取完整输出。
- 调研命令均为读取，退出码0；Git 只出现 CRLF 替换 warning，没有读取失败。
- UI 本轮主代理已用实际浏览器观察导航/弹窗/账本；详细证据由 `ui-observations.md` 收录。本调研未冒充自己执行这些手测。
- 后续必要手测由项目约定限定：连续输入顺序、选区格式、保存展示、回填、快捷键、深色；宽/窄屏、移动导航与键盘；如果影响安全路径，再查草稿、撤销、恢复、永久删除和迁移（`AGENTS.md` 用户会话约束；`docs/Release.Testing.md:20-28`）。

## G. 不确定点清单

- U1：柔和改造密度和范围用户尚未选定。主代理已发选择题，未答；答案由 coordinator 写 clarifications.md。不得将候选描述为用户同意。
- U2：弹窗固有尺寸收缩原因尚需浏览器布局测量；已有代码与视觉同时指向包装层，但未做受控对照。
- U3：当前深浅主题的实际颜色对比度、窄屏账本溢出、输入法/滚轮行为尚未在所有路径手测；实现验收需要覆盖。
- U4：Tauri Windows 100/125/150% 缩放、历史复杂笔记回填与真实数据库兼容仍是进度文档中的人工待确认项；Web验证不能推导桌面已验证。
- U5：当前月图表/流水范围是否本轮修正，需要 coordinator 按“能力使用优化”划定范围；已确认代码不一致，无需继续扩大数据模型。

## H. 给 readiness reviewer 的最小可核查证据

- 原始需求/现场：本功能 README.md；`git diff -- src/App.tsx src/store.ts src/styles.css`，确认现有导航精简与迁移不是本轮新增。
- 已观察事实：`src/App.tsx:7,32,34-37,61-62,86,106-120,127-132`；`src/styles.css:15,18,22,28-34`；`src/store.ts:13-29`；`src/types.ts:1-32`。
- 当前文档：README.md:38-50、Project.Progress.md:9-22、Release.Testing.md:9-28；不要将历史构建记录算作本轮检查。
- 业界依据：上述6行官方资料表，分别支持对比度、减弱/暂停、动画性能、渐进披露与对话框行为。
- 推断：弹窗收缩原因、体验候选及提取价值；不确定点 U1-U5 尚未关闭，不能仅依据本摘要自动判定 readiness PASS。

## 发现但未改动（范围外候选）

- `src/store.ts:40-44` 备份解析只校验数组而不逐条校验；App import直接替换，没有运行时确认。这是既有数据导入安全议题，需单独范围决定。
- `src/App.tsx:24` 固定标签 JSON 解析、`src/store.ts:17,32` 主数据 JSON 解析缺少损坏回退；与本次视觉要求无直接对应，不擅自补。
- `src/App.tsx:26-28` 桌面初次加载为空时仍保留浏览器样例，两个 effect分别保存全量；真实空数据库/并发保存语义需单独调查，不因UI改造改存储层。
- `src/styles.css:1` Google Fonts 外部加载与完全离线字体效果存在差异；暂未证明离线失败，不新增字体打包系统。
- `src/App.tsx:118` 依赖 document.execCommand，编辑兼容需手测；本轮没有引入大型编辑器重写的事实需求。

---

## 跨功能事实（待确认）

### 架构与约束

- [2026-10-02] App 的实际职责远多于133行表象，约32.8KB；样式约28.9KB，仅34行，后续维护需同时观察体积与压缩规则，不能只靠行数判断变更风险。
- [2026-10-02] Web AI 与桌面 AI 的能力边界由 Tauri invoke 决定；浏览器 UI 手测能验证入口状态，不能代替桌面凭据、网络或SQLite验证。
