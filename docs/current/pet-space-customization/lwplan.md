# 宠物角色、装扮与空间外观低层计划

2026-10-05；规划路径，T3 跨模块。本文是目标合同，尚未实施。上游为最新 `clarifications.md`、用户原文/新增反馈、`research_characters.md`、仍适用的 `research.md`/`research_industry.md`；本轮实际重读宠物、空间和当前 App。Readiness r2 最终 PASS 仅允许角色/空间进入 LW，不放行未知并发功能或最终 EXE。**Gate-2 独立评审及 root 复核前禁止实施。**

## 范围与对齐

- G1：保留晴小团，新增奶龙、吉伊、小八、乌萨奇五个可辨识角色与不同 idle/happy；本机免费装扮铺支持预览、撤销、应用、恢复原装，大小展示及刷新共享已应用值。
- G2：真实三维记录节点支持球/晶体/方块、三背景及光晕/流光；关联/时间共享已应用外观，保留 UUID、坐标、分组/完成/度数、关联证据、镜头与选中。
- G3：仅新增两份本机偏好，业务模型、编辑/排序/搜索/二维图、SQLite/备份/AI不变；root 承接新验证、当前文档、同源 0.7.0 制品与 fresh review。
- A1：不以身体换色或同一动作改名冒充五角色，不把试穿视为已应用，不称第三方设计原创/官方动画/三维宠物；A2：不加支付、帐号、下载资产、网络/关系引擎，不丢未知工作；A3：不由外观重建 renderer/camera/layout，不加每记录 geometry、第二 RAF、灯光/重后处理或性能夸称。
- 三个包仅用现有依赖。原晴小团路径、比例和默认色保留；新增角色允许独立 `PetCharacters.tsx`，不借功能重构原身体。许可证/参考未知沿研究保留：代码重绘不是第三方角色设计原创，用户指定角色不等于获得对外商业素材许可。

## 核心链路总览

现状是 App 的动态/模态政策分别进入常驻 PetCompanion 和 lazy SpatialNoteMap；后者选择 PetShowcase 或 MapView，MapView 建立单 scene owner。scene 接收派生 layout，实例顺序绑定 UUID，原 scheduler 负责全部绘制。当前无外观提交链。

宠物主链：`safe read → App pet applied → PetShowcase draft/可见试穿 → Apply先setApplied再单键write → bool消息 → PetCompanion/大图共享已应用画像 → 刷新读取`。大预览与小浮层的四态/会话位置仍分别属于各展示实例；草稿不驱动小浮层。
空间主链：`safe read → App spatial applied → MapView draft → setAppearance/invalidate预览 → Apply先setApplied再单键write → 两模式共享applied → 刷新读取`。不触碰关系/布局/镜头；取消回applied，离开MapView丢draft，背景与模型使用同一draft。

分层原因：App 唯一拥有应用值，展示组件唯一拥有草稿，纯数据模块拥有白名单/单键读写，lazy scene 拥有 Three 资源。编辑器、store/desktop/Rust业务、graphGeometry、布局/关系 Worker、原调度器与旧测试只读保护；不把外观塞进业务数据或通用配置引擎。

| research 事实 | 实现锚点 | 验证口径/责任 |
| --- | --- | --- |
| 原 PetPortrait 固定 240×230、useId 渐变隔离、大小共用；身体含耳/脸/叶片 | S1 PetPortrait 保留原分支，配件入身体组，新增独立身体 | root 五角色/长耳/配件大小截图；源码审查只能证结构 |
| 四态、1400ms、blur/owned capture 取消已有 | S1 usePetBehavior 增角色变化 cancel；原 pointer handler 不重写 | 原 petBehavior 回归 + root 拖动/失焦/模态/角色切换，不用 CSS 名称证明动作 |
| 三小只官方名字可核实，完整参考像素未见；奶龙仅一视图 | S1 名称与轮廓按角色研究 B/D，动作自主设计 | 保留未知；root 实际画像/动作和用户验收，非官方严格复刻 |
| 节点/halo 同用 sphere；实例释放不代替 geometry/material 释放 | S2 固定三 geometry 池，halo 引用池中 sphere，独立明确 dispose | 真 Three CPU 边界/切换/释放测试；GPU/监听生命周期由 root |
| instanceId→layout.nodes UUID；相机和 setLayout/setTheme 有独立职责 | S2 setAppearance 只替换 geometry/光效；S3 effect 不入 owner 依赖 | CPU 拾取和 root 旋转后切模型/过滤/选择/编辑 |
| 单 RAF、30fps/dt/DPR/128→32 粒子预算；预算不是 GPU 实测 | S2 保留 scheduler，仅 gate flow，可静态 invalidate | 原 runtime 回归；root 连续切换/500规模/失败重试，长期耗电未测 |
| 当前 App 已有非本轮 RecordGarden 接线；原73 before不是最新宿主 | S3 当前 App 最小增量、保留 lazyGarden/navigation/render/hidden | root 按两组基准区分本轮差量/并发输入；最终包装 Q1 待答 |

## 唯一共享接口与数据合同

以下是目标 TypeScript 骨架，供两 owner 共用；不是源码 patch。片段一（新纯模块）给出白名单/两键，片段二（App/展示）连接预览、提交与失败，片段三（scene）闭合共享 geometry、拾取/资源边界；这组片段覆盖整条主链，而非仅局部示意。

```ts
// src/petAppearance.ts: pure data; no React/Three/runtime side effects.
export type PetCharacter = 'xiaotuan' | 'nailong' | 'chiikawa' | 'hachiware' | 'usagi'
export type PetAppearance = {
  character: PetCharacter; palette: 'cloud' | 'mint' | 'peach'
  head: 'none' | 'beret' | 'halo'; accessory: 'none' | 'scarf' | 'bow'
}
export const PET_APPEARANCE_KEY = 'luma-pet-appearance'
export const DEFAULT_PET_APPEARANCE: PetAppearance = { character: 'xiaotuan', palette: 'cloud', head: 'none', accessory: 'none' }
export function parsePetAppearance(value: unknown): PetAppearance
export function readPetAppearance(storage?: Pick<Storage, 'getItem'>): PetAppearance
export function writePetAppearance(next: PetAppearance, storage?: Pick<Storage, 'setItem'>): boolean
export const PET_CHARACTER_NAMES: Record<PetCharacter, string> // 晴小团/奶龙/吉伊/小八/乌萨奇
// src/spatialAppearance.ts: same pure boundary; no import of spatialScene/spatialModels/Three.
export type SpatialAppearance = {
  shape: 'sphere' | 'crystal' | 'cube'; background: 'mist' | 'aurora' | 'plain'
  glow: boolean; flow: boolean
}
export const SPATIAL_APPEARANCE_KEY = 'luma-spatial-appearance'
export const DEFAULT_SPATIAL_APPEARANCE: SpatialAppearance = { shape: 'sphere', background: 'mist', glow: true, flow: true }
export function parseSpatialAppearance(value: unknown): SpatialAppearance
export function readSpatialAppearance(storage?: Pick<Storage, 'getItem'>): SpatialAppearance
export function writeSpatialAppearance(next: SpatialAppearance, storage?: Pick<Storage, 'setItem'>): boolean
```

parse 输入是解码后的 unknown；非对象、数组、缺字段、多/未知字段、错误枚举/类型均返回完整默认的新副本，不携带未知 URL/HTML/CSS 字段，不做部分合并。valid 返回仅白名单字段的新对象，`false` 不能按 falsy 变成 true。read 只 getItem/JSON.parse/parse，缺值或坏 JSON/不可读回默认；默认 localStorage 的取得也在 try 中，Node 测试用可选 fake Storage。write 规范化为上述四字段 JSON，每次 Apply 仅一次对应键 setItem，成功 true、异常 false；不 clear/removeItem、不自动回写读到的坏值、不 mount/useEffect 持久化、不 storage-event 同步。

```ts
// Existing PetPolicyProps stay unchanged; exports in src/PetCompanion.tsx.
export type PetCompanionProps = PetPolicyProps & { appearance: PetAppearance; shown: boolean; hidden: boolean; onHide(): void }
export type PetShowcaseProps = PetPolicyProps & { appearance: PetAppearance; onApplyAppearance(next: PetAppearance): boolean }
// Added to src/SpatialNoteMap.tsx SpatialNoteMapProps, alongside all existing props.
appearance: SpatialAppearance
onApplyAppearance(next: SpatialAppearance): boolean
petAppearance: PetAppearance
onApplyPetAppearance(next: PetAppearance): boolean

// src/App.tsx: unique owner; no Three import from either appearance module.
const [petAppearance, setPetAppearance] = useState(readPetAppearance)
const [spatialAppearance, setSpatialAppearance] = useState(readSpatialAppearance)
const applyPetAppearance = (next: PetAppearance): boolean => {
  const value = parsePetAppearance(next)
  setPetAppearance(value) // live apply even when the following write fails
  return writePetAppearance(value)
}
// Spatial uses the identical order with its own parser/state/writer/key.
// PetShowcase and MapView: draft is local, options only setDraft(next).
const saved = props.onApplyAppearance(draft)
setSaveMessage(saved ? successText : failureText)
// Cancel: setDraft({...props.appearance}); neither Cancel nor Reset writes.
// Pet Reset: setDraft({...DEFAULT_PET_APPEARANCE, character: draft.character}).
// Spatial Reset: setDraft({...DEFAULT_SPATIAL_APPEARANCE}).
```

PetPortrait 私有入参改为 `{appearance: PetAppearance; mood: PetMood; animate: boolean}`。新 `PetCharacters.tsx` 导出 `PetCharacterBody({character,mood}: {character: Exclude<PetCharacter,'xiaotuan'>;mood:PetMood})` 与 `PetAccessories({appearance}: {appearance:PetAppearance})`；新增身体组件不创建行为 hook、计时器或 RAF。名称/四态反馈按 `Record<PetCharacter,Record<PetMood,string>>` 明列，可在 S1 模块局部常量，使用纯名字 export 供空间入口按钮显示当前角色。

