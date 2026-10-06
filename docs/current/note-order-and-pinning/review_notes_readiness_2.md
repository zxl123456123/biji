# Readiness 检查记录（第 2 轮）

**评审对象**：最新 research 导航、四份调研正文、clarifications 与 feature README。
**评审时间**：2026-10-04。
**评审结论**：PASS。
**前一轮**：[readiness 1](review_notes_readiness_1.md)，REVISE 保留，不覆盖。

本结论只允许进入低层规划；功能、迁移、取消手感和新 EXE 均尚未实施/验收。本轮仅新增本报告，未启动服务、浏览器、数据库、依赖安装或实施任务。延续已完整读取的 plan-review/development-workflow readiness 合同；不递归委派、不假设 root 私有上下文可见。

## 输入文件与取消证据独立复核

完整读取 `README.md`、`research.md`、`research-code.md`、`research-industry.md`、`research-cancel.md`、`research-modern-cancel.md` 和最新 `clarifications.md`；重新定位当前 `NotesView.tsx` 的旧回弹、`types.ts` 无 pin/order、`lib.rs` 的创建时间排序和无索引事务写入，确认程序仍是未实施状态。

以下发布物均使用实际前缀 `C:/Users/ZXL/AppData/Local/Temp/qingjian-note-order-20261004/`，本 reviewer 直接读取 JS/type，命令退出码 0，不依靠子代理自报通过：

- `react-0.5.0/package/index.js:118–121,189–203`：Provider 自建或接收 manager；useInsertionEffect cleanup 调 destroy；hook 返回该 Context manager。真实重挂且不复用外部 destroyed manager 有清理路径。
- `abstract-0.5.0/package/index.d.ts:1036–1047,1294–1296` 与 `index.js:1130–1191`：公开 `actions.stop({event?,canceled?})`，向 dragend 提供 nativeEvent/canceled；stop 后 reset 异步，不等于 sensor cleanup。
- `abstract-0.5.0/package/index.js:1521–1527,1561–1563,1355–1360,315–319`：destroy 取消活动操作，再销毁 registry/sensors；插件 registry 对每个实例 destroy 并清集合。
- `dom-0.5.0/package/index.js:1798–1805,2016–2045,2137–2153`：Keyboard/Pointer destroy 执行活动 cleanup 与 listeners.clear，Pointer 还 abort 未完成 activation；可行性缺口闭合。
- `dom-0.5.0/package/index.js:2065–2073` → `abstract-0.5.0/package/index.js:1180–1184` / `index.d.ts:1195–1198`：pointerup 的本次 event 进入 dragend.nativeEvent，允许读取最终 client 坐标；键盘结束事件独立，不能套指针边界判断。
- `abstract-0.5.0/package/index.js:396–409,741–755`：accept 在碰撞检测前拒绝候选；`react-0.5.0/package/sortable.d.ts:14–24` 提供 ref/handleRef；`dom-0.5.0/package/sortable.d.ts:41,49,63,79–82` 定义 index/group、默认排序插件和 initialIndex/index；`dom/index.d.ts:187–226` 有中文公告与 instructions 配置入口。
- 三包 package.json 均为官方仓库、0.5.0、MIT。`dom/index.js:2167–2176` 的永久 noop touchmove patch 单独保留，不能声称库所有全局监听都被销毁。

## 澄清与基线核验

### A. 澄清问题完整性

- ① 未回答 Q&A 是否为空：是。`clarifications.md:5–7` 明确“无”。
- ② coordinator 是否漏记澄清问题：未发现。Q1 原提问与原答（13–15）、Q0 连续开发/EXE 授权（19）齐全；本轮补证只调整实现 how，没有新增产品范围或风险接受问题。
- ③ 头脑风暴决策是否完整落盘：是。`clarifications.md:25–29` 保存数组权威、modern 0.5.0 取舍和合法同组提交；第 95 行记载补证、重算及恢复事件。技术细化不冒称用户逐项选库，不重复已有授权，不开启自动 LW。

### B. 基线内部质量

