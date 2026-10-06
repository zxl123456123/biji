# 3D 记录空间与动态宠物：业界调研

调研日期：2026-10-04。范围是晴笺应用内的 3D 记录展示与动态宠物；只记录一手证据与建议，不代表实现结果或最终方案。已读项目 `AGENTS.md`、本 feature 的 `README.md` 和当前 `package.json`。

## 版本与许可的实际查询

下面 npm 行来自本轮对官方 registry `/latest` 的实际 HTTP 查询，命令退出码为 0；GitHub 分支版本与 npm 发布版本分别标注。`unpackedSize` 是 npm 包解包总量，包含源码、示例等，**不是最终 Vite 产物、下载量或 gzip 体积**。

| 候选 | 当前观察 | 许可与主源 | 对晴笺的含义 |
| --- | --- | --- | --- |
| Three.js | npm `0.186.1`；`unpackedSize=20443256`。GitHub releases 标记 `r186`，所查 `dev/package.json` 为 `0.186.0` | [registry](https://registry.npmjs.org/three/latest)、[发布页](https://github.com/mrdoob/three.js/releases)、[包源码](https://github.com/mrdoob/three.js/blob/dev/package.json)：MIT | 独立 Three.js + 官方 OrbitControls 足以提供真正可旋转、缩放、点选的 3D 视图；实际增量须在构建后测量 |
| `@types/three` | npm `0.186.0`；`unpackedSize=1930073` | [registry](https://registry.npmjs.org/%40types%2Fthree/latest)：MIT | 类型属于开发依赖，不计入运行时包体积；应与所选 Three 版本匹配 |
| `@react-three/fiber` | npm/GitHub `9.8.1`；npm `unpackedSize=2378458` | [registry](https://registry.npmjs.org/%40react-three%2Ffiber/latest)、[源码](https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/package.json)：MIT | Three 的 React renderer。已查版本要求 React `>=19 <19.4`、Three `>=0.156`，并增加自己的运行时依赖；需核对锁文件而不能凭项目中的 `latest` 判断兼容 |
| `react-force-graph-3d` | npm `1.29.2`；`unpackedSize=14221103`。宿主 `react-force-graph` 仓库包版本 `1.48.3` 是不同包 | [registry](https://registry.npmjs.org/react-force-graph-3d/latest)、[README](https://github.com/vasturiano/react-force-graph/blob/master/README.md?plain=1)、[宿主包](https://github.com/vasturiano/react-force-graph/blob/master/package.json)：MIT | 包含 `3d-force-graph`、`react-kapsule` 等依赖。擅长持续力导向图，不能用 npm 解包量推断实际增量 |
| `pixi-live2d-display` | npm稳定 `0.4.0`、Pixi 6 peer dependencies；GitHub master `v0.5.0-beta`、Pixi `^7.0.0` | [registry](https://registry.npmjs.org/pixi-live2d-display/latest)、[master包](https://github.com/guansss/pixi-live2d-display/blob/master/package.json)、[LICENSE](https://github.com/guansss/pixi-live2d-display/blob/master/LICENSE)：插件代码 MIT | 插件、Cubism Core、模型资产是不同许可层；不能把插件 MIT 当成模型可自由使用的证明 |
| VPet | 检查 `main` 与 README；此轮网页读取未得到可核实的最新发布版本，故不填写版本号 | [项目](https://github.com/LorisYounger/VPet)、[英文README/架构与资产许可](https://github.com/LorisYounger/VPet/blob/main/README_en.md?plain=1)：代码 Apache-2.0；自带动画另有授权 | 成熟桌宠参考，但 WPF 内嵌方式不直接适配 React/Tauri。参考行为与显示分层，自带动画不复制 |
| Shijima-Qt | GitHub发布页标记 `v0.1.0` 为 Latest | [项目](https://github.com/pixelomer/Shijima-Qt)、[发布页](https://github.com/pixelomer/Shijima-Qt/releases)：GPL-3.0 | 可参考走动、拖拽、单窗口运行等产品行为；本轮不复制代码或角色资产，也不新增 Qt 原生运行时 |

## 3D 渲染：采用和不采用的依据

Three 官方把地图、3D 编辑器与 3D 图生成器列为按需渲染适用场景；变化发生时才请求一帧。静止时无限 rAF 会浪费电量。OrbitControls 的 `change` 可触发渲染；有 damping 时应去重排帧并继续 `update()` 直至停稳，不能在 `change` 监听器中同步递归 render。[官方按需渲染教程](https://threejs.org/manual/pages/rendering-on-demand.html)

OrbitControls 原生提供围绕目标旋转、缩放和平移。手动改变相机后要 `update()`；启用 damping 或 autoRotate 时也要更新。建议沿用它已成熟的相机输入，避免为本轮记录空间自己造完整相机控制器。[OrbitControls 官方文档](https://threejs.org/docs/pages/OrbitControls.html)

R3F 支持 `frameloop="demand"`、`invalidate()` 和资源共享，可减少声明式场景维护负担；但本轮只有一个新增 3D 入口，直接 Three 更容易沿既有组件生命周期管理，避免新增 React renderer 层。该判断是基于任务规模的取舍，**不是认定 R3F 较慢**。[R3F 性能文档](https://r3f.docs.pmnd.rs/advanced/scaling-performance)

react-force-graph 系列已有力导向布局、hover/click、拖拽与相机接口，适合目标就是力导向图的场景。但其 `pauseAnimation()` 同时冻结视图并取消用户交互，不能直接充当“暂停自动动画但仍可旋转/点选”的按钮。晴笺已有关系数据，本轮若只增加空间展示，可用直接 Three 渲染现有派生节点与边，避免新物理仿真、重复图状态与较深依赖。[官方 README 的 Render control](https://github.com/vasturiano/react-force-graph/blob/master/README.md?plain=1)

**资源释放是实施要求**：移除 Mesh 不会释放其 geometry/material；材质释放不会顺带释放 texture。退出视图、React StrictMode 重挂载与失败初始化时，要取消 RAF、移除监听器/观察器，释放控件、renderer 和本视图拥有的 geometry/material/texture；共享对象避免重复释放。`renderer.info` 可辅助检查重复进入时的增长。[官方对象释放说明](https://threejs.org/manual/pages/how-to-dispose-of-objects.html)、[官方 Cleanup](https://threejs.org/manual/pages/cleanup.html)

## 动态宠物：借鉴行为，原创表达

VPet 把显示、动画资源、行为逻辑与宿主窗口分开，还把点击工具栏/消息气泡作为互动入口。这种分层值得借鉴；晴笺只需简小的 idle / looking / greeting / happy / resting / dragging 等有限状态与短时反馈，无需移植养成数值、MOD、商店或 WPF 框架。上述状态集合是建议，并非 VPet 的原样状态表。[VPet 架构](https://github.com/LorisYounger/VPet/blob/main/README_en.md?plain=1)

Shijima 的单窗口模式说明宠物可以在应用内活动，无需先实现桌面跨窗口附着、系统权限、窗口追踪与全局输入。本轮用户要求展示和互动，应用内有边界的宠物区域足以形成可验收能力。[Shijima 项目](https://github.com/pixelomer/Shijima-Qt)、[单窗口模式发布记录](https://github.com/pixelomer/Shijima-Qt/releases)

Live2D 成熟方案提供视线追随、命中区动作、表情、动作淡入淡出；但 pixi 插件需要额外加载 Cubism Core 和模型设置/纹理/动作等资产。Core 按专有许可从官网提供；发布条款也与插件 MIT 分开，官方确有个人/小规模企业豁免及例外，不能笼统写成“全部收费”或“全部免费”。因此本轮参考自然的眨眼、呼吸、目光、短动作表达，使用原创 SVG + 既有 Motion/CSS 或原创几何宠物更贴合离线、体积和交付边界。[插件README](https://github.com/guansss/pixi-live2d-display/blob/master/README.zh.md)、[动作/表情文档](https://github.com/guansss/pixi-live2d-display/wiki/Complete-Guide)、[Cubism Core 官方说明](https://docs.live2d.com/en/cubism-sdk-manual/cubism-core/)、[官方发布许可](https://www.live2d.com/en/sdk/license/)

VPet 自带动画的商业/分发限制另行声明；Shimeji 角色也不能由引擎许可推导授权。不要下载不明模型、抄现有角色或为了外观添加远程 CDN。可参考“宠物会动、有视线和情绪、可轻触与拖动”的体验，角色造型、路径和动作自行创作。[VPet 资产许可](https://github.com/LorisYounger/VPet/blob/main/README_en.md?plain=1)、[pixi 插件与示例模型许可区别](https://github.com/guansss/pixi-live2d-display/blob/master/README.zh.md)

## 输入、暂停、离线与预算建议

- **鼠标/触屏**：统一 Pointer Events；拖动开始 capture 指针，结束/取消/丢失 capture 都恢复状态。小宠物区域或 3D canvas 才设置需要的 `touch-action`，避免把整个页面滚动禁掉。区分轻触和已越过阈值的拖动，避免拖完误触动作。[Pointer capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture)、[touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action)
- **键盘与动画偏好**：宠物主入口使用可聚焦按钮，提供暂停/恢复、收起等清晰控件；`prefers-reduced-motion` 下停自动旋转、漂浮和反复大幅动作，保留点击/选中。暂停装饰动画后仍应允许相机输入与记录点选。[动画偏好文档](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- **隐藏时停止**：视图卸载和 `document.hidden` 时停止定时器/RAF；恢复时重设计时基准，避免一次累计很长的动画时间跳变。不能只依赖后台浏览器节流。[Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- **离线**：Three 与宠物 SVG 随构建本地打包，按入口懒加载；交互和动作不请求模型、字体、声音或 AI。笔记关系来源保持已有本地数据，空间位置只表达排布维度，不能声称产生新的语义关联。
- **预算**：优先一个 3D canvas、有限节点、共享几何/材质、低复杂度宠物；不引入后处理、真实阴影、骨骼、贴图或模型下载器。构建时记录新增 JS/gzip、进入延迟、节点上限与视图隐藏后的行为；npm 解包大小只用于包内容观察，不能拿 20 MB 作为用户下载成本。任何目标帧率或大小上限仍须由实测确认。

## 检索边界与失败记录

- `https://github.com/vasturiano/react-force-graph-3d` 的网页读取返回 Internal Error；该 npm 包实际由 `react-force-graph` 主仓库发布。已改用主仓库 README 和官方 registry 核实，未把失败链接当证据。
- GitHub VPet releases 页面此次未提供可核实的发布号；只引用已读 main/README 的技术和许可事实，不声称已查出最新 VPet 版本。
- 本轮没有安装依赖、下载角色资产、修改功能代码或跑 3D 性能测试；上述资源与交互建议等待最终实现和实测。
