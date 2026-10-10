# 桌宠与简洁工作区：代码库事实调研

调研日期：2026-10-07。只读实现及本机资产；本文件没有将任何规划或历史验证改写为本轮成功。输入为本目录 README 与 `source_materials/feedback_2026-10-07.md`。协调者在调研期间转达的用户答复仅明确：**宠物在 Windows 桌面独立活动，晴笺最小化后仍可见**。主窗关闭沿用退出整个应用，以及首版采用已有待办提醒、快捷记事、轻触、短距离活动/休息，是协调者在开发授权内提出的建议；权威决策与来源见 `clarifications.md`。

## A. 系统边界与现有能力

- 当前是一个 React Web 笔记应用加 Tauri 主窗口，并没有独立桌宠窗口。`src-tauri/tauri.conf.json:16` 仅一个窗口，`decorations:false`；`src-tauri/src/lib.rs:122` 仅初始化 opener 和五个业务命令，没有窗口生命周期、托盘或桌宠事件。
- 本机数据通过 SQLite 保存，Web 用 localStorage。数据库路径依赖 `com.zxl.qingjian` 标识对应的 app data dir（`lib.rs:28`）；笔记正文为 String（`:14`）。桌宠外观在 localStorage 四字段对象中（`src/petAppearance.ts:1`、`:7`、`:24`），不在 SQLite/备份。
- 当前自主能力是一次/日的到期待办弹层（`src/App.tsx:93`），发生在主 App 可见并无部分弹层时。宠物自身只有 idle/happy/resting/dragging 四种状态和手动事件（`src/petBehavior.ts:2`、`:9`），没有随机活动、Windows 桌面行走、计时休息或 OS 交互。
- 可复用业务能力已有：快速打开笔记、创建笔记、待办展示。没有新增联网 AI、自主读取笔记上传、商城、数值养成的必要事实依据。

## B. 入口与主流程

### 主 App 与保存所有者

- `src/main.tsx:7` 注册 SW，`:9` 无条件渲染整个 App。当前不能把同一入口直接放进第二个窗口后仍运行 App，否则该窗口也会执行笔记/账本/待办读取及保存副作用。
- `src/App.tsx:88` 在桌面加载全部 SQLite；`:89` 每次三类数组变化全量保存浏览器和 SQLite；失败后仍 ready 并使用浏览器数据。`src-tauri/src/lib.rs:73` 在事务中 DELETE 全表再按传入数组 INSERT。因此第二份 App 如果拥有旧快照，写回会覆盖主窗新数据（推断；尚未创建第二窗口复现）。
- 独立宠物入口需避开这一保存所有者，是本需求的数据安全关键边界。已有代码没有跨窗口 snapshot/request/action 协议，也没有 App storage 事件订阅（检索 `src/App.tsx`、`src/desktop.ts`、Rust 入口未见）。
- 主 App 保留正文字符串、备份 version 1、草稿字符串的路径在 `src/store.ts:14`、`:27`、`:42`；本次不需要数据库 schema 变更。

### 标题栏与滚动的直接原因

- `src/App.tsx:279` 的栏为网页自绘，黑栏并非系统不可修改的原生标题栏。它在同一个 `main.app-shell` 中，drag region 与三个窗口按钮明确存在。
- `src/styles.css:302` 对自绘栏指定纯 `background:var(--paper)` 和 `border-bottom:1px solid var(--line)`。主体 `.app-shell` 在 `:301` 覆盖成透明；背景来自 `:335` 的 fixed 光场及 `:337` 的紫色 radial gradient。因此顶部纯色遮住连续光场且边线形成分割（代码原因推断，与反馈截图一致；本轮未运行原生窗口）。
- `body` 只有 margin/min-width（`:19`），App 只有 min-height 100dvh（`:27`），未锁定桌面视口高度/滚动所有者。全局没有 scrollbar-color/width 或 `::-webkit-scrollbar` 主题样式，只有日期滚轮局部隐藏（`:187`）。内容超过窗口时由文档默认滚动（推断）；红框灰色粗条与这条路径一致。
- 自绘栏没有 sticky/fixed（`:302`），文档滚动可把栏一起滚走（推断）；若改滚动范围，须核验模态框、局部编辑器、待办弹层的独立 overflow（`:144`、`:160`、`:329`）及窄屏不横向溢出。

### 首屏重复层级

