# R3 装扮布局：隔离发布来源调研

日期：2026-10-05。owner：layout_release_audit。仅调研发布来源与已有工具；本轮只写本文件，没有复制候选、改产品、构建、操作进程、Git 或浏览器。

用户既有发布边界：「先保留源码，本轮 EXE 只包含宠物和空间配置」。本次根任务要求继续装扮布局并评估 0.7.1 同范围发布。本报告不将既有月历、主题探索/局部图增量纳入安装包，也不为新制品作通过声明。

## A. 系统边界与现有能力

- Web：React/TypeScript/Vite；本机笔记、账本、关联图、3D 空间与宠物。桌面：Tauri 2/SQLite。
- 可用隔离发布基底为 `C:/Users/ZXL/AppData/Local/Temp/qingjian-pet-entry-20261005/preview-source`，对应此前 5190 入口体验。此次没有读取浏览器或确认其当前服务状态。
- 其 150 路径来自旧 `qingjian-customization-20261004/release-source-r2` 固定清单；在此前五角色/空间配置基础上，只有独立伙伴入口的 App/styles 差量。
- 工作区 App 含额外月历、探索增量；与隔离 App 身份不同，不能复制工作区整份 App。
- PetCompanion、PetCharacters、pet.css、petAppearance、petBehavior 在本次观察时与隔离基底逐字节相同，因此本轮 PetCompanion/pet.css 布局差量有共同基底。

## B. 入口与主流程

真实 `package.json` 的发布命令为 `"release:windows": "tauri build"`；`scripts/release-windows.mjs` 不存在。Tauri `beforeBuildCommand` 是 `npm run build`，`frontendDist` 为 `../dist`，包型为 MSI/NSIS，产品名晴笺，identifier 为 `com.zxl.qingjian`。

旧发布记录的实际命令为 `npm run release:windows -- --ci`，由 Tauri CLI先运行 Web 构建，再 Cargo release 与安装包生成。根报告记载其此前退出 0，optimized 16 分 41 秒。本次没有重跑，不能转写成本轮构建证据。

（推断）在根任务完成新布局且保护核验通过后，以新隔离基底叠加本轮两源及受限版本元数据即可沿用同一构建入口；实际可行性仍须以候选构建输出确认。

## C. 关键模块与职责

| 路径 | 职责与本轮发布处理 |
| --- | --- |
| src/PetCompanion.tsx | 大小画像、伙伴展示、试穿/应用及行为；本轮只叠加已审查的装扮布局差量 |
| src/pet.css | 画像/装扮响应式及动态表现；本轮只叠加对应布局差量 |
| src/PetCharacters.tsx | 五角色身体及差异动作；基底不变 |
| src/petAppearance.ts、src/petBehavior.ts | 外观与局部行为模型；基底不变 |
| src/App.tsx、src/styles.css | 采用已隔离的伙伴入口版本，禁止整体覆盖为当前混合工作区版本 |
| src/SpatialNoteMap.tsx | 采用旧发布稳定字节；当前工作区探索字节不同，不能取当前版本 |
| src/spatialScene.ts | 当前与旧发布字节相同；本轮不改 |
| package.json、package-lock.json | npm根包版本；依赖版本/完整性不改 |
| src-tauri/Cargo.toml、Cargo.lock、tauri.conf.json | root crate 与产品版本；Rust业务和 identifier 不改 |

## D. 本次实际来源核验

本次读操作 50a15f 退出 0：遍历 `source-before.json` 全部 150 路径，重算旧 release-r2 与 preview 实际 SHA。`missing=[]`、`baseDrift=[]`；preview 相比旧源仅 `src/App.tsx` 与 `src/styles.css` 两项差量。不是调用旧 verify-source.py 的结果；旧脚本会写历史 diff/proof，本次只阅读全文，没有执行。

| 清单/文档 | 实际 SHA256 |
| --- | --- |
| TEMP/qingjian-pet-entry-20261005/source-before.json | 0C0E0C952966828B1A5918979EC917D73442AEEAFA4592DBD67B0AB9A65257AD |
| TEMP/qingjian-customization-20261004/release-source-r2-manifest.json | 15F783A8C319F7920D337E9A5A9A2757A408529334A5C1732E1BCAA6E30201FC |
| docs/current/pet-space-customization/packaging_source_r2.md | 4F7A699E53C466619E3CF3D9A87FC596C6FDE99644A9DF41C3A9B4C8FE8159D0 |
| docs/current/pet-space-customization/verification_entry_r2.md | FC4885E66E5D45E79F77912FEACA67007A54598D4D67D68C74DD8F27456E9E1A |
| docs/Release.Verification.0.7.0.md | D58F19ACD908E0A08416813B6FB87F9DE75A0ADA26E57208E656CD5E006C14D8 |

其中 TEMP 为 `C:/Users/ZXL/AppData/Local/Temp`。上面三份文档全文实读 72ed20 退出 0。