PetShowcase 草稿包含角色；MapView 草稿包含空间外观。两者初始化复制 applied，applied prop 变化只同步 draft；写结果提示不得被随后同步 effect 擦掉。新预览清旧提示；Apply 不以 draft==applied 永久禁用，保存失败后能再次点击重试。成功消息分别为“装扮已穿上，已保存在本机。”“空间外观已应用，已保存在本机。”；false 消息分别为“装扮已在本次使用中生效，但未能保存；刷新或重启会回到上次保存的装扮。”“空间外观已在本次使用中生效，但未能保存；刷新或重启会回到上次保存的外观。”消息为 role=status，false 不宣称保存/自动回滚 applied。

所有选项与三套组合卡片显示实际静态 SVG/模型缩略表示；预览明确“试穿中/预览中”，按钮“穿上这套/应用外观”“撤销试穿/撤销预览”“恢复原装/恢复默认”。三套装扮起点只改 palette/head/accessory，保留所选 character。宠物“恢复原装”保留当前draft.character，只把palette/head/accessory归默认；初始/坏存储仍完整DEFAULT xiaotuan。空间Reset才是整份空间默认草稿；均需Apply才入状态/写键。离开/刷新草稿消失，同窗口刷新/桌面重启读上次成功值，设置的小宠物开关仍独立原键。

## 工作包、独占路径与实施顺序

先 Gate-2；S1/S2 可独立编码，接口以本文冻结；S3 在两纯模块与必需 props/export 就绪后接线，最终共同 build。S1 不碰 App/SpatialNoteMap/元数据，S2/S3 同一个 owner 顺序编辑；不将暂缺调用方接线的类型失败改成 optional props 掩盖。包内纯测试先运行，集成前 build 若失败按真实缺接线报告，最终类型/build 不能省略。

| 包/唯一 owner | 可写路径及首读锚点 | 输入→输出/依赖 |
| --- | --- | --- |
| S1 `/root/wardrobe_research` | `src/petAppearance.ts`、`src/PetCharacters.tsx`、`src/PetCompanion.tsx` 的 PetPortrait/usePetBehavior/两 export、`src/pet.css`、`tests/petAppearance.test.mjs` | policy+appearance→五角色画像/交互+draft；只依赖原 petBehavior，S3 消费接口 |
| S2 `/root/wardrobe_industry` | `src/spatialAppearance.ts`、`src/spatialModels.ts`、`src/spatialScene.ts` 的 create/rebuild/setter/dispose、`src/spatial.css`、`tests/spatialAppearance.test.mjs`、`tests/spatialModels.test.mjs` | layout+policy+appearance→共享模型与原 scene；S3 MapView 消费；无新依赖 |
| S3 `/root/wardrobe_industry` | 当前 `src/App.tsx` 的 lazy入口/space分支/浮层，`src/SpatialNoteMap.tsx` 的 props/MapView effect/控件；`package.json`、`package-lock.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml`、`src-tauri/Cargo.lock` 的自身版本 | S1/S2→两 applied state/完整接线/0.7.0元数据；App/版本只有此 owner |

root 唯一维护根 README、CHANGELOG、Project.Progress、Spatial.Experience、Release.Verification.0.7.0 及 feature 状态/评审文档；历史 0.6.0 证据保留。本文当前只写 lwplan；实现报告路径由正式实施派单授权，不能提前写已完成事实。

### S1：五角色与本机装扮铺

目标/映射：G1、G3/A1–A3；改动理解锚点是原画像与 usePetBehavior 取消顺序，目标形态是保留晴小团身体、四个独立 SVG 身体、一个画像/装扮入口和原统一政策。上节 props/Apply 骨架是本包必填片段；不拆五套行为状态机。

1. 先纯白名单/名字/存储与测试，再新增四角色身体和装备组；PetPortrait 外层 useId/影/光/睡眠标记沿用，原晴小团身体 paths 不抽出、不重画，默认渐变保持；palette 只有限改变原渐变 stops。其他角色固定本色，palette 只改装饰色，UI 有此说明。
2. 各角色本色/识别/动作明列：晴小团淡紫青、双耳双叶，原呼吸/招呼；奶龙黄、凸口鼻大眼白肚皮小手短腿，肚皮起伏+摇摆/跺脚；吉伊白、短圆耳粉腮，轻晃+耳抖/害羞挥手；小八白蓝、蓝耳/分叉头纹/猫尾，探头+摆尾/摇爪；乌萨奇米黄、长兔耳粉腮，弹跳+耳抖/雀跃。造型取舍源于角色研究，动作是项目设计；不用同一关键帧换名字。
3. 新角色分别设置耳/腹/尾/爪 transform-origin；配件随 `.pet-body`，帽/星环不得盖识别脸、蓝纹或长耳，围巾/蝴蝶结保持 viewBox 内。CSS 用 `data-character` 限定，原 sunny 身体动画只属于 sunny；idle/happy 才自动运动，resting/dragging 是静态姿态，原 reduced-motion 覆盖全部子层。
4. usePetBehavior 接收当前展示角色，角色变化的 layout effect 调现有 cancel：清1400ms短反馈、释放 owned capture、回休息/idle；保持 resting/会话位置，不 key-remount 常驻组件。大预览变 draft角色也取消旧反馈；小层仅 applied角色变化取消。保留 pointerId所有权、6px判定、cancel/lostcapture/blur/modal/隐藏取消及键盘detail0操作。
5. 大预览增加五角色/配色/头饰/配件/组合卡和提交控件；名称、介绍、反馈、休息/触摸 aria-label 跟当前展示角色。小层显示 applied 名称/画像；空间宠物按钮跟 applied 名称。装扮控件 native button/aria-pressed/分组标签与原 policy 同步，不引入新快捷键/浮层遮挡。

impl-safe：新增 `node --test tests/petAppearance.test.mjs tests/petBehavior.test.mjs`，覆盖五角色/全部有限字段、完整默认回退、坏 JSON/未知键/值/类型/缺项、读异常、写异常/配额、仅一键一次写、两个模块无互写；不得以存储单测宣称 DOM/动作验收。集成后 `npm run build`。证据由 S1 owner 报真实命令、完整输出/exit与源码 SHA 至派单报告及 TEMP 的 S1 日志；缺命令/退出码不交已验证包。

root 承接：逐个五角色在大小图、idle/happy/休息/拖动、浅深/390px/减少动态/失焦/模态下实测；角色切换中旧招呼/捕获不续播，位置保留；每类装备无遮挡、Tab/ARIA准确；未应用/取消/应用/Reset需提交/离页/刷新/存储失败可重试。动作媒体/截图归 root，缺现场证据只写未测。

作者体验：一句说明本色/装饰色、清楚试穿与保存结果，保持原操作可发现性；源码按人物图层与具体动作读得懂，不做角色注册框架。验收是以上合同+纯测试+集成build+root对应证据；回滚仅撤自己的S1差量与新增文件，由root协调S3接口恢复，不覆盖原Sunny/他人文件，不清业务或偏好。

### S2：三维模型与氛围资源

目标/映射：G2、G3/A1–A3；先看 rebuild 的矩阵/UUID顺序与 dispose。目标形态是三份固定共享节点 geometry、sphere halo、一个 setAppearance，无新 renderer/关系/RAF。几何用途来自 Three primary 及 installed research，球保留原120 triangles、晶体8、方块12；三角预算不代表 GPU 表现。

```ts
// src/spatialModels.ts: loaded only by spatialScene inside the lazy spatial entry.
export type SpatialModelPool = {
  nodes: Record<SpatialAppearance['shape'], BufferGeometry>
  haloSphere: BufferGeometry // exactly nodes.sphere; no fourth node/halo geometry
  dispose(): void // idempotent; disposes the three owned geometries once
}
export function createSpatialModelPool(): SpatialModelPool
export function setSpatialModelGeometry(mesh: InstancedMesh, geometry: BufferGeometry): void
// Target helper: mesh.geometry=geometry; computeBoundingBox(); computeBoundingSphere().
// It preserves matrices, instanceColor, instance order, and does not dispose the old shared geometry.
// src/spatialScene.ts: add required options.appearance and this exported owner method.
setAppearance(next: SpatialAppearance): void
// disposed => return; shape changed => cancel owned gesture without moving camera/target,
// setSpatialModelGeometry(nodesMesh, models.nodes[next.shape]); halos keep haloSphere;
// set halos.visible=next.glow; flow visibility=next.flow && currentPolicy().continuous;
// retain layout/UUID/selection/material group colors; scheduler.invalidate(), never fit/rebuild.
```

