# luminous-note-map 实施报告 r1

## 基本信息

- feature_name: luminous-note-map
- impl_round: 1
- date: 2026-10-03
- lwplan_version: 2026-10-03，含 S4 `[修订: PLAN_DEFECT-R1.1]`，Gate-2 第2轮 PASS
- owner: impl；GUI、真实性能、Rust/Windows 制品与发布事实由 coordinator/root 承接
- 范围：S1 → S2 → S3 → S4 → S5 源码/元数据/当前文档；未运行 GUI、服务、真实 SQLite/凭据、Rust 或 EXE，没有 commit/push

已按序阅读 AGENTS、完整最新 clarifications、feature README/research/两份 feedback、HL/LW 及两轮 LW 评审，再读取真实 App/noteFormat/recordTools/types/测试/元数据。第一次合并计划输出被工具截断，随后单独完整回读 LW，未把截断当完整证据。S1 先等价提取并独立 build，之后才写功能。

## 变更事实

| path | change_type | change_purpose | key_changes | related_tasks |
| --- | --- | --- | --- | --- |
| src/App.tsx | 修改 | 工作台编排 | 移出 NotesView；顶部记录/图/账本与工具导航、共享筛选、会话 ref、visibility/motion、按最新 id 进入原 Composer；原 notes/transaction 保存 effect 保留 | S1/S3/S4 |
| src/NotesView.tsx | 新增 | 记录展示职责 | 原卡片/复制/回收站搬移；响应式 grid/date、全量筛选后60条分批、计数/加载更多 | S1/S3 |
| src/noteText.ts | 新增 | 共用安全显示语义 | 原 inline token 常量、纯正文提取、NFKC/空白规范化，不读取 DOM、不执行 HTML | S1/S2 |
| src/noteFormat.tsx | 修改 | token 等价共用 | renderInline 只改为 new RegExp(INLINE_TOKEN_PATTERN)，其他转换逻辑原样 | S1 |
| src/NoteFilters.tsx | 新增 | 记录/图条件一致 | 全部/未完成、精确标签下拉、结果与清除，继续消费 App 条件 | S3 |
| src/notePresentation.ts | 新增 | 日期/批次必要纯断言 | 本机日期组、非法日期、全局额度；无虚拟列表框架 | S3 |
| src/noteGraphModel.ts | 新增 | 纯本地派生关系 | 语义快照、Unicode 2/3gram、稀疏 TF-IDF、64候选、双通道主动top2、≤4N、主标签/相互强正文分组、完整当前节点投影 | S2 |
| src/noteGraph.worker.ts | 新增 | 专用异步计算 | version/input 请求，同一 buildNoteGraph，model/error 回应，无存储/网络 | S2 |
| src/useNoteGraph.ts | 新增 | 有界请求/React桥 | 生产 createGraphRequests 被纯测试直接调用；1在途+1最新pending、版本守卫、10秒终态、失败/重试、取消epoch和transport身份保护 | S2 |
| src/NoteGraph.tsx | 新增 | D3 Canvas真实图 | 独立副本、停止默认 timer、单30fps调度、DPR/像素上限、动态呼吸/边流光、完整文字选择/预览/依据/编辑/删除、zoom/fit/drag/清理 | S4 |
| src/graphGeometry.ts | 新增 | 必要几何/取消测试边界 | 会话位置/有限palette、稳定铺点、模拟副本、局部坐标、实际拖写入disposed guard、窗口move/up身份拥有权+dragEnable | S4 |
| src/styles.css | 修改 | 主体可见炫彩与排版 | 浅深 token、三个紫青粉光场、顶部工作台、3/2/1列、日期/图/详情/工具；Canvas border/padding=0；暂停/系统减弱 | S3/S4 |
| tests/noteGraph.test.mjs | 新增 | 模型/展示规则 | 11项提取/Unicode/空与重复/标签DF/大团/分组/完整投影/语义键/全量筛选先于批次 | S2/S3 |
| tests/graphRequests.test.mjs | 新增 | 真实请求合同 | 8项队列/旧回应/五类故障/重试/取消晚回调/阈值路径，无影子队列 | S2 |
| tests/graphGeometry.test.mjs | 新增 | 几何和受控取消 | 4项局部原点/DPR/副本/中途取消与其他owner保护，使用实际D3选择和dragDisable/Enable | S4 |
| tsconfig.json | 修改 | 直接测试生产TS边界 | allowImportingTsExtensions，与 noEmit/Bundler 协同，不造另一份测试实现 | S2/S4 |
| package.json | 修改 | 锁定依赖/版本 | 四D3精确3.0.0、四指定@types、0.5.0 | S4/S5 |
| package-lock.json | 修改 | 可重复依赖 | 锁新依赖、根0.5.0；原所有已存在包版本比较无变化 | S4/S5 |
| src-tauri/Cargo.toml | 修改 | 产品元数据 | qingjian 0.5.0 | S5 |
| src-tauri/Cargo.lock | 修改 | 产品元数据 | 仅qingjian包0.5.0 | S5 |
| src-tauri/tauri.conf.json | 修改 | 产品元数据 | version 0.5.0；其他值保留 | S5 |
| README.md | 修改 | 当前使用事实 | 新工作台/本地图/稀疏推断/依赖许可与待测范围；0.4历史链接保留 | S5 |
| CHANGELOG.md | 修改 | 版本事实 | 0.5源码实现记录与待发布边界，旧版本保留 | S5 |
| docs/Project.Progress.md | 修改 | 当前进度 | 0.5源码与0.4历史分开，纯测试/性能失败/实际验证待承接 | S5 |
| docs/Release.Testing.md | 修改 | 验收入口 | 35项纯测试、关联图/压力/静态/原生边界，0.5元数据与新制品待承接 | S5 |
| docs/current/luminous-note-map/impl_validation_r1.md | 新增 | 完整命令证据 | 最终 test/build/diff-check 的完整输出和退出码 | S5 |
| docs/current/luminous-note-map/impl_report_r1.md | 新增 | 实施交接 | 本报告 | S5 |

