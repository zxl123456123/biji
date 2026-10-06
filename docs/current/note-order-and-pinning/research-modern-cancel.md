# modern dnd kit 0.5.0 取消与生命周期补充调研

调研日期：2026-10-04（Asia/Shanghai）。只读既有 npm 发布包与官方文档；只新增本 TEMP 报告，未安装项目依赖、修改源码、操作数据库、浏览器或服务。已完整加载 `C:/Users/ZXL/.codex/skills/codebase-research/SKILL.md`，未递归委派。

## A. 系统边界与现有能力

已采用用户选项：记录通过抓手调整排列，重启保留；独立置顶区。此报告只核 modern 库的公开 API 与真实发布 JS 生命周期，不改变产品范围，也不评价 legacy 实现的最终结论。

检查目录根：`C:/Users/ZXL/AppData/Local/Temp/qingjian-note-order-20261004/`。实际已读 `react-0.5.0/package`、`dom-0.5.0/package`、`abstract-0.5.0/package` 的 package.json、相关 index.js/index.d.ts/sortable.d.ts；三者 package.json 均是 0.5.0，repository 均为官方 https://github.com/clauderic/dnd-kit 。未读取 helpers 的完整发布实现；drop-only 手动管理路线不要求 helpers。

关键结论：**存在公开程序停止 API，也存在 Provider 卸载 → manager.destroy → sensor.destroy 的真实清理链；但 stop 单独不能等价于 sensor 活动监听清理；默认没有 blur/visibilitychange 取消。**

## B. 入口与主流程

### 公开停止与 Provider 卸载

