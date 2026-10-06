# 记录排序与置顶：前端实施报告 r1

最新取消清理补充（后于下文焦点修正2）：root现场日志在18:55:53.968、18:56:39.534新增两条 `useInsertionEffect must not schedule updates.`，因此旧构建与焦点绿例不能代表当前取消清理无错。已按root授权补齐同次卸载的父layout stop→子Provider insertion destroy时序；当前源码类型检查exit0、相关11项测试exit0、diff-check exit0。当前补丁没有重跑build/native/UI，root需重新验证现场错误与最新制品。新增测试首跑exit1及修正、固定库和React实际调用链见本节；不冒称release。

## 取消清理补实施：同次卸载的时序修正

- 定位证据：实际 `node_modules/@dnd-kit/react/index.js:153` 的monitor.dragend在callback存在时调用trackRendering；`:58` 的Renderer无论业务callback是否返回，都startTransition并setTransitionCount。`:194` 的useStableInstance insertion cleanup无条件调用manager.destroy。
- 实际 `node_modules/@dnd-kit/abstract/index.js:1521` 的manager.destroy先stop canceled；stop派发dragend。因此旧业务finish即使因owner无效return，也挡不住库Renderer状态更新。不是HMR推断，也未修改node_modules或压日志。
- 实际 `node_modules/react-dom/cjs/react-dom-client.development.js:15562` 的函数组件删除遍历先执行该父组件insertion/layout cleanup，再递归孩子；父layout cleanup位于孩子Provider insertion cleanup之前。采用这个本机实际React时序，不让stop落在自己的insertion callback内。
- `src/NoteSorter.tsx`（modified，S2，change_purpose=取消生命周期）：新增约15行SortLifetime边界，key移到边界；layout cleanup先owner.alive=false/session.valid=false，再公开actions.stop({canceled:true})；同一次卸载继续由原Provider destroy清registry/sensors，新Provider仍创建新manager。setup恢复当前owner.alive以支持实际src/main.tsx StrictMode模拟layout cleanup/setup；旧key不会因新keysetup复活。合法drop、焦点等待、normalcancel异步reset、hasFocus/modal/blur/hidden守卫保持。
- `tests/noteSortLifetime.test.mjs`（added，S2，change_purpose=生产cleanup入口合同）：从实际生产文件加载SortLifetime函数，以受控layout-effect适配器执行实际setup/cleanup，断言stop收到canceled时owner/session已无效、StrictMode setup可恢复仍挂载owner但不复活session、manager尚未绑定也可失效。没有重写一份生产逻辑；不证明React真实遍历、sensor实际卸载或UI错误消失。
- IMPL_DEFECT三条件（root已认可）：局部仅S2时序；低风险不触数据、保存或合法提交；无新产品/两阶段取消/库替换决策。使用原计划invalidate→stop→真实destroy，不延后destroy，不减少清理。goal_lock_check=支持G1/G3；anti_goal_touch_check=无A1–A3扩展；authoring_ergonomics_notes=一个短生命周期边界，注释解释为何父layout先stop，不新增配置/调度框架。contract_drift_reports=已向root报告，root批准原S2 IMPL_DEFECT，未发现需要改产品边界的漂移。
- 失败留证：只读定位批命令末尾误查 `node_modules/@dnd-kit/react/utilities/index.js` exit1，错误原文 `IO error for operation ... 系统找不到指定的路径。 (os error 3)`；随后读取实际package.exports明确文件为utilities.js，未误判库能力缺失。测试首跑因本机typescript7.0.2默认入口只有version、旧ts.createSourceFile/ScriptTarget未导出而exit1；改用既有Node stripTypeScriptTypes加载实际函数，不安装或更换依赖。ExperimentalWarning保留。
- impl-safe当前证据，owner=impl：`npx tsc -b` exit0，完整输出为空；`node --test --test-concurrency=1 tests/noteOrder.test.mjs tests/noteSortLifetime.test.mjs` 首跑exit1、修正后exit0（完整输出下附）；`git diff --check` exit0，无空白错误，仅混合工作区LF→CRLF提示。conclusion_if_missing=不能把类型/纯入口测试冒称实际UI清理通过。
- coordinator_handoff_verifications，owner=root：reload当前源后实际CtrlK/layout/navigation/data变化中途取消、下一次正常排序、Enter/Esc条件焦点、dev.logs cutoff后error/warn；evidence_expected=操作顺序/规范数组/焦点与新日志完整结果。conclusion_if_missing=当前现场错误尚未确认消失；不发布当前候选。root报告旧release进程已CtrlC exit1，该release不是本agent执行或成功证据。当前补丁没有build/native/UI/DB/Git操作，重资源仍空闲。
- 可直接回滚本次SortLifetime局部差量和新增测试；不得回退合法焦点修正或未知工作区。已见失败/其他未测项保留。本小补丁无新增跨功能事实；提交建议仍为 `feat(notes): persist manual ordering and pinned records`。

### 当前相关测试完整输出：首跑失败

```text
TAP version 13
# Subtest: reordering both ways replaces only visible slots and preserves original records
ok 1 - reordering both ways replaces only visible slots and preserves original records
  ---
  duration_ms: 2.6593
  type: 'test'
  ...
# Subtest: empty, duplicate, unknown, stale, trash and mixed pin requests are rejected
ok 2 - empty, duplicate, unknown, stale, trash and mixed pin requests are rejected
  ---
  duration_ms: 0.4289
  type: 'test'
  ...
# Subtest: pin changes only one field without moving canonical slots or graph semantics
ok 3 - pin changes only one field without moving canonical slots or graph semantics
  ---
  duration_ms: 0.5573
  type: 'test'
  ...
# Subtest: production view boundary rejects cross-date, cross-pin and hidden IDs before slot merge
ok 4 - production view boundary rejects cross-date, cross-pin and hidden IDs before slot merge
  ---
  duration_ms: 15.5635
  type: 'test'
  ...
# Subtest: one quota follows stable pins then ordinary date groups; trash ignores pin partition
ok 5 - one quota follows stable pins then ordinary date groups; trash ignores pin partition
  ---
  duration_ms: 0.6715
  type: 'test'
  ...
# Subtest: old and new JSON backups and local persistence keep order and metadata
ok 6 - old and new JSON backups and local persistence keep order and metadata
  ---
  duration_ms: 0.8735
  type: 'test'
  ...
# Subtest: actual move indices include both directions, noop and illegal indices
ok 7 - actual move indices include both directions, noop and illegal indices
  ---
  duration_ms: 0.36
  type: 'test'
  ...
# Subtest: final pointer coordinates must be inside current group intersected with viewport
ok 8 - final pointer coordinates must be inside current group intersected with viewport
  ---
  duration_ms: 0.2485
  type: 'test'
  ...
# Subtest: actual drop gate uses final pointerup; keyboard ignores pointer geometry independently
ok 9 - actual drop gate uses final pointerup; keyboard ignores pointer geometry independently
  ---
  duration_ms: 0.4996
  type: 'test'
  ...
# file:///E:/project-funny/biji/tests/noteSortLifetime.test.mjs:8
# const source = ts.createSourceFile('NoteSorter.tsx', readFileSync(new URL('../src/NoteSorter.tsx', import.meta.url), 'utf8'), ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX)
#                                                                                                                                               ^
# TypeError: Cannot read properties of undefined (reading 'ESNext')
#     at file:///E:/project-funny/biji/tests/noteSortLifetime.test.mjs:8:143
#     at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
#     at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:681:26)
#     at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:117:5)
# Node.js v22.23.1
# Subtest: tests\\noteSortLifetime.test.mjs
not ok 2 - tests\\noteSortLifetime.test.mjs
  ---
  duration_ms: 143.4975
  type: 'test'
  location: 'E:\\project-funny\\biji\\tests\\noteSortLifetime.test.mjs:1:1'
  failureType: 'testCodeFailure'
  exitCode: 1
  signal: ~
  error: 'test failed'
  code: 'ERR_TEST_FAILURE'
  ...
1..10
# tests 10
# suites 0
# pass 9
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 384.6356
exit_code=1
```

### 当前相关测试完整输出：改加载方式后

