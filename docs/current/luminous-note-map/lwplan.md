# 炫彩工作台与真实关联图：0.5.0 低层方案

日期：2026-10-03。架构路径，T3。按序已读最新完整基线、README、research、两份原话、HL及两份第1轮PASS评审；以最新基线为范围权威。当前仅方案，不把0.4.0测试/EXE当本轮成果；Gate-1后仍须独立Gate-2。

## 1. 目标、主链与事实映射

G1=顶部工作台/默认网格/日期模式/主体炫彩/浅深窄屏；G2=全部筛选有效记录节点/可解释关系与分组/选择编辑拖缩/建改删恢复；G3=成熟D3/计算绘制存储分离/保留现场/当前验证与新EXE。A1=不拿随机装饰或只换色当图；A2=不上传、不任意HTML、不加关系schema/模型/插件/双引擎；A3=不每帧构图setState保存、不完全成对、不截断节点、不丢现场。保持 Note/AppData.version=1/SQLite/AI/草稿/回收站和当前12项过滤账本契约。

核心链路：App唯一notes→未删id+content语义快照→纯稀疏模型/专用Worker→现有selectNotes的当前id诱导子图→独立D3副本/会话坐标镜头→Canvas；选择id→安全详情/原NoteComposer→App既有保存。网格与图消费同一筛选条件，物理和光流从不触发业务持久化。只拆NotesView与必要共享筛选，不全面重写App/AI/账本/设置。

| 已知事实 | 改动锚点 | 验证口径/责任 |
| --- | --- | --- |
| App仍侧栏、NotesView单列；AmbientNodes随机边缘点 | S1 NotesView提取；S3 App导航/CSS Grid/光场 | root真实项目前后截图，默认2–3列与大图；不能用候选HTML |
| UUID/content/deletedAt现有字段、selectNotes已有12项 | S2 semanticSnapshot/buildNoteGraph/projectGraph；S3共享筛选 | impl节点集合/孤立/删除与不变性；root改删恢复/过滤 |
| renderMarkdown安全语义含标题/列表/代码/颜色字号 | S1/S2 noteText与noteFormat共用token | impl纯提取夹具；root格式保存/回填/旧内容 |
| D3会mutation；zoom/drag坐标/点击竞争需承担 | S4 NoteGraph simulate副本/屏幕subject/逆变换 | impl副本/坐标纯断言，root拖缩/拖后click/静态交互 |
| TF-IDF依赖全语料；宽标签/高频词造成稠密 | S2倒排/候选64/配额/群组 | impl大标签/重复/确定性/边≤4n，root样例依据 |
| 长任务/旧Worker响应/后台与StrictMode | S2 useNoteGraph；S4循环/监听清理 | impl请求合同测试；root失败/切页/暂停/减弱/多帧及实际成本 |
| 0.4.0历史/未知现场/新版本与备份版本不同 | S5元数据/文档/EXE | root当前输出与哈希，历史保留，未知工作不合并提交 |

片段闭环先行：S1给App→提取视图调用；S2给快照→版本模型→当前节点投影；S3给网格/图共享筛选与顶部结构；S4给独立副本、坐标与单循环；S5明示元数据/证据路径。它们足以顺读用户操作→模型/展示→原保存，以及动效→停止，不要求读者猜第二个笔记源或隐含全局状态。

统一证据合同：每包impl只执行本地纯测试/类型/构建/只读diff检查，记录命令、退出码、完整输出/失败至本功能`impl_report_r1.md`；不得浏览用户UI/读凭据真实库/启动EXE/Git写。root独立检查、隔离UI与多帧证据至`ui-observations.md`，性能/Windows至`release-verification.md`及最终`docs/Release.Verification.0.5.0.md`。每包缺证据只能记未验证/待承接，不能默认PASS；reviewer独立Gate2/ReviewImpl。代码注释英文、文档中文，源码不压复杂分支成一行。

## 2. 工作包

### S1：等价职责整理（G3，A2/A3）

**文件/关键实体**：App.tsx的NotesViewProps/NotesView/NoteCard/Empty移至平铺`src/NotesView.tsx`；其中类型的view仅需`'all'|'trash'`，不引用App私有View；保留全部props与处理函数。`src/noteText.ts`承接当前renderInline的token表达式为共享常量；noteFormat.tsx只引用同一表达式，不改变转换/显示逻辑。App的saveNote/trash/restore/持久化不搬移。reader先看props和导入边界，目标是拆出本轮将改的记录视图，其他视图留App。

```tsx
// App.tsx: replace local NotesView/NoteCard/Empty definitions with this import.
import { NotesView } from './NotesView'
// noteFormat.tsx: renderInline keeps its body and uses the shared token pattern.
import { INLINE_TOKEN_PATTERN } from './noteText'
```

依赖无；先原样搬移/更新imports并build，再做功能。函数只是移动不删除，调用方App→NotesView→NoteCard/Empty、格式显示调用保留；不删除AmbientNodes实现等其他整链。作者体验：props命名明确、不引入View公共枚举或通用renderer，保留现有编辑/复制/回收站语义。impl构建/搬移对照证据；root连续输入/选区/回填回归，缺UI不称等价体验已验。回滚仅逆本轮搬移与imports，不能HEAD restore覆盖旧工作；结构补丁和后续功能分别组织。

