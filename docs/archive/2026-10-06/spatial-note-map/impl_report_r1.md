# 空间与宠物：根实施汇总 r1

- `feature_name`: spatial-note-map
- `impl_round`: r1（子包S1/S2/S3，含同轮根现场遮挡补修；候选r2/r3不替代最后r4源）
- `date`: 2026-10-04
- `lwplan_version`: Gate2 r2 PASS；SHA256 `2C4D9DA0B9DD065718DC991655D9D94A9949FD28F9C18236EAA8EDC14F30EF87`
- owner：root协调器；用户授权自主完成，不重复阶段确认。fresh Review(Impl)另行产出，本报告不提前断言其结果。

## 变更事实

以下每项均对应S1–S4/G1–G3；完整子包逐项目的/关键变化和SHA见三个子报告。实际差量基线为TEMP `before/`与同级89项manifest，不使用混合HEAD覆盖工作。

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| src/SpatialNoteMap.tsx | add | 三视角、完整文字选择/详情、共享数据与原编辑、相机/降级控件 | S1/G1 |
| src/spatialLayout.ts | add | 确定性立体/创建时间、完整UUID/边/度数/bounds、输入保持 | S1/G1 |
| src/spatialRuntime.ts | add | 单RAF/静态合并/30绘制预算、代际取消/像素预算 | S1/G1/G3 |
| src/spatialScene.ts | add | 透视/官方控件、批量节点线/有限流光、资源和拥有手势 | S1/G1/G3 |
| src/spatial.css | add | 独立空间舞台/详情、浅深及单列 | S1/G1 |
| tests/spatialLayout.test.mjs | add | 完整性/确定性/时间/安全文字六项纯测试 | S1/G3 |
| tests/spatialRuntime.test.mjs | add | 调度/取消/政策/像素六项纯测试 | S1/G3 |
| src/PetCompanion.tsx | add | 原创大小角色、互动/owned捕获/夹限、会话行为 | S2/G2 |
| src/petBehavior.ts | add | 有限四态/6px阈值/归属/位置与政策 | S2/G2 |
| src/pet.css | add | 呼吸/眨眼/目光/招呼与软舞台、浅深/窄屏 | S2/G2 |
| tests/petBehavior.test.mjs | add | 四项真实纯规则测试 | S2/G3 |
| src/App.tsx | modify | lazy空间/共享筛选、宠物显示偏好及设置、门控防遮挡 | S3/G1/G2/G3 |
| src/SpatialEntryBoundary.tsx | add | 空间入口子树错误降级与原能力入口 | S3/G3 |
| src/styles.css | modify | 窄屏四项导航左对齐，仅一行 | S3/G3 |
| package.json | modify | 精确Three/类型与0.6.0 | S3/G3 |
| package-lock.json | modify | 新依赖闭包/版号，原504包保持 | S3/G3 |
| src-tauri/Cargo.toml | modify | 仅项目版号0.6.0 | S3/G3 |
| src-tauri/Cargo.lock | modify | 仅项目锁项版号 | S3/G3 |
| src-tauri/tauri.conf.json | modify | 仅桌面版号 | S3/G3 |
| public/third-party-licenses/three.txt | add | 实际Three完整MIT归属 | S3/G3 |
| README.md / CHANGELOG.md / docs/Project.Progress.md | modify | 本轮真实能力/验证与版本，旧证据保留 | S4/G3 |
| AGENTS.md / docs/Release.Testing.md | modify | 两新文档索引、当前验收与历史区分 | S4/G3 |
| docs/Spatial.Experience.md | add | 选型依据、展示/生命周期/本地数据预算 | S4/G3 |
| docs/Release.Verification.0.6.0.md | add | 最后命令/源/媒体/制品与实际失败/未测 | S4/G3 |
| 本目录根汇总/README/正式审查 | add/modify | 正式链追溯，不冒充用户验收/擅自归档 | S4/G3 |

## 目标对齐

- `goal_lock_check`: G1是真透视且实际点击独立点/旋转/缩放/静态选择原保存、共同筛选，25/500/1000完整记录与末条选择有根现场证据；G2为原创晴小团，大小复用、动作/键盘/拖动/休息/收起刷新与设置恢复已实测；G3源65项冻结、根完整命令/原数据保持/最后0.6.0制品身份均已核验，fresh实施审查尚待报告，广泛原生设备/用户验收不伪称完成。
- `anti_goal_touch_check`: 不新建语义/地理/关系或物理算法；不改模型、SQLite/格式/备份/保存/旧编辑与图；宠物无Note/网络/AI入口，无外部资产/Work Pets/Codex接口/OS追踪/养成平台。类型依赖闭包含rapier/tween等dev类型包，不等于采用运行时物理/动画引擎。前89保护对照零业务变化。
- `authoring_ergonomics_notes`: 两精确依赖/五版号直接可读；模块责任有边界，无通用配置平台；用户文字可直接发现静态相机、记录和角色操作，依据区分事实/词面推断，底层格式不暴露为编辑器语法。

## 真实验证（root独立执行）

日志根目录 `C:/Users/ZXL/AppData/Local/Temp/qingjian-spatial-20261004/`。所有记录 `owner=root`；每项 `conclusion_if_missing=未验证相应结论，不可据子报告/预算/中间态宣称完成`。

