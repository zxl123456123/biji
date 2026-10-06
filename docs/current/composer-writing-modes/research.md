# 新建记录排版与写作入口：补充调研

日期：2026-10-03。输入：[README](README.md)、[用户原文](source_materials/feedback_20261003.md)。只读问题调研，不是实施方案；没有修改功能、版本、依赖、数据库、服务、Git或用户UI。

## A. 系统边界与现有能力

- 晴笺当前0.5.1，已有本地记录、所见即所得编辑和安全纯文本存储；用户要改善工具少、斜体不明显、列表及“草稿状态+保存快捷键”排版，不等于授权重做整套编辑器或覆盖已有正文。
- 实际工具栏只有4个按钮：标题、粗体、斜体、无序列表。用户看到的H1是lucide Heading1图标，真实调用却为`formatBlock h2`，保存为`# `并在预览仍渲染h2；不是完整H1–H6选择器。`src/NoteComposer.tsx:53`、`src/noteFormat.tsx:9,24,28`。
- 既有格式支持两级标题、粗/斜体、内联/围栏代码以及旧颜色/字号标记；其中代码/颜色/字号没有当前创建工具。没有quote、ordered-list、strike、highlight、表格/附件/块引用等完整编辑—保存—回填闭环。
- **（推断）** 本轮可复用现有安全格式/草稿契约做有界扩展；任意新增工具都要核对序列化、回填、预览和纯正文提取，单加按钮不能代表能力完成。是否增加轻量场景模板由后续完整基线收敛。

## B. 入口与主流程

### 编辑、格式与保存

- Composer挂载按draftKey=`note.id??new`读取草稿，草稿优先于原note；先withoutTags分出正文，markdownToEditorHtml回填contentEditable，30ms后聚焦。正文onInput经过editorHtmlToMarkdown更新React内容，不把编辑HTML写入Note。`NoteComposer:10–21,45`。
- 工具栏mousedown preventDefault维持选区，run先focus、execCommand，再requestAnimationFrame序列化；没有选择状态反馈、aria-pressed或撤销/重做按钮。只有Ctrl/⌘Enter由composer捕获保存，跳过isComposing/229/repeat。`NoteComposer:38–53`。
- commit清草稿、调用原onSave，done/deletedAt保持；按钮只允许非空content。草稿effect在正文/date变化写入localStorage， unchanged编辑或空正文清草稿，失败显示“草稿未能保留，请保存记录后再关闭”。`NoteComposer:23–36,49`。
- 模板如果直接赋innerHTML/重建整个contentEditable会涉及当前选区与浏览器撤销历史；如果覆盖content状态会改写草稿。这是事实上的数据/作者体验触点，不能把“范式”解释为默认替换用户正在写的内容。

### 斜体不可见的证据分层

- 确定源码事实：`:root`字体栈是Microsoft YaHei/PingFang SC/system-ui/sans-serif，`font-synthesis:none`可继承；编辑器和markdown-preview没有覆盖该设置。italic命令序列化em/i为`_正文_`，回填生成em，预览生成React em。`styles:2–4,126–156`、`noteFormat:4,18,28`。
- [MDN font-synthesis](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-synthesis)说明none禁止浏览器合成缺失字重/斜体等变体；中日韩字体常缺少这些变体，style值允许所需斜体合成。它不证明本机特定字体文件一定缺italic。
- **（推断）** 全局none是用户中文斜体不可见的重要候选原因；不能仅由em的computed font-style=italic认定字形已经倾斜，也不能把所有系统sans都说成没有真实italic。
- 未实测：当前WebView实际字体fallback、中文与拉丁文选区的真实glyph、关闭/打开合成后的截图差异。由root在隔离UI中检查编辑即时显示、保存卡片/图详情、编辑回填及浅深主题；本agent未操作UI。

### 列表、嵌套与纯正文边界

- insertUnorderedList会创建原生ul/li，但存储li统一转`- `；`ul`和`ol`同样只取body，ordered序号不能保留。回填`- `却变成`div.visual-list`加文字圆点，不是真ul/li。`noteFormat:24,28`。**（推断）** 回填后继续回车、切换列表、反缩进与原生新列表可能表现不同，需要浏览器确认。
- nested li被同一walker串接，无层级缩进契约；h1/h4/blockquote等未识别标签仅返回body，易失去块语义/换行。当前只有h2/h3和ul CSS，没有ol/blockquote视觉规则。`noteFormat:28`、`styles:153–155`。
- 序列化可把嵌套strong+em变成`**_正文_**`，回填inlineToHtml顺序替换可能生成嵌套标签，但预览renderInline把bold捕获内容当普通React文本，不再递归渲染；因此会把内层下划线作为文字。noteText同样只单次regex去token。`noteFormat:2–5,13–20,28`、`noteText:3,13–14`。这是源码可核查的不对称，不是本轮已复现的UI证据。
- 代码块经过escapeHtml/React文本安全展示；inlineToHtml先替粗体/斜体再替code，内联code内格式字面量的保护不完整。原HTML字符串输入会escape或作为React文本，不直接dangerouslySetInnerHTML；本机编辑回填只用受控转换产物。新增格式必须继续白名单纯文本契约，不能直接持久化/渲染粘贴HTML。
- plainNoteText被关联图、QuickOpen/复制语义消费；目前只识别两级标题、`- `和既有inline token，若新增ordered/quote等只有预览认识，搜索摘要/关系计算会残留格式符。`noteText:5–18`、`recordNavigation`、`noteGraphModel`。本轮不需要改变图算法，但格式抽取契约需一致。

