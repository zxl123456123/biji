# 笔记正文内三维晴小团：低层实施计划

2026-10-06。类型 T3；规划路径，权威输入为 [clarifications.md](clarifications.md) 的「完整实现基线」；[readiness 第 2 轮](review_notes_readiness_2.md) 已 PASS。本文只规划，不记录实施成功。

## 1. 范围与核心链路

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.1] 按第 1 轮计划评审，采用「合法同形结构化粘贴可规范化为受限宠物块」的最小合同；不凭节点来源或会话身份区分工具插入与粘贴。另将当前外观的阅读入口传递写成显式调用链，并给漏传时的确定默认值。

**目标锁**：每条笔记可选、至多一处，在普通正文光标处插入原创晴小团块；编辑时三维可见，草稿、保存、重开和备份保持位置与身份；装扮取当前衣橱配色、头饰、配件并强制角色为 `xiaotuan`。阅读卡片、花园、图详情、拖拽预览只在原位置显示无交互静态形象。搜索和复制得到「晴小团」而非指令；模型失败静态回退。

**反目标与不影响项**：不发布第三方 GLB、不保存或渲染任意 HTML、不新增附件/数据库列、不迁移编辑框架、不让列表创建 WebGL；原有文本排版、标签、全局悬浮宠物和伙伴页逻辑保持。旧 EXE 写回兼容性未证，不能据字符串字段相同就作保证。

**现状主链**：`Note.content` 字符串 → `withoutTags` → `parseNote` → `noteHtml` 回填浏览器拥有的 `contentEditable`；编辑 DOM → `editorHtmlToMarkdown` → 草稿/`Note.content` → SQLite TEXT/JSON；同一解析器给 `renderMarkdown`、`notePlain`、搜索与摘要供数。

**改动落点**：只增加一个受限的独占行语义 `[[pet:xiaotuan]]`，及其受控 DOM 原子节点、静态 React 预览和编辑区单个 3D 挂载。保存链与数据库结构不变，因为它们已经携带纯文本正文；不能将渲染 DOM 当数据源以外的持久结构。

**主链接口矩阵**：

| 从 → 到 | 合同 | 本轮变化 / 兼容 |
| --- | --- | --- |
| `Note.content` → `parseNote` | UTF-8 文本；精确独占行且代码围栏外才识别 `[[pet:xiaotuan]]` | 新 `NoteBlock.kind='pet'`；未知、转义、行内、围栏内维持字面文本；每篇只把首个合法指令识别成块，后续同形行按普通字面文本处理 |
| AST → `noteHtml` → 编辑 DOM | 只生成代码控制的结构 | 独立 `<div data-note-pet="xiaotuan" contenteditable="false">` 原子宿主；静态中文兜底先存在，随后仅在其内部挂载 React；不改写编辑根 |
| 编辑 DOM → `editorHtmlToMarkdown` | [修订: PLAN_DEFECT-R1.1] 接受严格同形的 `DIV[data-note-pet="xiaotuan"][contenteditable="false"]` 独立块，来源可以是工具或粘贴；同篇仅输出一次受限指令 | 在通用递归前识别并保留前后行顺序；删除后不输出；本功能不解释非法字段或任意 HTML 为可执行内容，也不按 HTML 持久化。同形粘贴只能得到固定原创角色，不承载脚本、URL 或额外数据 |
| AST → React 阅读 / `notePlain` | 安全 React 节点 / 可见中文 | 无按钮的静态预览，`notePlain` 产出「晴小团」；卡片复制可见文案，搜索不索引 `pet:xiaotuan` |
| App → 阅读/编辑宠物 | [修订: PLAN_DEFECT-R1.2] `petAppearance` 显式传入 `NotesView` / `NoteGraph` / `NoteComposer`；花园在 App 的 `renderNote` 闭包传入；`renderMarkdown(value, appearance = DEFAULT_PET_APPEARANCE)` 为遗漏时的明确静态默认 | 所有嵌入预览统一 `{ ...appearance, character: 'xiaotuan' }`；编辑动画独立使用 `ambientEnabled && !reducedMotion && pageVisible`，不能传现有含 `!composer` 的 `motionAllowed` |

