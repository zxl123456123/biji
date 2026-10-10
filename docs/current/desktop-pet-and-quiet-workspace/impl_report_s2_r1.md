# S2 实施报告：本机模型与共享展示

- feature_name：desktop-pet-and-quiet-workspace
- impl_round：S2 r1
- date：2026-10-07
- lwplan_version：2026-10-07 PLAN_DEFECT-R1.1–R1.3，Review(LW) r2 PASS；执行 §5。
- 状态：源码及本地格式/构建验证已执行；真实 WebGL、原生桌宠与造型满意度交 coordinator / 用户，不声称整个功能交付完成。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `.gitignore` | 修改 | 精确忽略 `/src/local-pet-models/`，五个个人 GLB 不进入 Git | S2.4，G1/N3 |
| `src/petModels.ts` | 新增 | 按实际 glob 文件解析五角色生产 URL；原创缺本机资产用公开旧 GLB，四角色缺失返回 null | S2.4 |
| `src/PetFigure.tsx` | 新增 | 唯一 GLB/SVG 入口，有限 activity、DEV preview、实际装饰名单回调；无 App/store 进口 | S2.5 |
| `src/PetPortrait.tsx` | 新增 | 从 PetCompanion 原样移动 SVG 正文，仅调整类型/组件进口；无反向循环依赖 | S2.5 |
| `src/PetCompanion.tsx` | 修改 | 浮层/展示都用 PetFigure；实际缺失节点过滤对应头饰/配件/组合，缺整组说明；加载失败给 SVG 回退状态；保留 PetPortrait 导出兼容现有调用 | S2.5–6 |
| `src/Pet3DView.tsx` | 修改 | 模型实例切换重置 ready/failed；异步取消继续 dispose；回调返回真实有限节点；activity 传入 Scene | S2.6–7 |
| `src/Pet3DScene.ts` | 修改 | PetRoot 必需；真实 rest/happy/walk/look clip 选择且缺可选 clip 回 idle；休息首帧静态；渲染/动画更新上限 30fps，dt≤0.1s；每 mesh 材质克隆隔离，第三方仅染饰品；源材质与失败加载资源释放 | S2.6–7 |
| `E:/pet-model-workbench/refined/2026-10-07/build_refined.py` | 新增本机文件 | 五角色可编辑生成脚本，保留旧目录/原创几何；奶龙无熊耳、大头/宽吻/绿瞳/高光/白肚/趾尾，小八贴面蓝额/收尖猫耳，吉伊圆耳/小嘴，乌萨奇长耳/鼻嘴；四饰品 + 四完整动作 | S2.1–3 |
| 外部 refined 的五 `.blend/.glb`、20张预览、五 manifest/总 manifest | 新增个人候选 | 真 GLB 重导后渲染前/侧/背/220×260预览；每 clip 21 channels；本体中性、休息首帧闭眼；来源/版本/hash/实际变化样本完整 | S2.1–3 |
| `src/local-pet-models/{角色}.glb` | 忽略生成物 | 从外部最终候选复制；五个文件与 dist 哈希一致；不 stage | S2.4 |

未改 App、main、业务存储、Rust、版本元数据和本轮全局布局；S1/S3 的并发差异不归本报告。pet.css 本包未修改，现有 canvas 样式可复用。

## 目标对齐

- goal_lock_check：G1 的五角色正式生产加载及真实动作落地；G3 的个人资源隔离、来源和 hash 有证据。独立窗由 S3，最终 EXE 由 S4，不能用本包构建替代。
- anti_goal_touch_check：无正文插入、商城/养成/新待办、全局监听、AI 上传、第二 App、数据 schema/偏好写入；没有上传私有模型或安装器。
- authoring_ergonomics_notes：URL 映射仅固定五角色；装饰名单仅 Beret/Halo/Scarf/Bow，没有新增能力注册框架。已有 PetMood 未扩大；activity 限 walk/look。源码不带外部绝对模型地址。

