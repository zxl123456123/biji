# 方案评审记录：LW（R3 第 1 轮）

- 日期：2026-10-05；review_target=lwplan；对象：lwplan.md 的 S6（385–533 行）。
- 实读计划 SHA256：C7C6253427D8C5F07BBB90B034022B832397E2A1574F4E4E339A82229D59C14D。
- 评审结论 / 协议结论：**REVISE**。业务分流：**PLAN_DEFECT**（布局目标方向正确，起始定位结构有缺陷；不命中 PROBLEM_DEFECT）。
- 前序输入：R3 clarifications、readiness_r4、两份 layout/release 调研和反馈；本 agent 上一阶段已全文读取，本轮重新全文读取 S6/readiness，并重核 PetCompanion/pet.css 和两入口。未操作产品、浏览器、Git、DB 或原生构建。

## 可行性与需修订项

方向可用：现有 CSS、共享 PetShowcase、稳定按钮、单画像无状态反馈包装足以承接目标，保存/互动 owner、有限目录及两入口均保持。隔离发布的 150 源、两产品路径与五自身版本字段明确，新 target 不覆写旧 release，验证分层完整。

**F1（阻断）：自动网格行把 sticky 包含块限制在自身短行，不能达到 L1。**

计划 441–458 行仍用 showcase grid，而 preview/wardrobe/submit 没有 grid-row。桌面 preview 与 wardrobe 自动在第一行，submit 的 `grid-column:1/-1` 进入独立末行，末行高度由 submit 的内容决定。`bottom:8px` 并不能让 submit 从自身末行移动到配置首组所在的前一行，因此「第一组起应用栏可见」没有可行的起始结构。桌面 preview 与长 wardrobe 共第一行，左预览的包含块通常足够长；此处不是认定所有桌面 sticky 都失效。

手机 472 行 `display:contents` 将 stage/copy/wardrobe/submit 展平为同一单列 grid 的四项，stage 在只有自身内容高的首行，submit 在只有自身内容高的末行。stage 的 top sticky 也不能跨越其短首行持续覆盖后面的配置区。将 submit 提为 showcase 直接子项解决了旧短 footer 的一层祖先，但没有解决 grid-area 自身仍然短的问题。

