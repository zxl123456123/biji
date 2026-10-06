# 柔和交互与记录工作台：低层实施方案

日期：2026-10-03。规划路径，任务分型 **T3**。输入权威：[clarifications.md完整实现基线](clarifications.md)、[readiness r2](review_notes_readiness_2.md)（PASS、allow_enter_lwplan=yes）。本方案没有应用改动，Gate-2前不得实施。

## 1. 范围与对齐

- **G1**：主按钮按压、明确抓手轻拉及释放回弹，记录更早进入首屏，浅深/窄屏可用。
- **G2**：全部有效记录的可搜索精确标签、UUID快速打开、键盘编辑及图定位。
- **G3**：Motion14.0.0成熟能力、小范围transform/opacity、取消与输入边界；独立证据及0.5.1体验EXE。
- **反目标A1**：不从全卡/正文/动作启动拖动，不抢选区/IME/页面滚动，不重排或每帧业务保存。**A2**：不加新UI/图引擎、3D/云模型、物理或pointer状态机，不改纯文本/SQLite/构图算法。**A3**：不把源码或Node结果说成原生/GPU手感证明，不回退未知工作或混合发布。
- 不影响项：账本和AI发送边界、现有存储/回收站/草稿、精确标签与组合筛选、D3 ownership、邻居高亮/LOD、30fps/像素预算。旧总体MVP未验收仍保留。
- 根代理本轮已在5175隔离UI通过编辑器形成24有效/1回收站、18标签并复现仅10标签选项；初始7条时1280×720首卡top479.5。65条JSON尚未导入（chooser超时）；这些是改前证据，不是新功能验证。

## 2. 核心链路总览（先主链、后工作包）

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.1–R1.3] 按 [第1轮方案评审R1–R3](review_notes_lwplan_1.md) 原地补齐长期D3 owner的最新状态、编辑RAF执行点复核，以及详情定位的单一pending来源。没有应用已落地，未删除已实施支撑文本；范围、Motion取舍、既有业务与证据分层不变。

现状：App原生按钮/搜索 → NotesView button卡片或NoteComposer/Modal → React业务状态 → 原存储effect；关联图另由useNoteGraph → Worker/模型 → D3 Canvas副本/镜头。UI事件与保存耦合点不由动效层接管。

目标主链：App计算动效许可 → 单一LazyMotion/轻量m边界 → 主按钮按压与卡片独立抓手 → MotionValue/官方弹簧归位；业务button仍用原onClick。搜索入口 → QuickOpen当前有效笔记/UUID → 编辑交接或App清阻挡筛选 → token定位请求 → NoteGraph在模型及尺寸可用时选择+居中一次 → 回报最新token。标签选择 → 全标签检索 → 原selectTag精确筛选。

分层：只增加 `SoftInteraction.tsx`（成熟动效适配）、`QuickOpen.tsx`、`TagPicker.tsx` 与 `recordNavigation.ts`（小量纯选择器）；NotesView内卡片职责不另造组件框架。图相机数学留在graphGeometry，镜头应用留在NoteGraph。UI瞬时状态不持久化。明确不改store/desktop/Rust业务/Worker/关系算法，因为本轮目标与这些层无协议迁移关系。

### research事实映射

