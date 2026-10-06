# R3 装扮布局：0.7.1 隔离源包装

- feature_name：pet-space-customization；impl_round：S6-B / packaging-r3；date：2026-10-05。
- owner：layout_release_audit；lwplan_version：S6/R3，SHA `C714ABA584F7E5ABE651C8808188D2B6D401698FBD60C2E55681DC63D080689E`。
- 根正式派单已授权有限包装，Gate-2 为 [review_notes_lw_r3_2.md](review_notes_lw_r3_2.md)，实际 SHA `48D56E92A76A8D9E82A11A77F86700AFCC4472435C4FE6C7F1D6302D185D2D29`。
- 结论仅限来源/字节/元数据：新候选 150 源，143 原字节及严格七路径差量；没有执行 npm test/build、浏览器/服务、native、SQLite 或 Git，不代表新 UI/EXE/完整 MVP 已通过。

## 授权、输入与触发

用户「继续吧」承接具体装扮布局、同范围 EXE 与既有自主实施授权；Q1 仍是「先保留源码，本轮 EXE 只包含宠物和空间配置」。工作区月历/探索源码和旧发布源/制品保留，不把混合 App 搬入候选。

根先派预备 helper，禁止提前 freeze；本 owner 只跑 preflight，`candidateCreated=false`。随后根明确消息触发 freeze，并提供独立读过差量/实际 Get-FileHash 的最终两源：

| 叠加输入 | 根给定且包装再次实际核对的 SHA256 |
| --- | --- |
| workspace src/PetCompanion.tsx | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 |
| workspace src/pet.css | 2D776A1CF14EF119E641D9E8F886844CDE20337A6D1EC30D6E3932C4A99142F5 |

TEMP 根为 `C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005`。基底为 `C:/Users/ZXL/AppData/Local/Temp/qingjian-pet-entry-20261005/preview-source`；本轮 `preview-before.json` 固定 150 源，SHA `4EE372D3AFB2176B3BC5F52243A0186C984A1AD90CD4BBAADAA6225C8818EA90`。`workspace-before.json` SHA `C97F970039F782A72C1BEE6B28E19AB744F6B9027AD09D732EE469093F726681`。上述两清单和 LW/Gate 身份均在 helper 运行时严格重核，不采用根私有上下文推断输入。

## 实际输出与身份

| 输出（路径均相对 TEMP 根） | SHA256 / 实际含义 |
| --- | --- |
| prepare-release-source-r3.py | 54779A6C00EF94B813CF6F07E1D7C752886D7F43D4D4A888E6DDDD49E4B125EA；有限包装 helper |
| verify-release-source-r3.py | 6766C35A68AB919D2B96EB286E580BF2E1EA67CF8F0EF9E1391FE4D787976D05；独立核验，不导入 helper |
| release-source-r3 | 新 150 源候选，仅逐路径写入清单源 |
| packaging/base-150.json | B9DD51A2B1AC21766C7FD73F6D2F566F54A7DEF2373F773A9B43472856442210 |
| packaging/final-150.json | 553D7382337C1028925D16C7D1A56F089E37F34E82BF4FF60DB92799CB1B1A32 |
| packaging/manifest.json | 106AD1B5C2FC28FEB8ACBCD1F8C26F7E111A06E76187FCF9FE3744F7764709E0；完整输入、150来源、七diff与共享两 SHA |
| packaging/independent-proof.json | 9B0AB40813237E3E724DA340637A4DAC4C867E0DC5F6104FC2F896F5D36A2E88 |

七份 diff 位于 `packaging/diffs/`，源相对路径中的 `/` 转成 `__`，末尾 `.diff`。对应 SHA 与字节在 manifest，实际全文消费为 8afdfc（五 metadata 与 PetCompanion）及 2f206d（pet.css），均退出 0，无截断。没有修改历史 diff/proof 或旧 helper。

## 文件变更事实与 S6-B 映射

