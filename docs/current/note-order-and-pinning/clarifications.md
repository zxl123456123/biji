# 记录排序与置顶：决策和完整实现基线

日期：2026-10-04。coordinator 所有者；本文件是后续唯一需求基线。

## 未回答

无。功能范围由用户选项关闭；下述技术细节是该范围内的实施判断，不冒称用户逐项选择了库或 SQL。

## 已回答

### Q1：卡片拖拽采用哪种方式？

提问原文：“你希望卡片拖拽采用哪种方式？我推荐拖动抓手调整排列顺序，并在重启后保留；置顶记录放在独立区域。”

用户原答：“调整排列顺序，重启保留（推荐）”。据此实施抓手排序、保存顺序、独立置顶区。没有扩成自由画布、多选拖动或跨日期修改。

### Q0：实施与制品授权

此前用户原文：“继续，开发完之后构建exe，完成最小mvp”“下一步直接开始做？……带着个这个功能继续做看看”。当前功能请求与 Q1 是继续开发授权。按开发者指令与用户“已有授权不重复确认”规则继续研究、技术 Gate、实施、验证、EXE；不开启自动 LW 会话，也不把该授权用于未知混合 Git 改动或破坏性操作。

## 头脑风暴决策

用户已确认的目标是 Q1 的持久排列和独立置顶区。技术取舍由 coordinator 根据实际代码/官方资料负责：

1. 完整 Notes 数组作为顺序唯一权威，Note 只增加可选 pinned；SQLite 内部 position 对齐数组，不另造偏好 ID 列表。旧正文和交易保留。
2. 固定 @dnd-kit/react 0.5.0 和直接消费公开插件的 @dnd-kit/dom 0.5.0；其余实际依赖闭包锁定并审计。最初 legacy 候选因缺少公开外部取消/活动 sensor 销毁接口被补充事实排除。现代 useDragDropManager/actions.stop({canceled:true}) 与真实 Provider 卸载→manager.destroy→sensor.destroy 已核发布 JS；应用只在结束写权威数组，库的 optimistic DOM 属临时展示。Motion14已支持二维，不采用的原因是需自补键盘/读屏/取消及 drop-only。保留原研究候选取舍，不倒改原报告。
3. 同组移动、只在合法 drop 提交一次；筛选子序列合并回完整数组。动态效果只控制过渡和阴影，不能关闭业务排序。日期布局普通记录按日期组内排序；置顶区与日期无关。

**用户确认**：Q1 目标明确确认（2026-10-04）；技术细化在已授权范围内执行。不存在新增需人接受的不可逆风险。上述摘要已在 commentary 呈现，不以沉默作为授权。

## 完整实现基线

### 1. 目标锁

- G1：抓手可以在网格、阅读与日期视图的合法组内改变排列，刷新及桌面程序重启保留；鼠标、键盘都可操作，动态关闭仍可用。
- G2：每条活动记录可显式置顶/取消，独立区域展示并在两种本地存储/备份中保留；编辑、软删、撤销、恢复保留元数据与规范数组位置。
- G3：排序/置顶不改正文、创建/修改时间、计划日期、完成状态、账本和图的语义；筛选与 60 批次不丢隐藏记录。实际回归与新 EXE 有 root 证据，不以截图或子代理自报代替。

### 2. 反目标

- A1：禁止将装饰回弹当排序；禁止用关闭动态禁用业务操作；禁止跨置顶/普通区自动改变置顶或跨日期组偷偷改日期。
- A2：禁止多选、自由画布、云同步/上传笔记、CRDT、分数秩、第二份前端顺序权威；禁止顺手修导入校验、空桌面库回退、双保存 effect 等既有议题。
- A3：禁止覆盖旧 feature/失败证据、丢弃未知工作区、混合提交、提交生成物；禁止以无用例 cargo test 或旧相同 hash 验证新迁移。

### 3. 风险边界

