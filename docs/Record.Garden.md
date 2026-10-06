# 记录时光与本地小伙伴

日期：2026-10-05。✅ 当前功能在独立分支 `codex/record-garden` 维护，并已叠加到 0.6.0 主目录工作副本。分支基线仍为 0.3.0，主目录他人工作没有纳入提交；本轮没有发布桌面安装器。

## 日期作为回顾入口

只保留一种微立体月历：日期卡以薄底边、内侧高光和短阴影呈现厚度；日期、星期及实际数量不旋转。没有展示三选、视角切换、柱体或柱高图例。点日期查看当日记录，正文复用宿主的安全排版渲染；打开记录调用原编辑入口。超过 30 条时分批显示，日格和月摘要始终统计全量记录。

| 口径 | 依据 | 解释边界 |
| --- | --- | --- |
| 创建日期（默认） | `createdAt` 按设备当前时区转换为自然日 | 表示当前保留的记录在何时新建；删除后数量减少，不能还原完整历史活动 |
| 记录日期 | 合法 `scheduledDate`，缺省时取创建日期 | 可含补记、未来安排；非空但非法日期归未指定日期，不悄悄改写数据 |

`updatedAt` 只有最近保存时间，不用于每日活动；`done` 是当前状态，不能解释为当天完成了几条。所有口径排除回收站。无法识别日期的记录保留单独入口，不静默丢弃。模型不会写 Note、存储或数据库。

创建时间中的 ISO 日历分量也会先校验：例如 4 月 31 日归未指定日期，不采用 JavaScript 自动滚动后的 5 月 1 日；合法带时区时间戳仍按本机日期归日。若创建时间非法但指定日期合法，记录日期口径仍使用指定日期。

