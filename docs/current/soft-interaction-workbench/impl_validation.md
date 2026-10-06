# 实施验证（r1）

日期：2026-10-03。执行人：soft_impl。只记录impl-safe与root回传的缺陷；不把类型/纯合同当成原生手势或GPU手感。实现输入为Gate-2 r2 PASS后的lwplan。

## 依赖与API前置Gate

- `npm install motion@14.0.0 --save-exact --registry=https://registry.npmjs.org` 最终退出0，added5/audited401；锁文件和改前副本对照只新增motion、framer-motion、motion-dom、motion-utils四包，均14.0.0，没有既有包版本漂移（安装“5”与lock新增“4”口径不同，不据此推断升级）。
- `npm ls motion framer-motion motion-dom motion-utils --depth=3` 退出0，四包14.0.0；motion/react-m实际re-export framer-motion/m。
- 读取`node_modules/{motion,framer-motion,motion-dom,motion-utils}/LICENSE.md`完整正文，均MIT；实际副本`public/third-party-licenses/*-14.0.0-MIT.txt`，构建后逐字节比较dist对应四文件退出0。
- `node_modules/framer-motion/dist/index.d.ts:982,1464–1501`公开domMax/DragControls.start/cancel/stop；`dist/es/render/dom/features-max.mjs`明确合并domAnimation+drag+layout；`dist/es/gestures/drag/VisualElementDragControls.mjs` cancel结束PanSession、不调用onDragEnd，stop才postRender调用end；`node_modules/motion-dom/dist/index.d.ts:2610,2653`公開jump/stop。确切版本支持本轮同步LazyMotion/轻量m、官方animate spring与stop/jump合同。

## 自动命令与实际退出码

| 命令/步骤 | 结果 | evidence / owner / 缺证据约束 |
| --- | --- | --- |
| `npx tsc -b`（首次S1–S4接线、2px后、原生RAF接线修复后） | 各退出0 | 本轮工具完整输出已读（无错误）；soft_impl；不能推出真实键盘/手势通过 |
| `node --test --test-concurrency=1 tests/*.test.mjs` | 三次均退出0，50项、0失败 | 完整最终TAP：[tests_r1.log](validation_logs/tests_r1.log)；soft_impl；41旧+9新合同，不代表React DOM或系统GPU |
| `cargo metadata --manifest-path src-tauri/Cargo.toml --no-deps --locked --format-version 1` | 退出0，qingjian0.5.1 | 完整metadata已读；soft_impl；不是Rust编译/数据库验收 |
| JSON/TOML/lock版本字段对照 | 退出0，六字段均0.5.1，motion14.0.0 | package/lock根及rootpackage、tauri、Cargo/Cargo.lock本package；soft_impl |
| 改前副本24文件`git diff --no-index --check`，显式Windows cr-at-eol | 最终退出0（脚本），24项差异exit1预期，whitespaceErrors=false | 实際stdout全读；soft_impl；只比本轮边界，不恢复混合原工作 |
| `npm run build` | 最终退出0（含PWAcloseBundle） | 下方完整返回；soft_impl；发生在最终2px CSS与RAF接线补丁前，最新完整包交root重新构建 |

新合同覆盖：>10/18标签、名称大小写、trash排除、同名UUID、全量检索再批量、#展示检索、IME/repeat、编辑RAF执行时正文更新/软删/替换/旧身份取消/卸载、实际MotionValue取消复位、相机居中和0.6–2缩放、同一长期owner从updating到ready/尺寸迟到/error/最新回调/消费一次/旧token/卸载。实际App两处原生RAF receiver由root的真实UI回归核对，不能由受控schedule测试代替。

另读确切`framer-motion/dist/es/render/html/use-props.mjs:34–43`：只有drag且dragListener不为false才自动加整元素userSelect/touchAction；本轮dragListener=false，正文/整卡不被Motion自动禁滚动，仍需实际触屏验收。

## 本次build完整返回

