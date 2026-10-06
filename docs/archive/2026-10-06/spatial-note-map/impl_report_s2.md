# S2 动态宠物实施报告

## 基本信息

- feature_name: `spatial-note-map`
- impl_round: `r1 / S2`
- date: `2026-10-04`
- owner: `spatial_pet_impl`
- lwplan_version: `Gate-2 r2 PASS` 后实施；独立读取 SHA256 `2C4D9DA0B9DD065718DC991655D9D94A9949FD28F9C18236EAA8EDC14F30EF87`，exit 0。
- scope: 仅 S2 四个新增文件及本报告。未写 App、全局 CSS、包/锁、版本、当前用户文档或业务持久化。
- status: 本包源码与 impl-safe 自证已交接；集成构建及真实 UI 尚由 S3/root 承接，不据此宣称功能现场验收通过。

## 变更事实

| path | change_type | change_purpose | key_changes | related_tasks |
| --- | --- | --- | --- | --- |
| `src/PetCompanion.tsx` | 新增 | 原创晴小团与大小展示 | named `PetCompanion/PetShowcase` 及固定 Props；同一 SVG 独立渐变 id；有限反馈计时；小组件 owned Pointer Events、capture、6px 阈值、8px clamp、viewport/resize、休息/唤醒/收起；blur 与政策取消、自有清理 | S2，G2/G3，A2/A3 |
| `src/petBehavior.ts` | 新增 | 可验证的有限行为规则 | `PET_VISIBLE_KEY`；四态 reducer 保留拖动前休息状态；owned pointer 及不可逆拖动阈值；位置夹限；静态交互与自动动态分开 | S2，G2/G3，A2/A3 |
| `src/pet.css` | 新增 | 本地角色动作与舞台 | 局部呼吸/眨眼/目光/招呼，自动动作仅在允许政策时存在；小层 z=24，hidden display none；大小与浅深/窄屏表达 | S2，G2/G3，A3 |
| `tests/petBehavior.test.mjs` | 新增 | 验证有限规则 | 休息/反馈/取消、owned pointer/6px/折返不误触、完整控件 clamp/resize/viewport offset、静态与禁用政策 | S2 |
| `docs/current/spatial-note-map/impl_report_s2.md` | 新增 | 正式实施证据与交接 | 本报告，包括完整日志、失败与未测、SHA、责任及回滚 | S2；root 后续汇入 `impl_report_r1.md` |

## 目标对齐

- goal_lock_check: G2 的角色、大小复用、轻触、拖动、休息/唤醒和收起接口均已实现；角色是本地原创 SVG。小组件保持挂载时位置/休息由会话 ref/state 保留，不读记录；显示偏好只导出键，写入由 App owner 承接。G3 的现场验证和发布责任留给 root，未提前称 UI/Windows/GPU 通过。
- anti_goal_touch_check: 没有新增网络调用、AI、笔记读取、Note/schema/SQLite/备份、远程素材、模型平台或养成框架；没有旧能力/未知工作回退或 Git 操作。所有新增行都为 S2 角色、互动、生命周期或其证据服务。
- authoring_ergonomics_notes: CSS 声明明确按 `data-mood/data-animate` 选择有限动作；角色按钮有中文可访问名称，休息/唤醒、收起和展示页招呼均直接可发现。暂停仍可静态轻触/休息/拖动；modal/hidden 小层使用原生 `hidden` 并禁用控件，不留 Tab 入口。实际视觉与焦点体验仍待 root。

## 验证结果

执行前已读 `verification-before-completion`。以下工具退出码与完整输出均在本轮实际读取，测试命令未以管道收尾；未启服务、控制 UI、访问真实数据库或进行 Git 操作。

### V1：纯行为测试

