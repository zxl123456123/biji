# 隔离包装增量复核（第 2 轮）

- review_date：2026-10-05；review_scope：Q1 下的 release-source-r2 冻结方法，非最终 Review(Impl)。
- 结论：**PASS（有限包装方案可执行）**。允许 root 实现新的 TEMP helper 并冻结候选；不代表 helper、r2 副本、产品测试、现场、EXE 或业务数据已通过。
- 原 Readiness、LW Gate、S4 Gate 与 packaging_1 均保留。本次没有修改产品、计划、澄清、旧报告，没有 UI/服务/DB/native/Git 或递归委派。

## 授权与变更原因

用户 Q1 原话为“先保留源码，本轮 EXE 只包含宠物和空间配置”；clarifications 的已回答 Q1 和 S4 工作区限定一致。S4 增量 Gate 已允许共享纯 PetPortrait 出口及设置伙伴名修复，月历桥接仍只在工作区。

预审实际发现另一路 3D/关联探索正在修改 SpatialNoteMap、NoteGraph、graphFocus、测试及新增探索模块；root 已核对其活跃人类任务来源。本轮不丢弃、不覆盖、不冒认这些成果，也不把当前混合工作区构建当 Q1 制品。r2 改用 r1 已验证源清单作为冻结基底，只叠加本轮明确的两个共享收尾差量，是包装取证方法收窄；不改宠物/空间架构、业务、接口或用户发布范围，不需重开功能设计。

## 实际输入身份

| 输入 | SHA256 / 实际核验 |
| --- | --- |
| release-source-r1-manifest.json | `7AA9AE366F81A3F3BDC9BF0109373FD96B5EEACF4075F309813C439203D1B44B`；150 唯一路径，逐项实际 releaseSha256 重算，baseDrift=[] |
| clarifications.md | `A55140A8435B741469F804C8B2CB37A12E1C082A5427A9F675F9965346751660`；全文读 Q1/S4 及历史保护段 |
| lwplan.md | `94C378EF989EFD5C8AF85F0936AB7F4615FBF7F3C8330EFF2D95297E06DE1CBA`；S4-R2 对共享 NAME/export 的发布保留合同继续有效 |
| feedback_calendar_alignment_20261005.md | `DB9B5986A095C446ECC062D6A1CF430A058CFCC8A103FFDFC42125902E67B803`；全文读取后续人类移交覆盖历史分工 |
| 当前 App.tsx | `F456FCD6A262245BB78955EEC4DD7BB2531AB80E23C2A201331BFFF57B50A208`；除 garden/S4 外，已有第三探索 requestLocate(local)/locateRequest.local 与 onOpenGraph(id) 差量 |
| 当前 PetCompanion.tsx | `BFE390FAE9465E78327C2AC8D6F1919CAD9CA52DE835B70128593B16C1FE0768`；相对 r1 仅增加 `export `，既有绘制体字节保持 |

TEMP 根为 `C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004/`。原 73 before/manifest、9+1 并发输入、并发文档、r1 manifest/源及测试媒体都不得覆盖。r1 仍是历史候选，r1 的 118 tests/build/UI 不能直接升级为 r2 终验。

## 冻结与差量合同

1. **以不可变清单复制。** 只按 r1 manifest 的 150 路径及 releaseSha256 读取基底，不递归搬入 r1 的 dist、target、node_modules、日志或其它生成文件，不从当前工作区整体复制。读取前后核对 manifest 和全部基底 bytes；缺项、重复路径、越界路径、hash 不匹配即拒绝该候选。r2 与保护快照必须是 TEMP 根下新的直接子目录，已存在则拒绝，不能改写 r1 或工作区。
2. **PetCompanion 唯一出口差量。** 从 r1 的该文件，在唯一 `function PetPortrait(` 前加 `export `；内存推导结果必须逐字节等于已读 S4 文件 BFE390…，既有 body/props/policy 不变。该共用 export 保留在 EXE 中，无需回退私有。
3. **App 从 r1 仅叠加设置名字。** 五个有限且各唯一的替换：导入 PET_CHARACTER_NAMES；SettingsView 调用传已应用角色的 petName；SettingsView 解构 petName；必需 `petName:string`；description 使用 petName。保留原其它调用/类型/行为。不得将当前 App 仅删 garden 后整份覆盖基底，因为那会同时带入依赖新版 graphFocus 的探索桥接。
4. **其它 148 路径严格相同。** 旧稳定 SpatialNoteMap、NoteGraph、graphFocus 和 tests/graphFocus 原样取 r1；空间 appearance/pool/scene、角色 SVG/CSS、业务/Rust/元数据仍取相同冻结基底。既有 lazy 空间链与两个单键外观 owner 保持，不提前引入 Three。
5. **月历/探索均不混入。** r1 已排除的 8 个月历模块/测试继续排除，S4 的月历组件/样式不加入，App 不含 garden 入口、专用 callback/name、PetPortrait import/reference。保留共用 PET_CHARACTER_NAMES、Settings petName 链和 PetCompanion export。探索新增 spatialExplore.ts/css/test 不加入；探索对已有路径与 App 的变化只记录，不带入 r2。
6. **保存真实保护证据。** root 实际保存当前 source bytes 快照及逐路径观察清单，记录 snapshotSha256/currentSourceSha256、baseReleaseSha256（新增为 null）、r2ReleaseSha256（排除为 null）、差量归属与排除理由。已有路径的探索差量明确标“发布采用旧稳定基底”，不可误写“当前源相同”。App 需分别列 S1–S3、garden/S4、第三探索以及仅保留的五处设置替换；原 73 与历史并发快照保持。
7. **并发观测不冒充全局冻结。** 第三任务仍在写时，快照只证明实际捕获 bytes，不能声称所有工作区在同一时点稳定。捕获发生变化要记录并重取受影响观察项；发布安全依赖 r1 全部稳定与两份 overlay 输入精确匹配。若 App/PetCompanion 的输入身份或允许差量变化，拒绝对应 overlay 并重新窄核对，不用更宽的正则吞掉未知改动。最终 r2 源清单及实际 bytes 单独冻结、验证，不与继续变化的工作区混称同源。