**片段闭环充分性**：下方三个目标骨架依次标出解析识别、编辑 DOM 序列化和原生插入的判定顺序，配合接口矩阵可顺读「文本→编辑→文本→阅读/搜索」闭环；实施者仍以真实代码和浏览器结果决定具体 DOM 包装，不把骨架当最终代码。

```ts
// src/noteCodec.ts: parseNote loop, before list/quote/heading (outside fence branch)
if (line === PET_DIRECTIVE && !petSeen) { blocks.push({ kind: 'pet', id: 'xiaotuan' }); petSeen = true; continue }
// Later exact duplicates and all nonmatching text follow ordinary paragraph parsing.

// src/noteFormat.tsx: editorHtmlToMarkdown block(), before generic div/recursive branch
// [修订: PLAN_DEFECT-R1.1] Shape, not node provenance, is the contract.
if (isExactPetBlock(node) && !petSerialized) { petSerialized = true; return PET_DIRECTIVE + '\n' }
// Invalid fields use ordinary escaped text; a second valid shape does not become a second pet.

// src/noteFormat.tsx + App/NotesView/NoteGraph: [修订: PLAN_DEFECT-R1.2]
function renderMarkdown(value: string, appearance = DEFAULT_PET_APPEARANCE) {
  const petAppearance = { ...appearance, character: 'xiaotuan' as const }
  // pet block renders static PetPortrait with petAppearance, never a WebGL canvas.
}
// App passes petAppearance to NotesView/NoteGraph and into RecordGarden.renderNote;
// NotesView passes it to card and overlay; NoteGraph passes it to detail.

// src/NoteComposer.tsx: toolbar action, using retained native selection/history
if (canInsertPetAt(editor, range) && !hasPet(editor)) {
  const accepted = document.execCommand('insertHTML', false, petHostHtml)
  if (accepted) { syncFromEditor(); reconcilePetMount() }
}
```

## 2. Research 事实映射与兼容策略

| 已核对事实（[research.md](research.md)） | 实施锚点 | 证据与口径 |
| --- | --- | --- |
| `Note.content` 单字符串，草稿、SQLite TEXT、JSON 均原样承载 | `noteCodec.ts`、`NoteComposer.tsx`；不改 `types.ts`/Rust/schema | `impl` 测保存草稿/JSON 的字面指令；coordinator 用副本测真实旧版时才给旧 EXE 结论 |
| `noteFormat` 未知空 DOM 会丢失 | `noteHtml` 宿主 + `editorHtmlToMarkdown` 优先分支 | `impl` 测 AST/HTML/DOM 完整往返，含前后文本；coordinator 测真实编辑保存回填 |
| `recordTools` 标签扫描保护代码，`notePlain` 供搜索 | `notePlain`、`recordTools`、搜索测试 | `impl` 测「晴小团」可搜索、指令字段不可搜索、`#标签` 仍正确 |
| 卡片正文在 `button` 内，各阅读入口共享 `renderMarkdown` | `noteFormat.tsx` 静态节点、`NotesView` 复制、App/花园/图详情调用 | `impl` 核对 DOM 无嵌套按钮/canvas；coordinator 手测全部入口及复制 |
| 每个 `Pet3DView` 持有 WebGL renderer 与循环 | 编辑宿主生命周期、`Pet3DView.tsx` 既有 dispose | `impl` 测创建/移除调用清理边界；coordinator 实测实例数、隐藏和故障回退 |
| `motionAllowed` 包含 `!composer` | `App.tsx:130,305` 的独立编辑动画输入 | `impl` 核对条件表达式；coordinator 测动态偏好/系统降动效/页面隐藏 |

**迁移与降级**：无需自动迁移；历史正文没有精确指令时按原路径。未知或畸形指令保持普通文本，不执行外部 URL。导入/导出继续存储字符串。新程序只引用公开的原创 `pets/xiaotuan.glb`；加载、WebGL 或上下文丢失后保留静态卡片并释放当前场景。旧程序写回数据副本未证之前，发布说明应写限制，不能宣称双向兼容。若原生历史无法可靠恢复插入/删除，停止功能放行，保留纯文本实现但回退/重审编辑交互，不用直接 `Range.insertNode` 绕过撤销栈。

