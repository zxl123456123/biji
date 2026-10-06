# S3 实施记录：UUID 局部图接线

- `feature_name`：notes-view-purpose
- `impl_round`：S3 / 1
- `date`：2026-10-05
- `lwplan_version`：2026-10-05 Gate-2 稿，SHA256 `010B1CC29720AB67FB53E9A1F9E4A4EB862F733E1EBB37ED3C240387BF78B63E`
- 实施主体：独立 S3 impl；根承担最终集成、文档、构建、现场和 fresh review。
- 本记录仅支持 S3 小补丁与纯协议测试结论，不能据此宣称视图整体或实际界面已验收。

## 变更事实

| path | change_type | change_purpose | key_changes | related_tasks |
| --- | --- | --- | --- | --- |
| `src/App.tsx` | 三处局部修改 | 同 UUID 从空间打开二维局部图，并区分原清筛选入口 | `requestLocate` 增英文注释与第三参数 `local = false`；请求对象带 `local`；仅 SpatialNoteMap callback 有 id 时调用 `(id, false, true)`，无 id 调 `nav('graph')` | LW S3 ①② |
| `src/graphFocus.ts` | 单行类型修改 | 新请求字段兼容旧调用者 | `LocateRequest` 增 `local?: boolean`；locator 状态机、返回协议与卸载逻辑原样保留 | LW S3 ① |
| `tests/graphFocus.test.mjs` | 追加两个行为用例 | 保留旧请求并检查 local 的 token 协议兼容 | 更新/尺寸等待、最新请求与回调、消费一次、UUID missing、卸载抑制；local 请求被不带 local 的旧请求替代后不报告旧 token | LW S3 impl-safe |
| `docs/current/notes-view-purpose/impl_report_s3.md` | 新增报告 | 将差量、证据与未测移交根 | 本记录 | LW S3 impl-safe / 根收口 |

未修改 `tests/recordNavigation.test.mjs`，仅将它纳入指定回归命令。未修改 S1/S2 owner 文件或根能力文档；未操作 Git、服务、浏览器、版本或安装包。

### 并发差量归属

修改前独立核对三项 owner 源码/测试的当前 SHA 与 TEMP/before 一致（工具 `c885bd`，exit 0）。实施后再次核对 before/current：App 已另有外部并发的 `PetPortrait` / `PET_CHARACTER_NAMES` import、Settings `petName`、RecordGarden `companionName` / `renderCompanionFigure` 与 animate 接线。以上均保留，**不是本 S3 的改动，不能把整个 App 差量归于 S3**。根已收到报告并独立看到相同外部差量。

本包只认领上表的三个 App 片段。空间原 appearance/petAppearance、Boundary 无参数 fallback、日历和宠物最新接线均保留。修改后源码核读确认原 `currentRecord(notesRef.current, id)`、`clearBlockingFilters`、递增 token、`finishLocate` 最新 token、Ctrl K `(id, true)`、二维 `(id, false)` 仍在原入口；这属于静态差量证据，实际 UI 行为由根承接。

## 目标对齐

- `goal_lock_check`：G1/G2 的跨图 UUID 请求通过单一兼容入口表达；空间有 id 请求带 local，原入口继续默认 false。local 的等待/替代/消费/卸载协议已有本轮纯测试证据；二维采纳一层和实际编辑回路依赖 S1/S2 与根现场，未在本包验证。G3 保留并发片段，未将纯测试替代窄屏/浅深主题或 GPU 验收。
- `anti_goal_touch_check`：A1/A2/A3 未引入第二套导航、全局筛选、关系算法、renderer、业务存储、网络、依赖或版本改动。没有丢弃未知差量或改宠物/日历核心；无提交推送或安装包生成。
- `authoring_ergonomics_notes`：N/A（不涉及声明式配置/manifest）。沿用原 requestLocate，第三参数默认 false、字段可选，英文注释描述 local 用途；未抽象导航平台。

## 验证结果

### impl-safe 实际命令

```text
node --test tests/graphFocus.test.mjs tests/recordNavigation.test.mjs
```

