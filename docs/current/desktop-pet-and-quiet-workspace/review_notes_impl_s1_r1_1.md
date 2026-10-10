# S1 独立实施审查（r1 / 第1次）

## 基本信息与当前结论

- review_target: impl
- review_scope: S1 简洁工作区与旧正文收敛；不代审 S2/S3 或最终 EXE
- impl_round: S1 r1
- review_seq: 1
- review_date: 2026-10-07
- 实施输入：[impl_report_s1_r1.md](impl_report_s1_r1.md)、lwplan §4、Review(LW) r2、clarifications、verification。
- 协议结论：PASS（限定S1包；root已补齐既定浏览器承接）
- 业务结论：PASS（限定S1包；不等于完整feature或原生发布验收）
- goal_lock_alignment: aligned
- anti_goals_touched: none
- authoring_ergonomics_check: pass
- declaration_readability_check: pass
- plan_defect_checkpoint_recommended: no
- plan_defect_checkpoint_reason: S1 删除链和保留 codec 的实现形态符合现有计划；原预定 coordinator 浏览器证据缺口已补齐，没有需要重写计划的确定缺陷。
- impl_safe_validation_check: pass（恢复本轮19条 codec再次由 reviewer独立重跑；root记录fresh149项、build退出0；不将root记录写成reviewer亲自执行）
- coordinator_handoff_check: pass（S1浏览器闭环已落实；原生标题与最终EXE仍按S4明确承接）

## 实际核查与证据边界

读取忽略目录 `src-tauri/target/release-evidence/0.9.0/s1/source.diff` 冻结 S1 差异，并核对实际 App、NoteComposer、codec、format、NotesView、NoteGraph、Modal、styles 对应片段。当前共享源将继续由 S2/S3 修改；本报告仅对冻结的 S1 差异归属做判断。组合长读取曾截断，关键菜单、删除链、序列化和CSS片段另行定位读取；不把截断输出当整份源码证据。

| 项目 | 静态判断及实际落点 | 仍需的真实验证 |
| --- | --- | --- |
| 简洁及可发现性 | App 三主 Nav，More 显式文字/expanded/controls、七个普通按钮region；次级页名显示在 More；顶部单新建；NotesView 去重复眉题/长说明/非空起笔/常驻排序提示，保留空态、筛选、布局、标签、抓手、卡片动作 | 首屏、各次级入口与窄屏 |
| More 生命周期 | App `moreOpen` effect 清理document pointerdown/keydown；Escape回原按钮；outside关闭；导航关闭；composer/quickOpen/tagPicker/AI/wheel进入关闭；chrome使用inert保护原编辑焦点路径 | Tab/Escape/outside、modal焦点 |
| 连续顶部及内容滚动 | styles `.app-shell` 固定100dvh/flex/min-height0；`.workspace-scroll` flex/min-height0/overflowauto；透明标题无底边；固定光场贯穿；主题8px条，不隐藏工作区条；modal/editor保留局部overflow | 真实PageDown/抓取、浅深及最终原生标题 |
| 旧正文收敛 | NoteComposer删除 EmbeddedPetModel/insertPet/createRoot/observer/root effects及入口，selection/format/draft/commit保留；codec固定legacy noneditable DIV；noteFormat阅读普通p；所有renderMarkdown调用无appearance；NotesView/Graph/App纯正文props同步删除 | legacy保存往返、整块删除/撤销；原有格式输入回填 |
| 数据兼容 | PET_DIRECTIVE/parse/搜索纯字与直接root DIV的isPet分支保留；S1无schema/全库迁移/保存数组算法变更 | 非SQLite测试样例往返；最终真库由S4承接 |

独立执行 `node --test --test-reporter=spec tests/noteCodec.test.mjs`：退出 **0**，完整输出读取，19 tests / 19 pass / fail0 / skipped0 / cancelled0。实际覆盖精确token、字面/代码/转义/重复边界、固定纯文字host及无mount/canvas/svg断言；不把它声称为DOM和原生undo测试。前次把读取/检索与该测试组合执行导致末命令覆盖退出状态，已单独重跑取得真实测试退出码；没有掩盖此证据不足。

`rg` 对 NoteComposer/codec/format/NotesView/Graph 的 insertPet、EmbeddedPetModel、petRoot、createRoot、data-note-pet-mount、embedded-pet 未发现残留；预期无命中退出1，不是测试失败。其他通用PetPortrait/原浮层仍属于后包接入边界，没有误删。

## 基线与澄清一致性复核结果：PASS（S1范围）

未回答列表为空。用户已否定正文形象插入并授权继续开发；S1撤入口而保留历史纯文本兼容，与G2/G3一致；独立桌宠与五角色由S2/S3实施，本S1暂留旧浮层符合顺序安排，不误称完成G1。未改排序、受限格式、保存结构或备份协议。

| 禁止内容 | 可核查证据 | 结论 |
| --- | --- | --- |
| 正文宠物扩展/画布/嵌套root | 冻结diff NoteComposer删除链；codec仅固定文字；noteFormat普通p；rg无上述专用链 | S1不存在 |
| 第二业务所有者/自动AI/新待办系统 | S1 App改动仅导航展示及原有props；main/Rust/store未属S1改动 | S1不存在 |
| schema/identifier/备份改版/全库token替换 | 冻结diff文件名单与原isPet/token保留 | S1不存在 |
| 无关排序/格式重构 | NoteSorter/reorder算法及range/命令/serializer保留；只删除图形专用链 | S1未触及 |
| 用编译代替原生/视觉验证 | impl报告明确浏览器/native未执行，verification仍待承接 | 未伪称 |

