# 装扮短桌面完整画像补实施 R3.6

- feature_name: pet-space-customization
- impl_round: r3_6 / S6-A 同范围尺寸补修
- date: 2026-10-05
- owner: /root/wardrobe_layout_impl
- lwplan_version: S6/R3 PLAN_DEFECT-R1.1，SHA256 `C714ABA584F7E5ABE651C8808188D2B6D401698FBD60C2E55681DC63D080689E`，承接root本轮低视口尺寸派单
- 真实缺陷输入：root实测4B4B源actual1085×500，rested/wake控件已避开footer（栏left418.8，焦点left54/148..232），但逆向greet时portrait bbox top-6.7375，装饰最上缘被视口裁；媒体 `r3-5-workspace-500-rested.jpg` 与 rootfinalDevProof。以上来自root派单，本agent未操作浏览器或独立读取媒体，不将控件可达等同完整画像通过。

## 变更事实与身份

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/pet.css` | 修改 | 仅已有max-height600/min-width721 media的stage min-height152→136px、pet-touch112→96px，降低同容器底端压力以保留完整画像/头饰 | S6-A、L1/L2，低视口完整画像及互动可达 |
| 本报告 | 新增 | 保留真实画像bbox红、两尺寸差量/身份及静态自证，UI与最后构建交回root | S6-A证据合同 |

改前实际读规则/核两源SHA，先向root发拟改再执行。rightfooter calc/margin-left、copy margin0、普通高度与手机、其他全部CSS字节及完整TSX字节保持。未隐藏/裁切内容、加JS/业务/依赖或改变状态。未build/test/UI/native/Git/DB/委派，未改任何候选/制品或历史报告。

实际统一差量已全文读过：[css-repair.patch](C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005/ui-impl-r3-6/css-repair.patch)，仅该现有media两尺寸数值变化。

| 产品 | 改前 SHA256 | 本轮 SHA256 |
| --- | --- | --- |
| pet.css | 4B4B7E58D6391355546613DD41CF5B30EB81FF4E9DE4E38D1DB4222AB8EC8862 | 0357631935DFCFEB556EAC556658B60A51F9076B2FE06C7B7823CDF7B0A64D6A |
| PetCompanion.tsx（只读） | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 |

## 对齐与自证

- goal_lock_check：只减少短桌面画像/装饰占用，目标为同一S6完整viewBox/头饰且原activated/inverse序列可达；尺寸减16px不是浏览器bbox>=0证据，必须root现场复测。
- anti_goal_touch_check：严格selfcheck确认after精确等于before的两尺寸替换，全部其他CSS/整份TSX字节相同，无hide/clip/JS或状态变更。
- authoring_ergonomics_notes：既有低视口规则内两个具体值，无新媒体条件或抽象；完整文字、保存栏及角色动作政策保持。
- impl-safe记录：`python .../ui-impl-r3-6/check_repair.py`，**9053f1 exit0**，完整stdout/exit/diff已读。evidence位于 `C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005/ui-impl-r3-6/`：source-check.log/json、source-check.exit.txt、css-repair.patch及改前两源副本；owner为本实施agent，conclusion_if_missing为不确认两尺寸范围/身份/TSX保持。
- 本轮无命令失败或截断；前轮命令失败/构建提示、控件/画像红均保留，不以本次静态exit0宣称任何UI缺陷关闭。
- contract_drift_reports：无新增漂移。改前4B4B/DFFA符合派单，本次沿R3.5已显式承接的短桌面适配只调两个初值；同范围S6目标/状态合同保持。
- 本轮未运行构建或实际症状；不借旧源build/EXE为新源断言通过。

| coordinator_handoff_verifications | 原因 / 承接 | evidence_expected | owner / conclusion_if_missing |
| --- | --- | --- | --- |
| 原全activatedstate+inverse序列、500/600高完整画像/头饰bbox、控件/右栏/手机回归 | 真实UI非impl-safe，root先dev现场复测 | 最终SHA对应全状态几何，完整portrait bbox>=0及截图/焦点序列 | root；缺证不得称画像红关闭 |
| 最后freeze新candidate、独立test/build、同源EXE与fresh审查 | 本轮禁止构建/包装，由root定稿后承接 | 最终两SHA、新150/七差量、完整日志exit/制品hash与fresh报告 | root；旧源/候选不充当新源交付证据 |

未完成/风险：实际画像上缘/头饰及activated/inverse焦点几何、最终命令和发布仍需root；本报告仅确认静态差量。

回滚信息：**需人工介入**。只反向将短桌面两尺寸136/96恢复为152/112，保持rightfooter/margin0及所有其他修订，不整文件还原/改旧候选/清偏好。

英文提交建议：`fix(pet): fit the complete companion preview in short desktop windows`。

无新增跨功能事实。
