# 晴小团装扮与空间模型配置：代码库调研

日期：2026-10-04。角色：代码库研究员。本报告只记录现状、证据与未知点，不给出实施方案或代码变更。

## 证据身份与需求

- 完整读取本轮 `README.md` 的最新需求原文：「我去好可爱，你参考了什么来设计的，就是要这种，看看能不能给他设计装备之类的配置，继续深度开发之类的，来个商城或者装扮配置，以及3d那边也是。搞点其他的建模配置」。该 README 的当前边界是本机免费装扮铺、偏好不进入笔记/SQLite/备份、保留原创圆润角色与柔和互动；这是本轮已记录的可逆范围判断，不表示用户逐项选择了具体装备、模型或商城形态。
- 唯一实现基线：`C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004/before`；同级 `manifest.json` 为73项。调研中执行73项快照及工作区 SHA256 双比对，exit0，`MismatchCount: 0`。因此下文普通 `src/...`、`tests/...`、`package.json` 和 `docs/Spatial.Experience.md` 行号均指该冻结快照；不是混合 Git HEAD，也不是后续实施源码。
- `docs/current/pet-space-customization/README.md` 与 `docs/Release.Verification.0.6.0.md` 是调研当时工作区文档，不在上述73项 manifest 中。上一轮 `docs/archive/2026-10-06/spatial-note-map/` 正式记录只读，保持原样。
- 工作区 `git status --short` 有广泛既有修改/未跟踪文件；本次没有 reset、restore、clean、提交或推送，只创建本报告。73项一致不意味着既有混合工作均属于本轮。

## A. 系统边界与现有能力

1. 晴笺是 React/TypeScript/Vite 前端、Tauri 2/SQLite 桌面应用；本轮读到 `package.json` 版本为0.6.0，Three.js为精确 `0.186.1`、类型包为 `0.186.0`。前端构建命令 `tsc -b && vite build`，测试命令 `node --test tests/*.test.mjs`。
2. 晴小团由内联、代码生成的原创 SVG 呈现。大小角色复用同一个私有 `PetPortrait` 函数，没有图片/模型下载、GLTF loader、第三方角色库或外观配置对象（`PetCompanion.tsx:43–77、148、164`）。所谓空间里的“大角色”当前仍是 SVG，不是 Three.js 三维宠物。
3. 小角色可轻触、拖动、休息、唤醒、收起；大角色可轻触、休息、唤醒。四态为 `idle/happy/resting/dragging`，无饥饿、经验、金币、道具库存、支付或帐号状态（`petBehavior.ts:2–19`，`PetCompanion.tsx:84–177`）。本次检索 `wardrobe/appearance/accessory/装扮/装备/商城` 未找到已实现装扮流程。
4. 记录空间已有“关联星图/时间层/晴小团”三模式。关联/时间使用真实 Three.js 透视场景；宠物分支不创建该场景（`SpatialNoteMap.tsx:18–39、43–65`）。场景当前没有公开模型、场景配色或环境配置接口（`spatialScene.ts:13–23、251–264`）。
5. 笔记/账目、AI、原二维图与呈现偏好边界清晰：`AppData`仅 `version/notes/transactions`；备份导出仅返回这三项；桌面桥接也只收 `AppData`，外观不存在于这些类型（`types.ts:3–33`，`store.ts:36–44`，`desktop.ts:6–14`）。宠物不接收记录、查询或标签 props（`PetCompanion.tsx:7–9`，`SpatialNoteMap.tsx:38`）。

## B. 入口与主流程

### B1. 当前宠物主链与现有接口

| 边界 | 已观察接口/行为 | 证据 |
| --- | --- | --- |
| App唯一显示偏好 | `petShown`初值来自 `PET_VISIBLE_KEY`；effect写 `on/off`；设置切换和小角色收起均更新同一 state | `App.tsx:38、69、161–165、220–221、236` |
| 小角色调用 | `theme/motionAllowed/visible/businessEnabled/shown/hidden/onHide`；记录、账本、回收站等壳层常驻 | `PetCompanion.tsx:7–9`，`App.tsx:220–221` |
| 大角色调用 | `PetShowcase`只收四个政策 props；不收 `petShown`，设置中的显示开关只控制小伙伴 | `PetCompanion.tsx:9、158–177`，`SpatialNoteMap.tsx:38` |
| SVG输入 | `PetPortrait({ mood, animate })`，函数私有，当前无外观参数、应用回调或预览草稿输入 | `PetCompanion.tsx:43–45` |
| 大小共享的事实 | 两处都直接调用同一个SVG函数，原始造型一致；两处各自调用 `usePetBehavior`，不共享情绪或休息state | `PetCompanion.tsx:14–19、85、148、159、164` |
| 心情反馈 | 轻触先检查最新交互政策，设happy，1400ms后settle；每个实例独立持有短timer及取消函数 | `PetCompanion.tsx:17–40` |
| 目前缺失的链 | 没有“预览→应用”入口、已应用外观state、持久外观key或大小同步的外观传参 | 上述 props、SVG签名、App state及检索结果 |