### S2：纯关系与有界计算（G2/G3，A2/A3）

**文件/接口**：`src/noteText.ts`的`plainNoteText`；新增`src/noteGraphModel.ts`的`buildNoteGraph/projectGraph`及图类型、`src/noteGraph.worker.ts`、`src/useNoteGraph.ts`；`tests/noteGraph.test.mjs`与必要请求合同用例。App调用hook传activeNotes；hook仅接语义快照。reader先看输入/节点集合与Worker版本，目标形态是纯模型+单专用调度，不是图数据库或通用任务系统。

**纯显示提取**：先使用现有withoutTags去标签，保留既有语法；按renderMarkdown同一块规则逐行：删除已有kbd包装，代码围栏只移除界符、内文原样；正文标题/列表只移除结构前缀；非代码行用共享INLINE_TOKEN_PATTERN取对应显示文字，含颜色/字号内容。未知标记保留字面含义，任意`<…>`不解析/执行，绝不用DOM/HTML渲染来构图。随后NFKC、lowercase、合并空白trim；`Array.from`按Unicode码点，`\p{L}/\p{N}`连续段生成2/3-gram，不跨标点/段落拼gram。emoji完整保留在显示/重复核验文本，符号本身不作字符词面特征。空正文不因同哈希建边，一字不同正文无gram时不推断关联。

**语义与类型合同**：语义键为未删快照按id码点排序后的`JSON.stringify([[id,content],…])`，仅该键变更触发正文模型；done/date/updatedAt/theme/query/pointer不重算。快照/模型不包含原Note对象；快照标签`Set(tagsFor(content))`按记录去重，DF计记录不计重复出现。仅graph首次访问才启用模型hook；之后会话保留模型/最新状态，但非graph模式不启动新重建，回图按最新键更新。纯类型大致如下，非持久化契约：

```ts
type GraphInput = { id: string; content: string }
type GraphNode = { id: string; group: string }
type GraphEdge = { source: string; target: string; sharedTags: string[]; similarity?: number }
type GraphModel = { nodes: GraphNode[]; edges: GraphEdge[] }
// Input notes are copied semantic data. D3 is not imported into this module.
buildNoteGraph(input: readonly GraphInput[]): GraphModel
projectGraph(model: GraphModel | null, visibleIds: readonly string[]): GraphModel
```

**确定算法**：

1. 输入按id稳定排序，标签每记录去重/排序；标签桶内按id形成环的前后邻居候选（2条记录只有对方，1条无候选）。跨标签候选去重后按共同标签数降序、对方id码点序，主动选top2；边列出实际共同标签，不添加标签节点。
2. gram计数用`1+ln(tf)`，IDF=`1+ln((1+N)/(1+df))`，向量L2归一化。候选倒排只用df≤`max(16,ceil(.2*N))`的区分性gram；高频gram仍可参与已选候选的最终余弦，但不扩候选。每gram posting按id排序，为每记录先收集不超过64个候选：优先规范化相同正文桶的前后邻居，再按本记录gram的IDF降序/gram码点序遍历posting，候选达到64即停止扩展，不临时堆出N个候选再截断。该规则显式漏召回，是显示部分关联，不是完整相似搜索。
3. 相同正文桶以完整规范化非空字符串作Map键（等价哈希桶并核对完整字符串，避免hash碰撞）；相同正文得分1，即使无gram。其余对≤64候选做稀疏余弦，过滤≥0.32，按得分降序/id序主动选top2。不会建自环。
4. 两通道主动top2是**选取配额，不是最终无向度数**。用排序后的source/target键合并，同一对保留事实标签+推断分数；最终无向边≤4N，接收到他人选择时某节点度数可>2，详情不能承诺完整邻域。纯模型返回全部输入节点，只有投影时去不匹配边，仍为每个当前visibleId生成节点；更新中/失败model=null也生成全部当前节点，group='pending'，不展示陈旧边。
5. 有标签主组取全语料DF最小标签、同频码点序，key=`tag:<tag>`。无标签节点只用相互主动正文top2且score≥.55的边求连通分量；多节点key=`text:<最小id>`、显示“正文关联组”，单节点key=`single:<id>`。组色用稳定hash映射有限紫/蓝/青/粉/橙调色板，key作依据，图例文字补色；有标签/无标签间推断边保留但不并组。筛选诱导子图不重分组/IDF。

**Worker合同**：未删记录≥80或原content总UTF-16长度≥40,000时用唯一专用module Worker；较小快照同步纯计算但同样version守卫，目标成本由root实测。请求只含`{version,input}`，回应`{version,model}`或`{version,error}`；不读存储/DOM/网络。hook状态仅idle/updating/ready/error（业务可读提示）。单在途请求+**至多一个最新待处理快照**；忙时覆盖pending、不继续post。语义改变立即version++、清模型与详情依据；回应仅version==current接受，旧回应只释放busy并发最新pending。