```text
TAP version 13
# Subtest: reordering both ways replaces only visible slots and preserves original records
ok 1 - reordering both ways replaces only visible slots and preserves original records
  ---
  duration_ms: 3.9089
  type: 'test'
  ...
# Subtest: empty, duplicate, unknown, stale, trash and mixed pin requests are rejected
ok 2 - empty, duplicate, unknown, stale, trash and mixed pin requests are rejected
  ---
  duration_ms: 0.5683
  type: 'test'
  ...
# Subtest: pin changes only one field without moving canonical slots or graph semantics
ok 3 - pin changes only one field without moving canonical slots or graph semantics
  ---
  duration_ms: 0.6216
  type: 'test'
  ...
# Subtest: production view boundary rejects cross-date, cross-pin and hidden IDs before slot merge
ok 4 - production view boundary rejects cross-date, cross-pin and hidden IDs before slot merge
  ---
  duration_ms: 16.7947
  type: 'test'
  ...
# Subtest: one quota follows stable pins then ordinary date groups; trash ignores pin partition
ok 5 - one quota follows stable pins then ordinary date groups; trash ignores pin partition
  ---
  duration_ms: 0.7665
  type: 'test'
  ...
# Subtest: old and new JSON backups and local persistence keep order and metadata
ok 6 - old and new JSON backups and local persistence keep order and metadata
  ---
  duration_ms: 0.96
  type: 'test'
  ...
# Subtest: actual move indices include both directions, noop and illegal indices
ok 7 - actual move indices include both directions, noop and illegal indices
  ---
  duration_ms: 0.398
  type: 'test'
  ...
# Subtest: final pointer coordinates must be inside current group intersected with viewport
ok 8 - final pointer coordinates must be inside current group intersected with viewport
  ---
  duration_ms: 0.2746
  type: 'test'
  ...
# Subtest: actual drop gate uses final pointerup; keyboard ignores pointer geometry independently
ok 9 - actual drop gate uses final pointerup; keyboard ignores pointer geometry independently
  ---
  duration_ms: 0.6244
  type: 'test'
  ...
# (node:57964) ExperimentalWarning: stripTypeScriptTypes is an experimental feature and might change at any time
# (Use `node --trace-warnings ...` to show where the warning was created)
# Subtest: production layout cleanup invalidates owner and session before canceled stop
ok 10 - production layout cleanup invalidates owner and session before canceled stop
  ---
  duration_ms: 2.6546
  type: 'test'
  ...
# Subtest: production cleanup also invalidates an owner before manager binding is ready
ok 11 - production cleanup also invalidates an owner before manager binding is ready
  ---
  duration_ms: 0.2215
  type: 'test'
  ...
1..11
# tests 11
# suites 0
# pass 11
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 379.74
exit_code=0
```

---

最新状态补充：下文保留首交接、第一次焦点修正的历史命令和失败。root 再测“先reset后commit”仍出现Enter后BODY，故本轮继续作同S2局部修正：焦点请求等待实际预期order落地才消费。最新同源typecheck、9项受影响测试、build、diff-check均exit0；最新入口gzip176.93 kB（对before54 +38.35）、CSS8.90/图26.17/worker7.03；真实Enter焦点绿例仍由root承接，不把早先78项全量当新焦点行为证明。末尾“焦点修正2”记录精确差量和完整当前命令。

root随后独立实际绿例回传：reload最新source，Space000→ArrowRight→Enter，pins[001,000,002]、activeElement BUTTON/handle000；紧接Space000→ArrowLeft→Enter恢复[000,001,002]且focus000；再Space000→ArrowRight→Esc保持[000,001,002]且focus000。连续合法双向+取消3次操作为root现场证据，最终详细记录仍落root-verification；本agent没有操作GUI，不把回传当自己的impl-safe测试。初始红例和首修仍红继续保留。

## 基本信息

- feature_name：note-order-and-pinning。
- impl_round：1（front）；backend 独立报告为 impl_report_backend_r1.md。
- date：2026-10-04。
- lwplan_version：Gate-2 R2 对象，269 行，SHA256 `257CB0E8D6EB1A58827B91E6351EE43769B100E804AC69A84D379111C7D9BFAE`。
- 授权：root 明确回传 fresh Gate-2 R2 PASS/allow_enter_impl yes、全文复核及 Q0/Q1 连续授权后开始。遵循 safe-code-changes 和 verification-before-completion；无递归委派。
- 比较基线：`C:/Users/ZXL/AppData/Local/Temp/qingjian-note-order-20261004/before/` 的实际 0.5.3 源码/元数据，未以 HEAD 代本轮差量。未 restore/reset/clean、commit/push，未触 .serena、凭据、真实库、GUI、服务或 EXE。

结论仅限前端源码实施及本地单元/类型/构建证据。真实拖拽、取消焦点、浏览器存储刷新、SQLite 往返和 Windows 制品由 root 承接；不称完整 MVP、原始拖拽症状或平台稳定性已通过。

## 变更事实与计划对照

|path|change_type|change_purpose / key_changes|related_tasks|
|---|---|---|---|
|src/types.ts|修改|Note 新增可选 pinned；没有前端 position/sortOrder；AppData.version 仍 1|S1|
|src/noteOrder.ts|新增|规范数组可见槽位合并、pin 单字段切换、当前筛选/日期/pin 组最终门禁；实际生产 move 索引和 pointerup/keyboard 落点纯判据|S1/S2|
|src/notePresentation.ts|修改|stable pins→normal、共同限额；date 只普通区按日降序，pins 不按日拆；trash 不 pin 分区；实际 rendered groups|S1/S2|
|src/App.tsx|修改|新增 onReorder/onPin、最新完整数组再次校验；businessEnabled 独立于 motionAllowed，传完整 notes 数据版本|S1/S2|
|src/NotesView.tsx|修改|NoteCard 根 ref 与抓手 handleRef；移除卡片 useSoftDrag 调用；显式 Pin/PinOff、独立 pins 区、纯无交互 Overlay、保留原正文/完成/复制/编辑/回收回调；60/+60|S2|
|src/NoteSorter.tsx|新增|一个 modern Provider owner、真实 index/group/type/accept、小距离 Pointer/default Keyboard+sortable 插件、中文 Accessibility；drop-only；session/context/data/generation 守卫；blur/hidden/unmount 与新 manager；正常 canceled 延后 reset、无效旧回调 return；条件键盘焦点；OFF duration0/Feedback0/Overlay null|S2|
|src/styles.css|修改|轻量一行提示与 pins 行标题、紧凑间距、pin 状态/拖动占位/纯预览；未增加默认无 pins 大块说明留白|S2|
|tests/noteOrder.test.mjs|新增|9 项实际生产函数合同：双向/隐藏槽位/非法请求/pin 字段和图语义/跨日期分区/共同批次/旧新备份/最终落点与键盘独立|S1/S2|
|package.json / package-lock.json|修改|自身 0.5.4；精确 react/dom 0.5.0；安装新增 7 包，无旧依赖 version 变化；保留原 LF，未增加 helpers/legacy|S3|
|src-tauri/tauri.conf.json|修改|自身 version 0.5.4；其余配置保持|S3|
|public/third-party-licenses/dnd-kit-{abstract,collision,dom,geometry,react,state}-0.5.0-MIT.txt|新增|六个实际安装包的原始 MIT 文本逐份复制并核 hash|S3|
|public/third-party-licenses/preact-signals-core-1.14.4-MIT.txt|新增|实际新增传递依赖 MIT 原文|S3|
|public/third-party-licenses/tslib-2.8.1-0BSD.txt|新增|实际复用传递依赖 0BSD 原文；不误称 MIT|S3|
|本报告|新增|本轮证据/失败/待验与回滚边界|S3|

S0/Rust/Cargo 与用户文档不属于本 agent 文件所有权，未改；root/backend 自行履行对应工作包。static hash 核对 store.ts、NoteComposer.tsx、SoftInteraction.tsx、noteGraphModel.ts、useNoteGraph.ts、NoteGraph.tsx 六文件与 before54 相同。

## 目标对齐

- goal_lock_check：G1 以抓手 Sortable、同组 drop-only 数组槽位与原保存链实现；Web/桌面真实重启证据尚待 root。G2 pin 只改字段、数组不动，派生独立区域；旧无字段当 false。G3 纯合并返回原 Note 对象、隐藏/trash/未加载槽位不动，不改正文/updatedAt/scheduledDate/done；图 id/content key 测试保持。真实编辑/回收/恢复回归待 root。
- anti_goal_touch_check：未使用装饰回弹冒充排序、未随 motion 开关 disable 业务；无跨 pin/日期自动改 metadata，无第二顺序权威、云/多选/CRDT；未顺修 store 导入校验、空桌面库回退、双保存 effect、编辑器/图/AI；无混合 Git 或制品发布。
- authoring_ergonomics_notes：顺序操作集中一个有限纯模块，生命周期集中一个有界 Sorter；App 仍是完整数组 owner，NotesView 卡片动作保持；声明只新增可选 pin、两精确依赖和同版号，没有配置框架。正常 canceled 与旧 owner 回调分支可顺读，microtask 再验 mounted/identity/context。Provider 不复用外部 destroyed manager；render context/data 变化先失效旧 owner，再以新 key 真卸载。焦点请求只在同 context、业务可用、页面 visible 且 document.hasFocus 才执行；modal/nav/blur/hidden 不主动抢回。

## impl-safe 验证记录

完整输出附后，原日志在 TEMP；命令都无以管道尾部替换验证退出码。读取日志时分段 Select-Object 仅用于显示，不能取代前一条原命令退出码。

