# Impl r2 完整验证输出

执行均串行，未运行压力、GUI、服务、Rust或EXE。

## node --test --test-concurrency=1 tests/*.test.mjs

Exit code: 0

```text
TAP version 13
# Subtest: canvas-local subject and drag use a single origin independent of DPR and page offset
ok 1 - canvas-local subject and drag use a single origin independent of DPR and page offset
  ---
  duration_ms: 1.3444
  type: 'test'
  ...
# Subtest: simulation copies frozen models and link tag arrays; static seeds do not collapse
ok 2 - simulation copies frozen models and link tag arrays; static seeds do not collapse
  ---
  duration_ms: 0.5422
  type: 'test'
  ...
# Subtest: owned mid-drag cancellation removes move/up then restores native selection only
ok 3 - owned mid-drag cancellation removes move/up then restores native selection only
  ---
  duration_ms: 0.9075
  type: 'test'
  ...
# Subtest: absent, normally released, or replaced gesture never clears another owner
ok 4 - absent, normally released, or replaced gesture never clears another owner
  ---
  duration_ms: 0.3441
  type: 'test'
  ...
# Subtest: actual D3 mouse pan cancellation restores native selection and rejects late mousemove
ok 5 - actual D3 mouse pan cancellation restores native selection and rejects late mousemove
  ---
  duration_ms: 1.4089
  type: 'test'
  ...
# Subtest: actual D3 normal pan end clears ownership and cancellation does not restore twice
ok 6 - actual D3 normal pan end clears ownership and cancellation does not restore twice
  ---
  duration_ms: 0.4792
  type: 'test'
  ...
# Subtest: pan cancellation does not sweep a replaced owner or nonmouse transform
ok 7 - pan cancellation does not sweep a replaced owner or nonmouse transform
  ---
  duration_ms: 0.7089
  type: 'test'
  ...
# Subtest: one in flight and one replaceable latest pending; stale response never accepted
ok 8 - one in flight and one replaceable latest pending; stale response never accepted
  ---
  duration_ms: 1.2677
  type: 'test'
  ...
# Subtest: timeout clears relations and reaches visible error; retry is bounded
ok 9 - timeout clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.2605
  type: 'test'
  ...
# Subtest: error clears relations and reaches visible error; retry is bounded
ok 10 - error clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.1936
  type: 'test'
  ...
# Subtest: messageerror clears relations and reaches visible error; retry is bounded
ok 11 - messageerror clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.1882
  type: 'test'
  ...
# Subtest: reply-error clears relations and reaches visible error; retry is bounded
ok 12 - reply-error clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.1322
  type: 'test'
  ...
# Subtest: create clears relations and reaches visible error; retry is bounded
ok 13 - create clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.1083
  type: 'test'
  ...
# Subtest: cancel blocks captured late callbacks and clears timer; a new session can submit
ok 14 - cancel blocks captured late callbacks and clears timer; a new session can submit
  ---
  duration_ms: 0.266
  type: 'test'
  ...
# Subtest: large content threshold uses Worker; tiny snapshot runs same pure model
ok 15 - large content threshold uses Worker; tiny snapshot runs same pure model
  ---
  duration_ms: 4.2081
  type: 'test'
  ...
# Subtest: revised OR boundary keeps 23 notes / 7999 UTF16 synchronous and equal boundaries asynchronous
ok 16 - revised OR boundary keeps 23 notes / 7999 UTF16 synchronous and equal boundaries asynchronous
  ---
  duration_ms: 4.2398
  type: 'test'
  ...
# {"phase":"actual scoring loop","nodes":100,"gramCount":5,"candidates":2,"visits":1000}
# {"phase":"actual scoring loop","nodes":200,"gramCount":5,"candidates":2,"visits":2000}
# (node:37356) ExperimentalWarning: stripTypeScriptTypes is an experimental feature and might change at any time
# (Use `node --trace-warnings ...` to show where the warning was created)
# Subtest: scoring patch preserves full frozen r1 models and input-order determinism
ok 17 - scoring patch preserves full frozen r1 models and input-order determinism
  ---
  duration_ms: 8.7344
  type: 'test'
  ...
# Subtest: actual scoring loop visits only the shorter set for 100/200 identical four-character bodies
ok 18 - actual scoring loop visits only the shorter set for 100/200 identical four-character bodies
  ---
  duration_ms: 17.2153
  type: 'test'
  ...
# Subtest: display text shares inline and block rules, preserving unknown HTML and code
ok 19 - display text shares inline and block rules, preserving unknown HTML and code
  ---
  duration_ms: 3.288
  type: 'test'
  ...
# Subtest: NFKC and Unicode codepoints preserve emoji and matching mixed-language bodies
ok 20 - NFKC and Unicode codepoints preserve emoji and matching mixed-language bodies
  ---
  duration_ms: 4.2564
  type: 'test'
  ...
# Subtest: empty and distinct single-character notes remain isolated
ok 21 - empty and distinct single-character notes remain isolated
  ---
  duration_ms: 1.2765
  type: 'test'
  ...
# Subtest: identical nonempty single-character bodies receive duplicate edges
ok 22 - identical nonempty single-character bodies receive duplicate edges
  ---
  duration_ms: 0.3608
  type: 'test'
  ...
# Subtest: label only channel reports real shared labels and record-level DF
ok 23 - label only channel reports real shared labels and record-level DF
  ---
  duration_ms: 1.0112
  type: 'test'
  ...
# Subtest: rare primary tags win without moving groups when filtered
ok 24 - rare primary tags win without moving groups when filtered
  ---
  duration_ms: 0.5349
  type: 'test'
  ...
# Subtest: large common tag and duplicate body use sparse edges and retain every frozen node
ok 25 - large common tag and duplicate body use sparse edges and retain every frozen node
  ---
  duration_ms: 21.2105
  type: 'test'
  ...
# Subtest: mutual strong untagged choices form deterministic text groups, tags stay separate
ok 26 - mutual strong untagged choices form deterministic text groups, tags stay separate
  ---
  duration_ms: 0.4591
  type: 'test'
  ...
# Subtest: current IDs win while pending or projected, including isolated and new IDs
ok 27 - current IDs win while pending or projected, including isolated and new IDs
  ---
  duration_ms: 0.5107
  type: 'test'
  ...
# Subtest: semantic key excludes deleted records and ignores done, dates, source order
ok 28 - semantic key excludes deleted records and ignores done, dates, source order
  ---
  duration_ms: 0.5735
  type: 'test'
  ...
# Subtest: full search precedes card batching, date mode sorts before global allowance
ok 29 - full search precedes card batching, date mode sorts before global allowance
  ---
  duration_ms: 15.3168
  type: 'test'
  ...
# Subtest: exact tag excludes similar tags and plain mentions
ok 30 - exact tag excludes similar tags and plain mentions
  ---
  duration_ms: 4.2519
  type: 'test'
  ...
# Subtest: tag names remain case sensitive
ok 31 - tag names remain case sensitive
  ---
  duration_ms: 0.2694
  type: 'test'
  ...
# Subtest: lowercase tag is a different tag
ok 32 - lowercase tag is a different tag
  ---
  duration_ms: 0.1232
  type: 'test'
  ...
# Subtest: query is trimmed and case insensitive
ok 33 - query is trimmed and case insensitive
  ---
  duration_ms: 0.1549
  type: 'test'
  ...
# Subtest: query, tag and unfinished compose with AND
ok 34 - query, tag and unfinished compose with AND
  ---
  duration_ms: 0.4214
  type: 'test'
  ...
# Subtest: trash does not leak active records
ok 35 - trash does not leak active records
  ---
  duration_ms: 0.2101
  type: 'test'
  ...
# Subtest: clearing all filters restores source order
ok 36 - clearing all filters restores source order
  ---
  duration_ms: 0.111
  type: 'test'
  ...
# Subtest: missing result returns an empty array
ok 37 - missing result returns an empty array
  ---
  duration_ms: 0.103
  type: 'test'
  ...
# Subtest: selectors preserve records and do not mutate the source
ok 38 - selectors preserve records and do not mutate the source
  ---
  duration_ms: 0.5654
  type: 'test'
  ...
# Subtest: month selection respects local midnight and cross-year boundaries
ok 39 - month selection respects local midnight and cross-year boundaries
  ---
  duration_ms: 0.6244
  type: 'test'
  ...
# Subtest: previous year and following month remain separately selectable
ok 40 - previous year and following month remain separately selectable
  ---
  duration_ms: 0.2745
  type: 'test'
  ...
# Subtest: empty month has zero totals and invalid dates are excluded
ok 41 - empty month has zero totals and invalid dates are excluded
  ---
  duration_ms: 0.1193
  type: 'test'
  ...
1..41
# tests 41
# suites 0
# pass 41
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 796.4676
```