## 3. 分阶段工作包

### S1：有限纯文本语义与安全阅读（先实施）

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.2] S1 的阅读组件统一在 `renderMarkdown` 的 pet 分支强制原创角色；不要求每个调用方自行覆盖角色。缺失 appearance 时明确显示 `DEFAULT_PET_APPEARANCE` 的晴小团，当前装扮一致性仍由 S3 全入口显式接线验收。

- **目标/输入输出/边界**：输入整篇正文，输出只识别首个、完全匹配、独占一行且不在代码围栏内的宠物块；`notePlain` 输出「晴小团」。行内代码、围栏、转义、未知角色、重复指令均作为字面文字。目标锁消费：位置/身份、静态阅读、搜索复制；反目标消费：无任意 HTML、无第三方角色、无列表 WebGL。
- **关键文件与函数/接口**：[修订: PLAN_DEFECT-R1.2] `src/noteCodec.ts` 的 `NoteBlock`、`parseNote`、`noteHtml`、`notePlain`；`src/noteFormat.tsx` 的 `renderMarkdown(value, appearance = DEFAULT_PET_APPEARANCE)`；新静态预览可在小型 `EmbeddedPetPreview.tsx` 与 `pet.css` / `styles.css` 落地。先看 `parseNote` 围栏优先级和现有 `renderMarkdown` 的全入口共享关系；目标形态是 AST 只承载 `pet/xiaotuan`，阅读安全 React 节点而非 HTML 注入，预览组件统一覆写 `character:'xiaotuan'`。跨模块字段为受限 `kind:'pet'` 和 `data-note-pet`，无新存储字段。代码片段：上方 `parseNote`、`renderMarkdown` 骨架，触发于解析分支和外观传递修改。
- **步骤/依赖/验收/回滚**：扩展 AST 与精确匹配；给 HTML 回填生成原子宿主；阅读端用强制 `xiaotuan` 的当前衣橱样式渲染无焦点静态形象；`notePlain` 同步。依赖无。`impl` 在 `tests/noteCodec.test.mjs`、`tests/searchPreview.test.mjs` 或相邻测试记录语义、XSS/未知文本、重复/代码区、标签和搜索输出，证据为命令与退出码写入 `impl_report`，不足则不得声称格式闭环。coordinator 在 `verification.md` 承接真实卡片/花园/图详情/拖拽显示与复制；未测入口标为未测。回滚为移除新 AST 和展示分支，既有文本指令会安全显示为字面文本。
- **作者体验门**：默认笔记无视觉变化；静态预览紧凑、可读、无嵌套按钮，朗读名称明确；不要在卡片复制中带内部字段。审查可直接用上方接口矩阵和测试用例预判阅读结果。

### S2：编辑 DOM 原子块、插入与原生历史（S1 后）

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.1] 将原计划中「复制粘贴伪造宿主按普通文本」收窄为「同形合法宿主可规范化为唯一受限 pet 指令；非法字段/任意 HTML 不执行、不原样持久化」。这不扩展宠物类型，也不让第二块获得宠物语义。

