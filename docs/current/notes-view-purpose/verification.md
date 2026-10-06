# 视图用途优化：根验证记录

日期：2026-10-05。状态：三包实施、根fresh全量test/build与实际界面已验证；fresh独立实施审查协议/业务均PASS，根全文复核与最终身份匹配，待用户体验验收。

## 输入与验证责任

根 workspace：E:/project-funny/biji；真实输入 before/manifest 与原始日志：C:/Users/ZXL/AppData/Local/Temp/qingjian-view-purpose-20261005。276 份输入快照不使用 HEAD 替代。本轮不改业务数据、依赖、版本或安装包。

root 已读取 verification-before-completion Gate：新鲜执行、完整输出、退出码先于结论。代理自报不等于根证据。

## 基线证据

- root `npm test`：129 tests / 129 pass / 0 fail，exit 0。完整输出 baseline-tests.log；保留 Node stripTypeScriptTypes ExperimentalWarning。
- 独立样例页面 http://127.0.0.1:5197/qa-view，以本轮 qa-server.mjs 的 18 条合成记录启动。该独立 origin 不是用户日常页面，未读写用户旧 SQLite 或其它 origin 笔记。
- 实际浏览器基线：18 节点、11 边；relations/time/pet 均已在页面；配置整块默认展开，地图首屏仅露出顶部，没有主题选择/数量/组聚焦。此观察支持本轮分工与折叠，不属于新功能通过证据。
- before SHA 再核对发现并发 PetCompanion.tsx、pet-space-customization 两份文档变化；当时 App/SpatialNoteMap/NoteGraph/scene 与输入一致，外部变化保留。

## 已见失败与工具限制

- root 初次读取猜测的 tests/spatial.test.mjs，文件不存在，命令 exit 1；随后 rg 列出并读取真实 spatialLayout.test.mjs，exit 0。
- root 在调研代理尚未落盘时查询 research.md，rg exit 1；随后收到正式路径报告并完整读取，exit 0。未把缺文件检查当作产品测试失败或成功。
- 调研代理 Windows rg 通配符参数失败 exit 1，修正后 exit 0，详见 research.md。
- 浏览器基线工具出现 Statsig SDK warning；与产品功能无直接归因证据，不省略。

## 最终根命令

根在S2 r3和S3 r2最新源码上独立执行并读取完整输出/退出码：

| 命令 | 结果 | 原始日志 |
| --- | --- | --- |
| `npm test` | 145/145 pass；fail/cancel/skip/todo均0；exit 0 | TEMP/final-tests.log；工具205a6f |
| `npm run build -- --outDir C:/Users/ZXL/AppData/Local/Temp/qingjian-view-purpose-20261005/final-dist` | TypeScript与Vite构建exit 0；2515 modules | TEMP/final-build.log；工具715b01 |

独立审查指出r1正文日志未附退出码元数据，root保留原日志并在相同11份产品/测试身份上再次执行：`npm test` 145/145、其余统计均0、exec exit 0（工具00256e）；`npm run build -- --outDir C:/Users/ZXL/AppData/Local/Temp/qingjian-view-purpose-20261005/final-dist-r2` TypeScript/Vite 2515模块、exec exit 0（工具17c254）。root读取两份完整输出；新原文为final-tests-r2.log、final-build-r2.log，实际LASTEXITCODE与UTC完成时间分别保存在final-tests-r2-result.json、final-build-r2-result.json，不补造旧命令元数据。警告与包体和r1一致。

产物写本轮TEMP新目录，没有覆盖共享dist或并发EXE。保留Node stripTypeScriptTypes ExperimentalWarning、outDir位于根目录外不自动清空提示、大于500kB chunk警告。main gzip189.09kB、空间149.70kB、二维22.93kB；PWA14项1340.64KiB。它们不是帧率或原生发布证据。本轮不运行原生构建或数据库迁移。

## 实际浏览器验收

仍使用独立5197 origin的18条合成笔记，6标签、1词面组、2独立记录，共11关系。未操作用户SQLite或日常origin。Cua负责实际UI，未用应用内部状态替代操作。

