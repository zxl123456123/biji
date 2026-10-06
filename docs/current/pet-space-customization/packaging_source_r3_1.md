# R3.1 装扮布局：补修后新隔离源包装

- feature_name：pet-space-customization；impl_round：S6-B / packaging-r3-1；date：2026-10-05；owner：layout_release_audit。
- lwplan_version：S6/R3，实际 SHA `C714ABA584F7E5ABE651C8808188D2B6D401698FBD60C2E55681DC63D080689E`；Gate报告实际 SHA `48D56E92A76A8D9E82A11A77F86700AFCC4472435C4FE6C7F1D6302D185D2D29`。计划/Gate字节未改。
- 结论仅为来源/字节/元数据：新候选150源、143基底原字节、严格七差量。未执行test/build、浏览器/服务、native、SQLite、Git，不宣称新UI/EXE/完整MVP通过。
- 原 [packaging_source_r3.md](packaging_source_r3.md)、全部原helper/来源/manifest/制品保持；本报告新增，不替换旧冻结证据。

## 补修事实、权限与根触发

本owner全文读取 [impl_report_r3_1.md](impl_report_r3_1.md)（ae1cdc）及 [impl_report_r3_2.md](impl_report_r3_2.md)（4c820b）。根真实375×500/受控2x文字先发现原footer188.8px导致末卡空间不足，R3.1只减手机底栏与按钮横向padding；复测又发现末卡焦点底部6.85px被栏盖，R3.2只加手机选项scroll-margin-bottom184px。这些是根现场/另一个UI owner的证据，本包装owner没有浏览器操作或独立重测。

根先要求新helper预备且不freeze；本owner仅预检，`candidateCreated=false`。随后根明确消息触发最终freeze，提供实际Get-FileHash40e452核过的两源：

| 叠加源 | 根最终批准、包装重核的SHA256 |
| --- | --- |
| src/PetCompanion.tsx | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 |
| src/pet.css | 70DD198780FE53C15EC182DC1D9213B45D38B3762854254E87F66D4BD160B39A |

根触发消息另说明补修后实际末项138.9..326.85、stage8..135.2、footer332..492及完整status/Tab按钮可见，媒体由根保存；本owner不将转达的测量冒称自己完成UI验收。

权限仍为用户「继续吧」对应装扮布局及同范围EXE，Q1仅宠物/空间配置；不混入并发月历/探索。包装只写新TEMP helper/候选/证据和本报告，工作区产品/metadata与全部旧候选只读。

## 固定输入与新输出

TEMP根：`C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005`；基底：`C:/Users/ZXL/AppData/Local/Temp/qingjian-pet-entry-20261005/preview-source`。

| 身份 / 路径 | SHA256 |
| --- | --- |
| preview-before.json（150唯一路径） | 4EE372D3AFB2176B3BC5F52243A0186C984A1AD90CD4BBAADAA6225C8818EA90 |
| workspace-before.json（保护输入） | C97F970039F782A72C1BEE6B28E19AB744F6B9027AD09D732EE469093F726681 |
| 新 prepare-release-source-r3-1.py | D2DA90192F70794F09F636F0A410C1618313CCF56C07169101B72DE9C1EABAD8 |
| 新 verify-release-source-r3-1.py | 61A0363B94FE7EC96FA1DD530979399D12C88F5FF8B4DA7F10257D1223D46092 |
| packaging-r3-1/base-150.json | B9DD51A2B1AC21766C7FD73F6D2F566F54A7DEF2373F773A9B43472856442210 |
| packaging-r3-1/final-150.json | B0B3665E23AE6386E09E078B18A913FA5B201778A4838EA3D501FBE61FCF51D8 |
| packaging-r3-1/manifest.json | 53F1EFF66FE92046693E41F6D0F0D42DED25ADDABBBA060CB35E3E2C0A9279FB |
| packaging-r3-1/independent-proof.json | B078380967FC1FA46D977D8794503BBD86954E9268E57E6E8486CBD72BB23601 |

新候选为TEMP下 `release-source-r3-1`；新证据为 `packaging-r3-1`，绝未覆盖原release-source-r3/packaging。helper从旧实际5477字节派生，只改变固定候选、固定证据目录与diff目标标签，其他路径/150/保护/五自身字段/两根批准SHA校验保留。新独立verifier不import helper，另固定新路径和最终CSS70DD。

## 变更事实与合同映射

| path / change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- |
| TEMP/prepare-release-source-r3-1.py（新增） | 150基底重核、拒绝既存候选/越界/生成输入，严格两SHA与七差量，原workspace未知第三源保护保持 | S6-B①–⑥；根补修派单 |
| TEMP/verify-release-source-r3-1.py（新增） | 全150实际bytes与独立JSON/TOML语义，两共享最终SHA、格式/junction/旧0.7制品 | S6-B自证 |
| TEMP/release-source-r3-1（新增） | 逐路径复制5190固定150，仅叠两产品及五自身version元数据 | S6-A→S6-B接口 |
| TEMP/packaging-r3-1（新增） | before/final150、七diff/manifest、新proof及日志/exit、旧r3保护前后证据 | S6-B证据；根历史保护 |
| 本报告（新增） | 记录补修来源/根触发/实际包装与责任边界 | 根正式派单报告 |

五metadata只改package.json.version、package-lock顶层与packages[""]version、Cargo.toml[package]version、Cargo.lock唯一qingjian包version、tauri.conf.json.version为0.7.1；所有依赖/脚本/identifier语义不变，文本长度和LF/CRLF数量相同。另一Cargo依赖0.7.0未改。

