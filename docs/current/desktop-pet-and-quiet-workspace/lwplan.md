# 独立三维桌宠与简洁工作区：低层实施计划

日期：2026-10-07。任务分型 **T3（跨模块及数据安全边界）**。本文件是实施输入，不是功能完成或 Windows 验收证据。

[修订: PLAN_DEFECT-R1.1] 依据`review_notes_lwplan_1.md`的L1/L2原地修补：原生拖动采用本窗Windows移动循环结束信号，自主位移的通知按本段身份分类。源码尚未实施；S1/S2/S4及owner/提醒契约保留。删除上轮GetAsyncKeyState辅助作为未实施部分的替换，避免保守路径成为正常拖动永久暂停。

[修订: PLAN_DEFECT-R2.1] 依据`review_notes_impl_r1_1.md`正式PLAN_DEFECT回退，本轮先读该报告，再核对当前已落地main/PWA/native setup及安装API。S1–S4已实施支撑、独立审查、编辑证据和失败全部保留；新增§6.8/§7.1为当前原生启动保障与再交付任务，对旧“直接加载App URL、原生registerSW”步骤作补丁式收敛，不删除既有业务/模型/拖动实现。当前已核版本的正式0.9.0曾实际显示旧UI，不能发布，需新bootstrap实施与独立复核。

## 1. 范围、上游与目标锁

输入已读取：本目录 README、clarifications 的完整实现基线、research、industry、hlplan、第二轮 HL/Readiness 审查、source_materials 原话；并实读 App/NotesView/NoteComposer/noteFormat、PetCompanion/Pet3DView/Pet3DScene/petBehavior、main/desktop、Rust lib、配置及安装的 Tauri 2.11.5 API/权限来源。HL 第二轮与 Readiness 第二轮均为 PASS；不把该结果当作实施验证。

目标编号供下游追溯：

- **G1**：五角色个人本机三维替换；独立 Windows 小型透明桌宠，主窗最小化仍活动；可拖动、轻触、有限活动/休息，并打开已有快记/待办。
- **G2**：标题、顶部区域连续；内容是唯一工作区纵向滚动所有者；首屏减重复文字和入口；撤正文宠物按钮、画布及嵌套 root。
- **G3**：main 是业务/偏好唯一保存者；保留旧正文/草稿/元数据；实际 0.9.0 EXE 路径、版本和原生效果有证据。
- **N1**：不新增正文宠物、商城、养成数值、聊天、第二份待办、托盘、自启、服务、全局键盘/其他应用监控或自动 AI。
- **N2**：pet 不挂 App，不读写业务/偏好存储，不发 AI；不改 SQLite schema、备份 version 1、identifier；不全库替换旧 token。
- **N3**：不以 Web/格式/版本号替代原生和造型验证；不提交四角色私有模型、dist、target、安装器，不覆盖运行旧 EXE。

不影响层：原有 SQLite 表/保存结构、导入导出格式、笔记排序/置顶算法、受限排版、年轮/图/账本计算、AI 显式请求。只更新它们实际受影响的调用接口或展示边界；不夹带重构。

此前五项 0.8.1 元数据改动是 root 已有工作，保留至 S4 统一 0.9.0；禁止恢复丢弃。第三方造型仍需用户看真实结果判满意度。用户已确认独立桌面和继续开发，无新增产品决策问题。

## 2. 核心链路总览（先读主链，再读 S1–S4）

#### 本轮修订说明
[修订: PLAN_DEFECT-R2.2] 原生主链前置native安全bootstrap：固定main/pet均先about:blank，无应用脚本；所选WebView2缓存清理全部成功才导航当前同origin入口，再抵达以下已有main/App/pet链。只在新main模块停注册不足以控制旧缓存先行入口，保留下面既有链作为bootstrap成功后的业务主链。

现状：main.tsx 无条件挂 App → App 加载/全量保存 SQLite；App 内浮层按 Web focus/pageVisible 决定活动 → 原创 GLB、四角色生产 SVG；正文 token → codec → 编辑器嵌套 root/GLB。标题纯色覆盖光场、文档滚动、首页多层入口。

改后：

```text
main.tsx 先按实际原生 label 分入口
 ├─ main/Web → App（唯一业务及偏好保存者）
 │    S1 连续顶部 + 内容scroll owner + 次级菜单 + legacy普通文字
 │    S3 SQLite加载成功 AND 动作listener就绪 → 发布有限摘要
 │          ↓ main限定命令
 │    Rust desktop_pet.rs：owner + revision + 单份运行内存快照
 │          ↓ pet定向事件 / 首次读取
 └─ pet → DesktopPet（不import App/store/AI）
      S2 共享 PetFigure + 本机GLB URL映射 / SVG失败回退
      S3 可取消的本地交互、提示与10fps窗口移动 / 30fps模型
          ↓ 有限用户意图 / 真实展示确认
      Rust恢复main（仅快记/待办）→ main动作listener → 原有业务入口
          ↓ 匹配owner/requestId的结果，或可见失败/超时，无自动重放
S4 同源0.9.0个人制品 → 精确进程路径 → 原生双窗和旧库对比
```

分层原因：布局/legacy 只修用户界面与兼容；模型解析供 Web/主窗预览/pet 共用；窗口、调用来源与过期动作隔离在本次局部桥接；业务打开仍由 App 完成。Rust 不持久化第二份业务数据，pet 不因 main blur/最小化而停。

**片段闭环充分性**：§4 的 legacy 删除/往返片段，§5 的资源解析/clip片段，§6 的有限字段、初始化/发布/动作/运动片段按上述主链串起来；它们覆盖入口、唯一保存者、bridge、renderer、结果及清理。不是仅各包局部片段；不用 reviewer 跨包自行推断消息字段或时序。

## 3. research 事实 → 落点 → 验证映射

#### 本轮修订说明
[修订: PLAN_DEFECT-R1.2] L1补入安装Tao原生移动循环及Windows子类回调事实；L2补入同步定位与自有通知分类，不把tauri://move全部当外部移动。

[修订: PLAN_DEFECT-R2.3] 新事实映射：正式EXE身份正确但现场旧侧栏；main实际源码仍原生registerSW且PWA缓存HTML/JS；真实专用profile有SW注册和旧bundle文本缓存。原生bootstrap须先于任何可能的旧业务页面，不能从版本/hash推断已运行当前App。

#### 本轮修订说明
[修订: PLAN_DEFECT-R2.8] 依据 `review_notes_lwplan_3.md` 将启动前凭据迁移、pet setup 错误传播两项现状事实显式映射到 bootstrap 实施与验证闭环；不改源码和其他工作包。

#### 本轮修订说明
[修订: PLAN_DEFECT-R2.9] 吸收第四轮评审的两个三元组，按真实 `prepareAi()` 调用链确定迁移触发点，并将双窗导航非原子性纳入实现锚点、失败语义与证据口径。已核对官方 Tauri 2 async command/event 文档与项目锁定版本。

#### 本轮修订说明
[修订: PLAN_DEFECT-R2.10] 吸收第五轮评审：双方fresh-ready后分别进入main与pet独立门槛；pet可在main迁移等待期间导入并挂载。main必须等待一次启动迁移返回成功或脱敏失败结果后，才动态导入App/样式并挂载。Tauri静态入口不含React、createRoot、业务组件/store/styles；渲染依赖和业务模块均由各自门槛之后动态导入。保留R2.9“入口bundle可能已执行、业务组件/副作用不得启动”的失败边界。

| 已核实事实/缺口 | 实施锚点 | 验证锚点及责任/口径 |
| --- | --- | --- |
| App 的 SQLite save_data DELETE/INSERT 全量数组，第二 App 会有旧快照风险 | S3 main入口分流、lib actual caller、useMainPetBridge | impl入口/门禁单测、Rust check；root原生新数据后pet动作/重载不回滚，库字段比较 |
| 主入口无条件 App/SW；pet可能继承光场/min-width | S3 main.tsx动态import + desktop-pet.css独立域 | impl build及入口审查；root透明小窗无背景矩形、无第二load/save |
| 纯标题背景/border与body文档滚动是截图问题实际落点 | S1 App固定顶部/内容、styles覆盖实际规则 | impl build；root原生上下连续、标题不随内容走、窄屏/浅深/键盘滚动 |
| 首页品牌/口号/六导航/快开/标题说明/起笔区重复 | S1 App More菜单、NotesView精简 | root同窗尺寸首屏实际记录可见，菜单焦点/发现性/空态 |
| 生产仅原创固定GLB；DEV preview不传浮层 | S2 petModels/PetFigure替换解析，不依赖DEV | impl公开缺私有build及个人五GLB映射；root正式EXE逐角色canvas ready+截图 |
| 四角色初模仅PetRoot、idle/happy，点眼通用嘴；小八锥耳、奶龙熊耳感 | S2 refined脚本与实际装饰节点/optional clips | Blender导出重导/JSON/多视图由impl；root桌宠尺寸效果，用户视觉判断 |
| 非原创scene不应用装扮；旧按钮可能虚假成功 | S2非原创仅装饰染色/节点检测，缺节点隐藏组 | impl实际节点测试；root角色装扮应用与回退状态 |
| 原有Web focus/pageVisible门槛不适用于独立桌宠 | S3 DesktopPet独立visible/reducedMotion/interaction策略 | impl策略/清理测试；root切其他应用、最小化仍活动 |
| [修订: PLAN_DEFECT-R1.2] startDragging Promise无松手保障；安装Tao用WM_NCLBUTTONDOWN进入原生循环，处理WM_ENTERSIZEMOVE/WM_EXITSIZEMOVE；workArea物理且排任务栏 | S3固定pet HWND子类/dragId结束事件、稳定后fresh geometry | implnative handler分类/清理测试；root按住停住/吞pointerup后松手自然恢复及任务栏边界；无混合DPI设备记未测 |
| [修订: PLAN_DEFECT-R1.2] 安装Tao set_outer_position含SWP_ASYNCWINDOWPOS，自有定位也会触发Moved | S3 Windows UI线程同步SetWindowPos+expected position/ID，raw tauri://move不驱动取消 | impl15步自有通知不取消、外部移动取消、旧ID事件不影响新段；root完整短距活动观察 |
| allow-set-position无预配置scope，cap label只限定调用方 | S3固定pet Rust geometry/move/drag wrappers，pet ACL只listen/unlisten | impl权限与actualcaller拒绝表；rootpet原生拖动/移动；不声明动态逐像素穿透 |
| 原token已存在于保存正文与草稿 | S1 codec legacy host保持，删除显示图/root/入口 | implcodec/序列化测试；root草稿/格式/回填/删除撤销，旧字段不改 |
| 原自动提醒在main且已显示即记日期；catch也ready | S3 protocolReady独立、桌面停旧effect、真实展示ack | impl日期/token/重载/隐藏休息/旧确认测试；root真实提示/一次日链路 |
| 曾误开D盘旧程序，0.8.1尚未原生验收 | S4精确路径/五元数据0.9.0/进程SHA/数据库比较 | root才承接实际launch；路径或原生证据不足不可称更新EXE已展示 |
| [修订: PLAN_DEFECT-R2.3] 正式0.9.0准确进程路径却显示旧侧栏；真实EBWebView/Default/Service Worker注册metadata含tauri.localhost/sw.js，CacheStorage body含当前源码无的“我的空间” | §6.8 main/pet安全空白创建、Profile2所选缓存异步完成后导航；main.tsx仅Web registerSW、Vite禁止额外自动注入注册 | root保留只读metadata/cache body证据、受控旧profile升级、当前UI/无旧controller与localStorage/SQLite前后；旧cache与现场相符，尚不冒称controller已取证 |
| [修订: PLAN_DEFECT-R2.3] actual main label仍可让旧main bundle调用save_data | §6.8 nativeBootstrap状态在业务命令前fail-closed，成功清理后才允许main入口 | impl同步/回调失败与超时gate测试；root空白期无load/save，旧缓存fixture无旧脚本执行/保存 |
| [修订: PLAN_DEFECT-R2.8] `lib.rs::run()` 在 Tauri setup 前调用 `import_deepseek_config_inner()`；它会读取旧配置并写入 OS credential vault，因此发生在缓存清理 Ready gate 之前 | §6.8 将调用移到 bootstrap Ready 后；记录迁移错误且不冒报“已迁移”，不回滚已安全启动，也不清除或改写原配置/凭据内容 | impl 顺序/状态测试证明失败清楚返回或记录、已Ready启动仍可用且迁移未被标记成功；root仅核原凭据内容保留，证据写入 `impl_report_bootstrap_r1.md` / `verification.md`，不得推断已迁移 |
| [修订: PLAN_DEFECT-R2.8] 当前 `run().setup` 对 `desktop_pet::setup` 错误仅 log 后返回 `Ok(())`；窗口/bootstrap创建错误可能让主窗业务导航越过双窗启动契约 | [R2.8历史响应，由R2.9收敛当前口径] 创建/setup错误在入口导航前置Failed；清理后仅导航最小bootstrap，Ready前不导入业务组件/开放业务命令 | impl纯状态覆盖创建/setup失败时无入口导航；R2.9另覆盖部分导航后失败：入口bundle可能已执行，但无业务组件导入及副作用；root真实隔离验证见§7.1 |
| [修订: PLAN_DEFECT-R2.9] 真实调用链为 `App` 打开 AI panel 后才调用 `prepareAi()`；其先 `ai_configured`，未配置才调用 `import_deepseek_config`。Tauri `run()` 在 `.run()` 后阻塞事件循环，setup 的异步COM完成后没有可顺序续跑的 `run()` 代码点 | `main.tsx` 最小入口在双窗 fresh entry-ready 后、动态导入/挂载 `App` 前恰好调用一次启动迁移command；Rust async command转到`tauri::async_runtime::spawn_blocking`并复用与 `prepareAi` 相同的串行/幂等导入实现 | impl 顺序测试验证 Ready handshake→迁移invoke一次→App import/mount；并发调用只串行进入同一导入函数、成功只写一次；失败返回静态脱敏结果并继续挂载。root验正式 profile 与凭据内容保留，不读出或记录密钥 |
| [修订: PLAN_DEFECT-R2.9] 双窗 `navigate` 是两个独立调用；main成功而pet导航/加载失败时，main入口可能已经开始执行 | NativeBootstrap 保持 Pending，直到 main/pet 最小入口分别 fresh handshake；main.tsx在握手完成前不动态导入App/DesktopPet/styles、不挂载业务组件；失败进入Failed并向双窗广播安全错误 | impl测试注入 main-ready + pet同步导航失败/加载超时，断言没有App/DesktopPet动态import、load/save、AI/宠物业务command、localStorage、SQLite、凭据和网络业务副作用；剩余窗口只保留静态安全壳。承诺边界是阻止业务代码与副作用启动，不声称已开始加载的入口bundle字节完全未执行 |
| [修订: PLAN_DEFECT-R2.10] main/pet在双窗Ready后有独立挂载门槛 | §6.8 `src/main.tsx::start`：双方Ready后动态载入React与`react-dom/client`；main先await单次迁移再载App/样式，pet经双方握手Ready后载DesktopPet/样式 | §7.1纯状态时序测试及隔离WebView import sentinels：迁移阻塞时pet可挂载、App未导入；迁移脱敏失败后main继续挂载；impl留存顺序与计数证据，root承接实际EXE/真实profile |
| [修订: PLAN_DEFECT-R2.10] 静态入口依赖图必须保持最小 | `src/main.tsx` Tauri分支仅保留bootstrap所需Tauri API/静态壳；React、`react-dom/client`、App/DesktopPet、store及业务样式均为门槛后的动态import | §7.1核对构建module graph/chunks与import sentinel：静态入口不得包含上述模块；未过门槛时对应动态模块sentinel为0。impl提供依赖图、chunk与sentinel证据，缺失记未验证 |

