# 晴笺本地小机器人调研

日期：2026-10-03。角色：只读调研；没有修改项目代码，没有下载模型或图片。本功能是晴笺内的小伙伴，不是 ChatGPT Work Pets。

## 结论

推荐第一版用代码内 SVG 方格机器人，加少量 CSS 帧式眨眼。让它成为日期回顾卡片的入口：展示“这天新建了几条记录”“今天安排了几条未完成记录”，提供“写一条记录”按钮。机器人与日历、3D 日景共用同一份派生摘要，不保存养成进度，不主动打扰。3D 机器人先留为第二阶段可替换的外观，避免为了一个小形象引入模型加载、骨骼动画和常驻渲染。

这是基于本项目低干扰、本地优先、启动速度与界面舒适度边界作出的取舍；不是技术上不能支持 3D。

## 当前代码事实

- `src/App.tsx` 已有 `activeNotes`（排除回收站）、`motionAllowed`、`ambientEnabled`、系统 `reducedMotion`、`pageVisible`。`motionAllowed` 同时检查编辑器、快速打开、标签弹层和 AI 面板，新的宠物动效可以直接接收该布尔值。
- 现有新建入口为 `setComposer({ type: 'note' })`，宠物按钮应调用父组件提供的 `onCreate`，不要复制编辑器或自己写存储。
- `src/types.ts` 的 `Note` 含 `createdAt`、可选 `updatedAt`、可选 `scheduledDate`、`status`、`done`、可选 `deletedAt`。没有宠物状态，也没有每日情绪字段。
- `docs/Product.Direction.md` 将温和回顾列为未来可能，禁止为了炫技扩大成复杂数据库、无限画布或插件市场。
- `createdAt` 的当地日期是“这天新建记录”的证据；`scheduledDate` 是安排日，不能标成“这天做过记录”；`updatedAt` 只有最后一次更新，不能当作完整修改历史。`done` 也没有完成时间，不能宣称“这天完成了 N 条”。

## 有用而有限的 MVP

### 显示与入口

将机器人放在记录日历/日景旁的小回顾卡片内，不悬浮盖住正文，不在每个页面跟随用户。约 48–72 CSS 像素即可辨认，留出正常文本区。

- 默认今天：`今天新建了 3 条记录`、`今天安排的记录还有 2 条未完成`。
- 选历史日期：`10 月 1 日新建了 2 条记录`，配“回顾这天”的正文列表入口。
- 空白日期：`这天还没有新建记录`，平静形象，不显示失落/衰弱表情。
- 主按钮为“写一条记录”；需要回到当日时提供“回到今天”。过去日期的“写一条记录”仍打开现有新建编辑器，不偷偷把创建时间改到过去，不暗示日期已经回填。
- 提供“隐藏小伙伴”；用当前页面内 React 状态控制即可，不新增持久化偏好。隐藏后在日回顾卡片保留“显示小伙伴”的小按钮，不影响统计、日历或新建入口。
- 可以让新建成功后机器人短暂点亮屏幕或挥手一次；这是操作确认，可与已有 toast 同时出现，但不要求新的全局事件机制。第一版也可只随数量变化改静态状态。

机器人不是待办管理器。若展示“未完成”，必须明确范围（今天安排/选中日期安排），不把全局未完成总数和当日数混用。不展示连续打卡、排行榜、饥饿、经验、离线惩罚或红色催促文案。

### 视觉实现比较

| 方式 | 价值与代价 | 第一版判断 |
| --- | --- | --- |
| 自绘方格 SVG | 十几到几十个 `rect`，可随主题换色，无额外图片、解码、网络请求或渲染引擎；实际代码体积待实现后测量 | 推荐；容易做项目自己的形象 |
| CSS 方块 / 多重 `box-shadow` | 纯代码、本地；像素造型简单时可用，但复杂形象会变成难维护的长阴影串 | 简单天线/眼睛可用，完整造型用 SVG 更直观 |
| 本地 PNG sprite + CSS `steps()` | 适合真实逐帧像素动作；可用 `image-rendering: pixelated` 放大；需要明确帧尺寸、透明留白、导出和许可 | 美术确定后升级；不必提前搭动画框架 |
| GLB 骨骼机器人 | 可在 3D 日景中站立、指向选中日期；额外付出模型加载、动画 mixer、材质、照明、设备性能与 WebGL 降级处理 | 可选后续；按需加载并提供静态 fallback |

MDN 明确给出 SVG 用 `role="img"` 与整体标签的做法；若旁边已有完整文字说明，机器人可作为装饰隐藏于辅助技术。`aria-hidden="true"` 不能放在包含可聚焦按钮的父节点上。[ARIA img role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/img_role)、[aria-hidden](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden)。

CSS `steps()` 用离散帧变化；sprite 可以避免平滑插值而保留像素感。`image-rendering: pixelated` 影响缩放算法，实际画面仍需在整数倍与非整数倍下核验。[CSS easing function](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function)、[image-rendering](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/image-rendering)。

## 现成资产的许可与体积