这些是可复用的现有边界清单，不是新增接口设计。当前最小可核查链为 `App → 小角色` 和 `App → SpatialNoteMap → 大角色 → 同一个SVG`；外观需要走哪些新增字段、草稿由谁拥有、是否即时保存，仍属后续方案问题。

### B2. 记录空间主链

- App以 `activeNotes`启用 `useNoteGraph`，graph/space都启用；以同一 `visibleNotes = selectNotes(...)` 供空间消费（`App.tsx:92–97、166–175`）。空间query输入始终显示，pet模式只隐藏记录筛选条；切模式不重置筛选（`App.tsx:39、168–175、215`）。`selectTag`保持graph/space当前页面（`App.tsx:105`）。
- `MapView`将graph按匹配UUID投影，再创建确定性展示布局。布局由notes/model/mode驱动，和主题、动态政策独立（`SpatialNoteMap.tsx:43–46`）。
- `createSpatialScene(canvas, options)`是场景owner；React只在 `mode/attempt`变更时创建新owner，其余通过 `setLayout/setTheme/select/setPolicy` 更新（`SpatialNoteMap.tsx:49–73`）。切pet分支卸载MapView，退出空间卸载整页，cleanup释放owner（`SpatialNoteMap.tsx:38–39、64–65`，`App.tsx:166–199`）。
- 场景返回选中UUID给React；详情查当前notes/layout，文本正文安全渲染，编辑回调交回App的 `editLatestNote`（`spatialScene.ts:185–190`，`SpatialNoteMap.tsx:74–75、107–119`，`App.tsx:149–153、175`）。

## C. 关键模块与职责划分

| 模块 | 现有职责 | 本轮相关边界 |
| --- | --- | --- |
| `App.tsx` | 业务数据、共享筛选、模式、主题/动态/显示偏好、业务政策、入口与原编辑回调 | 同一个宿主已同时持有大小角色入口；不在宠物中持有notes |
| `PetCompanion.tsx` | 单个SVG造型、行为hook、大小呈现、小层拖拽与夹限 | 外观硬编码；独立情绪/计时/指针所有权 |
| `petBehavior.ts` | 四态reducer、视口夹限、6px拖拽判断、显示/交互/动态政策、显示key | 无业务存储、外观枚举或配置schema |
| `pet.css` | SVG类对应情绪/动画；小层、大舞台、主题和720px响应式 | 动画以SVG内层类为锚，不能只看React props |
| `SpatialNoteMap.tsx` | 模式、选择、详情、地图owner更新与相机控件、图例/分组文本 | 图例与真实渲染分离在DOM和owner两侧 |
| `spatialLayout.ts` | 固定UUID、分组/度数/完成/时间、确定性坐标与bounds | 只生成几何布局，不写源记录 |
| `spatialScene.ts` | 单场景、相机、共享球体/实例、线/粒子、拾取、GPU资源与输入释放 | 没有空间外观 setter；共享几何现状见D2 |
| `spatialRuntime.ts` | 可注入的单RAF去重调度、政策计算、DPR/像素预算 | 生命周期纯逻辑有现成测试 |
| `graphGeometry.ts` | 二维图工具与共享分组palette/groupColor | 空间从此导入颜色；直接改palette也会影响旧二维图 |
| `store.ts/types.ts/desktop.ts` | 业务JSON/备份与原生桥接 | 现有偏好不经过这些接口 |

## D1. 本机偏好、预览缺口与宠物保护范围

### 已有本机偏好

