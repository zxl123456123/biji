# 方案评审记录：lwplan S4 增量（第 1 轮）

**review_target**：lwplan
**评审时间**：2026-10-05
**评审对象**：S4-R2 终稿，LW SHA256=`94C378EF989EFD5C8AF85F0936AB7F4615FBF7F3C8330EFF2D95297E06DE1CBA`，43520 bytes。
**协议合规结论**：PASS
**业务可行结论**：PASS（增量规划可实施；不表示工作区或EXE已验收）
**前置结论**：[原 Gate-2](review_notes_lw_1.md)、[包装补充](review_notes_packaging_1.md)及r2保留原样。本轮只解锁S4五路径，不重开S1–S3。

## 输入与独立证据

读取plan-review/verification-before-completion合同、最新澄清/移交留痕/S4全文、实际五路径及项目AGENTS。未修改源码/计划/旧报告，未委派或运行UI/DB/native/Git；没有执行产品测试或构建。人类移交由root read_thread核验并落盘，本reviewer读取该留痕，不声称自行核对另一窗口或仅凭代理消息取得授权。

- 澄清 SHA256=`A55140A8435B741469F804C8B2CB37A12E1C082A5427A9F675F9965346751660`；移交留痕=`DB9B5986A095C446ECC062D6A1CF430A058CFCC8A103FFDFC42125902E67B803`。
- `6a45bb`/`e0d638` exit0完整读取输入/S4初稿；`d8e0be` exit0实际核查画像、月历环境/卡片/CSS、当前App及设置说明。第一次多文件源输出截断，随后完整重读关键组件，不据截断输出默认通过。
- `946943`、`ac1a01` exit0独立验证原30912字节前缀SHA仍为`9CF5D04EDAD069C8E0CE2ABE7C9FDD861080358D36D854E814CA0BA3E63FBD0D`；原219行实施支撑未删除/改写。`ac1a01`读到S4-R2新增私有Settings接口及发布排除细化。作者最新Gate-1由root回传；`336d68` exit0独立核查13组内容、三份最新输入及五份源身份，无缺项/漂移，原Gate/r2身份保持。

| S4前实际源 | SHA256 |
| --- | --- |
| src/PetCompanion.tsx | `AAC245CCA2B7F796EC134B9E8E1CB3AF862E08D20A378F8443B713B88B2385A6` |
| src/App.tsx | `CF963BDA1A7E34163B4BDF540ED8FF69F21ECD246FB663725BF8AE3789A49512` |
| src/RecordGarden.tsx | `F51B5F3CF795D36FC7B3FA74E837FD3AF2921A7F0C770459647F7062F7ADDBA2` |
| src/RecordCompanion.tsx | `34CDA424A5D98136FD92210F21EFA08CC5CBBDF1C10ABEFC3E6DC2BDDF598EB6` |
| src/record-companion.css | `C03F5594629CCE02A3E45E5897ACECF48649230FD2FECB01F21F35C12CEBD4E3` |

## 可行性与范围

主链一为装扮Apply→App会话applied→可选画像插槽→既有PetPortrait的appearance/idle/animate；草稿不传播，保存失败的会话applied依旧可呈现。主链二为App宿主motion/pageVisible/business许可→月历局部pause/visible/reduced/focused→卡片hidden→画像animate，各层只用AND缩小许可。现日期摘要、创建/回今天、分页及未接入的机器人归月历，不搬到绘制层。

真实PetPortrait:69只用参数/useId/画像组件与CSS，无存储、日期读取或新行为控制器；导出可直接消费，身体不变。当前useGardenEnvironment已有focus/visibility/media/午夜timer而缺blur状态；追加focused状态/blur清理可沿原hook完成，不改变日期调度。现卡片78×86、窄屏64×76，仅机器人眼睛blink，未发现容器float；专用画像尺寸与原pet CSS可共存。当前SettingsView是模块函数，S4-R2以必需petName:string接线闭合其作用域，修复已有可见名遗漏。

## Gate-2

**Required Set 复核结果**：PASS。原T3合同前缀保留；增量逐项具备T1十三项及T2/T3补充。