依据：本轮核对 [CSS Grid §5.1/6.2](https://www.w3.org/TR/css-grid-1/#grid-containers) 对网格项目包含块的定义，以及 [CSS Positioned Layout §3.4](https://www.w3.org/TR/css-position-3/#sticky-pos) 对 sticky 仍留在包含块内的约束。以上是对计划骨架的规范推导，不是实测浏览器几何。S6:506 已意识到要现场量测，但把可直接识别的结构错误推迟到实施修正不满足 LW 可执行性。

恢复动作：只修 S6 的目标 DOM/CSS/包含块说明。可用显式跨行共享 grid-area，或在手机采用原生 block/flex 正常流，使 stage 与底栏的包含块覆盖全部配置；桌面明确左列、右列及底栏所在区域。保留预览→配置→提交的 DOM 源顺序、一个大画像和一个提交栏，说明底栏保留的正常流空间与末项避让。无需新用户决策、框架、测高 JS、固定 portal 或第三产品文件。新片段需让 reviewer 能从布局直接看出两个 sticky 的可移动范围，再由 root 实施后核实际祖先与几何。

## Gate-2

**Required Set 复核结果：PASS。** 以 S6-A（T2 UI）与 S6-B（T3 隔离源包装）为主要包：T1 的目标/反目标、不影响、路径/函数、步骤/依赖/验收/回滚、消费目标、作者体验、责任三元组与双 Gate 均存在（389–409、508–532）；T2 输入输出/边界与回归存在（395、435、506、510）；T3 两入口/发布源身份接口、兼容无迁移及停止不发布存在（403、514–520）。这是存在性 PASS，不抵消 F1。

**目标锁 / 反目标复核结果：FAIL。** L2/L3 有明确可执行落点；L1 的首组至末组双端可见目标被当前 grid 行结构阻断，见 F1。

| 禁止项 | 可核查计划位置 | 结果 |
| --- | --- | --- |
| 第二宠物、计时器/RAF、新依赖/状态重构 | 391、409、435；key 只位于大画像 span | 未要求，PASS |
| 改行为/保存/数据/关系引擎及扩展空间功能 | 395、409、510 | 未要求，PASS |
| 并发月历/主题探索入包、整体 App 覆盖、旧源/制品覆盖 | 514–520：150 基底、七差量、新 target、停止不发布 | 未要求，PASS |
| 裁画像/截断失败文字、静态冒充实际 UI/FPS | 506、510、524–526 | 未要求，PASS |

### Gate-2 关键复核

| 项目 | 结果 | 说明 |
| --- | --- | --- |
| 关键实现锚点复核 | PASS | PetShowcase return/原 handlers 与 pet.css showcase/wardrobe/submit 明确；包装五文件字段、150 清单与 target 明确。 |
| 代码片段充分性复核 | PASS | JSX+CSS 支持判断状态不改、单大画像/key、按钮稳定、配置/提交结构；正因为片段充分，能定位 F1，不是缺片段。 |
| 作者体验门复核 | PASS | 具体容器、原生按钮和有限媒体规则，原保存语义可直接追踪；没有新的配置/角色注册框架。 |
| 人工 review 对齐复核 | FAIL | 核心链路顺读 PASS、research 事实映射 FAIL、跨包脑补需求 PASS；其中 grid 包含块事实未被可行结构承接。 |
| 核心链路顺读复核 | PASS | 395–405 主链及包顺序可直接顺读 applied→draft→大画像→apply→隔离同源验证；明确不改层。 |
| research 事实映射复核 | FAIL | 400/506 正确要求查包含块，却没有将 grid-area 限制映射为可执行跨行/正常流结构，见 F1。 |
| 跨包脑补需求复核 | PASS | UI 与包装接口、两文件最终 SHA/冻结顺序、root 责任齐备，不需拼接隐含业务链。 |

**P1–P9 协议合规核验表：PASS。**

| 协议项 | 结果 | 依据 |
| --- | --- | --- |
| P1 | PASS | S6 未设「至少 X 条任务数」门槛。 |
| P2 | PASS | 530/532 为必备内容存在性自检与独立复核，非评分放行。 |
| P3 | PASS | 必备项/关键复核失败禁止实施（532），没有平均分抵消缺失。 |
| P4 | PASS | 530 明确 T1/T2/T3 Required Set，并在两个包落实 UI/发布接口边界。 |
| P5 | PASS | 528/532 真阻断需求口径触发既有 DELEGATE_QUESTION；F1 是明确技术修订，不需要新需求答复。 |
| P6 | PASS | 528 新假设/风险/并发漂移与阶段切换即时对齐，留痕本节/R3/报告，未设固定次数。 |
| P7 | PASS | S6 未设问题数量上/下限。 |
| P8 | PASS | 528 写明本轮未触发批量问题的原因，必要时按 P0 范围/P1 风险/P2 优化汇总。 |
| P9 | PASS | 530 作者 Gate-1、532 独立 reviewer/root Gate-2 双阶段，失败返回 LW。 |

S6 只允许 root 派工作包，没有指挥任何实施/review 子 agent 递归委派。

**基线与澄清一致性复核结果：FAIL（仅 F1 的 L1 技术承接）。** 未回答列表为空；目标方向、既有授权与 Q1 排除范围无冲突，反目标未踩中，头脑风暴的免费预览/显式应用和静态可操作不变。失败不是用户口径不唯一。

**设计味道扫描结果：FAIL：把「sticky 直接子项」当作足够条件，未给网格项跨配置区域的包含块；又用实施后修正回环兜底已知结构缺口。** 修订范围限 S6 DOM/CSS 片段与解释；无须升级架构或重开问题。

**Gate-2：FAIL。** 当前不得进入实施；F1 修订后再次独立 Review(LW)。

## 尚未验证项、contract 与后续行动

375×500 长失败状态、200%文本缩放、Tab 自动滚动/焦点、五角色长耳完整、点击动效、两入口 computed ancestors、实际按需资源、新 Web/EXE 构建均未由本 reviewer 执行；这些归 root 实施后验收，不以缺现场 UI 阻塞当前规划。key 仅包无状态画像，不重挂 pet-touch/usePetBehavior，data-motion 使用完整 pet.policy.animate、缩略图静态，计划这些部分可执行。

未发现新 contract drift：R2 不打包是历史限定，R3 新授权明确承接；workspace 混合 App 与 5190 冻结身份差异已记录。150 源 + 两产品/五 metadata、独立 CARGO_TARGET_DIR 与单 owner 发布责任有真实研究输入，不能以旧测试数/缓存或 R2 UI 给 R3 通过。264 工作区/三旧制品的本轮保护核验仍归 root，不由本报告宣称已全量核验。

planner 原地追加带统一标签的修订说明及 corrected 片段，保留 S1–S5 和 R3 其他已写支撑文字；不要修改产品、状态、历史日志。root 复核新计划与 fresh Gate-2 PASS 后按同一已授权手动流程实施，免重复询问许可。没有 DELEGATE_QUESTION/ACTION。

英文提交建议：`docs: review wardrobe layout implementation plan`。

无新增跨功能事实。