- `PET_VISIBLE_KEY = 'luma-pet-visible'`；不存在即默认显示，只有值 `off`才隐藏；写入值为on/off（`petBehavior.ts:1`，`App.tsx:38、69`）。
- 主题存 `luma-theme`，动态存 `luma-ambient-motion`，它们同样在App初始化/effect读写；现有偏好读取写入无错误捕获、没有storage事件订阅（`App.tsx:33–42、65–75`）。现状不构成新外观坏值、存储不可写或多窗口同步的处理保证。
- 小角色的位置是 `useState/useRef`，未持久化；心情和休息是各实例reducer会话状态。小角色在space隐藏但不卸载，在App壳层可保留自己的休息/位置；大角色切出pet分支卸载，其情绪自然重置（`App.tsx:220–221`，`PetCompanion.tsx:15、84–114、158–159`，`SpatialNoteMap.tsx:38–39`）。
- 备份/导入只替换notes与transactions；SQLite bridge只保存 `exportData` 的业务数据。当前 `petShown`以及主题、动态偏好不在备份内（`App.tsx:63–69、144–145`，`store.ts:36–44`，`types.ts:29–33`）。

### SVG与动作锚点

- SVG坐标系 `viewBox="0 0 240 230"`，全图 `aria-hidden`，每实例 `useId`生成独立渐变ID；身体、耳朵、手脚、头顶叶片、脸颊、眼睛、嘴巴、星点和睡眠文字均为硬编码path/ellipse/group（`PetCompanion.tsx:43–76`）。
- 主体大部分视觉位于 `.pet-body`内；CSS的呼吸/招呼/拖动/休息变换作用在这个group上，眼睛/目光各自变换，星点和z有独立显示规则（`pet.css:16–29、48–53`）。装饰附着哪个group、是否跟随表情/休息，现有结构本身没有单独附件槽位。
- 小角色容器宽160px，fixed/z-index24，SVG `overflow:visible`；拖拽基于完整容器 `getBoundingClientRect()` 和visualViewport夹限8px。视觉溢出是否仍落在可视范围，单靠现有容器测量未知（`pet.css:2、10`，`PetCompanion.tsx:79–114`，`petBehavior.ts:21–26`）。大舞台角色宽 `min(340px,90%)`，720px时 `min(280px,90%)`（`pet.css:30–34、54`）。
- 小层主pointer才可启动，只拥有一个pointerId，显式capture；累计位移达到6px即拖动，即使回原位仍不算tap；pointerup用最终位置判断，pointercancel/lost capture/blur/政策停用取消（`PetCompanion.tsx:96–139、145–147`，`petBehavior.ts:29–35`）。
- `present = visible && businessEnabled && shown && !hidden`；失焦仍present但不interactive；关闭动态保留interactive而animate=false。业务禁用、小层hidden会display:none且按钮disabled；主题使用容器data-theme，不改变宠物SVG硬编码色（`petBehavior.ts:38–43`，`pet.css:3、46–47`）。
- App在设置、整个空间页隐藏小层，这是上轮两次真实遮挡失败后的最终边界，不只是pet页去重（`App.tsx:221`；工作区 `Release.Verification.0.6.0.md:56`）。本轮不能把商城/配置控件放置与浮层关系视为已测。
- 全局policy由 `pageVisible`、composer、quickOpen、tagPickerOpen、AI面板推导；减少动态由media query实时更新（`App.tsx:55–59、70–75、95–97`）。App快捷键和Modal焦点陷阱有自己的现有接管范围（`App.tsx:76–91`，`Modal.tsx:3–29`）。

## D2. 空间共享几何、拾取与颜色边界

### 共享几何和尺寸事实

- 初始化只创建一个 `SphereGeometry(1,10,7)`，通过 `ownGeometry`登记；局部变量类型也是 `SphereGeometry | null`。`rebuild`分别创建node/halo两个 `InstancedMesh`，二者都引用同一个sphere与各自共享material（`spatialScene.ts:55–57、122、125–140、220–222`）。
- 每次layout变化，旧node/halo实例从scene移除并 `.dispose()`；共享sphere仍在owner的geometry集合中，直到owner销毁统一dispose。边、粒子和选中高亮各有动态geometry，通过 `removeGeometry`释放后退出集合（`spatialScene.ts:106–120、128–131、141–157、197–210`）。当前不存在切换节点几何和单独替换几何的setter或测试。
- 节点半径公式 `(done ? 3.4 : 5.4) + min(8,degree)*.5`；所有实例目前均匀缩放，halo再乘3.6，选中ring乘2.3。ring为独立TorusGeometry并始终朝向相机（`spatialScene.ts:51、60、100–105、132–137、227`）。模型外形尺寸与这些现有倍率的一致性尚无证据。
- `spatialLayout`按UUID排序后返回nodes；创建时间、group、degree、done都由输入计算，bounds是节点坐标距离再加22、最小90，和渲染几何类型没有输入关系（`spatialLayout.ts:23–65`）。即当前布局只知道点中心，不知道未来模型包围盒。