| path / change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- |
| TEMP/prepare-release-source-r3.py（新增） | 固定清单/计划/Gate身份、150源核对、路径/既存输出拒绝、两批准 SHA、五自身字段、七diff/manifest、依赖junction | S6-B ①–⑥ |
| TEMP/verify-release-source-r3.py（新增） | 不使用 helper 转换函数；全150实际 bytes、元数据独立解析、共享两源/旧制品/依赖链接核验 | S6-B 自证 |
| TEMP/release-source-r3/src/PetCompanion.tsx、src/pet.css（新增候选叠加） | 仅复制根冻结的同轮两产品最终字节，不再修改或补实施 | S6-A→S6-B接口 |
| TEMP/release-source-r3 五 metadata（新增候选自身版本） | package及root lock、Cargo自身包及lock、Tauri产品版本→0.7.1；不改依赖/脚本/identifier | S6-B ④ |
| TEMP/release-source-r3 其余143源（新增候选原字节） | 逐清单复制5190稳定基底，非整树复制工作区 | S6-B ②/保护 |
| TEMP/packaging 证据（新增） | base/final150、七diff、manifest、proof及真实preflight/freeze/verify日志和exit | S6-B ⑥/自证 |
| 本报告（新增） | 记录授权触发、范围、证据/失败/未测与根交接 | 根正式报告派单 |

版本 delta 精确为：package.json.version；package-lock 顶层与 packages[""] 的 version；Cargo.toml [package].version；Cargo.lock 唯一 name="qingjian" 包的 version；tauri.conf.json.version。独立 JSON/TOML 比较确认除此之外结构全部相同，文本长度与 LF/CRLF 数量保持。Cargo.lock 另一个依赖的 0.7.0 保持，没有全局替换。

## 保留与排除

- 新候选的 App 为 `5674125B997818A7CCAC8BC646719D77275A632D4598C3D578C12E645E923ABD`，styles 为 `E5D6FC8B7F4A3FA43EDF310F6C1C444DE3AB0E41F43CE28A1CA7912FDC3B1B46`，SpatialNoteMap 为 `E5A795F957F34FCBC1DC4914DA418B77963DEF287C88351F806E4E60169654AE`，保持5190字节。没有搬入当前混合 App 或探索版本。
- 月历/探索新增源不在150清单，也不在候选内；旧探索源采用5190稳定基底。本 owner没有修改/删除这些工作区文件。
- src/tests 当前路径集合与 workspace-before 的对应集合相同，冻结时没有新增/删除第三业务路径；遍历捕获的 src/tests/src-tauri/metadata 实际 SHA，除了批准两源无第三漂移。此有限核验不取代根完整264保护核验。
- node_modules 只建新 junction，指向 `E:/project-funny/biji/node_modules`。未 install、未修改共享依赖；dist/target/tsbuildinfo 未复制。150源枚举在依赖junction之前完成，独立 verifier 排除junction递归。
- 旧 preview150 在读取/复制后再核字节不变；旧三制品独立重哈希均保持：EXE `9F04E006C93FF9AC4E66C3819762BB0104AB8FC48912B83648EF4AF068E1A397`、NSIS `0BB91F58E8475179E915A5A161BF6540DCABE6699FC640BB1A24EEF6F527F414`、MSI `6E334D074E8D709043BBB64AD873AC31D9C18DC916389A8F04D503100AB02572`。

## impl-safe 实际验证

所有日志和 `.exit` 在 TEMP/packaging，命令不以 tail 等管道收尾，以下完整输出与实际退出码均由本 owner读取。

| 命令 / evidence | 实际结果 | owner / conclusion_if_missing |
| --- | --- | --- |
| `python prepare-release-source-r3.py`；preflight.log/.exit，3082b8 | exit0；150源、五metadata解析与6拒绝案例；未创建候选 | 本owner；没有该证据不能说基底/元数据预检已执行 |
| 最终helper同一无参数命令；preflight-final.log/.exit，9cd6ba | exit0；仍未创建候选，最终helper SHA5477；freeze函数新增common-before与新增/删除第三路径断言 | 本owner；替代初版helper身份，但旧预检日志保留 |
| `python prepare-release-source-r3.py --freeze --pet-sha DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 --css-sha 2D776A1CF14EF119E641D9E8F886844CDE20337A6D1EC30D6E3932C4A99142F5`；freeze.log/.exit，e6044c | exit0；150/143/7、baseDriftAfter/candidateDrift/unexpectedWorkspaceProductDrift均[] | 本owner；未执行不能宣称候选已生成 |
| `python verify-release-source-r3.py`；verify.log/.exit，88e438 | exit0；独立全150、严格七差量、五自身字段/格式、两共享最终SHA、junction、三旧制品无漂移 | 本owner；helper自报不足以代替独立 bytes 校验 |

