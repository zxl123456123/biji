# 记录时光接入说明

日期：2026-10-04。独立分支从 `630bf4d`（0.3.0）开发。`E:/project-funny/biji` 的主目录由另一会话持有，首轮调研为 0.5.3、本轮已读到 0.5.5；本会话没有修改、复制或提交其中的工作。

## 文件边界

新增 `RecordGarden.tsx`、`RecordDayViews.tsx`、`RecordCompanion.tsx`、`recordGardenModel.ts` 与对应三份 CSS，只依赖已有 React、lucide-react 和 Note 类型。日期模型测试独立使用 Node 22.18+ 的类型剥离；没有 package、lockfile、存储、Rust 或数据库改动。

0.3.0 分支的 `App.tsx` 只增加按需加载、记录时光导航和宿主回调；其既有整体布局、编辑器与其他代码不能覆盖当前 0.5.5 App。移植时应应用新增模块和文档，再由持有主目录的会话接线；不直接替换整个 App 或公共 styles。

当前主目录 Note 具有排序/置顶元数据，日历只读完整数组并保留传入顺序，不改这些字段。旧基线仅作独立 Web 预览；不得用其旧 Rust/桌面数据层写主目录迁移后的真实 SQLite，避免丢失新字段。

## 0.5.5 参考接线

以下依据 2026-10-04 再读主目录 0.5.5 快照；接入者必须核对自己的最终代码。补充 `CalendarDays` 图标及现有格式工具导入，`View` 增加 `'garden'`，主导航增加记录时光。已有 lazy/Suspense、`editLatestNote(id)` 与 `motionAllowed` 可复用；`renderMarkdown`/`withoutTags` 需补导入，与现 NotesView 安全渲染保持一致。

```tsx
import { renderMarkdown } from './noteFormat'
import { withoutTags } from './recordTools'
const RecordGarden = lazy(() => import('./RecordGarden'))

// Add this branch beside the existing viewContent branches.
viewContent = <Suspense fallback={<div className="content" role="status">正在打开记录时光…</div>}>
  <RecordGarden notes={activeNotes}
    renderNote={note => renderMarkdown(withoutTags(note.content))}
    onOpenNote={editLatestNote}
    onCreate={() => setComposer({ type: 'note' })}
    animate={motionAllowed}/>
</Suspense>
```

组件消费全量有效记录，不消费每批 60 条的卡片数组；展示口径始终显式说明。`onOpenNote` 用稳定 id，从宿主取最新记录后打开，不复制编辑器或保存逻辑。正文须复用安全纯文本排版，不能改成危险 HTML。

主目录现有“非记录/图页”的查找链接可自然用于 garden；独立旧基线在 garden 中禁用全局搜索框并提示汇总全部记录，避免用户以为输入已经筛选日历。共享主题变量存在时主容器会消费其变量，两个子组件各自限定局部主题。

移植后在最终主目录重新执行日期测试、`npm run build` 和同一 UI 清单，特别检查编辑回填、暂停/系统减少动态效果、深浅/窄屏。当前独立分支证据不能替代合并后验证；本轮没有合并主分支。
