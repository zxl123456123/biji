# 排序与置顶：Backend实施报告 r1

- feature_name：note-order-and-pinning
- impl_round：backend r1
- date：2026-10-04
- lwplan_version：最终LW，SHA256 `257CB0E8D6EB1A58827B91E6351EE43769B100E804AC69A84D379111C7D9BFAE`
- 实施授权：root明确回传fresh Gate-2 R2 PASS / allow_enter_impl=yes，已完整核对后按Q0/Q1开始；此前预读没有改生产文件或跑cargo。
- 状态：S0→S1→S3 backend代码已写入并通过本轮纯编译，9个数据库测试仅已编译，尚未执行；实际迁移、往返及产品验收由root承接，不称完整功能完成。

## 变更事实

以下比较本轮TEMP/before，而非混合HEAD：`C:/Users/ZXL/AppData/Local/Temp/qingjian-note-order-20261004/`。

| path | change_type | change_purpose / key_changes | related_tasks |
| --- | --- | --- | --- |
| `src-tauri/src/lib.rs` | 修改，+22/-5 | 独立S0提取initialize_database/load_from_connection/save_to_connection三薄helper；S1默认pin、幂等新增两列、位置读回、完整数组枚举保存；新增测试模块声明 | S0/S1 |
| `src-tauri/src/database_tests.rs` | 新增，207行 | 9个实际消费生产helper的数据库/serde测试；不复制迁移/load/save生产SQL作为被测对象 | S1 |
| `src-tauri/Cargo.toml` | 修改，+1/-1 | 仅本项目version 0.5.3→0.5.4 | S3 |
| `src-tauri/Cargo.lock` | 修改，+1/-1 | 仅qingjian自身version同步，旧依赖字节保持 | S3 |
| 本报告 | 新增 | 分阶段变更/真实纯编译证据/未运行数据库验收交接 | S0/S1/S3 |

未修改npm、tauri.conf、前端、当前产品文档、旧feature或真实数据库，未启动服务/程序、运行安装器或执行Git操作。对应功能文档由root依据实际证据同步。

## S0独立步骤与保行为证据

先提取三个连接helper，AppHandle wrapper只获得原连接并委派。该阶段尚未加pin/position/版本/测试。S0源码单独保存为TEMP/backend-s0-lib.rs，SHA256 `2CB3BDC385482CC5FC83EB51415CD75421EF512A7104486B5A0EA305361C7981`。

实际静态命令从before/lib.rs与S0源码提取全部Rust字符串字面量，比较数量和顺序：**46项全等**，exit0（tool chunk cf1e46），包含原PRAGMA/CREATE/旧deleted_at迁移/原SELECT排序/DELETE/INSERT和原网络/错误文案；证据TEMP/backend-s0-static.log。已逐段确认初始结构保持：initialize仍返回String错误、load仍显式同列与created_at DESC、save仍一事务DELETE两表再INSERT/commit；S0没有添加repository/trait/新crate或第二份SQL实现。此检查只证明源码静态保持，不称旧库运行验收。

S0记录后才进入S1。原AI/凭据/run块在最终源码与before逐字比较仍相同，见下方第二静态证据。

## S1数据与接口事实

- Rust Note新增`#[serde(default)] pinned: bool`，未给前端公开position；旧JSON缺pin为false，原字段形状保持。AppData/Transaction协议不改。
- initialize_database保持原WAL/foreign_keys、表创建和deleted_at兼容；新增pragma检查后才ADD `pinned INTEGER NOT NULL DEFAULT 0`及`position INTEGER`。旧7列先补deleted_at，旧8列补新两列，position原值为NULL；已有列不再重复ADD。
- load_from_connection显式读取pinned，排序为`position IS NULL, position ASC, created_at DESC, id ASC`；非NULL已保存顺序优先，legacy NULL按日期/id回退。历史同created_at的未定义tie不冒称完全保持。
- save_to_connection保留原一个事务，同时DELETE/INSERT notes和transactions。完整notes数组`into_iter().enumerate()`写0..N-1 position，包含Trash；pinned写0/1，其他原字段原样传入。INSERT失败沿Result提前返回，未commit事务由原SQLite事务生命周期回滚；由测试和root执行证明，不凭源码称回滚验收。
- 原交易INSERT/加载排序/网络/凭据不改；后续UI pin排序仍由前端同一数组拥有，本实现不建立第二顺序来源。

