# S1 空间地图实施报告

## 基本信息

- `feature_name`: spatial-note-map
- `impl_round`: S1 / Impl r1（含根协调器反馈后的局部修正；无独立 Review(Impl) 结论）
- `date`: 2026-10-04
- `lwplan_version`: 冻结 LW191；SHA-256 `2C4D9DA0B9DD065718DC991655D9D94A9949FD28F9C18236EAA8EDC14F30EF87`
- 放行依据：根协调器明确通知 Gate2_r2 PASS 和实施放行；用户「自主开发实现，直接完成等回来验收」授权已由根写入任务输入。
- 事实基线：`C:/Users/ZXL/AppData/Local/Temp/qingjian-spatial-20261004/before` 和同级 `manifest.json` 89 文件；未使用 Git HEAD 混合比较。
- 边界：本 agent 仅写下列 S1 新文件及本报告；没有写 App、依赖/锁、宠物、旧图、业务存储、全局 CSS 或当前根文档，没有启动服务、使用 UI、操作真实库或执行 Git。
- 本报告仅给出本地逻辑、静态边界和源码身份的证据；真实画面、GPU、编辑闭环、原生制品仍由根协调器承接。

## 变更事实

所有条目均为 `change_type: add`，对应 LW 的 S1 / G1、G3、A1–A3。

| path | change_purpose / key_changes | related_tasks |
| --- | --- | --- |
| `src/SpatialNoteMap.tsx` | 固定 props 与 default 导出；真实关联/时间/PetShowcase 分支；复用完整 visibleNotes/projectGraph、安全正文及原编辑 UUID 回调；全部记录的 DOM 选择和失败降级；政策、主题、筛选、选择更新；首个 ready 布局仅适配一次。 | S1、G1/G3 |
| `src/spatialLayout.ts` | 确定性三维星簇和创建时间布局；保留所有匹配 UUID、孤立/pending/未知时间；可见边/度数和有限 bounds；不写记录或坐标存储。 | S1 布局、G1/A1/A2 |
| `src/spatialRuntime.ts` | 单条去重 RAF、连续绘制 30fps 上限、50ms dt、销毁/旧回调代际拒绝；静态与连续政策分离；DPR 1.5 与 250 万绘制像素预算。 | S1 调度、G1/G3 |
| `src/spatialScene.ts` | 真 Three PerspectiveCamera/OrbitControls；共享低面数 InstancedMesh、批量线、有限流光、选中高亮；自有手势与取消、主题/相机控制、失败和资源清理。此文件为根明确批准的 scene owner 布局细化，不引入通用框架。 | S1 场景/资源、G1/G3/A3 |
| `src/spatial.css` | 独立 scoped 样式；柔和星簇舞台、浅深主题、分组/关系/时间图例、完整详情；窄屏单列；S3 已约定 wrapper 样式。 | S1 视觉/作者体验、G1 |
| `tests/spatialLayout.test.mjs` | 6 条纯测试：完整 UUID/输入不变、确定性纵深、筛选边与依据复制、时间单调/未知、0/1/1000 条有限坐标及安全可见文本。 | S1 impl-safe |
| `tests/spatialRuntime.test.mjs` | 6 条纯测试：静态去重、连续预算、inactive/disposed/迟到回调、draw 内 invalidate 无递归、政策独立、像素预算。 | S1 impl-safe |

`PetShowcase` 使用 S2 实际导出，只传 theme/motionAllowed/visible/businessEnabled，未写 stub。Three 及其类型由 S3 唯一 owner 安装。App/入口异常 Boundary 与筛选留页由 S3 编排，本模块未复制业务筛选或保存状态。

## 目标对齐

- `goal_lock_check`: 真透视 3D 由 scene 实际创建；关联/时间视角消费现有投影；全匹配 UUID 同时有几何与文字选择；编辑仅调用宿主 `onEdit(selected.id)`；PetShowcase 是真实独立角色分支。上述源码事实与纯逻辑已有证据；相机可见效果、命中、保存结果尚须根 UI 证据，不能据此声称用户验收完成。
- `anti_goal_touch_check`: 无新 Note/SQLite/备份 schema、保存链、AI 调用或角色读取记录；未改关系推断、Worker、旧 2D/graphSession；没有地理/新语义能力声明、远程素材、Bloom、物理或养成平台。下面九个受保护源模块独立比对基线全部一致。
- `authoring_ergonomics_notes`: JSX 控件与图例保留直接中文名称，正文复用安全显示路径；关系写明共同标签或「正文词面相近 · 本地推断」，位置不冒充语义；静态模式允许选择和编辑。时间说明标明「空间时间轴 · 随视角旋转」和初始视角维度，避免旋转后仍声称固定屏幕方向。N/A 的配置样本：本轮未新增 manifest/规则配置或声明 DSL。

## 实际验证记录