| 候选 | 可核验许可 | 可核验体积 | 与晴笺的适配 |
| --- | --- | --- | --- |
| Kenney Robot Pack | 官方资产页写 CC0；作者上传页写署名非强制 | 作者上传页显示整 ZIP 为 369.3 Kb（页面原单位），含 50 PNG、spritesheets、vector source；单个角色/帧大小本次未核验 | 可以做本地 2D 机器人，但页面描述为 flat 平面风格，不能只凭名字声称已是像素宠物 |
| RobotExpressive（three.js 官方例子） | 模型自身 README 明确 CC0 1.0，原作者 Tomás Laulhé，Don McCurdy 做转换/表情等修改 | 官方 GitHub 文件页面显示单个 GLB 为 453 KB；运行时和 GPU 开销不含在这个大小内 | 更适合可选 3D 机器人，有现成动画演示；与像素美术不是同一种表现 |
| Kenney Blocky Characters | 官方页写 CC0，3D、带 animation | 官方页显示 20 个文件，但未显示包或单模型字节体积，本次未知 | 方块 3D 风格有参考价值；不能无证据称其更轻 |

来源：[Robot Pack 官方页](https://kenney.nl/assets/robot-pack)、[作者上传与文件说明](https://opengameart.org/content/robot-pack)、[RobotExpressive 模型 README](https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/RobotExpressive/README.md)、[官方 GLB 文件元数据](https://github.com/mrdoob/three.js/blob/dev/examples/models/gltf/RobotExpressive/RobotExpressive.glb)、[Blocky Characters](https://kenney.nl/assets/blocky-characters)。仅浏览元数据与说明，未下载资产；没有把压缩包大小误认为应用最终增量。

取舍：先采用自绘代码内 SVG，减少外部资产与模型运行时；Kenney 2D 资产用于后续美术评估，RobotExpressive 用于后续 3D 的可核验候选。若真正引入第三方资产，应固定版本/提交、随仓库保存原许可与来源，而不是运行时访问 CDN。

## 与日期/3D 视图的接口

推荐父级负责日期、统计、记录筛选和新建操作；宠物纯展示，不接数据库，也不做重复统计。最小 props 可为：

```ts
type RecordCompanionProps = {
  selectedDate: string
  isToday: boolean
  createdCount: number
  scheduledUnfinishedCount: number
  animate: boolean
  onCreate: () => void
  onToday: () => void
}
```

这只是建议接口，不是已实现代码。`selectedDate` 使用当地 `YYYY-MM-DD`，不要用 UTC `createdAt.slice(0, 10)` 直接算当地日期。汇总层必须明确排除 `deletedAt`，且不要通过宠物更改 `Note` / SQLite / 备份 schema。

2D 日历、3D 日景和机器人都从同一 `selectedDate` 与摘要读取；点击日期修改同一状态。机器人只在 DOM 卡片里展示即可，不必将它变成 3D 场景的可点击模型。这样键盘、读屏及 WebGL 不可用时仍能回顾和新建。

如果后续采用 3D 模型，外观可以换成场景内的角色，但保留同一 DOM 文本和按钮；不要把核心入口仅藏在机器人身体上的 raycast 交互里。

## 动效、可访问性与安全边界

- 接收现有 `motionAllowed`；关闭动态、系统减少动态、页面隐藏或编辑弹层打开后，停止循环动画并显示可理解的静态形象。MDN 表明系统的 reduced-motion 偏好用于移除、减少或替换非必要运动。[prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)。
- 第一版眨眼/天线亮起即可；不追随鼠标、不大范围走动、不自动相机旋转、不频繁跳跃或声音。
- 颜色不是唯一含义，记录和未完成数量都用文本显示。日回顾入口及新建使用正常 `<button>`，具备明确名称和键盘焦点。
- 若 SVG 是装饰，设置其 `aria-hidden`，文本与按钮仍暴露；若 SVG 承载独立状态，使用有含义的整体名字。无需不停朗读眨眼或表情变化，不新加周期 `aria-live`。
- 只使用内置可信 SVG 或固定本地资产，不接受/渲染记录正文中的任意 HTML/SVG，不改变现有纯文本边界。
- 不读取完整正文来“猜测心情”，不联网请求模型或 AI，不启动通知、后台提醒或原生悬浮窗，不申请 Tauri 新权限。

## 实施隔离建议

新组件与样式放独立命名文件（例如 `RecordCompanion.tsx`、`record-garden.css`），统计接口由负责日历的模块给出。`App.tsx` 入口接线由主代理统一处理，避免多个 session 同时修改主文件。不要修改编辑器、桌面桥接、存储、类型或后台 Rust。这个建议须结合主代理实际会话与 worktree 核查落实。

## 后续验收重点（尚未实施）

1. 当地日期统计在 UTC 跨日时正确；排除回收站；“新建”与“安排”分别显示。
2. 新建按钮复用现有编辑器；选历史日期不篡改创建时间。
3. 浅色/深色、窄屏、键盘和读屏均可访问正文入口及按钮。
4. 系统减少动态、应用关闭动态、隐藏页面与打开编辑器后静止；停止动画后统计与入口可用。
5. 若后续加入 WebGL，WebGL 不可用/模型加载失败时 DOM 卡片保持可操作。

## 已见限制与失败

- 首次尝试从 Khronos glTF Sample Assets 路径读取 RobotExpressive README 返回 404，不能作为资产存在或许可的证据；随后改查 three.js 官方示例目录，核到真实 README 和文件元数据。
- 网页核验只能证明可引用的许可/大小信息；没有下载、运行或视觉检查这些模型。Blocky Characters 的实际体积未知。
- 本次只写调研产物，未执行应用 build 或界面验收，不作任何功能已实现的结论。