- `src/App.tsx:281` 品牌及口号，`:282` 六项导航，`:290` 本机说明/设置/回收站/新建，`:294` 搜索，`:295` 快速打开/AI/主题切换。
- `src/NotesView.tsx:34` 眉题、我的记录大标题、说明、总数；`:35` 起笔大按钮与新建入口执行同一 `onCreate`；`:36` 筛选和三种排版；`:37` 常驻排序说明。
- 卡片顶部完成状态与日期（`:58`起），底部五个常驻动作（`:68`起）；正文主体已有编辑按钮行为，底部又有编辑动作。宠物在 `src/PetCompanion.tsx:186` 常驻名字、文案、四个按钮（`:200`）；`src/pet.css:2` 则给宠物加带模糊背景的面板。
- `src/styles.css:469` 在 1380px 下让导航换到单独一行；因此截图即使看起来宽，缩放后的 CSS 宽度也可能触发多层导航（推断，截图 DPR/缩放未知）。
- 信息层级可集中调整的现有边界是 App header/topbar 与 NotesView heading/capture/controls，而不需要增加更多页面或管理功能。这是影响面事实，不是已经选定的界面方案。

## C. 关键模块与职责

| 模块 | 当前职责与变更相关性 |
| --- | --- |
| `src/PetCompanion.tsx:43` | `usePetBehavior`、点击反馈、拖动、休息、浮层、大展示。 |
| `src/petBehavior.ts:38` | 统一 present/interactive/animate 策略；当前要求 document focused。 |
| `src/Pet3DView.tsx:18` | 懒加载 scene、异步取消、resize observer、WebGL context loss、释放资源；失败 SVG fallback。 |
| `src/Pet3DScene.ts:19` | Three 正交相机/光照/GLB；按名称 idle/happy；原创模型配色和配件节点。 |
| `src/petAppearance.ts:14` | 五角色、三配色、三头饰、三配件对象严格解析。 |
| `src/App.tsx:88` | 主窗唯一应拥有的数据加载与保存；提醒及 UI 路由。 |
| `src/main.tsx:9` | 当前单模式入口；不存在 desktop pet 单独路由。 |
| `src-tauri/capabilities/default.json:5` | 目前只匹配 main，窗口权限限拖动/最小化/最大化/关闭及 core default。 |

### 当前行为限制

- `PetCompanion.tsx:63` document blur 后 cancel，`petBehavior.ts:42` interactive=present&&focused；animate 同时要求 interactive。将这套策略原样用于独立桌宠，会在用户切回其他应用后停止动画（推断），不符合独立活动意图。
- `App.tsx:130` motionAllowed 还由主 App pageVisible 和弹层决定；`:300` visible=pageVisible。独立桌宠不能继续用主窗的这些值决定存在与活动，否则主窗最小化可影响它（推断）。
- 拖动坐标是客户端 `clientX/clientY`，通过视觉 viewport 限制（`PetCompanion.tsx:124`、`:139`、`:163`）；这是网页内部位置，不是 Windows 窗口位置。
- resting/dragging 模型仍选 idle：`Pet3DScene.ts:85` 找 happy 或 idle。休息仅关闭动画，归零 mixer，`:80`；没有闭眼/睡眠 clip。原有状态名不代表 GLB 有对应动作。

## D. 正文插入撤回与数据保持

- 新入口唯一在 `src/NoteComposer.tsx:198` 插入按钮；插入处理在 `:113`。该页还为已有 token 用嵌套 React root 实时挂载 GLB（`:32`、`:47`、`:125`至`:151`）。
- 下游纯文本识别与已有数据在 `src/noteCodec.ts:18` `[[pet:xiaotuan]]`、`:211` 首个独立 token 解析、`:239` 编辑 host、`:253` 可见文本晴小团；`src/noteFormat.tsx:19` 静态预览，`:83` 回写 token。
- 最小撤掉新增功能入口的影响面只到按钮/处理；已有正文可继续兼容显示及原样保存。若同时撤去编辑器实时 GLB，则需明确 legacy host 如何仍稳定回写 token；不能简单删除 codec 识别，否则既有 token 会向用户显示内部语法或在编辑后丢失。这是保留数据所需的路径约束。
- 不需要对用户全部笔记做替换/migration。卡片中旧宠物块是否继续静态展示、改成轻量文字或不占视觉空间仍需方案明确，避免为了撤入口清掉已有正文。
- README/CHANGELOG/Project.Progress 目前把正文宠物列为当前能力，须随实际撤回同步；不要把旧测试与审查历史删掉。

## E. 模型与本机构建边界

### 正式 EXE 仍显示 SVG 的确定原因

