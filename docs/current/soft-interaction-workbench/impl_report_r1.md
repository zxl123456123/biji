# 实施报告 r1

- feature_name：soft-interaction-workbench
- impl_round：r1
- date：2026-10-03
- lwplan_version：2026-10-03，PLAN_DEFECT-R1.1–R1.3收敛、Gate-2 r2 PASS版

S1–S5已在源码接线，类型和50项纯合同有本轮退出0证据；真实手感与最新Windows制品由root独立验收。两次实际首屏/原生RAF缺陷已接受root反馈修复；最终2px与RAF补丁后的完整build交root，不将补丁前构建冒充最终产物。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| src/SoftInteraction.tsx | 新增 | 同步LazyMotion/domMax、轻量m，按钮按压与抓手MotionValue；有限官方spring/自有取消/策略清理 | S1/S2 |
| src/softMotion.ts | 新增 | 实际生产取消stop/jump，无onDragEnd依赖；供同一合同测试 | S1 |
| src/NotesView.tsx | 修改 | 独立抓手、正文/动作兄弟保留、capture SoftButton、全部标签入口 | S2/S3 |
| src/styles.css | 修改 | 紧凑首屏、去除竞争transform、抓手仅自身touch-action、选择器浅深/窄屏与暂停CSS | S2/S3 |
| src/recordNavigation.ts | 新增 | 全标签/全记录纯选择器、UUID与IME守卫，单帧编辑交接执行时复核 | S3 |
| src/QuickOpen.tsx | 新增 | 原Modal结果面板、原生input/buttons/箭头与回车、UUID/40批量/无结果 | S3 |
| src/TagPicker.tsx | 新增 | 原Modal全部标签检索、精确选择/清除、键盘/Escape | S3 |
| src/NoteFilters.tsx | 修改 | 标签select替换为明确选择入口，原组合筛选保持 | S3 |
| src/App.tsx | 修改 | 动效许可、主按钮、全标签/快开/Modal入口、StrictMode重建handoff、原生RAF绑定、单定位token/清筛选策略 | S1/S3/S4 |
| src/graphFocus.ts | 新增 | 实际生产长期owner的最新请求/状态/回调，waiting保持/一次消费/卸载拒绝 | S4 |
| src/graphGeometry.ts | 修改 | 0.6–2相机居中数学，不改原D3自有监听合同 | S4 |
| src/NoteGraph.tsx | 修改 | 既有owner读取latest，reconcile/Resize/status重试；单请求相机应用、详情定位入口 | S4 |
| tests/recordNavigation.test.mjs | 新增 | 全量标签/#检索/UUID/trash/最新编辑和IME真实纯生产合同 | S3 |
| tests/softInteraction.test.mjs | 新增 | 实际MotionValue取消复位，cancel无end与重复取消 | S1 |
| tests/graphFocus.test.mjs | 新增 | 几何、长期owner异步就绪/尺寸/错误/最新token与卸载 | S4 |
| package.json | 修改 | 精确Motion14.0.0与产品0.5.1 | S1/S5 |
| package-lock.json | 修改 | 四新包14.0.0、根及rootpackage0.5.1，未升级既有版本 | S1/S5 |
| src-tauri/Cargo.toml | 修改 | 仅qingjian产品版本0.5.1 | S5 |
| src-tauri/Cargo.lock | 修改 | 仅qingjian自身0.5.1，其他0.5.0依赖不替换 | S5 |
| src-tauri/tauri.conf.json | 修改 | 产品版本0.5.1，无数据迁移 | S5 |
| public/third-party-licenses/framer-motion-14.0.0-MIT.txt | 新增 | 确切原MIT许可随Vite静态分发 | S1/S5 |
| public/third-party-licenses/motion-14.0.0-MIT.txt | 新增 | 确切原MIT许可随Vite静态分发 | S1/S5 |
| public/third-party-licenses/motion-dom-14.0.0-MIT.txt | 新增 | 确切原MIT许可随Vite静态分发 | S1/S5 |
| public/third-party-licenses/motion-utils-14.0.0-MIT.txt | 新增 | 确切原MIT许可随Vite静态分发 | S1/S5 |
| README.md | 修改 | 当前能力0.5.1、动作/快捷键和新验证入口，不改旧失败 | S5 |
| CHANGELOG.md | 修改 | 0.5.1实现事实/未验收区分 | S5 |
| docs/Project.Progress.md | 修改 | 新源码状态与延后范围，保留历史边界 | S5 |
| docs/Release.Testing.md | 修改 | 新交互人工承接项、版本与制品责任 | S5 |
| docs/Soft.Interaction.md | 新增 | 中文动作/取消/查找/定位与原生未测说明 | S5 |
| docs/Release.Verification.0.5.1.md | 新增 | root制品/实际UI待承接，未伪造哈希 | S5 |
| docs/current/soft-interaction-workbench/impl_validation.md | 新增 | 本轮完整输出/退出码、失败、包体与承接 | S5 |
| docs/current/soft-interaction-workbench/validation_logs/tests_r1.log | 新增 | 完整50项TAP验证原始日志 | S5 |
| docs/current/soft-interaction-workbench/impl_report_r1.md | 新增 | 本实施轮报告 | S5 |

