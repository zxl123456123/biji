# 排序取消、监听生命周期与落点：补充只读调查

日期：2026-10-04。按 codebase-research 补充调研合同执行，不递归委派，不安装依赖或改项目。本调查对象是 npm 固定发布物，路径统一前缀为 C:/Users/ZXL/AppData/Local/Temp/qingjian-note-order-20261004/。行号均为真实解包文件的 1-based 行号。已阅读 verification-before-completion；本轮读取、定位、许可校验命令均退出 0。不是浏览器回归或应用验收结论。

## A. 系统边界与直接结论

1. legacy 6.3.1 不提供干净的应用主动取消/实例销毁 API；仅 key 重挂 DndContext + 清应用 active state，不能证明活动 Sensor 文档监听已清理。
2. 默认 pointer outside / window blur 不取消；resize、visibilitychange、pointercancel、Escape 有取消处理。visibilitychange 实际注册在 window，是否在目标 WebView2 收到所有 hidden 事件须真实验证。
3. collisionDetection 返回 [] 并不等于实时 pointerup 取消；pointerup 不采集最后坐标，DndContext 使用上一轮 sensorContext。必须区分键盘 drop 与 pointer 最终落点。
4. 新版 0.5.0 有公开 manager.actions.stop({canceled:true}) 与 manager.destroy()。准确 API 名称不是 actions.cancel，也没有统一公开 sensor.dispose。新版真正 Provider 卸载会 destroy manager；此生命周期与 legacy key 重挂不同。
5. 根据 root 最新交接，技术候选已转向现代 0.5.0。此处仅交接该更改所需事实；现代详细接线由另一调研负责。

## B. legacy 入口与主流程事实

### 默认 Sensor 取消条件与清理

