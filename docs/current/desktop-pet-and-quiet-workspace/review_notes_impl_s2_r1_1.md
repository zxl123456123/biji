# S2 实施后独立审查（实施第 1 轮 / 审查第 1 次）

- review_target: impl
- impl_round: S2 r1
- review_seq: 1
- review_date: 2026-10-07
- 输入报告：[impl_report_s2_r1.md](impl_report_s2_r1.md)
- 方案：当前 `lwplan.md` §5、Review(LW) r2 PASS、`clarifications.md`。
- 协议结论：PASS
- 业务结论：PASS
- 放行范围：S2 源码与本机格式/构建审查允许继续整合；不代表整个 feature 可归档或发布，实际 WebGL / Windows / 最终造型验收仍由 coordinator 承接。

## 强制状态字段

| 字段 | 结果 | 依据 |
| --- | --- | --- |
| goal_lock_alignment | aligned | 五角色本机生产 URL 与真实 GLB、共享渲染入口及实际装饰检测落实；独立窗和最终 EXE 属 S3/S4，未冒称本包已完成 |
| anti_goals_touched | none | 本包无正文装饰、新业务存储、网络上传、全局输入监控或第二 App |
| authoring_ergonomics_check | pass | 资源解析、SVG 正文、renderer 职责直接，接口限已有 mood、两种 activity、四个装饰名字 |
| declaration_readability_check | pass | 固定 glob 和枚举；没有 registry、通用 capability 总线或新配置框架 |
| plan_defect_checkpoint_recommended | no | 未见需要改变本包目标、任务结构、验收或回滚的缺陷 |
| plan_defect_checkpoint_reason | 无触发 | 实际接口及资源处理与 §5 对齐；运行环境证据已按计划移交 |
| impl_safe_validation_check | pass | reviewer 本轮独立 npm build / npm test / GLB JSON+BIN / hash / ignore / diff 检查，见下文 |
| coordinator_handoff_check | pass | 实施报告逐项列出真实 canvas、装饰/切换/失败、视觉、原生性能、文档交接及缺证据限制 |

## 实际实现复核

1. `src/petModels.ts:3–9` 按实际存在文件 glob；公开原创 URL 为回退，四角色缺失返回 null，经 `PetFigure` 直接 SVG，不请求虚构 URL。生产没有外部 E 盘路径；DEV 覆盖仅在 DEV 开启。
2. `src/PetFigure.tsx:9–20` 是共同入口，角色及 URL 作为 key，缩略仍用 SVG。独立对比 `git show HEAD:src/PetCompanion.tsx`，抽出的 `PetPortrait` 函数正文逐字符相同，避免循环依赖且不扩大重构。
3. `Pet3DView.tsx:18–65` 初始化重置 ready/failed；旧异步 scene 取消后立即 dispose。context lost 断开 ResizeObserver、dispose、置 null、显示 SVG，迟到异步对象同样释放；回调从 latest ref 读取，不回写旧角色状态。
4. `Pet3DScene.ts:73–104` 实际更新与绘制以 1000/30ms 节流，dt 上限 0.1；停动画取消 RAF。rest 使用实际 rest 首帧静态采样，无可选 clip 则 idle；happy/walk 同名选择，look 缺失真实回 idle，没有伪称 look/blink 独立 clip。
5. `Pet3DScene.ts:106–121,154–164` 只有 original 染 Body/Ear/Leaf；四角色仅染实际装饰，逐 mesh clone 材质隔离共享本体。四装饰名字从实际节点得到，`PetCompanion.tsx:169–223` 隐藏不存在选项/整组及相关组合；加载失败切换 SVG 能力并提示，不假装三维加载成功。
6. `Pet3DScene.ts:132–147` 停 action/RAF、uncache root、释放 mesh geometry/material/texture、renderer；失败时亦释放。未引入业务或保存依赖。`pet.css` 主要差异属于 S1 布局范围，本 S2 沿用真实 canvas/fallback 样式，不归并其他包结论。

## 本轮独立证据（reviewer 执行）

| 命令/观察 | 退出码及实际结果 | 边界 |
| --- | --- | --- |
| `npm run build` | 0；2532 modules，五个角色 GLB 实际产出，xiaotuan 1096860、nailong 1708284、chiikawa 1339904、hachiware 1367016、usagi 1418548 bytes | 构建包含当时 S1/S3 文件；版本仍 0.8.1，S4 需改 0.9.0，不能作为最终 EXE |
| fresh `npm test`，单独完整重跑 | 0；149 tests / 149 pass / 0 fail / 0 skipped，完整 TAP 已读 | 现有新增 desktop 测试归 S3；并非实际 renderer 或原生验收 |
| reviewer 独立只读 Python 解析五 GLB JSON/BIN | 0；header/length、PetRoot/四装饰/两 Blink、四 clips 每个 21 channels；idle/happy 实际 root/臂/眼变化，walk 额外双脚变化；rest 首帧两眼 scale 最小值 0.045；根和眼默认 scale1 | 没有执行会重写 manifest 的 verifier；直接核验实际文件而非信任摘要 |
| 五候选 SHA256 对外部总 manifest、`src/local-pet-models` 实际文件 | 0；逐文件相同，且20预览文件存在 | 没有把文件存在等同造型合格；hash 值可见实施报告表，本轮逐项匹配 |
| 旧四角色 `.blend/.glb` 对各自原 `model_manifest.json.files` | 0；八文件 hash 匹配旧清单；公开原创三文件存在且 `git diff -- assets-source public/pets` 无输出 | 保留真实旧资产，有回退来源 |
| `git check-ignore` 五固定模型路径 | 0；全部被忽略，cached name-only 无输出 | 没有 stage/upload 私有资源 |
| `git diff --check` | 0；只有 LF/CRLF 提示 | 不是功能测试 |

