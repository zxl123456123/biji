# 0.7.0 宠物与空间外观体验版验证

日期：2026-10-05。本页记录 root 亲自执行的命令和界面取证。本轮 EXE 按用户答复只包含宠物和空间配置增量；月历、主题探索及关联阅读的并发源码保留，未加入安装包。完整原生 GUI、安装卸载和用户体验验收仍未完成。

## 来源与保护

- 最终构建根：`C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004/release-source-r2`，150 项输入。148 项与 r1 原字节相同；只有 App 五处设置角色名称和既有 PetPortrait 的 export 差量。没有复制当前混合 App。
- r2 manifest：`15F783A8C319F7920D337E9A5A9A2757A408529334A5C1732E1BCAA6E30201FC`；App：`01902872C7889893F110F13F2A3E20339575479E11C2C374DD50C188618F6E9F`；PetCompanion：`BFE390FAE9465E78327C2AC8D6F1919CAD9CA52DE835B70128593B16C1FE0768`。root d11af6 和构建中再次 78bfc1 核 150 项，漂移均为空。
- 原 73 项 before、历史保护副本与被拒绝候选均保留。当前 164 项逐文件观察副本独立保存，8 个月历与 6 个探索新增文件排除，四个探索旧源采用稳定 r1 字节；不声称活动工作区全局稳定。详见[包装来源](current/pet-space-customization/packaging_source_r2.md)。
- 工作区 S4 月历共享画像另用 `workspace-validation-r1` 固定快照验证；其 App 为 F456，后来外部增加关联图隐藏差量成为 514。快照验证不能代替以后不断变化的工作区，也不代表第三窗口功能验收。

## root 命令

全部日志位于上述 TEMP 根，`.exit` 保存实际退出码；没有用 tail 管道替换验证命令退出码，root 已完整读取测试、构建和原生输出。

| 目标 / 命令 | 实际结果 | 完整证据 |
| --- | --- | --- |
| r2 `npm test` | f23fb4 exit0，118/118；fail/cancel/skip/todo 均 0，完整读取 c082be | root-release-test-r2.log / .exit |
| r2 `npm run build` | 280258、b504dc exit0，2504 modules，完整读取 fe0462 | root-release-build-r2.log / .exit |
| workspace 快照 `npm test` | f73554 exit0，145/145，完整读取 ddd08c | root-workspace-test-r1.log / .exit |
| workspace 快照 `npm run build` | 833f8b exit0，2515 modules，完整读取 c5b5a9 | root-workspace-build-r1.log / .exit |
| r2 `npm run release:windows -- --ci` | 87d92a、ea252f exit0；单 Cargo job，共用已有编译缓存；optimized 16 分 41 秒，完整读取 2d5697 | root-native-build-r2.log / .exit |
| 三制品版本/hash、受控新进程烟测 | a3331e、87fe87 exit0；只启动自建隐藏 PID 20168，十秒存活且响应，随后只终止自建 PID；进程 exit -1 为受控终止 | root-native-proof-r2.log / .exit、root-native-artifacts.json |
| 真实 SQLite 只读前后 | before 41ecb5、after c2f0d6 exit0；notes 3 / transactions 0，两表 schema、所有行及字段严格相同 | native-before-report.json、native-after-report.json |

SQLite 规范摘要均为 `3460a09a76d0d8b4d737cee2c5fe9cbce0f02705b14b8950e7b2986b56396e48`。没有恢复、覆盖或迁移真实库；之前 0.6.0 EXE 已保留独立备份。

最终 Web 主包 `index-DsnfXTa-.js` gzip 188.84 kB，空间 lazy 包 `SpatialNoteMap-qHvr1ZAZ.js` gzip 148.85 kB，PWA 10 项 1304.21 KiB。原生 beforeBuild 的资源名称与最终独立 Web 构建相同。大于 500 kB chunk、Node ExperimentalWarning 与 Rust linker_messages 警告均保留；包体和 CPU 单测不证明 GPU 帧率或耗电。

## 实际界面

root 自建 5186 为 r1、5187 为最终 r2、5188 为 workspace 快照，未向用户原页面导入夹具。界面日志为 root-ui-r1.json、root-ui-r2.json、root-garden-ui-r1.json。

- 五角色实际使用晴小团、奶龙、吉伊、小八、乌萨奇五套 SVG 身体和不同待机/招呼动作；原晴小团身体保留。r1 160 帧实拍动图共五组，每组 32 帧，均有 31 处相邻变化。r2 角色/样式与该录像来源相同，Pet 唯一 export 差量不改绘制；r2 再次逐个切换核 `data-character`。SVG 体积感不是真三维角色或官方动画。
- r1 实测未应用试穿隔离、撤销、原装/组合不换角色、应用后大小一致、离页/刷新保留、owned 拖动与休息停止动画。r2 应用乌萨奇薄荷/画家帽/蝴蝶结，刷新小伙伴保留，设置实际显示乌萨奇；实际截图逐张目视，长耳、帽子和脸没有遮挡。
- r1 实测三模型、三背景、光晕/流光开关、撤销、应用、选择保持与时间层；r2 实测方块/极光及晶体/纯净，两个 false 值应用后刷新仍保持，预览保持 spatial-single UUID。原相机/选中恢复由生产 Three 池 CPU 测试及 r1 实际点击独立节点补证，不把 CPU 测试冒充 GPU。
- r2 500 条合成数据实际显示 500 节点/1292 可见关联、501 个选项，末条 spatial-scale-0499 可选择且四项依据正确；画布完整滚入视窗后另存实际截图并目视确认。画布 buffer 为 1093 × 495，未测全程帧率。
- r2 自建记录连续填入正文、Ctrl+Enter 保存、搜索命中、原编辑回填，随后只将自建记录移入可恢复回收站。没有更改编辑器实现。
- r2 招呼中从乌萨奇切到奶龙，实际属性 happy→idle，切换后新角色没有继续显示旧招呼；从招呼调用返回到末观察为1222ms。未探测内部定时器或模拟按住指针途中换角色，取消旧1400ms计时器与owned捕获的实现由源码/纯测试核对，不能称这些内部/中途手势已现场覆盖。
- workspace 月历五角色及配件同步、实际名字/日期摘要/隐藏浮层一致；暂停、隐藏后恢复仍暂停，弹窗与关闭保留局部暂停，画像 `data-animate=false` 且所有动画名为 none；未应用奶龙不传播，刷新保持已应用乌萨奇。390 设定对应实际 client/scroll 375/375，深色长耳与配件完整，原日期卡和按钮保持。