[原发布 tarball](https://registry.npmjs.org/@dnd-kit/core/-/core-6.3.1.tgz)：core-6.3.1/package/dist/core.esm.js。

- AbstractPointerSensor.attach():1435–1448 注册 move/end/cancel、window resize/visibilitychange 与 document keydown。EventName:1066–1076 中没有 Blur；attach 没有 pointerleave、mouseleave、blur 或容器边界判断。
- PointerSensor:1609–1628 把 pointercancel 接到 handleCancel，把 pointerup 接到 handleEnd，并明确将活动监听挂 ownerDocument，以支持源节点卸载后继续拖拽。
- handleEnd:1567–1578 先 detach 再 onEnd，且不接收/使用 pointerup 参数。最后坐标仍为 handleMove 写入的数据。
- handleCancel:1581–1592 先 detach 再 onCancel；keydown:1595–1598 收到 code=Escape 时走此路径。
- detach:1474–1484 即时清 move/up/cancel/window 监听，document click/selection/key 监听延迟 50ms 清；这是正常结束路径的有意短延迟，并非立即“所有监听归零”。
- KeyboardSensor.attach:1154–1158 同样注册 resize、visibilitychange；handleEnd / handleCancel / detach:1319–1340 清 document/window 监听，没有 blur 入口。

因此（推断）“离开卡片区域自动取消”必须由应用合法 drop 契约控制，不能把最近目标当作在区域内；“窗口 blur 取消”也不能依赖这些默认注册。

### 为什么 key 重挂 legacy Context 不足

- activeSensorRef 的所有出现：2998 构造 ref、3016 new Sensor、3104 设置 state、3119 保存实例、3161 正常结束时置 null；未观察到卸载 cleanup 调其 detach。
- useSensorSetup:2334–2358 只执行 Sensor 静态 setup() 的 teardown，不销毁活动 Sensor 实例。PointerSensor / KeyboardSensor 没有此类静态活动实例释放方案。
- sensors/types.d.ts: SensorInstance 只有 autoScrollEnabled；Sensor 构造接口与静态 setup 为公开 API，无 cancel/destroy/dispose。
- sensors/pointer/AbstractPointerSensor.d.ts 中 attach、detach、handleCancel 全为 private；sensors/keyboard/KeyboardSensor.d.ts 中同样为 private。PointerSensor.d.ts 没有额外公共/受保护取消入口。

结论：subclass 不能合法调用这些 private 成员。此调查不推荐私有访问、类型强转 hack、全局合成 Escape 或其他会触发 App 弹层关闭路径的事件伪造。

### 焦点恢复可能覆盖新弹层

RestoreFocus:2689–2746：只针对键盘 activator，旧 target 若已不是 activeElement，库在 requestAnimationFrame 对抓手/卡片第一个 focusableNode 调 focus。没有“新弹层是否打开/已有新焦点”条件。若程序化取消后弹层输入框先取得焦点、原抓手仍注册，则该 RAF 可能把焦点拉回抓手（推断）。core DndContext.d.ts 公开 accessibility.restoreFocus:false 可关闭此机制，不能把 key 重挂当作 focus 与 listener 两件事都处理好的证明。

## C. 最后 over 与合法 drop 的证据

### 空碰撞数组仍可能留下旧 snapshot

- core.esm.js:2977–2992 根据 activator 初始坐标 + 最近 translate 得 pointerCoordinates；render 时计算 collisions 与 overId。
- :3244–3286 在 useEffect([overId]) 内 setOver(newOver/null)。
- :3287–3307 在 layout effect 中写 sensorContext.current，包含 collisions 与 over。
- :3121–3173 pointerup 的结束 handler 读取 sensorContext.current 的 active/collisions/over，而不是重新用 pointerup 坐标测量；cancelDrop 也收到这个 snapshot。cancelDrop:true 才把 DragEnd 换成 DragCancel。

事实是：[] 被正常渲染与 effect 落地后，over 可转 null；但快速 move→up 或尚未落地的 effect 存在上一轮 snapshot 的时序窗口（推断），不能把“collision callback 会返回 []”写成最终取消保证。closestCenter 只按距离排名，在远离卡片时仍可选择目标；pointerWithin:472–480 对无 pointerCoordinates 返回 []，不适合无条件套在键盘流程上。

### 最小合法落点契约（给 planner 的推断，不是已实施代码）

- 两种输入都必须：活动 ID 与目标 ID 仍属于当前允许排序的完整同组；目标未禁用；未有 blur/hidden/弹层/导航/筛选变化等中断；同 ID 直接无操作；拒绝跨置顶/普通块的隐式状态变化。
- Pointer / touch 还必须：以本次真实 pointerup 的 client 坐标检查允许块当前可见边界（与 viewport/滚动容器可见区域相交）；不能只用旧 over、初始 activatorEvent 坐标、拖影矩形相交、无限距离 closestCenter 或上一次 pointermove。
- 键盘必须独立允许：依赖合法同组目标与排序索引，无须真实 pointer 坐标。任何“指针在区域内”判据只加在 pointer 输入上。
- 本调查不主张限定一定要指针落在卡片内部；块内卡片间隙可合法，但块外、其他 UI 与不可见部分须明确拒绝。最终选哪种 gap 语义由 planner 固定后测。
- Cancel 判断与“写数据库”门禁是不同边界。拒绝 drop 必须保持完整 Notes 数组不变；若库已做 optimistic DOM 变化，取消还需恢复 DOM/索引或真正重挂到原权威数组，不能只不调用 setNotes 就声称视觉回滚。

## D. 现代 0.5.0 的最小替代事实

[abstract 原包](https://registry.npmjs.org/@dnd-kit/abstract/-/abstract-0.5.0.tgz)、[dom 原包](https://registry.npmjs.org/@dnd-kit/dom/-/dom-0.5.0.tgz)、[react 原包](https://registry.npmjs.org/@dnd-kit/react/-/react-0.5.0.tgz)。

| 精确锚点 | 已观察到的行为 |
| --- | --- |
| abstract-0.5.0/package/index.d.ts:1024–1047、1294–1296 | manager.actions.stop({event?, canceled?}) 为公开 API，返回 void；无 actions.cancel |
| abstract-0.5.0/package/index.js:1130–1189 | stop 同步 abort operation controller、设置 canceled、dispatch dragend；渲染后状态 dropped/reset 是异步，不能称全部同步销毁 |
| abstract-0.5.0/package/index.js:1521–1527 | destroy 先 stop({canceled:true})，再 registry.destroy/collisionObserver.destroy |
| abstract-0.5.0/package/index.js:1355–1360 | registry.destroy 包含 draggables/droppables/plugins/sensors/modifiers 的 destroy |
| react-0.5.0/package/index.js:118–121、189–199 | Provider 的 useStableInstance 创建自己的 manager；useInsertionEffect cleanup 调 manager.destroy() |
| dom-0.5.0/package/index.js:1798–1805、2137–2153 | Keyboard/Pointer destroy 清活动 cleanup 集与 listeners.clear |
| dom-0.5.0/package/index.d.ts:77–96、168–182 | 新 Sensor 有公开 destroy 和 protected cleanup/取消相关入口；不存在统一公开 dispose |
| dom-0.5.0/package/sortable.js:523–570 | optimistic plugin 对 canceled dragend 排队恢复 source/同组 indices 至 initial 值；这是异步回滚，非立即所有 DOM 已还原 |

stop 与 destroy 不等价：已读代码未显示外部 stop 会直接调用 Pointer/Keyboard 的活动 cleanup。因此程序化 blur/弹层/导航“只 stop 后继续留旧 Provider”不能声称活动监听已全部移除；真正卸载旧 Provider 后的 destroy 有清理链证据。若传入同一个外部 manager 又 key 重挂，将重用已 destroyed 的实例；新 Provider 必须拥有新 manager（推断）。不能用 legacy 生命周期经验替代现代真实验证。

新版 Feedback 在 dom index.js:1103–1109 也会按旧 manager registry 中的 handle 恢复键盘焦点；:1194–1220 的落下动画链可能排队执行。destroy 后 registry 已清空，后续从旧 registry 查询会找不到 handle（推断），但实际弹层/键盘焦点时序必须回归。最新网页 KeyboardSensor 叙述已改为 key；固定 0.5.0 JS:1667 实际仍检查 event.code，务必以锁定发布物为准。

公开 manager/hook 与清理概念：[官方 manager](https://dndkit.com/concepts/drag-drop-manager/)、[useDragDropManager](https://dndkit.com/react/hooks/use-drag-drop-manager/)。具体 stop 签名以前述发布类型为准，官方 manager 页面未直接列出该动作签名。

## E. Legacy 四个包的 MIT 原文路径

以下均来自各自 npm 固定 tarball；实际读取 core LICENSE 全文，并独立计算四份 SHA256 完全相同：537607E3F1533AD2C5B12978967F5AB27F34FFB7E626E321017A7CCCA6CC24FF。原文版权为 Copyright (c) 2021, Claudéric Demers；包各自 package.json 的 license 也为 MIT。

- C:/Users/ZXL/AppData/Local/Temp/qingjian-note-order-20261004/core-6.3.1/package/LICENSE
- C:/Users/ZXL/AppData/Local/Temp/qingjian-note-order-20261004/sortable-10.0.0/package/LICENSE
- C:/Users/ZXL/AppData/Local/Temp/qingjian-note-order-20261004/utilities-3.2.2/package/LICENSE
- C:/Users/ZXL/AppData/Local/Temp/qingjian-note-order-20261004/accessibility-3.1.1/package/LICENSE

[utilities 原包](https://registry.npmjs.org/@dnd-kit/utilities/-/utilities-3.2.2.tgz)、[accessibility 原包](https://registry.npmjs.org/@dnd-kit/accessibility/-/accessibility-3.1.1.tgz)。本轮技术候选既已转现代，最终 third-party notices 应按现代实际安装依赖闭包重核；这四份只为初始 legacy 调研追溯，不代表最终全部依赖。

## G. 未关闭的不确定点

- U1：这些源码证明入口/生命周期，不证明 WebView2 实际 blur/hidden、原生触屏 pointer capture 与焦点排队时序；由最终浏览器与 Windows 回归确认。
- U2：最终采用现代 Provider 重挂后，是否完整移除旧 keyboard capture / click prevention 与浮层，以及是否无晚到回调提交；必须在实际应用观察取消后下一次正常操作，而非只看 activeId 空。
- U3：最终 pointerup 合法边界与键盘同组索引门禁尚未实施。本报告给的是可核查契约，不是验收 PASS。

## H. Readiness reviewer 的最小证据

重点查：legacy AbstractPointerSensor.d.ts/private；core.esm.js:1474/1624/2334/2998/3121/3244/3287/2689；modern abstract index.d.ts:1036、index.js:1130/1521/1355；react index.js:189；dom index.js:1798/2137；四份 LICENSE 与 hash。本次没有 UI 调用、实现或安装依赖；无独立应用测试。

发现的诊断失败：最初研究一处 types.d.ts 猜错和合并输出截断已在 research-industry.md 记录；本补充调查没有新读取/命令失败。未引用搜索返回的二手文章。无跨功能事实。