每次在途有10秒timeout；error/messageerror/创建失败/Worker内error回应统一terminate、清busy/pending/timer、进入当前version error并清关系；不无限重试、不退回无界主线程全文计算。显示“正文分析暂不可用，记录节点和标签筛选仍可使用”，给“重试”；明确当前关联暂不可用，不假造标签边或保留旧边。重试仅处理当前快照一次；新语义变化允许重新发一次。挂起非graph模式或卸载终止worker/清timer，晚到响应不更新，回图用新version。小快照异常同样error；一直updating不是合法终态。

请求规则在useNoteGraph.ts内以一个**专用可测试的createGraphRequests**具名边界承载，hook负责把结果/状态接React；测试仅替换Worker factory与clock回调，不引入通用调度/超时配置或用户配置。该边界对外只有提交当前快照、重试、取消和结果/状态回调，便于Node纯合同用例真实覆盖实现而非测试另一份影子队列。

```ts
// useNoteGraph.ts: one in flight; pending is a replaceable latest snapshot.
onSemanticChange(input) { version++; model = null; pending = { version, input }; if (!busy) dispatchLatest() }
onReply(reply) {
  clearRequestTimer(); busy = false
  if (reply.version === version) acceptModelOrVisibleError(reply)
  if (pending) dispatchLatest()
}
onFailure() { terminateWorker(); clearRequestTimer(); busy = false; pending = null; model = null; status = 'error' }
// App/graph: current IDs win even while model is null or an old reply arrives.
const shown = projectGraph(currentModel, visibleNotes.map(n => n.id))
```

依赖S1；作者体验：面向用户只写“共同标签/正文相近/自动推断，仅供参考/显示部分关联”，算法/队列仅在代码文档。impl `npm test`覆盖原12项以及纯提取/Unicode/空/标签重复DF/仅标签/大团≥500/无自环/边≤4N/输入freeze/顺序确定/分组与投影；Worker调度用fake transport/timers验证inflight+pending、旧response、timeout/error/messageerror/createfail/重试/卸载，真实module Worker加载由root浏览器承接。root100/500/1000节点构图与真实失败恢复记录；缺真实Worker证据不称生产异步已验。回滚撤新模型/hook接线，记录原数据不变；失败可暂保留节点与记录入口，但不算完整脑图验收成功。

#### 本轮修订说明

[修订: PLAN_DEFECT-R2] 对应`review_notes_impl_r1_1.md` R1/R3，G2/G3与A2/A3不变；保留已实施S2全文，以下覆盖旧80/40000工程阈值并收敛实际评分循环。`src/useNoteGraph.ts#createGraphRequests/dispatchLatest`改为未删记录**≥24条 OR 原content总UTF-16长度≥8000**进入Worker；两个等于边界均异步，只有两条件同时低于阈值才同步。1在途/1最新pending、版本+实例/epoch守卫、10秒终态、error/messageerror/创建失败/重试/取消合同原样保留，不把异步化称为总耗时达标。

[修订: PLAN_DEFECT-R2] 阈值片段只替换当前`large`判定，不增接口或配置；`tests/graphRequests.test.mjs`直接调用生产请求控制器，确认23条且总7999字符同步/factory=0，24条即使不足8000也用Worker，少于24条但总8000也用Worker；76条/39166反例必须走Worker。沿原测试核验旧回应、最新pending及错误/取消仍不暴露陈旧边。

```ts
// useNoteGraph.ts, dispatchLatest: replace the r1 80 / 40_000 boundary.
const large = request.input.length >= 24 ||
  request.input.reduce((sum, note) => sum + note.content.length, 0) >= 8_000
```

[修订: PLAN_DEFECT-R2] **评分锚点**：当前`src/noteGraphModel.ts#buildNoteGraph`已归一化vector并逐record.vector gram向scores累加，但完整bucket扫描再candidates.has仍为平方工作。仅替换这个评分内循环：每gram遍历posting与既定candidates中较短集合，最多64项；外层gram顺序、norm/IDF、df=1跳过、候选发现/顺序、重复正文得分1、top2/阈值/边合并和分组完全不动。两分支对每候选的加法顺序仍沿原gram顺序，不重排浮点求和；不截正文/节点，不引入模型接口、计数配置或框架。目标片段承接现有`record.vector.forEach`：

```ts
// noteGraphModel.ts: bounded scoring after candidates have already been selected.
const bucket = postings.get(gram)!
if (bucket.length < 2) return
if (bucket.length <= candidates.size) {
  for (const other of bucket) {
    if (candidates.has(other)) scores.set(other, (scores.get(other) ?? 0) + weight * records[other].vector.get(gram)!)
  }
} else {
  for (const other of candidates) {
    const otherWeight = records[other].vector.get(gram)
    if (otherWeight !== undefined) scores.set(other, (scores.get(other) ?? 0) + weight * otherWeight)
  }
}
```