媒体目录：`C:/Users/ZXL/.codex/visualizations/2026/10/02/01a0fc52-c082-7c00-b650-78e2c95b7cfa/qingjian-customization-20261004`。

- `five-characters-live.gif`：637 × 420，9,484,105 bytes，SHA `B2D879EC1757B34BBAABFDD8E45F933AFA892F910572D00A6FD2A298A4AFD7BE`；实际截图回放速度非实际渲染 FPS。
- `wardrobe-final-actual.jpg`：r2 实际装扮全页。
- `space-final-500-visible.jpg`：r2 可视画布与末条选择，已 root 目视。
- `calendar-usagi-narrow-actual-workspace.jpg`：workspace 窄屏月历，已 root 目视。

## 制品

| 制品 | 版本 / 字节 | SHA256 |
| --- | --- | --- |
| [程序 EXE](../src-tauri/target/release/qingjian.exe) | 0.7.0 / 13,705,728 | 9F04E006C93FF9AC4E66C3819762BB0104AB8FC48912B83648EF4AF068E1A397 |
| [Windows 安装包](../src-tauri/target/release/bundle/nsis/晴笺_0.7.0_x64-setup.exe) | 0.7.0 / 3,909,543 | 0BB91F58E8475179E915A5A161BF6540DCABE6699FC640BB1A24EEF6F527F414 |
| [MSI](../src-tauri/target/release/bundle/msi/晴笺_0.7.0_x64_zh-CN.msi) | 0.7.0 / 5,337,088 | 6E334D074E8D709043BBB64AD873AC31D9C18DC916389A8F04D503100AB02572 |

EXE/NSIS PE 版本、MSI ProductVersion 已独立核验；安装器未运行。受控隐藏烟测不代表正常关闭、完整原生 GUI 或安装卸载验收。

## 失败、修正与未测

[原失败清单](current/pet-space-customization/failure_inventory_r1.md)及原日志保留：S1 当前装扮仍提示试穿中的显示错误已修；S2 19 个测试首轮一项亮度失败后修阈值重跑；S4 首 build 有外部 SpatialNoteMap 的 20 个 TS 错误，后来的独立快照成功不抹掉该失败；设置固定名字由必需 petName 链修正；App 漂移被 r2 首预检拒绝，窄核后以稳定 r1 两份差量重新冻结。

空间动态取证明确未达：r1 20 帧、18 次 PW 旋转截图各全部相同，编码断言分别 exit1；r2 可视画布首 12 帧只有两处变化，立即截取 PW 旋转无变化，随后原生点击后截图位置已变化；再录 20 帧依然相同，0889d8 编码断言 exit1，没有生成或交付 3D 动图。界面切换和静态绘制已观察，持续 GPU 动画及原因仍未确认，不将恢复操作或源码预算称作稳定连续动画。

工具错误单列：hasFocus 只读代理不支持、角色未限定 group、多次错误按钮/role 名（选择角色、继续动态、晴小团 checkbox）、初次点空节点后编辑按钮不存在、旧样式 selector 空结果均经 fresh AX/实际控件恢复。第一张标作 390 的月历截图实际为 1264 宽，因为 viewport 作用于另一个当前标签页；另开自建月历页后重新设置并核到 375/375，旧图保留，不作窄屏通过证据。8820fd 文档脚本在四份文档写完后生成 diff TypeError，随后仅补证据，未重放文档写入。

交付预览清理另有两次选择器失败：乌萨奇按钮未限定范围出现两个匹配，之后空间视角错误假设group角色无匹配；fresh完整AX确认已经在宠物面板后，直接使用角色group应用奶龙/围巾。记录于TEMP/root-ui-cleanup-addendum-r1.json，不改源/制品。实际截图wardrobe-nailong-final.jpg已root目视；只关闭自建9/10标签与确认路径/端口的5186/5188测试服务，保留5187预览，用户标签/原服务未触碰。

系统 reduce/真实后台失焦（含月历非隐藏失焦）、月历可选机器人回退、两外观键真实故障注入、中途owned捕获换角色/换模型、旋转后换模型的相机矩阵逐项实测、触屏、读屏、IME、WebGL context-loss、PWA 更新、弱 GPU/缩放、多设备/长期内存和耗电、安装卸载、完整原生 GUI 仍未全面实测。本轮不宣称零 bug 或关闭完整 MVP/用户验收，不擅自归档 feature，不混合提交工作区。

## 独立审查

最终 fresh [Review(Impl) r1](current/pet-space-customization/review_notes_impl_r1_1.md)协议/业务均PASS，SHA `7CCDA80F6A7100F6CB5E714D59076EF27C575426C876E9B1DFD59C1B6ACDCD2F`；root085b73全文读取并核实际身份。结论限本轮S1–S4和固定r2体验制品，未测项保持，不放行混合提交或关闭用户验收。状态/链接收尾另由未参与实施的reviewer窄复核；产品源和制品不变。