- command: `node --test tests/petBehavior.test.mjs`
- evidence: `C:/Users/ZXL/AppData/Local/Temp/qingjian-spatial-20261004/s2-pet-tests.log`；工具 chunk `f47bea`。
- owner: S2。
- exit_code: `0`。
- conclusion: 4 项纯规则测试通过，fail 0；仅支持相应 reducer、指针规则、夹限和政策，不证明浏览器 capture、焦点或 CSS 动作。
- conclusion_if_missing: 无真实日志或源码 SHA 不一致时相应规则未验证。

完整输出：

```text
TAP version 13
# Subtest: pet feedback settles, and resting is explicit and survives dragging or cancellation
ok 1 - pet feedback settles, and resting is explicit and survives dragging or cancellation
  ---
  duration_ms: 1.8586
  type: 'test'
  ...
# Subtest: only the owned pointer can move or tap; 6px excursion is a drag even after returning
ok 2 - only the owned pointer can move or tap; 6px excursion is a drag even after returning
  ---
  duration_ms: 0.2157
  type: 'test'
  ...
# Subtest: pet position keeps the complete controls within the viewport and reclamps after resize
ok 3 - pet position keeps the complete controls within the viewport and reclamps after resize
  ---
  duration_ms: 0.1562
  type: 'test'
  ...
# Subtest: pausing animation preserves static interaction, while hidden, modal and blur stop the owner
ok 4 - pausing animation preserves static interaction, while hidden, modal and blur stop the owner
  ---
  duration_ms: 0.1863
  type: 'test'
  ...
1..4
# tests 4
# suites 0
# pass 4
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 114.8772
```

### V2：类型检查

- command: `npx tsc --noEmit`
- evidence: `C:/Users/ZXL/AppData/Local/Temp/qingjian-spatial-20261004/s2-types.log`；工具 chunk `4e2d19`。
- owner: S2。
- exit_code: `0`。
- complete_output: 空（无诊断）；包装命令实际输出 `EXIT_CODE=0`。
- conclusion: 当前时点组件/纯规则的项目类型检查无诊断；此时 S1/S3 尚在接入，不代替最终集成构建。
- conclusion_if_missing: 缺日志/exit 或源改变时不称类型通过。

### V3：源码冻结身份与局部静态核查

- command: 对下列五文件逐个 `Get-FileHash -Algorithm SHA256`，JSON 完整输出保存 `s2-source-sha.log`；工具 chunk `8d8cf4`，exit 0。此前对 S2 源码使用 `rg -n 'fetch|invoke|localStorage|Note|setTimeout|clearTimeout|addEventListener|removeEventListener|PointerCapture|hidden=|disabled='` 并逐项读匹配，chunk `8ffdc1`，exit 0；网络/业务关键词未出现在这三个新源文件。
- evidence: `C:/Users/ZXL/AppData/Local/Temp/qingjian-spatial-20261004/s2-source-sha.log` 与下表。
- owner: S2。
- conclusion_if_missing: 身份不一致时以上测试结论不能沿用；静态核查不冒充离线/实际生命周期通过。

完整 SHA 输出：

| path | SHA256 |
| --- | --- |
| `src/PetCompanion.tsx` | `B2444F0AE21675FC7F4B534F6423471E52E22C6357C900EA08C2794EF4191B84` |
| `src/petBehavior.ts` | `DA9F4FDF740E46496CA9F8981D3507851848666CDD8C32EAC4A807C0514799CF` |
| `src/pet.css` | `9F078158A42A14E8C322F1AFDF7E02388DE17D7C8A190088116459B9A1864FB8` |
| `tests/petBehavior.test.mjs` | `EB78C7722A74FC02899A114CB591C81FDF9529F52A426B7536B6DB3FC65DED5D` |
| `docs/current/spatial-note-map/lwplan.md` | `2C4D9DA0B9DD065718DC991655D9D94A9949FD28F9C18236EAA8EDC14F30EF87` |

## coordinator_handoff_verifications

