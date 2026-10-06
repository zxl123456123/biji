# 晴小团装扮与空间模型配置：业界与技术参考

调研时间：2026-10-04。性质：只读调研；以下“建议采用”是选型意见，尚未实施、未做 UI 或设备验收。本报告只写本文件；未修改源代码、根文档或启动 UI 服务。

**2026-10-05输入更新**：本文为初始装扮范围的研究记录，关于“仅原创、不加入第三方角色”的范围判断已由用户明确指定奶龙/Chiikawa三小只替换。最新范围以clarifications和research_characters为准；共享SVG/状态/几何/本机偏好、素材不任意移植的技术事实继续适用，不据本文旧范围否定用户新增角色需求。

## A. 系统边界与现有能力

需求原文见本目录 `README.md`：用户肯定现有晴小团，要求继续开发装备、商城或装扮配置，以及 3D 建模配置。本轮既定范围是原创晴小团、本机免费装扮铺和真实 3D 记录模型样式；不引入支付、帐号、养成经济、第三方角色资产或另一套物理/关系引擎。外观偏好不进入笔记、SQLite 或备份。

已观察到的项目事实：

- `src/PetCompanion.tsx:43` 的 `PetPortrait` 是内联 SVG，固定 `viewBox="0 0 240 230"`，渐变 ID 使用 `useId` 区分实例；`pet-body` 内包括耳、肢体、身体、脸部及头顶叶片，另有光晕、阴影、闪光和睡眠层。
- `src/pet.css:16` 起分别控制身体、眨眼及目光变换；休息、拖动、招呼使用身体变换，系统减少动态会关闭动画。`PetCompanion` 与 `PetShowcase` 共用画像组件。
- `PetShowcase` 的大角色目前仍是 SVG 加 CSS 舞台；实际 3D 记录几何由 `src/spatialScene.ts:220` 的 `SphereGeometry(1, 10, 7)` 生成。不能把大 SVG 舞台称为已有 3D 角色模型。
- `src/spatialScene.ts:130` 的节点和光晕分别使用 InstancedMesh，但共享同一球体几何；节点尺寸表达完成状态及度数，颜色来自现有分组。拾取依靠 `instanceId` 对应 `layout.nodes` 的顺序。
- `src/App.tsx:38`、`:69` 保存独立显示偏好；现有主题、动态和显示使用 localStorage。`package.json` 与已安装包均为 `three@0.186.1`，开发类型为 `@types/three@0.186.0`；package.json 未声明 Live2D、React Three Fiber 或 Tauri Store 前端依赖。

## B. 入口与主流程

现有流程是 App 提供显示/主题/动态政策，`PetCompanion` 和空间内 `PetShowcase` 消费政策及共用 SVG；记录空间消费已派生的 SpatialLayout，由 `createSpatialScene` 创建单场景、实例节点和线条。空间调度通过 `spatialRuntime` 合并按需绘制并管理连续动作。

（推断）外观配置若只改变画像图层与已有 scene 内的几何/材质展示，可沿用这些所有者；无需让装扮读取记录正文，也无需为了换外观再次派生关系或重新建立相机。具体接口仍由后续方案决定。

## C. 关键模块与职责

| 已有模块 | 当前职责 | 本轮需要保留的边界 |
| --- | --- | --- |
| App | 共享展示偏好、页面与弹层政策 | 外观偏好与笔记保存链路分离 |
| PetCompanion / PetPortrait | 原创 SVG、浮动/大画像、手势、四态反馈 | 共用角色、动态停止与手势取消政策 |
| pet.css / petBehavior | 动画层和状态/位置政策 | 装备不覆盖已有身体变换或产生新的行为状态机 |
| spatialScene | 单场景、共享几何、拾取、材质及资源释放 | 仅修改展示，不取得关系数据所有权 |
| spatialRuntime / spatialLayout | 绘制预算/调度与确定性展示坐标 | 保留原有布局、相机交互和预算 |

## D. 桌宠装扮的可行路径及采用依据

