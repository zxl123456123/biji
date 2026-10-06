# 三路功能源码集成验证

2026-10-05。用户原文：“开发不要影响那两个窗口，然后并行完成功能的合并最后，你方案调研完后可以自己决策方案然后执行”。本窗口据此自主完成有界源码集成核对，保持既有正式视图功能的审查记录。没有新增产品改动、迁移、依赖、版本或原生制品。

## 决策与并发边界

实际App已经包含日历、宠物装扮、主题空间和二维局部图，不重复复制模块或应用旧日历零上下文补丁。把这份完整源码作为集成输入，在本窗口独立TEMP快照运行验证，不改另外两窗口的产品、feature、独立发布源码和构建产物。使用可读纯投影、现有UUID/编辑器和唯一已应用装扮接线，沿用已调研的正式方案，不设计第二套入口或关系引擎。

只读聊天核对：日历窗口最新final表示停止代码改动并移交另窗口统一承接；宠物窗口最新状态仍active，正在自己的0.7.0发布审查。没有给它们发提示或打断/移动聊天。其既有Q1发布副本排除月历与本轮探索，不能把该EXE视为三路合并制品。本记录的合并是源码共存与统一前端验证，不虚称已经生成Git合并提交、整合原生包或替对方完成验收。

本轮短方案是：核对真实接线→冻结完整前端输入→隔离test/build→实际交叉路径→独立复核→重新核对源身份。用户已明确允许自主决策和执行，无新增阻断澄清；若发现真接口问题才交对应owner最小修订，不顺手改范围外问题。

## 输入与独立命令

证据目录：`C:/Users/ZXL/AppData/Local/Temp/qingjian-view-integration-20261005`。仅复制src/public/tests及index.html、package.json/lock、vite.config.ts、两份tsconfig，完整前端99项、781914字节。prepare.mjs逐项核对源捕获前后、源最终与副本字节，并复核文件集；drift为空，工具04a823 exit 0。manifest SHA256为`FF2F734B7768ABB0D5368AB281CE58CA41DCCB3140F6D1D77518DBEB933CEBD5`。

`source/node_modules`只建立到既有依赖的junction，不安装或修改package/lock；TypeScript构建状态留在独立source，Vite开发缓存留在独立vite-cache，输出留在web-dist。未操作共享dist/target、未知服务或真实SQLite。Node v22.23.1、npm 10.9.8。

| root本轮真实命令 | 完整输出/实际退出码 | 结论范围 |
| --- | --- | --- |
| 独立source下`npm test` | tests.log及tests-result.json；145/145，fail/cancel/skip/todo均0，exec exit 0（133a7d） | 完整当前前端纯测试，不替代原生/UI |
| 独立source下`npm run build -- --outDir C:/Users/ZXL/AppData/Local/Temp/qingjian-view-integration-20261005/web-dist` | build.log及build-result.json；tsc -b、Vite 2515 modules，exec exit 0（cdc202） | 三路全集同源Web构建，无原生发布 |
| 验收后重算工作区与快照99项SHA | final-source-check.json；99、drift=[]，工具3764c9 exit 0 | 本轮读取时与同一源清单一致，不承诺活动工作区永久冻结 |

root实际读取上述两份完整TAP/构建输出和退出码。保留Node ExperimentalWarning、外部outDir不自动清空、大于500kB chunk警告；main gzip189.09kB、空间149.70kB、二维22.93kB、时光4.83kB；PWA14项1340.64KiB。没有将它们称为帧率/能耗证明。

## 实际交叉验收

使用同一99项源码快照、独立origin `http://127.0.0.1:5207/qa-view`与18条合成记录。夹具和既有qa-server仅用于新origin；没有操作用户日常origin或旧库。Cua执行实际控件，未读应用私有状态代替操作。

