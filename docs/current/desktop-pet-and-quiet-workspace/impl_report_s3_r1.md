# S3 实施报告（第 1 轮）

feature_name: desktop-pet-and-quiet-workspace
impl_round: S3 r1
date: 2026-10-07
lwplan_version: PLAN_DEFECT-R1.1–R1.5，423 行基线，Review(LW) r2 PASS/root 放行

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| src/main.tsx | 修改 | 根据实际 native label 动态分流；pet 不 import App/global CSS/store/SW；Web query 不改变入口 | S3 §6.1 |
| src/App.tsx | 修改 | 使用主窗 bridge 加载；派生有限到期摘要；快记/待办复用已有入口；阻塞上下文保留；桌面停止旧提醒/旧网页宠物，Web 保留 | S3 §6.4/6.5 |
| src/useMainPetBridge.ts | 新增 | 初始化尾串行/cancelled检查；load与listener AND资格；单执行+最新pending发布；真实显示确认后主窗写每日键；显式动作去重/结果；hide确认原生结果 | S3 §6.4/6.5 |
| src/desktopPetProtocol.ts | 新增 | 唯一有限类型/事件、单调snapshot选择/提醒资格判断 | S3 §6.3 |
| src/DesktopPet.tsx | 新增 | 先listen后read/异步释放；独立可见性、menu、休息、轻触、有限随机决策；提示真实commit后session marker/ack；显式动作5秒结果等待；dragId/native exit+位置稳定 | S3 §6.5/6.6 |
| src/desktopPetMotion.ts | 新增 | 物理workArea clamp、最多一个step在飞、可取消100ms/15步；不追赶欠步骤 | S3 §6.6 |
| src/desktop-pet.css | 新增 | 独立220×260透明根；仅按需菜单/短提示；共享模型画布必要局部样式，无全局工作区光场 | S3 §6.1/6.5 |
| src-tauri/src/desktop_pet.rs | 新增 | actual caller门禁、owner/revision/current摘要、稳定日token、有限显式/确认result、固定pet commands与窗口创建；main唯一业务保存者 | S3 §6.2/6.3 |
| src-tauri/src/desktop_pet_windows.rs | 新增 | 固定pet HWND/UI线程subclass；drag enter/exit ID；同步SetWindowPos与owned/external分类；不持锁跨定位/drag/DefSubclassProc；NCDESTROY释放context | S3 §6.2/6.6 |
| src-tauri/src/lib.rs | 修改 | 五业务命令main caller拒绝先于读取/网络；凭据导入内部helper；注册两memory state/commands/setup/主窗关闭退出/宠物close发送hide | S3 §6.2 |
| src-tauri/Cargo.toml / Cargo.lock | 修改 | windows-sys锁0.61.2直接依赖，必要Foundation/Shell/WindowsAndMessaging feature；保留此前0.8.1 version由S4统一 | S3 §6.2 |
| src-tauri/capabilities/pet.json | 新增 | pet只event listen/unlisten，无core default/window setter/opener/业务权限 | S3 §6.2 |
| tests/desktopPet.test.mjs | 新增 | 陈旧snapshot、当天真实token资格、负坐标/过大窗口、inflight step取消拒绝余步 | S3 §6.7 |
| tests/desktopPetInit.test.mjs | 新增 | 执行真实hook源码，有限本地React/Tauri adapter；StrictMode cancelled begin/旧SQLite load拒绝/监听与SQLite失败不ready | S3 §6.4/6.7 |

未修改SQLite schema、identifier、备份格式；未修改S2 renderer或模型。`src/desktop.ts`现有invoke桥未需扩展，因为本功能有限invoke在专属hook和DesktopPet中，入口隔离已建立；它的既有业务API未重构。

## 目标对齐

goal_lock_check: S3源码覆盖G1独立桌面窗口/有限活动/已有实用入口、G3唯一保存owner与过期隔离；G2由S1承担，本包没有重写其简洁布局。原生效果仍需root证据，不能声称已透明或拖动正常。

anti_goal_touch_check: pet入口无App/store/业务localStorage/AI；sessionStorage仅真实显示token；未加游戏、聊天、托盘、自启、全局键盘、监控、第二待办或schema变化。模型/target未提交，本agent未commit/push。

authoring_ergonomics_notes: 有限字段和固定label，窗口helper仅本pet风险；Rust新模块与现有紧凑代码命名保持一致。pet ACL明确两条事件许可。`rename_all=cameCase`正文笔误按审查认定使用合法camelCase。没有新增任意命令/通用总线配置。

## impl-safe 验证记录

owner: S3 impl。以下均本轮执行并读退出码和输出；真实平台另交root。

