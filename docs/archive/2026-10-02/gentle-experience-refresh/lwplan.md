# 晴笺 0.4.0 最小 MVP 低层方案

日期：2026-10-02。输入为完整实现基线、hlplan、两份 research、readiness/HL 第 1 轮 PASS。任务类型 T3（跨组件与 Windows 发布，不增加数据模型）。用户持续开发/构建 EXE 授权已落盘，无再次审批依赖；本方案仍须独立 Gate-2 后才能实施。

## 1. 范围、主链与契约

目标 G1：记录操作闭环及本月账本一致；G2：纸感浅深主题、窄屏和独立可停止节点；G3：有界整理、保留现场、验证并交付 EXE。反目标 A1：不加关系图/收藏/历史/同步/附件/月份切换/排序/大引擎；A2：不展示内部格式、不主动上传、不承诺零 bug；A3：不丢弃原修改、不提交生成物、不改写历史。不影响项：Note/Transaction/NoteDraft、AppData.version=1、SQLite schema/存储编排、AI 请求范围及旧格式兼容。

核心链路：App 状态 → 纯筛选/月份计算 → NotesView/Ledger；NoteComposer → 现有纯文本转换/草稿 → App.saveNote → 既有 browser/Tauri 保存；外观偏好 → AmbientNodes 私有 Canvas 循环。只提取已有编辑器、弹窗、格式函数和纯计算，不拆所有视图或加全局状态框架。数据/AI 层不改，是避免迁移与上传风险的主要边界。

| research 事实 | 实现锚点 | 验证锚点与口径 |
| --- | --- | --- |
| App:34 标签为裸 query，缺未完成/清除 | recordTools.selectNotes；App/NotesView | impl 表驱动测试近似标签、组合、done/deleted；coordinator 真 UI 清除/切视图 |
| App:36/62 摘要本月但 Ledger 全量 items | recordTools.selectMonth/monthTotals；App → Ledger | impl 跨月/跨年/空月；coordinator 旧月样例不进入图与流水 |
| App:86 包裹层缩至约 305px，无对话框焦点边界 | Modal；CSS .modal-frame | coordinator 窄/宽尺寸、Tab/Shift+Tab/关闭恢复/页面滚动；缺实际证据不称修复 |
| App:32 只有 Escape；107–118 草稿无反馈与 execCommand | App keys；NoteComposer commit/草稿 effect | impl 类型/构建/守卫审查；coordinator 输入、选区、回填、快捷保存、恢复 |
| CSS 重复覆盖、dark preview 不匹配、触屏动作透明 | styles tokens/markdown-preview/actions | coordinator 浅深/窄屏/触屏与正文对比；不只检查有 dark 规则 |
| 当前无粒子；StrictMode 与保存 effect 必须隔离 | AmbientNodes lifecycle；SettingsView 偏好 | impl 上限/清理静态审查；coordinator 开关/hidden/reduced-motion 与实际测量 |
| 文档能力漂移/旧 NSIS 超时/备份版本与产品版本不同 | S5 元数据/当前文档/发布证据 | coordinator 当前命令与哈希；历史结果不代替当前验证 |

片段闭环说明（先主链、后工作包）：S1 导入骨架定位 App 保存编排与提取后的编辑/格式边界；S2 条件输入、月交易子集与编辑内提交贯通操作→派生展示/既有保存；S3 frame/token 骨架配合焦点与滚动合同覆盖可操作界面；S4 私有 start/stop/sync 骨架覆盖独立动效与停止条件。四组片段共同说明业务主链和装饰支链之间没有逐帧状态/持久化耦合；第 3 节保留综合闭环与发布证据说明。

## 2. 工作包与详细设计

各工作包统一证据合同：impl 只做本地代码、纯计算用例、类型/构建等 impl-safe 自证，命令、退出码及完整输出记录 `impl_report_r1.md`；不执行真实浏览器、桌面启动、AI请求、安装、发布或 Git。coordinator 独立运行必要命令，浏览器证据放 `ui-observations.md`，打包/启动/性能及原生限制放 `release-verification.md`。缺少证据只能标未验证或待承接，不按推测 PASS。所有代码注释英文、文档中文；保留可理解的组件名/props，不再增加压缩成一行的复杂逻辑。

### S1：先整理已有职责（G3，A1/A2/A3）

