# 0.9.0 发布与验证 · 2026-10-07

当前状态：首轮正式构建成功但原生显示旧界面，整体REVISE/PLAN_DEFECT；正在补启动缓存升级保障，首包不交付实用。

## 本轮原生失败与数据事实

首包实际FileVersion0.9.0、SHA `D432FBC637B796C2BF0300DB378D0FE136823E815E45DC16DCCC5511984444ED`、PID35096，精确delivery路径；真实WGC仍显示早期左侧栏界面，不能以版本号声称已更新。当前profile的Service Worker注册数据库确含tauri.localhost根及sw.js/workbox，缓存根因有文件事实支持，尚需修补后的原生升级闭环。

原库前后全表比较失败（notes3→4）：只读细查原3条正文/status/日期/pin等业务字段全相同，仅position随新增一条整体+1；没有原行丢失。额外记录可能来自启动期间用户输入，不擅自删除或还原。前库与现场后库均完整backup保留。AltF4正常退出0；首个OS caption点击因坐标位于窗外失败，随后正常快捷关闭生效，未抹去工具失败。

## 来源与范围

当前工作区 `E:/project-funny/biji`，基于 main/92b01bd，含简洁工作区、旧正文文字兼容、五角色个人GLB及独立桌宠。五版本元数据统一0.9.0；identifier/schema/备份格式保持。

私人模型不入Git；公开缺资产构建有原创/SVG回退。最终模型hash、EXE/NSIS/MSI身份保存在本机delivery manifest，本文件记录实际结果，不以计划代替现场。

## 本轮 root 自动验证

- `node --test --test-reporter=spec tests/*.test.mjs` exit0：155/155、fail/cancel/skip均0，完整输出已读。
- `cargo test --locked --manifest-path src-tauri/Cargo.toml --jobs 1` exit0：20/20（含11数据库用例），main/doc各0用例不算覆盖。
- Node类型擦除experimental与Rust linker warning保留；正式构建的Three大chunk警告仍存在。

## 数据保护

正式启动前SQLite只读backup及完整表/字段/行快照留在忽略的 `src-tauri/target/release-evidence/0.9.0/`。本次实际旧库为notes3/todos0/transactions0；不是沿用旧截图或0.8.1基线。前值semantic SHA为`e4adcef2ae54a0c5b79fdc6fd4bbea8dd0b930b96e5a570b05d2296cfb9ca1a5`。启动后比较尚待执行。

## 当前已有与待承接

S1实测首屏262px（原474.484）、More键盘/焦点、390深色与内容键盘滚动、连续输入/选区粗体/列表/草稿保存回填、旧块Backspace/CtrlZ/Y见[详细验证](current/desktop-pet-and-quiet-workspace/verification.md)。S2最终三模型为真实连续网格，S3提醒竞态已由实际hook时序红绿复现关闭；各包独立审查PASS不替代最终原生。

本轮正式EXE双窗、最小化、拖动、入口、提醒、收起恢复/关闭清理、路径/version/hash仍待现场。多屏混合DPI、触屏/真实IME/读屏、长期GPU/耗电、安装卸载、Win32异常故障组合未全面测，不宣称总体MVP或跨设备完成。

## 失败历史

保留先前误开D盘旧程序和physicalEscape中止；LW两项拖动/自有通知修订；Blender首次无python-exit-code但Traceback、NLA/group及中性闭眼修补；三模型PWA2MiB限失败后减网格；提醒确认早于publish返回的实际失败后有限等待修补；搜索/读取/截断和rustfmt缺组件。完整原输出/责任见本功能实施和审查报告，不把这些失败改写为通过。
