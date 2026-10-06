# 五角色三维宠物低层方案（2026-10-06）

## 范围与对齐

输入为本目录 `research.md`、`clarifications.md`、`README.md`；规划路径，无独立 HL Plan。目标锁：在 E 盘产出五个可编辑 `.blend` 与可检查 `.glb`；晴小团在伙伴大展示及记录页浮层实时渲染并沿用既有装扮和行为；另四角色只在本机开发预览。反目标：第三方 `.blend/.glb`、贴图、截图及文件加载入口不进入公开 Web/Windows 制品；不改笔记、SQLite、备份或 `luma-pet-appearance` 四字段；不把小缩略图与记录时光变成 WebGL；不声称侧背与官方一致。所有既有未提交文件保持原状，不能整树还原或混合提交。

灰模视觉验收是**实施中的阶段验收点**：可先完成基础代码与晴小团原型；五角色精模要等对应三视图反馈再定稿。用户没有反馈时可交付可编辑灰模和技术原型，但不能宣布五角色造型验收完成。第三方角色即使视觉验收，也不改变发布授权边界。

### 核心链路总览

现状：`App.tsx` 持有唯一已应用 `PetAppearance`，`PetShowcase` 持有试穿草稿；`PetPortrait` 在大展示、浮层、缩略图和 `RecordCompanion` 插槽画 SVG；`usePetBehavior -> petPolicy` 决定交互/动画，浮层的拖动及键盘触发留在外层 button。改动落点：只在大展示与浮层的**图像槽**按角色与可用模型选择 3D 或原 SVG；Three 生命周期由新模块持有，不能让图像层接管试穿、应用、拖动或存储。记录时光、缩略图及第三方正式角色沿用 SVG。开发文件预览是独立的、编译时消失的入口；生产静态资源只含晴小团。这样以最少上下文覆盖新的实时形象，同时保持业务状态只有一个 owner。

| research 事实 | 实现锚点 | 验证锚点与口径 |
| --- | --- | --- |
| `PetPortrait` 被四类位置复用 | `PetCompanion.tsx` 两个大槽替换为选择器，其他 JSX 保留 | impl 静态 diff；root 实际看四类位置 |
| `petPolicy` 管交互与动态 | `petBehavior.ts:petPolicy` 输出原样消费；新场景只接收 `mood/animate/present` | impl policy 单测；root 实测失焦/休息/拖动/关闭动态 |
| 四字段本机外观 | `petAppearance.ts` 与 `App.tsx:applyPetAppearance` 不变 | impl 测旧测试；root 应用/刷新/试穿撤销 |
| Three 已安装，宠物无 canvas | 新 `Pet3DScene` + `Pet3DView`，两处有限挂载 | impl 构建；root Web/Windows WebGL 与资源观察 |
| Tauri 打包 Vite `dist` | `vite.config.ts`、`src-tauri/tauri.conf.json` 的原链不改，资源隔离另证 | root 扫 `dist` 与安装包实际内容 |
| 第三方造型背面未知 | E 盘五个源模型、三视图、动作清单 | root/用户视觉验收；未知保留未知 |

### 最小片段闭环

现状接口（`src/PetCompanion.tsx:69,180,212`）：`PetPortrait({ appearance, mood, animate })` 同时被 `<button className="pet-touch">` 里的浮层与大展示调用；`App.tsx:254` 把它直接传给记录时光。目标骨架：

```tsx
// 仅两个大槽：输入仍来自同一 PetAppearance 与 petPolicy。
<PetFigure3DOrSvg appearance={appearance} mood={pet.state.mood}
  animate={pet.policy.animate} present={pet.policy.present} />
// 缩略图与 RecordCompanion 继续直接使用 PetPortrait。
```

现状策略（`src/petBehavior.ts:38–44`）：`animate = interactive && motionAllowed && mood !== 'resting' && mood !== 'dragging'`。新画布的持续帧请求以这一布尔值为唯一业务门；`happy` 切换对应动作，静态情况下仍渲染一帧确定姿态。现状持久化（`src/petAppearance.ts:7–33`）：只解析四个键；新 3D 文件句柄与选择值不得写进去。这三段连起 App owner → 两入口图像 → policy → 渲染，同时说明未改 SVG 插槽与存储；足以核对主链，细节留给实现。

## 详细设计与任务顺序

