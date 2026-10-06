# 宠物与空间外观文档同步 r1

日期：2026-10-05。角色：文档同步owner，S1实施已结束。本报告是当前源码能力说明的同步记录，最终产品验证与版本制品结果仍由root补正。

## 范围与依据

本次可写且实际写入五个文件：README.md、CHANGELOG.md、docs/Spatial.Experience.md、新增docs/Pet.Wardrobe.md及本报告。没有写产品源码、Project.Progress、版本、验证制品或记录时光文档，没有执行Git、UI、DB/native或递归委派。先向root发送路径和章节概要，再按用户自主实施授权推进；documentation-sync的阶段确认与自动commit建议不覆盖本轮明确授权和禁止Git边界。

已读取documentation-sync与verification-before-completion技能、Docs.Maintenance.Conventions、当前四份主文档（包括只读Project.Progress）、[S1报告](s1/impl_report_r1.md)、[S2/S3报告](s2-s3/impl_report_r1.md)、[LW](lwplan.md)的S4/R2和clarifications。另只读核对PetCompanion/petAppearance/petBehavior、SpatialNoteMap/spatialAppearance/spatialModels/spatialScene与App的真实选项、按钮、状态及存储许可。

文档输入副本位于`C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004/docs-sync-input-r1`；只用于核对，没有用旧快照覆盖工作区。并发保护依据为同级`concurrent-docs`。读取时依据身份记录为`docs-sync-basis-r1.json`（工具34cbe3，exit0）：

| 依据 | 读取时SHA256 |
| --- | --- |
| LW（含S4/R2） | 94C378EF989EFD5C8AF85F0936AB7F4615FBF7F3C8330EFF2D95297E06DE1CBA |
| clarifications | A55140A8435B741469F804C8B2CB37A12E1C082A5427A9F675F9965346751660 |
| S1报告 | 486ACAC5AB5CB6FFB2ED128E29409899DD9E0D1D0FB493E0370B9EAB03C6F8A4 |
| S2/S3报告 | A8A331A6845321E6C91057131266F357AC77D94F53DA146017E77F8F42CBF6DA |

读取时PetCompanion为21568字节/SHA BFE390FAE9465E78327C2AC8D6F1919CAD9CA52DE835B70128593B16C1FE0768，已较S1身份增加7字节；App为31001字节/SHA F456FCD6A262245BB78955EEC4DD7BB2531AB80E23C2A201331BFFF57B50A208。这是并发源码身份，已向root报告，不能作为S4或最终发布冻结完成证据。PetCharacters、petAppearance和petBehavior仍与S1报告身份相同；本次文档owner没有修改它们。

## 同步内容与需求追踪

| 路径 | 实际同步内容 | 映射 |
| --- | --- | --- |
| README.md | 当前0.7.0源码能力、五角色、免费装扮与三模型/三背景/两光效；0.6.0验证改为历史；独立标明本轮最终验证待汇总 | G1/G2/G3，A2 |
| CHANGELOG.md | 独立新增0.7.0未发布条目；试穿/应用/撤销/保留角色、SVG而非真3D、独立本机偏好、发布范围与待收尾 | G1/G2，A1/A2 |
| docs/Pet.Wardrobe.md | 使用步骤与选项、五角色各idle/happy、静态缩略图、草稿与已应用分离、保存失败会话生效、两个偏好键、所有子层动效/取消/隐藏边界 | G1/G3，A1/A2/A3 |
| docs/Spatial.Experience.md | 三模型/三背景/独立两光效、预览/应用/撤销/默认、共享模型/拾取/UUID/颜色/相机与资源事实，新增模块责任 | G2/G3，A1/A2/A3 |

宠物「恢复原装」与组合卡都保留当前试穿角色；空间「恢复默认」恢复整个空间外观，但仍需应用才保存。保存失败保留本次会话已应用外观，明确提示刷新/重启回到上次成功保存值；只有Apply写相应一个键，读取异常使用完整默认且不写回。新增helper的保护没有被描述成整个App可以承受全局storage拒绝。