```text
> luma-notes@0.5.1 build
> tsc -b && vite build

vite v8.3.0 building client environment for production...
transforming...
✓ 2471 modules transformed.
rendering chunks...
computing gzip size...
dist/manifest.webmanifest                          0.24 kB
dist/index.html                                    0.51 kB │ gzip:   0.34 kB
dist/assets/noteGraph.worker-BzYa97ya.js           3.67 kB
dist/assets/index-vuUdnPs9.css                    36.74 kB │ gzip:   8.15 kB
dist/assets/workbox-window.prod.es5-Bd17z0YL.js    5.65 kB │ gzip:   2.20 kB
dist/assets/NoteGraph-6ICsoJql.js                 75.59 kB │ gzip:  26.18 kB
dist/assets/index-DZFUrhrq.js                    418.96 kB │ gzip: 134.43 kB
✓ built in 2.06s

PWA v1.3.0
mode      generateSW
precache  7 entries (528.46 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js
```

入口Vite显示gzip134.43kB，相对本轮改前87.56kB增长46.87kB（约45.77KiB），超过≤40KiB候选约5.77KiB。Motion同步进入入口，无独立异步Motion块；图26.18kB、CSS8.15kB、Worker原3.67kB另列。PWA缓存7项528.46KiB相对改前384KiB增加；许可证TXT已复制dist，默认PWA缓存名单不包括TXT，桌面静态产物仍保留四份文本。不能称预算已达或拖动帧耗时已测。另一次Node默认zlib（与Vite压缩参数不同）输出入口133204B、图25976B、CSS8056B、Worker1730B gzip，不混用这组与Vite基线比较。

## 已见失败、告警与处理

1. 初次读不存在`tests/notePresentation.test.mjs`及`framer-motion/dist/types/index.d.ts`退出1；改用rg实际路径，读取真实`dist/index.d.ts`和当前测试，随后核验退出0。一次宽泛rg包含.map使输出截断，关键实际源码分段重读。
2. npm安装提示5项漏洞（1low/1moderate/3high）。默认`npm audit --json`走项目镜像，404 NOT_IMPLEMENTED退出1；改显式npmjs审计返回完整JSON退出1，依赖为@vite-pwa/assets-generator/sharp、brace-expansion、fast-uri、serialize-javascript，均非本轮新Motion四包。没有自动audit fix/升级既有链；作为范围外发现保留给root。
3. 首次diff检查误将no-index差异exit1当失败；下一次关闭autocrlf后CRLF被当trailing whitespace，脚本退出1。没有改历史文档/源码换行，第三次明确cr-at-eol检查本轮24文件，实际退出0、无空白错误。不是把旧未知工作恢复来“修通过”。
4. root真实页顶1280×720测首卡380.100006，略超<=380候选；本轮将宽屏content顶部16→14px。长build在此补丁前，最新完整包由root承接。
5. root真实CtrlK→“快捷定位测试16”→Enter发现关闭QuickOpen却未编辑，02:05:13控制台`TypeError Illegal invocation`：App把原生RAF函数直接作options方法调用，WebIDL receiver错误。已改`schedule: run => requestAnimationFrame(run)`、`cancel: frame => cancelAnimationFrame(frame)`，最新tsc退出0，真实回归由root确认。受控RAF合同未覆盖原生接线，保留此失败，不以50测试抹除。
6. root在Motion依赖优化/HMR早期见InvalidHookcall，完整reload后恢复当前源码hash；它与上述原生RAF缺陷分开记录，最终独立UI日志由root归属。Node原模型测试的stripTypeScriptTypes ExperimentalWarning保留；改前PWA慢closeBundle告警见root_observations，本次build未输出该告警。

## Coordinator承接

root独立最终测试/build/许可和版本，真实快开Enter编辑/焦点/选区/保存回填，首屏/主题/窄屏，实际24有效Worker定位及暂停，受支持按压和多帧媒体；新版Windows EXE/NSIS/MSI构建/哈希/启动/旧库保持。原生卡片drag/触屏/系统reduce/后台中途取消/IME/GPU没有真实证据时继续未测。实施代理未操作用户UI、DB、凭据、服务、release、安装器或Git提交。