- **目标/输入输出/边界**：输入普通正文中的有效折叠光标和工具栏动作，输出一处独立宠物块；中段插入保留前后文字顺序，列表/引用/代码、非折叠选区、IME 组合、已有宠物时不插入并给可见提示。Backspace/Delete 删除整个块，Undo/Redo 恢复/再次删除；保存和草稿只序列化受控指令。目标锁消费：每条最多一次、作者指定位置、三维编辑、保存回填；反目标消费：不重写编辑器、不保存 DOM HTML。
- **关键文件与函数/接口**：[修订: PLAN_DEFECT-R1.1] `src/NoteComposer.tsx` 的 `captureSelection`、`restoreRange`、`runCommand`、`toolMouseDown`、初始化 effect、`syncFromEditor`、`commit` 和 toolbar；`src/noteFormat.tsx` 的 `markdownToEditorHtml`/`editorHtmlToMarkdown`、`src/noteCodec.ts` 的 `noteHtml`；`src/Pet3DView.tsx` 复用原渲染器。先看 `restoreRange` 所有权和 `execCommand` 的既有历史路径；目标形态是浏览器继续拥有编辑根、React 只拥有非编辑宿主内部的挂载目标。关键接口是编辑根直接子级的独立 `DIV`，精确 `data-note-pet='xiaotuan'` 且宿主 `contenteditable='false'`；不读取其它属性/子节点为持久数据，来源不影响判定；序列化优先于普通 `div`，组件 unmount 在 DOM 移除和 modal 清理时执行。若 `insertHTML` 不能产生该层级，按 U1 停止放行并重审插入方式。代码片段：上方 DOM→文本及插入骨架，触发于优先级和状态流转修改。
- **步骤/依赖/验收/回滚**：[修订: PLAN_DEFECT-R1.1] 先实现严格同形宿主判定和序列化：工具生成或同形 HTML 粘贴都可归一为首个受限指令，第二宿主和非法字段显示为安全字面内容，不能生成第二块；本功能不执行这些字段，也不保存任意 HTML。再加工具栏按钮：`onMouseDown` 保存选区，`onClick` 还原，`execCommand('insertHTML')` 插入独立块；原生命令失败只提示，不降级成直接节点注入。光标在普通段落中间应分块为「前文/宠物/后文」，落在空正文或段落边界同理，最终 DOM 顺序需测试；若浏览器不同实现导致结果不稳定，回退并重审，而不是悄悄把块移到尾部。随后在回填/插入/原生 undo/redo 后扫描宿主，只在首个合法宿主子容器 `createRoot` 挂载 `Pet3DView`，对已断开的宿主 unmount；`MutationObserver` 或等效编辑根监听只用于宿主挂载/清理，不重建正文。React 根与浏览器编辑根职责不能交叉。`Pet3DView` 参数固定原创 GLB、`mood='idle'`、`fallback` 静态预览；装扮用当前 appearance 的三个外观字段并覆盖角色。最多一处编辑宿主，一个编辑 3D 实例。序列化忽略 React/canvas 子树。
- **自证与承接**：[修订: PLAN_DEFECT-R1.1] `impl` 增补 DOM 往返/草稿/JSON 备份的测试，覆盖中段位置、删除后的字符串、同形合法 HTML 粘贴只生成一个受限块、第二同形宿主不生成第二块、非法字段与任意 HTML 安全转义、现有格式和标签；运行 `npm test`、`npm run build`，命令、退出码、完整失败记录入 `impl_report`，只通过解析器测试不得声称原生历史通过。coordinator 在 `verification.md` 用真实浏览器手测连续输入顺序、段中插入、粘贴同形节点/重复节点、块前后删字、Backspace/Delete、Ctrl/⌘+Z/Y、IME、选区格式、保存重开、草稿恢复、快捷键、亮暗主题和输入焦点；失败不放行编辑交互。依赖 S1；回滚先撤去工具按钮/挂载，保留安全只读语义，若需彻底回滚再撤 S1。
- **作者体验门**：按钮名「插入晴小团」，只在可插位置启用或拒绝时说明原因；插入后光标留在块后可继续写，块不能被逐字编辑；拒绝操作不损失选区或已有正文。编辑区 3D 即使失败仍显示同样大小的静态卡片，避免布局跳动。

### S3：全入口接线、动效/资源与文档（S1、S2 后）

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.2] 外观不再笼统地「按现有共享入口传入」：App 持有的 `petAppearance` 要逐层传给 NotesView 卡片/覆盖层、NoteGraph 详情和 RecordGarden 回调。`renderMarkdown` 的默认外观仅作漏传时的确定降级，不能替代当前装扮验收。

