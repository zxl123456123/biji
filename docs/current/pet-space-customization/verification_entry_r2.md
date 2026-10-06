# R2 伙伴入口：root 本轮验证

- 日期：2026-10-05；范围：既有正式 feature 的 S5，独立伙伴页、设置直达与必要布局。
- 用户原文：「下一轮如何继续收敛你操作一下」。既有自主开发授权继续有效；本轮不重新构建 EXE。
- 需求与业界输入：[feedback_entry](source_materials/feedback_entry_20261005.md)；权威边界为 clarifications 的 R2/C1–C3；实际计划为 lwplan.md 的 S5。
- 结论范围：root 本轮双源测试/构建退出 0；有界 UI 操作已有证据。最终独立协议/业务结论以 [fresh Review(Impl)](review_notes_impl_r2_1.md) 的真实报告为准；用户体验、Windows 全量验收和长期性能仍未关闭。

## 源与保护身份

证据根目录：`C:/Users/ZXL/AppData/Local/Temp/qingjian-pet-entry-20261005/`，下文 TEMP 均指此处。新 `preview-source` 从旧固定发布副本的 150 份源逐文件复制；node_modules 仅为工作区依赖 junction。工作区 before 247 份源/文档另有实际副本与 JSON 清单。新预览只叠加本轮 App/styles 入口差量，没有复制工作区整份 App。

| 最终源 | SHA256 |
| --- | --- |
| workspace src/App.tsx | A9B58572F146DEBE055B8A2B8E388D875518AF9E74C972A3E59261A3EB346202 |
| preview src/App.tsx | 5674125B997818A7CCAC8BC646719D77275A632D4598C3D578C12E645E923ABD |
| 两源 src/styles.css | E5D6FC8B7F4A3FA43EDF310F6C1C444DE3AB0E41F43CE28A1CA7912FDC3B1B46 |
| 两源 src/pet.css（未改） | 0E5150E714A00295BE46272726355C291312F80E3A854D4F1A9C033643A486AC |

root 使用 `python TEMP/verify-source.py` 独立核对150旧发布源、工作区保护源、三旧制品，真实输出仅两源 App/styles 改动，protected/release/artifact drift 数组均空；命令8339cb→00998f退出0。源码差量完整复核：工作区 App/styles 在 a024f3，preview App 在2fcb39；之前截断读取不作为完整消费。实际四 diff 位于 TEMP/diffs。检查脚本仅写新证据目录，没有改产品或旧发布源。

工作区月历与主题探索/二维局部图源码保留；新5190预览排除这两组并发增量，5191只用于检查真实工作区构建。两份构建身份、测试数量分别记录，不混用日志。

旧三制品不变（artifacts-before.json 与 root-source-proof.json）：

| 制品 | bytes | SHA256 |
| --- | ---: | --- |
| src-tauri/target/release/qingjian.exe | 13705728 | 9F04E006C93FF9AC4E66C3819762BB0104AB8FC48912B83648EF4AF068E1A397 |
| bundle/nsis/晴笺_0.7.0_x64-setup.exe | 3909543 | 0BB91F58E8475179E915A5A161BF6540DCABE6699FC640BB1A24EEF6F527F414 |
| bundle/msi/晴笺_0.7.0_x64_zh-CN.msi | 5337088 | 6E334D074E8D709043BBB64AD873AC31D9C18DC916389A8F04D503100AB02572 |

旧固定 release-source-r2 与5187预览仍为上一轮版本，不包含本轮入口。没有写真实SQLite或在用户旧页面导入夹具，没有提交/推送混合工作区。

## root 独立命令

均在本轮执行；每个原始 log 与 `.exit` 保存在 TEMP。root 读取退出码、完整分块测试日志及完整构建日志后才认定结果。子 agent 的工作区 build 自证仅在 impl_report_r2.md，不替代下表。

