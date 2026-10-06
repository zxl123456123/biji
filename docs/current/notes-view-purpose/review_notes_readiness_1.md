# Readiness 检查记录（第 1 轮）

**评审对象**：`research.md` + `research_industry.md` + `clarifications.md`，结合 feature README 与实际源码
**评审时间**：2026-10-05
**评审结论**：PASS
**范围**：fresh 独立 readiness；只判断证据与基线是否足以进入 LW，不是产品验收。未修改源码、基线或规划，未递归委派。

## 输入文件

- `docs/current/notes-view-purpose/{README.md,clarifications.md,research.md,research_industry.md}`。
- `src/App.tsx`、`src/NoteGraph.tsx`、`src/SpatialNoteMap.tsx`、`src/graphFocus.ts`、`src/recordNavigation.ts`、`src/noteGraphModel.ts`、`src/spatialLayout.ts`、`src/spatialScene.ts`；日期分工补读 `RecordGarden.tsx`、`RecordDayViews.tsx`、`recordGardenModel.ts` 和 `docs/Record.Garden.md`。
- 输入快照 `C:/Users/ZXL/AppData/Local/Temp/qingjian-view-purpose-20261005/before` 与同级 `manifest.json`：276 项。独立比对 App、NoteGraph、SpatialNoteMap、spatialLayout、spatialScene、graphFocus、RecordDayViews、RecordCompanion、recordNavigation 共 9 项，snapshot SHA 与 manifest、current SHA 全部一致。
- 根原始 `baseline-tests.log`；reviewer 本轮另行执行完整 `npm test`，读完整 TAP 和退出码：129 tests / 129 pass / 0 fail / 0 skipped，exit 0（工具输出 chunk `0a510c`）。有 Node `stripTypeScriptTypes` ExperimentalWarning。两者均是变更前命令证据，不是 UI 或新功能结果。

## 澄清与基线核验

### A. 澄清问题完整性

- ① 未回答 Q&A 是否为空：是。`clarifications.md:5-7` 明确无阻断问题，并把设备/GPU 边界留为未测。
- ② coordinator 是否漏记澄清问题：未发现。新开发原话已授权常规可逆实施；记录明确区分自主判断与用户逐项选择。本轮方向无需新增用户风险决策。
- ③ 头脑风暴决策是否完整落盘：是，`clarifications.md:11-16` 的六项覆盖用途、局部范围、主题导览、跨视图 UUID、舒适度和复用边界。

### B. 基线内部质量

- ④ 各必填章节（1-10）是否存在且非空/非占位：PASS。目标锁至增量/失败留痕共 10 节有实际内容（`clarifications.md:22-68`）。
- ⑤ 目标锁是否具体可验证：PASS。G1 是范围/依据/数量和失效定位行为；G2 是主题聚焦/恢复和 UUID 阅读回路；G3 指定浅深主题、390px、根命令及实际 UI。均可转入 LW 的验证锚点。
- ⑥ 反目标是否具体：PASS。以下核验针对本轮基线承诺；现有代码里的业务存储、AI 和两幅旧星图不是本轮新增，也不能被误报为已消除。

| 禁止内容 | 验证方式（可核查证据） | 结论（确认基线未计划该内容） |
| --- | --- | --- |
| 重复密集星图、词面/坐标冒充语义、日历或宠物副本 | 决策 1-3，A1（`clarifications.md:11-13,30`）；`RecordGarden.tsx:108-139` 是按日/月回顾，`SpatialNoteMap.tsx:139` 明确创建时间不是计划日期 | 确认不存在上述新增目标；旧重复用途是待解决现状 |
| 新业务 schema、存储、AI/网络、依赖、版本或安装包 | A2（`:31`）、兼容节（`:54`）、README 并发边界（`:14`）；本轮只投影既有 Note/GraphState | 确认不存在上述新增交付范围 |
| 修改并发宠物/日历/外观核心、丢弃未知改动或整包发布 | README `:14`，基线 `:36,62,66`；9 个关键 current/snapshot hash 一致，现有 App `:191-202` 的外观/角色/日历接线仍在 | 确认没有把外部工作纳入本轮修改或发布授权 |
| 新 renderer、关系算法、RAF、全局筛选副本 | A3（`:32`）、决策 6（`:16`）；既有 scene `:17-20` 支持 setLayout/fit，App `:110-112` 为唯一记录/筛选来源 | 确认不存在新增引擎或业务筛选目标 |
| 测试/静态审查冒充 GPU、原生 GUI 或多设备验证 | 基线 `:7,32,36,40-42` 和两份 research 的未测说明 | 确认未把这些结果写成已验证 |

