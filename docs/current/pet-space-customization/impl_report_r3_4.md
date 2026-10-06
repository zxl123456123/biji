# 装扮500px高桌面焦点留白补实施 R3.4

- feature_name: pet-space-customization
- impl_round: r3_4 / S6-A 同范围补修
- date: 2026-10-05
- owner: /root/wardrobe_layout_impl
- lwplan_version: S6/R3 PLAN_DEFECT-R1.1，SHA256 `C714ABA584F7E5ABE651C8808188D2B6D401698FBD60C2E55681DC63D080689E`
- 输入：root追加真实500px高压力验收。反馈72B2源在1100×600五角色休息/招呼可见；1100×500休息focus364.325..401.925在footer406.8之前，stage16..180.925完整。再ShiftTab至招呼产生额外滚动，招呼341.587..379.187而footer从324.987开始，仍被遮；媒体 `r3-2-1100x500-greet-failure.jpg`。上述是root派单的实测，不是本agent独立UI证据。按原S6完整互动/键盘目标修复新发现的红，不复用600px结果宣称500px通过。

## 变更事实与身份

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/pet.css` | 修改 | 仅已有max-height600/min-width721 media内 `.pet-showcase-actions button`的scroll-margin-bottom184→96px，减少短窗口焦点不必要的额外滚动 | S6-A、L1，低视口正反向Tab可达 |
| 本报告 | 新增 | 保留500px红与单值修订/静态自证；真实复测/最终发布移交root | S6-A证据合同 |

已读当前两源身份及真实规则，先向root发拟改消息再实施。stage152/画像112、手机选项margin184、其他全部CSS字节及完整TSX字节保持。没有修改文案/状态/业务/依赖/候选/制品，没有构建、UI、native、DB、Git或委派，历史报告与冻结发布源保持。

实际统一差量已全文读过：[css-repair.patch](C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005/ui-impl-r3-4/css-repair.patch)。唯一区别为上述184→96px值。

| 产品 | 改前 SHA256 | 本轮 SHA256 |
| --- | --- | --- |
| pet.css | 72B23110E31FDDE9E150CF51B8636AA865C550EB5DB31E7AF565E0242F55AC13 | 77CA75C7A1A4EE3D0D14E4F20E941F3287C2EDAF358418EAC77C127BEA255EBA |
| PetCompanion.tsx（只读） | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 |

## 目标、验证与未测

- goal_lock_check：目标是减少184px滚动留白引发的额外页面移动，同时保留原stage/copy可达。401.9+96<500是派单数值推断，不能证明浏览器将如何滚动；root必须复测原ShiftTab序列。
- anti_goal_touch_check：after严格等于before中唯一copy按钮margin值替换；其他CSS与TSX字节完全相同，无hide/clip/JS/新条件。
- authoring_ergonomics_notes：只改既有具体规则一个数值，保留可读的短视口策略，不新建滚动/测高框架。
- impl-safe记录：`python .../ui-impl-r3-4/check_repair.py`，**1d1866 exit0**，完整stdout、diff与exit已读。evidence为 `C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005/ui-impl-r3-4/source-check.log/json`、`source-check.exit.txt`、`css-repair.patch`；改前副本同目录。owner为本实施agent；conclusion_if_missing为不确认单值范围/身份/字节保持。
- 本轮未构建/运行UI，不能称新源构建通过、原500px焦点遮挡已关闭或新EXE交付。
- 本轮静态命令无失败/截断；所有前轮真实命令失败、构建提示及500px红记录保持，不由这条静态exit0抵消。
- contract_drift_reports：无；改前72B2/TSXDFFA与root输入一致，仍属S6尺寸/焦点同范围修订。

| coordinator_handoff_verifications | 原因 / 承接 | evidence_expected | owner / conclusion_if_missing |
| --- | --- | --- | --- |
| 500px高最后选项→反向Tab休息→招呼及正向选择，600px/五角色/普通与手机必要回归 | 真实UI非impl-safe，root在workspacedev先实际复测 | 最终SHA对应新几何/截图与正反焦点操作 | root；缺证不得称500px缺陷关闭 |
| 最后freeze新candidate、独立test/build、同源EXE及fresh审查 | 本轮禁止构建/包装，root最终源定稿后承接 | 新最终来源/完整日志exit/制品hash/审查报告 | root；原冻结源/EXE不可冒充新源构建 |

未完成/风险：实际焦点滚动与sticky footer包含块相互作用、最终验证和发布仍由root承接；本报告仅确认静态修订。

回滚信息：**需人工介入**。只将该copy按钮margin96反向改回184；保留所有其他修订/旧候选/历史证据，不整文件恢复或清偏好。

英文提交建议：`fix(pet): avoid excess focus scrolling in short desktop windows`。

无新增跨功能事实。