## 4. S1：简洁工作区与旧正文收敛

**目标/映射**：G2、G3，保护 N1/N2；输入现有 App/NotesView/codec，输出精简首屏和可逆 legacy 往返，数据库零迁移。责任 owner：S1 impl。S1 先落盘后 S3 才改 App，同一文件不并发写。

**关键文件/锚点**：`src/App.tsx` 的 JSX外壳、workbench-header/topbar、nav/createInView/键盘Escape和 NoteComposer 调用；`src/NotesView.tsx` heading/capture-entry/sort-hint；`src/styles.css` `.app-shell/.desktop-titlebar/.workspace/.content` 和响应式末段；`src/NoteComposer.tsx` EmbeddedPetModel/insertPet/初始化effects；`src/noteCodec.ts` PET_HOST_HTML/noteHtml；`src/noteFormat.tsx` renderMarkdown/editorHtmlToMarkdown。先看这些位置即可理解首屏和legacy所见即所得怎样收敛。

**目标结构**：App 内共用一个 `workbench-chrome` 顶部区域，包括桌面标题栏（桌面只在此出现品牌）和核心导航/工具；`workspace-scroll` 在它下方独占纵向滚动。modal/AI drawer/年轮保留原 portal/局部overflow语义。Web没有标题栏时在同一顶部区域显示小品牌。

实施顺序：

1. 保留三个核心 Nav（记录/待办/账本），添加 `More` 按钮（aria-expanded/aria-controls）。按钮旁显式“更多”，次级有记录时光/关联图/伙伴、回收站/设置、晴笺AI、主题切换；不能用无标签图标藏入口。菜单用普通button列表/region，不宣称无完整键盘语义的role=menu；Tab自然顺序，Escape关闭且焦点回More，点击外部关闭、选项导航关闭。从次级页返回时More显示该页名/selected说明，仍可回核心页。阻塞modal时菜单被关且背景按现有inert规则，不抢编辑焦点。
2. 核心区域保留一个 `new-button`，记录搜索旁小型“Ctrl K”按钮/提示兼具入口，删除独立大快速打开按钮。搜索只在记录相关页显示；其他页“查找记录”仍跳记录并聚焦。本机状态移入设置说明，不占首页；撤顶部口号和重复大品牌。不要改AI发请求的显式条件。
3. NotesView标题改“记录”/“回收站”小标题+条数，删除眉题/长说明、非空列表capture-entry以及常驻sort-hint。保留筛选/三布局、排序抓手title/aria说明、卡片动作、分页、标签功能。空态保留一个创建引导；有筛选空结果仍清筛选而不是新建。卡片动作本轮只缩间距和弱化视觉，保留现有顺序/键盘可达，不重构排序算法。
4. 桌面外壳 `height:100dvh; min-height:0; overflow:hidden`，body/root桌面视口不滚动；Web也用同一滚动容器（小屏高度正常）。顶部/容器min-width:0，内容flex:1/min-height:0/overflow:auto。标题栏透明、无border-bottom，沿现有workbench-light连续背景；顶部和内容不新增纯色块。主内容滚动条8px，thumb主题半透明、hover提高对比、圆角；Firefox scrollbar-width:thin/scrollbar-color；modal/editor必要滚动同主题。滚动条仍可抓取，保留触屏/键盘/PageDown/到末尾行为；勿对全应用隐藏滚动条。
5. 撤正文3D专用链，固定legacy文字，无全库替换。保持受限parse首token/转义/unknown/fence规则，以及序列化直接root子DIV判定。旧host用 `data-note-pet="xiaotuan" contenteditable="false"`，仅文字“晴小团”，没有可渲染任意HTML或资源属性。阅读返回普通 `<p>晴小团</p>`；搜索plain维持“晴小团”。编辑器原始token原样回写，可Backspace删除/原生撤销恢复。

**被删专用函数/链完整名单**：NoteComposer `EmbeddedPetModel`、`insertPet`、`petRoot` ref；初始化effect内部 `reconcile`/`scheduleReconcile`、MutationObserver/延迟root unmount、appearance-change root.render effect；toolbar 插入按钮；相应createRoot/Root/Sparkles/Pet3DView/PetPortrait/appearance进口和props。`rangeOwned/rangeElement/rangeBlock/captureSelection/restoreRange/syncFromEditor` 全保留（其他格式仍消费）。codec PET_DIRECTIVE/PET_HOST_HTML、parseNote/noteHtml/notePlain 与 editorHtmlToMarkdown.isPet 保留转换为兼容，`PET_HOST_HTML`去除mount属性/嵌套图片占位。`renderMarkdown`去除PetPortrait分支及appearance形参；同步 App/NotesView/NoteGraph/RecordGarden 等所有 `renderMarkdown(..., appearance)` 调用和纯展示props（检索完整调用链），仅去掉不再使用的appearance传递。`PetPortrait`本身仍供伙伴/SVG回退，不能删。删除`.embedded-pet-model/.embedded-pet-preview`图形样式，留下小型legacy文字样式，不删通用pet样式。

调用边界与副作用：App NoteComposer props收缩；正文renderer不再加载伙伴模块/Three；NotesView/NoteGraph/RecordGarden如appearance只为正文则去掉该prop、App同步调用，不改它们其他数据/交互；noteCodec不收缩存储协议；tests现有GLB图形断言改成plain且往返保留。这是 ≥50行专用链删除，已列完整名单、保留部分、调用方与连锁副作用；已触发片段要求。

目标片段（来源：NoteComposer初始化effect、noteCodec PET_HOST_HTML、noteFormat pet分支；用途：审核删除链与兼容保留同时成立）：

```tsx
// NoteComposer: only editor initialization / selection cleanup remain.
useEffect(() => {
  if (ref.current) ref.current.innerHTML = markdownToEditorHtml(initialContent)
  const timer = setTimeout(() => { ref.current?.focus({ preventScroll: true }); captureSelection() }, 30)
  document.addEventListener('selectionchange', captureSelection)
  return () => { clearTimeout(timer); document.removeEventListener('selectionchange', captureSelection) }
}, [])
// noteCodec: exact existing token -> fixed noneditable text, never arbitrary HTML.
const PET_HOST_HTML = '<div data-note-pet="xiaotuan" contenteditable="false" class="legacy-pet-text">晴小团</div>'
// noteFormat: reading has no image/canvas/root.
if (block.kind === 'pet') return <p key={key}>晴小团</p>
// editorHtmlToMarkdown: keep exact-root-host -> PET_DIRECTIVE branch unchanged.
```

**验证责任/证据**：impl只跑fresh `npm test`、`npm run build`、`git diff --check`，补旧host往返、重复/unknown/escaped/fence和无图renderer断言；在`impl_report_s1_r1.md`记录完整退出码、diff、失败。coordinator承接真实浏览器连续中英文输入/选区粗体列表/保存回填/CtrlEnter/CtrlZ/Y/草稿恢复/legacy删除撤销/深色、菜单Tab/Esc/焦点、窄窗、排序基本回归及最终原生顶部/滚动，证据`verification.md`与target截图。未做这些不称编辑体验或原生截图问题已解决，命令只证明编译/可自动测部分。

**作者体验/可读性**：保留现有命名及JSX职责，不新造导航框架；菜单用有限当前View项，布局class分别表达chrome/scroll owner；格式算法/纯文本codec不被布局重构打散。**验收**：非空首屏仅核心导航、搜索/单新建、简短标题筛选、真实记录；旧token仍回原文且正文零canvas/root；浅深标题连续。**回滚**：独立S1提交可git revert（不reset），旧token不迁移故无需数据回滚；兼容测试失败先修本包，不允许删用户记录。**依赖**：无S2/S3前置；S1保留桌面浮层到S3替换，避免中间制品假装独立桌宠。

## 5. S2：本机模型细化与共享渲染

**目标/映射**：G1/G3、N1/N3；输入旧本机 `.blend`/GLB/脚本和已接受原创轮廓；输出refined五模型、真实预览/来源manifest及共享正式URL解析，不改变业务数据。owner S2 impl；可在S1实现时做外部refined模型，但进入repo的PetCompanion/pet.css接入在S1合并后进行，S3不并发改这些文件。

**关键文件/接口**：本机`E:/pet-model-workbench/build_models.py`（只读旧）、`E:/pet-model-workbench/refined/2026-10-07/build_refined.py`（新）；原始`assets-source/pets/xiaotuan.py/.blend`保留；新增`src/petModels.ts`、`src/PetFigure.tsx`（唯一GLB/SVG渲染接口）、`src/local-pet-models/`（忽略目录）、`.gitignore`；`PetCompanion.tsx`现`PetFigure3DOrSvg`/showcase装扮组选项；`Pet3DScene.ts`setMood/setAppearance/tick；`Pet3DView.tsx`异步加载/ready失败清理；沿用现有PetMood，局部renderer新增可选activity=walk/look，不扩大全站PetMood/Record。先看资源解析和scene即可判断生产四角色是否真三维，以及装扮/clip是否诚实。

实施顺序与固定结果：

1. 在refined新目录保存脚本、五角色每个`.blend/.glb`、front/side/back/desktop-size.png、manifest（source旧路径、生成脚本、Blender版本、SHA256、节点/网格/clip名单、装饰节点名单、visual_status=awaiting_user_review；无官方背面部分注明自行补完）。保留全部旧文件。原创沿原脚本/轮廓，只改眼高光、材质/动作；候选先暂存为local xiaotuan，不先覆盖公开原GLB。
2. 奶龙移除像熊耳的顶圆耳视觉，黄色大头/身体比例、独立宽吻、白肚、绿虹膜+暗瞳+高光、脚趾和侧尾；小八蓝额网格贴合椭球表面（避免穿插/浮片）、圆润三角猫耳；吉伊短圆耳/白体粉颊和独立嘴型；乌萨奇细长耳/米黄/特色嘴眼。柔和材质保留足够明暗层次，真实前/侧/背及220px尺寸不交成点眼通用嘴。不要把5个GLB改成同一种模型换色。
3. 五模型都严格有`PetRoot`、`idle/happy`；四refined优先全部补齐`Beret/Halo/Scarf/Bow`命名节点并正确帽/围巾位置，不让服饰改变角色本体色。可以补`walk/rest/blink`动画（网格/耳/脚/眼真实keyframe），clip必须可导出重导且有实际channels；导出基态中性，眼睛/饰品transform完整重导检查，blend可保留预览相机；没有clip时renderer回idle，不能把窗口位移叫骨骼行走。为refined五资产完成装饰节点是优先路径，缺失只能诚实隐藏对应组并记证据，不临时新造能力系统。
4. `.gitignore`新增明确`/src/local-pet-models/`；复制五GLB到角色名固定文件 `{xiaotuan,nailong,chiikawa,hachiware,usagi}.glb`，manifest只在target/外部refined。`petModels.ts`使用静态`import.meta.glob('./local-pet-models/*.glb', { eager:true, query:'?url', import:'default' })`按文件实际存在解析；xiaotuan缺私有版本用公开`BASE_URL+'pets/xiaotuan.glb'`，四角色缺失返回undefined。外部绝对路径不进入业务源码，不硬请求不存在URL。公开无私有目录构建应成功并SVG回退；个人dist含私有GLB不能公开发布。
5. 导出统一`PetFigure`供PetCompanion/PetShowcase/DesktopPet消费，接口 `{appearance,mood,animate,activity?:'walk'|'look',onLoaded?,onError?}`；内部由resolvePetModel选择modelUrl/original/fallback；允许现DEV临时preview作为明确开发覆盖，生产不依赖picker。SVG的`PetPortrait`保留，但移入`PetPortrait.tsx`供共享PetFigure使用（保持SVG实现原样），避免PetFigure↔PetCompanion循环依赖；不是拆整套组件重构。角色缩略选择仍用SVG避免多WebGL。
6. `Pet3DScene.setAppearance`对所有实际装饰节点show/paint，只有original染Body/Ear/Leaf，第三方本体材质不改；加载时检查现有名字，`onLoaded`可返回有限装饰节点列表供showcase缺节点隐藏控制；无需泛化capability。缺一装扮组时隐藏该组与组合预设并解释“当前三维模型未提供此装饰”；palette只有本体或实际装饰会变化才呈现。SVG回退装扮仍原能力。`Pet3DView`模型切换应重置ready/failed、旧异步next立即dispose；优先使用以modelUrl/original为key的实例，contextlost即dispose并显示SVG，不留下ready=true假象。
7. scene RAF仍用现有局部tick，但30fps渲染/动画更新节流（elapsed≥1000/30才mixer/update/render；elapsed为实际两次更新间隔，最大0.1s）；停动画取消RAF，休息采样实际rest clip首帧静态姿态，不每帧更新；rest首帧由模型设置为休息姿态，导出basepose仍中性，没有rest保持idle静止。happy→happy clip，局部activity=walk/look选择同名实际clip否则idle，idle可包含blinking关键帧。独立blink clip若仅眼睛channels可叠加idle；不宣称未导出的clip。dispose清理所有action/RAF/material/geometry/texture/renderer；非原创装饰材质需clone以防共享材质染本体。