### 拾取与语义保护

- 只raycast `nodesMesh`，不raycasthalo/边/选中ring；`hit.instanceId`直接索引当前 `layout.nodes`得到UUID。matrix写入顺序和该数组顺序一致，决定拾取身份；空处命中返回空字符串（`spatialScene.ts:132–138、185–190`）。没有依靠颜色、名称或模型表面字段识别记录。
- 单pointer、左键、位移不超过6px才拾取；多指参与会把当前gesture标为moved；pointercancel/lostcapture/失焦/政策停用/重建取消当前手势（`spatialScene.ts:61–88、171–195`）。任何模型选择都不能把“旋转拖动”变成记录点击，现有纯测试未覆盖真实Three raycast。
- 选中UUID由React持有，在匹配notes消失时清空；关系/时间模式之间仍保留同一个selectedId（`SpatialNoteMap.tsx:28–39`）。文字select始终包括所有匹配notes，不依赖WebGLready；可在failed状态查看正文/关系并编辑（`SpatialNoteMap.tsx:76–87、107–121`）。

### 颜色与图例

- `groupColor`从共用palette用稳定hash选色；空间渲染在dark时与白色lerp `.28`，light不变。node/halo写相同instanceColor，particle色来自边source的group（`graphGeometry.ts:8–14`，`spatialScene.ts:59、133–137、153–155`）。
- 主题setter重写node/halo颜色和线/ring/highlight材料并invalidate，未重写particles的颜色attribute；particles色仅 `rebuild`生成。此为现状差异，调研未修（`spatialScene.ts:153–169`）。
- DOM图例说明“共同标签实线/正文词面相近虚线”“同状态度数越高点越大”“同度数已完成略小”，分组色点和详情分组文字直接使用 `groupColor`而无dark lerp（`SpatialNoteMap.tsx:100–111`，`spatial.css:40–48`）。颜色、形状、尺寸和文字语义在不同模块，现有任何新配色/模型声明都没有同步接口保证。
- 线仍按 `sharedTags.length`分实线/虚线，正文相近仍明示本地推断；模型配置不应改变edge evidence或group算法（`spatialScene.ts:143–147`，`SpatialNoteMap.tsx:103、115–119`）。

## D3. 相机与生命周期边界

- owner的透视相机45度、near1；fit按layout.bounds及画布aspect计算距离，并重设target/position/min/max/far。scene初始化fit一次；React还在graph第一次ready时fit一次；后续layout变化仅rebuild且保留现有镜头，显式“适配全部”另调fit（`spatialScene.ts:30、89–99、249`，`SpatialNoteMap.tsx:51、62、65–69、96`）。
- select不移动相机；focus保留观察方向并把相机放在距目标180处；缩放/左右转按钮和OrbitControls直接操作同一相机（`spatialScene.ts:100–113、254–263`）。当前相机没有持久化，会因mode/attempt重建而重新fit；已读说明文档明确筛选后镜头保持（`SpatialNoteMap.tsx:65`，`docs/Spatial.Experience.md:9`）。
- `spatialPolicy`将visible、focused、businessEnabled、motionAllowed和paused分别控制active/interactive/continuous。关闭动态或paused保留交互；visible=false关闭调度；失焦/业务禁用保留可绘制但不接input、不持续动态（`spatialRuntime.ts:1–3`，`spatialScene.ts:58、73–83`）。
- scheduler自有且只留一条RAF；静态invalidate合并，连续绘制最多30次/秒，dt≤50ms，epoch拒绝取消后的旧callback；disposed后不再排帧。DPR≤1.5及总像素≤250万；粒子128上限，≥500节点减为32（`spatialRuntime.ts:6–44`，`spatialScene.ts:150–156、243、247`）。这只是源码预算，不是实测GPU性能。
- pointer listener只绑定canvas，OrbitControls按policy connect/disconnect；失焦、后台、context loss都走当前owner。dispose先失效、停RAF、断控件/捕获、断ResizeObserver，去所有owner监听，再释放mesh/geometry/material/texture/renderer，幂等（`spatialScene.ts:61–88、193–213、235–248`）。没有主动forceContextLoss。
- 创建/绘制异常和context loss调用fail→dispose→React failed；重试加attempt用新canvas/new owner；effect的 `live`防止旧owner回调更新现有React（`spatialScene.ts:36–54、195、213–250`，`SpatialNoteMap.tsx:53–65、85–87`）。空间入口还有React error boundary回到记录/旧图；它只捕获React层错误，不替代场景failure机制（`SpatialEntryBoundary.tsx:9–25`）。