- **文件/入口**：`src/App.tsx` 的 NoteComposer/EditorToolbar/DateWheelPicker/Wheel、Modal 与格式函数；新增平铺的 `src/NoteComposer.tsx`、`src/Modal.tsx`、`src/noteFormat.tsx`、`src/recordTools.ts`。前两者按既有 props 边界提取；noteFormat 保留 renderInline/renderMarkdown、escapeHtml/inlineToHtml、markdownToEditorHtml/editorHtmlToMarkdown；recordTools 保留 money/dateKey/today/dateLabel、tagsFor/withoutTags/normaliseTag/contentWithTags。
- **顺序/目标形态**：先等价搬移并更新 imports，再进入 S2–S4。App 继续保存与导航，编辑器仍调用 store 草稿与 onSave；不删除任何格式支持，不拆全体视图。不引入新循环依赖：recordTools → types（仅类型），noteFormat → React，Modal → React，NoteComposer → 上述模块/store/types，App → 这些模块。
- **片段判断**：提取改变调用位置，下面骨架覆盖调用边界；各函数体原样保留，文字与导出名单足够定位，不需要复制 8KB 转换代码。

```tsx
// App.tsx: former local definitions become imports; save ownership stays here.
import { NoteComposer } from './NoteComposer'
import { Modal } from './Modal'
import { renderMarkdown } from './noteFormat'
import { money, today, tagsFor, withoutTags } from './recordTools'
// NoteComposer still receives note, availableTags, onClose, onSave.
```

- **作者体验**：可编辑 props/格式函数声明清楚，源码重排只为职责提取；不得把格式重写混进等价整理。
- **验收/证据**：impl build 与格式函数/props 对照放 impl_report；coordinator 编辑器往返/旧格式显示放 UI 记录。依赖：无。回滚：仅逆向本轮搬移及 import，禁止用 HEAD restore 覆盖原始工作；记录结构快照，和后续行为补丁分开组织。

### S2：常用操作与本月口径（G1/G3，A1/A2/A3）

- **文件/关键 handler**：recordTools 的新 `selectNotes`/`selectMonth`/`monthTotals`；App 的 visibleNotes/currentMonth、nav/onTag/keys/新建/复制；NotesView/NoteCard；NoteComposer 草稿 effect/commit/onKeyDown。reviewer 先看 App 的输入条件和传给 Ledger 的子集，预期形态为明确 UI 条件→一次纯计算→展示，而非修改持久化数据。
- **筛选合同**：query trim 后大小写不敏感 includes（保持当前正文查询兼容）；tag 采用与现有标签去重一致的大小写敏感完整字符串匹配，`旅行` 不命中 `旅行计划`。标签状态与 query 独立，条件 AND；unfinished 使用 !done；trash 按 deletedAt 隔离。返回新数组、保留原顺序、不修改源记录。记录页显示全部/未完成、选中标签/搜索结果数/清除；无结果显示“没有找到匹配记录”，与首次空态区别。清除同时清 query/tag/unfinished；进入回收站清条件避免隐藏已删除记录。固定标签入口也设 tag，不写裸 query。
- **键盘/场景**：顶栏加号与主要新建在账本创建交易，其他可创建场景创建记录并关闭移动导航；搜索在记录/回收站有意义，账本/设置提供去查找的上下文入口或隐藏输入。Ctrl/⌘+K 在无 composer/AI 时切记录页并下一帧聚焦搜索；不会停在不响应查询的旧 view。Escape 非 composing/229 时按 composer → AI → 移动导航优先关闭一个层；不在 IME 选词时关弹窗。Ctrl/⌘+Enter 仅 NoteComposer 内触发 commit，保护 composing/229、repeat、空内容及同次重复保存；普通标签 Enter 仅添加标签，组合输入不加标签。不要恢复旧全局 Enter 监听。
- **草稿/复制**：沿已有草稿键与写入条件，在成功写入后显示“草稿已保留在本机”，恢复已有草稿显示“已恢复草稿”，未变编辑显示“编辑记录”；不得用该文案承诺 SQLite 保存。草稿初始化聚焦 timeout 必须清理。NoteCard 给复制正文按钮，读取安全渲染 preview 的 innerText（必要时 textContent fallback），保留标题/列表/代码的显示文字、排除标签元数据；用用户点击调用 clipboard.writeText，成功/失败 toast，不持久化任意 HTML。按钮有名称，正文依旧点开编辑。
- **本月合同**：selectMonth(items, now=new Date()) 以本机 year/month 判断 createdAt，非法日期排除，保留源顺序；monthTotals 只汇总传入集合。App 将同一个 monthItems 同时供摘要、分类、流水；本月标签与该子集一致。无需改交易字段或 AI 摘要。