目标片段（来源petModels与scene，用途：证明生产存在文件解析、optional动作和本色/装饰边界）：

```ts
const local = import.meta.glob('./local-pet-models/*.glb', { eager: true, query: '?url', import: 'default' })
export function resolvePetModel(character: PetCharacter) {
  const url = local[`./local-pet-models/${character}.glb`]
    ?? (character === 'xiaotuan' ? `${import.meta.env.BASE_URL}pets/xiaotuan.glb` : undefined)
  return url ? { url: String(url), original: character === 'xiaotuan' } : null
}
// setMood: optional clips are selected only when really present.
const preferred = mood === 'resting' ? 'rest' : mood === 'happy' ? 'happy' : activity ?? 'idle'
const clip = clips.find(item => item.name === preferred) ?? clips.find(item => item.name === 'idle')!
// setAppearance: preserve character body materials.
if (original) { paintBodyPalette(); paintEarsAndLeaves() }
for (const name of ['Beret', 'Halo', 'Scarf', 'Bow']) { showActualAccessory(name); paintActualAccessory(name) }
```

**验证责任/证据**：impl模型工作允许headless Blender生成/重导、GLB JSON结构/clip/node/hash、图片导出（报告实际错误）；fresh npm test/build/diffcheck；公开缺私有目录build通过可移开仅自己本包复制的5模型到已核查外部备份、构建后恢复，不用git clean；个人恢复模型再次build，对dist中5URL/哈希核对。`impl_report_s2_r1.md`及target模型manifest为证据，不提交私有资源。coordinator独立看5模型多视角/小尺寸，并最终EXE逐角色加载、服饰/轻触/休息/活动观感、上下文丢失回退；用户判造型满意，缺原生或视觉证据只能“候选待验”。

**作者体验/声明可读性**：`resolvePetModel`只按5枚举解析；PetFigure仅资源/renderer胶合，renderer和原SVG职责明确；装饰名字复用现有，不发明registry/插件平台。**验收**：5个人GLB正式构建命中、PetRoot/idle/happy必需，私有缺失公开回退、实际服饰功能，旧资产保留和真实预览齐全。**回滚**：移除本包复制候选即可公开/SVG回退；S2独立提交revert，旧外观四字段/schema未变；原公开原创未覆盖所以随时回原件。**依赖**：S3消费PetFigure现有PetMood/局部activity/onLoaded节点结果；S2在完成接口后可与S3专属新文件并行，但PetCompanion/pet.css不可双写。

## 6. S3：原生独立桌宠、有限桥接和自主行为

**目标/映射**：G1/G3，保护N1/N2/N3。输入S1 App布局与S2 PetFigure，输出固定pet窗、有限摘要/动作/提示和可取消活动。owner S3 impl；仅本包改App桥接/desktop/main/Rust，禁止同时动S1样式和S2模型/renderer。本包可以拆“协议与后端”及“前端与活动”两个提交，不能为凑小diff割裂可验证契约。

### 6.1 关键文件与接口矩阵

#### 本轮修订说明
[修订: PLAN_DEFECT-R1.3] 增加Windows专属小helper职责锚点，保留现有入口/renderer/main保存分层，不拆成跨平台窗口框架。

| 文件/锚点 | 职责与输入→输出 | 依赖边界 |
| --- | --- | --- |
| `src/main.tsx` entry selection | 原生实际getCurrentWindow().label → pet动态import 或App+styles+SW | pet不得静态import App/styles/store，普通Web的`?pet`不能进入native模式 |
| `src/desktopPetProtocol.ts` | 下面有限类型/事件字符串/字段验证 | 不import store、desktop业务、React App |
| `src/useMainPetBridge.ts` | main初始化/监听/派生发布/结果；传入load commit/最新business ref | 不自行保存SQLite，业务保存仍App现effect |
| `src/App.tsx` load效果/旧reminder效果/nav/create入口/Settings | 唯一owner、合格摘要、用户意图实际执行；显示偏好持久化 | 不让pet直接save或替换composer |
| `src/DesktopPet.tsx` | 独立快照、可见提示、本地休息/轻触、局部菜单、动作结果 | 不import App/store，不读localStorage；sessionStorage仅已展示token |
| `src/desktopPetMotion.ts` | 局部取消句柄/物理clamp/单段运动/拖动稳定 | 不控制其他窗口、不监听全局键盘 |
| `src/desktop-pet.css` | html/body/root透明、min-width:0，220×260宿主与菜单 | 不加载styles.css光场，不另建全桌面透明区 |
| `src-tauri/src/desktop_pet.rs` | Mutex小状态/actualcaller/命令/固定window lifecycle | app_data_dir/schema不动，不存业务或读取SQLite |
| [修订: PLAN_DEFECT-R1.3] `src-tauri/src/desktop_pet_windows.rs` | 固定pet HWND子类、同步自主SetWindowPos、dragId及native move分类 | Windows专属小helper，UI线程安装/使用/销毁，无全局hook |
| `src-tauri/src/lib.rs` run/五业务commands | 注册state/setup窗口/生命周期及main来源校验 | 内部自动credential导入helper拆开，不把command wrapper无caller直接调用 |
| `src-tauri/capabilities/pet.json` | 精确pet label仅事件listen/unlisten | 无core:default，无窗口创建/任意window setter/AI/opener |

Reviewer首落点是main入口、Rust caller、main初始化和Pet移动取消；目标形态是一个App保存者、一个pet只读入口、一个局部Rust桥接，没有双份业务状态或通用总线。改变跨文件字段/已有加载分支/动作时序，必须附以下片段。

### 6.2 固定窗口与精确权限

#### 本轮修订说明
[修订: PLAN_DEFECT-R1.3] L1/L2所需原生helper仅绑定pet HWND；新增依赖实际已存在锁版本windows-sys 0.61.2，需显式启用API所在feature，不依赖传递依赖可直接import。

[修订: PLAN_DEFECT-R1.3] `Cargo.toml`添加Windows target依赖`windows-sys = { version = "0.61.2", features = ["Win32_Foundation", "Win32_UI_Shell", "Win32_UI_WindowsAndMessaging"] }`；实读其源：SetWindowSubclass/RemoveWindowSubclass/DefSubclassProc位于UI::Shell（不是UI::Controls），WM_ENTER/EXIT/NCDESTROY和SetWindowPos位于UI::WindowsAndMessaging。已有Cargo.lock含0.61.2但项目无直接依赖，按本包仅补必要引用，五version仍留到S4改0.9.0。

[修订: PLAN_DEFECT-R1.3] pet创建后用`pet.run_on_main_thread`在所属窗口UI线程取得`hwnd()`，安装唯一SetWindowSubclass（固定subclass ID、Box context含AppHandle及功能局部运动状态引用）。安装返回0立即Box::from_raw释放、记故障/保持pet未就绪；context未安装成功不能泄漏。所有调用DefSubclassProc无业务mutex跨越；callback只取/改局部ID、复制待发事件后释放lock，再emit或调后续操作，不持lock调用SetWindowPos/StartDragging/DefSubclassProc以免WM_MOVE同步重入。WM_NCDESTROY时在该UI线程RemoveWindowSubclass、清refdata并仅一次释放Box，再正常DefSubclassProc转发；其他消息全部正常转发，不吞Tao/Wry消息。原生窗在主进程寿命内只创建一次，重载不重复安装。panic不得穿越FFI（callback用有限无panic操作或catch_unwind回退转发）。正常退出由NCDESTROY回收；单独安装失败也有release路径。

Rust setup只创建一次`WebviewWindowBuilder::new(app,"pet",WebviewUrl::App("index.html?pet=1".into()))`：`inner_size(220,260)`、`transparent(true)`、`decorations(false)`、`shadow(false)`、`resizable(false)`、`always_on_top(true)`、`skip_taskbar(true)`、`visible(false)`、`focused(false)`；`focusable(true)`保留显式点击/键盘局部菜单可达。所有自动显示/定位只show，不setFocus；只有快记/待办显式意图恢复并聚焦main。`no_redirection_bitmap`仅若安装Windows真实透明需要且验证后采用，不预宣称必需。初始右下角根据primary_monitor.work_area/physical outer_size算，8物理像素边距；主窗最小化无handler隐藏pet。

pet CloseRequested prevent_close→向main发有限hide意图，成功更新petShown后隐藏；若protocol未ready/发送失败则直接隐藏本窗并返回错误，不写用户off偏好，main再就绪按其真实偏好恢复。main CloseRequested退出整个app；退出时窗口和所有资源随进程清理，不新增托盘。初始化窗口创建失败主App继续，桥接返回“桌面伙伴暂不可用”，不装作SVG独立窗已正常。

精确`pet.json`：`windows:["pet"]`，`permissions:["core:event:allow-listen","core:event:allow-unlisten"]`。前端用`getCurrentWindow().listen(...)`消费本窗定向事件与`tauri://move`/`tauri://scale-change`，这些走event权限。位置/visible/monitor/原生drag均采用固定pet Rust wrappers，不给无目标scope的`core:window:allow-set-position`、current-monitor、outer-size等JS命令；pet无focus/show/hide/window-create/close权限。main default保留既有窗口权限及event能力；现有`core:default`属于main，不能扩到pet。

所有自定义command注入**实际**`WebviewWindow`并`require_label(window.label(), "main"|"pet")`，不从payload读取caller。业务`load_data/save_data/ai_configured/import_deepseek_config/ask_deepseek`均限定main；凭据迁移拆成内部`*_inner`供run一次调用和main wrapper使用，避免run需要伪caller。JS没有save权限不代替Rust门禁。固定label是本机同包窗，不提供请求label参数。ACL+caller负向测试拒绝 pet 调全部业务命令、main调pet-only、错误label、owner过期；拒绝应发生在读数据库/凭据/网络之前。

### 6.3 有限字段、事件和命令（唯一契约）

#### 本轮修订说明
[修订: PLAN_DEFECT-R1.4] L1以dragId绑定原生循环退出，L2增加唯一native分类事件/expected物理坐标；删除未实施的鼠标按钮探测，既有owner/revision/业务协议不扩成通用消息框架。

TS camelCase，Rust serde rename_all=cameCase；枚举用kebab-case。无用户数据全量列表/正文/凭据。字段明确：

```ts
type PetSnapshot = {
  owner: number; revision: number; protocolReady: boolean
  appearance: PetAppearance; theme: 'light'|'dark'; shown: boolean; motionEnabled: boolean
  localDay: string; dueCount: number; dueTitles: string[] // ≤5项，每项≤160字符
  reminder: null | { day: string; token: string }
}
type MainPetPublish = Omit<PetSnapshot, 'revision'|'protocolReady'|'reminder'> & { reminderEligible: boolean }
type PetIntent = 'quick-note'|'open-todos'|'hide'|'reminder-shown'
type PetAction = { owner: number; requestId: string; intent: PetIntent; reminder?: {day:string;token:string} }
type PetActionResult = { owner:number; requestId:string; status:'handled'|'blocked'|'unavailable'; reason?:string }
const PET_SNAPSHOT_EVENT = 'qingjian:pet-snapshot'
const PET_ACTION_EVENT = 'qingjian:pet-action'       // emit_to main only
const PET_RESULT_EVENT = 'qingjian:pet-result'       // emit_to pet only
const PET_VISIBILITY_EVENT = 'qingjian:pet-visibility' // {visible:boolean}, true only after actual show
// [修订: PLAN_DEFECT-R1.4] Rust native classification; raw tauri://move does not cancel motion.
const PET_NATIVE_EVENT = 'qingjian:pet-native' // union below, emit_to pet only
type PetNativeEvent =
  | {kind:'drag-enter'|'drag-exit'; dragId:number}
  | {kind:'move-owned'; movementId:number; position:{x:number;y:number}}
  | {kind:'move-external'; cancelledMovementId:number|null; position:{x:number;y:number}}
```

[修订: PLAN_DEFECT-R1.4] Rust运行状态仅`owner:u64/revision:u64/current:PetSnapshot`、`reminderDay/tokenCounter/token`、最近一个显式request/result、本次有效提醒的一个confirmation request、本次movementId/activeMovement，以及native helper的pendingDragId/loopDragId/lastExitedDragId和单个expectedOwnedPosition。提醒确认单独识别，不能覆盖处理中显式动作ID。native计数由后端单调分配，只在本pet寿命有效；日期格式校验YYYY-MM-DD；dueCount非负、titles≤5/160且只来自main未完dueDate≤localDay；appearance按现有有限枚举反序列化，theme/motion/shown有限字段。错误payload拒绝，不接受HTML或任意command名字。

