# S1 模型资产补实施报告（r2）

## 基本信息

- `feature_name`: `xiaotuan-3d-pet` / S1 模型资产
- `impl_round`: r2
- `date`: 2026-10-06
- `lwplan_version`: `docs/current/xiaotuan-3d-pet/lwplan.md` 当前版（2026-10-06）
- `owner`: S1 模型实施 agent
- `reason`: 运行时试穿发现晴小团四个装扮组的父子节点均被 Blender 导出为零缩放，恢复父组仍看不到正确佩戴位置。r1 报告中“零缩放组可由运行时恢复”的判断已失效，以本报告为准。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `assets-source/pets/xiaotuan.py` | 修改 | `Beret/Halo/Scarf/Bow` 源与 GLB 保留单位缩放、正常子节点变换；只在导出后为裸模三视图临时隐藏装扮 | S1 缺陷修复 |
| `assets-source/pets/xiaotuan.blend` | 重生成 | 四装扮组及子网格保留可编辑原尺寸 | S1 缺陷修复 |
| `public/pets/xiaotuan.glb` | 重导出 | 装扮组与子网格 scale 均为 1，佩戴位置保留；`idle/happy` 剪辑不变 | S1 缺陷修复 |
| `assets-source/pets/previews/xiaotuan_{front,side,back}.png` | 重生成 | 保持未穿装扮的三视图预览 | S1 缺陷修复 |
| `assets-source/pets/model_manifest.json` | 重生成 | 更新文件大小及 SHA-256 | S1 缺陷修复 |
| `E:\pet-model-workbench\validate_models.py` | 仓库外修改 | 加入源及 GLB 装扮节点缩放断言 | S1 缺陷修复 |
| `E:\pet-model-workbench\check_xiaotuan_accessories.py` | 仓库外新增 | 反向导入正式 GLB、只显示画家帽与围巾并渲染实际位置 | S1 缺陷修复 |

## 目标对齐

- `goal_lock_check`: 保留五角色独立源/导出及两个动作，修正晴小团装扮可用性；第三方文件位置不变。用户已确认晴小团灰模轮廓可继续细化，四角色造型仍待视觉反馈。
- `anti_goal_touch_check`: 未修改运行时、外观存储、笔记、数据库或第三方发布边界；本轮无第三方资产入仓库。
- `authoring_ergonomics_notes`: 四装扮组在 `.blend`/GLB 中都以单位缩放存储。运行时在模型加载后按外观值隐藏不选中的父组，选中的父组保持或恢复单位缩放；三视图生成时的临时隐藏发生在保存源与导出之后。r1 对零缩放的说明不再适用。

## impl-safe 验证结果

1. `blender.exe --background --factory-startup --python assets-source/pets/xiaotuan.py -- --preview`：PowerShell 退出码 **0**，完整输出记录 `E:\project-funny\biji\assets-source\pets\xiaotuan-build.log`，含 `.blend` 保存、GLB 导出和三张 PNG 输出。`evidence`: 构建日志；`owner`: S1；`conclusion_if_missing`: 不能称源/导出已更新。
2. GLB JSON 静态检查：`Beret/Halo/Scarf/Bow` 父节点及所有直接子网格 `scale=[1,1,1]`，子网格有正常位移；`evidence`: 本轮解析命令输出与更新后的 `model_manifest.json`；`owner`: S1；`conclusion_if_missing`: 不能称装扮变换已恢复。
3. `blender.exe --background --factory-startup --python E:\pet-model-workbench\check_xiaotuan_accessories.py`：PowerShell 退出码 **0**，完整日志 `E:\pet-model-workbench\check_xiaotuan_accessories.log` 含 `ACCESSORY_REIMPORT_OK`；从**导出的 GLB**重新导入并渲染画家帽+围巾，图 `E:\pet-model-workbench\xiaotuan_beret_scarf_reimport.png` 显示帽位于头顶、围巾位于身体下部。`owner`: S1；`conclusion_if_missing`: 不能称真实导出内容的佩戴位置已核验。
4. `blender.exe --background --factory-startup --python E:\pet-model-workbench\validate_models.py`：PowerShell 退出码 **0**，完整日志 `E:\pet-model-workbench\validate_models.log` 五条 `VALIDATED`；新增断言覆盖 `.blend` 与 GLB 装扮缩放，五角色仍各有 `idle/happy` 两段、每段 3 通道。`owner`: S1；`conclusion_if_missing`: 不能称全量模型合同回归通过。
5. 验证脚本初次仅隐藏装扮父 Empty，Blender 渲染仍显示其子网格，首张反向导入图同时出现星环和蝴蝶结；脚本改为递归隐藏子节点并重新渲染，最终图只显示画家帽与围巾。此为验证脚本行为差异，正式 GLB 装扮变换未再修改。

## coordinator_handoff_verifications

| 验证项 | 移交原因与建议 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| Web/Tauri 试穿画家帽、星环、围巾、蝴蝶结 | 实际运行时 UI 测试不属 S1 impl-safe；根任务逐件检查，并检查未选装扮不出现 | 两入口 UI 截图、试穿/应用观察 | root | 仅称 GLB 结构与反向导入已验证，不称应用试穿通过 |
| 四角色视觉及动作审美 | 人工视觉反馈仍待用户 | 逐角色三视图与动作观察记录 | root / 用户 | 保持灰模待验收 |

## 未完成、风险与回滚

- 当前 `.blend` 源默认同时展示四种装扮，便于编辑；运行时必须在首次绘制前按外观值隐藏未选组，否则会同时显示。已向运行时实施方明确通知。
- 画家帽+围巾反向导入位置已视觉检查；星环与蝴蝶结只做变换静态检查，应用内四种装扮仍需 root 验收。
- `contract_drift_reports`: 无方案路径漂移；r1 的“零缩放组”实现与运行时可恢复预期不符，已显式上报 root 和运行时实施方并修正。
- 回滚：`可直接回滚` S1 原创资产与脚本；第三方本机目录仍需人工管理。

建议英文提交消息：`fix(pet): preserve Xiaotuan accessory transforms in GLB`
