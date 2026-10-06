# R3 装扮布局实际验证

当前最终来源、产品 SHA 和交付以下文「最终 r3-4 根事实追加」为准；其余 r3-3/77CA/5198 是当时保留的候选记录，旧文中的“最终”只指该轮曾拟定的候选，不代表现行结论。

2026-10-05，用户「继续吧」承接上一轮建议的装扮布局/轻反馈及同源 EXE。范围以 clarifications 的 L1–L3、Q1 和 lwplan S6 为准；S1–S5、R1/R2 与其他并发功能保留各自范围。本轮未归档功能或关闭用户体验验收。

## 规划与实施输入

root 完整读取调研、发布核对和 readiness，首轮 LW REVISE/PLAN_DEFECT 后修订 flex/block 骨架，再全文消费 Gate-2 PASS/PASS；继续既有 ManualMode 授权，只派两产品文件实施。没有因技能要求新增批准或暂停。原网格骨架未直接实施。

| 文件 | SHA256 / 结论 |
| --- | --- |
| source_materials/feedback_layout_20261005.md | 48CAAEEF8B26E90827B641153E60B40AED2A88580BFCF8C964F2E36DA9F56309 |
| clarifications.md R3 | 7F7C1CAFDA7ABE8C856293BEDA26D7AA68E438FA934A795C15D31BB8174E8461 |
| source_materials/research_layout_r3.md | 09144FA3C3E6C654971E492225940BC96A47CEE101D0AA91E5881307EE0B7FA5 |
| source_materials/release_layout_r3.md | 5F6BEE3E5B1C88DE4310E86102E6B9DA557700FB48A2EA908EC02B87266ED568 |
| review_notes_readiness_r4.md | DA9A712049804FF63157CC7A0C49B808FC7E68942903FB99862A2CFBC4884951 / PASS |
| lwplan.md 最终 S6 | C714ABA584F7E5ABE651C8808188D2B6D401698FBD60C2E55681DC63D080689E |
| review_notes_lw_r3_1.md | 37F4448E525DEDD4B81A266DCC9A5D0E34A280C5DD7AC06BDBB89FE9E98BA915 / REVISE，PLAN_DEFECT |
| review_notes_lw_r3_2.md | 48D56E92A76A8D9E82A11A77F86700AFCC4472435C4FE6C7F1D6302D185D2D29 / PASS/PASS，Gate-2 PASS |
| impl_report_r3.md | 59C1691743A574C4EA7A02AF085983F310CE5F71E4D5303AEF318806CED20D13 |
| impl_report_r3_1.md | DE4DD97F74D294E4326616AC9F5BB229DCC432C4FDBF0C074DD40CBE189536A5 |
| impl_report_r3_2.md | A6829EB07E12E90FB8C3CA1DADC1454544F2C8AD928374D1946D6ADEC063A4A5 |
| packaging_source_r3_1.md | BD7FC8553B43D60B10F1964C7832B6C1AD8B4ACDD4FD57236360E6EFCE6E15D8 |

root 已核两文件真实差量：TSX 行为前缀 16167 字节 SHA256 `45DEF0056E0E7BF329F3271399EAF848992D2714D6A299D4E507B4DDA36CD90B` 保持，所有 hooks、handler、试穿/应用及角色动作保持。大预览内无状态 span 的 key 只绑定外观；移动端两次补修限底栏留白与选项 scroll-margin。初版普通尺寸通过不掩盖放大字号的两次真实遮挡，最终源码重新双源测试/构建并生成新 native，旧候选不交付。