新Pet字节与旧r3候选相同；新CSS相比旧r3候选严格只含两项padding与一项手机scroll-margin补修，1a73ad实际按三条字面替换核对，输出true。相对于5190基底，新候选依然严格七路径变更，非在已生成dist的旧候选上继续覆盖。

node_modules只新junction指向 `E:/project-funny/biji/node_modules`，不install、不复制依赖实体。原App/styles/SpatialNoteMap及其余143源采用5190字节，月历/探索新增文件仍不进入候选，没有修改workspace任何产品或metadata。

## impl-safe真实验证与历史保护

本轮日志及exit保存在新 `packaging-r3-1`；完整输出与真实退出码均已读取，没有用管道尾部替换命令退出码。

| 实际命令 / evidence | 结果 | owner / conclusion_if_missing |
| --- | --- | --- |
| 新helper无参数preflight；preflight.log/.exit，e15944 | exit0；全150actualbytes、五自身metadata语义/格式和6路径拒绝；候选尚不存在 | 本owner；缺证不能声称预备输入已核 |
| 新helper `--freeze --pet-sha DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 --css-sha 70DD198780FE53C15EC182DC1D9213B45D38B3762854254E87F66D4BD160B39A`；freeze.log/.exit，4d6c1b | exit0；150/143/7；baseDriftAfter、candidateDrift、unexpectedWorkspaceProductDrift均[] | 本owner；预检不是freeze完成的替代证据 |
| 新独立verifier；verify.log/.exit，760a09 | exit0；全150基底/候选、严格七差量、五metadata独立语义与格式、两共享SHA、junction、旧0.7制品保持 | 本owner；不能只相信helper自报 |
| 七diff全文读取；5c1748/1a73ad | exit0；五metadata/Pet及完整CSS，后者另核旧r3→新CSS恰为三项补修 | 本owner；实际diff在新diffs，不能用旧diff代替 |
| old-r3-protection-before.json / after.json；4c820b/1ea132 | 两次exit0；旧r3源150、三首次0.7.1制品无漂移，旧helper/manifest/report身份保持 | 本owner；缺证不得说旧冻结历史已保护 |

旧helper仍54779A6C…，旧manifest仍106AD1B5…，旧包装报告仍B88A5948…（完整身份见原报告与packaging-r3-1/old-r3-protection-after.json）。此前初次r3 native三制品本轮实际重hash为EXE `807CFE83659FF541EBFF63063796E74273327B47FB1F1B38073381ED262E2B80`、NSIS `1506C10C16F542C566FDD355A84B7F353294141FB6B9845C0318728A3A2733DB`、MSI `B3896CE62DA45CEF05F75458625B998C2D24D95E62B176B9CA31412711166EA1`，与根initial-r3-artifacts.json一致。本包装未构建这些历史制品，它们不包含最终补修，不能作为本轮最终交付。

## 目标、失败/漂移与未测

- goal_lock_check：L3来源链保持，新候选精确消费根最终S6-A补修两SHA；L1/L2现场结论归根，未由本包装关闭。
- anti_goal_touch_check：未新增角色/商品/状态/计时器/RAF/依赖/业务数据；未改工作区metadata、旧源/制品或并发App。所有生成物仅新TEMP路径和本报告。
- authoring_ergonomics_notes：沿同一有限150与五自身字段，保留格式/可读七diff；新候选和新日志使补修前后可追溯，不新增发布框架。
- contract_drift_reports：无；根补修明确属S6计划内padding/焦点边距。计划/GateC714/48D5保持，新的native target责任由根指定 `E:/project-funny/biji/src-tauri/target/wardrobe-layout-0.7.1-r3-1`，本owner未操作target。
- 所见工具失败：ae1cdc的rg用Windows通配路径impl_report_r3*报os error123、整体exit1；随后72f9b1改用真实目录与glob成功。report_r3_1实际Get-Content全文已可读，report_r3_2在4c820b全文读取。没有本轮preflight/freeze/verify失败；不省略此前root真实200%两次布局失败或UI owner旧脚本失败。
- 原R1/R2与首次R3的GPU/持续3D/资源代理限制、长期耗电、完整native GUI、安装卸载、触屏/读屏、系统reduce/PWA更新等缺证及warning仍保留。新包装不保证零bug或关闭完整MVP。

## coordinator_handoff_verifications与回滚

| 根承接项 | evidence_expected / owner | conclusion_if_missing |
| --- | --- | --- |
| 根完整264保护、新150来源与旧制品核验 | before/after实际SHA、限定两产品/文档差量和历史清单；root | 本owner有限来源证据不能冒充完整根保护 |
| 最新workspace/新candidate独立test/build及现场回归 | 各自cwd完整log/exit/实际数量，补修后两入口/焦点/长status/动态/保存实际媒体；root | 旧源test/build/截图不证明新源 |
| 新独立target0.7.1构建与交付 | wardrobe-layout-0.7.1-r3-1真实log/exit、exe/NSIS/MSI版本/hash及新来源；root | 旧native446s制品不属于最终补修源 |
| 受控native烟测、旧SQLite只读前后及fresh Review(Impl) | 新制品身份、真实只读证据、独立正式双结论及全文消费；root | 元数据/源身份核验不证明EXE或完整用户验收 |

回滚信息：需人工介入。停止并不发布新候选，进一步补修要新来源/新证据，禁止覆盖本次冻结。必要清理仅根在核绝对路径后处理本轮新TEMP/新target，不碰旧source/target/release/制品/工作区或偏好。本owner没有删除、提交、推送或新服务。

英文提交建议：`build: freeze repaired wardrobe layout release inputs`。无新增跨功能事实。
