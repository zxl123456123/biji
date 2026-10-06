# 炫彩动态工作台与笔记脑图：调研

调研日期：2026-10-03。只读代码与官方资料，没有改生产代码/Git、浏览用户UI、启动服务或读取凭据。需求原文见 [反馈](source_materials/feedback_2026-10-02_graph.md)。

主代理追加的完整最新指令：聚类选择“标签 + 本地正文相似度（推荐）”；“这种技术选型上面，你可以去参考github上有没有比较好的架构和技术选型，然后分析选择”。这明确覆盖上一轮仅装饰光粒、关系图延后的边界，不能继续只做背景。

## A. 实际系统边界与视觉问题

晴笺当前工作区为0.4.0，React+TS+Vite、Tauri+SQLite，本地笔记/账本、所见即所得安全纯文本、草稿/回收站/备份、主动AI。记录有稳定UUID、content、done、createdAt/updatedAt/scheduledDate/deletedAt，没有显式关系或保存坐标（`src/types.ts:3-12`）。数据仍全部留本机；构图或正文相似不需要AI接口。

**为什么感觉变化弱：代码证据支持设计太保守，不能未经证据归咎缓存。**

- `src/styles.css:5` paper仍`#f8f7f3`、surface`#fffefa`、sidebar`#efeee8`；深色也是低饱和灰。主体没有鲜明多色光场。
- `src/styles.css:69,90-92`内容最大880px、单列flex、卡片细边/很轻阴影；`src/App.tsx:119-135`仍标题→捕获框→筛选→纵向卡片→标签。侧栏+顶栏布局并未变为工作台。
- `src/AmbientNodes.tsx:5,70-75`没有notes props，24/12个随机点只在x≈.02–.17或.84–.98两侧；y速度.002–.006/秒。`49`连线透明度最大.22，`styles.css:28`整个Canvas再乘opacity.8。中心记录区没有可读节点关系。
- AmbientNodes只有装饰hover视差，没有点选记录/缩放/聚类/拖节点。`src/App.tsx:82`将其插在整个shell背景；`AmbientNodes.tsx:99`aria-hidden且pointer-events:none（CSS:28）。这不满足“每记录一个点”。
- 0.4.0确实修改了交互：CtrlK、复制、精确标签+未完成筛选、月份统一、Modal/编辑器提取、主题与暂停。不能因视觉弱否定已有功能；也不能把功能变化称为本轮脑图实现。

主代理回传重新打开5173页面有复制/组合筛选/CtrlK，paper为#f8f7f3、note-list为flex且columns为none，Canvas1600×900可见，属于当前真实UI证据；本调研未操作浏览器。不能把当前单列弱视觉归因为缓存；用户此前具体窗口来源仍不可判定。最新完整选择见[source_materials/feedback_2026-10-03_selection.md](source_materials/feedback_2026-10-03_selection.md)。新UI验收应辨识运行版本，而不是把候选HTML当真实效果。

## B. 入口与主流程

现有App拥有笔记/账目、query、selectedTag、unfinished、theme、composer及动效偏好（`App.tsx:17-38`）；过滤通过selectNotes（`59`）；笔记保存/删除/恢复由App更新唯一notes（`74,78-80`）；编辑器接收原Note并保存（`103`）。持久化effect只依赖notes/transactions/ready（`28-29`）。

新增图的自然事实边界是“笔记数据→派生节点/边/分组→图交互选择一个id→复用原Note编辑动作”。构图不是另一份笔记数据库。删除/恢复/改标签必须反映同一notes源；回收站记录不应漏进默认图。query/标签/未完成的筛选语义已经有实现与测试，不应另外造图的第二套筛选规则。

## C. 当前模块与稳定性事实漂移

