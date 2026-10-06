# Q1 隔离打包补充复核（第 1 轮）

日期：2026-10-05。结论：**PASS（隔离承接合同）**；不重开角色/空间 Gate-2，不表示副本、UI、构建或制品已经验收通过。

用户 Q1 答复原文：**“先保留源码，本轮 EXE 只包含宠物和空间配置”**。本次只核对这个包装范围及其证据责任，不改需求、LW、源码或历史报告，不执行 UI/DB/native/Git，不递归委派。

## 输入与实际核查

- `4b4db8` exit0 完整读取最新澄清、feature README 与 verification-before-completion；`e66c39` exit0 核对当前 App 引用、package/Vite/main/Tauri 构建入口及目标模块引用。
- 最新 `clarifications.md` SHA256=`FDB6AB33EC7F57010AC6894D383EC3D3DB7BF686B4841349345C145C1D8B5C0B`；feature README=`0961A1E0B4EC2D809452ADB8576F8FE392DA58135FD1F5D29B09C6F9EC613845`。
- LW SHA256=`9CF5D04EDAD069C8E0CE2ABE7C9FDD861080358D36D854E814CA0BA3E63FBD0D`；原 Gate-2 报告=`E8A8FB5DB4CA76F6CFD9F8BA2761FFC250D31260625AE9B33849AD50C445B97A`；r2=`12F566457D1929CAAA9A169DCA65FD59913062DA24B9FBB3A68D350074A9BFD7`。`7a551c` exit0 独立核验8项包装合同/输入身份，无缺项或漂移，历史报告保持。
- 当前所读引用中，RecordGarden 从 App lazy 入口进入，再引用 RecordDayViews、RecordCompanion、recordGardenModel 和三个专用 CSS；测试独立导入 recordGardenModel。main 没有其他记录时光入口。构建配置仍是 Vite 前端、Tauri beforeBuildCommand 执行 npm build 并取副本的 `../dist`；当前读到版本0.6.0是实施前状态，不能当作目标0.7.0制品证据。
- `72f372` exit0完整读取TEMP辅助 `prepare-release-source.py` 初稿（SHA256=`D1BDBD4766F7805310916A89FD384CE4EDB60E2FCD12BFA8BFB4CD8041C6186B`）；`f4af22` exit0完整重读并发核对补强后的终稿，SHA256=`09F3E8C830E0DF28205D4533BB402E00654B1C6B7566F7CF085B1A78BA5A6930`。`3ada33`/`00d314` exit0仅加载定义、不执行freeze，独立断言8个有限逆变换/8个排除文件：normalized文本等同true、exact bytes等同false；差别只允许已识别换行口径，不能称原字节一致。root回传的strict检查`1e2850` exit1/normalized检查`64dd06` exit0也须保留。

## 辅助脚本窄复核

脚本的新stage必须是EVIDENCE的新直接子目录且不存在；只向副本和TEMP证据写入，不删除/回写工作区。每个App替换计数必须恰好1，否则报错；残留RecordGarden/garden/记录时光拒绝。源树、静态资产、Rust配置/图标及有限根构建配置纳入清单，排除target；八个外部文件只记源身份、不进入副本。输出每文件source/release SHA与App差量，范围与Q1一致。8项逆变换还包含仅供garden使用的renderMarkdown/withoutTags导入，当前引用吻合；最终必须以实施后的App核查，不能由旧snapshot逆变换通过推定新App也正确。

此前发现冻结证据缺口：初稿只在各文件复制后即时复读，较早文件可在随后复制期间变化；excluded文件因continue未复读，App.diff又从live工作区重新读。已向root受控上报并补强：终稿在排除分支前保存全部原始source bytes，末尾复核选中文件集合和全部source bytes（含8份保护文件），变化throw并明确副本无效；App.diff从冻结App字节生成，不再读live输入。`00d314` exit0独立核对8项守卫与顺序，窄缺口已闭合到脚本合同；有变化不得继续沿用该次日志/制品。不需新架构/用户决策，不阻断S1/S2/S3。实际freeze尚未执行，本报告不放行最终副本或产品制品。

## 副本边界与责任

root 唯一承接隔离副本。先冻结实施后的工作区输入，再在 `C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004/` 下保存独立源码副本的绝对路径、完整源清单/hash及变换差量。工作区 App/garden、八份源/测试、五份记录时光公共文档继续保留，原73 before、9+1源快照和 concurrent-docs 快照不改。

