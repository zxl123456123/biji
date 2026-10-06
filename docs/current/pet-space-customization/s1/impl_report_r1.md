# S1 宠物角色与本机装扮铺实施报告（r1）

## 基本信息

- `feature_name`：pet-space-customization / S1。
- `impl_round`：r1；日期：2026-10-05；owner：`/root/wardrobe_research`。
- `lwplan_version`：最终 `lwplan.md` SHA256=`9CF5D04EDAD069C8E0CE2ABE7C9FDD861080358D36D854E814CA0BA3E63FBD0D`，30912 bytes。全文读到 Gate-2、共享接口、S1和并发保护后实施；读取最新 clarifications、Readiness r2 和 Review(LW) r1。root正式派单说明已全文复核、Gate-2 PASS，实施不依赖新的阶段许可。
- 加载 `safe-code-changes`、`verification-before-completion`；本包仅执行impl-safe代码/单元测试/构建/静态身份核验。不递归委派，不操作UI、服务、DB、native或Git。
- 原73份 `before/manifest` 保持；首次核对 PetCompanion/pet.css/petBehavior 与before身份一致。App/空间/元数据由S2/S3独占，本包未写入；RecordGarden及公共文档的并发工作未覆盖或修改。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/petAppearance.ts` | 新增 | 五角色名/枚举、四字段外观、完整默认、严格整份回退；safe read取得localStorage也在try内，write只规范化单键一次setItem并返回bool，无mount自动写入 | S1.1；G1/G3、A1/A2 |
| `src/PetCharacters.tsx` | 新增 | 奶龙/吉伊/小八/乌萨奇分别有真实独立SVG轮廓、分层渐变和识别细节；导出LW规定的PetCharacterBody/PetAccessories，有限帽/星环/围巾/蝴蝶结随外层身体；不创建行为hook/计时/RAF | S1.1–3；G1、A1–A3 |
| `src/PetCompanion.tsx` | 增量 | 必需appearance与Apply callback；晴小团原身体保留，大小共用画像；角色变化复用cancel清反馈/owned capture，保留休息/位置；五组名称/反馈/介绍/ARIA；本机装扮草稿、静态SVG角色/选项/组合卡、预览/撤销/Reset/Apply与bool消息 | S1.1、4–5；G1/G3、A1–A3 |
| `src/pet.css` | 增量 | 晴小团原动作仅匹配其data-character；四个角色各有独立部位/轨迹/节奏、运动原点；子层动作限定animate=true与idle/happy，false强制停止全部子层；装扮布局和720/1080响应式 | S1.2–5；G1、A1/A3 |
| `tests/petAppearance.test.mjs` | 新增 | 135种合法组合、坏形状/字段/枚举/类型完整默认、新对象不污染默认、缺值/坏JSON/读取异常、quota/security写失败、localStorage取得异常、单键一次写、两个生产模块互不串键 | S1 impl-safe；G1/G3、A2 |

未修改 `petBehavior.ts`或旧测试。最后静态核验实际提取原Sunny身体首path至末path，与before逐字符相同；其默认body/ear渐变色和原比例不变，palette只有限替换渐变stops。四个新增角色保留本色，仅装饰响应palette；界面明确说明。奶龙附图通过view_image实际查看后重绘；三小只采用上游有限参考取舍，不补称已见完整官方参考像素、官方动画或第三方设计原创。

## 目标对齐

- `goal_lock_check`：G1落到五角色、不同idle/happy、静态实际画像卡、试穿/应用/撤销/原装及大小必需接口；G3落到独立有限外观key和原业务不改。大小/刷新持久端到端、肉眼造型和动作差异仍需要root现场证据。
- `anti_goal_touch_check`：没有五角色通用身体换色、保留原Sunny；没有第三方素材下载、网络、支付/库存/帐号、业务schema、第二RAF、五套行为状态机。空间/G2实现由S2/S3承担，本包不触碰renderer/camera/layout。角色声明为SVG重绘与项目动作，不称官方/真三维。
- `authoring_ergonomics_notes`：字段为四个明确有限枚举，没有注册框架。SVG按人物具体部位分组，CSS按角色/状态/政策读取；中文界面显示试穿与两种保存结果，各选择含真实静态SVG。配色对新增角色只装饰的规则直接说明；恢复原装及三套组合都保留draft.character。
- 草稿只在PetShowcase，选项/撤销/恢复原装只改draft，不写存储；Apply直接调用required callback，返回true/false的role=status提示按LW原文。applied prop effect只同步draft，不擦保存提示；Apply不以draft等于applied禁用，因此false后可再次保存。离页由组件卸载丢draft，宿主应用值由S3负责。
- 角色改变layout effect执行现有cancel顺序，clear1400ms feedback→取消owned pointer→reducer cancel；resting reducer和位置ref未重建。小角色只因applied角色变化取消，大角色因draft角色变化取消。
- 原primary pointer/6px/final pointerup/cancel/lostcapture/detail0键盘handler保留；小层名称、触摸、休息、收起ARIA随applied角色，大图随draft角色。大舞台光晕仍直接跟pet.policy.animate。
- 四角色idle/happy具体差异：奶龙腹部起伏/摇摆和交替跺脚；吉伊轻晃/耳抖和害羞挥手；小八探头/摆尾和摇爪/点头；乌萨奇轻跳/长耳抖和雀跃。缩略图无behavior hook且animate=false；body和所有耳/尾/腹/爪仅在对应idle/happy与animate=true执行，减少动态CSS仍覆盖全部子层。源码只能证明门控与轨迹不同，不能证明肉眼体验已通过。

## impl-safe验证记录

原始目录：`C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004/`。每条命令均保存完整stdout/stderr及 `.exit`，没有用tail/管道替代命令退出码；已完整读输出与工具退出码。

| 命令/静态校验 | 实际结果 | evidence | owner / conclusion_if_missing |
| --- | --- | --- | --- |
| `node --test tests/petAppearance.test.mjs tests/petBehavior.test.mjs`，首轮 | exit0，9/9，fail/cancel/skip/todo 0；之后增加两生产模块互不串键测试，不将首轮作为最终测试数 | `s1-test-r1.log`、`s1-test-r1.exit`；工具e6c8c7 | S1；缺输出/exit只能未验证 |
| 同一命令，最终测试版 | exit0，10/10，fail/cancel/skip/todo 0；新增6项外观测试，原4项behavior测试 | `s1-test-r2.log`、`s1-test-r2.exit`；工具164f23 | S1；单测不能代替DOM/真实持久化/动作 |
| `npm run build`，当前完整接线源码 | exit0，tsc/Vite/PWA；S3的0.7.0meta/空间/并发garden共同被编译，不能冒认为S1功能成果 | `s1-build-r1.log`、`s1-build-r1.exit`；exec b9ce10及完成60ef04 | S1；未构建或exit缺失则类型/打包未验证，UI仍另验 |
| 原Sunny身体逐字符比较；原petBehavior SHA；LW SHA；5项S1源SHA | exit0，OriginalBodyExact=true，ProtectedBehaviorUnchanged=true，LW身份相同 | `s1-source-r1.json`；工具6b8f61 | S1；缺身份只能未确认源保持，不能根据作者自称放行 |

当前build摘要：main `index-D5Nc6XyQ.js` 589.57/gzip188.92kB，SpatialNoteMap 587.49/gzip148.86kB；PWA precache13项1329.45KiB。保留 >500kB chunk警告，未调高阈值；这是包体统计，不是CPU/GPU速度或耗电证据。S3随后仍需独立全量test/build并冻结其源，root还需独立终检；本包构建不代替完整feature验收。

## 首次稳定S1源码身份（root状态文案修正前）

此清单是首次S1产品源稳定时的身份，保留历史；最后root静态文案修正及新身份见报告末尾。root现场补修或fresh审查后再改源，应保存新日志/新身份并重新验证，不覆盖本报告历史。

| path | bytes | SHA256 |
| --- | ---: | --- |
| src/petAppearance.ts | 2009 | `BD36B14D3CED4B150B35A061F55278F5D9DEB29FBAD8593E00D69921C350082D` |
| src/PetCharacters.tsx | 14474 | `E67E5F35820FE00C04B8D019DB4C940CD005CB1E5451167A42A7420F299D96CA` |
| src/PetCompanion.tsx | 21226 | `A183D8FEDA286FA77011F7458A40D9A13FE9ACF33AB3A21CFE3C688FF9E29A99` |
| src/pet.css | 17178 | `0E5150E714A00295BE46272726355C291312F80E3A854D4F1A9C033643A486AC` |
| tests/petAppearance.test.mjs | 5299 | `32B2DD71F7F9F89F705EFC78E77721E0EB09DCD0ACE8E71EF3F921B9E1E245E7` |

## coordinator_handoff_verifications

| 未由S1执行项 / 移交原因 | evidence_expected / 建议承接方式 | owner / conclusion_if_missing |
| --- | --- | --- |
| 五角色真实大小造型与idle/happy辨识，全部耳/腹/尾/爪政策；属于真实UI | root实际逐角色操作并截图/连续帧，关闭动态/系统减少动态/休息/拖动/失焦/模态检查；不能只看CSS关键帧名 | root；缺则动作/造型体验未测 |
| 各配件/长耳在240×230和160px小层、390px/主题、Tab/ARIA与遮挡；属于现场输入 | root实际试三类头饰/配件和组合、记录/空间/设置，缩屏测可见区域；验证帽/星环不盖脸/猫纹/长耳/原叶片 | root；缺则视觉/触控/焦点未测 |
| 角色切换旧招呼/owned capture取消且休息/位置保持；纯behavior测试没有DOM生命周期 | root招呼中换draft/applied、休息换角、小层位置前后、模态/blur/取消动作，保留媒体/实际状态 | root；缺则切换取消现场未测 |
| 未应用不写、撤销/Reset需Apply、false保存重试、离页/刷新/桌面重启与大小同步；属于宿主端到端 | root隔离fixture页面看keys/props/UI并刷新；仅注入两个外观writer错误，原global storage拒绝仍未测；桌面重启另证 | root；缺则持久化端到端未测 |
| 最终feature全量test/build、源冻结、新EXE/真实旧库/PWA加载内容 | S3和root独立完整日志/exit、源/脚本/制品SHA、只读库前后；不由S1运行UI/native/DB | S3/root；缺则最终发布/原生与数据保持未验证 |

## contract_drift_reports、失败与风险

- 未发现S1目标/共享接口漂移：实现签名和名称严格消费最终LW；没有通过optional props掩盖缺接线。模块ready及源码稳定分别已通知S2/S3/root。
- 新外观safe storage覆盖取得对象及get/set异常；没有顺修App原有theme/pinnedTags/ambient/petShown等raw storage。Node注入throwing getter的结果仅证明新helper，不能声称全局localStorage拒绝时整个App正常启动；该现场项仍未测。
- 本轮没有已运行产品测试/构建失败；真实命令均exit0。工具首次合并读取超总输出预算，LW和r2/Review(LW)随后单独全文重读；该截断不是产品测试失败，但不省略。未启动服务/UI/DB/native/Git，没有把历史0.6.0或别的agent自报通过当S1证据。
- 奶龙仅单视图参考，三小只完整官方图区像素仍未知；SVG重绘保留本色/轮廓和渐变体积，严格官方视觉复刻/动画/背面细节不承诺。
- 所有角色/配件画像都在源码中各自明确，实际长耳运动、装饰浮层及小层反馈换行带来的高度需root检查。CSS静态强停不等于已测系统reduce/blur全部组合。
- 新测试会导入S2生产的纯spatialAppearance以核对两键隔离，因此完整工作包依赖S2接口；没有改S2文件。未来接口回滚需由root协调。
- 审查重点：原Sunny主体保留、角色真实辨识/动作差异与所有子层政策、应用失败提示不丢失、Reset保留角色、无旁路写存储、必需props完整接线。最终包装范围Q1和未知RecordGarden不由本包判断。

## 未完成、回滚与提交建议

- S1代码与impl-safe验证已具备；root现场验收、最终feature独立验证、fresh Review(Impl)、Windows制品及用户体验验收仍未由本包执行。
- 回滚信息：**需人工介入（root协调接口）**。只撤销本包5个产品文件相对于before/新文件的自身差量，并同时由S3撤掉其对应必需props；不能用old App覆盖当前并发文件、不能清业务/偏好。原Sunnybody未改，不清 `luma-pet-appearance`，旧版会忽略新key。
- English conventional commit建议：`feat(pet): add character wardrobes with local preview and apply`。
- 无新增跨功能事实。

## root静态复核补正与最终身份（仍为r1）

root全文源检查f19b6a实际发现可理解性缺陷：大舞台徽章始终“试穿中 · 穿上后才会保存”，默认/Apply后draft==applied也如此；空保存消息同样始终称只在试穿。它未造成读写测试失败，但误导已应用状态，不能省略。root正式指示按G1局部修正，不是新产品范围或Review(Impl)回环。

仅修改PetCompanion：用character/palette/head/accessory四字段直接比较推导tryingOn；有差异才显示试穿中和试穿fallback，无差异显示“当前装扮 · 已穿上”和当前装扮fallback。已有role=status成功/false消息优先，不被prop同步擦掉；写失败但已session applied也显示已穿上，同时status明确未保存。未新增storage/state层，Apply相同值继续可重试。

新证据均本轮实际执行且完整读取：

- `node --test tests/petAppearance.test.mjs tests/petBehavior.test.mjs`：工具f82c46 exit0，10/10，fail/cancel/skip/todo均0；`s1-test-r3.log/.exit`。owner=S1，缺输出/exit只能未验证；UI状态仍由root现场检查。
- `npm run build`：工具c7460d exit0；`s1-build-r2.log/.exit`。main `index-CBMKG90m.js` 589.81/gzip189.01kB，SpatialNoteMap 587.49/gzip148.86kB；PWA13项1329.68KiB，>500kB警告仍保留。owner=S1，缺证只能构建未验证，不等于已做UI或原生验收。
- 再次Sunny原身体逐字符/受保护petBehavior与LW身份核对：工具e9729a exit0；`s1-source-r2.json`。OriginalBodyExact/ProtectedBehaviorUnchanged仍true，5项当前源身份如下，前次r1日志/身份不覆盖。

| path | 最终bytes | 最终SHA256 |
| --- | ---: | --- |
| src/petAppearance.ts | 2009 | `BD36B14D3CED4B150B35A061F55278F5D9DEB29FBAD8593E00D69921C350082D` |
| src/PetCharacters.tsx | 14474 | `E67E5F35820FE00C04B8D019DB4C940CD005CB1E5451167A42A7420F299D96CA` |
| src/PetCompanion.tsx | 21561 | `AAC245CCA2B7F796EC134B9E8E1CB3AF862E08D20A378F8443B713B88B2385A6` |
| src/pet.css | 17178 | `0E5150E714A00295BE46272726355C291312F80E3A854D4F1A9C033643A486AC` |
| tests/petAppearance.test.mjs | 5299 | `32B2DD71F7F9F89F705EFC78E77721E0EB09DCD0ACE8E71EF3F921B9E1E245E7` |

最新源再次通知root/S3；S3需要以此身份重跑终检，不把修正前build/main当最终。其余现场承接、未知/风险与回滚范围不变。
