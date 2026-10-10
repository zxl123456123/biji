# 实施审查记录：native bootstrap r1

**评审对象**：R2.10 bootstrap 实施及 `impl_report_bootstrap_r1.md`  ￼
**评审时间**：2026-10-07  
**评审结论**：⚠️ REVISE（代码主序列大体符合；有失败态和测试闭环缺口）

## 输入与证据边界

核对 `lwplan.md` R2.10 §3/§6.8/§7.1/§9、`impl_report_bootstrap_r1.md`、`verification.md`、相关源码 diff、Rust/JS tests、锁文件及构建生成物。只读审查，没有修改文件、运行测试、启动程序或访问任何 profile/用户数据。

命令证据来自实现报告：`npm test` 161/161、bootstrap JS harness 6/6、`npm run build` 成功、`cargo check` 成功、`cargo test` 24 项通过、`git diff --check` 成功。报告也保留首轮 cargo check 失败的完整诊断和修复说明、Three.js 737.15 kB advisory、CRLF 提示，以及 `cargo fmt -- --check` 因 rustfmt 未安装而不可用。本轮没有附原始终端记录；以上退出码/摘要按实现报告引用，未独立重跑。报告明确没有运行 WebView2、profile、原生双窗或正式 EXE 验证。

源码范围含已有 0.9.0 工作区改动；`git status` 显示 S1–S4 等文件仍有未提交变化。实现报告称 bootstrap 本轮不覆盖这些既有改动，本审查聚焦 bootstrap 的相关路径，不把工作区既有未提交内容归到 bootstrap 修改名下。

## 方案符合度

| R2.10 要求 | 观察 | 结论 |
|---|---|---|
| 双窗先 blank，main 不自动创建；两窗均创建成功后才清缓存 | `tauri.conf.json` 的 main 为显式 label、`create:false`；`native_bootstrap::setup` 手动以 about:blank 创建 main，再调用 pet setup，之后启动清理 | 符合 |
| Profile2 选定 mask，双方完成后才导航 | `CACHE_MASK=0x8110`；`clear_profile(main)` 完成后再清 pet；两次成功才调用 `navigate_to_entries` | 符合代码顺序；真实 profile API 效果未验证 |
| COM callback 回主线程，避免 callback 中建窗/阻塞 UI | callback 将 continuation 经 `run_on_main_thread` 派回 UI；继续清 pet/导航不发生在 COM callback 内。锁定 Tauri runtime-wry 2.11.4 的 `send_user_message` 在当前主线程直接处理，其他线程才投递 event-loop task；Tauri 2.11.5 setup 在 Ready 回调中执行，故 `desktop_pet_windows::on_ui` 的同步桥接不会在这条 setup 路径上因投递后阻塞而死锁 | 静态符合；运行时回调线程和 WebView2 行为未实测 |
| 两窗 native entry URL/origin/path/query 校验 | 生产 URL 按 `use_https_scheme` 选 `http(s)://tauri.localhost/`；dev 用配置 devUrl；pet 加 `pet=1`。fresh invoke 使用实际 `WebviewWindow` 标签和 URL，比较 origin/path 并要求 main 无 query、pet query 精确等于 `pet=1` | 符合目标口径；没有单元测试覆盖 expected URL 组合 |
| 单一 Pending/Ready/Failed 和业务命令前门禁 | `NativeBootstrap` 持有唯一 phase；双方 fresh entry 报告才 Ready；失败/超时唤醒等待者；main、AI 及所有 pet business commands 调 `require_ready`，同时校验 actual caller label | 符合静态检查 |
| R2.9 部分导航失败安全边界 | main/pet 是独立 navigate；Ready 只在双方握手后开放。前端先注册失败 listener、握手未 ready 前不加载 React/业务模块；失败返回前停在静态壳。没有把入口 bundle 字节“未下载/未执行”写成实现保证 | 符合；真实双 WebView failure harness 未执行 |
| 启动迁移与 prepareAi 串行/幂等 | `startup_ai_migration` 仅 main+Ready，`spawn_blocking` 执行；`import_deepseek_config` 复用 `migration_gate` 和同一导入函数；App 等待安全结果后才导入，异常回退固定 `worker_failed`；pet 可并行挂载 | 代码符合；并发/一次写入尚无自动测试或 keyring 实测 |
| Web PWA 与静态/动态依赖 | `injectRegister:false`，仅 Web 分支显式注册；构建 `dist/index.html` 仅引用入口 JS/manifest，没有静态业务 CSS/SW 注册脚本；入口 JS 将 React、React DOM、App、DesktopPet 引为动态 chunk | 构建产物支持计划边界；无真实 WebView 的 chunk 请求/sentinel 记录 |

