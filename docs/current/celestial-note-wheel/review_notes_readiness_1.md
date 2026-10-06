# Readiness 检查记录（第 1 轮）

**评审对象**：`research.md` + `clarifications.md` + `hlplan.md` 及实际代码
**评审时间**：2026-10-06
**评审结论**：REVISE

## 输入文件

- `docs/current/celestial-note-wheel/README.md`、`research.md`、`clarifications.md`、`hlplan.md`
- `src/App.tsx`、`src/NotesView.tsx`、`src/recordGardenModel.ts`、`src/useNoteGraph.ts`、`src/noteGraphModel.ts`
- `plan-review/SKILL.md`、`development-workflow/SKILL.md` 中的 readiness 与基线模板

## 澄清与基线核验

### A. 澄清问题完整性

- ① 未回答 Q&A 是否为空：**是**。`clarifications.md:3-5` 写明“暂无”。
- ② coordinator 是否漏记澄清问题：**未见遗漏**。对话中入口、核心目标、视觉程度、十二圈含义、十二个月模型及最终确认，均落在 `clarifications.md:9-33`。
- ③ 头脑风暴决策是否完整落盘：**基本完整**。入口、真实日期、记录操作、视觉和数据边界见 `clarifications.md:25-33`。

### B. 基线内部质量

- ④ 各必填章节（1-10）是否存在且非空/非占位：**FAIL（本 feature 基线缺项）**。`clarifications.md:35-59` 只有 1-5；`development-workflow/SKILL.md:257-304` 的完整模板确有 1-10，特别是 6 基线生成、7 内容边界、8 下游消费、9 新 feature 缺章不得进入下一阶段、10 补充需求处理。需在本 feature 基线补齐有实际内容的 6-10，不能只添加空标题。
- ⑤ 目标锁是否具体可验证：**PASS**。十二个月、真实日期、直接关联、原记录导航、关键视觉动作均可核对（`clarifications.md:37-40`）。
- ⑥ 反目标是否具体：**PASS**。禁止术数内容、虚构关系及绕过资源预算（`clarifications.md:42-45`）。

  | 禁止内容 | 验证方式（本阶段方案证据） | 结论 |
  | --- | --- | --- |
  | 《周易》或算卦逻辑 | `hlplan.md:7-9,37` 明确真实日期与不加入术数内容 | 未见命中 |
  | 装饰圈冒充关系、日期接近冒充语义关系 | `hlplan.md:7,22,24,51,65-67` 使用真实日历格及图谱直接边 | 未见命中 |
  | 逐格贴图、常驻 60fps、全局指针监听绕过预算 | `hlplan.md:32,37,39,43` 采用独立 owner、批量格位、约 30fps 与清理 | 未见命中 |

- ⑦ 风险边界是否明确责任归属：**PASS，需细化执行交接**。已有工作区保护、真实环境未测口径（`clarifications.md:47-50`）；实施与人工体验的责任细分仍见下一项。
- ⑧ 验证责任是否有证据产物/责任归属/承接顺序：**FAIL（证据缺口）**。`clarifications.md:52-55` 仅写实施者、独立审查者、人工体验三类动作；没有指定命令输出与真实设备结果的记录文件、人工体验由谁承接、缺失设备时如何移交和最终由谁裁定“已测/未测”。`hlplan.md:53,61,69` 继续沿用笼统表述。

### C. 基线与澄清一致性

- ⑨ 基线与已回答 Q&A/头脑风暴决策无矛盾：**PASS**。以下映射同时暴露一个下游方案漂移，详见“缺失证据”。

  | Q&A 条目 | 对应基线字段/条目 | 一致性 |
  | --- | --- | --- |
  | Q1 单条笔记可选入口 | 目标锁 1；反目标 3；文档职责前的决策 1 | 一致 |
  | Q2 中心、真实关系、原记录导航、无数据写入 | 目标锁 1、3；反目标 2 | 一致 |
  | Q3 尽量复刻十二圈视觉与动态张力 | 目标锁 1、2；决策 4 的有限光晕 | 一致；`hlplan.md:49` 对光晕的可选表述需修订 |
  | Q4 十二个月、有效日历日、真实记录/关联 | 目标锁 1、3；反目标 2 | 一致 |
  | 最终完整方案确认 | `clarifications.md:33` 与完整实现基线 | 已记录 |