- `react-0.5.0/package/index.d.ts:63` 导出 `useDragDropManager(): W | null`；`index.js:202–203` 返回当前 Context manager。官方说明这是直接调用 manager actions 的入口：[useDragDropManager](https://dndkit.com/react/hooks/use-drag-drop-manager/)。
- `abstract-0.5.0/package/index.d.ts:1036–1047` 公开 `actions.stop(args?: { event?: Event; canceled?: boolean }): void`；manager 的 `actions` 字段在同文件 1296 行公开。可传 `{ canceled: true }`，无需 private hack 或派发全局合成 Escape。
- 发布 `abstract/index.js:1130–1191` 的 stop：检查操作 controller，abort，设置 canceled，派发 `dragend`（含 canceled），等待 renderer 后复位 dragOperation。它没有调用 PointerSensor/KeyboardSensor 的 cleanup。
- `react/index.js:118–121` Provider 用 useStableInstance 创建或接收 manager；`189–199` 的 useInsertionEffect 清理直接调用实例 `.destroy()`。这包含传入的 manager 实例，不仅内建实例。
- `abstract/index.js:1521–1527` manager.destroy 在非 idle 时 stop({ canceled:true })，然后销毁 modifiers、registry、collisionObserver；`1561–1563` 还清理 manager 自身 reactive effects。
- `abstract/index.js:1355–1360` registry.destroy 调用 draggables/droppables/plugins/**sensors**/modifiers.destroy；`315–319` PluginRegistry.destroy 遍历每个实例 `.destroy()` 后清空。

### sensor 活动资源

- Keyboard：`dom/index.js:1715–1724` 将 sourceDocument 的 capture keydown 解绑函数纳入 cleanupFunctions；`1798–1805` cleanup 清理所有函数，destroy 再调用 listeners.clear。
- Pointer：`dom/index.js:2016–2045` document pointermove/up/cancel/native dragstart 监听的解绑函数进入 cleanup Set；`2104–2128` 活动 touchmove/click/contextmenu/keydown 同样登记；`2137–2153` cleanup abort 未完成 activation controller、清 latest、执行全部解绑，destroy 再 listeners.clear。
- Pointer/Keyboard `cleanup` 在发布类型里为 **protected**（dom/index.d.ts:95、181），非直接公开消费 API；`destroy()` 是公开方法，但本报告不建议越过 manager registry 生命周期单独销毁仍被引用的 sensor。
- **stop 单独无 sensor cleanup**：完整发布 sensor 构造/行为段没有 dragend 订阅来自动清理；manager.stop abort 的是 dragOperation.controller，而 PointerSensor 自身 activation controller 是另一个对象。若仅调用 actions.stop 并保持 Provider，应单独验证后续 pointerup/keydown 与重新激活行为，不能宣称全部活动监听立即被移除。
- **真实 Provider 卸载会清 sensor 活动资源**，包括尚未激活的 Pointer delay controller。卸载同 React 生命周期发生，不等同于 stop 时同步完成所有 manager 动画承诺。
- 非活动的全局副作用边界：`dom/index.js:2167–2176` patchWindow 用 WeakSet 给 window 注册一次 noop touchmove（passive:false），此处未返回移除函数；所以不能把 Provider 清理概括为“库的每一个全局监听都移除”。该事实不否定上面的活动 sensor 清理链。

## C. 关键模块与职责划分

### 生命周期事件与取消缺口

Provider 的公开 props：`react/index.d.ts:9–18` 包含 onBeforeDragStart/onCollision/onDragStart/onDragMove/onDragOver/onDragEnd，以及 manager 输入配置。事件回调第二参数是 manager；发布 `react/index.js:128–163` 实际传入。

Pointer 默认取消：`dom/index.js:2029–2030` pointercancel；`2075–2078` Escape；activation abort → handleCancel；`2130–2135` 停止且 canceled:true 后 cleanup。Keyboard 默认 Escape cancel，Space/Enter start，Space/Enter/Tab end，四方向移动，见 `1628–1643` 与 `1726–1750`。

本次对上述三个包完整 index.js 做 blur/visibilitychange 字面搜索无命中；Pointer/Keyboard 活动监听清单也无这两事件。因此 **blur/visibility 不由本发布版本默认处理**。应用必须持有公开 manager 并建立自己声明的生命周期边界（推断）；不能仅靠 aria-disabled、降低动画或清 React activeId 认为 library session 已终止。

### drop-only 与位置字段

`react/sortable.d.ts:14–24` 返回 sortable 实例及 ref、sourceRef、targetRef、handleRef、isDragging/isDropping/isDragSource/isDropTarget。`dom/sortable.d.ts:30–49` 输入要求 index，可选 group；`75–82` 实例公开 index、initialIndex、group、initialGroup。

官方 [Managing sortable state](https://dndkit.com/react/guides/sortable-state-management/) 说明默认 OptimisticSortingPlugin 在 dragover 时移动 DOM，React state 可以仅在 onDragEnd 写入。取消事件必须检查 event.canceled；使用 source 的 initialIndex/index。**不能照搬 legacy active.id !== over.id 判断**，因为 optimistic sorting 下 source/target 可成为同一项。源码类型与文档一致。该路线可以手动管理，不强制引入 @dnd-kit/helpers。

### 禁跨组 collision

仅设置 group 不等于禁止跨组：官方 useSortable 文档把 group 用于多列表，accept 缺省接受所有 draggable。[useSortable](https://dndkit.com/react/hooks/use-sortable/)

`dom/sortable.d.ts:30` 同时继承 DroppableInput；`abstract/index.js:396–411` 在 collision detector 前排除 disabled 或 `!entry.accepts(source)`；`741–755` accepts 支持 predicate、type array 或单 type。所以 type + accept（或 accept predicate）确实是公开的候选过滤入口，不需要侵入 private collisionObserver。`onCollision` 也可 preventDefault 阻止自动选 target；`onDragOver` preventDefault 可阻止该次 optimistic move，见 [DragDropProvider](https://dndkit.com/react/components/drag-drop-provider/)。具体组映射与排序边界由 root 实现合同决定，本报告未写实现 patch。

### 纯展示 DragOverlay 与抓手

- 发布 `react/index.d.ts:36–52` 的 DragOverlay props：children（ReactNode 或 source 回调）、className、style、tag、disabled、dropAnimation。dropAnimation null 禁动画；默认 250ms ease。
- 官方要求每 Provider 一个 Overlay；children 仅在有 source 时显示，支持简单 clone/preview：[DragOverlay](https://dndkit.com/react/components/drag-overlay/)。纯展示节点足够；不要求 overlay 再注册 sortable 或复制业务动作。
- `react/index.js:302–326` 将 overlay 接入 Feedback；`327–345` 内部代理使 overlay registry register/unregister noop。这个内部机制仅作已读事实，消费者无需也不应复制代理代码。
- modern **没有 legacy 的 attributes/listeners/getHandleProps 返回对象**。`react/sortable.d.ts:20–23` 返回 handleRef/ref/sourceRef/targetRef；input 的 handle/element/target 允许 Element 或 React Ref，见 9–12 行。官方 [useSortable](https://dndkit.com/react/hooks/use-sortable/) 明确 handleRef 连接抓手，ref 连接 draggable/droppable。

### keyboard 与中文读屏入口

默认 preset 的 sensors 含 PointerSensor、KeyboardSensor，plugins 含 Accessibility，见 `dom/index.js:2180–2183`。dom/sortable.d.ts:63 默认还包含 SortableKeyboardPlugin 与 OptimisticSortingPlugin；需保留这些默认插件，不能误用替换数组删除。

中文有公开配置入口：`dom/index.d.ts:187–226` Accessibility options 有 announcements（dragstart、dragend 必需，dragmove/dragover 可选）、screenReaderInstructions:{draggable:string}、debounce（默认500ms，只限制 move/over）、id/idPrefix。通过 `Accessibility.configure()` 插件 descriptor，并在 Provider plugins 扩展默认项；官方提供 React 配置例子：[Accessibility](https://dndkit.com/extend/plugins/accessibility/)。

实际 `dom/index.js:189–208` 调用自定义 announcements，`213–216` 使用自定义 instructions.draggable；`239–275` 对抓手或元素设置 ARIA，已有 aria-roledescription/aria-describedby 不被覆盖。默认 roleDescription 是英文 draggable；没有 roleDescription 的 Accessibility option，若必须中文此属性，需由应用抓手预先提供属性（推断，与已读不覆盖行为一致）。公告内容如何取标题/位置是应用事实，不由库自动生成中文。`283–287` destroy 移除隐藏描述、live region、monitor 订阅。

## F. 已阅读官方来源

- https://dndkit.com/react/hooks/use-drag-drop-manager/
- https://dndkit.com/react/components/drag-drop-provider/
- https://dndkit.com/react/guides/sortable-state-management/
- https://dndkit.com/react/hooks/use-sortable/
- https://dndkit.com/react/components/drag-overlay/
- https://dndkit.com/extend/plugins/accessibility/
- npm 发布包在上述 TEMP 目录；其 package.json 标记官方 repository 与 0.5.0 版本。文档 Latest 没有在页面固定版本号，因此本报告以发布 JS + d.ts 约束实际版本。

## G. 不确定点清单

- U1：manager.stop 的异步 renderer/reset/Feedback drop 过程与销毁时序在项目 UI 是否仍出现延后回调；已读静态代码不是实际浏览器验证。需要 root 当前项目真 pointer/keyboard 与取消/卸载验收。
- U2：本次没有运行 published code 的行为测试；没有证明项目 blur/visibility、触屏、IME、读屏或重新进入后的体验。API 与 cleanup 路径证据不能代替项目回归。
- U3：@dnd-kit/helpers 的 0.5.0 发布实现本次未核；手动 drop-only 路线可不依赖它，若采用 move helper 则另核取消语义。

无待用户决策；产品选项已明确。

## H. 最小可核查证据与失败记录

关键正向锚点：react/index.d.ts:63；abstract/index.d.ts:1036；react/index.js:189；abstract/index.js:1521、1355、315；dom/index.js:1798、2137；dom/index.d.ts:95、181、213、217；react/sortable.d.ts:14；dom/sortable.d.ts:41、80；abstract/index.js:408。

已观察事实：存在公开 stop，真实 Provider 卸载调用 destroy，sensor.destroy 清活动监听与未激活 controller；stop 本身不调用 sensor.cleanup；默认没有 blur/visibility；公开 accept 和中文公告配置均存在。应用采用何种 lifecycle wrapper 属实施推断，未在本报告写源码。

实际失败保留：第一次带引号的大 rg 正则转义失败，exit1（unclosed group）；随后改成独立 -e 模式，exit0。几次组合工具输出超总预算截断，仅用其索引定位，随后对关键行分段全文读取，不能把截断输出算行为验证。猜测官方路径 `/core/plugins/accessibility/`、`/llms.txt`、`/react/guides/detecting-collisions/` 返回不可访问；正确 Accessibility 来源通过官方搜索找到并已读。所有结论锚点来自成功读取的发布代码与正确官方页。

无跨功能事实；库版本细节与本轮暂时未知不建议沉淀到 AGENTS.md。