| 已知事实/U | 实现锚点 | 验证入口、归属和口径 |
| --- | --- | --- |
| U1：domAnimation没有drag，cancel跳过onDragEnd；官网包体非本项目测量 | S1 `SoftInteraction`/确切包源码；同步domMax+m | impl安装包类型/源码/LICENSE与build；root实际按块gzip，不能据peer认定交互通过 |
| U2/U3：正文button、CSS hover transform、抓手/滚动竞争 | S2 `NoteCard`与styles有效后段规则 | impl组件结构/有界约束/取消合同；root真实轻点/拖动/正文/动作/滚动，未能输入则未测 |
| U4：暂停/reduce/hidden/composer策略不自动取消JS | S1 App许可、owned cancel/reset适配 | impl取消跳过end、动画stop+jump、禁止business回调的受控合同；root途中切状态 |
| U5：全标签截断、Modal锁滚动/还焦点、IME保护 | S3 selector/TagPicker/QuickOpen/App keys | impl >10标签、重复UUID标题、trash/排序；root键盘/IME/Tab/关闭/编辑保存 |
| U6：图只有选择，无UUID镜头；ready与尺寸不同步 | S4定位token、controls.locate、ResizeObserver/reconcile | impl相机/最新请求/异步ready/缺失合同；root实际等待Worker后定位，原D3回归 |
| U7：原41测试/build不是新功能；无真实drag/GPU能力证据 | S5验证和0.5.1发布记录 | root独立当前测试/build、UI/制品；native/GPU缺证据保留，不抹除既有失败 |

### 跨模块接口矩阵与瞬时状态

| 来源 → 接收 | 输入/输出 | 边界 |
| --- | --- | --- |
| App → SoftInteraction/NotesView | `allowed:boolean` | ambientEnabled && !reducedMotion && pageVisible && !composer；quickOpen/tag浮层期间也禁止后台卡片装饰拖动；业务动作保持 |
| recordNavigation → App/TagPicker/QuickOpen | 全量唯一tags；有效匹配Note[] | 精确标签值大小写保留；查询trim/大小写不敏感；先全量查再限显示，不改源数组 |
| QuickOpen → App | `(id:string, action:'edit'|'graph')` | [修订: PLAN_DEFECT-R1.2] 动作入口与编辑RAF执行点都从notesRef.current按UUID复核；旧RAF取消；不借同名回退 |
| App → NoteGraph → App | `locateRequest:{id,token}|null`；`onLocateResult({token,ok,reason?})`；详情`onLocate(id)` | [修订: PLAN_DEFECT-R1.1/R1.3] 两种定位共享App token；QuickOpen才清筛选，详情保持；当前request/status/callback一律读取latest.current；waiting保留pending |
| NoteGraph → 自有D3 controls | `locate(id):'located'|'waiting'|'missing'`、`retryLocate():void` | [修订: PLAN_DEFECT-R1.1/R1.3] locate只由pending消费者调用；retry在当前节点刷新后、当前status/request变化及尺寸迟到后调用；不改业务模型或其他owner |

### 片段闭环充分性

本轮修改既有判定/状态顺序，以下目标骨架是必填片段，覆盖许可→抓手→取消→UUID动作→异步镜头全链；并非最终代码，也不替代安装后类型检查。S1–S5逐块给实施/验收/回撤，reviewer无需自行拼主链。

```tsx
// SoftInteraction.tsx: mature features loaded before gestures are enabled.
import { LazyMotion, domMax, useDragControls, useMotionValue, useSpring, animate } from 'motion/react'
import * as m from 'motion/react-m'
<LazyMotion features={domMax} strict>{children}</LazyMotion>

// NotesView NoteCard: independent native handle; body/actions remain native clicks.
<m.article drag={allowed} dragListener={false} dragControls={controls}
  style={{ x, y }} dragMomentum={false} dragElastic={0}
  dragConstraints={{ left: -12, right: 12, top: -10, bottom: 10 }}
  onDragEnd={returnUsingMotionSpring}>
  <button type="button" aria-label="轻拉记录，松手归位"
    onPointerDown={e => allowed && e.isPrimary && e.button === 0 && controls.start(e)} />
  {/* Existing body, completion, copy, edit and trash buttons are siblings. */}
</m.article>

// Owned adapter: cancellation is complete even though onDragEnd does not run.
function cancelAndReset() {
  controls.cancel()
  ownedReleaseAnimations.forEach(animation => animation.stop())
  x.stop(); y.stop(); x.jump(0); y.jump(0); scale.stop(); scale.jump(1)
}
// Call on policy false, pointercancel/lostcapture, blur and unmount.
// No DIY pointerId bookkeeping, global sweep, physics loop or business write.
```