1. pure spatialAppearance 先落白名单/默认/安全单键合同；geometry 池仅在 owner 创建一次：`SphereGeometry(1,10,7)`、`OctahedronGeometry(1,0)`、`BoxGeometry(2/√3,2/√3,2/√3)`，三者局部包围半径统一1；cube共享非索引化表面以便每个三角面颜色恒定，临时 indexed box 转换后立即释放。不按note分配，不在 setter 新建。haloSphere复用 sphere但 halo材质不开vertexColors。
2. 为晶体/方块提供有限灰阶顶点亮度：同面顶点相等，按面法线方向选择 .72/.86/1，球全部白；node MeshBasicMaterial开启vertexColors与原instanceColor相乘，保留 groupColor、主题lerp和度数/完成radius语义。用面亮度让统一基本材质下棱面可辨，不加灯/纹理/后处理；root肉眼验收仍必需。
3. 创建/rebuild 使用当前 shape 的共享 geometry，原节点矩阵/颜色填入顺序不变；初建与每次 shape替换更新 InstancedMesh包围盒/球，保留UUID映射与只对nodesMesh拾取。setAppearance cancelowned手势，不能fit/重新select生成高亮/触发setLayout或关系；核对既有cancelGesture可能的阻尼尾量，若需保护以当前camera.position/controls.target快照在取消后还原，不引入相机重建。
4. glow只改变halo可见性；flow只改变原粒子可见/更新门控，与continuous政策相与，暂停/减少动态仍静态可操作。其余autoRotate政策和single scheduler不改；flow false不等于暂停相机。背景由 `.spatial-stage[data-background]` 三组有限CSS表达，plain足够纯净，CSS不能覆盖canvas/文字降级控件；不生成Three背景纹理。
5. dispose保持先失效/停RAF/断controls/capture/监听/observer再释放instanceMesh、三模型池、原动态geometry/material/texture/renderer；三模型不再重复进入原geometries集合，池dispose幂等。layout重建只释放旧instance及动态geometry，不dispose共享池；初始化/绘制/context-loss异常沿原fail→dispose→failed，retry才新owner。

impl-safe：`node --test tests/spatialAppearance.test.mjs tests/spatialModels.test.mjs tests/spatialLayout.test.mjs tests/spatialRuntime.test.mjs`。`tests/spatialModels.test.mjs`必须导入并调用生产`createSpatialModelPool/setSpatialModelGeometry`，禁止在测试内重建同构替身。新增真实Three CPU断言：三池identity固定/halo引用sphere；位置与灰阶有限、三模型边界≤1+浮点容差且面亮度确有差别；重复切模型不新分配/不dispose共享geometry，原matrix/instanceColor不变、包围体更新；用Raycaster在两个已变换实例逐形状检查instanceId→既定UUID、不拾halo；dispose监听确认池中各geometry只一次、二次dispose不重复。不要mockThree来证明GPU/真实owner释放；原scene cleanup源码审查+root现场生命周期另列。集成build同S3；S2 owner 提交新测试完整exit/输出/SHA至派单报告/TEMP S2日志，CPU缺证不认模型逻辑已验证。

root 承接：三模型画布肉眼可辨和正确边缘命中，旋转/缩放/定位后预览、Apply、撤销不重置镜头/选中；两模式/filter/allUUID/分组色/实虚线/度数大小/文字选择编辑不变；三背景/两开关/主题/390px；连续切换、StrictMode、失败重试、context-loss（能操作时）及500规模。媒体/日志由root落盘，长期GPU/触屏/耗电等缺现场只能未测。

作者体验：模型/氛围中文选项及预览结果直接可见，保留相机/观察窗顺序，不显示geometry/JSON术语；代码保留小型专用池和setter，不升级框架。验收为新CPU测试/原回归+build+root模型资源证据；异常继续文字降级，Reset仅草稿；回滚只S2自己的差量/新模块，由root同步S3合同，禁止复制旧App或改关系/共享色模块。

### S3：App、空间草稿与版本集成

目标/映射：G1–G3/A1–A3；首读App已有两lazy入口、空间分支/小层与MapView owner effect。目标形态是App两state/callback、MapView一draft/setAppearance effect、全部必需props和一致0.7.0版本；上节完整合同片段已覆盖接线，不让展示owner顺手写偏好。

1. 在**当前 App**新增两安全 lazy state initializer/callback，给常驻PetCompanion传petAppearance，给SpatialNoteMap传两值/两callback。保留当前RecordGarden import/lazy、View union、导航、render分支、及`hidden=settings||space||garden`；不改原notes/transactions保存、theme/布局、pinnedtag等旁路问题。
2. SpatialNoteMap pet分支传PetShowcase完整合同，入口名来自PET_CHARACTER_NAMES。MapView建立draft/提示/模型氛围控件，owner初建options.appearance用latest.current的draft；新独立effect只`ownerRef.current?.setAppearance(draft)`，owner effect仍仅mode/attempt，不把appearance或callback加成重建依赖。关联↔时间保留MapView草稿及顶层selectedId；去宠物/离space卸载MapView草稿，applied不变。
3. 已应用外观在关联/时间共享；背景data属性跟draft，状态文案把flow与原motion/pause区别说清；失败3D仍可预览背景/调整偏好并保存，文字选择/编辑/旧图/重试继续可用，retry取最新draft。控件禁用依据canOperate，实际相机按钮沿canCamera；不把无GPU当业务不可用。
4. 必需props接线后运行全量 `npm test`、`npm run build`；检查App仅导入纯petAppearance/spatialAppearance，build chunk中Three仍属于空间lazy路径。元数据只改五文件的自身0.6.0→0.7.0：package-lock顶层和packages['']、Cargo.lock的qingjian项；不更依赖/脚本/其他crate、不运行桌面服务或原生GUI。root才构建新EXE。

impl-safe：S3 owner独立核对全部类型/exports、两callback单写顺序/false提示、lazy import链和元数据JSON/TOML/lock一致；完整npm test/build输出、exit和最终源码SHA记录派单报告/TEMP S3日志。现有并发 `tests/recordGarden.test.mjs` 可随全量命令执行但不能算本轮新增；其外部失败仅报告root，不越权修复。不以build或pure存储测试替代刷新/真实DB/EXE结论。

root 承接：从真实入口顺读“试穿→应用→大小同步→离页→刷新”、空间两模式/camera/选择保持、原settings/garden小层隐藏及modal/全量旧体验；另独立全量test/build、fixture隔离5186预览、新证据/文档/同源EXE构建与受控隐藏启动、真实SQLite两表字段只读前后核验。Q1答复和最终源冻结前不决定EXE是否包含并发模块，不在原工作区删模块以排除。EXE/PWA实际缓存、完整原生GUI/安装/触屏/读屏仍需实测或明确未测。

作者体验：同一“预览/应用”语言，两套保存结果不会误称成功；空间控件不抢编辑/相机焦点，导航保留并发当前事实；文档只描述实测范围。验收是S1/S2接口齐备、全量命令及root跨入口/制品证据；回滚仅本轮App最小diff/MapView/版本自己的差量，参考concurrent输入而非整文件old before覆盖；旧版忽略两新key，外观无DB迁移，不清键或业务数据。

## 验证与证据矩阵

| 目标/风险 | impl-safe owner/产物 | root/fresh 承接/缺证约束 |
| --- | --- | --- |
| G1/A1：五角色、本色、动作、装备、名称/ARIA、取消 | S1纯解析/存储与petBehavior回归、源码结构/exit/SHA | root逐角色现场动作/捕获/大小/缩屏媒体，缺则不能称五角色体验通过 |
| G1/G2/A2：草稿与applied、两键、错误读写 | S1/S2 fake storage真实读写失败断言；S3调用方/全量日志 | root未应用不写、Apply/Reset/false重试/离页刷新/重启；无现场不得称持久化端到端已验 |
| G2/A3：固定三geo、bounds、raycast、释放、单RAF | S2真Three CPU及原layout/runtime，S3 lazy chunk/import核对 | root画布/连续切换/失败/规模；fresh读owner dispose和日志；CPU≠GPU/长期指标 |
| G3/A2：业务及并发保护、元数据、制品 | S3唯一owner版本比对、两套源差量+新增源SHA | root独立test/build、真实DB只读/新EXE身份、当前文档；Q1未答不放最终包装 |

日志/fixture/源清单归 `C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004/`，新增日志按S1/S2/S3/root命名避免覆盖历史；实际UI截图/动图归允许的 `C:/Users/ZXL/.codex/visualizations/2026/10/02/01a0fc52-c082-7c00-b650-78e2c95b7cfa/`。报告记录命令、时间、exit、完整输出、源/制品SHA与明确未测，失败不得省略。fresh reviewer由root重新委派未参与实施者，审后源码变化须重新验证/复审；旧0.6.0结果不是新证据。

## 兼容、并发保护、风险与停机

原差量权威仍是 TEMP 同目录 `manifest.json` 的73项及 `before/`，不能换Git HEAD；本轮新文件独立列清。当前宿主附加保护 `concurrent-input/manifest.json` 九项和 `concurrent-input-r2/manifest.json` 对RecordGarden的替代一项，原manifest保持冻结；App输入SHA=`6859F3A5B06E83B890A4A5414085914923AE064EA0116E3623370E76976DD11F`/29469 bytes，RecordGarden增量SHA=`F51B5F3CF795D36FC7B3FA74E837FD3AF2921A7F0C770459647F7062F7ADDBA2`/8524 bytes。

八个并发只读文件为 `src/RecordGarden.tsx`、`src/RecordDayViews.tsx`、`src/RecordCompanion.tsx`、`src/recordGardenModel.ts`、`src/record-garden.css`、`src/record-day-views.css`、`src/record-companion.css`、`tests/recordGarden.test.mjs`；来源未知，仍可能外部改写。S3编辑App前重新核对当前输入，发现新差量立即报root记录/保护；不得恢复old before、顺修外部模块、冒认并发测试/功能已验收或整包提交。

| 风险/未知 | 缓解与关闭方式 |
| --- | --- |
| 原U1–U3范围/提交/存储口径 | 本文有限目录、draft/App/单键bool合同闭合设计；实施与root验证仍待执行 |
| 角色研究U1/U2参考像素/背面/官方动作未知 | 保留搜索描述与单视图边界，按自主SVG/动作取舍实现，不下载不补称官方严格复刻 |
| 角色研究U3/U4及原U6遮挡/动作/政策 | S1局部图层/专属origin及取消，root五角色大小/长耳/390px/减少动态/捕获媒体 |
| 原U4/U5几何尺度/拾取/颜色 | 半径归一+真Three测试+静态面亮度，groupColor与原radius不改；root画布/图例/选中；粒子主题色旧差异不顺修 |
| 原U7资源/StrictMode/context loss/长期GPU | 固定池/幂等owned dispose/原singleRAF与失败文字降级；root可操作故障/多轮/规模，长期耗电等未测保留 |
| 原U8真实EXE/业务库/PWA偏好 | root同源构建/版本hash/受控启动/只读DB/刷新；未测不得称原生全部通过 |
| 并发包装Q1未答及外部写入 | 不阻断S1/S2/S3，阻断最终制品范围；答复后root重核授权/源冻结，不把沉默当许可 |

