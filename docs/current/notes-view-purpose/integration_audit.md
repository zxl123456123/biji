# 三路功能源码共存核对

日期：2026-10-05（Asia/Shanghai）。范围：当前 `E:/project-funny/biji` 中记录时光、宠物/空间装扮、本轮空间主题与二维局部关联的接线。仅只读源码/文档核对；本报告是唯一新增文件。没有修改产品、公共文档、对方 feature、发布副本或 Git，没有启动服务、浏览器、原生构建或数据库。

## 有限结论

当前源码已同时接入三路功能，没有发现需要重复复制模块、重放旧零上下文补丁或修改接口才能共存的冲突。这个结论只覆盖下列接线和当前读取身份，不等于三路原生整合制品、硬件性能、全部实际界面或用户验收通过。最终全量测试/构建由 root 在独立快照承接。

## 实际接线

| 边界 | 当前源码事实 | 入口 |
| --- | --- | --- |
| 三路页面 | `View` 同时含 `garden`、`space`、`graph`；三个模块各自 `lazy`，各有 `Suspense`；导航同时存在 | `src/App.tsx:29`、`:33`、`:185`、`:233` |
| 月历数据 | `RecordGarden` 消费全部非删除 `activeNotes`，没有消费列表分页或搜索投影；图/空间消费 `visibleNotes`。时光页查找按钮只导航回记录页，未清空原查询 | `src/App.tsx:110`、`:202`、`:244` |
| 共用编辑器 | 月历、空间、二维均以稳定 id 调用宿主 `editLatestNote`；它从 `notesRef` 取最新非删除记录。月历新建调用原 `createInView`，没有复制保存逻辑 | `src/App.tsx:124`、`:168`、`:202`、`:212`；`src/recordNavigation.ts:11` |
| 共用正文 | 月历和空间均经 `withoutTags` 与 `renderMarkdown`，仅标签记录有中文回退；原纯文本 `Note` 未新增 HTML、外观或图字段 | `src/App.tsx:202`；`src/SpatialNoteMap.tsx:183`；`src/types.ts:3` |
| 唯一已应用装扮 | `App` 持有 `petAppearance`，解析后同时更新会话值并写独立偏好键；同一值送浮层、大展示和月历纯画像，名称同一映射。`PetShowcase` 自有 `draft` 仅由 Apply 回调向上提交 | `src/App.tsx:45`、`:47`、`:195`、`:204`、`:249`；`src/PetCompanion.tsx:190` |
| 月历共享画像 | `PetPortrait` 已 export；月历可选插槽透传到摘要卡，只传 `appearance`、`idle`、局部 `animate`。摘要卡未传插槽时仍有原机器人 SVG，日期摘要/写记录/回今天均保留 | `src/PetCompanion.tsx:69`；`src/RecordGarden.tsx:11`、`:136`；`src/RecordCompanion.tsx:18`、`:32`、`:57` |
| 月历局部策略 | 宿主 `motionAllowed && pageVisible && businessEnabled` 与月历自身动态开关、可见性、减少动态、`focused` 作 AND；摘要隐藏再作 `!hidden`。画像 CSS 由 `data-animate=false` 关动画，没有引入另一行为状态机、RAF 或拖动 owner | `src/App.tsx:203`；`src/RecordGarden.tsx:21`、`:77`；`src/RecordCompanion.tsx:23`、`:32`；`src/pet.css:143` |
| 浮层避让 | `PetCompanion` 在 settings/space/garden/graph 隐藏；原记录、账本、回收站仍消费显示偏好。共享摘要与大展示不改变 `petShown` | `src/App.tsx:251`；`src/petBehavior.ts:38` |
| 空间探索与装扮共存 | 空间 relations/time/pet 三模式保留；地图分支同时有主题导览、折叠外观配置、完整文字选择及 UUID 入口；pet 分支仍是原大展示。草稿外观经既有 `setAppearance` 进入 scene | `src/SpatialNoteMap.tsx:36`、`:63`、`:106`、`:129`、`:136`、`:178` |
| 空间→二维 | 已选 UUID 调用 `requestLocate(id,false,true)`，保留宿主搜索/标签/未完成；可选 `local` 被二维在投影前消费为新中心的一层范围，旧 token/latest-record 请求协议仍在 | `src/App.tsx:132`、`:196`；`src/graphFocus.ts:1`；`src/NoteGraph.tsx:48`、`:55` |
| 日期职责 | 空间 time 只读 `createdAt`；月历保留创建日期/记录日期两种口径，后者消费 `scheduledDate`。空间文字明确“不是计划日期；按天查记录可使用记录时光” | `src/spatialLayout.ts:36`、`:45`；`src/recordGardenModel.ts:20`；`src/SpatialNoteMap.tsx:173` |
| 本地与依赖 | 宠物画像依赖 React 和代码 SVG，月历不导入 Three；Three 由空间 lazy 分支下的 scene/models 消费。两份外观独立本地键不进入 `Note`/业务备份，所读新模块无网络或模型加载器接线 | `src/PetCharacters.tsx:1`；`src/petAppearance.ts:7`；`src/spatialAppearance.ts:8`；`src/spatialScene.ts:1`；`src/store.ts:36` |