|命令/步骤|退出码与实际结果|evidence|owner|conclusion_if_missing|
|---|---|---|---|---|
|npm install --save-exact @dnd-kit/react@0.5.0 @dnd-kit/dom@0.5.0|0；added 7 packages|下方原输出；安装后实际 package/type 读取|front impl|不能称固定依赖已接|
|node --test tests/noteOrder.test.mjs（初步数据合同）|0；7/7，后新增 view/drop gate 两项|本轮工具完整 TAP；最终全量覆盖同一集合|front impl|不能称数据合同通过|
|npx tsc -b（首次）|1；两个 callback TS7006 implicit any|下方完整两 error|front impl|保留失败，不以源码猜测编译|
|npx tsc -b（修复后）|0；无输出|明确 DragOverEvent/DragEndEvent，实际重跑|front impl|类型未验证|
|npm run build（首次接线）|0；入口176.79gzip，CSS8.90；chunk warning|本轮工具完整输出，下方摘要与最终完整输出|front impl|构建未验证|
|node --test tests/noteOrder.test.mjs（9项）|0；9/9|本轮工具完整 TAP；最终全量同源|front impl|最终门禁未验证|
|npm test（焦点修正前）|0；78/78，0fail/skip/cancel；旧69保留+新9|TEMP/front-tests-r1.log，下方原完整输出|front impl|不能称全量测试通过|
|npm run build（焦点修正前）|0；2487 modules；入口176.82gzip、CSS8.90、图26.18、worker7.03|TEMP/front-build-r1.log，下方原完整输出|front impl|不能称最终构建通过|
|npx tsc -b（焦点修正后）|0；无输出|本轮实跑，后续build再含typecheck|front impl|修正后类型未验证|
|npm test（最终焦点修正后）|0；78/78，0fail/skip/cancel|TEMP/front-tests-r1-final.log，末尾完整输出|front impl|最终同源测试未验证|
|npm run build（最终焦点修正后）|0；2487 modules；入口176.82gzip、CSS8.90、图26.17、worker7.03|TEMP/front-build-r1-final.log，末尾完整输出|front impl|最终同源构建未验证|
|git diff --check|0；仅 LF→CRLF warning，无 whitespace error|TEMP/front-diff-check-r1.log，下方完整输出|front impl|差量格式未验证|
|before54 lock/原文许可/保护文件 hash核查|0；old dependency version changes0、8 notice hash match、6 protected frontend hash match|下方静态命令和输出|front impl|依赖/范围保持未验证|
|git diff --no-index before/src src；package/lock差量读取|1（no-index 有差量的正常退出），非测试失败|实际前端差量仅7源码文件；规范化 LF 后 lock85+/2-，package仅2依赖+自身版本|front impl|不能声称本轮与初始混合差量可区分|

最终 bundle 与 root 给定 before54 gzip：入口138.58→176.82（+38.24 kB）、CSS8.72→8.90（+0.18）、图26.17→26.17（共享 chunk 链接/hash 变化；图源 hash 未变）、worker7.03→7.03（raw JS，无 gzip 输出）。此前修正前构建的图26.18真实输出仍保留。Workbox2.20gzip 保持。没有把 tarball 或初始 JS 代总增量。入口 minified549.54 kB 新触发 >500 kB warning；并无本轮包体达标目标或 GPU 性能结论。

## 已见失败、警告与恢复

1. 初次大批读取 output 被预算截断，后按单文档/片段完整重读，包括最终 LW；未把截断当已读。只读预读阶段也有一次合并 CSS 输出截断，拆分读取补齐。
2. `Get-Content -Raw tsconfig.app.json` 猜测路径不存在，exit1。实际 `tsconfig.json` 成功读取，未改配置、未扩 scope。
3. 首次 typecheck exit1，两处中文 Accessibility callback 隐式 any。显式固定公开事件类型后重跑 exit0，最终 build 含全类型检查 exit0。不是两次 tsc 失败命令。
4. PowerShell 序列化元数据一度引入 CRLF，no-index 显示全 lock noise；仅还原这三个自身修改文件原 LF，lock 差量恢复85+/2-。no-index exit1 表示差量存在；Git CRLF 提醒与 ExperimentalWarning 保留。
5. 两次 build 均有 minified chunk >500 kB warning。最终全量 tests 中 stripTypeScriptTypes ExperimentalWarning 为已有图评分测试真实输出。未静默修改 chunkLimit、Vite、测试脚本或图模型来消警告。
6. 旧 PWA closeBundle 长耗时、旧图500条p95性能缺口属于历史事实，本轮不声称解决。本次两次实际 build 未再见 closeBundle 超时warning，也不能据此抹历史失败。
7. root隔离tab3真实键盘红例：Space→ArrowRight→Enter确实排序，但结束activeElement为BODY/data-note-handle=null；同tab的Space→ArrowLeft→Esc保持权威顺序且焦点回order-fixture-000。root明确指示局部纠正合法commit后dataVersion重挂的focus请求时序。已把合法finish的reset()/条件focus ref准备移到唯一onReorder前，queued owner/generation/context守卫照旧；未删除hasFocus/visible/modal/blur边界。修后重新tsc、78项全量tests、build和diff-check均exit0，root承接真实Enter绿例。实际固定React Renderer:index.js:58–69 uses startTransition而非flushSync，仅为已读源码事实；不拿静态推断替代真实红例。root试读document.hasFocus被browser proxy拒绝TypeError属于root工具失败，不冒充本agent执行或据其猜隐藏tab因果。

## coordinator_handoff_verifications

|待验项/移交原因|建议承接方式 / evidence_expected|owner|conclusion_if_missing|
|---|---|---|---|
|真实 Pointer 双向排序、pins/日期/跨区/outside拒绝、键盘Space/arrows/Enter/Esc和之后再次操作|root隔离5181真实UI，截图+前后可见UUID顺序+存储计数，normalcancel/Provider销毁无警告与焦点证据|root|原始体验与取消生命周期未验证|
|modal/nav/query/tag/status/layout/load/外部notes变更、blur/hidden/unmount的销毁/无晚提交|root实际可操作输入+清理回归；不能输入native项明确未测，静态源码不代现场|root|对应真实资源/焦点行为未验证|
|关动态/系统reduce仍排序、正文选择/完成/复制/编辑/草稿/回收撤销恢复/首次永久删除提示、浅深390px|root真实操作矩阵和截图，不把Node判据当UI|root|这些交互/舒适性未验证|
|浏览器reload、筛选隐藏槽位、70/60加载+60、备份真实导入/导出下载|root隔离origin fixture与真实操作；本纯JSON/localStorage替身往返仅证明生产函数数组保留|root|真实浏览器往返/下载能力未验证|
|Rust旧7/8/10列/transaction rollback/close reopen与真实旧库旧字段保持|backend生产helpers测试，由root锁定jobs1运行及TEMP旧新字段比较；front未运行SQLite或Cargo|root/backend|迁移/桌面持久化未验证于本报告|
|同版0.5.4新EXE/NSIS/MSI/hash/受控新进程烟测/完整原生体验|root发布核验及独立ReviewImpl；原生GUI/IME/缩放/触屏/读屏/安装/GPU/长期稳定性缺证时列未测|root；现场不足由human后续承接|不称新制品/完整MVP已验收|

root已回报隔离UI最初pin pointer双向+reload绿例，属于root进行中的报告，未在本前端impl自证中冒充独立验收；等待root完整报告和fresh ReviewImpl。真实库、Windows及当前用户文档不由本agent执行/写成已完成。

## contract_drift_reports

无阻断 drift/stale/mirror mismatch。消费的是 Gate-2 R2 修订 normal canceled/旧回调分流和条件焦点，不使用原 R1 early-return 片段。为可测试生产边界，将 App现有同组最终校验和 Sorter pointer/keyboard 判据提入有限 noteOrder，未改变已锁行为/接口权威。已向 root 报出源码冻结、类型失败及修复、实际依赖闭包、包体警告、全部验证退出码；未替 root 作产品风险决定。

## 未完成、风险与审查重点

- 本前端impl-safe集合通过，但无真实Modern sensor/React销毁E2E单元；focus、normalcancel reset与晚 callback 需root实际UI/fresh审查，不以类型证明体验。
- notes数组、query/tag/status/layout/limit/businessEnabled变化均重建 Provider；正常键盘合法drop的数据版本变化也建新Provider，条件焦点请求需root现场确认。仅drop合法路径调一次onReorder，无dragover业务写入。
- 库0.5.0永久window noop touchmove patch属已知非活动监听例外，不声称“所有库全局监听归零”。
- 原双effect/桌面空库回退/backup数组级校验保留；旧exe写新DB会丢pin/position的backend兼容风险应由root公开，不降级写真实库。
- 发布/当前用户文档/独立审查仍未完成；本报告不可作为发布放行。

## 回滚信息