## E. 外部依赖与数据边界

- 依赖仅当前Three、OrbitControls、React、lucide等本地打包库；本轮宠物/空间相关源未见fetch、模型URL、支付或外观网络请求。空间owner注释及实际签名均表明不拥有notes或关系请求（`spatialScene.ts:19–23`）。
- graph算法及Worker由既有 `useNoteGraph`持有，关系/时间只是投影消费；worker阈值≥24条或content总长度≥8000，hook根据enabled/key提交并清理，宠物未参与（`useNoteGraph.ts:53、109–126`）。App在pet空间仍启用既有graph，但不把记录传给PetShowcase（`App.tsx:94`，`SpatialNoteMap.tsx:38`）。
- SQLite结构和保存仍仅notes/transactions；原生Rust的 `AppData`、load/save command没有外观字段（`src-tauri/src/lib.rs:13–19、37–45、50–72`）。AI仅主动提问经desktop桥接，本轮角色现无AI入口（`desktop.ts:13–14`，`App.tsx:239–244`）。
- 共享 `graphGeometry.ts`不是空间专属颜色配置文件，现有原二维图和空间均依赖它；本轮只报告该依赖，不建议顺手改旧图。

## F. 已读文档与验证证据的适用范围

- 完整已读：本机 `codebase-research/SKILL.md`、项目 `AGENTS.md`、本轮 `README.md`、冻结 `docs/Spatial.Experience.md`；完整当前 `docs/Release.Verification.0.6.0.md`。对上一轮 research/lwplan作相关关键词只读检索；README/CHANGELOG/Project.Progress作空间/角色事实检索。
- 完整已读核心源码：PetCompanion、petBehavior、pet.css、SpatialNoteMap、spatialScene、spatialRuntime、App、spatialLayout、spatial.css、graphGeometry、SpatialEntryBoundary、useNoteGraph、store、types、desktop、Modal；相关Rust做签名/表/保存关键词读取。
- 完整已读相关测试：`tests/petBehavior.test.mjs`、`tests/spatialRuntime.test.mjs`、`tests/spatialLayout.test.mjs`。本次未执行功能测试、构建、浏览器/原生交互，不将“测试源存在”或历史报告当本轮运行通过证据。
- 已有纯测试覆盖宠物情绪取消/休息、owned pointer及累计6px、夹限缩屏、政策；空间单RAF合并、30fps/dt、epoch/销毁、draw重入、政策/DPR；布局全UUID/不变性/确定性/边度数/时间/1000条（`petBehavior.test.mjs:8–55`，`spatialRuntime.test.mjs:13–69`，`spatialLayout.test.mjs:10–68`）。
- 没有已存在的外观存储测试、预览取消/应用测试、React大小同步测试、几何替换/raycast/资源计数真实测试。纯测试不涵盖遮挡、SVG视觉附着或真正GPU资源释放。
- 上轮历史root报告记载105项通过、实际25/500/1000条、角色动作/夹限/刷新偏好、8轮切换、390px深色、新EXE及真实库保持，同时明确未测原生GUI/触屏/系统减少动态/失焦全部组合/context loss/GPU/长期/PWA更新。已见失败含两次宠物遮挡、旧SW缓存、取证失败等；不以新装扮沿用旧结果（当前 `Release.Verification.0.6.0.md:17–22、36–65`）。
- 调研读取曾因总输出预算截断，随后按单文件完整重读核心App/spatialScene/runtime/tests/体验文档；没有把截断片段当全文证据。App首次附加错误的超尾行范围只产生空行，后续完整245行重读纠正，没有源码写入。

## G. 不确定点清单