统一证据目录 `C:/Users/ZXL/AppData/Local/Temp/qingjian-spatial-20261004/`。本 agent 完整读取了下列自身命令输出和退出码；没有用管道收尾。没有纯测试失败被省略。

| 命令/步骤 | actual result | evidence | owner / conclusion_if_missing |
| --- | --- | --- | --- |
| `node --test tests/spatialLayout.test.mjs tests/spatialRuntime.test.mjs` 初次 | exit 0，12 tests / 12 pass / 0 fail | `s1-tests-initial.log`、`s1-tests-initial.exit`；首版输出保留 | S1；缺日志或 exit 则首版纯逻辑未验证 |
| 同一命令，政策补修后 | exit 0，12/12，0 fail | `s1-tests-r2.log`、`s1-tests-r2.exit` | S1；缺证据不称政策逻辑通过 |
| 同一命令，最终冻结源码 | **exit 0，12/12，0 fail**；完整输出含 0 cancelled/skipped/todo | `s1-tests-final.log`、`s1-tests-final.exit`；本轮工具输出 `339f45` | S1；缺此记录不称最终源纯逻辑通过 |
| `Get-FileHash -Algorithm SHA256` 逐项读取 7 个 owner 文件及其 bytes/lines | exit 0，生成最终清单，与候选清单一致 | `s1-source-final.json`；工具输出 `040147` | S1；缺清单不关联后续验收到此源码 |
| 按 manifest 唯一 path 对照 NoteGraph、noteGraphModel、graphGeometry、graphFocus、useNoteGraph、store、types、noteFormat、SoftInteraction | exit 0，9/9 SHA 一致，0 mismatch；不读取 HEAD | `s1-protected-final.json`；工具输出 `af30ee` | S1；缺记录只保留 scope 意图，不能证明这些文件未变 |
| 核查安装包 OrbitControls 源及公开方法、实际 TypeScript 接口 | 已读取 rotateLeft/dollyIn/disconnect/update 等实际源码；选用公开方法并保留原 owner 资源边界 | 本轮源读取与 `s1-source-final.json`；此前源码核对工具记录 `08d7f3` | S1；缺实际依赖读取则相关 API 假设未核实 |

### 集成构建责任调整

LW 原指定 S1 在集成就绪后 `npm run build`。S3 已对最新整合源码顺序执行最终 `npm test` 与 `npm run build`；根明确要求「不需第三份重复 build，根独立重跑全套和生产预览」。因此 S1 **没有自行执行全项目构建**，不能把 S3 结果写作 S1 独立验证。本轮完整读取了 `s3-build-r2.log`，其构建日志显示 2500 modules、完成输出及 PWA 生成；exit 0 的执行归属与完整测试证据见 S3 报告，根仍须 fresh 验证。

- `evidence`: `s3-build-r2.log`（S1 完整读取，工具 `d723e5`）、`s3-test-r2.log`（S3 owner）；根后续日志由根记录。
- `owner`: S3 对其命令 exit 负责，根对交付前 fresh 全项目验证负责。
- `conclusion_if_missing`: 缺 S3 exit/最终根验证不得称最终整合集成通过；S1 的 12 条纯测试不能代替 TypeScript/打包或真实 UI。
- 已知构建警告：SpatialNoteMap chunk 579.83 kB / gzip 146.48 kB，主 chunk 564.91 kB；Vite 提示部分 chunk 超过 500 kB。日志 PWA precache 为 10 entries / 1260.42 KiB。已向根移交，未隐藏警告、调高阈值或无依据改缓存配置。

## 首版问题与修正记录

以下是初稿静态/根反馈发现的真实问题，不能用最后纯测试绿色掩盖：

1. 初稿 `active` 同时要求 focus，可能让未聚焦初次打开的 canvas 不绘制。现在 visible 允许初始/按需静态帧；focus/business 决定输入及连续动态。blur 会取消手势/连续帧，hidden 完全停绘。
2. 初稿 dispose 调用 forceContextLoss，同一 canvas 的 StrictMode 效果重新建立可能被旧 owner 的丢失事件影响。已移除主动 forceContextLoss，按 sets 与 renderer.dispose 释放自建 GPU 资源，context loss 仍进入降级；真实 StrictMode/重复进出结果由根验证。
3. 初稿 pending 单组适配后 ready 多组可能外扩出视野。现在首个 ready 布局在 owner 生命周期中仅 fit 一次；之后选择/筛选不无故重置用户镜头。
4. 初稿时间图例用了固定横向解释，degree/done 大小说明不够准确。改为空间时间轴和初始视角说明，大小图例注明同状态/同等联系条件。
5. 核对当前 OrbitControls 实际 dollyIn 实现发现初稿 zoom factor 方向相反；改为 `dollyIn(1 / factor)`。删除无作用 `ring.scale.multiplyScalar(1)`。

上述是局部实现修正，不是 root UI 成功证明。本轮 S1 命令没有测试或编译失败；调研阶段 `ConvertFrom-Json` 默认模式遇到 lock 空字符串 key 的非终止错误，已在 research.md 保留并改 `-AsHashtable`，不把当时 exit 0 当作解析成功。