| 命令 | actual caller | 参数/返回 | 固定效果/失败 |
| --- | --- | --- | --- |
| `pet_begin_owner` | main | 无 → owner及unready snapshot | 清旧资格/最近动作，owner++、revision++、隐藏pet并取消运动，emit unready；同日reminder token保留 |
| `pet_end_owner` | main | owner → void | 仅当前owner可失效并隐藏；旧owner无操作（幂等），不覆盖新owner |
| `pet_publish` | main | publish含owner → 实际带token/revision snapshot | 当前owner且load/listener合格才调用；Rust递增revision，按shown show/hide并发定向snapshot/visibility；show失败返回error、publish转unready并隐藏 |
| `pet_read` | pet | 无 → 当前snapshot+实际visible | listener先建立再读；不写业务；同revision也更新visibility，不按旧响应降级新snapshot |
| `pet_action` | pet | action → 仅accepted或立即错误 | 当前owner/ready校验，快记/待办show→unminimize→set_focus main后emit action；hide/ack不聚焦main；重复最近id回缓存result，处理中重复不再emit |
| `pet_action_result` | main | result含owner/requestId → void | 仅当前owner+当前/最近request匹配；缓存有限结果、emit pet；旧/未知拒绝，结果不执行第二次业务 |
| [修订: PLAN_DEFECT-R1.4] `pet_geometry` | pet | 无 → visible、physical position/outerSize/workArea/scaleFactor、activeDragId/lastExitedDragId | 固定pet，current_monitor空用primary monitor定位恢复；无可用monitor/error停活动；不查询全局键鼠按钮 |
| `pet_move_begin` | pet | 无 → movementId及fresh geometry | 仅ready/shown/可见/动态且不dragging，分配ID；不聚焦 |
| [修订: PLAN_DEFECT-R1.4] `pet_move_step` | pet | movementId+物理x/y → void | UI线程校验current ID和visible/notdragging、clamp、记录expected、释放lock后同步SetWindowPos固定pet HWND；返回前自身WM_MOVE已分类，取消后晚到拒绝 |
| `pet_move_cancel` | pet | movementId可空 → void | 取消当前或指定匹配段；不影响新段，hide/begin_owner/drag统一取消 |
| [修订: PLAN_DEFECT-R1.4] `pet_drag` | pet | 无 → dragId | UI线程先取消movement/分配pendingDragId，再固定pet.start_dragging；WM_ENTERSIZEMOVE捕获本次loopDragId；启动失败清本次ID并报错 |
| [修订: PLAN_DEFECT-R1.4] `pet_drag_finish` | pet | dragId → fresh geometry或still-dragging | 仅dragId已获WM_EXITSIZEMOVE并匹配lastExitedDragId可结束；native已退出后位置300ms稳定再fresh边界/clamp；不用pointerup或GetAsyncKeyState0猜结束 |

`pet_publish`不另需显式main show命令：设置petShown改变发布路径即恢复。隐藏实际结果通过snapshot+visibility与publish返回，不把偏好关闭和故障隐藏混为一事。移动命令有具体ID只解决本段晚到，不建立通用取消平台。

### 6.4 main 初始化、StrictMode和发布

把App当前一次性load effect替换为`useMainPetBridge`协调的初始化；业务ready与protocolReady分开。最新App状态/action handler用ref更新避免listener闭包旧数据；main保存effect仍只消费App notes/transactions/todos/ready。Web不调bridge，原load localStorage/save及原自动提醒保留。

**StrictMode时序固定**：模块局部`mainPetInitTail`只串行本功能初始化（不是业务动作队列）；每轮effect有`cancelled`，每个await后检查，取消的load绝不setNotes/setReady。第2轮等待第1轮初始化/清理尾部结束后再begin，防取消轮的晚begin失效新owner。每轮至多一次begin/listener/load；异步listen返回后已cancelled立即unlisten。清理同步置cancelled、off，异步end_owner带已得owner；旧end不能失效新owner。只在active初始化轮且SQLite load成功并listener成功时保存owner/设置protocolReady；catch仍可以setReady并给已有浏览器fallback，但桌宠保持隐藏、显示“桌面伙伴暂不可用”。begin/listener失败仍要让主业务按既有路径load，不能因桌宠故障阻断笔记。无自动retry平台；成功重载/重启才重建。

目标伪代码（来源App load effect / useMainPetBridge，用途：审核旧load不更新新App以及条件AND）：

```ts
useEffect(() => {
  let cancelled = false, owner: number|undefined, off: (()=>void)|undefined
  const init = async () => {
    let listenerOK = false, sqliteOK = false
    try {
      owner = (await beginOwner()).owner
      if (cancelled) return
      off = await mainWindow.listen(PET_ACTION_EVENT, e => handleCurrentAction(owner!, e.payload))
      if (cancelled) { off(); off=undefined; return }
      listenerOK = true
    } catch { if (!cancelled) reportPetUnavailable() }
    if (cancelled) return
    try {
      const data = await loadDesktopData()
      if (cancelled) return
      commitLoadedData(data); sqliteOK = true; setBusinessReady(true)
    } catch { if (!cancelled) { setBusinessReady(true); reportExistingDatabaseFallback() } }
    if (!cancelled && owner !== undefined && listenerOK && sqliteOK) setProtocolOwner(owner)
  }
  mainPetInitTail = mainPetInitTail.catch(()=>{}).then(init).finally(async () => {
    if (cancelled) { off?.(); if (owner !== undefined) await endOwner(owner) }
  })
  return () => { cancelled=true; off?.(); off=undefined; if (owner!==undefined) void endOwner(owner) }
}, [])
```

finally/cleanup end幂等；impl可合并重复end调用为一次，不改变取消与串行关系。桥接listener始终按传入owner及最新businessRef检查；old listener收到旧owner不执行动作。发布只在protocolOwner已生效后，随外观/theme/shown/motionEnabled/localDay/due摘要/已提醒资格变动；main pageVisible/弹层不作为pet显示许可。

每次publish可能异步晚回：main用局部publishSequence和owner只接受当前代次/不低于acceptedRevision的返回；Rust owner匹配和revision确保pet丢弃旧事件。main通过publish**返回的Rust snapshot**获得有效token，不自造token。main `acceptedSnapshotRef`用于确认，但还必须核对最新businessRef日期、到期项、shown及键，避免参数变化待发布期间收旧确认。旧publish如果owner已过期backend拒绝；单owner同轮所需字段发布由一个局部promise尾串行并合并到最新值，最多当前执行+一个最新pending，不持久化/不重放动作，不让旧字段覆盖新字段。owner结束清除pending，失败协议转unready/隐藏并反馈，不不断重试。

### 6.5 动作结果与每日真实提醒

DesktopPet监听snapshot/result/visibility均先注册成功后read；任何注册/读取失败展示局部错误且不运行场景/动作/确认。异步unlisten立即处理已卸载；snapshot只接受较高revision（进程新建实例从-1），同一owner的旧结果不改当前不同request。unready/owner改变取消inflight timeout/自动活动/提示，清菜单但不自动重发业务动作。

用户局部菜单按需出现（右键/小“更多”按钮），平时只宠物形象和短暂反馈，无常驻名字口号+4按钮板。菜单四项快记、待办、休息/唤醒、收起；收到快照前禁用业务项，休息是pet本次运行local state不写偏好。快记直接App `setComposer({type:'note'})`（已有恢复草稿逻辑）；待办 `nav('todos')`，不另外自动弹main todoReminder。最新businessRef包含composer/quickOpen/tagPickerOpen/aiOpen/wheelEntryId/导入确认；这些任一阻塞时保持上下文，返回blocked“请先处理当前界面”。导入当前使用原生confirm同步阻塞JS事件，结果在confirm结束后再校验最新状态，不新增导入状态平台。

requestId用pet实例nonce+递增序号；一次只处理一个**显式**动作（quick/hide/todos），5秒 timeout解除按钮并提示“未确认，请查看晴笺”，不重放。main保存最近request/result，重复返回缓存不执行；Rust也只保存最近accepted/result。被新owner拒绝、窗口恢复失败或event发送失败立即显示unavailable；被处理后但结果丢失不能当“已打开”，timeout只说明未确认。收起main先更新现有petShown/off偏好、发布真实hidden成功后返回handled；写偏好失败仍按本次状态显示错误，不虚称重启保留；hide失败结果unavailable且main反馈。提醒确认不是用户动作busy按钮的占位者，按单独日期/token幂等链处理，Rust/main仍只保留最近必要确认，不排队显式动作。

每日确认固定闭环（来源App两个旧reminder effects；用途：资格/展示/记键的不同责任）：

```ts
// main: desktop old automatic reminder effects early-return; Web keeps them.
const eligible = protocolReady && petShown && dueCount > 0 && !localStorage.getItem(`luma-todo-reminded:${localDay}`)
// publish sends reminderEligible, Rust supplies stable token for this localDay.
// pet: after React committed a visible notice, actualVisible=true, !resting, ready:
// sessionStorage only marks that a notice really appeared; reload same token does not reopen.
if (noticeCommitted && actualVisible && !resting && reminder) {
  sessionStorage.setItem('qingjian-pet-last-shown-token', reminder.token)
  sendReminderShown(reminder) // on reload a previously shown same token may re-ack
}
// main: accepted current Rust token AND latest date/due/shown AND owner ready.
if (validCurrentQualification(action) && !localStorage.getItem(dayKey)) {
  localStorage.setItem(dayKey, '1')
  publishLatestWithoutReminder()
}
```

Rust同进程同日期token稳定，owner重载保留；日期改变换token、旧token不可耗新日期。pet处于隐藏/休息、原生show失败、protocol未ready、listener/load失败、尚未render提示时不写session marker/确认。减少动态停动画但可显示静态提示；提示不聚焦main，显示数量/最多5title并可手动点待办。真实visible由Rust成功show/hide定向事件+read返回（不拿document.hasFocus当可见），短通知8秒后关闭，键后资格为空，不不断弹。main收到确认前再次校验最新ready/owner/date/token/due/shown/datekey；重复/已记键返回handled但不新写，过期返回unavailable而不影响新token。main重载且已展示token的pet可在新资格同token时重传确认，业务快记永不重传。

### 6.6 有限活动、物理定位与取消

#### 本轮修订说明
[修订: PLAN_DEFECT-R1.5] 用Windows本窗移动循环信号闭合正常松手自动恢复；用UI线程同步定位的expected位置分类自身WM_MOVE，避免首步自取消。仅替换原未实施拖动/通知文字，不改休息/偏好/帧率和业务契约。

DesktopPet局部状态：`mood`、`manualRest`、`autoRestUntil`、`moving`、`dragging`、`hovered/menuOpen`、`actualVisible`；不移植网页usePetBehavior的focused条件。交互/资源present=`ready && actualVisible && shown`，animate=present&&motionEnabled&&!systemReducedMotion&&!manualRest&&!autoRest&&!dragging；blur不卸载、不停陪伴；隐藏/unready卸载PetFigure释放scene。pet自己的matchMedia变化可停动作，main动态偏好快照只是偏好，不混入main页面visibility。

具体调度：无人交互时30–50秒随机一次决策，概率60%待机/30%短距活动/10%自动休息；自动休息12–20秒结束后回待机，手动休息持续至唤醒/轻触（明确轻触即唤醒）。轻触happy 1.4秒后idle；鼠标进入/按下/menu打开/人工drag立即clear决策/段timer/反馈且cancel current move；离开交互后重新等待30–50秒，不能追赶过期调度。休息/偏好off/reducedMotion/hidden/owner变更取消所有段与决策，姿态静止；唤醒后重新等待，不立即自主窜动。

[修订: PLAN_DEFECT-R1.5] 每段开头 `pet_move_begin`取fresh物理geometry，选择随机左右60–90逻辑px乘该monitor.scaleFactor一次，1.5秒12–15步（100ms间隔、最多10fps），x/y按workArea origin（可负）和outerSize/8px边距clamp；窗口过大时贴该workArea左/上不算负限宽。每段最多一个step Promise在飞，await完确认本段ID仍active才下一步；cancel原地取消，不补齐“欠下”步数。Windows自主step在窗口UI线程执行：再核本段ID/clamp，先锁内写单个`expectedOwnedPosition={movementId,x,y}`，释放lock，调用固定pet HWND的同步`SetWindowPos(...,SWP_NOZORDER|SWP_NOSIZE|SWP_NOACTIVATE)`，不使用Tao带SWP_ASYNCWINDOWPOS的自主set_position；完成后清本次expected。cancel/drag/hide失效也在同一UI线程排入，使晚step执行时ID已失效，而不是cancel后再跨线程落旧位置。所有锁在OS调用前释放，避免WM_MOVE重入死锁。

[修订: PLAN_DEFECT-R1.5] pet HWND子类在WM_MOVE时用GetWindowRect读取完整signed物理坐标（不从lparam的16bit值截断多屏坐标），匹配当前expected exact x/y且movementId仍当前则emit `move-owned`，只更新实际坐标，不cancel；没有expected/不匹配则emit `move-external`并带被取消的movementId、取消原段。回调前述lock释放后才emit/DefSubclassProc。自主SetWindowPos同线程同步调用的WM_MOVE在该调用返回前分类完成，不等待100ms猜来源；返回后晚到的raw `tauri://move`前端只观察坐标、不参与取消。前端只对当前movementId的owned通知更新，external只有cancelledMovementId等于当前段才清它，旧段通知不得清新段。手动drag、scale/monitor变更始终取消当前段并fresh查询；自身owned坐标变化不取消。屏幕缺失停止/用primary工作区恢复可见位置，不能推0原点或全屏尺寸。

[修订: PLAN_DEFECT-R1.5] `nativeDragging`只是pendingDragId或loopDragId非空的派生判断，不新增另一份会漂移的布尔真源。SetWindowPos返回0/GetWindowRect失败取消本段、清expected并返回局部错误；不得默填0坐标。为了finish后的边界clamp与初始安置产生的WM_MOVE也被诚实识别，这两种定位使用相同UI线程同步helper但purpose=placement（无自主movementId），只更新坐标且不启动/恢复活动；人工loop尚未退出不能placement。明确purpose有限二选一，不扩通用消息总线。

[修订: PLAN_DEFECT-R1.5] 原生拖动：pointerdown保存客户端起点/ID、cancel自动；移动≥6px调用`pet_drag`。Rust在UI线程分配dragId到pending，先取消movement，再调用固定pet.start_dragging；实读Tao 0.35.3 `handle_os_dragging`先ReleaseCapture、设置dragging并PostMessageW(WM_NCLBUTTONDOWN,HTCAPTION)，其event_loop处理WM_ENTERSIZEMOVE与WM_EXITSIZEMOVE（退出时还Post WM_LBUTTONUP）。因此本窗子类的WM_ENTERSIZEMOVE把pending ID绑定loopDragId，WM_EXITSIZEMOVE只结束该loopDragId，存lastExitedDragId并发`drag-exit`，不因Tauri Promise返回结束。前端收到匹配exit后观察位置300ms稳定，再finish该ID、fresh边界/clamp并退出dragging，离开交互后重新等待自主决策；OS吞pointerup也自然恢复。事件若先于pet_drag Promise返回，listener记录最高已enter/exit ID；返回较旧/已exit ID不重新设dragging。下一拖动分配新ID，旧exit/finish拒绝，不终止新拖动；同窗原生loop串行，pending只在确认上一loop退出后能再次分配。