[修订: PLAN_DEFECT-R2] **验收/回滚**：依赖现有S1/S2与独立回审；impl将r1当前模型输出作为只读等价基线，用少量重复/混合正文、Unicode、共同标签/无标签、同分及输入乱序夹具做完整deepEqual（含浮点分数、节点/边顺序/组），不能只比数量。复用已有r1快照；必要时保存当前源码只读TEMP副本，不作为第二生产实现。小规模成本证据对实际评分段做测试/临时诊断计数，不增生产接口：100/200条相同“甲乙丙丁”的五gram、每条2候选，应各约1000/2000次评分访问而非旧50000/200000；通用断言每gram访问≤min(bucket.length,candidates.size)≤64，明确只约束评分段，候选发现/标签桶成本不冒称整体线性。原35项加新边界/等价/计数、build与完整失败输出落`impl_report_r2.md`/对应validation；本代理不执行压力。root后续承接真实Worker加载/总等待/主线程/包体，缺证据不称舒适或预算通过。回滚仅逆本轮判定/评分补丁；旧阈值回撤仍有已知76条阻塞风险，保留失败记录、不能当发布放行。

### S3：顶部炫彩工作台与排版（G1/G2/G3，A1/A2/A3）

**文件/关键实体**：App.tsx的View/nav/keys/JSX、NotesView.tsx、新增`src/NoteFilters.tsx`，styles.css layout/theme/motion与SettingsView动效文案。NotesView复用NoteCard；NoteFilters消费原query/tag/unfinished/clear/onTag callbacks，记录与图使用同一条件。reader先看顶栏结构与Grid，目标是完全不同轮廓且新图主入口明确，不是旧侧栏换token。

**结构**：View增graph。shell改顶部品牌+主导航记录/关联图/账本、右侧AI/主题/新建/工具；回收站/设置工具具名称，窄屏主导航仍可见可滚动。删除sidebar JSX而非保留244px列；固定标签迁为顶栏下可横向滚动的快捷chips，保留固定/取消功能。CtrlK从非编辑/AI切记录并focus，标签选择保持当前all/graph上下文（其他页到all），trash仍清条件；new在graph/all创建note、ledger建transaction。新保存若被条件排除仍如实反馈，不偷偷改筛选。

**排版**：默认grid，内容max-width:1440px；≥1180px三列，721–1179px两列，≤720单列，`grid-auto-flow:row`与DOM顺序一致，不用columns瀑布流。可切“网格/按日期”，日期组取scheduledDate否则本机createdAt的dateKey，非法为“未指定日期”；组按日期降序、组内保留源顺序，每组仍用同一响应式grid，旧日期导航不恢复。不改变Note字段或默认记录顺序。长正文卡片预览可有行数限制，点击仍完整编辑，图/节点数量不受预览裁切。

大量记录采用简单分批呈现，无虚拟列表库：网格/日期视图初始60条，显示“已显示60 / 共1000条”及“加载更多”（每次+60，上限筛选总数）。全文搜索/标签/未完成先作用于**完整集合**，再取展示批次；条件或排版模式变化重置60，notes增删修改不自动清用户筛选。日期模式先对完整结果分组排序，再按全局60额度依次呈现组/记录；已显示数是实际记录数，不是组数。全部匹配记录可连续加载访问，单结果搜索立即可见；图始终消费完整visibleNotes，不把卡片展示子集传成图nodes。root用压力夹具确认计数/加载更多/搜索/切模式，impl为批次数量及完整筛选先后写少量必要纯断言，避免镜像测试或新分页抽象。

**主体光场**：浅色底建议#edf1ff/#f4efff、正文表面接近白色，深色#111629、正文#1b233a；紫#8b5cf6/青#22c7cf/粉#ec6aaa用于hero、导航、图底板和卡片细渐变边缘，正文用稳定高对比文字。3个预绘CSS radial-gradient光层位于主体，transform/opacity缓慢漂移（14–22秒）；不每卡片blur/shadow动画或大片逐帧backdrop-filter。focus/hover用transform/opacity，选中更明显；账本/AI/设置沿同token跟随，Modal/readability保持。

graph视图宽画布+右侧详情约300px，高`clamp(420px,65vh,760px)`；≤720画布约52vh/最小340px、详情/文字选择在下方。图工具新建/暂停/放大缩小/适配全图、节点/边计数、事实/推断图例及共享筛选直接可见。文字节点选择使用包含所有visibleId的select或列表（不只前100），详情正文renderMarkdown/标签/关联依据/编辑/移至回收站，找到最新notes中的id再调用App，不能保存派生副本。

**动效偏好**：沿luma-ambient-motion键，设置改“动态效果”；同一偏好控制主体CSS光场与图呼吸流光，reduced-motion优先。App pageVisible从visibilitychange更新（仅事件setState），composer打开/hidden时motion-disabled类停止CSS与图自动循环。旧AmbientNodes不再挂载/import，但保留其源文件，不把随机点当图，不删原未提交文件。

```tsx
// App.tsx: workspace-session state/ref stays above switched views.
const graphSession = useRef({ positions: new Map(), camera: null, fitted: false })
<header className="workbench-header">/* Brand, visible main nav, utilities. */</header>
{view === 'graph'
  ? <NoteGraph notes={visibleNotes} model={model} session={graphSession} onEdit={editLatestId} ... />
  : <NotesView notes={visibleNotes} layout={recordLayout} ... />}
// styles.css: final breakpoints own the same grid declaration.
.note-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); }
```

