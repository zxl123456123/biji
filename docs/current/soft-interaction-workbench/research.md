# 柔和交互与记录工作台：补充调研

日期：2026-10-03。调研类型：问题驱动补充调研。本文件只记录源码及官方资料事实，不包含实现方案，也不把未执行的交互验收写成已通过。

## A. 系统边界与现有能力

- 本轮用户原话见 [输入](source_materials/feedback_20261003.md)：继续开发点击互动、拖动感、软回弹，并承接上一轮易用性建议。初始化 [README](README.md) 已记录直接开发授权解释。
- 项目当前是 React 19.3.0 / React DOM 19.3.0、Vite 8.3.0、TypeScript 7.0.2 的本地优先笔记工作台，版本元数据 0.5.0；桌面为 Tauri + SQLite。数字来自当前 package-lock.json，而非 package.json 的 latest 声明。
- 已有网格/日期排版、正文搜索、精确标签/未完成筛选、所见即所得编辑、草稿、回收站与 Canvas 关联图；本轮不研究数据库内容、密钥或云端同步。
- 图谱已有鼠标节点拖动、空白平移、滚轮缩放、选中邻居高亮和标签显示降级，不能称这些能力不存在；卡片尚无拖动抓手、弹簧位移或按压回弹处理。
- 前轮对 Bear、flomo、Obsidian、思源、Joplin 的调研是可复用产品事实，见 [产品比较](../luminous-note-map/research_product_comparison_20261003.md)；其全部候选不是本轮必做范围。保存迁移、构图算法、每日回顾的遗留问题仍由后续范围决定。

## B. 入口与主流程

### 按钮、卡片与编辑

- App 的主导航、搜索、创建和主题/AI入口使用原生 button/input；Ctrl/⌘ K 目前切到记录并聚焦搜索框，没有快速打开面板。keydown 跳过 IME composing、229 与 repeat。锚点：`src/App.tsx:50–66,126–146`。
- NoteCard 的正文预览和元数据整体置于一个原生 button，点击进入编辑/恢复；完成、复制、编辑、删除为兄弟按钮。article 没有手势事件，CSS hover 移动 -3px。锚点：`src/NotesView.tsx:37–44`、`src/styles.css:319–323`。
- **（推断）** 若从整个卡片或正文区域自动启动装饰性拖动，可能改变点击/拖动判定，并与文本选择、触屏页面滚动竞争；现有代码不能证明不会误打开编辑器。需要用实际手势确认，见 U2。
- 编辑器 contentEditable 输入被转换回限制过的纯文本格式；工具栏在 mousedown preventDefault，随后恢复编辑器焦点并 execCommand，以保留选区。Ctrl/⌘ Enter 只在 composer 内处理，跳过 composing。锚点：`src/NoteComposer.tsx:38–53`。
- 日期滚轮已有真实 overflow 滚动与 scrollIntoView；点击使用系统减少动效判定 auto/smooth。锚点：`src/NoteComposer.tsx:55`。装饰拖动若改变这些原生滚动路径属于需确认的交互变化。

### Modal 与焦点

- Modal 挂载记录 activeElement，锁 body overflow，聚焦 editor/input/frame，Tab/Shift Tab 在可见可用控件间循环；卸载恢复原 overflow 和仍连接的触发元素焦点。锚点：`src/Modal.tsx:4–27`。
- 遮罩当前在 mousedown 且 event.target === event.currentTarget 时关闭，不是整个 backdrop 点击冒泡关闭。弹窗容器未注册拖动。锚点：`src/Modal.tsx:28–29`。
- **（推断）** 如新增快速打开/可搜索标签浮层，复用此 Modal 会保持既有焦点边界；如将弹簧变换加在外层，需重新观察关闭焦点和滚动位置，而不能只查看动画截图。

### 图谱事件边界