| 验证 | 移交原因 / 建议承接方式 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 最终 `npm test` / `npm run build` | root 明确要求 S2 收敛 pure+type，S3/root 集成后顺序运行，避免并发写 dist 与无必要重复；此项本可 impl-safe，因共享构建所有权移交 | 最终源 SHA、完整命令输出与 exit | S3/root | 未有最终日志不得称最终集成通过 |
| 大/小角色视觉、呼吸/眨眼/目光、浅深主题/390px | 真实 UI 属非 impl-safe，由 root 浏览器/自建进程实测 | 截图/观察范围，实际进入两个展示；CSS动作确实出现且按政策停止 | root S4 | 构建/纯规则不能证明视觉和实际动作 |
| 真实 tap、drag/clamp/resize、折返不误触、pointercancel/lostcapture/blur | 需要真实浏览器事件与焦点；root 自行执行 | 位移前后、取消后状态、已拖位置resize只夹限、无误触截图/实测记录 | root S4 | 只称纯规则有证据，capture wiring 未现场验证 |
| 静态/reduce、hidden/modal/AI、Tab、卸载/重挂/反馈取消 | 真实宿主政策、DOM焦点及生命周期不由纯测试替代 | 关闭动态仍可操作；modal小层不呈现/不可Tab；恢复位置/休息；观察无残留定时动作 | root S4 | 不称实际取消与焦点可靠 |
| 收起/设置恢复/刷新偏好、原记录编辑保持 | App/偏好/保存由 S3/root 所有 | 设置恢复/刷新、原记录入口观察；记录不被宠物读取或改变 | root S4 | 不称 App 偏好或旧能力回归通过 |
| 触屏/读屏/系统缩放、长期耗电/原生广泛兼容 | 超出本地纯验证，root按设备能力承接或保留未测 | 指定设备、输入方式、持续时间与真实结果 | root S4 | 保留未测，不用 CSS/预算或本机一次观察外推 |

## contract_drift_reports

- 无 LW/基线/接口漂移。收到 root 的 Gate-2 PASS 后才开始写源码；S1/S3 已收到可消费真实 exports 的交接消息。
- 同合同内自查修正：首次内部实现的 resize 闭包会因初次 `position=null` 重置到右下；已改为 `placed` ref 与 `positionRef`，不把 position 纳入 observer effect 依赖。root 独立读到同一问题时已经修正并回报，实际 drag+resize仍交 root。另移除本次无用途局部变量/import；owned lostcapture、pointerup最终位置和取消反馈已按合同核对。

## 已见失败与限制

- 准备期读取 `tsconfig.app.json` 失败，工具 chunk `9cd956`，exit 1：`Cannot find path 'tsconfig.app.json' because it does not exist.` 已用 `rg --files -g 'tsconfig*'` 确认并读实际 `tsconfig.json`，chunk `ab6146`，exit 0；不是类型失败。
- 大批读取文档/CSS 输出被工具截断；合同、HL、research/industry及相关CSS政策随后按较小批/片段重读。截断输出未用来声称完整核对。
- 无测试或类型失败；本轮没有执行 UI/服务/DB/Git/Windows构建。纯测试未做红绿回归有效性声明。
- 本版仅四态有限动作，不承诺成熟桌宠的动作量、GPU/触屏/长期耗电结果；viewport小于整个控件时纯规则保留8px原点，不能凭此声称极端小尺寸全部可见。

## 回滚与交接

- rollback: **可直接回滚** S2 自有新增文件与本次 S1/S3 引用差量；显示键独立且不影响业务数据，不清空其他 localStorage。涉及混合 App 文件仍由 root逐hunk核来源；S2不执行回退/Git。
- remaining: S2 无已知阻断源码项；最终 build、真实 UI 与 fresh Review(Impl) 由 S3/root 继续。若根 UI 或 fresh 审查指出缺陷，再按下一轮补实施报告记录源变更与重测。
- review_focus: 实际 capture取消/拖后click、resize位置保留、modal/Tab退出、反馈timer清理与CSS动态停止；纯测试不能替代这些现场结论。
- suggested_commit_message: `feat(pet): add an interactive local companion`
- 跨功能事实：无新增跨功能事实。
