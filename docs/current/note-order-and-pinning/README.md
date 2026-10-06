# 记录排序与置顶规划

**需求描述**：
“这个拖拽好像被禁止了，没办法和其他的一块，拖拽移动，此外就是置顶这个功能是不是也可以搞一下”

**用户已选择**：调整排列顺序，重启保留（推荐）。提问中的定义为拖动抓手调整排列顺序、在重启后保留、置顶记录放在独立区域。

**创建时间**：2026-10-04
**当前阶段**：Archive/PR准备（保留原生专项交接）
**状态**：✅ 本轮声明范围已交付；原生专项待验收
**自动模式**：关闭；本次人工模式承接用户对功能实现、持久化和此前构建EXE的明确授权，不启用自动LW链。技术评审、迁移与独立实施审查仍执行，不把功能选择冒称已实现。

## 路由

新功能需要持久保存顺序和置顶，并涉及SQLite兼容，采用正式规划/验收流程；不是对旧装饰抓手的有界样式修补。旧soft-interaction-workbench、composer-writing-modes、luminous-note-map的Gate、失败与平台未测保持，不覆盖旧计划。

本轮工作区基线、原始状态及文件SHA保留在`C:/Users/ZXL/AppData/Local/Temp/qingjian-note-order-20261004/`。初始大量混合改动来源未全确认，禁止restore/reset/clean或混合提交。用户长期普通commit/push授权不解释为发布该混合范围。

## 里程碑

- [x] 代码库与业界调研
- [x] 方案决策与完整实现基线
- [x] 进入低层规划前检查
- [x] 低层方案与Gate-2评审
- [x] 代码实施
- [x] Root真实验证与独立实施审查（本轮声明范围）
- [x] 当前文档同步与体验制品核验

## 文档职责

research.md记录实际代码和官方行业依据；clarifications.md记录选择与唯一完整实现基线；lwplan.md承载实施锚点。未产出的文档不列作已完成。最终验收记录必须区分Web实际操作、Rust迁移测试、本机旧库保持、Windows烟测和平台未测。

最后更新时间：2026-10-04。



阶段事件：Readiness1 REVISE取消接口缺口→补充发布源码和modern基线→Readiness2 PASS（root383a6e全文复核13项），开始LW。两个报告和旧失败均保留；代码尚未实施。

阶段事件：原planner交付延迟，root两次中断并接管LW落盘（241行）；不是代码完成。原planner已确认无工具/产品阻断、无源码写入，其duration0/ref session建议保留。root全文读LW(b2a838 exit0)，Gate1存在性自检齐备，提交fresh composer_final_review Gate2；技术Gate未省略。此前未生成文件的Get-Item exit1空输出保持为诊断事实。

阶段事件：Gate2 R1 REVISE（取消片段/分流契约），root读正式报告33287f全文，按原地修订补normal canceled安全reset与canonical IMPL_DEFECT；R2 PASS，root04149d全文独立复核十字段/P1-P9/S0–S3与SHA257CB0…，允许实施。按既有Q0/Q1明确续行授权front/backend，技术Gate没有替代真实验收；两agent分别拥有前端与Rust文件，root承接UI/DB/EXE，fresh r4实施审查预读已就绪。代码开始实施，尚未验收。

阶段事件：front/backend源码落盘，root实际键盘焦点两次BODY红例、两条insertion清理错误，分别按同S2局部IMPL_DEFECT修正预期数据落地焦点与父layout先stop后子Provider真实destroy；首release主动中断exit1保留。最终root80/80全量、Web构建exit0，Rust9/9及check含tests exit0；真实双向/刷新/筛选70/置顶回收/草稿/深浅与取消、原8条完整可见字段保持已验。0.5.4最终Windows构建810e6e exit0、EXE/NSIS/MSI版本/hash和仅自有进程10秒烟测、真实旧8列库新增元数据且所有旧字段保持已核；受控终止exit-1不当正常关闭。完整root证据见[0.5.4验证](../../Release.Verification.0.5.4.md)，两份impl报告及原失败保留。提交fresh ReviewImpl完整最终对象，尚不冒称完整原生平台/MVP。

阶段事件：fresh [ReviewImpl r1](review_notes_impl_r1.md)协议/业务PASS，root ad5dad全文独立复核119行、十字段/双结论/作者体验与冻结SHA985EF385…，无当前源码阻断。本轮功能与体验制品按声明范围交付；源码未再改变，只同步当前文档状态。未测原生专项与旧feature继续current交接，此目录保留完整失败/恢复链；没有发布或清理来源未确认的初始混合工作区。
