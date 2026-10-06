# 实施报告 r1

- feature_name: gentle-experience-refresh
- impl_round: 1
- date: 2026-10-02
- lwplan_version: 2026-10-02 Gate-2 PASS 稿（review_notes_lwplan_1.md，含主链闭环/S5 片段说明/系统字体取舍）
- 权限：仅 impl-safe；未做 Git 写、浏览器/桌面启动、数据库迁移、AI 请求、Windows 打包或递归委派。

## change_facts

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| src/App.tsx | modify | 保留应用保存/导航职责，消费提取组件；精确标签/未完成/query 独立 AND 条件、清除和反馈；限定快捷查找/分层 Escape；复制安全预览正文；本月子集供统计/图/流水，月份 memo 随本机月份变更重新计算；场景新建、外观开关、名称 | S1/S2/S3/S4 |
| src/NoteComposer.tsx | add | 按既有 props 等价提取，再加入草稿成功/恢复提示、局部快捷保存/IME/repeat/单次提交守卫；初始化焦点与滚轮 timeout 清理、减弱模式日期跳转 | S1/S2/S3 |
| src/noteFormat.tsx | add | 受限纯文本展示/转换原样提取，保留标题/粗斜/代码/颜色/字号/列表，未改格式函数体 | S1 |
| src/Modal.tsx | add | 提取 Modal 后落实明确 frame 宽度、role/名称、初始与返回焦点、Tab 循环、body overflow 还原、真实 backdrop 关闭 | S1/S3 |
| src/recordTools.ts | add | 原 helper 等价提取；新增不改源数组的 selectNotes/selectMonth/monthTotals | S1/S2 |
| src/AmbientNodes.tsx | add | effect 独占 Canvas 帧数据；24/12 节点、60/24 线、≤30fps、DPR≤1.5/≤250万像素；预绘小 sprite、低速/轻微鼠标视差；关闭/减弱/hidden/unmount 取消帧与清理监听；有效默认 RGB | S4 |
| src/styles.css | modify | 用同一套浅深 tokens 组织已有区域；纸感实色正文、宽弹窗、明确焦点、触屏动作、窄屏账本/控件、减少动效；系统字体替代外部请求 | S3/S4 |
| tests/recordTools.test.mjs | add | 12 项实际边界用例：精确/近似标签、大小写、trim/query+tag+done、trash、顺序/不变性、空月/跨年/月末本机午夜/非法日期及汇总 | S2 |
| package.json / package-lock.json | modify | 产品 0.4.0；npm test 使用 Node 内置测试，未变依赖版本 | S2/S5 |
| src-tauri/Cargo.toml / Cargo.lock / tauri.conf.json | modify | qingjian 产品版本统一 0.4.0，不改 Rust 业务/SQLite | S5 |
| README.md / CHANGELOG.md / docs/Project.Progress.md / docs/Release.Testing.md | modify | 当前能力、测试要求/12用例、当前与历史发布边界；未把待发布写成已生成 | S5 |
| source_materials/impl-safe-output-r1.txt | add | 本轮最终 test/build/diffcheck 全输出与逐项退出码，包含最终月份 memo 后 build | S5 |

src/store.ts 本轮未修改；与会话前快照按字节比较相同。git status 中仍显示的 store 改动是原现场，不能计入实施成果。未操作 .serena。

## goal_lock_check

G1：已有所见即所得/纯文本/草稿/回收站路径保留；新操作及本月口径已编译、纯计算已测试，真实 UI 输入与安全流程待主代理证据。G2：tokens/窄屏/Modal 与装饰节点生命周期已实现；视觉、交互、实际 CPU/后台/减弱验证交主代理。G3：仅平铺已有职责提取，没有通用框架；0.4.0 元数据齐备，EXE 明确待主代理构建核验。

## anti_goal_touch_check

