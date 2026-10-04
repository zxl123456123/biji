# 记录时光接入说明

日期：2026-10-05。独立分支从 `630bf4d`（0.3.0）开发。用户明确要求叠加当前功能后，本轮把单一月历模块接入 `E:/project-funny/biji` 的 0.6.0 工作副本；原空间、排序、搜索、格式及数据源码保留。主目录他人未提交工作没有纳入本分支提交，也没有合并整个主目录。

## 文件边界

新增 `RecordGarden.tsx`、`RecordDayViews.tsx`、`RecordCompanion.tsx`、`recordGardenModel.ts` 与对应三份 CSS，只依赖已有 React、lucide-react 和 Note 类型。日期模型测试独立使用 Node 22.18+ 的类型剥离；没有 package、lockfile、存储、Rust 或数据库改动。

0.3.0 分支 App 仍仅作独立宿主，不能覆盖当前 0.6.0 App。本轮只复制八份自有组件/CSS/模型测试文件，对实际主目录 App 作 lazy、View、导航、viewContent 和浮层宠物隐藏的局部接线；没有复制旧 types、App、package、公共 styles 或 Rust。

当前主目录 Note 具有排序/置顶元数据，日历只读完整数组并保留传入顺序，不改这些字段。旧基线仅作独立 Web 预览；不得用其旧 Rust/桌面数据层写主目录迁移后的真实 SQLite，避免丢失新字段。

## 当前 0.6.0 接线

接线前 App SHA256 为 `02BF0FDAFFCCBC74E836385A5FFCF9AE48E2FCE702E816F4B25B9366B24F4DCD`。复用已有 lazy/Suspense、`editLatestNote(id)`、`createInView` 和 `motionAllowed`；补 `CalendarDays` 导航及安全格式工具。实际接线已在主目录应用，见 [精确补丁](integration-0.6.0.patch)。补丁采用零上下文以只记录自有接入行；它不是当前 App 的整文件替代品，禁止对已接入文件重复应用。

```tsx
import { renderMarkdown } from './noteFormat'
import { withoutTags } from './recordTools'
const RecordGarden = lazy(() => import('./RecordGarden'))

// Add this branch beside the existing viewContent branches.
viewContent = <Suspense fallback={<div className="content" role="status">正在打开记录时光…</div>}>
  <RecordGarden notes={activeNotes}
    renderNote={note => renderMarkdown(withoutTags(note.content) || '仅标签记录')}
    onOpenNote={editLatestNote}
    onCreate={createInView}
    animate={motionAllowed}/>
</Suspense>
```

组件消费全量有效记录，不消费每批 60 条的卡片数组；展示口径始终显式说明。`onOpenNote` 用稳定 id，从宿主取最新记录后打开，不复制编辑器或保存逻辑。正文须复用安全纯文本排版，不能改成危险 HTML。

主目录原“非记录/图页”的查找链接自然用于 garden，不改变旧 query 状态。时光页隐藏浮动晴小团，返回原记录页保留其显示偏好；不修改 PetCompanion、空间大展示或行为状态。正文容器同时使用原 markdown-preview 样式和局部 rg 样式，没有任意 HTML。

需要在完全相同的未接入 App 基线上重放时，先核对以上 SHA，再用 `git apply --check --unidiff-zero <补丁路径>` 检查；已接入的主目录只可用 `--reverse --check --unidiff-zero` 核对增量，不能回退他人工作。本轮会实际执行只读反向检查。源基线变化时应按补丁审阅接线，不能盲目应用零上下文补丁。

当前主目录已重新运行完整 `npm test`、`npm run build` 和实际 UI 清单；独立分支另跑日期测试与 build，证据分别保留在 [本轮验证](verification-single.md)。当前安装器仍是叠加前 0.6.0，不含本轮 Web 增量；不能用独立旧基线桌面层写升级后的真实库。