独立内存检查（未写副本）证实五个设置替换在 r1 各出现一次，目标片段在 App F456… 也各一次；保留 r1 原换行后推导 App SHA 为 `01902872C7889893F110F13F2A3E20339575479E11C2C374DD50C188618F6E9F`。PetCompanion 唯一 export 推导为 BFE390…，且等于当前 S4 bytes。新 helper 应复现这两个有限结果，150 路径中只有两份允许变化；此处是推导身份，不是已冻结或构建身份。

## 必需承接证据与责任

| 阶段 | root 必须提供的证据 | 不足时结论 |
| --- | --- | --- |
| TEMP helper / freeze | helper SHA、有限转换自检真实 exit、路径拒绝/基底及 overlay 身份检查；当前源保护快照；r2 150 路径清单、两处差量与 148 字节一致核对、完整排除清单 | 未冻结或差量未确认，不得发布 |
| r2 独立验证 | 在 r2 同一源码树执行完整 npm test/build，完整输出/exit 和测试数；chunk/lazy/版本、源与产物 manifest，实际副本 UI 与媒体 | r1 或混合工作区日志不能代替 r2 |
| 工作区 S4 | 最终五文件差量/身份，已应用角色插槽、局部许可/隐藏/失焦/模态/减少动态/机器人回退及日期原路径的实际 UI；说明第三探索导致的构建失败与待稳定项 | 不能以无月历的 r2 通过证明 S4 工作区已通过 |
| native/DB/docs/fresh review | 同 r2 Windows 构建、制品版本/hash、受控启动、真实库只读前后与失败/未测；当前文档严格区分工作区功能与 EXE 排除；root impl_report_r1 及最终独立实施审查 | 不代表最终 Review(Impl) PASS，更不代表用户已验收 |

原型 CPU pool 测试只说明生产几何 helper/bounds/raycast/释放；源码审查只证明动作政策和状态链。它们不替代 root 实际 GPU/动作/生命周期/原生或数据证据。r2 之后源变化须重新验证对应输入并复审。

## 已见失败与读取限制

- 本预审 bc349c/c0189f 读到 SpatialNoteMap 正在写的中间稿，存在未声明变量；随后源码 SHA/bytes 再变。root 上报 S4 混合工作区 build 有 20 个 TS 错误，本 reviewer 未执行该构建，不能把它改写为自己运行的失败或已修好。该外部增量以实际保护快照保留，不由本轮 reviewer 修源。
- `62ff1f exit1`：只读 Python 校验命令的双引号在 PowerShell 传参中截断，SyntaxError；没有执行源比较或写文件。改为 chr(34)，`2d5e1c exit0` 实际完整 diff，Sunny body exact / petBehavior unchanged / spatialRuntime unchanged 均 true。
- `c0ad2b exit1`：基底 150 hash 已检查无差异，但 diff 输出受终端 GBK 对符号编码限制抛 UnicodeEncodeError；没有写产品或副本。`9dbc72 exit0` 加 UTF-8 后重跑，baseDrift=[]；长 App 单行使返回有截断，未把截断当完整目标闭环。后以 `024b26 exit0` 独立核五个替换/完整 byte 推导及输入身份，输出全部读取。
- 更早包装 exact-byte 的换行失败及工具失败见 packaging_1，历史不覆盖。本轮没有运行产品 test/build/UI/native/DB/Git，也未运行新 freeze。

## 核查命令、结论边界及后续

本轮实际读取：plan-review 与 verification 合同；S1/S2–S3 实施报告；真实生产角色/外观/pool/scene/旧稳定 MapView；旧 TEMP helper；最新 clarifications 与移交原文。`9dbc72 exit0` 逐一核 r1 manifest 150 路径；`024b26 exit0` 核两 overlay 与三个权威输入，五处替换计数均 base=1/current=1。root 提议的受控包装方法可执行，无需新增用户选择或架构判断。

**allow_prepare_release_r2：yes。allow_final_impl_pass：no（尚未进入最终证据齐备的 Review(Impl)）。** root 按本报告实现 TEMP helper、补基线的当前包装事实、冻结并独立终检后回传；之后 reviewer 再核实际 helper、r2/source manifests、root 完整报告/日志/现场及文档。包装 PASS 只解锁该具体操作，不能用于发布完成声明。

无新增跨功能事实。
