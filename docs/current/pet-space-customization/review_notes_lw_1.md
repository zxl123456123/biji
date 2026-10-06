# 方案评审记录：lwplan（第 1 轮）

**review_target**：lwplan
**评审时间**：2026-10-05
**评审对象**：`lwplan.md` 终稿，SHA256=`9CF5D04EDAD069C8E0CE2ABE7C9FDD861080358D36D854E814CA0BA3E63FBD0D`，30912 bytes。
**协议合规结论**：PASS
**业务可行结论**：PASS（规划可执行，不是产品验收完成）
**前置输入**：`clarifications.md` SHA256=`A3D95C9627B729152FB700016E96BD79DA820D53699CEF19EA19F4497B078B73`；[Readiness r2](review_notes_readiness_2.md) SHA256=`12F566457D1929CAAA9A169DCA65FD59913062DA24B9FBB3A68D350074A9BFD7`。原 r1 保留。

本 reviewer 已加载 plan-review、verification-before-completion，读取最新用户输入、澄清、r2、LW 全文，复核真实 PetCompanion/petBehavior/pet.css、SpatialNoteMap、spatialScene/runtime、当前 App 与项目 AGENTS。未委派、未改产品/计划/旧报告，未运行 UI/DB/native/Git。作者自检完成由 root 确认；不把作者报告作为本结论的独立验证。`41966c` exit0 完整重读补强后的终稿；`d0a979` exit0 独立核对 13 组必备内容、最终输入身份及 165 次源/快照 SHA/字节比对，无未解释差异。

## 可行性分析

两条主链可顺读：宠物安全读取→App applied→大图 draft→Apply 先会话应用再单键写入→bool 保存提示→大小共用画像→刷新读取；空间安全读取→App applied→MapView draft→scene setter/invalidate→同序提交→关联/时间共享→刷新读取。草稿只归展示组件，App 只归已应用值，scene 只归资源；旧业务、关系、layout、调度器保持边界。

公共合同已唯一：五角色枚举、两组四字段 appearance、`luma-pet-appearance`/`luma-spatial-appearance`、必需 props/callback、私有画像输入、两个生产模型 helper 均在 LW:32–94/129–145 明列。unknown 非对象/数组/缺项/多键/错值整份回默认，合法 false 保留；localStorage 取得及读写异常受控，不自动修写坏值。Apply 先 setApplied 再单次对应键写，false 保持当前会话、明确刷新/重启回旧成功值且可重试；同步 draft 不擦保存提示。宠物 Reset/组合只重置装扮三字段并保留 draft.character，初始坏值仍完整 xiaotuan 默认；这是装扮恢复的具体下沉。

现有 SVG/四态/CSS 与 Three 依赖足够；不需下载资产或新框架。五个身体与 idle/happy 独立、名字/ARIA/本色规则明确；装备跟身体并要求识别部位/viewBox 不遮挡。角色变化沿现有 cancel 清计时与 owned capture，保留休息/位置，不 key-remount。固定三 geometry、单位半径/面灰阶、sphere halo、bounds/raycast、幂等池释放与现有 owner teardown 均可落到具体锚点。没有工期承诺，本结论不推定造型、GPU、原生或持久化端到端已通过。

## Gate-2

**Required Set 复核结果**：PASS。T3 采用 T1 十三项 + T2/T3 增量；按存在性逐项核验，未以任务数量评分。

| Required Set | 本文对应内容 | 结果 |
| --- | --- | --- |
| T1 1–4：目标/不影响项、路径锚点、完整包/目标映射 | LW 范围、核心链路、独占路径表及 S1/S2/S3 的目标/步骤/依赖/验收/回滚 | PASS |
| T1 5–6：验证分层与证据、作者体验 | 各包 impl-safe/root 承接、完整日志/exit/SHA/媒体与未测限制、作者体验段 | PASS |
| T1 7–9：复杂主链、research 映射、片段闭环 | 工作包前的两主链、不改层/分层原因、七行事实映射、三组目标骨架 | PASS |
| T1 10–13：自检、两道 Gate、提问、风险/降级与复核 | LW:203–219 明列自检内容、执行人/时机/回环、P0/P1/P2 模板、风险表/停机 | PASS |
| T2：输入输出/边界/测试分层/回归 | 独占接口表、finite parser 与失败合同，各包新测试/原回归/全量 build 与 root 实测 | PASS |
| T3：跨模块依赖/兼容/迁移/停机 | S1/S2→S3 必需接口、双键无业务迁移/旧版忽略、分包回滚、并发输入/超界停机 | PASS |

**目标锁 / 反目标复核结果**：PASS。S1 对应 G1/G3，S2 对应 G2/G3，S3 对应 G1–G3；各包显式消费 A1–A3。恢复装扮保留角色与五角色目标相容。