和改前src副本比较，十二应用文件共约382新增/71删除行（不含测试/版本/文档）；每个主包局部且可顺读，没有扩成组件库。未修改store、desktop、Rust业务、Worker或关系算法，也未恢复初始未知工作。

## 目标对齐

- goal_lock_check：G1真实源码SoftButton/独立抓手和首屏CSS；G2全部标签/UUID面板/单token镜头；G3成熟公开API、精确锁、取消与分层证据。纯测试不能将G1手感或G3完整制品勾为验收完成。
- anti_goal_touch_check：拖动入口只有抓手，正文与动作未接pointer；不重排/每帧React保存、不改纯文本/SQLite、无第二引擎/远程模型/自制积分或指针状态机；Canvas不挂Motion手势。
- authoring_ergonomics_notes：package精确依赖、公开Motion接线；业务onClick保持原名字，只有一个allowed许可。UI瞬时UUID/token不持久化，不向用户展示UUID/Worker/存储语法。App StrictMode effect每次setup建立handoff，cleanup仅dispose自己的实例；不复用永久disposed控制器。

## 验证结果

详见 [impl_validation.md](impl_validation.md) 的完整命令/退出码/API Gate/build输出和 [50项TAP](validation_logs/tests_r1.log)。owner均soft_impl，evidence为本轮实际读取的完整命令返回，conclusion_if_missing为“未验证”而非默认通过。最新tsc0、完整50测试0；build0但最终CSS/RAF小补丁之后完整构建由root承接。版本六字段一致、锁定Motion四包14.0.0、许可证dist字节相同、Cargo metadata锁定0.5.1。入口增量约45.77KiB超过40KiB候选，如实保留。

## coordinator_handoff_verifications

| 验证 | 移交原因 / 建议方式 | evidence_expected / owner / conclusion_if_missing |
| --- | --- | --- |
| 最终源码独立tests/build及包体 | 独立root gate；包含最终2px/原生RAF补丁 | 完整退出码/日志/各块，root；未得证据不得称最终包通过 |
| Enter编辑/焦点/选区/保存回填、tag/键盘/IME | 真实UI非impl-safe，root隔离页复检 | 实际操作/DOM与控制台，root；原生绑定修复仍待真实回归 |
| 浅深/窄屏/首卡及Worker定位/暂停 | 真实UI与渲染非impl-safe | 页顶尺寸、截图/选中UUID、实际Worker等待，root；不能据数学/合同推定 |
| drag/cancel/触屏/reduce/后台/blur/GPU | 需要真实手势/系统，受控pure不足 | 有能力真实输入并留帧/日志，root；工具不能输入即未测 |
| Windows/Rust/版本哈希/启动旧库保持 | 真实程序与数据，非impl-safe | 新EXE/NSIS/MSI字节SHA256/响应/原库对照，root；旧0.5.0制品不能替代 |
| 安装/卸载 | 真实系统变化 | 实际验收记录，root或用户引导；未执行继续未测 |

## contract_drift_reports

- 没有范围/目标或shared/platform镜像漂移。计划泛称impl_report.md按core实际生成impl_report_r1.md，root委派已明确此映射。
- root提出本轮新依赖许可文本随制品分发，作为S1/S5确切许可的落实补四公开文本，不新增UI或其他许可治理范围。
- 首卡0.1px临界与原生RAF receiver是实施缺陷，不是产品决策漂移，已就地按同计划修补并上报root；需要独立实际复检。两次失败与早期依赖HMR错误不删除。

## 未完成与审查重点

原生手感/完整新包与总体MVP未验收。重点审查：官方cancel跳end与迟到回调、抓手独占/正文滚动/静态CSS无transform竞争、StrictMode与原生RAF receiver、输入法/Tab和关闭焦点、同一App token与长期D3 latest/status/尺寸重试、原监听身份保持。

发现但未改动：npmjs audit报告既有5项依赖漏洞，不涉及新Motion四包；整库保存、特征缓存、历史/导入等已延后，本轮不擅自升级或迁移。首卡2px/RAF修复后的独立完整build、真实回归和媒体由root进行。

回滚信息：**需人工介入**。已有未知混合未提交工作，不能git restore/reset；仅按专用改前副本逐块反向本轮已确认差量，保留用户数据与旧验证历史。没有Git提交/推送、服务启动、真实DB或凭据操作。

英文提交建议：`feat: add soft record interactions and quick graph navigation`。

无新增跨功能事实。
