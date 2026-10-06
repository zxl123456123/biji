# Readiness 检查记录（第 1 轮）

**评审对象**：`research.md`、`clarifications.md`、`README.md` 与当前代码
**评审时间**：2026-10-06
**评审结论**：BLOCKED

## 输入文件

- `docs/current/note-embedded-pet/{README,clarifications,research}.md`
- `docs/Note.Formatting.md`、`src/{NoteComposer,noteCodec,noteFormat,NotesView,Pet3DView,Pet3DScene,App,noteText}.tsx`（相应 `.ts` 文件）
- `C:\Users\ZXL\.codex\skills\plan-review\SKILL.md`、`development-workflow/SKILL.md` 的完整实现基线格式与头脑风暴确认规则

## 澄清与基线核验

### A. 澄清问题完整性

- ① 未回答 Q&A 是否为空：**否**。文件只记「正文可插入、先用原创晴小团」（`clarifications.md:3-6`），却把「每条最多一个」「插入时冻结外观」「其余阅读入口只显示静态」写为已决定（`clarifications.md:10-12`）。这些会直接改变用户可见结果，既未列为待回答，也未见最终决策摘要和用户确认。
- ② coordinator 是否漏记澄清问题：**是**，上述三项没有问答来源或确认时间。
- ③ 头脑风暴决策是否完整落盘：**否**。有技术取舍文字，但无用户确认状态；`development-workflow/SKILL.md` 要求确认后才能成为规划输入。

### B. 基线内部质量

- ④ 必填章节 1–10 是否存在且非空：**FAIL**。当前「完整实现基线」只有四个内联字段（`clarifications.md:21-29`）；缺风险边界、验证责任及基线生成/下游消费/状态兼容/补充需求规则等结构。后四项可依共享合同简要引用，但风险和验证责任必须落到本功能。
- ⑤ 目标锁是否具体可验证：**FAIL**。保存/重开/备份和静态回退可验证，但「每条最多一个」「插入时外观」在目标锁中被当作已确认语义；`motionAllowed` 如何传入编辑器、失败回退由谁实测未分配。
- ⑥ 反目标是否具体：**PASS**。`clarifications.md:25` 给出明确禁区；正式基线应收敛为 1–3 条硬约束。禁止项可核查性如下。

  | 禁止内容 | 当前证据及后续核查方式 | 结论 |
  | --- | --- | --- |
  | 发布第三方模型 | 已知公开资产为原创 GLB；后续核查 `public/` 与打包列表 | 尚未实施，未见命中 |
  | 持久化任意 HTML / 新附件或数据库结构 | `Note.content` 当前为字符串，`noteCodec.ts:193-253` 做有限语义；后续查 diff 和备份结构 | 尚未实施，未见命中 |
  | 重写编辑器 / 多卡 WebGL | `NoteComposer.tsx:101-106,156` 持有原生 DOM，`NotesView.tsx:58` 卡片为按钮；后续查组件实例数 | 尚未实施，未见命中 |

- ⑦ 风险边界责任归属：**FAIL**。`research.md:G` 的旧 EXE、WebGL 多实例和原生撤销均未证；基线仅说「未实测标注」，没有谁承接真机/旧版副本验证或未证时怎样限制完成声明。
- ⑧ 验证责任的证据产物/责任/顺序：**FAIL**。`clarifications.md:29` 列验收项，没有 codec/DOM 自动证据、浏览器手测、Tauri 真实环境及 review 各由谁执行和记录在哪里。

### C. 基线与澄清一致性

- ⑨ 与已回答 Q&A 和头脑风暴决策无矛盾：**FAIL**，因为用户答复只能证明位置和先做原创角色，不能推出单块、外观快照或静态阅读取舍。

  | Q&A 条目 | 对应基线字段 | 一致性 |
  | --- | --- | --- |
  | 「每条笔记正文中可插入」 | `clarifications.md:23` 正文插入 | 一致；不蕴含每条最多一个 |
  | 「先做原创晴小团」 | `clarifications.md:23,25` 原创模型、不发布第三方 | 一致；不蕴含插入时冻结衣橱外观 |
  | 单块/冻结外观/阅读静态 | `clarifications.md:10-12,23` | 无用户 Q&A，可视为待确认 |

- ⑩ 基线可从 README + 澄清推导：**FAIL**。`README.md` 的「在单条正文插入，重开仍看到」→ 已答「每条笔记正文中可插入」→ 基线的正文位置/持久化链可推导；`README.md` 的「先用原创 GLB」→ 已答先做原创 → 模型身份可推导。`README.md` **没有**给出单块、外观快照或静态阅读，`clarifications.md` 将其写成最终决策但未记录确认。