`src/store.ts`、NoteComposer、Modal、desktop、types 与 root 的 `%TEMP%/qingjian-pre-graph-20261003` 二进制内容逐一比较，均相等（命令退出0）。AmbientNodes 源文件保留，仅取消挂载/import。未触碰 .serena、AI网络实现、SQLite或AppData.version=1。Git status 中原有源码/文档/未跟踪工作全部保留，没有 restore/reset/clean。

## 目标对齐

- goal_lock_check: G1 已落源码的顶部导航/宽工作台/grid/date/光场/浅深窄屏，真实观感待root；G2 全量UUID节点、孤立保留、两类依据/分组、静态文字入口及D3操作；G3 模型/请求/绘制/持久化分离，S1独立构建，保留现场。新EXE属于root交接，没有把0.4成果当0.5。
- anti_goal_touch_check: 未增加远程模型/上传、任意HTML渲染、关系schema、坐标持久化、第二笔记源、通用调度/renderer/双引擎。Canvas全画节点；≥500只减特效。无每帧React状态/构图/业务保存。
- authoring_ergonomics_notes: 平铺具名职责和原回调；App复杂view分支多行；配置只加实际精确依赖/版本和测试生产TS必需选项。产品文案只显示共同标签/正文推断/部分关联，不露算法队列参数。保留本地安全纯文本作者体验，未改编辑器工具栏。

## impl-safe 验证结果

最终完整输出见 [impl_validation_r1.md](impl_validation_r1.md)，均由本代理在本轮执行、读取完整输出与退出码。

| command / evidence | exit code / 结果 | owner | conclusion_if_missing |
| --- | --- | --- | --- |
| S1 `npm run build`，下方完整输出 | 0，独立职责提取构建 | impl | 无S1证据不声称提取可编译 |
| 最终 `npm test`，validation文件 | 0，35 tests / 35 pass / 0 fail，包括原12项 | impl | 不声称纯合同通过 |
| 最终 `npm run build`，validation文件 | 0，tsc+Vite/PWA | impl | 不声称Web可构建 |
| `git diff --check`，validation文件 | 0，仅LF→CRLF提示 | impl | 不声称diff无空白错误 |
| Python逐源/测试行尾空白断言 | 0，all source/test whitespace checks pass（也覆盖未跟踪新源码） | impl | 不用git diff忽略未跟踪的行为当新源码证据 |
| 读取快照对照5个保留模块/lock旧依赖版本 | 0，5项snapshot_equal=True，existing dependency version changes=[] | impl | 不声称旧源/依赖未改 |
| 模型等价优化固定500×500汉字夹具前后deepEqual | 0，full model equal，500节点/500边；脚本随后10轮计时退出0 | impl | 不声称优化输出等价 |