- `src/PetCompanion.tsx:117` 只有 xiaotuan 固定生产 GLB URL；其余角色仅 DEV+previewUrl 有三维。浮层调用在 `:193` 根本不传 previewUrl；即使开发页载入过奶龙，它也只影响伙伴大展示。
- `:11` DevModelPicker 在 production 为 null；`:238` 文件选择及 blob URL 不保存。这解释截图 selected 奶龙还是 SVG，不是换肤数据失效。
- `docs/Pet.Wardrobe.md:5`、`:7` 与现有代码一致，明确公开构建四角色 SVG、本机 GLB 开发预览；但该既有边界不符合当前用户纠正后的个人本机 EXE 目标。

### 本机资产实读

- `E:/pet-model-workbench/build_models.py:1` 标注本机角色研究；`:43` 主体由 UV sphere 部件，`:63` 锥形耳等；`:125`起分别生成四角色，没有从 GitHub 下载第三方网格的代码。原创资产在 `assets-source/pets/xiaotuan.py`、`.blend`、previews，生产原件 `public/pets/xiaotuan.glb`。
- 四角色各有 `.blend`、`.glb`、front/side/back png、manifest。脚本 `:178` 动作只操作 PetRoot location/rotation 和 ArmRight rotation；`:205` idle、`:207` happy，48 帧；`:213` 导出后合并 NLA clip。没有 walk/rest/眨眼/口型/骨骼人体动作。
- 本轮 Node 直接读四 GLB JSON chunk（命令退出 0），与 manifest SHA256 一致：奶龙 434896 bytes/19 nodes/16 meshes；吉伊 404032/18/15；小八 350948/19/16；乌萨奇 434724/19/16。全部有 PetRoot，idle/happy 各 3 channels。结构兼容当前 `Pet3DScene.ts:134`根节点和`:136`动作检查；第三方 `original=false` 可绕过原创装扮节点要求。
- 本轮看了四张 front png：可见圆/椭球拼接、简单暗色眼点与折线嘴、小八锥形耳和蓝色额纹。它们是初步造型，不具备截图 SVG 的眼睛高光/细节层次（视觉比较判断）；manifest 的 `visual_status` 均为 awaiting user review，back view 为无官方背面参考的自行补完。**不应宣称模型质量已提升或已获用户定稿**。
- 预览路径均为 `E:/pet-model-workbench/{角色}/{角色}_front.png`，可直接向用户展示实物；历史记录中的浏览器模型 ready 与 Blender log 仅为历史证据，本轮没有重跑 Blender、动画或 WebGL 实测。
- 更细的建模定位：`build_models.py:63` 锥形耳，`:89` 额头网格，`:116` 全角色共用 face（眼点、脸颊、同形 POLY smile，无眼高光/眨眼），`:125` 奶龙 Head/Snout/Belly，`:138` 吉伊圆耳，`:149` 小八蓝纹和锥耳，`:163` 乌萨奇长耳。若进入造型细化，这些是圆润耳型、贴合面部分区、角色嘴型与眼部细节的实际局部边界；动作锚点仍为`:178`的控制对象与`:205`/`:207`clip。原创 `assets-source/pets/xiaotuan.py:95`/`:96`已有 Eye/EyeLight，`:86`原创耳型，用户此前已确认保留其轮廓，不应因四角色细化推翻原创轮廓。
- 协调者提出待规划的资产工作副本位置 `E:/pet-model-workbench/refined/2026-10-07`，目的为保留旧 `.blend`/GLB 便于比较；本轮未创建该目录或替换任何模型，不能将此路径写成已有改良资产。

### 最小资产接入可行性与限制

- GLB 当前在 workspace 之外，不能被默认 Vite 源 glob 自动发现；`.gitignore` 也尚无本机宠物资源目录规则。若规划采用“忽略的本机资产目录+存在文件才参与 Vite glob”，需要先明确本机拷贝/暂存与 Git ignore，文件缺失时仍用现有 SVG。这是可以利用现有 scene 的接入条件，未写成最终方案。
- `vite.config.ts:9` 已缓存 `**/*.glb`；本机私有模型若进入 dist 则也进入 SW/Windows输入包。需要区分个人本机 EXE 和公开 Web/安装器，不能把模型路径/四 GLB 直接 commit/upload。本轮未更改资产/再分发范围。
- `Pet3DScene.ts:94` 对 original=false 不改变配色/头饰/配件，故换成四角色 GLB 后旧装扮按钮可能继续显示但无实际效果。最小实用范围需避免把三维支持误描述为五角色同等装扮能力。

## F. Tauri 独立窗能力与现有缺口