| actual command / action | result | evidence |
| --- | --- | --- |
| `npm test`，r4最后门控后 | exit0，105/105、fail/cancel/skip/todo均0 | root-test-r4.log、工具5bd21c、root-command-results.json |
| `npm run build`，同源 | exit0；PWA10项生成；两个chunk警告保留 | root-build-r4.log、a4997a |
| jobs1 `npm run release:windows -- --ci`，最后再次构建 | exit0；3分54秒；Web资源与最后独立构建相同 | root-release-final.log/.exit、72a403 |
| `final-evidence.py` 源身份 | exit0；65项与S3 r4严格相同，零mismatch | root-source-final.json、725d2e；root-command-results记录真实工具exit |
| `compare-baseline.py` 保护比对 | 源阶段exit0、89项仅七既有文件变化，protected空；文档后终检另续 | root-baseline-comparison.json、ee9182及终检 |
| Node真实布局测量/完整性断言 | exit0；500/1000有限、输入未变；单次CPU，不含GPU | root-layout-benchmark.json、ee9182 |
| 自建生产5185实际UI | 相机/命中/筛选/原保存、角色静态/动态、偏好/夹限、规模/空态/原2D/CtrlK/窄屏通过有界检查 | root-ui-evidence.json、版本验证详细步骤与工具输出、实际媒体 |
| 原用户8卡只读比对 | count8→8、正文HTML/控件pressed状态完全相同，无编辑 | root-user-display.json；不冒充全部存储字段 |
| `native-db-proof.py before/after` | exit0，notes3/txn0，两表schema/全部字段相同 | native-before/after-report.json、f7c73a/e5a568；只读库，不输出正文 |
| `root-native-proof.ps1` | exit0，三版本/长度/SHA匹配；PID25180十秒存活响应后受控终止exit-1 | root-native-artifacts.json、e5a568；安装器/正常关闭/完整GUI未测 |
| 捆绑Python编码实际截图GIF | exit0，pet48/space40帧，各帧不同，约4.48/3.77秒 | media-proof.json、3027eb；保留JPEG/实际时间，不是fps探针 |

S1/S2纯测试+S3阶段性test/build仅证明各自对应源，不能代替上表最后r4根命令。原始候选及失败均保留。

## coordinator_handoff_verifications

子包移交的真实浏览器/制品/库验证已由root自行执行，上表及版本验证承担责任。仍未执行的现场项如下，`owner=root/用户验收`，`conclusion_if_missing=保留未测、不扩大本轮体验包声明范围`：

| 项目 / 原因 / 建议承接 | evidence_expected |
| --- | --- |
| 真无WebGL/context-loss/lazy失败；工具无合法浏览器故障注入，纯政策非现场证据 | 指定宿主故障、文字降级/重试及无数据损失的实际记录 |
| 系统reduce/真实后台blur/多指/取消组合、IME/读屏/触屏/Windows缩放与弱GPU | 实际设备/输入方式/前后行为，不以源码或模拟纯规则替代 |
| 原生全GUI/安装卸载/正常关闭；本轮仅自建进程烟测 | 人工完整路径与正常进程退出、库保持 |
| GPU帧率、长时间重复切换/内存/耗电与PWA离线升级 | 指定硬件/持续时长/测量方法与真实数据；本机Node不外推 |
| 最后fresh Review(Impl)与用户体验验收 | 十字段正式报告、根独立读取/指纹一致及用户实际验收；当前未提前填写PASS |

## contract_drift_reports 与已见失败

专用 spatialScene.ts 为根批准的owner内细分，无核心合同漂移。镜头/首次ready/失焦首帧/StrictMode释放/文案均在原合同内修正，子报告保留。唯一显示形态细化为宠物hidden由计划space/pet扩为settings/整个space：根真实发现设置导入timeout和select覆盖后授权局部补修，保留常驻组件/会话/偏好；不是新增能力或业务变化。修后默认pet开启时导入成功且空间选择无遮挡，并重新全测/构建/打包。

其余真实失败：Gate2_r1 FAIL后r2 PASS；开发HMR回all观察与5183旧SW script未用作最终验收；首鼠标坐标偏差后实际UUID命中；系统PIL缺失改捆绑runtime；辅助JSON空key、Array.Sort、GBK、旧绑定/错路径/截断重读、文档patch锚点失败（没有部分写入）均保留，不以测试绿色抹除。Node/chunk/Rust链接警告不隐藏。第一次Windows候选3分20秒/旧App仅作过程证据，最后r4包按SHA交付。

## 未完成、风险与回滚

本轮源/有界根验/0.6.0制品已就绪；正式fresh Review(Impl)待此报告交接，用户未回来验收，完整MVP不关闭。预算非实测GPU；旧PWA升级/广泛输入设备与全原生流程仍未验收。重点审查生命周期/静态可操作、门控遮挡、完整UUID、源/制品/事实匹配及未知工作保持。

`需人工介入`回滚：仅按before和本轮已知hunk撤销引用、版号、许可与新模块，不全文件restore/clean/reset混合工作；不回退真实SQLite或用旧EXE写库。未知来源修改很多，未整包暂存/提交/推送，文档与代码同一待提交迭代保留；用户范围纪律优先于skill默认整目录文档自动提交。

提交建议：`feat(space): add 3D note views and an interactive local pet`

无新增需入库的跨功能事实。