| cwd / 命令 | 原输出及实际结束 | 结果 |
| --- | --- | --- |
| E:/project-funny/biji；`npm.cmd test` | root-workspace-test.log/.exit；10d6f0→066bf4；完整分块 f50d99/62083c/209b8e/a4193c | exit0；145 tests/pass，fail/cancel/skip/todo均0 |
| TEMP/preview-source；`npm.cmd test` | root-preview-test.log/.exit；d34933→1579fe；完整分块124dc0/c0427c/582c97 | exit0；118 tests/pass，fail/cancel/skip/todo均0 |
| workspace；`npm.cmd run build -- --outDir C:/Users/ZXL/AppData/Local/Temp/qingjian-pet-entry-20261005/workspace-dist` | root-workspace-build.log/.exit；ce1684→bf0080；完整读取b15311 | exit0；tsc + Vite，2515 modules |
| TEMP/preview-source；`npm.cmd run build` | root-preview-build.log/.exit；d34ee5→ba03a7；完整读取b15311 | exit0；tsc + Vite，2504 modules |

工作区 SpatialNoteMap/index 为590.48/590.77 kB；preview为587.45/590.00 kB，两源均保留大于500kB chunk警告。workspace外部outDir提示不会自动清空，使用的是本轮新目录，没有强制清理。Node实验性 stripTypeScriptTypes 警告保留。PWA生成14/10项预缓存、1341.46/1305.03 KiB，不能据此判断伙伴页的空间执行或完整性能。

## 实际 Web 操作

root通过CUA操作全新5190 origin，导入qa-notes.json的30条合成记录（无真实用户内容），刷新回记录页，随后首次记录→伙伴。旧5187设置页实际仅显示/收起伙伴，ui-before-settings.txt/png记录改前路径。

| 操作 | root观察与证据 |
| --- | --- |
| 主导航伙伴 | h1伙伴与五角色/本机装扮铺可见；ui-first-partner.txt、ui-first-partner-dom.json；无canvas，浮层wrapper hidden=true且0尺寸（常驻DOM仍存在） |
| 设置挑选装扮、收起时Enter直达 | ui-hidden-keyboard-entry.txt；先收起再Enter进入伙伴，返回记录浮层仍hidden=true，没有进入页面自动开启 |
| 乌萨奇试穿→记录→伙伴 | ui-trial-usagi.txt；记录仍晴小团，再入伙伴恢复晴小团当前已穿值，不泄漏草稿 |
| 奶龙+薄荷晴天+柔软围巾→穿上 | ui-applied-nailong.txt；明确「已保存在本机」，刷新记录页浮层奶龙可见，设置描述随奶龙名字；筛选往返现场也有奶龙浮层 |
| 五角色招呼 | ui-five-role-greetings.json；实际逐角色选择并招呼，分别见原创团子问候、奶龙开心跺脚、吉伊害羞、小八探头、乌萨奇乌拉；不以文字消息证明持续动画帧率 |
| 休息/唤醒与关闭动态 | 奶龙休息呈睡眠文案，唤醒可操作；main为motion-disabled，展示SVG计算animationName无非none值；静态不禁用选择 |
| 新建记录模态 | ui-static-modal.txt；背景角色、装扮与提交按钮disabled，关闭后可操作；没有修改或保存笔记 |
| 搜索往返 | ui-filter-roundtrip.txt；「入口验收 01」返回后输入值与1条结果保持 |
| 原3D兼容 | ui-space-compat.txt；canvas=1，30条可选择，select含31项（含占位）；原奶龙视角仍显示已应用装扮。没有把本轮入口测试升级为全部空间回归 |
| 375深色、1100中宽 | ui-preview-375-settings.json/png、375-pet.json/png、1100.json/png；配置375时内容client/scroll均360（15px滚动条），按钮横坐标不重叠；1100时1085/1085，五导航不越界。Tab从3D到伙伴后Enter进入，长耳完整；图片由root实际查看 |
| 工作区独立现场 | 5191来自workspace-dist；主导航含记录时光与伙伴，独立伙伴canvas=0。375浅色设置收起→Enter挑选装扮直达；1100实际尺寸1085/1085，六导航可达。ui-workspace-375.json/png、1100-actual.json/png与1100-settings.png；不重新验收未改月历或关联模块 |
| 浏览器日志 | root读取新版tab14的warn/error最近100项，结果为空，ui-preview-console.json；仅代表本次有界会话，不是零bug保证 |

最终实图：`C:/Users/ZXL/.codex/visualizations/2026/10/02/01a0fc52-c082-7c00-b650-78e2c95b7cfa/qingjian-entry-convergence-20261005/partner-entry-live.png`，root已实际查看完整奶龙与装扮页。不是AI示意图或旧5187截图。新预览tab14标记deliverable并请求在Codex面板打开，工具返回queued，不声称用户已经切到新版。测试用工作区tab15已关闭；临时viewport调用reset，最终捕获的内容宽度1085，不能由reset请求推断不同tab已恢复任意特定尺寸。