### 草稿状态与快捷键

- footer当前是一个`span role=status`直接文本draftStatus，内嵌`small.save-shortcut`，再跟保存button。CSS `.save-shortcut{display:block;margin-top:5px;font-size:10px}`已明确另起行，footer为flex/gap14，窄屏gap10/font10。`NoteComposer:49`、`styles:166–169,279`。
- **（推断）** DOM/无障碍树的textContent可能合并成“草稿已保留在本机Ctrl / ⌘ + Enter 保存”，不等于屏幕上没有换行；用户不满意的视觉密度/层级仍需真实截图确认。role=status同时包含静态快捷键，状态变化可能连带朗读提示，需区分动态状态与静态键盘说明。
- Modal有body滚动锁、初始焦点、Tab/ShiftTab圈定、关闭焦点恢复，工具栏新增select/popover/模板入口都会进入该边界。`Modal:4–29`；不能只验静态排版而省略输入/选区/键盘。

## C. 关键模块与职责

| 模块 | 职责/本轮阅读锚点 |
| --- | --- |
| `src/NoteComposer.tsx` | 正文/标签/日期、工具栏、草稿、保存；10–36状态，38–55输入/布局 |
| `src/noteFormat.tsx` | 预览React节点、受控HTML回填、DOM→纯文本；三方向需保持格式对称 |
| `src/noteText.ts` | 共享inline pattern、去格式正文与normalize；改变影响图/快开文字但不需改图评分算法 |
| `src/styles.css` | 字体合成/主题、正文排版、工具栏与footer；2–4、126–169、279 |
| `src/recordTools.ts` | 标签语法与正文分离；`#标题`会是tag，标题存储`# `有空格，两者应继续区分 |
| `src/store.ts` / `types.ts` | `luma-note-draft-v1:{id}`，content/status/scheduledDate/savedAt；25–29 load/save/clear只验证content字符串 |
| `src/Modal.tsx` | editor初始焦点、滚动锁、Tab/关闭还焦点；没有额外工具栏浮层管理 |
| `tests/noteGraph.test.mjs` / `recordNavigation.test.mjs` | 有纯正文单级格式、未知HTML/代码保留、UUID/IME合同；尚无DOM格式往返和视觉斜体测试 |

### 草稿兼容事实

NoteDraft字段和AppData version1未有模板ID或编辑器schema。草稿由业务纯文本读取，格式扩展不应为了模板增加数据库/备份迁移；已有用户content必须优先保留。本调研不读取任何实际用户草稿/数据库。

## E. 同类与官方做法（只primary）

查阅日期2026-10-03；没有安装同类产品、测使用率或比较实际包体。