| 产品路径 | 观察到的 workspace / preview SHA256 |
| --- | --- |
| src/PetCompanion.tsx | 同为 BFE390FAE9465E78327C2AC8D6F1919CAD9CA52DE835B70128593B16C1FE0768 |
| src/PetCharacters.tsx | 同为 E67E5F35820FE00C04B8D019DB4C940CD005CB1E5451167A42A7420F299D96CA |
| src/pet.css | 同为 0E5150E714A00295BE46272726355C291312F80E3A854D4F1A9C033643A486AC |
| src/petAppearance.ts | 同为 BD36B14D3CED4B150B35A061F55278F5D9DEB29FBAD8593E00D69921C350082D |
| src/petBehavior.ts | 同为 DA9F4FDF740E46496CA9F8981D3507851848666CDD8C32EAC4A807C0514799CF |
| src/App.tsx | workspace A9B58572F146DEBE055B8A2B8E388D875518AF9E74C972A3E59261A3EB346202；preview 5674125B997818A7CCAC8BC646719D77275A632D4598C3D578C12E645E923ABD |
| src/styles.css | 同为 E5D6FC8B7F4A3FA43EDF310F6C1C444DE3AB0E41F43CE28A1CA7912FDC3B1B46 |
| src/SpatialNoteMap.tsx | workspace EE338ED054219A0A3388270DE06331668FC5D2DFB0B759FCA713633B75AA840D；preview E5A795F957F34FCBC1DC4914DA418B77963DEF287C88351F806E4E60169654AE |
| src/spatialScene.ts | 同为 F5917D12790985A9DCE1A1CA92A984ED7AC900C829389C165E7786502B65236C |

| 版本输入路径 | 当前 workspace 与 preview 共用 SHA256 |
| --- | --- |
| package.json | 501A2D91A5497BCB6DCB4D93CCC39F9592EDF86D68246CC4CE56EDBEFC019F86 |
| package-lock.json | 81FD22EB385103066042BB6035CAE1A02EF4E96F12447B2581AFD4BB5DB4E02F |
| src-tauri/Cargo.toml | D221BF657BEF820A47AC041593BB09BD70128F5BD22262D3E483E0B482B771D8 |
| src-tauri/Cargo.lock | 9D11E5218B1F6801E4C8B061896F256EFCD16F99FB3ADEC037F8DB903F3F5A00 |
| src-tauri/tauri.conf.json | A849C5D539E9FCBE9B26AF1BA5404FF6E126C9A1B6B4C939C2466A4EA681E0C1 |

这是逐文件观察窗口，不证明活动工作区此后稳定；根任务开始叠加时必须重新核对实际 before。50a15f/bb31e4 的产品 hash 观察均发生在本 agent 未编辑产品的条件下。

## E. 已有工具与缓存

- `npm.cmd` / `node.exe`：`C:/nvm4w/nodejs/`；`cargo.exe` / `rustc.exe`：`C:/Users/ZXL/.cargo/bin/`；Python：`C:/Users/ZXL/AppData/Local/Programs/Python/Python312/python.exe`。本次只取 Get-Command 来源，没有运行编译工具。
- preview `node_modules` 为指向 `E:/project-funny/biji/node_modules` 的 junction；不是 150 源中的一项。新候选可复用相同依赖来源，但不能将依赖实体复制入源清单，也不对 junction 跑安装命令修改共享依赖。
- 旧 release cache 为 `E:/project-funny/biji/src-tauri/target`，存在 release/.fingerprint、deps、build、incremental、wix/nsis；其 qingjian.d 明确引用旧 TEMP/release-source-r2/src-tauri 与 dist。旧 TEMP release-source-r2 下没有独立 target，支持前次构建使用共享 target 的事实。
- Cargo registry 的 cache/index/src 在 `C:/Users/ZXL/.cargo/registry`。
- Tauri Windows 工具缓存实际在 `C:/Users/ZXL/AppData/Local/tauri`，含 NSIS/makensis.exe 和 WixTools314/candle.exe/light.exe。`C:/Users/ZXL/.cache/tauri` 不存在，不能用该猜测路径。
- 当前环境 `CARGO_TARGET_DIR`、`CARGO_BUILD_JOBS`、`RUSTUP_HOME`、`CARGO_HOME` 均未设置。旧 `.d` 可以确定前次制品来源与 target 路径，但不能证明某条 shell 环境赋值的实际原文。

## F. 根任务最小执行交接

此处是根派单要求的可执行交接，不是本 agent 已实施的方案或结果。