S1 原样搬移后的 `npm run build` 完整输出（session 63187最终退出0）：

```text
> luma-notes@0.4.0 build
> tsc -b && vite build

vite v8.3.0 building client environment for production...
transforming...
✓ 1878 modules transformed.
rendering chunks...
computing gzip size...
dist/manifest.webmanifest                          0.24 kB
dist/index.html                                    0.51 kB │ gzip:  0.35 kB
dist/assets/index-BcD9Tq6c.css                    25.33 kB │ gzip:  5.99 kB
dist/assets/workbox-window.prod.es5-Bd17z0YL.js    5.65 kB │ gzip:  2.20 kB
dist/assets/index-DVA3H5YG.js                    270.18 kB │ gzip: 85.70 kB
✓ built in 4.53s
PWA v1.3.0
mode      generateSW
precache  5 entries (294.62 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js
```

## 包体与性能：未达到候选预算

最终Vite日志：初始JS gzip87.53KB、图按需chunk25.56KB、CSS7.68KB、Worker未压缩3.57KB。S1相同Vite基线初始JS85.70KB、CSS5.99KB。初始JS差1.83KB；**合计初始JS+图chunk增量至少27.39KB，Worker还需另计，因此总增量没有达到≤25KB gzip候选**。CSS另增1.69KB。没有拿初始包差代总包体。Python gzip测量因压缩器不同不与Vite基线相减作为准确总量；root可统一压缩方式复核。

模型按root实际压力反馈做了语义等价优化：跳过无法产生他者候选的df=1 gram、缓存IDF、倒排交集积累候选余弦并保留原逐gram求和顺序、Unicode直接拼接去slice/join分配。500条固定夹具前后完整模型deepEqual；没有截正文/节点或更改阈值/候选规则。最后补齐码点比较器，并在Unicode用例核对全角字符与扩展汉字顺序。

性能证据区分责任，不将root消息当本代理独立执行：

| 夹具/责任 | 100节点p95 | 500节点p95 | 1000节点p95 | 结论 |
| --- | --- | --- | --- | --- |
| root随机Han平均500字/20标签，优化前，10轮 | 234.59ms | 2620.79ms | 7312.58ms | 全部是Node纯模型计时；未达500≤300ms |
| root相同压力，优化后，10轮反馈 | 112.57ms | 1265.95ms | 4301.45ms | 改善但仍未达，非UI/GPU结论 |
| impl不同固定随机Han夹具，第一优化10轮 | 125.01ms | 906.25ms | 2930.52ms | fixture不同不可直接相减，未达 |
| impl第二优化同自有夹具10轮 | 121.57ms | 845.82ms | 3468.99ms | 仍未达，1000受GC/样本波动影响；不宣称性能PASS |

root同步边界补测：76×500随机Han/总UTF16 39166，小于现LW的80/40000阈值，10轮p95=114.05ms，超过主线程50ms候选；15条7720字符17.60ms、23条11845字符22.76ms。**这是已知同步预算风险**。root已明确先保留现plan数值，不静默改阈值；由ReviewImpl/coordinator收口必要的PLAN_DEFECT阈值修订。大型计算在Worker隔离，不代表总等待满足300ms。

## 已见失败与修复

1. Python第一次读取 NotesView 未显式encoding，退出1：`UnicodeDecodeError: 'gbk' codec can't decode byte 0xaf ...`。无文件写入发生；改显式UTF-8重跑退出0。
2. 首次功能build退出1，类型错误完整核心输出：
   - NoteGraph.tsx TS2345：drag.subject 可能undefined，类型要求Subject；改真实Subject|undefined并在handlers做具名guard。
   - graphGeometry.ts TS2322：D3监听带(this,event,datum)，比单参数函数签名多参数；保留真实D3函数身份签名。
   - useNoteGraph.ts TS2322：Worker.onmessage的MessageEvent不能当简化`{data}`签名；改MessageEvent<Reply>。后续一次build还见Worker.onerror单参数与零参不兼容（退出1），改真实ErrorEvent/MessageEvent类型。未用本地any声明逃逸。
