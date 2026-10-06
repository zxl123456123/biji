# 持久排序与置顶：低层实施计划

日期2026-10-04；T3，规划路径。输入为clarifications.md完整十章、research-code/industry/cancel/modern-cancel、readiness2 PASS。无HL计划。root接管规划落盘：原planner预读已就绪但交付延迟，两次中断未产生计划/源码；其公开API、duration0与ref session建议被采用，不冒称原planner完成。当前只有计划，没有功能验收。

## 范围与目标锁

- G1：三布局抓手真实同组排序、Web刷新/桌面重启保留、鼠标键盘可用、关动态仍可操作。
- G2：显式pin/unpin、独立置顶区、保存/备份、编辑/回收/撤销/恢复保留位置和pin。
- G3：仅改顺序/pin，不改正文/时间/日期/done/交易/图语义；保留筛选隐藏、未加载和回收站记录；root实际UI/迁移/新EXE证据。
- A1：不把回弹称排序，不随动效禁业务，不跨分区/日期自动改元数据。
- A2：不扩自由画布、多选、云/CRDT、分数秩、第二顺序权威；不顺修导入校验、桌面空库回退或双保存effect。
- A3：不丢混合工作区、不覆盖旧feature/失败、不提交生成物；无用例cargo test/旧SELECT*hash不可证明新迁移。

不影响：编辑纯文本协议、NoteComposer/codec/format、graph模型/Worker/D3镜头、交易和AI/凭据/网络、永久删除流程、原SoftButton。只撤下NoteCard的装饰useSoftDrag调用，SoftInteraction及其通用helper保留；不存在整条函数链/≥50行专用逻辑删除。

## 核心链路总览（先主链，后工作包）

现状：App完整notes数组→过滤→NotesView presentedNotes(60)→装饰抓手useSoftDrag(有限位移，松手归零)；App effect→浏览器JSON/desktop.save→Rust事务；Rust load按created_at DESC，不能恢复手工排列。

目标：App完整数组唯一权威→过滤→稳定pin分区/日期组/共同60限额→各组useSortable抓手→optimistic DOM临时显示→合法最终drop→可见ID槽位合并回完整数组→原保存链→SQLite position/pinned→按position读回。显式pin按钮只改字段，不挪规范数组。取消先使session失效，再stop canceled并真正卸载旧Provider，销毁sensor；新Provider创建新manager。

为何分层：纯顺序函数不依赖DOM；NotesView/新增排序组件拥有几何与生命周期；App拥有完整数据；Rust仅保存数组投影。测试helper提取与元数据功能分成S0/S1独立工作包，不顺手重写store或repository。读取/排序/pin不发送本地笔记。

## Research事实映射

|事实/来源|实现锚点|验证锚点/口径/责任|
|---|---|---|
|旧抓手只±12/10归位且motion gate(code A)|S2 NoteCard/useSortable handleRef，businessEnabled独立|root原5175拖首到次红例→新实际双向，关动态绿例|
|完整数组、过滤、60与trash(code B/C)|S1 noteOrder可见槽位；S2共同batch|impl Node隐藏/未加载/trash与字段相等；root70条加载/组合筛选/刷新|
|日期倒序、组内输入顺序(code D)|S1 presentedNotes；S2 group type/accept|Node日期/混合pins；root跨日拒绝、同日成功|
|编辑spread/soft delete map，graph id/content(code B/E)|S1可选pinned；App功能回调|Node对象字段不变；root保存回填/删除恢复/graph回归|
|SQLite旧7/8列与全事务(code G/SQLite官方)|S0连接helpers→S1幂等ADD+enumerate/load|root运行同生产helpers测试7/8/10列、非空交易、rollback/文件关闭重开|
|legacy无公开完整取消(cancel)|不用legacy包/私有接口|Gate2读固定modern公开API；旧REVISE保留|
|modern stop不等于sensor清理，destroy链(modern B)|S2 session先失效→stop→Provider真实卸载、新manager|root实际Esc/弹层/外部变更后恢复，静态cleanup；native hidden/触屏未测不冒充|
|pointerup nativeEvent，optimistic source可等target(modern C)|S2 final coords/source.initialIndex,index|Node落点纯判据；rootoutside/cross区，不能active.id!==over.id|
|group本身不拒crossgroup，accept先于碰撞(modern C)|S2 type/accept=合法group token|rootpins/date跨组拒绝；drop最终再次验组|
|modern Accessibility/Keyboard/Overlay(modern C)|S2中文插件、默认键盘、纯Overlay|rootSpace/arrows/Enter/Esc；真正读屏另验|
|0.5 transition spreads defaults(planner固定发布物)|S2 OFF transition {duration:0}，dropAnimation null，Feedback键盘0|root关动态仍排序；静态检查不能以null冒称sortable无过渡|
|实际包体与许可(industry/基线)|S3固定react/dom0.5.0、closure notices|impl闭包审计；root最终gzip对138.58/8.72基线与制品hash|

