# S2 r2：三小只连续豆形候选

- feature_name：desktop-pet-and-quiet-workspace
- impl_round：S2 r2
- date：2026-10-07
- lwplan_version：Review(LW) r2 PASS 的 §5.1–3；承接 root 实际造型观察反馈，未新增产品范围。
- 状态：模型和本机打包验证已执行，候选 `awaiting_user_review`；真实新 EXE 及最终满意度交 root / 用户。

## 反馈与依据

root 在静态正式包 5342 逐五角色 canvas ready 后反馈：原创保留轮廓、奶龙较贴近，吉伊/小八/乌萨奇有大头、窄脖与独立椭球躯干接缝，对照原 SVG 的无脖短圆体型不贴合。此为 coordinator 的真实视觉观察，不伪称用户新增原话或最终定稿。

本轮先实读 `src/PetCharacters.tsx` 三角色 SVG 路径，实际看前版三 `*_front.png`：确认原 3D 的分体横缝与高躯干。只修改三候选，接口及源码冻结，未操作 UI、提交或业务数据。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| 外部 refined `revision1/` | 新增个人备份 | 五前版 GLB、blend、20图片、五manifest、总manifest和脚本复制；逐 GLB hash 核对后才改候选，不删除原旧目录 | S2.1，可回滚 |
| 外部 `build_refined.py` | 修改本机脚本 | 仅三小只体型：分别调整主体宽/深/高，把 BodyShell+Head 真 join / voxel remesh / smooth 成连续单一面；小四肢下移缩小；全造型轻压高度成短豆形，猫耳/圆耳/长耳、蓝额/脸与饰品相对关系随同保持 | S2.2–3，G1 |
| 三 `.blend/.glb` 和12张 front/side/back/desktop 预览 | 修改生成候选 | 重导交付 GLB 后实际渲染；保留三独立角色几何细节和不同体比例，不是同模换色 | S2.1–3 |
| `verify_beans.py` / 三manifest/总manifest | 新增/更新本机证据 | 直接读 GLB index 并做连通分量检查：BodyShell 恰一primitive、一connected component、无独立Head节点；记录 revision2、备份路径、hash、vertices，仍 awaiting_user_review | S2.1–3 |
| ignored `src/local-pet-models/{chiikawa,hachiware,usagi}.glb` | 修改个人生成物 | source/manifest验证后复制；正式dist逐hash一致；不stage | S2.4 |
| 本报告 | 新增 | 保留本轮反馈、失败、证据与责任 | S2验证 |

源码接口、renderer、业务、Rust、布局及玩法均无本轮变更。原创/奶龙 GLB+blend+4预览各自逐文件 byte-for-byte 对 revision1 相等。

## 目标与作者体验

- goal_lock_check：模型用于桌宠而非正文；根据实际小尺寸显示反馈细化三造型；同名四动作/四饰品仍供既定接口使用。
- anti_goal_touch_check：无新增正文元素、网络/聊天/养成/配置、业务写入、公开模型或制品上传。
- authoring_ergonomics_notes：局部 Blender 生成步骤，不新增应用抽象。三主体参数有区别；原创和奶龙保持前版，并可直接从 revision1 取回三模型。
- contract_drift_reports：无协议/范围漂移。本轮仅 §5 授权的候选体型细化；模型视觉不以格式检查冒充满意度。

## impl-safe 验证与真实失败

owner：S2 impl，全部本机可重复命令。conclusion_if_missing：任何缺证据的角色只能报告候选未验，不能称动作、连续面或打包正确。

1. 最后 strict `Blender --background --python-exit-code 1 --python .../build_refined.py -- {chiikawa,hachiware,usagi}` 三命令均 exit 0；本轮读了三个完整日志，包含保存、GLB导出、重导、四张图Saved、最终manifest，无Traceback；保留 use_nodes 未来弃用警告。日志 `E:/pet-model-workbench/refined/2026-10-07/{角色}-build.log`。
2. `Python312/python.exe .../verify_candidates.py` exit 0：五角色四clips各21channels，中性base scale1、rest首帧眼scale约0.045、真实idle/happy/walk变化、所有图片存在，原创/奶龙hash仍r1。
3. `.../verify_beans.py` exit 0：直接BIN索引拓扑检查三 BodyShell 都是1 connected component，无Head节点；吉伊13838、小八13274、乌萨奇13522vertices。证据三manifest `continuous_body`，不是单纯对象名称断言。原创/奶龙GLB对revision1内容相同。
4. **首次个人 `npm run build` exit 1**：乌萨奇2,118,820 bytes超过现PWA缓存2MiB上限，真实构建报 `Assets exceeding the limit`。没有改PWA限制；仅把三 remesh voxel 从 .025 调 .032减少不必要面数，全部重导/重渲/拓扑与动作检查。
5. 最后个人 `npm run build` exit 0，2532 modules / PWA31entries：五GLB含三新体型；三新尺寸1,738,608 / 1,778,840 / 1,828,252 bytes，均在现限内。完整输出已读；仍有三维chunk大于500kB的既有警告，未混入优化。
6. 五 source / manifest / dist hash比对 exit 0，逐角色dist恰一个资源。`git check-ignore`输出三个本机路径；最后`git diff --check` exit 0，仅LF/CRLF警告。
7. 原创/奶龙 `.glb/.blend/_front/_side/_back/_desktop` 共12文件对本轮revision1逐hash相等，exit0。本轮没变应用源码，所以没有增加镜像单测；S4仍须 fresh 整库tests/build与EXE验证。

## 新候选身份

| 角色 | bytes | SHA256 |
| --- | ---: | --- |
| chiikawa | 1738608 | 1aa703a0e1beb472a26d7bc24318319fe943e8bd215d15cd6ea4d313fa8cf863 |
| hachiware | 1778840 | f5261be86a2f346f79e578c8c934f06c6cee8e7ca989c1903033c3cbc93327b4 |
| usagi | 1828252 | c7e2b08ffaf90be3d3688a2e8e18238456e47f0bdfed891134580f0a51a25169 |

原创 `8812e06b...25ef24f`、奶龙 `76182594...e89d472` 完整hash见r1报告，保持不变。新manifest和图片在原refined位置，前版在其revision1。

## coordinator_handoff_verifications / 未完成与风险

- root承接：重新构建的正式包/EXE三模型加载、实际220px轮廓、蓝额穿插/配饰位置/动作和视觉满意判断。evidence_expected：实际新hash来源与三新截图；conclusion_if_missing：仅能称候选连续面/打包格式正确，不能称最终造型满意。
- root承接：S4应用文档、最终EXE进程路径、同源全测试，沿既定验证责任；本轮无平台/业务验证。
- 网格是实际连续表面，仍保留角色轮廓局部曲率；“无拼接缝”是几何观察，不承诺与原画完全一致。现候选仍需用户判断。

## 回滚

可直接回滚个人资产：从已校验 `revision1` 复制三个旧GLB到local目录，再构建；无数据迁移或源码回滚。保存旧脚本和所有旧图片，未覆盖用户更早角色目录。

建议英文提交沿本功能：`feat(pets): use refined local models in shared renderer`。本轮模型不提交Git。

无新增跨功能事实。