[修订: PLAN_DEFECT-R1.5] 正常结束不依赖GetAsyncKeyState、鼠标主键交换或pointerup；本窗pointerup仅清前端pointer capture/tap记录，未得到native exit不能结束后端loop。判定表：①按住停住且没有exit→仍dragging；②native吞pointerup但收到exit→稳定后自然恢复；③真实pointerup（包括此前讨论按钮0）但尚无exit→不猜，等待exit；④子类安装失败→protocol不可用/隐藏并报告，不能运行缺结束能力的桌宠；⑤已安装但拖动enter/exit消息异常缺失→局部错误并保持不自主移动，下一次显式操作查询active/lastExited，仅原生exit证据可复位，记故障未验，不能宣称正常拖动通过。原生exit事件是完整移动modal loop终止（释放或Esc取消），不局限鼠标左键；无全局hook/键盘监听。官方依据为root已实际核对的[WM_EXITSIZEMOVE](https://learn.microsoft.com/en-us/windows/win32/winmsg/wm-exitsizemove)、[SetWindowSubclass](https://learn.microsoft.com/en-us/windows/win32/api/commctrl/nf-commctrl-setwindowsubclass)、[DefSubclassProc](https://learn.microsoft.com/en-us/windows/win32/api/commctrl/nf-commctrl-defsubclassproc)，以及本轮实读安装源码。之前menurc猜测路径失败不作依据。

目标运动片段（来源desktopPetMotion/Rust pet_move_step；用途：晚到拒绝与物理坐标闭环）：

```ts
const segment = await petMoveBegin() // fresh physical geometry + backend ID
for (let step=1; step<=15 && activeId===segment.movementId; step++) {
  await delay100msOwnedBySegment()
  if (activeId!==segment.movementId) break
  const position = clampPhysicalPoint(interpolate(segment.start, target, step/15), segment.workArea, segment.outerSize)
  await petMoveStep(segment.movementId, position)
  // No replay on error; cancellation clears timer and backend ID.
}
// [修订: PLAN_DEFECT-R1.5] Rust on the pet UI thread; no lock crosses reentrant Win32 calls.
check_current_segment_and_record_expected(id, clamped_x, clamped_y)?;
// expected is recorded before the synchronous native call; its WM_MOVE classifies itself.
SetWindowPos(pet_hwnd, ..., clamped_x, clamped_y, ..., SWP_NOZORDER|SWP_NOSIZE|SWP_NOACTIVATE);
clear_expected_for(id);
// Native event handler: old segment events never cancel a new segment.
if (event.kind === 'move-owned' && event.movementId === activeId) updatePosition(event.position)
if (event.kind === 'move-external' && event.cancelledMovementId === activeId) cancelCurrentSegment()
if (event.kind === 'drag-exit' && event.dragId === currentDragId) beginStableFinish(event.dragId)
```

资源清理清单：DesktopPet timers（happy/autoRest/decision/notice/5sactiontimeout）、段100ms timer、window/DOM/media listeners、native moved/scale/snapshot/result/visibility unlisteners、pending read/load取消标志、pointer capture/状态；scene原S2 dispose。取消清理不因Promise正在飞漏掉后续listener：注册完成若disposed立即off；已发业务动作不自动撤回或重放，晚结果只匹配当前ID；`pet_move_cancel`失败也停止前端移动，root记录backend结果。主窗最小化不dispose bridge，主window reload/endOwner才隐藏并失效。

### 6.7 S3执行顺序、验证与回滚

#### 本轮修订说明
[修订: PLAN_DEFECT-R1.6] L1/L2验证增加native循环和自有通知分类，不拿纯状态测试代替Windows实测。impl需独立测试handler：有enter无exit按住停住不结束；exit但无pointerup结束匹配dragId；pointerup无exit不结束；旧exit/finish不结束新drag；安装0/NCDESTROY/context只释放一次；正常DefSubclassProc转发与锁不跨OS调用。movement验证自身15步owned不自取消、人工drag立即取消、旧owned/external通知不误停新段、负坐标完整物理位置。root必须在实际EXE观察按住停住、松手（含无前端pointerup）自然恢复、Esc取消、完整1.5秒短段、拖动立即中断段；缺native消息证据不得关闭L1/L2。

1. 落有限协议/后端state/caller与固定window（不先开显示）；门禁单测 → Rust test/check。2. main入口隔离、main初始化/发布/路由 → Web/Rust自证。3. DesktopPet快照/菜单/提示 → 动作结果/owner/revision单测。4. geometry/运动ID/拖动/取消 → 物理clamp单测及调用顺序。5. 接S2 PetFigure，桌面端App移除内嵌浮层，仅Web fallback保留；主设置显示伙伴发布偏好。每一步不发布“已原生验证”。

**impl-safe验证**：fresh npm test/build、Rust `cargo test`/`cargo check`、diffcheck；单测枚举/限字段、负坐标/混合scale的纯几何、ID取消/晚回结果、日期/token更换/重复/旧确认、StrictMode取消load不更新、listener失败不ready、owner旧publish/result/end拒绝、动作阻塞不换composer、pet无App/store依赖和精确ACL。Rust caller函数可抽纯label判定供单测，真实IPC负向调用由root承接；不能用pure测试冒充Tauri实际caller。记录`impl_report_s3_r1.md`命令全文/exit/实际失败、清理锚点。

**coordinator承接**：实际EXE双窗透明/切其他软件/最小化存活、不自动夺焦点；右下有限阻挡、菜单键盘；真拖动按住停住不自走、松手结束、负坐标/任务栏/DPI有设备才测；30fps/10fps行为与隐藏/减少动态释放；显式快记/待办打开且草稿阻塞保留、重复快速点击/5s结果超时/重载无重放；main/pet reload、监听/SQLite失败不发布旧摘要；真实每日提示藏/休息/显示/确认链；新增业务字段旧库前后比较。证据`verification.md`/target原生截图、进程路径、只读数据库diff。缺证据列未测，不称Windows体验或数据安全现场已验。

**作者体验**：模块均功能专属；App只传有限当前状态/业务回调，不整App拆重构；协议有限字面枚举，Rust不通用dispatch(string,payload)；主初始化尾仅防StrictMode异步代次，动作不持久队列，运动ID只在本段。**验收**：唯一main保存、有pet-only入口、每个字段/动作/owner/revision/token及故障路径可追溯、取消/清理齐全、原生目标交root。**回滚/停机**：设置收起伙伴即取消/隐藏，不影响业务；backend不可用时协议unready并隐藏，SVG只用于已可用pet窗口内模型失败，不能掩盖窗口故障。S3提交revert恢复单窗（保留S1旧正文和S2资源）不动DB；main reload失败不强行开放protocol。

### 6.8 原生启动保障：空白双窗 → 所选缓存完成 → 当前入口

#### 本轮修订说明
[修订: PLAN_DEFECT-R2.4] 消费整体实施审查R1 PLAN_DEFECT；本节是S3已有入口/窗口setup的最小收敛包（owner：一个bootstrap impl，禁止与S4构建并发写入口/target）。保护G3/N2/N3，不重做S1–S3功能、不增生产偏好/迁移平台。此前实际正式EXE的旧UI失败、旧库对比和缓存证据必须保留；新包未实测前仍REVISE。

#### 本轮修订说明
[修订: PLAN_DEFECT-R2.8] 按第三轮 Gate-2 意见补齐启动副作用边界：凭据迁移只能在 profile 清理成功且两业务窗启动 gate 解除后调用；main/pet 创建或 `desktop_pet::setup` 失败一律进入 Failed，禁止 log-only 后继续。此轮用户继续推进授权原话为：“继续吧，把问题处理解决干净，这两个问题都解决了”。

#### 本轮修订说明
[修订: PLAN_DEFECT-R2.9] 吸收第四轮 Gate-2 两个三元组并确定单一路径：profile 清理完成后两个WebView分别导航到当前入口；每个只执行最小 `main.tsx` bootstrap 并报告 fresh entry-ready；双方成功前 NativeBootstrap 维持 Pending、业务command拒绝，任一侧失败进入 Failed、广播安全错误且两侧都不动态加载业务组件。两窗导航的部分成功只承诺业务代码/副作用不会启动，不承诺已加载的入口bundle字节完全不执行。迁移由 main bootstrap 在双方ready后、动态导入App之前异步调用一次；`prepareAi()` 继续复用同一Rust串行/幂等导入。

#### 本轮修订说明
[修订: PLAN_DEFECT-R2.10] 吸收第五轮两项意见。双方握手成功后main与pet采用独立挂载门槛：main须等待唯一启动迁移成功或脱敏失败结果，再动态导入App/样式；pet通过双方Ready即可动态导入DesktopPet/样式并挂载，可与main迁移并行。Tauri静态入口不包含React、`react-dom/client`/`createRoot`、业务组件、store或业务样式；每窗仅在Ready后动态载入React并取得`StrictMode`/`createRoot`，再进入各自门槛。保留R2.9部分导航失败边界，入口bundle可已执行，但不得开启业务组件或副作用。

[修订: PLAN_DEFECT-R2.9] 第四轮报告三元组原文（1）：
> 具体不一致：方案要求异步 Ready 后再调用迁移，却只给出 run() 同步顺序片段，未给出从 async completion 到迁移函数的可执行调度边界。
> 对 lwplan 的影响：实现者必须自行决定状态/线程/触发入口，且有与 AI 首次调用竞态的可能，违反“无需再做架构决策”的低层计划要求。
> 建议恢复：指定一个确定的 post-Ready 调用路径及线程（例如通过受控 runtime worker 或现有 main command 入口），规定迁移最多触发一次、与 prepareAi() 串行/幂等；给出对应片段和测试口径。不要在 COM/UI callback 中同步读文件或调用 keyring。

[修订: PLAN_DEFECT-R2.9] 第四轮报告三元组原文（2）：
> 具体不一致：§6.8:398 的先 Ready/导航顺序与“任何失败下两业务 URL 均不加载、命令拒绝”验收无法同时保证。
> 对 lwplan 的影响：失败路径可能在切到 Failed 前运行 App 代码/业务命令，违背本轮安全启动目标与 R2.8 的 §9 入口。
> 建议恢复：明确定义导航阶段状态和命令许可点，并把双窗部分导航失败纳入失败注入。若无法保证两窗 URL 的原子提交，应调整承诺为可证明的安全副作用边界（例如失败时命令始终 fail-closed、不给业务数据/凭据/网络副作用），同步调整目标骨架、验收和 §7.1 报告；不能保留不可兑现的“任何业务 URL 均不加载”表述。任何调整需维持旧缓存脚本不能在清理前执行的核心目标。

[修订: PLAN_DEFECT-R2.9] 官方用法与版本核对：项目 `src-tauri/Cargo.lock` 锁定 `tauri 2.11.5`，`package-lock.json` 锁定 `@tauri-apps/api 2.11.1`。Tauri 官方[Calling Rust from the Frontend](https://v2.tauri.app/develop/calling-rust/)说明 async command 通过 async runtime task 执行，JS `invoke` 返回Promise；同页事件API说明 `listen` 返回异步取消句柄、事件是异步且无返回值。因此每窗用 `invoke` 提交entry-ready并等待其Promise由同一个状态owner返回Ready/Failed；仅失败安全错误使用 `Emitter::emit_to` 与预先注册的 `listen` 广播，避免用事件冒充有响应的握手。耗时文件/keyring迁移经 Tauri `async_runtime::spawn_blocking`，不在COM callback或UI线程同步执行。锁定版[tauri 2.11.5 async_runtime](https://docs.rs/tauri/2.11.5/tauri/async_runtime/fn.spawn_blocking.html)、[Emitter](https://docs.rs/tauri/2.11.5/tauri/trait.Emitter.html)和[PageLoadEvent](https://docs.rs/tauri/2.11.5/tauri/webview/enum.PageLoadEvent.html)确认可用；PageLoadEvent只有Started/Finished，加载错误用入口握手timeout确认为Failed。无新增依赖。失败listener须先注册再提交ready invoke，避免广播先于listener。

[修订: PLAN_DEFECT-R2.4] **事实与取舍**：root只读记录专用profile `C:/Users/ZXL/AppData/Local/com.zxl.qingjian/EBWebView/Default/Service Worker`有Database/CacheStorage/ScriptCache；注册log含 `http://tauri.localhost/`、sw.js/workbox URL，CacheStorage一个body命中旧“我的空间”文案。证明该origin有旧SW/cache，支持所选清理，尚不等于取得当时controller/响应来源。采用WebView2官方Profile2数据类型选择清理；不在可能根本没执行的新JS里承担升级，不删WebView目录、不ClearBrowsingDataAll、不换identifier/新profile。官方[ICoreWebView2Profile2](https://learn.microsoft.com/en-us/microsoft-edge/webview2/reference/win32/icorewebview2profile2?view=webview2-1.0.3719.77)和[browsing data kinds](https://learn.microsoft.com/en-us/microsoft-edge/webview2/reference/winrt/microsoft_web_webview2_core/corewebview2browsingdatakinds?view=webview2-winrt-1.0.3719.77)由root已实际读；安装binding也已实读。

[修订: PLAN_DEFECT-R2.4] **关键文件/接口及目标形态**：新增局部`src-tauri/src/native_bootstrap.rs`（安全双窗/异步清理/一次性状态）、`lib.rs::run.setup`及五业务command前门禁；`tauri.conf.json` main `create:false`且显式label main；`desktop_pet.rs::setup`保留现有builder尺寸/透明/原生install，只把初始URL变about:blank；`src/main.tsx::start`仅Web注册SW；`vite.config.ts::VitePWA` `injectRegister:false`（保留Web主动virtual:pwa-register与生成sw）。[修订: PLAN_DEFECT-R2.9] `index.html` 的 `#root` 初始内容为纯静态安全壳；Tauri入口静态依赖仅限识别window label、`invoke`/`listen`，App/DesktopPet/store/React和业务样式都在handshake后动态导入。关键理解锚点是lib.setup先阻止配置自动加载应用，然后bootstrap创建两个blank；目标形态是双窗先到当前入口的最小bootstrap，只有双方fresh-ready才释放业务挂载。保留全部pet桥接/动作/Win32helper、主数据初始化/保存、模型和legacy代码。

[修订: PLAN_DEFECT-R2.4] **安装版本/API**：直接Windows target依赖 `webview2-com = "=0.38.2"`、`windows = { version="=0.61.3", features=["Win32_Foundation"] }`（已有lock版本/Tauri同一代windows-core 0.61，不另用windows-sys的COM Interface）。COM接口来自`webview2_com::Microsoft::Web::WebView2::Win32::*`，callback来自`webview2_com::ClearBrowsingDataCompletedHandler`，cast trait为`windows::core::Interface`。已实读 `PlatformWebview.controller()`返回ICoreWebView2Controller、`CoreWebView2()`、`ICoreWebView2_13::Profile()`、`ICoreWebView2Profile2::ClearBrowsingData(datakinds,handler)`；callback宏把HRESULT转换成闭包参数 **windows::core::Result<()>**，不能假设收到原始HRESULT。mask为 `SERVICE_WORKERS(0x8000)|CACHE_STORAGE(0x10)|DISK_CACHE(0x100)=0x8110`，LOCAL_STORAGE(0x4)/IndexedDB/cookies等均排除。API按专用profile的数据类型清理，没有origin过滤，不能宣称只清某一个origin；不改data_directory、profile名、isPrivate或生产identifier，原草稿/偏好原origin保留。

[修订: PLAN_DEFECT-R2.4] **执行顺序与有限状态**：

1. main config `create:false`；setup注册`NativeBootstrapState::{Pending,Ready,Failed}`，默认Pending。克隆配置main，通过`WebviewWindowBuilder::from_config`保持标题、尺寸/min-size/decorations等；仅clone的url改`WebviewUrl::External("about:blank".parse()?)`后build。随后现有pet.setup改初始about:blank并创建/安装native helper。任一 main 创建、pet 创建或 `desktop_pet::setup`/原生helper安装错误都必须调用统一 `fail_bootstrap(error)` 并使 setup 返回错误；不得只 `eprintln!` 后返回 `Ok(())`。**缓存清理完成前不得导航到应用入口；清理完成后可导航两个已存在窗到最小bootstrap入口，但在双方fresh-ready前不得动态导入业务组件或开放业务commands。**窗口创建/setup在首个入口导航前失败时，两窗均不导航业务入口。**两窗都创建完才清理，不在COM callback里build新Webview**（避免WebView2创建同步等待死锁）。main可显示纯静态“正在准备晴笺…”安全页，pet隐藏；安全页用Core.NavigateToString固定HTML/CSP `default-src 'none'`，没有应用脚本、存储访问或SW注册。Native AltF4/窗口close生命周期仍可退出。
2. `main.with_webview`在窗口UI线程获取controller/Core13/Profile2，调用所选mask异步清理。main、pet目前用同专用默认profile；最简单实现**顺序各自清一次并等两次completion成功**，重复清同profile幂等，无需新增profile识别平台；不得在第一次成功就导航main后再清pet。如果impl实读/运行证明两controller ProfilePath/ProfileName相同，可仅一次，但报告必须保留同profile证据，否则执行两次。COM对象只在UI线程callback使用，不跨worker传递/阻塞等待；不调用`wait_for_async_operation`或mpsc.recv等待UI。
3. 所有clear API同步返回和每个completion Result都成功后仍保持Pending，不提前开放业务命令。按现有Tauri URL规则导航两个**已存在**blank窗到当前入口：`tauri::is_dev()`且config.devUrl存在则沿该URL（当前http://localhost:1420）；正式Windows当前useHttpsScheme=false，精确 `http://tauri.localhost/`，若配置true则同源https。main到base（Tauri App index.html特例为base），pet到base.join("index.html?pet=1")。已实读get_app_url/tauri_protocol_url与navigate(Url)，不调用private manager API。两窗同源和默认dataDir不变，SW/CacheStorage/DISK_CACHE清理不触碰LOCAL_STORAGE。
4. **双窗 fresh-entry handshake 是业务准入点**：`src/main.tsx` Tauri分支只运行最小bootstrap代码，不静态import React/App/DesktopPet/styles/store；在原生清理完成导航后，main与pet分别从当前bundle入口执行该小段。各自先注册 `listen('native-bootstrap-failed', ...)`，再以Tauri async `invoke('bootstrap_entry_ready')`提交actual label及当前URL；Rust command核对caller label、预期origin/入口和一次性报告，在同一个 `NativeBootstrapState` 中记录两方entry-ready。command在第一方到达时保持其Promise等待，不阻塞COM/UI线程；第二方到达后才将同一状态一次性切Ready，使两方command Promise完成。同步navigate错误、非预期URL、窗口关闭、任一侧未fresh-ready达到一次性watchdog超时均到终态Failed，并令等待中的handshake返回失败。Tauri `PageLoadEvent` 仅提供Started/Finished；成功还要求来自期望入口的fresh command handshake，加载失败/脚本未运行通过缺少握手超时收敛。失败时 `fail_bootstrap` 保持Failed、通过 `Emitter::emit_to` 广播不含敏感信息的 `native-bootstrap-failed { code }` 给两窗；仍可运行的一侧只显示静态安全壳，不导入/挂载业务组件。若第一窗已接受导航并fresh-ready、第二窗失败，第一窗只运行最小bootstrap并等待失败命令结果/显示安全壳，不能加载App或执行存储/业务副作用。该保证是业务代码与副作用不启动；两个独立WebView的导航非原子，不能声称已经开始加载的bundle字节完全未执行。安全错误event失败时壳仍维持默认静态状态；pet保持隐藏或安全空白。
5. 双窗握手成功后分为两个独立挂载门槛：main bootstrap在Ready后只调用一次`invoke('startup_ai_migration')`并等待成功或脱敏失败结果，之后才动态导入App/样式并挂载；pet在双方Ready后即可动态导入DesktopPet/样式并挂载，可与main迁移并行。迁移失败不撤销Ready、不阻止main或pet安全启动。迁移command校验main label与NativeBootstrap=Ready，经Tauri async command和`spawn_blocking`运行本地文件/credential-store操作；返回无密钥/原始错误的固定结果`{ configured, outcomeCode }`，失败仅映射`source_missing | source_invalid | key_unavailable | vault_unavailable | worker_failed`并只记录code。Rust串行锁包住同一导入函数；`prepareAi()`仍仅在用户打开AI panel后触发，复用同一锁/幂等判定，避免与startup并发重复。绝不在COM callback/UI线程读文件或访问keyring。
6. 五业务command `load_data/save_data/ai_configured/import_deepseek_config/ask_deepseek`和pet业务commands在 NativeBootstrap 非Ready时统一拒绝；唯一例外是按actual label校验的 `bootstrap_entry_ready` 及安全状态报告。pet静态capability只允许需要的event listen/unlisten，不向pet授予主业务插件API；Tauri capability是静态allowlist，具体启动阶段隔离由Rust命令Ready gate和不导入业务代码共同保证。main/Pet入口握手完成后再动态导入，Vite仍禁止自动注入SW register；Web PWA主动注册路径不变。启动前禁止任何DB/凭据/网络副作用。

[修订: PLAN_DEFECT-R2.4] 目标骨架（来源lib.setup/main/config/安装COM；用途：让review顺读“旧脚本前gate→完成→当前入口”）：

```rust
// main config create:false; both windows exist at about:blank before this call.
// Any main/pet creation or pet setup error calls fail_bootstrap and returns Err.
main.with_webview(move |platform| {
    let launch = || -> windows::core::Result<()> {
        let core = unsafe { platform.controller().CoreWebView2()? };
        let core13 = core.cast::<ICoreWebView2_13>()?;
        let profile2 = unsafe { core13.Profile()? }.cast::<ICoreWebView2Profile2>()?;
        let handler = ClearBrowsingDataCompletedHandler::create(Box::new(move |completion| {
            // completion: windows::core::Result<()>, not HRESULT.
            match completion {
                Ok(()) => clear_second_blank_profile_then_navigate_if_still_pending(),
                Err(error) => fail_without_application_navigation(error),
            }
            Ok(())
        }));
        unsafe { profile2.ClearBrowsingData(COREWEBVIEW2_BROWSING_DATA_KINDS(0x8110), &handler) }
    };
    if let Err(error) = launch() { fail_without_application_navigation(error); }
})?;
// Bootstrap remains Pending while these independently navigated windows
// report fresh execution of the minimal current entry.
#[tauri::command]
async fn bootstrap_entry_ready(window: WebviewWindow, app: AppHandle) -> BootstrapResult {
    if let Err(error) = require_expected_entry_and_label(window.label(), window.url()) {
        fail_bootstrap(&app, error.safe_code());
        return BootstrapResult::failed(error.safe_code());
    }
    // This async wait is released only when both labels reported; the first
    // caller stays Pending without blocking the WebView/COM/UI thread.
    app.state::<NativeBootstrap>().report_and_wait_until_both_ready(window.label()).await
}

// Every business command (including load_data/save_data/AI/pet) rejects
// unless both entry handshakes have changed this same state to Ready.
require_native_bootstrap_ready(&app)?;
```

```rust
#[tauri::command]
async fn startup_ai_migration(window: WebviewWindow, app: AppHandle) -> SafeMigrationOutcome {
    if let Err(error) = require_main_label_and_ready(window.label(), &app) {
        return SafeMigrationOutcome::failed(error.safe_code());
    }
    let gate = app.state::<NativeBootstrap>().migration_gate.clone();
    tauri::async_runtime::spawn_blocking(move || {
        gate.run_serialized(|| import_deepseek_config_inner().map_err(SafeMigrationCode::from))
    }).await.unwrap_or_else(|_| SafeMigrationOutcome::failed("worker_failed"))
}
```

```ts
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
// index.html starts with a static, non-React safe shell. No static React,
// createRoot, App/DesktopPet, store, or business stylesheet imports.
async function start() {
  const root = document.getElementById('root')!
  if (!('__TAURI_INTERNALS__' in window)) {
    const [{ StrictMode }, { createRoot }, { default: App }, { registerSW }] = await Promise.all([
      import('react'), import('react-dom/client'), import('./App'),
      import('virtual:pwa-register'), import('./styles.css')
    ])
    registerSW({ immediate: true })
    createRoot(root).render(<StrictMode><App /></StrictMode>)
    return
  }
  const label = getCurrentWindow().label
  document.body.dataset.bootstrap = 'pending' // static shell; no React/store/App imports
  const unlisten = await listen<SafeBootstrapFailure>('native-bootstrap-failed', failure => renderStaticSafeError(failure.code))
  const result = await invoke<BootstrapResult>('bootstrap_entry_ready', { label })
  unlisten()
  if (result.status === 'failed') { renderStaticSafeError(result.code); return }
  // Each window imports rendering dependencies only after both entry handshakes changed native state to Ready.
  const [{ StrictMode }, { createRoot }] = await Promise.all([import('react'), import('react-dom/client')])
  if (label === 'main') {
    let migration: SafeMigrationOutcome
    try {
      migration = await invoke<SafeMigrationOutcome>('startup_ai_migration') // one call, before App/styles import
    } catch {
      migration = { configured: false, outcomeCode: 'worker_failed' } // fixed safe fallback; never mark as migrated
    }
    if (migration.outcomeCode !== 'configured') console.info('AI migration:', migration.outcomeCode)
    const [{ default: App }] = await Promise.all([import('./App'), import('./styles.css')])
    createRoot(root).render(<StrictMode><App /></StrictMode>)
  } else {
    const [{ default: DesktopPet }] = await Promise.all([import('./DesktopPet'), import('./desktop-pet.css')])
    createRoot(root).render(<StrictMode><DesktopPet /></StrictMode>)
  }
}
void start()
```

[修订: PLAN_DEFECT-R2.4] **impl-safe验证/证据**：依赖/COM API fresh cargo check/test、npm test/build/diffcheck；有限bootstrap状态测试（两次completion才Ready、同步Err、cast失败、callbackErr、超时/close后晚成功不nav、旧脚本业务Ready前拒绝）；构建index无注册脚本自动注入，桌面main分支无register调用，普通Web仍注册；mask断言0x8110且和LOCAL_STORAGE/ALL_SITE/ALL_PROFILE零交集。记录`impl_report_bootstrap_r1.md`实际代码diff/清理范围/完整exit和任何失败；不把纯状态/编译称COM真实成功。**coordinator**承接受控旧缓存profile升级/真实UI及存储保持，见§7.1，证据缺失只能待原生验证。

[修订: PLAN_DEFECT-R2.8] **新增 impl-safe 闭环与证据**：纯状态/入口测试覆盖 main创建失败、pet创建失败、`desktop_pet::setup`/helper安装失败，三者均到Failed、任何业务URL导航次数为0且Ready命令拒绝；覆盖失败后迟到清理callback不改回Ready。迁移顺序测试断言 `import_deepseek_config_inner()` 只可能在profile清理成功、两窗创建成功并解除导航gate之后调用；失败结果保持显式失败、无成功标记、bootstrap仍Ready，且不清除/覆盖既有配置与凭据。把这些测试断言、源码diff、完整命令退出码/输出和失败记录写入 `impl_report_bootstrap_r1.md`。**coordinator**在§7.1承接实际隔离旧profile及真实用户数据保持；不以纯状态测试代替原生证据，缺证据仍待验证。

[修订: PLAN_DEFECT-R2.9] R2.8的“零入口导航”仅适用于main/pet创建或setup在首个入口导航前失败；双窗已开始独立导航后的部分失败按本轮fresh-entry/safe-shell/无业务副作用口径验收，允许成功侧最小bootstrap入口bundle已加载或执行。

[修订: PLAN_DEFECT-R2.9] **新增 impl-safe 闭环与证据**：测试状态顺序为`Pending(clear)`→两次导航已提交但仍Pending→main fresh handshake单到仍Pending→pet fresh handshake后Ready；也测试pet先到的对称顺序。测试main handshake成功后pet navigate同步失败、pet入口加载失败/未握手超时：切Failed、双窗收到safe error或保留默认安全壳，main不动态import App、不mount，pet不动态import DesktopPet，两侧业务commands均拒绝且DB/credential/network/localStorage副作用计数为0。显式断言当前承诺不覆盖入口bundle字节加载/执行，只覆盖业务bundle、组件和副作用未启动。迁移调用顺序测试：两个handshake Ready后main只发一次`startup_ai_migration`，完成/脱敏失败结果返回后才导入App与挂载；pet也必须等Ready。`startup_ai_migration`/`prepareAi`并发压力状态测试确认同一串行锁、导入成功最多一次vault写入，原错误被固定安全码映射，日志不含API key/原始错误。记录测试计数器、事件payload、顺序、完整命令exit/output及失败于`impl_report_bootstrap_r1.md`；真实profile与用户数据保持仍由root按§7.1承接。缺失任一项不放行。

[修订: PLAN_DEFECT-R2.4] **作者体验/失败降级/回滚**：小native_bootstrap只负责本次安全启动，固定三个状态和一个所选mask；不造版本迁移registry、事件总线、通用queue或profile设置。原生注册停用在既有入口直接可读；保留已实施功能。独立bootstrap提交可revert代码，但不得为了运行旧包自动恢复已清SW/cache或降级写库；清理失败保持安全页，不删localStorage/SQLite，不恢复/删除用户新增记录。当前旧程序已正常AltF4退出0；root前后备份显示旧3条业务字段保持、position整体+1和额外1条新记录，新增可能来自用户，必须全部保留，不能称整库字节完全相同或擅自还原。

## 7. S4：0.9.0同源验证、文档和实际EXE交付

#### 本轮修订说明
[修订: PLAN_DEFECT-R2.5] 保留以下已实施交付步骤与历史证据；现有0.9.0包身份虽正确但原生旧UI失败，不能当最终制品。§6.8落地后按§7.1重新同源构建、旧缓存升级和真实旧库/草稿验证，不换正式identifier、不擅自恢复库。

**目标/映射**：G3及G1/G2最终实物，N3；owner root协调者承接Windows/真实库，impl仅版本/构建/文档自证。关键文件`package.json/package-lock.json/src-tauri/Cargo.toml/Cargo.lock/tauri.conf.json`五项version；README/CHANGELOG/docs/Project.Progress/Pet.Wardrobe/Release.Testing、新`docs/Release.Verification.0.9.0.md`和本目录verification/README；旧`docs/current/note-embedded-pet/README.md`添加当前产品目标已纠正（保留旧证据）。Reviewer先看五version与交付身份表，目标结构是同来源的个人私有制品、精确进程路径、原生证据及未测清单。

步骤：

1. S1/S2/S3独立实施审查PASS且root承接Web编辑回归后，五元数据最终均0.9.0（Cargo.lock仅qingjian package版本，不重解无关依赖）；保留已有0.8.1修改来源，变更记录写纠正用途/精简/独立桌宠，不新增版本小功能。无私有资源公开build及5资产个人build均保留证据。
2. impl fresh测试/build/Rust checks及版本一致性后，个人`npm run tauri build`（或package既有desktop:build脚本，先实读script使用现成入口）生成EXE/MSI/NSIS；Windows命令须记录完整exit输出及失败，不拿早先build作本轮证据。将明确新输出复制到`src-tauri/target/deliveries/0.9.0-release/`，保留0.8.1及D盘旧安装，manifest记录源码commit/dirty差异、5模型refined来源/hash、EXE/MSI/NSIS精确路径/大小/SHA/FileVersion/ProductVersion、个人不可公开资源说明。不开新发布平台。
3. root先取真实数据库只读备份（SQLite backup或关闭后连同WAL安全副本，不只拷活动db漏WAL），记录identifier路径/表结构和旧记录各字段+position。常规视觉测试优先隔离数据；真实旧库只在授权范围做既有记录只读核验/新建可识别测试项并移回收站，禁止清全库/导入覆盖。
4. 精确新EXE启动，启动前查正在运行qingjian进程路径，旧实例按用户显式关闭或既有可见操作正常退出；**不覆盖运行旧文件、不靠快捷方式**。launch显式完整路径，后台启动helper按Hidden；UI app本身为用户观看可见。随后核查Process.ExecutablePath确实0.9.0交付路径、文件version/hash匹配manifest。若Tauri单例/旧实例导致旧窗，先识别并正常关闭再新启动；不能只开一下就称已更新。
5. root跑S1/S3原生清单并看S2五角色实际3D、截图标题/滚动/精简首屏/桌面最小化后的pet、多视角候选对比。确认main关闭即整个进程退出，不留隐藏pet。实测后数据库旧字段/顺序与before对比，排除明确测试项，无原因变化为阻断，不提交发布。混合DPI/多屏/触屏/屏幕读取能力不足列未测。
6. 文档同步当前已实现事实和验证责任；verification明确最初正文方向误用、前次误开旧EXE/用户Esc中断、本轮每个看到过的失败及修复/再验证，不抹去历史。private artifact截图保target，不上传模型/包。rootfresh gate后分逻辑commit，英文消息建议S1 `refactor(workspace): simplify navigation and retire embedded pets`，S2 `feat(pets): use refined local models in shared renderer`，S3 `feat(desktop): add independent local pet companion`，S4 `chore(release): prepare verified 0.9.0 desktop delivery`；推前`git log --oneline origin/main..HEAD`核对全部范围，普通push已有授权，禁止force/重写历史。给用户精确0.9.0EXE链接和真实效果，造型待其判断。

**验证分层/证据约束**：impl fresh自动命令和同源manifest写`impl_report_s4_r1.md`；root actual进程/版本/SHA、UI、数据库前后比较写`verification.md`和Release.Verification.0.9.0；reviewer独立检查代码与报告但不代替原生。任何native缺证据仅候选包/未测，不写“已修好标题/可以交付/更新完成”。生成物不git add，git status/hash检查确认四模型不入Git。

**作者体验**：文档分当前事实/历史记录，不复制大段未来计划到README当前能力；版本只五既有位置，不新建发布配置框架。**验收**：五0.9.0身份一致、已启动确为新路径、截图目标与双窗/数据证据、私有来源隔离清楚。**回滚**：未覆盖旧安装，可正常关闭新进程后启动旧版本进行只读观察；旧EXE降级写入限制仍遵守，不能拿旧版写回新库；必要用安全备份恢复须另经明确授权，禁止自动回滚用户数据。**依赖**：S1/S2/S3审核及root真实环境资源，无原生能力即待handoff不是默认PASS。片段以release步骤/命令锚点已足够，版本更新的五字段和值明确无需额外实现代码。

### 7.1 旧缓存升级实证与新制品身份闭环

#### 本轮修订说明
[修订: PLAN_DEFECT-R2.5] 本节为S4已有验证/交付的增补任务，owner root（真实profile/原生UI/数据），impl负责安全bootstrap构建与自证；不能用源码hash或Web截图覆盖已观察的旧UI失败。

[修订: PLAN_DEFECT-R2.8] 新增证据必须能追溯到 §6.8 的两项启动闭环：记录凭据迁移调用实际发生于完全Ready之后及迁移失败的明确结果/无成功标记/原内容保留；记录 main/pet/setup在首个入口导航前创建失败时终态Failed、没有入口URL加载。此处为R2.8历史场景；R2.9另要求实测main已fresh-ready而pet失败时的最小入口执行与零业务副作用。实现层纯状态测试由impl交付，真实双窗导航与原用户profile数据证据由root承接。

#### 本轮修订说明
[修订: PLAN_DEFECT-R2.9] 将成功条件改为两窗当前入口 fresh-ready handshake，双窗导航不再按原子操作验收；补入隔离WebView的 main-ready/pet-failed 场景，验证业务模块未导入、命令未调用且用户数据/凭据/业务网络无副作用。记录允许入口bootstrap bundle已开始加载的边界，并分开迁移顺序、脱敏结果与实际数据证据。

#### 本轮修订说明
[修订: PLAN_DEFECT-R2.10] 将“双方Ready后才挂载”细化为独立门槛：pet可在main启动迁移pending时导入/挂载；main等待成功或脱敏失败结果后才导入App/样式。增加纯状态时序、隔离WebView module import sentinel，以及构建module graph/chunk证据，证明静态入口不含React/rendering runtime/业务模块/store/styles，且动态chunk仅在对应门槛后请求。保留R2.9部分导航失败时入口bundle可能已执行的边界。

[修订: PLAN_DEFECT-R2.5] **先取证、后受控验证、再正式启动**：

1. root保留已正常关闭的真实专用profile SW注册metadata/旧bundle body只读副本和localStorage LevelDB（不移动/删除用户目录）；真实数据库前/后备份已保留，记录旧3条完整业务字段、position差异和新增1条，继续保留这条新增记录。只读SDK/DevTools或cache文件核查可补controller/注册/缓存数量；尚未取得controller时写“旧注册及bundle缓存已确认、当时controller未取证”，不夸大根因排除。
2. 先用**同源码同0.9.0但临时验证identifier覆盖**的no-bundle候选EXE，专用隔离profile/fixture：准备有效旧SW注册、可响应旧index/旧bundle的CacheStorage、diskcache；同时写可辨草稿和theme/装扮/伙伴显示/动态偏好及SQLite既有note/todo账目字段。旧缓存bundle用无敏感sentinel证明若被执行将留下“old-entry-executed”；测试fixture不能成为生产源码/配置。新native启动验证blank期没有业务load/save、mask清理callback先于两App导航、新三导航/当前标题和实际pet、旧执行sentinel未产生、current `navigator.serviceWorker.controller===null`且注册列表空、旧缓存响应不再命中；读取localStorage键和值保持（哈希比对+实际草稿回填/偏好显示），SQLite旧业务字段/排序不因cache清理变化。任何旧脚本先执行、宽清掉草稿、COM失败却载App为阻断。root无法准备/控制旧profile则证据缺口，不称安全升级已通过。
3. 在隔离profile/测试专用failure harness注入“main导航与fresh handshake成功、pet导航同步失败或pet页面未能fresh-ready”：验证原生最终Failed并向双窗广播固定safe error；main保持静态安全壳，App/desktopPet/store动态import sentinel均未触发；`load_data/save_data/ai_configured/import_deepseek_config/startup_ai_migration/ask_deepseek`及pet业务commands计数为0，localStorage getter/业务读写、SQLite、credential-vault、AI业务网络计数均为0，用户fixture字段/草稿前后相同。静态旧入口bootstrap自身的脚本加载不算业务副作用，且不声称入口bundle字节未下载/未执行。另实测接口不支持/callback错误/timeout/关闭后迟到回调至少一条路径仍fail-closed、不清本地业务值；纯状态测试覆盖其余组合，未做真实故障注入的组合明确未测，不要求在真实用户profile制造COM失败。
4. 隔离EXE不能当正式身份凭证；关闭隔离程序，**按正式com.zxl.qingjian重新构建**EXE/NSIS/MSI，重算当前全部SourceInputs/5模型/制品hash和0.9.0版本，替换交付目录候选manifest但保留上轮失败制品/证据副本。启动前核process已停，精确新路径/实际process.FileVersion/SHA确认；预设真实新启动仅只读用户业务/UI/草稿查看、不新增/完成/删待办、不消耗用户每日提醒键。正式App正常加载保存是既有业务行为，root立即比对库记录所有旧/新增字段及position，而不是声称只读操作必然绝无保存。
5. 正式EXE真实同profile升级看当前三导航/连续标题/细滚动和独立透明pet；主窗最小化、切其他软件、拖动自然结束、完整短距活动、显示/收起及五模型按已有S3清单，main关闭两窗进程退出。真实localStorage草稿/主题/外观/显示偏好与迁移前保持；不把Web源或隔离identifier证据冒充正式profile。提醒/业务动作修改主要在隔离fixture完成，正式只读核查补身份/真实用户数据保持。cache清理会删除应用缓存但不等于清业务库，DOM/SQLite逐字段证据各自独立。
6. `verification.md`与Release.Verification.0.9.0加入所选mask、API实际成功结果/线程时序、旧缓存响应及新入口、before/after草稿/偏好/库字段、正式进程身份、隔离包身份边界、fresh-entry双handshake及状态序列、启动迁移invoke次数/与App动态import先后、同锁并发结果、脱敏错误码/log检查、main成功/pet失败fixture的模块import与全部业务副作用计数/数据前后、双窗/setup失败广播和安全壳证据、全部失败/未测。旧UI失败不能被改文案抹去；当前整体Review(Impl) REVISE待bootstrap独立LW Gate→实现/自证→原生承接→整体复审闭合。未闭合不发布commit/push，不拿旧正式package继续交付。

[修订: PLAN_DEFECT-R2.9] **历史验收边界（挂载先后由R2.10修订）**：成功必须是profile清理完整、两窗从当前入口各自 fresh-ready，main在App动态导入前完成一次启动迁移命令（失败也返回脱敏结果并继续），随后两边才挂载业务组件。双窗部分导航失败时，目标保证是Failed/业务命令拒绝/静态安全壳/无App或store导入和用户数据、凭据、业务网络副作用；不把“已开始加载的bootstrap bundle字节完全未执行”作为条件。隔离main-ready/pet-failed场景的实际webview事件、导入sentinel、命令计数、localStorage/SQLite/credential与网络计数齐备才支持此项；否则记证据缺口。

[修订: PLAN_DEFECT-R2.10] **独立挂载与动态chunk证据**：纯状态测试在双方Ready后暂停`startup_ai_migration` Promise，断言pet分支可动态导入React/`react-dom/client`及DesktopPet/样式并挂载，而main App/样式import sentinel仍为0；再分别释放成功和脱敏失败结果，断言main只在结果返回后导入App/样式并挂载，失败不会阻止main或pet启动。测试迁移invoke次数恰为1，并覆盖与`prepareAi()`并发时同一Rust串行/幂等路径。隔离WebView测试记录两侧握手、chunk请求、模块import sentinel及业务副作用计数；另检查Vite构建module graph/chunk清单，Tauri静态入口图不得包含React、`react-dom/client`/`createRoot`、App、DesktopPet、store或业务样式，未到对应门槛时业务chunk/import sentinel均为0。保存完整顺序、计数、依赖图/chunk清单、命令exit/output与失败；缺任一证据记未验证。部分导航失败仍按R2.9只保证业务代码/副作用未启动，不声称入口bundle字节未加载或执行。

#### 本轮修订说明
[修订: PLAN_DEFECT-R2.10] **当前验收边界**：两窗从当前入口各自fresh-ready后进入独立门槛。pet通过双方Ready后可先于main迁移完成而导入/挂载；main仅在`startup_ai_migration`返回成功或脱敏失败结果后导入App/样式并挂载。迁移失败仍继续双方安全启动。隔离测试提供“迁移保持pending时pet已挂载且App sentinel为0”及“成功/脱敏失败返回后App才挂载”的顺序证据；构建module graph/chunk与import sentinels证明Tauri静态入口没有React/rendering runtime/业务组件/store/styles，并证明各动态chunk只在对应门槛后请求。任何一项缺失记证据缺口。R2.9非原子导航边界继续有效：失败可能已有最小入口bundle执行，只要求失败后不导入业务组件、不开放命令、不产生本地/凭据/网络业务副作用。

[修订: PLAN_DEFECT-R2.5] **验收/回滚/作者体验**：升到当前入口且受控旧cache没有先行业务副作用；LOCAL_STORAGE排除并实测草稿/偏好保持；真实旧库及新增记录保留；正式包hash不同于失败候选且原生证据同来源。只有上述证据支持G3，缺一项保持未验/阻断。回滚仅保留制品/证据和停止新程序，不自动回写旧库、删新增note或恢复SW；用户业务数据恢复需另有明确授权。文档只列当前实际结果，不造新用户清缓存开关/迁移设置页。

## 8. 风险、事件对齐与回归范围

#### 本轮修订说明
[修订: PLAN_DEFECT-R1.7] 独立LW首轮REVISE的L1/L2按具体实现修补，不新增用户决策。新原生风险通过所属UI线程/固定pet HWND/唯一释放/真实EXE验证承接，不扩全局监听。

[修订: PLAN_DEFECT-R2.6] 整体实施R1真实旧UI触发PLAN_DEFECT；新增原生profile缓存升级风险由§6.8/7.1收敛。已实施S1–S4正文全部保留，没有删除其支撑或重新定义功能目标。NativeBootstrap API同步成功不等completion成功；COM/UI线程不得阻塞、不在callback创建webview；old main actuallabel不足以证明当前bundle，因此安全空白与Ready gate先于业务执行。新调查wildcard路径rg两次exit2，已用安装目录实际路径补读接口/宏/版本/URL，失败不作依据。root新的真实库3旧字段保持、新1条及位置offset事实不包装全库完全无变更。阶段切换留本节/后续bootstrap报告，无新增需用户许可的问题。

U1模型满意度由五角色候选实物关闭，用户未看不能认定定稿；U2透明/焦点/原生拖动/任务栏/DPI实际EXE关闭；U3legacy不迁移、自动往返+真实编辑关闭；U4唯一owner/caller、重载/结果/确认代码及原生库比较关闭；U5private ignore/同源manifest/ProcessPath关闭；U6只按实际clip呈现。缺设备的多屏/混合DPI只能列未测，不扩当前产品范围造平台。

[修订: PLAN_DEFECT-R1.7] 追加事实风险：安装core:window定位权限无目标scope，采用固定pet Rust wrappers；L1纯稳定/按键0不能可靠结束拖动，改本窗WM_EXITSIZEMOVE；L2自身set_position也产生Moved，改UI线程同步SetWindowPos和单个expected位置分类，raw异步通知不取消。安装源码Tao0.35.3确有原生enter/exit路径，但是否最终EXE收到仍由root实测。新依赖feature实读为Foundation/Shell/WindowsAndMessaging；不增全局hook。首次读尚未生成review文件返回不存在，随后报告生成后已完整读取并开始修订；一次wildcard路径rg失败、一次apply_patch匹配失败已修补，未写其他文件，失败不作API/完成证据。

事件触发留痕：新假设/新风险/阶段切换记录本节和对应impl_report；当前LW→Review(LW)由root复核本轮有限wrapper/拖动细化与HL一致。发现上游契约/字段镜像漂移先标记并交root收口，不静默改shared技能。已知readiness章节计数漂移依README按canonical五类存在性核查，不凑章节。

批量提问机制：本轮未触发用户新问题，因为用户目标、开发授权/独立桌面与HL设计已唯一；原生无法操作属于证据缺口交root，不空手重问已授权选择。如发现范围/验收/回滚口径不唯一，按P0阻塞→P1风险→P2优化一次列出：`【DELEGATE_QUESTION】问题/影响阶段/2–4选项(推荐+权衡)/请一次回复Q1=A...`；需新调研由`【DELEGATE_ACTION】supplemental-research/主题/文件/期望回传`交root，禁止递归subagent。问题建模矛盾则PROBLEM_MODEL_ALERT，不继续扩错方向。

回归范围限本次影响：编辑器/草稿/旧token/搜索文本、导航焦点/窄屏/深色/滚动、排序抓手基本交互、伙伴外观/模型/资源释放、main保存/日期提醒/业务入口/窗口生命；SQLite迁移算法/年轮图几何/AI模型参数无改动不重复全量专项。每个首次实际失败记录，修复后只扩大到对应具体风险的验证。

## 9. Gate-1 自检与 Gate-2 复核入口

#### 本轮修订说明
[修订: PLAN_DEFECT-R1.8] PLAN_DEFECT自检追加：修订章节均含本轮修订说明与标签；未实施S3只替换L1/L2失效片段，其他工作包/owner/提醒已保留；没有已实施代码支撑需删除或升级。独立Gate-2首轮FAIL保留，修订仅可提交第二轮Review(LW)，不宣称阻断已实测关闭。

[修订: PLAN_DEFECT-R2.7] 本轮Gate-1追加：§2/3/6.8/7.1/8/9均标注修订说明与R2标签；已实施S1–S4及失败证据未删；收敛范围只native入口/PWA边界/异步所选清理/业务Ready门禁与再交付，依赖/API/callback/URL已实读。新增包目标锁/反目标、接口片段、责任分层、作者体验、证据不足/回滚均落盘。Gate-2独立LW复核必须核查“blank双窗都先建→清全部必要profile成功→同origin导航”、精确mask无localStorage、latecallback不恢复失败、不在COMcallback build、真实旧cache/数据/正式身份验收；之后才允许bootstrap impl，原整体Review(Impl)仍REVISE到根实际闭环，不把本计划自检当成功交付。

[修订: PLAN_DEFECT-R2.8] Gate-1增补自检：本轮仅修订§3/§6.8/§7.1/§9，各节均有本轮修订说明且新增/改写内容带R2.8标签；S1–S4既有支撑与历史失败均保留。用户本轮原话“继续吧，把问题处理解决干净，这两个问题都解决了”记录为继续推进授权语境。§6.8明确凭据迁移后置及失败不影响安全启动/不伪报成功/保留既有内容，明确main/pet/setup创建失败进入Failed且不加载任何业务URL；§3有事实映射，§7.1列出对应实现与验证证据。自检不等于Gate-2通过，也不允许直接进入impl。

[修订: PLAN_DEFECT-R2.9] Gate-1增补自检：本轮仍仅改§3/§6.8/§7.1/§9并逐节保留修订说明；R2.9新增段均带标签，已实施S1–S4和R2.8历史结论均未删除。§3映射真实AI调用链、async调度及非原子导航；§6.8给出双entry handshake→唯一Ready准入、failed安全广播、主窗启动迁移invoke→App动态导入的代码骨架及脱敏/串行/测试；§7.1明确main-ready/pet-failed隔离实测与零业务副作用证据；Gate-2仅标待独立复核，不声称PASS。

#### 本轮修订说明
[修订: PLAN_DEFECT-R2.10] Gate-1自检补充：本轮仅修订§3/§6.8/§7.1/§9，四节均有说明且R2.10新增内容带标签；历史支撑与R2.9非原子导航边界保留。§3映射独立挂载门槛和静态依赖图证据；§6.8骨架明确双方Ready后动态载入React/`react-dom/client`并提取`StrictMode`/`createRoot`，main等待迁移结果再导入App，pet可并行挂载；§7.1列纯状态时序、隔离WebView sentinel和构建chunk证据；Gate-2入口待独立复核，本自检不判Gate-2 PASS。

| Required Set / Gate-1项 | 本文落点 | 结论边界 |
| --- | --- | --- |
| T1全部13项及T2输入输出/handler/测试分层，T3接口/兼容/降级 | §1目标反目标不影响；§4–7每包文件/步骤/验收/rollback/依赖；§6矩阵/字段/状态/权限 | 内容存在且可执行；不代表实现通过 |
| 目标锁/反目标逐包映射完成 | S1 G2/G3/N1/N2；S2 G1/G3/N1/N3；S3 G1/G3/N1/N2/N3；S4G3及最终G1/G2/N3 | 未遗漏独立桌面、视觉收敛和旧数据 |
| 验证责任分层已落盘 | 每包impl-safe / root真实 / reviewer职责 | impl不能用命令关闭native/人工作用 |
| 证据产物/责任/不足约束三元组 | 每包impl_report，verification/target/native/旧库，未测/候选边界 | 不允许缺证据默认PASS |
| 作者体验与声明可读性 | 每包作者体验；有限字段与专属模块 | 不造通用总线/平台/配置项 |
| 核心链路/事实映射/片段闭环充分性 | §2/3、§4legacy/§5resolver/§6协议初始化提醒运动 | reviewer可顺读入口→profile清理→双窗入口握手→单一Ready→主窗迁移→App/pet挂载→失败证据；§3映射cache、prepareAi真实调用链与非原子导航 |
| 大规模删除附加名单/保留/调用链/副作用 | §4 | ≥50行专用删除已明确闭合 |
| 门禁执行人/时机/失败回退、风险/提问机制 | 本节/§8 | Gate-1完成后仅进入独立LW审查 |

[修订: PLAN_DEFECT-R2.8] Gate-2 独立复核入口补充：review_plan主检与root复核需逐读 §3 两条新增事实映射及 §6.8 顺序/代码骨架/测试闭环，确认 `import_deepseek_config_inner()` 仅在profile清理成功、双窗创建成功且导航gate解除后执行；迁移错误明确暴露、没有成功标记、不撤销Ready、不删除/覆盖既有配置或凭据。确认 `desktop_pet::setup` 与main/pet/bootstrap任一创建错误均传播到Failed，`run().setup` 不存在 log-only + `Ok(())` 继续路径。R2.8此处的“任何失败下两业务URL均不加载”属于历史口径，双窗部分导航失败已由R2.9 supersede。对创建/setup在入口导航前失败，检查无入口导航；对R2.9部分导航失败，检查失败时可已有最小bootstrap入口执行，但不导入App/DesktopPet/store、不调用业务命令且无用户数据/凭据/业务网络副作用；检查纯状态测试覆盖命令拒绝和迟到callback。还须复核 §7.1 对 impl 与 root 的证据责任/缺证据结论边界。任何缺项回 LW 修订；Gate-2 PASS 前不得进入bootstrap impl。

[修订: PLAN_DEFECT-R2.9] Gate-2 独立复核入口：复核官方Tauri 2 async command/event API与锁定2.11.5/2.11.1可用性；沿 `lib.rs::run/setup`→两窗blank/profile completion→独立navigate→`src/main.tsx`最小入口→两次 `bootstrap_entry_ready` await→Ready/Failed广播→main单次 `startup_ai_migration`→`import('./App')` / mount 顺读目标骨架。确认Ready仅在双方fresh handshake后、之前所有业务commands都在统一state gate拒绝；两窗导航部分成功时只承诺未导入App/DesktopPet/store、无SQLite/localStorage/credential/业务网络副作用，明示入口bundle可能已开始加载。核对main/pet listener先注册、失败/超时/窗口关闭传播与safe shell；核对migration worker线程、固定脱敏结果、日志不泄露敏感内容、startup恰一次及 `prepareAi()` 复用串行/幂等导入；复核纯状态证据与§7.1真实隔离WebView的main-ready/pet-failed实测分层。任一顺序、责任或结论边界不清回LW修订；Gate-2 PASS前不得进入bootstrap impl，也不得把本次Gate-1自检当作Gate-2结论。

[修订: PLAN_DEFECT-R2.10] Gate-2复核入口补充：沿目标TS骨架与Vite构建module graph/chunks，确认Tauri静态入口不含React、`react-dom/client`/`createRoot`、App、DesktopPet、业务store或业务样式；双方handshake Ready后各自动态import React与`react-dom/client`并取得`StrictMode`/`createRoot`。main随后且仅一次await `startup_ai_migration`，成功或脱敏失败结果返回后才请求App/样式chunk并挂载；pet通过双方Ready即可请求DesktopPet/样式chunk并挂载，可与main迁移并行。核对纯状态与隔离WebView顺序：迁移未返回时pet sentinel可触发而App sentinel为0；结果返回后App才导入并挂载；失败导航侧不得加载业务chunk或产生副作用。入口bundle已开始加载/执行仍按R2.9边界审查。依赖图、chunk/import sentinel或独立门槛时序证据缺失均回LW，不推定PASS。

Gate-1：lwplan agent逐项存在性自检，本计划上述Required Set已落盘，可交 **Review(LW)**，不自行宣布可impl。Gate-2：独立review_plan主检+root复核，须顺读§2主链、§3事实表，再逐包核验关键文件/函数/目标结构/片段触发与闭环、分层证据及作者体验；重点查StrictMode旧load、actualcaller/ACL、token资格→实际展示→记键、ID结果超时、原生drag释放/晚move、legacy删除名单、私有模型/精确0.9.0身份。任一存在性缺失或HL偏离返回LW修订回环；口径不唯一先委托提问。**Gate-2 PASS才允许impl**，新代码后的独立实施审查与rootfresh完成前验证仍另需执行。

## 跨功能事实（待确认）

### 架构与约束
- [2026-10-07] Tauri capability匹配调用方窗口并不天然限制窗口API的目标label；安装版allow-set-position无预配置scope，本次用actualcaller和固定对象包装保持最小权限。

### 经验与教训
- [2026-10-07] 原生startDragging返回不等于松手，单纯位置稳定也不能区分“按住停住”；桌面自主活动恢复需要真实释放信号或保守保持人工优先。
- [修订: PLAN_DEFECT-R1.7] [2026-10-07] 安装Tao的自主set_outer_position使用异步Windows定位；自身Moved和人工Moved须明确分类，不能把所有位置通知当自主段取消信号。
