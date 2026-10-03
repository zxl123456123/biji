# 晴笺月份记录花园：只读调研与 MVP 建议

调研日期：2026-10-03。任务约束：不修改项目；不改既有关联图引擎；不新增关键外部依赖；本文件是候选方案，不是已实现或已验证事实。

主编排者后续通知：实际实施使用独立 worktree 的 0.3.0 基线，只依赖 Note，主目录 0.5.3 保持不动。以下代码事实来自任务指定读取的主目录快照，不能据此声称 0.3.0 已有 `dateKey`、主题或动态 gate；在独立基线应用时应核实并用同一 Note 字段派生，不接入主目录图引擎。接口建议不依赖这些较新模块。

## 1. 代码事实

- `src/types.ts` 的 Note 有 `id / content / createdAt / updatedAt? / scheduledDate? / done / deletedAt?`。没有每日写作时长、编辑事件历史、情绪或连续记录奖励字段。
- `src/recordTools.ts` 的 `dateKey` 按浏览器本地时区得到 `YYYY-MM-DD`，现有 `selectNotes` 区分回收站并复用搜索、标签与未完成筛选。
- `src/App.tsx` 保存新增记录时用 ISO 时间写 `createdAt`；编辑只改变 `updatedAt`。已有 `motionAllowed` 综合动态偏好、系统减弱动态、页面可见性与编辑/面板状态。
- `src/NoteGraph.tsx` 当前使用 D3 窄模块与 Canvas 2D，自管模拟、命中、30 FPS 动画与会话镜头；不使用 Three.js。`docs/Note.Graph.md` 明确派生模型、Canvas、存储互不混用，以及不能把截图、构建当 GPU 帧率证据。
- `src/styles.css` 已有浅深主题变量 `--surface / --text / --muted / --line / --accent / --green`，原生按钮焦点样式，320 px 页面最小宽度及 `.motion-disabled`。
- 读取时 `package.json` 为 0.5.3，已有 React、motion 与 D3，无 Three.js、R3F 或 glTF 资源依赖。此处只报告读取快照，不推断其他 session 的版本工作。

## 2. 官方实现路线比较

| 路线 | 已知能力与成本 | 本轮取舍 |
| --- | --- | --- |
| CSS `perspective`、`rotateX/Y`、`transform-style: preserve-3d` | 把 DOM 平面放到共享三维坐标；日期可继续用原生按钮，不需要 WebGL 上下文或模型资源。需处理面排序、遮挡与扁平化，不能当成带灯光和几何体的完整 3D 引擎 | 采用有限的月份立体记录柱；限制视角，保持日期和数量文字平稳 |
| Three.js `WebGLRenderer` | 支持几何、材质、灯光、相机、glTF。静态场景可按需绘制；引入渲染器、上下文失效、像素预算、资源释放与可访问 DOM 对照 | 当前 31 个日期没有充分收益；不替换现有图引擎 |
| React Three Fiber | React 场景描述与 `frameloop="demand"`；`Canvas` 提供无 WebGL fallback，但上下文崩溃仍需错误边界。依赖 Three.js；动画与 DOM 生命周期还需协调 | 当确有可旋转模型和多组件 3D 场景需求再评估，不只为日期小花园引入 |
| glTF/GLB 模型 | Three.js 官方 `GLTFLoader` 是需显式导入的 addon；资产可能包含纹理与动画，压缩方案还涉及 decoder | 机器人或家具以后需要真实三维模型时可用；本轮像素机器人更宜本地 sprite/SVG/CSS，不把模型加载成本绑到日历 |

