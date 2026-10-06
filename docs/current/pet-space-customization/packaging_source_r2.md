# 0.7.0 隔离发布源码包装 r2

- feature_name：pet-space-customization。
- impl_round：TEMP packaging-r2，非产品补实施或最终Review(Impl)。
- date：2026-10-05。
- lwplan_version：S1–S3/S4-R2，读取身份94C378EF989EFD5C8AF85F0936AB7F4615FBF7F3C8330EFF2D95297E06DE1CBA；本次有限包装依据[包装r2审查](review_notes_packaging_2.md)七条合同及root正式派单。
- 结论边界：新r2发布源码副本已生成，独立字节核验退出0；没有运行npm test/build、UI/GPU、native、DB或Git，不代表最终产品、EXE或用户验收。

## 授权、输入与实际输出

用户Q1明确“先保留源码，本轮EXE只包含宠物和空间配置”。第三探索与工作区月历全部保留，r2只采用不可变r1清单150项，叠加两份有限差量。没有整体复制当前App，没有回写工作区，没有覆盖旧脚本、旧manifest、旧stage、73 before或历史并发证据。

TEMP根：`C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004`。

| 对象 | 实际身份 |
| --- | --- |
| 包装r2审查 | C68B56617E294FB5A0B224177C215D7187BA670D3F62EFE8BE9F3741BA65AAD2；全文读取707377 exit0 |
| r1 manifest | 7AA9AE366F81A3F3BDC9BF0109373FD96B5EEACF4075F309813C439203D1B44B；150唯一路径，读取前后baseDrift=[] |
| 接受的当前App观察输入 | 514AAE9C4BB1D410EBCB411BBC9AA3B282F8283C6EAE41126F2D0D852B4D3AF4，31021字节 |
| 当前Pet及r2 Pet | BFE390FAE9465E78327C2AC8D6F1919CAD9CA52DE835B70128593B16C1FE0768，21568字节 |
| r2 App | 01902872C7889893F110F13F2A3E20339575479E11C2C374DD50C188618F6E9F，29969字节 |
| 新helper | prepare-release-source-r2.py；B526FEF683FB373D74D80B81B82A93220FD1E739AE20695B055346BEB436DA34；全文实读0b72e6 exit0 |
| r2 manifest | release-source-r2-manifest.json；15F783A8C319F7920D337E9A5A9A2757A408529334A5C1732E1BCAA6E30201FC |
| 当前保护观察manifest | current-source-observation-r2/manifest.json；336AFB20EFFCE5A5D7BB566B78A00854A3719B9E3D2363FE9BB2BE3805997888 |
| App overlay diff | release-source-r2-app.diff；9239字节，B60CDC7195CB460750B3828D58CC54638719BA7EC09EF044606F9D5911178F52 |
| Pet overlay diff | release-source-r2-pet.diff；806字节，C9D7BD8BCF8D25DCD3C40BBC258BF71FA7916F6940221444E4CD841DFAD92CCE |
| 排除/保留表 | release-source-r2-scope.md；4DA27E6F961194048EBB8F9488A4E70043621FA92A4A87F14E2F2DDF624B3E65 |

新`release-source-r2`和`current-source-observation-r2`均为TEMP根下原本不存在的直接子目录。只从r1 manifest列出的150路径读取并复制，没有搬入r1的dist、target、node_modules、tsbuildinfo或日志。生成清单逐项含baseReleaseSha256、currentSourceSha256/snapshotSha256及r2ReleaseSha256；当前新增/排除路径的base/r2为null，完整当前观察项也单独保留。

## 文件变更事实与合同映射

| path / change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- |
| 新TEMP prepare-release-source-r2.py | 核固定r1/review身份与150唯一路径；拒绝越界/既存输出；两份有限差量；逐文件捕获前后hash/时间与重取记录；生成新manifest/diff/scope | 包装合同1–7 |
| 新TEMP release-source-r2（150源） | App从r1只加5处设置名字；Pet从r1只加现函数export；其余148项严格原字节 | 合同1–5 |
| 新TEMP current-source-observation-r2（164源及manifest） | 每个源按实际捕获前后读取保存到独立尝试路径；观察输入与发布输入分开，不声称整个workspace全局稳定 | 合同6–7 |
| 新TEMP manifest / 两overlaydiff / scope表 / 日志 | 完整base/current/r2来源与排除理由、SHA、实际命令和退出码 | 合同6；verification |
| 新TEMP prepare-release-source-r2-rejected-f456.py | 保留第一次F456严格预检失败时的helper字节，DAC210CA6D268D7224430673224367BCD6AD656E5A2F39913FD0AF2A98C70ABD | 合同7漂移追踪 |
| 本报告（新增） | 记录本轮执行、失败、保护/发布区别与交接，不改公共文档 | root派单；safe-code-changes报告字段 |