1. 在全新 TEMP 直接子目录建立新 `release-source-r3`，拒绝既存输出/越界路径。只逐项复制上述 150 路径的 preview 当前字节；生成新 base/final 清单，禁止复制 dist、target、node_modules、tsbuildinfo、历史日志。不要整体复制工作区。
2. 对已核对 common-before 的 `src/PetCompanion.tsx`、`src/pet.css` 叠加根任务审查的最终差量。其余产品源保持 preview 基底；本轮若出现第三个业务路径应先报告，不能借发布偷渡探索/月历。
3. 0.7.1 元数据限五文件：package.json.version；package-lock.json 顶层 version 与 packages[""].version；Cargo.toml 的 [package].version；Cargo.lock 中唯一 `name = "qingjian"` 包的 version；tauri.conf.json.version。不得全局将所有 `0.7.0` 替换：Cargo.lock 2013 行另一个依赖也是 0.7.0，qingjian 在 2803–2804 行。
4. root 单独重算 base150/final150 与 scope差量，确认只允许两产品源+五元数据；App/styles 必须仍为本报告隔离 SHA。排除的月历/探索新增文件继续不存在，旧四个探索源仍采用稳定发布字节。工作区保护与旧候选清单均只读。
5. 在新候选根执行 `npm.cmd test`、`npm.cmd run build`，分别保存完整日志/真实退出码，检查 Web输出包含新的布局。此次尚未执行，新测试数不得从旧118项直接抄成结果。
6. 原生构建如复用旧 cache，先将三旧制品复制到新证据目录并核 SHA，避免共享 target 覆写后丢失旧交付；不要使用 hardlink 备份。之后候选 cwd 下设置 `$env:CARGO_TARGET_DIR='E:/project-funny/biji/src-tauri/target'`、`$env:CARGO_BUILD_JOBS='1'`，运行 `npm.cmd run release:windows -- --ci`。或使用全新独立 target 保留旧 cache 原状，构建时长待实测。上述均由 root 执行，本 agent没有设置环境或构建。
7. 新制品预计为 target/release/qingjian.exe、bundle/nsis/晴笺_0.7.1_x64-setup.exe、bundle/msi/晴笺_0.7.1_x64_zh-CN.msi（推断，最终按 CLI 产出核）；另复制进版本化交付目录并核 PE/MSI 版本、SHA、受控启动及本机库只读前后。保留实际失败与人工验收边界。

旧三制品本次 b9058d 实际重哈希，与历史记录相同：

| 旧路径（均在 E:/project-funny/biji/src-tauri/target/release/） | bytes | SHA256 |
| --- | ---: | --- |
| qingjian.exe | 13705728 | 9F04E006C93FF9AC4E66C3819762BB0104AB8FC48912B83648EF4AF068E1A397 |
| bundle/nsis/晴笺_0.7.0_x64-setup.exe | 3909543 | 0BB91F58E8475179E915A5A161BF6540DCABE6699FC640BB1A24EEF6F527F414 |
| bundle/msi/晴笺_0.7.0_x64_zh-CN.msi | 5337088 | 6E334D074E8D709043BBB64AD873AC31D9C18DC916389A8F04D503100AB02572 |

## G. 不确定点与失败保留

- U1：新布局后的真正产品差量/最终身份未生成；由 root 最终 diff 与全150核验确认。本报告只给修改前共同基底。
- U2：0.7.1 原生构建、工具缓存完整性、未来网络请求、链接/打包耗时未测；文件存在不证明下一次 build 成功。
- U3：持续3D/GPU/FPS/内存/后台耗电、native完整GUI、安装卸载、触屏/读屏/系统减少动态/PWA更新仍未测；本次只读来源不会关闭它们。
- U4：活跃 workspace 可能继续并发变化；只接受已锁定两源差量，根任务重新捕获 before/after，不依赖本报告宣称全局稳定。
- 035f0e 退出1：猜测 scripts/release-windows.mjs 与 .cargo/config.toml 的读取报不存在；之后读取真实 package/Tauri配置确定无独立发布脚本。非产品构建失败，保留工具读取错误。
- 1b5d94 大 manifest 输出截断，不能作为全文消费；随后 50a15f 限定输出、全150字节核验和 5207dd 顶层字段核读取代该消费主张。
- cdb136 退出1来自旧 native log 的 env关键词无匹配；不据此推断缓存缺失。bb31e4 对错误 `.cache/tauri` 路径的 Get-ChildItem 报错虽整体 exit0，仍显式保留；5207dd 实际发现 Local/tauri 工具缓存。
- 旧报告中的首轮阈值失败、并发20个TS错误、严格App漂移拒绝、连续3D动图采集三次失败、5190资源/SW/Worker现场代理不支持，以及 chunk/Node/Rust warning均仍适用其原证据范围，不因本次源身份核验被抹去。

## H. 最小可核查证据与 readiness 边界

- 发布源事实：source-before.json 的150项 + 本报告50a15f实际哈希核验；Pet共同基底及App隔离身份表。
- 构建入口事实：package.json 的release:windows、tauri.conf.json 的beforeBuild/frontendDist/bundle目标；不是不存在的脚本。
- 缓存事实：Get-Command工具路径、Local/tauri工具实体、旧release/qingjian.d引用；没有执行构建。
- 保护事实：本次旧release150无漂移、旧三制品SHA保持；没有复制/删除/覆盖旧候选或工作区产品。
- 已阅完整文档：codebase-research/SKILL.md、verification-before-completion/SKILL.md、packaging_source_r2.md、verification_entry_r2.md、Release.Verification.0.7.0.md；旧 verify-source.py完整只读。Release.Testing.md仅定向rg匹配，不声称全文阅读。
- readiness：本调研不阻塞狭窄新候选准备；U1–U4必须由root新的产品、原生/现场证据分项接续，不给新构建、UI或完整MVP自动PASS。

英文提交建议：`docs: record isolated wardrobe layout release inputs`。

无新增跨功能事实。