- **目标/输入输出/边界**：当前衣橱状态和用户动效偏好流向 S1/S2；所有读取入口安全呈现，WebGL 仅编辑区挂载。目标锁消费：装扮跟随、入口一致、故障回退；反目标消费：不改变全局悬浮宠物/伙伴页，不给笔记卡片生成 renderer。
- **关键文件与函数/接口**：[修订: PLAN_DEFECT-R1.2] `src/App.tsx` 的 `petAppearance`、`motionAllowed`、`NoteComposer`/`NotesView`/`NoteGraph` 调用、`RecordGarden.renderNote` 回调；`src/NotesView.tsx` 的 `NotesViewProps.appearance`、`NoteCard`、`renderOverlay`；`src/NoteGraph.tsx` 的 props 和详情 `renderMarkdown`；`src/noteFormat.tsx` 的 `renderMarkdown(value, appearance = DEFAULT_PET_APPEARANCE)`；`src/Pet3DView.tsx`。先看 `motionAllowed` 的 `!composer` 与各入口共享的 `renderMarkdown`；目标形态为 App 的已应用外观显式经过 NotesView/NoteGraph props 到各自阅读节点，花园由 App 闭包直传；`renderMarkdown` 统一覆写角色为原创并在漏传时使用默认原装。编辑动画独立 `ambientEnabled && !reducedMotion && pageVisible`，页面隐藏即停帧。`CelestialNoteWheel` 若没有 `renderMarkdown` 调用，仅依 `notePlain` 摘要，不能擅自给它加预览。代码片段：上方 `renderMarkdown` 骨架及下方接线矩阵，触发于跨模块 props 和既有状态规则修改。

  [修订: PLAN_DEFECT-R1.2] **接线矩阵**：`App.petAppearance → NotesView.appearance → NoteCard.appearance → renderMarkdown(content, appearance)`；同一个 `NotesView.appearance → renderOverlay → renderMarkdown(content, appearance)`；`App.petAppearance → NoteGraph.appearance → 选中详情 renderMarkdown(content, appearance)`；`App.petAppearance → RecordGarden.renderNote` 闭包 → `renderMarkdown(content, petAppearance)`；`App.petAppearance → NoteComposer.appearance → Pet3DView`。上述每条流的静态块都由 `renderMarkdown` 统一覆写 `character:'xiaotuan'`，编辑三维入口亦覆写。漏传时 `renderMarkdown` 采用 `DEFAULT_PET_APPEARANCE`，仍只显示原创角色，但不算当前装扮一致性通过。
- **步骤/依赖/验收/回滚**：[修订: PLAN_DEFECT-R1.2] 按接线矩阵传递 appearance 与独立编辑动画条件；用 `rg 'renderMarkdown\(' src` 核对全部阅读调用点显式传参，补一项当前装扮非默认值在 NotesView 卡片、覆盖层、图详情、花园都一致的验证；默认参数只覆盖未来漏传时的安全降级。补 README、CHANGELOG、`docs/Project.Progress.md`、`docs/Note.Formatting.md` 受影响事实与 feature verification 记录。`impl` 以 rg/构建/测试、构建产物扫描确认只含原创模型且无新增数据库/附件字段，证据入 `impl_report`；coordinator 实测浅深色、当前装扮变化、页面隐藏/恢复、系统减少动态、动效开关、模型加载错误/上下文丢失、同时可见 renderer 数量，证据入 `verification.md`。旧 EXE/Tauri 只在数据副本上可选实测，未做则明记未证。若资源或原生历史验收失败，撤掉编辑 3D 挂载并按 S2 回退口径处理。依赖 S1/S2。
- **作者体验门**：保留卡片点击区域完整；静态标签和图像体量不遮挡正文；模型失败时仍能辨认块及继续编辑。文档用“已实现/未证”区分，不把计划写成事实。

## 4. 风险、事件对齐和 Gate

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.1] 风险承诺从不可证明的「粘贴来源防伪」改为字段与语义的白名单约束；[修订: PLAN_DEFECT-R1.2] Gate-1 重新核对全阅读入口接线和默认外观语义。

