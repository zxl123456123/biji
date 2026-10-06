# S4工作区验收输入快照 r1

2026-10-05，由wardrobe_industry仅复制TEMP源/记录身份；未改产品、未构建、未运行UI/native/DB/Git。此快照含当前月历及第三窗口探索，仅供root独立工作区验收，不把它们计为S4成果或最终EXE范围。

快照：`C:/Users/ZXL/AppData/Local/Temp/qingjian-customization-20261004/workspace-validation-r1`；manifest：同级`workspace-validation-r1-manifest.json`，SHA256 `89A541FCA358ADBEF0951224B887D7245CE369469E3CF8C8583E90459AC2E7E3`。164项输入/164项复制；sourceSet SHA `7DA8FAA1B6957D0C7DCC661196D4AF2AECCDF2106B7AC287F9E5E1C21BE22DAC`。

输入枚举src/public/tests/src-tauri及index.html、package.json、package-lock.json、vite.config.ts、tsconfig.json、tsconfig.node.json；排除dist/target/node_modules及所有tsbuildinfo。每项manifest列源SHA、副本SHA和bytes。五项S4与`s4-source-r1.json`完全匹配。

helper：TEMP同级`prepare-workspace-validation-r1.py`，SHA `D06A7A71FD5C64C9FD65A7BD48CED6D7067043F3A6CECB37893C557534CC40F6`。4250f0→e104f1 exit0，完整准备日志/退出码为`workspace-validation-r1-prepare.log/.exit`：两遍文件集及全部源/副本字节闭合。94c889 exit0逐项复核164副本SHA/bytes、唯一文件集、排除项与S4身份，无缺项；`workspace-validation-r1-verify.log/.exit`保留完整输出。本次没有拒绝候选；helper遇变化会保留partial并记录REJECTED_PARTIAL_SNAPSHOT，旧目录/manifest存在即拒绝覆盖，需要新轮次名称。

实际捕获4项src-tauri/gen/schemas：acl-manifests.json、capabilities.json、desktop-schema.json、windows-schema.json。它们按源输入记录，后续构建可能自动改写，root使用构建证据前须重核源身份。root负责node_modules junction、独立test/build/UI及现场证据；本快照检查不证明功能、构建或制品通过。S4此前工作区build退出1及外部并发差量继续保留在impl_report_r1.md，本说明不覆盖旧报告。Q1最终发布仍排除月历与第三窗口探索。
