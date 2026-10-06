# 抓手排序与置顶：业界事实与选型取舍

调研日期：2026-10-04（Asia/Shanghai）。只读调研；未安装依赖，未修改项目源码、锁文件、浏览器、Git 或数据库，也未运行构建。用户已经选定“抓手调整排列顺序，重启保留；置顶独立区域”。以下“事实”和“建议”分开，建议由主任务结合实际存储代码决定。

## 1. 已核对的版本与许可

本地 package-lock 与 node_modules 均显示 React / React DOM 19.3.0、Motion / framer-motion 14.0.0。Motion 包声明 MIT，React peer 范围为 ^18.0.0 || ^19.0.0。

2026-10-04 从 npm 官方 registry 查询 latest，同时读取固定版本发布物：

| 包 | 实查 latest | 发布时间（UTC） | React peer | 许可 |
| --- | --- | --- | --- | --- |
| @dnd-kit/core | 6.3.1 | 2024-12-05 | >=16.8.0，react-dom 同范围 | MIT |
| @dnd-kit/sortable | 10.0.0 | 2024-12-04 | >=16.8.0；core ^6.3.0 | MIT |
| @dnd-kit/utilities | 3.2.2 | 2023-11-06 | >=16.8.0 | MIT |
| @dnd-kit/react | 0.5.0 | 2026-06-11 | ^18.0.0 || ^19.0.0，react-dom 同范围 | MIT |
| @dnd-kit/helpers / dom / abstract | 0.5.0 | 2026-06-11 | 无独立 React peer | MIT |

