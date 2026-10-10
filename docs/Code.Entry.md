# 代码入口

本文档只说明文件职责和调用方向。它不描述交互细节，也不代替各功能文档。

## 启动

`src/main.tsx` 按运行环境分流：

- 浏览器加载 `App`。
- 桌面主窗标签为 `main`，加载 `App`。
- 桌面伙伴窗标签为 `pet`，加载 `DesktopPet`。
- 其他窗口标签显示启动失败，不猜测该加载哪个界面。

## 主窗

`src/App.tsx` 持有记录、待办、账本、当前页面、弹层和已应用的伙伴外观。它不绘制编辑器、账本或伙伴本体。

主导航三个页面：

| 页面 | 组件 |
| --- | --- |
| 记录 | `NotesView` |
| 待办 | `TodoView` |
| 账本 | `LedgerView` |

更多菜单五个页面：

| 页面 | 组件 |
| --- | --- |
| 记录时光 | `RecordGarden` |
| 关联图 | `NoteGraph` |
| 伙伴 | `PetShowcase` |
| 回收站 | `NotesView` |
| 设置 | `App.tsx` 内的 `SettingsView` |

记录时光、关联图和记录年轮按需加载。年轮从记录页打开，不占用主导航。

弹层仍由 `App.tsx` 挂载：`NoteComposer`、`LedgerComposer`、`AiPanel`、`QuickOpen`、`TagPicker`。设置页在 `SettingsView.tsx`，AI 面板在 `AiPanel.tsx`。

保存入口是 `App.tsx` 的 `persist`。桌面端走 `src/desktop.ts`，浏览器走 `src/store.ts`。两条路径都由 `App.tsx` 决定，页面组件不直接选择存储。

## 伙伴

伙伴文件按四层分工。上层可以调用下层，下层不反过来持有界面状态。

| 层 | 文件 | 职责 |
| --- | --- | --- |
| 展示 | `PetCompanion.tsx` | 主窗浮层和装扮页 |
| 展示 | `DesktopPet.tsx` | 独立桌面窗 |
| 形象 | `PetFigure.tsx` | 有模型用三维，否则用 SVG |
| 形象 | `Pet3DView.tsx` | 画布生命周期 |
| 形象 | `Pet3DScene.ts` | 加载、动作和销毁 |
| 形象 | `PetPortrait.tsx`、`PetCharacters.tsx` | SVG 画像 |
| 形象 | `petModels.ts` | 选择模型地址 |
| 状态 | `petAppearance.ts` | 已应用外观的读取和保存 |
| 状态 | `petBehavior.ts` | 主窗浮层的心情、拖动和许可 |
| 状态 | `desktopPetProtocol.ts` | 主窗与桌面窗的消息 |
| 状态 | `desktopPetMotion.ts` | 桌面窗移动 |
| 连接 | `useMainPetBridge.ts` | 主窗发布快照并处理桌面窗动作 |

`PetDevModelPicker.tsx` 只在开发模式加载本机模型，不进入公开构建。

装扮选项、试穿和应用规则见 [宠物装扮](Pet.Wardrobe.md)。本文档不重复那些规则。

## 不在本次整理内

- 不把 `App.tsx` 的页面或弹层拆成新文件。
- 不合并伙伴文件。
- 不改存储、导航或动画行为。
