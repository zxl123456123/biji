# Composer Writing Modes — Impl r4

- feature_name: composer-writing-modes
- impl_round: r4（root停止自动链后手动限定承接）
- date: 2026-10-03
- lwplan_version: 有效R2（S1及R2.1–R2.7）；完整消费clarifications十节、source_materials/feedback_r4_20261003.md、review_notes_impl_r3_1.md全文及impl_report_r3.md。
- owner: /root/composer_empty_heading_impl；coordinator: /root。
- 结论边界：本轮只为D1空h2/h3生成资格补修提供局部源码、纯合同与Web构建自证。真实DOM、草稿/模板、root独立复验、fresh Review(Impl)和Windows交付仍由root承接；本报告不表示整体feature放行。

## 变更事实与exact diff

修改前三文件与root改前副本 `C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-r4-before-20261003` 的SHA256逐一相同，命令exit0。最终41个src/tests库存与r3完整库存相同，只有同一三文件变化；其他38个src/tests与五个扁平metadata文件字节相同，版本仍0.5.2。未执行Git、真实UI、DB、服务、Windows打包或递归委派。

逐行LCS完整差量已实际读取，保存在 [qingjian-composer-impl-r4-exact-diff.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r4-exact-diff.log)；这份差量以r4三文件副本为基准，不使用混合Git diff。

| path | change_type | change_purpose | key_changes | related_tasks |
|---|---|---|---|---|
| src/noteCodec.ts:63 | 局部修改（+12/-4） | h2/h3不生成空正文前缀 | 新headingLiteral在生成前沿既有withoutTags资格采样；复用引用原规范化表达式为私有hasInlineBody，空正文只保留原tagsFor提取序列；默认parse仅改说明注释 | D1 / S1 / G1/G2 / N2 |
| src/noteFormat.tsx:2、85 | 局部修改（+5/-2） | 真实标题分支消费同一纯合同 | import headingLiteral；只在返回值非空时附块换行。inline采样、DOM/选区/history/命令未变 | D1 / S1 |
| tests/noteCodec.test.mjs:3、154 | 追加直接合同（+85/-1） | 复现空标题并保留有字语义 | 四项纯合同直接调用生产headingLiteral及生产contentWithTags/withoutTags/tagsFor，再parse→安全HTML/plain；没有假DOM、源码镜像或新库 | D1 / S1 / S4自证 |
| docs/current/composer-writing-modes/impl_report_r4.md | 新增 | 本轮差量、证据、失败和承接 | 保留r1–r3原报告；根当前能力文档由root根据最终证据同步 | 正式实施报告 |

核心源码差量：

