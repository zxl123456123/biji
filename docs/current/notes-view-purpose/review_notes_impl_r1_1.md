# 独立实施审查（第 1 轮，第 1 次）

- review_target：impl
- impl_round：1
- review_seq：1
- review_date：2026-10-05
- 实施索引：[impl_report_r1.md](impl_report_r1.md)，分别消费 S1、S2 r1/r2/r3、S3 r1/r2 报告。
- 协议结论：**PASS**
- 业务结论：**PASS**
- 阻断项：无。结论只覆盖本轮视图用途增量及其有界验证，不覆盖并发宠物/月历完整验收、发布副本或原生制品。

## 输入、身份与独立验证

本 reviewer 未参与实施，未改产品、根文档，未递归委派、启动服务/浏览器或提交。已读 `plan-review`、`verification-before-completion`、本 feature README/澄清/LW、两轮 Gate-2、全部实施报告与 verification；直接核读真实差量、相关源码及新增行为测试。差量基准是 TEMP `qingjian-view-purpose-20261005/before`，不是混合 HEAD。

最终身份为 `C:/Users/ZXL/AppData/Local/Temp/qingjian-view-purpose-20261005/final-manifest.json` 的完整 16 项集合，manifest SHA256 **`E4FBB6D9C952790F875867FF0BBB811F53E702D23EBE0DA40B811E92C6A12FFB`**；最终 diff SHA256 `12FE42A105BAB19EEF80D1A87FC1435C47ECA18CAC9B6EBBBB0A13664721ABB0`。独立逐项核验 `FROZEN_MATCH=16`，exit 0（工具 `4cda1f`）。关键共享源码身份：

| 文件 | 最终 SHA256 |
| --- | --- |
| src/App.tsx | 514AAE9C4BB1D410EBCB411BBC9AA3B282F8283C6EAE41126F2D0D852B4D3AF4 |
| src/NoteGraph.tsx | E4A0CE589982AC118BA16469839DDDDCA902D52460158FED34439791BE60BBCA |
| src/SpatialNoteMap.tsx | EE338ED054219A0A3388270DE06331668FC5D2DFB0B759FCA713633B75AA840D |

LW 最终 SHA 为 `C01F911B5DF9E65F6E7DFA7BB393A56390AC474DE7FAC6F2066095FC94A27228`。独立核验 before 全部 276 项 SHA 匹配（`b4d99f`，exit 0）；73 项受保护文件（Tauri、依赖/锁、存储/桥接、关系/Worker入口、scene/layout/runtime/models、外观模型）与 before 一致（`a573ed`，exit 0）。

本轮独立命令 `node --test tests/graphView.test.mjs tests/spatialExplore.test.mjs tests/graphFocus.test.mjs tests/recordNavigation.test.mjs`：完整 TAP 已读，24/24 pass，fail/cancel/skip/todo 均 0，exit 0（`f6c7a9`）。它支持投影/协议规则，不代替 React/Three 现场。

根承接证据已直接读取，未使用作者或根摘要代替：

| 责任与证据 | 独立核读结果 | 证据不足边界 |
| --- | --- | --- |
| impl-safe：S1/S2/S3 原报告与对应新行为测试 | 规则、冻结输入与职责均吻合；reviewer 自跑上述相关测试 | 不证明 GPU、相机或界面舒适度 |
| root：final-tests.log / final-build.log | 已读完整 r1 正文；其文件未附退出码，因此未仅据文件推断 exit | 原日志保留，r2 补齐实际退出码 |
| root：final-tests-r2.log + final-tests-r2-result.json | 145/145 pass，0 fail/cancel/skip/todo，实际 exit_code 0；UTC 2026-10-04T18:52:30.9042384Z | 限当前 Web 纯测试 |
| root：final-build-r2.log + final-build-r2-result.json | tsc -b 与 Vite 2515 modules，实际 exit_code 0；UTC 18:52:42.6852390Z，隔离 final-dist-r2 | 不证明原生制品或设备性能 |
| root：实际 UI 与媒体 | 已读 final-ui-space/text-theme、两份 console，实际查看 space-panel、space-dark-390、graph-dark-390 PNG | reviewer 未重开浏览器；完整操作顺序责任属于 root |