失败降级：读坏偏好回默认且不写业务；写失败保留session applied并告知可重试；3D失败沿原文字降级/retry；关闭动态仍静态可操作。若出现下载资产、支付/网络/许可、业务schema/关系、不可逆操作或核心目标改写，停止受影响步骤向root分流；其他已授权可逆工作继续。只做授权文件增量，无Git/DB/native/UI操作。没有需要新架构决策的迁移，两个key无旧数据迁移。

## 事件对齐、澄清与两道 Gate

事件触发对齐留痕位置：本节及root维护的clarifications/评审报告。已对齐三件事：角色增量替代旧原创-only判断；App/RecordGarden并发身份按9+1快照保护，最终Q1分离；模型采用有限灰阶面亮度且不破坏lazy/分组色。LW→Review(LW)本次阶段切换须root记录；实施发现新假设/风险/并发变化即时报root，不设次数阈值。

批量提问模板与优先级组织方式：本轮角色/空间规划未触发新委托问题，因为最新基线/r2已唯一明确；现有Q1由root保持待答，仅最终包装需要答复。后续若真阻断范围/验收/回滚，向root一次按P0阻塞、P1高风险、P2优化组织，不递归委派：

```text
【DELEGATE_QUESTION】
需要用户确认：Q1=<具体范围/约束/验收/回滚问题>
优先级：P0|P1|P2；影响阶段：LWPlan|Review(LW)|Impl
选项：A) <推荐及理由>；B) <权衡>（必要时C）
请一次性回复：Q1=A ...
```

Gate-1由LW作者产出后自检T1十三项/T2输入输出与边界/T3接口依赖、兼容和停机；不以任务数打分。核对目标锁/反目标映射完成、验证责任分层已落盘、证据产物/责任归属/证据不足约束已落盘、作者体验门证据已提供；核心主链/research映射/片段闭环、各包关键文件函数/目标形态/顺序/验收/回滚/依赖完整。本文包含所有项，实际内容自检命令/exit由交付简报回传；该自检不表示任何产品测试或Gate-2结果。

Gate-2由root委派独立review_plan主检、root复核：顺读纯模块→App应用→draft→bool保存→大小/scene→fresh证据，逐包检查结构锚点/片段、取消顺序/lazy、模型池/bounds/owned dispose、验证三元组/作者体验/并发保护及Q1边界。任一必备缺失或合同矛盾即 `LWPlan→Review(LW)→LW修订` 回环，不进impl；口径不唯一先报委托问题。Gate-2 PASS才由root正式派S1/S2/S3，无需重复用户许可；最终包装仍受Q1与源冻结门约束。

## S4：工作区月历共享伙伴（2026-10-05正式增量）

#### 本轮修订说明

[修订: S4-R1] 本节仅追加已授权的工作区月历桥接，保留上文S1–S3已实施支撑。输入为最新clarifications的“月历收尾移交”和source_materials/feedback_calendar_alignment_20261005.md；用户将另一窗口全部收尾交本窗口，原只读限制仅对下列明确路径放宽。Q1已答“先保留源码，本轮EXE只包含宠物和空间配置”，覆盖上文历史待答状态；工作区月历桥接不得进入发布副本。此处是待Gate-2的计划，不是已实施事实。

[修订: S4-R1] 目标映射：消费G1新增月历同一已应用角色/装扮和G3同源证据；G2空间保持，A1草稿不传播、A2数据/发布范围、A3不添计时器/RAF均保持。输入只有已应用PetAppearance、idle和最终动态许可；输出只有React画像和实际角色名。日期摘要、创建/回今天、隐藏/局部暂停归月历；不改日期/统计/分页、RecordDayViews、recordGardenModel、业务存储、版本、框架或依赖。

### 核心链路总览与事实映射

[修订: S4-R1] 现状：App持有两份已应用值，garden分支只传animate；RecordGarden合成局部暂停/visible/reduced，RecordCompanion渲染机器人和DOM日期摘要；PetPortrait私有且只消费appearance/mood/animate。目标主链一：原装扮Apply→App applied（保存失败仍会话应用）→garden插槽→同一PetPortrait；Showcase draft无出口，日期文字继续由月历计算。目标主链二：App三项宿主许可→月历局部暂停/visible/reduced/focused→卡片hidden→画像animate；只缩小许可，不让恢复焦点覆盖局部暂停。两链共享绘制，不共享交互控制器，所以无新storage/moodtimer/drag。

| [修订: S4-R1] 实读事实 | 实现锚点 | 验证锚点与口径 |
|---|---|---|
| PetPortrait第69行私有，props已为appearance/mood/animate | PetCompanion只加export，不移动/重绘身体 | impl核对仅出口差量；root五角色及附件画面，不以export推断UI |
| RecordGarden useGardenEnvironment有focus刷新、visibility/reduced，但无blur | 初始化focused=hasFocus，refresh更新focused，补blur listener/cleanup；许可AND focused | impl核监听/清理；root窗口blur且document.hidden=false实际暂停 |
| RecordCompanion hidden控制body；机器人眼blink，当前figure没有float动画 | 可选插槽接收animate&&!hidden；机器人原SVG回退；专用画像尺寸规则 | root隐藏/暂停与回退场景；只调整容器适配，不叠加float或覆盖宠物内部动作 |
| App garden存在并发接线且当前已应用值唯一 | 当前分支最小注入，不恢复旧App或改其他导航 | impl当前源SHA与差量；rootworkspace/release各自冻结/验证 |

### S4独占路径、接口与目标片段

[修订: S4-R1] 唯一实施owner为wardrobe_industry。可写五文件：src/App.tsx的garden注入及必要imports；src/RecordGarden.tsx的Props/useGardenEnvironment/RecordCompanion调用；src/RecordCompanion.tsx的Props/画像分支/可见名字；src/record-companion.css的专用画像适配；src/PetCompanion.tsx只export既有PetPortrait。最后一项须root正式确认S1结束并移交后才能写，先核对S1最终身份；其它S1文件继续保护。其余日期/数据源、8项中未列文件、公共docs、发布副本和版本只读；App唯一owner不并写。报告由root派单指定，不新增本轮规划旁支。

[修订: S4-R1] 接口保持PetCompanion/PetShowcase必需props和两个偏好键不变。新可选字段同时进入RecordGarden Props和RecordCompanionProps；原独立调用不传仍渲染机器人。新增ReactNode仅type import。目标片段覆盖出口→App→月历→卡片→画像，足以顺读两个主链；是结构骨架，不是完整after实现。

```tsx
// src/PetCompanion.tsx: keep the existing function body and props.
export function PetPortrait({ appearance, mood, animate }: {
  appearance: PetAppearance; mood: PetMood; animate: boolean
}) { /* existing SVG body unchanged */ }
// src/RecordGarden.tsx and src/RecordCompanion.tsx: optional additions.
renderCompanionFigure?: (animate: boolean) => ReactNode
companionName?: string
// src/App.tsx: existing garden branch only; import PetPortrait and PET_CHARACTER_NAMES.
<RecordGarden /* existing notes/renderNote/open/create props */
  animate={motionAllowed && pageVisible && businessEnabled}
  companionName={PET_CHARACTER_NAMES[petAppearance.character]}
  renderCompanionFigure={localAnimate =>
    <PetPortrait appearance={petAppearance} mood="idle" animate={localAnimate}/>}/>
// src/RecordGarden.tsx: pass the optional fields and locally composed permission.
const motionAllowed = animate && motionEnabled && visible && !reduced && focused
<RecordCompanion /* existing date/summary/actions */ animate={motionAllowed}
  renderCompanionFigure={renderCompanionFigure} companionName={companionName}/>
// src/RecordCompanion.tsx: inside the existing aria-hidden figure.
{renderCompanionFigure ? renderCompanionFigure(animate && !hidden) : /* existing robot SVG */}
```

[修订: S4-R1] 焦点实现唯一选择：useGardenEnvironment初始化focused为document.hasFocus()；既有refresh中同步setFocused(document.hasFocus())，继续保留focus→refresh及原午夜定时逻辑；额外blur处理只setFocused(false)，mount注册、cleanup解绑。不创建新计时器/RAF，不改变原today/timeZone或午夜调度。RecordGarden读取focused并只加入现有动态AND判定；日期/分页函数逐字保持。卡片显示companionName ?? '小伙伴'，section可访问名字随实际伙伴；figure继续aria-hidden，摘要和按钮仍可访问。动态关闭不禁用日期或按钮。

[修订: S4-R1] 画像容器使用存在插槽的data属性，专用选择器仅约束.pet-portrait的宽高/完整viewBox展示；78×86与390px下64×76原布局保持，乌萨奇长耳与帽子不得裁切。共享容器不添float/transform动画，不用通配animation:none封禁宠物自身动作；机器人blink类仅命中保留机器人。PetPortrait沿用自身animate状态与既有CSS，不新建月历动作。作者体验保持同一伙伴名、装扮和低扰动idle；共享出口只是现函数export，可选两字段直接透传，不制造全局渲染注册表。

### 顺序、验收、验证分层与回滚