空间 MapView 清理时调用 scene `dispose`；scene 统一调度器、几何/材质/纹理 owner 和策略接口仍在。切去 pet 或离开空间不会令月历持有 scene。外观/探索目前共享同一 MapView，不存在两个 renderer 接线。以上是源码 owner 事实，不是资源、帧率或 context-loss 实测。

## 状态与来源

- `notes-view-purpose` 的唯一实现基线是 `clarifications.md`，最新增量已经记录用户“不要影响那两个窗口”“并行完成功能的合并最后”及自主决策授权；旧 145 test/build、实际 UI、fresh 审查见 `verification.md`。本核对未把这些旧命令重命名为本轮新执行。
- 日历源码已接入事实见 `record-garden/integration.md`、`verification-single.md`；root 提供的聊天最新状态是该窗口停止代码改动并移交宠物窗口统一收尾。这里不据旧独立分支状态断言它仍未接入，也没有再应用 `integration-0.6.0.patch`。
- 宠物权威实施/增量输入见 `pet-space-customization/clarifications.md`、`s4/impl_report_r1.md` 与 `impl_report_r1.md`。旧 README 仍写早期“进行中/S1–S3派单”，不能代替最新实施状态。root 提供的最新聊天状态是独立 0.7.0 发布最终审查仍 active，未由本报告宣告结束。
- 宠物 `packaging_source_r2.md` 明确独立发布源码来自固定 r1，只叠加设置名字与 PetPortrait export；月历和本轮探索排除。其 release App 身份 `01902872…` 与当前 `514AAE9C…` 不同是已声明范围差异，不能拿该 EXE 证明三路整合发布。工作区源码全部保留，未回写其 release-source-r2。

## 当前身份核验

本次实际执行只读 PowerShell 校验 `source-manifest.json` 的 SHA、唯一条目、工作区文件 SHA 及 root 快照文件 SHA，读取完整输出和退出码：工具 `4b2cdb`，exit 0，核对 23 项，`DRIFT_COUNT=0`。这只证明 23 个核对对象在该次读取中与 root 输入同字节，不是整个活动工作区全局冻结声明。

root 输入：`C:/Users/ZXL/AppData/Local/Temp/qingjian-view-integration-20261005/source-manifest.json`，99 项清单，SHA256 `FF2F734B7768ABB0D5368AB281CE58CA41DCCB3140F6D1D77518DBEB933CEBD5`。目标快照是同目录 `source`。

关键身份：

| 文件 | SHA256 |
| --- | --- |
| `src/App.tsx` | `514AAE9C4BB1D410EBCB411BBC9AA3B282F8283C6EAE41126F2D0D852B4D3AF4` |
| `src/SpatialNoteMap.tsx` | `EE338ED054219A0A3388270DE06331668FC5D2DFB0B759FCA713633B75AA840D` |
| `src/PetCompanion.tsx` | `BFE390FAE9465E78327C2AC8D6F1919CAD9CA52DE835B70128593B16C1FE0768` |
| `src/RecordGarden.tsx` | `6BF35DC22FC824E08511BFA72B67758FC2D1E523FA88719A3CA654F92AB9A409` |
| `src/RecordCompanion.tsx` | `23116D50AA2DDEE7C1073F154258E6C9D2E33B0EDCACE5B0014462DD410F7633` |

其余核对项为 PetCharacters/petBehavior/petAppearance、spatialAppearance/scene/models/runtime、RecordDayViews/record-companion.css/recordGardenModel、useNoteGraph/NoteGraph/graphFocus/graphView/spatialExplore、types/recordNavigation 和 package.json。没有执行 npm test/build；本报告不自报这些命令结果，root 另保留本轮独立日志与退出码。

## 未知、既有边界与最小收口