```ts
// recordTools.ts: new pure input/output contracts.
type NoteFilter = { query: string; tag: string | null; unfinished: boolean; trash: boolean }
selectNotes(notes: readonly Note[], filter: NoteFilter): Note[]
selectMonth(items: readonly Transaction[], now?: Date): Transaction[]
monthTotals(items: readonly Transaction[]): { income: number; expense: number }
// App.tsx: old Ledger items={transactions} becomes monthItems for all sections.
const visibleNotes = selectNotes(notes, { query, tag: selectedTag, unfinished, trash: view === 'trash' })
const monthItems = selectMonth(transactions)
const { income, expense } = monthTotals(monthItems)
<Ledger items={monthItems} income={income} expense={expense} ... />
// NoteComposer.tsx: section-scoped shortcut, not a global submit.
if (e.nativeEvent.isComposing || e.keyCode === 229 || e.repeat) return
if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); commit() }
```

- **测试/责任**：新增 `tests/recordTools.test.mjs`，`npm test`= `node --test tests/*.test.mjs`。已核对本机 Node v22.23.1；利用其原生可擦除 TS 类型能力导入 `../src/recordTools.ts`，该模块只保留 type imports，不用 enum/参数属性。不加测试框架/新依赖。用表驱动断言近似标签、大小写规则、query+tag+unfinished、回收站隔离/顺序/不变性、空月、跨年、月末/下月本机午夜、收入支出与无效日期；npm build 负责完整类型检查。impl 报告实际用例数与命令；coordinator 真实输入/复制/清除/快捷键/草稿与删除安全回归，缺真实 IME 时明确未验证。
- **作者体验/依赖/回滚**：依赖 S1，控制声明为直接 boolean/string，不写高级查询语言；只撤本轮条件/按钮/handler 和纯函数调用，保持原内容与存储。剪贴板失败不影响记录；快捷键异常可移除监听仍保留按钮。

### S3：纸感与对话框体验（G1/G2/G3，A1/A2/A3）

- **文件/锚点**：styles.css 的 root/light/dark、layout/notes/editor/ledger/settings/AI、media；Modal 的 wrapper/focus/body scroll；App/NoteComposer/AI 图标可访问名称。reader 先看 `.modal-frame` 可用宽度及 dark `.markdown-preview`，预期为一个明确 token 值层和按区域组织的规则，不持续追加重复覆写。
- **视觉合同**：暖白纸面、雾紫强调、浅绿收入，正文/次级文字/边框/表面/强调色、间距、圆角、阴影用集中变量；深色使用相应变量且安全格式颜色兼容可读。正文与卡片足够实色，光粒不穿透成文字噪点。保留现有记录中心导航；压缩/展开按 720px 现有断点，不恢复日期视图。移除重复规则时列明保留/合并的选择器，不改功能；旧仅备用/不相关样式不做另一次清理。主代理明确允许移除 Google Fonts 的三种外部字体依赖：采用系统中文字体和系统 mono，减少离线/首屏网络依赖、不加字体包；取舍是不同设备字体细节不同，宽度/换行需实测。
- **Modal 合同**：增加 title（供 aria-label 或 labelledby）、可选宽度类别。外层固定、统一高于移动导航/AI；frame width:min(720px,100%)，composer width:100%，窄屏减 padding，max-height:calc(100dvh - padding) 与内部滚动。dialog role/aria-modal；保存打开前焦点，初始聚焦编辑区或 autoFocus input（没有则 frame）；Tab/Shift+Tab 循环可见可用控件，Escape 交给统一层关闭；body overflow 锁定并还原原值，卸载焦点回触发元素（仍存在时）。只点击真实 backdrop 关闭，内部操作不关；StrictMode 清理不会留下锁或延迟抢焦点。
- **触屏/键盘**：note-actions/交易删除至少在 focus-within 和 coarse/no-hover 下可见；按钮足够点击面积且具 aria-label，焦点可见。窄屏账本结余跨两列、收入/支出各一列规则置于最终断点不再被桌面覆盖；检查标题、金额、AI抽屉和筛选换行无横向溢出。
- **减弱动画**：prefers-reduced-motion 停非必要 CSS animation/transition 与日期 JS smooth（用 auto）；Wheel 的 settle timeout 在卸载时清理。CSS 规则结构变化需要 before/after 的目标锚点，下面骨架与 Modal 控制合同组成足够片段，不要求写最终全量 CSS。

```css
:root { --paper: ...; --surface: ...; --text: ...; --muted: ...; --line: ...; --accent: ...; }
:root[data-theme='dark'] { /* Override the same tokens. */ }
.modal-frame { width: min(720px, 100%); max-height: calc(100dvh - 44px); overflow: auto; }
.composer { width: 100%; }
.markdown-preview { color: var(--text); }
.note-card:focus-within .note-actions { opacity: 1; }
@media (hover: none), (pointer: coarse) { .note-actions, .delete-transaction { opacity: 1; } }
```