## 源码冻结指纹

完整清单还包含 bytes/lines，见 `s1-source-final.json`。本轮实际读取结果：

| path | SHA-256 |
| --- | --- |
| `src/SpatialNoteMap.tsx` | `F08A4709FC3662A1656492D50825D1750B1E3017281B8F9D0E4EDBAA8326DCD4` |
| `src/spatialLayout.ts` | `E32EE0618F314746818A96F0A2DBD53675B17E6E621680D1FEC166008D322B1B` |
| `src/spatialRuntime.ts` | `9686397F008A9F3293FBFE0CB36BCE9B2352F46F7489E5384F863F69E8BAAA22` |
| `src/spatialScene.ts` | `AA853EFEE456BD6358164A8AF896D82815482A2E4328DED025E97A1D17A7CE8F` |
| `src/spatial.css` | `22FEC4500414DBB8DE80BF633E8DE58750628C88802B83D94AF060862111770B` |
| `tests/spatialLayout.test.mjs` | `4E4C60EB717AF86879D385AD542FF8E97A8E8A6870956F05A06443D179DB3814` |
| `tests/spatialRuntime.test.mjs` | `EAD2C2CCDFE18CADC3E8F63F6F926B2436EBE1B1D6F4AAA2A9AD71E4BC6FBA7C` |

## coordinator_handoff_verifications

所有条目的 `owner` 为根协调器；S1 不运行服务/真实 UI/DB/原生验收，不把纯测试冒充这些证据。

| 未由 S1 执行项 / 原因 | evidence_expected / 建议承接方式 | conclusion_if_missing |
| --- | --- | --- |
| fresh 全项目 test/build；根明确承接避免重复构建 | 根顺序命令完整日志、exit 与前后源 SHA | 整合源码/制品构建状态未知 |
| 真透视效果、相机旋转/平移/zoom/fit/focus、点击与拖动阈值、25/500/1000 初次 ready 可见 | 根生产预览截图/操作证据，源 SHA；实际数据条数和尺寸/浏览器测量 | 不称真机可操作、GPU帧率/内存/预算结果通过 |
| 无 WebGL/context loss/失败重试、StrictMode、重复进入/退出，旧 owner 回调与资源取消 | 根可控浏览器故障与生命周期实测、console/截图/记录 | 降级与资源真实生命周期未测 |
| 暂停/全局动态关闭/reduce 时仍旋转选中编辑，blur/hidden/modal/AI 时取消且不可穿透 | 根实际窗口、弹层、动态设置操作记录 | 仅政策纯逻辑通过，实机取消/输入未测 |
| 全 UUID DOM 选择、安全正文、同一个原编辑器保存；共享搜索/标签/未完成留空间和模式 | 根真实筛选/选中/原编辑保存闭环；必要的只读数据对照 | 数据不变的静态边界有证据，真实保存/筛选闭环未测 |
| 浅深主题、390px 单列、触屏双指、键盘/读屏，pet 模式释放空间 owner | 根截图和操作记录；触屏/读屏不可运行则明确未测 | 不称移动端、无障碍或全部主题实机通过 |
| 原 2D/Ctrl K、编辑/排序/置顶/PWA/Windows 原生回归 | 根按 S4 验证与 fresh 制品 SHA 对应 | 不称原能力/原生版本全面回归通过 |

## contract_drift_reports / 未完成与风险

- 未发现 owner 接口、冻结 LW 或输入基线漂移。`spatialScene.ts` 的单独文件划分在实施前已由根明确批准，列入本报告；不改变 S1 合同或新增通用框架。
- 构建责任由根明确调整为 S3 最终构建 + 根 fresh 重跑，已上报且如实区分执行者；这是验证调度调整，不伪造 S1 build 证据。
- S1 源码与纯测试已冻结，没有已知待补源码项。上述非 impl-safe 项仍是交付前未完成验证，尤其真实 context loss/重复进入、500/1000 实际画面与弱 GPU/触屏/读屏/耗电；目前不声称整项任务完成。
- root 曾报告开发 HMR/依赖优化时从 space 返回 all、无 console error；它属于根真实验证观察，应保留并在冻结后的生产预览复验，S1 没有擅自改导航。
- 预算是明确代码上限，不是硬件性能实测；无 canvas 路径以全部 UUID 的文字选择保留可读可编辑能力。

## 回滚信息

`可直接回滚`：撤销 S1 七个新模块/测试及 S3 本轮引用可恢复原展示；不涉及业务数据迁移。根必须按已知变更清单处理，不可 restore/clean 未知用户文件。此报告只是描述回滚边界，S1 没有执行回滚/Git。

英文提交建议：`feat(space): add local 3D note perspectives`

无额外跨功能事实：本轮细节均属于该功能或已在原研究报告中记录。