- ⑦ 风险边界是否明确责任归属：PASS。共享文件只在最新版本小补丁合并，无法安全合并交接；舒适度归根现场，广泛设备/原生/长期耗电保持未测（`:36`）。
- ⑧ 验证责任是否有证据产物/责任归属/承接顺序：PASS。impl 负责纯测试/类型/构建；root 独立全量命令和合成数据浏览器现场，TEMP 日志/快照与指定截图目录；fresh reviewer 消费同一差量，代码再改须重验/重审（`:40-42,58`）。

### C. 基线与澄清一致性

- ⑨ 基线与已回答 Q&A/头脑风暴决策无矛盾：PASS。没有待答用户 Q&A；下表映射的是已记录自主决策，未伪称逐项用户答复。

| Q&A / 自主决策条目 | 对应基线字段/条目 | 一致性 |
| --- | --- | --- |
| 当前开发指令与已核对原聊天的自主完成授权 | README 授权节；澄清授权说明；§8 的正式 Gate | 一致，不重复阶段许可，保留 Gate |
| 决策 1：当前记录作可变中心，一层/两层与依据筛选 | G1、§7 的范围前选用新定位目标 | 一致 |
| 决策 2：主题导览、独立项合并、克制画线且度数/证据保持 | G2、A1、§7 的原度数约束 | 一致 |
| 决策 3：创建轨迹/按日回顾/宠物各自职责 | G2、A1/A2、§9 并发边界 | 一致 |
| 决策 4：UUID 到局部图且保留筛选，旧 Ctrl K 兼容 | G1/G2、§7 | 一致；不改变旧快开清筛选行为 |
| 决策 5：外观折叠、静态入口、主题适配、浅深/窄屏 | G2/G3、§3/§4 的根现场责任 | 一致 |
| 决策 6：复用现有数据/scene、主题坐标派生与 bounds | A2/A3、§7，impl 纯投影非变异验证 | 一致 |

- ⑩ 基线可从 README + 澄清推导（无凭空约束）：PASS。
  - “开发一下 3d 视图还有关联图的能力” → 决策 1/2/4 的局部证据阅读与主题探索回路 → G1/G2。
  - “不重复不冲突，能够都发挥出各自的用处”以及宠物/日历并行背景 → 决策 3/6 的职责分工与复用 → A1/A2/A3、§7/§9。
  - “展示的时候也要很清晰舒适” → 决策 5 的克制画线、静态入口、外观收起和可读控件 → G3、§3/§4 的实际 UI 验证。
  - README 记录的混合工作树和快照证据 → 决策 6 的小接入 → §9 的输入快照而非 HEAD 差量、§10 的失败/并发留痕。

### D. 基线内部一致性

- ⑪ 目标锁与反目标不互斥：PASS。2D 扩展已有稀疏图范围而不引入关系算法；3D 从同一图派生主题；保留创建时间回顾不复制按日月历。
- ⑫ 风险边界与验证责任不矛盾：PASS。纯前端交付沿用既有原生/数据边界，原生安装和多设备/GPU 不在本轮验收范围；共享文件风险由 root 承接。

### E. 与 research 对齐

