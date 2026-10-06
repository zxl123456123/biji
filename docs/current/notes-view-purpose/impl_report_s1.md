# S1 实施报告：二维局部证据阅读

- feature_name：notes-view-purpose
- impl_round：S1 / r1
- date：2026-10-05
- lwplan_version：SHA256 `010B1CC29720AB67FB53E9A1F9E4A4EB862F733E1EBB37ED3C240387BF78B63E`，与本轮 Gate-2 对象一致。
- 输入核对：实施前 `NoteGraph.tsx` 与 TEMP before 的 SHA256 同为 `FE3543A3E446CDF86E0BEF2E1DD37FD876CE92FEB9D5F998DCBE96FA4FA06C96`。已读基线、LW、评审及实际组件/模型/定位/类型/测试；只应用本包局部补丁。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/NoteGraph.tsx` | 局部修改 | 全图/当前一层/当前两层与全部/标签/词面按钮；请求 UUID 优先于旧中心，local true 按 token 采纳一层；模拟、数量、关联依据使用同一 shown。取消或筛选移除选择时按无中心全图呈现，picker 保留全部匹配；详情仅展示 shown 内的当前选择。原 D3 owner、reconcile→retry、会话坐标/镜头、正文、编辑/定位/删除回调保留。 | S1①–⑤、S3 可选 local 接口消费 |
| `src/graphView.ts` | 新增 | 纯展示投影：先筛证据再无向 BFS 一/两跳；全图保留孤立/空正文/pending UUID，无中心回全图，明确失效局部中心返回空；混合边可双匹配，返回复制节点和证据数组。 | S1①–② |
| `src/graphView.css` | 新增 | 限定 graph-view 类；两组三按钮、主题变量、窄屏单列和换行边界。 | S1 作者体验/G3 |
| `tests/graphView.test.mjs` | 新增 | 9 项纯行为测试：链/环、边界内全部边、混合与两类证据、孤立/无中心/失效/空、替换中心、共享搜索和 pending、同文不同 UUID、冻结输入及输出变异隔离。 | S1 impl 自证 |
| `docs/current/notes-view-purpose/impl_report_s1.md` | 新增 | 本包事实、测试证据、失败与未测、根交接。 | S1 报告 |

## 目标与反目标

- goal_lock_check：G1 的展示规则已有实现和纯投影证据；React 实际点选、跨视图定位/删除及 Ctrl K 回路尚待 root 现场，不能据此写 G1 整体验收。G3 已使用限定样式与原主题变量，浅深/390px 的实际舒适度尚未验证。G2 的 UUID 接线仅消费 S3 local 合同，3D 属 S2。
- anti_goal_touch_check：A1 文案明确为筛选与依据中的一/两层及词面推断；A2/A3 未改存储、依赖、版本、Worker、关系算法、renderer、全局筛选、宠物/日历/空间核心，未提交/推送/启动服务/构建制品。
- authoring_ergonomics_notes：规则集中在 `projectGraphView`，未放入 Canvas 循环；只增加 scope/evidence 会话状态，当前选择仍为唯一可变中心。按钮提供 aria-pressed，文字 picker 沿用全部匹配 UUID。现场可读性由 root 承接。

## impl-safe 验证

- 命令：`node --test tests/graphView.test.mjs tests/noteGraph.test.mjs tests/graphFocus.test.mjs tests/graphGeometry.test.mjs`
- 本轮实际输出：32 tests / 32 pass / 0 fail / 0 skipped / 0 cancelled，退出码 **0**；已读完整 TAP 和退出码（工具 chunk `fb13f7`）。其中 graphFocus 包含 S3 本轮新增 local 案例。
- evidence：`C:/Users/ZXL/AppData/Local/Temp/qingjian-view-purpose-20261005/impl-s1-tests.log`，含完整 TAP 与 `exit_code=0`。
- owner：S1 impl 实际执行；root 需独立 fresh 全量 test/build。
- conclusion_if_missing：缺完整日志/退出码只能未验证；这些纯行为测试不证明 React 实际事件顺序、界面舒适度或设备表现。
- 已见失败：本包测试无失败；两次批量读取工具输出被截断，之后分段补读 LW、基线、评审和实际源码。未将截断内容或上游测试报告当成当前自证。上游已记录的调研/rg 失败仍保留于原 LW/基线，不改写。

## coordinator_handoff_verifications

| 验证 | 移交原因 / 建议承接 | evidence_expected / owner / conclusion_if_missing |
| --- | --- | --- |
| 全图→一层→两层→依据→邻居中心；局部外 picker；孤立点/空正文；更新/error | 真实浏览器交互，root 用独立合成数据执行 | 同源码 UI 记录及截图 / root / 缺证据则 G1 界面未验证 |
| 新 UUID 跨旧局部中心；空间 local 一层；Ctrl K 原清筛选；快速替换/删除/关闭弹层及原编辑 | 跨组件实际 token/current-record 与事件顺序，纯模块测试覆盖有限 | 原请求结果、同 UUID、共享筛选保持和原回调的现场记录 / root / 缺证据则跨视图回路未验证 |
| 浅深主题/390px、按钮与长正文、拖动缩放/适配当前范围、选择/依据不自动飞镜头 | 实际显示与操作，root 现场执行 | 当前源码的截图/操作记录 / root / 缺证据则 G3 未验证 |
| fresh `npm test`、`npm run build`、独立实施后 review | 由根统一串行，防写并发 dist/tsbuildinfo | 完整输出/退出码、最终 SHA、fresh review / root + 独立 reviewer / 缺证据不宣称总体完成 |

广泛原生 WebView/GPU、触屏/读屏、多设备与长期资源/耗电未测，不以本报告关闭。

## 漂移、风险与回滚

- contract_drift_reports：无阻断 drift/stale/mirror mismatch；实际 `graphFocus.ts` 已由 S3 添加 optional local，未互改 owner 文件。
- 未完成与风险：本包代码与纯测试交接；实际界面、最终类型/构建及 fresh review 待 root。审查应重点看新请求投影先于模拟 retry、无效选择/请求的分支及混合边事实说明。
- 回滚信息：**可直接回滚本轮片段**；仅撤 NoteGraph 本包状态/import/控件片段及三个新增产品/测试文件，保留 before 后未知并发差量，不使用 restore/reset/clean。
- 建议英文提交信息：`feat(graph): add local relationship scopes and evidence filters`
- 无跨功能事实。