## 真实 impl-safe 验证

owner 均为 S2 impl。本轮实际执行并读取退出状态，最后源码没有改动后的未跑构建。

1. `Blender --background --python-exit-code 1 --python E:/pet-model-workbench/refined/2026-10-07/build_refined.py -- {角色}`：最后五角色均 exit 0；每日志包含 export finished、glTF import finished、四张 render Saved、REFINED_CANDIDATE，无 Traceback。完整日志留外部 `{角色}-build.log`；这是 headless 本地重复导出/重导/静态图，不是 Windows 桌宠实测。conclusion_if_missing：无重导或缺单角色输出只能资产候选未验证。
2. `Python312/python.exe .../verify_candidates.py`：exit 0。逐 GLB header/length、PetRoot/四饰品/Blink 节点、四动作每个 21 channels、非 rest 实际变化 targets、rest 首帧眼 scale `0.045`、基态 eye/root scale1、20预览存在断言。实际 samples 来自 BIN accessor，不只检查 clip 名。证据外部 `manifest.json` / 五 manifest / verifier。conclusion_if_missing：不得称真实动作或中性基态正确。
3. 公开无私有目录 `npm run build`：exit 0，2527 modules，dist 无四角色本机 GLB。仅对本包生成目录确认绝对路径后 Move-Item 到已检查的新备份位置，用 finally 恢复，没有 git clean/reset 或移走他人文件。证据本轮 tool 完整输出；原创公共 GLB / SVG 路径由实际 resolver 保持。conclusion_if_missing：不得称公开缺资产构建兼容。
4. 恢复最终五候选后最新 `npm run build`：exit 0，2532 modules；dist 列出 xiaotuan 1,096,860、nailong 1,708,284、chiikawa 1,339,904、hachiware 1,367,016、usagi 1,418,548 bytes。已含 S3 当时落盘入口，模块计数不是 S2 单独增量。Vite 三维 chunk 大于 500kB 警告保留，未扩大为无关优化。conclusion_if_missing：不得称个人生产模型已打包。
5. 五 source / manifest / dist SHA256 比对：exit 0，逐角色 dist 恰好一个 GLB，全部一致。`git check-ignore` 输出五个路径，`git diff --check` 最后 exit 0；LF/CRLF 警告保留。conclusion_if_missing：不得称本机模型来源或 Git 隔离已核实。
6. 最后单独 `npm test`：exit 0，完整输出已读，141 tests / 141 pass / 0 fail / 0 skipped。一次同 research 合并读取被截断，随后单独 fresh 重跑读完整，不以截断输出当完整检查。conclusion_if_missing：只报告代码变更，不能报现有单测通过。

## 五候选最终身份

| 角色 | SHA256 |
| --- | --- |
| xiaotuan | 8812e06b67801420cb0fccac269e5788b47d9360908b9c210049c96ba25ef24f |
| nailong | 76182594e45beb918eb6aa0f1edd1f98e32a451ea63e9da461cc51d98e89d472 |
| chiikawa | af8d0bf8cce8fbb75a709efd336a5aeb12692ebb1ab01168d76d0f76aae60177 |
| hachiware | 236db8dba8cf297b452c67179ed5ea564205f4fc4b6e1fa142303c0c72266aa2 |
| usagi | 92a6555272128bf5d37699d9dc2b4eea34338a208963eaf4c6ab1452fb9c15ff |

manifest 明示 `visual_status=awaiting_user_review`、本机个人候选及无官方背面参考的局部补完。旧 `.blend`、公开原创 GLB 和旧生成脚本未覆盖。

## 失败与处理（不省略）

