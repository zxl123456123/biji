# S1 实施报告 r1

## 基本信息

- feature_name: desktop-pet-and-quiet-workspace
- impl_round: S1 r1
- date: 2026-10-07
- lwplan_version: 2026-10-07 PLAN_DEFECT-R1 修订；Review(LW) r2 PASS，root Gate-2 已复核并委派实施。
- 输入：clarifications、lwplan S1 及相关目标锁/跨包边界、review_notes_lwplan_2、source_materials 原话；safe-code-changes、verification-before-completion 已读取。没有递归委派、启动服务、数据库改动、浏览器操作、commit 或 push。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| src/App.tsx | 修改 | chrome 包含透明桌面标题、三主导航、More 次级入口、单一顶部新建与搜索 Ctrl K；标题与光场连续；内容 scroll owner；关闭/外部点击/Tab 自然顺序及次级页名称；去掉正文 appearance 传递；账本标题重复新增按钮移除 | S1.1–5 / G2,G3 |
| src/styles.css | 修改 | 固定视口 flex/min-height/overflow；主题8px内容与编辑器/modal条；小屏导航规则及简短记录标题/卡片动作间距；legacy 普通文字 | S1.1–5 / G2 |
| src/NotesView.tsx | 修改 | 记录标题+计数；去眉题说明、非空起笔大区和常驻排序提示；保留空态引导及抓手说明；去纯正文appearance | S1.3,5 / G2,G3 |
| src/NoteComposer.tsx | 修改 | 删除插入按钮、insertPet、EmbeddedPetModel、petRoot、createRoot、MutationObserver与reconcile/appearance effects；其他selection/格式/草稿保存/原生撤销路径不动 | S1.5 / G2,G3 |
| src/noteCodec.ts | 修改 | PET_HOST_HTML 仅固定非编辑 DIV 与文字；解析规则、原token、plain/search、转义不变 | S1.5 / G3 |
| src/noteFormat.tsx | 修改 | 读取旧block为普通p；去正文PetPortrait和appearance接口；direct root isPet serializer保留 | S1.5 / G3 |
| src/NoteGraph.tsx | 修改 | 移除仅正文消费的appearance prop，其他图功能不变 | S1.5 / G2 |
| src/pet.css | 修改 | 只删6条专用正文图形规则，其他伙伴样式保留；已与root/S2协调不同时写 | S1.5 / G2 |
| tests/noteCodec.test.mjs | 修改 | 原codec测试增加固定legacy字样与无canvas/svg/mount图形断言；已有unknown/duplicate/fence/escaped测试保持 | S1.5 / G3 |
| docs/current/desktop-pet-and-quiet-workspace/impl_report_s1_r1.md | 新增 | 本报告记录实施与证据边界 | S1 验证 |

无其他新增源码文件。五项已有0.8.1版本改动未动；PetCompanion/Pet3DScene/模型/Rust/main.tsx均未改。S1保留旧浮层至S3替换，不声称已实现独立桌宠。

## 目标对齐

- goal_lock_check: S1覆盖G2，并以零迁移和受限codec兼容保护G3；G1由S2/S3接续。记录/搜索/待办/账本主路径和快捷键继续可达。
- anti_goal_touch_check: 未增正文装饰、养成、数据/窗口第二owner、网络功能或schema；未改排序算法、正文格式算法及保存结构；旧token无全库替换。
- authoring_ergonomics_notes: JSX保持现有App有限入口；普通More region保留原生button/Tab，没有不完整ARIA menu角色。类名明确chrome/scroll职责。受限格式编辑仍所见即所得，legacy内部指令在正常支持的block位置显示文字。

## impl-safe 验证

owner 均为 S1 impl。本轮均真实执行；缺任一 evidence 时相应结论必须撤回，不能据此推断原生效果或完整编辑体验。