| 必备组 | S4对应内容 | 结果 |
| --- | --- | --- |
| T1 1–4：目标/不影响项、路径锚点、任务/映射 | G1/G3与A1–A3、五文件首读落点、步骤/依赖/验收/回滚，日期/数据/G2不改 | PASS |
| T1 5–6：责任/证据/作者体验 | impl/root工作区/root发布/fresh分层，日志exit/SHA/媒体与缺证限制，同名伙伴/直接插槽无注册框架 | PASS |
| T1 7–9：主链/研究映射/片段闭环 | 工作包前两主链与四行实读映射，出口→App→月历→卡片→画像及Settings三段骨架 | PASS |
| T1 10–13：自检/两Gate/提问/风险降级 | 作者自检内容与原文保留、独立主检/root复核、失败回修、继承批量模板，停止条件/回退机器人/副本重冻 | PASS |
| T2/T3：边界/接口/兼容/停机 | 两个可选字段、静态idle和局部许可、既有parser/keys不变、S1显式移交、workspace/release各自验证 | PASS |

**目标锁 / 反目标复核结果**：PASS。人类移交支持工作区月历同一已应用伙伴；仅export既有纯画像是可逆局部出口，完整月历消费已作为正式S4下沉。G2、业务和Q1 EXE排除保持。

| 禁止内容 | 可核查方案锚点 | 结论 |
| --- | --- | --- |
| 草稿向月历传播，绘制读取正文/存储/AI，新mood计时器/拖拽/RAF | S4目标/两主链、画像三参数/idle、风险停机 | 未指令该行为 |
| 改日期模型/统计/分页/午夜调度、业务/版本/依赖 | S4五路径表、focused唯一选择及其余路径只读 | 未指令该行为；只补许可状态 |
| 重绘/移动原身体，叠加容器float或通配animation:none | PetCompanion只加export、专用尺寸与单画像动作 | 未指令该行为 |
| 丢并发/月历旧代码、S1并写、旧App覆盖、月历进入EXE | 所有权移交/当前源SHA/最小回滚、release-r1保留及r2明确排除 | 未指令该行为 |

**关键实现锚点复核结果**：PASS。首看当前PetPortrait:69与S1身份，只加export；App garden分支注入applied、SettingsView私有petName；RecordGarden Props/useGardenEnvironment/RecordCompanion调用；RecordCompanion插槽/hidden/名字与专用CSS。唯一owner为wardrobe_industry，PetCompanion写权须root正式确认S1结束转移；其余S1源与日期模型等保护项不移交。

**代码片段充分性复核结果**：PASS。`renderCompanionFigure?: (animate:boolean)=>ReactNode`和`companionName?:string`同时进入两组件；App传applied及三项宿主AND，月历合成focused等许可，卡片传animate&&!hidden。原机器人分支保留；ReactNode仅type import。SettingsView的petName定义→App调用→description消费三片段消除私有作用域脑补；发布只去garden专用PetPortrait引用，保留共享export/PET_CHARACTER_NAMES及设置接线。未修改既有必需appearance接口或两偏好键。

**作者体验门复核结果**：PASS。用户看见同一名字/装扮，摘要和按钮继续在DOM层；暂停/隐藏清晰且动态关闭不禁用日期操作。源码仅两可选字段透传、现函数export及私有派生名参数，单owner顺序可读，不引入全局渲染注册表/新存储或第二行为状态机。

**人工 review 对齐复核结果**：PASS（以下三子项均PASS）。

| 子项 | 结果 | 独立依据 |
| --- | --- | --- |
| 核心链路顺读复核 | PASS | 当前画像/月历宿主→applied绘制与宿主/局部许可两链→五路径→工作区/release/fresh证据连续；日期/行为owner不搬移 |
| research 事实映射复核 | PASS | 四行事实对应真实源码：私有画像参数、focus refresh无blur、卡片hidden/机器人blink及尺寸、当前App唯一applied；每行均有实现与现场/差量核查 |
| 跨包脑补需求复核 | PASS | 两可选props、名字默认、idle、许可AND、专用CSS边界、export移交及Settings私有接口集中明列；release保留共用名import已唯一 |

**P1-P9 协议合规核验表**：PASS。