r2 两个完整命令正文及实际元数据读取为 `aabd79`，exit 0。保留 Node 类型擦除 ExperimentalWarning、outDir 不自动清空与 >500kB chunk 警告。

## 基线与澄清一致性复核结果：PASS

未回答列表为空；目标锁 `G1/G2/G3` 遵守，头脑风暴决策未违反。复核落点：

- **G1**：`NoteGraph.tsx:48-56` 在旧局部范围之前采用请求 UUID，local true 按 token 采纳一层；`graphView.ts` 先按证据筛边再无向 BFS，混合边可双匹配，全图保留全部 UUID，局部孤立中心为 1/0、明确失效中心为空。Canvas/模拟/数量/详情统一消费 shown；`NoteGraph.tsx:263-282,329-330` 先 reconcile 再 retry，旧 latest/token/卸载协议保留。文字 picker 仍消费全部 notes；邻居选择成为新中心。新测试覆盖链/环、两类证据、同文不同 UUID、pending、冻结输入与源证据不变；根现场记录补足实际选择、跨旧中心、软删恢复及旧 Ctrl K。
- **G2**：`SpatialNoteMap.tsx:64-104,110-122` 保持 fullLayout 与 displayLayout 分工；详情关联总数读 full，主题聚焦只投影节点/选中 incident 边，不重跑子集布局。`spatialExplore.ts` 复制完整坐标/degree、保留 timeRange、按原 bounds 规则重算范围；测试实际验证两模式全部组、bounds 包围、恢复全部、degree/证据非变异。chooseTheme 的显式 fit 在 setLayout 后执行，重复主题/全部也有意图；跨主题 picker 只恢复范围、不递增 fit，外观预览不进入 fit 依赖。原 scene 创建依赖仍为 mode/attempt，复用单 owner、原 policy 与 dispose；默认 paused=true。所有组含末尾词面组可访问；根 raw 末尾主题为 2/18，未选中零边。
- **G3**：App 的空间 UUID 入口为 `(id,false,true)`，旧快开 `(id,true)`、二维定位 `(id,false)`、currentRecord 与 finishLocate 最新 token 保留。原编辑器、筛选源、外观选项/draft/apply、宠物/日历入口保留。实际 PNG 显示静态空间节点、相机、旁栏与阅读入口，深色390px控件/正文/依据可读且无浮层遮挡；这是有界媒体证据。普通 viewport 的首屏位置引用 root 实际几何记录，不用 fullPage 图证明首屏。仅 App hidden 加 graph，不改 shown/onHide/visible 或偏好。

| 禁止内容 | 直接核验依据 | 结论 |
| --- | --- | --- |
| 两幅密集图重复、词面/坐标冒充语义 | display 默认零边/选中 incident；空间逐条依据转二维入口；两组件中文词面说明 | 未命中 |
| 复制日历/宠物职责或修改其核心 | S2 pet 分支无差量；创建时间文案保留；App 本轮 hidden 单处分支；外部 Pet*/Record* 差量单列 | 未命中本轮 |
| schema/存储/AI/网络/依赖/版本/安装包新增 | 真实 before/current 差量；73 项保护文件独立 hash 匹配；新增纯展示模块无相关调用 | 未命中 |
| 新 renderer/关系引擎/RAF/全局筛选副本 | 现有 owner/hook 全链核读；只在组件加会话 scope/evidence/theme 状态 | 未命中 |
| 丢弃未知差量、整文件恢复或整包发布 | diff 保留 App 外部 PetPortrait/角色/Settings/Garden 接线；baseline-changes 保留外部来源；无 Git 操作 | 未命中 |
| 静态测试冒充原生、多设备或长期舒适度 | 三包报告把现场交 root；verification 保留有限未测；本审查明确责任 | 未命中 |

## canonical 检查字段与设计味道