### Profile2 callback 与线程

`clear_profile` 在 `with_webview` 的 UI 回调中取得 controller/profile 并调用 `ClearBrowsingData`；COM completion 仅转换成无敏感结果，再用 `run_on_main_thread` 运行 continuation。若在 UI 线程调用，锁定的 runtime-wry 实现会直接处理任务；否则投递到 UI event loop。continuation 按主窗→pet窗顺序发起下一次异步操作。没有看到在 COM callback 中同步等待清理、持有状态 mutex 跨 await 或在 callback 中创建 WebView 的实现。

需要留在未验证栏：cargo check 只能证明 Windows bindings/type 能编译，不能证明当前 WebView2 runtime 能 cast 到 `ICoreWebView2_13`/`ICoreWebView2Profile2`，也不能证明真实 completion 的线程、HRESULT、profile 清理范围及 callbacks 在正式 EXE 下的行为。

### 原生入口及失败副作用

main/pet 在清理成功前均为 about:blank；两次清理成功后导航到当前 origin。每个 entry 的 Tauri 启动代码只静态导入 `invoke`、`listen`、`getCurrentWindow`，之后等双方 Ready，再按各自门槛载入 render runtime/业务模块。Ready 之前命令门禁在 sqlite、keyring、AI network 调用前执行；pet 命令也各自门禁。清理和握手失败时 fail closed 的控制流成立。

`dist/assets/index-Dn2JN8Ck.js` 当前构建产物和 `dist/index.html` 支持入口与异步 chunk 分离；构建检查本身不能证明 WebView2 真实加载次序。`tests/nativeBootstrap.test.mjs` 使用替换 import 的 harness，不会真实加载 Tauri IPC、缓存、profile 或窗口。报告已将隔离 profile/main-ready-pet-failed harness 与正式身份/旧数据检查交给 coordinator，清楚标为未完成。

## 缺陷与未闭环

### P1 — 原生启动核心链路仍没有运行证据（交付阻断）

- **具体事实**：报告明确没有运行真实 Profile2 清理、双窗导航、WebView2 callback/failure harness、正式 identifier EXE 或原 profile。`cargo check/test` 和客户端模拟均不会调用 `ClearBrowsingData` 或真实 `navigate`。
- **影响**：当前不能认定旧 service worker/cache 已清除、实际 origin/path 可 fresh handshake、部分导航失败时事件/命令 gate 在 WebView2 下有效，也不能宣称“旧 UI 缓存升级已解决”。
- **所需动作**：impl-safe 代码 review 后由 coordinator 按 §7.1 先做隔离旧缓存 fixture 和 main-ready/pet-failed 注入，再做正式 `com.zxl.qingjian` 原 profile/EXE 身份、缓存清理、localStorage/SQLite/credential 保持证据。缺其中任何项，Release/实用版结论保持未验证。此项是原生验收证据门禁，不要求本 reviewer 运行或制造用户 profile 故障。

### P2 — 两个 setup 早退分支没有落到 Failed

- **具体事实**：`native_bootstrap.rs` 的 `setup()` 在找不到 main config 时通过 `ok_or_else(...)?` 直接返回；main 已创建、`desktop_pet::setup()` 返回成功后，找不到 pet window 又通过 `ok_or_else(...)?` 直接返回。两条路径都没有 `fail_bootstrap()`。非 Windows 分支也返回 Err 而未转换 phase。
- **影响**：Tauri setup 错误会中止启动，因此业务 URL 仍不会加载；但方案要求 main/pet/bootstrap setup failure 都进入统一终态 Failed 并可观察，当前这些路径状态仍为 Pending，没有标准 safe failure code/broadcast。这是状态合同与实现不一致，尚无测试覆盖。
- **所需修复/证据**：在这些返回前统一写入安全失败 code/Failed（若 setup 即将终止，应说明为何仍需状态；至少保持统一的失败语义），并为缺 config、pet lookup/setup failure 加状态/命令门禁测试。Windows 正式产品路径为主；非 Windows 需明确是受支持启动还是预期编译/启动拒绝。

### P2 — 计划要求的 migration 并发/URL 与原生失败测试缺失

