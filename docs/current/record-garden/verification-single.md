# 单一月历及 0.6.0 工作副本接入验证

日期：2026-10-05（Asia/Shanghai）。范围：独立分支基线 `6a0692f` 的展示收敛，以及当前 `E:/project-funny/biji` 未提交 0.6.0 工作副本的最小接入。不是整个主目录合并、原生发布或完整 MVP 验收。

## 最终 root 命令

所有命令均在本轮实际运行并读取完整输出/退出码；验证命令没有用管道收尾。

- 主目录 `npm test`：116/116，fail/skip/cancel 0，退出 0。原 105 项加 11 项日期模型；完整日志 `main-tests-final.log`，保留 Node stripTypeScriptTypes ExperimentalWarning。
- 主目录 `npm run build`：退出 0，2507 模块；main gzip 181.98 kB、按需时光 JS 4.72/CSS 3.05 kB，既有空间 JS 146.49 kB；PWA 13 项/1285.91 KiB。保留大于 500 kB chunk 告警，没有调高阈值。这不是 GPU/帧率证明。
- 独立分支 `node --experimental-strip-types --test tests/recordGarden.test.mjs`：11/11、fail/skip/cancel 0、退出 0。模型与测试源码未更改，只在当前主目录追加同源测试。
- 独立分支 `npm run build`：退出 0，1878 模块；main gzip 83.40 kB，时光 JS 4.82/CSS 3.05 kB，PWA 7 项/310.85 KiB。相对上一提交 JS 5.58/CSS 3.58 kB，功能包减 1.29 kB gzip；不称整体性能预算达标。

## 实际浏览器验收

- 1437 是新隔离 origin，初始只有三条产品欢迎样本；通过原设置导入入口载入新合成 116 条（115 活动/1 回收站），包含 65 条同日、未来安排、仅标签/置顶。旧 1436 样本和真实 SQLite 未清理或修改；本轮没有保存或删除正文。
- 10 月 115 条/14 天，31 个日期按钮。时光展示形式/立体视角控件数 0；只留日期统计口径。没有旋转文字或日期柱，日期卡静态薄底边/多层阴影存在。
- 10 月 3 日 30→60→65，末批准确“再看5条”，Enter 后聚焦“打开第61条记录”。ArrowRight 只聚焦 4 日而不选日；Enter 选 4 日列表回首批。创建口径 5 条、记录口径 4 条；Home/End 首周 1↔4，9 月空态 0/0，今天返回 5 日。
- 暂停后 motion=off、日期 transition=0s、伙伴眨眼 animation-name=none；静态卡片厚度仍在。开原格式记录和新建均进入当前 NoteComposer，标题/粗体、标签和起笔模板可见，宿主弹层令时光 motion=off。关闭后回到同一页面；没有声称重新完成整套编辑器保存/撤销验收。
- 仅标签记录显示“仅标签记录”；正文复用现解析器、markdown-preview、局部样式，未渲染持久化 HTML。原记录页仍有置顶/排序/编辑动作，浮动晴小团恢复，时光页 hidden=true，两个伙伴不重叠。
- 现有 3D 空间实际打开 115 条/66 关联，画布和完整文字选择仍存在；这只是接入后的入口烟测，不重宣称整套空间交互/GPU验收。
- 原列表查询“晴朗片段 5-0”匹配 1 条；时光仍汇总 115 条，回原列表查询和 1 条结果保留。查询清空后 reload，115/14 与仅标签显示保持。
- 浅色 1280px、浅深 320px、深色 390px 页面无横向溢出；390/320 日期格最小宽约 39.94/32.05px。保存浅色桌面和深色窄屏图；最后 reset 临时 viewport，不要求用户保持测试尺寸。
- 同一 Tab 控制台保留旧 1436 两次初始化错误及 React 警告；1437 验收未见新增 warn/error。不能称所有历史控制台为空。

## 隔离及追溯

接入前在 Temp 保存主目录 267 个既有文件 SHA 和 App/四份当前文档原文。首次核对：260 个保持、5 个是本轮 App/当前文档增量、2 个是其他会话继续更新的 pet-space-customization README/clarifications；没有缺失文件。只读核查这两份文档记录了角色/空间方案和并发时光模块保护快照，未改写或认作本轮成果。原始核验退出 1 的报告保留，后续核验逐项列明来源；不把并发文档推进当作所有文件均未变化。其他既有源码、配置、测试与数据桥接均保持基线；八份自有源码/测试、六份自有功能文档两处同源。App 最小接线保存在 `integration-0.6.0.patch`，接入基线 SHA 见接入说明。

主目录既有未提交工作不暂存、不恢复、不清理；独立分支只提交自身展示变化、文档与接入补丁。已接入主目录继续保留其原 Git 工作副本状态，由其现有进度承接。新增模块均使用 rg 局部前缀，无依赖、schema、AI 或网络变更。

证据在本机 `%TEMP%/qingjian-garden-single-20261005/`：完整首轮/最终测试和构建日志、baseline-manifest/status、当前增量/核验、`ui-proof.json`、`console-1436-initial.json`、`console-final.json`、`single-light-desktop-final.png`、`single-dark-390.png`。合成数据、截图、完整旧源副本及日志不提交。

## 已见失败、告警与未测

- 当前 0.6.0 在旧 1436 夹具初始化时，store.loadNotes 对缺指定日期的非法 createdAt 调用 toISOString，抛 RangeError: Invalid time value，随后 App 白屏和 React 警告。这是未改存储代码的既有缺陷，不能用新日期模型或干净页成功掩盖。保留旧样本，另起 1437 新合成数据验收；不是修好了初始化。
- 早期独立分支构建退出 0，但 PLUGIN_TIMINGS 报 113.2 秒 hook、PWA closeBundle 102.4 秒；最终分支构建未显示该提示。两次日志都保留，不能声称耗时问题已被修复。
- 首次 CSS 大补丁同一路径同时 delete/add，被工具拒绝，未产生部分修改；随后使用单文件更新。旧服务 session id 已失效，write_stdin 返回 unknown process；1436/1437 均通过 strictPort 新建自有服务，没有终止未知进程。
- 一次样式取证用不存在的旧眨眼类，getComputedStyle 报参数错误；改为实际 rg-companion-eyes 后测得 none。该辅助失败不是产品崩溃。
- 并行调研首次哈希检查读到 root 正在改自有组件，退出 1；已明确由本会话实施并重读，主目录当时七个关键文件保持。未匹配 rg 返回 1、组合工具输出截断后定向补读均不作为构建失败或通过证据。
- 首次 267 文件接入核验退出 1：除本轮五份增量外，其他会话更新了 pet-space-customization 的两份方案文档。只读核查后保留外部进度，原失败报告为 `integration-integrity-initial.json`；没有恢复、覆盖或合并发布这些文档。
- 真实 Windows 系统时区/减少动态切换、后台隐藏、读屏/IME/触屏、WebView2/弱 GPU、200% 系统缩放、长期性能与 PWA 更新未测。没有 Rust/Windows 构建、安装器或本轮真实数据库验证；此前原生制品不能替代本次 Web 源码验证。

最终 frozen diff 和这些证据交给未参与本轮实施的 fresh reviewer；审查报告保留在 Temp，独立结论不替代 root 命令和实际 UI。