## 跨模块接口与状态矩阵

|入口→出口|契约/权威|边界|
|---|---|---|
|Note→Web/JSON/Rust|pinned?:boolean / serde default bool；完整数组顺序|旧缺失false；backup version1不变；不保存HTML|
|NotesView→App|onReorder(orderedVisibleIds, expectedVisibleIds)，onPin(id)|仅合法可见同组；App用最新完整数组复核，错误/重复/缺失/跨pin/日期noop|
|noteOrder→App|合并可见子序列到原槽位，返回原数组或新数组|hidden/trash/未加载不动；所有原Note对象保留；no-op保持引用|
|呈现→排序组|{id, notes}，index按实际rendered子组|pins一个组；normal grid/read一个组；date每日期一个组；trash无sensor|
|排序组件→manager|Provider自建；handleRef；type/accept=group|正文/按钮不启动；Overlay不注册sortable/不可交互|
|drag session→drop|id/group/visibleIds/原始数组版本、valid ref|canceled/stale/noop/outside/组不符无commit；键盘不套pointer坐标|
|App→NotesView|businessEnabled + dragContext变化|模态/快开/标签/AI关闭业务；motionAllowed只过渡与阴影|
|Rust helpers→SQLite|pinned NOT NULL DEFAULT0、nullable position|旧NULL rank回退日期/id；保存完整数组0..N-1含trash；同事务|

状态：idle→dragging(session有效)→合法drop(一次合并)→idle；任意context变化/blur/hidden/unmount→invalidate→canceled stop→旧Provider销毁→新idle。拒绝drop同样重建临时DOM。取消回调在useInsertionEffect cleanup期间不得setState：先valid=false，旧回调立即返回。父级负责generation变化；销毁manager不复用。

## 主链关键片段与闭环充分性

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.1] 根据review_preliminary_lwplan_1.md区分正常sensor取消与销毁旧Provider时的无效回调：前者失效session并请求安全reset，后者仅return。任何reset状态更新延后到insertion cleanup之外，复核owner仍挂载、generation/context未变；旧owner/外部取消不再触发状态更新。没有已实施支撑文本删除。

以下为目标伪代码，锚点标明来源。片段覆盖展示集合→sensor→结束门禁→完整数组合并→原保存→迁移/读回，不要求最终代码逐字一致；不能仅在局部写一个onDragEnd当完整闭环。

```ts
// src/types.ts + src/noteOrder.ts (S1): array remains authoritative.
type Note = ExistingNote & { pinned?: boolean }
function reorderVisible(full, beforeIds, afterIds) {
  // Reject duplicates/unknown ids/trash/mixed pin or illegal date group upstream.
  // Require beforeIds to match the current visible group subsequence, then
  // replace ONLY their full-array slots with original objects in afterIds order.
  // Every unrelated position/object stays unchanged; noop returns full.
}
// src/notePresentation.ts (S1): common limit AFTER stable partition.
const pins = notes.filter(n => !!n.pinned)
const regular = notes.filter(n => !n.pinned)
const shown = [...pins, ...(layout === 'date' ? dateOrdered(regular) : regular)].slice(0, limit)
```

