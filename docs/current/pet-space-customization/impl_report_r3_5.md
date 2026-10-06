# 装扮短桌面应用栏分区补实施 R3.5

- feature_name: pet-space-customization
- impl_round: r3_5 / S6-A 同范围 IMPL_DEFECT 补修
- date: 2026-10-05
- owner: /root/wardrobe_layout_impl
- lwplan_version: S6/R3 PLAN_DEFECT-R1.1，SHA256 `C714ABA584F7E5ABE651C8808188D2B6D401698FBD60C2E55681DC63D080689E`，承接root本轮短桌面适配派单
- 真实缺陷输入：FINAL reviewer指出77CA源在500px高的有效rested状态仍红，wake focus341.587..379.187位于footer324.987..410.187后，portrait top-6.7375。root此前漏核激活后几何，动作成功触发不证明焦点/角色可见。以上为root派单记录，本agent未独立操作/读取浏览器媒体；历史源码报告与候选保持，不用R3.4或动作调用成功抵消该缺陷。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/pet.css` | 修改 | 仅现有max-height600/min-width721 media：copy按钮scroll-margin-bottom96→0；短桌面footer flex-basis为右配置列的剩余宽度，并margin-left:auto对齐右侧，避免全宽底栏覆盖左侧sticky互动 | S6-A、L1，低视口完整预览/互动和键盘可达 |
| 本报告 | 新增 | 记录activated/rested红、有限布局适配、实际身份/差量与静态自证 | S6-A证据合同 |

改前已实际核对preview列 `flex:0 0 clamp(220px,35%,340px)`、showcase gap24px，故同media footer使用 `calc(100% - clamp(220px,35%,340px) - 24px)`。普通高度和手机仍沿原全宽footer；stage152/画像112、完整简介/状态/互动/保存文案、全部其他CSS字节和整份TSX字节保持。无hide/clip、新状态、JS、依赖或业务。

已先向root发送拟改与S6 fullrow初值短分支适配说明再实施。未修改旧候选/制品，未构建/UI/native/Git/DB或递归委派；所有历史报告保留。

实际统一差量已全文读过：[css-repair.patch](C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005/ui-impl-r3-5/css-repair.patch)。新增规则仅位于短桌面media：

```css
.pet-showcase-actions button { scroll-margin-bottom: 0; }
.pet-wardrobe-submit { flex-basis: calc(100% - clamp(220px,35%,340px) - 24px); margin-left: auto; }
```

| 产品 | 改前 SHA256 | 本轮 SHA256 |
| --- | --- | --- |
| pet.css | 77CA75C7A1A4EE3D0D14E4F20E941F3287C2EDAF358418EAC77C127BEA255EBA | 4B4B7E58D6391355546613DD41CF5B30EB81FF4E9DE4E38D1DB4222AB8EC8862 |
| PetCompanion.tsx（只读） | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 |

## 对齐、自证与限制

- goal_lock_check：短桌面底栏改为右列、左侧角色互动避免被跨列遮盖；取消额外copy焦点滚动留白。该形态只为S6低视口可达目标补修，不新增能力，不能以CSS公式证明activated/rested状态通过。
- anti_goal_touch_check：after严格等于before单个现有短桌面media替换，其他CSS及整份TSX字节相同。正常高度/手机不变，无第二画像/裁切/数据变化。
- authoring_ergonomics_notes：复用既有breakpoint与同一列宽/间距公式，无JS测高或新的布局框架；全文status仍自然撑高。
- impl-safe验证：`python .../ui-impl-r3-5/check_repair.py`，工具 **7ca67b exit0**，完整stdout/exit与实际diff已读。evidence为 `C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005/ui-impl-r3-5/source-check.log/json`、`source-check.exit.txt`、`css-repair.patch`与改前两源副本；owner为本实施agent，conclusion_if_missing为不确认单media范围/公式输入身份/TSX保持。
- 本轮未build/test/UI/native，不用旧buildexit0声明新源通过，不宣称原rested/wake红已关闭。
- 本轮静态命令无失败/截断；前轮命令失败、构建警告、600/500红与漏核activated几何记录均保留。
- contract_drift_reports：**已显式上报root的同范围适配**：S6原全行footer是初值，本次根据activated/rested真实红按root授权仅短桌面分支限制至右列；主目标、正常高度/手机及状态/保存合同不变。没有静默改接口或新增能力；最终文档/验收口径由root同步。

| coordinator_handoff_verifications | 原因 / 承接 | evidence_expected | owner / conclusion_if_missing |
| --- | --- | --- | --- |
| 500/600px高实际全部rested/wake/greet焦点、正反Tab、角色完整可见与手机回归 | 真实UI非impl-safe，root先workspacedev复测 | 最终SHA对应activated前后画像/按钮/footer几何及截图、全焦点序列 | root；缺证不得称IMPL_DEFECT关闭，动作触发不替代几何 |
| 短桌面右列footer按钮/status全文、选项末组与正常高度/手机保持 | 布局适配需要真实浏览器，root承接 | 新完整status与控件/末项截图及computed几何 | root；缺证不放行该短分支 |
| 最后freeze新candidate、独立test/build、重建同源EXE与fresh审查 | 本轮禁止包装/构建，root在UI定稿后承接 | 新150/七差量/两最终SHA、完整日志exit、制品hash与fresh报告 | root；旧候选/制品不能充当新源证据 |

未完成/风险：实际flex换行、右列footer全文高度与低视口focus滚动需要root现场核验；源码静态自证不能关闭上述项。

回滚信息：**需人工介入**。只反向撤短桌面media本轮三声明差量，恢复copy96并删除该footer覆盖；保留所有其他修订、旧候选/报告及偏好，不整文件恢复。

英文提交建议：`fix(pet): separate wardrobe actions from companion controls in short windows`。

无新增跨功能事实。
