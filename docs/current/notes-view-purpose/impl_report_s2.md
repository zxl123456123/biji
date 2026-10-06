# S2 实施报告：主题空间与积累轨迹

- feature_name：notes-view-purpose
- impl_round：S2 / r1
- date：2026-10-05
- lwplan_version：2026-10-05；消费 Gate-2 PASS 稿（review 中 SHA256 `010B1CC29720AB67FB53E9A1F9E4A4EB862F733E1EBB37ED3C240387BF78B63E`）。
- owner：impl_space；仅实施 S2 独占文件，没有递归委派、构建、启动服务、浏览器操作或 Git 提交。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| src/SpatialNoteMap.tsx | 修改 | 完整布局与 scene 展示布局分离；全部主题导览、数量/未完成、聚焦与恢复；显式动作在 setLayout 后 fit，重复点击也适配；跨主题 picker 恢复全部但不请求 fit；失效主题回全部、隐藏选择清空；主题空间/积累轨迹中文用途；默认静态；原外观配置默认闭合 details；完整正文/事实/关联总数保留，逐条证据替换为 UUID 二维入口；普通/失败图入口用无参包装 | S2 / G2、G3 |
| src/spatialExplore.ts | 新增 | tag / 稳定编号 text / single 聚合 / pending 真实分组；未完成来自同 UUID note.done；主题展示投影复制完整坐标/degree、裁 incident 可见边、重算 bounds、保留完整 timeRange 和证据 | S2 / G2 |
| src/spatialExplore.css | 新增 | 独立主题导览、限高滚动、长名换行、aria 选中/焦点反馈、窄屏两列、外观 details 与阅读入口样式 | S2 / G3 |
| tests/spatialExplore.test.mjs | 新增 | 5 个纯行为测试覆盖全部组/UUID/未完成、超过六组、稳定词面编号、冻结输入、坐标/degree/bounds/恢复全部、无选中零边/incident与跨主题裁边/证据复制、空/缺失范围、pending/未知时间/同文 UUID | S2 / G2 |
| docs/current/notes-view-purpose/impl_report_s2.md | 新增 | 本包事实、证据与根承接边界 | S2 |

每次修改 SpatialNoteMap 前已重读最新相应段落。原形状/背景枚举、ModelPreview、draft/preview/apply/保存结果、PetShowcase/角色名称与接线均保留；未写 scene/layout/models/runtime/spatial.css、App、Pet*/pet*、Record*、存储、依赖或版本文件。

## 目标对齐

- goal_lock_check：G2 对应行为已实施，纯主题与展示投影有下述实证；实际镜头、选择、外观和跨视图 UUID 回路须由根现场验证，不能据此宣称 G2 整体验收。G3 独立 CSS 与窄屏规则已实施，浅深/390px 舒适度未由本包实测。
- anti_goal_touch_check：A1 由默认零边、选中仅相关边、主题导览与二维证据入口落实；词面组明确标为词面推断，创建轨迹说明按天查记录使用记录时光。A2/A3 无新增持久化/网络/依赖/版本、关系引擎/renderer/RAF 或全局筛选；仅展示会话状态与原 scene API。
- authoring_ergonomics_notes：主题规则集中于纯模块，fullLayout/displayLayout 直接命名；主题按钮/文字 picker 的 fit 行为分开，原外观 section 仅外包 details，未新增配置 DSL。

## impl-safe 实际验证

- command：`node --test tests/spatialExplore.test.mjs tests/spatialLayout.test.mjs tests/spatialRuntime.test.mjs tests/spatialAppearance.test.mjs tests/spatialModels.test.mjs`
- evidence：`C:/Users/ZXL/AppData/Local/Temp/qingjian-view-purpose-20261005/impl-s2-tests.log`；完整 TAP 和 `exit_code=0`。工具 chunk `4f54df`，执行与读取完整输出均在本轮。
- result：24 tests / 24 pass / 0 fail / 0 cancelled / 0 skipped / 0 todo；exit 0。新纯行为 5 项和既有布局/资源/UUID/外观/policy 回归 19 项。
- owner：impl_space。
- conclusion_if_missing：缺完整输出或退出码只能标未验证；本日志证明纯行为和既有回归，不能证明 React/Three 界面、相机或 GPU 体验。

## coordinator_handoff_verifications

| 验证项 | 移交原因 / 建议承接 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| 最终全量 npm test 与 npm run build | 并发三包最终收口，由根串行执行，避免 dist/tsbuildinfo 写入冲突 | fresh 完整日志/exit、最终 SHA 集 | root | 类型/构建/总体回归未验证 |
| 全部→主题→独立→全部、重复主题/适配全部实际镜头 | 浏览器/Three 现场属于非 impl-safe | 根合成数据 UI 记录与截图，同 final SHA | root | 实际 fit/遮挡未验证 |
| 选中 incident 连线、完整正文/总数、跨主题 picker 不飞镜头与定位 | 纯模块测试不覆盖组件事件/镜头 | 根实际操作记录，选择 UUID 与总数 | root | 实际选择与镜头连续性未验证 |
| 默认静态、开启动态、旋转/选择/编辑；创建时间/未知区 | policy 回归无法替代真实操作 | 根现场/截图 | root | 现场交互未验证 |
| details 初始闭合、所有外观预览/应用/撤销/恢复、选择/相机保持 | 配置存储测试不等于原控件现场回归 | 根完整外观现场记录 | root | 原配置现场保持未验证 |
| 主题→记录→查看此条关联→二维一层同 UUID→编辑且共享筛选保持 | S3 App 接线、浏览器回路归根 | 根跨视图 UI 证据；普通/失败入口按无参消费 | root | G2 跨视图阅读回路未验证 |
| 浅深主题/390px；宠物/记录时光入口保持；fresh Review(Impl) | 作者体验与最终差量须独立验证 | 根截图、before/current 差量、独立报告 | root / fresh reviewer | G3 与总体实施未验收 |

