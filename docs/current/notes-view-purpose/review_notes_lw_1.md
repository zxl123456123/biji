# 方案评审记录：LW（第 1 轮）

**review_target**：lwplan  
**评审日期**：2026-10-05  
**协议结论**：PASS  
**评审对象**：`lwplan.md`，SHA256 `010B1CC29720AB67FB53E9A1F9E4A4EB862F733E1EBB37ED3C240387BF78B63E`。  
**范围**：fresh 独立 Gate-2；未参与实施、未改产品、未递归委派或提交。此结论允许实施，不代表新功能或界面已验收。

## 输入与直接证据

- 已读本轮 README、clarifications、research、research_industry、readiness 第一轮与最终 LW；核对 `plan-review` 和 `implementation-planning` 的 canonical Required Set。
- 直接读取 `NoteGraph.tsx`、`graphFocus.ts`、`SpatialNoteMap.tsx`、`spatialLayout.ts`，App 的请求/结束定位与空间入口、scene 的 degree/setLayout/fit/边绘制链路，以及 graphFocus/spatialLayout/noteGraph 测试。
- 唯一实际输入基线为 TEMP `qingjian-view-purpose-20261005/before` 和同级 `manifest.json`（276 项），未把混合 HEAD 当本轮基线。独立 SHA 比对 App、NoteGraph、SpatialNoteMap、graphFocus、spatialLayout、spatialScene 六项：before 匹配 manifest，current 匹配 before，全部为 true，命令 exit 0（工具 chunk `82ff81`）。
- 本 reviewer 本轮执行 `node --test tests/graphFocus.test.mjs tests/spatialLayout.test.mjs tests/noteGraph.test.mjs`，读取完整 TAP：20 tests / 20 pass / 0 fail / 0 skipped，exit 0（`51e320`）。这是现状契约证据，未覆盖尚未创建的新模块，也不是产品 UI 验收。
- 本轮读取命令均 exit 0。首次大批输出被工具截断，已分段补读最终 LW、基线、调研及实际关键源码；未用截断部分直接放行。上游误读不存在的 spatial 测试、Windows rg glob 的 exit 1 仍保留在 LW/基线/readiness，不能改写成从未失败。

## 可行性与阻断项

**阻断项：无。** 现有 GraphModel/SpatialLayout 足以承载展示投影；scene 已有 setLayout 和按当前 bounds 的 fit，无需扩展 renderer、关系算法或存储。S1、S2、S3 产品文件独占，最终稿已将 S3 改为独立第三 impl owner；root 负责文档、编排、fresh 验证与现场。

## Gate-2

### Required Set 复核结果：PASS

按显式 S1/S2/S3 识别主要工作包。T1 的 13 项均存在：目标/反目标及不影响项（§1）、文件和首读锚点、步骤/验收/依赖/回滚、逐包 G/A 映射与作者体验、impl-safe/根承接及证据不足约束（§3）、主链/事实映射/最小片段（§2）、Gate-1 自检与双阶段主体/时机/回退（§5）、委托模板/事件留痕/风险降级（§4）。T2 额外输入输出/边界与测试回归、T3 接口矩阵/local 兼容/无迁移说明及原错误降级均已明确。未用任务数替代内容门禁。

### 目标锁 / 反目标复核结果：PASS

G1 对应二维范围、依据同源、数量与定位；G2 对应主题导览、稀疏绘制、完整布局和 UUID 回路；G3 对应根浅深/390px 现场、并发保护与独立验证。三包均显式消费 G/A。

| 禁止内容 | 可核查 LW 锚点 | 结论（本计划未踩中） |
| --- | --- | --- |
| 两幅密集关系图重复、词面/坐标冒充语义 | §1；S1 的稀疏图两层说明；S2 无选中零边、词面分组命名、二维阅读入口 | PASS |
| 日历/宠物副本或其核心修改 | §1 不影响项；S2 创建时间/按天分工、pet 分支保留；S3 owner 清单 | PASS |
| 新 schema/存储/网络/AI/依赖/版本/安装包 | §1 A2，§3 无迁移/仅会话状态，S3 提交与 EXE 边界 | PASS |
| 新 renderer/关系引擎/RAF/全局筛选副本 | §2 分层理由；S1/S2 纯展示模块；S2 复用原 scene/policy | PASS |
| 丢弃并发差量、整文件回滚或整包发布 | 三包独占清单/回滚；§4 U7；S3 禁止整包提交推送 | PASS |
| 静态证据冒充 GPU/原生/多设备体验 | 三包 impl/根责任；§4 U1/U5、final SHA 与证据不足约束 | PASS |

### 关键实现锚点复核结果：PASS

S1 可直接从 NoteGraph 的 shown/latest、reconcileGraph→locator.retry、picker/relations 落点核对；S2 从 MapView 的 layout/latest/create/setLayout、summary/groups/detail 与原外观 section 落点核对；S3 从 LocateRequest、requestLocate、SpatialNoteMap callback 落点核对。新增纯模块、限定 CSS、对应测试及 root 文档均指定唯一 owner，目标形态明确。

### 代码片段充分性复核结果：PASS

本改动命中接口/优先级/状态分支触发条件。§2 已给来源锚点与目标骨架：可选 local 及两类请求来源 → requested UUID 在旧局部中心之前进入投影 → shown 更新模拟后 retry token → full/display 消费分离 → setLayout 后才处理明确 fit 意图 → 关联总数读 full。S1/S2 的文字步骤补足 BFS、混合边、bounds、无效中心/主题与恢复规则，无需贴 owner 实现全文。S2 删除仅旧逐条依据 JSX（当前 `SpatialNoteMap.tsx:152-156`），未删除整条函数链或显著专用逻辑。

