# 方案评审记录：lwplan（第 2 轮）

**评审对象**：修订后的 `lwplan.md`（2026-10-06），连同 `clarifications.md`、`research.md`、`hlplan.md`、`review_notes_readiness_2.md` 和实际代码
**评审时间**：2026-10-06
**评审结论**：✅ 通过
**前一轮评审**：[第 1 轮](review_notes_lwplan_1.md)
**协议结论**：PASS
**业务结论**：PASS；未发现 PROBLEM_DEFECT。

## 可行性分析

- 技术：`NotesView` 的 `limit` 确在组件本地（`src/NotesView.tsx:24-25`）。本轮以 `wheelEntryId` 打开宽幅 `Modal`，保持 `view='all'` 和列表挂载，能沿用本地分页与滚动。`src/Modal.tsx` 已有 Tab 焦点陷阱、body 滚动锁与卸载焦点恢复，计划只扩可选 frame class。`src/recordNavigation.ts` 的 `createEditHandoff` 在下一帧复核 UUID，符合先关模态再开编辑器的时序。
- 场景：十二个 `Group` / 十二个 `InstancedMesh`、每月稳定的 `instanceId → date key`、共享几何材质与 48 个文字对象上限，构成可实施的 365/366 格方案；真实设备性能尚未测，计划保留测量和降级责任。
- 资源/时间：现有 Three.js、日期模型及图谱模型可用；无新服务和迁移。计划未给工期，实施中应按 S1-S5 顺序核对，不把计划预算当实测结果。

## 上轮阻断复核

| 上轮阻断 | 本轮证据 | 结论 |
| --- | --- | --- |
| 新 View + limit 上移 + 滚动快照，且覆盖层路径不定 | `lwplan.md:15,90-115` 锁定 `view='all'`、`NotesView` 挂载、宽幅 Modal，明确禁止 limit 上移和滚动快照；背景交互、焦点、Esc 和 handoff 有目标片段 | 已关闭 |
| 初见静止，无法观察原作动态 | `lwplan.md:139,157` 规定许可满足时 `paused=false`、flat 入场、自动往复；减少动态/隐藏/失焦冻结，重开复位，并列人工验收 | 已关闭 |
| 运动时拾取与标签预算未闭环 | `lwplan.md:59-66,133-144,157` 规定 12 Group/mesh、组变换与稳定本地索引、最近命中、遮挡/触屏、48 文字对象、最多 32 粒子及重试/Strict Mode | 已关闭，设备帧时待实施验证 |
| 文字回退与 Modal 焦点未闭环 | `lwplan.md:94-108,121-129,144` 指定背景 inert、焦点回入口/失效安全焦点、Escape 顺序、无 WebGL 和 context lost 保留文字清单 | 已关闭 |
| 共享文件既有修改可能混入提交 | `lwplan.md:171,203` 指定实施前状态与 diff 快照、逐 hunk 比对、`git add -p`/精确暂存、`git diff --cached` 审核；归属不明停止暂存 | 已关闭 |
| P3/P4/P6/P8/P9 缺显式留痕 | `lwplan.md:179-195` 写存在性硬门禁、T1/T2/T3、事件对齐表、批量提问模板与双阶段强校验 | 已关闭 |

## 风险点

- `Modal` 目前只对 frame 内事件做 Tab 陷阱（`src/Modal.tsx:10-24`）；实施时仍要按 S2 把所有可交互背景纳入 inert/不可聚焦范围。`PetCompanion` 在 `App.tsx:281-283` 位于 `.workspace` 外，不能只照 S2 片段给 header/workspace 加 inert 后就声称“所有背景不可操作”。建议在实现时覆盖它或确认模态显示时隐藏，并以键盘实际操作验证。此为局部实现注意，不改变已锁定的 Modal 路径。
- S5 `lwplan.md:163` 称年轮“独立视图”，与本轮“记录页宽幅模态”措辞不一致；同步 `docs/Spatial.Experience.md` 时应写“可选年轮覆盖层”，不暗示新增主导航 View。属于文案瑕疵，不影响工作包结构。
- 实际 Windows WebView、弱 GPU、长时重开及鼠标/触摸测量缺证据；计划明确由 coordinator 承接，未测不得当作通过。

## 遗漏或需补充

- 无 Gate-2 阻断缺口。实施时特别核对 modal 背景范围和 `Modal` 焦点恢复与后续 `createEditHandoff` 的实际顺序；若实测不符，按 S2 的本地修补与重新验证处理。

## Gate-2

**Required Set 复核结果**：PASS。T3 主要工作包 S1-S5 有目标、锁映射、文件/接口、依赖、验收、回滚、impl-safe 与 coordinator 证据归属；跨层主链、兼容（零迁移）及降级（文字路径）在 `lwplan.md:13-17,78-171,179-189` 可顺读。

**目标锁 / 反目标复核结果**：PASS。L1 真实十二月/365 或 366 日，L2 动态与可停，L3 原 UUID/编辑及无持久化均有实现/验收锚点。下表对基线禁止项逐项核对。