公开缺私有构建由实施报告记录已执行，reviewer 没有再次移动资产；静态 glob 和 SVG 分支与报告一致。PWA 把本机五资源打入个人缓存，个人 dist / EXE 必须继续保持不公开发布。

### 失败与警告记录

- 第一次读取误用不存在的 `src/components/PetFigure.tsx`；随后使用实际 `src/PetFigure.tsx` 重新读取。
- 组合读取较长 diff / manifest 被截断；之后单独读关键 View/Scene/Figure/Portrait/Showcase/S2 计划段，并直接解析完整真实 GLB JSON/BIN。首次 npm test 工具输出也被截断，随后单独 fresh 重跑并读全部 TAP，未以截断输出充当完整证据。
- 旧资产探索误以为 GLB 位于工作台根目录、manifest 名为 `manifest.json`，继而误以为 hash 位于顶层。探索出现路径错误、Python exit1 FileNotFoundError 和 exit1 KeyError；通过 rg 定位真实角色子目录及 `model_manifest.json.files` 后，旧文件 hash 核验 exit0。没有修改资产。
- build 保留 Three.js 大于500kB chunk 警告；test 保留 Node stripTypeScriptTypes experimental 警告。实施报告记录的 Blender/NLA/中性基态等既往失败仍保留，reviewer 未重新执行 Blender 生成，不掩盖这些失败或声称重复造型构建。

## 基线与澄清一致性复核结果：PASS

- 澄清未回答列表为空；用户明确继续开发、桌面独立活动。没有新增用户问题。
- 目标锁由五角色真实本机模型/共享入口落实本包部分；原创沿原脚本轮廓，其他角色是个人候选，manifest 明示 `awaiting_user_review`。不把技术结构合格叫造型定稿。
- 头脑风暴约束未被违反；有限动作、公开回退及不上传私有模型仍成立。

| 禁止内容 | 可核查依据 | 结论 |
| --- | --- | --- |
| 正文宠物扩展、商城/投喂/聊天、新待办库 | S2 diff 与新 Figure/Portrait/models/Scene/View 仅展示链；测试正文差异是 S1 兼容断言 | 未踩中 |
| pet 挂整个 App、旧快照写回、自动 AI 上传 | S2 入口无 App/store/desktop业务 import；renderer 无存储/网络业务，GLTF 加载仅模型 URL | 未踩中 |
| 公开模型或个人制品上传 | `.gitignore` 第14行、实际五路径 check-ignore、空 stage | 未踩中 |
| 格式或 Web 证据冒充原生/造型验收 | 实施报告及本报告明确 coordinator 承接表、候选状态及未测限制 | 未踩中 |

## coordinator 承接（仍待实际记录）

真实浏览器/EXE 逐五角色 canvas ready、切换无旧像、三维装饰实际改变/本体色保持、happy/rest/walk 表现；部分节点 DEV 模型隐藏组选项、contextlost/SVG 回退；独立窗30fps/隐藏/减少动态/休息资源表现；真实220px造型展示及用户满意度。root 已接管这些验证，本轮不重新向用户问确认，也不将其写成 reviewer 已验。最终新 EXE 与全 feature fresh 独立审查、文档同步后才能判断交付。

## contract drift / stale / mirror mismatch

未发现 S2 新漂移。上游已记录的共享 readiness 章节/提问数量张力继续由 canonical 合同处理，不改共享技能。仍为0.8.1的包元数据属于 S4 明列待改，不能在交付文档称当前已有0.9.0 EXE。

## 设计味道扫描结果：PASS

有限接口与现有字段足够；新文件仅消除共用渲染边界的循环依赖、固定可选资产解析。没有抽象能力平台或无关业务层改动。仅 renderer 静态正确不意味着长时资源/视觉已验，承接路径已明确。

## 后续动作

S2 审查范围内允许继续 S3/S4 整合；coordinator 按上述实测清单补证并进行全功能最终 fresh review。未测项异常时按真实缺陷局部修补或回计划，不用本报告作为整个 feature Archive/PR 放行证据。

无新增跨功能事实；Blender异常退出、中性基态与 clip 样本事实已在实施报告候选池，不重复记录。