- Canvas 用 D3 zoom/drag；zoom 允许 wheel、多指触摸，单指/鼠标空白启动平移；节点命中时交给节点拖动。节点拖动 clickDistance(4)，只接受主按钮及单指触摸，独立 click 处理跳过 defaultPrevented。锚点：`src/NoteGraph.tsx:169–227`。
- 拖动把 Canvas 本地坐标经相机 invert 转成世界坐标，直接更新模拟副本并 drawOnce；不每帧改 React 笔记/数据库。锚点：`src/NoteGraph.tsx:206–221`、`src/graphGeometry.ts:17–22`。
- D3 鼠标平移/拖動拥有 window 上 `.zoom` / `.drag` move/up 监听。卸载 disposed 置 true，按监听函数身份取消拥有的监听，恢复 D3 禁用的原生选区，停止 RAF/simulation、移除观察器和 Canvas 监听；不会广扫其他 owner。锚点：`src/NoteGraph.tsx:281–294`、`src/graphGeometry.ts:36–58`。
- Canvas 自身 `touch-action:none`，装饰光场 `pointer-events:none`；这不是整个页面禁止滚动。锚点：`src/styles.css:287,336`。本轮未进行原生触屏实测。
- 当前图接口暴露 zoom、fit、refresh、select；外部没有按 UUID 定位镜头入口。文字 select 会选择节点并冻结它，但本身不把镜头移到目标。锚点：`src/NoteGraph.tsx:273–276,297–299,314`。

## C. 关键模块与职责划分

| 模块 | 实际职责与本轮相关事实 |
| --- | --- |
| `src/App.tsx` | 顶层业务状态、页面导航、编辑入口、搜索；tags 集合 `.slice(0,10)`，传给卡片、图筛选、编辑器 |
| `src/NotesView.tsx` | 每批60条，筛选/排版变化重置；原生 button 卡片动作；创建入口和结果计数 |
| `src/NoteFilters.tsx` | 原生 select 标签筛选；会把当前选中标签补入选项，防止截断后选择值消失；没有输入检索标签 |
| `src/Modal.tsx` | body滚动锁、焦点进入/捕获/恢复、遮罩关闭；未采用外部组件库 |
| `src/NoteComposer.tsx` | WYSIWYG、选区格式、IME保护、日期滚轮、草稿；手势变化需保护这些入口 |
| `src/NoteGraph.tsx` / `graphGeometry.ts` | D3副本与坐标/监听清理，30fps Canvas；已有邻居高亮、>80节点非邻居标签隐藏、>=500特效抽样，真实节点不被抽样丢弃 |
| `src/styles.css` | CSS hover/短过渡、全局 focus-visible、触屏动作常显；系统 reduced-motion 全局关CSS动画/过渡，部分新工作台样式在后段覆盖旧布局 |
| `tests/*.test.mjs` | Node内置纯计算/受控D3事件测试；没有实际浏览器手势或React DOM测试框架 |

### 当前动效/布局事实

- `motionAllowed = ambientEnabled && !reducedMotion && pageVisible && !composer`；用于 workbench motion-disabled 和图 animate。系统设置动态监听，页面 visibilitychange 动态监听。锚点：`src/App.tsx:25–34,43–49,70,109–110,124`。
- `.motion-disabled` 只暂停 workbench-light 的动画；既有卡片 hover CSS 并不由用户“暂停动态”状态停止。系统 reduced-motion 全局关闭动画与过渡，但 hover transform 仍可立即变化。锚点：`src/styles.css:281–293,319–320,376`。这两种状态的范围目前不同，不能假定新JS弹簧自然继承CSS策略。
- 当前宽屏有效规则：topbar 57px、content padding-top 32px、heading margin-bottom 28px、capture-entry min-height104px+margin-bottom21px；3列>=1180、2列721–1179、1列<=720。锚点：`src/styles.css:70,78,307–319,357–368`。
- 原生 focus-visible outline 已覆盖 button/input/select/textarea/contentEditable，触屏/粗指针使动作按钮常显。锚点：`src/styles.css:23–25,246`。

## E. 官方交互能力与外部依赖事实