| 字段 | 结论与依据 |
| --- | --- |
| goal_lock_alignment | aligned：上节逐项核对 G1/G2/G3 |
| anti_goals_touched | none：上表仅判本轮差量，不将外部宠物/月历改动算成本轮触碰 |
| authoring_ergonomics_check | pass：两纯投影集中规则，复用原 locator/scene，显示政策留在 App 入口 |
| declaration_readability_check | pass：无新 DSL/导航平台；可选 local、full/display 与有限状态职责直接可读 |
| plan_defect_checkpoint_recommended | no |
| plan_defect_checkpoint_reason | 已见视觉不足经过基线增补、LW §6、Gate-2 补审与 owner 修订；最终无需要重写目标/验收/回滚的证据 |
| plan_defect_trigger_reason | n/a，未命中 PLAN_DEFECT |
| impl_safe_validation_check | pass：实施报告未把浏览器/原生结果写成 impl 自证；相关纯行为与根全量命令证据已核读 |
| coordinator_handoff_check | pass：非 impl-safe 回路由 root 承接，媒体/日志/最终 SHA 与未测边界齐备 |
| 设计味道扫描结果 | PASS：未发现阻断反模式或额外抽象；完整事实与绘制投影分开，原 owner 生命周期保留 |

作者体验门：PASS。主要规则能沿“唯一筛选→新中心→shown/token”与“full→display→setLayout/fit→UUID”顺读，不需要在 scene 填主题业务或新增配置。没有将配置折叠变成能力删除。

## contract drift / stale / mirror mismatch 与失败留痕

独立第一次最终 hash 检查 exit 1（`5dd263`）：README 不再匹配 r1 冻结；随后识别 README、CHANGELOG、Spatial.Experience 三项外部文档变化，11 项源码/测试及 Progress/Graph 不变。此事实已上报 root，没有静默换身份。root 保留 r1 manifest/diff（manifest SHA `AB0A6D4E9FCB0276B008A58BB4EC6D7772E002E0BD957570BF60FEE9717DF64B`）并生成最终集合；reviewer 已全文读 `final-docs-drift-r2.txt`，变化属于外部宠物/月历桥接与0.7.0发布边界收尾，本轮视图段落未变。独立比较 r1/r2 产品 diff 完全相同（`3e34cc`，exit 0）。外部 App 的 PetPortrait/PET_CHARACTER_NAMES、Settings petName、Garden 接线及 Pet*/Record*/其它 feature 不归本轮完成或全量验收。当前无阻断 drift/stale/mirror mismatch。

保留已见失败：早期三维导览/标题过高、二维宠物遮挡，toast 过期点击失败，并发中间态 3 条 HMR error、旧标题 patch 拒绝与上游读取/rg 失败。final-ui-console.json 的三条错误已实际读取；最新 verification 另据根完整服务端历史输出区分 Spatial HMR 的原因是新 import 先落、spatialExplore.css 尚未落盘，不能把全部 HMR 归因于 PetPortrait。fresh.json 仅证明显式 reload 后新增 warn/error 为空，不能把整段历史写成无错。根受控结束自建验收服务的 exit 1 也已在 verification 保留，只是服务清理，不是产品成功或正常应用退出证据。reviewer 批量输出也曾截断，已分段补读完整 LW、报告、产品差量及新增测试，不使用截断部分作放行。原始失败与警告不因最终命令绿色而删除。

## 后续与有限未测

允许 root 对**本轮独立差量**进入 Archive/PR 准备；混合工作区不能直接整体 stage/push，本报告不替并发功能授予发布范围。若最终产品源码再变，需重新验证并重新审查对应新身份。

广泛 GPU/WebView、原生 GUI/安装卸载、触屏/读屏、真实 IME、长期资源/耗电及完整故障注入未测；本轮未生成新安装包。根合成18记录现场与所读媒体只支持当前有界体验；日历/宠物入口保留不等于其 feature 已完整验收。无需新的用户决策或低风险用户确认。无新增跨功能事实候选。
