# 记录时光与本地小伙伴

日期：2026-10-04。✅ 当前实现仅在独立分支 `codex/record-garden`，基线为已提交的 0.3.0。另一会话的 0.5.5 主目录尚未接入，本轮没有发布桌面安装器。

## 日期作为回顾入口

月历、热力格和立体柱共用同一月份、日期桶和选中日期。点日期即可查看当日记录，正文复用宿主的安全排版渲染；打开记录调用原编辑入口。超过 30 条时分批显示，日格和月摘要始终统计全量记录。

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
| [Three.js CSS3DRenderer](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/renderers/CSS3DRenderer.js) 与 [CSS3D 示例](https://github.com/mrdoob/three.js/blob/dev/examples/css3d_periodictable.html) | DOM 空间表达与交互层分离、明确布局及主动切换视角 | Three.js 依赖、自由轨道镜头、随机初始布局与持续帧循环 |
| [model-viewer](https://github.com/google/model-viewer) 与 [Three.js 角色动画](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_animation_skinning_morph.html) | 作为后续本地 GLB 加载及短动作接口的参考 | 当前没有下载模型或加入相应运行时 |

以上为需求导向的独立实现与取舍，没有复制第三方源码。日历最多 31 个真实日期，只需原生按钮和局部 CSS；不需要为了这一个入口引入完整日程框架。

✅ 立体柱使用 CSS perspective/preserve-3d 的三个面；数量 0、1、2–3、4–6、7+ 映射到五档高度与颜色，具体条数仍以文字显示。镜头只有正看/侧看，变化只作用于装饰柱，日期、点击区域和焦点稳定；无自动飞行或自由拖拽。不支持 CSS 3D 时显示平面柱，用户也始终可切回月历。

CSS 的 `preserve-3d` 会被某些同层透明度、filter、overflow 等属性强制扁平化，故装饰透视与正文/点击层分开。[CSS 官方说明](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style)。语法支持不等于 GPU 性能已测，本轮没有帧率结论。

## 键盘与列表反馈

✅ 原生日期按钮保留全部 Tab 与 Enter/空格选择；方向键只移动焦点（左右一天、上下七天），Home/End 到当前周在本月内的真实首尾，首尾空槽跳过，月界停留。修饰键和组合输入事件不接管，按钮通过 `aria-describedby` 关联可见说明。

采用 [APG 日期选择器](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) 的焦点/选择分离及周导航思路，没有复制模态框、日期输入、跨月 PageUp/Down、roving tabindex 或完整 ARIA grid；日历仍是可用原生 Tab 访问的按钮组。移除末批按钮时依据 [APG 键盘接口](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) 将焦点交给第一条新增记录的原打开按钮，前面批次继续保留更多按钮焦点。

✅ 列表只用一个短 `role=status` 显示日期、口径和已显示/总条数；正文和伙伴不设 live。末批按真实剩余数量显示，选日/口径变化同时重置首批，数据更新本身不强制收起列表。暂停/开启动效使用普通命令按钮的动态名称，去掉混用的 `aria-pressed`。读屏是否朗读、真实 IME 尚未实测。

时光页汇总全部活动记录，旧列表的查询值暂时不显示；回原列表仍保留查询。旧 0.3.0 NoteCard 对非法创建时间的日期格式化会报错，本轮只记录该既有列表缺陷，没有改旧列表或清理样本数据。

## 像素伙伴

✅ 机器人由可信代码内的 SVG 方格组成。它展示所选日期、对应口径的记录条数及当前未完成数；写记录调用宿主新建入口，回今天选择本机今天。选择过去日期不会偷偷修改新建时间或预填该日期。隐藏只保存在当前组件会话里，离开再进入后恢复默认。

动效只有少量眨眼与主动操作过渡。用户可暂停，CSS 和组件同时遵循系统减少动态效果；宿主打开编辑器或 AI 面板时传入暂停状态。页面可见性事件用于后台暂停；内置浏览器测试未产生真正隐藏事件，不能算真实后台验收。

机器人不猜测情绪，不保存养成进度、积分或连续打卡，不通知或发起 AI 请求，不新增权限。SVG 是辅助技术忽略的装饰，日期、统计和操作全部保留 DOM 文本与原生按钮。

## Cinema 4D 能怎么用

🕒 未来路线：Cinema 4D 制作低面数机器人、材质和短动作 → 导出 GLB → 本地模型校验 → 固定资产随应用打包 → 按需显示。Cinema 4D 是制作工具，应用中显示的是导出资产。

Maxon 当前导出器支持 glTF/GLB 的几何、相机、纹理与动画；材质观感可能变化，一些着色器/动画要烘焙，PLA 与灯光有导出器限制。[支持格式](https://www.maxon.net/en/cinema-4d/features/supported-file-formats)、[glTF 导出说明](https://help.maxon.net/c4d/2026/en-us/Content/html/FGLTFEXPORTER.html)、[导出选项](https://help.maxon.net/c4d/2026/en-us/Content/html/FGLTFEXPORTER-GLTFEXPORTER_GROUP.html)。这些是导出器边界，不能泛化为 glTF 格式本身不支持。

独立机器人卡片可优先评估 `model-viewer`；若要机器人站入可探索的 3D 日景，则 Three.js 的 `GLTFLoader` 与 `AnimationMixer` 更适合控制场景与动作。需保留同一 DOM 回顾入口与静态机器人、处理模型失败、暂停和资源释放。[GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html)、[资源释放](https://threejs.org/manual/pages/cleanup.html)。资产与贴图需核验来源许可，运行时不热链外站。

⛔ 本轮没有安装 Cinema、制作/下载 GLB、接入 model-viewer/Three.js 或实现真实 3D 机器人。当前 CSS 立体日期柱与 SVG 像素伙伴已足以验证回顾价值；更复杂的空间场景留给独立迭代。

## 验证与接入

[验证记录](current/record-garden/verification.md)保留命令、实际界面与所有已见失败/未测边界。[接入说明](current/record-garden/integration.md)给主目录会话提供接口，不能据独立分支构建声称 0.5.5 已集成。