- `evidence`：`C:/Users/ZXL/AppData/Local/Temp/qingjian-view-purpose-20261005/impl-s3-tests.log`；保存完整 TAP 与 `EXIT_CODE=0`，已完整读取（工具 `8df6e6`，shell exit 0）。
- `owner`：S3 impl。
- 实际输出：10 tests、10 pass、0 fail、0 cancelled、0 skipped、0 todo；本次完整输出无警告。
- `conclusion_if_missing`：若完整日志或退出码缺失，仅未验证；当前证据只支持这两个测试文件的纯行为结果。
- 新测试消费原 `createGraphLocator`，不以源码字符串断言替代行为。旧的无 local 及 latest-record 编辑/导航用例保留。没有运行 build 或现场，不能以本结果判断类型集成与产品总体验收。

### 原始差量核对

修改前 SHA 对照、修改后行差量和关键入口核读均 exit 0（`c885bd`、`1cc5b2`、`c2aa00`）。修改后两个独占协议文件 SHA：

| 文件 | SHA256 |
| --- | --- |
| `src/graphFocus.ts` | `90FA6BAB0547FD113FB0ADD7AE1AACFFEA40AE1FF3285BEBB67811C041FC36AC` |
| `tests/graphFocus.test.mjs` | `D7B30201A071ABEC0F27692DF11C35E2AEBAB1A5B9142A96F0A259B0347C90AA` |

App 仍可能继续外部并发修改，最终 SHA 集由根收口，不能把此时混合 App 当作固定 S3 基线。

### 已见失败与读取限制

本包测试无失败、命令退出均为 0。首次批量读取结果被输出预算截断，随后分段补读完整基线、LW 关键工作包、App 与测试，未用截断文本做放行。上游已记录的不存在 `tests/spatial.test.mjs` 读取 exit 1、Windows rg glob exit 1 和历史 Node warning 仍保留在基线/LW；它们不等于本次协议测试失败，也不因当前通过而删除。

## coordinator_handoff_verifications

| 待承接验证 | 原因 / 承接方式 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 最终类型/构建与独立全量 test | 共享产品文件并行，根合并后串行运行 `npm test`、`npm run build` | 同最终差量的完整日志、exit 与 SHA 集 | root | S3 类型集成/全量回归未验证 |
| 空间主题→记录→查看此条关联→二维一层同 UUID→编辑 | 浏览器实际回路超出本包 impl-safe；用独立合成数据 | 现场记录/截图；query/tag/unfinished 保持 | root | G1/G2 跨视图产品回路未验证 |
| Ctrl K 跨旧局部中心、快替 token、删除/latest-record、关闭弹层 | 纯协议测试只覆盖 locator/导航模块，不覆盖 React/Canvas 集成 | 实际 UI 动作与结果 | root | 相关实际交互未验证 |
| 浅深主题与 390px、当前记录范围/依据和空间相机 | 属于根现场与 S1/S2 共同集成 | 同源码现场记录/截图 | root | G3 舒适度未验证 |
| Fresh 独立实施审查 | 需未参与实施的 reviewer 绑定最终产物 | before/current、raw test/build、UI 与 review 记录 | root / fresh reviewer | 不得宣布整体完成 |

原生 GUI、多设备、长期 GPU/内存/耗电、触屏和读屏仍未测，本包未扩大这些承诺。

## contract_drift_reports

无阻断契约漂移。既定 U7 在 App 发生外部并发差量，所有外部片段已保留并上报 root；当前 S3 三片段未与之冲突。未递归委派、未擅自改计划或基线。

## 未完成与风险

S3 指定代码与纯协议用例已落地，缺失的是根负责的类型/构建、全量独立测试、实际 UUID 回路和 fresh review。审查应重点核对：SpatialNoteMap 的无参数入口不传 click event；S1 在投影前采用新的 UUID 并采纳 local 一层；混合 App 的外部宠物/日历片段保留。以上不能由当前纯协议测试单独证明。

## 回滚与提交建议

`可直接回滚`仅指按输入快照逐段撤本 S3 三个 App 片段、可选字段及两个追加测试；共享 App 存在外部差量，不得整文件 restore/reset。实际回滚仍由 owner 在最新文件核对后执行。

英文提交消息建议：`feat(graph): open local relations from spatial records`

无跨功能事实候选。

## 补实施 r2：二维阅读区域的浮层政策

