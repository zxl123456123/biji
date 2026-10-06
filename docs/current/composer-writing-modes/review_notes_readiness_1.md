# Readiness 检查记录（第 1 轮）

**评审对象**：`research.md` + `clarifications.md`，feature `composer-writing-modes`。
**评审时间**：2026-10-03。
**评审结论**：PASS。仅允许进入本feature低层规划，不代表新增编辑能力已实现或实测。

## 输入文件

- 完整读取[README](README.md)、[原始反馈及最新模板答复](source_materials/feedback_20261003.md)、[research](research.md)、[完整实现基线](clarifications.md)、[root改前验证](verification.md)。已完整加载plan-review及verification-before-completion；无递归委派。
- 实际读`src/NoteComposer.tsx`、`noteFormat.tsx`、`noteText.ts`、`recordTools.ts`、`Modal.tsx`，以及styles编辑器/footer区、store草稿接口、types、既有纯正文测试与消费者锚点。核对独立改前副本存在；不操作用户草稿/DB/UI/Git。
- 本review实际纯检查退出0：十个非空基线章节、十三项及溯源表存在，上述八个相关源文件SHA256与本feature改前副本一致；报告`git diff --check`退出0。该证据只核对规划输入，未运行或宣称新功能通过。
- 独立查阅[MDN font-synthesis](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-synthesis)、[MDN execCommand](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand)、[Joplin富文本限制](https://joplinapp.org/help/apps/rich_text_editor/)。官方仅支持字体合成、撤销及转换限制的风险判断，不证明本机视觉或兼容性已通过。

## 澄清与基线核验

### A. 澄清问题完整性

- ① 未回答Q&A为空：**是**。最新“排版 + 几个轻量模板（推荐）”已落原话和已回答区；模板不再依赖超时默认选择。
- ② coordinator是否漏记问题：**未发现**。问题中日记/会议纪要/阅读随记与答复均可在source第20–24行直接核查；连续开发授权已记录，不重问阶段许可。
- ③ 头脑风暴决策完整落盘：**PASS**。六项明确格式集合、两级标题、模板场景/空白新记录限制、footer层级、局部斜体合成、路径与不做项。

### B. 基线内部质量

- ④ 必填1–10章节存在且非空/非占位：**PASS**，clarifications第27–59行可定位全部目标/反目标/风险/验证/文档/生成/内容/消费/兼容/补充需求规则。
- ⑤ 目标锁具体可验证：**PASS**。格式的输入→保存预览→回填→纯正文四方一致；模板不覆盖；中文/英文斜体真实显示；连续输入、选区、撤销、快捷保存和390px浅深排版均可核查。
- ⑥ 反目标具体：**PASS**，禁止项检查如下。此表确认当前基线未包含越界指令，不是提前宣称未来实现已合规。

| 禁止内容 | 可核查验证方式 | 结论（确认本轮基线不存在该指令） |
|---|---|---|
| 重量编辑引擎、表格/附件/远程模板/任意HTML持久化 | clarifications头脑风暴3、反目标及内容边界；research E选择现路径；实际NoteComposer:19,45→受控codec，非直接存HTML | 确认不存在；有界格式与共享codec允许 |
| 覆盖恢复草稿/旧正文或默认应用模板 | 头脑风暴4“只在空白新记录”“不自动应用”“不覆盖恢复草稿或旧记录”；现Composer:10–16草稿优先 | 确认不存在；不得仅凭视觉空白就覆盖草稿 |
| schema/图评分/AI发送改动，破坏日期/标签/done/deletedAt | 反目标2、内容边界7；Composer:16,36保存原属性；store:25–29原草稿键、types:14–16无模板字段 | 确认不存在；纯正文格式抽取调整有明确消费兼容责任 |
| 用旧50测试/0.5.1包/截图冒充本轮验收或清理未知工作 | 反目标3、风险3、验证4、兼容9、README原工作区规则 | 确认不存在；新证据必须独立产生 |

- ⑦ 风险责任归属明确：**PASS**。原生命令/选区/撤销、字体glyph与IME分层；impl纯合同、root实际浏览器/可用桌面环境，缺平台保留未测，旧崩溃和Rust失败不得猜因或抹除。
- ⑧ 验证有产物/责任/顺序：**PASS**。impl合同及build→`impl_report_r1.md`，review独立源/diff/报告，root新`npm test`/build及编辑链路→`verification.md`；新EXE若更新须新构建和版本/hash。当前verification只把50项记为改前基线。

### C. 基线与澄清一致性

- ⑨ 基线与已回答Q&A/头脑风暴无矛盾：**PASS**。

| Q&A/已记录事实 | 对应基线字段/条目 | 一致性 |
|---|---|---|
| 用户选择“排版 + 几个轻量模板”；问题给日记、会议纪要、阅读随记 | 头脑风暴4；目标1第二项；反目标2 | 三种显式起笔，限空白新记录；一致 |
| 用户要求工具更多、斜体显示和底部美观，并授权继续 | 头脑风暴1–3/5–6；目标1；消费8/兼容9 | 有界常用格式闭环与保存区优化；持续授权保留review；一致 |
| root改前em/style=italic/synthesis=none但glyph近正体；footer实际两行 | 头脑风暴5；目标1第一/第三项；风险3/验证4 | 局部允许斜体合成，真实视觉验证；改善层级而非假设换行坏；一致 |

- ⑩ README→决策→基线可推导：**PASS**。
  - README原话“只有h1，b，斜体…那个点…少”→头脑风暴2–3常用工具受可保存格式约束→目标1四方闭环、内容7局部codec，保留两级标题而非扩成H1–H6引擎。
  - README原话“斜体…没办法展示”及root改前视觉→头脑风暴5局部style合成→目标1中英文实际显示、风险3/验证4分层，不把CSS值当glyph证据。
  - README原话“草稿已保留…保存…美观吗”→头脑风暴5动态status/静态提示/主按钮→目标1浅深/390px及验证4焦点/输入，不假设原footer单行。
  - README“多种范式”→source追加问题及用户选模板→头脑风暴4日记/会议/阅读随记→目标1起稿、反目标2不覆盖，未凭空加入变量引擎或远程能力。

### D. 基线内部一致性

- ⑪ 目标与反目标不互斥：**PASS**。格式能力来自有限纯文本合同，模板显式空白起稿，无需HTML存储或引擎迁移。
- ⑫ 风险与验证责任不矛盾：**PASS**。浏览器真实选区/撤销/glyph由root承接；无法执行的原生IME/跨平台保留未测，不要求impl用纯测试替代。

### E. 与research对齐

- ⑬ research关键约束进入基线：**PASS**。实际源码核实四按钮、h2/#映射、li统一`- `、回填visual-list、嵌套粗斜体预览不递归、代码/literal/旧色字号、plainNoteText共享消费、草稿优先与footer两行。基线分别映射至格式四方闭环、兼容、不覆盖、风险与分层验证；不足以只新增按钮。

### 澄清与基线核验结论

整体**PASS**，无未回答阻塞项、无FAIL项、无需新增用户决策。U1/U3/U5/U6/U7的执行证据仍须由LW细化和实施/root产生；进入LW不等于关闭这些风险。

## 缺失证据

以下为下游明确承接内容，不是readiness资料缺失或需要提前实现的条件：

- LW须冻结ordered/quote/组合inline/code/literal及嵌套降级的纯文本合同，覆盖DOM序列化、编辑回填、React预览和plainNoteText；保留旧颜色/字号/围栏代码及未知HTML字面量。复杂嵌套不加工具，但不得默默丢正文/项。
- 模板入口与执行时均须以空白新记录/无恢复草稿为边界；检查活动DOM、草稿及tags/date，不以渲染空白覆盖数据；保留选区、焦点、撤销和显式状态同步。不得把直接innerHTML写入视为原生undo证明。
- 新格式按钮/选择反馈须保持选区，限定本editor命令目标、处理命令未触发input的状态同步和取消/卸载；与Modal、IME及Ctrl/⌘Enter验收成链。
- 局部斜体合成需真实中英glyph、编辑即时/保存卡片/图详情/回填、浅深/390px证据。footer status与静态说明分离后检验可读性和Tab，不宣称读屏已测。
- 新纯合同、build、rootUI及可能新EXE均尚未执行；当前root50项0仅是本轮改前基线，旧失败/崩溃和mixed工作区仍保留。

## contract drift / stale / mirror mismatch

- 未发现当前权威基线与最新用户答复矛盾。research第71行“灵感”是已标明的调研候选，U2“后续冻结”及“所有U尚未关闭”属于基线生成前研究时点；**最新clarifications已冻结阅读随记，LW不得把灵感或未回答默认选择当现行需求**。该候选与时点差异显式披露，不要求删除历史研究。
- 实际接口名为`loadNoteDraft/saveNoteDraft/clearNoteDraft`，research模块表用load/save/clear缩写；下游须消费真实接口名和源锚点。
- 根README/Release.Testing仍描述已实现0.5.1，这是正确当前事实；新feature README写“尚未改源码”，不要求把计划提前同步成已有能力。旧IAB崩溃/Rust资源失败不因本readiness消失。

## 建议恢复动作

- A. 证据补强：无阻断补证。直接进入LW，沿上述实际锚点细化四方格式/模板空白保护/输入撤销主链和分层证据。
- B. 契约纠偏：无上游回退或新用户问题；最新模板答复已重算基线，保持历史候选与当前权威区别，不扩展工程范围。
- 本review仅写此报告；首轮合并工具输出截断后已重读完整skill/输入文件及关键源码，不用未读内容作结论。

## 放行判断

- allow_enter_lwplan: **yes**。
- 放行仅为规划资料及契约就绪，不放行实施；仍需本feature Gate-2和实施评审，不复用旧soft功能PASS。

无新增跨功能事实。