新5190服务由本轮Start-Process Hidden创建，PID42384，工作目录为新preview-source；收尾Get-Process仍有该node进程，5190健康读取cb5e5d退出0、HTTP200。旧5187不处理，收尾却发现其服务无法连接，原因未确认；固定源/缓存版本未覆盖，不宣称旧服务继续在线。工作区5191验证服务PID19204在核对node.exe、workspace-dist与5191命令行归属后受控停止，ac83d5退出0且无5191监听；没有终止其它窗口服务。

## C3 运行边界与未测

实际首次路径为30条记录刷新→伙伴，前面未访问空间/关联图。ui-first-partner-dom.json记录无canvas；wrapper存在但hidden且0尺寸。源顺读确认PetShowcase直接分支只传四政策与applied/callback，未传笔记；SpatialNoteMap仍lazy，仅space分支挂载；`useNoteGraph(activeNotes, view === 'graph' || view === 'space')`原条件保持。hook创建worker仍需enabled submit，因此本轮入口不启用该计算。hook仍计算部分语义快照，不能声称完全不处理记录。

**现场资源/SW控制状态与实际Worker请求未测**：CUA evaluate的只读页面facade不暴露navigator/performance；首次尝试navigator.serviceWorker触发TypeError，随后typeof两者均false。没有用其它浏览器驱动或执行注入绕过。PWA可预缓存lazy JS，下载与执行分开；仅源码接线+DOM不能宣称实测Worker进程、GPU/FPS/内存或绝无下载。

未测保留：native完整GUI、安装卸载、旧数据迁移/正常退出、触屏/读屏、系统减少动态、真实失焦/后台、弱GPU/持续动画/长期耗电、PWA更新。R1的连续3D动图三次失败及旧Windows边界仍见0.7.0记录，本轮不关闭。没有新增宠物行为、真实3D宠物或商店支付。

## 所见失败与工具修正

- 调研首次Three manual的旧/en路径404，改读官方/pages/rendering-on-demand.html；没有据404推断技术结论。
- 初次按5187 URL取tab遇两同址匹配，改明确绑定root的tab11；没有操作另一个用户tab13。
- root保护脚本最初反斜杠归一化不适配单分隔符，产品改前修为Path.as_posix并跑全源before无漂移；工具错误不隐去。
- 批量diff/测试/当前docs输出截断；改前实际实现已按块读取。最终diff和两份测试日志重新分块完整消费（见命令表），未把截断读当完整验证。
- CUA首次资源读取TypeError见上述C3限制；随后DOM读取可用，navigator/performance均不可用。
- 原生AX把aria-pressed角色显示成checkbox，Playwright checkbox乌萨奇定位超时；读实际DOM为button后使用button成功。不是业务角色选择失败。
- 穿上后立即切记录、动画过渡尚未结束时一次isVisible=false；刷新后及后续筛选往返实际奶龙浮层可见。保留这一瞬时观察，不保证过渡的任意一帧都可见。
- 工作区新tab第一次名为1100的证据实测client1265（新tab未继承另一tab的override），不作为1100验收；重新对实际工作区tab设置后1085/1085，保存-actual证据，错误命名旧图保留。
- 收尾Get-NetTCPConnection/CIM联合查询437559退出1，旧5187无匹配监听；后续5190健康读取HTTP200、Get-Process见PID42384。旧5187健康读取330c28有连接拒绝错误，PowerShell非终止错误使该命令最后exit0且输出0长度，不能认其健康成功。旧服务停止原因未确认，本轮只受控停止自己的5191测试服务；没有为旧端口猜测或重启外部进程。
- 无test/build失败退出码；上述工具问题、警告和缺证均不由测试绿色抵消。

## 审查交接与下一步

唯一实现包的真实报告为[impl_report_r2.md](impl_report_r2.md)，readiness与Gate-2输入分别为review_notes_readiness_r3.md、review_notes_lw_r2_1.md。fresh reviewer需读本报告、最终真实diff/双源保护、四份当前事实docs及完整根日志；不使用旧r1审查覆盖新源。用户下一步可在5190验收直接入口与装扮，进一步优化须另锁单一目标。英文提交建议：`feat(pet): add direct companion and wardrobe entry points`。
