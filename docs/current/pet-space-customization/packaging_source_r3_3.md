# R3.3 焦点留白补修：新隔离源冻结

- feature_name：pet-space-customization；impl_round：S6-B / packaging-r3-3；date：2026-10-05；owner：layout_release_audit。
- lwplan_version：S6/R3，SHA `C714ABA584F7E5ABE651C8808188D2B6D401698FBD60C2E55681DC63D080689E`；Gate报告SHA `48D56E92A76A8D9E82A11A77F86700AFCC4472435C4FE6C7F1D6302D185D2D29`，旧计划/Gate字节保持。
- 本轮只确认来源/字节/元数据：新150源、143基底原字节、严格七差量；没有test/build、UI/服务、native、DB、Git或递归委派，不宣称根新UI/EXE通过。
- 原r3、r3-1、r3-2源/包装/证据均保留；本报告新增，不能以新身份覆盖旧报告。

## 真实新症状与根触发

本owner在1bf6a8全文读取 [impl_report_r3_4.md](impl_report_r3_4.md) 及真实单值patch：CSS72B2在600px高表现不能代替500px高回归。根追加实测发现500px高ShiftTab休息→招呼触发额外滚动，招呼341.587..379.187落在从324.987开始的footer后；UI owner仅将短桌面 `.pet-showcase-actions button` 的scroll-margin-bottom184→96px，其他CSS/完整TSX保持。该症状与UI自证属于根/另一owner，本owner没有现场浏览器操作。

根本轮派单明确给出最终PetDFFA/CSS77CA并授权新freeze，转达5197工作区五角色1100×500反向休息→招呼focusbottom401.925<footer406.8、portrait16..123.325实测闭环。此处只记录派单事实，不冒称包装owner独立验证该UI，也不代替根后续同源候选复测。

用户「继续吧」对应同一装扮目标和同范围EXE，Q1仍只宠物/空间配置。根同时明确r3-2 native正在跑，本owner不得并发读写那个target任何artifact；本轮没有读取该新target、没有操作它的缓存/进程/制品。

## 固定基底与新实际身份

TEMP根：`C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005`；源基底始终是 `C:/Users/ZXL/AppData/Local/Temp/qingjian-pet-entry-20261005/preview-source`。新候选为TEMP/release-source-r3-3，新证据为TEMP/packaging-r3-3，没有继承当前workspace混合App或前轮构建目录。

| 输入/新输出 | SHA256 |
| --- | --- |
| preview-before.json / 固定150唯一路径 | 4EE372D3AFB2176B3BC5F52243A0186C984A1AD90CD4BBAADAA6225C8818EA90 |
| workspace-before.json / 保护输入 | C97F970039F782A72C1BEE6B28E19AB744F6B9027AD09D732EE469093F726681 |
| PetCompanion.tsx / workspace与新候选相同 | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 |
| pet.css / workspace与新候选相同 | 77CA75C7A1A4EE3D0D14E4F20E941F3287C2EDAF358418EAC77C127BEA255EBA |
| prepare-release-source-r3-3.py | A64B042C4667677F1AA6CECC29893888549E606236226F74E10912AD970F8950 |
| verify-release-source-r3-3.py | CB97D0F2FE949D485D10FD0F1C6891C11E68BC804D46E0332E61FBDB9A64E411 |
| packaging-r3-3/base-150.json | B9DD51A2B1AC21766C7FD73F6D2F566F54A7DEF2373F773A9B43472856442210 |
| packaging-r3-3/final-150.json | D0EE2D24B535C93C411963D3056AF33BB338E2B00BEA0715FFF16D44651FCFF1 |
| packaging-r3-3/manifest.json | EC955B8BB520E2293A10BD860FA40B30DCDDEC5F5FD1D272F459F57AF1C9CEF4 |
| packaging-r3-3/independent-proof.json | 05ECE6EE4924672B98972939E585E0BDCB9B2D586532CA0B258DB5E379C5E0B0 |

helper从原r3-2实际899F字节派生，只替换新candidate/evidence路径和diff目标标签；verifier从原4748派生，只换新目录与批准CSS77。没有改旧helper，150/common-before/未知第三产品/五自身字段/两批准SHA合同全部保持，独立verifier不import helper。

## 文件事实、差量与S6映射

| path / change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- |
| 新TEMP helper/verifier（新增） | 相同有限包装与独立字节/元数据核验，仅新路径/最终SHA | S6-B①–⑥/自证 |
| TEMP/release-source-r3-3（新增） | 逐5190清单写150源，两批准产品+五自身0.7.1字段；143原字节 | S6-A→S6-B来源接口 |
| TEMP/packaging-r3-3（新增） | base/final150、七diff、manifest/proof、真实log/exit及450历史保护 | S6-B证据/根历史保护 |
| 本报告（新增） | 记录500px新红、根触发、实际source结果与未测责任 | 根正式派单报告 |

五metadata严格只改package.json.version、package-lock顶层与packages[""]version、Cargo.toml[package]version、Cargo.lock唯一qingjian包version、tauri.conf.json.version→0.7.1。独立解析确认依赖/脚本/identifier/其他字段不变，长度和LF/CRLF相同，另一Cargo依赖0.7.0保持。