未新增关系模型、收藏/历史、同步、附件、排序/月切换、状态库或图形依赖；Note/Transaction/NoteDraft 与 AppData.version=1 不变。Canvas 不读笔记/交易，不 setState、写存储或请求网络。未新增上传/AI自动请求或直接持久化任意 HTML。未 restore/reset/clean、改写历史或提交生成物。

## authoring_ergonomics_notes

平铺组件职责与接口沿既有函数提取。新增筛选/帧循环和 Modal 使用可读多行声明；没有全量打印/格式化 App 全文件。S1 等价中间版本保存 `C:/Users/ZXL/AppData/Local/Temp/qingjian-mvp-structural-20261002`（App、recordTools、noteFormat、Modal、NoteComposer）；原始快照 `.../qingjian-pre-mvp-20261002` 只供对照，绝不恢复。提交可按 S1 机械提取和 S2–S5 行为/外观分开组织。

CSS 重复 selector 合并清单：rich-composer/composer宽度、editor-toolbar/visual-editor/tag-editor、schedule-row、tag-chip/tone、ledger.stat-grid/stat、root dark 区域、note-actions/delete-transaction、mobile720/390。保留现有 nav/notes/editor/wheel/ledger/settings/AI 功能 selectors，未恢复日期导航；focus-card/nav-label/toolbar-tip/schedule-pill/status-choice/remove 备用合同保留在兼容区，而非顺手删除。集中 tokens 覆盖浅深预览实际 markdown-preview 子元素，最终媒体规则不再被桌面账本网格覆盖。移除外部字体取舍遵从 LW S3。

## impl_safe_verifications

owner 均为 impl；证据不足时结论统一为“未验证，不能据此宣称通过”。

1. S1 `npm run build`：退出 0，TypeScript/Vite/PWA 全部结束；1875模块、JS260.09KB/gzip82.17KB；PWA5项285.70KiB；有 closeBundle计时提示（PWA hook23.2s），未掩盖。
2. S2–S4 主题/交互版 `npm run build`：退出 0，1876模块，JS270.09KB/gzip85.60KB，CSS25.33KB/gzip5.99KB，PWA5项。
3. 最终 `npm test`：退出 0，12/12，0失败/跳过/取消；完整TAP见 `source_materials/impl-safe-output-r1.txt`。
4. 最终 `npm run build`（月份 memo 调整后）：退出 0，1876模块，JS270.15KB/gzip85.64KB，CSS25.33KB/gzip5.99KB，PWA5项294.59KiB。基线 gzip82.16KB回传比较增量3.48KB，低于候选10KB包体目标；不代表CPU/UI延迟达标。完整输出见同一证据。
5. `git diff --check`：退出 0；store/styles 的 LF→CRLF warning，无空白错误。它不会校验未跟踪文件，新增文件由 build/type检查实际读取，tests由npm test实际读取。
6. 纯片段/字节比对（Python）：退出 0；noteFormat 去掉export修饰后与原App完整相关片段逐字相同，store与原快照逐字节相同；stdout `All moved format function bodies preserved exactly; store.ts unchanged byte-for-byte.`。
7. 隔离 TEMP 变异回归：仅临时 module 将完整 tag 匹配改成子串，测试导入 TEMP mutant；`node --test .../recordTools-mutant.test.mjs` 预期退出1，12中10pass/2fail（exact近似标签、组合条件）。原源码未写回/回退，随后生产 `npm test` 12pass退出0。证明这两个回归能识别近似标签退化，不声称其它用例均经变异证明。

### 初始失败与开发中间态（不省略）