root 承接真实浏览器、临时 SQLite 演练、真实旧库只读前后对比、Windows 构建及自有进程烟测；impl 不运行服务、浏览器或真实迁移。只 ADD 元数据列，真实库已先只读快照与 SQLite backup。降级回旧 EXE 会忽略/丢失新顺序与 pinned，不保证旧版本写入兼容；不删除新列、不自动恢复真实库。全安装流程、原生完整 GUI、触屏/读屏/IME、GPU 帧率、多平台未实测只能报告未测。遇数据改变或 schema 意外立即停真实启动并保留事实，不擅自恢复或删库。

### 4. 验证责任

| 顺序 | 所有者 | 验证与证据 | 缺证据结论 |
| --- | --- | --- | --- |
| 1 | impl | 单元/静态/编译；impl_report_rN.md，记录完整命令输出和退出码 | 未验证/移交，不称交付 |
| 2 | root | npm 全量 test/build；cargo locked check/test；临时库实际迁移和关闭重开；TEMP/root-verification.md | 对应目标未验证 |
| 3 | root | 实际 UI 抓手双向/键盘/Esc/跨区/失焦/关闭动态/过滤/日期/60+/保存回填复制删除恢复/备份往返；截图与逐项记录 | 不能称真实手感/端到端通过 |
| 4 | root | 0.5.4 Windows 构建 exit0、版本/hash、新进程烟测；旧库旧列旧行保持、新列单独验证 | 不能称新 EXE 可运行/迁移正确 |
| 5 | fresh reviewer + root | 独立 Review(Impl) 读实际本轮 diff、计划、root证据；双结论/作者体验门；root读全报告 | 不得标最终完成 |

所有失败（包括调查路径错误、截断和构建警告）保留。fresh reviewer 不能是本轮 implementer。人只承接工具无法完成的现场项，root不能把责任留空。

### 5. 文档职责

feature README 记录原始请求、当前状态和授权；research.md 导航两份实际调研；本文件锁定决策；lwplan 和 review/impl_report 各归对应阶段所有者。root同步 README.md、CHANGELOG.md、Project.Progress.md 及受影响的布局/交互/测试当前事实，新增 Note.Ordering.md 与 Release.Verification.0.5.4.md；不把计划写作现状。旧验证与未达性能边界保留。

### 6. 基线生成规则

需求链为 README 用户“不能移动 + 置顶” → Q1 持久排列/独立区域 → G1/G2；用户“不出bug/可扩展/性能好/本地笔记”与项目数据纪律 → G3 与取消、数据保持验证。具体实现从 research-code.md A–H 与 research-industry.md/research-cancel.md/research-modern-cancel.md 的官方发布 API、SQLite/Joplin 取舍细化。本轮新需求只有排序/置顶，不扩为其他既有用户大范围愿景。

### 7. 基线内容边界

**数据**：Note.pinned?: boolean，缺失视 false；不增加前端 sortOrder。数组包含活动和回收站记录。新记录 prepend；编辑保留 pinned；pin 仅切该字段，不移动规范数组；取消置顶回到其当前规范位置。排序只移动完整数组中所选合法组的可见 ID 槽位，其余 ID/字段/相对位置保持。永久删除原流程不变。

**展示**：全部布局先稳定分区 pinned 与普通。置顶区始终用当前布局的网格/单列形态并按规范顺序，不按日期拆；普通日期区保持现有日期倒序与组内规范顺序。已显示总数仍按置顶优先后普通的共同 60 限额，加载 +60，筛选应用两区。回收站不启用 pin/drag，保持原恢复语义。区标题提供轻量“抓手排序”的可发现提示与置顶数量，按钮 Pin/PinOff/title/aria-pressed 中文。

**移动**：现代 useSortable 根 ref、专用抓手 handleRef；准确 group/index 对应实际渲染子组，type/accept在碰撞前拒绝其他组，不能以group本身冒称跨组隔离。保留默认键盘/SortableKeyboard/OptimisticSorting插件；网格与单列按实际几何移动。正文/其他按钮不启动。指针小距离阈值、抓手touch-action:none；Space/Enter开始结束、箭头、Esc、中文Accessibility.configure说明公告。结束检查canceled、sortable source.initialIndex/index及同组，不照搬legacy active.id!==over.id。完整数据再次验证；Pointer必须用本次nativeEvent pointerup的client坐标落在合法组当前可见矩形与viewport交集内（允许组内卡片间隙），不能只信最后target/初始坐标。键盘不使用指针判据。滤掉hidden/未加载/Trash；错误、outside、Esc、pointercancel无保存，并重置临时optimistic DOM。Overlay常驻、纯展示不注册sortable、不交互/aria-hidden。