[修订: PLAN_DEFECT-R1.1/R1.2/R1.3] 以下替换原第二骨架，保留其动作顺序/镜头职责，关闭旧闭包与waiting来源缺口。notesRef每render更新，mounted/单个RAF身份只用于有界编辑交接；不是新的业务存储或指针状态机。

```tsx
// App [R1.2]: read the current note again at the actual RAF execution point.
notesRef.current = notes
const findCurrent = id => notesRef.current.find(n => n.id === id && !n.deletedAt)
function openRecord(id, action) {
  cancelPendingEditFrame()
  if (!findCurrent(id)) { show('这条记录已不可用'); return }
  setQuickOpen(false)
  if (action === 'edit') {
    const request = { id }; pendingEdit.current = request
    editFrame.current = requestAnimationFrame(() => {
      if (!mounted.current || pendingEdit.current !== request) return
      editFrame.current = null; pendingEdit.current = null
      const current = findCurrent(request.id)
      if (!current) { show('这条记录已不可用'); return }
      setComposer({ type: 'note', note: current })
    })
  } else requestLocate(id, true)
}
// App [R1.3]: a single source holds both QuickOpen and detail requests.
function requestLocate(id, clearBlockingFilters) {
  cancelPendingEditFrame()
  if (!findCurrent(id)) { show('这条记录已不可用'); return }
  if (clearBlockingFilters) clearFilters()
  setLocateRequest({ id, token: ++locateToken.current }); setView('graph')
}
<NoteGraph onLocate={id => requestLocate(id, false)} locateRequest={locateRequest}
  onLocateResult={finishMatchingAppRequest} />
// Detail button calls props.onLocate(selectedId), never controls.locate directly.

// NoteGraph [R1.1]: the long-lived owner reads one current snapshot each attempt.
function tryLocateLatest() {
  if (disposed) return
  const current = latest.current
  const request = current.locateRequest
  if (!request || consumedToken === request.token) return
  if (current.graph.status === 'idle' || current.graph.status === 'updating' || !width || !height) return
  const node = nodes.find(n => n.id === request.id)
  if (!node) { finishLatest(request.token, false, 'missing'); return }
  setSelectedId(node.id)
  selection.call(zoomBehavior.transform, centeredCamera(node, width, height, camera.k))
  session.current.fitted = true; cache()
  finishLatest(request.token, true)
}
function finishLatest(token, ok, reason?) {
  const current = latest.current
  if (disposed || current.locateRequest?.token !== token || consumedToken === token) return
  consumedToken = token
  current.onLocateResult({ token, ok, reason })
}
// Owning effect remains [session]. Retry after reconcile installs current nodes;
// ResizeObserver retries after nonzero dimensions are assigned; status/request
// effect calls current controls retry. Updating→ready cannot keep old status.
```

## 3. 实施步骤与主要工作包

共同证据合同：impl只执行 `impl-safe`（源码/类型/受控测试/本地build/文档检查），输出完整命令/退出码/失败和差量至 `impl_validation.md`、工作包进度至 `impl_report.md`。root承接实际UI、系统/原生、数据库与EXE证据至 `root_observations.md`、`docs/Release.Verification.0.5.1.md`。每包下面明确复检范围；缺记录只能“未验证/待handoff”，不得以另包或旧0.5.0成功替代。impl不得操作UI/真实DB/密钥或安装器。局部回撤只反向本轮已确认差量，与 `%TEMP%/qingjian-soft-baseline-20261003` 比对；不得覆盖原有未知改动。

### S1. 精确Motion依赖、许可和按压/取消边界