### 作者体验门复核结果：PASS

后续作者可在纯模块入口实现派生规则，在现有组件消费同源 shown/full/display；无需把 BFS 放进 Canvas 循环或把主题业务放进 scene。默认闭合 details 保留完整配置动作，当前记录仍是唯一可变中心，UUID 接线仍复用原 requestLocate。小型按钮组、aria-pressed、独立 CSS 和可执行现场清单让目标直接可预见；没有新声明 DSL、导航平台或重复业务状态。

### 人工 review 对齐复核结果：PASS

| 子项 | 结果 | 直接依据 |
| --- | --- | --- |
| 核心链路顺读复核 | PASS | §2 顺读唯一 notes/共享筛选 → 二维投影/模拟/token，及完整空间布局 → 主题/绘制/bounds/fit → UUID → 二维；不改层与原因紧随主链 |
| research 事实映射复核 | PASS | §2 显式逐条映射混合证据、旧中心隐藏新 UUID、degree/坐标、setLayout/fit、single/pending、旧 Ctrl K 与并发边界到函数、纯测试或根现场 |
| 跨包脑补需求复核 | PASS | 接口矩阵与闭环片段先于工作包，S1/S2/S3 只细化同一契约；无需自行跨包拼出请求顺序或完整/显示职责 |

总括 PASS 引用上述三个子项 PASS，不以总评替代它们。

### P1-P9 协议合规核验表：PASS

| 协议项 | 结果 | LW 证据 |
| --- | --- | --- |
| P1 | PASS | §5 明确不存在“至少任务数”质量门槛 |
| P2 | PASS | §5 Required Set 表按必备内容及锚点存在性自检 |
| P3 | PASS | §5 Gate-1/Gate-2 为存在性硬门禁，失败禁止实施 |
| P4 | PASS | 首段 T3；§5 分别列 T1 共通、T2 模块、T3 接口/兼容要求 |
| P5 | PASS | §4、§5 新阻断口径不唯一即 DELEGATE_QUESTION，不由实施自行扩范围 |
| P6 | PASS | §4 明确“事件对齐记录”留痕位置，列新假设/风险/阶段切换与本轮记录 |
| P7 | PASS | 没有澄清问题数上下限；模板和触发规则不以数量判质量 |
| P8 | PASS | §4 有 P0/P1/P2 批量模板，明确本轮未触发及原因 |
| P9 | PASS | §5 明确 planner 落盘后 Gate-1、fresh reviewer 主检/根复核 Gate-2 及失败回环 |

方案同时明确所有 impl 包不递归委派，未安排后续 agent 再派研究或下级执行。

### 基线与澄清一致性复核结果：PASS

- 未回答 Q&A：为空。已有自主开发授权可消费，不引入新用户审批。
- 当前记录作为可变中心、一层/两层和双证据过滤均遵守最终基线；行业的一跳建议与淡背景建议已明确取舍，无镜像契约冲突。
- 新请求 UUID 优先；local true 采纳一层，absent/false 保留旧范围/协议；定位仍由旧 token/latest-record 路径完成。空间路径保留共享筛选，旧 Ctrl K 保留清筛选行为，来源不被合并成相反语义。
- 主题聚焦复用 full 坐标/degree，display 仅裁节点/incident 边与重算 bounds；计数/正文读 full，恢复全部不重跑子集布局。主题 fit 明确在 setLayout 后，选择/外观不触发装饰飞镜头。
- 并发文件只在最新版本做本轮小补丁；S3 最终执行主体已修订为第三 impl，root 不代改代码，符合当前 owner 边界。

### 设计味道扫描结果：PASS

未发现需要阻断的已知反模式。两个小型纯投影复用既有模型；optional local 是单一用途的兼容字段。保留旧 owner 生命周期与 policy，不增加关系层、持久化或导航抽象。

### Gate-2：PASS

十项必填字段齐备且结论一致。**allow_enter_impl: yes**。root 全文复核后可按既有授权派发 S1/S2/S3；没有新增批准步骤。

## 非阻断关注与后续证据

- 选择改变 display edges 会触发 scene setLayout/rebuild；现有 API 可行，但纯投影测试不能证明实际点选/窄屏/多点遮挡舒适度。根必须执行已列现场，不将本 Gate-2 当作 GPU 结果。
- 显式 fit 意图必须可区分“恢复全部按钮”与“跨主题 picker 自动恢复全部”：后者按合同不飞镜头；重复点击当前主题/适配全部也要在当前 setLayout 后得到实际适配。这是既有合同的实现注意点，未要求新增框架。
- 新功能仍未实施；新测试、fresh 全量 test/build、最终 SHA 集、浅深/390px UI 和独立实施后审查仍需产生。代码变更后重新验证与复审；设备/原生/长期耗电保持未测。

## contract drift / stale / mirror mismatch

无阻断漂移。已消费 S3 owner 最终修订；旧 Spatial 文档的版本事实已在 research/readiness 明确，S3/root 指定实施后同步并保留并发段落。feature README 阶段等待 root 消费本结论推进，属于正常编排状态，不是产品已完成证据。

无新增跨功能事实候选。