前端源码/依赖/元数据：可直接回滚**本轮差量**，以before54对照手工还原自己新增内容，保护混合初始工作；不可Git restore整个文件/clean。真实数据库若已经迁移：需人工介入，由root保持新增列并停止旧版写入，不能恢复真实旧库或用旧EXE覆盖。无本agent触库回滚动作。

建议英文提交消息：`feat(notes): persist manual ordering and pinned records`。无跨功能事实。

## 完整命令输出附录

### 安装、首次失败与修复

```text
$ npm install --save-exact @dnd-kit/react@0.5.0 @dnd-kit/dom@0.5.0
added 7 packages in 5s
113 packages are looking for funding
  run `npm fund` for details
exit_code=0

$ Get-Content -Raw tsconfig.app.json
Get-Content: Cannot find path 'E:\project-funny\biji\tsconfig.app.json' because it does not exist.
exit_code=1
随后实际 tsconfig.json读取成功，exit_code=0。

$ npx tsc -b
src/NoteSorter.tsx(47,15): error TS7006: Parameter 'event' implicitly has an 'any' type.
src/NoteSorter.tsx(48,14): error TS7006: Parameter 'event' implicitly has an 'any' type.
exit_code=1
$ npx tsc -b
[无输出]
exit_code=0
```

### 静态闭包/保护边界

执行步骤：读取before54/current package-lock JSON逐个现有packages key比version；逐个对比八份node_modules原LICENSE与public通知SHA256；对比六个保留前端文件before/current SHA256。任一不符throw，原命令exit0，输出如下：

```text
Old package versions changed: 0
@dnd-kit/abstract@0.5.0 MIT
@dnd-kit/collision@0.5.0 MIT
@dnd-kit/dom@0.5.0 MIT
@dnd-kit/geometry@0.5.0 MIT
@dnd-kit/react@0.5.0 MIT
@dnd-kit/state@0.5.0 MIT
8 license copies match actual originals
6 protected frontend file hashes unchanged from before54
exit_code=0
```


### npm test（最终）