- 目标/映射：G1/G3、A1/A2/A3。关键文件：package.json/lock、`src/SoftInteraction.tsx`、App主导航/new/AI/theme按钮与许可、必要受控 `tests/softInteraction.test.mjs`。先看现App:70/124与原生button入口，目标为一个有限适配模块，不把全App换成动画组件。
- 步骤：安装 `motion` **save-exact14.0.0**；核对motion/framer-motion实际锁版本、安装包LICENSE正文、m/react导出及DragControls.cancel、MotionValue.stop/jump、animate与domMax；记录路径/关键行。前置Gate未满足先停本包，不能换latest或自制物理。
- 采用**同步domMax + LazyMotion strict + m**，避免“未加载drag却可按抓手”的首次竞态；本轮不以异步拆分换首次交互复杂度。确切功能在安装包源码/类型验证。Shared SoftButton保持原生button业务onClick、type/disabled/aria/Tab；只用Motion tap生命周期驱动scale（约0.97→1），不自己发业务click。普通释放用官方spring（stiffness260/damping24/mass0.65）；视觉动画不作用编辑器正文/工具栏或Canvas。
- owned取消适配按上述片段；许可false时 stop/jump同步回零，关闭gesture入口；恢复后不续旧release。policy effect清理、blur、pointercancel/lostcapture及卸载都调用同一无状态复位函数；只保留自有动画handle和Motion controls，不另建pointer状态机。动态关闭的CSS也不得残留hover位移/持续装饰动画。
- impl验收/证据：依赖/许可/types/source证据；受控controls.cancel不调用end仍stop/jump，重复取消不触发业务写入，关闭策略退出位移；TypeScript/build和主按钮原生事件结构检查。Node合同不能称原生取消已通过。root：实际按压/键盘激活、途中暂停/编辑/hidden/reduce，帧序列与未测边界；系统设置、触屏、GPU为非impl-safe。
- 作者体验：业务handler仍按名称直读；一个简单allowed参数和owned取消函数，禁止泛型动画DSL/自动包裹全DOM。失败降级：原生button仍可用，Motion安装/前置API失败不发布该动效，报告并修订本包；禁止悄悄删需求。依赖：Gate-2；回撤：删除本轮adapter接线并反向精确新依赖差量，保留旧锁中其他项。已附片段，覆盖许可、取消和业务分离。

### S2. 独立卡片抓手与紧凑首屏

- 目标/映射：G1/G3、A1/A2/A3。关键文件：NotesView `NoteCard`/capture-entry，SoftInteraction，styles工作台/记录有效规则（307起）。理解锚点是article与正文/动作兄弟关系；目标形态是卡片变换只由Motion控制、独立抓手启动，卡片布局和数据排序不变。
- 步骤：按片段m.article，x/y MotionValue由官方drag更新；左右12px/上下10px硬边界，dragElastic0/dragMomentumfalse；正常end用官方 `animate(x,0, spring)` / y归位并保存owned动画handle，先stop旧release，不另写积分/RAF。抓手按钮常可发现，有grab/grabbing、触屏只抓手touch-action:none；非主指针/右键不启动；轻点无业务动作，键盘聚焦可正常离开，禁用动效时有解释且不启动装饰drag。
- 正文、复制/完成/编辑/软删除/恢复按钮完全保留原onClick；回收站卡片不加入装饰drag。删除旧 `.note-grid .note-card:hover transform` /竞争transition，保留border/轻量光色；不用阴影/blur逐帧动画、全卡touch-action:none或嵌套button。
- 收紧主导航/搜索/heading和capture：删除topbar重复加号入口（主导航new与capture保留），content顶部16px、heading底距16px、capture最小64px/底距14px，mobile同层收紧且触点>=32px。保留3/2/1列断点及日期分组，正文/元数据层级和浅深对比不削弱。
- impl验收/证据：Motion约束/取消和siblings结构，原60批量/日期/复制路径保持，CSS无父级竞争transform；build+现有tests。root：同1280×720/夹具首卡top应<=380px（改前479.5）；浅深/390px截图，编辑/动作/滚动、轻拉回弹/拖后点击/卸载实输入。无法真实drag/触屏则标未测，不能以synthetic event称手感通过。
- 作者体验：在原NoteCard局部加抓手，业务名称仍可顺读，不复制整卡实现；消费者只传allowed。依赖S1；失败降级为正常卡片/原生button，独立抓手不应影响业务。回撤仅本轮JSX/CSS差量；无数据回滚。已附抓手/取消片段。