用户Q1已明确：工作区保留月历，本轮0.7.0 EXE只包含宠物和空间外观。记录时光既有能力、116项旧增量证据与0.6.0历史制品记录分别保持，不将工作区/候选发布副本混用。本报告按照派单时S4状态保留待实施/待根收尾口径，未凭并发export或计划宣称共享月历已实现；最终状态由root据S4完成、fresh及实际工作区证据改写。

## 实际验证与失败

首轮改写脚本硬编码CRLF，遇到当前README混合CRLF/LF时匹配断言失败：工具8b545f，exit1，`AssertionError: Expected one occurrence`。失败发生在所有write之前，未产生部分文件改写。诊断61858c exit0确认README有58个CRLF、131个LF；随后仅调整TEMP脚本局部匹配，并保留未触及字节及既有换行。不能省略此失败。

实际写入命令为`python C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004/docs-sync-r1.py`，工具108f62，exit0，完整四文件写入输出与退出码保存于`docs-sync-write-r1.log`/`docs-sync-write-r1.exit`。

实际文档验证命令为`python C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004/docs-sync-verify-r1.py`。首次四文档检查工具59a113，exit0，完整输出已读：8项检查、46个本地Markdown链接、0失败。完整日志/退出码/身份在同级`docs-sync-verify-r1.log`、`.exit`和`.json`；加入本报告后继续用同一命令核对五文件，最新结果由这三文件保存。

| 保护检查 | 实际结果 |
| --- | --- |
| README记录时光段 | 与concurrent-docs原段524字节一致 |
| Spatial.Experience原宠物/记录时光隐藏段 | 与concurrent-docs原段471字节一致 |
| CHANGELOG记录时光未发布条目 | 与concurrent-docs原块753字节一致 |
| README/CHANGELOG 0.6.0及之前历史正文 | 与本任务输入副本逐字节一致（README只修改历史标题） |
| Project.Progress.md | 与本任务输入副本完整字节相同 |
| 四使用文档本地链接、UTF-8/替换字形/代码围栏 | 46链接可达，检查0失败 |

这次只验证文档保护、引用和文本结构，没有重跑npm test/build，也没有UI/GPU、刷新/重启、native/DB或制品验收；S1与S2/S3的历史日志只能说明它们各自记录的包级检查。本轮候选118测试/build没有被写成最终发布完成。

## 文档身份与根后续动作

| 使用文档 | SHA256 |
| --- | --- |
| README.md | D9ED9D35EDB7B6ACBB5A684EE6E19EB9E129F67D50CE27F8EF4EFF9F8FA83693 |
| CHANGELOG.md | 5832044AD3DADA062EDD2C37BFB55B5543ED7F156C200E6F94A64D6FBF01D030 |
| docs/Spatial.Experience.md | 059A2DAA39CDBDFEA371DD381946DED87F67D919DE3DBC0C91FCD7A7A1179FE8 |
| docs/Pet.Wardrobe.md | 34F10827DFAB75695B86499C33B2204100310412DC80C489A65BC62C81238CBE |

root需据最后r2/fresh/native证据补正README/CHANGELOG/空间及装扮文档的待收尾状态，并独占更新Project.Progress；分别说明工作区与排除月历的发布副本，保留实际失败/警告/未测。S4若完成，需要用实际共享与动态证据更新四文档的待实施句子，不能仅据Gate PASS改成产品完成。

documentation-sync和项目维护约定要求新增架构文档写入AGENTS索引。AGENTS不在本owner可写范围，已向root请求后续添加`docs/Pet.Wardrobe.md`索引；没有扩大权限。没有归档、删除或恢复任何旧文档。最终源码/制品冻结后，root可更新本报告状态而保留本次失败与保护证据。

English conventional commit建议：`docs: describe local pet wardrobes and spatial appearance options`。