```text
$ npm test > TEMP/front-tests-r1.log 2>&1

> luma-notes@0.5.4 test
> node --test tests/*.test.mjs

TAP version 13
# Subtest: centered camera uses CSS dimensions and bounded zoom at different world positions
ok 1 - centered camera uses CSS dimensions and bounded zoom at different world positions
  ---
  duration_ms: 4.5011
  type: 'test'
  ...
# Subtest: one long-lived graph owner waits for model and dimensions then consumes the latest request once
ok 2 - one long-lived graph owner waits for model and dimensions then consumes the latest request once
  ---
  duration_ms: 1.1333
  type: 'test'
  ...
# Subtest: a replaced token and disposed canvas never report an obsolete locate result
ok 3 - a replaced token and disposed canvas never report an obsolete locate result
  ---
  duration_ms: 0.4816
  type: 'test'
  ...
# Subtest: canvas-local subject and drag use a single origin independent of DPR and page offset
ok 4 - canvas-local subject and drag use a single origin independent of DPR and page offset
  ---
  duration_ms: 6.4665
  type: 'test'
  ...
# Subtest: simulation copies frozen models and link tag arrays; static seeds do not collapse
ok 5 - simulation copies frozen models and link tag arrays; static seeds do not collapse
  ---
  duration_ms: 1.4034
  type: 'test'
  ...
# Subtest: owned mid-drag cancellation removes move/up then restores native selection only
ok 6 - owned mid-drag cancellation removes move/up then restores native selection only
  ---
  duration_ms: 2.9977
  type: 'test'
  ...
# Subtest: absent, normally released, or replaced gesture never clears another owner
ok 7 - absent, normally released, or replaced gesture never clears another owner
  ---
  duration_ms: 1.3461
  type: 'test'
  ...
# Subtest: actual D3 mouse pan cancellation restores native selection and rejects late mousemove
ok 8 - actual D3 mouse pan cancellation restores native selection and rejects late mousemove
  ---
  duration_ms: 6.9517
  type: 'test'
  ...
# Subtest: actual D3 normal pan end clears ownership and cancellation does not restore twice
ok 9 - actual D3 normal pan end clears ownership and cancellation does not restore twice
  ---
  duration_ms: 2.2808
  type: 'test'
  ...
# Subtest: pan cancellation does not sweep a replaced owner or nonmouse transform
ok 10 - pan cancellation does not sweep a replaced owner or nonmouse transform
  ---
  duration_ms: 3.6936
  type: 'test'
  ...
# Subtest: one in flight and one replaceable latest pending; stale response never accepted
ok 11 - one in flight and one replaceable latest pending; stale response never accepted
  ---
  duration_ms: 4.739
  type: 'test'
  ...
# Subtest: timeout clears relations and reaches visible error; retry is bounded
ok 12 - timeout clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.9487
  type: 'test'
  ...
# Subtest: error clears relations and reaches visible error; retry is bounded
ok 13 - error clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.6796
  type: 'test'
  ...
# Subtest: messageerror clears relations and reaches visible error; retry is bounded
ok 14 - messageerror clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 1.2731
  type: 'test'
  ...
# Subtest: reply-error clears relations and reaches visible error; retry is bounded
ok 15 - reply-error clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.7124
  type: 'test'
  ...
# Subtest: create clears relations and reaches visible error; retry is bounded
ok 16 - create clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.5255
  type: 'test'
  ...
# Subtest: cancel blocks captured late callbacks and clears timer; a new session can submit
ok 17 - cancel blocks captured late callbacks and clears timer; a new session can submit
  ---
  duration_ms: 0.9397
  type: 'test'
  ...
# Subtest: large content threshold uses Worker; tiny snapshot runs same pure model
ok 18 - large content threshold uses Worker; tiny snapshot runs same pure model
  ---
  duration_ms: 15.5714
  type: 'test'
  ...
# Subtest: revised OR boundary keeps 23 notes / 7999 UTF16 synchronous and equal boundaries asynchronous
ok 19 - revised OR boundary keeps 23 notes / 7999 UTF16 synchronous and equal boundaries asynchronous
  ---
  duration_ms: 23.7542
  type: 'test'
  ...
# {"phase":"actual scoring loop","nodes":100,"gramCount":5,"candidates":2,"visits":1000}
# {"phase":"actual scoring loop","nodes":200,"gramCount":5,"candidates":2,"visits":2000}
# (node:190672) ExperimentalWarning: stripTypeScriptTypes is an experimental feature and might change at any time
# (Use `node --trace-warnings ...` to show where the warning was created)
# Subtest: scoring patch preserves full frozen r1 models and input-order determinism
ok 20 - scoring patch preserves full frozen r1 models and input-order determinism
  ---
  duration_ms: 38.614
  type: 'test'
  ...
# Subtest: actual scoring loop visits only the shorter set for 100/200 identical four-character bodies
ok 21 - actual scoring loop visits only the shorter set for 100/200 identical four-character bodies
  ---
  duration_ms: 58.0031
  type: 'test'
  ...
# Subtest: nested bold and italic have the same visible words in both orders
ok 22 - nested bold and italic have the same visible words in both orders
  ---
  duration_ms: 4.816
  type: 'test'
  ...
# Subtest: code literals preserve edge ticks, spaces, hashtags and HTML through actual storage helpers
ok 23 - code literals preserve edge ticks, spaces, hashtags and HTML through actual storage helpers
  ---
  duration_ms: 11.1235
  type: 'test'
  ...
# Subtest: maximal tick runs are not matched inside a longer closing run
ok 24 - maximal tick runs are not matched inside a longer closing run
  ---
  duration_ms: 0.5024
  type: 'test'
  ...
# Subtest: fences and inline spans use the same protection, including long delimiters at block start
ok 25 - fences and inline spans use the same protection, including long delimiters at block start
  ---
  duration_ms: 3.2975
  type: 'test'
  ...
# Subtest: ordered starts, quotes and adjacent list kinds produce real blocks and plain words
ok 26 - ordered starts, quotes and adjacent list kinds produce real blocks and plain words
  ---
  duration_ms: 5.0007
  type: 'test'
  ...
# Subtest: empty parsed list items are omitted while trimmed raw markers remain literal
ok 27 - empty parsed list items are omitted while trimmed raw markers remain literal
  ---
  duration_ms: 1.2314
  type: 'test'
  ...
# Subtest: ordinary input is escaped, unknown HTML remains literal and old kbd wrappers are removed
ok 28 - ordinary input is escaped, unknown HTML remains literal and old kbd wrappers are removed
  ---
  duration_ms: 1.413
  type: 'test'
  ...
# Subtest: the graph legacy plain-text golden result remains unchanged
ok 29 - the graph legacy plain-text golden result remains unchanged
  ---
  duration_ms: 0.7072
  type: 'test'
  ...
# Subtest: quote serialization omits empty markers through actual trimming, keeping internal blank lines
ok 30 - quote serialization omits empty markers through actual trimming, keeping internal blank lines
  ---
  duration_ms: 3.0848
  type: 'test'
  ...
# Subtest: nonempty quotes preserve inline and fenced code literals, styles and external tags
ok 31 - nonempty quotes preserve inline and fenced code literals, styles and external tags
  ---
  duration_ms: 1.5277
  type: 'test'
  ...
# Subtest: quotes emptied by ordinary tags keep exact metadata without visible prefixes or empty styles
ok 32 - quotes emptied by ordinary tags keep exact metadata without visible prefixes or empty styles
  ---
  duration_ms: 2.2503
  type: 'test'
  ...
# Subtest: ordinary tags on first middle and last quote lines preserve text order and blank lines
ok 33 - ordinary tags on first middle and last quote lines preserve text order and blank lines
  ---
  duration_ms: 1.2689
  type: 'test'
  ...
# Subtest: quote tag normalization preserves supported styles code and authored literal symbols
ok 34 - quote tag normalization preserves supported styles code and authored literal symbols
  ---
  duration_ms: 2.9155
  type: 'test'
  ...
# Subtest: empty heading bodies omit prefixes through actual storage normalization
ok 35 - empty heading bodies omit prefixes through actual storage normalization
  ---
  duration_ms: 1.93
  type: 'test'
  ...
# Subtest: headings emptied by ordinary tags keep exact metadata without visible prefixes
ok 36 - headings emptied by ordinary tags keep exact metadata without visible prefixes
  ---
  duration_ms: 2.4352
  type: 'test'
  ...
# Subtest: empty headings adjacent to real paragraphs preserve paragraph order and metadata
ok 37 - empty headings adjacent to real paragraphs preserve paragraph order and metadata
  ---
  duration_ms: 0.8418
  type: 'test'
  ...
# Subtest: nonempty headings keep both levels supported styles code tags and authored literals
ok 38 - nonempty headings keep both levels supported styles code tags and authored literals
  ---
  duration_ms: 1.8896
  type: 'test'
  ...
# Subtest: display text shares inline and block rules, preserving unknown HTML and code
ok 39 - display text shares inline and block rules, preserving unknown HTML and code
  ---
  duration_ms: 11.5416
  type: 'test'
  ...
# Subtest: NFKC and Unicode codepoints preserve emoji and matching mixed-language bodies
ok 40 - NFKC and Unicode codepoints preserve emoji and matching mixed-language bodies
  ---
  duration_ms: 13.1282
  type: 'test'
  ...
# Subtest: empty and distinct single-character notes remain isolated
ok 41 - empty and distinct single-character notes remain isolated
  ---
  duration_ms: 5.329
  type: 'test'
  ...
# Subtest: identical nonempty single-character bodies receive duplicate edges
ok 42 - identical nonempty single-character bodies receive duplicate edges
  ---
  duration_ms: 0.7044
  type: 'test'
  ...
# Subtest: label only channel reports real shared labels and record-level DF
ok 43 - label only channel reports real shared labels and record-level DF
  ---
  duration_ms: 3.3121
  type: 'test'
  ...
# Subtest: rare primary tags win without moving groups when filtered
ok 44 - rare primary tags win without moving groups when filtered
  ---
  duration_ms: 1.7224
  type: 'test'
  ...
# Subtest: large common tag and duplicate body use sparse edges and retain every frozen node
ok 45 - large common tag and duplicate body use sparse edges and retain every frozen node
  ---
  duration_ms: 86.0662
  type: 'test'
  ...
# Subtest: mutual strong untagged choices form deterministic text groups, tags stay separate
ok 46 - mutual strong untagged choices form deterministic text groups, tags stay separate
  ---
  duration_ms: 1.0224
  type: 'test'
  ...
# Subtest: current IDs win while pending or projected, including isolated and new IDs
ok 47 - current IDs win while pending or projected, including isolated and new IDs
  ---
  duration_ms: 1.4141
  type: 'test'
  ...
# Subtest: semantic key excludes deleted records and ignores done, dates, source order
ok 48 - semantic key excludes deleted records and ignores done, dates, source order
  ---
  duration_ms: 2.3627
  type: 'test'
  ...
# Subtest: full search precedes card batching, date mode sorts before global allowance
ok 49 - full search precedes card batching, date mode sorts before global allowance
  ---
  duration_ms: 45.2424
  type: 'test'
  ...
# Subtest: reordering both ways replaces only visible slots and preserves original records
ok 50 - reordering both ways replaces only visible slots and preserves original records
  ---
  duration_ms: 6.0269
  type: 'test'
  ...
# Subtest: empty, duplicate, unknown, stale, trash and mixed pin requests are rejected
ok 51 - empty, duplicate, unknown, stale, trash and mixed pin requests are rejected
  ---
  duration_ms: 1.0082
  type: 'test'
  ...
# Subtest: pin changes only one field without moving canonical slots or graph semantics
ok 52 - pin changes only one field without moving canonical slots or graph semantics
  ---
  duration_ms: 2.359
  type: 'test'
  ...
# Subtest: production view boundary rejects cross-date, cross-pin and hidden IDs before slot merge
ok 53 - production view boundary rejects cross-date, cross-pin and hidden IDs before slot merge
  ---
  duration_ms: 42.1353
  type: 'test'
  ...
# Subtest: one quota follows stable pins then ordinary date groups; trash ignores pin partition
ok 54 - one quota follows stable pins then ordinary date groups; trash ignores pin partition
  ---
  duration_ms: 2.1657
  type: 'test'
  ...
# Subtest: old and new JSON backups and local persistence keep order and metadata
ok 55 - old and new JSON backups and local persistence keep order and metadata
  ---
  duration_ms: 3.5692
  type: 'test'
  ...
# Subtest: actual move indices include both directions, noop and illegal indices
ok 56 - actual move indices include both directions, noop and illegal indices
  ---
  duration_ms: 1.112
  type: 'test'
  ...
# Subtest: final pointer coordinates must be inside current group intersected with viewport
ok 57 - final pointer coordinates must be inside current group intersected with viewport
  ---
  duration_ms: 0.5974
  type: 'test'
  ...
# Subtest: actual drop gate uses final pointerup; keyboard ignores pointer geometry independently
ok 58 - actual drop gate uses final pointerup; keyboard ignores pointer geometry independently
  ---
  duration_ms: 1.3045
  type: 'test'
  ...
# Subtest: templates require a new blank record without any recovered draft
ok 59 - templates require a new blank record without any recovered draft
  ---
  duration_ms: 2.6549
  type: 'test'
  ...
# Subtest: three fixed starter bodies have editable headings and preserve caller metadata
ok 60 - three fixed starter bodies have editable headings and preserve caller metadata
  ---
  duration_ms: 17.4888
  type: 'test'
  ...
# Subtest: all active tags remain searchable beyond ten without changing exact names
ok 61 - all active tags remain searchable beyond ten without changing exact names
  ---
  duration_ms: 42.2639
  type: 'test'
  ...
# Subtest: quick open searches the entire active source before UI batching and keeps duplicate UUIDs
ok 62 - quick open searches the entire active source before UI batching and keeps duplicate UUIDs
  ---
  duration_ms: 14.3229
  type: 'test'
  ...
# Subtest: navigation keys leave IME confirmation and repeated events untouched
ok 63 - navigation keys leave IME confirmation and repeated events untouched
  ---
  duration_ms: 0.6097
  type: 'test'
  ...
# Subtest: editing re-reads the latest UUID at frame execution, including content updates and disappearance
ok 64 - editing re-reads the latest UUID at frame execution, including content updates and disappearance
  ---
  duration_ms: 1.1969
  type: 'test'
  ...
# Subtest: new actions, navigation cancellation and unmount reject already queued editing frames
ok 65 - new actions, navigation cancellation and unmount reject already queued editing frames
  ---
  duration_ms: 0.9364
  type: 'test'
  ...
# Subtest: exact tag excludes similar tags and plain mentions
ok 66 - exact tag excludes similar tags and plain mentions
  ---
  duration_ms: 10.0146
  type: 'test'
  ...
# Subtest: tag names remain case sensitive
ok 67 - tag names remain case sensitive
  ---
  duration_ms: 1.1561
  type: 'test'
  ...
# Subtest: lowercase tag is a different tag
ok 68 - lowercase tag is a different tag
  ---
  duration_ms: 0.5241
  type: 'test'
  ...
# Subtest: query is trimmed and case insensitive
ok 69 - query is trimmed and case insensitive
  ---
  duration_ms: 0.3455
  type: 'test'
  ...
# Subtest: query, tag and unfinished compose with AND
ok 70 - query, tag and unfinished compose with AND
  ---
  duration_ms: 0.5573
  type: 'test'
  ...
# Subtest: trash does not leak active records
ok 71 - trash does not leak active records
  ---
  duration_ms: 1.0126
  type: 'test'
  ...
# Subtest: clearing all filters restores source order
ok 72 - clearing all filters restores source order
  ---
  duration_ms: 0.8114
  type: 'test'
  ...
# Subtest: missing result returns an empty array
ok 73 - missing result returns an empty array
  ---
  duration_ms: 0.3839
  type: 'test'
  ...
# Subtest: selectors preserve records and do not mutate the source
ok 74 - selectors preserve records and do not mutate the source
  ---
  duration_ms: 1.667
  type: 'test'
  ...
# Subtest: month selection respects local midnight and cross-year boundaries
ok 75 - month selection respects local midnight and cross-year boundaries
  ---
  duration_ms: 3.3772
  type: 'test'
  ...
# Subtest: previous year and following month remain separately selectable
ok 76 - previous year and following month remain separately selectable
  ---
  duration_ms: 0.5494
  type: 'test'
  ...
# Subtest: empty month has zero totals and invalid dates are excluded
ok 77 - empty month has zero totals and invalid dates are excluded
  ---
  duration_ms: 0.2394
  type: 'test'
  ...
# Subtest: owned cancellation resets actual MotionValues even when no gesture end callback fires
ok 78 - owned cancellation resets actual MotionValues even when no gesture end callback fires
  ---
  duration_ms: 4.7828
  type: 'test'
  ...
1..78
# tests 78
# suites 0
# pass 78
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1105.9233

exit_code=0
```