查阅日期：2026-10-03。只使用官方文档/MDN/web.dev；没有安装新库，未把营销包体数字当作项目测量。

| 来源 | 可复用的客观能力与限制 |
| --- | --- |
| [Motion drag](https://motion.dev/docs/react-drag) | dragConstraints 支持像素和ref区域，dragElastic控制越界弹性，支持轴锁、生命周期回调、按压/拖动反馈；变换父级会改变拖动坐标空间 |
| [Motion useDragControls](https://motion.dev/docs/react-use-drag-controls) | 从指定 PointerEvent 启动；dragListener=false 可取消整个元素自动启动；默认位移阈值3px且可配置；stop与cancel可手动结束，cancel跳过onDragEnd；触屏触发区域需touch-action:none |
| [Motion useSpring](https://motion.dev/docs/react-use-spring) | MotionValue跟随目标以弹簧更新；set改变目标，jump立即到值；能够跟随另一个motion value，不要求每帧React setState |
| [Motion LazyMotion](https://motion.dev/docs/react-lazy-motion) / [包体指南](https://motion.dev/docs/react-reduce-bundle-size) | m + LazyMotion按功能同步/异步加载；domAnimation包含动画/tap-hover-focus，domMax额外包含pan/drag/layout；strict能检出混入完整motion组件 |
| [MotionConfig](https://motion.dev/docs/react-motion-config) | reducedMotion默认never；user尊重系统，always强制；减少动效时禁用transform/layout但opacity和backgroundColor仍存在，不能等同于业务动效开关全部禁用 |
| [MDN pointer capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture) / [pointercancel](https://developer.mozilla.org/en-US/docs/Web/API/Element/pointercancel_event) | capture让后续同一指针事件送达捕获元素，直到释放；无活跃pointerId会抛NotFoundError；浏览器接管滚动/缩放或硬件中断会产生pointercancel，不能只依赖pointerup |
| [MDN WAAPI](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) / [Animation.cancel](https://developer.mozilla.org/en-US/docs/Web/API/Animation/cancel) | 浏览器原生DOM动画时间/播放模型；cancel清除动画效果且中止播放；非idle的finished promise被拒绝AbortError；其文档没有提供卡片拖动仲裁或完整弹簧手势状态机 |
| [web.dev动画性能](https://web.dev/articles/animations-guide) | 优先transform/opacity，其他属性先评估布局/绘制；will-change不应提前广泛应用，过度层提升有成本，需用实际性能工具确认 |

Motion候选版本事实：本调研独立执行 `npm view motion@14.0.0 version license dist.unpackedSize peerDependencies dependencies --json` 返回0：14.0.0、MIT、unpacked750887字节，依赖framer-motion14.0.0和tslib^2.4.0；React/ReactDOM peer为^18或^19，与当前锁中19.3.0处于声明范围内。根代理承担许可证正文及确切候选锁定审查。当前项目尚未有Motion依赖。

Motion官方滚动文档称完整motion约34kb，LazyMotion初始约4.6kb、domAnimation+15kb、domMax+25kb；这些是官方示例说明，不是晴笺14.0.0实际gzip增长，且异步特性加载不代表功能不会再下载。实际入口/异步块/离线预缓存包体待构建确认。官方站导航曾显示v13.4.0，而npm已是14.0.0；使用的新API必须由确切安装版本类型及源码确认，不凭导航版本猜测。

## F. 已阅读材料与调研边界

- 已读根README、本feature README、source_materials/feedback_20261003.md、相邻产品比较、docs/Release.Testing.md；已读本表模块的实际实现、package/lock和graphGeometry/recordTools测试。
- 未调用数据库、凭据、AI网络、用户UI或重负载基准；未改应用源码、依赖/锁文件。仅新增本research文档。
- 初次合并输出过长出现工具截断，随后关键源码与官方功能段分小范围重新读取；一次 `rg --files scripts` 因仓库无scripts目录退出1，随后改查实际tests目录。一次PowerShell ConvertFrom-Json遇lock空键报错，随后`-AsHashtable`重读取得上述真实版本；这不是产品失败。`react-drag-controls`旧URL返回Internal Error，实际官方页是`react-use-drag-controls`，已读取。

## G. 不确定点清单

- U1：Motion14候选实际导出、事件取消及异步domMax初次加载是否符合滚动官方文档？如何确认：确切包类型/源码、TS构建与首次可交互测试；不能只以peer范围认定行为通过。
- U2：鼠标/触摸/笔输入的抓手拖动、轻点、拖后click、松手越界、pointercancel、blur、卸载、二指及右键是否有误触发或残留位移？如何确认：明确边界夹具加受支持真实输入，无法操作的原生场景必须保留未测。
- U3：CSS hover transform与JS transform是否覆盖、嵌套变换导致坐标偏差？如何确认：drag主节点/父级实际computed transform和位移；浅深/窄屏/125%缩放检查。
- U4：用户暂停、系统reduce、hidden、composer打开时，新按压/拖动/回弹和既有光场是否统一清理？如何确认：交互途中切换各状态后测无残留capture/RAF/位移，状态恢复不执行旧动作。
- U5：新增可搜索标签/快速打开是否保持精确标签、组合筛选、Enter/箭头/IME、Escape及焦点恢复？如何确认：>10标签、同名笔记、无结果/删除后结果变化、输入法确认和modal回归夹具。
- U6：图定位跨筛选是否可见且节点缺失时有一致反馈，D3监听身份保护能否保留？如何确认：UUID选择/切换/卸载测试与原graphGeometry回归，避免把motion手势装到Canvas上。
- U7：生产构建包体、冷打开、拖动帧耗时及后台资源是否符合候选预算？如何确认：本轮构建按块报告gzip与生产预览实测；历史构图881ms等不能证明本轮DOM交互或GPU顺滑。

所有U项在调研阶段仍未关闭；它们是后续类型核对与验收证据入口，不是等待用户追加拍板的产品问题。

## H. 给readiness reviewer的最小可核查证据

- 需求：本feature [输入](source_materials/feedback_20261003.md)、[初始化范围](README.md)。事实和推断在以上段落分列；没有新的用户澄清阻塞。
- 源码：App:50–71/126–146（CtrlK/策略/标签/入口）、NotesView:37–44（按钮嵌套关系）、NoteFilters:15–17（原生select）、Modal:4–29（焦点/滚动/关闭）、Composer:38–55（选区/IME/滚轮）。
- 图事件/性能：NoteGraph:169–227/273–299，graphGeometry:36–58，styles:281–293/319–336/376；>80标签LOD及邻居高亮已存在。
- 自动入口：`npm test`；聚焦 `node --test tests/graphGeometry.test.mjs tests/recordTools.test.mjs`；Web至少`npm run build`。本调研仅查测试，不报告测试通过。
- 受控D3入口：tests/graphGeometry.test.mjs包含真实D3函数+EventTarget夹具，对监听所有权、取消恢复选区及late move有覆盖；不能替代浏览器Pointer capture/触屏或卡片真实拖动。
- 人工承接：docs/Release.Testing.md已有连续输入/选区格式/保存回填、CtrlK/CtrlEnter、Tab/ShiftTab/关闭焦点、浅深/窄屏/触屏、动态开关/减少动效/后台检查。本轮新交互还需覆盖U2–U6的具体行为。
- Windows入口：`npm run release:windows -- --ci`，制品位于src-tauri/target/release及bundle目录。旧0.5.0制品不是本轮开发验收证明。

---

## 跨功能事实（待确认）

### 架构与约束

- [2026-10-03] 业务“暂停动态”、CSS prefers-reduced-motion与未来JS动画策略不能视为自动等价；MotionConfig减少transform也仍保留opacity动画，需分别核对实际可见效果。
- [2026-10-03] 当前D3平移/拖动取消只清理拥有且监听身份未替换的window事件，新增手势层不能清扫全局同名监听。
