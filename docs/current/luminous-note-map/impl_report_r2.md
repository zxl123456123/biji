# luminous-note-map 有限补实施 r2

## 基本信息

- feature_name: luminous-note-map
- impl_round: 2
- date: 2026-10-03
- lwplan_version: 2026-10-03，S2/S4/S5 三个 `[修订: PLAN_DEFECT-R2]` 覆盖块，Review(LW)第3轮PASS
- owner: impl；独立ReviewImpl、GUI/真实Worker/性能/Rust/Windows由root承接

已重新加载safe-code-changes与verification-before-completion，读正式r1实施评审、LW修订、第三轮LW评审、最新clarifications/README/UI观察及真实四个源码模块/D3源码。第一次组合读取被截断，已分段补读关键覆盖块与实际源码；没有以截断当完整证据。只实施三个修订落点及必要真实测试/当前事实；未递归委派、未启动服务/GUI/EXE/Rust、未读真实DB/凭据、未Git写操作。

## 变更事实

| path | change_type | change_purpose | key_changes | related_tasks |
| --- | --- | --- | --- | --- |
| src/useNoteGraph.ts | 修改 | 收敛同步边界 | 仅large判定改为≥24条 OR 总原content UTF16≥8000；其余请求/版本/epoch/错误/取消逻辑保留 | S2-R2/R1 |
| src/noteGraphModel.ts | 修改 | 有界评分访问 | 外层gram顺序不改；每gram遍历posting/candidates较短集合，最多64；各候选乘积及加法顺序不变 | S2-R2/R3 |
| src/graphGeometry.ts | 修改 | 具名pan拥有权边界 | capturePanGesture/cancelOwnedPanGesture只捕获/清理自有 .zoom move/up身份，随后dragEnable；复用必要手势数据类型，不造通用管理器 | S4-R2/R2 |
| src/NoteGraph.tsx | 修改 | 活动背景pan取消 | 仅mousedown start登记，mouseup end释放；disposed→取消自有pan/清引用→原node drag取消/清引用 | S4-R2/R2 |
| tests/graphRequests.test.mjs | 修改 | 真实阈值路径 | 23/7999同步、24/24及1/8000异步、76/39166异步，调用生产控制器 | S2-R2 |
| tests/graphGeometry.test.mjs | 修改 | 实际D3受控pan测试 | 真实mousedown→取消/迟到move、正常end、不移除接管者、不覆盖非鼠标；保留原拖拽测试；Node capture移除适配 | S4-R2 |
| tests/graphScoring.test.mjs | 新增 | 等价与实际访问 | 读固定r1完整模型、乱序deepEqual；将当前源码仅在测试内存中插桩，不加生产counter/interface；逐gram≤min(bucket,candidates)≤64 | S2-R2 |
| tests/fixtures/graph-r1-models.json | 新增 | 可移植冻结事实 | 从只读r1源码运行产生4组完整model（含精确浮点/排序/分组），常规测试不依赖TEMP或影子生产实现 | S2-R2 |
| README.md | 修改 | 当前验证事实 | 41项纯测试范围及r2报告链接，保留未测边界 | S5-R2 |
| CHANGELOG.md | 修改 | 当前补丁事实 | 三处局部收敛记录，不写发布完成 | S5-R2 |
| docs/Project.Progress.md | 修改 | 当前进度 | r2串行41项/类型build和原风险区分 | S5-R2 |
| docs/Release.Testing.md | 修改 | 测试入口 | 41项、串行同集合命令、原生验收仍待承接 | S5-R2 |
| docs/Note.Graph.md | 修改 | 当前架构事实 | 原r1缺陷保留引用，补新阈值/评分局部成本/pan取消，避免把总算法称线性 | S5-R2 |
| docs/current/luminous-note-map/impl_report_r2.md | 新增 | 本轮报告 | 不覆盖r1报告 | S5-R2 |
| docs/current/luminous-note-map/impl_validation_r2.md | 新增 | 本轮命令证据 | 全量最终命令输出/退出码及首次失败条目与诊断 | S5-R2 |

只读r1 snapshot逐文件比较命令退出0：生产src只变化`NoteGraph.tsx/graphGeometry.ts/noteGraphModel.ts/useNoteGraph.ts`四个文件，其他source与r1完全一致；store/NoteComposer/原保存/未知工作/.serena未动。r1模型SHA256=`02279cae3e067a6bed927b68a28a3df3a97ce04ee59f5c140c86f7536da962fd`，来自`%TEMP%/qingjian-graph-r1-20261003/src/noteGraphModel.ts`。固定expected运行该只读模型产生，非根据新代码推断。

## 目标对齐

- goal_lock_check: G1工作台/排版保持，G2完整节点/关系/静态操作及成熟D3保持，G3仅收敛同步预算与评分/活动资源清理；无schema/保存/编辑入口变化。
- anti_goal_touch_check: 不截正文或节点、不改推断阈值/候选配额/IDF/分组，不上传/任意HTML/双引擎，不增加生产counter或通用调度接口；不把Worker隔离当300ms或GPU达标。
- authoring_ergonomics_notes: 未增加manifest/声明式配置；源码仍在原具名边界，pan helper为必要测试落点，阈值不做用户配置；测试expected夹具将输入与只读历史完整输出放在一起，常规测试无需TEMP依赖，测试内插桩不污染运行代码。

## impl-safe 验证

完整最终命令输出见[impl_validation_r2.md](impl_validation_r2.md)。为低内存条件串行执行，不并行测试/build，没有运行新的压力计时。

