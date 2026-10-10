# 整体实施审查 r1 / 第 1 次

- review_target: impl
- impl_round: 1
- review_seq: 1
- review_date: 2026-10-07
- 协议结论：REVISE
- 业务结论：PLAN_DEFECT
- 实施引用：`impl_report_r1.md`（截至本次阻断判断尚未落盘）；实际已读 `impl_report_s1_r1.md`、`impl_report_s2_r2.md`、`impl_report_s3_r3.md`、`impl_report_s4_r1.md`，及各包最终独立审查、clarifications、当前423行LW和verification。

## 结论及范围

源码与自动测试没有发现新的局部阻断；但 root 本轮真正启动正式交付 EXE 后观察到旧侧栏界面，未运行当前三主导航/自绘标题入口，不能交付或提交发布。当前阻断来自真实原生效果与新包身份不一致，不是要求用户承担专业验收。用户已授权继续开发、构建和独立 Windows 桌宠，无未答需求，也不需要重复询问许可。

## 必填字段

| 字段 | 结果 | 依据 |
| --- | --- | --- |
| goal_lock_alignment | drifted | G3要求新EXE实际当前入口，现场仍旧UI；G1/G2代码虽在新包里，实际入口尚未成立 |
| anti_goals_touched | possible | 最新main caller校验无法区分被缓存的旧main App；旧保存快照风险需真实库比较，不宣称已经丢数据 |
| authoring_ergonomics_check | pass | 正文保留受限纯文本、S1去专用root；有限App业务回调未引入作者配置负担 |
| declaration_readability_check | pass | TS/Rust有限摘要、意图和actual caller明确，平台helper只绑定pet |
| plan_defect_checkpoint_recommended | yes | 原计划缺原生旧缓存先于入口执行的保护/迁移/验收闭环 |
| plan_defect_checkpoint_reason | 已核身份的正式EXE仍渲染旧App | 新入口内的修补可能根本无法执行，必须重新定义bootstrap顺序与数据保持验证 |
| plan_defect_trigger_reason | G3现场漂移且恢复涉及native bootstrap与发布验收 | 不是现有少量UI点的局部修补；需LW补入收敛/迁移/回滚边界 |
| impl_safe_validation_check | pass | reviewer fresh155项及79源码输入/3交付文件/5资源hash验证均exit0；不能代替原生 |
| coordinator_handoff_check | pass | root实际启动发现并回报失败，未把build/各包PASS伪装原生完成；整体仍REVISE |
| 基线与澄清一致性复核结果 | FAIL | 用户授权/目标理解一致；当前实物没有满足G3，不能按实现文档放行 |
| 设计味道扫描结果 | WARN | 平台与异步桥接体量较大但专属本功能；缓存修补应有限、不得升级通用迁移平台 |

## 阻断 R1：新程序身份正确，实际渲染入口仍旧

**root 本轮原生证据**：从正式 `target/deliveries/0.9.0-release/qingjian.exe` 启动 PID35096；FileVersion0.9.0、SHA `D432FBC637B796C2BF0300DB378D0FE136823E815E45DC16DCCC5511984444ED`。真实 WGC 主窗截图出现早期左 sidebar 与4条浏览器seed样例，没有当前三nav/自绘标题；与启动前SQLite3条基线不同。最初没有可见pet。root正在再次比较真实旧库并正常关闭该旧UI；本报告不猜测已经发生保存/数据损失。

**reviewer 独立源码证据**：`src/main.tsx` 的 main/Web 分支仍无条件调用 `registerSW({ immediate: true })`；`vite.config.ts` VitePWA 为autoUpdate、workbox缓存 `**/*.{js,css,html,glb}`。当前native入口只有实际执行该main模块后才判断Tauri label。由此存在旧HTML/旧JS在新模块前运行的风险。**Service Worker缓存是与现场吻合的推断，尚无controller/cache响应取证，不把它写成已确诊根因。** 也应排除origin/API初始化等其他入口差异。

最新Rust `require_label(window.label(),"main")` 能拒绝pet，却不能拒绝旧main bundle的业务保存。因此仅在新App内清缓存、仅改版本、清整个WebView用户目录或关闭当前窗口重开，均不能证明安全升级；清全部浏览数据还可能删除草稿/偏好，违反G3。

### 为什么是 PLAN_DEFECT

- 局部条件不成立：恢复必须覆盖native启动时序、旧缓存控制下入口、PWA桌面边界、发布证明和数据保留，超过原提醒/布局少数既有实现点。
- 低风险条件不成立：若旧App先运行，可写业务快照；若清存储过宽，可丢草稿/偏好，需重新核对迁移及回滚口径。
- 无新决策条件的需求层成立，但计划层不成立：无需用户新产品决定，仍须原地补LW的任务/验收/回滚与已落地代码收敛。

不命中PROBLEM_DEFECT：用户要替换桌宠、简洁界面及使用新EXE，方向正确；问题在实现路径缺旧版本入口保障。

## PLAN_DEFECT 回退输入包