| 项 | 结果 | 依据 |
| --- | --- | --- |
| P1 | PASS | 原存在性门保留；S4按真实授权范围加包，无任务数门槛 |
| P2 | PASS | 增量具备目标/路径/接口/步骤/证据/回滚等必备内容 |
| P3 | PASS | 独立增量Gate PASS前不实施，缺项/矛盾失败回LW；无评分抵消 |
| P4 | PASS | 原T3/三分型保留；S4补跨模块可选接口/owner/兼容/停止条件 |
| P5 | PASS | 接口/许可/路径/并发漂移先报root，超界停止并按委托机制处理 |
| P6 | PASS | S4明确移交/原保护放宽/发布范围事件留痕；继承原新风险/阶段切换即对齐规则 |
| P7 | PASS | 澄清由真实阻塞触发，无数量上下限 |
| P8 | PASS | 继承P0/P1/P2批量DELEGATE模板，S4无新未答产品决定，不重复询问已移交范围 |
| P9 | PASS | S4 Gate-1→独立主检/root复核Gate-2→正式派单，失败回修；作者自检不代替产品PASS |

**基线与澄清一致性复核结果**：PASS。

- 未回答列表为空；人类已移交月历收尾，Q1已答且仍排除月历EXE。
- 目标锁遵守：新增工作区G1同一伙伴、名字/外观与草稿边界；G2保持，G3要求双范围同源证据。
- 反目标未踩中：禁止项表均有明确边界，不扩写其他受保护源或运行时行为。
- 决策未违反：两键/失败会话applied沿用，月历只消费applied；旧“由另一窗口适配/八文件只读”已被明确移交与五路径放宽替代，其余保护和历史快照仍有效。

**设计味道扫描结果**：PASS。未发现阻断异味；纯绘制与月历策略分离、局部许可AND、可选回退及单owner足以满足增量，没有为共享画像造新抽象。焦点状态是已有环境hook的缺口下沉，无新timer。

### Gate-2 结论

**Gate-2**：PASS（S4-R2独立主检；root复核最终身份后正式派单）。只解锁五路径增量；不宣称实际月历替换、发布排除或制品已验证。

## 发现、风险与缺失证据

- reviewer发现初稿SettingsView作用域读不到App内petAppearance，且笼统去“专用imports”可能误删设置也使用的名字import；已受控上报，作者以S4-R2必需petName与发布保留规则闭合。保留该发现，不以最初CB813…稿放行；最终94C378…已实际重读并独立核验。
- 390px长耳/帽子、卡片隐藏仍挂载时动画关闭、失焦但document.hidden=false、恢复不覆盖局部暂停、host弹层、未传插槽机器人回退、设置实际名字尚无S4现场证据。impl差量/类型/现有回归→root工作区实际媒体/ARIA→root最终发布-r2独立命令/界面/制品→fresh审查为必需承接；CPU/build不能证明上述体验或读屏。
- release-r1仍是旧候选，最终需重冻workspace与release-r2。App设置修复与共享画像export应在共同核心保留，只剔除月历入口/模块/callback/name及仅供garden的引用；必须实际列差量并复查，不能复用旧八字符串逆变换结果冒充新App隔离正确。workspace含月历日志与release日志/测试数量不得混用，审后改源重新验证。
- 本轮只读核查退出0，首批源输出截断后已补读；没有产品命令执行或测试失败/通过宣告。以前研究/冻结/并发检查失败保持在历史报告，不因S4补充消失。

## contract drift / stale / mirror mismatch

S1–S3原30912字节完整保留。旧“Q1待答/来源未知/八文件只读”是当时输入，最新移交留痕、澄清新增G1/五路径放宽与S4显式修订覆盖当前范围；不据旧语句阻断新授权。S4-R2对私有Settings字段和发布imports的明确细化覆盖初稿笼统口径。没有发现其它公共接口/目标矛盾；未修改原manifest、Gate/r2、旧包装报告或已实施支撑。

## 后续行动

root完整复核最终LW/本报告身份后，确认S1出口移交并按五路径派S4。实施者记录开始SHA、保留画像body/日期函数和现有timer，报告真实完整test/build及差量；root分别闭合工作区桥接与最终release-r2证据，fresh Review(Impl)仍必需。不再请求人类阶段许可。