依赖S1，S2提供model，S4实现图；作者体验：动作具名称/焦点，导航不隐藏主要能力；设置不铺工程名词。impl build和props/断点静态检查入报告；root真实改前后截图/网格日期/浅深宽窄/标签固定/快捷与格式/草稿删除安全回归，缺UI观感不宣称符合炫彩。回滚仅本轮shell/排版token与imports，不恢复HEAD全文件；保留12项和原存储契约。

### S4：D3 Canvas与完整生命周期（G2/G3，A1/A2/A3）

**文件/关键实体**：新增`src/NoteGraph.tsx`的session绑定/reconcileGraph/drawOnce/syncMotion/fit/interaction；可将纯坐标/初始位置 helper置同文件或一个专用`src/graphGeometry.ts`（只在纯测试需要时，不建renderer）。运行四个D3子包各精确3.0.0 ISC；dev类型force3.0.10、zoom3.0.9、drag3.0.7、selection3.0.12 MIT，package/lock按此安装不更新其他依赖。reader先看模拟副本和drag subject/zoom invert，目标为一个Canvas一套成熟行为一个循环。

**会话/模拟**：App useRef持有Map<id,{x,y}>/camera/fitted，跨graph卸载/回到记录仍存在，不持久化；已删坐标可保留至本App卸载以支持撤销恢复，活动节点集合仍严格visibleIds。model/cache不含原Note。每次reconcile创建独立SimNode/SimLink，复制缓存位置；新节点按group稳定网格锚点+UUID稳定小螺旋偏移，pending按UUID铺开，静态也不重合于(0,0)。forceSimulation(...).stop()立即停默认timer，forceLink/collide/manyBody/group的forceX/Y用成熟D3；同id更新保留x/y并只温和alpha(.3)加热（允许动态时）。选中节点fx/fy固定至取消选择，拖放可更新该固定点；非选中拖完释放fx/fy。循环tick仅在alpha>alphaMin、布局可冷却，光流继续。

模型updating/error时只保当前节点和缓存坐标，不以pending组重加热旧节点；允许时仅节点呼吸继续，待ready后按真实组温和布局，避免每次保存等待阶段把整图拉散。

**坐标与手势**：Canvas内部缓冲不影响D3 CSS像素坐标；zoomTransform存k/x/y至session，`scaleExtent([.2,4])`，世界→屏幕=transform.apply，命中用transform.invert(CSS point)且至少10CSS像素的点击半径。一次输入事件可读boundingRect，不每帧布局测量。drag.subject返回**屏幕坐标代理**`{node,x:applyX(node.x),y:applyY(node.y)}`，drag事件e.x/y经invert写物理节点，不能把world x/y直接当screen subject；clickDistance(4)采用成熟D3抑制拖后click。zoom的mousedown filter在节点命中时拒绝（交给drag）、背景允许；wheel允许缩放，touch单点节点给drag、背景给pan，双touch给zoom pinch，drag拒绝多touch。只Click选预览，明确编辑按钮开composer；不使用pointerup自动编辑。工具放缩/fit通过同zoom行为，暂停用即时transform不transition，保持camera/D3内部transform一致。

**绘制/适配**：ResizeObserver读图容器CSS尺寸，实际DPR=`min(devicePixelRatio,1.5,sqrt(2_500_000/(w*h)))`并floor缓冲；不修改全局DPR。预绘小光晕sprite按有限palette复用，基础边批量画、推断虚线；节点全画、标签默认只选中/邻居及有限近景标题，文字选择包含全部记录。节点呼吸与真实边流光可见；≥500节点降低流光采样频率/活动粒子至最多128，不减少节点/真实基础边。首次可用尺寸/首组节点自动fit一次；数据/筛选/主题/resize只保camera，用户明确fit才重新适配全部当前节点；空图fit无操作。画布状态/计数/图例和详情为可检查真实UI，不用假nodes样例。

**唯一运行合同**：可持续=`graph挂载 && ambientEnabled && !reduced && pageVisible && !composer`；选中仅冻结其物理点不停止其他流光。30fps单rAF由effect私有管理，时间dt上限50ms，恢复lastTime=0。paused/reduced/editor/hidden停止rAF与simulation；paused可见拖缩/resize/theme/新数据只drawOnce，静态新节点用上述初始坐标，不暗中tick/reheat。hidden禁止连一次必要绘制，dirty留到visible后一次重绘；恢复仍按用户/系统/编辑条件决定循环。停自动后文字选择/预览编辑/fit/拖缩完整可用。

```ts
// NoteGraph.tsx: only copied simulation objects are mutable.
const nodes = visibleIds.map(id => ({ id, ...seedOrCachedPosition(id) }))
const links = shown.edges.map(e => ({ ...e, sharedTags: [...e.sharedTags] }))
const simulation = forceSimulation(nodes).stop()
const subject = point => { const node = hit(point); return node && { node, ...toScreen(node) } }
onDrag(e) { const [x,y] = camera.invert([e.x,e.y]); e.subject.node.x=x; e.subject.node.y=y; requestNecessaryDraw() }
syncMotion() { cancelOwnedFrame(); simulation.stop(); lastTime=0; if (canAnimate()) startOneLoop(); else if (pageVisible) drawOnce() }
```

