# 晴笺记录日历：只读调研与有限 MVP

日期：2026-10-03。角色：只读调研员。只写本临时报告，不改项目代码、文档或 Git。根代理已收敛范围为独立分支；创建日默认，可切记录归属日；月历、热力与立体视图统一模型。接入需兼容已提交 0.3.0 与主目录 0.5.3，新增组件只依赖 Note 类型，格式展示走宿主回调。

## 结论

推荐「月历 + 记录分布热力格 + 当日记录列表」。默认「创建日期」回答哪天新增过记录，切到「记录日期」回答记录被放在哪一天。两种口径都可由已有数据只读派生，不加依赖、不写额外数据、不迁移数据库。切换口径后所有可视化、计数与列表一起更新，不混用日期。updatedAt 只有最后一次保存时间，不能还原完整写作历史，不能声称是实际写作天数或连续打卡。

## 实际代码证据

- src/types.ts:3–12：Note 有 id、纯文本 content、status、createdAt、updatedAt?、scheduledDate?、done、deletedAt?；没有 completedAt、编辑事件日志或日历表。
- src/recordTools.ts:5–7：dateKey 把时间戳投影到本机自然日；dateLabel 对日期字符串补本地中午再格式化。
- src/notePresentation.ts:4–13：现有按日期分组优先有效 scheduledDate；缺省取 createdAt 本机日期；已有但非法 scheduledDate 不回退，归「未指定日期」；日期降序、组内保留源顺序。
- src/NotesView.tsx:14–31：已有网格、阅读、按日期三种布局，按日期并非日历；默认只显示 60 条，所以日历计数不能使用 presentedNotes 截取后的数组。
- src/NoteComposer.tsx:30,123：日期默认草稿日期、记录日期或 today()；保存用户选择的 scheduledDate，新版 status='none'。
- src/App.tsx:76–79,123,127–129：activeNotes 排除 deletedAt；新建生成 createdAt 与 updatedAt，编辑仅更新 updatedAt；回收站保留记录原字段。
- src/noteText.ts / src/QuickOpen.tsx：主目录新版有 plainNoteText，但新增组件为兼容 0.3.0 不依赖它，由宿主决定正文如何安全展示。

以上为本次读取的主工作区快照；正式接入前应在隔离工作区重新核对。主目录正被其他会话修改，本调研没有写入项目。

## 成熟做法与取舍