```ts
function hasInlineBody(body: string, normalise: (text: string) => string): boolean {
  // Qualification uses the existing tag rule; code and escaped authored symbols stay visible.
  const normalized = splitProtectedCode(normalise(body)).map(part => part.code ? part.text : part.text.replace(/[*_]/g, (marker, at: number) => escaped(part.text, at) ? marker : '')).join('')
  return !!inlinePlain(parseInline(normalized, true)).trim()
}
export function headingLiteral(body: string, level: 2 | 3, normalise: (text: string) => string, extractTags: (text: string) => string[]): string {
  if (hasInlineBody(body, normalise)) return `${level === 2 ? '#' : '##'} ${body.trimEnd()}`
  return extractTags(body).map(tag => `#${tag}`).join(' ')
}
// quoteLiteral calls the same qualification helper; its output branches stay unchanged.
if (tag === 'h2' || tag === 'h3') {
  const heading = headingLiteral(Array.from(node.childNodes).map(inline).join(''), tag === 'h2' ? 2 : 3, withoutTags, tagsFor)
  return heading ? heading + '\n' : ''
}
```

代码写入后mtime为2026-10-03 15:54:30.242（UTC07:54:30.242）；测试mtime为15:53:27.952。最终SHA256：

| 文件 | before → after |
|---|---|
| noteCodec.ts | d810bd056aea35c33387cdb6e6b4fb5ef7bb45dff276fb5cc37c204664694cae → 1192573df81e1efdc4ea5fe4d36cd35a2a9d1fcc862ceb4d91c807aab67caf99 |
| noteFormat.tsx | 9e7e3a8e98ecd2fdce8f5fe7ea120d1c6d47c06202636230efcee787a5ad3820 → 369b50b1cf3bc740daedce656cd9d6e0a48e6b75bac80b2758e24e7e75ff59f2 |
| noteCodec.test.mjs | cd4b921bfafaf80627307b292df43a929b542d73838d05d873f8e8a864ecea6f → 5270306738cc0418a15cd92328fd63a194f883e65309da6ba21e6298f0421bed |

## 目标对齐与取舍

- goal_lock_check: 对应G1/G2同一保存、草稿、回填规范化遗漏；仅限制h2/h3前缀生成，保留有字两级标题、相邻段落顺序、样式/code文字及标签。
- anti_goal_touch_check: 未修改裸`#`/`##`默认解析、普通tag regex/语义、草稿或模板保护、DOM/history/选区、metadata、依赖、schema。没有清洗旧坏草稿/已保存记录。无正文标签标题输出原标签序列，不能借去标题前缀吞metadata。
- authoring_ergonomics_notes: 两个直接消费者共用现资格表达式，函数接收既有生产helper，codec不反向import recordTools；没有通用编辑器模型或第三套标签规则。测试断言有限生产结果，不把纯字符串当浏览器DOM。
- 已读本feature既有research及[CommonMark 0.31.2 §4.2](https://spec.commonmark.org/0.31.2/#atx-headings)作官方参考入口；本轮采用项目已冻结的空编辑暂态与真实trim合同，不扩成完整CommonMark或改变裸作者符号解释。

## impl-safe真实证据

以下命令在本轮实际执行，退出码和完整输出均已读取，无尾部管道。完整输出分别保存为下列日志；测试与build串行执行。PowerShell记录保留原命令LASTEXITCODE，并使用相同值退出。

| evidence（命令、退出码、完整输出位置） | owner | conclusion_if_missing |
|---|---|---|
| 先将原标题输出抽成纯生产headingLiteral，尚无guard；`node --test --test-concurrency=1 tests/noteCodec.test.mjs` **exit1，17项14pass/3fail**。完整[red-test.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r4-red-test.log) | impl | 不称新增黄金能捕获原缺陷 |
| 只加guard后同命令 **exit0，17/17，fail/cancel/skip0**。完整[green-test.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r4-green-test.log) | impl | 空标题纯合同未自证 |
| `npm.cmd test -- --test-concurrency=1` **exit0，69/69，fail/cancel/skip0**。完整[test.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r4-test.log) | impl | 不称当前全量回归通过 |
| `npm.cmd run build`（tsc -b与Vite/PWA） **exit0**。完整[build.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r4-build.log) | impl | 不称当前Web构建成功 |
| Node库存/SHA256断言及逐行LCS读取 **exit0**，41源/测试中仅三文件差量，五metadata相同。完整[scope.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r4-scope.log)及exact-diff.log | impl | 差量与版本边界未核实 |
| Node默认parseInline/parseNote与quoteLiteral逐例比较r4-before；初次后果夹具错误 **exit1**，完整[compatibility.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r4-compatibility.log)。仅改诊断期望后 **exit0**；1,536源串三项输出严格相同，空/换行/仅标签h2/h3下游正确，完整[compatibility-green.log](C:/Users/ZXL/AppData/Local/Temp/qingjian-composer-impl-r4-compatibility-green.log) | impl | 默认兼容/原纯症状未自证；不能忽略初次失败 |

黄金红测实际失败：空body生成`'# '`而非空；仅`#旅行`生成`'# #旅行'`而非仅原标签；相邻空标题产生plain `'#\n首段\n#\n尾段\n#'`。这是原生成逻辑的生产结果，非缺失import/假DOM失败。原13个codec项和新增有字合同仍绿色。

新增矩阵：h2/h3全空、br换行、空白及粗/斜/颜色/字号空包装；普通标签独占标题与样式内标签，重复/大小写/旧`_#旅行_`名字`旅行_`及有/无/同名外部标签；首中尾空标题与两个有字段落；有字两级标题、组合粗斜、旧颜色字号、代码中的hashtag/格式/HTML/尾反斜杠；标题内与普通正文作者literal `#`/`##`保持。所有下游都经生产保存helper与真实trim，不改普通标签定义。

本轮Web输出仍0.5.2：entry `index-Dktrhydh.js`430.26kB/gzip138.44kB；CSS `index-Dj4Xd2YQ.css`38.22kB/gzip8.36kB；Graph `NoteGraph-Etr8E3qz.js`75.59kB/gzip26.17kB；Worker `noteGraph.worker-C1x8NuDj.js`7.03kB；PWA7项544.21KiB。不是Windows制品。全量中Node stripTypeScriptTypes ExperimentalWarning保留。

## 已见失败与contract_drift_reports

- 上述红测exit1保留；附加诊断第一次把非空字符串`'\n'`的truthy错误视作有旅行标签，期望`['旅行','外部']`而实际正确`['外部']`，exit1。只修诊断期望为生产tagsFor(body)，未改功能或测试放宽。1,536项比较在该诊断前已走完，最终命令再次走完并记录exit0。
- 首次合并长文工具输出被截断，随后分块完整补读clarifications、r3报告、S1及审查末段，没有把截断当完整消费证据。
- root回传首轮UI按原症状仍显示裸`#`；随后的reload为ERR_CONNECTION_REFUSED，root查5175无listener exit1，直接说明原页为已载旧模块，不能据此判当前patch失效。root已启动当前工作区同端口Vite并承接重载复测。此为root来源观察与诊断，impl未操作UI、未声称真实现模块绿色；后续实际结果应由root落verification。
- r1–r3失败和未测继续保留在对应报告及verification，不由本轮覆盖；特别r3空h2/h3纯反例exit1、真实裸`#`和r3Windows E0460 exit1依旧是历史事实。包级缓存清理exit0不代表新Windows包成功。
- 既有停止语义drift（薄入口连续两轮IMPL_DEFECT停止，与正式core附加“第二轮已对齐LW仍失败”的差异）、反目标简写/完整判序及LW默认字段口径仍按r3审查保真。root已暂停自动/发布，按持续授权手动限定r4；本agent没有修改技能或镜像。本轮未发现需要扩标签规则、模板保护、目标/风险的新增漂移。

## coordinator_handoff_verifications

| 验证及移交原因 | evidence_expected | owner | conclusion_if_missing |
|---|---|---|---|
| 当前模块真实h2与h3分别全选清空→关闭→新建；非impl-safe | 已确认当前源码的实际DOM/visible/body，草稿不冒内部前缀，空白新建恢复三模板 | root自行执行 | 不称真实空标题症状修复或G2通过 |
| 仅标签标题、格式包装标签标题与相邻有字段落；有字两级标题四方 | 关闭恢复、保存卡片、graph-note详情、编辑回填的正文/标签/顺序保持；原8条用户记录不被覆盖 | root自行执行 | 不称保存/回填四方闭环通过 |
| 阅读模板全清空及r1/r2/r3原短例保持、原生undo/快捷保存/深色 | 当前模块短步骤与实际文字/DOM，引用标签无裸`>`、列表续写顺序保持 | root自行执行 | 不以69项或Web构建证明浏览器行为 |
| root新独立全量/build与fresh mandatory Review(Impl) r4 | root真实完整命令和未参与实现reviewer的独立差量/结论 | root调度/执行 | 保持发布/Archive/PR停止 |
| Windows新release、版本/哈希/启动/旧库只读核对 | 当前源新制品和真实exit/版本/SHA256/启动证据；未测平台明确保留 | root自行执行 | 不交付旧失效候选或宣称当前EXE已有补修 |

## 未完成、风险与回滚

本agent提供的是局部自证；上述root承接项、fresh审查与Windows交付未由本agent执行。无需新增用户产品决策，但不得以本轮纯绿色越过正式审查或自动停机边界。根README/CHANGELOG/Project.Progress的当前事实由root依据最终证据同步。

rollback: **需人工介入**。仅依据r4副本撤当前三文件本轮局部差量，不能restore/reset/clean混合工作，不退回旧codec覆盖新格式，不吞标签或清洗作者裸符号。报告与红/绿失败记录保留。

英文提交建议：`fix(composer): omit empty heading prefixes after tag normalization`（建议而非本轮Git动作或整体提交许可）。

无新增跨功能事实。