### npm run build（最终）

```text
$ npm run build > TEMP/front-build-r1.log 2>&1

> luma-notes@0.5.4 build
> tsc -b && vite build

vite v8.3.0 building client environment for production...
transforming...
✓ 2487 modules transformed.
rendering chunks...
computing gzip size...
dist/manifest.webmanifest                          0.24 kB
dist/index.html                                    0.51 kB │ gzip:   0.35 kB
dist/assets/noteGraph.worker-C1x8NuDj.js           7.03 kB
dist/assets/index-_KQi7W3c.css                    41.22 kB │ gzip:   8.90 kB
dist/assets/workbox-window.prod.es5-Bd17z0YL.js    5.65 kB │ gzip:   2.20 kB
dist/assets/NoteGraph-Blg_j7V4.js                 75.59 kB │ gzip:  26.18 kB
dist/assets/index-DP872DIB.js                    549.54 kB │ gzip: 176.82 kB

✓ built in 521ms
[plugin builtin:vite-reporter] 
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.

PWA v1.3.0
mode      generateSW
precache  7 entries (663.64 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js

exit_code=0
```

### git diff --check

```text
$ git diff --check > TEMP/front-diff-check-r1.log 2>&1
warning: in the working copy of 'AGENTS.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/Product.Direction.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/Project.Progress.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/Release.Testing.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src-tauri/Cargo.lock', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src-tauri/Cargo.toml', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src-tauri/src/lib.rs', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/App.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/store.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/styles.css', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/types.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tsconfig.json', LF will be replaced by CRLF the next time Git touches it

exit_code=0
```

### 焦点修正后 npm test（最终同源）