```tsx
// src/NoteSorter.tsx or bounded equivalent in NotesView (S2).
<DragDropProvider key={generation} onDragStart={captureSession} onDragEnd={finish}>
  <SortableCard ref={sortable.ref} handleRef={sortable.handleRef}
    index={renderedGroupIndex} group={token} type={token} accept={token}/>
  <DragOverlay dropAnimation={motionAllowed ? gentleDrop : null}>
    {pureNonInteractiveCard}
  </DragOverlay>
</DragDropProvider>
// hooks/plugins remain default plus Chinese Accessibility.configure.
// OFF: sortable transition {duration:0}; Feedback keyboard transition duration0.
function invalidateAndRemount() {
  session.current.valid = false; // BEFORE stop and insertion cleanup callbacks
  manager.actions.stop({canceled:true});
  parentChangesProviderGeneration(); // real unmount→destroy→sensor cleanup
}
function finish(event) {
  if (!session.current.valid) return; // destroyed/stale owner: NO setState
  if (event.canceled) {
    invalidateSessionWithoutLateCommit();
    requestSafeReset(); // normal sensor cancel: deferred, current mounted owner only
    return;
  }
  const source = event.operation.source; // sortable source initialIndex/index
  if (!sameCurrentLegalGroup(source, session) || source.initialIndex === source.index) returnReset();
  if (isPointerEnd(event.nativeEvent) &&
      !insideVisibleGroupAndViewport(event.nativeEvent.clientX, event.nativeEvent.clientY)) returnReset();
  invalidateSessionWithoutLateCommit();
  onReorder(moveInCapturedIds(source.initialIndex, source.index), capturedIds); // ONCE
  requestSafeReset();
}
function requestSafeReset() {
  // Capture current owner generation; defer outside insertion cleanup.
  queueMicrotask(() => {
    if (!ownerAlive || ownerGenerationChanged || contextChanged) return;
    parentChangesProviderGeneration(); // NEW manager, old callbacks invalid
  });
}
// Source/group/index/nativeEvent exact types from fixed0.5.0 package; no legacy active/over assumptions.
```

```ts
// src/App.tsx (S1/S2): newest complete array at commit.
const handleReorder = (orderedIds, expectedIds) => setNotes(current =>
  reorderVisible(current, expectedIds, orderedIds))
const handlePin = id => setNotes(current => current.map(n =>
  n.id === id && !n.deletedAt ? {...n, pinned:!n.pinned} : n))
// No updatedAt/date/done/content writes; saveNotes/saveDesktopData remain existing effects.
```

```rust
// src-tauri/src/lib.rs (S0 helper extraction then S1 metadata).
#[serde(default)] pinned: bool,
fn initialize_database(conn: &Connection) -> Result<(), String> { /* old initialization + idempotent ADD */ }
fn load_from_connection(conn: &Connection) -> Result<AppData, String> { /* explicit columns */ }
fn save_to_connection(conn: &mut Connection, data: AppData) -> Result<(), String> {
  // Existing one transaction: DELETE notes/transactions, enumerate full notes,
  // INSERT explicit pinned/position, insert same transactions, commit only on success.
}
// ADD pinned INTEGER NOT NULL DEFAULT 0; ADD position INTEGER (NULL legacy).
// ORDER BY position IS NULL, position ASC, created_at DESC, id ASC.
// Existing AppHandle wrappers obtain connection then call same testable helpers.
```

## 主要工作包

### S0：保行为的连接级helper提取（backend，先于元数据）

目标G3；消费A2/A3：为同生产路径迁移/事务测试提供连接入口，先保留所有SQL行为，不引入repository/新crate。

关键文件/首读点：src-tauri/src/lib.rs 的connection/load_data/save_data；必要同目录tests模块。将现有初始化、加载、保存函数体移入initialize_database/load_from_connection/save_to_connection，AppHandle wrapper只开连接与委派。目标形态为三薄生产helper，业务字段/排序此步不变；片段见Rust主链，命中状态调用关系故已附。

步骤：读取before/lib→提取helper→静态核对原SQL/事务/错误语义保持→记录S0差量→才执行S1。依赖readiness/Gate2，不依赖前端。作者体验：维护者顺读wrapper到SQL，错误仍String、无泛型/trait、不会两份测试SQL。