- **验证/作者体验**：impl build/CSS选择器对照与 Modal cleanup 审查放 impl_report；coordinator 宽/窄/浅/深、编辑器选区/保存/回填/Tab/背景滚动/焦点恢复及触屏检查放 UI 记录；不以“有token”代替观感/对比度测量。依赖 S1，S2 UI controls 同步样式。回滚只撤本轮样式和 Modal行为；保留原用户 CSS 差异，不从 HEAD全文件还原。

### S4：独立背景节点（G2/G3，A1/A2/A3）

- **文件/锚点**：新增平铺 `src/AmbientNodes.tsx`；App 外观开关、SettingsView；styles 背景定位与 node color tokens。组件 props 仅 enabled/theme（theme用于重读token）；帧局部位置/速度/尺寸/时间存在 effect 私有变量/ref，绝不依赖 notes/transactions。Canvas aria-hidden、pointer-events:none、固定背景，不挡控件；仅背景低对比区域可见，避免大面积动态 blur/shadowBlur。
- **预算/绘制**：桌面24节点/最多60条可见近邻线，≤720px 12/24，最大30fps，用时间戳差值节流；大小/alpha 表示纵深、低速漂移和有限 pointer 视差（归一化幅度小，离开归零）。节点/线可见且稀疏；发光用少量小圆/预绘sprite，不每帧申请大渐变。DPR=min(devicePixelRatio,1.5,sqrt(2_500_000/(cssWidth*cssHeight)))，buffer≤250万像素；resize更新尺寸，不扩展通用配置系统。
- **生命周期与开关**：本机 `luma-ambient-motion` 默认为开启，用户设置关闭后存为 off；reduced-motion即使开关为on也不运行，设置注明“已随系统减少动态效果”。启用前同时检查用户偏好/媒体查询/document.hidden；用单一 start/stop 管理 rAF，hidden/减弱/关闭/卸载取消并清空，恢复lastTimestamp重置，不补后台位移。resize、visibilitychange、matchMedia change、pointer listeners 全部对称移除，StrictMode 不留下两个循环。Canvas缺context则静默保留完整静态界面。

```ts
// AmbientNodes.tsx: effect-owned lifecycle; no React per-frame updates.
const allowed = () => enabled && !reduceMotion.matches && !document.hidden
const sync = () => { stop(); if (allowed()) { lastTimestamp = 0; start() } }
// visibilitychange / media change call sync; cleanup cancels and removes all listeners.
// draw enforces node/line/pixel limits before drawing; pointer never changes app data.
```

- **验证/证据/作者体验**：impl 本地构建、上限和 effect cleanup 对照放 impl_report；coordinator 开关10次、系统减弱、hidden→visible、窄屏、StrictMode、连续输入并行动效检查。实际计时仅在测量时加临时 Performance 标记后移除，不加产品 telemetry；开/关同环境记录画帧开销及包体变化，1000×500中文字符隔离数据查找测量。CPU p95≤2ms/查询p95≤100ms/增量gzip≤10KB是目标，实际值/未测原因记 release-verification；不把纯计算计时称为UI到结果延迟。依赖 S3 tokens。回滚/降级优先禁用组件与偏好入口，业务功能完全可用。

### S5：版本、验证与 Windows EXE（G1/G2/G3，A1/A2/A3）

- **文件/入口**：package.json/package-lock.json 包版本与 test script；src-tauri/Cargo.toml/Cargo.lock 的 qingjian 包版本；tauri.conf.json version；README/CHANGELOG/docs/Project.Progress.md/docs/Release.Testing.md 当前能力与验证说明。全部产品元数据 0.4.0；不改 AppData.version=1 或依赖版本，不重新 npm update。
- **步骤/目标形态**：impl 同步元数据/文档并跑 npm test、npm run build、git diff --check（只读）。文档区分已实现、待验证与历史；coordinator 随后独立重跑 npm test、npm run build、cargo check、cargo test 并读完整退出/输出，完成真实浏览器回归；Review(Impl) 独立审查代码与证据，修订后才构建发布。Rust 0用例必须明说。
- **发布**：coordinator 运行 `npm run release:windows`；如果 NSIS下载失败保留完整失败输出，进行有限重试；必要时 `npm run desktop:build -- --bundles msi` 获取程序 EXE/MSI，不把 MSI命名为安装EXE。记录 `src-tauri/target/release/qingjian.exe` 和 bundle/nsis 实际文件名、mtime、大小、SHA256、版本及可行隐藏启动/进程检查；启动不代表完整原生验收。不运行安装器、不上传/发布制品、不提交 target/dist。Windows缩放/旧SQLite/IME/AI网络未实际验证要列出；AI不自动提交真实本地内容。
- **作者体验/验收/回滚**：用户文档直接写“复制正文”“背景光粒”“本月”，不露出实现语法；最终 EXE 链接可定位，当前发布事实有独立证据。依赖 S1–S4及实施审查。版本失败恢复仅本轮元数据；发布失败不删除已有包，允许交付已核验程序EXE并记录安装包缺口。Git由主代理仅提交可隔离本轮hunk，推送前读 origin/main..HEAD；无法隔离则留现场，不顺带提交未知工作。
- **片段判断**：元数据文件、目标版本和命令/产物路径清单已明确目标，不改变执行协议；文字足够，无需额外代码片段。