| 反目标禁止内容 | LW 可核查证据 | 结论 |
| --- | --- | --- |
| 换色身体/相同动作冒充角色，抛弃晴小团、宣称第三方原创/官方动画/真三维宠物 | 范围 A1；S1:111–115 五轮廓/部位/关键帧、原身体保留 | 未指令该行为 |
| 试穿持久化或失败谎称已保存，Reset 自动提交 | LW:61、78–94；草稿/应用顺序、两键 bool、重试与 Reset 保留角色 | 未指令该行为 |
| 支付/帐号/网络/下载/业务模型、SQLite/备份/AI、排序/关系改写 | G3/A2、不改层、各包独占路径与超界停机 | 未指令该行为 |
| 重建相机/renderer/layout、每记录几何/第二 RAF、CPU 冒充 GPU | A3、S2 池/setter/dispose、S3 owner effect:164、证据矩阵 | 未指令该行为 |
| 丢弃并发源、覆盖旧 App、未知混合发布、递归委派 | LW:163、185–201、207–219；当前接线保留，Q1 包装门 | 未指令该行为 |

**关键实现锚点复核结果**：PASS。

| 包 | 首个复核落点及边界 | 结果 |
| --- | --- | --- |
| S1 | PetPortrait 原分支/useId、usePetBehavior cancel、releaseCapture，新增 petAppearance/PetCharacters/pet.css；不碰 App/MapView/版本 | PASS |
| S2 | create/rebuild、setAppearance、model pool/geometry helper、dispose；haloSphere 同池 sphere，动态 geometry 单独释放 | PASS |
| S3 | 当前 App 两 lazy/space/浮层接线、MapView latest/owner effect/新独立 setter effect、五文件自身版本；与 S2 同 owner 顺序写 | PASS |

**代码片段充分性复核结果**：PASS。LW:37–59 固定白名单/键/解析读写签名；64–87 必需 props 与 Apply/Cancel/Reset 顺序；129–145 模型池、真实 helper 和 scene setter骨架。正文连接角色 cancel/policy、MapView latest/options/effect 与验证，足以判断从输入到保存/展示/资源的最小闭环，无需 reviewer 替各 owner 发明接口。App 只导入纯 appearance 模块；Three pool 由 lazy scene 加载，S3 必查 chunk/import 结果。

**作者体验门复核结果**：PASS。实际预览/试穿标记、中文控件、两套保存结果与装饰配色说明可直接理解；native button/aria-pressed/status 与原政策一致。源码按具体人物部位/动作、两小纯模块、专用三几何池和唯一 setter 组织；不增加注册框架或通用配置引擎。先主链后包和完整接口有助于顺序接线。

**人工 review 对齐复核结果**：PASS（汇总下面三个 PASS，无代替子项判断）。

| 子项 | 结果 | 独立依据 |
| --- | --- | --- |
| 核心链路顺读复核 | PASS | 现状→两套安全 read/App applied→draft→bool write→画像/scene→root/fresh 证据连续；不改业务/layout/相机层及分层原因明确 |
| research 事实映射复核 | PASS | 固定 viewBox/useId、四态/1400ms/capture、参考未知、sphere halo/instance释放、UUID顺序、singleRAF预算、当前 garden 宿主逐项映射实现/验证。真实源吻合：cancel 清反馈/捕获；scene 原节点/halo共 sphere、按layout实例排序；MapView owner依赖原mode/attempt |
| 跨包脑补需求复核 | PASS | 两纯模块签名/必需 props/keys/default/bool、App唯一值owner、S2/S3同owner、两草稿生命周期和资源合同已集中明列；不需跨包拼出私有字段或临时 optional 接口 |

**P1-P9 协议合规核验表**：PASS。

| 协议项 | 结果 | 独立存在性依据 |
| --- | --- | --- |
| P1 | PASS | LW:217 明确不以任务数打分；S1–S3是边界拆包，无最低任务数门槛 |
| P2 | PASS | T1/T2/T3、目标/验证/证据/作者体验/片段必备内容及缺项回环明确 |
| P3 | PASS | LW:219 任一必备缺失或合同矛盾即回修，不用评分抵消缺项 |
| P4 | PASS | 文首T3与LW:217明确三分型 Required Set，T2/T3补足接口/边界/兼容/停机 |
| P5 | PASS | 新关键范围/验收/回滚口径不唯一报 DELEGATE_QUESTION，超授权步骤分流；没有用沉默决定包装 |
| P6 | PASS | LW:203–205 给留痕位置、三件已对齐事件、阶段切换与新假设/风险/并发即时报root，无次数阈值 |
| P7 | PASS | 无澄清数量上下限；问题由实际阻塞触发 |
| P8 | PASS | LW:207–214明确本轮无新规划委托问题的原因，给P0/P1/P2批量模板；Q1单独待答 |
| P9 | PASS | LW:217–219作者产出后Gate-1、独立主检/root复核Gate-2及失败回环/实施前门禁齐备 |

**基线与澄清一致性复核结果**：PASS。