验收与证据：impl只运行cargo check --locked --jobs1或静态差量，报告impl_report_backend_r1.md记录命令/输出/exit；未跑则未验证，不称迁移通过。root承担cargo完整测试/临时连接/真实DB比较，产物TEMP/root-verification.md；这些非impl-safe真实环境项不得由impl启动。缺root证据只交接。

回滚：仅撤本轮helper差量，保留before未知工作；不Git restore/reset混合文件。S0不触库，失败不发布；若S1已迁移库，按S1停机策略而非降级写回。

### S1：唯一顺序与元数据持久化（front/backend分开文件）

目标G1/G2/G3；消费A1/A2/A3：完整数组权威、可见槽位、可选pin、legacy兼容，不另造顺序偏好。

front关键文件：src/types.ts Note；src/noteOrder.ts新纯模块；src/notePresentation.ts presentedNotes；src/App.tsx新onReorder/onPin回调与NotesView传参；tests/noteOrder.test.mjs以及原presentation相关测试。先看纯合并再看App拥有完整数组。目标形态为一个有限顺序函数、一组展示函数与两个业务回调；片段见TS闭环。

backend关键文件：S0 helpers、Rust Note字段、显式SELECT/INSERT；Cargo.toml/Cargo.lock自身version0.5.4。目标形态只是ADD两列、一次事务的数组投影；不得修改网络/凭据/交易协议。两端接口为可选/默认pin+原完整notes数组，不增前端position字段。

步骤：1 Note字段和纯函数/日期pin呈现；2 App新回调；3 Rust幂等ADD和load/save；4 同生产helper测试。pin只切字段、不挪数组；新笔记prepend/编辑spread/soft delete map/恢复原路径保留。回收站呈现不pin分区、不挂拖拽。

兼容/迁移：旧7列先补deleted_at→pinned0/positionNULL；8列补新2；10列重复init无额外列。NULL legacy按日期/id回退；ID tie以前未定义，不声称保留未定义顺序。保存枚举全数组含trash，insert失败回滚两表。旧version1 JSON/备份metadata缺失false，新备份仍全数组与字段。旧EXE写新DB会丢pin/rank，公开记录，禁止回旧版写库。只新增列，无DROP/自动恢复。

输入/边界：expectedIds/orderedIds需唯一且相同集合、来自当前合法可见组，非法/消失/stale/noop返回完整原数组；剩余每个Note对象、字段和槽位不动。App若最新notes已变化，旧session取消/纯函数门禁共同拒绝。排序/置顶不更改updatedAt等。日期普通组不跨日，pins不按日拆。

验收/分层：impl Node测试（空/noop/双向/重复/缺失/混pin/trash/隐藏/未加载/对象字段不变、共同限额和旧JSON保存备份往返），typecheck/build可impl-safe，输出完整报告。Rust测试代码覆盖旧7/8/10列、repeat-init、全数组reverse/pin+trash、非空交易、约束故障rollback、文件close/reopen及旧serde缺pin；由root顺序cargo check/test执行同生产helper并读完整输出，>0 meaningful用例，TEMP证据。root旧库已backup，启动新EXE前后只读旧列/schema+全部字段比较，新列另检；失败立即停止启动，报告而不自动恢复。

作者体验：可选字段保旧数据可读；简单数组槽位算法，无秩/ID配置层；SQL显式列、测试直接消费生产helper。回滚仅本轮代码/依赖，已迁移数据库保持ADD列并停旧版写入；不能用旧SELECT*hash否定合法新列。

### S2：真实抓手、置顶区域与取消生命周期（front）

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.1] 正常Esc/pointercancel在finish先失效再由仍有效的父owner延后reset；Provider销毁/旧generation回调因已失效只return，不setState。reset请求需挂载/generation/context守卫，避免insertion cleanup中更新或抢新状态。键盘drop/Esc后仅在同页面、无弹层、业务可用时恢复对应抓手焦点；modal/导航/blur/hidden取消不抢焦点。该焦点细化保护既定键盘体验，不新增产品分支。

