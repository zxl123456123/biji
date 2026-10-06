source_type: user-feedback
created_at: 2026-10-05
created_from: current user turn + root observations + independent readonly audit
related_stage: R2 Readiness/LW/Impl
supersedes: none (appends to r1)
status: authoritative R2 input alongside clarifications

# 2026-10-05 伙伴入口收敛：追加输入

用户原文：「下一轮如何继续收敛你操作一下」。承接此前「自主开发实现」「直接完成等我回来验收」授权，常规可逆的界面收敛由本轮直接推进，不要求重复阶段许可；不是归档、整包发布或同意合并并发功能。

当前实际事实：根命令0da41c核对旧release-source-r2全部150文件SHA仍相同，新隔离preview-source复制此冻结源；247份工作区src/tests/docs建立只读before。浏览器原11标签5187的可见主导航只有记录、关联图、3D空间、账本，宠物装扮在3D空间角色标签里。只读audit独立核对App:57/266、PetCompanion:183-185、SpatialNoteMap:44-47，给出入口发现困难的静态证据，没有猜测动作逻辑故障。

收敛选择：主导航新增「伙伴」独立页面，设置「挑选装扮」直达同页；复用既有PetShowcase、App applied值和全部政策。宠物入口不挂载SpatialNoteMap，也不启用useNoteGraph worker；原3D中的宠物视角先保留兼容。仅相关App和必要布局CSS。不是新增宠物系统或改动空间运行时。

业界对照：采用MDN button的可访问文本/原生键盘激活，沿用已有SoftButton；本轮不是tabpanel模式，不引入只有ARIA角色但没有完整方向键协议的伪tab。
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button
- https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- https://threejs.org/manual/pages/rendering-on-demand.html
继续空间按需资源与绘制的既有边界，不换框架。最初manual/en链接404，改用实际pages链接读取；记录失败，不推断框架行为。

范围：工作区新增入口但保留月历和主题探索代码；用户先前EXE仅含宠物/空间配置限制继续有效，新浏览器预览基于独立150源并只覆盖本轮相同增量。0.7.0 EXE/安装器及5187冻结源不改，本轮不重新构建EXE，所有Windows未测边界保持。

证据目录：C:/Users/ZXL/AppData/Local/Temp/qingjian-pet-entry-20261005。source-before.json和workspace-before.json保留。UI失败：按URL查5187得到11、13两个匹配，明确绑定已知自己的11后读取成功；未关闭用户13。之前两次读取输出过长被截断，不当作全文消费，之后定向读取。