- U1：当前源码三路共存与 0.7.0 独立发布是不同范围；三路整合原生制品尚不能由已读身份推出。root 需要把本轮完整快照的 fresh test/build 结果绑定 manifest，后续最终发布另确定同源制品范围。
- U2：`RecordGarden` 和二维图接口主要接宿主动效许可，普通业务按钮并未统一消费 `businessEnabled`；空间和宠物则显式关闭业务交互。当前日历编辑弹层有原遮罩，AI 侧栏也不等同模态遮罩。源码可证这个策略差异，但本核对未实际点击这些场景，也没有证据将它定性为本轮接口合并造成的故障；不为统一抽象顺手改产品。若 root 后续要承诺“所有页面在 AI/弹层期间业务均冻结”，需先实测并单独收口该合同。
- U3：系统减少动态、真实后台/失焦、触屏/读屏/IME、弱 GPU、context-loss、长期资源和完整原生 GUI 在本只读任务未测。共享画像的 78/64px 实际外形与附件可辨识性也不能由 SVG 接线代替现场验收；既有各 owner 的实际记录按对应身份消费。
- 发现但未改动：`src/store.ts:21` 仍对缺 `scheduledDate` 且无 today/tomorrow 分支的旧笔记执行 `new Date(note.createdAt).toISOString()`；非法 createdAt 可在进入月历模型前抛异常。`record-garden/verification-single.md` 保留旧夹具初始化白屏/RangeError。本次未重放该夹具，未把日期模型的非法日期支持误称为修复加载路径，也不把它算作三路新接口冲突。
- 已知历史失败：S4 初混合源码 build 曾出现 SpatialNoteMap 的 20 条 TS 诊断，原报告和日志保留；它与当前 `EE338ED0…` 源码及 root 新快照不是同一时点，不能据此声称当前源码仍失败。辅助批读取曾输出截断，已定向读取核心源码/状态；manifest 初次结构探查也输出截断，后改为 23 项紧凑逐项校验，最终完整输出为上述 `4b2cdb`。

所需最小收口是 root 的 fresh 快照验证、最终源身份复核及明确后续整合发布范围；本次没有查到必须先改产品的接线阻断项。用户体验验收与另外窗口自己的最终审查由其 owner 保持，不自动关闭。

## 最终独立复核增量

日期：2026-10-05。同一有界源码集成复核；原正文保留。本轮只追加本报告，未改产品、root `integration.md`、其他 feature 或发布范围；未启动服务、浏览器、native、Git，未递归委派。

### 独立读取与新校验

已全文读取 root `integration.md`，包括用户授权、自主方案、99 项范围、隔离实现、交叉路径、失败、旧问题和未测边界；读取时 SHA256 为 `723B22256229A64A95171D9C9F4B73294254E57B6CD8CDDD9741D93FA12E67AA`。不是只消费 root 摘要。

已独立完整读取 `tests.log`（890 行，工具 ed001b）、`build.log`（41 行，22918a）、对应 `tests-result.json`（099cfd）及 `build-result.json`（08d4d1）的真实 command/cwd/exit/time；并完整读取 `source-manifest.json`（b81dac）与 `final-source-check.json`（6ddefc）。读取工具 exit 0 与日志中的原命令退出码分别核对，不把“读文件退出 0”当成“测试退出 0”。

| 证据 | 独立读到的结果 | 限定 |
| --- | --- | --- |
| 完整 TAP + tests-result | 145 tests / 145 pass；fail/cancelled/skipped/todo 均 0；原 `npm test` exit 0，cwd 为独立 source，UTC 完成于 19:07:21 | 当前前端纯行为与生产模块测试；不替代实际 GPU、读屏或原生验收 |
| 完整 build + build-result | `tsc -b && vite build`，2515 modules；原 build exit 0，UTC 完成于 19:07:37；输出是独立 web-dist | 当前三路全集的 Web 类型/构建闭合；不是整合 EXE |
| root final-source-check | 99 项，drift=[]，绑定 FF2F734B…，UTC 19:15:59 | 原验收后身份记录 |
| reviewer 新只读核验 f06226 | 99 条/99 唯一路径/781914 字节；工作区与副本逐项 hash、bytes 全部匹配，drift=[]；5207 监听数 0；exit 0 | 本轮复核时再确认同源与端口清理；不承诺活动工作区永久不变 |

日志 SHA256：tests `48ACBB1489B2D04D47323920C8C3E02D39DE746E535EE88585B0C698845CE011`；build `662E3D7DA63FEEBE2677927231FE938FC47AE3E2067EFC313F3490737F3233FA`。结果元数据 SHA256：tests `BAF7D9DCC0FC7ED0C848E6A84B0A6836E254483C42B3784EAFED98B23D994B5B`；build `BE665FE83423831EF7E388100AF92D98581D86A4093A5D964FE0225CBE9E1BEB`。manifest 保持 `FF2F734B7768ABB0D5368AB281CE58CA41DCCB3140F6D1D77518DBEB933CEBD5`。