清理对称：cancelAnimationFrame、simulation.stop、ResizeObserver.disconnect、canvas `.on('.zoom',null)`/`.on('.drag',null)`、本地click/keydown监听、media/visibility监听和任何timeout，图卸载时更新session而不清App缓存；媒体/页面可复用App事件，不再多设无意义监听。drag进行中切页需移除该组件装上的window D3临时监听（以当前gesture归属清理，不能移除其他组件行为）；回归测试包括中途卸载。数据重建先stop旧simulation/loop，避免StrictMode双循环。

依赖S2/S3/锁依赖；作者体验：限量具名handlers和一个运行谓词，不做多层手势状态机；static仍有明确同等访问入口。impl纯geometry/副本深freeze、build与生命周期对照；root click/详情编辑/拖后不选/缩放fit/camera跨视图与内容/暂停后新节点/系统减弱/hidden恢复/中途切页/开关10次/multiframe录证，不以代码存在代替操作成功。回滚只停挂载并撤本轮图接线（记录网格可用）；性能降级先减发光/流光/标签，不截节点，不把禁图当满足G2。

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.1] 对应`review_notes_lwplan_1.md`的R1/R2，仅补S4既定坐标与取消合同，以上正文保留；本段明确旧片段未写出的绑定/恢复细节，不增加产品目标、依赖或状态框架。第1轮Gate-2=FAIL作为历史保留，修订后须独立第2轮评审，不能自行放行实施。

[修订: PLAN_DEFECT-R1.1] **R1绑定锚点**：`drag().container(canvas)`必须显式设置；`pointer(sourceEvent, canvas)`命中、drag.subject的`e.x/e.y`、`toScreen`结果及drag事件`e.x/e.y`均为同一Canvas局部CSS像素。`toScreen`只应用camera，不加画布在页面中的offset；命中与drag写入再用camera.invert，DPR只影响绘制缓冲。Canvas自身设border/padding=0，布局留白在外层；不以默认parentNode或浏览器client坐标代替局部原点。已有zoom filter/click命中也调用同一局部pointer入口。

[修订: PLAN_DEFECT-R1.1] 必要绑定片段（`drag`/`dragEnable`来自d3-drag，`pointer`/`select`来自d3-selection）；`onDrag`沿上段逆变换，生命周期handler在下段补齐：

```ts
// All gesture coordinates use canvas-local CSS pixels, independent of DPR.
const localPoint = event => pointer(event, canvas)
const nodeDrag = drag().container(canvas)
  .subject(e => subject([e.x, e.y]))
  .clickDistance(4)
  .on('start.owner', captureMouseGesture)
  .on('drag.move', onDrag)
  .on('end.owner', releaseMouseGesture)
select(canvas).call(nodeDrag)
```

[修订: PLAN_DEFECT-R1.1] **R1验收**：impl实际纯geometry用例取Canvas rect左120/上80、camera `{k:2,x:30,y:-20}`、world `(10,15)`，应得局部CSS `(50,10)`、client `(170,90)`；local drag移至`(70,0)`逆变换得world `(20,10)`。断言非零offset下命中/subject/拖动共用原点，world→local→world往返；DPR=1与1.5结果相同。fixture可以由client减rect验证输入适配，生产用D3 pointer；这证明几何合同，不等于真实Canvas拖拽已验。

[修订: PLAN_DEFECT-R1.1] **R2取消锚点**：仅鼠标drag start在D3已安装window临时监听后，组件ref记录该sourceEvent.view、当前`mousemove.drag`/`mouseup.drag`的非空监听函数身份与active。正常mouse end清ref（D3正常结束已恢复）；touch不登记window鼠标所有权。卸载先标记组件disposed禁止晚回调，再检查active且window两监听仍与记录身份一致；仅此所有者移除这两个临时监听，随后`dragEnable(view)`恢复D3限制的原生拖拽/文本选择，最后清ref。无活动手势或监听已被其他组件接管时不清window、不调用dragEnable，不扫其他namespace；canvas与其他监听仍按原对称清理合同执行。

[修订: PLAN_DEFECT-R1.1] 最小取消片段；`captureMouseGesture`在mouse start用`select(view).on(...)`读取已装监听，`releaseMouseGesture`仅清本次mouse ref，触摸不覆盖它：

```ts
// This ref owns only the D3 mouse gesture started by this canvas.
function cancelOwnedMouseGesture() {
  const g = gestureRef.current
  if (g?.active) {
    const target = select(g.view)
    if (g.move && g.up && target.on('mousemove.drag') === g.move && target.on('mouseup.drag') === g.up) {
      target.on('mousemove.drag', null).on('mouseup.drag', null)
      dragEnable(g.view)
    }
  }
  gestureRef.current = null
}
// Effect teardown: block late handlers before releasing owned native state.
disposed = true
cancelOwnedMouseGesture()
```