[修订: S4-R1] 执行顺序：独立增量Gate-2 PASS→root正式派实施并确认S1出口移交→记录五文件当前SHA→只加共享export及可选Props/透传/回退→补焦点许可→当前App注入applied→专用CSS→impl-safe命令和差量自证→交root真实UI/fresh。S4不改Apply读写返回bool、保存失败消息或草稿状态；失败保存的已应用会话值同样传月历，刷新依原读存储结果。

| [修订: S4-R1] 责任 | 具体验证 | 证据产物与不足约束 |
|---|---|---|
| impl | 读当前五源差量，确认export body不变、可选回退、focused cleanup、日期/分页函数不变、无新storage/timer/RAF/Three依赖；node --test tests/petAppearance.test.mjs tests/petBehavior.test.mjs tests/recordGarden.test.mjs；npm test；npm run build | 自有TEMP完整stdout/exit与五源SHA、指定impl报告；RecordGarden既有测试不冒充本轮新测试，CPU/build不证明动画/读屏 |
| root工作区 | 应用五角色及附件后月历同值；试穿未Apply不传播、撤销/原装预览不传播、刷新恢复；局部暂停/继续、hidden、reduce、页面隐藏、blur非hidden、弹层均关闭动作且恢复不覆盖暂停；摘要/选日/创建/今天/分页保持；浅深/390px/ARIA、未传插槽机器人回退 | root TEMP日志/截图与workspace source-r2身份；缺现场证据为未测，不能用发布副本无月历代替 |
| root发布副本 | Q1继续排除月历模块/入口/桥接；共享宠物/空间核心与最终工作区同源；副本独立test/build、版本/制品hash、UI/native/DB由root既有流程承接 | root更新既有release bridge manifest：workspace SHA→release SHA及唯一排除清单，剔除S4专用callback/name/imports而保留角色/空间接线；不能把含月历的工作区日志当EXE证据 |
| fresh reviewer | 顺读applied→optional slot→idle/animate，核焦点cleanup/回退/五路径差量/保存失败会话值；分别复核workspace共享与release排除证据 | 独立报告及root复核；审后改源需新SHA/重跑/复审，缺证据不得口头PASS |

[修订: S4-R1] 资源/兼容策略：无需业务迁移或新偏好；未传插槽保留原机器人和日期按钮。App只import既有SVG模块/纯外观名称，不import Three，空间lazy保持。风险是耳帽裁切、两层动画、失焦未隐藏、恢复覆盖本地暂停和发布混入月历；分别由专用尺寸、单画像动作、focused AND、不写motionEnabled和明确副本排除/身份核验关闭。真实WebView/reduce/读屏与长期表现按根风险表保留未测。

[修订: S4-R1] 若接口/许可/路径或并发写入再漂移，先向root报告身份与影响，按上文批量DELEGATE模板分流，不自行扩大权限。出现日期/数据修改、额外计时器/拖拽、发布范围变化或需要重写晴小团身体即停止受影响步骤；普通可逆细节保持授权推进。回滚仅人工撤去本次五路径的最小增量（基于S4前SHA逐块核对），保留S1–S3及所有月历既有代码；优先移除App插槽注入即可回退机器人，不执行Git还原/覆盖历史快照。

[修订: S4-R1] 当前release-source-r1保持既有UI候选冻结，不因本计划重写。S4完成后root冻结workspace最终身份与release-source-r2，更新唯一bridge排除差量并分别验证；保持原73manifest、concurrent-input/r2和已有impl报告身份。无需再问用户阶段许可；Gate-1由作者核目标/反目标映射、责任分层、证据三元组、作者体验、两个主链/事实映射/片段闭环及旧文本字节保留；Gate-2由独立reviewer主检+root复核本节和最新基线，失败回LW修订，PASS前不实施。作者自检/未测口径不构成产品PASS。

#### 本轮修订说明（S4-R2，仅设置页闭环与发布边界）

[修订: S4-R2] 伴随S3局部补修队列：root真实设置页发现已穿奶龙时，description仍写“让晴小团陪你留一点晴朗，可随时收起或重新开启”。实读src/App.tsx第179行调用和第263行SettingsView模块函数后，确定该函数不能直接读取App内petAppearance。下一次正式实施由App唯一owner完成本文件内部必需字符串prop：SettingsView既有解构新增petName，既有inline Props新增petName: string；App调用传PET_CHARACTER_NAMES[petAppearance.character]；description仅消费petName。保持其余文案、policy/store及其它Props不变，不加文件或全局状态；这是G1可见名字遗漏的局部修复，不新增功能。

[修订: S4-R2] 以下结构片段按定义→调用→description闭合，省略部分代表原有参数/类型/JSX，不是新接口或可直接编译的完整替换：

```tsx
// src/App.tsx: SettingsView is a module function; extend its existing inline type.
function SettingsView({ petName, /* existing destructured props */ }: {
  petName: string; /* existing required prop types unchanged */
}) { /* existing JSX, with the following Setting description only */ }
// src/App.tsx: App's existing settings branch.
<SettingsView /* existing props unchanged */
  petName={PET_CHARACTER_NAMES[petAppearance.character]}/>
// src/App.tsx: existing SettingsView JSX consumes its own prop.
<Setting title="宠物伙伴"
  description={`让${petName}陪你留一点晴朗，可随时收起或重新开启`}
  action={/* existing show/hide action unchanged */}/>
```

[修订: S4-R2] 发布排除细化覆盖上文笼统“专用imports”口径：只去除garden callback/name接线及App中仅用于garden的PetPortrait引用/import；PET_CHARACTER_NAMES同时服务SettingsView，所以发布副本必须保留该import、petName调用/类型/description及设置修复。PetCompanion中的PetPortrait是共享export，完整源文件无需排除或反改export。root bridge只排除月历入口/模块和实际月历专用引用，不排除宠物共享源。将此差量计入完整test/build与fresh核对；root复验已应用角色在设置页及各伙伴展示的名字，旧release-source-r1仍仅候选，最终源重冻重验。本次仅修订计划，尚未补修产品；其他S4文本与原219行保持。

## S5：伙伴独立入口（2026-10-05 R2）

#### 本轮修订说明

[R2-入口] 本节消费clarifications末尾「R2伙伴入口收敛」C1–C3与source_materials/feedback_entry_20261005.md；是既有正式feature的局部LW增补，保留S1–S4和全部已实施支撑文字。上文旧「尚未实施／Q1待答」只代表历史时点；Q1已答及本节R2范围优先。用户明确自主实施授权覆盖重复阶段许可，仍须独立Gate-2及root复核后正式派单。本节不是实施报告。

[R2-入口] 目标锁：C1/G1新增主导航「伙伴」独立页和设置「挑选装扮」直达；C2/G1/G3继续唯一applied与展示内draft、离页丢草稿、应用与刷新、关闭动态/休息/模态政策；C3/G3/A3直接SVG页不挂载SpatialNoteMap、不启用关系worker。反目标A1–A3保持：不新增宠物行为、依赖/路由器/注册表、偏好字段、业务写入或资源调度，不裁切角色，不重构3D/月历/主题探索。原3D宠物视角保留；工作区并发源码保留，旧EXE/安装器、150冻结源与5187预览保持，此轮不构建EXE、不合并并发发布。

### 主链、事实映射与关键锚点

[R2-入口] 现状主链是设置仅显示/收起→3D空间默认relations→当前角色标签→PetShowcase；root在5187实际设置确认无装扮入口。本轮在App增加独立view='pet'：主导航/设置→nav('pet')→既有PetShowcase→既有applyPetAppearance→App applied→记录页浮层/刷新。空间lazy与worker仍只由原graph/space入口启用，不修改运行时；理由是入口问题可用已有SVG与提交链闭合。

| [R2-入口] 实读事实 | 实现锚点 | 验证责任/口径 |
| --- | --- | --- |
| App:18/33/179-199/232-238；PetShowcase已export，settings需显式prop回调 | App import/View/settings定义→调用→按钮、pet分支、Nav | impl读真实差量与类型/build；root两入口实际点击，静态存在不能替代可用 |
| App:112仅graph/space启用hook；useNoteGraph:115/122工厂按submit创建worker；空间lazy在App:30 | pet不入enabled表达式，不包SpatialEntryBoundary/Suspense、不调用SpatialNoteMap | root源码核lazy/enabled=false、现场无canvas与首次页面资源发起链；预缓存下载与运行分开，缺证只列未测 |
| PetCompanion:190-203 draft内聚，usePetBehavior:39-66统一许可；浮层App:251隐藏条件 | 相同applied/callback/四政策props；独立页根容器与离页卸载；hidden加pet | root试穿离页/应用刷新/休息/模态/隐藏入口，impl不冒认现场通过 |
| styles:434头部≤900才换行；pet.css:142-144已有窄屏网格；设置目前单按钮 | styles头部901–1179安全换行、nav缩放/横滚与设置按钮组；保留画像布局 | root工作区及预览375px、中宽1100px与浅深/键盘截图，不能用裁切消除溢出 |

### S5唯一实施包：App直达与必要布局

[R2-入口] 唯一实施owner由root派单；可写产品路径仅src/App.tsx与必要src/styles.css、src/pet.css。先读App import/View/nav/viewContent/SettingsView/浮层hidden；目标形态是一条pet渲染分支、一个必需onOpenWardrobe回调、一个主导航项和局部布局规则。PetCompanion/PetCharacters/petBehavior/petAppearance/SpatialNoteMap/scene/worker及月历/主题探索模块均只读；保留App现有garden/graph接线。输入是四政策props、PetAppearance与boolean保存回调，输出是现有展示及原保存消息；不接notes/query/graph，不改数据库、业务备份、AI或原key值。

[R2-入口] 定义→调用→消费与分支/隐藏有状态流转，需以下目标骨架；省略处仅代表原有代码，工作区保留既有PetPortrait import，隔离预览不补月历专用import。片段与上述事实表覆盖入口→页面→applied/政策→浮层闭环，原提交实现直接复用。