- `feature_name`：notes-view-purpose；`impl_round`：S3 / 2；`date`：2026-10-05。
- `lwplan_version`：LW §6 原地增补及 Gate-2 补审稿，SHA256 `C01F911B5DF9E65F6E7DFA7BB393A56390AC474DE7FAC6F2066095FC94A27228`；已读 §6 与 `review_notes_lw_2.md` 全文，根已复核 PASS 并派发。
- `path`：`src/App.tsx`；`change_type`：最新文件单处谓词补丁；`change_purpose`：二维关联阅读页沿用现有视图入口隐藏浮层宠物；`related_tasks`：LW §6 的 S3 唯一锚点。
- `key_changes`：只将原 PetCompanion `hidden` 的 settings/space/garden 视图谓词追加 `|| view === 'graph'`。`visible={pageVisible}`、shown/onHide、角色、行为、偏好及外部 PetPortrait/RecordGarden 接线保持。未改宠物组件、测试、其他产品文件或配置。

### 保留现场失败与结论限制

根在 1265×713 的实际浏览器已看到二维右下浮层覆盖正文、定位及部分关联依据；三维导览过高把图主体挤到首屏下方。以上是 G3 实际验收失败，原纯测试/构建没有关闭。前者由本次显示政策补丁承接，后者由 S2 原 owner 收紧独占 CSS；本 agent 未执行现场，**不能据此说遮挡已经修复或视觉收口通过**。

### r2 差量与 impl-safe 证据

修改前保存最新 App 到 TEMP `impl-s3-r2-before-App.tsx`，只用于本次单处差量核对，未替代最初产品 before/manifest。修改后在内存仅撤新 hidden 片段，与该 r2 输入完整文本严格相等，`onlyExpectedHiddenPolicyDelta=true`，核对命令 exit 0；因此本次 r2 没有覆盖任何外部并发 App 片段。该静态核对只能证明差量边界，不是界面验收。

本轮实际再次执行：

```text
node --test tests/graphFocus.test.mjs tests/recordNavigation.test.mjs
```

- `evidence`：TEMP `qingjian-view-purpose-20261005/impl-s3-tests-r2.log`，完整 TAP 和 `EXIT_CODE=0` 已保存并完整读取；工具 `82faa2`，shell exit 0。原 `impl-s3-tests.log` 保留。
- `owner`：S3 impl；结果 10 tests / 10 pass / 0 fail / 0 cancelled / 0 skipped / 0 todo；当前输出无警告、无本次命令失败。
- `conclusion_if_missing`：无 raw 输出或 exit 时只可未验证；此证据仅支持原协议/导航回归，不能证明 PetCompanion hidden 的实际阅读效果。不增加镜像该谓词的测试。
- `goal_lock_check`：直接消费 G3 阅读区域清晰舒适；G1/G2 的 UUID/范围接口不改。
- `anti_goal_touch_check`：A1/A2/A3 保留，只有既有入口的展示政策增量，无新状态/存储/网络/依赖/渲染器或宠物业务；无 Git/版本/制品操作。
- `authoring_ergonomics_notes`：N/A（非声明式配置）；显示政策留在 App 现有入口，不将笔记视图职责写进宠物组件。
- `contract_drift_reports`：消费已经回写澄清/LW 的 PLAN_DEFECT 修订，没有静默扩范围或新增阻断；根负责此次最终 SHA 收口。

### r2 coordinator_handoff_verifications

根在最终源码上 fresh 全量 `npm test`/`npm run build`，记录完整日志、exit 与 SHA；同 1265×713、390px、浅深主题实际核对正文/定位/依据无遮挡且可点、全部主题可滚动和地图首屏可见。还需返回记录页核对原浮层显示/关闭偏好及 space/garden/settings 政策、空间大宠物展示保持。`owner` 为 root，`evidence_expected` 为同最终差量 raw 命令与现场截图/记录，`conclusion_if_missing` 为“视觉收口未验证”。Fresh 实施后审查仍由根调度；设备/原生/长期资源未测边界继续保留。

`可直接回滚`仅指由原 S3 owner 在最新文件撤这一处 `|| view === 'graph'`，禁止整文件恢复。英文提交消息建议：`fix(graph): keep the reading pane clear of the companion`

无新增跨功能事实候选。
