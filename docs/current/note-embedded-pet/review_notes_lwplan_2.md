# 方案评审记录：lwplan（第 2 轮）

**评审对象**：修订后的 `lwplan.md`、`review_notes_lwplan_1.md`、`clarifications.md`、`research.md` 与当前调用点
**评审时间**：2026-10-06
**评审结论**：PASS（通过）
**前一轮评审**：[第 1 轮](review_notes_lwplan_1.md)
**allow_enter_impl**：yes

## 可行性分析

第 1 轮两个阻断项已闭合。`lwplan.md:26,47,86-91,116` 明确同形独立 DOM 块可来自工具或粘贴，只将首个合法块序列化为固定 `[[pet:xiaotuan]]`；第二块不获第二宠物语义，非法字段与额外 HTML 不执行、不作为 HTML 持久化。它没有继续承诺识别节点来源，且明确普通 HTML 粘贴的瞬时处理仍属既有编辑器边界。`lwplan.md:27,98-104` 明确 App 外观经 NotesView 卡片/拖拽覆盖层、NoteGraph 详情、RecordGarden 回调、NoteComposer 三维入口传递；`renderMarkdown` 统一强制原创角色，漏传时退到默认外观。现有 `renderMarkdown` 调用点与矩阵相符（`src/NotesView.tsx:39,58`、`src/NoteGraph.tsx:364`、`src/App.tsx:251`）。

## 风险点

- 原生 `insertHTML` 的段中拆块、不可编辑节点删除/撤销和真实 WebGL 生命周期仍须按 S2/S3 在浏览器验证；计划把失败条件和回退写清，未把这些未证事实当作已通过。
- 合法同形粘贴被接受为固定语义是明确产品合同；外来 HTML 的瞬时浏览器行为不由本功能净化。实施审查应核对序列化最终只产出固定指令或安全字面文本。

## 遗漏或需补充

没有阻断实施的遗漏。实现时应把「严格同形」转换为确定的 DOM 谓词和测试样本；额外属性/子节点只可忽略，不可进入持久数据。此项是 S2 既定合同内的实现验收，不需新产品决策。

## Gate-2

**Required Set 复核结果**：PASS。T3 的目标、反目标、主链、事实映射、接口、兼容/降级、S1–S3 工作包、依赖、回滚与分层验证均存在，且第 1 轮缺口已有修订标签和目标形态。

**目标锁 / 反目标复核结果**：PASS。至多一处、正文位置、编辑三维、阅读静态、纯文本保存和原创建模均有直接落点。

| 反目标禁止内容 | 验证方式 | 结论 |
| --- | --- | --- |
| 发布第三方 GLB | `lwplan.md:10,35,76,100` 仅指定公开原创 `pets/xiaotuan.glb` | 未触及 |
| 任意 HTML 持久化/渲染、附件或新数据库列 | `lwplan.md:14,24-26,35,86-91,116` 固定指令及安全节点 | 未触及 |
| 重写编辑器或列表无限 WebGL | `lwplan.md:12,25,88-90,100-105` 浏览器编辑根、阅读静态 | 未触及 |

### Gate-2 关键复核

| 项目 | 结果 | 说明 |
| --- | --- | --- |
| 关键实现锚点复核 | PASS | S1 的 `parseNote`/`noteHtml`/`notePlain`，S2 的 `editorHtmlToMarkdown`/`NoteComposer`，S3 的 App/NotesView/NoteGraph/RecordGarden 调用链与首个复核落点明确。 |
| 代码片段充分性复核 | PASS | `lwplan.md:34-55` 有解析、DOM 序列化、阅读外观、原生插入骨架；`lwplan.md:24-27,103` 补足同形判定和跨入口参数流。 |
| 作者体验门复核 | PASS | 作者在当前光标处插入、继续输入，拒绝时有说明；静态阅读不抢交互，失败有等尺寸回退；存储指令不暴露。 |
| 人工 review 对齐复核（总括项） | PASS | 下列核心链路顺读、research 事实映射和跨包脑补需求均 PASS。 |
| 核心链路顺读复核 | PASS | 文首给出 `Note.content → AST → 编辑 DOM → 纯文本 → 阅读/搜索` 和明确不改层，S1–S3 顺序可直接执行。 |
| research 事实映射复核 | PASS | `lwplan.md:58-65` 将字符串持久化、DOM 往返、搜索、卡片按钮、WebGL 生命周期和动效门映射到实现与验证。 |
| 跨包脑补需求复核 | PASS | 第 1 轮的宿主来源和外观传递已分别在主链矩阵、S2 合同、S3 接线矩阵展开，无需 reviewer 自行补接口。 |

**P1-P9 协议合规核验表**：PASS

| 协议项 | 结果 | 说明 |
| --- | --- | --- |
| P1 | PASS | 无任务数量硬门槛。 |
| P2 | PASS | Gate-1 按必备内容存在性自检。 |
| P3 | PASS | Gate-1/Gate-2 用存在性门禁。 |
| P4 | PASS | 开头标明 T3，工作包和 Required Set 明确。 |
| P5 | PASS | 新阻塞不唯一时用 `【DELEGATE_QUESTION】`，当前无未决产品问题。 |
| P6 | PASS | `lwplan.md:118` 写明新假设/风险/阶段切换时的留痕位置。 |
| P7 | PASS | 无澄清问题数量上下限。 |
| P8 | PASS | `lwplan.md:117` 有 P0/P1/P2 批量提问模板。 |
| P9 | PASS | `lwplan.md:120-122` 分列 Gate-1 自检与独立 Gate-2。 |

**基线与澄清一致性复核结果**：PASS。`clarifications.md` 无「未回答」条目；用户授权的可选单次正文位置、原创角色、编辑三维、阅读静态和当前装扮均被遵守。第 1 轮缺口的修订不改变完整实现基线，也未触及反目标。

**设计味道扫描结果**：WARN: `renderMarkdown` 的默认 appearance 会在未来漏传时静默降为原装，但 S3 已要求 `rg 'renderMarkdown\(' src` 核对每个当前阅读入口显式传参，并以非默认装扮验证全入口；因此本轮不阻断。

### Gate-2 结论

**Gate-2**：PASS。`allow_enter_impl: yes`。真实浏览器编辑历史、外观变化和资源释放属于实施后证据，不能由本评审代判。

## PLAN_DEFECT 原地修订复核

修订章节 1、S1、S2、S3、4 均有「本轮修订说明」；新增/改写段落带 `[修订: PLAN_DEFECT-R1.1/R1.2]`，第 1 轮已存在的主链、工作包与验证支撑文本仍在，仅做覆盖性澄清。S2/S3 保留粘贴归一、全入口接线及其测试/回退任务；未见删除已实施代码或大规模重排，故无需升级处理。

## 后续行动

按 S1→S2→S3 进入实施；`impl` 记录命令和证据，coordinator 承接浏览器及可选旧版副本验收，之后做独立 Review(Impl)。

**contract drift / stale / mirror mismatch**：本轮未发现。无跨功能事实。