| 模块 | 已有职责/接入边界 |
| --- | --- |
| App.tsx | 导航、唯一业务状态、持久化触发、NotesView/NoteCard/Ledger/设置/AI；NotesView props已有edit/create/toggle/filter callbacks（111-117） |
| recordTools.ts | 标签/日期格式、纯selectNotes/selectMonth/monthTotals（7-35）；不生成图 |
| noteFormat.tsx | 安全纯文本与可见内容转换；构图文本应保留正文含义、去格式标记，不能直接用任意HTML |
| NoteComposer.tsx/Modal.tsx | 编辑、草稿和弹窗；点节点能复用，无需脑图自带第二个编辑器 |
| AmbientNodes.tsx | 独立ref+effect管理Canvas、rAF、resize/pointer/visibility/media清理（7-98）；仅可参考生命周期，随机装饰模型不能直接充当关系图 |
| store.ts/desktop.ts/Rust | 浏览器数据/草稿、Tauri桥、SQLite/凭据/network；不应因构图帧变化写入 |

**重要漂移**：现在package.json有`test: node --test tests/*.test.mjs`，`tests/recordTools.test.mjs`定义12项过滤/月汇总测试。旧研究“无前端测试”已不再正确；但仍没有图关系/图交互/中文相似度测试。Release.Verification.0.4.0记有12/12通过和Rust0用例、Web验收、EXE/MSI产物及限制；都是上一轮记录，本轮未运行，不等于本轮脑图验收。原生旧库特定样例迁移已验证，不代表任意新关系schema自动兼容。

当前git现场仍有上一轮未提交源码/文档，必须保留。结构提取与本轮功能分别组织，不能为选型把全部App重写。

## D. 真实关联与本地中文相似/聚类

### 语义比较