来源：[W3C CSS Transforms 2](https://www.w3.org/TR/css-transforms-2/#transform-style-property)、[Three.js 按需渲染](https://threejs.org/manual/pages/rendering-on-demand.html)、[Three.js 资源释放](https://threejs.org/manual/pages/cleanup.html)、[R3F 性能与按需帧](https://r3f.docs.pmnd.rs/advanced/scaling-performance)、[R3F Canvas 与 fallback](https://r3f.docs.pmnd.rs/api/canvas)、[Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html)。

CSS 规范的关键坑：`preserve-3d` 不继承；共享 scene 的中间层需要明确设置。同层 `opacity < 1`、非 none 的 `filter`、`overflow: hidden/auto`、`isolation: isolate` 等会强制扁平化，不能为整个 scene 加透明度或模糊来实现柔和效果。应在单独外壳裁切，装饰阴影与颜色放到叶子面，scene 根保留完整三维坐标。该限制来自规范，不是项目 bug。

## 3. 推荐 MVP（设计建议，尚未实施）

做“月历 / 记录花园”两个显示选项，消费同一月度日期模型与同一选中日期，避免数字不一致。默认月历提供最快扫读，花园用于看本月记录分布。星期仍是横向 7 列；每个日期一个小地块，记录越多柱体越高。点击日期，下方或侧边显示当天记录及原编辑入口。

计数语义：非回收站 Note 按 `dateKey(new Date(note.createdAt))` 归日；编辑不新增一条创作记录，计划日期不转移到未来；删除后柱体变低，恢复后恢复。对用户说明“按创建日期统计当前保留的记录”，不要写成历史打卡或实际编辑活跃度。若父视图传入搜索结果，要明确“当前筛选”；默认建议全量非回收站笔记，不受既有 60 条卡片分批影响。账目和笔记是不同数据，MVP 不混成无法解释的柱高。

视觉：淡紫与柔绿，低角度固定透视，最大柱高约 40–48 px；柱高采用清楚的分档，例如 0 / 1 / 2–3 / 4–6 / 7+，附图例，精准数量继续以文字显示。不要让“7+”封顶暗示所有高柱等量。空日期有平地且可点看空状态，不制造负面提示；今天有边框与文字，选中有独立描边，不只靠颜色。月份总数、有记录天数、最多记录日可用真实聚合解释；无需新增数据库。

为控制遮挡，不提供自由旋转、自动镜头、鼠标陀螺视差或漂浮整个文字面。小场景本身已经提供景深；用户主动切换或选择时只做一次短过渡。静止页面无需 rAF、定时器或连续动画。

可选手动视角限少量离散角度按钮，例如“俯看 / 侧看”，或有清楚标签的受限 slider；只改装饰层角度，日期、数量、焦点与点击区域保持稳定。是否加入取决于独立基线实现体量，MVP 不需要拖拽镜头。

## 4. 独立组件边界（接口建议）

```ts
type RecordDay = {
  date: string // Local YYYY-MM-DD
  count: number
  noteIds: readonly string[]
}

type RecordGardenProps = {
  days: readonly RecordDay[] // All actual dates in one displayed month
  selectedDate: string | null
  today: string
  animate: boolean // Use the existing application motion gate
  onSelectDate: (date: string) => void
}
```

组件只渲染日期地块，不持有或写 Note，不加载模型、远程资源、SQLite，不重复提取标签正文，不复制 NoteGraph 的 session、worker、相机与图模型。月份切换、详情、原编辑/删除由父层处理。在独立 `RecordGarden.tsx` 与 `recordGarden.css` 中实现，类名统一 `record-garden-*`，不修改共享主题定义；可作为日历开发者和主编排者之间的窄接口。

`RecordDay` 类型可来自日历聚合模块；若父层已有相同模型，直接复用其命名，避免另建通用图表框架。花园只有一个使用点时不需要 renderer 插件接口、全局 context 或可配材质系统。

## 5. 性能、访问与降级

- 性能：固定一月最多 31 个日期；每日期 3 个可见面足够，上/前/侧面为 `aria-hidden` 装饰。不会随全量笔记 DOM 数量增长。聚合只随 notes/月变化，不随 hover、柱高过渡或帧循环反复遍历正文。
- 键盘：原生 `button` 支持 Tab、Enter 与 Space；姓名为“2026 年 10 月 3 日，3 条记录”；选中用 `aria-pressed`；非实际日期的前后占位不做按钮。不声明 ARIA grid，除非完整实现方向键与焦点合同；原生按钮已经有可操作边界。
- 阅读：每个日期的数字、数量和焦点必须在未旋转的可读层或不被柱体盖住。装饰层 `pointer-events: none`；实际按钮有稳定矩形点击区域。不能把 hover tooltip 当唯一说明。
- 动效：沿用 `animate`；CSS 再用 `prefers-reduced-motion: reduce` 关闭过渡。关闭动态保留立体静态布局与点击。系统减动的目标是替换或移除非必要运动，[W3C Media Queries 5](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion)。
- 浅深主题：消费既有 CSS 变量，为三个面做明确层次；深色使用柔和明暗差，避免纯黑面与发光/blur 堆叠。实际 WCAG 对比度需实测，不能由主题变量名称保证。
- 窄屏：320–420 px 保留日期矩阵，缩小装饰景深与柱高；不旋转整个网格导致出屏。尺寸不足时直接平面月历，仍能选日和读数量。平面/月历入口常驻，视图切换不丢选日。
- 无 GPU：CSS 不依赖应用 WebGL 初始化，故没有 WebGL 失败白屏。但 CSS 3D 仍可能由合成器/软件渲染，不能保证无 GPU 下性能；用 `@supports` 提供 2D 基线，并保留用户选择的月历入口。`@supports` 只证明语法支持，不证明 GPU 可用。真实 WebView2 软件渲染必须另验。

## 6. 验证边界

应验证的聚合案例：闰年/非闰年二月，跨年切月；本地午夜两侧的 ISO 时间；同日多条；删除与恢复；更新不改变创建日；scheduledDate 不影响；无记录月；大集合仍只渲染当月 31 日期；搜索/筛选和总量口径一致。

应验证的实际界面：日历/花园选日同步；Tab 焦点、Enter/Space 与显示名称；浅深、320 px、200% 缩放、减动、关闭动态；高柱不盖日期、点击边界、切月后选中处理；不新增网络请求；编辑前后笔记保存/回填路径和备份格式维持。

项目要求至少 `npm run build`。CPU/GPU 占用、WebView2 软件渲染和帧率只能由实际页面/桌面观察支持，不能从“没有新依赖”或截图推出。此只读调研没有实施代码，没有运行产品测试，没有任何已见测试失败；不声称 MVP 已通过构建、交互或兼容性验证。

## 7. 不确定项

- U1：用户是更喜欢“记录柱”还是植物外形；MVP 用可计数柱体现用处，之后可换装饰外观，统计和选日边界不变。
- U2：是否需要账目共同统计；当前没有把不同单位混入一张高度图的授权或明确语义，留给后续产品选择。
- U3：本地时区随设备变化会使历史 createdAt 的归日变化；当前数据没有“创建时当地日期”。复用现有项目时区口径，不为本轮新增迁移，文案说明本地日期即可。
- U4：其他 session 可能正改 App、NotesView、styles；本轮应由一个主编排者统一接入，新组件文件单独归属。此报告写在临时目录，未修改这些文件。