```text
$ npm test > TEMP/front-tests-r1-final.log 2>&1

> luma-notes@0.5.4 test
> node --test tests/*.test.mjs

TAP version 13
# Subtest: centered camera uses CSS dimensions and bounded zoom at different world positions
ok 1 - centered camera uses CSS dimensions and bounded zoom at different world positions
  ---
  duration_ms: 3.9931
  type: 'test'
  ...
# Subtest: one long-lived graph owner waits for model and dimensions then consumes the latest request once
ok 2 - one long-lived graph owner waits for model and dimensions then consumes the latest request once
  ---
  duration_ms: 1.0219
  type: 'test'
  ...
# Subtest: a replaced token and disposed canvas never report an obsolete locate result
ok 3 - a replaced token and disposed canvas never report an obsolete locate result
  ---
  duration_ms: 0.5396
  type: 'test'
  ...
# Subtest: canvas-local subject and drag use a single origin independent of DPR and page offset
ok 4 - canvas-local subject and drag use a single origin independent of DPR and page offset
  ---
  duration_ms: 5.0007
  type: 'test'
  ...
# Subtest: simulation copies frozen models and link tag arrays; static seeds do not collapse
ok 5 - simulation copies frozen models and link tag arrays; static seeds do not collapse
  ---
  duration_ms: 1.4338
  type: 'test'
  ...
# Subtest: owned mid-drag cancellation removes move/up then restores native selection only
ok 6 - owned mid-drag cancellation removes move/up then restores native selection only
  ---
  duration_ms: 4.0896
  type: 'test'
  ...
# Subtest: absent, normally released, or replaced gesture never clears another owner
ok 7 - absent, normally released, or replaced gesture never clears another owner
  ---
  duration_ms: 1.5285
  type: 'test'
  ...
# Subtest: actual D3 mouse pan cancellation restores native selection and rejects late mousemove
ok 8 - actual D3 mouse pan cancellation restores native selection and rejects late mousemove
  ---
  duration_ms: 5.2086
  type: 'test'
  ...
# Subtest: actual D3 normal pan end clears ownership and cancellation does not restore twice
ok 9 - actual D3 normal pan end clears ownership and cancellation does not restore twice
  ---
  duration_ms: 1.8799
  type: 'test'
  ...
# Subtest: pan cancellation does not sweep a replaced owner or nonmouse transform
ok 10 - pan cancellation does not sweep a replaced owner or nonmouse transform
  ---
  duration_ms: 2.3978
  type: 'test'
  ...
# Subtest: one in flight and one replaceable latest pending; stale response never accepted
ok 11 - one in flight and one replaceable latest pending; stale response never accepted
  ---
  duration_ms: 3.8408
  type: 'test'
  ...
# Subtest: timeout clears relations and reaches visible error; retry is bounded
ok 12 - timeout clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.722
  type: 'test'
  ...
# Subtest: error clears relations and reaches visible error; retry is bounded
ok 13 - error clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.5767
  type: 'test'
  ...
# Subtest: messageerror clears relations and reaches visible error; retry is bounded
ok 14 - messageerror clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.5812
  type: 'test'
  ...
# Subtest: reply-error clears relations and reaches visible error; retry is bounded
ok 15 - reply-error clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.4097
  type: 'test'
  ...
# Subtest: create clears relations and reaches visible error; retry is bounded
ok 16 - create clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.4137
  type: 'test'
  ...
# Subtest: cancel blocks captured late callbacks and clears timer; a new session can submit
ok 17 - cancel blocks captured late callbacks and clears timer; a new session can submit
  ---
  duration_ms: 0.7751
  type: 'test'
  ...
# Subtest: large content threshold uses Worker; tiny snapshot runs same pure model
ok 18 - large content threshold uses Worker; tiny snapshot runs same pure model
  ---
  duration_ms: 11.7413
  type: 'test'
  ...
# Subtest: revised OR boundary keeps 23 notes / 7999 UTF16 synchronous and equal boundaries asynchronous
ok 19 - revised OR boundary keeps 23 notes / 7999 UTF16 synchronous and equal boundaries asynchronous
  ---
  duration_ms: 33.1625
  type: 'test'
  ...
# {"phase":"actual scoring loop","nodes":100,"gramCount":5,"candidates":2,"visits":1000}
# {"phase":"actual scoring loop","nodes":200,"gramCount":5,"candidates":2,"visits":2000}
# (node:220072) ExperimentalWarning: stripTypeScriptTypes is an experimental feature and might change at any time
# (Use `node --trace-warnings ...` to show where the warning was created)
# Subtest: scoring patch preserves full frozen r1 models and input-order determinism
ok 20 - scoring patch preserves full frozen r1 models and input-order determinism
  ---
  duration_ms: 29.3863
  type: 'test'
  ...
# Subtest: actual scoring loop visits only the shorter set for 100/200 identical four-character bodies
ok 21 - actual scoring loop visits only the shorter set for 100/200 identical four-character bodies
  ---
  duration_ms: 76.3478
  type: 'test'
  ...
# Subtest: nested bold and italic have the same visible words in both orders
ok 22 - nested bold and italic have the same visible words in both orders
  ---
  duration_ms: 7.0354
  type: 'test'
  ...
# Subtest: code literals preserve edge ticks, spaces, hashtags and HTML through actual storage helpers
ok 23 - code literals preserve edge ticks, spaces, hashtags and HTML through actual storage helpers
  ---
  duration_ms: 17.8045
  type: 'test'
  ...
# Subtest: maximal tick runs are not matched inside a longer closing run
ok 24 - maximal tick runs are not matched inside a longer closing run
  ---
  duration_ms: 0.7128
  type: 'test'
  ...
# Subtest: fences and inline spans use the same protection, including long delimiters at block start
ok 25 - fences and inline spans use the same protection, including long delimiters at block start
  ---
  duration_ms: 2.8974
  type: 'test'
  ...
# Subtest: ordered starts, quotes and adjacent list kinds produce real blocks and plain words
ok 26 - ordered starts, quotes and adjacent list kinds produce real blocks and plain words
  ---
  duration_ms: 1.3311
  type: 'test'
  ...
# Subtest: empty parsed list items are omitted while trimmed raw markers remain literal
ok 27 - empty parsed list items are omitted while trimmed raw markers remain literal
  ---
  duration_ms: 0.8181
  type: 'test'
  ...
# Subtest: ordinary input is escaped, unknown HTML remains literal and old kbd wrappers are removed
ok 28 - ordinary input is escaped, unknown HTML remains literal and old kbd wrappers are removed
  ---
  duration_ms: 1.5632
  type: 'test'
  ...
# Subtest: the graph legacy plain-text golden result remains unchanged
ok 29 - the graph legacy plain-text golden result remains unchanged
  ---
  duration_ms: 1.0941
  type: 'test'
  ...
# Subtest: quote serialization omits empty markers through actual trimming, keeping internal blank lines
ok 30 - quote serialization omits empty markers through actual trimming, keeping internal blank lines
  ---
  duration_ms: 2.8074
  type: 'test'
  ...
# Subtest: nonempty quotes preserve inline and fenced code literals, styles and external tags
ok 31 - nonempty quotes preserve inline and fenced code literals, styles and external tags
  ---
  duration_ms: 2.7228
  type: 'test'
  ...
# Subtest: quotes emptied by ordinary tags keep exact metadata without visible prefixes or empty styles
ok 32 - quotes emptied by ordinary tags keep exact metadata without visible prefixes or empty styles
  ---
  duration_ms: 2.4401
  type: 'test'
  ...
# Subtest: ordinary tags on first middle and last quote lines preserve text order and blank lines
ok 33 - ordinary tags on first middle and last quote lines preserve text order and blank lines
  ---
  duration_ms: 1.5794
  type: 'test'
  ...
# Subtest: quote tag normalization preserves supported styles code and authored literal symbols
ok 34 - quote tag normalization preserves supported styles code and authored literal symbols
  ---
  duration_ms: 2.6996
  type: 'test'
  ...
# Subtest: empty heading bodies omit prefixes through actual storage normalization
ok 35 - empty heading bodies omit prefixes through actual storage normalization
  ---
  duration_ms: 1.7942
  type: 'test'
  ...
# Subtest: headings emptied by ordinary tags keep exact metadata without visible prefixes
ok 36 - headings emptied by ordinary tags keep exact metadata without visible prefixes
  ---
  duration_ms: 2.2478
  type: 'test'
  ...
# Subtest: empty headings adjacent to real paragraphs preserve paragraph order and metadata
ok 37 - empty headings adjacent to real paragraphs preserve paragraph order and metadata
  ---
  duration_ms: 0.9017
  type: 'test'
  ...
# Subtest: nonempty headings keep both levels supported styles code tags and authored literals
ok 38 - nonempty headings keep both levels supported styles code tags and authored literals
  ---
  duration_ms: 1.9582
  type: 'test'
  ...
# Subtest: display text shares inline and block rules, preserving unknown HTML and code
ok 39 - display text shares inline and block rules, preserving unknown HTML and code
  ---
  duration_ms: 13.5652
  type: 'test'
  ...
# Subtest: NFKC and Unicode codepoints preserve emoji and matching mixed-language bodies
ok 40 - NFKC and Unicode codepoints preserve emoji and matching mixed-language bodies
  ---
  duration_ms: 12.1439
  type: 'test'
  ...
# Subtest: empty and distinct single-character notes remain isolated
ok 41 - empty and distinct single-character notes remain isolated
  ---
  duration_ms: 4.2783
  type: 'test'
  ...
# Subtest: identical nonempty single-character bodies receive duplicate edges
ok 42 - identical nonempty single-character bodies receive duplicate edges
  ---
  duration_ms: 3.4534
  type: 'test'
  ...
# Subtest: label only channel reports real shared labels and record-level DF
ok 43 - label only channel reports real shared labels and record-level DF
  ---
  duration_ms: 3.3901
  type: 'test'
  ...
# Subtest: rare primary tags win without moving groups when filtered
ok 44 - rare primary tags win without moving groups when filtered
  ---
  duration_ms: 1.6077
  type: 'test'
  ...
# Subtest: large common tag and duplicate body use sparse edges and retain every frozen node
ok 45 - large common tag and duplicate body use sparse edges and retain every frozen node
  ---
  duration_ms: 72.6424
  type: 'test'
  ...
# Subtest: mutual strong untagged choices form deterministic text groups, tags stay separate
ok 46 - mutual strong untagged choices form deterministic text groups, tags stay separate
  ---
  duration_ms: 0.8213
  type: 'test'
  ...
# Subtest: current IDs win while pending or projected, including isolated and new IDs
ok 47 - current IDs win while pending or projected, including isolated and new IDs
  ---
  duration_ms: 0.8348
  type: 'test'
  ...
# Subtest: semantic key excludes deleted records and ignores done, dates, source order
ok 48 - semantic key excludes deleted records and ignores done, dates, source order
  ---
  duration_ms: 0.987
  type: 'test'
  ...
# Subtest: full search precedes card batching, date mode sorts before global allowance
ok 49 - full search precedes card batching, date mode sorts before global allowance
  ---
  duration_ms: 39.0168
  type: 'test'
  ...
# Subtest: reordering both ways replaces only visible slots and preserves original records
ok 50 - reordering both ways replaces only visible slots and preserves original records
  ---
  duration_ms: 5.4059
  type: 'test'
  ...
# Subtest: empty, duplicate, unknown, stale, trash and mixed pin requests are rejected
ok 51 - empty, duplicate, unknown, stale, trash and mixed pin requests are rejected
  ---
  duration_ms: 0.7897
  type: 'test'
  ...
# Subtest: pin changes only one field without moving canonical slots or graph semantics
ok 52 - pin changes only one field without moving canonical slots or graph semantics
  ---
  duration_ms: 1.3128
  type: 'test'
  ...
# Subtest: production view boundary rejects cross-date, cross-pin and hidden IDs before slot merge
ok 53 - production view boundary rejects cross-date, cross-pin and hidden IDs before slot merge
  ---
  duration_ms: 30.0309
  type: 'test'
  ...
# Subtest: one quota follows stable pins then ordinary date groups; trash ignores pin partition
ok 54 - one quota follows stable pins then ordinary date groups; trash ignores pin partition
  ---
  duration_ms: 1.3543
  type: 'test'
  ...
# Subtest: old and new JSON backups and local persistence keep order and metadata
ok 55 - old and new JSON backups and local persistence keep order and metadata
  ---
  duration_ms: 2.603
  type: 'test'
  ...
# Subtest: actual move indices include both directions, noop and illegal indices
ok 56 - actual move indices include both directions, noop and illegal indices
  ---
  duration_ms: 0.7838
  type: 'test'
  ...
# Subtest: final pointer coordinates must be inside current group intersected with viewport
ok 57 - final pointer coordinates must be inside current group intersected with viewport
  ---
  duration_ms: 0.6034
  type: 'test'
  ...
# Subtest: actual drop gate uses final pointerup; keyboard ignores pointer geometry independently
ok 58 - actual drop gate uses final pointerup; keyboard ignores pointer geometry independently
  ---
  duration_ms: 1.2232
  type: 'test'
  ...
# Subtest: templates require a new blank record without any recovered draft
ok 59 - templates require a new blank record without any recovered draft
  ---
  duration_ms: 8.4637
  type: 'test'
  ...
# Subtest: three fixed starter bodies have editable headings and preserve caller metadata
ok 60 - three fixed starter bodies have editable headings and preserve caller metadata
  ---
  duration_ms: 10.4075
  type: 'test'
  ...
# Subtest: all active tags remain searchable beyond ten without changing exact names
ok 61 - all active tags remain searchable beyond ten without changing exact names
  ---
  duration_ms: 38.4967
  type: 'test'
  ...
# Subtest: quick open searches the entire active source before UI batching and keeps duplicate UUIDs
ok 62 - quick open searches the entire active source before UI batching and keeps duplicate UUIDs
  ---
  duration_ms: 13.4697
  type: 'test'
  ...
# Subtest: navigation keys leave IME confirmation and repeated events untouched
ok 63 - navigation keys leave IME confirmation and repeated events untouched
  ---
  duration_ms: 0.623
  type: 'test'
  ...
# Subtest: editing re-reads the latest UUID at frame execution, including content updates and disappearance
ok 64 - editing re-reads the latest UUID at frame execution, including content updates and disappearance
  ---
  duration_ms: 1.2433
  type: 'test'
  ...
# Subtest: new actions, navigation cancellation and unmount reject already queued editing frames
ok 65 - new actions, navigation cancellation and unmount reject already queued editing frames
  ---
  duration_ms: 0.9174
  type: 'test'
  ...
# Subtest: exact tag excludes similar tags and plain mentions
ok 66 - exact tag excludes similar tags and plain mentions
  ---
  duration_ms: 8.2051
  type: 'test'
  ...
# Subtest: tag names remain case sensitive
ok 67 - tag names remain case sensitive
  ---
  duration_ms: 0.6118
  type: 'test'
  ...
# Subtest: lowercase tag is a different tag
ok 68 - lowercase tag is a different tag
  ---
  duration_ms: 0.3218
  type: 'test'
  ...
# Subtest: query is trimmed and case insensitive
ok 69 - query is trimmed and case insensitive
  ---
  duration_ms: 0.2147
  type: 'test'
  ...
# Subtest: query, tag and unfinished compose with AND
ok 70 - query, tag and unfinished compose with AND
  ---
  duration_ms: 0.3483
  type: 'test'
  ...
# Subtest: trash does not leak active records
ok 71 - trash does not leak active records
  ---
  duration_ms: 0.4698
  type: 'test'
  ...
# Subtest: clearing all filters restores source order
ok 72 - clearing all filters restores source order
  ---
  duration_ms: 0.3695
  type: 'test'
  ...
# Subtest: missing result returns an empty array
ok 73 - missing result returns an empty array
  ---
  duration_ms: 0.272
  type: 'test'
  ...
# Subtest: selectors preserve records and do not mutate the source
ok 74 - selectors preserve records and do not mutate the source
  ---
  duration_ms: 1.4097
  type: 'test'
  ...
# Subtest: month selection respects local midnight and cross-year boundaries
ok 75 - month selection respects local midnight and cross-year boundaries
  ---
  duration_ms: 1.1217
  type: 'test'
  ...
# Subtest: previous year and following month remain separately selectable
ok 76 - previous year and following month remain separately selectable
  ---
  duration_ms: 0.4282
  type: 'test'
  ...
# Subtest: empty month has zero totals and invalid dates are excluded
ok 77 - empty month has zero totals and invalid dates are excluded
  ---
  duration_ms: 0.1885
  type: 'test'
  ...
# Subtest: owned cancellation resets actual MotionValues even when no gesture end callback fires
ok 78 - owned cancellation resets actual MotionValues even when no gesture end callback fires
  ---
  duration_ms: 3.7089
  type: 'test'
  ...
1..78
# tests 78
# suites 0
# pass 78
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 983.8272

exit_code=0
```