- 已安装 `@tauri-apps/api` 为 2.10 系列。其实际 `.d.ts` 支持 WebviewWindow 构造（`node_modules/@tauri-apps/api/webviewWindow.d.ts:43`），WindowOptions 的 transparent `window.d.ts:1617`、decorations `:1623`、alwaysOnTop `:1625`、skipTaskbar `:1631`，以及 setPosition `:900`、setIgnoreCursorEvents `:1074`、startDragging `:1085`；currentMonitor/availableMonitors `:1805`/`:1839`。这些是 API 可用证据，不代表当前 Windows WebView2 合成效果已试过。
- 现有 capability 只 main；独立 pet label 没有授权匹配。新增窗口创建/位置/显示隐藏/事件等操作需要按实际选取 API 核对 ACL，而不是把所有 core 权限通配开放。Rust 创建和前端创建权限路径不同，方案还需选择。
- `event.d.ts:87` listen、`:145` emitTo 可用于窗口通信；listener 需释放（`:83`）。当前没有实际使用它们的桌宠通信代码。
- 当前 close button直接 `getCurrentWindow().close()`（App:279），没有关闭所有窗口处理。新增独立窗后“主窗关闭退出整个应用”需要明确主窗 close 生命周期；不能假设留下 pet 窗会自动跟随退出。
- 独立宠物若在 main 最小化后继续可见，必须有自己的活动/资源策略；不能继承 document focus 策略，且要区分用户休息/隐藏与主窗最小化。多显示器工作区域、DPI 物理/逻辑坐标、任务栏遮挡、点击穿透及 popup操作均尚未验证。

## G. 不确定点清单

- U1：五个模型的最终造型是否满意。用当前真实 GLB/预览在最终尺寸展示收反馈；当前初模不是定稿。
- U2：独立窗透明、点击区域、短距离移动、主窗最小化/关闭、多显示器 DPI 是否符合 Windows 实际运行。必须最终 EXE现场验证；类型声明/网页测试不能关闭。
- U3：旧正文 token 撤入口后的具体可见呈现，方案需要明确；不得自动清除已保存正文。
- U4：桌宠实用提醒跨窗同步、关闭/重开主窗操作、快记打开哪个已有入口，以及仅主窗持有保存权的协议尚不存在，需要规划界定并检查过期快照。
- U5：本机模型包与公开包的资源隔离、复制来源、生成 EXE路径与实际启动 EXE身份需要可核查流程；历史误开 D 盘程序已经发生。
- U6：四角色动作仅 idle/happy；短距离走动是窗口移动还是新增 walk clip、休息是静止还是闭眼模型仍需规划区分，不能宣称现有资产已有这些 clip。

## H. readiness reviewer 最小核查锚点

1. 用户来源：本目录 feedback 原话；独立 Windows 窗且最小化可见的新答复由协调者归入 clarifications（本文件不替代该原始答复记录）。
2. 确定偏差：`PetCompanion.tsx:117`/`:193`；生产奶龙必然 SVG，文件预览不传到浮层。
3. 确定界面来源：`App.tsx:279`自绘、`styles.css:302`遮挡光场边线、`:335`光场；全局无主题滚动条。
4. 数据风险：`main.tsx:9`无条件App；`App.tsx:88`/`:89`数据所有者；Rust `lib.rs:73`全量覆盖。
5. 可用资产：本机 manifest 与本轮 GLB JSON/SHA核对；仅两个 clip，质量待确认。
6. 独立窗口缺口：单窗 config，capability仅main，Rust无窗口事件；已安装 API有必要窗口能力。
7. U1至U6未关闭；这份代码库调研不能替代独立窗现场验证、模型质量验收或方案审查。

已读相关文档：本目录 README/feedback、`docs/current/xiaotuan-3d-pet/README.md`与verification、`docs/Pet.Wardrobe.md`、README/CHANGELOG当前增量部分，以及 note-embedded-pet 的代码路径。

工作区状态记录：五项已存在的 0.8.1 元数据修改为主代理上轮工作（package.json、package-lock.json、Cargo.toml、Cargo.lock、tauri.conf.json），本轮没有恢复或覆盖；本 agent 仅新增本文件。检索不存在的 scripts/tools 目录曾返回 rg exit 2，不影响随后实际已存在路径读取；没有把这类失败当成构建验证。

---

## 跨功能事实（待确认）

### 架构与约束
- [2026-10-07] 晴笺的 SQLite save_data 是全量数组覆盖；多窗口必须确定一个保存所有者，第二份完整 App 会引入过期快照写回风险。

### 决策与偏好
- [2026-10-07] 用户重视简洁与实际用途，三维模型目标是桌宠替换；常驻叙述、重复起笔入口和正文装饰功能未满足其使用意图。
