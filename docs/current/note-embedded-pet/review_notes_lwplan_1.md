# 方案评审记录：lwplan（第 1 轮）

**评审对象**：`lwplan.md`、`research.md`、`clarifications.md`、`review_notes_readiness_2.md` 与当前代码
**评审时间**：2026-10-06
**评审结论**：REVISE（需修订）
**allow_enter_impl**：no

## 可行性分析

受限纯文本指令经 AST、编辑 DOM 和安全 React 节点往返的方向可实施；现有 `Note.content`、草稿、SQLite TEXT 和 JSON 备份能够承载字符串。计划按 S1 语义、S2 编辑、S3 接线的顺序组织，人工浏览器验证与 `impl` 自证已区分。无需改变已确认产品基线。

## 风险点与最小阻断项

1. **宿主防伪合同矛盾**：`lwplan.md` 主链矩阵要求“只接受受控宿主”，S2 又称“复制粘贴伪造……按普通安全文本处理”，但目标骨架仅示 `isOwnedPetHost(node)`，唯一锚点为可由粘贴 HTML 复制的 `data-note-pet='xiaotuan'`。`src/noteFormat.tsx:64-92` 现有序列化器直接遍历活动 DOM。若无粘贴规范化或本次会话拥有的节点身份登记，精确属性的外来 DOM 会被当成宠物；若精确属性本身即合法，则应明确将其视为允许的结构化粘贴，并取消“伪造宿主不可获得语义”的承诺。计划需确定一种可执行判定与测试，不可两者并存。
2. **当前装扮的全阅读入口传递仍不够可复核**：S3 提出 `renderMarkdown(value, appearance?)`，但 `NotesView`、`NoteGraph` 现有 props 不含 `appearance`，各自直接调用 `renderMarkdown`（`src/NotesView.tsx:39,58`、`src/NoteGraph.tsx:364`）；花园回调在 `src/App.tsx:251`。请在 S3 写出 `App.petAppearance → NotesView/NoteGraph props → 各 renderMarkdown` 与花园回调的明确接线、统一 `character:'xiaotuan'` 的落点和漏传时的默认行为。否则“当前衣橱外观在所有阅读入口一致”难以验收。

**已核对的实例上限**：`src/App.tsx:131-132` 在 composer 打开时使 `businessEnabled=false`；`src/petBehavior.ts:40-44` 据此使 `present=false`；`src/PetCompanion.tsx:193` 因而卸载浮宠三维视图。阅读入口计划均为静态，编辑区至多一个宿主。此链与 S2/S3 的单实例目标一致，不构成阻断。

## Gate-2

**Required Set 复核结果**：FAIL。T3 的目标、主链、迁移/降级、工作包、依赖、回滚、验证责任均存在；宿主来源与 appearance 全入口传递这两个跨层合同尚未闭合。

**目标锁 / 反目标复核结果**：PASS。目标、反目标均已列；本轮缺口属于实施合同充分性。静态阅读与编辑区单实例方向同当前浮宠卸载条件一致。

| 反目标禁止内容 | 可核查依据 | 结论 |
| --- | --- | --- |
| 第三方 GLB 发布 | `lwplan.md` 目标锁、S1、S3；仅指定 `pets/xiaotuan.glb` | 未触及 |
| 任意 HTML 持久化/渲染、新附件或数据库列 | 主链矩阵、S1/S2，字符串指令和安全 React 节点 | 未触及，但 DOM 伪造判定待补 |
| 重写编辑器、列表无限 WebGL、复杂配置 | S2 浏览器编辑根、S3 静态预览；`App.tsx:131-132`、`petBehavior.ts:40-44` | 未触及；composer 打开时浮宠不 present |

### Gate-2 关键复核

| 项目 | 结果 | 说明 |
| --- | --- | --- |
| 关键实现锚点复核 | FAIL | S1/S2 文件和函数充分；S3 缺 `NotesView`/`NoteGraph` 的具体 props 接线。浮宠单实例条件可由当前代码核实。 |
| 代码片段充分性复核 | FAIL | 解析、DOM 序列化、插入骨架覆盖主链，但 `isOwnedPetHost` 没有足以判断粘贴伪造的必要条件。 |
| 作者体验门复核 | PASS | 一条可选块、当前位置、无按钮嵌套、失败静态回退和不暴露指令都利于写作；条件是上述合同修正。 |
| 人工 review 对齐复核 | FAIL | 核心链路顺读 PASS；research 事实映射 PASS；跨包脑补需求 FAIL（宿主来源、装扮 props 需 reviewer 自行补全）。总项随子项 FAIL。 |
| 核心链路顺读复核 | PASS | 文首现状主链、改动落点、矩阵和 S1–S3 可直接顺读。 |
| research 事实映射复核 | PASS | 字符串存储、DOM 往返、按钮嵌套、搜索、WebGL 生命周期均映射了实现与验证责任。 |
| 跨包脑补需求复核 | FAIL | 见宿主防伪和 appearance 传递两处。 |

**P1-P9 协议合规核验表**：PASS

| 协议项 | 结果 | 说明 |
| --- | --- | --- |
| P1 | PASS | 无任务数硬门槛。 |
| P2 | PASS | Gate-1 按必备内容存在性自检。 |
| P3 | PASS | Gate-1/Gate-2 用存在性放行，不以评分替代。 |
| P4 | PASS | 明确 T3 Required Set。 |
| P5 | PASS | 新阻塞不唯一时指向 `【DELEGATE_QUESTION】`；当前缺口均为计划内实施合同。 |
| P6 | PASS | “事件触发对齐留痕”写出新假设/风险/阶段切换位置。 |
| P7 | PASS | 澄清数量无上下限硬门槛。 |
| P8 | PASS | 批量模板按 P0/P1/P2 排序。 |
| P9 | PASS | Gate-1 自检与 Gate-2 独立复核均已明确。 |

**基线与澄清一致性复核结果**：PASS。澄清“未回答”列表为空；用户授权位置/数量判断，计划维持每条至多一次、原创角色、编辑三维、阅读静态；反目标未被计划主动违反，头脑风暴决策未偏离。上述问题是计划可执行性缺口，无需再次询问用户。

**设计味道扫描结果**：WARN: `renderMarkdown` 以可选 `appearance` 传入可能让调用方默默遗漏当前装扮；应选必填参数或显式默认语义并覆盖全部阅读入口。其余未见过度抽象。

### Gate-2 结论

**Gate-2**：FAIL。修订 `lwplan.md` 上述两个合同后重做 Gate-2；目前 `allow_enter_impl: no`。

## 修订建议与后续行动

- 首选最小修订：严格限定真实编辑器产生的宿主，说明粘贴/撤销后的身份维护；或把同形结构化粘贴定为合法输入并将安全承诺改成“非法字段不提升为宠物语义”。明确所选路径及对应单块测试。
- 补齐 `App → NotesView/NoteGraph/RecordGarden → renderMarkdown` 的 appearance 传递矩阵和统一原创角色覆盖点，再进行独立计划复核。

**contract drift / stale / mirror mismatch**：本轮未见 shared runtime 或镜像副本漂移；编辑时浮宠单实例条件已由当前代码核实。