其余143源采用5190冻结字节，App/styles/SpatialNoteMap不取workspace并发版本，月历/探索新增源不进入150。node_modules仅新junction到 `E:/project-funny/biji/node_modules`，不install、不递归复制dist/target/依赖或tsbuildinfo。

新CSS相对原r3-2候选严格仅短桌面copy按钮184→96单值替换，98a875实际字面核对输出true。七份新diff由7b7644（五metadata/Pet）与98a875（CSS）全文读取，均exit0、无截断。

## impl-safe真实记录与历史保持

日志及真实exit在新packaging-r3-3；以下完整输出/退出码已读取，没有管道尾部替换验证退出码。

| 命令 / evidence | 实际结果 | owner / conclusion_if_missing |
| --- | --- | --- |
| 新helper无参数preflight；preflight.log/.exit，7c2283第一段 | exit0；全150actualbytes、五元数据/格式、6路径拒绝，候选不存在 | 本owner；派单意图不代替实际预检 |
| 新helperfreeze，携根DFFA/77CA完整SHA；freeze.log/.exit，7c2283第二段 | exit0；150/143/7、base/candidate/第三workspace漂移均[] | 本owner；只有preflight不能声称已freeze |
| 新独立verifier；verify.log/.exit，1ee23d | exit0；全150基底/候选、七差量、五自身字段/格式、共享两SHA、junction及三旧0.7.0制品 | 本owner；不能仅采信helper自报 |
| 新manifest实际hash；8d518c | exit0；EC955B8B…；冻结后立即向root通知新候选与身份 | 本owner；元数据不是新EXE身份 |
| 七diff全文及旧r3-2→新单值核对；7b7644/98a875 | exit0；CSS仅184→96额外修订，原Pet结构字节相同 | 本owner；旧diff不覆盖新源 |
| history-protection.json；ae360a | exit0；三旧候选450源、9旧制品、旧delivery七文件全部无漂移 | 本owner；缺字节证据不能宣称历史保持 |

历史源三组分别是release-source-r3/r3-1/r3-2，各150，按各自原final-150实际重hash；旧manifest106AD1B5…/53F1EFF6…/A013EBEF…保持。历史9制品仅核artifacts-before.json、initial-r3-artifacts.json、candidate-r3-1-artifacts.json三清单，每组3项；**没有读取正在构建的r3-2 target新制品**。

旧delivery `E:/project-funny/biji/src-tauri/target/deliveries/0.7.1` 七文件按此前实际保护SHA/bytes逐项重核均保持，没有覆盖它的源清单或三制品。旧交付不含77CA修订，不能称此次新候选的最终制品。

## 目标、漂移、失败和未测

- goal_lock_check：L3始终保持固定150来源及根两批准SHA；L1/L2原500px焦点问题及同源候选UI由根现场承接，本包装不证明实际修复。
- anti_goal_touch_check：未增加角色/状态/行为/计时器/RAF/依赖/业务数据；未改workspace产品或metadata、旧源/交付/制品、并发App或原计划。
- authoring_ergonomics_notes：复用相同有限helper与五自身版本字段、新路径保留每轮来源，七diff可顺读，不新增设计/框架。
- contract_drift_reports：无；短桌面单值修订来自根S6同范围明确派单，C714/48D5保持。r3-2 native尚在根运行窗口，本owner没有获取其结果或假定成功；最终77CA构建/target由根另行承接。
- 本轮包装/静态命令无失败或截断；真实500px新增遮挡与此前600px/200%失败持续保留，不能以静态exit0或旧构建结果抹去。之前UI owner脚本/工具失败、原3D动图失败和warning保持原报告。
- 本次没有根新UI、test/build、native/烟测/DB/fresh审查证据，不能声称根通过。原GPU/FPS/长期耗电、完整native GUI/安装卸载/触屏读屏/系统reduce/PWA更新等未测不关闭。

## coordinator_handoff_verifications与回滚

| 根承接项 | evidence_expected / owner | conclusion_if_missing |
| --- | --- | --- |
| 完整264保护及最新150/所有历史范围 | 根实际before/after与限定差量；root | 本owner有限源核验不冒充完整根保护 |
| 77CA同源双源test/build及500/600px、五角色正反Tab/手机回归 | 新源各cwd完整log/exit/实际数量、媒体/按钮/footer几何；root | 工作区5197或旧candidate结果不自动覆盖新候选 |
| 最后新target0.7.1构建与版本化交付 | 新native实际完整log/exit、exe/NSIS/MSI版本/hash与77CA来源；root | 正在跑的r3-2构建及旧delivery不代替最终源制品 |
| 新制品受控烟测/SQLite只读前后与fresh审查 | 新身份真实证据及独立双结论/root全文消费；root | sourcefreeze不能证明EXE/完整MVP或用户验收 |

回滚信息：需人工介入。停止并不发布此候选；再补修要新源/新证据，禁止覆盖任何一次freeze。必要清理仅根核绝对路径后处理本轮新TEMP/target，不碰旧source/target/交付/偏好。本owner没有删除、提交或推送。

英文提交建议：`build: freeze final wardrobe focus release inputs`。无新增跨功能事实。