目标G1/G2/G3；消费A1/A2：操作可发现，视觉与业务分离，同组drop-only，取消不误保存。

关键文件：src/NotesView.tsx Card/NotesView；可新增src/NoteSorter.tsx专门接现代库；src/styles.css grip/pin/section/overlay；src/App.tsx modal-aware业务开关/dragContext。首读排序组件session/finish/cleanup，再看NotesView各组index。目标形态为一个Provider生命周期拥有者、一个纯卡片展示、明确组ID；不是自造指针物理系统。片段见现代Provider闭环，状态机/共享契约强触发已附。

步骤：1 固定react/dom0.5.0并核实际类型；2 Card根ref+grip handleRef，取消旧useSoftDrag使用；3 default Pointer/Keyboard/SortableKeyboard/OptimisticSorting保留，小距离阈值仅grip、中文Accessibility公告/操作说明；4 stable pins区及普通组、真实index/type/accept；5 Overlay常驻纯展示不可互动/aria-hidden；6 finish验证与App一次commit；7 blur/visibility/modal/context/unmount取消与真实Provider重建；8 gentledrop/阴影/布局CSS，OFF duration0/Feedback0/null overlay。

分组：pins共同组；normal grid/read共同组；normal date每个当前日期组。共同先pin后normal60，加载+60，总结果数不变，过滤同时作用两区。标题轻提示抓手、pin数量；Pin/PinOff按钮中文title/aria-pressed；回收站无grip/pin。正文编辑/选择、完成、复制等沿原回调；纯Overlay不重复注册sensor，不能复制交互操作。

drop：capture当前组可见IDs和源index、完整数据版本；source.initialIndex/index在optimistic下可变化且source/target可同ID，不能用legacy比较。再次验same token/data，keyboard直接按合法索引；pointer从本次nativeEvent pointerup读最终client坐标，必须处于group bounding rect与viewport交集，组内空隙可接收。outside/canceled/stale/noop/跨组/非法index均无commit，临时DOM通过安全新Provider回到权威顺序。

取消：query/tag/status/layout/limit/navigation、业务notes外部变化、composer/quickopen/tagpicker/AI、blur、hidden和unmount均使session失效在先。stop canceled不等清sensor，真正unmount旧Provider→manager.destroy→registry.sensors.destroy→活动Pointer/Keyboard.cleanup，随后新manager。[修订: PLAN_DEFECT-R1.1] 销毁/无效callback只return；正常sensor canceled由当前owner的受守卫异步reset收口，不在insertion cleanup直接setState。应用监听effect有cleanup；旧generation晚回调只return。库永久window noop touchmove例外保留，不声称全库监听都卸除。实现不得私改库或伪造全局Esc。

验收/分层：impl静态/类型/纯drop判据与数据测试，完整命令报告；root在原5175复现红例后实拖新双向并还原原8条，隔离5181 70active/2trash/3pin/1tx实测网格/阅读/同日、pins内部/cross区拒绝/outside/键盘/Space/Enter/Esc、关动态、过滤槽位/加载/刷新、CtrlK取消与下一次正常操作、pin/unpin规范位置、编辑/草稿/复制/软删撤销恢复/首次perm提示、图回归、浅深390px。每项截图/可见顺序证据TEMP/root-verification。root不能输入的真实blur/hidden/触屏/读屏/native IME标未测，纯模拟/源码不替实测。

作者体验：职责集中NotesView/Sorter，短纯函数和sessionref；无每帧React业务/SQLite写入。拖动抓手可键盘发现，正文操作不劫持；关动态仍排序。用户舒适感用真实UI确认，不能用CSS或Node帧计时声称GPU丝滑。

依赖S1数据契约（front可与backend在Gate2后并行）。回滚仅本轮前端差量/锁文件闭包；已迁移库按S1停机保留。库不能完成公开取消/类型无法闭合，停止并DELEGATE_ACTION，不私补无限sensor；不提交仅能摇晃的降级假排序。

### S3：依赖、文档、验证与0.5.4制品（front/root/reviewer分层）

#### 本轮修订说明