| command / evidence | result | conclusion_if_missing |
| --- | --- | --- |
| npm test -- --test-reporter=spec（npm输出仍TAP，完整读取） | exit 0；149 tests/pass，0 fail；包含8项新增S3测试。实验性stripTypeScriptTypes提示保留 | 不得称全部测试通过 |
| npm run build（最终本轮） | exit 0；TS/Vite/PWA完成，独立DesktopPet JS/CSS与五GLB打包。Three约737KB chunk warning保留 | 不得称可构建 |
| cargo check --manifest-path src-tauri/Cargo.toml --locked -j 1 | exit 0；Finished dev profile。此前不带locked的一次check用于落实新增direct依赖lock，也exit0 | 不得称Rust可编译 |
| cargo test --manifest-path src-tauri/Cargo.toml --locked -j 1（最终20项） | exit 0；20 passed/0 failed；另main/doc0tests。linker stdout warning保留 | 不得称native状态/旧schema测试通过 |
| git diff --check（独立命令） | exit 0；仅仓库LF→CRLF提示 | 不得称空白门通过 |
| git check-ignore src-tauri/target/desktop-pet-s3/DesktopPet.tsx src/local-pet-models/xiaotuan.glb | exit 0；两路径被忽略 | 不得称暂存/私有资源隔离有效 |

Rust20项包含原11项数据库回归及9项S3：actual-label判断、日期边界、owner旧代不能发布/结束新代、提醒同日重载token稳定跨日换token、隐藏/无due/错误字段不变状态、原生消息handler按住停住无exit不结束、15步owned不取消/外部取消、placement不作为自主段、负坐标边界。Win32真实消息/窗口调用未冒充纯测试证据。

## 已见失败、限制及修复

- 第一轮新增hook测试8项中1项失败：测试错误读取reminderChange的state index并期望undefined（实际0）；修正为owner index 3=null，同时setter捕获自己session，StrictMode重放使用同组refs/state。随后8/8及最终149/149均exit0。不是产品行为失败，也不能隐瞒该失败。
- `rustfmt --edition 2021 ...` exit1：本机stable没有rustfmt.exe，未安装环境组件；没有把格式命令记成通过。
- 初次rg把Windows registry wildcard作为literal路径，exit2；随后获取实际registry根并读Tauri/windows-sys源码成功。一次Get-Content请求不存在tsconfig.app.json、一次Raw+TotalCount组合不合法、一次读取不存在target/.gitignore失败；均后续读实际tsconfig/独立ignore验证替代。
- 一个合并apply_patch因旧PetCompanion JSX锚点不匹配而整体拒绝；核对S1实际App后重新应用，无覆盖S1修改。记录不算产品验证失败。
- 第一轮npm测试返回exit0/141但工具输出截断，不作最终完整Gate；后续完整读取149项输出。Rust先15/17项是中间源码结果，最终20项覆盖新修订。
- main.tsx落盘触发开发浏览器HMR/fullreload中断root一轮格式验证，已即时告root；后续保持入口/App不写，root重新承接。该中断不是编辑器缺陷证据。

## coordinator_handoff_verifications

| item / reason | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- |
| 实际EXE双窗/透明/最小化仍活动/关闭退出 | 精确路径+版本/SHA、实际Windows截图/状态 | root | 不称桌面效果可交付 |
| 拖动按住停住/native吞pointerup后松手/ESC取消/自然恢复/短段全程 | actual native drag与enter/exit、活动路径观察；不依靠Tauri Promise返回 | root | 不称drag与自主移动正常 |
| 实际caller五业务负向/主窗pet-only负向 | 实际Webview caller拒绝，拒绝先于数据库/凭据/network；源码独立审查补边界 | root / reviewer | 纯require_label测试仅证明判断函数 |
| 安装0/NCDESTROY唯一释放/FFI重入 | 独立实际源码审查；适当故障注入/销毁native证据 | root / reviewer | 代码有失败/释放路径但未作真实Win32故障注入 |
| 到期提示真正展示8秒、休息/隐藏不消耗日key、重载不重弹 | 隔离数据原生UI+主窗键/消息记录 | root | 不称每日提示链真实验收 |
| 实用快记/待办/收起恢复、阻塞editor不替换上下文/失败结果 | actual双窗操作/原生窗口恢复+旧字段对比 | root | 不称实际业务跨窗验收 |
| 混合DPI/多屏负原点/显示器移除 | 对应真实设备操作记录 | root | 单屏测试不能关闭混合DPI未测 |
| 用户旧库安全及五模型正式EXE形象 | before backup、after旧行列比较、逐角色ready截图 | root（模型质量由用户反馈） | 编译/私有GLB打包不代表用户满意 |

## 未完成与审查重点

本包源码/impl-safe结果可供Review(Impl)，非总体完成结论。重点检查main初始化异步清理、publisher尾/owner切换、显式动作与提醒确认独立、native mutex不跨重入、context一次释放、local timer清理。上述native故障/联调在本包未运行；root负责完整交付门。

contract_drift_reports: 无新产品范围漂移；合法camelCase笔误处理有r2审查依据。未实现全局GetAsyncKeyState旧路径，采用r2批准subclass。共享技能镜像历史张力由root已有记录，本包未改共享技能。

rollback: 可直接回滚本包源提交（root分包时注意App含S1改动，不能整文件restore）；无需数据迁移或数据回滚。未提交的其它agent修改完整保留。

建议英文提交信息：`feat(desktop): add independent local pet companion`

## 跨功能事实（待确认）

- [2026-10-07] 本机Tauri runtime的run_on_main_thread在已属UI线程时立即执行，其它线程发Task；本窗同步定位可在UI回调内分类WM_MOVE，但锁必须在调用前释放。
- [2026-10-07] 独立窗口前端应以原生实际label分入口；URL query本身不足以确定保存所有者。