## 失败、未完成与风险

- 本包上述实际测试首次执行 exit 0，无已见产品测试失败。初次批量读取的工具输出曾截断，已分别重读完整 LW/Gate-2、SpatialNoteMap 与关键 scene/CSS 段落；不把截断部分当作放行证据。上游 README/基线/LW 已记录的误读和 rg 失败保留。
- 本包没有执行类型/构建、浏览器或原生验证，产品验收由根承接。当前原生 WebView、多设备、触屏/读屏、长期 GPU/内存/耗电仍未测。
- 审查重点：显式 fit 与跨主题 picker 的差别；选中总数必须从 fullLayout 读取；筛选/更新后失效主题和隐藏选择；appearance draft 不触发 fit；普通 callback 不传 click event。
- contract_drift_reports：无已识别阻断漂移；接口依赖 S3 的 optional UUID callback，未改 App。

## 回滚与提交建议

- rollback：需人工介入。只撤本轮 SpatialNoteMap 局部补丁与三个新文件/本报告，保留原配置/宠物及所有并发差量；禁止整文件 restore/reset/clean。
- suggested_commit_message：`feat(spatial): add theme exploration and focused graph entry`
- 无跨功能事实。

## 补实施 r2：首屏空间收紧（保留 r1）

- date / owner：2026-10-05 / impl_space；消费根实际 UI 反馈，无新范围或契约漂移。
- 已见问题：根在 1265×713 浅色现场观察主题导览占 y=405–631（226px），外观折叠摘要占 y=645–693，地图在首屏下方，清晰舒适目标尚不满足。本包未运行该现场，也不将这次不足隐去。
- change：仅 `src/SpatialNoteMap.tsx` 的导览标题减少重复说明，增加 `data-explore` 将间距收紧限制在非宠物模式；`src/spatialExplore.css` 压缩主题按钮/间距，桌面导览 max-height=58px 保留全部主题滚动，390px 两列 max-height=94px；折叠 summary 减薄。所有数量/未完成/aria/动作、projection/fit/UUID 与外观控件保持。related_tasks：S2 / G3；A2/A3 不触及全局 styles 或 scene。
- impl-safe command：同 r1 的五文件 `node --test` 完整命令，修改后本轮重新执行并读取完整输出；24 tests / 24 pass / 0 fail / 0 skipped，exit 0，工具 chunk `7b0992`。
- evidence：`C:/Users/ZXL/AppData/Local/Temp/qingjian-view-purpose-20261005/impl-s2-tests-r2.log`；r1 原输出保留，r2 原输出追加到约定的 `impl-s2-tests.log`，未覆盖首次记录。
- owner / conclusion_if_missing：impl_space；缺输出/exit 只能未验证。纯测试没有验证 CSS 几何或舒适度。
- coordinator_handoff_verifications：根重新检查同 1265×713 首屏地图位置（期望 map top 尽量≤550，主体一部分可见）、390px 长名/换行/滚动与浅深主题；根 fresh build/test 和 final SHA 更新。evidence_expected 为真实 UI/截图和 fresh 根日志；owner=root；缺现场不得宣称首屏问题已修复。
- 本轮无已见 pure test 失败；首屏布局不足是已见产品现场问题，当前修订效果仍待根重新实测。回滚仍只撤本轮局部补丁，保留 r1 与并发差量。

## 补实施 r3：非宠物 heading 收紧（保留 r1/r2）

- date / owner：2026-10-05 / impl_space；related_tasks：S2 / G3，延续原作者体验收口。
- 根 r2 实测：桌面 stage 顶部 537.4px，canvas 顶部 594.2px（实际 DOM viewport 高 720px）；主体已有一部分可见，但 heading 仍约 108px，首屏记录节点可见度还需收紧。这是根回传现场事实，本包未运行 UI。
- change：仅 `src/spatialExplore.css` 四条 `data-explore='true'` 限定规则：heading margin 4px/8px；隐藏装饰 eyebrow；保留 h1 与用途，h1 29px/1.15 行高，subtle 11px/1.5 行高、4px 上距。导览、接口、scene 和宠物样式不变；A2/A3 保持。
- impl-safe command：`node --test tests/spatialExplore.test.mjs tests/spatialLayout.test.mjs tests/spatialRuntime.test.mjs tests/spatialAppearance.test.mjs tests/spatialModels.test.mjs`；修改后本轮重新执行并读完整输出，24 tests / 24 pass / 0 fail / 0 skipped，exit 0，工具 chunk `fd33e1`。
- evidence：`C:/Users/ZXL/AppData/Local/Temp/qingjian-view-purpose-20261005/impl-s2-tests-r3.log`；原输出追加到 `impl-s2-tests.log`，r1/r2 保留。owner=impl_space；缺输出/exit 仅未验证，测试不证明 CSS 尺寸。
- coordinator_handoff_verifications：root 重新实测桌面 canvas top 尽量≤550px及首屏节点可见、390px h1/用途可读与浅深主题，并更新 fresh 根日志/final SHA。evidence_expected 为同最终源码 UI/截图；缺现场只能标 heading 效果未验证。
- 本轮没有已见 pure test 失败；保留 r1 首屏不足和 r2 仍需收紧事实，r3 实际结果待根验收；没有启动 UI/构建或提交。