- Obsidian Daily notes 用日期组织日记、待办和日志。采用「日期作为导航入口」，不采用点空日期自动创建文件：晴笺一天可有多条记录，空日期只显示空态，避免扩展编辑器与持久化。来源：[Obsidian Daily notes 官方说明](https://obsidian.md/help/plugins/daily-notes)。
- Calendar 插件有月份导航、写作量和未完成任务标记。采用「月历、轻量数量提示、点击回看」，不复制字数点数、周笔记或模板系统，本轮只统计记录。来源：[作者维护的 Calendar 仓库 README](https://github.com/liamcain/obsidian-calendar-plugin)。
- GitHub contribution calendar 展示每天贡献分布。采用紧凑格子和由少到多的颜色图例，不采用 streak 或排行榜；借鉴图形不意味着把晴笺改为 UTC 分桶。来源：[GitHub contributions 官方说明](https://docs.github.com/en/account-and-profile/concepts/contributions-on-your-profile)。
- Date 的 date-only 字符串按 UTC 解释，本地日期组件由设备时区决定，不存在的日期也可能被自动滚动。采用日期字符串严格校验与日历分量计算，不直接 new Date('YYYY-MM-DD').getDate()。来源：[MDN Date 文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)。

形态选择是依据晴笺需求和代码作出的推断，不代表这些产品推荐了晴笺的具体实现。

## 日期、时区与计数合同

| 字段 | 真实含义 | 视图用法 |
| --- | --- | --- |
| createdAt | 实际创建时间，App 保存 ISO UTC 时间戳 | 创建日期模式：转换为本机自然日；非法则归未指定日期 |
| scheduledDate | 用户选择的记录归属/安排日，YYYY-MM-DD，没有时区 | 记录日期模式：有效则直接用；缺省才回退创建日本机自然日；非空非法不回退 |
| updatedAt | 记录最后一次保存时间 | 不参与任何日期分桶，不代表每天写过 |
| status | 早期 today/tomorrow/later，新版保存 none | 不重新解释，不迁移旧数据 |
| done | 当前是否完成，没有完成时间 | 可展示当前状态；不能称当天完成 N 条 |
| deletedAt | 当前在回收站 | 所有口径均排除；恢复后回原来的日期 |

创建日期模式只说明当日创建了多少条，不说明当日编辑了多少次。记录日期模式可包含补记与未来安排，应显示「按你为记录选择的日期整理」。切换口径不改保存字段。

记录日期的校验沿用现有分组边界：非空 scheduledDate 必须匹配四位年-两位月-两位日并确实存在，例如 2024-02-29 有效，2025-02-29 和 2026-04-31 无效。缺省/空 scheduledDate 才回退 createdAt；非法创建时间或归属日期放在「未指定日期」。新文件自行实现等价的有限日期逻辑，以免依赖只在新版存在的模块。

创建时间按本机时区投影，本机时区改变会改变创建日期分桶，这是现有本地优先语义；合法 scheduledDate 不因时区变化而改变。月份从本地年月计算；日期递增用 setDate 或 UTC 日历分量，不用固定 +86_400_000 穿过 DST。日期键保持 YYYY-MM-DD 纯字符串，显示时用本地中午或日历分量构造日期，绝不对非法日期格式化。

月历、热力、立体、摘要和当日列表都使用同一个完整未删记录模型；不能从已分页的 60 条卡片推导计数。总数为记录条数，已完成记录仍计数。未指定日期必须有单独入口，不能静默丢失。若宿主传筛选后的记录，要明确「当前筛选」且全部视图使用同一输入；独立回顾入口优先传全部 activeNotes。

## 有限 UI 范围

- 默认「创建日期」，可切「记录日期」。月份标题、上一月、下一月、回到本月；周一第一列，7 列、最多 6 行。月历、热力和立体视图始终显示同一个所选月份。
- 今天有边框，选中日独立高亮；固定数量色阶 0、1、2–3、4–6、7+，保留实际数量，不用相对色阶导致跨月颜色不可比。
- 摘要「本月 N 条记录」「有记录的 N 天」；当前口径说明紧挨摘要。
- 当日列表的正文由宿主渲染，点击调用 onOpenNote(id)。空日期只显示空态；未定日期有「未指定日期 N 条」入口。没有必要添加此日期新建、拖拽改日期或编辑器初始日期参数。
- 热力格仅显示当前所选月份，周一到周日，与月历、立体视图同一月份、模型、口径和颜色图例；点击只选择该月同日。创建日期模式的未来格不宣传为活动；记录日期模式未来格可表示安排。不另加 13 周或全年跨度。
- 立体视图只是同一日桶的另一种呈现，由专门调研员收敛形态；不产生自己的计数口径或数据源。
- 深浅主题、窄屏和关闭动画仍可使用。日格是原生 button，aria-label 含完整日期和条数；选中 aria-pressed，今天 aria-current='date'；可用有 caption/列头的 table。不实现完整箭头导航时不加 ARIA grid 角色。
- 无 AI、无网络请求、无新数据库表、无额外存储、无 streak/积分/惩罚性提醒。

## 兼容与组件接口

新增独立文件（例如 src/recordGardenModel.ts、src/RecordGarden.tsx、src/record-garden.css）；根代理在隔离分支统一接入口。不要并行改 App.tsx、NotesView.tsx、types.ts、store.ts、desktop.ts 或全局 styles.css。模型只 import type Note，不 import 新版 groupNotesByDate、noteText 或特有组件。

最小接口建议（仅建议，未实施）：

```ts
export type RecordDateBasis = 'created' | 'record'
export type RecordDay = {
  date: string
  noteIds: readonly string[]
  count: number
  doneCount: number
}
export type RecordGardenModel = {
  days: ReadonlyMap<string, RecordDay>
  undatedIds: readonly string[]
}
export function buildRecordGarden(
  notes: readonly Note[],
  basis: RecordDateBasis,
): RecordGardenModel

export type RecordGardenProps = {
  notes: readonly Note[]
  onOpenNote: (id: string) => void
  renderNote: (note: Note) => React.ReactNode
}
```

组件临时 state 仅 basis（初始 created）、month、selectedDate；模型 useMemo([notes,basis])。无需保存视图设置。宿主可以传 activeNotes，模型仍排除 deletedAt。列表保留源顺序，不附带最近修改排序。正文回调必须沿用宿主安全纯文本/现有格式渲染，不直接持久化或危险渲染任意 HTML。打开使用稳定 id，由宿主取最新记录后处理；新版已有 openRecord/currentRecord 可复用，旧版可直接复用自己的编辑回调。

## 必要验收

纯计算的少量表驱动验证：

1. created 与 scheduled 不同：默认归创建日；切口径归 scheduled；更新 updatedAt 不改变任何分桶。
2. UTC 2026-10-02T16:30Z 在 Asia/Shanghai 的创建日为 2026-10-03；测试显式设置时区，不假定执行宿主是上海。
3. 闰日、非闰年 2 月 29、4 月 31、月份 13；非法 scheduled 在 record 模式不回退，created 模式照创建时间；未定日期可访问。
4. deleted/恢复/永久删除日计数与列表一致；done 开关不改总数。
5. 同日超过 60 条，所有视图总数准确且全部记录可访问；没有使用 NotesView 的截断数组。
6. 冻结源数组与 Note 对象后派生仍可运行，证明无原地排序或字段写回。
7. 跨年切月、空月、周一首日和 6 行月份；热力格点击选中同日，切月份或口径后月历/热力/立体同步，没有另一个时间范围。
8. DST 地区日期生成不漏日、不重复；合法 scheduledDate 在两个时区保持相同 key。

人工验收：两种口径、日格选择、上下月、回本月、热力联动、记录打开、空态、未定日期入口；390px 窄屏、深色、Tab/Enter 与焦点、关闭动画。各隔离接入基线至少跑 npm run build；本报告只调研，未运行构建、不声称 UI 已验证。

## 发现但未改动

- src/store.ts:15,21 欢迎数据和旧迁移使用 UTC toISOString().slice(0,10) 补 scheduledDate，与本机 today() 在午夜附近可能不同。本轮按已存字段展示，不纠正历史数据。
- 当前 NoteCard 有 scheduledDate 时直接 dateLabel，未用严格校验；非法导入日期的卡片渲染边界值得另查。新日历避免格式化非法日期。

只记录，不把旧数据修复混入新功能。