[修订: PLAN_DEFECT-R1.2] 按plan-review canonical修正实施审查分流：仅局部、低风险、无新决策三条件同时成立才IMPL_DEFECT回下一impl；其余REVISE默认PLAN_DEFECT原地修计划重Gate，问题模型冲突先PROBLEM_DEFECT。不是用CODE_DEFECT泛指所有代码问题。任务结构与已锁验收/回滚不变。

目标G1–G3、消费A3：新制品和当前事实可追溯，不混合Git发布、不写假完成。

front关键文件/首读点：package.json/package-lock.json两个新精确包；src-tauri/tauri.conf.json version0.5.4；public/third-party-licenses新增实际closure原始许可。backend只Cargo自身版本，不升级旧依赖。目标形态是有限闭包与同一项目版本，不引入helpers或新Rustcrate；字段片段已足够，版本/许可清单文字足够无需新增运行代码片段。

root文档：README能力/验证/下一步；CHANGELOG0.5.4；docs/Project.Progress当前/边界；Soft.Interaction真实排序与旧反馈区分；Workbench.Layout pin/日期/共同批次；Release.Testing Rust>0/人工矩阵；新Note.Ordering设计/兼容与Release.Verification.0.5.4完整证据；AGENTS新文档索引。先呈清单/提纲，已有Q0/Q1+项目同步授权执行；不得擅归档旧feature/抹旧失败/跨功能候选池。

顺序与证据：front impl自证npm test/typecheck/build并审closure，backend check低并行，分报告；root再独立新npm全量test/build、cargo locked check/test jobs1（重资源不并行），读完整exit/输出。root比较实际gzip基线entry138.58kB/CSS8.72/图26.17/worker7.03，全新块分别列出，不用tarball代包体。root实际UI后npm run release:windows -- --ci(CARGO_BUILD_JOBS1)→EXE/NSIS/MSI版本/时间/SHA→仅自建Hidden进程10秒alive/Responding→受控结束（不是正常退出/完整UI）→旧库逐字段对比新列检查。

root必要清单：保护用户8条/SQLite3notes0tx；自有数据只可恢复清理；隔离origin导入不替换用户库。download超时不算导出通过，备份纯JSON往返与实际filechooser导入/下载分别报告。安装卸载/原生完整GUI/IME/缩放/触屏/读屏/GPU/长期稳定性未测由human后续承接，责任不空白，不冒称完整MVP/零bug。

fresh reviewer（未做本轮计划/实施）读before54实际差量、新文件、lwplan、impl两报告、root全证据/currentdocs，产review_notes_impl_r1.md，十字段/双结论/作者体验门；root完整复核。[修订: PLAN_DEFECT-R1.2] 协议REVISE先判PROBLEM_DEFECT；无问题模型错误且局部、低风险、无新决策同时成立才IMPL_DEFECT→下一impl并给三条件证据；目标锁偏移/反目标触碰/作者体验或声明可读性退化需改计划时以及其他REVISE均PLAN_DEFECT→原地plan修订重Gate，不跳关。BLOCKED/USER_CONFIRMATION_NEEDED业务留空；只适用合同限定且不能把专业数据/安全验收交用户确认。未有证据只“未验证/待现场”，不能交付完成结论。

作者体验：文档解释为什么/当前边界，短且可点击；报告保留失败、版本/hash，维护者可顺读而不拼散落日志。回滚源代码仅当前差量，制品不提交；混合initial工作区来源不明，保持未commit/push且给英文conventional建议，不凭长期授权发布未知全部。release失败保留完整输出/候选失效，不分发旧EXE冒充0.5.4。

## 实施依赖、风险与停止策略