### D. 基线内部一致性

- ⑪ 目标锁与反目标不互斥：**PASS**。正文单实例三维与多卡不建 WebGL 可以并存；这只是技术可行方向，不代表已验证浏览器编辑历史。
- ⑫ 风险边界与验证责任不矛盾：**FAIL**。两者均未建立，无法分清实现自证和真实环境承接。

### E. 与 research 对齐

- ⑬ research 关键约束进入基线：**FAIL**。`research.md:D/G` 已标明原生 undo/光标、卡片嵌套按钮、WebGL 资源和旧 EXE 的未证状态。基线把原生撤销写为目标（`clarifications.md:11,29`）而没有失败回退与验证责任；旧 EXE 甚至被写成「可保留纯文本内容」（`clarifications.md:14`），研究仅证明字符串结构兼容，未证明旧 EXE 打开再保存安全。

### 澄清与基线核验结论

**BLOCKED**。①存在未回答的用户可见产品决策，不能进入低层规划；其他 FAIL 属证据与基线结构缺口，待决策后可由 coordinator 修订。

各 FAIL 的恢复三元组：

| 具体不一致内容 | 对 lwplan 的影响 | 建议恢复动作 |
| --- | --- | --- |
| `clarifications.md:10-12` 写「最多一个」「插入时外观」「阅读入口静态」，原始请求仅说正文可插入 | 无法确定指令基数/字段、全局衣橱关联及阅读视图的渲染目标 | 向用户展示取舍并记录答复，再重算基线 |
| `clarifications.md:21-29` 缺完整基线的风险/验证责任 | 无法制定可审查的浏览器 DOM/undo、GPU 与备份证据边界 | 按共享合同补齐基线，指定证据产物和承接人 |
| `clarifications.md:14` 称旧程序「可保留纯文本内容」，`research.md:G` 标为未证 | 可能把旧版回写的数据损失风险写成事实 | 改为未验证；以旧版程序和数据库副本取证，或清楚声明不保证且不以旧版回写验收 |

## 缺失证据

1. 用户对正文嵌入数量、外观是否跟随衣橱、卡片/花园/图详情是否静态的确认记录。这三项可作为一组产品决策摘要请用户确认。
2. 在真实 contentEditable 中，独占块的插入、删除、撤销/重做、跨块选区、IME、保存后回填的验证归属及失败时缩小实施范围的原则。`NoteComposer.tsx:97,102,133` 使用原生命令，不能仅凭 `contentEditable=false` 推定历史可靠。
3. 旧 EXE 数据副本验证与 WebGL 实例数/降动效/上下文失败的证据责任。`Pet3DView.tsx:18-69` 每实例有独立 canvas 生命周期；`NotesView.tsx:58` 卡片正文是按钮。静态阅读方向合理，但具体表现应由确认后的基线锁定。

## contract drift / stale / mirror mismatch

- **已发现阶段文档与 shared runtime 口径不一致**：`clarifications.md` 把未经用户确认的实现取舍写在「头脑风暴决策」，且「完整实现基线」未具备 `development-workflow/SKILL.md` 的 1–10 结构与确认记录。影响是下游规划可能把假设当硬输入。未发现项目 AGENTS 与上述 shared contract 的实质冲突。
- `README.md` 仍写「当前阶段：代码库与业界调研」，而 `research.md` 已完成且进入 readiness；状态页应更新。

## 建议恢复动作

- **证据补强**：由 coordinator 让用户确认上述产品决策，记录已答 Q&A；修订 `clarifications.md` 的完整基线，给 DOM/undo、WebGL、旧版副本及手测分配证据产物和责任；更新状态页后重新执行 readiness。
- **契约纠偏**：先修本 feature 的 `clarifications.md` 阶段口径；当前未见需要修改 shared skill、平台入口或项目 AGENTS 的证据。

## 放行判断

- `allow_enter_lwplan: no`

---

## 跨功能事实（待确认）

### 架构与约束

- [2026-10-06] 当前笔记编辑器的 DOM 与撤销历史由浏览器持有，新增原子嵌入节点须分别验证 DOM→纯文本、回填、原生 undo 和输入法；单靠解析器测试不足以证明编辑安全。见 `NoteComposer.tsx:97-106,133-156` 与 `docs/Note.Formatting.md`。
