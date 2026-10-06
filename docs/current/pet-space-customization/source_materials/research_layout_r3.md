# R3 装扮操作布局：定向调研

日期：2026-10-05。角色：repo_researcher。仅记录真实源码、历史验证和业界参考，未改产品、状态、旧文档或 Git，未运行浏览器、构建或测试。本报告不作为功能验收结论。

用户授权输入：上一答复第一项「桌面左侧固定角色预览，右侧分组配置；窄屏紧凑预览和应用栏；换装轻柔过渡、点击回弹，显示试穿中／已穿上」，随后用户「继续吧」。本报告仅覆盖这一个目标，不扩展到空间搜索、性能重构或发布范围变更。

权威承接输入为 [clarifications.md 的 R3/L1–L3](../clarifications.md) 与 [feedback_layout_20261005.md](feedback_layout_20261005.md)，已实际读取新追加段落：仅共享组件两产品文件、无新增配置状态/第二宠物/调度；0.7.1仅从5190冻结源复制的隔离发布副本生成。同范围EXE授权已由root记录，不将R2不打包的历史边界延用于R3。

## A. 系统边界与现有能力

- `src/PetCompanion.tsx:190–237` 的 `PetShowcase` 已有五角色、三配色、三头饰、三配件、三套组合；全部通过既有 `draft` 试穿，应用回调才改变宿主已应用值。缩略图均 `animate={false}`，大预览承接统一政策。
- `src/PetCompanion.tsx:195–202` 通过四字段比较区分试穿/已应用；应用回调返回保存是否成功，失败文案明确「本次使用中生效但未能保存」。新布局不能把该信息隐藏成只有成功图标，也不能让选择直接保存。
- `src/App.tsx:47–50` 为已应用值唯一 owner；先解析、更新会话值，再尝试本机写入。此轮没有数据/外观枚举迁移需求。
- `src/PetCompanion.tsx:29–37` 为既有有限目录；当前操作均可在静态模式下使用。免费、无支付/养成经济边界见 `clarifications.md:13–20`。

## B. 入口与主流程

- 独立入口：`src/App.tsx:186–192`，`.content.pet-workspace` 内直接使用 `PetShowcase`。
- 旧入口：`src/SpatialNoteMap.tsx:39–48`，`.spatial-content` 的 `mode === 'pet'` 使用同一个 `PetShowcase`，未包在 `.spatial-map-panel` 或画布里。旧空间标题与视角切换控件仍在组件前方。
- 流程：按钮选择 → `preview()` 检查 `interactive` → 修改 `draft`、清空旧保存信息 → 大预览立即更新 → 「穿上这套」回调 → App 已应用值更新 → `useEffect` 同步草稿。撤销试穿恢复宿主值，恢复原装只预览默认值，离页卸载丢弃草稿。对应事实见 `src/PetCompanion.tsx:191–202,223–234`。
- 动态/可操作政策：`src/App.tsx:113–115` 合成动态与业务许可；`src/PetCompanion.tsx:39–66` 合成 focus、取消反馈/手势；`src/petBehavior.ts:38–43` 只有 present 且 focused 才 interactive，animate 另受动态许可、休息/拖动约束。关闭动态不等于禁用换装。

## C. 关键模块与滚动祖先

| 位置 | 已观察事实 | 布局影响（推断） |
| --- | --- | --- |
| `src/PetCompanion.tsx:204–236` | stage、copy、wardrobe 三兄弟；按钮/保存提示位于 wardrobe 全部配置之后 | 当前挑选较后配置时，大预览和主要应用操作分离 |
| `src/pet.css:30–45,116–140` | showcase 两列，stage min-height 420px；wardrobe 跨全行；submit 普通 flex，无 sticky/fixed | 不是受控工作区，滚动距离取决于整页配置高度 |
| `src/styles.css:19,27,55,301,325` | body 无 overflow；app-shell 最终 block、relative、isolation；workspace/content 无 overflow/固定高度 | 独立入口最近滚动容器目前是文档视口；此结论源于源码，未读浏览器 computed style |
| `src/spatial.css:1,3,9` | spatial-workspace 仅宽度/边距/padding，spatial-content 仅颜色；mode 在前方 | 旧宠物视角也跟随文档滚动；不可把地图面板的 overflow:hidden 当宠物祖先 |
| `src/styles.css:302,312,320` | light 层 overflow:hidden，导航/quick-tags overflow-x:auto | 这些是 showcase 的兄弟或非祖先，不阻断其 sticky |
| `src/spatial.css:16,src/styles.css:391` | 地图 panel、graph stage 有 overflow:hidden | 宠物不在里面；若后续把共享 showcase 移入这类容器，滚动假设失效 |

阅读了 `src/spatialExplore.css` 的容器规则，`data-explore=true` 样式限定地图模式；旧 pet 分支为 false，无新 overflow 祖先。`SoftInteraction`（`src/SoftInteraction.tsx:10–11`）为 provider/lazy wrapper，不额外生成滚动 DOM。

## F. 官方资料与适用结论