| 依据 | 成熟参考 | 收益、风险与迁移 |
| --- | --- | --- |
| 标签共现 | [Obsidian Graph](https://obsidian.md/help/plugins/graph)将节点/连接映射真实记录链接并支持过滤/分组；晴笺已有精确标签提取 | “共同标签：旅行”是可解释事实，但不是用户建立的双向链接。无需schema。多标签笔记可跨组；共同宽泛标签会产生稠密团，必须控制显示 |
| 本地正文词面相似 | [scikit-learn文本特征](https://scikit-learn.org/stable/modules/feature_extraction.html)、[TF-IDF参数](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html)支持字符ngram、稀疏向量与余弦 | 汉字2/3gram不依赖空格分词模型，轻量、本地；是推断词面关联，不懂同义/否定/主题。无需Python/scikit-learn运行依赖，只借成熟算法原则，不宣称语义AI |
| 本地分词/模型embedding | 分词+TF-IDF或本地模型能增加语义信号 | 词典/模型体积、下载/授权、运行/WebView兼容和推理性能未知；本轮MVP不默认引入模型或远程embedding，不自动上传笔记 |
| 真实显式笔记链接 | [Obsidian Backlinks](https://obsidian.md/help/plugins/backlinks)区分显式链接与未链接名称提及 | 价值是可编辑知识关系；但晴笺当前没有格式/关系表、链接选择器、悬挂引用/导入ID政策，需新增迁移和交互。用户此次可由自动本地关联满足，先不扩到手工双链 |

**推荐最小真实关系MVP（研究建议，非已实现）**：每个未删除记录恰好一个笔记节点；实线说明共同标签，虚线说明正文词面相近；节点详情列出依据。没有证据的笔记仍有孤立节点，不能为了画面连通虚构边。颜色/空间分组按可解释规则，图例明确“标签/本地相似推断”，不要称随机近邻“知识关系”。选择标签+正文相似已经获用户选择，具体算法与可见操作仍需方案收敛。

### 稀疏计算与聚类取舍（推断，供方案选）

- 字符特征来自可见正文，先去纯文本格式语法并保持颜色/字号标记内的内容，标签另通道。按Unicode字符处理，不对UTF-16代理对随意截断。中文版字符ngram比“按空格切词”适合此项目；非常短的内容、重复模板、URL/代码片段要有样例。
- 采用“标签→笔记id”“字符ngram→笔记id”的倒排候选集合，跳过高频无区分力词；只对共享候选计算相似，不做每帧全量O(n²)。初始化/保存内容变化才构图；pointer、zoom、theme、Canvas draw均不重算正文特征。大常见标签不能枚举全部成对边，可选稳定稀疏连接骨架/局部选中邻域；需要说明所显示是关系子集。
- 上限如每记录候选64、正文相似top3、标签邻域top4是**待测候选**，能限制成本但会漏召回，必须固定稳定排序、记录采样/候选规则；不是完整全量语义搜索。只保留低次数ngram不代表中文智能理解。
- TF-IDF随语料更新影响IDF，不能宣称仅更新新笔记永远与全量计算等价。MVP可在已保存notes变化时重建派生稀疏模型，成本实测后才做增量复杂性；长任务才有理由移Worker。
- 分组与力导布局不是同一件事：力导图把相连节点放近，不自动证明正确主题。最小方案可用主标签作组锚点，文本相似对无标签记录提供候选关联组，保留跨组边；若选择强边连通分量，名称应为“关联组”，需接受桥接记录可能合并巨大分量。
- 若明确需要正式社区发现，[Graphology Louvain](https://graphology.github.io/standard-library/communities-louvain.html)提供成熟算法；但会引入graphology/算法依赖、随机/分辨率与稳定标签政策，结果仍不是唯一真主题。当前无需为了“聚类”默认部署完整社区算法。

不保存派生图、相似分数或物理坐标时，现有Note/备份/SQLite结构无需变化；仅添加前端图工具/可选布局依赖。若要手工连线、跨启动固定坐标或人工聚类，必须另定义持久化与迁移，不能只加localStorage偏好宣称成为稳定知识库。

## E. GitHub架构/技术选型对比

下表直接读取维护者仓库/官方文档。LICENSE以仓库与npm metadata交叉核对；维护不能用star数代替。2026-10-03从[npm官方registry](https://registry.npmjs.org/)读取稳定latest与发布时间（下表链接可直接核查），不是推荐自动跟latest安装。GitHub API六仓库请求均403 rate-limit，不能伪造最新commit日期。

| 方案 | 已核实事实 | 对晴笺的采用/不采用理由（推断） |
| --- | --- | --- |
| [d3-force](https://github.com/d3/d3-force)+Canvas | ISC；[registry](https://registry.npmjs.org/d3-force)：3.0.0，2021-06-05；依赖d3-dispatch/quadtree/timer。[simulation](https://d3js.org/d3-force/simulation)可停止/手动tick、fx/fy拖拽、node更新；[many-body](https://d3js.org/d3-force/many-body)Barnes-Hut O(nlogn) | **首选候选**：复用成熟物理布局、Canvas自定义多色发光、生命周期与静态交互完全可控。不是从头写物理引擎，也不引入完整d3。旧稳定发布不能称“最近活跃”，需要本轮兼容检查；自己负责命中/缩放/可访问导航有代码成本 |
| [react-force-graph](https://github.com/vasturiano/react-force-graph)独立2d包 | MIT；[registry](https://registry.npmjs.org/react-force-graph-2d)：1.29.2，2026-09-29；依赖force-graph、react-kapsule、prop-types；Canvas+力导内核，已有点选/拖拽/zoom/pan、自定义绘制。仓库Releases页为空，npm发布是真实近期证据 | **有竞争力的成熟候选**：首轮交互维护成本明显更低，只装2d包。用户减弱/停止动效可用cooldown+particles=0+autoPauseRedraw保留交互，不应以pauseAnimation误用淘汰此库。限制是交互检查rAF仍在运行、内部直接使用devicePixelRatio且无公开pixelRatio上限；内置15秒冷却也不是持续视觉动效。详见源码核对 |
| [Cytoscape.js](https://github.com/cytoscape/cytoscape.js) | MIT；[registry](https://registry.npmjs.org/cytoscape)：3.34.3，2026-09-07；包含图模型、Canvas交互、分析与内置/扩展布局。[官方性能](https://js.cytoscape.org/#performance)说明复杂边/标签/像素比等成本 | 更适合大量图查询、手工连接、复杂图算法与拓扑编辑。MVP只需自动派生笔记图时与Note多一图模型层，炫彩动态绘制需定制，功能面超过需求；不是不成熟。若未来关系编辑明确再评估 |
| [Sigma](https://github.com/jacomyal/sigma.js)+[Graphology](https://github.com/graphology/graphology) | 两者MIT；registry [sigma](https://registry.npmjs.org/sigma)3.0.3，2026-04-30；[graphology](https://registry.npmjs.org/graphology)0.26.0，2025-01-26。Sigma目标千级点边WebGL；[ForceAtlas2](https://graphology.github.io/standard-library/layout-forceatlas2.html)另包可Worker并可Barnes-Hut，Graphology emits events。Sigma仓库README还称v4 alpha，Releases已列4beta6，文档状态有漂移 | 数千/万节点主场优势，模型/布局/渲染架构清晰；引入多个包+WebGL程序/兼容+布局Worker生命周期，真实规模未知不应预先承担。选成熟stable3，不拿beta默认上线。可作为规模测量触发后的升级候选 |
| [React Flow/@xyflow](https://github.com/xyflow/xyflow) | MIT；[registry](https://registry.npmjs.org/@xyflow%2freact)：12.12.0，2026-09-24；依赖zustand/classcat/@xyflow/system，React>=17；节点编辑/连线工作台，持续力导布局需另接。[性能](https://reactflow.dev/learn/advanced-use/performance)要求memo节点/回调并避免订阅全nodes导致高频重渲染 | 适合富表单节点、手工流程/脑图编辑，不适合大量不断运动的发光小点；本轮不需要端口/流程编辑器，逐帧DOM/React成本与需求不吻合。不能只因React集成好就选 |

### 体积证据与界限

官方registry各stable包dist.unpackedSize依次：d3-force89,551B；cytoscape5,699,359B；sigma970,733B；graphology2,729,833B；react-force-graph-2d1,676,539B；@xyflow/react1,216,196B。**解包量包括源码/类型/重复格式等，不是最终浏览器gzip；不能把此表当运行包体排名。** 本轮未安装这些库，未做真实tree-shaking对比。D3原包依赖小而作用窄只是选型证据，最终需要同基线Vite构建比较本次新增gzip、加载延迟、生产WebView兼容。

### 成熟组件暂停与DPR源码核对

直接读取[force-graph源码](https://raw.githubusercontent.com/vasturiano/force-graph/master/src/force-graph.js)及[Canvas内核源码](https://raw.githubusercontent.com/vasturiano/force-graph/master/src/canvas-force-graph.js)，事实如下（master是本次读取状态，不等于已锁定安装版本）：

- 内核87–88行默认cooldownTicks=Infinity、cooldownTime=15000；129–138行用ticks/time/alpha判定停止engine。设置cooldownTicks=0会在下一个布局检查停止物理tick；新增数据后要先完成必要布局再冷却，不能让初始节点全部重合。持续炫彩可以由流光/呼吸承担，不需永远高alpha。
- autoPauseRedraw=true、布局冷却、linkDirectionalParticles=0可让节点和光粒停止连续绘制，保留可见图交互。外层568–615行仍每帧rAF检查hover/交互和tween，不能声称已完全取消每帧循环；操作或属性变化会触发必要重绘。默认粒子为0且改变时更新粒子数组（内核75行）。
- pauseAnimation（外层307–318行）取消整体rAF，适合隐藏页/销毁；不作为可见图“停动效仍点选”的实现。回到前台时根据动效偏好恢复，不能无条件开启粒子。拖拽、点选、缩放在冷却/减弱下的实际组合仍须组件级验收。
- 外层78、88–89行用devicePixelRatio分配Canvas与shadowCanvas；未见公开pixelRatio prop。不能宣称这个库可直接设DPR≤1.5。其两个缓冲的实际面积、浏览器缩放、图容器大小需测量；不能修改全局devicePixelRatio或CSS缩放绕过而不验证坐标与命中。

**选型权衡（推断）**：d3-force+Canvas仍是细粒度生命周期/绘制预算的推荐候选，但它并不比成熟组件更省开发。交互必须基于[d3-drag](https://d3js.org/d3-drag)和[d3-zoom](https://d3js.org/d3-zoom)等成熟API，而非手写物理或复杂手势状态机；需自己承担屏幕/Canvas/世界坐标转换与zoom逆变换、命中、拖拽结束抑制click、触屏手势、resize/DPR、同id位置复用以及可访问文字替代的边界。成熟react-force-graph已处理多数基础，并公开graph2ScreenCoords/screen2GraphCoords（外层190–197行），首次实现失败风险更低；两者都仍需独立文本预览/键盘入口、派生图对象与业务Note隔离。

可用同一小样例对照d3-force+Canvas与独立react-force-graph-2d，二者选一个，不保留双引擎、不建立renderer插件架构。若成熟d3交互适配与命中边界的成本超过本轮控制范围，优先成熟2d组件并接受其可量化限制。正式唯一技术合同由coordinator承担，此报告不新增架构基线。

## F. 图交互、主排版与动态预算候选

### 真实可用的最小交互（建议，未实现）

- 主区域明确“记录/关联图”或并排工作台入口；图可见画布足够大，真实节点不能继续藏在页边。每记录ID只映射一个节点，标签名可作为分组标题/图例，不混为记录节点计数。
- 点击选中节点显示正文预览、标签与边依据；明确编辑按钮复用原NoteComposer。拖动节点不能在pointerup误开编辑；缩放/平移/回到全图有可发现入口。选中高亮邻居，不要求每个节点永久铺满文字。
- 搜索/精确标签/未完成条件与卡片/图对应；过滤后非匹配节点是隐藏还是淡化由方案明示。创建、修改标签/正文、软删除、撤销、恢复更新节点/边，不reset所有坐标/镜头让图跳动；保留同id位置仅在内存，不写SQLite。
- 动画可以持续渲染边流光/节点呼吸，并不意味着物理simulation必须永不冷却。拖拽、增删轻微reheat、分组靠稳定锚点；长期高alpha会造成阅读目标漂移，降低点选成功率。
- reduced-motion与暂停下布局静态、无流光但鼠标/键盘/触屏可用；背景hidden停止定时器，回来不把20秒dt一次推进。Canvas提供相同笔记列表/选择控制与文字预览，不能只靠色彩和像素图访问内容。

### 主UI排版候选（推断）

采用“明显布局变化+主体可见多色”而非再次只换变量：内容拓宽为记录工作台，顶部更紧凑的捕获/筛选，桌面2–3列记录网格搭配可展开的关联图面板；窄屏单列且图高度明确。CSS Grid可保持DOM阅读/焦点顺序，避免CSS columns瀑布流造成键盘视觉顺序错乱。卡片按日期可选小组标题，但不是恢复之前删除的今日/明天导航。

透明玻璃/多色光场可用于顶栏、图底板和薄卡片边缘；正文要有稳定对比底色。炫彩不应等于文字也低对比彩虹；大面积backdrop-filter和每卡片动态blur/shadow会提高重绘成本。按标签给有限配色、图选择增强饱和度、节点可见流光，主体本身才能体现用户要求。既有theme设置和账本/AI/设置需要跟随同一变量，但本轮主要验证记录排版与真实图。

### 可执行预算（候选目标，未测量，不冒充通过）

| 目标 | 验证方法与降级边界 |
| --- | --- |
| 100/500笔记、平均500字、稀疏边≤4n；1000笔记压力样例，每条均有节点 | 隔离夹具，不替换真实数据；检查节点ID集合=筛选后的记录集合，孤立点不遗漏。密集共同标签不能画完全图；大规模减少标签绘制/流粒频率，不能静默只显示前100条 |
| 500节点关系初建目标p95≤300ms；单主线程任务≤50ms | 10次冷/热performance marks与Long Tasks录制；有长任务则切分或Worker，禁止放每帧/每次mousemove。比较少标签/共同大标签/正文近重复等最坏夹具，不能只随机文本 |
| 前台视觉30–60fps候选；simulation+绘制p95≤8ms，50秒持续录制无持续>50ms任务 | Performance拆计算/绘制/React commit；目标机与4×CPU节流分别记录。交互暂停布局、降低标签/发光/流粒，性能不足时减少特效，不能默认强上Three Bloom |
| 自管Canvas可设DPR≤1.5、buffer≤250万像素候选；大小跟图容器。成熟组件无公开DPR上限，不能直接承诺此值 | 宽屏/窄屏/Windows100/125/150%查看真实内部buffer；成熟组件按实际容器宽×高×DPR²×两个Canvas评估，必要时限制容器/特效或重新评估库。遵循[MDN Canvas优化](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)，预绘发光sprite、批量线条，不逐帧shadowBlur或DOM测尺寸 |
| 隐藏/卸载停止循环；可见减弱无持续物理/光粒绘制且可选择编辑/缩放；10次开关/换页内存不持续涨 | [PageVisibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)、[rAF](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)、[W3C C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)；自管检查simulation.stop与rAF/监听清理，成熟组件可见状态允许其交互检查rAF。StrictMode无重复loop，后台事件不能重新启用已关闭效果 |
| 不使notes每帧重渲染/持久化；缩放拖拽响应目标≤100ms | React Profiler + Application存储观察 +桌面日志；变化属于图ref内部。D3会修改nodes和links，必须给独立simulation对象，不能把原Note数组传给引擎（[D3 link](https://d3js.org/d3-force/link)明确mutation） |
| 包体增量首选≤25KB gzip候选 | 同版本Vite基线与选定依赖构建差值，不用解包量替代；超过则先分析真实依赖链，不为预算写未经需求的通用loader。新增库锁版本/保留license |

预算确认目标设备后可调整，不能保证所有GPU/数据量丝滑。动态“不断”仍须可暂停以及系统减弱，自动运动影响阅读时可按编辑器打开/选中详情暂缓。大规模GPU图的切换条件应由实测而非假想未来决定。

## G. 不确定点与范围外事实

- U1：标签+正文词面相似获选择；分组用主标签/连通组还是正式社区发现、图入口占主体面积、过滤隐藏/淡化尚需方案明示。用户未要求自定义手工边或精确语义模型，不因此默认迁移。
- U2：目标数据量/设备/WebView/GPU未知，性能预算尚未实测；只读研究不能宣称d3-force已在本项目编译或达到fps。
- U3：D3拖拽/zoom成熟API存在，推荐使用成熟适配，交互命中/坐标转换仍需自行承担；react-force-graph冷却与交互保留源码已确认，但实际桌面组合未测。最终唯一依赖集合由coordinator收敛，真实gzip未知。
- U4：正文短句/模板/中英混合/代码/无标签是否形成有用关系，需要合成样例和真实本地样例由主代理验收；词面相似阈值、候选上限是MVP质量权衡，不等于语义准确率。
- U5：GitHub REST rate-limit导致无法读取最新commit时间；部分release/tag页Internal Error；维护判断以成功读到的npm发布时间与仓库事实为限，不能给全部库统一“活跃维护”结论。
- 发现但未改动：此前导入替换/损坏JSON/桌面双保存effect是既有范围外议题；不因脑图顺手改存储层。tagsFor全正文regex是否把代码中的#识别为标签是已有语法，关系必须遵循一致当前规则，改变语法需要另评估。

用户相关待拍板由coordinator写clarifications.md，本调研不代写授权。即便方案决策明确，仍需真实交互/动态录屏或多帧截图、浏览器性能、构建/tests和EXE承接验证；本轮不直接判readiness PASS。

## H. 最小可核查证据与检索失败

- 原文：本功能README/source_materials反馈，及本文件顶部逐字引用的追加选择与GitHub要求；新版方向覆盖上一轮边缘装饰。
- 实现：App.tsx:17-38,58-80,82,100-117,119-145；recordTools.ts:7-22；AmbientNodes.tsx:31-59,65-97；styles.css:5,28,69,90-92,281；types.ts:3-12；tests/recordTools.test.mjs；package.json。
- 官方/GitHub：本文件E表5类维护者仓库/官方文档、官方npm registry；D表本地文本算法与真实图语义资料，F预算的生命周期/Canvas资料。
- 已读历史：README、Release.Verification.0.4.0。当前mainUI事实与旧研究“无前端测试/未提取组件”不同，以上已显式修正。
- 已见失败不省略：一次`rg`把以`--paper`开头的模式当选项，报unrecognized flag，后用`rg -n -- pattern`重跑获取正确CSS；6个GitHub API均403 rate-limit；Cytoscape releases/react-force-graph tags抓取Internal Error。MDN Intl.Segmenter URL抓取Internal Error，未将其当已读算法依据。这些是检索失败，不是生产构建失败；本轮没有构建或运行服务。

无新增跨功能事实；选择“d3-force+Canvas”及自动关联规则目前是研究推荐，不能写成已经落地的项目约束。