副本只排除记录时光接线及八份目标文件：`src/RecordGarden.tsx`、`src/RecordDayViews.tsx`、`src/RecordCompanion.tsx`、`src/recordGardenModel.ts`、`src/record-garden.css`、`src/record-day-views.css`、`src/record-companion.css`、`tests/recordGarden.test.mjs`。App 的已知排除锚点为 lazy import、View 的 garden 值、对应 render/Suspense 分支、导航按钮、浮层 hidden 的 garden 分支及仅供该入口使用的图标 import。其它引用先核查，不按通用字符串批量删。

原73/App与 concurrent App 的真实差量用于确认排除内容；变换必须应用到冻结后的新 App，保留 S3 的 appearance state/callback/props及所有已授权新代码，**不能把 old before/App 整文件拷回副本**。副本去掉 garden 隐藏条件后，settings/space/modal 原隐藏政策仍保持；不改宠物/空间行为、业务数据、关系/镜头/布局、两偏好键或依赖。

完整构建输入不能把73份历史差量清单当作全部项目。root须列清副本当前 src/tests、index/Vite/TypeScript/package与lock、公用静态资产、Tauri配置/Rust/build输入及图标等实际消费文件；源文件不能意外解析回工作区。不要复用工作区旧dist/target产物冒充副本结果。此要求是同源证明，不是新增构建框架或运行时功能开关。

## 必需证据与完成门

| 核查 | 责任/证据 | 缺证时结论 |
| --- | --- | --- |
| 冻结与最小排除 | root保存工作区输入、完整副本manifest、逐文件diff及八项排除表，副本绝对路径；核对新宠物/空间差量完整保留，工作区受保护内容未被删除/覆盖 | 不能认定副本范围正确 |
| 引用与版本闭合 | root静态核查副本src/tests/config无残留记录时光入口/依赖，App新props完整，五处0.7.0元数据一致；依赖/业务/Rust差量只限已授权项 | 不得构建最终交付包；新未知构建差量先上报，不能顺手修复 |
| 命令与产物来源 | root在同一副本跑完整npm test/build，再以副本Tauri配置构建Windows；保存cwd、命令、时间、完整输出/exit、源清单/依赖锁/hash及新dist/EXE/安装器版本/hash | 工作区含garden测试/build仅作集成补证，不能替代EXE证据 |
| 实际体验与回归 | root从副本对应预览/制品验收五角色、装扮/存储/取消与空间模型/镜头/选择/失败降级；确认无记录时光入口，并保留原编辑/数据等要求的证据 | 不得借工作区媒体宣称这份EXE体验通过；副本改源后重新验证 |
| 最终保护与fresh审查 | root只读核对真实库、明确原生/设备未测；fresh reviewer读完整副本差量、真实日志/媒体和制品身份，区分workspace与EXE范围；当前文档保留记录时光源事实并明确本EXE排除它 | 构建成功不等于完整原生/用户验收通过，缺证不能最终放行 |

记录时光测试被明确排除，副本测试数量会与工作区不同；验收依据是完整范围/日志和结果，不锁死旧测试数量。PWA/预览若可能加载旧缓存，root须核实实际消费的是副本新构建；不能仅凭相同版本号或窗口标题判断同源。

## 对 Gate 与架构的影响

**无新架构决策**。Q1仅关闭已存在的最终包装范围问题；在root隔离副本中撤去已知并发入口，不改变正式 S1/S2/S3 接口、资源owner、数据与验收目标。原LW/r2/Gate-2“Q1待答”保留历史身份，由最新澄清和本报告覆盖当前包装状态；不改写过去判断，也不阻断既获放行的产品实施。

没有在本次所读入口发现其它未知构建接线；完整副本尚未形成并核验，不能由这句话推定所有构建输入无未知差量。若副本必须改动这次未列出的入口/配置/依赖、丢失本轮增量或出现未知差量，root先保存事实并受控上报，停的是受影响包装步骤，不是重新请求常规开发许可。

## 缺失证据与后续

本次未运行产品测试/构建，无副本最终manifest、实际UI或新制品可供验收；这些证据仍由root承接。旧r2/Gate检查中的并发与参考读取失败继续保留，没有被此补充报告消除或借用成新通过证据。此轮只读命令退出0；不声称产品验证完成。

只读检索 `bfbeda` 的shell exit0中有一次未展开的`tsconfig*.json`造成rg IO error，不能将此子命令算通过；`3ada33`用两个实际文件名重查exit0，配置为src/vite.config入口。这次检索失败与字节级等同false均保留，不属于产品测试失败。

root按上述同副本闭环准备和验收，然后提交fresh Review(Impl)；授权已清楚，无需再问Q1或阶段许可。**最终制品放行：尚未验证。**