- ⑬ research 关键约束已进入基线/澄清/风险边界：PASS，复核以下关键事实与现有代码：
  - **并发**：App 的外观、五角色与 RecordGarden 接线存在；SpatialNoteMap 的 appearance/pet props 和预览/应用逻辑存在；最新文件小补丁与独立 CSS 的边界已落盘。快照是实际混合输入，不能拿 HEAD 当本轮起点。
  - **中心与外部 UUID**：`NoteGraph.tsx:226-236` 的 locate 当前仅在模拟节点中找 UUID；若先按旧中心截取会误报 missing。基线 §7 已要求外部目标在范围投影前生效。`graphFocus.ts:9-22` 的等待/最新 token/消费/卸载边界及 App `:127-145` 的 latest UUID 校验继续复用。
  - **原 Ctrl K**：App `:102-109,137-142` 当前快开定位会清除筛选；空间新路径保留筛选与旧 Ctrl K 兼容是不同来源的已明确行为，不能统一改写 requestLocate 造成回退。
  - **坐标、度数与原证据**：`spatialLayout.ts:27-57` 的组序/槽位依赖当前集合，重建子集会移动 UUID；degree 从全部输入边算出，scene `:66` 又用 degree 决定模型大小。scene `:95-104` 的 fit 消费 bounds，`:150-164` 的线条消费 layout.edges，SpatialNoteMap 当前详情同样消费 layout.edges。决策 2/6 和 §7 已接住这些约束，LW 必须把完整布局/证据与显示布局的消费落点写清，并把“尽量保留”具体化为主题聚焦复用已派生坐标的非变异验证；无需先重写 scene 公共 API。
  - **行业建议与最终取舍**：业界调研的一跳、保留非组淡背景是建议；本基线明确选择一层/两层、主题聚焦和独立 UUID 保留。它们由现有 GraphModel/SpatialLayout 承载，并未把官方产品结构当作晴笺必须复制的契约。
  - **日历事实**：`recordGardenModel.ts:3,28` 和 `RecordGarden.tsx:108-139` 明确 created/record 日期口径、月格与每日列表；3D 继续只表达长期创建时间，A1/A2 已禁止日历/计划副本。

### 澄清与基线核验结论

- 整体结论：PASS。无未回答项，无基线 FAIL。事实足以进入 LW；具体实现锚点和消费分离仍由 LW/Gate-2 审核，不能用本记录代替。

## 缺失证据

- 当前新能力尚未实施；局部范围/主题聚焦/跨视图定位的新测试、根 fresh build 与新差量证据尚未产生。
- 浏览器的浅深主题、390px、相机、选择、外观折叠/预览、遮挡与舒适度尚未验收；原生 WebView/GPU、触屏/读屏、长期内存耗电、多设备未测。基线已列责任与未测边界，均不能由本次测试替代。
- 保留已见命令错误：root 误读不存在的 `tests/spatial.test.mjs` exit 1；research 的 Windows glob 参数搜索 exit 1。本 reviewer 也遇到 `rg src/Record*.tsx src/record*` 的 Windows 路径 glob 错误；随后改为 `rg src -g 'Record*.tsx' -g 'record*.ts'` 得到 exit 0。读取日志的大批输出曾截断，已补读相关源码片段，且 reviewer 独立 npm test 的完整输出未截断。无产品测试失败被隐藏。

## contract drift / stale / mirror mismatch

- 未发现阻断 readiness 的契约漂移。research 是事实/建议，clarifications 是唯一最终基线；一跳建议到一层/两层选择不构成镜像契约冲突。
- `docs/Spatial.Experience.md` 仍描述 0.6.0，而当前 0.7.0 混合工作树已有外观/角色，research 已明确这是进行中状态。§5 指定落地后同步当前事实并保留并发段落；不能现在当成已发布能力。README 的阶段和里程碑尚待 root 消费本结果后推进。

## 建议恢复动作

- A. 证据补强：无需 readiness 前补证。LW 接住上列定位顺序、布局/显示证据分离与坐标非变异锚点；实现后由既定责任补 test/build、现场与 fresh 实施审查。
- B. 契约纠偏：无阻断契约缺口，无需新增用户决策或扩大到原生、宠物、日历、存储任务。共享关键事实变化时先回写基线并复检。

## 放行判断

- allow_enter_lwplan: yes
- 只允许进入 LW，不构成实施 Gate-2 或产品验证结论。