### S3. 全量可搜标签与UUID快速打开

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.2] 保留原快开/Modal顺序，明确RAF执行时的最新数据入口、身份失效与取消；不借现editLatestNote函数名称假定其闭包最新。

- 目标/映射：G2/G3、A1/A2/A3。关键文件：`recordNavigation.ts`、`TagPicker.tsx`、`QuickOpen.tsx`、App标签/keys/搜索入口、NoteFilters、NotesView标签区；必要Modal只做显式焦点交接改动，不重写编辑器。理解锚点：App tags `.slice(0,10)`与CtrlK只focus；目标为两个直接可用的轻量Modal和纯选择器。
- 输入/输出：collectTags从所有有效笔记去重并稳定按标签名称排序，原大小写保持；filterTags只检索显示，选择仍原字符串精确匹配。App不再截断，NotesView标签区如需紧凑展示可只展示前10但必须“查看全部标签”入口；pinned与编辑器5项suggestion保留。
- TagPicker复用Modal：search input、全部标签/清除项、滚动标签按钮/结果数，准确标selected，Enter选择当前匹配项、ArrowUp/Down改变active、Escape关闭；清空查询后全部候选可访问，无结果明确反馈。NoteFilters原select改为明确可发现的“全部标签/#选中”button，选择后调用同一个onTag并关闭，不改变query/unfinished。
- QuickOpen：Ctrl/⌘K与可见“快速打开”入口；当前文本搜索仍保留。只在无composer/AI/标签浮层时打开；浮层keydown不与顶层Escape竞争。匹配全部activeNotes（trim大小写不敏感正文/标签），按现有记录顺序，显示纯正文摘要/日期/标签并用UUID key/activeId；初始40项可加载更多且先全量查。重复标题可独立操作；搜索结果变化保留仍存在activeId否则首项，空集合activeId为空。
- keyboard：上下箭头选行并nearest滚入视图；Enter编辑、Ctrl/⌘Enter图定位（明确kbd说明），Esc关闭；isComposing/229/repeat按原约束保护，Enter不误确认输入法。结果button及footer动作可Tab使用，native click直接执行同一个UUID action。
- [修订: PLAN_DEFECT-R1.2] 焦点交接：Modal关闭仍返回触发元素；先关闭QuickOpen，让旧Modal cleanup执行，再由受控单个RAF打开NoteComposer。App每render同步notesRef，入口和**RAF执行当下**均从notesRef.current按UUID查有效对象；目标内容更新使用最新对象，软删/替换消失则提示并取消，不回退同名。pendingEdit对象身份+mounted检查拒绝旧RAF；新动作、导航离开/另开编辑器和卸载cancelAnimationFrame并清pending，旧回调不能覆盖新动作。不能闭包保存旧notes或editLatestNote。graph动作同commit清阻挡filters并提示“已清除筛选并在图中定位”；顶层Escape优先composer→quickOpen→AI，标签Modal自己close并stop该Escape；快捷键不在编辑期间挪走选区。
- [修订: PLAN_DEFECT-R1.2] impl验收/证据：`tests/recordNavigation.test.mjs`覆盖>10/18标签、精确近似名/大小写、trash、重复标题UUID、全量先查再批、源数组不变、移除目标/结果更新；编辑交接受控RAF增加执行前内容更新、软删/全量替换丢UUID、旧RAF被新动作取消、卸载不打开场景；现selectNotes回归。root：真实18标签故障复检、搜索无结果/选中清除、CtrlK→箭头→Enter→连续输入/格式/保存回填；Tab/ShiftTab/Escape焦点、IME；操作真实UI非impl-safe。
- 作者体验：清楚按钮/结果计数，不暴露UUID/格式标记或“动画初始化”；复用简单Modal与选择器，不引入combobox框架。依赖S1/S2入口，S4消费graph动作；失败降级：原正文搜索和已选标签保持可用，但缺快速打开/全标签验收不能写G2完成。回撤本轮组件/接线/选择器；不恢复用户数据。已附App交接片段，keyboard优先级由本段与接口矩阵固定。