| command / evidence | 实际结果 | owner | conclusion_if_missing |
| --- | --- | --- | --- |
| `node --test --test-concurrency=1 tests/*.test.mjs` | 最终41/41、0失败、退出0；原35项全部保留，新增6项 | impl | 无本轮证据不称纯合同通过；不是默认npm test命令但同一全量集合 |
| `npm run build` | tsc/Vite/PWA退出0 | impl | 不声称源码类型/生产Web构建可用 |
| `git diff --check` | 退出0，仅LF→CRLF警告（原工作保留） | impl | 不声称diff空白检查通过 |
| r1 snapshot逐源比对+新源/测试行尾空白断言 | 退出0，只四个计划源码不同、无新行尾空白 | impl | 不声称有限源码范围/新未跟踪文件空白已核查 |
| `node %TEMP%/qingjian-graph-r2-baseline-generate.mjs` | 退出0，4 complete r1 model fixtures saved | impl | 不声称expected来自历史r1完整输出 |
| 测试中的完整expected/乱序deepEqual | 4组×正反顺序，含重复/混合中英文/Unicode/标签/无标签/空/同分/分组与精确分数；退出0 | impl | 只比数量不足以宣称语义等价 |
| 测试内存插桩当前评分段 | 100/200同“甲乙丙丁”分别1000/2000访问；每gram bound断言及完整输出相等，退出0 | impl | 不声称评分有界，绝不声称整个模型线性 |

评分证据来自读取**当前生产源码**，仅替换评分内循环以递增测试计数，用Node stripTypeScriptTypes在内存执行；导入仍是生产noteText/recordTools，测得完整model再次deepEqual。没有新增运行counter开关。外层gram保持原序，两个分支不重排单候选浮点累加；索引建立、候选发现和标签/重复桶其他成本未在这项局部结论中声称线性。

构建当前：初始JS gzip87.56KB、按需图25.65KB、CSS7.68KB、Worker未压缩3.67KB。S1基线初始JS85.70KB：初始+图的JS增量至少27.51KB，Worker另计，仍超过25KB候选。r2没有压力/帧测量，不把旧500p95失败改成新的性能通过。

## 已见失败与修复

- 首次全量串行测试退出1：41项中40通过、1失败，为pan取消后迟到move的defaultPrevented断言`true !== false`。完整TAP由会话tool chunk8f25c6返回，完整失败条目/栈及汇总留在r2 validation；没有省略。
- 独立Node诊断退出0复现：EventTarget add capture=true后，remove(boolean true)未移除（writes=1/prevented=true）；remove({capture:true})移除（writes=0/prevented=false）。测试DOM表面将boolean capture归一为显式字典后，生产D3不变；串行测试回到41/41。该失败属于受控测试适配差异，不能推断原生浏览器仍有同一缺陷。也不能把此轮红绿称为已针对旧生产缺陷做变异回归。
- Node stripTypeScriptTypes的ExperimentalWarning保留完整日志；不是失败。diff-check的LF/CRLF提示也保留。补丁构建未见新的类型或OOM失败；上游r1预算/IAB/Rust内存故障仍为历史限制，没有抹去或冒称已修复。
- 两次批量读取输出被截断，已单独读正式r1评审/第三轮LW评审/当前基线/UI、S2完整覆盖及实际源；S4/S5覆盖块在首读末段完整呈现。没有把工具退出0当作截断不存在。

## coordinator_handoff_verifications

| verification | 移交原因/建议承接 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| ReviewImpl r2 | 独立审查，不由impl自代 | 读修订、4源码/测试/冻结夹具/本报告与完整日志，独立运行同集合 | root/reviewer | 纯自证不等于总体放行 |
| GUI/多帧/图文字选择编辑/建删恢复/筛选/zoom-fit/session/static | 非impl-safe，root内存恢复后隔离实际界面 | 新实际截图/操作结果及Worker加载；不使用旧0.4截图 | root | 不称UI/MVP验收 |
| 原生pan/drag/pinch/中途切页后选择/系统减弱/hidden/IME/缩放 | 本轮只受控D3；root可行项实际操作，缺接口则明确未测 | 真实原生组合证据或未测清单 | root | EventTarget不代替原生GUI |
| 同方法总构图/Worker等待/主线程/绘制/GPU/包体 | 本轮不做压力；小访问计数不代表总算法耗时 | 100/500/1000等实际数值，预算未达如实保留 | root | 不称300ms/50ms/丝滑达标 |
| Rust/新0.5 Windows EXE/hash/可行启动/旧库语义安全 | 禁止impl真实平台操作；root低并行可行时承接 | 新命令/退出码/真实版本hash/启动/备份前后比较；失败记录 | root | 不称新制品交付，0.4仅历史 |

## contract_drift_reports / 风险 / 回滚

无新增产品/镜像合同漂移。按R2覆盖旧80/40000，不再保留双阈值；旧r1证据和失败报告保留。当前文档中的“root独立35项”仍是r1历史事实，新41项清楚标为impl r2，未混归验证责任。

候选性能/总包体未满足和GUI/真实Worker/Rust/EXE证据缺口仍由root承接；24/8000是最小收敛，不保证所有机器/内容同步都<50ms。ReviewImpl重点复核两个评分分支加法序、pan窗口身份/非鼠标不覆盖、disposed先行及旧35项。

回滚信息：**需人工介入**。仅人工逆r2四源码局部增量/新增测试和当前文档，不HEAD restore/reset/clean；旧阈值和pan/评分缺口回撤后仍是已知风险，不能作为发布放行。原源码及未知未提交工作/.serena保持。

英文提交建议：`fix: bound local graph scoring and clean up active canvas panning`。本代理未commit/push。无新增跨功能事实。
