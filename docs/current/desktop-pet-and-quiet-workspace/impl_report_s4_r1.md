# S4 r1：0.9.0 版本与个人制品

- feature_name：desktop-pet-and-quiet-workspace
- impl_round：S4 r1
- date：2026-10-07
- lwplan_version：Review(LW) r2 PASS，§7 S4；S1 PASS / S3 r3 PASS；root恢复S2 r2审查并授权正式构建。
- 当前状态：正式 release 构建、三制品复制及身份校验退出0；另隔离identifier的同源no-bundle验证包已保存。root的原生效果/旧库验收尚未完成，不作可交付完成声明。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| package.json | 修改 | 将上轮保留0.8.1最终改0.9.0；不改依赖/scripts | S4.1 |
| package-lock.json | 修改 | 根version及packages空键version改0.9.0；不重解依赖 | S4.1 |
| src-tauri/Cargo.toml | 修改 | package version改0.9.0；既有S3 windows-sys必要feature保持 | S4.1 |
| src-tauri/Cargo.lock | 修改 | 仅qingjian version改0.9.0；保留S3 windows-sys直接引用及其他锁项 | S4.1 |
| src-tauri/tauri.conf.json | 修改 | version改0.9.0；identifier/配置原样保持 | S4.1 |
| target/release-evidence/0.9.0/package-delivery.ps1 | 新增忽略本地脚本 | 按既有三个输出精确复制、版本/hash和五私有GLB source/local/dist/manifest硬校验；记录tracked diff和实际构建输入hash | S4.2 |
| 本报告 | 新增 | 真实fresh命令、失败、后续原生责任 | S4验证 |

## 目标与作者体验

- goal_lock_check：版本一致和准确制品身份用于最终实际EXE展示；没有把build当独立桌宠或视觉验证。
- anti_goal_touch_check：没有功能、业务、schema、标识、AI、公开模型上传或安装器行为扩展；不启动应用、不操作真实DB。
- authoring_ergonomics_notes：仅五既有版本落点，不新增发布框架；manifest与辅助脚本仅ignored target。
- contract_drift_reports：无新漂移。root已授权继续开发/构建；不重复请求许可。

## impl-safe 真实验证

owner：S4 impl。下表每条完整命令输出与退出码已实际读取；conclusion_if_missing：缺证据不能称相应版本、构建或测试通过。

| 命令/校验 | 结果 | evidence |
| --- | --- | --- |
| `node --test --test-reporter=spec tests/*.test.mjs` | exit0，155 tests /155 pass /0 fail /0 cancel /0 skipped | 工具chunk b7c342完整输出；包括r3真实hook竞态回归 |
| `npm run build` | exit0，2532 modules，五新GLB均入dist，PWA31entries | 工具chunk830607完整输出；保留three737.16kB chunk警告 |
| `cargo test --manifest-path src-tauri/Cargo.toml --locked --jobs 1` | exit0，20 passed /0 failed；main/doc0tests | session42956全部输出（c2880b/47d683/06603b）；保留linker_messages warning |
| `cargo check --manifest-path src-tauri/Cargo.toml --locked --jobs 1 --tests` | exit0 | chunk ac34ad完整输出 |
| 五版本一致性PS校验 | 首次exit1：npm空键导致ConvertFrom-Json不支持；使用-AsHashtable后exit0，6落点均0.9.0 | chunks78a698失败与022cde修复后输出；是校验脚本问题，不抹去首次失败 |
| `git diff --check` | exit0，保留LF→CRLF警告 | chunk022cde |
| `git check-ignore`五GLB/辅助脚本 | exit0，全部忽略路径实际输出 | chunk653c17；未Git stage |
| `npm run release:windows -- --ci -- --jobs 1` | exit0，release2m25s，EXE及两bundle生成 | `target/release-evidence/0.9.0/s4-release-windows.log`，session8438/chunk163f5d完整输出；既有chunk/linker警告保留 |
| 最终`package-delivery.ps1`及manifest3artifact/5model数量检查 | exit0，三制品copy hash一致，EXE/NSIS双version及MSI COM ProductVersion全0.9.0，五GLBsource/local/dist/manifest全部相同 | `s4-artifact-identity.log`，chunk858b32完整输出；manifest记录逐输入hash、sourcecommit和dirty差异 |
| 79个manifest源码输入对当前hash重核 | exit0，全79相同 | chunk66d9f9；与root文档同步分离 |
| `npm run tauri -- build --no-bundle --ci --config src-tauri/target/release-evidence/0.9.0/native-fixture.config.json -- --jobs 1` | exit0，release1m53s；同源仅identifier/product/title隔离 | `s4-native-fixture-build.log`，session8183/chunkd88afb完整输出；chunk/linker警告保持 |
| 隔离包copy/version/hash和正式delivery unchanged复核 | exit0，copy相等，File/Product0.9.0；正式hash保持D432…ED | chunk0220c6，隔离manifest独立保存 |