**生命周期**：只有合法onDragEnd调一次setNotes。navigation、query/tag/status/layout/批次变化、业务数据外部变化、编辑/标签/快开/AI弹层开启、失焦/后台/unmount取消。公开actions.stop独自不保证sensor.cleanup；必须真实卸载旧Provider销毁manager及活动sensor，新Provider创建全新manager，不重用destroyed实例。session失效标记必须先于取消，晚到回调不写权威数组；拒绝outside也重置临时DOM。应用监听有明确清理，默认版本未处理blur/visibility须应用承接。只能承诺活动sensor/应用监听清理，库单个window noop touchmove永久patch事实保留。排序开关与ambient/reduced-motion无关，只有transition/dropAnimation受motionAllowed控制。沿用SoftButton，真实卡片不再useSoftDrag，旧通用helper不无关删除；不逐帧保存SQLite。

**SQLite**：Rust #[serde(default)] pinned:bool；notes 仅幂等 ADD pinned INTEGER NOT NULL DEFAULT 0、position INTEGER（可空，旧未排序与新保存区分）。加载按 position IS NULL、position ASC、created_at DESC、id ASC，最后 ID 是旧时间相同但历史未定义顺序的确定性回退；不承诺旧未定义 tie 顺序。保存原单事务 DELETE/INSERT，每条完整数组 enumerate 写 position，包含 Trash，失败不提交半表。旧7/8列、当前新列、重复启动、非空交易、失败回滚和关闭重开用同一生产 helper 验证。为测试提取最小 connection级 helper，与功能分成独立工作包，不做无关架构重写。

**依赖/发布**：react/dom两个dnd直接依赖精确0.5.0，不引入helpers（手动drop-only合并足够）；保留所有既有依赖版本。锁文件固定实际传递闭包，MIT/实际许可原文加入现有public/third-party-licenses。体验版0.5.4仅同步项目自身版本；root前后同命令比较实际入口gzip与独立块，不用tarball体积称增量。

### 8. 下游消费规则

readiness 先 PASS，再 lwplan（implementation-planning，T3）自检，再 fresh Gate-2（plan-review）且root复核全部必填项，再 impl（safe-code-changes）。下游只消费本完整基线，不自行从历史愿景拼扩大需求。技术选择冲突通过 DELEGATE_ACTION/QUESTION 返回 root，不递归派任务。

### 9. 状态与兼容性规则

这是新 note-order-and-pinning 正式 feature；旧 feature 未迁移/未覆盖。此时仅基线与调研已落盘，代码未实施。手动模式的连续实施授权来自 Q0/Q1 和开发者要求，技术 Gate 仍是硬门；不能把现有选择声称自动会话。旧 JSON/version1 backup 可读取，metadata可选；新备份保持全数组。旧版 EXE 写回新库不兼容 metadata，说明即可，不为此引入新备份协议。

### 10. 任意阶段补充需求处理

新假设/风险/阶段切换即时在本文件或 README 留痕，root重算基线后再继续。批量阻塞按P0数据/P1语义/P2体验组织 DELEGATE_QUESTION，带原事实、2–4选项与取舍；当前未触发，因为已选范围且技术风险有既定验证承接。低风险补证 DELEGATE_ACTION 回同一agent。review发现局部实现缺陷按下一轮impl；方案缺陷原地修lwplan重Gate，不跳Gate。

2026-10-04事件：readiness1 REVISE只阻断legacy公开取消/清理可行性。已按DELEGATE_ACTION补两个固定包调查，root独立读取Provider.destroy/manager.destroy/Pointer.destroy及nativeEvent类型，并改为modern公开接口、真实Provider生命周期清理；用户产品目标/范围/风险责任未改变，无新增人决策。按发布事实修正旧library锚点和F1–F8导航，恢复同readiness reviewer第2轮，不把第1轮REVISE删除。
