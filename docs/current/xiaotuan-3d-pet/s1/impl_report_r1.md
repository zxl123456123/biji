# S1 模型资产实施报告（r1）

## 基本信息

- `feature_name`: `xiaotuan-3d-pet` / S1 模型资产与动作
- `impl_round`: r1
- `date`: 2026-10-06
- `lwplan_version`: `docs/current/xiaotuan-3d-pet/lwplan.md` 当前版（2026-10-06）
- `owner`: S1 模型实施 agent

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `assets-source/pets/xiaotuan.py` | 新增 | 原创晴小团 Blender 可再生源；独立身体、双耳、双叶、四种装扮分组和 `idle/happy` 两动作；合并 Blender 分对象 NLA 为 GLB 两剪辑 | S1 |
| `assets-source/pets/xiaotuan.blend` | 新增 | 晴小团可编辑网格、材质、动作源 | S1 |
| `assets-source/pets/previews/xiaotuan_{front,side,back}.png` | 新增 | 三视图视觉反馈证据 | S1 |
| `assets-source/pets/model_manifest.json` | 新增 | 记录源、导出、剪辑、节点、三视图的大小与 SHA-256 | S1 |
| `public/pets/xiaotuan.glb` | 新增 | 应用内原创模型；正好 `idle/happy` 两剪辑，各含 `PetRoot` 与 `ArmRight` 通道 | S1 |
| `E:\pet-model-workbench\build_models.py` | 仓库外新增 | 四角色本机建模脚本，不进入公开制品 | S1 |
| `E:\pet-model-workbench\{nailong,chiikawa,hachiware,usagi}\` | 仓库外新增 | 每角色 `.blend/.glb`、正侧背 PNG、`model_manifest.json`、`build.log`，只作本机灰模和开发预览 | S1 |
| `E:\pet-model-workbench\validate_models.py` | 仓库外新增 | 后台重开 `.blend` 并解析全部 GLB 合同的重复校验脚本 | S1 |

没有修改 `src/`、存储、笔记数据或 Tauri 配置。另见并行实施方产生的工作区变更，S1 未接管或回滚它们。

## 目标对齐

- `goal_lock_check`: 五个独立可编辑 `.blend` 和五个可解析 `.glb` 已产生；晴小团正式资源只含原创文件；四角色仅在 E 盘本机目录。晴小团灰模轮廓收到用户“保留轮廓，继续细化”的反馈；四角色视觉反馈仍待用户。
- `anti_goal_touch_check`: 没有将第三方模型、截图、脚本或贴图放入仓库、`public/`、`dist/`；未改 `luma-pet-appearance` 四字段，也未碰笔记/SQLite/备份。三维侧背造型按单视图资料原创补全，不能称官方准确。
- `authoring_ergonomics_notes`: `.blend` 保留有名称的分组及 NLA；晴小团 `Body/EarLeft/EarRight/LeafLeft/LeafRight/Beret/Halo/Scarf/Bow` 节点可直接找。装扮节点以零缩放导出，运行时负责显隐/恢复缩放；生成脚本可再导出，但使用后必须重算 manifest。

## impl-safe 验证结果

1. 晴小团后台生成：`blender.exe --background --factory-startup --python assets-source/pets/xiaotuan.py`，PowerShell 捕获退出码 **0**，尾部显示 GLB 完成导出与 Blender 正常退出。`evidence`: `assets-source/pets/xiaotuan-build.log`；`owner`: S1；`conclusion_if_missing`: 只能称脚本已写，不能称模型已生成。
2. 四角色后台生成：逐角色执行 `blender.exe --background --factory-startup --python E:\pet-model-workbench\build_models.py -- <character>`；四次 PowerShell 输出均为 `exit=0`。`evidence`: 各自 `E:\pet-model-workbench\<character>\build.log`；`owner`: S1；`conclusion_if_missing`: 对应角色不能称已生成。
3. 全量结构检查：`blender.exe --background --factory-startup --python E:\pet-model-workbench\validate_models.py`；实际输出五次 `VALIDATED`，晴小团 36 节点，其余 19/18/19/19 节点；五角色每个 GLB 都恰好 `idle`、`happy`，各 3 通道且命中 `PetRoot` 与 `ArmRight`；Blender 可重新打开五个 `.blend` 并读取 NLA。`evidence`: 本轮命令输出、五个 `model_manifest.json`；`owner`: S1；`conclusion_if_missing`: 不能称剪辑、源可编辑或 GLB 合同通过。
4. 曾有两次本地实施失败：首次四角色命令在输出目录创建前重定向日志，PowerShell 报路径不存在，随后先建立目录并成功重跑；首次验证脚本把 Blender 对象集合误当名称集合，触发 `AssertionError`，修正为 `.keys()` 后完整重跑。Blender 的脚本异常仍可能使进程退出码为 0，因此本轮判断同时检查了五个 `VALIDATED` 输出与 manifest 文件。两次失败均未作为成功证据。
5. 反向导入检查：`blender.exe --background --factory-startup --python E:\pet-model-workbench\import_check.py`，PowerShell 退出码 **0**；完整日志 `E:\pet-model-workbench\import_check.log` 含五条 `IMPORTED`，每次 Blender glTF 导入器都建立 `PetRoot` 与 `happy/idle` 动作。`evidence`: 完整日志；`owner`: S1；`conclusion_if_missing`: 不能称合并剪辑后的 GLB 可由 glTF 导入器读取。

## coordinator_handoff_verifications

| 验证项 | 移交原因与建议 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 晴小团三视图及动作观感 | 视觉/动作审美是人工平台验收；根任务用 Blender GUI/应用查看并请用户反馈 | 三视图、动作播放截图或明确反馈 | root / 用户 | 只称技术样本，不称造型定稿 |
| 四角色三视图及动作辨识度 | 第三方官方资料没有完整侧背/绑定；根任务逐角色视觉核对 | 四角色分别的三视图反馈及动作观察 | root / 用户 | 四角色保持灰模待验收 |
| 浏览器、Tauri 加载与第三方资产发布隔离 | 真实 UI/安装包不属于 S1 impl-safe | 实际两端观察、`dist` 与安装包扫描 | root | 不称运行时或发布验证通过 |

## 未完成与风险

- 五角色动作是低面数短循环；程序检查证明通道存在，尚无真人观看动作播放的验收记录。
- 晴小团轮廓经用户确认继续细化，但材质、装扮及动作观感尚待应用内验收。
- 四角色正面目前是可区分的三维灰模，脸部仍有通用化趋势；奶龙头顶角、小八蓝色额纹和所有侧背细节需按用户反馈继续打磨。任何第三方造型反馈均不改变再分发授权限制。
- 模型以独立几何与哑光材质表达，未采用第三方下载模型。
- `contract_drift_reports`: 未发现 lwplan 与 S1 资产路径或节点合同的阻塞漂移。发现 Blender 默认将两对象 NLA 导成 `happy/idle` 与 `.001` 剪辑；已在导出脚本内合并为准确两剪辑，并向 root 与运行时实施方上报。
- 回滚：`可直接回滚` S1 的原创源、预览与 GLB；四角色仓库外目录需人工保留或清理，不能随 Git 回滚。

建议英文提交消息：`feat(pet): add editable Xiaotuan 3D model and animation asset`