| 编号 | 未关闭的问题 | 如何确认 / 当前是否阻塞调研 |
| --- | --- | --- |
| U1 | 用户原话“装备/商城/其他建模配置”未指定装备类别、模型种类、颜色主题或具体数量 | coordinator依据已授权范围在方案中明确可逆选择；本轮README已有本机免费边界，不阻塞事实调研。无需把自主技术选择伪写成用户答复 |
| U2 | 预览是否应保持未应用草稿、离页丢弃、刷新恢复或默认即时应用，现有代码完全没有这个状态 | 后续高/低层方案给出明确体验及持久化合同，再检验真实预览/取消/应用；当前不设计、不声称有预览接口 |
| U3 | 新外观存储坏值/旧值、不可写和多窗口行为没有现有契约 | 明确本机偏好范围后做隔离存储验收；已有on/off偏好不能证明新配置鲁棒性 |
| U4 | 非球体模型的视觉尺度、raycast边缘命中、halo与选中ring是否一致，尚无实现或实测 | 真Three场景切换后核验instanceId/UUID、点击/拖动边界、坐标/镜头/选中保持和实际包围体；纯布局测试不能代替 |
| U5 | 未来配色在节点/halo/粒子、线/图例/正文分组色及深色主题是否同步 | 新配置实际显示及代码路径一起核对；现有setTheme不重写粒子色、DOM色无dark lerp只是基线事实 |
| U6 | 附件在小层160px、390px、主题、happy/resting/dragging、SVG视觉溢出和配置控件遮挡范围 | 浏览器实际截图/动作/夹限和Tab测试；上轮已修全space隐藏小层，不能仅检查SVG文件 |
| U7 | 几何连续替换/重建/StrictMode/失败后重试的GPU和监听是否正确释放，长期性能如何 | 新实现后资源所有权核对、真实多轮切换/故障/规模测量；当前scheduler测试只证明纯调度逻辑 |
| U8 | 新EXE、Web/PWA加载内容、偏好刷新/重启和真实旧业务数据是否保持 | root最终同源构建、脚本/hash/版本核对、隔离预览与本机只读数据前后证明；本次未构建/运行 |

本报告没有需要用户立即拍板才能继续读取源码的阻塞问题。U1/U2属于后续方案需要显式闭合的体验范围；若coordinator认定必须用户选择，应在 `clarifications.md`记录，不应据本报告暗示readiness自动PASS。

## H. 给 readiness reviewer 的最小可核查证据

| 要核查的事实 | 最小锚点 |
| --- | --- |
| 本轮需求和已记录边界 | 本轮README完整原话/边界；本报告证据身份；73项manifest与SHA双比对结果 |
| 大小角色共享造型、未共享心情、无装扮接口 | `PetCompanion.tsx:7–19、43–45、85、148、159、164` |
| 现有本机偏好与业务数据完全不同通道 | `App.tsx:38、63–69、144–145、220–221`，`types.ts:29–33`，`store.ts:36–44`，`desktop.ts:6–7` |
| 模型现状只一个共享sphere；实例与UUID相关 | `spatialScene.ts:122–140、185–190、220` |
| 边/颜色/尺寸/图例承担记录语义 | `spatialScene.ts:59–60、143–169`，`SpatialNoteMap.tsx:100–118`，`graphGeometry.ts:8–14` |
| 相机和owner不能被外观变更无意重建 | `SpatialNoteMap.tsx:53–73`，`spatialScene.ts:89–113、249–264` |
| 取消/停止/销毁与资源集合 | `spatialScene.ts:55–88、197–213`，`spatialRuntime.ts:16–44` |
| 原业务与旧功能保护 | `App.tsx:92–105、149–153、166–198、215、221`；冻结store/types/desktop/noteGraph/worker/editor/order/Rust各SHA |
| 未验证的实际环节 | G的U1–U8；F的历史适用范围与本次未运行说明 |

全部源码陈述为直接观察；“现有调用链可以承接新增外观”只作为后续方案的推断空间，本文未将它列为已实现能力。保护范围包括notes/transactions保存及备份/SQLite schema、受限纯文本编辑、原排序/置顶、共享查询/标签/未完成留页、旧二维图/Worker/关系推断、角色原造型识别与动作/owned手势取消、全space/settings隐藏小层、文字降级与相机、现有资源预算和销毁策略。对发现但与本轮无关的问题只报告，不修改。

本次未发现需要新增到全局规则的跨功能事实；已识别的本机数据隔离、混合工作保护、owner生命周期和共享颜色依赖均已属项目现有边界或本轮局部证据。