```tsx
// src/App.tsx: add PetShowcase to the existing PetCompanion import; extend View with 'pet'.
// Keep the existing graph/space enable condition; pet does not enable it.
const graph = useNoteGraph(activeNotes, view === 'graph' || view === 'space')
// Extend SettingsView's existing destructuring and required inline props.
function SettingsView({ onOpenWardrobe, /* existing props */ }: {
  onOpenWardrobe: () => void; /* existing required prop types */
}) { /* existing JSX: pet action group includes the existing show/hide button and */
  /* <SoftButton onClick={onOpenWardrobe}>挑选装扮</SoftButton> */
}
// App settings branch: keep petName/onPet and all other props.
<SettingsView onOpenWardrobe={() => nav('pet')} /* existing props */ />
// App viewContent: an explicit branch before the existing NotesView fallback.
// else if (view === 'pet') {
viewContent = <div className="content pet-workspace">
  <div className="heading"><div><p className="eyebrow">你的本机伙伴</p>
    <h1>伙伴</h1><p className="subtle">挑选角色与装扮，穿上后陪你记录。</p></div></div>
  <PetShowcase theme={theme} motionAllowed={motionAllowed} visible={pageVisible}
    businessEnabled={businessEnabled} appearance={petAppearance}
    onApplyAppearance={applyPetAppearance}/>
</div>
// }
<Nav icon={<Sparkles/>} text="伙伴" selected={view === 'pet'} onClick={() => nav('pet')}/>
// PetCompanion hidden: append view === 'pet' to all existing hidden views.
```

[R2-入口] 执行顺序：①核对当前三产品路径身份及两份before，遇外部新差量先报root；②补import/View、独立pet分支、主导航（3D空间与账本之间）、SettingsView必需回调定义/调用/按钮；③hidden新增pet，graph启用条件及原space分支逐字保持；④必要布局；⑤impl-safe差量/构建自证后交root双源现场与fresh审查。入口只调nav，不调用setPetShown、apply或write；已收起时仍可进入，返回记录仍收起。PetShowcase不接petShown，休息/动态/焦点/可见/模态按原hook，不加计时器；div独立根与原space的section路径不同，离开必卸载草稿，两个入口不共享未应用draft。应用仍仅原宠物外观键，失败仍会话生效并保留原提示/重试。

[R2-入口] 布局与作者体验：styles只把现有头部换行规则覆盖到≤1179px，nav全宽第二行；nav设min-width:0/max-width:100%/overflow-x:auto，按钮flex-shrink:0，宽屏可收缩而375px能横滚到伙伴且键盘焦点可见；不隐藏导航文字、不做伪tabs或新键盘协议。设置action新增.pet-setting-actions局部flex-wrap/gap/max-width:100%，保留原显示按钮aria-pressed及「挑选装扮」原生键盘激活。原pet.css五角色/720px/1080px/完整viewBox规则复用；只有现场确认需必要适配才在pet-workspace后代补min-width或提交按钮换行，不改SVG或动画。验收中宽901–1179与375无页面横溢、按钮不互盖；源码保留直观分支/具体props，不借本轮重排App或建配置框架。

### 验证、双源一致、回滚与Gate

| [R2-入口] 责任 | 验证/产物 | 缺证约束 |
| --- | --- | --- |
| impl-safe实施owner | 当前before/after逐块差量、三产品源SHA、graph条件/props/hidden/无新存储与依赖核对；npm run build完整stdout/exit；TEMP/qingjian-pet-entry-20261005下专属impl日志，root授权的impl_report_r2.md | 任一失败原样记录；build/静态不代表操作或无worker现场通过，不自行浏览器/DB/native/提交 |
| root | 工作区与独立preview-source分别npm test/build；真实主导航/设置/收起时直达、五角色静态与招呼/休息、关闭动态/模态、未应用离页、应用后记录浮层/刷新、Tab与浅深375/1100布局、原3D宠物入口及原3D可打开 | 完整命令/exit与两份源身份、截图和操作记录落TEMP，媒体落允许visualizations；未测保留，不能以旧r1/旧EXE替代 |
| root首次资源 | 新独立预览会话记录SW控制状态，仅记录→伙伴；源码核不挂SpatialNoteMap/Three且useNoteGraph enabled=false，现场核无canvas及页面资源/发起链，以足够触发worker阈值的隔离记录量增强路径辨识；页面执行路径不发起空间JS/worker请求，随后原3D仍可打开 | 无canvas画面与请求清单、时间、URL/源SHA/首次路径一起记录；资源表为辅助证据，PWA后台可预缓存，不由下载列表推断Three执行或worker启动；已热场景不证明首次，缺证列未测，不声称GPU/FPS/内存提升 |
| fresh reviewer及root | 未参与实施者顺读最终差量、两源保护hash、完整日志/UI/资源证据和当前文档，给正式业务/协议双结论，root复核 | 旧r1审查不覆盖R2；审后源变更失效并复验/fresh复审，缺证不得口头PASS |

[R2-入口] 双源权威为TEMP/qingjian-pet-entry-20261005/source-before.json（150源preview/workspace身份）与workspace-before.json（247工作区保护输入）；不覆写既有快照。root在独立preview-source仅叠加与工作区相同的App入口/必要CSS增量，基于各自App上下文应用，禁止整文件从工作区复制去混入garden/主题探索。shared CSS若变两源最终hash须相等，App只允许before已记录的并发差异加相同入口hunks；root记录增量清单/双源after与排除边界并独立验证。原release-source-r2/5187/EXE三hash保持；新预览独立端口由root承接。当前README/CHANGELOG/Project.Progress/Pet.Wardrobe及R2报告/审查由root维护，本包不改其他docs或版本。

[R2-入口] 风险与失败：中宽新增导航挤压由局部换行/横滚及现场量测关闭；双展示/草稿延续由hidden与显式卸载闭合；不挂载Three/不启动worker由源码lazy/enabled与现场无canvas/资源发起链组合核验，下载不是执行证据；双源误混由各自before差量关闭。现有数据无迁移，无新开关。入口失败保留原3D宠物路径；回滚只人工撤本轮App入口/prop/hidden与本轮CSShunks，按R2前身份核对，保留S1–S4及并发源，不reset/restore/清键/覆盖原App。若新增行为、修改只读路径、源漂移或资源结论需要新假设，停止相关步骤报root，不扩大权限。

[R2-入口] 事件触发对齐留痕在本节与root的clarifications/R2报告：本轮已记录入口实证、901–1179布局和独立双源范围；LW→Review(LW)、新假设/风险/并发变动立即报root。当前未触发新澄清，因为C1–C3/授权/数据/回滚均唯一；后续真阻断按上文DELEGATE_QUESTION模板一次汇总P0范围阻塞/P1风险/P2优化，由root决定，不递归委派。无新增跨功能事实。

[R2-入口] Gate-1作者清单（计划内容自检，不是产品PASS）：目标锁/反目标及不影响项映射；可写路径/关键函数/接口和定义→调用→消费片段；主链/事实映射/片段闭环；顺序/依赖/验收/兼容/降级/最小回滚；impl-safe与root/fresh责任分层；证据产物/责任归属/缺证约束；作者体验与声明可读性；双源before/增量与保护边界；事件/澄清/停机；修订标签和旧文前缀字节保留。每项均已在本节列明，作者只核内容与追加完整性，不运行产品测试。

[R2-入口] Gate-2须独立review_plan主检+root复核本节和最新R2基线，重点顺读入口/必需prop/policy/draft/hidden/worker启用与双源验证责任，并核中宽/窄屏、只读路径、资源缺证口径。失败回LW修订，不得进入impl；PASS后root正式派单，按既有自主授权不再重复询问阶段许可。本文Gate-1不替代Gate-2或最终fresh实施审查。

## S6：装扮操作布局与同范围 0.7.1（2026-10-05 R3）

#### 本轮修订说明

[R3-布局] 只追加本节，保留 S1–S5 的完整字节前缀；消费 clarifications 的「完整实现基线 R3」L1–L3、feedback_layout_20261005、research_layout_r3、release_layout_r3 与独立 readiness_r4 PASS。R2「只 Web 不打包」保留历史事实；R3 的同范围 EXE 授权优先于该历史边界。用户已批准具体布局并说「继续吧」，ManualMode 在独立 Gate-2/root 复核后自主实施，不重复询问同一动作。本文是实施合同，不是 UI、构建或制品的通过声明。

[R3-布局] 目标/反目标：L1 固定桌面预览、窄屏紧凑预览和始终可达的应用栏、两入口共享；L2 只增加短 CSS 反馈，保持单大画像、draft/apply/behavior、角色识别/完整 viewBox、完整成功或失败提示；L3 仅两产品文件及新隔离副本受限版本元数据。禁止第二宠物/计时器/RAF/依赖、配置状态/行为重构、空间搜索/上下文功能、并发月历/主题探索发布、旧源/旧制品覆盖、数据修改及整体工作区打包。

#### 本轮修订说明（PLAN_DEFECT-R1.1）

[修订: PLAN_DEFECT-R1.1] 消费 review_notes_lw_r3_1.md 的唯一阻断 F1：原自动 grid 行限制手机预览与底栏的 sticky 包含块。本次只原地改 S6 布局 CSS 与包含块解释：桌面 flex 正常流两列+全行提交栏，窄屏 block 正常流，preview-column 为 display:contents。两个 sticky 的包含块统一为完整高 section；提交栏仍保留自然高度。JSX、目标、状态/handlers、反馈、发布和验证责任不变，S1–S5及其余R3支撑保持。无新用户决策；第一次 PLAN_DEFECT，须重新独立 Gate-2，未放行实施。