| 来源 | 已核查事实 | 对本轮的有界取舍依据（供基线采用，不是已经实现） |
| --- | --- | --- |
| [Bear格式说明](https://bear.app/faq/how-to-use-markdown-in-bear/) | 标题/无序/有序/引用/代码、组合样式以及格式栏/快捷键；嵌套样式跨应用可能有差异 | 可借鉴常见格式分组、样式与键盘一起呈现；不采照搬全部Markdown/链接/脚注/附件工具，因为现转换器没有相应闭环且用户不能看语法 |
| [Joplin Rich Text限制](https://joplinapp.org/help/apps/rich_text_editor/) | 所见即所得仍Markdown存储；HTML/plugin特殊格式可能编辑后丢失，列表同类项等受底层约束 | 采用“工具能力受可保存格式约束”的经验，不把新增按钮或编辑HTML视作安全兼容；本轮不建立plugin格式市场 |
| [Joplin模板官方插件仓库](https://github.com/joplin/plugin-templates) | 模板用于新笔记/待办或插入现笔记，支持默认模板、变量及Handlebars复杂逻辑；示例含会议/日记/项目场景 | 可借鉴可选场景起稿与显式插入；不引入默认覆盖/模板变量引擎/跨笔记本配置，当前需求没有要求这些依赖与复杂流程 |
| [Tiptap StarterKit官方](https://tiptap.dev/docs/editor/extensions/functionality/starterkit) | 提供Heading、BulletList/OrderedList、Blockquote、CodeBlock、Bold/Italic/Strike、UndoRedo等，extensions可配置/禁用，属于完整编辑器机制 | 作为成熟能力清单与未来复杂编辑器候选；当前不默认迁移：需替换编辑命令/选区/撤销及纯文本adapter并验证草稿/旧格式，远超本轮反馈本身。没有宣称其包体大小或本项目兼容通过 |
| [MDN execCommand](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand) | deprecated，但保留浏览器undo buffer而直接DOM写入未必保留；命令是否触发input/beforeinput依浏览器而异 | 当前已有路径可以有界核验，不为弃用标记贸然新建编辑引擎；模板/格式同步需要显式检查连续输入、撤销与存储内容，不能只依赖input事件 |

对照得到的能力候选：清楚命名的正文/两级标题、粗体/可见斜体、真正可继续编辑的无序与有序列表、引用/行内代码等常用格式，以及可选空白/日记/会议/灵感起稿。**（推断）** 这些更贴近现笔记需求；最终哪些加入、是否限制嵌套和模板非空保护，必须由完整基线明确，而不是在调研偷偷增加实现范围。表格/媒体/任意字体/复杂嵌套/远程模板不具当前需求和兼容证据。

## F. 已阅读文档、失败与证据范围

- 完整读新feature README/source原话、上述源码；核对根README、Project.Progress和Release.Testing当前编辑能力/验收要求，package0.5.1/已有Motion依赖。改前副本由root维护，本agent未还原。
- 浏览器/字体因果、工具命令真实DOM、粘贴/撤销/选区、窄屏视觉未执行。没有把之前50测试/0.5.1包当新编辑器证据。
- 初次合并代码/搜索输出过长发生截断，关键CSS/store/tests和官方功能段随后小范围重读；没有将未看到的输出当事实。GitHub模板内查`builtin`无匹配，改查实际默认模板段；没有依此推导不支持模板。
- 来源仅官方Bear/Joplin/Tiptap、官方插件GitHub、MDN；搜索出现的社区/第三方结果未作技术证据。本调研不下载/安装新依赖。

## G. 不确定点清单

- U1：本机italic实际字形是否被font-synthesis:none阻止、哪些中英字体/主题受影响？root隔离UI逐段格式并比对编辑/保存/回填真实截图、computed style/实际fallback；仅CSS或em标签不等于视觉通过。
- U2：新增格式所需范围、层级及组合语义是什么？后续基线冻结常见工具/场景，特别ordered/quote/nested inline；若现转换不闭合，不能只上线工具按钮。没有必须用户拍板的阻塞，按当前授权可有界收敛。
- U3：原生execCommand各目标浏览器/桌面WebView的格式DOM、列表回填续写/Enter/Backspace/撤销是否可靠？impl DOM合同与root真实选区/保存/回填分层；原生IME不具输入能力则未测。
- U4：模板入口非空正文/恢复草稿/编辑旧记录时如何避免覆盖，并保留撤销/焦点？基线要显式约束；root现草稿恢复与非空行为验收。模板支持不等于可默认覆盖。
- U5：新增纯文本语法如何与literal符号、code、嵌套格式、旧颜色/字号、标签及plainNoteText一致？纯格式往返/旧内容和危险HTML文字夹具，再root保存卡片/图详情/快开比对；不改图算法或格式任意HTML放行。
- U6：status/shortcut实际是否粘连或只是提取文本、主题/窄屏/键盘读屏是否合适？root截图/布局边界/Tab/状态播报检查；保留静态CSS已display:block事实。
- U7：依赖与包体/性能是否保持轻量，旧预览崩溃和Rust资源失败是否影响验收？本轮构建由root/impl按责任执行并记录失败，真实UI/制品不能用旧结果替代。

所有U尚未关闭；本文件不提供readiness或Gate放行结论，也没有“斜体已修复/编辑器已通过”的声明。

## H. 给readiness reviewer的最小证据

- 原始输入：[source_materials/feedback_20261003.md](source_materials/feedback_20261003.md)；[本feature范围入口](README.md)。
- 第一个源码落点：`src/NoteComposer.tsx:53`标题图标/命令；`src/styles.css:4`合成；`src/noteFormat.tsx:4,24,28`inline/list三方向；`src/NoteComposer.tsx:49` + `styles:166–167`状态与快捷键；`store:25–29`/`types:14–16`草稿。
- 已观察事实：本文件源码行与官方行为说明。推断：字体视觉因果、回填列表真实编辑差异、footer可用性，明确标记并归U1/U3/U6。没有新增待用户回答问题或上游确认缺失。
- 自动入口：`npm test`、`npm run build`；现测试没有编辑DOM往返套件，需要后续有意义格式/草稿/文字抽取合同；不能用React JSX字符串断言镜像实现替代往返结果。
- root人工承接：连续中文/英文输入顺序、选区与取消格式、组合样式/列表续写、保存卡片/再次编辑、旧颜色字号/代码、草稿关闭恢复、模板非空保护、Ctrl/⌘Enter/IME、浅深/390px、Tab与关闭焦点；沿Release.Testing编辑清单。

---

## 跨功能事实（待确认）

### 架构与约束

- [2026-10-03] 晴笺格式能力由DOM→纯文本、纯文本→编辑DOM、React预览及plainNoteText四方共同约束；新增可点击工具不能只证明其中一方成立。
- [2026-10-03] execCommand能保留原生撤销历史但input事件并非跨浏览器保证；直接重写contentEditable的模板/格式需独立验证撤销与选区。