1. readiness2 PASS→本计划Gate1→fresh Gate2+root复核→明确续行授权Q0/Q1记录→S0→backend S1；front S1→S2+S3 metadata/notice可同backend并行，文件所有权不重叠。
2. 合并后root验证→受影响文档实际同步→fresh ReviewImpl→必要修复重验→制品/最终SHA核验。root自己提写lwplan，不能充fresh Gate2/ReviewImpl。
3. 尽量最小新Sorter，拒绝第二order authority/通用框架；同文件功能/保行为helper步骤分开记录。
4. 关键不确定性U已由发布物关闭；真实取消/新包/数据安全仍是待验，不属于默认成功。新假设/风险/阶段切换即时记录README/clarifications。
5. sensor未清/晚drop/外区写入：停止发布，回S2；旧字段任何改变/迁移异常：停止新进程，保留库/备份并报告，不自动回滚真实库；资源不足：保留失败，低并行串行重试，不无边界清缓存。
6. 库version0.5.0不套latest可能新增key配置；Accessibility/Feedback/Keyboard按实装固定公开type核，不改默认键盘可用性。类型/行为冲突回root，不能自行换库。
7. PWA长closeBundle49.2s历史warning、ExperimentalWarning、旧500条p95超预算都保留；本轮不声称解决旧构图性能。

## 澄清与批量委托模板

只对阻塞范围/验收/回滚的真正新决策提问。how已在授权内且证据能补时DELEGATE_ACTION，由root顺序承接，不递归agent。格式：

```text
【DELEGATE_QUESTION】
Q1[P0/P1/P2]：事实、原锚点、影响范围/验收/回滚
A) 推荐项（原因）；B) 替代项（权衡）[可C/D]
同阶段阻塞按优先级一次提交，答复由root写clarifications后resume。
【DELEGATE_ACTION】
操作：supplemental-research / 验证承接；原事实、精确参数、期望产物与结论边界。
```

## Gate-1自检与Gate-2入口

#### 本轮修订说明

[修订: PLAN_DEFECT-R1] 已先读完整初步defect_source再复核当前lwplan/canonical；只修主链取消、S2生命周期与S3协议，修订节均标记，未删除已实施文本（目前源代码零实施）。本Gate1仍仅到review，R1 REVISE不得冒称放行；需要fresh R2 + root复核。

root规划者本轮全文核对；这是存在性放行到review，**不准直接impl**。

|T3必备项|存在证据|结论|
|---|---|---|
|目标锁/反目标/不影响项|范围G1–G3/A1–A3，每S0–S3消费映射|PASS|
|受影响文件+首读锚点|接口矩阵/各工作包路径函数+章节|PASS|
|任务目标/步骤/验收/回滚/依赖|4个可识别主要工作包，helper与功能分开|PASS|
|验证责任分层|每包impl-safe/root非safe分流/证据/缺证约束|PASS|
|verification三元组|两impl_report、TEMP/root、release proof、freshreview+所有者/不足结论|PASS|
|作者体验门独立|每包维护者顺读/有限结构/可发现操作声明|PASS|
|主链总览|现状→改动→不改层→分层原因先于工作包|PASS|
|research事实映射|12行事实→实现/验证/口径/责任|PASS|
|片段闭环充分性|呈现→sensor→drop/取消→App合并→SQL保存读回全链，明确触发|PASS|
|Gate双阶段规则|本Gate1，fresh Gate2主检+root全复核；失败回plan/澄清|PASS|
|澄清触发/批量模板|本节前模板/P0–P2和动作分流|PASS|
|风险/降级/失败策略|S0–S3及停止策略；旧EXE写入不兼容明确|PASS|
|T2输入/输出/边界/分层回归|接口矩阵、S1槽位/S2drop门禁、测试矩阵|PASS|
|T3接口/状态机/迁移/停机|字段矩阵、cancel状态、7/8/10列迁移与旧库异常停机|PASS|

Gate2 reviewer需顺读闭环并逐包复核锚点、目标形态、片段触发/充分性、责任三元组、作者体验，不能只数标题。报告必须完整十字段/P1–P9/allow_enter_impl。root读全文复核PASS后才授权两impl。新plan/source缺口→原地修plan重Gate；不得以用户连续开发授权省略技术门禁。

contract drift：无新增产品/责任漂移；legacy原候选由modern正式事实覆盖已在基线/两readiness保留。planner的transition null spread风险在S2明确duration0，属于how补证不新增需求。规划接管与中断留痕，原报告失败不删。无跨功能事实候选。