| 路径 | 一次资料所支持的事实 | 对本轮的适配判断 |
| --- | --- | --- |
| 沿用原创 SVG，按部件组合装扮 | SVG `<g>` 让子元素共享变换；渲染顺序提供前后遮挡。项目已有这类分组与原创路径。 | **建议采用**：能够继续保持同一个晴小团，头饰/围巾/背部配件可表达独立配置，不需要替换现有宿主。此为选型建议。 |
| 自绘整套帧动画或整体皮肤 | VPet 支持动画、物品、主题与插件 MOD，并有 PNGAnimation 和三层动画合成；其桌面宿主基于 WPF。 | 可行的素材生产路径，但每种整体造型要覆盖已有动作；本轮只参考物品选择和分层表现思路，不迁入 WPF、工坊或角色资源。 |
| Live2D 参数化模型 | Cubism Core 负责模型计算，并与 Components、模型素材的授权分开。 | 可行但需要新的模型制作、参数和运行时边界；现有 SVG 的有限动作不需要这条额外链路，本轮不采用。 |

SVG 依据见 [MDN `<g>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/g) 与 [W3C SVG 2 渲染模型](https://www.w3.org/TR/SVG2/render.html#RenderingOrder)。桌宠依据见 [VPet 官方 README 的 MOD 与架构说明](https://github.com/LorisYounger/VPet/blob/main/README_en.md)，Live2D 依据见 [官方 Core 说明](https://docs.live2d.com/en/cubism-sdk-manual/cubism-core/)。

与实际画像相关的兼容观察：身体上的装备需要与 `pet-body` 共享身体运动；背景气氛可以留在身体之外。放在画像最外层的头饰不会自动继承身体的休息缩放、拖动旋转或招呼运动。现有渐变使用每实例唯一 ID，后续装备的渐变/裁切定义也需要保留这一隔离，否则浮动画像、舞台与预览同时出现时可能串色。以上是代码与 SVG 语义结合后的推断，不是已验证的装扮效果。

（建议）免费装扮铺使用内置原创部件、即时预览和已穿戴状态，保留恢复默认能力；不需要价格、虚拟币或购买凭据。预览仍应服从原有减少动态和失焦政策。这里不设商品数量作为质量门槛，也不把任意上传 SVG、HTML 或代码插件列入本轮能力。

## E. 真实 3D 模型、共享资源与存储参考

### Three 原生共享几何

[官方 InstancedMesh 文档](https://threejs.org/docs/pages/InstancedMesh.html) 明确以相同几何/材质及不同变换批量绘制，可降低 draw call；实例矩阵/颜色变化需要相应 `needsUpdate`，修改矩阵后可能需重算 bounds。一个 InstancedMesh 中的实例不是各自带有独立几何的 Mesh。

（建议）沿用同一个 scene 的共享低面数模型，让“圆球 / 晶体 / 方块”改变真实几何，光晕、流光与背景另外作为展示外观。对比材料仅换色并不能兑现真实模型变化。Icosahedron 和 Octahedron 都是原生晶体候选，不需要都上架；后续方案可按可辨认度选择其中一种。

| 几何候选 | 官方语义 | 已安装 Three 0.186.1 的只读实测 | 本轮兼容关注 |
| --- | --- | --- | --- |
| SphereGeometry(1, 10, 7) | 经纬分段球体 | 88 position 顶点、120 三角面 | 当前默认几何，保留默认外观 |
| IcosahedronGeometry(1, 0) | 二十面体；detail 增大会新增顶点 | 60 position 顶点、20 三角面 | 可提供切面晶体；增加 detail 会趋近球面并增加面数 |
| OctahedronGeometry(1, 0) | 八面体；detail 增大会新增顶点 | 24 position 顶点、8 三角面 | 轮廓更尖；小节点远距离可辨认度待实际观察 |
| BoxGeometry(1, 1, 1) | 默认分段的长方体 | 24 position 顶点、12 三角面 | 需规范尺度，边角到中心距离与球/晶体半径不等价 |

来源：[SphereGeometry](https://threejs.org/docs/pages/SphereGeometry.html)、[IcosahedronGeometry](https://threejs.org/docs/pages/IcosahedronGeometry.html)、[OctahedronGeometry](https://threejs.org/docs/pages/OctahedronGeometry.html)、[BoxGeometry](https://threejs.org/docs/pages/BoxGeometry.html)。表中是 position attribute 数量，非唯一空间点数量；indexed 与 non-indexed 几何的 position 数不能直接比较性能。面数实验是 Node 下的几何计数，不能证明 GPU 帧率或各模型在真实设备上的视觉效果。

（推断）全局模型枚举与已有单个 nodesMesh 相适配；若改成每条记录都能独立选几何，会需要额外批次/实例索引映射，超出当前展示偏好的简单边界。模型切换应保留记录 ID、实例顺序、分组色、完成状态/度数尺度、选中状态以及相机/布局；不能让外观覆盖已有记录语义。

### 资源生命周期与绘制

[Three 资源释放手册](https://threejs.org/manual/pages/how-to-dispose-of-objects.html) 说明 scene.remove 不会释放 geometry/material；材质释放不等于 texture 释放，共享资源的生命周期由应用负责。已安装 `InstancedMesh.dispose` 调用父类并释放 morphTexture；`Object3D.dispose` 说明 geometry/material 需单独释放。项目目前分别拥有 geometry/material/texture Set 并在最终 dispose 清理。

（建议）继续使用该场景所有者处理切换和清理，区分“旧实例不再使用”与“共享几何不再使用”：替换 nodesMesh 时不能顺带释放仍供 halos 使用的球体；最终关闭 scene 才释放其持有资源。无论缓存有限几何还是即时生成后释放，都要避免切换积累。官方允许用 `renderer.info` 观察资源计数，但不能把计数必须为零作为通用判断，Three 内部有可复用缓存。所需验收是多次换模型/退出重进后资源不持续增长，尚未执行。

官方 [按需绘制手册](https://threejs.org/manual/pages/rendering-on-demand.html) 将设置、相机和资源变化列为重绘触发；这适合当前 scheduler。外观切换需要能在暂停/减少动态时立即显示静态结果，不能依赖自动动画刷新。

### 不引入新的场景或图框架

- [React Three Fiber 官方仓库](https://github.com/pmndrs/react-three-fiber) 是 Three 的 React renderer，支持声明式场景且需要匹配 React 主版本。本项目已有明确隔离的单场景所有者；**建议本轮沿用原生 Three**，避免为有限几何切换搬迁生命周期。这不是性能高低的普遍判断。
- [react-force-graph 官方仓库](https://github.com/vasturiano/react-force-graph) 包含 force-directed 迭代布局、d3-force-3d 及 d3/ngraph forceEngine。**本轮不采用**，原因是现有关系和展示坐标已有所有者，装扮/模型配置没有新增物理布局需求。
- OBJ/glTF 的外部模型导入可以表达更复杂造型，但会另增解析、素材来源、尺寸、纹理和生命周期边界（推断）。内置原生几何已足以兑现本轮真实模型变化，不需要扩展任意模型上传能力。

### 本地 JSON 枚举偏好

[MDN Web Storage 指南](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API) 演示即时外观变化并用 localStorage 记住选择；Storage 仅存字符串，普通对象可 JSON.stringify/parse，空间按 origin 隔离。该指南同时记录存储不可用/容量异常。非法 JSON 会抛 SyntaxError，见 [JSON.parse 文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)。

（建议）只保存已知外观枚举及必要的格式版本，解析后按内置值核对，缺失/损坏/未知值回到默认；不把配置当作 SVG/HTML、材质脚本、记录正文或通用场景 JSON。写入失败时当前会话仍应可用，不能把未写入的外观宣称为已持久保存。恢复默认只作用于外观键，不能使用 localStorage.clear 删除笔记等其他键。小型偏好不需要为本轮增加通用配置或状态框架。

可行的另一路是 [Tauri 官方 Store 插件](https://v2.tauri.app/plugin/store/)：把键值异步保存到文件，支持重启后的读取，但须新增 Rust/前端依赖、初始化及权限。现有项目已用 localStorage 管理展示偏好，**建议本轮继续其独立偏好路径**；浏览器与原生 WebView 的 origin/数据目录不保证互通，清除站点数据或应用数据会使偏好丢失，实际 EXE 重启保持仍需 root 验收。若未来要求可携带的外观文件，再独立评估 Store，不应因此改笔记/SQLite/备份 schema。

## F. 许可证与原创资产边界

- 已安装 `node_modules/three/LICENSE` 标明 Three 是 MIT，须保留其版权与许可文本；[r186 官方 LICENSE](https://github.com/mrdoob/three.js/blob/r186/LICENSE) 可供复核。本轮沿用依赖，不新增素材库。
- [VPet 的代码 LICENSE](https://github.com/LorisYounger/VPet/blob/main/LICENSE) 是 Apache-2.0，但 [README 的动画/图片授权段落](https://github.com/LorisYounger/VPet/blob/main/README_en.md#animation-copyright-notice-and-authorization-terms) 单独限制默认资源，且明确不覆盖第三方自定义动画。故“免费桌宠、开源代码、工坊可下载”不构成本项目可复用角色/装备素材的授权证明。
- [Live2D 官方 Web Samples LICENSE](https://github.com/Live2D/CubismWebSamples/blob/develop/LICENSE.md) 分开列出 Components 的 Open Software License、Core 的 Proprietary Software License 和模型的 Free Material License；第三方 wrapper 的许可证不能替代这些层的条款。本轮不引入其 runtime 或样例模型。
- 本轮选型建议只新增基于晴小团既有原创几何语言的代码内 SVG 部件，以及 Three 自生成的几何/颜色/背景。不要使用知名角色剪影、VPet 动画、未经逐件核查的工坊装备或网上“免费素材”；参考交互与技术方式，不复制角色资产。

## G. 不确定点清单

| 编号 | 未关闭问题 | 确认方式 |
| --- | --- | --- |
| U1 | 原创装备在浮动小画像、舞台及同时预览时的遮挡、叶片可辨识度与渐变隔离 | 后续真实 UI 检查，覆盖招呼、休息、拖动、深色和减少动态 |
| U2 | 晶体/方块远近轮廓、尺寸、选中环与实际射线拾取是否对应同一记录 | root 实际模型切换验收，覆盖筛选、选中、聚焦、相机保持及 WebGL 降级 |
| U3 | 多次切换样式与退出重入后的资源稳定性；弱 GPU 下预算是否适用 | 同一 renderer 观察资源变化并多次开关；真实设备验收，不能由面数替代 |
| U4 | 外观偏好在原生 EXE 重启/升级后是否保持，损坏或不可用存储是否仍可操作 | 浏览器和本轮 EXE 分别验收，记录 origin/应用数据目录及失败行为 |

这些属于实现与验收未知；目前未发现需要用户先拍板才可继续调研的阻塞项。不在此报告暗示 readiness 或后续 Gate 已通过。

## H. 给 readiness reviewer 的最小可核查证据

- 用户范围：`docs/current/pet-space-customization/README.md`。现有边界：`docs/Spatial.Experience.md`。
- 代码锚点：`PetCompanion.tsx` 的 `PetPortrait`、`usePetBehavior`、`PetCompanion`、`PetShowcase`；`pet.css` 的 `.pet-body`、`.pet-gaze`、减少动态；`spatialScene.ts` 的 `rebuild`、`up`、`dispose` 和 `SphereGeometry(1, 10, 7)`；App 的显示偏好初始化与保存。
- 技术资料：上述 Three、MDN/W3C、VPet、Live2D、Tauri 及框架官方链接；访问日期均为 2026-10-04。搜索结果中的论坛/聚合页未作为技术或授权结论依据。
- 只读实验：用已安装 Three 包在 Node 中分别构造上述四种几何，按 index.count 或 position.count 除以 3 计三角面，均读取了完整输出和退出码 0；输出分别为 sphere 88/120、icosahedron 60/20、octahedron 24/8、box 24/12。
- 观察到的检索未命中：首次在 `three/src/objects/Mesh.js` 搜 `dispose` 退出码 1、无匹配；随后在 `InstancedMesh.js` 与 `core/Object3D.js` 定位其实际继承实现并得到退出码 0。该检索结果不是功能测试通过或失败的证据。
- 未执行：代码 build/test、UI 服务、装扮或模型操作、GPU/能耗实测及原生 EXE 验收。开放未知为 U1–U4；本文件没有将它们写成已完成。

已阅读文件：本目录 README、Spatial.Experience、PetCompanion.tsx、spatialScene.ts、App.tsx 相关入口、pet.css 相关选择器、package.json，以及已安装 Three 的 package/LICENSE/InstancedMesh/Object3D 源片段。

无新增跨功能事实；原创、本地数据和单一关系所有者的约束已在项目现有文档中，未重复提出归档候选。