## npm run build

Exit code: 0

```text

> luma-notes@0.5.0 build
> tsc -b && vite build

vite v8.3.0 building client environment for production...
transforming...
✓ 2054 modules transformed.
rendering chunks...
computing gzip size...
dist/manifest.webmanifest                          0.24 kB
dist/index.html                                    0.51 kB │ gzip:  0.35 kB
dist/assets/noteGraph.worker-BzYa97ya.js           3.67 kB
dist/assets/index-CYaKeqFO.css                    33.59 kB │ gzip:  7.68 kB
dist/assets/workbox-window.prod.es5-Bd17z0YL.js    5.65 kB │ gzip:  2.20 kB
dist/assets/NoteGraph-DYJlklN2.js                 74.09 kB │ gzip: 25.65 kB
dist/assets/index-C6E_26qu.js                    275.68 kB │ gzip: 87.56 kB

✓ built in 234ms

PWA v1.3.0
mode      generateSW
precache  7 entries (384.00 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js
```

## git diff --check

Exit code: 0

```text
warning: in the working copy of 'AGENTS.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'CHANGELOG.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'README.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/Product.Direction.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/Project.Progress.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/Release.Testing.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/App.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/store.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/styles.css', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tsconfig.json', LF will be replaced by CRLF the next time Git touches it
```

