# 当前验证记录

日期：2026-10-07。此文件只记录实际观察；当前 S1/S2/S3 正在实施，未完成 0.9.0 验证。

## 改动前界面基线

- 独立测试来源 `http://127.0.0.1:5341/`，Vite session 73033；浏览器初始为 3 条示例记录，不是用户 SQLite 数据。
- 当前源码含上一轮未提交的 0.8.1 元数据改动，功能源码以 main / 92b01bd 为基线。
- IAB 1280×720 的只读 DOM 测量：第一张卡片 top=474.484375 CSS px；body clientHeight=838、scrollHeight=839；workspace overflowY=visible。标题/口号、六导航、状态/设置/回收/新建、搜索与第二个快速打开按钮、大标题/说明、大起笔提示等占据首屏。
- 用户提供的原生截图另有 34 CSS px 自绘标题栏纯色/分隔、贯穿全窗口的默认滚动条；浏览器基线不包含这个原生栏，不能用其值冒充原生测量。

## 已见工具/方案失败

- 上轮 0.8.1 构建本身退出码 0，但 sky.launch_app 接收 E 盘路径却实际打开了 D 盘旧安装；随后用户 Escape 停止界面自动化。未完成新窗口核验，不能据文件版本号称效果已更新。
- 本轮高层/Readiness r1 为 REVISE，提醒展示确认与 protocolReady 语义缺口在 r2 修订并独立放行至 LW；这不是实施已完成。
- 读取 `src/TitleBar.tsx` 的旧候选路径曾失败，实际标题栏在 App.tsx；上游猜测的 DyberPet/threads.py 和 Tauri window-customization 页面未读取成功，未作为依据。
- 浏览器工具初始化曾显示自身 Statsig loading 提示；尚未据此判定应用错误。
- LW r1 REVISE：拖动缺可靠结束、自有 moved 可能误取消。r2 用本窗 Windows enter/exit 与同步定位分类补齐，独立 Gate-2 放行；原生接收结果仍须实际 EXE 验证。

## 实施前工具与隔离准备

- root 本轮实际运行 `E:/Apps/blender-5.2.2-windows-x64/blender.exe --version` 退出 0，输出 Blender 5.2.2 LTS、Windows Release、build hash d13f752e3b9c；不等于模型导出或造型通过。
- 在忽略的 `src-tauri/target/release-evidence/0.9.0/web-fixture.json` 创建 3 条明确验证样例（包含旧 token），供独立 localhost 页面导入；尚未导入，不改用户 SQLite。实际用户数据库备份在最终 EXE 启动前重新取得，不复用旧 0.8.1 三条记录基线。

## 待验证

界面纠正后同尺寸首屏、主题滚动/次级导航/焦点/连续输入/格式/草稿/保存回填/快捷键/深色；refined GLB 真正造型与动作、公开缺资产回退；0.9.0 五角色原生透明双窗、最小化存活、手动与自主活动、实用入口与提醒、隐藏恢复/关闭清理；数据库前后旧字段、程序版本/路径/哈希。设备不具备的多屏、混合 DPI、触屏/读屏、长时间 GPU 与故障组合只能列未测。

## S1 实际浏览器承接（root，本轮）

来源仍为独立 localhost 5341，不是用户 SQLite；S1 落盘后 reload，后续 S2/S3 热更新保持 Web 分支。以下是实际 UI 输入和只读 DOM 观察，不是 JSDOM 结果。