- 第一次 Blender 的 `nla_tracks.clear()` 不存在：出现 Traceback，但 Blender 未加 python-exit-code 的进程仍 exit 0。未判成功；改成逐 track remove，所有后续命令加 `--python-exit-code 1` 并重跑五角色。
- 原创复用原脚本时 group 同名覆盖，`parent expected Object, not tuple`，strict Blender exit 1。保存/恢复本候选 helper，五角色重新跑，exit 0。
- 独立 BIN/JSON 验证第一次 exit 1：Blender 导出把最后 rest 的闭眼 scale 留到静态节点。新增按作者 base 中性重写控制节点；可编辑 blend 在导出后 mute 动作轨道并恢复中性保存，轨道仍可单独开启编辑。重导重渲后 verifier exit 0；不能省掉这次失败。
- `git diff --check` 曾 exit 1（PetCompanion 新 EOF 空行）；只去掉自己新增空行，最后 exit 0。
- 探索 `src/pet.ts`、`tsconfig.app.json` 两个实际不存在文件，以及 PowerShell `rg src/*.test*` 通配路径失败；实际入口随后读 petAppearance/petBehavior、tests 目录和实际 build。未将探索失败当测试失败，也未改不存在文件。
- root 看第一奶龙预览提出光照暗/直线嘴：实际改 Bézier 嘴弧和本机真实 area fill/world 后重导重渲，未使用图像补画。效果是否最终满意仍由用户判断。

## coordinator_handoff_verifications

| 待验证 | 移交原因 / owner | evidence_expected | conclusion_if_missing |
| --- | --- | --- | --- |
| 五角色正式 WebGL ready、模型切换、真实装扮、happy/rest/walk观感 | 浏览器/原生平台非 impl-safe；coordinator | 实际每角色 canvas ready 与截图、切换无旧像、第三方身体色保持/饰品实际变化 | 只能报告格式/构建，不能称实际展示正确 |
| 缺饰品自选 DEV 模型、contextlost、SVG失败回退 | 真实 WebGL/输入；coordinator | 部分节点过滤、无虚假组选项、失败提示/画布释放/重试或换角色实际表现 | 只能称静态路径存在，不能称现场容错已验 |
| 五前侧背及220px造型质量 | 视觉最终满意是用户；coordinator展示 | 外部真实图片与最终EXE尺寸效果，用户反馈 | 不称造型定稿或复刻完成 |
| 独立透明窗、30fps/休息资源策略、减少动态/隐藏 | S3/S4 实际窗口；coordinator | 实际进程/动作/清理观察及调用采样 | 本包不称原生窗或长期资源性能验收 |
| README/CHANGELOG/Project.Progress/Pet.Wardrobe/Release文档同步 | S4 root统一当前事实 | 真实验证口径同步到用户文档 | 未同步不发布当前能力结论 |

## contract_drift_reports / 未完成与风险

- 无范围或接口漂移；初次提出 `onLoaded` 两 bool 被 root 纠正为实际四节点有限名单，最终按 LW 原契约实施，不扩大能力系统。
- 本包不重做上游角色授权论证，也不上传私有角色资源；个人 dist/SW 含五资源，不能公开发布该包。
- `look` 没有独立动作，回 idle；`blink` 嵌在 idle/happy/walk真实眼 scale keyframes，未声称单独 blink clip。walk 为根/脚/臂对象关键帧，没有伪称骨骼 rig。
- 多屏、透明、窗口移动和提醒均不在本包完成口径内。视觉满意、场景 actual renderer和失败路径仍须 root 验证。

## 回滚与提交建议

可直接回滚 S2 代码独立提交；仅移除本包 local GLB 即恢复公开原创/SVG路径，无数据迁移。保留原目录与公开原创，不必数据恢复。

建议英文提交：`feat(pets): use refined local models in shared renderer`

## 跨功能事实（待确认）

- [2026-10-07] Blender Python 异常默认仍可能退出 0；可重复构建脚本必须指定 `--python-exit-code 1` 并同时核对日志/预期输出。
- [2026-10-07] 仅检查 GLB clip 名及重导成功不足以证明中性基态；NLA 导出可能留最后 clip 姿态到静态节点，需要检查 BIN 首帧样本与节点默认 transform。