- 角色/空间 LW 的未回答列表为空；最终 EXE Q1 非空，仅阻断最终制品范围，按上游 r2 范围处理，不放行未知模块或发布。
- 目标锁被遵守：五个角色、本色与不同 idle/happy、预览/应用/刷新及三模型/背景/光效仍完整；原镜头/选择/数据目标保留。
- 反目标未踩中：上表禁止项均未进入实施指令；角色重绘不把历史原创-only限制当新授权的否决依据。
- 头脑风暴决策未违反：决策1–7对应目录/两键/草稿/失败/政策/单资源owner。宠物恢复装扮保留 draft.character 是已授权可逆下沉，不改变坏值默认及保存边界。

**设计味道扫描结果**：PASS。未发现已知阻断异味；专用有限模块与固定池服务现有主链，没有用框架/抽象替代具体功能。真实造型、动作与资源表现留给下游证据，规划细节不冒充结果。

### Gate-2 结论

**Gate-2**：PASS（独立主检；仍需 root 复核后正式派单）。允许明确授权的 S1/S2/S3，最终 EXE 范围、未知并发功能、发布及完成宣告不在此放行范围。

## 风险点、缺失证据与已见失败

- 角色造型/装备遮挡、idle/happy实际差异、角色变更owned取消、读屏、真实偏好刷新/桌面重启及坏存储重试尚无本轮产品证据。S1/S2纯测试、S3全量test/build/import/meta核验，再由root实际UI/媒体/同源EXE/真实库只读承接；GPU/长期耗电/native广泛项缺证必须未测，fresh审后改源重新验证。
- 既有 scene 的 cancelGesture 会 disconnect→controls.update(0)→applyPolicy，可能消耗阻尼尾量。LW明确 shape切换取消时保留 camera.position/controls.target、不得fit/select/rebuild；root必须实测镜头/选择保持。单RAF、预算、真Three CPU断言只能证明对应逻辑，不能证明现场GPU或整个owner生命周期。
- 本轮初次多文件工具返回和后续局部合并输出有截断，终稿以 `41966c` 全文与独立身份核验补齐；没有因截断代判未读内容。未运行产品测试，不宣称测试/构建通过。
- reviewer 曾指出S2只写“真实Three CPU断言/不要mockThree”仍容许测试内同构替身；root以单句文字补入生产helper import/call要求。最终LW:153已确认，原稿A956…被终稿9CF5…替代，未改需求/源码；该发现保留。
- `0167fb` exit1：13组无缺项、终稿身份正确，原73项却出现4份新的并发公共文档差量。`e9c6f1` exit0只读核对均为记录时光资料/隐藏规则并上报root，未采用其中116测试/界面验收声明作为本轮证据。`d0a979` exit0按明确已知差量重新核对，无未解释差异，不能把此结果写成73工作区全未变。

## contract drift / stale / mirror mismatch

原73 before/manifest、r1/r2保持；当前App与9+1并发快照按LW保护，八个外部源/测试只读。root已捕获5份公共文档至 `C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004/concurrent-docs/manifest.json`，`ab7d7c` exit0独立读取，manifest SHA256=`3EECE4AC10EAD82571D70D3AF7A51636FCF26CEFCD07BD95D7F8F54068630BDE`。新增并发文档也必须保留当前文字与链接，root未来同步采用当前文件最小差量，不能复制old before覆盖；这些资料来源/验收不由本review确认，最终包装仍待Q1/源冻结。feature README新增保护说明，不改澄清/LW目标。

| 新增并发文档 | 本次观察SHA256 |
| --- | --- |
| README.md | `108ADCA33569FF78135C1C468ACDAE9524DF6BE004097BCE8428FF4C1C14FD24` |
| CHANGELOG.md | `78A9B6C9684142469C62634E96FB327B1E293026CB9DA1CE3B71952E004EE53B` |
| docs/Project.Progress.md | `7F8AF489CEB871C221FAB320244CC972925D602EDCE10A933071DA05B549CAD4` |
| docs/Spatial.Experience.md | `3C64B7DCF5D03E9041560F33ADBE5AE15C4C42235FDAA911FEA151A5B615511F` |
| docs/Record.Garden.md（新增保护文件） | `243521944F972B809E17BA7753CDAC6839A7C669EDB70808F15CF4768694B9C4` |

上面是新观察的保护输入，不重写原基线或认作宠物工作；后续外部再变，按既有停机/记录规则处理。未发现其余目标或公共契约矛盾。参考访问失败/未完整见三小只像素的边界沿用r2，未被LW升级为官方动作/视觉复刻事实。

## 修订建议与后续行动

无需再次设计或请求阶段许可。root复核本报告与终稿身份后按唯一owner派S1/S2/S3；实施者严格消费生产helper测试并报告真实临时集成失败，不能 optional props 掩盖。root保护新并发公共文档与9+1源输入，完成现场证据并取得Q1答复/冻结最终源后才处理新EXE；fresh独立实施审查与用户体验验收仍保留。