### 焦点修正后 npm run build（最终同源）

```text
$ npm run build > TEMP/front-build-r1-final.log 2>&1

> luma-notes@0.5.4 build
> tsc -b && vite build

vite v8.3.0 building client environment for production...
transforming...
✓ 2487 modules transformed.
rendering chunks...
computing gzip size...
dist/manifest.webmanifest                          0.24 kB
dist/index.html                                    0.51 kB │ gzip:   0.35 kB
dist/assets/noteGraph.worker-C1x8NuDj.js           7.03 kB
dist/assets/index-_KQi7W3c.css                    41.22 kB │ gzip:   8.90 kB
dist/assets/workbox-window.prod.es5-Bd17z0YL.js    5.65 kB │ gzip:   2.20 kB
dist/assets/NoteGraph-DgzxP0xL.js                 75.59 kB │ gzip:  26.17 kB
dist/assets/index-B87Q4QfV.js                    549.54 kB │ gzip: 176.82 kB

✓ built in 433ms
[plugin builtin:vite-reporter] 
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.

PWA v1.3.0
mode      generateSW
precache  7 entries (663.64 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js

exit_code=0
```

## 焦点修正2：首修仍红、等待权威顺序落地

root实际再测：reload pins[001,000,002]，Space000→ArrowLeft→Enter，order确实[000,001,002]，activeElement仍BODY/data-note-handle=null。首次先reset再commit并未解决实际症状；没有掩去红例，也没有移除hasFocus或宣称hidden tab因果。

本agent重新读取当前完整NoteSorter及固定React Renderer/index.js:58–69/153–158：dragend callback被startTransition包裹，原requestReset在微任务中setGeneration，layout effect无条件消费focusRequest。**静态上允许generation重建先消费请求、随后parent数据transition另一次重建丢焦点**；这只是与红例一致的时序解释，尚无浏览器事件逐步追踪，不能冒称已实测确证因果。

最小修正只在NoteSorter：合法keyboard请求附captured data引用、group和预期orderedIds；layout effect若仍旧data引用则保留请求；新data后仅实际group顺序等于预期order才消费并focus。新drag start清旧请求，context/modal/hidden/blur取消与hasFocus继续守卫。normalcancel/noop/非法drop不带待commit条件，继续原safe reset；旧无效callback仍return不setState；合法onReorder仍一次。未改变数组权威、产品行为、键盘gate、业务/图/存储或引入通用抽象/配置。

缺陷分类：本局部满足IMPL_DEFECT三条件：局部=仅focus ref字段/消费时机；低风险=不改存储与合法提交语义，沿用原销毁和弹层边界；无新决策=恢复既定S2合法键盘drop条件焦点目标。root明确授权继续局部纠正，未走新产品澄清或改变计划。当前仍r1首验收期间，正式fresh ReviewImpl尚未作。

验证owner=front impl：npx tsc -b exit0无输出；node --test tests/noteOrder.test.mjs exit0 9/9；npm run build exit0；git diff --check exit0仅原CRLF warning。受影响纯数据/落点tests不能证明React真实焦点，conclusion_if_missing=实际症状未验证。root负责reload后真实Enter/Space drop/Esc焦点及modal取消不抢焦点证据。最新build入口176.93gzip +38.35，CSS8.90 +0.18、图26.17与worker7.03保持；>500kB warning继续存在，旧输出保留而不覆写成功。

```text
$ npx tsc -b
[无输出]
exit_code=0
```
### 焦点修正2：受影响真实生产合同

```text
$ node --test tests/noteOrder.test.mjs > TEMP/front-note-order-r1-focus2.log 2>&1
TAP version 13
# Subtest: reordering both ways replaces only visible slots and preserves original records
ok 1 - reordering both ways replaces only visible slots and preserves original records
  ---
  duration_ms: 1.7792
  type: 'test'
  ...
# Subtest: empty, duplicate, unknown, stale, trash and mixed pin requests are rejected
ok 2 - empty, duplicate, unknown, stale, trash and mixed pin requests are rejected
  ---
  duration_ms: 0.2712
  type: 'test'
  ...
# Subtest: pin changes only one field without moving canonical slots or graph semantics
ok 3 - pin changes only one field without moving canonical slots or graph semantics
  ---
  duration_ms: 0.4297
  type: 'test'
  ...
# Subtest: production view boundary rejects cross-date, cross-pin and hidden IDs before slot merge
ok 4 - production view boundary rejects cross-date, cross-pin and hidden IDs before slot merge
  ---
  duration_ms: 11.3684
  type: 'test'
  ...
# Subtest: one quota follows stable pins then ordinary date groups; trash ignores pin partition
ok 5 - one quota follows stable pins then ordinary date groups; trash ignores pin partition
  ---
  duration_ms: 0.4932
  type: 'test'
  ...
# Subtest: old and new JSON backups and local persistence keep order and metadata
ok 6 - old and new JSON backups and local persistence keep order and metadata
  ---
  duration_ms: 0.6539
  type: 'test'
  ...
# Subtest: actual move indices include both directions, noop and illegal indices
ok 7 - actual move indices include both directions, noop and illegal indices
  ---
  duration_ms: 0.2993
  type: 'test'
  ...
# Subtest: final pointer coordinates must be inside current group intersected with viewport
ok 8 - final pointer coordinates must be inside current group intersected with viewport
  ---
  duration_ms: 0.1899
  type: 'test'
  ...
# Subtest: actual drop gate uses final pointerup; keyboard ignores pointer geometry independently
ok 9 - actual drop gate uses final pointerup; keyboard ignores pointer geometry independently
  ---
  duration_ms: 0.3894
  type: 'test'
  ...
1..9
# tests 9
# suites 0
# pass 9
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 3122.3754

exit_code=0
```

### 焦点修正2：当前构建

```text
$ npm run build > TEMP/front-build-r1-focus2.log 2>&1

> luma-notes@0.5.4 build
> tsc -b && vite build

vite v8.3.0 building client environment for production...
transforming...
✓ 2487 modules transformed.
rendering chunks...
computing gzip size...
dist/manifest.webmanifest                          0.24 kB
dist/index.html                                    0.51 kB │ gzip:   0.35 kB
dist/assets/noteGraph.worker-C1x8NuDj.js           7.03 kB
dist/assets/index-_KQi7W3c.css                    41.22 kB │ gzip:   8.90 kB
dist/assets/workbox-window.prod.es5-Bd17z0YL.js    5.65 kB │ gzip:   2.20 kB
dist/assets/NoteGraph-CGibd5oi.js                 75.59 kB │ gzip:  26.17 kB
dist/assets/index-xSSAMios.js                    549.80 kB │ gzip: 176.93 kB

✓ built in 266ms
[plugin builtin:vite-reporter] 
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.

PWA v1.3.0
mode      generateSW
precache  7 entries (663.88 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js

exit_code=0
```