### 主链、事实映射与片段闭环

[R3-布局] 主链保持：App applied/四政策 → 两入口的同一 PetShowcase → 原 preview/draft → 一个大 PetPortrait → 原 apply/boolean 保存文案 → 应用值及刷新。落点只有共享展示 DOM/CSS；包装在新的隔离源叠加相同两源，root 验证后独立构建。App、SpatialNoteMap、PetCharacters、petAppearance、petBehavior、关系引擎/worker、SQLite/Rust业务均不改；因此没有接口字段、业务迁移或数据降级开关。

| 实读研究事实 | 落点/接口 | 验证口径与责任 |
| --- | --- | --- |
| stage/copy/wardrobe 三兄弟，submit/status 在配置末尾；两个入口复用组件 | S6-A PetShowcase return、pet.css showcase/wardrobe/submit | root 两入口从首组选项至末组实际滚动，预览/应用同时可见 |
| document 是源码推断的滚动祖先，地图 overflow 不在宠物祖先；F1 指出自动 grid 行不能跨配置区 | [修订: PLAN_DEFECT-R1.1] showcase 桌面 flex / 窄屏 block 正常流，同一高 section 约束两端 sticky，不加 nested overflow/fixed portal | root 分别读 computed ancestors 与滚动前后几何，静态规范推导不能关闭 U1 |
| draft/apply owner 和长失败文案已有，原生按钮可访问 | 原 handlers 完整保留，原 role=status 随应用栏可见 | root 试穿离页/应用刷新/失败全文/重试/Tab；不以已穿 badge 冒充持久成功 |
| 内部 .pet-body/.pet-* 已拥有各角色 transform，policy 有 animate/interactive | 单画像外层 keyed 短 transform/opacity；root data-motion gate | impl 核无新计时/状态；root mood/休息/静态/模态，缩略图仍 animate=false |
| 5190 150 源与工作区两宠物文件共同基底，App/SpatialNoteMap 不同 | S6-B 复制固定150，仅两产品+五自身版本字段 | root 全150差量/264保护/旧制品/版本/双源日志，禁止整体 App 覆盖 |

[R3-布局] 下方 JSX/CSS 串起同一草稿、布局与反馈；包装步骤串起来源、版本与实际构建，足够顺读整个最小闭环。所有片段是目标骨架，不是机械覆盖整个组件；旧选项、credit、handlers 和描述原文保留。

### S6-A：单共享展示布局和短反馈（一个 UI 实施包）

[R3-布局] 唯一 owner 由 root 派单；仅写 src/PetCompanion.tsx 的 PetShowcase return 与 src/pet.css 对应局部规则。输入/输出 props 完全不变，保留原 draft、saveMessage、tryingOn、preview、apply、useEffect/usePetBehavior 及 policy；不改变行为 hook 的初始化或取消。目标结构是「预览列(stage+copy) / 配置列 / 共用提交栏(原三按钮+完整status)」。原 JSX 顺序以预览互动→配置→提交为顺读顺序；不复制另一个预览或提交控件。[修订: PLAN_DEFECT-R1.1] 提交栏作为 showcase 直接子项，包含原 status；桌面 showcase 使用 flex-wrap 两列加全行底栏，窄屏 showcase 使用 block，preview-column 仅 display:contents，使 stage 与 submit 的包含块都是完整 section 而非独立短 grid-area。底栏在正常流末尾保留自身完整高度及前置间距，因此最后配置项没有被抽离流的栏替代；credit 留正常流，角色/装备选项全部保留。

```tsx
// src/PetCompanion.tsx, PetShowcase return only; state/handlers above stay intact.
<section className="pet-showcase" data-theme={props.theme} data-motion={pet.policy.animate}>
  <div className="pet-preview-column">
    <div className="pet-showcase-stage" data-animate={pet.policy.animate}>
      {/* Existing halo/ring remain decorative. The button and its handler remain stable. */}
      <button className="pet-touch" /* existing type/aria/disabled/onClick */>
        <span className="pet-preview-transition"
          key={`${draft.character}:${draft.palette}:${draft.head}:${draft.accessory}`}>
          <PetPortrait appearance={draft} mood={pet.state.mood} animate={pet.policy.animate}/>
        </span>
      </button>
      {/* Existing full caption + tryingOn badge. */}
    </div>
    <div className="pet-showcase-copy">{/* All existing name/intro/status/greet/rest/privacy. */}</div>
  </div>
  <div className="pet-wardrobe">{/* Existing heading and all option groups/outfits/credit. */}</div>
  <div className="pet-wardrobe-submit">
    <div className="pet-submit-buttons">{/* Original three native buttons with original handlers. */}</div>
    <p className="pet-save-message" role="status">{/* Original complete saveMessage || fallback. */}</p>
  </div>
</section>
```

[R3-布局] key 仅在大画像的无状态 span，不放到 PetShowcase/usePetBehavior、pet-touch 或互动按钮；换配色/帽/配件时触发一次轻柔反馈，休息/招呼状态和键盘焦点不丢。外层只动画 transform/opacity，内部 SVG 自己的 transform 不被覆写。既有静态缩略图不得加 key 动画或 animate=true。data-motion 直接消费 pet.policy.animate，关闭动态、失焦/隐藏、模态/业务关闭由原政策合成；静态仍可正常选择。

[R3-布局] CSS 起始形态如下；尺寸仅为有界初值，root 现场矩阵不满足时由同一 UI owner 在两文件内小幅调整并重新验证，不允许用裁切、隐藏失败文字、新滚动容器或 JS 测高补救。桌面两列从 >720px 开始；右侧分组在 ≤1080px 一列，角色保持五列/窄屏三列，缩略图压小而完整显示。

```css
/* [Revision: PLAN_DEFECT-R1.1] Flex desktop / block mobile; section is the sticky containing block. */
.pet-showcase { display:flex; flex-wrap:wrap; align-items:flex-start;
  gap:24px; padding:24px; min-height:0; }
.pet-preview-column { flex:0 0 clamp(220px,35%,340px); position:sticky;
  top:16px; min-width:0; align-self:flex-start; }
.pet-showcase-stage { min-height:260px; }
.pet-showcase-stage .pet-touch { width:min(244px,90%); }
.pet-showcase-copy { padding:8px 0 0; }
.pet-showcase-copy h2 { margin:6px 0 8px; font-size:26px; }
.pet-showcase-copy p { margin:8px 0; line-height:1.7; }
.pet-showcase-copy .pet-showcase-feedback { margin:8px 0 12px; padding:8px 12px; }
.pet-showcase-actions { margin-bottom:12px; }
.pet-wardrobe { flex:1 1 0; padding-top:0; border-top:0; min-width:0; }
.pet-character-options .pet-portrait { width:min(82px,100%); }
.pet-small-options .pet-portrait { width:min(62px,100%); }
.pet-outfit-options .pet-portrait { width:min(78px,100%); }
.pet-wardrobe-submit { flex:0 0 100%; position:sticky; bottom:8px;
  z-index:6; display:block; margin:0; padding:10px 12px;
  border:1px solid var(--line); border-radius:16px; background:var(--surface);
  box-shadow:0 8px 26px #51487218; }
.pet-submit-buttons { display:flex; flex-wrap:wrap; gap:8px; }
.pet-save-message { margin:6px 0 0; min-height:0; line-height:1.6; overflow-wrap:anywhere; }
.pet-option-group button { scroll-margin-block:150px 160px; }
.pet-preview-transition { display:block; }
.pet-showcase[data-motion='true'] .pet-preview-transition { animation:pet-outfit-reveal 240ms ease-out; }
.pet-showcase[data-motion='true'] :is(.pet-option-group button,.pet-submit-buttons button,.pet-showcase-actions button)
  { transition:transform 170ms cubic-bezier(.2,.8,.2,1.15); }
.pet-showcase[data-motion='true'] :is(.pet-option-group button,.pet-submit-buttons button,.pet-showcase-actions button):active:not(:disabled)
  { transform:scale(.97); }
@keyframes pet-outfit-reveal { 0% { opacity:.65; transform:scale(.975); }
  70% { opacity:1; transform:scale(1.006); } 100% { opacity:1; transform:scale(1); } }
@media (max-width:720px) {
  .pet-showcase { display:block; padding:14px; }
  .pet-preview-column { display:contents; }
  .pet-showcase-stage { position:sticky; top:8px; z-index:5; min-height:104px;
    display:grid; grid-template-columns:88px minmax(0,1fr); gap:4px 10px;
    justify-content:initial; padding:8px; border:1px solid var(--line);
    border-radius:16px; background:var(--surface); }
  .pet-showcase-stage .pet-touch { width:88px; grid-row:1/3; }
  .pet-stage-caption { align-self:end; margin:0; letter-spacing:0; line-height:1.5; }
  .pet-preview-badge { align-self:start; justify-self:start; margin:0; padding:4px 7px; line-height:1.5; }
  .pet-stage-ring { display:none; } /* Decorative only; full SVG remains visible. */
  .pet-showcase-copy { margin-top:14px; padding:0; } /* Normal flow after the sticky stage. */
  .pet-wardrobe { margin-top:16px; }
  .pet-wardrobe-submit { margin-top:16px; bottom:max(8px,env(safe-area-inset-bottom)); padding:8px; }
  .pet-submit-buttons { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:5px; }
  .pet-submit-buttons button { min-width:0; padding:8px 4px; font-size:11px; white-space:normal; }
  .pet-save-message { font-size:10px; line-height:1.5; }
}
@media (max-height:600px) and (min-width:721px) {
  .pet-showcase-stage { min-height:190px; }
  .pet-showcase-stage .pet-touch { width:min(184px,90%); }
  .pet-showcase-copy h2 { font-size:23px; }
}
@media (max-height:600px) and (max-width:720px) {
  .pet-showcase-stage { min-height:88px; grid-template-columns:72px minmax(0,1fr); }
  .pet-showcase-stage .pet-touch { width:72px; }
}
.pet-showcase[data-motion='false'] .pet-preview-transition,
.pet-showcase[data-motion='false'] :is(.pet-option-group button,.pet-submit-buttons button,.pet-showcase-actions button)
  { animation:none!important; transition:none!important; transform:none!important; }
@media (prefers-reduced-motion:reduce) {
  .pet-preview-transition { animation:none!important; }
  .pet-showcase :is(.pet-option-group button,.pet-submit-buttons button,.pet-showcase-actions button)
    { transition:none!important; transform:none!important; }
}
```