| 路径 | 实际结果 |
| --- | --- |
| 二维全图→一层→两层→依据→邻居 | 学习中心3记录/3边；词面过滤2记录/1边，混合边两类真实说明保留；选邻居UUID成为新中心；纯标签恢复3/3；两层链/环差异另由纯行为测试覆盖 |
| 全体文字选择/独立点/失效中心 | picker始终18条；选qa-view-11局部为1/0；全图标签过滤18/10；搜索咖啡后旧中心清空、局部按钮禁用并显示2/1 |
| 空间主题→独立→跨主题选择→全部 | 学习3/18、选qa-view-2两条连线/完整总数2；独立2/18且旧选择清空；picker选qa-view-14自动回全部且完整关联数1；第八主题词面组仍可通过滚动访问 |
| 空间→二维→原编辑器 | qa-view-7在旅行query/tag/unfinished组合下进入二维一层，同UUID、3/3且三种筛选保持；深色390px qa-view-2亦进入一层并打开原编辑器，正文/标签/日期回填正确，关闭返回；本轮未改变编辑器 |
| 旧快捷定位与关闭 | 快开咖啡并ArrowDown/CtrlEnter从旧旅行中心定位qa-view-14，搜索/标签/未完成清除，局部2/1、匹配18；真正Ctrl K打开、Esc关闭均实际检查 |
| 外观/相机/动态 | 配置默认闭合；三形状/三背景预览、两光效、应用/撤销/恢复保持所选UUID；旋转左右、缩放、适配、静态→开启→暂停可操作。聚焦坐标/degree/bounds非变异由真实纯模块测试佐证；未通过应用内部相机对象取证 |
| 创建轨迹/日历/宠物 | 积累轨迹显示9月1–18日创建口径及非计划日期提示；空间五伙伴选择入口保留；记录时光9月18条/18天，日历与浮层职责保持；记录页浮层1，图页0，回记录仍1 |
| 删除/恢复/撤销 | 局部独立中心软删后选择清空、17条全图；回收站恢复成功；再次同调用内及时撤销恢复18条。仅动合成样例，没有永久删除 |
| 浅深/窄屏 | 默认DOM viewport1280×720（截图渲染约1265×713）；r3 stage顶部492.65、canvas544.25，首屏可见节点，无页面横溢。深色390×844两页scrollWidth与clientWidth相同，主题两列可滚、图范围Enter可选、正文与操作无遮挡；缩窄保留二维镜头，需要主动适配当前范围，已实测 |

实际截图目录：C:/Users/ZXL/.codex/visualizations/2026/10/04/01a107f2-1388-7e72-b4f7-1184979e7df6。root已看过实际PNG：view-purpose-space-panel.png（普通viewport，含完整地图/侧栏/相机与UUID入口）、view-purpose-space-light.png、view-purpose-graph-light.png、view-purpose-space-dark-390.png、view-purpose-graph-dark-390.png；view-purpose-before.png为旧首屏。完整DOM保存在TEMP/final-ui-space.txt，末尾词面主题实际点击结果另存final-ui-text-theme.txt。全页截图会改变可视高度，不用它证明原viewport首屏；首屏位置来自普通viewport的DOM与截图。

## 已见现场失败、修正与并发