两代均满足项目 React 19.3.0 的声明范围；这仅证明依赖约束兼容，不等于已验证 StrictMode、WebView2 或应用交互。官方已经把 core/sortable 文档标记 Legacy，最新主线是框架无关核心 + DOM + React 薄适配层。0.x 版本号本身不能证明“测试版/不稳定”。[官方仓库](https://github.com/clauderic/dnd-kit)、[迁移指南](https://dndkit.com/react/guides/migration/)。

官方 registry 证据：[core 6.3.1](https://registry.npmjs.org/@dnd-kit%2fcore/6.3.1)、[sortable 10.0.0](https://registry.npmjs.org/@dnd-kit%2fsortable/10.0.0)、[react 0.5.0](https://registry.npmjs.org/@dnd-kit%2freact/0.5.0)。下载到此 TEMP 目录的五个原始 npm tarball 及解包内容只用于核对发布 API。

## 2. Legacy sortable 的能力与关键接线

官方 preset 支持网格、横纵列表；rectSortingStrategy 适用网格，verticalListSortingStrategy 适用单列。SortableContext 的 IDs 必须与实际渲染顺序一致；推荐 closestCenter / closestCorners，避免默认矩形交集过于严格。键盘使用 sortableKeyboardCoordinates，实现向相邻卡片移动，而不是默认固定移动 25px。[sortable 概览](https://dndkit.com/legacy/presets/sortable/overview/)。

只在专用 button 抓手上放 attributes/listeners，并设置 setActivatorNodeRef；卡片根节点 setNodeRef。这样正文选择、复制、编辑、置顶按钮不会成为启动拖拽的区域，键盘结束后也能回到抓手。[useSortable 抓手与焦点](https://dndkit.com/legacy/presets/sortable/use-sortable/)。

鼠标可用距离阈值，触屏可用延迟 + 容差；PointerSensor 统一处理鼠标/触屏时，仅抓手设 touch-action:none，正文保持正常滚动。若需要分别控制触屏滚动，官方还提供 MouseSensor / TouchSensor。[PointerSensor](https://dndkit.com/legacy/api-documentation/sensors/pointer/)、[传感器](https://dndkit.com/legacy/api-documentation/sensors/)。默认键盘 Space / Enter 开始和结束、Escape 取消，配中文 screen reader instructions 与 announcements。[KeyboardSensor](https://dndkit.com/legacy/api-documentation/sensors/keyboard/)。

长列表或滚动容器使用 DragOverlay；Overlay 常驻，只条件渲染它的纯展示内容。不要在 Overlay 中再调用相同 ID 的 useSortable，否则源/浮层注册冲突。可以 dropAnimation:null 关闭落下动画，排序功能继续可用。[DragOverlay](https://dndkit.com/legacy/api-documentation/draggable/drag-overlay/)。

发布 API 核对：core 6.3.1 的 DndContext.d.ts 有 onDragCancel、onDragEnd、autoScroll、cancelDrop；accessibility 是包含 announcements、screenReaderInstructions、restoreFocus 的对象。官方 legacy DndContext 页面仍列旧顶层同名属性，不能直接照抄该页 Props。sortable 10.0.0 的 useSortable.d.ts 已确认 setActivatorNodeRef、transition:null 和独立 draggable/droppable disabled。

## 3. 最新 @dnd-kit/react 的真实状态

官方 quickstart 推荐 @dnd-kit/react，排序配 @dnd-kit/helpers；dom/abstract 为传递依赖。0.5.0 发布物的 useSortable 已具 handleRef/ref/sourceRef/targetRef 与 isSortable，DOM 发布物已具 PointerSensor / KeyboardSensor / AutoScroller / SortableKeyboardPlugin / OptimisticSortingPlugin。[quickstart](https://dndkit.com/react/quickstart/)。

最新官方文档说明默认 optimistic sorting 会在拖拽中调整 DOM，并更新 source.index；source 和 target 可能指同一元素，不能照搬 legacy active.id/over.id。结束时使用 source.initialIndex/index 或 move helper，取消不提交；外部数据刷新应避免与活动拖拽同时重置列表。[状态管理](https://dndkit.com/react/guides/sortable-state-management/)。

新传感器按 handle 激活；配置数组替换默认值时必须保留 KeyboardSensor。当前文档提供 pointerType 区分触屏延迟与鼠标距离；published 0.5.0 JS 已查到 pointercancel 与 Escape 取消。[sensors](https://dndkit.com/react/guides/sensors/)。任何最新文档中新选项仍须对照固定版本类型后使用。

## 4. Motion Reorder：必须纠正过去的二维限制印象

截至本次查询，官方 Reorder 文档明确支持网格/换行布局，自动检测轴或 axis="xy"，含边缘自动滚动与抓手 useDragControls。[Reorder](https://motion.dev/docs/react-reorder)。官方二维示例日期为 2026-08-11。[grid 示例](https://motion.dev/examples/react-reorder-grid)。

本地 framer-motion 14.0.0 的 Group.mjs / Item.mjs 独立读取确认：axis===xy 时两轴 drag，调用 checkReorder 与 autoScrollIfNeeded，松手 resetAutoScrollState。没有使用旧版本记忆或只依赖新网页推断本项目能力。Reorder 目录 .mjs 未找到内置 KeyboardSensor / onKeyDown；Group 在拖动中 onReorder 更新值，需要应用自己补键盘排序、取消前快照和读屏反馈。因此本轮不采用它的理由是要补齐可访问/取消与持久化语义，不是“不支持网格”。

## 5. 持久化：简单整数秩与显式置顶

成熟本地笔记软件 Joplin 将 custom order 放在独立 note.order 数值元数据；源码也明确要求相同排序值以稳定字段最终回落到 ID，避免刷新时相同键记录跳动。[Joplin API 的 order 字段](https://joplinapp.org/help/api/references/rest_api/)、[Note.ts 排序源码](https://raw.githubusercontent.com/laurent22/joplin/dev/packages/lib/models/Note.ts)。这是“元数据与正文分离、确定性排序”的参考，不能据此声称 Joplin 使用本建议的连续整数算法或拥有相同置顶功能。

建议（结合已实读的项目存储）：保持 Notes 数组为完整顺序的唯一权威，Note 只新增可选 pinned，置顶/普通块由该数组稳定分区。SQLite 增加内部 position 整数，但不把它再暴露为第二份前端 sort_order。当前 save_data 已在一笔事务里完整重写 notes；保存时按完整数组 enumerate 写入 position，读取按 position 还原数组，既有 Web JSON 与备份数组天然保持顺序。排序只调整数组，不改 createdAt、updatedAt、日期或正文。合法 drop 后一次持久化，取消不写；不需要 CRDT、分数索引或多用户机制。

SQLite ADD COLUMN 支持以默认值增加元数据列；NOT NULL 必须提供非 NULL 默认值。使用项目实际 SQLite 支持的原有语法，不照搬最新才支持的 ALTER COLUMN。[SQLite ALTER TABLE](https://www.sqlite.org/lang_altertable.html)。批量改秩必须由一笔事务提交；出错明确回滚，不能假设任意 SQL 错误都会自动撤销此前语句。[SQLite 事务](https://www.sqlite.org/lang_transaction.html)。

现场事实：src/store.ts 的 loadNotes / saveNotes / exportData / parseBackup 保持数组次序；App.tsx 编辑、软删除、恢复使用 map，新增用 prepend；src-tauri/src/lib.rs:44 当前 load_data 按 created_at DESC 重新排序，:55–57 则删除后按收到数组插入，却不存位置。这正是 Web 数组排序重启桌面会丢失的具体缺口。朴素实现可 ADD COLUMN position INTEGER NOT NULL DEFAULT 0，旧记录同为 0 时先回退现有 created_at DESC；第一次完整保存后 0..n-1 由 enumerate 唯一生成。旧版 created_at 同值时顺序本来未定义，必须用迁移 fixture 实验核对或明确确定性回退，不能承诺未定义的旧相对顺序。迁移应按 pragma_table_info 幂等检查字段、只 ADD COLUMN，不删旧表或重写正文；完整数组入库 transaction 任一步失败均不得提交半个排列。SQLite 官方允许这种带非 NULL 常量默认值的简单 ADD COLUMN；不需要新式 ALTER COLUMN 或窗函数。

另一方案是独立 order_ids/pinned_ids 本地偏好，虽不触碰 note 表，却需额外同步备份、导入、删除/恢复与 Web/桌面两链路，本项目不推荐。前端再加每 Note sort_order 也会与 Notes 数组形成双权威，本轮不推荐。

筛选/分页建议（应用层推断）：最简单安全语义是“存在搜索/标签/状态筛选或日期分组时不排序，明确提示回到全部网格/阅读”。若本轮必须支持筛选排序，则必须把可见 IDs 的调整合并回完整同组顺序，保持未显示记录的相对顺序，绝不能把 60 条显示数组当成全集写回。置顶/取消置顶用显式按钮，块内抓手排序，避免跨块拖动意外改变置顶。

## 6. 三个方案取舍（建议）

| 方案 | 适配本轮的优势 | 本轮代价与结论 |
| --- | --- | --- |
| 固定 core 6.3.1 + sortable 10.0.0 + utilities 3.2.2 | 可控 transform、拖拽结束才提交、现成键盘坐标/抓手/取消/读屏；列表与网格一套机制 | 新增依赖，legacy 主线；本轮推荐，可独立封装一层组件，避免扩散到存储。不是长期永远不迁移承诺 |
| @dnd-kit/react 0.5.0 + helpers 0.5.0 | 官方当前主线；框架适配薄、optimistic DOM 减少 dragover React 更新 | 全新 API，须验证 DOM 所有权与 React/现有 motion、source/target 新语义；不是不稳定断言，本轮不为了排序同时引入主线迁移成本 |
| 复用 Motion 14 Reorder | 已有依赖，二维与 auto-scroll 实际存在，视觉 spring 接入简单 | 键盘/读屏/取消回滚/只在 drop 写持久化需自补；本轮不采用，避免把交互安全重新手写 |

装饰动效策略只能控制 shadow/transition/dropAnimation，不能 disable 排序 Sensor/抓手。这是当前“动态关闭后抓手禁用”问题与真实排序需求之间必须划开的产品语义。

## 7. 包体事实与验证建议

npm 官方元数据的 unpackedSize 包含 CJS/ESM/声明/source map，压缩 tgz 也不是浏览器 bundle；不可据此称新代更小或本轮增量为某 gzip KiB。本次下载原包实测：core 270,941B、sortable 58,102B、react 51,555B、dom 264,133B、abstract 102,623B；均为压缩 tarball，未计算运行时体积。

root 在最终选型后应对同一 Vite 构建前后记录入口/独立块 gzip 增量，并实际检查拖拽事件不逐帧写 SQLite/localStorage、恢复失败与有界 60 展示的完整数据保持。不能用库的性能宣传证明本应用性能。

## 8. 已见调研失败与边界

- 首次合并输出超过上限、误查不存在 dist/types.d.ts；已分别重读实际 Group/Item .mjs 与 fixed-package 类型，未把该 rg 错误当成无键盘证据。
- 猜测新版 drag-overlay guide URL 返回 Internal Error；最终采用官方已存在的 legacy Overlay 文档与发布物，未引用失败页面。
- 猜测 Joplin dev 下原 notesSortOrderUtils.ts 路径 404；最终只引用可读的 Note.ts 与官方 API，不推断旧路径算法。
- 没有实施、没有依赖安装、没有 UI/触屏/读屏/性能实测；版本、许可、约束、tarball 大小、固定发布物接口与本地 Motion 实现核对均在本轮完成，不能代替 root 后续功能验证。