[修订: PLAN_DEFECT-R1.1] **R2验收/证据边界**：impl用受控window/EventTarget夹具执行真实取消实现的start→卸载路径，核对临时move/up先移除、dragEnable随后恢复dragstart/selectstart或document user-select、ref归零及disposed回调不写节点；无gesture/正常end/监听已被其他所有者替换三例不调用恢复或移除他人监听，其他namespace保留。只为该清理函数做必要可测试边界，不造事件管理器。root若工具支持才录真实中途切页后正文选择/拖后click；当前CUA DOM-only缺原生drag、系统减弱/hidden模拟接口时，按钮缩放/fit、静态文字选择、编辑和多帧截图可承接，其余实际组合明确未测，CPU/纯geometry不替代它们。修订回滚只撤本节新合同及其对应本轮代码；保留原S4/其他工作包与现场。

[修订: PLAN_DEFECT-R1.1] **追加Gate-1口径**：复核S1–S5 Required Set仍存在、目标/反目标与验证责任/证据不足约束不变、R1/R2绑定和片段闭环具备、修订章节有本说明且新增段落统一标签、原支撑正文未删、无升级条件被绕过；本地回读核验后只交Review(LW)第2轮，Gate-2待独立结论。

#### 本轮修订说明

[修订: PLAN_DEFECT-R2] 对应实施评审R2，G2/G3、A2/A3及S4/R1.1全部支撑保留。`src/NoteGraph.tsx#zoomBehavior`补背景mouse pan的`start.owner`/`end.owner`；在sourceEvent.type为mousedown且view有效时，D3已安装window监听后捕获`mousemove.zoom`/`mouseup.zoom`非空函数身份与active，组件局部`panGesture`保存；mouseup正常end清引用。wheel/程序fit/按钮zoom/touch start或end不登记、不覆盖鼠标所有权。沿`src/graphGeometry.ts`现有OwnedMouseGesture模式增具名`capturePanGesture/cancelOwnedPanGesture`，无需通用namespace参数或资源管理器。

[修订: PLAN_DEFECT-R2] 最小状态/清理片段；pan取消与既有node drag取消独立，仅本组件拥有活动监听才恢复原生选择，其他owner已接管则不扫window。正常end已由D3恢复，不额外dragEnable；卸载后disposed仍拦camera/绘制/缓存晚回调：

```ts
// NoteGraph.tsx: capture only a real background mouse pan, after D3 binds window.
zoomBehavior.on('start.owner', event => {
  if (!disposed && event.sourceEvent?.type === 'mousedown' && event.sourceEvent.view)
    panGesture = capturePanGesture(event.sourceEvent.view)
}).on('end.owner', event => {
  if (event.sourceEvent?.type === 'mouseup') panGesture = null
})
// graphGeometry.ts: same identity guard as node drag, using only .zoom move/up.
if (g?.active && target.on('mousemove.zoom') === g.move && target.on('mouseup.zoom') === g.up) {
  target.on('mousemove.zoom', null).on('mouseup.zoom', null)
  dragEnable(g.view)
}
// Teardown before canvas namespace removal; capture accepts only nonempty listeners.
disposed = true
cancelOwnedPanGesture(panGesture); panGesture = null
cancelOwnedMouseGesture(gesture); gesture = null
```

[修订: PLAN_DEFECT-R2] **验收/回滚**：impl扩展`tests/graphGeometry.test.mjs`，用实际安装d3-zoom/selection与受控EventTarget/Canvas启动真实D3 mousedown pan，再调用生产取消实现；验证window .zoom move/up及dragstart/selectstart限制消失、移除先于dragEnable、迟到mousemove不再preventDefault/改camera、其他namespace保留。正常mouseup后、无活动、其他owner替换身份、touch/wheel/程序zoom不拥有鼠标四类边界均不扫window或误恢复；保留原node drag坐标/取消全部用例。测试只需D3所用DOM表面，不建浏览器模拟框架；root原生组合仍按S4未测清单承接，受控测试不升格为GUI。证据落r2报告；仅逆pan handler/helper/test增量回滚，不回收图/会话/原R1.1功能，回撤清理补丁须明确活动pan风险未解决。

### S5：验证、0.5.0与EXE（G1/G2/G3，A1/A2/A3）

**文件/锚点**：package.json/package-lock.json、Cargo.toml/Cargo.lock qingjian包、tauri.conf.json全为0.5.0；Note/AppData备份version保持1；README、CHANGELOG、Project.Progress、Release.Testing及新Release.Verification.0.5.0，保留0.4.0历史。依赖许可说明记录四D3 ISC/四类型MIT，不复制research全文。目标形态由版本/路径/命令清单明确，执行协议不变，文字足够无需额外代码片段。

impl执行`npm test`（原12项+图/请求合同实际用例数）、`npm run build`、`git diff --check`完整输出至impl_report；root独立重跑、Rust check/test（若仍0用例明确写出），ReviewImpl独立审代码/证据。root隔离7有效/1回收站夹具实际确认7节点、筛选/孤立/图依据、编辑/建删撤销恢复、grid/date、浅深/窄屏、motion多帧及静态可用，编辑连续输入/选区/保存回填/草稿/快捷、回收站/复制仍回归。不操作用户真实数据/不发送AI。

root性能记录100/500/1000笔记平均500字含大共同标签/近重复语料，10轮构图p95与worker总等待分开，Canvas simulation+draw p95、UI交互/Long Tasks、关开同环境与新旧Vite gzip差值；目标500初建≤300ms、主线程单task≤50ms、draw≤8ms、30fps、缩放响应≤100ms、增量gzip≤25KB，均待测。工具不能测GPU/原生缩放/触屏/后台/IME时明确未测，不把Node纯函数计时当生产UI丝滑。