1. [MDN position](https://developer.mozilla.org/en-US/docs/Web/CSS/position)：sticky 依最近具有滚动机制的祖先和包含块；需要轴向非 auto inset。overflow hidden/auto 的祖先即使实际不滚动也会影响定位。固定定位从正常文档流脱离，且祖先 transform/filter 会改变包含块。这解释了为什么布局验证必须读真实祖先，不能仅见 `position: sticky` 就认定可用。
2. [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)：用户系统偏好要求削减非必要移动；大范围缩放/平移有不适风险。现有 `src/styles.css:297,309` 全局去动画/transition，`src/pet.css:143,145` 禁用角色动画；新短反馈仍须承接业务关闭动态和本机系统偏好，失焦亦由现有 pet policy 控制。
3. [web.dev 高性能 CSS 动画](https://web.dev/articles/animations-guide)：移动/缩放、透明度优先使用 transform/opacity；layout/paint 属性动画需要评估。will-change 不宜预先铺开，只有实际绘制问题才考虑层提升。该资料没有为本项目规定某个必选毫秒值，也不能证明当前机器帧率。

适用判断（非详细方案）：现有原生 CSS 与共享 policy 足以承接这轮布局/短反馈目标，未发现需要新增动画库、通用配置引擎或五套计时器的证据。父任务可沿现有结构确定有界布局，保留一个 PetPortrait 大预览与静态缩略图；不把官方原理伪称为已测试优化。

## G. 不确定点与重点风险

- U1：实际文档滚动元素、sticky 包含块与祖先 computed style 未现场核对。确认：root 在独立伙伴页与旧 3D pet 视角分别检查祖先/滚动前后几何，不能互相代替。
- U2：375px 宽度及矮视口的新布局未实现/实测。当前 `src/pet.css:141–144` 在≤1080将细节改为单列，在≤720将 showcase 改为一列、stage min-height 330px；intro、五角色两行及其余组均继续占据纵向空间。上预览/下应用栏都固定后可能挤压可浏览区域（推断），须覆盖R3要求的375×667与375×500，并检查最后一个配置/焦点没有被栏遮挡。
- U3：桌面列宽收缩与低高度未测。stage 当前≥420px 且含文案/互动；若 sticky 包含整个预览+介绍，高度大于视口时可能无法看到底部互动（推断）。确认：R3要求的1100×780、常规宽桌面，必要时补1100×600；位置策略需允许全部内容可达，不能以裁切角色/长耳解决。
- U4：键盘顺序与被固定栏遮挡情况未测。控件保留 `button`、`aria-pressed`、group 与全局 focus-visible（`src/styles.css:23–25`）；视觉重排不能把用户 tab 顺序变成远距离来回跳动（推断）。确认：从预览到选择到提交逐项 Tab，尤其页面底部选项。
- U5：新的变装动效可能与既有 `.pet-body` 动作竞争 transform（推断）。已有角色呼吸、跺脚、挥手由内部 SVG 图层关键帧控制（`src/pet.css:25–29,61–84,91–113`）；短反馈是否影响 mood/休息需要实测，不能重新触发整组件 mount 丢失休息状态。
- U6：应用失败提示较长，窄屏/200%文本缩放可能撑高动作栏（推断）。确认：真实持久失败文案路径或受控夹具；保留全文、正常换行、末尾内容可达；仅视觉调整不授权修改存储失败行为。
- U7：新悬浮层与现有 modal z-index40、toast z-index50（`src/styles.css:143,230`）的覆盖关系未测。确认：新建记录/AI 等遮罩打开时不盖住或绕过禁用政策。
- U8：同源隔离、EXE/原生 WebView、系统减少动态、触屏/读屏、后台与持续GPU/FPS仍需 root 后续证据。不能复用 R2 Web 验证宣布 R3 或新安装包成功。

当前没有阻断此定向调研的用户问题；U1–U8 是明确的实施验证归属，不伪装成用户尚未回答的需求。未修改 `clarifications.md`。

## H. 给 readiness reviewer 的最小可核查证据

- 产品锚点：`PetCompanion.tsx:190–237`（草稿/应用和当前三块结构），`pet.css:30–45,115–145`（真实尺寸与响应式），`App.tsx:113–115,186–204,236–260`（同四政策/两入口/浮层隐藏），`SpatialNoteMap.tsx:39–48`（共享旧入口）。
- 滚动锚点：`styles.css:19,27,55,301–325,435–447` 与 `spatial.css:1–16,79–94`；实际视口结论仍须 U1 现场验证。
- 文档全读：`docs/current/pet-space-customization/README.md`、`clarifications.md`、`verification_entry_r2.md`；后者记录 5190 为仅入口增量的隔离 preview，工作区保留但该预览排除月历和主题探索。旧 EXE 未包含 R2，R3不得用整个工作区 App 覆盖隔离源。
- 历史证据：`verification_entry_r2.md:52–62` 的独立伙伴、应用/刷新、375/1100与旧3D兼容现场仅属 R2；`:69–88` 明确保留资源/Worker/GPU/原生未测与工具失败。此轮不升级这些结论。
- 本次读取有批量输出截断，随后指定文件/相关代码分块重读。一次可选目标文件存在性检查因新报告尚不存在使命令 exit1；不是产品失败。无本轮 test/build/UI 命令，没有相应成功断言。

无新增跨功能事实；上述规则均已有共享政策/既有项目边界。