包装没有产品 test/build/UI。150候选是冻结源集合；根后续构建会生成dist等，不应把生成物误当作新增源或修改本轮冻结证据。验证脚本的源枚举用于构建前，不用于已经生成dist的目录断言。

## 目标对齐、漂移与失败

- goal_lock_check：消费L3，将根S6-A两源对应到同一隔离候选；L1/L2的实际布局/交互体验由根现场验证，不能以本包装证明。
- anti_goal_touch_check：没有新角色/行为/依赖/业务数据、计时器/RAF；未触碰工作区metadata/混合App、旧源/制品。候选之外只新增本轮TEMP包装证据和本报告。
- authoring_ergonomics_notes：采用有限150清单、两共用源和五自身字段，保留格式；版本差量可逐行顺读，不引入通用发布引擎或业务配置抽象。
- contract_drift_reports：未发现阻断漂移。前调研中的“可复用旧target并先备份”只是当时选项；正式S6明确新独立target，因此最终构建责任以S6 `E:/project-funny/biji/src-tauri/target/wardrobe-layout-0.7.1` 为准。本 owner没有设置target、操作缓存或构建。
- 工具读取失败保留：d8a6d7 以错误顶层路径读取 research_layout_r3.md 报不存在，整体exit0不抵消错误；361b10定位并全文读取实际 source_materials/research_layout_r3.md。1b9099批量计划输出截断，随后2a469b按S6关键段补读，并核C714/Gate48D5身份。没有包装预检/freeze/verify失败退出码，不将历史或root/UI owner失败删除。
- 历史未测继续保留：原持续3D动图失败、资源/SW/Worker现场代理限制、GPU/FPS/内存/耗电、完整native GUI、安装卸载、触屏/读屏、系统reduce/PWA更新；见原R1/R2验证。本包装不会关闭它们或保证无bug。

## coordinator_handoff_verifications 与回滚

| 待根承接 | evidence_expected / owner | conclusion_if_missing |
| --- | --- | --- |
| 全264工作区保护及旧150/制品独立来源核验 | 实际 before/after路径/identity，批准两源与正式文档差量；root | 本owner有限来源核验不冒充根全部保护 |
| workspace与新候选独立 test/build | 各自cwd、完整log/真实exit、实际测试数量和Web资源；root | 不能用旧118/145或S6-A自证替代新候选结果 |
| 两入口实际sticky/首末组/375矮屏/键盘/五角色/静态/完整status/失败重试/应用刷新 | 同源实际操作、祖先/几何/媒体及失败/未测；root | 源冻结和类型检查不证明L1/L2现场达标 |
| 0.7.1原生/版本化交付及旧库保持 | 新独立target构建完整log/exit、实际exe/NSIS/MSI版本/hash、受控烟测、SQLite只读before/after；root | 新源元数据不证明EXE已生成，不安装覆盖真实库 |
| fresh Review(Impl)及当前文档同步 | 最终两产品/七差量/源与所有真实新验证，正式独立双结论及根全文消费；root | 旧R2 PASS不覆盖R3，不关闭完整MVP/用户验收 |

回滚信息：需人工介入。停止并不发布本候选；需补修时先报告/追溯根修订，再创建新的独立候选与新证据，不能悄悄替换本次freeze。必要清理由根只对已核属于本轮的新TEMP/独立target执行Windows路径安全检查；不还原/删除旧源、旧制品、他人工作或业务偏好。本owner没有执行删除、提交或推送。

英文提交建议：`build: prepare isolated wardrobe layout release sources`。无新增跨功能事实。