### S4. UUID图定位、异步就绪与相机一次应用

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.1/R1.3] 长期owner所有尝试读取latest.current同次request/status/callback；详情按钮进入同一App token且不清筛选，尺寸迟到等待有唯一持有来源。保持既有D3生命周期，不以重建owner修闭包。

- 目标/映射：G2/G3、A1/A2/A3。关键文件：App openRecord/nav、NoteGraph Props/Controls/reconcile/ResizeObserver/selected详情、graphGeometry新增centeredCamera，`tests/graphFocus.test.mjs`和原graphGeometry。先看现`select`只freeze不移镜头；目标为一条token请求跨App与Canvas，现D3事件层保持。
- [修订: PLAN_DEFECT-R1.3] App统一requestLocate：QuickOpen传clearBlockingFilters=true，清query/tag/unfinished后进入graph；详情onLocate(id)传false，保留当前筛选。两者分配同一个单调token、同一个locateRequest pending，waiting不清pending；旧回报仅在当前token匹配时消费，nav离开graph取消pending，目标软删/替换消失时撤销并提示。无第二套详情pending，不改Worker版本/GraphModel或持久化。
- [修订: PLAN_DEFECT-R1.1] NoteGraph owner仍仅[session]，每次尝试先读const current=latest.current，使用**current.graph.status、current.locateRequest及current.onLocateResult**，不能捕获首次graph或callback。先disposed/latest token/消费检查→ready/error且尺寸>0→当前nodes→选择居中→匹配token消费；消费前再次核对最新token，先记consumed再回报。reconcileGraph安装当前nodes/links并freeze/draw后重试；ResizeObserver赋width/height/缓冲后重试；React effect依赖shown、graph.status与locateRequest.token，节点变化先refresh/reconcile，再retryLocate，不能只有调用旧闭包的status重试。idle/updating或0尺寸只等待，App pending仍在；error可定位基础节点，真正缺UUID才missing。相机k夹0.6–2、x/y按当前node居中，用现zoomBehavior.transform立即应用并session.fitted/cache，ready后同token不重复抢镜头。
- [修订: PLAN_DEFECT-R1.3] 详情“定位此记录”只调用props.onLocate(selectedId)送到上述统一App入口，禁止直接controls.locate后丢waiting。收到pending后按同一tryLocateLatest处理尺寸迟到/ready/失败。存在自有D3鼠标手势时只调用现cancelOwned*按身份释放并清本地refs，不扫window命名空间；触摸不另建状态机。卸载保持原disposed/ownership清理，旧回报不写React。
- [修订: PLAN_DEFECT-R1.1/R1.3] impl验收/证据：纯camera居中/DPR独立/有限边界；受控owner保持不重建，初次updating→ready、尺寸迟到、error基础节点仅最新token消费一次；详情点击同pending源且不清筛选，QuickOpen旧token被详情/新请求取代、目标删除/离开graph取消、旧callback/卸载拒绝回报。原D3监听所有权/晚到mousemove回归，不用mock结果冒充Canvas。root：24条真实Worker快开定位、清筛选提示、详情重复点与当前筛选保持、同名UUID/放缩/fit/暂停定位截图；原生drag/GPU缺证据保留。
- 作者体验：graph请求接口两个字段、结果三个状态，不扩架构总线；用户看“定位此记录/已清除筛选”而非token/Worker细节。依赖S3动作和现graph，失败可继续文字选择/fit/编辑，关联错误明确；回撤新增定位prop/controls/helper与UI，保留原session和算法。已附完整异步定位骨架。

### S5. 0.5.1元数据、文档与独立交付承接

