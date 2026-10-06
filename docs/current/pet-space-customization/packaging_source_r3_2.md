# R3.2 短桌面补修：新隔离发布源

- feature_name：pet-space-customization；impl_round：S6-B / packaging-r3-2；date：2026-10-05；owner：layout_release_audit。
- lwplan_version：S6/R3，SHA `C714ABA584F7E5ABE651C8808188D2B6D401698FBD60C2E55681DC63D080689E`；Gate报告 SHA `48D56E92A76A8D9E82A11A77F86700AFCC4472435C4FE6C7F1D6302D185D2D29`，保持原字节。
- 结论仅为有限来源/字节/元数据：新候选150源、143基底原字节、严格七差量。没有test/build、服务/浏览器、native、SQLite、Git或递归委派；不宣称短桌面实际遮挡已修好或EXE通过。
- 原 [packaging_source_r3.md](packaging_source_r3.md)、[packaging_source_r3_1.md](packaging_source_r3_1.md)、两旧候选/manifest/helper及所有旧制品继续保留，本报告不覆写历史。

## 新缺陷、授权与根触发

Root与fresh reviewer发现实际短桌面反向Tab到休息按钮后，休息542.925..580.525落在footer506.8..592内。此前手机两倍文字补修不能代替这一独立短桌面症状。根派单继续同一S6目标，由UI owner只改现有max-height600px/min-width721px media的stage高度、画像宽及互动按钮scroll margin。

本owner在c4ae7f全文读取 [impl_report_r3_3.md](impl_report_r3_3.md)：stage190→152px、画像184→112px、原copy互动按钮scroll-margin-bottom184px，手机/普通高度/业务保持。该报告的静态自证由UI owner执行；本owner没有读取或操作浏览器媒体，不把其静态证据作为根实际复测。

根先要求预备新路径，不给最终CSS之前不运行preflight或freeze；44ce2a仅生成新helper且输出无预检/冻结、候选不存在。随后根明确批准最终PetDFFA/CSS72B2并触发新sourcefreeze。本owner再次按给定SHA读取实际工作区两源，不取混合App或其他业务增量。

用户「继续吧」与Q1同范围EXE授权保持，当前只宠物/空间配置；工作区其他源码/metadata只读，旧发布和deliveries/0.7.1只保护不覆盖。

## 实际来源与新身份

TEMP根：`C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005`。基底固定为 `C:/Users/ZXL/AppData/Local/Temp/qingjian-pet-entry-20261005/preview-source`。新候选：TEMP/release-source-r3-2，新证据：TEMP/packaging-r3-2。

| 输入/新输出 | SHA256 |
| --- | --- |
| preview-before.json / 150唯一路径 | 4EE372D3AFB2176B3BC5F52243A0186C984A1AD90CD4BBAADAA6225C8818EA90 |
| workspace-before.json / 保护输入 | C97F970039F782A72C1BEE6B28E19AB744F6B9027AD09D732EE469093F726681 |
| 最终PetCompanion.tsx（共享workspace/candidate） | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 |
| 最终pet.css（共享workspace/candidate） | 72B23110E31FDDE9E150CF51B8636AA865C550EB5DB31E7AF565E0242F55AC13 |
| prepare-release-source-r3-2.py | 899FBC1A82975D4C9F0567FB0686D33774FD6A1A13500D14DE735D985608F245 |
| verify-release-source-r3-2.py | 474854FB2664610F2698FD6B06253E2AD377A68804A496CB92E17FED0009C07E |
| packaging-r3-2/base-150.json | B9DD51A2B1AC21766C7FD73F6D2F566F54A7DEF2373F773A9B43472856442210 |
| packaging-r3-2/final-150.json | F9592B8B89792F7C606419331C0E3CB4D7EEA9A67F2F002C7E095A063FA6F435 |
| packaging-r3-2/manifest.json | A013EBEF02EBFD7836D541922C092A4924A16397575D14E9D918743DB829CDF0 |
| packaging-r3-2/independent-proof.json | 96D530944B151F6ADA207953BB7F78B217AAD388702303556DDB5D1E2DD88B27 |

新helper从原r3-1实际D2DA字节派生，仅改固定candidate/evidence路径和diff目标标签，旧helper不改；全部150/common-before/第三业务源/保护/五自身版本/根批准两SHA校验保持。新独立verifier不导入helper，另固定新目录与CSS72B2。

## 变更事实与S6-B映射

| path / change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- |
| TEMP新helper（新增） | 150源重核、路径/既存候选/第三产品拒绝、两SHA叠加和五元数据解析，七差量/manifest | S6-B①–⑥；根补修派单 |
| TEMP新verifier（新增） | 独立全150字节、JSON/TOML语义、换行、共享两源及junction/旧制品核验 | S6-B自证 |
| TEMP/release-source-r3-2（新增） | 逐5190清单写150源，仅两产品与五自身0.7.1版本，不递归复制任何工作区业务 | S6-A→S6-B来源接口 |
| TEMP/packaging-r3-2（新增） | base/final150、七diff、新manifest/proof、真实日志/exit和历史保护前后 | S6-B证据与历史保护 |
| 本报告（新增） | 记录真实新缺陷/根触发/来源边界与责任移交，不更新其他当前文档 | 根正式派单报告 |

五metadata只修改package.json.version、package-lock顶层与packages[""]version、Cargo.toml[package]version、Cargo.lock唯一qingjian包version及tauri.conf.json.version为0.7.1。独立语义比较证实依赖/脚本/identifier和其余字段不变；长度和LF/CRLF保持，另一依赖0.7.0未被替换。

