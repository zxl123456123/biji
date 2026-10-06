# 装扮手机焦点滚动补实施 R3.2

- feature_name: pet-space-customization
- impl_round: r3_2 / S6-A 计划内补修
- date: 2026-10-05
- owner: /root/wardrobe_layout_impl
- lwplan_version: S6/R3 PLAN_DEFECT-R1.1，SHA256 `C714ABA584F7E5ABE651C8808188D2B6D401698FBD60C2E55681DC63D080689E`
- 输入：root复测R3.1同组件的375×500受控2x文字夹具。反馈为footer160px、preview top8..135.2、footer332..492，末项187.95px可容纳于196.8px间隙；但末卡获得焦点后居中150.9..338.85，底padding6.85px被栏盖，标签238.45..296.05完整。以上为root派单测量，本agent未操作浏览器或独立重测；本轮仅承接S6完整配置行/键盘要求的剩余补修，不以估算宣称关闭。
- 已读真实 [impl_report_r3_1.md](impl_report_r3_1.md)、当前源与其SHA，继续遵守已加载safe-code-changes的同范围/impl-safe/不递归规则；本轮重新读verification-before-completion。改前无漂移，先向root发最小拟改消息再实施；全部前轮报告/失败保持。

## 变更事实

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src/pet.css` | 修改 | 仅已有≤720px `.pet-option-group button`规则追加 `scroll-margin-bottom: 184px`，给浏览器焦点自动滚动提供更多底部留白 | S6-A、L1；S6键盘与完整末项要求 |
| 本报告 | 新增 | 实际单声明差量/身份与自证，现场及发布交回root | S6-A证据合同 |

未改TSX、handlers、文案、字体/行高、其他CSS、版本或依赖。没有新选择器/媒体条件，没有操作candidate、服务、native、DB、Git或浏览器，没有递归委派。改前副本及日志在 `TEMP/qingjian-wardrobe-layout-20261005/ui-impl-r3-2`。

真实统一差量：[css-repair.patch](C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005/ui-impl-r3-2/css-repair.patch)，已完整读过：

```diff
-  .pet-option-group button { padding-left: 5px; padding-right: 5px; }
+  .pet-option-group button { padding-left: 5px; padding-right: 5px; scroll-margin-bottom: 184px; }
```

| 产品 | 改前 SHA256 | 补修 SHA256 |
| --- | --- | --- |
| pet.css | 5FF9E8BB806739CA0CE8E998F7D19FB5C2AA4F179F8B48C4968D46CC20EB734C | 70DD198780FE53C15EC182DC1D9213B45D38B3762854254E87F66D4BD160B39A |
| PetCompanion.tsx（只读） | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 | DFFAAEF166D5B1ECFE26258795336C8EBE0D37007170641659C3807F48DAAC14 |

## 目标与范围保持

- goal_lock_check：只影响手机选项的滚动目标边距，试图在原预览/底栏之间保留完整焦点卡；184px来自root实测后的有界初值，实际UA自动滚动结果必须由root重测。
- anti_goal_touch_check：严格selfcheck确认after仅为before的这一条声明追加，所有其他CSS字节相同、整份TSX字节相同；桌面common `scroll-margin-block:150px 160px` 与原画像、状态、全文消息/控件均无差量。
- authoring_ergonomics_notes：复用现有手机规则的一项具体边距，不新建测高JS/滚动容器，不裁切末项或文字，不加抽象。

## impl-safe实际验证

本轮完整输出与最终exit已读取。evidence目录为 `C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005/ui-impl-r3-2/`；owner为本实施agent。

| 实际命令 | 结果 | evidence | owner / conclusion_if_missing |
| --- | --- | --- | --- |
| `python .../check_repair.py` | exit0，严格单声明替换，其他CSS/整份TSX字节相同，实际SHA/diff输出 | source-check.log/json、source-check.exit.txt、css-repair.patch；4e24b4 | impl；缺证则不确认范围/身份 |
| `npm.cmd run build -- --outDir C:/Users/ZXL/AppData/Local/Temp/qingjian-wardrobe-layout-20261005/ui-impl-r3-2-dist` | **exit0**，tsc/Vite2515模块/PWA generateSW完整结束，precache14项 | build.log、build.exit.txt；4b76a2 / completion d75d1b | impl；缺完整输出/final exit则不称build通过 |

输出为拒绝既存的新TEMP目录，未覆盖workspace dist或candidate。主JS591.04kB、3D590.48kB，precache1343.79KiB；构建仅证明类型/产物，不证明原焦点症状或EXE。

### 失败与警告

- 本轮没有命令/构建失败；完整读取未截断。
- 保留本轮外部outDir不会自动清空与>500kB chunk警告，不进行无关性能重构。
- 前两报告的真实命令失败/提示与root真实2x布局问题均保留；R3.1仍有6.85px底padding遮挡是本轮来源，未被旧正常布局结果或buildexit0关闭。

## coordinator_handoff_verifications

| 项目 | 原因 / 建议承接 | evidence_expected | owner / conclusion_if_missing |
| --- | --- | --- | --- |
| 同375×500/2x夹具的末项→Tab应用自动滚动、完整卡/标签与failed status | 真实浏览器非impl-safe，root自行重测同夹具 | 预览/底栏/末卡几何、焦点顺序与截图，完整status操作证据 | root；缺证不得称剩余IMPL_DEFECT关闭 |
| 正常尺寸/两入口及最终两源独立test/build，fresh审查 | 集成与现场归root | 新源对应完整日志/exit及实际回归/审查 | root；旧字节证据不自动覆盖新源 |
| 新finalcandidate包装/150+七差量/保护及0.7.1制品 | 不属于UI补修权限，root另派/承接 | 最终两SHA、新来源manifest/构建/制品/旧库保护证据 | root；缺证不得称EXE交付通过 |

## 未完成、漂移和回滚

- contract_drift_reports：无；改前两源与R3.1身份相同，仍在S6允许的布局小幅调整内。
- 未完成/重点风险：浏览器自动焦点滚动是否按scroll margin移动、常规尺寸回归及最终发布/审查，须root现场核验；本报告不放行UI。
- 回滚信息：**需人工介入**。只删除本轮追加的手机 `scroll-margin-bottom:184px` 声明，保留R3/R3.1与所有其他工作，不整文件还原或清偏好。

英文提交建议：`fix(pet): keep focused wardrobe options clear of the action bar`。

无新增跨功能事实。