- 目标/映射：G3、A2/A3。关键文件：package.json/lock根版本、src-tauri/Cargo.toml、Cargo.lock中qingjian自身版本、tauri.conf.json、README、CHANGELOG、docs/Project.Progress.md、docs/Release.Testing.md、新 `docs/Soft.Interaction.md` / `docs/Release.Verification.0.5.1.md`及本feature状态。理解锚点是产品0.5.0元数据与尚未通过证据，目标为一致0.5.1体验版而非完成总MVP。
- impl步骤：只更新产品版本0.5.1，不升级其他Rust依赖；Cargo.lock自身package同改并由cargo工具核验。同步能力/取消边界/快捷键/标签/定位的实际事实，旧失败/未测保留；发布记录先写待root验证而非伪造哈希。无存储格式迁移步骤：明示“数据不迁移”，版本回撤仅本轮元数据/代码，新制品可另存旧版本但不覆盖用户库。
- impl验收/证据：所有版本一致检查、完整 `node --test --test-concurrency=1 tests/*.test.mjs` 与 `npm run build`最终退出码/全输出，按entry/graph/CSS/Worker/Motion实际块报告，PWA新增入口缓存结果；`git diff --check`仅本轮可追溯范围。引用相对链接检查；警告/失败不得省略。包体增长候选≤40KiB gzip（相对初始87.56KB，另列异步图/Worker），超候选报告，不删功能或改成达标；属于候选目标，不承诺机器手感。
- root承接/证据：独立同一测试/build；隔离UI首屏与S1–S4回归；可输入真实按压/动画序列；实际内存/帧耗时有能力则测，无能力保留未测。root执行 `CARGO_BUILD_JOBS=1 npm run release:windows -- --ci`、当前Rust check/test，独立核对0.5.1程序EXE/NSIS EXE/MSI版本/字节/SHA256、响应启动与已授权范围数据保持；安装/卸载未经实测不得勾选。副本/制品不得Git提交，源初始混合修改不得commit/push。
- 作者体验：使用说明为中文、直接解释动作；实现注释英文；提供英文提交建议但本轮不执行Git。依赖S1–S4与独立review；root未完成只能交“体验制品/部分验收”，不归档旧整体MVP。回撤本轮版本/文档事实差量并保留验证历史，不删除未知文件/用户数据。版本变更使用字段对照足够，无逻辑片段新增。

## 4. 风险、降级与事件对齐

- U1在S1前置Gate关闭类型/许可事实；官方接口不符先补报告并用同包公开API（上述owned animate归位为既定路径），不自制状态机。同步domMax使“未加载特性”不成为用户手势前置；如果确切包仍需功能注册，修订S1后再review。
- U2/U3/U4由S1/S2合同+root实输入分层；抓手入口清晰，CSS单owner，cancel直接stop/jump，不依赖onDragEnd。无法原生drag/触屏/系统设置的U保留；不能用dispatchEvent或截图声明已通过。
- U5由S3纯选择器+Modal/IME/编辑回归；U6由S4受控请求/几何+真实Worker；U7由S5实际分块与UI证据，历史图算法计时不再重跑或当软反馈预算。
- 主链失败降级：依赖/API问题不发布新动效；业务button/正文搜索保留；标签/QuickOpen不吞掉现筛选；图关联error仍基本节点和文字入口，定位missing诚实提示。暂停动效是已有即时视觉降级，不做停机/存储切换开关。
- **事件触发对齐留痕**：新假设/新风险/阶段切换即时写本节与clarifications最新覆盖记录，通知root。已经记录同步domMax取舍、改前夹具实际24+1/18标签、tsconfig.app.json读取失败而实际tsconfig.json、包体候选不是门禁实测值；未改变目标锁。LWPlan→Review(LW)必须留Gate状态，不能等待到代码后。
- **批量提问与优先级**：目前无未回答产品问题，以上U是确定实现/验收路径，不触发委托用户提问。若新事实导致范围/验收/回撤口径不唯一，按P0阻塞→P1风险→P2优化一次性整理，不设问题数量上下限；先root重算基线，不静默扩范围。