- **U1 DOM 形态与原生历史**：`insertHTML` 在实际浏览器如何拆段、浏览器 undo 是否恢复不可编辑宿主，需 coordinator 手测；失败时回到 S2 调整或停止放行，不能以 `Range.insertNode` 绕开。`impl` 仅验证代码安全和 DOM 往返。
- **U2 多挂载与 context loss**：`MutationObserver` 对 undo/redo、删除、modal 卸载必须清理 root/scene；coordinator 查看实际 renderer 与显存/卡顿。模型失败静态降级是必要验收。
- **U3 旧版数据**：无 schema 迁移，但旧 EXE 可能把新指令保存为字面/改写；仅数据副本实测可下结论，未测记发布限制。
- **U4 受控 DOM 与粘贴**：[修订: PLAN_DEFECT-R1.1] 工具插入和同形合法粘贴都能产生首个固定 `xiaotuan` 指令，这是允许的结构化输入；不得依赖 DOM 节点来源作为安全边界。非法 `data-note-pet` 值、缺少 `contenteditable='false'`、非独立块及额外 HTML 内容不由本功能解释为脚本或外部资源，也不能作为 HTML 持久化；第二个合法宿主也不能变第二宠物。浏览器对其它 HTML 粘贴的瞬时处理仍是现有编辑器边界，不能把此序列化合同误称为通用粘贴净化。序列化安全、粘贴单块和重复块由测试与实施后审查双重核对。
- **澄清批量模板**：当前未触发新的阻塞提问，因为数量/位置及动画已由基线与 readiness 约束给出；若新增范围/验收/回滚口径不唯一，向 coordinator 一次提交 `【DELEGATE_QUESTION】`，按 P0 阻塞、P1 高风险、P2 优化排序，列 2–4 个方案、推荐项及对 LWPlan/Impl 的影响；先回写完整实现基线再续。
- **事件触发对齐留痕**：新假设、新风险或 `LWPlan → Review(LW)` 阶段切换，coordinator 应更新 `README.md` 阶段及 `clarifications.md`/review 记录；本计划新增的中段拆块/宿主防伪属于实现细节假设，已在 S2 标明真实浏览器验收和失败回退。当前未发现 shared contract drift。

**Gate-1 自检（lwplan agent）**：[修订: PLAN_DEFECT-R1.1][修订: PLAN_DEFECT-R1.2] 按第 1 轮 defect 重做 T3 存在性核对：目标锁/反目标/不影响项、主链、research 事实映射、跨模块接口、兼容/迁移/降级、S1–S3 的文件/函数/接口锚点、步骤/依赖/验收/回滚、测试分层、作者体验门、风险与失败策略均存在；同形粘贴 → 唯一受限 token → AST → 静态/3D 节点和 `App.petAppearance` → 全阅读入口的代码片段/矩阵已能顺读主链。各工作包均有 `impl` 自证证据、coordinator 真实环境证据、证据不足不放行的三元组。已实施支撑文本未删除，修订章节均有「本轮修订说明」和修订标签，未命中删除已实施文本的升级条件。Gate-1 自检 PASS，仅放行重新独立计划评审；第 1 轮 Gate-2 的 FAIL 保持为历史事实，功能仍未实施或验证。

**Gate-2（review_plan 主检，coordinator 复核）**：逐包核对目标锁与反目标映射、锚点和目标形态可预判、三段片段顺读主链充分性、验证责任和证据缺口、作者体验及静态/3D 分层；任一必备项缺失回 `LWPlan → Review(LW)` 修订；若是产品口径不唯一，先委托澄清并重算基线。实施后 review 独立检查实际格式、安全、资源和范围，不能用计划评审代替。验证产物为 `impl_report`、实施后 review 记录与 coordinator 的 `verification.md`；没有真实浏览器证据只能报告缺口，不能称可发布。

---

## 跨功能事实（待确认）

### 架构与约束

- [2026-10-06] 任何新正文语义都须贯通有限文本 AST、编辑 DOM 往返、安全 React 阅读和 `notePlain`，因为搜索、摘要与多个阅读入口共享该链。
