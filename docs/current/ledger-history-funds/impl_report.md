# 账本实施交接 · 2026-10-10

受众：协调者、独立审查者。状态：实施已落盘，命令验证有证据；真实界面、桌面持久化与独立审查待主代理执行。

## 更改与取舍

- `src/LedgerView.tsx` 替换原内嵌账本及表单：年月选择、前后期间、回到本月、月度/年度切换、十二个月收支与结余卡片、点击月份进入明细。
- 月度突出三项统计，支出分类与按日期分组流水分区展示；浅深主题复用现有变量，窄屏纵向排列。
- 新建/编辑提供实际发生日期，复用 `createdAt` 保存本地该日中午对应的 ISO 时间；编辑只改其他内容时保留原始时间字符串。旧记录不迁移。`updatedAt` 继续为保存时刻。
- 历史月份内新建默认该月一日，本月默认今天；主顶栏记一笔默认今天。保存后显示所属月份的月度明细。
- 允许日历有效的未来日期，不额外施加需求之外的时点限制；日期范围 0001—9999，空白与非法日期、非有限正数金额不可保存。
- 年汇总及日期分组位于 `src/ledgerTools.ts`；同时间使用 ID 稳定排序，避免浏览器数组顺序与 SQLite 读取顺序导致同日列表变化。
- 总资金、账户与数据库结构均未引入。

## App 修改锚点（用于 baseline → current 隔离提交）

1. 图标 import 删除账本专用 ArrowDownLeft/ArrowUpRight；recordTools import 删除 money/selectMonth/monthTotals；新增 LedgerView、LedgerComposer、TransactionDraft、dateKey import。
2. `Composer` transaction 分支增加 `date?: string`。
3. 原 `monthKey/currentMonth/income/expense` 三行替换为 `ledgerMonth/ledgerRevealMonth` 两个状态。
4. `saveTransaction` 接收包含发生日期的草稿，保存后设定所属月份并递增 revealMonth。
5. `view === 'ledger'` 分支改用 LedgerView，并传当前月份、跳月、日期新建回调。
6. transaction composer 调用补充 `initialDate={composer.date}`。
7. 删除原 Ledger/Stat/LedgerComposer 三个内嵌函数，保留其他功能的现有未提交修改。

## 本轮实际命令与结果

- `node --test tests/ledgerHistory.test.mjs`：退出码 0，5 项通过、0 项失败。覆盖闰日/非法日、原时间保留、改日期跨月、跨年切换、历史默认日期、十二个月统计、编辑/删除统计变化、稳定分组且不修改来源。
- `npm run build`：第一次退出码 0；最后一次在 revealMonth 修改后重新运行，退出码 0，TypeScript/Vite/PWA 生成成功。
- 已见构建提示：three 等压缩块超过 500 kB；第一次有 PWA hook timing 提示。本轮没有扩大为代码分包优化。
- 读取 `tsconfig.app.json` 曾失败，命令退出码 1，原因项目实际只有 `tsconfig.json`；随后读取实际文件。该失败为调研路径错误，非构建失败。

## 未验证边界

### 主代理真实 UI 反馈后的布局修正

主代理在 375×667 浏览器年度视图发现十二月卡片被浏览器伙伴遮挡，正常 Playwright 点击由 `pet-companion` 截获。这是实际发现的验收失败。随后仅对账本补充 `browserPetVisible`：浏览器伙伴显示时预留底部滚动空间，窄屏为 340px；宽屏参考待办既有规则给右侧保护。月份卡片、流水按钮及空态入口提供底部 scroll-margin，允许自然滚动到无遮挡位置。桌面独立桌宠或伙伴收起时不增加该占位，没有修改宠物实现。

本次定位还错误搜索不存在的 `src/todo.css` 与 `src/TodoView.css`，rg 打印 `os error 2`；后续改为 src 下 CSS 搜索找到实际 `styles.css` 的规则。布局修正后的真实 UI 重验与独立审查仍须由主代理执行。

布局修正后再次运行 `npm run build`，退出码 0，TypeScript/Vite/PWA 成功；仍有已有压缩块超过 500 kB 的提示。

未操作真实浏览器 UI、浅深主题截图、窄屏截图、键盘选择日期/年度下钻；未运行 SQLite 保存重开、备份导入导出、Windows EXE 构建或用户真实数据库。未执行独立审查，不能将此交接直接作为总体验收、提交或推送证明。主代理须核验最终 diff，执行必要验收并记录限制。