[R3-布局] CSS 必须整合/覆盖现有 720/1080 规则，不能让旧 min-height330 或旧 thumbnail83/86 在后面反向覆盖；保留原 halo 与角色动态政策。[修订: PLAN_DEFECT-R1.1] 起始结构已经消除自动 grid-area 短行：桌面两 flex 列的包含块为 section，footer flex-basis:100% 自然换行；窄屏 section 为 block，display:contents 不生成父盒，stage/copy/wardrobe/submit 都参与该 section 的正常流，stage top 和 submit bottom 可以在整段配置高度内移动。footer 完整 status 自然撑高并保留流内空间，末项位于其正常位置之前，不需重叠占位/测高。root 仍须量测真实滚动祖先、第一组/最后组和两个 sticky 前后几何，这是验证浏览器实际结果，不能以静态结构推导宣称现场通过。不得加 max-height/overflow:hidden 裁画像或长提示。z-index5/6低于现有 modal40/toast50；失焦/模态时仍遵循 interactive 禁用。应用栏 status 全文随栏换行可发现，无 line-clamp/ellipsis；200%文本缩放若挤压，优先再压缩装饰留白和画像尺寸，保留一个完整可操作配置行。极端更矮窗口/更大文本下允许原生文档滚动使所有内容可达，不能藏掉状态或永久盖住末项。

[R3-布局] 执行/依赖：Gate-2/root复核 → 两 before 身份核对 → 仅 return 分组/反馈 wrapper → 局部 CSS/响应式 → impl-safe 自证 → root 双源/现场 → 必要同范围修正/复验。作者体验是同屏看到选择结果、完整保存反馈、直接按钮和原互动，不显示存储语法；声明可读性是具体两个容器和少量媒体规则，不制造布局/角色注册框架。

[R3-布局] impl-safe：读两文件真实 before/after，输出统一差量和 SHA，确认 state/handlers/props 不变、只有一个大画像/静态选项、无新增timer/RAF/存储/依赖；运行 npm run build（root工作区承接全量test），日志完整 stdout/真实exit落 TEMP/qingjian-wardrobe-layout-20261005/ui-impl，按派单报告。任何失败原样上报；build 只证明类型/产物，不能关闭 sticky、焦点、保存和性能现场项。回滚仅基于 S6 before 逐块人工撤这两个文件的本轮hunks，保留S1–S5与全部他人工作；不 git restore/整文件复制旧baseline/清偏好。布局暂失败仍保留原两入口可用，root不发布候选。

### S6-B：新隔离源包装（一个 TEMP 包，不构建）

[R3-布局] 单独 owner 仅可写新 TEMP/qingjian-wardrobe-layout-20261005/release-source-r3 及同轮新 manifest/report；工作区产品/metadata、旧 preview-source/release-source-r2/日志/target/release 只读。消费 L3 与A2/A3；目标是能被 root 顺读验证的150源来源、两共享产品差量、五自身版本字段，不设计新发布系统。没有产品接口改变，依赖 S6-A 两源冻结及 root 保护核验。

[R3-布局] 执行：①拒绝既存候选及路径越界，重核5190冻结清单150的before字节；②仅逐路径复制150源，不递归复制dist/target/node_modules/tsbuildinfo；③叠加最终 PetCompanion/pet.css 两源，二者与workspace最终hash相等；④五metadata只改 package.json.version、package-lock顶层/packages[''].version、Cargo.toml [package].version、Cargo.lock唯一name='qingjian'的version、tauri.conf.json.version→0.7.1；依赖/脚本/identifier不变，禁止全局替换0.7.0；⑤node_modules只建指向现有E盘依赖的junction，不install；⑥落 base/final150、七路径精确差量及manifest SHA。App/styles/SpatialNoteMap仍是5190字节，排除月历/探索新增源仍缺席，不能复制混合App。上述文字与唯一版本字段已足够，不需新业务代码片段。

[R3-布局] 包装自证只做 impl-safe 的源/metadata解析、150范围与共享两SHA核验，完整输出/exit、新清单/报告归本轮TEMP；不运行原生、浏览器、Git、DB或服务。root 才独立重算全150与工作区264保护（容许本轮两源和正式追加文档），检查旧150/三旧制品不漂移；之后候选与workspace分别 npm test/npm run build，保持两份实际日志/数量不混用。依赖junction不能修改共享依赖；发现第三业务源、旧源漂移或元数据依赖变动就停止包装并报root。

[R3-布局] root 发布责任：候选cwd设置 CARGO_TARGET_DIR=E:/project-funny/biji/src-tauri/target/wardrobe-layout-0.7.1、CARGO_BUILD_JOBS=1，运行 npm run release:windows -- --ci；这是全新独立target，拒绝旧target/release输出被覆盖，E盘构建空间已由root确认。记录真实完整log/exit，不凭工具缓存存在或旧16分钟记录声称新build成功。按CLI实际产出核exe/NSIS/MSI自身0.7.1、SHA与独立来源，复制版本化交付目录并重核；受控烟测不安装覆盖真实库，SQLite只读before/after由root承接。旧0.7.0仍保留可用。回滚是停止并不发布新候选，必要清理仅已验证属于本轮的新TEMP/新target（root按Windows路径安全规则），不删除/还原任何旧源、缓存、制品或业务偏好。

### root 现场验收、证据归属与 Gate

[R3-布局] root 独立 test/build 与实际UI是放行必需：375×667、375×500、1100×780、1100×600及常规宽屏，两入口分别核滚动祖先/预览与提交几何，滚至末组确保最后按钮文字/完整角色未遮；逐项Tab到末项和提交，焦点可见且顺序不跨列跳跃。浅深主题、五角色/长耳/头饰/组合、关闭动态/系统reduce(可操作时)/休息/招呼/模态，验证外层一次短反馈不取代内部动作。实际执行试穿离页丢弃、撤销/原装需Apply、应用后小伙伴及刷新保持；受控保存失败夹具要保留原false返回语义并看完整status和重试，200%文本缩放+375×500保留可选行。无法操作的项目只能记录未测并评估是否阻断本轮核心目标；缺sticky/保存可发现/窄屏末项证据不得给L1/L2通过。

[R3-布局] 证据三元组：UI owner 的真实差量/build/SHA→TEMP ui-impl与派单报告；包装owner的base/final150与七路径差量→同轮TEMP packaging；root双源命令/现场操作/截图、264保护/旧制品/新0.7.1身份/只读DB→同轮TEMP root与新verification_layout_r3，媒体落既有visualizations允许目录；fresh reviewer读取最终两源/七发布差量/完整log/真实媒体/保护身份，独立双结论并由root全文复核。各归属不得互相代称执行；缺证不得默认通过，旧R2 PASS不覆盖R3。GPU/FPS/内存/后台长期、完整native GUI/安装卸载/触屏读屏及PWA更新原未测继续保留，chunk/工具失败不省略。

[R3-布局] 风险与事件：U1–U7按上方布局/焦点/动态/失败/模态现场关闭，U8发布独立target/来源+受控烟测承接；没有新增需求决策。当前批量提问未触发，因为具体目标、范围、验证及回滚已经用户授权并由R3唯一化。新假设/风险/并发漂移与LW→Review(LW)即时报root，留痕本节/R3 clarifications/报告；真阻断按旧DELEGATE_QUESTION模板一次汇总P0范围、P1风险、P2优化，不递归委派或扩大范围。root在验证后同步当前README/CHANGELOG/Project.Progress/Pet.Wardrobe，旧日志/失败保留；是否提交推送取决于可安全隔离本轮差量，不提交未知混合树。

[R3-布局] Gate-1（LW作者存在性自检）：T1十三项在本節给出目标/反目标/不影响、两包路径/章节/函数/接口/目标形态/顺序/依赖/验收/回滚、各包消费目标、分层责任/非impl-safe分流/证据三元组、作者体验、主链/事实映射/片段闭环、事件/批量问题/风险降级；T2输入输出/边界/回归与T3两入口依赖、隔离发布接口矩阵、无迁移兼容/停止不发布均存在。完成旧前缀字节保留和新增内容实际读取后仅交Gate-2，不表示产品已通过。

[R3-布局] Gate-2：独立review_plan主检+root复核R3输入/S6，重点单大画像、stable按钮与key位置、sticky包含块/低高度/长status/Tab、完整policy与静态缩略图、两文件权限、150+七差量/五自身字段/新target、验证三元组与作者体验。失败回LW补修，不进入impl；口径不唯一先澄清。PASS后root按已有手动授权派单，不重复用户确认；审后源变化重新验证并fresh复审。无新增跨功能事实。
[R3-布局] root 改前现场补充：375×500 下 document clientWidth360、clientHeight500，stage top324.5/bottom654.5/high330，submit top2128/bottom2168；来源为本轮 media 的 before-375x500.json/jpg。L1「预览和应用同时可见」从进入配置区、挑首组选项至最后组选项的过程验收，不要求文档顶部品牌尚占空间时同时展示全部配置。该事实只是旧布局几何，不证明新sticky成功，也不改变两文件范围。