App五处替换分别为：PET_CHARACTER_NAMES import、SettingsView调用的petName、SettingsView解构、必需petName:string、description模板字符串。r1各原片段计数1，当前514各目标片段计数1。Pet第69行唯一`function PetPortrait(`增加`export `，推导结果逐字节等于当前Pet；既有body、props和policy保持。两份diff已分别全文读取6723db/0ac86e exit0，不以截断片段代替完整差量核查。

## 保留与排除

| 路径/部分 | 工作区保护 | r2实际处理 |
| --- | --- | --- |
| App中的S1–S3应用外观owner、大小宠物、空间偏好与lazy链 | 当前App完整字节已捕获 | 采用r1既有实现并仅加5处Settings名字 |
| App原Garden入口、S4 callback/name及PetPortrait专用import/reference | 已捕获，不回写 | 全部排除，r2无garden/PetPortrait引用 |
| App第三探索requestLocate(local)/locateRequest.local/onOpenGraph(id)及关联图页隐藏小宠物 | 已捕获，不回写 | 全部排除，仍用r1稳定链 |
| PetCompanion共享PetPortrait export | 当前字节已捕获 | 保留唯一export差量 |
| src/SpatialNoteMap.tsx | 当前探索字节已捕获 | 发布采用旧稳定r1基底 |
| src/NoteGraph.tsx | 当前探索字节已捕获 | 发布采用旧稳定r1基底 |
| src/graphFocus.ts | 当前探索字节已捕获 | 发布采用旧稳定r1基底 |
| tests/graphFocus.test.mjs | 当前探索字节已捕获 | 发布采用旧稳定r1基底 |
| src/RecordGarden.tsx | 当前月历/S4字节已捕获 | 排除，base/r2为null |
| src/RecordDayViews.tsx | 当前月历字节已捕获 | 排除，base/r2为null |
| src/RecordCompanion.tsx | 当前月历/S4字节已捕获 | 排除，base/r2为null |
| src/recordGardenModel.ts | 当前月历字节已捕获 | 排除，base/r2为null |
| src/record-garden.css | 当前月历字节已捕获 | 排除，base/r2为null |
| src/record-day-views.css | 当前月历字节已捕获 | 排除，base/r2为null |
| src/record-companion.css | 当前月历/S4字节已捕获 | 排除，base/r2为null |
| tests/recordGarden.test.mjs | 当前月历测试字节已捕获 | 排除，base/r2为null |
| src/spatialExplore.ts | 当前第三探索新文件已捕获 | 排除，base/r2为null |
| src/spatialExplore.css | 当前第三探索新文件已捕获 | 排除，base/r2为null |
| tests/spatialExplore.test.mjs | 当前第三探索新测试已捕获 | 排除，base/r2为null |
| src/graphView.ts | 当前第三探索新文件已捕获 | 排除，base/r2为null |
| src/graphView.css | 当前第三探索新文件已捕获 | 排除，base/r2为null |
| tests/graphView.test.mjs | 当前第三探索新测试已捕获 | 排除，base/r2为null |
| 其余r1源路径 | 逐路径当前观察对应SHA见manifest | 148项整体与r1字节相同（含上方4个探索旧源）；不把148误写为与当前workspace全部相同 |

实际捕获164项；当前不同/新增为20路径：App/Pet两份、4个探索旧源、8个月历及6个探索新增。实际排除新增14项。完整164行与150行来源信息分别在两份manifest中，scope表全文实读0deb05 exit0。

## 并发观察、失败与窄身份更新

输入包装预审还保留了root上报的混合工作区20个TS错误，以及reviewer中间稿/命令编码读取失败，详见其原报告。本owner没有执行那些产品构建或预审命令，不能记成自己运行的结果，也不能以本次有限冻结声称它们已修复。

首轮helper要求当前App严格F456，实际执行559b3f exit1：`RuntimeError: Current App identity changed; narrow review required`。完整失败保留于`packaging-r2-preflight.log`和`.exit`，当时r2/保护目录都尚未创建；这不是被隐去的绿色运行。

root随后转达独立reviewer9c3e88/a75040窄核，并正式接受新当前App514/31021作为观察输入：相比F456唯一差量是小宠物hidden追加`|| view === 'graph'`。本owner实际执行ae7d4a exit0：该完整hidden目标唯一，撤去此唯一新增后SHA精确回到F456；5个Settings目标仍各1，Pet仍BFE。该逆变换只用于观察输入核对，绝未用逆变换后的当前App构造发布源。

首版helper已另存为新拒绝证据文件，旧prepare-release-source.py未改。仅对本次新helper更新严格允许的当前App身份，并增加514→F456的唯一字节逆核；没有放宽为正则或吞入未知差量。r2推导App0190/PetBFE和148项r1基底保持不变。