## 3. 顺序、验收与风险收敛

实施顺序 S1 等价整理 → S2 操作/统计 → S3 token/Modal → S4 Canvas → S5 元数据/文档/impl-safe → Review(Impl)/coordinator 实测与构建。每包保留前后对照和单独补丁边界，不能以回滚方案为授权丢弃现场；原始快照在 `%TEMP%/qingjian-pre-mvp-20261002`。

片段闭环充分性：S1 导入明确谁拥有状态/保存；S2 过滤输入与月子集展示、限定提交；S3 frame/CSS与焦点合同；S4独立帧生命周期；S5同版本制品与命令证据。结合事实映射可顺读用户操作→派生展示/编辑→既有存储，以及独立动效→停止，而不用跨包猜存储变化。没有整条函数链删除；搬移函数列表见 S1，职责与调用方保留。

coordinator 浏览器至少覆盖：连续输入顺序；选区粗体/斜体/标题/列表；保存后显示及回填；快捷搜索/保存；草稿恢复与正式保存清除；删除撤销/回收站恢复/永久删除二次确认；query/tag/未完成组合与清除；跨月账本；复制成功或真实失败反馈；浅深/窄宽/触屏；对话框Tab/关闭/焦点/body滚动；动效开关/减弱/后台。数据使用独立 origin/临时数据，不替换用户数据；未获得真实 IME/桌面历史库与缩放证据时保持未验证，不据此承诺零bug。

剩余研究 U2/U3 由 UI 对照关闭；U4/C-U4 原生和性能由发布报告具体证据或未验证说明承接。外部字体改系统字体已由主代理纳入纸感离线体验范围；JSON损坏/导入替换、桌面空库/双保存属已有范围外发现，保持报告、不扩大本轮修复。Node版本至少本机22.23.1，可在 README 测试要求注明；不为其他Node版本增加兼容框架。

## 4. 门禁、澄清与漂移

Gate-1作者自检（存在性）：目标/反目标/不影响项、文件与关键实体、S1–S5目标形态/片段/顺序/验收/依赖/回滚、每包目标映射、作者体验、impl/coordinator证据三元组、主链/事实映射/片段闭环、输入输出/边界、跨模块接口/兼容/停机、风险降级全部存在。Gate-1=PASS，仅允许交独立方案评审，不代表实现通过。

Gate-2由 review_plan主检、coordinator复核：逐包核对 anchors/props/状态/格式/帧停止、片段强制触发与闭环、验证分层/作者体验与T3必备项；任一缺失不进impl，回 LWPlan→Review(LW)。口径不唯一或需改变基线先委托提问，不自行扩大范围；实现缺陷回 impl，计划缺陷按 PLAN_DEFECT 修订留痕。

澄清本轮未触发：节点语义/能力/复制/范围均已有唯一基线及高层细化授权，不新增产品假设。若出现新假设、新风险或阶段切换，即时同步 coordinator 并在本节“事件对齐”记录；多个阻塞按 P0阻塞/P1高风险/P2优化批量排列。模板：`【DELEGATE_QUESTION】需要确认：…；优先级/影响阶段：…；A推荐+原因，B权衡；请回复Q1=A…`。跨模块信息不足用`【DELEGATE_ACTION】supplemental-research`，不递归委派。

事件对齐：readiness/HL PASS→LWPlan 已由主代理回传；主代理补充系统字体取舍已写S3；LWPlan→Review(LW) 以本稿和 Gate-1 交接，尚需独立 Gate-2。contract drift：旧 README 日期独立视图、颜色字号编辑入口与快捷键事实需按S5同步，历史研究未确认段由当前基线覆盖；plan-review readiness编号模板缺权威定义已在readiness报告记录，不在项目修改共享技能。产品版本0.4.0与备份version1明确分离，无共享类型镜像变更。

无新增跨功能事实。