1. `npm test`：退出0，141 tests / 141 pass / 0 fail；默认TAP输出866行曾被工具截断，所以不以截断中段当完整读取。随后完整重跑 `node --test --test-reporter=spec tests/*.test.mjs`，退出0、完整输出读取，141 pass / 0 fail / cancelled0 / skipped0 / todo0。codec legacy、解析边界、搜索和JSON保留测试均成功。实验TypeScript strip warning仍存在。
2. `npm run build`：实施后及末次JSX标签整理后分别真实运行，最后退出0，tsc -b 与 Vite8.3.0、2519 modules；PWA生成19 entries。完整末次输出读取。index614.76KB、Three737.16KB触发原有>500KB chunk warning，未擅自作包体重构。
3. `git diff --check`：单独执行退出0，无空白错误；root既有五版本文件出现LF转CRLF提示，未恢复/覆盖。`git diff --stat`核对本包9个代码/测试文件，及root既有5元数据文件。
4. 实读NoteComposer、codec、format、NotesView、NoteGraph及全部renderMarkdown调用；删除链精确范围与保留函数对照lwplan。无其他appearance正文调用残留。此静态证据不替代原生删除/撤销。

### 实际失败/限制留痕

- 初次 `rg ... tests/*` 在Windows报文件名语法无效、退出1；改用 `rg ... tests`，退出0，读取实际测试。不是源码/测试失败。
- 组合大量读取与默认TAP输出发生截断；关键计划/技能/代码已分段重读，测试以spec全量重跑解决。没有隐藏测试失败。
- 未执行任何浏览器/native界面验证，不能说用户截图问题已实际修好；所有UI仍待root承接。未用141 codec测试声称DOM往返/原生撤销已实测。

## coordinator_handoff_verifications

| 验证 | 移交原因 / 方式 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 连续中英文输入、粗体/列表、保存回填、CtrlEnter、CtrlZ/Y、草稿 | 真实浏览器交互超impl-safe；root使用现有dev浏览器 | 实际DOM与操作顺序、保存/回填可见正文及输出记录 | root | 编辑体验未验收 |
| legacy原token保存、Backspace整块删除与原生撤销恢复 | 真实contenteditable历史不可用纯codec代替 | 原host字样无画布、编辑保存原token；删除后撤销恢复、再次保存往返 | root | legacy删除/撤销和DOM往返未验收 |
| More Tab/Escape回按钮、outside、次级页发现、阻塞编辑焦点 | 浏览器真实焦点交互 | focus/aria-expanded/标签观察与关闭前后DOM | root | 菜单键盘体验未验收 |
| 深浅/390窄屏/键盘PageDown及抓条/排序基本回归 | 实际布局与交互 | viewport、首card位置与baseline474.48px对比、横向溢出、抓手操作 | root | 仅编译成功，布局/滚动未验收 |
| 最终EXE顶部连续、固定chrome、内容主题条 | Windows跨平台联调 | 精确新版进程路径版本及真实截图/操作 | root S4 | 不称EXE更新效果已展示 |

## contract_drift_reports

没有新的阻断计划漂移。实际正文样式位于pet.css（已在计划名单明确），root同步协调S2停止写该文件。共享业务/editor格式边界遵守，S3接App前本包冻结。测试不支持DOM，明确将真实DOM往返交root；没有引入新测试依赖或镜像实现。

## 未完成与风险

- S1源码实现及本地命令有证据；真实UI/编辑器/旧token删除撤销、用户视觉满意度均未确认。优先审查More焦点恢复、小屏换行、inert与Modal焦点时序、chrome/scroll单一所有者。
- 本次删除的pet专用observer不再修DOM；legacy直接保留非编辑host，原生Backspace行为必须root实测。非canonical嵌套/重复指令仍依原受限规则作为字面文字，不能无依据宣称它们全部隐藏。
- README/CHANGELOG/Project.Progress和旧note-embedded-pet历史标注由root统一S4同步，当前本包不写计划为已实现/已验收事实。

## 回滚信息

可直接回滚：本包独立提交revert，版本文件/root他包不能一并reset。没有迁移或业务数据重写，无需数据回滚。

建议英文提交：`refactor(workspace): simplify navigation and retire embedded pets`

## 跨功能事实（待确认）

无新增；contenteditable真实历史与格式纯测试的差异已在既有基线记录。