## 设计味道扫描结果：PASS

使用有限 More 按钮列表而未制造导航框架；未错误宣称ARIA menu完整键盘角色；图形删除保留最小codec兼容，不新增复杂迁移或React嵌套root。固定顶部和内容scroll各有明确类名。没有发现本包需要阻断的过早抽象。

## contract drift / stale / mirror mismatch

无新的S1契约漂移。冻结快照保留旧浮层是计划中的阶段状态；新三维/双窗承诺不属于S1完成声明。README/CHANGELOG/Progress和旧note feature历史说明由S4同步，当前尚未同步不能宣称整feature已收敛。

## coordinator 证据承接与解除条件

### 初次阶段状态（保留失败与证据缺口历史）

root回传中：1280×720首card262（before474.484），body720且不全页overflow；More Tab→记录时光、Escape关闭回More；仅localhost导入3条fixture、legacy卡片纯字零canvas、编辑回填固定host/strong/无插入按钮。这是已收到的实际观察摘要，正式结论待其写入verification及余下操作闭环，不能代替未做项。

【DELEGATE_ACTION】

- 操作类型：tool-invocation / 既定浏览器取证
- 责任：root；只在现有隔离localhost fixture进行，勿改真实SQLite。
- 待补：legacy Backspace整块删除、CtrlZ恢复与保存回填；连续中英文输入/选区格式/列表/CtrlEnter/CtrlZ/Y/草稿；More outside/modal焦点；390窄屏、浅深/滚动与排序基本回归。
- 回传：写入verification的真实顺序、可观察结果和任何失败；恢复本review agent补最终双结论。最终原生标题/滚动与整个G1/G3仍由S4验收，不阻塞S1后包继续实施。
- 未得到证据前：不得以本报告允许Archive/发布或声称S1用户体验已修好。

### 恢复审查与最终S1双结论

本轮重新实读 `verification.md` 的“ S1 实际浏览器承接”与“root当前自动验证”全文。已完成上述委托操作并给出操作和观察闭环：

| 承接项 | 实际证据 | S1结论 |
| --- | --- | --- |
| 首屏/内容滚动/简洁 | 同1280×720首card262对474.484，body720/720；非整页滚动；三核心导航/单新建/短标题/实际卡片 | PASS |
| More与阻塞焦点 | Tab进入记录时光、Escape回More、设置显示当前次级名、outside新建关闭More；chrome inert且CtrlK不抢编辑 | PASS |
| legacy兼容删除与恢复 | localhost固定fixture；卡片零canvas、编辑固定host；真实Backspace计数1→0，CtrlZ→1，CtrlY→0，再恢复后CtrlEnter保存 | PASS |
| 编辑原有体验 | sun123晴朗连续顺序；选择部分粗体；无序两条；关闭重开恢复strong/ul/li；CtrlEnter保存再编辑结构相同；下一新建草稿已清理 | PASS |
| 窄屏/浅深/键盘scroll | 390宽无横溢，卡片16..364；body高度844、内容独占1202/712；Tab聚焦工作区PageDown490而chromeTop0，CtrlHome回0；浅深观看及viewport reset | PASS |
| 排序基础布局回归 | Space/Down/Escape不改顺序且回原ID；Space/Down/Return换项并回所拖ID | PASS，未扩大为完整排序重新验收 |

恢复本轮独立重跑codec命令退出 **0**，完整19pass/0fail读取。root另记录本轮149自动测试/0fail、build退出0、Rust20测试退出0；这些是root责任的fresh自动证据，不冒称本reviewer独立重跑全feature。S1源码差异与浏览器结果相互支持，原先临时BLOCKED已解除，无需修改lwplan或向用户新增提问。

实际失败/限制仍保留：只读selection接口TypeError后改真实键盘；一次HMR全重载关闭编辑器导致粗体定位deadline失败，随后完整草稿恢复且重做格式保存；一次点击工作区被旧Web浮层覆盖未滚，改用Tab取得真实键盘路径；窄屏初始保留scrollTop38经真实向上滚后标题完整。这些失败均未隐藏，最终S1已完成对应目标路径，旧Web浮层仍按S3替换Windows版本，不能以Web证据称原生问题消除。

**最终双结论：协议 PASS / 业务 PASS，严格限定S1。** 允许S1作为已审包进入后续整feature验证/提交组织；整feature的Archive/发布需S2/S3独立审查与S4原生真窗、精确版本身份及真实数据库验收。真实中文IME、读屏/触屏、原生标题/透明/自主行为本S1未验证，保持明确边界。

当前verification先前“待验证”和“fixture尚未导入”段落是已发生阶段历史，但其措辞仍像当前状态；后附S1实测已消除该证据缺口。建议root最终整理为带阶段标签的历史状态，避免读者误认为S1仍待测；不因此重判实际实现缺陷。

## 跨功能事实（待确认）

无新增。