| 反目标禁止内容 | 可核查证据 | 结论 |
| --- | --- | --- |
| 术数、卦象、算卦逻辑 | `lwplan.md:7-9,78-84,133-139` 仅以日期与笔记建模 | 未命中 |
| 空圈冒充关系、日期邻近冒充语义边 | `lwplan.md:45-56,80,121,133` 空日保留真实日历语义，关联只取 ready 直接边 | 未命中 |
| 逐格独立贴图、常驻 60fps、全局指针监听 | `lwplan.md:133-154` 共享资源、局部 pointer、30fps 调度、有限文字/粒子 | 未命中 |
| 改正文/排序/备份、远程请求或新关系算法 | `lwplan.md:9,80,94,121,133` 纯派生，原编辑 handoff | 未命中 |

### Gate-2 关键复核

| 项目 | 结果 | 说明 |
| --- | --- | --- |
| 关键实现锚点复核 | PASS | S1 `recordGardenModel`/`useNoteGraph`，S2 `App`/`NotesView`/`Modal`/`createEditHandoff`，S3 新 React 组件，S4 新 scene 与 `spatialRuntime`，S5 根文档和证据文件，均可直接定位。 |
| 代码片段充分性复核 | PASS | `lwplan.md:34-72` 的 UUID→模型→场景 key→原编辑、`:100-109` Modal/背景 inert、`:148-155` 动态调度覆盖主链最小闭环；S4 有目标结构与预算，不要求最终实现全文。 |
| 作者体验门复核 | PASS | 保持 `NotesView` 挂载、无 limit/scroll 跨层状态；年月与关系有明确文字含义，日期清单和 WebGL 同步，失败仍可操作；后续维护者无需在多条导航策略间自行选择。 |
| 人工 review 对齐复核（总括项） | PASS | 以下三个子项均 PASS；主链与事实映射能一并解释实现和验证责任。 |
| 核心链路顺读复核 | PASS | `lwplan.md:13-17` 顺读现状→覆盖层→真实模型/图谱→场景/文字→原编辑→不改层→验证；S1-S5 细化。 |
| research 事实映射复核 | PASS | `lwplan.md:19-28` 将 60 条筛选、创建日、图谱时效、scene 预算、原编辑分别映射到实现和验证锚点。 |
| 跨包脑补需求复核 | PASS | S2 仅一条挂载路径，S4 状态机/拾取/资源 owner 明确，S3 文字回退与 S5 证据承接可直接沿主链阅读。 |

**P1-P9 协议合规核验表**：PASS。

| 协议项 | 结果 | 说明 |
| --- | --- | --- |
| P1 | PASS | `lwplan.md:181` 明确无任务数下限。 |
| P2 | PASS | `:181,187-189` Required Set 必备内容存在性判定。 |
| P3 | PASS | `:181` 明确纯存在性硬门禁，任一缺项即失败。 |
| P4 | PASS | `:182` 维护 T1/T2/T3 分型及本案 T3 接口、兼容、降级 Required Set。 |
| P5 | PASS | `:183-184,189` 基线口径不唯一或新关键风险交 coordinator；提问机制明确。 |
| P6 | PASS | `:183,191-195` 事件触发对齐的留痕位置、已触发事件及回退结论均在表中。 |
| P7 | PASS | `:181` 澄清数量不设上下限。 |
| P8 | PASS | `:184` 批量提问优先级、模板及本轮未触发原因均明确。 |
| P9 | PASS | `:185-189` lwplan 作者修订后 Gate-1 与 review 前独立 Gate-2 两阶段强校验、落盘位置和失败回环明确。 |

**基线与澄清一致性复核结果**：PASS。

- 澄清“未回答”列表是否为空：**是**，`clarifications.md:3-5` 为“暂无”。
- 目标锁是否被 lwplan 遵守：**PASS**，见 L1-L3 对应 `lwplan.md:7,15,80,94,121,133-157`。
- 反目标是否被 lwplan 踩中：**PASS**，未命中依据见禁止项表。
- 头脑风暴决策是否被 lwplan 违反：**PASS**，单条记录入口、十二个月真实日期、ready 直接边、原记录导航、自动动态许可与本地派生均有对应方案。

**设计味道扫描结果**：WARN：S5 的“独立视图”表述与宽幅模态路径不一致；S2 示例只把 header/workspace inert，实施者需连同 `PetCompanion` 等背景可交互节点处理。两者可在既定方案内局部修正，不构成架构回退或 Gate-2 阻断。

### Gate-2 结论

**Gate-2**：PASS。协议/业务结论均为 PASS，可进入 Impl；U5 性能与真实设备体验仍需按计划留实际证据，当前不是已验证状态。未见下游递归派发 subagent/task 指令。未发现本轮有已证实的 shared runtime contract drift、stale docs 或 mirror mismatch；上述“独立视图”是本 feature 文案一致性提醒。

## 修订建议

- 实施时把 S2 的 inert 覆盖到 `PetCompanion` 等背景可聚焦节点，或在模态期间隐藏它们；在实际 UI 验证 Tab、Esc 与焦点恢复。
- S5 同步文档用“记录页年轮覆盖层”表述，避免写成独立主视图。

## 后续行动

- 进入 Impl，按 S1-S5 执行并逐项记证据；WebView、弱 GPU、长时重开、触摸和性能仍由 coordinator 承接。
- 实施前保留共享文件原有 diff，按 hunk 暂存并检查缓存区；本轮评审未改代码、提交或推送。

---

## 跨功能事实（待确认）

### 架构与约束

- [2026-10-06] `Modal` 已持有 Tab 焦点陷阱、页面滚动锁及卸载焦点恢复；需要宽幅展示时可用可选 frame class 扩展尺寸，同时仍应核对所有模态背景节点的 inert 范围。