- **具体事实**：Rust 中 `native_bootstrap` 只有 4 个测试，覆盖双报告 Ready、终态 fail/迟到 report、重复/未知 label、phase gate；JS harness 有 6 个前端导入顺序测试。未见 migration gate 并发、成功最多一次 keyring write、`prepareAi()` 同时调用、`expected_entry_url` 的 dev/prod/useHttps/query 分支、create/setup/clear/nav/watchdog/native caller gate 的集成测试。§7.1:581 明确要求 migration pending 并行顺序、migration 与 prepareAi 串行/幂等、构建 module graph 与 import sentinel 等证据；其中运行时/Vite 构建证据有构建摘要，纯状态并发证据缺少。
- **影响**：实现中 mutex 的静态结构可见，但计划定义的关键竞争与错误分支尚未被测试证明；当前报告把“同一 gate/幂等”作为实现事实，却没有对应并发测试证据。
- **所需动作**：补测试或在后续报告中说明具体覆盖位置：确定锁能串行且最多一次成功写入、URL/path/query 预期、首窗 ready+第二窗失败/超时/迟到 callback 时 Ready 和副作用计数、setup failure terminal state。真实 WebView/credential 内容仍按 P1 分层给 coordinator，不以纯状态测试冒充原生验证。

### P3 — feature 状态镜像尚未同步当前 implementation 阶段

- **具体事实**：feature `README.md:4–5` 仍写当前阶段是 PLAN_DEFECT 原地 LW 修订、原 LW 修订中；本轮已存在 Gate-2 PASS、bootstrap 源码和 impl 报告。`verification.md` 也仍以“S1/S2/S3正在实施”概述当前状态。
- **影响**：查看 feature 入口的人会误以为方案尚未过 Gate-2 或 implementation 尚未开始。正式原生验收仍待完成，但阶段文本没有区分“bootstrap 已实现/自证”和“native/profile/交付未验”。
- **建议**：后续文档同步时把阶段更新为实现审查/原生验收待办，并保留“旧 UI 尚未被原生验证为修复”的限制；无需在本只读审查中修改。

## 测试及平台范围

实现报告保留的命令结果：

- `npm test`：161 pass/0 fail；独立 `node --test tests/nativeBootstrap.test.mjs`：6 pass/0 fail。
- `npm run build`：exit 0；React/React DOM/App/DesktopPet 分 chunk，WebPWA `sw.js`/workbox 生成，Three.js chunk advisory 737.15 kB。
- `cargo check --manifest-path src-tauri/Cargo.toml`、`cargo test --manifest-path src-tauri/Cargo.toml`：exit 0；报告称 24 tests，其中 bootstrap 状态测试 4 个。
- `git diff --check`：exit 0；`cargo fmt -- --check` 未运行成功，因 toolchain 没安装 rustfmt。首轮 cargo check 的两处 URL 类型错误和一处 future Send 错误已记录并修复；最终 check/test exit 0。未隐去失败。

未测试：实际 Windows WebView2 Profile2 runtime 和所选清理 mask、清理完成与线程/callback 时序、双窗 Tauri origin/URL、main-ready/pet-failed 原生 harness、watchdog/late callback/窗口关闭的 WebView 交互、真实用户 profile 草稿/偏好/SQLite/凭据保持、正式 0.9.0 EXE 路径/hash/版本、透明 pet/minimize/交互视觉。报告明确这些不在本轮 impl-safe 内。非 Windows 在代码中显式失败，不得宣称跨平台原生支持；多屏、混合 DPI、触屏等也仍是 §7.1 的未测范围。

## Protocol / business 双结论

**Protocol 结论：REVISE（代码主路径静态符合，实施审查未完全闭环）。** Profile2→UI continuation、profile 顺序、入口 URL 校验、共享 Ready gate、迁移锁、动态 import 和 PWA 分支均与 R2.10 大致一致。P2 的 setup terminal state 与计划测试缺口需修补或补证；P1 原生运行证据未完成，不能关闭实用版交付门禁。

**Business 结论：未触发 PROBLEM_DEFECT。** 没发现实现把宠物变成业务数据 owner 或清除本地业务数据的代码路径；但因未启动 EXE，用户数据保持及实际桌面体验没有实证，不能给“没问题/可交付”结论。

**不能把方案评审替代原生实测。** 第 6 轮 Gate-2 PASS 只放行实施，不证明当前代码在真实 WebView2 下完成缓存清理或修复旧 UI。原生/profile/正式身份检查完成前，0.9.0 仍不能作为已验证实用版交付。