- 奶龙加画家帽仅试穿，离开到日历仍为晴小团；重新进入大展示，未应用草稿已经丢弃。`ui-draft-calendar.txt`记录日历仍为晴小团。
- 再选择奶龙/画家帽并“穿上这套”，日历显示奶龙及帽子，9月仍18条/18天，5日1条已完成，摘要和打开记录保持；返回记录页显示同一奶龙浮层，回大展示仍为奶龙/画家帽、已应用。原文证据ui-applied-calendar.txt、ui-records-pet.txt。
- 日历打开第1条记录进入原编辑器，9月5日、设计标签和原正文准确回填；关闭而未保存。ui-calendar-editor.txt保留，不重宣称整套编辑器保存/撤销验收。
- 同一App切到主题空间，保留奶龙页入口、主题导览、折叠配置、静态相机与全体文字选择；选qa-view-2显示完整正文和2条关联，再点“查看此条关联”进入同UUID一层图，3节点/3关联/匹配18。实际DOM选择值qa-view-2、浮层按钮0，证据ui-space.txt、ui-graph.txt、ui-proof.json。
- 本次新origin控制台warn/error读取为空，完整console.json保留；这不抹去此前工作区的TS/HMR中间态失败。

实际媒体位于`C:/Users/ZXL/.codex/visualizations/2026/10/04/01a107f2-1388-7e72-b4f7-1184979e7df6`：integration-shared-pet-calendar.png、integration-local-graph.png，root实际查看。浅深/390px的较广视图回归仍见同一产品身份的[前轮验证](verification.md)，本轮交叉路径只新测默认桌面viewport，没有冒称新做一遍全部设备验收。

## 失败、既有问题与清理

- 首次read_thread包含超长开发turn，批量输出截断；改用wait_threads紧凑当前状态，不以截断历史判断窗口结束。runtime也单独完整补读。
- 首次TEMP qa-launch用Windows C:路径直接动态import，ERR_UNSUPPORTED_ESM_URL_SCHEME，工具0a155e exit 1；已生成的qa-server本身保留，随后直接用node执行该入口正常监听5207，没有修改产品或掩盖首次失败。
- 验收后关闭本窗口新Tab，自建51069服务受控Ctrl-C结束exit 1（a45448，qa-cleanup-result.json），属于测试服务清理，不是正常产品退出验收。端口5207无监听已核对exit 0；没有临时viewport覆盖。
- 保留前轮地图首屏过高/宠物遮挡、S4中间态20条TS诊断及HMR失败，详情各原报告与verification；当前99项源的新命令结果不能删除那些失败。
- 发现但未改动：旧store对缺scheduledDate且createdAt非法的笔记仍可能在初始化抛RangeError；日历/二维普通按钮与空间的businessEnabled策略未统一。前者已有历史夹具白屏，后者是源码策略差异且本次未证实新故障；都不是已修复项目或本轮新接口冲突，详见[integration_audit.md](integration_audit.md)。不顺手扩大修改范围。

## 独立复核与最终边界

独立reviewer先核对App、画像、日期/编辑、安全正文、UUID定位、懒加载与避让，再完整读取本轮test/build日志、真实退出码、99项manifest和现场原文，实际查看两张图片，并独立重核工作区与副本99项：drift为空、5207监听为0。最终协议PASS、业务PASS，限定当前前端源码共存与已测桌面交叉路径，无集成阻断项；不扩展为原生发布或全部设备验收。root在工具11a266 exit 0中全文核读[integration_audit.md](integration_audit.md)，其最终SHA256为`5E2DDF2A76351219465A242F08756D9959B1112393655C722D77CE6C063A6178`。root收口后另存final-source-check-r2.json重新核对源身份；如漂移则不能沿用本结论。

只读聊天最后一次状态仍为宠物窗口active，其最新消息说明自身独立审查通过、正在同步交付状态，安装包继续排除月历与本轮探索。未发送消息、等待其停工或代它结束；本窗口以已验证的源码集成收口。

三路整合原生制品、发布范围/版本、安装卸载、多设备GPU/WebView、读屏/触屏/IME、长期资源与完整故障注入未测。本轮没有原生构建、Git提交/推送或对其他窗口发布产物的修改。源码集成结果可审阅；另窗口自己的发布与验收由其owner保持，不自动关闭。