采用原生 CSS sticky 与 transform/opacity，参考 [MDN position](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position)、[W3C sticky 边界](https://www.w3.org/TR/css-position-3/#stickypos-insets)、[web.dev 动画指南](https://web.dev/articles/animations-guide) 和 [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)。已有 CSS/SVG 与动态政策能满足本轮范围，因此没有引入额外动画库或 JS 高度测量。具体命令、UI、旧候选、压力红绿、制品、库和全部工具失败见[0.7.1 版本验证](../../Release.Verification.0.7.1.md)。

## r3-3 历史候选验证和保护

r3-3 当时候选产品 SHA：PetCompanion `DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14`，pet.css `77CA75C7A1A4EE3D0D14E4F20E941F3287C2EDAF358418EAC77C127BEA255EBA`。该候选工作区 145/145、隔离源 118/118 与两份 Web/Windows build 均 exit0，原始命令日志由 root 全文读取。预览 5198 与该候选副本同源，七份允许差量和元数据 self-only 由根脚本重新比较；其后发现休息后唤醒遮挡，因此不作为现行交付。

TEMP 根目录 `C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005`。`root-source-check-r3-3.py/json` 核旧 5190 的150源、最终150源/路径集合、恰好七差量、两产品与工作区相同、85份工作区保护源只两差量、三 Rust 源和三旧0.7.0制品保持。扩展的 `root-closeout-check.py/json` 用于全部264基线文件（只有2产品+4当前文档+3本功能过程文档允许变化）、旧r3候选150源/三制品、原历史报告与交付复制的完整保持证明；运行前不预写通过结论。

root 在临时测试页面对两入口/首尾/焦点、普通尺寸、浅深色、应用刷新和受控CSS两倍字长失败/重试重新取证，最终 `ui-r3-final.json` 明确排除旧错标签、旧函数绑定及空项。没有将用户笔记输入夹具，没有 native 安装或永久删除。真实库前后全字段等同，十秒新进程响应后受控终止；原生完整GUI、安装卸载和性能等未测不能由构建或浏览器替代。

## r3-3 实施后审查交接（历史）

fresh `/root/wardrobe_layout_final_review` 仅独立评审，不参与产品实现，不递归委派，不运行原生进程或修改数据库。审查对象是最终两文件、隔离发布/旧资料保护、根命令/UI/native/库证据及本轮当前文档；历史 R1/R2 PASS 不转用。本阶段等待根最终证据冻结后全文消费 `review_notes_impl_r3_1.md`，再填写真实身份和双结论；当前仍待审查，不宣称 PASS 或完成用户验收。

提交建议：`feat(pet): keep wardrobe preview and apply actions visible`。工作区存在其他轮未提交改动，本轮不整包提交/推送、不恢复/清理他人源码，先保持可复核差量与隔离制品。

## r3-3 候选补记（历史）

最后追加根实际短桌面IMPL_DEFECT与500px额外滚动红测，r3_3/r3_4两报告root全文消费，当时的 r3-3 候选只增加短桌面152/112及copy margin96；手机184保持。最后r3-3实际145/118及双build/native245.797s exit0，PID60504十秒响应/受控终止，690937真实库全字段保持，b76822复制三制品与41ca33完整保护 exit0；ui-r3-3及最后ui-r3-3-pressure重新现场记录。旧源450、历史制品12及两交付保持，不交付旧0.7.1目录。

新来源报告packaging_source_r3_3.md SHA D5CE35A5714AE19B3DBCD6D25FD02ADF5F7D4D7EF19B7AF271CFE21DF1DECE69；impl_report_r3_3.md SHA44E4EF49A792143B5E0BC2E9A0EC6D07754B8F6DD732932D958B80208721C6D6；impl_report_r3_4.md SHA4D193F7509ED4E7E979E0A4C927754505141BF5CA5E4B35542364E0BD7FA4565。以上新报告及两单值patch均由root完整读取；先前报告表保留各自候选身份。该候选后续因唤醒遮挡被撤回；最终审查见下文 r3-4。

## 最终 r3-4 根事实追加

以上 77CA/r3-3 与 0.7.1-final 均按当时候选解读；随后独立审查查到它在 500px 高休息后的「唤醒」按钮被满宽底栏遮挡，root 撤回旧定稿触发。r3-5 改底栏到右侧配置列后，逆向招呼仍有画像上沿 -6.7375px 裁切。r3-6 最终 CSS0357 将短桌面舞台/画像设为 136/96px；工作区五角色 500/600px 完整重走逆向配置→休息→唤醒→招呼、正向回配置；画像最小顶端 8.5875px，右底栏与左焦点无二维交叉。失败与逐轮报告 `impl_report_r3_4.md`、`impl_report_r3_5.md`、`impl_report_r3_6.md` 和 `ui-workspace-r3-6.json` 原样留存，不因绿色命令删除。

最终两产品 SHA：PetCompanion `DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14`，pet.css `0357631935DFCFEB556EAC556658B60A51F9076B2FE06C7B7823CDF7B0A64D6A`。隔离源 `TEMP/release-source-r3-4`、预览 `http://127.0.0.1:5200/`、交付 `src-tauri/target/deliveries/0.7.1-release/`。根 `workspace-r3-4-test` 145/145、`candidate-r3-4-test` 118/118、两份 Web build 与 `native-r3-4-build` exit0；最终 Windows 构建 537.515 秒。ProductVersion 0.7.1 的 EXE/NSIS/MSI 逐件校验哈希与复制，隐藏 PID20232 十秒响应、受控终止；真实 SQLite notes3/transactions0 schema/全部字段与前值一致。`root-source-check-r3-4.py/json` 核150源/七差量；最终完整保护核以 `root-closeout-check-r3-4.py/json` 为准。上述都是根命令日志，不是子代理自称成功。

最新发布页的 500px 伙伴休息/唤醒、375×500 末项与完整状态、应用刷新保留已有浏览器现场记录；工作区五角色全路径与发布页双入口前序覆盖分列，不混成同一次测试。曾有长批 CUA 超时重置、错误500标签实际780与底栏自有按钮误判；仅使用实际尺寸与真实二维交叉判据。Node/大chunk/Rust警告、完整原生 GUI/安装卸载、真实系统缩放/减动、读屏触屏、持续 GPU/FPS 和 PWA 更新均未测。独立最终审查以 `review_notes_impl_r3_1.md` 落盘结论为准；用户体验验收未关闭。