### UI 与实际图片复核

已全文读取六份 UI 原文：ui-draft-calendar（8637f7）、ui-applied-calendar（a3a0d3）、ui-calendar-editor（bceb86）、ui-records-pet（03d38c）、ui-space（f64483）、ui-graph（762eb6）；另完整读取 ui-proof（1c1aba）、console（fafeee）与 qa-cleanup-result（655d85）。实际用 `view_image` 查看 integration-shared-pet-calendar.png 和 integration-local-graph.png，没有开浏览器重操作。

- 草稿后日历原文为晴小团；应用后日历为奶龙，9 月 18 条/18 天，5 日 1 条已完成、未完成 0、正文及原打开记录按钮保留。实际图片可见奶龙/画家帽，日期摘要、正文和动作清楚；源码的唯一 applied owner 与独立 draft 路径支持隔离解释。这里只核对这套奶龙实例，不外推全部五角色/附件的实际可辨识性。
- 编辑器原文确有原“编辑记录”弹层、设计标签、9 月 5 日和相同正文；未从这份回填快照推断重新验过保存/撤销。
- 记录页原文 URL 为独立 5207/qa-view、18 条记录，并有奶龙触摸/休息/收起浮层。空间原文同时保留奶龙入口、八个主题项、折叠外观、静态相机、18 条文字选择，选读书第二条有完整正文与 2 条关联。
- 图原文为同一正文、当前一层/全部依据、3 条记录/3 条关联/匹配 18；ui-proof 的 UUID 为 `qa-view-2`、浮层按钮数 0。实际图可见三节点局部关系、被选记录与依据，所见区域无浮层宠物覆盖。这些证据支持本轮交叉路径，不把全页图片当默认 viewport 首屏、窄屏或完整动态效果测量。
- console 原文为 `[]`，仅说明该新 origin 本次取得的 warn/error 记录为空。ui-records-pet 的 AX 原文部分排序容器名称有编码显示异常，原输出保留；本轮未据此声称实际读屏通过。

### 失败与未测保留

完整测试日志保留两处 Node stripTypeScriptTypes ExperimentalWarning；完整构建保留外部 outDir 不自动清空及大于 500 kB chunk 警告，PWA 14 项/1340.64 KiB。这些没有被改阈值或解释为帧率/能耗达标。root 记录的首次 Windows 直接动态 import 失败、既有首屏/遮挡修正、S4 中间态 20 条 TS/HMR 失败和旧非法日期加载白屏均保留，不以最终绿跑抹去。

qa-cleanup-result 实际 exit 1、output 空，与 root 明确记录的自建服务受控 Ctrl-C 清理对应；它不证明产品正常退出，也不是本轮应用测试失败。reviewer 新只读监听核验确认为 0。ownTab 关闭仅由 root 操作记录陈述，本 reviewer 没有重新控制浏览器确认。首次证据清单探查也检查了无扩展候选 `final-source-check` 并报告不存在；实际 `final-source-check.json` 随后全文读取并独立重核，不误报为证据缺失或产品失败。

U2 业务按钮策略差异、旧 store 非法日期路径仍未改；真实后台/失焦、系统 reduce、故障注入、弱 GPU/完整 WebView2、触屏/读屏/IME、长期资源、整合原生制品和安装卸载均不由本轮证据关闭。较广浅深/390px记录可按原相同产品身份消费，此次交叉验收没有重新覆盖这些设备场景。另窗口自己的发布最终审查仍由其 owner 保持，未代它结束。

### 有界双结论

**协议结论：PASS（有界源码集成）**。最新用户自主授权、既有调研方案、并发保护、99 项同源输入、隔离命令和真实元数据、有限现场证据、失败/旧问题/未测均可追溯；没有产品补改或混合对方发布。独立 hash 复核与根记录一致，没有缺失的必要接线证据。

**业务结论：PASS（当前前端源码共存与已测桌面交叉路径）**。完整当前 test/build 与实际日历共享画像、原编辑回填、记录页浮层、空间 UUID → 二维一层图证据相互对应，未发现应先修产品的集成阻断项。此结论不包含 Git 合并提交、三路合并原生发布、所有系统/设备验收或用户最终体验验收；后续整合制品须明确同源范围另验。
