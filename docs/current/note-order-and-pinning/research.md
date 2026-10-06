# 记录排序与置顶调研导航

日期：2026-10-04。本阶段只记录观察，不把建议算实现。

- [代码库事实](research-code.md)：卡片旧抓手是限幅回弹；Notes数组过滤保序，但桌面load以created_at重排；本轮不改导入校验/空库回退/双effect既有问题。
- [业界事实与取舍](research-industry.md)：核对官方固定发布 API、React19依赖范围、MIT、两代dnd-kit、实际本地Motion14二维实现和SQLite元数据语法。推荐现成抓手/键盘/取消而非手写全套。最新主线并未被断言不稳定，Motion并未被误称不能二维。
- Root实际补读：types/store/desktop/App/NotesView/notePresentation/SoftInteraction/Rust、tsconfig.json和vite.config.ts；root浏览官方 [useSortable](https://dndkit.com/legacy/presets/sortable/use-sortable/)、[SQLite ADD](https://www.sqlite.org/lang_altertable.html)、[Motion Reorder](https://motion.dev/docs/react-reorder)确认建议。新增依赖沿现有public/third-party-licenses放许可，不引入不存在的license插件。

U1的当前用户动态设置只影响旧装饰抓手是否启用；真实新能力与动效分离，不需要猜当前开关。U3–U7的日期/过滤/元数据/迁移/触屏验证边界由clarifications.md锁定；现阶段不称实际UI或新迁移已验证。

## 取消接口增量（readiness1之后）

[legacy取消与落点](research-cancel.md)、[现代0.5.0完整API](research-modern-cancel.md)补齐最初研究未覆盖的事实：legacy取消/detach私有且Context卸载不销毁active实例，因此原报告的legacy建议被修正。现代公开stop终止会话，真实Provider卸载销毁manager/活动sensor；stop独自不等于清监听，默认未处理blur/visibility。根实际独立读固定发布Provider useInsertionEffect、manager.destroy、Pointer cleanup/destroy与nativeEvent字段，源读取exit0。选择modern0.5.0，不是依据版本号判断稳定性。最终pointerup必须查本次client坐标，键盘独立；type/accept限制组，drop-only source.initialIndex/index、中文Accessibility/handleRef替代旧API词汇。

Root再次浏览官方[现代useSortable](https://dndkit.com/react/hooks/use-sortable/)与[Accessibility](https://dndkit.com/extend/plugins/accessibility/)；最终仍以固定发布物约束Latest页面。真实sensor清理、焦点和optimistic视觉回滚仍需实施后操作，不把静态证据冒称应用通过。window永久noop touchmove patch不归入“所有全局监听已清”。

基线现场证据：TEMP/qingjian-note-order-20261004/before54文件和SHA、git-status-before、真实库只读snapshot3notes/0transactions及安全backup；root本轮原0.5.3 npm run build exit0，JSgzip138.58kB/CSS8.72kB，仅作前比较。PWA closeBundle38.3s的plugin timing警告仍保留。

已见失败：批量读取截断后独立重读；root猜tsconfig.app.json不存在，实际rg找到tsconfig.json；agent源码路径/类型文件/官方URL猜测失败已在两份原报告保留。调查没有代码改动，也没有新功能测试通过证据。
