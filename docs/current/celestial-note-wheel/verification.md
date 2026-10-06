# 十二个月记录年轮：实施验证记录

2026-10-06。本记录描述年轮实施时的工作区源码和 Web 预览；后续同源 Windows 制品见[0.8.0 验证](../../Release.Verification.0.8.0.md)，两者均不代表真实设备体验已验收。

## 旧空间清理回归 · 2026-10-06

用户确认移除旧「3D空间」后，当前工作区删除其导航、主题空间/积累轨迹、空间外观和专用场景/测试文件；年轮依赖的 `spatialRuntime.ts`、二维关联图、记录时光与独立伙伴页保留。未清理本机 `luma-spatial-appearance` 偏好键，也未触碰笔记数据。

主代理在本轮重新执行 `npm test`：exit 0，137/137 pass、fail 0；`npm run build`：exit 0，产物含 `CelestialNoteWheel`、`NoteGraph`、`RecordGarden`，无旧 `SpatialNoteMap` chunk；`git diff --check`：exit 0，仅有当前工作区 LF/CRLF 提示。构建仍提示大于 500 kB 的 chunk。

同一 127.0.0.1:1420 IAB 页面现场核对：主导航只有记录、待办、记录时光、关联图、伙伴、账本，旧「3D空间」入口已消失；从记录卡片打开年轮可见十二个月、真实日期和同日 4 条记录；关闭后独立伙伴、记录时光、二维关联图均可打开。未执行原生 WebView 与长时性能验收。

## 本地命令证据

| 命令 | 结果 | 完整输出 | 责任人 |
| --- | --- | --- | --- |
| `npm test` | exit 0；156/156 pass，fail 0 | [npm-test-impl-r1.log](npm-test-impl-r1.log) | impl |
| `npm run build` | exit 0；Vite 大于 500 kB chunk 警告仍在 | [npm-build-impl-r1.log](npm-build-impl-r1.log) | impl |
| `git diff --check` | exit 0；Git 发出本工作区现有 LF/CRLF 提示 | 命令终端输出；未单独存档 | impl |

过程失败：新增测试第一次全量运行 `npm test` 为 exit 1，149 pass/1 fail；`celestialWheelModel.ts` 在 Node 原生 TS 解析下导入 `recordGardenModel` 缺少 `.ts` 扩展，抛出 `ERR_MODULE_NOT_FOUND`。补扩展后，单文件 5/5 和最终全量 156/156 均 exit 0。第一次失败的完整原文未保存为文件，不能以最终日志代替过程原文。

coordinator 的 IAB 预览中，首条记录年轮初次打开显示回退原因 `Illegal invocation`。静态检查定位到场景调度器将 `cancelAnimationFrame` 裸函数传入后以对象方法调用，丢失 Window 绑定；改为箭头包装后，coordinator 在同一 IAB 看到十二圈画布、手动展开后的层间倾斜与深色画面。随后在约 727px 窗口发现环上标签难辨，已将 48 个文字对象改为高对比底、较大字号投影与朝向相机。coordinator 在 **1280×900 IAB** 复核时看到各环月份/刻度、平面十二环和右侧日期导航，并实测展开动画和深浅主题；测试后已恢复原预览设置。当前只有 4 条记录且都在同一创建日，高亮集中一日。以上是 coordinator 的现场回传，不是 impl 独立设备或性能测量。

coordinator 另核实示例「周末去看展览」编辑器设置日期为 9 月 14 日，而创建日归于 9 月 13 日；两者口径不同，年轮仍按用户已确认的创建年/创建日模型，文字摘要已说明。未修改该记录。

焦点过程失败与补修：coordinator 在 IAB 中发现点击关闭或按 Escape 后焦点落到 `BODY`。首次延后还焦仍失败；诊断表明原按钮在 `NoteSorter` 重新挂载后 `connected:false`。现从触发按钮保存 UUID，关闭后在 React 提交完成的 effect 中按 `data-wheel-entry` 找到当前卡片按钮，缺席时退到搜索框，再于下一帧还焦；打开原记录的路径不安排此还焦。coordinator 最终 IAB 复测：按钮关闭与 Escape 关闭后焦点均回到原卡片的 `BUTTON[aria-label="查看记录年轮"]`；从年轮打开“欢迎来到晴笺…”后出现「编辑记录」dialog，焦点位于记录正文。临时诊断日志已移除。该记录只证明这些 IAB 路径，不代表所有筛选、删除或原生窗口场景。

## 已覆盖的纯模型与静态契约

- 测试覆盖平年 365 / 闰年 366、二月 28 / 29、空日、同日多条、删除记录排除、入口缺失/非法日期、本地时区跨日，以及卡片指定日期与年轮创建日期可不同。
- 测试覆盖图谱 `ready` 的双向直接边，`idle/updating/error` 不显示旧关系；场景 slots 与日期键顺序对应。
- 独立审查指出场景「1」「15」标签原先错误指向 2 日/多数月份 16 日；现分别使用日期索引 0/14，新增测试对 28、29、30、31 天月份逐一核对 1/15/末标签。中心记录摘要与同日列表标识也已补充，最终 UI 尚待 coordinator 复看。
- 现有 `spatialRuntime` 测试及新增政策用例覆盖 30fps 调度、隐藏/失焦/暂停时停止持续绘制。构建通过类型检查与资源打包。

## 待 coordinator 现场承接

| 项目 | 期望证据 | 缺证据结论 |
| --- | --- | --- |
| 三排版入口、>60 条分页、筛选与滚动恢复、原编辑 handoff | 浏览器实际操作、截图或录屏，记录测试数据和窗口尺寸 | UI 行为未验证 |
| Modal 背景（含浮层伙伴、桌面标题栏）交互隔离、完整 Tab 顺序、入口失效安全焦点 | 键盘操作轨迹和焦点观察；按钮/Escape 还焦及原编辑交接已有上文 IAB 证据 | 其余焦点行为未验证 |
| 十二圈可读性、首次自动展开、差速、聚焦、暂停/手动姿态、浅深主题 | 实际画面/录屏，注明浏览器、尺寸、DPR | 视觉效果未验证 |
| WebGL 禁用/context lost 回文字路径、重试；系统减少动态、失焦/隐藏 | 真实环境操作记录 | 降级和生命周期未验证 |
| Windows WebView、弱 GPU、鼠标/触屏及长期重开 | 设备、记录数、DPR、画布尺寸、帧时/帧率、重开次数与资源观察 | 性能与设备兼容未验证 |

上述现场项目不属于 impl-safe；coordinator 承接实际运行或引导用户验收。任何一项缺失时，不能写作“体验已通过”。

## 边界

年轮只读取现有活跃笔记、创建日和图谱一跳边；不改笔记、SQLite、备份与网络路径。视觉参考 MIT 授权的 [celestial-wheel](https://github.com/zaoxu001/celestial-wheel)，未复制术数内容。