- 首稿主题块高226px、地图在首屏下方；r2压缩导览后canvas顶部594.2仍偏低，r3仅非宠物heading收紧后544.25。三次事实与r1/r2/r3报告均保留。
- 二维浮层宠物遮挡正文/定位/依据：先回写基线、原planner修订§6、fresh Gate-2补审PASS，再S3仅App hidden加入graph。最终图页无浮层，记录页和空间大展示保持。
- 初次跨工具点击撤销时短暂toast已消失，Cua selector deadline/no_matches；没有写成撤销通过。回收站恢复后在同一次调用内及时软删→撤销，18条复测成立。
- 并发App导入PetPortrait而export尚未落盘期间，Vite曾有missing export与App/Spatial HMR失败3条error（2026-10-04T18:11:28–29Z）。原日志final-ui-console.json保留。后续完整构建exit0、显式reload实际回路成立；2026-10-04T18:37:05.925Z重新加载后新warn/error为空，证据final-ui-console-fresh.json。不能把整段历史控制台说成无错。
- 关闭根自建5197样例服务器时读取完整服务端历史输出（工具c895a2），进一步区分02:11:29的Spatial HMR失败：当时新import已写入而spatialExplore.css尚未落盘，服务端报Failed to resolve import及Pre-transform error；并非全部HMR都由PetPortrait造成。文件最终落盘、根两轮build与后续显式reload成立，保留中间态失败。QA tab已关闭、viewport此前恢复；自建8273会话受控Ctrl-C结束exit 1，属于验收服务器清理，不算产品测试通过或正常应用退出证据。
- 根文档patch的旧0.6.0标题失配，apply_patch拒绝且未写入；重读并发0.7.0最新README/CHANGELOG/Spatial文档后仅补本轮段落，保留宠物发布范围和原验收记录。
- App并发PetPortrait/PET_CHARACTER_NAMES、Settings petName及RecordGarden companion/animate不归本轮；PetCompanion、RecordGarden及宠物feature文档变化保留。最终冻结diff按本轮段落与外部差量区分，不整包stage/commit/push未知修改。

## 最终身份与审查

TEMP/final-manifest.json冻结本轮11份产品/测试文件与5份当前能力文档；final-diff.txt为真实before/current差量，baseline-changes.json列出所有基线变化以识别并发归属。新文件以空输入比较；git diff exit1是有差量，非测试失败。未使用混合HEAD替代基线。

独立审查与root核对发现README、CHANGELOG、Spatial.Experience三文档被外部宠物/日历收尾继续写入，旧冻结匹配命令真实exit 1（root工具2c5775），11份产品/测试及Progress/Graph仍匹配。旧身份/差量另存final-manifest-r1.json与final-diff-r1.txt；root完整核读三文档r1→r2差量final-docs-drift-r2.txt（工具9348b0 exit 0），均为并发月历共享伙伴与宠物发布范围事实，本轮视图段落保持。该文本以真实before加原统一diff重建r1、只归一化LF，byte身份仍以旧manifest为准。新final-manifest/final-diff重新冻结16份当前内容，提交fresh审查；不覆盖对方文档或把旧身份当作新身份。

Fresh独立Review(Impl)见[review_notes_impl_r1_1.md](review_notes_impl_r1_1.md)，协议PASS、业务PASS、无阻断；报告SHA256为E54A65E3E5BC0C7A6BC044AA515A4E398C764EB11338E0DE4D4D63AA24F6F63D。root全文核读全部必填字段、真实闭环与证据不足边界；随后独立核对16项当前内容匹配，并匹配manifest SHA E4FBB6D9C952790F875867FF0BBB811F53E702D23EBE0DA40B811E92C6A12FFB、diff SHA 12FE42A105BAB19EEF80D1A87FC1435C47ECA18CAC9B6EBBBB0A13664721ABB0与LW SHA C01F911B5DF9E65F6E7DFA7BB393A56390AC474DE7FAC6F2066095FC94A27228，exit 0。root本次收口只更新feature状态/证据/索引，未再改冻结产品与5份当前能力文档；此前Gate报告只放行实施，不替代本轮验收。

root确认QA端口5197已无监听（工具2bc2a7 exit 0）。工作区仍有其它功能和旧迭代的大量修改/未跟踪输入，本轮产品差量依赖这些既有输入，不能直接整体stage/push或提交成一个缺依赖的独立源码包；未执行Git提交/推送，不改写历史或丢弃他人工作。本轮英文消息建议：`feat(notes): separate spatial exploration from graph reading`。

## 未测边界

广泛 GPU/WebView、原生 GUI/安装卸载、触屏/读屏/真实 IME、长期资源/耗电、完整故障注入未测。本轮前端构建与 pure tests 不证明这些事项。日历/宠物功能保留不等于替对方 feature 完成全量验收。