当前保护捕获UTC区间为2026-10-04T18:32:55.720364+00:00至2026-10-04T18:33:27.900567+00:00（本地2026-10-05）。每个文件各有captureStartedUtc/snapshotWrittenUtc/captureCompletedUtc、前后source hash、snapshot hash与changedDuringCapture。代码遇到捕获变化会保留该尝试字节并重取同一路径，最多3次，所有时间/结果单列；本次164项均只需1次，captureChangePaths=[]，结束枚举未捕获=[]。

此结果只证明各项实际捕获字节及各自短观测窗口，不证明整个活动workspace在同一时点稳定，也不承诺第三窗口此后不再写入。发布安全依据是不可变r1与精确两overlay，不是当前全工作区构建。

## impl-safe实际验证

所有日志位于上述TEMP根；没有命令用tail等管道替换退出码，完整输出已实际读取。

| 命令/检查 | evidence / 实际结果 | owner / conclusion_if_missing |
| --- | --- | --- |
| 初版helper无参数预检 | 559b3f exit1；完整packaging-r2-preflight.log/.exit；当前App漂移被严格拒绝 | 本owner；必须保留失败，不可声称首轮通过 |
| 当前514唯一hidden逆核+5 targets+Pet身份 | ae7d4a exit0；packaging-r2-narrow-514.log/.exit；精确复现F456 | 本owner；缺失则拒绝新当前观察输入 |
| 新helper无参数预检 | f7b1ae exit0；packaging-r2-preflight-514.log/.exit；150 base、5 targets、7越界/既存输出拒绝案例与两推导SHA | 本owner；缺失则不freeze |
| `python prepare-release-source-r2.py --freeze` | 702fa7 exit0；packaging-r2-freeze.log/.exit；150/148/2，164捕获，14新增排除，base前后drift=[] | 本owner；缺失则r2不是有效候选 |
| 独立读取r1/r2/保护snapshot实际bytes、两diff/helper身份 | 9be775 exit0；packaging-r2-verify.log/.exit；150 base+150 r2+164 snapshots全部重算，base/r2/snapshot drift=[]，0失败 | 本owner；缺失不能声明有限源清单一致 |

独立核验未调用helper的转换函数，直接读取150项base和r2、164次保护捕获字节及所有摘要；比较发现只有两允许路径不同，4个旧探索路径r2采用r1SHA，14新增路径均不在发布目录。有限转换/来源校验不冒充产品测试或现场证据。

## 目标与反目标自检

- goal_lock_check：G1宠物/装扮、G2空间外观的已实施基底保留；G3可追溯来源与大小共享出口收尾有完整150/164来源、两个diff和SHA；本次不新增产品能力。
- anti_goal_touch_check：A1草稿/Apply边界来自r1未变；A2本地数据/独立发布范围保持、月历和第三探索不进入EXE；A3未增加产品动画、定时器、RAF或网络。没有改产品/业务/Rust/元数据。
- authoring_ergonomics_notes：只用有限字节替换保留原换行及已有身体，可读完整helper、两diff、scope表和带时间的观察manifest；没有整份覆盖当前App或制造第二套业务owner。
- contract_drift_reports：F456→514已显式向root报告并获窄身份认可；旧/新helper、失败/窄核日志保留。除此之外无包装合同漂移；164源中的第三探索字节只作保护观察。

## coordinator_handoff_verifications、风险与回滚

| 待根承接 | evidence_expected / owner | conclusion_if_missing |
| --- | --- | --- |
| r2最终完整npm test/build | 同一r2源树完整输出/退出码、实际测试数、包体/lazy/版本与产物身份；root独立运行 | r1/混合工作区结果不能代替r2；未验证产品候选 |
| r2实际Web界面与动作/相机/生命周期 | 同一r2源码媒体、真实操作与失败/未测；root | CPU/hash/source不证明UI/GPU |
| 工作区S4及第三探索来源 | S4五源身份、共享角色/局部许可/隐藏/失焦/减少动态/日期等实际界面；root分别说明第三任务 | r2无月历不能证明S4工作区已通过 |
| native/DB/版本制品与最终fresh/doc同步 | 同r2 Windows构建、制品hash/版本、受控启动、真实库只读前后、实际失败/未测及最终review报告；root | 包装PASS/冻结成功不代表最终Review(Impl)或发布完成 |

剩余风险是活跃工作区继续变化；本报告与snapshot明确限定观察时点，后续发布核验以r2固定源与相应制品为准。r2只包含本轮pets/config，但root后续构建会生成新dist/target等，不应据生成文件把150项源清单改成全目录同一集合。helper再次`--freeze`会拒绝已存在的新目录/证据，不会覆盖。

回滚信息：需人工介入。仅将本次新TEMP候选标为无效/保留，必要时由root窄核后创建下一独立候选；不对工作区或旧stage执行还原、覆盖、删除或Git操作。本owner没有执行删除、提交或发布。

English conventional commit建议：`docs: record isolated pet and spatial release inputs`。

无新增跨功能事实。