root当前验证后`npm run release:windows`，NSIS失败保留输出有限重试，必要时`npm run desktop:build -- --bundles msi`获得程序EXE/MSI。当前`src-tauri/target/release/qingjian.exe`与bundle/nsis实际文件记录版本/mtime/大小/SHA256/可行启动；不跑安装器、不上传制品，不把MSI称安装EXE。旧0.4包不作新成果。缺本轮构建/哈希不宣称交付。依赖S1–S4与实施审查；作者文档写实际能力/未测边界，不露模型工程术语。

回滚仅本轮元数据/补丁，不删除旧包或覆盖源现场；未知初始合并确认不影响实现制品，Git由root自行承接且未获答复不混提交。构建产物/密钥/.serena不提交、不强推。每次迭代英文conventional commit建议可用`feat: add a luminous note workspace and local relationship map`，仅建议不在本代理提交。

#### 本轮修订说明

[修订: PLAN_DEFECT-R2] 对应实施评审R4及候选预算失败，S5已实施元数据/文档与旧发布记录全部保留。当前35项纯测试/build0只为r1源码证据；500随机正文p95=1265.95ms、中文模板500=360.24ms均未达300ms候选，JS+图增量至少27.39KB且Worker另计未达25KB候选。阈值下调与评分补丁后需记录同方法新结果；候选未达继续如实报告，不能用Worker隔离或仅初始chunk差改称通过。

[修订: PLAN_DEFECT-R2] **承接顺序/门禁**：本轮Review(LW)→有限r2补实施与纯测试/构建→独立ReviewImpl；root待系统内存恢复后承接真实GUI/多帧/Worker加载、Rust测试及新0.5 EXE/hash/可行启动/旧库语义比较，当前不启动服务或压力/DB/EXE。保留IAB crash/attach-CDP失败、Rust E0463/E0786/mmap os1455及2MB分配失败等已见限制，不能据内存故障推断应用缺陷，也不能称Rust或交付通过。根证据继续落UI观察/发布验证；缺当前证据不完成/归档/发布。各修订章节说明/统一R2标签、原S1–S5与R1.1文本保留、无产品漂移/新审批、分层责任及局部回滚为追加Gate-1必检；Gate-1仅交独立回审，Gate-2待reviewer/root结论。作者仍读现有具名边界/用户原文案，不增加配置负担；无跨功能事实。

## 3. 顺序、门禁、漂移与风险收口

顺序S1等价提取→S2模型/有界Worker及纯回归→S3工作台/排版→S4 D3图/持续效果→S5元数据/impl自证→ReviewImpl+root真实验证/新EXE。不得跳评审，结构与功能保持独立补丁，原始/0.4快照用于对照而非授权restore。主链/接口无关系schema迁移；降级仍明确图能力未满足，不瞒失败。

Gate-1存在性自检：目标锁/反目标映射、文件/关键函数/接口/handler、任务输入输出/边界/依赖/验收/回滚、作者体验、impl/root证据产物+责任+不足约束、主链/事实映射/片段闭环、兼容/Worker版本与停机、跨模块session/模型/simulation契约、风险/降级均已落盘，Gate-1=PASS，仅交独立评审。Gate-2=review_plan主检+root复核Required Set及HL五项细化：正文/配额/确定性、worker队列失败、session/静态手势、循环清理、真实炫彩/版本证据；缺任一回LW→Review(LW)，不进impl。计划缺陷按PLAN_DEFECT修订留痕，基线口径不唯一先委托提问；代码缺陷回impl。

本轮无新阻塞产品问题，工程阈值/配额/运行条件属已授权how。批量澄清未触发，原因是完整基线+HL+评审已给唯一方向；若出现新假设/风险/阶段切换即时同步root，在本节“事件对齐”留痕，按P0阻塞/P1高风险/P2优化排列模板：`【DELEGATE_QUESTION】问题…；影响阶段…；A推荐+原因/B权衡；请回复Q1=A…`；需补事实用`【DELEGATE_ACTION】supplemental-research`，不递归委派。

事件对齐：HL/Readiness PASS→LW已回传；root补充产品文案/semantic只含id+content已纳入S2/S3；root合成压力夹具与有界呈现承接已纳入S3的60条分批，无虚拟列表/节点截断；LW→Review(LW)由本稿交接。drift/stale：旧边缘装饰/关系延后被新基线覆盖；前端12项存在而旧研究无测试已更正；0.4.0只为历史；共享readiness编号模板缺core定义沿已有报告，不改shared skill。本次一次多命令工具响应被截断，已单独重读readiness与App分段，未把截断当完整证据。

U1/U3由明确模型/主导航/D3路线/交互合同关闭设计口径；U2/U4性能与质量通过上述夹具及实測/未测说明收敛，不能给全部设备零bug/语义准确承诺；U5 GitHub403/release抓取失败保留检索限制。既有JSON损坏/导入替换/桌面双保存仅报告，不扩大修复。无新增跨功能事实。