### S1 模型资产与动作（T3，先于场景接入）

- **目标/输入输出**：使用已校验、可运行的官方便携版 `E:\Apps\blender-5.2.2-windows-x64\blender.exe`；脚本/手工在 `E:\pet-model-workbench\{nailong,chiikawa,hachiware,usagi}\` 制作四个第三方 `.blend/.glb`。原创源在 `assets-source/pets/xiaotuan.blend`，导出 `public/pets/xiaotuan.glb`。五角色每个有 `idle`、`happy` 动作和正、侧、背三视图，模型各自轮廓、材质与独立动画，不靠换色冒充。若采用 Blender Python 生成，脚本随对应源放置，方便再导出；第三方脚本也留 E 盘，不放仓库。
- **关键接口/结构**：glTF 约定场景内唯一角色根节点、命名 `idle/happy` clips；晴小团网格将身体/耳/叶/帽/星环/围巾/蝴蝶结分层或独立节点命名，便于局部换材质与显隐。比例与镜头以现有 240×230 正面 SVG 视效为基准；不为第三方角色伪造所谓官方背面。
- **顺序**：检查 Blender E 盘可执行→晴小团灰模三视图→用户视觉验收点→晴小团材质/装扮节点/动作与 GLB→四角色逐个灰模三视图、视觉反馈、精模/动作。第三方侧背按可见资料保守推断并在图旁标“原创补全”。灰模未被用户看过时可以继续技术接入，但最终造型状态只能“待验收”。
- **验收/证据责任**：impl 可通过 Blender 后台打开、导出再解析 glTF 场景、clip 名称和节点名，记录命令退出码、文件 SHA/大小到 `model_manifest.json`；缺证只称未校验。root 负责看 Blender GUI、三视图和动作播放，并请用户确认外形，截图只留本机第三方目录；未看则不宣称视觉通过。非 impl-safe 的用户审美判断不由程序测试代替。
- **失败与回滚**：Blender 下载或运行失败，保留已建脚本/源、记录阻塞，应用仍用 SVG。单角色导出坏时回退到上一版源导出；禁止用下载的第三方模型填缺口。
- **目标/反目标映射、作者体验**：五角色源/GLB 与差异动作对应目标；第三方资产留仓库外对应反目标。节点命名和单角色 manifest 使模型编辑者能直接定位身体/装扮/动作，避免由运行时代码猜网格序号。代码片段判断：新资产无旧代码分支，文字与明确命名合同足够。

### S2 晴小团场景生命周期（T2，依赖 S1 原创 GLB）

- **关键文件/接口**：新增 `src/Pet3DScene.ts` 导出 `createPet3DScene(canvas, modelUrl, onError)` 与 `setAppearance / setMood / setAnimate / resize / dispose`；新增 `src/Pet3DView.tsx` 管 `canvas`、`ResizeObserver`、挂载/卸载和加载态；`public/pets/xiaotuan.glb` 是生产唯一模型。场景模块懒加载 `three`、`GLTFLoader`、`AnimationMixer`，不改已有空间/年轮 scene。
- **目标形态**：单视图单 canvas，透明背景、正交或稳定透视镜头、柔和灯光。通用加载合同只要求可显示的根节点及命名 `idle/happy` 的动作；缺失则回退对应 SVG。原创晴小团额外声明装扮节点合同，`setAppearance` 改变其 body palette、head/accessory 节点显隐，始终以草稿或已应用值为输入，不自持第二份外观。开发模式的另四角色仅加载自己的形体和动作，不要求晴小团的装扮节点，仍由现有 SVG/试穿数据控制正式体验。`setMood` 将 idle/happy/resting/dragging 映射到对应 clip 或确定静态姿态；`setAnimate(false)` 停止 RAF、mixer 时间和其他连续运动，但重新渲染一帧；`true` 后恢复。WebGL context 创建失败、GLB 下载/解析失败、缺相应合同所需 clip/节点都调用受控错误回退 SVG，不让错误吞掉外层 button。
- **资源边界**：组件卸载、角色切走、模型 URL 切换时取消 RAF/待加载回调，销毁 mixer，遍历 dispose geometry/material/texture，调用 renderer.dispose，移除 ResizeObserver；开发 object URL 在加载完成/失败/换文件时 revoke。隐藏/失焦但组件仍挂载时停连续 RAF；展示及浮层同时存在时各最多一个上下文，页面切换后不可遗留旧上下文。加载中先画 SVG，不出现空白按钮。
- **验证与责任**：impl 编译、场景纯策略测试和 mock 加载/卸载测试，记录日志与 exit；缺证不能声称生命周期正确。root 在真实浏览器/Tauri 检查两画布、切角色/离页/隐藏后的 RAF 与 WebGL 上下文、WebGL 不可用回退、浅深主题与不同尺寸；记录屏幕及性能观察，未实测不声称帧率改善。
- **失败/回滚、作者体验**：错误时保留现有 SVG，回滚仅删除两处 3D 槽引用与新模块/原创资产，原 UI 与外观值仍在。新场景只管理绘制，`petBehavior` 仍管理交互；职责一眼可查。触发代码片段：本包引入与旧策略的接口连接，已在“最小片段闭环”提供现状与目标骨架。

### S3 两入口、试穿与开发模式预览（T3，依赖 S2）

- **关键文件/接口**：`src/PetCompanion.tsx:PetCompanion,PetShowcase` 的两个 `PetPortrait` 调用改为 `PetFigure3DOrSvg`；`src/pet.css` 为画布等比例大小、焦点/触控容器与静态回退提供样式；`src/App.tsx` 仍只把 `petAppearance` 给浮层/伙伴页，`renderCompanionFigure` 仍为原 SVG。`src/petAppearance.ts` 和 `src/petBehavior.ts` 不改契约。新增 `src/PetDevModelPicker.tsx` 只在 `import.meta.env.DEV` 的动态 import 分支加载，文件选择器不保存路径；生产构建不得出现该模块、入口文案或第三方模型文件。
- **目标形态/顺序**：纯函数按 `appearance.character === 'xiaotuan'` 选择原创 GLB；非原创生产一律 SVG。在开发模式，用户主动为当前非原创角色选单个本地 GLB 后，只在伙伴大展示提供临时 3D 预览；预览显示该 GLB 的原色造型及 idle/happy，不套用晴小团装扮节点。开发预览 UI 明示「本机模型预览；配色和装扮暂不作用于三维模型」；配色、头饰和配件仍只作用于原 SVG 正式体验；浮层第三方仍 SVG，刷新/离页撤销对象 URL。开发预览逐角色检查奶龙、吉伊、小八、乌萨奇的根节点、idle/happy 可播放、画布实际显示模型且未静默回退 SVG，并检查切换和失败回退，不能只用一个模型代替四个。晴小团在两入口同时走 3D。试穿 `draft` 马上驱动晴小团展示，应用后 App 唯一 owner 驱动浮层；撤销、恢复原装、保存失败文案原样保持。缩略图与 `RecordCompanion` 原 JSX 保持；不能把 `PetPortrait` 全局替换。外层触控 button、拖动、keyboard click、ARIA 不迁移到 canvas。
- **状态/兼容**：选择文件是会话内临时状态，不进入 appearance、LocalStorage、笔记、备份或 Tauri API。开发文件加载失败显示原角色 SVG 和可读错误，不改变试穿/应用。晴小团 GLB 没加载好仍显示其 SVG。新图像层无点击 handler，避免双触发。
- **验证与责任**：impl 验证 `npm test`、`npm run build`、产物 JS 搜索开发入口/第三方 asset 和四字段存储回归，保存完整日志+exit；缺日志为未验证。root 手测两入口的轻触、拖动、休息、试穿撤销/应用/刷新、失焦/模态/减少动态、窄屏浅深主题，开发模式逐个选择四 GLB，生产 UI 无选择器；原生/人工结果不得由 impl 代称。若 3D 回退则 UI 仍可用，但不能声称 3D 目标通过。
- **失败/回滚、作者体验**：3D 槽失败自动回 SVG；如主链回归，可只撤两处槽引用。保留原草稿与动作 hook，让作者仍在单个 `PetShowcase` 读完试穿逻辑。触发代码片段：已有分支替换，见上方现状/目标 JSX；Gate-2 需重点复核生产门控是否真实被 tree-shake，而非仅 CSS 隐藏。

### S4 文档、打包与独立核验（T3，依赖 S1–S3）

- **关键文件/接口**：同步 `README.md` 的宠物真实能力、`CHANGELOG.md` 的本轮版本条目、`docs/Project.Progress.md` 的实际状态、`docs/Pet.Wardrobe.md` 的三维/二维入口边界；本目录 `README.md` 更新阶段状态及验证报告。`vite.config.ts` 若无需改变则保持；`src-tauri/tauri.conf.json` 的 `frontendDist=../dist` 保持。不得把原历史 0.7.x 成功记录改成本轮证据。
- **验收与责任**：impl 自证文档与源码事实一致、`npm test`、`npm run build`，记录完整输出/退出码和允许差量清单。root 独立从同一冻结源构建 Web 与 Tauri Windows，实际运行两端；扫 `dist`、安装包及发布目录中的名称、GLB、贴图、截图及开发入口，并做原创晴小团加载、四第三方 SVG、功能与资源观察。独立 fresh reviewer 只读实际 diff、产物扫描与完整日志，输出协议/业务结论；缺实际安装包证据只能写“原生未验证”。
- **发布与回滚**：若扫描发现第三方资产/入口，停止发布并从仓库外资产与 dev import 边界查源，重新构建扫描，不直接删除未知工作区文件。构建失败保留日志，发布源不扩大到既有混合工作区。回滚由单独明确归属的改动恢复 SVG 两槽与原创 GLB 引用；不执行 `git restore/reset/clean` 清理既有未知修改。
- **目标/反目标、作者体验**：本包证明原创公开可用、第三方不外发和笔记数据不动；文档用“本机预览/公开包”直白措辞，报告区分已测、失败、未测。代码片段判断：文档增量与证据矩阵已说明插入位置，不需复制大段历史文档。

## 风险、触发对齐与门禁

| 风险/U 点 | 处理与降级 |
| --- | --- |
| U1 Blender 官方便携版在 E 盘无法运行/脚本 API 不同 | S1 先核版本与后台最小导出；失败记录，不用假设完成 |
| U2 官方公开页没有侧背与绑定 | 灰模三视图标注补全，用户视觉验收；绝不宣称官方准确 |
| U3 多 canvas 与 Tauri WebView2 的内存/丢上下文 | 限两个入口、懒加载、停 RAF、dispose、真实 Web/原生观察；失败回 SVG |
| U4 Vite/PWA 将 dev 资源或路径收入 dist | 编译时分支+动态 import；`dist`、SW precache、安装包逐项扫描；失败阻止发布 |
| U5 混合工作区及历史文件 | 逐文件归属清单、受控差量；不清理、覆盖或整包提交 |

事件触发对齐留痕：S1 灰模视觉反馈、Blender/导出异常；S2 WebGL/性能新风险；S3 门控或外观存储漂移；S4 从 impl 到 Review(Impl)/发布阶段切换，均在本目录报告中记录输入、决定和对应差量。本轮规划没有未回答的阻塞问题：用户已定五角色、本机与公开边界，具体画布/文件位置是可逆技术决策。若实施时出现多项新的范围/验收/回滚不确定，按 P0→P1→P2 批量提出 `【DELEGATE_QUESTION】`，模板为“问题/影响阶段/2–4 选项及推荐/答复格式 Q1=A”；不得悄然改基线。

Gate-1 由本计划作者现在按 T3 Required Set 做存在性自检；Gate-2 由独立 review_plan 后、coordinator 复核后才可实施。Gate-2 应核主链与 research 映射、关键接口、上述现状/目标片段、目标锁/反目标、验证责任、作者阅读成本及生产资产隔离。任一失败回到本文件修订并重审；不能凭计划代替实际测试。没有需迁移的数据，开发文件选择会话结束即撤销。

## Gate-1 自检

- 目标锁、反目标、不影响项：已在首节及 S1–S4 分别落下。
- T3 跨模块接口、四字段兼容、资产隔离和 SVG 降级：已落下。
- 主要工作包 S1–S4 均含目标、输入/输出、路径与接口、顺序、验收、回滚、impl-safe 与 coordinator 证据、缺证约束、作者体验。
- 核心链路、research 映射、最小代码片段闭环：已落下；主链可顺读。
- 双阶段门禁、风险、事件对齐、批量提问触发：已落下。
- 本轮 Gate-1：PASS；仅表示方案具备独立 Gate-2 输入，不能据此开始实施或宣布用户造型验收。