### 包装脚本实际失败与再验证

- 初次PS7 MSI COM反射`InvokeMember(OpenDatabase)`返回类型不匹配，exit1（chunk0a9883）。尝试PS5运行时UTF8无BOM导致中文文件名乱码，exit1（chunk2def88），没有改app或资源名称。
- 改为PS7 direct COM `.OpenDatabase/.OpenView/.Execute/.Fetch/.StringData(1)`，单独实际输出0.9.0 exit0（chunk7927dc）；完整包装随后exit0，但`.Execute`的null结果进入数组造成4项，其中1null（chunk3b07f6）。
- 显式`$null = $taskView.Execute()`后完整重跑，最终exit0，额外hard assertion确保3artifact/5model（chunk858b32）；这些是证据脚本失败，不隐藏也不误称应用产品失败。

### 正式个人制品身份

目录`E:/project-funny/biji/src-tauri/target/deliveries/0.9.0-release`；`manifest.json`/`tracked-source.diff`仅ignored个人证据。此diff包含当时root文档状态，构建输入hash单列避免之后文档同步误认源码变化。

| 文件 | bytes | SHA256 | 实际版本 |
| --- | ---: | --- | --- |
| qingjian.exe | 16088064 | D432FBC637B796C2BF0300DB378D0FE136823E815E45DC16DCCC5511984444ED | File/Product0.9.0 |
| 晴笺_0.9.0_x64-setup.exe | 5888593 | 6C74FD62846DE2F5A8A10B9771E71B7A14FE4DE400A7F14FE95ACD683BF4A209 | File/Product0.9.0 |
| 晴笺_0.9.0_x64_zh-CN.msi | 7360512 | 5E899AD2457E4F6902FD458DD0402A16B084DD13E594F9D4522BC0129AA8B7F2 | COM Product0.9.0 |

三制品源/副本逐hash相等。FiveGLB SHA/bytes在同manifest完整记录，仍`awaiting_user_review`。没有公开上传或Git stage；旧0.8.1及D盘安装保持。后续隔离config构建会覆盖target/release单个产物，正式delivery已保存，禁止混用为正式发布。

### 同源隔离验证包

`E:/project-funny/biji/src-tauri/target/release-evidence/0.9.0/native-candidate-r2/qingjian.exe`，16088064bytes，SHA256 `E8D3DA2B5BE8AE4A68270A7E85BF05015C9D8C836A476985CECFB791542E8644`。File/Product0.9.0；identifier `com.zxl.qingjian.validation20261007`，用途仅root的提醒/业务隔离测试，非正式交付，`target/release/qingjian.exe`现为此隔离产物。正式交付必须从delivery0.9.0路径取，不混淆相同文件名/版本。

Node实验性stripTypeScriptTypes警告继续保留。S2 r2曾2MiB PWA资产构建失败与降面修补见其原报告；本S4 fresh最后build通过，不抹去前轮历史。

## coordinator_handoff_verifications

owner均为root coordinator；impl不执行真实平台测试。evidence_expected：实际新包ProcessPath/version/hash、主窗/桌宠截图与动作、SQLite backup和前后字段比较；conclusion_if_missing：只能称已构建候选，不称更新EXE已展示、效果修复或业务验收。

- 最小化主窗仍见独立pet、透明/拖动/自主行为/减少动态/休息/收起恢复/main关闭退出。
- 显式记录/待办入口与草稿阻塞；真实提醒显示8秒确认/每日一次、重载及隐藏休息不耗键。
- 五角色真实新GLB及造型判断；连续标题/主题滚动与简洁首屏。
- 真实旧SQLite只读备份及旧字段/position保持；安装器运行/安装卸载由root决定，未执行。
- README/CHANGELOG/Progress/Pet.Wardrobe/Release.Testing/Release.Verification0.9.0同步与Git流程由root承接。

## 未完成与回滚

正式bundle及identity、隔离no-bundle包保存已执行，真实EXE/UI/数据验收交root。没有源功能修改，未Git提交，未真实DB/原生操作。版本可直接回滚到保留的0.8.1元数据；release生成物保留历史目录，不覆盖旧交付或D盘安装，不自动回滚业务数据。

建议英文消息：`chore(release): prepare verified 0.9.0 desktop delivery`。

无新增跨功能事实。