## 首次串行全量失败（保留）

命令同上串行41项，exit=1，40 pass / 1 fail；首次完整TAP在会话工具chunk8f25c6，以下完整失败条目及汇总保留。后来修正Node EventTarget的capture移除参数，不改生产取消代码。

```text
# Subtest: actual D3 mouse pan cancellation restores native selection and rejects late mousemove
not ok 5 - actual D3 mouse pan cancellation restores native selection and rejects late mousemove
  ---
  duration_ms: 2.3846
  type: 'test'
  location: 'E:\\project-funny\\biji\\tests\\graphGeometry.test.mjs:106:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    
    true !== false
    
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: false
  actual: true
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (file:///E:/project-funny/biji/tests/graphGeometry.test.mjs:122:10)
    Test.runInAsyncScope (node:async_hooks:214:14)
    Test.run (node:internal/test_runner/test:1047:25)
    Test.processPendingSubtests (node:internal/test_runner/test:744:18)
    Test.postRun (node:internal/test_runner/test:1173:19)
    Test.run (node:internal/test_runner/test:1101:12)
    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
  ...
1..41
# tests 41
# suites 0
# pass 40
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 744.1207
```

## 独立Node capture差异诊断

命令 `node %TEMP%/qingjian-eventtarget-capture-r2.mjs`，exit=0，完整输出：

```text
{"removeOption":true,"writes":1,"prevented":true}
{"removeOption":{"capture":true},"writes":0,"prevented":false}
```

测试适配把boolean capture转显式字典再移除；原生浏览器D3代码不变。`stripTypeScriptTypes` ExperimentalWarning保留在全量输出，是测试内存插桩使用Node现成API所致，不是测试失败。
