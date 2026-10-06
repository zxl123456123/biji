# Impl r1 报告：十二个月记录年轮

- `feature_name`: `celestial-note-wheel`
- `impl_round`: r1
- `date`: 2026-10-06
- `lwplan_version`: 2026-10-06，Review(LW) 第 2 轮 PASS

## 工作区基线与归属

实施前 `git status --short` 显示 `App.tsx`、`README.md`、`CHANGELOG.md`、`docs/Project.Progress.md` 等已有修改，`NotesView.tsx`、`Modal.tsx` 和整个 `docs/current/` 未跟踪；还有大量非本功能文件修改。实施前没有暂存、还原、清理或覆盖这些内容。实施前读取了相关实际代码，但**未把共享文件原始 `git diff` 另存为快照**，与 lwplan S5 的留痕要求有差距；因此本轮不自行暂存、提交或推送共享文件，交 coordinator 逐 hunk 复核归属。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/celestialWheelModel.ts` | 新增 | 本地创建年、12 月真实日期、UUID、ready 一跳关系纯派生 | S1 |
| `src/NotesView.tsx` | 局部修改既有未跟踪文件 | 活跃卡片操作区增加年轮入口，回收站不显示 | S2 |
| `src/App.tsx` | 局部修改既有修改文件 | 年轮状态、全量活跃记录、图谱启用、宽幅 Modal、背景 inert、原编辑 handoff、失效关闭 | S2 |
| `src/Modal.tsx` | 局部修改既有未跟踪文件 | 可选 frame class，保留既有 Tab 陷阱和焦点恢复 | S2 |
| `src/CelestialNoteWheel.tsx`、`src/celestial-wheel.css` | 新增 | 懒加载宽幅覆盖层、年月日/记录文字导航、画布失败回退、暂停/姿态控件、窄屏布局 | S3 |
| `src/celestialWheelScene.ts` | 新增 | 12 组实例日期格、共享几何/材质/文字图集、差速与姿态周期、局部拾取、30fps 调度和资源释放 | S4 |
| `tests/celestialWheel.test.mjs` | 新增 | 日期、关联、时区、slots 与动态许可断言 | S1/S4 |
| `README.md`、`CHANGELOG.md`、`docs/Project.Progress.md` | 局部修改既有修改文件 | 当前源码能力、使用入口、未测边界与来源 | S5 |
| `docs/current/celestial-note-wheel/verification.md`、两份命令日志、本报告 | 新增 | 实测命令、失败、未测和交接证据 | S5 |

## 目标与反目标对齐

- `goal_lock_check`: L1 入口取单条活跃记录的创建年，固定十二真实月份与 365/366 日；L2 默认许可下平面/立体往复、环间差速、可暂停/手动姿态，文字导航始终可操作；L3 仅 UUID/创建日/现有图谱边，记录走原编辑器。
- `anti_goal_touch_check`: 未增加术数/卦象、空日关系推断、逐格独立贴图、持久化字段或网络调用；未修改编辑器、SQLite、排序/备份算法。画布使用每月一个 `InstancedMesh`，48 个文字对象共用一张图集。真实设备的可读性和性能尚无现场证据。
- `authoring_ergonomics_notes`: N/A；本轮无声明式配置或 manifest。用户文字称“记录年轮”，说明当前创建年份与直接关联，不显示内部格式。
- `contract_drift_reports`: 未发现 shared skill 或平台镜像 drift。Review(LW) WARN 已按宽幅覆盖层文案与背景伙伴隐藏处理。实施基线 diff 未独立保存是本轮证据缺口，已上报 coordinator。

## impl-safe 验证

| 命令/步骤 | evidence | owner | 结果 | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| `npm test` | [完整日志](npm-test-impl-r1.log)；本轮命令退出码 0，156/156 pass | impl | 纯模型及既有单元测试通过 | 未验证 |
| `npm run build` | [完整日志](npm-build-impl-r1.log)；本轮命令退出码 0，仍有大 chunk 警告 | impl | TypeScript/Vite 构建通过 | 未验证 |
| `git diff --check` | 本轮终端输出；exit 0，Git 提示现有文件 LF/CRLF 可能转换 | impl | diff 空白检查通过 | 未验证 |

过程失败如 [verification.md](verification.md) 所记：第一次全量 `npm test` exit 1（Node 导入缺 `.ts` 扩展），修正后最终全量重新运行。该失败的完整原文没有单独日志，报告明确保留其原因和计数。coordinator 的 IAB 现场还看到 `Illegal invocation` 画布回退，按实际调用路径修复裸 `cancelAnimationFrame` 传递后，coordinator 看到十二圈画布与展开姿态；其 727px 观察又发现标签难辨，最终调整后在 1280×900 IAB 复核可见月份/刻度及深浅主题。性能与其他设备仍未测。

独立审查后补修：`src/celestialWheelScene.ts` 的日期刻度曾把「1」「15」放到错误索引，现校为 0/14；`tests/celestialWheel.test.mjs` 覆盖 28–31 天月份。`src/CelestialNoteWheel.tsx` 新增安全纯文本中心摘要与同日列表标识，`src/celestial-wheel.css` 做局部样式。上述改动后重新运行全量测试和构建；最终 UI 复看仍由 coordinator 承接。

coordinator 的 IAB 焦点测试又发现年轮按钮/Escape 关闭后焦点落在 `BODY`。`NoteSorter` 在年轮打开时重挂载卡片，导致原按钮 `connected:false`；现 `NotesView` 在按钮标记 UUID，`App` 在关闭后按 UUID 查当前按钮并于下一帧还焦，找不到则尝试搜索框。原编辑 handoff 不安排回入口焦点。coordinator 复测按钮/Escape 均回到当前入口按钮，打开原记录则由编辑器正文获焦；完整筛选/删除/原生焦点组合仍待验证。临时日志已移除。

## coordinator_handoff_verifications

| 验证项 | 移交原因与建议方式 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 实际浏览器三排版/筛选/分页/焦点/原编辑 | 非 impl-safe UI 实测；coordinator 实际操作 | 截图/录屏、数据/窗口/焦点记录 | coordinator | 未验证 |
| WebGL 场景、失效回退、浅深色/窄屏/系统减少动态 | 非 impl-safe 浏览器状态 | 画面、动作、回退观察记录 | coordinator | 未验证 |
| Windows WebView、弱 GPU、触摸和长时开关性能 | 真实设备与外部平台 | 设备、DPR、记录数、帧时/帧率、资源趋势 | coordinator | 未验证 |
| 独立复跑、最终 diff 和逐 hunk 归属 | 双重 Gate 与已有未提交改动 | 命令退出码、完整失败、hunk 清单与 staged diff | coordinator | 不能提交/推送 |

## 未完成、风险与回滚

代码、模型单测和根文档已接线；1280×900 IAB 已观察最终标签/十二环/展开/主题，但其他宽度、完整交互、性能、真实 WebView 与长时资源尚未验证。场景可能需要按弱设备帧时继续调整；不得在缺证据时宣称 U5 已关闭。已有未提交共享文件的逐 hunk 归属也待 coordinator 核查。新文件可直接回滚；共享文件需人工按本功能 hunk 回滚，不能整文件 restore/reset。未提交、未推送。

建议提交消息：`feat(notes): add twelve-month record wheel`

---

## 跨功能事实（待确认）

### 架构与约束

- [2026-10-06] 宽幅 `Modal` 覆盖时，主工作区之外的宠物与桌面标题栏也需纳入背景交互隔离。