- ④ 必填章节 1–10 存在且非空/非占位：PASS。`clarifications.md:33,39,45,49,61,65,69,83,87,91` 各有任务相关内容。
- ⑤ 目标锁具体可验证：PASS。G1 包含三布局合法组、鼠标/键盘、关动效、刷新/重启；G2 包含显式 pin、独立区、两链存储/备份及恢复；G3 包含正文/时间/账本/图语义和隐藏记录保持，以及 root 新制品证据（35–37）。
- ⑥ 反目标具体：PASS。A1–A3（41–43）禁止项已与本轮目标形态逐项核对；以下结论针对基线，不冒称实现检查。

| 禁止内容 | 可核查证据 | 结论（确认基线不存在该方向） |
| --- | --- | --- |
| 回弹冒充排序、关动态禁操作 | 基线:35,75,77 真排序/drop-only，动效只影响装饰 | 确认不存在；旧回弹是待改现状 |
| 跨 pin 分区自动置顶、跨日期偷偷改日期 | 基线:71,75 显式按钮、accept/同组和最终数据门禁 | 确认不存在 |
| 多选/自由画布/云上传/CRDT/分数秩/第二顺序权威 | Q1:15 与基线:25,42,71,79；关键词仅作排除，完整数组为权威 | 确认不存在 |
| 顺手修导入校验、空库回退、双保存 effect | 基线:42 明确禁止；code 调研:140 单列范围外问题 | 确认不存在 |
| 覆盖旧 feature/失败、丢未知工作区、混合提交/生成物提交 | README:15–17，基线:43,89；本轮只新建报告 | 确认不存在 |
| 0 用例或旧 SELECT* hash 代新迁移、stop/key 假证完整清理 | 基线:54–59,77,79 要求 fixture/旧新列分检、真实 Provider 新 manager 销毁链与晚到回调门禁 | 确认不存在 |

- ⑦ 风险边界明确责任归属：PASS。基线:47 将真实 UI、临时 SQLite、旧库只读对比和 Windows 烟测归 root；禁止 impl 运行服务/真实迁移，明确降级 metadata 不兼容、异常停止及平台未测。
- ⑧ 验证责任有产物/所有者/顺序：PASS。基线:51–59 依次为 impl 静态/单元/编译及 impl_report → root 全量/迁移/UI/制品及 TEMP/root-verification、截图记录 → fresh Review(Impl) 加 root 复核；缺证据有明确未验证约束，无法完成的现场项归 human，不留空。

### C. 基线与澄清一致性

- ⑨ 基线与已回答 Q&A/决策无矛盾：PASS。

| Q&A / 决策 | 对应基线字段/条目 | 一致性 |
| --- | --- | --- |
| Q1：抓手调排列、重启保留、独立置顶区（13–15） | G1/G2（35–36）、数据/展示/移动/SQLite（71–79） | 一致，未扩多选/自由画布 |
| Q0：继续开发与 EXE，排除混合 Git/破坏动作（19） | 风险/验证（47–59）、发布（81）、手动状态（89） | 一致，Gate 保留，不开自动 LW |
| 决策 1：数组权威、可选 pinned（25） | 数据（71）、SQLite（79）、旧备份兼容（89） | 一致，position 是同一数组的持久投影 |
| 决策 2：modern 0.5.0 与公开取消/真实销毁（26） | modern 接线（75）、生命周期（77）、固定 react/dom（81） | 一致，旧 legacy 锚点已替换 |
| 决策 3：同组、合法 drop 一次提交、子序列合并（27） | 可见 ID 槽位（71）、共同 60 限额（73）、accept/输入独立/最终合法性（75）、单次 setNotes（77） | 一致，未覆盖隐藏/未加载全集 |

- ⑩ 基线可从 README + 澄清推导：PASS；以下给出原始语义链，技术保护有实际研究依据。
  - README “没办法……拖拽移动” → Q1 “调整排列顺序，重启保留” → G1 真抓手三布局合法组及跨重启；决策 1/3 将其落为可见槽位合并和 SQLite position，解决当前创建时间读回覆盖手工顺序的问题。
  - README “置顶这个功能”及题干“独立区域” → Q1 确认该方案 → G2 显式 pin/取消与独立分区；决策 1 落为可选 metadata，取消 pin 回规范位置。
  - README:15 需要 SQLite 兼容，README:11 继续实现/制品 → Q0 持续开发/EXE 和决策 1 保留正文/交易 → G3、风险/验证责任及单事务/旧字段保持；取消/最终 pointerup 门禁是“不误保存”的 how，没有新产品分支。
  - README:17 未知混合工作区保护 → Q0 不扩大 Git 授权 → A3、第 9 章保留旧 feature/失败/未测边界。
  - README 原始“拖拽”与 Q1 明确抓手排序 → 决策 2 因真实取消事实更换库 → 基线:75/77/81 采用 modern；改变工具未改变目标、边界或 human 风险接受。