1. **是否澄清**：不需要；在已授权升级/数据保留范围内修复。缺具体缓存状态属于低风险取证，root承接。
2. **LW原地修订**：保留S1–S4全部已实施支撑文本，§2/3补启动主链和事实映射，§6/7补native bootstrap/cache收敛；相关章节加本轮修订说明与统一标签，不删除历史失败与原责任边界。
3. **收敛/迁移任务**：先证明实际原因；若原生旧SW/cache，提供先于旧页面业务脚本的有限保护入口。停止原生SW注册，清该origin的SW/CacheStorage并等待完成后加载新入口，保留localStorage所有草稿/偏好、SQLite及identifier。失败应停在清晰可见安全状态，不允许cached旧App继续保存。不能以正常新入口内的注册停用替代旧控制器升级路径。
4. **验收任务**：受控旧缓存origin实际升级，确认旧App没有先行保存；正式identifier真实旧库backup/字段逐项比较，localStorage草稿/偏好前后保持；新EXE actual label/当前UI/pet双窗，最终版本/path/SHA重新对应新输入。先验证隔离旧缓存，不用清用户数据作为测法。
5. **回滚任务**：程序/模型/证据保留，失败不自动还原或删除业务存储；不使用旧EXE降级写库。只清限定缓存；清全WebView目录或`clear_all_browsing_data`不符合数据保持基线。
6. **实施偏差摘要**：S1–S3代码按LW存在，S4包身份正确；现场执行的是旧UI，因此不能从79个输入hash/新EXE版本推断当前入口实际运行。新的bootstrap任务是保护既有实现可实际抵达。
7. **必须保留**：唯一main保存、取消初始化、提醒真实显示ACK/M1修复、Win32拖动循环/自有移动分类、legacy往返、五模型资源隔离、S1编辑实证及所有已有报告/失败。此次不需要删除这些支撑；若拟删除或大规模重排，需升级处理，不包装普通回退。

## 已独立执行和核查的证据

- fresh `node --test --test-reporter=spec tests/*.test.mjs`：exit0，完整155/155、fail/cancel/skip均0，Node类型擦除experimental提示保留。真实hook覆盖ACK先于publish、最新资格改变、owner取消及失败不写日键。
- 五refined源/local/dist逐个hash相同，五ignored路径命中且`git ls-files src/local-pet-models`为空。原创/奶龙和三连续主体是实际不同GLB；形象满意度不由hash测试判断。
- fresh hard assertion：delivery manifest79个SourceInputs与当前源码全部一致，三个artifact大小/hash一致；EXE/NSIS ProductVersion0.9.0。MSI版本只引用S4 COM实测，reviewer独立核其hash，没有把文件名当产品版本。
- 实读完整main/pet入口、useMainPetBridge/DesktopPet/protocol/motion、Rustdesktop_pet/native helper、五业务caller、pet ACL；另读scene/View/Figure/model解析及S1实际调用/diff。批量读取输出截断后针对性补读关键文件，不以截断中段自证全量阅读。
- native helper的UI线程同步位置分类、lock在Win32调用前释放、NCDESTROY context回收与正常转发、dragId exit后稳定finish，当前未发现确定局部代码缺陷。极端Win32 API失败/混合DPI未实测，不将纯状态测试冒称设备覆盖。
- `impl-safe`构建/Rust测试由S4报告实际fresh命令支持；本reviewer避免同时争用dist/target，没有自称亲自重跑Rust/build。根自动门与本轮原生失败应一起保留。

## 基线/反目标核查

未回答列表为空，头脑风暴决策未被源码违反；目标实物G3尚失败。

| 禁止项 | 证据 | 结论 |
| --- | --- | --- |
| 正文宠物扩展/商城养成/第二待办 | codec/format仅legacy固定文字；PetIntent有限，App复用原入口 | 当前源未踩中 |
| pet挂App/业务快照/AI | actual-label动态入口；pet无store/业务写入；lib五命令先caller后副作用 | 当前源未踩中；旧main入口另有风险 |
| 全局监听/托盘自启/全桌面覆盖 | fixed HWND helper、220×260窗口、pet ACL仅listen/unlisten | 未踩中 |
| schema/identifier/备份迁移、全库替换 | Rust diff无schema修改，正式configidentifier不变 | 当前源未踩中；现场旧库比较待root |
| 私有模型和制品提交公开 | ignore/ls-files、source/local/disthash | 未踩中 |
| 版本/Web截图冒充原生 | 本次正确版本仍旧UI，报告明确REVISE并保留失败 | 不允许以现有包放行 |

## contract drift / stale / mirror mismatch

原LW `cameCase`拼写依既有明确解释采用合法camelCase；共享skills章节计数/批量问题数量历史张力已记录，不静默改技能。新的漂移是原生已安装origin缓存未纳入计划主链，需要本次PLAN_DEFECT原地收敛。部分发布文档仍处“构建进行中/待现场”，由root在真实结果后同步，不把更新文字作为根因修复。

## 后续

回到当前LW原地修订并独立Review(LW)，落地有限启动保障后fresh重建和真实旧缓存/旧库/双窗验证，恢复整体Review(Impl)。当前不允许Archive/发布commit/push，用户可以继续观看候选但不能称更新完成。设备/造型主观满意和异常故障组合继续明确未测，不强塞用户专业验收。

无新增跨功能事实。
