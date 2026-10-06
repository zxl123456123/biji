# 桌面标题栏与第三方模型调研

日期：2026-10-06。

## Tauri 2 标题栏

- [官方窗口自定义文档](https://v2.tauri.app/zh-cn/learn/window-customization/)给出的完整路径是关闭原生 `decorations`，在 Web 内容中绘制标题栏，并提供拖动区域及最小化、最大化、关闭按钮。拖动属性只作用于直接标记的元素，按钮需保持可点击。
- [官方权限表](https://v2.tauri.app/reference/acl/core-permissions/)列出窗口控制和拖动命令的独立权限。若采用自绘标题栏，应只开放实际使用的窗口权限。
- 选择方向：采用 Tauri 官方自绘标题栏模式，将窗口控制与现有工作台的主题和页眉整合。仅改 CSS 不能消除操作系统绘制的标题栏；直接关装饰而不补窗口控制也不能满足桌面使用。

## 角色模型

- [GitHub 学生项目](https://github.com/Yu-Hsuan-1220/NYCU_ICG_Final_Project)有 Chiikawa、Usagi 的 OBJ/MTL/贴图，但 README 明确把模型来源指向 Sketchfab，仓库页面没有许可文件，也不包含 Hachiware 或奶龙。模型无可确认的产品再分发授权，因此不接入。
- 检索奶龙模型时未找到来源、模型文件和可再分发许可都明确的 GitHub 候选。搜索到的[奶龙打印模型](https://makerworld.com.cn/zh/models/621852)明确限制再分发，不能作为产品素材。
- [GitHub 官方许可说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)指出，公开可见不等于获得复制和分发许可。即使代码仓库有软件许可证，也须确认角色模型本身及原角色权利。
- 当前选择：保留项目内现有代码绘制角色；若用户提供明确授权的模型文件及许可，再评估格式转换、包体、动画与性能。没有许可证据时不从 GitHub 复制模型。