## 新测试代码与执行责任

全部测试通过`super`消费上述生产helper。以下是**已编译、未执行**的测试代码，而非通过清单：

1. `seven_column_database_preserves_old_fields_and_defaults_metadata`：旧7列笔记/非空账目，逐旧字段比较、默认pin=false/positionNULL、重复初始化、补deleted_at。
2. `eight_column_database_preserves_trash_and_migrates_once`：旧8列含删除时间，旧列/交易保持，重复迁移不增列，legacy日期/id确定回退。
3. `current_schema_reinitialization_preserves_array_order_pin_trash_and_transactions`：10列重复初始化，数组含已完成Trash和pin，存储位置0..N-1及所有记录/交易字段保持。
4. `reordered_complete_array_round_trips_without_changing_note_fields`：完整数组逆序写读，Trash与pin仍原字段，位置与数组一致，不按创建时间覆盖。
5. `positioned_rows_precede_legacy_rows_with_date_and_id_fallback`：混合position/NULL，已排老日期记录优先，NULL旧记录按日期/id回退，删除/pin保持。
6. `failed_note_insert_rolls_back_notes_and_transactions`：重复note主键使事务失败，两表原字段及pin/位置保持、回到autocommit。
7. `failed_transaction_insert_rolls_back_completed_note_inserts_and_both_tables`：先写replacement notes，再重复交易主键失败，整个两表回滚；不只测首次note插入错误。
8. `old_json_without_pin_deserializes_to_false_and_new_pin_round_trips`：旧version1 JSON缺pin/可选日期默认可读，pin=true序列化/反序列化，公开输出无position。
9. `file_database_close_and_reopen_retains_array_metadata_and_transaction_fields`：由root运行时在std临时目录创建本测试自有唯一文件，写入并关闭→重新打开/初始化/读取，比较完整字段和位置，关闭后仅删除自有文件；不指向真实用户DB。

root应独立执行cargo check/test完整输出及退出码，不能以本报告或编译输出代替这些数据库测试运行。当前测试没有访问任何真实凭据/网络或用户工作流状态。

## 目标与反目标核对

- goal_lock_check：G1 backend已提供数组顺序持久投影和读回；G2默认pin和持久化；G3原字段/交易保持、S0保行为、同一事务以及有意义测试代码。完整G1/G2仍需front与root真实证据，不由此报告标产品通过。
- anti_goal_touch_check：A1无装饰替代排序/跨区元数据/动效策略修改；A2无公开sortOrder、新偏好ID权威、repository/云同步/依赖升级或顺手修App/store；A3未改未知文件、Git/生成物/旧报告，没有用0个测试冒充迁移验收。
- authoring_ergonomics_notes：三个短helper保持原数据通路；SQL显式列和一眼可见的enumerate，沿现有String错误和原compact风格；新207行测试独立模块按场景分项消费生产函数。版本配置只改本包自身值，不要求维护者理解新泛型/框架或第二数据源。

## impl-safe真实验证

已完整读取verification-before-completion，并在当前实施轮执行下列证据；不以历史或他人结果下结论。

| 命令/步骤 | evidence | owner | 结果 | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| S0 before/S0全字符串静态比较并保存中间快照 | TEMP/backend-s0-static.log；chunk cf1e46，完整输出已读 | backend impl | exit0，46项全等 | 不称S0行为保持 |
| 最终AI/run尾块及两Cargo own-version静态精确比较 | TEMP/backend-static.log；chunk830d5f，完整输出已读 | backend impl | exit0；AI/run相同，Cargo仅自版本，9个测试声明 | 不称范围/依赖保持 |
| `cargo check --locked --manifest-path src-tauri/Cargo.toml --jobs 1 --tests` | TEMP/backend-cargo-check.log/.exit；session69056最终chunk2ee9dc，完整输出已读 | backend impl，root协调重资源 | exit0；纯编译包含9个测试，31.77s；无测试执行 | 不称编译通过；数据库仍未验证 |
| before四生产/测试文件的实际diff/SHA审计 | TEMP/backend-audit.py、backend-diff.patch、backend-hashes.json；chunk9602b5及完整patch已读 | backend impl | exit0，lib+22/-5、测试207、Cargo各+1/-1 | 不称差量可追溯 |

cargo纯编译完整输出为：

```text
   Compiling qingjian v0.5.4 (E:\project-funny\biji\src-tauri)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 31.77s
```