其余143源保持5190字节，包括App/styles/SpatialNoteMap；并发月历/探索新增文件未进入150或候选。node_modules仅新junction到 `E:/project-funny/biji/node_modules`，没有install或复制依赖实体/dist/target/tsbuildinfo。

新CSS相比原r3-1候选严格等于现有短桌面media的三项修订，3b9a72实际字面替换校验true。完整七份来源diff由4b3d76（五metadata/Pet）与3b9a72（CSS）全文读取，均exit0、未截断。

## impl-safe真实命令与历史保护

完整日志和真实 `.exit` 在新packaging-r3-2；没有管道尾部替换验证命令的退出码。

| 实际命令 / evidence | 结果 | owner / conclusion_if_missing |
| --- | --- | --- |
| 新helper无参数preflight；preflight.log/.exit，c4ae7f | exit0；150源实际字节、五元数据语义/格式、6路径拒绝，candidate不存在 | 本owner；未执行不能声称新预检已过 |
| 新helperfreeze，携根DFFA/72B2两完整SHA；freeze.log/.exit，580a71 | exit0；150/143/7，baseDriftAfter/candidateDrift/unexpectedWorkspaceProductDrift均[] | 本owner；预备helper不代替实际新freeze |
| 新独立verifier；verify.log/.exit，747d72 | exit0；全150基底/候选、严格七差量、五自身字段/格式、两共享SHA、junction及三旧0.7.0制品 | 本owner；不只相信helper自报 |
| 七diff完整读取及r3-1→r3-2三项media字节核验；4b3d76/3b9a72 | exit0；来源差量与已批准两源一致 | 本owner；旧diff不能代替新源消费 |
| history-protection-before.json / after.json；28266f/3e93c3 | exit0；两旧候选300源、9历史制品、deliveries/0.7.1七文件，无漂移 | 本owner；不能仅按“不写旧文件”的意图声称历史保持 |

历史制品按三清单实际重hash：原artifacts-before.json（0.7.0）、initial-r3-artifacts.json（首次0.7.1）、candidate-r3-1-artifacts.json（手机补修后0.7.1），每组3项。历史deliveries位于 `E:/project-funny/biji/src-tauri/target/deliveries/0.7.1`，三制品与其delivery-proof一致，七文件前后SHA/bytes相同。它们不含本次短桌面补修，不能当新候选交付。

两旧manifest仍为106AD1B5…/53F1EFF6…，两旧helper仍54779A6C…/D2DA9019…；完整实际身份及历史7文件SHA在新history-protection JSON。不改旧证明文件或现有delivery副本。

## 目标、漂移、失败与限制

- goal_lock_check：L3继续固定150与两共享产品来源；L1/L2真实短桌面互动/焦点效果归根，包装不把静态值估算作为验收。
- anti_goal_touch_check：未加产品行为/角色/状态/依赖/计时器/RAF，未改工作区产品/metadata、旧App、旧源/制品/交付。本owner只新增本轮TEMP证据/候选和本报告。
- authoring_ergonomics_notes：保持有限150/五自身字段与可读七diff，变更只落新目录；没有通用发布抽象或新业务框架。
- contract_drift_reports：无。C714/48D5保持，根S6计划内短视口修订有独立报告。原native/旧delivery已生成不能覆盖，根新target为 `E:/project-funny/biji/src-tauri/target/wardrobe-layout-0.7.1-r3-2`；本owner未操作缓存或target。
- 本轮包装命令无失败/截断；源于真实短桌面遮挡的新补修仍须root复测，不能由此前手机结果或构建绿色抹去。之前root两次200%布局失败、UI owner旧脚本/工具失败、原角色空间动图失败与所有warning保持原记录。
- 根的新source test/build、短桌面正反Tab/五角色/两入口/手机保持、同源新native/烟测/旧库/freshreview仍待承接；原GPU/FPS/长期耗电、完整native GUI、安装卸载、触屏读屏、系统reduce/PWA更新等未测不由本包装关闭。

## coordinator_handoff_verifications与回滚

| 待根承接 | evidence_expected / owner | conclusion_if_missing |
| --- | --- | --- |
| 完整264保护、最新150与所有历史制品/交付核验 | before/after实际来源与限定允许差量；root | 本owner有限保护不替代根完整保护 |
| 最新workspace/candidate独立test/build及真实短桌面/手机回归 | 各自cwd完整log/exit/实际数量；新源媒体/实际按钮焦点和footer几何；root | 旧source和截图不代表新源通过 |
| 新r3-2独立target与版本化交付 | 真实native日志/exit、新exe/NSIS/MSI0.7.1身份/SHA及新来源；root | 旧r3-1制品/deliveries不作为此次新交付 |
| 新制品烟测、SQLite只读前后及fresh实施审查 | 新身份、实际受控证据与真实正式双结论/全文消费；root | 元数据与sourcefreeze不能证明EXE/完整MVP/用户验收 |

回滚信息：需人工介入。停止并不发布新候选；若继续补修，应再建新候选/新证据，禁止覆盖任何一次冻结。仅根核绝对目标后清理属于本轮的新TEMP/target，不触碰旧源/交付/业务数据或偏好。本owner没有删除、提交、推送或启动服务。

英文提交建议：`build: freeze short-window wardrobe release inputs`。无新增跨功能事实。