- ⑩ 基线可从 README + 澄清推导（无凭空约束）：**PASS**。
  - `README.md`“把 celestial-wheel 的动态展示方式嵌入晴笺笔记” → Q1 选单条记录的可选大画布 → 基线目标锁 1、反目标 3。
  - `README.md`“探索不用于算卦时的实际用途” → Q2/Q4 选真实笔记关系与十二个月日期 → 基线目标锁 1、3、反目标 1、2。
  - `README.md` 对原作的引用 → Q3 选尽量保留十二圈视觉 → 基线目标锁 2 及头脑风暴决策 4。

### D. 基线内部一致性

- ⑪ 目标锁与反目标不互斥：**PASS**。视觉动作不要求逐格独立资源；真实十二个月允许日期格空置。
- ⑫ 风险边界与验证责任不矛盾：**PASS**。风险承认 Web 构建不能替代真机；验证职责要求分别标明已测/未测，但交接仍欠具体。

### E. 与 research 对齐

- ⑬ research 关键约束已进入基线/澄清/风险边界：**PASS**。`research.md` 的 U1-U4 由 Q1-Q4 与决策 4 关闭，U5 进入基线风险 3 和 `hlplan.md:47-53`。实际代码显示 `App.tsx:120-122` 的 `activeNotes` 与按需图谱可为年轮提供全集；`recordGardenModel.ts:20-35,43-51` 可提供有效创建日和月份天数。`NotesView.tsx:29,48-61` 有单卡操作入口。

### 澄清与基线核验结论

整体：**REVISE**。① 无未回答事项，因此无需新用户决策。

| FAIL 项 | 具体不一致内容 | 对 lwplan 的影响 | 建议恢复动作 |
| --- | --- | --- | --- |
| ④ 基线缺项 | `development-workflow/SKILL.md:257-304` 明确给出 1-10 模板，`clarifications.md:35-59` 只含 1-5 | 缺少生成规则、内容边界、下游消费、状态兼容及阶段补充需求处理；按模板第 9 项不得进入 lwplan | coordinator 依据权威模板补全本 feature 的 6-10，核对上游已确认决定后重跑 readiness |
| ⑧ 验证交接 | 基线写“人工体验……分别标记已测或未测”，未写证据产物、承接者和顺序 | lwplan 可能把 Windows WebView、键盘、长时性能直接交给 impl 口头声明，或无人承接未测 | 在基线中指定 impl 自证记录、coordinator/人工实际体验记录、独立审查读取次序及未测交接规则 |

## 缺失证据

- **视觉目标表述漂移，需方案修订**：用户 Q3 要“尽量复刻原版十二圈视觉”；已确认决策 4 和目标锁 2 将十二圈、差速、平面/立体、聚焦及“有限光晕”列为本轮视觉要素（`clarifications.md:17-18,30,37-39`）。`hlplan.md:24,37-39` 又说光晕用于识别、Bloom 可待实测决定，这是可行取舍；但 `hlplan.md:49` 写“测量后再决定光晕与后处理”，把**有限光晕本身**也变成可选。建议改为：十二圈层次、真实日期格、差速、视角转换、聚焦与有限光晕为本轮可核查目标；`UnrealBloomPass` 是可选实现，若性能不足可用材质/颜色/描边呈现有限光晕，并记录降级及视觉验收结果。若十二圈本身无法在目标设备运行，应作为目标风险回到上游，不可静默减圈。
- 性能预算目前来自既有空间而非年轮实测（`research.md` U5；`hlplan.md:43,49`）。这不阻止写低层计划，但应在计划中留下 Windows WebView、弱 GPU、连续重开与动态关闭的测量和降级证据位置；不能以构建结果替代。
- 原始 README 只记初始需求，最终确认落在澄清文件；目前溯源可还原，但 README 阶段状态可在评审修订后同步。

## contract drift / stale / mirror mismatch

- **未见共享规范之间的 drift**。`plan-review` 的 1-10 检查与 `development-workflow/SKILL.md:257-304` 的 1-10 模板一致；缺口仅在本 feature 的 `clarifications.md`。
- 未观察到本 feature 的 `README.md`、澄清与 research 在数据模型上的镜像冲突。

## 建议恢复动作

- **A. 证据补强**：按共享模板在本 feature `clarifications.md` 补齐 6-10；补验证证据文件、impl 与 coordinator/人工承接次序、缺少真机时的未测口径；修订 `hlplan.md:49`，锁定本轮必需视觉要素与可选 Bloom/降级实现；重跑 readiness。
- **B. 契约纠偏**：本轮未见 shared contract 缺口，无需修改共享技能或平台入口。

## 放行判断

- allow_enter_lwplan: **no**