3. PowerShell `npm run build`一次退出1：`Could not determine Node.js install directory`。随后`Get-Command node,npm; node --version; npm run build`触发PowerShell/.NET Globalization fatal `0xC0000005`，退出-1073741819，完整栈见会话工具chunk1f3a7c；不是生产TS错误。切独立cmd.exe运行npm，后续均正常。没有重启服务或修改系统运行时。
4. 一次cmd.exe内联`node ... -e`引用失配，退出1：`SyntaxError: Invalid or unexpected token`，指向`"import`。改临时.mjs文件后模型deepEqual/计时命令退出0。临时preopt副本和check脚本已移至TEMP，未保留在生产src/测试集合。
5. 真实模型计时和总包体预算失败见上节，尚未解决，不从报告省略。测试没有见过失败用例；不可把它称为验证过红绿循环。
6. diff-check仅LF/CRLF警告（包括原AGENTS/Product.Direction/store及本轮App/styles/tsconfig），退出0；原文件工作未丢弃。上游方案检索403等为历史，见research，不伪称本代理运行过。

## coordinator_handoff_verifications

| verification | 原因/承接方式 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 真实网格/日期/浅深/窄屏/主体炫彩 | 非impl-safe；root隔离浏览器样例 | 实际项目前后截图、DOM结果、多帧效果；60批次/全量搜索/主入口 | root | 不声称实际观感/动画验收 |
| 图节点/详情/编辑/新建/删除撤销恢复/筛选/暂停按钮zoom-fit/session | 非impl-safe；root隔离7+1样例 | 当前集合、最新正文、依据、静态操作和跨图模式镜头记录 | root | 不声称真实交互满足G2 |
| 原Composer/格式/连续输入/选区/回填/草稿/快捷/回收站回归 | 非impl-safe；root复测原入口 | 真实操作记录；本轮未改保留模块的hash不能替代体验 | root | 不声称编辑回归已验 |
| 真实module Worker加载/故障恢复、100/500/1000总等待/UI任务/draw/GPU | 非impl-safe；root浏览器测量与纯基准补充 | Worker网络/状态及超时重试、LongTasks/帧测量/同方法包体；所有未达值 | root | 仅可报告纯合同/Node计时，不声称丝滑 |
| 原生drag/pinch/拖后click/中途卸载后选择、reduced/hidden/缩放/IME | 非impl-safe且CUA接口受限；root可行项自测，其他引导用户 | 实际平台操作或明确未測清单；纯geometry/取消不代替原生组合 | root | 明确未验证 |
| Rust check/test、新WindowsEXE/MSI/NSIS、版本/mtime/大小/hash/可行启动与旧库 | 禁止本代理EXE/真实SQLite；root承接 | 本轮命令/退出码/新0.5制品哈希及发布证据、失败/限制；Rust0用例须写明 | root | 不声称0.5制品交付；0.4只历史 |
| Release.Verification.0.5.0与最终发布事实 | 当前不存在新制品验证；root按实测落盘 | 新版本证据文件及README/进度事实修订 | root | 当前只源码实现，不宣称发布 |

## contract_drift_reports / 未完成与风险

- 文档/镜像/路径未发现新drift；旧装饰-only/0.4发布成功明确不沿用。
- **预算与实际结果不一致**已向root上报：500模型初建>300ms、76条同步>50ms、总gzip>25KB。影响S2/S5性能验收；root要求本轮保持阈值，由ReviewImpl评判计划缺口，再最小修订。不能自行把Worker阈值改成别的数掩盖证据。
- 纯model统计与DOM/GPU不同；受控D3取消测试验证实际窗口监听/选择恢复顺序及guard，但不是原生手势验收。ReviewImpl重点审查异步旧回调、mouse namespace拥有权、坐标、pause/hidden/StrictMode对称清理与未删id集合。
- 本代理源码实施交接就绪；真实性能目标、GUI/原生手势与新EXE均未由本代理验证，不请求重复产品阶段批准。

## 回滚信息

**需人工介入**：工作区有上一轮未提交工作，不能通过HEAD restore/reset/clean回撤整文件。仅以root pregraph快照只读对照，人工逆本轮新增模块/接线/样式/元数据增量，保留原App/store/styles与.serena现场；移除图挂载仅是暂时降级，不等于完成G2。

英文提交消息建议：`feat: add a luminous note workspace and local relationship map`。本代理未执行提交/推送。

无新增跨功能事实。