- 准备读取 tsconfig.app.json：文件不存在，实际项目只有 tsconfig.json，随后 rg定位并完整读取；非构建失败。
- 一次 apply_patch 对 Modal 在同一 patch 同路径 Delete+Add 被工具拒绝；没有生效，改成Update后落地；非源码构建失败。
- 主代理真实浏览器观察 S2引用 AmbientNodes 时文件尚未形成，Vite overlay；优先补齐真实组件后继续，没有假 stub。
- 主代理真实浏览器观察旧CSS缺node token导致 gradient `rgba(,.8)` SyntaxError/空白；此为真实已观测开发中间态。组件增加有效默认RGB，CSS补齐token；变更后编译退出0，实际浏览器恢复交主代理验证，impl未冒充验证。
- 一次 Node/TypeScript AST自证脚本退出1：当前TypeScript7.0.2入口只导出version，ScriptTarget.Latest不存在。改为上面完整原文片段/字节比较退出0；没有更换依赖或掩盖失败。
- TEMP mutant退出1是有意的红灯证据，原源码随后绿灯；不混成产品失败或省略。

## coordinator_handoff_verifications

| 验证 | 移交原因 / 建议承接方式 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 编辑连续输入/选区格式/保存展示/回填/快捷键/IME | 真实浏览器或原生，非impl-safe；root隔离origin操作，IME需真实输入法 | UI步骤、DOM/截图、行为对照、明确未测IME | coordinator | 仅编译/纯函数通过，不声称编辑器完整回归 |
| 草稿关闭恢复、正式保存清除、撤销/恢复/永久删除确认 | 真实状态流程；root隔离测试数据 | UI安全流程及显示/数据结果 | coordinator | 路径保留，未验证实际流程 |
| 精确/组合筛选、复制成功或失败、本月旧月样例 | UI/clipboard交互，root真实浏览器 | 操作步骤与结果、复制正文不含内部标记 | coordinator | 纯计算通过，UI/复制未验证 |
| 浅深/窄宽/触屏/Modal焦点与滚动 | 真实浏览器布局，root测量/截图/键盘 | frame尺寸、对比度、Tab循环/return/overflow、网格和动作 | coordinator | 不以tokens存在声称观感/可访问性通过 |
| 动效开关10次/reduced/hidden/StrictMode/输入并行 | 真实循环和设备状态，root浏览器和可行性能工具 | 帧清理/停止/恢复、CPU/内存/帧预算与未测说明 | coordinator | 只有静态上限，不声称实际p95或耗电达标 |
| 1000×500中文查找到结果与CPU开关对照 | 隔离合成数据真实UI测量，root | 性能采样/环境/轮次；纯计算时间不能称UI延迟 | coordinator | 未测，不承诺规模性能 |
| Rust检查/0用例、Windows构建与程序/安装EXE | 桌面构建及程序启动超过impl-safe定义，root独立执行 | 退出完整输出、产物mtime/大小/version/hash、可行启动，NSIS失败保留 | coordinator | EXE未交付/未核验；0用例不证明数据库安全 |
| Windows缩放/旧SQLite/AI凭据网络 | 原生/外部服务，root可行则验收；不主动发AI | 对应原生证据或明确未验证 | coordinator | Web证据不推导原生通过 |

## contract_drift_reports

- 当前README旧日期视图、颜色/字号编辑入口、快捷键文档与现场不同；按S5同步当前事实，历史CHANGELOG条目保留。已上报coordinator。
- plan-review readiness编号模板无core对应定义为前阶段已知报告项，未改共享技能。
- 产品0.4.0与备份version1保持明确，无类型/存储镜像漂移。

## 未完成与风险

实施源码及impl-safe检查已具备交独立Review(Impl)的证据；真实UI、性能、Rust复核与EXE交付尚待coordinator。execCommand兼容/真实IME、原生缩放、旧库/AI网络仍需对应证据，不保证零bug。已有导入替换/损坏JSON回退/桌面空库与双保存风险未改。

## 回滚信息

需人工介入：原现场与本轮改动同在App/styles，不能用HEAD全文件restore。仅逆向本轮S1搬移/各包补丁，参考机械快照与原快照，保留用户既有差异；生成物不作为Git回滚对象。

建议分段提交消息：`refactor(editor): isolate note editing and format helpers`；`feat(notes): add gentle paper workspace and practical shortcuts`。

无新增跨功能事实。
