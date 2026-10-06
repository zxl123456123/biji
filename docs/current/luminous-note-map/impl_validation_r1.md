# Impl r1 完整验证输出

## npm test

Exit code: 0

```text

> luma-notes@0.5.0 test
> node --test tests/*.test.mjs

TAP version 13
# Subtest: canvas-local subject and drag use a single origin independent of DPR and page offset
ok 1 - canvas-local subject and drag use a single origin independent of DPR and page offset
  ---
  duration_ms: 1.934
  type: 'test'
  ...
# Subtest: simulation copies frozen models and link tag arrays; static seeds do not collapse
ok 2 - simulation copies frozen models and link tag arrays; static seeds do not collapse
  ---
  duration_ms: 0.7185
  type: 'test'
  ...
# Subtest: owned mid-drag cancellation removes move/up then restores native selection only
ok 3 - owned mid-drag cancellation removes move/up then restores native selection only
  ---
  duration_ms: 1.2647
  type: 'test'
  ...
# Subtest: absent, normally released, or replaced gesture never clears another owner
ok 4 - absent, normally released, or replaced gesture never clears another owner
  ---
  duration_ms: 0.514
  type: 'test'
  ...
# Subtest: one in flight and one replaceable latest pending; stale response never accepted
ok 5 - one in flight and one replaceable latest pending; stale response never accepted
  ---
  duration_ms: 1.7804
  type: 'test'
  ...
# Subtest: timeout clears relations and reaches visible error; retry is bounded
ok 6 - timeout clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.464
  type: 'test'
  ...
# Subtest: error clears relations and reaches visible error; retry is bounded
ok 7 - error clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.2177
  type: 'test'
  ...
# Subtest: messageerror clears relations and reaches visible error; retry is bounded
ok 8 - messageerror clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.3502
  type: 'test'
  ...
# Subtest: reply-error clears relations and reaches visible error; retry is bounded
ok 9 - reply-error clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.1935
  type: 'test'
  ...
# Subtest: create clears relations and reaches visible error; retry is bounded
ok 10 - create clears relations and reaches visible error; retry is bounded
  ---
  duration_ms: 0.1618
  type: 'test'
  ...
# Subtest: cancel blocks captured late callbacks and clears timer; a new session can submit
ok 11 - cancel blocks captured late callbacks and clears timer; a new session can submit
  ---
  duration_ms: 0.2841
  type: 'test'
  ...
# Subtest: large content threshold uses Worker; tiny snapshot runs same pure model
ok 12 - large content threshold uses Worker; tiny snapshot runs same pure model
  ---
  duration_ms: 5.9234
  type: 'test'
  ...
# Subtest: display text shares inline and block rules, preserving unknown HTML and code
ok 13 - display text shares inline and block rules, preserving unknown HTML and code
  ---
  duration_ms: 3.7198
  type: 'test'
  ...
# Subtest: NFKC and Unicode codepoints preserve emoji and matching mixed-language bodies
ok 14 - NFKC and Unicode codepoints preserve emoji and matching mixed-language bodies
  ---
  duration_ms: 4.3687
  type: 'test'
  ...
# Subtest: empty and distinct single-character notes remain isolated
ok 15 - empty and distinct single-character notes remain isolated
  ---
  duration_ms: 1.1178
  type: 'test'
  ...
# Subtest: identical nonempty single-character bodies receive duplicate edges
ok 16 - identical nonempty single-character bodies receive duplicate edges
  ---
  duration_ms: 0.2616
  type: 'test'
  ...
# Subtest: label only channel reports real shared labels and record-level DF
ok 17 - label only channel reports real shared labels and record-level DF
  ---
  duration_ms: 2.0503
  type: 'test'
  ...
# Subtest: rare primary tags win without moving groups when filtered
ok 18 - rare primary tags win without moving groups when filtered
  ---
  duration_ms: 0.6239
  type: 'test'
  ...
# Subtest: large common tag and duplicate body use sparse edges and retain every frozen node
ok 19 - large common tag and duplicate body use sparse edges and retain every frozen node
  ---
  duration_ms: 70.1244
  type: 'test'
  ...
# Subtest: mutual strong untagged choices form deterministic text groups, tags stay separate
ok 20 - mutual strong untagged choices form deterministic text groups, tags stay separate
  ---
  duration_ms: 0.4479
  type: 'test'
  ...
# Subtest: current IDs win while pending or projected, including isolated and new IDs
ok 21 - current IDs win while pending or projected, including isolated and new IDs
  ---
  duration_ms: 0.9282
  type: 'test'
  ...
# Subtest: semantic key excludes deleted records and ignores done, dates, source order
ok 22 - semantic key excludes deleted records and ignores done, dates, source order
  ---
  duration_ms: 0.9981
  type: 'test'
  ...
# Subtest: full search precedes card batching, date mode sorts before global allowance
ok 23 - full search precedes card batching, date mode sorts before global allowance
  ---
  duration_ms: 19.25
  type: 'test'
  ...
# Subtest: exact tag excludes similar tags and plain mentions
ok 24 - exact tag excludes similar tags and plain mentions
  ---
  duration_ms: 6.1594
  type: 'test'
  ...
# Subtest: tag names remain case sensitive
ok 25 - tag names remain case sensitive
  ---
  duration_ms: 0.4016
  type: 'test'
  ...
# Subtest: lowercase tag is a different tag
ok 26 - lowercase tag is a different tag
  ---
  duration_ms: 0.2419
  type: 'test'
  ...
# Subtest: query is trimmed and case insensitive
ok 27 - query is trimmed and case insensitive
  ---
  duration_ms: 0.2022
  type: 'test'
  ...
# Subtest: query, tag and unfinished compose with AND
ok 28 - query, tag and unfinished compose with AND
  ---
  duration_ms: 0.3871
  type: 'test'
  ...
# Subtest: trash does not leak active records
ok 29 - trash does not leak active records
  ---
  duration_ms: 0.2999
  type: 'test'
  ...
# Subtest: clearing all filters restores source order
ok 30 - clearing all filters restores source order
  ---
  duration_ms: 0.1957
  type: 'test'
  ...
# Subtest: missing result returns an empty array
ok 31 - missing result returns an empty array
  ---
  duration_ms: 0.1859
  type: 'test'
  ...
# Subtest: selectors preserve records and do not mutate the source
ok 32 - selectors preserve records and do not mutate the source
  ---
  duration_ms: 0.9707
  type: 'test'
  ...
# Subtest: month selection respects local midnight and cross-year boundaries
ok 33 - month selection respects local midnight and cross-year boundaries
  ---
  duration_ms: 1.1277
  type: 'test'
  ...
# Subtest: previous year and following month remain separately selectable
ok 34 - previous year and following month remain separately selectable
  ---
  duration_ms: 0.4829
  type: 'test'
  ...
# Subtest: empty month has zero totals and invalid dates are excluded
ok 35 - empty month has zero totals and invalid dates are excluded
  ---
  duration_ms: 0.2321
  type: 'test'
  ...
1..35
# tests 35
# suites 0
# pass 35
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 331.5729
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
dist/index.html                                    0.51 kB │ gzip:  0.34 kB
dist/assets/noteGraph.worker-BwoO1VFz.js           3.57 kB
dist/assets/index-CYaKeqFO.css                    33.59 kB │ gzip:  7.68 kB
dist/assets/workbox-window.prod.es5-Bd17z0YL.js    5.65 kB │ gzip:  2.20 kB
dist/assets/NoteGraph-Cm5Npk2P.js                 73.59 kB │ gzip: 25.56 kB
dist/assets/index-NaKKEpYj.js                    275.57 kB │ gzip: 87.53 kB

✓ built in 234ms

PWA v1.3.0
mode      generateSW
precache  7 entries (383.30 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js
```

## git diff --check

Exit code: 0

```text
warning: in the working copy of 'AGENTS.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'docs/Product.Direction.md', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/App.tsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/store.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/styles.css', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'tsconfig.json', LF will be replaced by CRLF the next time Git touches it
```