小写 `t/z` 也进行相同校验，保留合法带时区闰日；依据 [RFC3339 §5.6](https://www.rfc-editor.org/rfc/rfc3339#section-5.6)。聚焦、可见性和午夜刷新时读取宿主当前时区名；时区变化会使日期桶缓存重算。这是刷新触发边界，尚未实测 Windows 系统时区更改。

月份按自然日历生成，周一第一列；闰年、跨年和 DST 不用固定 24 小时递增。显示日期在 UTC 日历分量上格式化，创建时间仍按本机时区投影，防止日期字符串被二次时区偏移。设备时区改变可能改变创建时间的归日；合法指定日期保持原样。

## GitHub 学到并采用的技术点

| 主来源 | 本轮采用 | 没有引入的部分 |
| --- | --- | --- |
| [Obsidian Calendar](https://github.com/liamcain/obsidian-calendar-plugin) | 月份导航、每日有限强度提示、点日期回顾、局部主题容器 | Obsidian 插件运行时、单日字数指标、自动创建日记文件 |
| [W3C 多层阴影](https://www.w3.org/TR/css-backgrounds-3/#box-shadow) 与 [GitHub 日期导航](https://github.com/orgs/community/discussions/49015) | 少量静态阴影表达卡片厚度，原生日期键盘和实际计数 | 全年微小热力格、相机/连续漂浮与打卡评价 |
| [model-viewer](https://github.com/google/model-viewer) 与 [Three.js 角色动画](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_animation_skinning_morph.html) | 作为后续本地 GLB 加载及短动作接口的参考 | 当前没有下载模型或加入相应运行时 |

以上为需求导向的独立实现与取舍，没有复制第三方源码。日历最多 31 个真实日期，只需原生按钮和局部 CSS；不需要为了这一个入口引入完整日程框架。

✅ 3px 底边与低强度静态阴影不改变日期格布局；数量色阶只作用于辅助短标记，具体数量始终直接显示。选中、今天和键盘焦点具有独立边框或文字提示。深色降低高光，窄屏保留七列和正向文字。

采用静态浅表面而非透视柱体，减少视觉占位和选择成本；这属于舒适度设计判断，不声称普遍性能优劣。仅允许背景/边框/阴影的短过渡，跟随原暂停与 [系统减少动态](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)。没有帧率或 GPU 性能结论。

## 键盘与列表反馈

✅ 原生日期按钮保留全部 Tab 与 Enter/空格选择；方向键只移动焦点（左右一天、上下七天），Home/End 到当前周在本月内的真实首尾，首尾空槽跳过，月界停留。修饰键和组合输入事件不接管，按钮通过 `aria-describedby` 关联可见说明。

采用 [APG 日期选择器](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) 的焦点/选择分离及周导航思路，没有复制模态框、日期输入、跨月 PageUp/Down、roving tabindex 或完整 ARIA grid；日历仍是可用原生 Tab 访问的按钮组。移除末批按钮时依据 [APG 键盘接口](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) 将焦点交给第一条新增记录的原打开按钮，前面批次继续保留更多按钮焦点。

✅ 列表只用一个短 `role=status` 显示日期、口径和已显示/总条数；正文和伙伴不设 live。末批按真实剩余数量显示，选日/口径变化同时重置首批，数据更新本身不强制收起列表。暂停/开启动效使用普通命令按钮的动态名称，去掉混用的 `aria-pressed`。读屏是否朗读、真实 IME 尚未实测。

时光页汇总全部活动记录；当前 0.6.0 工作台显示原“查找记录”入口，原列表查询保持。旧独立宿主仍暂时隐藏搜索值。此前 0.3.0 NoteCard 非法日期报错、本轮 0.6.0 loadNotes 读取旧非法夹具时报错均记录，未改列表/存储或清理原样本。

## 像素伙伴

✅ 机器人由可信代码内的 SVG 方格组成。它展示所选日期、对应口径的记录条数及当前未完成数；写记录调用宿主新建入口，回今天选择本机今天。选择过去日期不会偷偷修改新建时间或预填该日期。隐藏只保存在当前组件会话里，离开再进入后恢复默认。

动效只有少量眨眼与主动操作过渡。用户可暂停，CSS 和组件同时遵循系统减少动态效果；当前宿主复用包含编辑器、快开、标签面板与 AI 的 motionAllowed。时光页隐藏浮动晴小团，返回原记录页继续显示原偏好，避免两套伙伴并存。页面可见性事件用于后台暂停；内置浏览器未产生真正隐藏事件，不能算真实后台验收。

机器人不猜测情绪，不保存养成进度、积分或连续打卡，不通知或发起 AI 请求，不新增权限。SVG 是辅助技术忽略的装饰，日期、统计和操作全部保留 DOM 文本与原生按钮。

## Cinema 4D 能怎么用

🕒 未来路线：Cinema 4D 制作低面数机器人、材质和短动作 → 导出 GLB → 本地模型校验 → 固定资产随应用打包 → 按需显示。Cinema 4D 是制作工具，应用中显示的是导出资产。

Maxon 当前导出器支持 glTF/GLB 的几何、相机、纹理与动画；材质观感可能变化，一些着色器/动画要烘焙，PLA 与灯光有导出器限制。[支持格式](https://www.maxon.net/en/cinema-4d/features/supported-file-formats)、[glTF 导出说明](https://help.maxon.net/c4d/2026/en-us/Content/html/FGLTFEXPORTER.html)、[导出选项](https://help.maxon.net/c4d/2026/en-us/Content/html/FGLTFEXPORTER-GLTFEXPORTER_GROUP.html)。这些是导出器边界，不能泛化为 glTF 格式本身不支持。

独立机器人卡片可优先评估 `model-viewer`；若要机器人站入可探索的 3D 日景，则 Three.js 的 `GLTFLoader` 与 `AnimationMixer` 更适合控制场景与动作。需保留同一 DOM 回顾入口与静态机器人、处理模型失败、暂停和资源释放。[GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html)、[资源释放](https://threejs.org/manual/pages/cleanup.html)。资产与贴图需核验来源许可，运行时不热链外站。

⛔ 本记录时光功能没有安装 Cinema、制作/下载 GLB、增加 model-viewer/Three.js 或真实 3D 机器人；当前采用浅卡片与 SVG 伙伴。旧 Three.js 记录空间已于 2026-10-06 移除；新记录年轮另行使用 Three.js，原创晴小团继续沿用。

## 验证与接入

[本轮验证](current/record-garden/verification-single.md)保留当前 0.6.0 接入后的命令、界面与失败/未测；[历史验证](current/record-garden/verification.md)仅对应之前独立宿主。[接入说明](current/record-garden/integration.md)和精确 App 补丁解释工作副本接入与 Git 边界，主目录现有原生制品不包含此次 Web 增量。