`--tests`只检查编译，没有打开临时数据库、执行迁移或跑测试；这一点必须保留。已通知root释放构建资源，front可继续重build。

## coordinator_handoff_verifications

| 验证 | 移交原因/建议承接方式 | evidence_expected | owner | conclusion_if_missing |
| --- | --- | --- | --- | --- |
| Rust九项实际测试与临时SQLite7/8/10列迁移/rollback/关闭重开 | 数据库执行不属于本impl的授权边界；root串行执行同生产helper测试及额外临时文件演练 | cargo test locked/jobs1完整输出/exit、实际>0用例、TEMP/root-verification.md | root | 迁移/回滚/往返未验证 |
| 原真实SQLite8列/原3notes0transactions保持及新增列正确 | 真实库验收与新EXE启动是root所有；已有backup/只读before，禁止本impl执行 | 启动前后schema、新列另检、旧列全部字段/行逐项保持，不拿旧SELECT*hash否定合法ADD | root | 用户旧库保持未验证，不发布 |
| Web排序/置顶/备份/取消与卡片实际UI | front+真实平台输入，属于root承接 | 合法drop、隐藏/Trash、刷新、pin/编辑/恢复/图及真实备份证据 | root | 产品端到端与手感未验证 |
| Windows0.5.4正式构建/版本/hash/新进程烟测 | 完整跨层制品/用户数据环境由root串行执行 | build exit0、EXE/NSIS/MSI自身0.5.4、SHA、新自有Hidden进程10秒，再旧库字段对比 | root | 新EXE/真实迁移未验证 |
| fresh Review(Impl) | 本impl不能自审自己 | reviewer读实际before差量、两impl报告、root证据；root完整复核 | fresh reviewer + root | 不称本轮最终完成 |

原生完整UI、安装卸载、输入法/触屏/读屏/GPU/长期稳定性仍由root报告能力边界与后续现场责任，不能借Rust编译代替。

## contract_drift_reports与观察失败

- 本backend生产接口与最终LW无新增drift/stale/mirror mismatch；已读最终SHA同root授权。只在四个所有文件写代码/版本，报告落本feature新文件，不覆盖旧报告。
- 预读时rg双引号转义写法引发`regex parse error: unclosed group`，改用`-F`分别定位锁文件实际qingjian/rusqlite/serde。保留错误，不把最后命令exit0当首rg成功。Rust依赖仍原锁版本。
- 前期调研的合并截断/误猜graph文件已在research-code末节保留；本轮实施没有构建/编译失败，纯编译只有上面两行输出，不据此擦掉历史E0460/内存/包体/平台未测。
- 没有执行cargo test、SQLite演练、真实DB、浏览器、服务、安装、Git；不能把编译测试代码称9项测试通过。

## 未完成与审查重点

- 数据库运行结果待root；检查旧schema双列默认和位置NULL、完整数组含Trash、混合位置/NULL fallback、两种约束失败全表回滚。
- 新EXE仍未由本impl生成/验收；新库若已加列，不要用旧版EXE写回，因为其全DELETE/旧INSERT会丢pin/position。该风险已在计划锁定，未设计降级兼容。
- App旧双save effect与空库行为、JSON数组级校验没有顺带修改；不为假设异常增加无关防御抽象。

## rollback_info

真实库迁移后：**需人工介入**，先停启动/写入并保留库与备份，禁止自动DROP列/恢复用户库或用旧EXE写回。仅代码差量尚可依据本轮before/S0/最终patch撤本次hunks，保留未知混合工作；不得git restore/reset整个文件。本impl未接触库，无实际库回滚操作。

最终SHA256：

- lib.rs：`42FECE3E6F3EB501C0DEB48B649CABFE55C122BEF33ECA449FD7BA7D98DCE54E`
- database_tests.rs：`B55BD639BAB7072F2E76B776B53C30BEB8008E81136B88B0ABC1A4C6606DC3C8`
- Cargo.toml：`A38847493E6C534B5F4A541660FDE3D61D2B25B53EF4B4CF54C5609A9FB0636E`
- Cargo.lock：`62FD0041AE919D8D4BD48B61EBF1D5207E9B72AA3BB93DA3279DE70ED3AF0973`

建议英文提交信息：`feat(notes): persist manual order and pinned metadata`。本轮不执行混合提交或推送。

无新增跨功能事实候选。
