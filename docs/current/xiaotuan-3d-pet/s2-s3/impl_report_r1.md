# S2–S3 实施报告 r1

- feature_name：xiaotuan-3d-pet
- impl_round：r1（S2–S3）
- date：2026-10-06
- lwplan_version：`docs/current/xiaotuan-3d-pet/lwplan.md`，2026-10-06 版

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/Pet3DScene.ts` | 新增 | 懒加载 Three/GLTFLoader，验证根节点与 idle/happy，按既有外观设置晴小团节点，动作与 RAF 由 animate 控制，释放场景资源 | S2 |
| `src/Pet3DView.tsx` | 新增 | 管画布加载、尺寸观察、SVG 加载/失败回退和卸载 | S2 |
| `src/PetDevModelPicker.tsx` | 新增 | 开发模式本地 GLB 文件选择和失败提示 | S3 |
| `src/PetCompanion.tsx` | 修改 | 仅浮层与伙伴大展示改用三维优先图像槽；第三方正式角色、小图和记录时光保留 SVG；本机预览不写存储 | S3 |
| `src/pet.css` | 修改 | 画布、回退与开发预览尺寸样式 | S3 |

## 目标对齐

- goal_lock_check：晴小团两大入口使用原创 GLB；第三方角色只有开发模式手动选文件后才在伙伴大展示显示本机三维预览。
- anti_goal_touch_check：未改 `App.tsx`、`petAppearance.ts`、`petBehavior.ts`、笔记、SQLite 或备份；未把第三方 GLB 放入仓库。生产构建的动态开发入口已做静态扫描，原生制品待 root 核验。
- authoring_ergonomics_notes：节点名和 clip 名在场景模块集中校验；试穿、应用、手势仍位于原组件。GLB 资产由 S1 独立负责。

## impl-safe 验证

| evidence | owner | 结果 | conclusion_if_missing |
| --- | --- | --- | --- |
| `npm test`，退出码 0；137 tests、137 pass、0 fail | S2–S3 impl | 现有单元测试通过，含 pet appearance/behavior | 不能声称现有行为回归通过 |
| `npm run build`，在 S1 重导 GLB 后重跑，退出码 0；TypeScript 与 Vite 构建完成；Vite 对现有大 chunk 发出警告 | S2–S3 impl | 静态编译通过 | 不能声称可构建 |
| `git diff --check`，退出码 0，仅 CRLF 提示 | S2–S3 impl | 无空白错误 | 不能声称 diff 格式正确 |
| 扫 `dist`：`PetDevModelPicker`、本机模型预览文案和四个第三方 `.glb` 名均 False；`dist` 内仅 `xiaotuan.glb` | S2–S3 impl | Web 静态产物隔离成立 | 不能声称 Web 产物隔离 |
| GLB JSON 静态解析：`PetRoot` 与 Body/EarLeft/EarRight/LeafLeft/LeafRight/Beret/Halo/Scarf/Bow 节点存在；重导后恰好 `happy`、`idle` 两段，各含 PetRoot 位移/旋转与 ArmRight 旋转轨 | S2–S3 impl | 静态模型合同成立，播放效果仍待 UI 验证 | 不能声称模型合同已对齐 |

## coordinator_handoff_verifications

| 验证 | 移交原因 / 建议承接方式 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| Web 与 Tauri 实际画布、加载失败回退、切换/失焦/休息/拖动后的 RAF 和上下文释放 | 真实平台交互，非 impl-safe；root 实测 | UI 观察、性能/上下文记录 | root | 不能声称实际生命周期正确 |
| 开发模式逐个选择奶龙、吉伊、小八、乌萨奇 GLB，核对正面与 idle/happy | 依赖 S1 文件及人工视觉观察；root 实测 | 四角色分别截图和动作记录 | root | 不能声称四角色预览达标 |
| 原生安装包资源扫描 | 依赖 Tauri 实际构建；root 执行 | EXE/安装包资源列表 | root | 不能声称原生分发隔离 |

## contract_drift_reports

- S1 首次 `public/pets/xiaotuan.glb` 有 `happy`、`idle`、`happy.001`、`idle.001` 四段动画，动作轨拆分不符合同。已通知 root 和 S1；S1 重导后本轮重新解析，现恰好两段且每段三轨。合同漂移已消除；实际动作视觉效果仍待 root 验证。
- S1 的 Body/Beret/Halo/Scarf/Bow 是分组节点而非 mesh；运行时已按分组递归访问子网格。耳、叶与帽沿还共享部分 glTF 材质；运行时先按网格克隆材质，避免试穿配色串色。节点合同无需变更。
- 开发 object URL 在加载完成、失败、文件替换或页面卸载时 revoke；预览 canvas 已解析成 Three 场景后仍可继续显示。页面重挂载需要用户重新选择文件，符合会话内临时预览边界。

## 未完成与风险

- S1 动画轨合并已完成静态复核；本报告不宣称模型动作视觉效果已验收。
- 实际 WebGL/Tauri、四角色本机预览、视觉和性能未测，交 root 承接。
- 3D 画布初始化失败时以现有 SVG 回退；回退语义需真实 UI 观察。
- 回滚：可直接回滚上述五个代码文件的本轮差量，不影响存储数据；不得清理其他未提交文件。

建议提交信息：`feat(pet): render original 3d companion with svg fallback`
