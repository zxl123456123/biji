# 本轮失败证据清单 r1

2026-10-05。范围是已有失败证据聚合，未重跑产品命令，未操作产品、stage、UI、DB/native或Git。详细事件、来源身份及原始14项保持在[完整JSON](C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004/root-verification-failures-r1.json)；本报告不是最终验收结论。

已记录 47 项事件（含原始14项及范围/取证限制，**不是失败命令总数**）、2类警告。历史Q1待答已由用户答复覆盖：工作区保留月历，本轮0.7 EXE只宠物和空间配置。旧原文和所有旧失败日志保持。

| 实际失败或发现 | 原证据 / 退出码 | 恢复与结论边界 |
| --- | --- | --- |
| S1相同draft/applied仍显示试穿中 | f19b6a源核；[S1报告](s1/impl_report_r1.md) | 四字段差异派生修正，包级测试/build重跑；不是本清单重新跑UI |
| S2生产cube亮度两档，断言要求三档 | 663793 exit1；s2-unit-r1.log：18/19、2!==3 | 修生产±0.5阈值，保持断言；19/19重试，CPU不代替GPU |
| S4混合工作区20条SpatialNoteMap TS诊断 | ce30fb exit1；s4-build-r1.log/.exit | root核实外部探索正在开发；保留失败。后来root-workspace-build-r1.log/.exit=0是独立候选 |
| 设置伙伴名字固定晴小团 | root实际报告；[S4报告](s4/impl_report_r1.md) | 必需petName链修正，r2仅叠加5处Settings替换 |
| r1空间20帧space-live字节全同 | 423d4c exit1；root-space-frames-r1.json | 动态取证未达，该次未生成space GIF；原因未确认 |
| 18次PW旋转帧space-orbit字节全同 | d2c233 exit1；root-space-orbit-frames-r1.json | 动态取证未达，该次未生成space GIF；原因未确认，不能归因真实GPU失败 |
| 初生cube clickMISS、编辑按钮deadline | root本任务实际报告 | 后续fresh picker定位click成功；初始失败原因未确认 |
| r2 preflight拒绝App由F456变514 | 559b3f exit1；packaging-r2-preflight.log/.exit | 严格守卫保留；root窄授权、唯一hidden差量逆比对后重新preflight/freeze/150源重核 |

工具与产品事件分开：root的hasFocus只读代理TypeError、角色按钮未限定group重复、错误group“选择角色”、错误.spatial-customization读aria为空、S4以“继续动态”找不到实际“开启动效”按钮，均标工具/选择器错误；fresh结构/AX恢复不抹掉初始失败。不能据这些错误声称产品焦点、ARIA或动效失败。

初预审及包装的所有失败留在JSON：缺文件/错误binding/协调消息失败；官网/商品参考超时、404、无像素与研究脚本EOF；3dd320/5e3e04/0167fb并发身份检查退出1；1e2850换行字节逆比对退出1；S2正则引号/空键JSON/过宽Cargo归一化审计退出1；S4 Windows ESM与缺typescript两次退出1；包装rg IO错误（shell exit0不等于子命令成功）、62ff1f引号SyntaxError、c0ad2b终端编码退出1；文档8b545f混合换行匹配退出1。合并读取截断/身份省略和审查合同缺口也保留，分别注明补读或修订，不冒称产品命令失败。

已全文读过root r2既有日志：[测试](C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004/root-release-test-r2.log)的118/118、fail0及.exit=0；[构建](C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004/root-release-build-r2.log)及.exit=0。仍保留压缩后>500kB警告和两次Node stripTypeScriptTypes ExperimentalWarning；它们不证明长期耗电、GPU或native结果。本次只验证证据结构/来源/帧bytes；现有20/18帧各唯一SHA数写在JSON，未重新截图。

**native在派单时仍进行中；此清单未读其活动日志、未预判。** 最终r2现场、native/真实库/fresh Review(Impl)结果由root补正；不把静态/CPU、r1、混合工作区或恢复选择器当这些结果。

English conventional commit建议：`docs: preserve verification failures and evidence boundaries`。