```text
【DELEGATE_QUESTION】
需要用户确认：{范围/验收/回撤中的唯一阻塞决策}
优先级：P0 | P1 | P2；影响阶段：LWPlan | Review(LW) | Impl
Q1：A) {推荐及原因}；B) {权衡及影响}；C) {可选不同范围}
请一次性回复：Q1=A, Q2=B ...
```

## 5. Gate-1自检与Gate-2协议

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.1–R1.3] 第1轮Gate-2为FAIL/REVISE且allow_enter_impl=no，原报告保留。本轮只补上述三处闭环，目标与S1/S2/S5不变；Gate-1增加核对修订说明/标签、保留支撑文本与未绕过独立复检。

Required Set采用纯存在性硬门禁，无任务数或澄清问题数量硬阈值。planner产出后Gate-1自检；review_plan主检+root复核Gate-2通过前禁止impl。失败回 `LWPlan→Review(LW)` 修订；上游口径不唯一先DELEGATE_QUESTION/重算基线。审查发现已实施后PLAN_DEFECT必须保留支撑文本并按技能修订标签，不能整篇覆盖旧方案。

| T3 Required Set / Gate-1项 | 存在性自检锚点 |
| --- | --- |
| 目标锁/反目标/不影响项与每包映射 | §1、S1–S5 |
| 文件、关键handler/接口、理解与目标形态锚点 | §2矩阵、每包第一项 |
| 步骤、验收、回撤、依赖、失败降级 | S1–S5及§4 |
| 模块输入/输出/边界、跨模块状态/接口矩阵 | §2及S3/S4 |
| 兼容策略/迁移触点/降级开关 | 不迁移数据、保留原业务/D3；S1/4/5、§4 |
| 验证责任分层、证据产物/归属/证据不足约束 | §3共同合同与每包impl/root项 |
| 作者体验门证据已提供 | 每包作者体验/业务声明可读性，禁止动画DSL与格式暴露 |
| 核心链路总览 / research事实映射 / 片段闭环充分性 | §2三节及两个目标骨架，顺读许可→输入→定位→证据 |
| 测试分层/回归范围与非impl-safe分流 | 每包自动/实际UI项，S5整体回归 |
| 双阶段Gate执行人/时机/失败回退 | 本节，独立review和root非可选 |
| 澄清触发/批量模板/事件对齐 | §4及模板 |

### P1–P9存在性自检

| 协议 | 自检 |
| --- | --- |
| P1 | 禁止任务数硬门槛；5包由实际语义识别，不以5判质量 |
| P2 | Required Set任一必备内容缺失不得放行 |
| P3 | 采用纯存在性门禁，不用加权分数掩盖缺项 |
| P4 | 本轮T3，T1十三项+T2输入输出/回归+T3接口/兼容/迁移/降级均有锚点 |
| P5 | 命中范围/验收/回撤不唯一或关键新假设即委托澄清，不脑补 |
| P6 | 新假设/风险/阶段切换即时对齐，留痕§4及基线覆盖记录 |
| P7 | 澄清数量没有上下限，当前零问题不是质量阈值 |
| P8 | §4按P0/P1/P2批量模板；本轮未触发原因明确 |
| P9 | planner Gate-1 + reviewer/root Gate-2，两阶段不能互代 |

[修订: PLAN_DEFECT-R1.1–R1.3] Gate-1结论：Required Set与修订说明/标签存在，S1–S5原范围/支撑和证据责任保留；R1同次latest status/request/callback、R2编辑RAF当前notesRef核对/取消、R3详情统一App pending/不清筛选均写入骨架及验证，可交独立Review(LW)第2轮。**不授权跳Gate-2实施、不代表新功能测试或产品验收通过**。Gate-2继续复核cancel/手势隔离/作者体验/证据分层，并重点检查三处异步闭环、Cargo.lock和native缺证据边界；第1轮FAIL不能由本自检自动变为PASS。

无新增跨功能事实；research的两条事实未新增归档承诺。
