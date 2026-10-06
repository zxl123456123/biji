# 装扮短桌面预览补实施 R3.3

- feature_name: pet-space-customization
- impl_round: r3_3 / S6-A 计划内补修
- date: 2026-10-05
- owner: /root/wardrobe_layout_impl
- lwplan_version: S6/R3 PLAN_DEFECT-R1.1，SHA256 `C714ABA584F7E5ABE651C8808188D2B6D401698FBD60C2E55681DC63D080689E`
- 输入：fresh reviewer指出 `final-3d-1100x600-last.jpg` 左copy互动被footer遮。root派单给出实际1085×600下最后选项点击后反向Tab到休息按钮的几何：休息top542.925/bottom580.525，footer506.8..592，stage125.6..359.525；`final-3d-1100x600-reverse-tab-rest.jpg`记录实际遮挡。以上来自root消息，本agent未操作/独立读取媒体或真实浏览器，不把上轮正常尺寸或构建结果当此缺陷通过证据。
- 改前已读实际pet.css并核对两产品SHA。按root最新精确指示只调整现有短桌面media，先告知拟改再实施；已加载safe-code-changes继续适用。按本派单禁止构建/UI/native/Git/委派，不读取或更改其他文档，保留全部历史报告。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/pet.css` | 修改 | 仅max-height600px、min-width721px的已有media：stage min-height190→152px，画像宽184→112px；同media给原copy互动按钮scroll-margin-bottom184px | S6-A、L1，短视口预览/完整互动和Tab可达 |
| 本报告 | 新增 | 记录真实缺陷来源、实际差量/身份及静态自证；UI与最终构建由root承接 | S6-A证据合同 |

普通宽高和≤720px规则全部保持；没有隐藏/裁切简介、状态、按钮或画像，没有JS、新业务/依赖。TSX、handlers、文案、字体/行高、其他CSS/版本/候选/制品保持。

真实统一差量：[css-repair.patch](C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005/ui-impl-r3-3/css-repair.patch)，已完整读过。该media仅上述三项修订，原h2字号23px保持。

| 产品 | 改前 SHA256 | 补修 SHA256 |
| --- | --- | --- |
| pet.css | 70DD198780FE53C15EC182DC1D9213B45D38B3762854254E87F66D4BD160B39A | 72B23110E31FDDE9E150CF51B8636AA865C550EB5DB31E7AF565E0242F55AC13 |
| PetCompanion.tsx（只读） | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 |

## 目标对齐与自证

- goal_lock_check：通过短桌面画像/装饰高度缩小为完整互动让空间，并给真实copy按钮滚动目标留白。是否解决600/500px高度的正反向Tab遮挡，必须由root实际复测；不因数值估计宣称关闭。
- anti_goal_touch_check：严格selfcheck要求after精确等于before的单个现有media替换；其他CSS字节与整份TSX字节相同。无hide/clip/overflow/JS/状态变化。
- authoring_ergonomics_notes：只在既有短桌面media使用具体尺寸及原button选择器，无额外框架、滚动容器或第二画像。

本轮impl-safe验证：`python .../ui-impl-r3-3/check_repair.py`，工具 **7d981b exit0**。完整stdout/exit已读，证据为 `TEMP/qingjian-wardrobe-layout-20261005/ui-impl-r3-3/source-check.log/json`、`source-check.exit.txt` 与 `css-repair.patch`；改前两源副本同目录。owner为本实施agent；conclusion_if_missing：缺证不确认差量范围、身份或TSX保持。

本轮**未执行build、test、真实UI、native、Git或DB**，不使用上轮buildexit0为新源作构建通过声明。静态自证不证明原焦点遮挡修复。

## 失败、警告与移交

- 本轮静态命令无失败、读取无截断。前轮真实工具失败/构建警告和root现场缺陷全部保留；不修改旧报告。
- contract_drift_reports：无。改前pet.css70DD…/TSXDFFA…与最终输入一致，仍在S6同范围尺寸补修内。

| coordinator_handoff_verifications | 原因/承接 | evidence_expected | owner / conclusion_if_missing |
| --- | --- | --- | --- |
| 1100×600及桌面宽×500，五角色、正反Tab休息/招呼/选择，stage与完整copy/buttons可见 | 真实UI非impl-safe，root自行复测 | 新源码SHA对应截图、stage/copy按钮/footer几何、实际正反向焦点操作 | root；缺证不得称该IMPL_DEFECT关闭 |
| 普通高度/手机保持及最终独立test/build | 本轮明确禁止构建，由root承接最终源 | 新源完整日志/exit和必要UI回归 | root；缺证不得称新源构建/回归通过 |
| 新candidate来源/七差量、重建EXE与fresh review | 超出UI实施权限，root另派包装/承接构建审查 | 最终两SHA、新150manifest、完整构建/制品及审查证据 | root；旧candidate/EXE不冒充新源制品 |

未完成/重点风险：短桌面完整互动与焦点自动滚动真实几何、最终源命令和新EXE/审查仍待root；无产品成功结论。

回滚信息：**需人工介入**。只反向撤该media三项差量；保留R3–R3.2及他人工作，不整文件恢复/修改旧候选/清偏好。

英文提交建议：`fix(pet): keep companion controls visible in short desktop windows`。

无新增跨功能事实。