- 1280×720：首卡 top=262px（原474.484375）；body clientHeight/scrollHeight=720/720，workspace clientHeight/scrollHeight=600/600、overflowY=auto。三个主导航、单个新建、搜索及小 Ctrl K、短标题/筛选和真实记录进入首屏；卡片正文 canvas=0。
- More 展开后 Tab 聚焦“记录时光”；Escape 关闭且焦点返回“更多”。点击次级设置后按钮显示“更多 · 设置”；从展开菜单点击外部“新建记录”关闭菜单并进入已有编辑器。编辑时 chrome inert=true、菜单不存在，Ctrl K 不抢编辑正文。
- 用现有导入 UI 把目标验证 JSON 导入该浏览器 origin。旧记录显示“正文前 / 晴小团 / 粗体后”，零卡片 canvas。编辑回填为固定 noneditable data-note-pet DIV 和普通文字，不含图片、mount 或插入入口；粗体仍为 strong。
- 原生键盘 ControlEnd→Home→ArrowUp→Backspace 从旧块之后删除，旧host计数1→0；Ctrl Z 恢复为1，Ctrl Y再次0，再Ctrl Z恢复。Ctrl Enter 保存后卡片仍显示兼容文字；没有全库替换。
- 新记录逐字输入 `sun123` 后中文 `晴朗`，真实顺序 `sun123晴朗`；选中sun123应用粗体后 HTML 为 `<b>sun123</b>晴朗`。新行选无序列表连续输入第一项/第二项；关闭重开真实恢复 strong+ul/li。Ctrl Enter 保存后4条卡片中可见相同粗体/列表，再编辑回填结构一致。再新建显示空编辑器，已保存草稿被清理。
- 390×844 深色：document scrollWidth=390，四卡片左右边界16..364，无整页横溢；body scrollHeight=844，内容scrollHeight=1202/clientHeight=712。视口变更后浏览器保留原scrollTop38，所以顶部文字最初部分被裁；实际向上滚动后 top0、标题完整，属于滚动位置保留。More窄屏Escape仍还焦点。
- 通过Tab聚焦可达的“工作区内容”SECTION：PageDown令内容scrollTop=490、chromeTop仍0；CtrlHome回0。第一次点容器中央时被现有Web浮层覆盖，未聚焦区域，PageDown未滚；改用Tab后验证真实键盘路径。Windows最终版移除该内嵌浮层由S3/S4另验。
- 原排序抓手 Space→Down→Escape：四ID顺序保持、焦点回原ID；Space→Down→Return：首项与下一项交换，焦点回所拖ID。只覆盖布局影响的基本回归，不宣称重验完整排序算法。
- 浅色与深色实际已观看；390临时viewport已reset。真实中文IME、触屏/读屏、原生标题条仍未测试，不能用浏览器代替。

工具失败保留：读取DOM selection时只读工具未暴露document.getSelection，报TypeError；未用注入脚本替代，改用真实键盘和host计数。一次粗体定位deadline失败，fresh AX显示开发fullreload已关闭编辑器；重新新建真实恢复完整草稿，完成相同格式流程。另复制静态dist并启动5342预览session98209作为后续无HMR验证来源，尚未使用，不作实测。

## root 当前自动验证

- `node --test --test-reporter=spec tests/*.test.mjs` 本轮退出0，完整149项/149 pass/0 fail/0 cancelled/0 skip，已读全输出。Node类型擦除experimental warning保留。
- `npm run build` 本轮退出0，2532模块，五GLB实际输出；Three chunk737.16kB警告保留。
- `cargo test --locked --manifest-path src-tauri/Cargo.toml --jobs 1` 本轮退出0，20运行测试全部通过（含原数据库11），main/doc各0测试不算覆盖；linker消息warning保留。
- 正在按同源代码但独立验证identifier构建no-bundle原生候选。它仍为当前0.8.1元数据、不是最终0.9.0 EXE；最终发布仍需正常identifier重新构建、核路径/版本/hash与真实旧库。

## 原生隔离候选与本轮中止

- 验证identifier仅临时配置 `com.zxl.qingjian.validation20261007`，独立SQLite创建3验证笔记、0待办/账目；真实 `com.zxl.qingjian` 库未操作。
- `npm run tauri -- build --no-bundle --ci --config .../native-fixture.config.json -- --jobs 1` 最终退出0（release 2m38s）。复制候选r1，15314944 bytes、FileVersion0.8.1、SHA923A82927B0EEC2F7B526DAFE00DE884FAC72BDEC4CA540AA1F3DFEDA2FCA122；该包未含后续M1补丁/三豆形r2，不能当最终0.9.0身份。
- 精确路径Start-Process PID9532，首次真实主窗看到连续浅色标题和精简3卡片、没有内嵌宠物。后续PID已不存在、窗口列表空；无本轮相关错误事件输出，未捕获退出码，原因未确认，不能称正常退出或自动崩溃。重启带stdout/stderr重定向 PID15104，3秒仍存活，随后实际捕获主窗和“晴笺桌面伙伴”双窗。
- 独立pet截图逻辑220×260，透明区域显示下方其他窗口；无常驻大四按钮板。窗口origin由2222,1130变为2094,1130（128物理px），期间未进行有效拖动；首次轻触因bounds changed被工具拒绝，重新真实观测后轻触成功。未据这些结果称多屏/DPI/逐像素穿透/完整自主状态组合已验。
- 准备点击“最小化窗口”时，Computer Use明确返回用户physical Escape停止指令；遵循指令本轮停止所有界面操作。该点击未确认执行，最小化存活、拖动、业务菜单、真实提醒和关闭退出均待测。S2 r2独立审查被root中断，保留当前输入报告待下轮恢复。
- S1真实浏览器闭环审查已PASS；S2 r1源码/资产审查PASS后root视觉反馈触发模型only r2（新真实画布待看）。S3首轮M1实际hook竞态 REVISE/IMPL_DEFECT，在r3有限等待当前publish后fresh资格判断修补；独立复现实验已handled/dailyKey1，S3 r3 PASS，原生提醒尚未测试。保留所有报告，不用审查通过替代最终EXE验收。