### D. 基线内部一致性

- ⑪ 目标锁与反目标不互斥：PASS。禁止跨区拖拽不阻止显式 pin；日期只在合法组内重排满足 G1；optimistic DOM 是临时显示，权威 Notes 仍 drop-only；关闭动效仍排序。
- ⑫ 风险边界与验证责任不矛盾：PASS。库静态生命周期可行性与 root 真实监听/焦点/视觉回滚验收区分；impl-safe 单元/helper 不等于用户库迁移；触屏/读屏/原生完整 GUI 等未测项不得扩大为已验证。

### E. 与 research 对齐

- ⑬ research 关键约束已进入基线/澄清/风险边界：PASS。旧抓手/动效耦合 → 基线:75/77；数组/编辑/软删/过滤/60 → :71–77；旧 Rust 默认、7/8 列、事务/降级 → :47/79/89；图 semantic id/content → G3；modern ref/handle/index/accept/Accessibility → :75/81；stop 与 destroy 分离、blur/hidden 缺省不处理、晚到回调和永久 noop 例外 → :77；真正 fixture/UI/入口 gzip → :51–59/79/81。来源分别为 code:A–D1/G、industry:3–7、cancel:B–D/G 与 modern:B–C/G。
- 第 1 轮 FAIL 恢复：公开 stop 类型、Provider→registry→sensor destroy 源码已由本审独立核验，基线明确先 session 失效、stop canceled、真正销毁旧 Provider、新 manager、应用监听清理与 pointer/keyboard 分流。取消路径可行性有最小证据闭环；具体组件/事件时序和真实回归由 LW/impl/root 后续承担，readiness 不要求未实施的 UI 验收。

### 澄清与基线核验结论

- 整体结论：PASS；未回答为空，13 项无 FAIL。允许进入 LW 的技术细化，仍须 Gate-1/Gate-2 才能实施。

## 缺失证据

- 应用还没有新排序/置顶实现、modern 安装后回归、迁移 fixture、新 EXE、取消后的焦点/监听/DOM 实测。这些责任已分配，必须保留为后续未验证，不能用固定包源码代应用通过。
- root 此前实际导出 download 事件超时，不能算备份往返通过；后续隔离导入/纯备份测试与下载能力须分别如实记录。TEMP 安全备份/真实旧库 snapshot、本机 Windows 对比本审未操作，不替 root 验收。

## contract drift / stale / mirror mismatch

- 未发现阻断 contract drift。完整 10 章与 formal readiness 13 项匹配；连续开发授权没有替代技术 Gate，自动 LW 仍关闭。第 1 轮文件 SHA256 仍为 `F5C7FCEB8F70DFFCEABFE37021E77F883A28D73BFB196EB24C2F9491508FEB86`。
- industry 原始 legacy 建议保留为历史候选，research:13 与基线:26/75/77/81/95 明确由新增发布事实覆盖；它不再是当前选择。原 F1–F8 导航偏差已在基线:67 修为 A–H，不静默更改旧审查。
- 本轮首次片段读取脚本对单区间数组展开后未输出 React sortable 类型正文，虽命令 exit0，也未将空输出作证据；随后独立完整重读 1–26 行。既有截断、错路径/URL、正则失败、首轮 CRLF 校验失败和 PWA timing 警告仍留在原报告，未隐去。

## 建议恢复动作

- 证据补强：readiness 缺口已闭合；LW 明确取消 wrapper、manager 生命周期、晚到回调、optimistic 还原、最终落点/分组与验证锚点；root 后续执行既定真实证据。
- 契约纠偏：无阻断缺口，无需新增产品/阶段授权；下游只读最新完整实现基线，不能照搬原 legacy API。

## 放行判断

- allow_enter_lwplan: yes
- 无跨功能事实候选。
