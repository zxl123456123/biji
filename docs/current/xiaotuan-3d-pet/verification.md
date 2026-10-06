# 三维宠物实施验证（2026-10-06）

## 来源与范围

本轮直接在 `E:\project-funny\biji` 当前工作区验证。新增产品资产仅 `public/pets/xiaotuan.glb`；原创源、脚本与三视图在 `assets-source/pets/`。四个第三方角色的 `.blend`、`.glb` 与三视图留在 `E:\pet-model-workbench\{nailong,chiikawa,hachiware,usagi}`，不属于 Git/公开制品。用户已确认晴小团灰模轮廓保留；四个第三方造型反馈未到，不能称视觉定稿。

## 根命令和产物

| 命令/检查 | 本轮结果 |
| --- | --- |
| `npm test` | 退出 0；137/137 通过、0 失败。Node 的 `stripTypeScriptTypes` ExperimentalWarning 仍出现。 |
| `npm run build` | 最终 r5 源退出 0；2519 模块；生成 PWA `sw.js`，预缓存 19 项；`index` 614.45 kB 与 `three.module` 737.16 kB 触发 >500 kB chunk 警告。 |
| `npm run tauri build -- --ci` | 退出 0；内含再次 `npm run build`；生成 `src-tauri/target/release/qingjian.exe`、MSI、NSIS。Rust linker warning 仍出现。 |
| `git diff --check` | 退出 0；仅显示工作区 LF/CRLF 提示。 |
| `dist` 清单和文本扫描 | 仅有 `dist/pets/xiaotuan.glb`；`dist/sw.js` 可检出其预缓存路径；未命中 `PetDevModelPicker`、`本机模型预览`、四个第三方 GLB 文件名或 `pet-model-workbench`。此扫描针对解包后的 Web 输入目录，未单独解开 MSI/NSIS。 |

最终 GLB 与 `dist/pets/xiaotuan.glb` 的 SHA-256 同为 `C115B08B8CBC17737602060293549E81766EC777A53B7B5D4DFEE36BF470884A`。最终 r5 源重新构建的程序 SHA-256 为 `6787BE5550555BC313FD8A6649C847EE1AB47E026D10E7159EFD314368ABB04A`，MSI 为 `853BF4169A8314BEF60677E84EBB1616BE11763CFA3E10B2F7CC3226AB939E08`，NSIS 为 `567C4809737DD3C10C154B77FD07324131A413525AE8D8F6760BF8D4DD6CBA22`。这些构建产物在忽略目录；README 中既有 `deliveries/0.8.0-release` 指向历史交付，不代表其中已替换为本轮新包。

## 实际界面

- 开发预览 `127.0.0.1:5195`：记录页晴小团浮层与伙伴页大展示均有可见三维模型；伙伴页隐藏浮层时仅一个画布，记录页仅一个画布。晴小团薄荷、画家帽、围巾应用后刷新仍可见；试穿/穿上反馈与原按钮仍在，休息和唤醒文案切换。四个第三方 GLB 分别从 E 盘经开发文件选择器选入，四次均见完整模型且 `data-ready=true`；选择不写入外观键。
- 全新生产预览地址 `127.0.0.1:5197`：记录页原创模型可见，画布 `166×159` 且 ready；伙伴页晴小团一个画布。切奶龙后画布数为 0，仍见 SVG；开发文件入口数为 0。生产包的其余三位角色共用同一角色门控，未在生产 UI 逐个点选。
- Blender 后台重导并反向导入最终 GLB，画家帽与围巾节点尺寸、位移正常；反向导入渲染见 `E:\pet-model-workbench\xiaotuan_beret_scarf_reimport.png`。五模型结构与 `idle/happy` 动作的包级证据见 [S1 r2](s1/impl_report_r2.md)。

## 失败与未测

- 第一版晴小团 GLB 将装扮子网格一同压成零缩放，导致页面配件不出现；S1 修正导出并重导后，根在刷新页面实测可见。修复前一次热更新状态，记录页浮层仅露深紫半圆；完整刷新新模型后未复现，不能据此证明热更新中旧场景不会短暂失真。
- 最初开发端口 1420 被占用；随后使用 5195。首次根 `npm test` 虽退出 0，但工具输出截断；最终上述 137 项结果来自本轮完整重跑。浏览器截图工具曾间歇失败，后来在新标签取到可见画面；第一次文件选择器因尚未等到懒加载入口而超时，入口挂载后四次加载成功。
- `127.0.0.1:5196` 的生产预览命中浏览器以前缓存的旧 service worker，界面出现旧「3D空间」导航；改用新 origin `5197` 后看到当前构建。旧 service worker 的升级行为未在本轮消除或验证。
- 独立实施审查先发现 WebGL 上下文丢失后晚到模型可能重新启动 RAF，以及关闭动态冻结任意帧。r5 已在 `Pet3DView.tsx` 与 `Pet3DScene.ts` 修正；审查者再次只读核对，认为两项代码路径闭合，最终 137 项测试和 Web/Windows 构建由根重跑。最终开发页刷新后一个 ready 画布、完整默认晴小团可见；早前试验用的薄荷/帽/围巾已通过界面恢复原装并保存。
- 原生 EXE 已构建但未进行完整 WebView2 GUI 操作，也未安装 MSI/NSIS；未直接解包两个安装器。WebGL 故障回退、长时 GPU/内存/FPS、触屏、系统减少动态和所有尺寸组合未做现场验收；代码和既有行为测试不能替代这些实测。
- 低层方案要求的场景策略与模拟加载/卸载测试没有新增；当前 137 项是既有回归，代码闭合不等于该计划验证已执行。若要关闭真实上下文丢失/资源风险，需补可控制 WebGL 失效的浏览器级测试或现场取证。

## 阶段结论

原创晴小团的模型、两处实时入口、现有装扮联动和生产资源隔离已有上述证据。四个第三方模型可在本机开发模式预览，外形需继续依据用户反馈修订；产品再分发边界不因本机预览改变。独立实施审查结论另记，不由构建成功推断。
