# GitHub 桌宠与原生窗口做法

调研日期：2026-10-07。本文件仅记录当前实际读取的上游资料与取舍，不声称功能已实现。

## 参考与取舍

- [VPet](https://github.com/LorisYounger/VPet) 的 [MainLogic.cs](https://github.com/LorisYounger/VPet/blob/main/VPet-Simulator.Core/Display/MainLogic.cs) 用定时事件和闲置状态选择移动、待机、睡眠，且避开正在交互的状态。采用这个有限状态/定时决策思路，不移植其 WPF 框架、养成消耗或商城。
- [DyberPet](https://github.com/ChaozhongLiu/DyberPet) 的官方 README 介绍了提醒事项、专注时间与对话排队。晴笺已有独立待办，所以优先让桌宠提示已有到期待办和打开记录入口；不引入另一份待办、物品或养成数据。
- [BongoCat](https://github.com/ayangweb/BongoCat) 官方 README 展示桌面独立伙伴、鼠标响应与离线工作。采用小型桌面窗口和局部交互的方向；当前首版不加入全局键盘监听、应用监控或额外 AI 网络请求。
- [Tauri 2 配置](https://v2.tauri.app/reference/config/) 已提供 transparent、decorations、alwaysOnTop、skipTaskbar、shadow、noRedirectionBitmap、独立 label/url 等能力。使用现有 Tauri 窗口，而不是新增桌面框架；宠物窗口需独立前端入口，避免启动 App 的整库保存逻辑。
- [Tauri window API](https://v2.tauri.app/reference/javascript/api/namespacewindow/) 提供窗口拖动、定位和显示能力；[Rust 向前端发事件](https://v2.tauri.app/develop/calling-frontend/) 可用于桌宠打开主窗现有记录/待办。权限、缩放与屏幕边界须对照本机已安装版本并在实际 EXE 验证。
- [Vite glob 与 URL 资源](https://vite.dev/guide/features.html) 支持根据实际存在的本机模型建立打包映射。四个第三方角色 GLB 可以在本机忽略资产目录中用于个人 EXE 构建；公开仓库不上传这些模型。没有该本机资源的构建应使用现有静态回退，而不是固定请求不存在的 URL。
- [MDN 滚动条样式](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scrollbars_styling)提供原生滚动条宽度与色彩的样式方式。保留滚动能力，使用主题细条；不用另造滚动控件。
- [微软 GetAsyncKeyState](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getasynckeystate) 的高位代表当前按下，低位不可用于可靠判断；鼠标键按物理左右查询，需考虑交换主按钮。若用于拖动结束观察，仅在用户已经开始原生拖动期间读当前主鼠标按钮，不能扩成全局键盘监听，失败/不确定场景不冒充释放证据。

## 已确认的产品边界

LW 审查补查：[WM_EXITSIZEMOVE](https://learn.microsoft.com/en-us/windows/win32/winmsg/wm-exitsizemove) 是窗口移动/缩放原生循环退出时的消息，可作为正常拖动结束的候选信号，仍需核对本机 Tauri 实现并实测。[SetWindowSubclass](https://learn.microsoft.com/en-us/windows/win32/api/commctrl/nf-commctrl-setwindowsubclass) 不允许跨窗口线程安装，不管理引用计数；[DefSubclassProc](https://learn.microsoft.com/en-us/windows/win32/api/commctrl/nf-commctrl-defsubclassproc) 转发原处理链。若采用，仅作用于固定宠物 HWND、在 UI 线程安装和清理，不加入全局输入 hook。

用户明确选择：Windows 桌面上独立活动，最小化晴笺后仍可见。用户要求继续开发、纠正正文宠物误用、改善标题栏/滚动条和信息密度；这些要求已获授权。首次自主能力按有限状态和本地待办连接收敛，具体方案仍需结合代码库调研与独立审查。

## 资料读取失败

直接读取 DyberPet 的猜测路径 `DyberPet/threads.py` 与 Tauri 的 `develop/window-customization/` 链接未得到内容；不使用这两个失败请求作为实现依据。上述 DyberPet 事实来自仓库官方 README，窗口能力来自当前配置/API 文档。

LW 补查首次猜测 `win32/menurc/wm-exitsizemove` 读取失败，随后官方搜索找到并读取 `win32/winmsg/wm-exitsizemove`；仅后者作为消息依据。
