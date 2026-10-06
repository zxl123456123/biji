import test from 'node:test'
import assert from 'node:assert/strict'
import { escapeLiteral, headingLiteral, inlineHtml, inlineLiteral, inlinePlain, noteHtml, notePlain, parseInline, parseNote, splitProtectedCode, fenceLiteral, quoteLiteral, PET_DIRECTIVE } from '../src/noteCodec.ts'
import { contentWithTags, tagsFor, withoutTags } from '../src/recordTools.ts'
import { plainNoteText } from '../src/noteText.ts'

test('nested bold and italic have the same visible words in both orders', () => {
  assert.equal(inlineHtml(parseInline('**_中文 English_**')), '<strong><em>中文 English</em></strong>')
  assert.equal(inlineHtml(parseInline('_**中文 English**_')), '<em><strong>中文 English</strong></em>')
  assert.equal(inlinePlain(parseInline('[[color:blue|**_旧颜色_**]] [[size:lg|_旧字号_]]')), '旧颜色 旧字号')
  assert.equal(inlineHtml(parseInline('[[color:blue|[[size:lg|**嵌套**]]]]')), '<span data-color="blue" class="text-color blue"><span data-size="lg" class="text-size lg"><strong>嵌套</strong></span></span>')
  assert.equal(inlineHtml(parseInline('[[color:unknown|**keep**]]')), '[[color:unknown|**keep**]]')
})
test('code literals preserve edge ticks, spaces, hashtags and HTML through actual storage helpers', () => {
  for (const value of ['**粗** _斜_ <script>', '`', '`edge', 'edge`', 'a``b', ' a ', ' a', 'a ', '   ', '#中文 #travel_2', '` #中文 `', '<kbd>literal</kbd>', 'path\\', '#中文 path\\', 'path\\ #中文\\']) {
    const encoded = inlineLiteral(value)
    const saved = contentWithTags(encoded, ['外部'])
    assert.deepEqual(tagsFor(saved), ['外部'], value)
    assert.equal(inlinePlain(parseInline(withoutTags(saved))), value, value)
    assert.equal(splitProtectedCode(encoded).map(part => part.text).join(''), encoded)
  }
  assert.equal(inlinePlain(parseInline('` a `')), ' a ')
  assert.equal(inlinePlain(parseInline('`` a ``')), 'a')
})
test('maximal tick runs are not matched inside a longer closing run', () => {
  assert.equal(inlinePlain(parseInline('``a```b``')), 'a```b')
  assert.equal(inlinePlain(parseInline('`unclosed')), '`unclosed')
  assert.equal(inlinePlain(parseInline('\\`literal #标签')), '`literal #标签')
})
test('fences and inline spans use the same protection, including long delimiters at block start', () => {
  const code = '`edge`` #保留'
  const inline = inlineLiteral(code)
  assert.equal(parseNote(inline)[0].kind, 'paragraph')
  const fenced = fenceLiteral('**literal**\n``` #保留\n<kbd>literal</kbd>', 'ts')
  const content = `${inline}\n${fenced}\n#旅行 #旅行 #Travel`
  assert.deepEqual(tagsFor(content), ['旅行', '旅行', 'Travel'])
  assert.equal(splitProtectedCode(content).map(part => part.text).join(''), content)
  const blocks = parseNote(withoutTags(content))
  assert.equal(blocks[1].kind, 'code')
  assert.equal(blocks[1].value, '**literal**\n``` #保留\n<kbd>literal</kbd>')
  assert.equal(tagsFor('```ts\n#inside\n``\n#also-inside').length, 0)
  assert.deepEqual(tagsFor('`unclosed #outside'), ['outside'])
  assert.equal(plainNoteText(contentWithTags('```\n#保留\n```', ['外部'])), '\n#保留\n')
})
test('ordered starts, quotes and adjacent list kinds produce real blocks and plain words', () => {
  const blocks = parseNote('3. 三\n9. 四\n- 五\n> 引用\n> \n> 下一段')
  assert.equal(noteHtml(blocks), '<ol start="3"><li>三</li><li>四</li></ol><ul><li>五</li></ul><blockquote><div>引用</div><div><br></div><div>下一段</div></blockquote>')
  assert.equal(notePlain(blocks), '三\n四\n五\n引用\n\n下一段')
})
test('empty parsed list items are omitted while trimmed raw markers remain literal', () => {
  const saved = contentWithTags('- \n- 有字\n2. \n3. 子项\n-\n2.', ['标签'])
  const blocks = parseNote(withoutTags(saved))
  // Legacy whitespace trimming turns raw empty storage markers into literal text.
  // DOM serialization omits empty li before these helpers; root verifies that direction.
  assert.equal(notePlain(blocks), '-\n有字\n2.\n子项\n-\n2.')
  assert.equal(noteHtml(parseNote('- \n2. ')), '')
  assert.equal(notePlain(parseNote(withoutTags(contentWithTags('- ', [])))), '-')
})
test('ordinary input is escaped, unknown HTML remains literal and old kbd wrappers are removed', () => {
  const literal = '**普通** _文字_ `code` [[color:blue|普通]] <script>alert(1)</script>'
  assert.equal(inlinePlain(parseInline(escapeLiteral(literal))), literal)
  assert.ok(inlineHtml(parseInline(escapeLiteral(literal))).includes('&lt;script&gt;'))
  assert.equal(inlinePlain(parseInline('\\q [[unknown|keep]] <kbd>快捷</kbd>')), '\\q [[unknown|keep]] 快捷')
})
test('the graph legacy plain-text golden result remains unchanged', () => {
  const body = '# 标题\n## 小题\n- **正文** _斜体_ `内联` [[color:blue|颜色]] [[size:lg|大字]]\n```\n**literal** <script>\n```\n<kbd>快捷</kbd> [[unknown|keep]] #标签'
  assert.equal(plainNoteText(body), '标题\n小题\n正文 斜体 内联 颜色 大字\n\n**literal** <script>\n\n快捷 [[unknown|keep]]')
})

test('one exact standalone original pet is a safe block with visible search words', () => {
  const content = contentWithTags(`开头\n${PET_DIRECTIVE}\n结尾`, ['旅行'])
  const blocks = parseNote(withoutTags(content))
  assert.deepEqual(blocks.map(block => block.kind), ['paragraph', 'pet', 'paragraph'])
  assert.equal(notePlain(blocks), '开头\n晴小团\n结尾')
  assert.match(noteHtml(blocks), /data-note-pet="xiaotuan" contenteditable="false"/)
  assert.deepEqual(tagsFor(content), ['旅行'])
})

test('pet syntax stays literal in code, inline, escaped, unknown and duplicate lines', () => {
  for (const source of [`前 ${PET_DIRECTIVE} 后`, `\\${PET_DIRECTIVE}`, '`' + PET_DIRECTIVE + '`', '[[pet:nailong]]']) {
    assert.equal(parseNote(source).some(block => block.kind === 'pet'), false)
  }
  const fenced = parseNote('```\n' + PET_DIRECTIVE + '\n```')
  assert.equal(fenced.some(block => block.kind === 'pet'), false)
  const duplicate = parseNote(`${PET_DIRECTIVE}\n${PET_DIRECTIVE}`)
  assert.deepEqual(duplicate.map(block => block.kind), ['pet', 'paragraph'])
  assert.equal(notePlain(duplicate), `晴小团\n${PET_DIRECTIVE}`)
})

test('quote serialization omits empty markers through actual trimming, keeping internal blank lines', () => {
  for (const tags of [[], ['外部']]) {
    for (const [body, visible, expected] of [
      ['', '', ''], ['\n\n', '', ''], ['\n**首段**', '首段', '首段'],
      ['**首段**\n\n_尾段_', '首段尾段', '首段\n\n尾段'], ['首段\n\n', '首段', '首段'],
    ]) {
      const saved = contentWithTags(quoteLiteral(body, visible, withoutTags, tagsFor), tags)
      const restored = withoutTags(saved)
      assert.equal(notePlain(parseNote(restored)), expected)
      assert.equal(noteHtml(parseNote(restored)).includes('&gt;'), false)
    }
  }
  assert.equal(noteHtml(parseNote('>')), '<div>&gt;</div>')
  assert.equal(notePlain(parseNote(withoutTags(contentWithTags('>', [])))), '>')
})
test('nonempty quotes preserve inline and fenced code literals, styles and external tags', () => {
  const inline = inlineLiteral('#代码 **literal** <script> path\\')
  const fence = fenceLiteral('#围栏\n\n**literal**', 'ts')
  const body = `**引用正文**\n${inline}\n\n${fence}\n_结尾_`
  const saved = contentWithTags(quoteLiteral(body, '引用正文 code 结尾', withoutTags, tagsFor), ['外部'])
  assert.deepEqual(tagsFor(saved), ['外部'])
  const blocks = parseNote(withoutTags(saved))
  assert.equal(notePlain(blocks), '引用正文\n#代码 **literal** <script> path\\\n\n\n#围栏\n\n**literal**\n\n结尾')
  const html = noteHtml(blocks)
  assert.ok(html.includes('<strong>引用正文</strong>'))
  assert.ok(html.includes('<em>结尾</em>'))
  assert.ok(html.includes('<code>#代码 **literal** &lt;script&gt; path\\</code>'))
  assert.ok(html.includes('<pre><code data-language="ts">#围栏\n\n**literal**</code></pre>'))
})

test('quotes emptied by ordinary tags keep exact metadata without visible prefixes or empty styles', () => {
  for (const [body, expectedTags] of [
    ['#旅行', ['旅行']], ['#旅行 #旅行 #Travel #travel', ['旅行', '旅行', 'Travel', 'travel']],
    ['**#旅行**', ['旅行']], ['_#旅行_', ['旅行_']],
    ['[[color:blue|**#旅行**]]', ['旅行']], ['[[size:lg|_#Travel_]]', ['Travel_']],
    ['**_#tag_one_**', ['tag_one_']],
  ]) {
    for (const external of [[], ['旅行'], ['外部']]) {
      const saved = contentWithTags(quoteLiteral(body, body, withoutTags, tagsFor), external)
      assert.deepEqual(tagsFor(saved), [...expectedTags, ...external], body)
      const blocks = parseNote(withoutTags(saved))
      assert.equal(notePlain(blocks), '', body)
      assert.equal(noteHtml(blocks), '', body)
    }
  }
})

test('ordinary tags on first middle and last quote lines preserve text order and blank lines', () => {
  for (const [body, expected, expectedTags] of [
    ['#旅行\n正文', '正文', ['旅行']],
    ['正文\n#旅行\n结尾', '正文\n\n结尾', ['旅行']],
    ['正文\n#旅行', '正文', ['旅行']],
    ['#首\n**首段**\n#中 #重复 #重复\n\n_尾段_\n#尾', '首段\n\n\n尾段', ['首', '中', '重复', '重复', '尾']],
  ]) {
    const saved = contentWithTags(quoteLiteral(body, body, withoutTags, tagsFor), ['外部'])
    assert.deepEqual(tagsFor(saved), [...expectedTags, '外部'])
    const blocks = parseNote(withoutTags(saved))
    assert.equal(notePlain(blocks), expected, body)
    assert.equal(noteHtml(blocks).includes('<div>&gt;</div>'), false, body)
  }
})

test('quote tag normalization preserves supported styles code and authored literal symbols', () => {
  const body = `#首\n**_正文_** #行标签\n${inlineLiteral('#旅行 **literal** _ <script> path\\')}\n#中\n${fenceLiteral('#围栏\n\n**literal**', 'ts')}\n#尾`
  const saved = contentWithTags(quoteLiteral(body, '正文 code', withoutTags, tagsFor), ['旅行', '外部'])
  assert.deepEqual(tagsFor(saved), ['首', '行标签', '中', '尾', '旅行', '外部'])
  const blocks = parseNote(withoutTags(saved))
  assert.equal(notePlain(blocks), '正文\n#旅行 **literal** _ <script> path\\\n\n\n#围栏\n\n**literal**\n')
  const html = noteHtml(blocks)
  assert.ok(html.includes('<strong><em>正文</em></strong>'))
  assert.ok(html.includes('<code>#旅行 **literal** _ &lt;script&gt; path\\</code>'))
  assert.ok(html.includes('<pre><code data-language="ts">#围栏\n\n**literal**</code></pre>'))
  for (const literal of ['>', '**', '_', '[[color:blue|literal]]']) {
    const restored = withoutTags(contentWithTags(quoteLiteral(escapeLiteral(literal), literal, withoutTags, tagsFor), []))
    assert.equal(notePlain(parseNote(restored)), literal)
  }
  assert.equal(noteHtml(parseNote(withoutTags(contentWithTags('>', [])))), '<div>&gt;</div>')
  const codeOnly = quoteLiteral(inlineLiteral('_'), '_', withoutTags, tagsFor)
  assert.equal(noteHtml(parseNote(withoutTags(contentWithTags(codeOnly, [])))), '<blockquote><div><code>_</code></div></blockquote>')
  const splitTag = contentWithTags(quoteLiteral('#**文字**', '#文字', withoutTags, tagsFor), [])
  assert.deepEqual(tagsFor(splitTag), [])
  assert.equal(noteHtml(parseNote(withoutTags(splitTag))), '<blockquote><div>#<strong>文字</strong></div></blockquote>')
})

test('empty heading bodies omit prefixes through actual storage normalization', () => {
  // These are serialized inline bodies, including br newlines; actual DOM remains root-owned.
  for (const level of [2, 3]) {
    for (const body of ['', '\n', '\n\n', ' \t\n', '**\n**', '_\n_', '[[color:blue|\n]]', '[[size:lg|**_\n_**]]']) {
      for (const external of [[], ['外部']]) {
        const source = headingLiteral(body, level, withoutTags, tagsFor)
        const saved = contentWithTags(source, external)
        const blocks = parseNote(withoutTags(saved))
        assert.equal(source, '', `${level}: ${JSON.stringify(body)}`)
        assert.deepEqual(tagsFor(saved), external)
        assert.equal(notePlain(blocks), '')
        assert.equal(noteHtml(blocks), '')
      }
    }
  }
})

test('headings emptied by ordinary tags keep exact metadata without visible prefixes', () => {
  for (const level of [2, 3]) {
    for (const [body, expectedTags] of [
      ['#旅行', ['旅行']], ['#旅行 #旅行 #Travel #travel', ['旅行', '旅行', 'Travel', 'travel']],
      ['**#旅行**', ['旅行']], ['_#旅行_', ['旅行_']],
      ['[[color:blue|**#旅行**]]', ['旅行']], ['[[size:lg|_#Travel_]]', ['Travel_']],
      ['**_#tag_one_**', ['tag_one_']],
    ]) {
      for (const external of [[], ['旅行'], ['外部']]) {
        const source = headingLiteral(body, level, withoutTags, tagsFor)
        const saved = contentWithTags(source, external)
        const blocks = parseNote(withoutTags(saved))
        assert.equal(source, expectedTags.map(tag => `#${tag}`).join(' '))
        assert.deepEqual(tagsFor(saved), [...expectedTags, ...external], body)
        assert.equal(notePlain(blocks), '', body)
        assert.equal(noteHtml(blocks), '', body)
      }
    }
  }
})

test('empty headings adjacent to real paragraphs preserve paragraph order and metadata', () => {
  for (const level of [2, 3]) {
    for (const [body, expectedTags] of [['\n', []], ['[[color:blue|#旅行]]', ['旅行']]]) {
      const empty = headingLiteral(body, level, withoutTags, tagsFor)
      const lines = [empty, '首段', empty, '尾段', empty].filter(Boolean)
      const saved = contentWithTags(lines.join('\n'), ['外部'])
      const blocks = parseNote(withoutTags(saved))
      assert.deepEqual(tagsFor(saved), [...expectedTags, ...expectedTags, ...expectedTags, '外部'])
      assert.equal(notePlain(blocks), expectedTags.length ? '首段\n\n尾段' : '首段\n尾段')
      assert.equal(noteHtml(blocks), `<div>首段</div>${expectedTags.length ? '<div><br></div>' : ''}<div>尾段</div>`)
    }
  }
})

test('nonempty headings keep both levels supported styles code tags and authored literals', () => {
  const code = inlineLiteral('#代码 **literal** _ <script> path\\')
  for (const level of [2, 3]) {
    const body = `**_正文_** [[color:blue|颜色]] [[size:lg|大字]] ${code} #旅行`
    const source = headingLiteral(body, level, withoutTags, tagsFor)
    assert.equal(source, `${level === 2 ? '#' : '##'} ${body}`)
    const saved = contentWithTags(source, ['外部'])
    assert.deepEqual(tagsFor(saved), ['旅行', '外部'])
    const blocks = parseNote(withoutTags(saved))
    assert.equal(blocks[0].kind, 'heading')
    assert.equal(blocks[0].level, level)
    assert.equal(notePlain(blocks), '正文 颜色 大字 #代码 **literal** _ <script> path\\')
    const html = noteHtml(blocks)
    assert.ok(html.startsWith(`<h${level}>`))
    assert.ok(html.includes('<strong><em>正文</em></strong>'))
    assert.ok(html.includes('<span data-color="blue" class="text-color blue">颜色</span>'))
    assert.ok(html.includes('<span data-size="lg" class="text-size lg">大字</span>'))
    assert.ok(html.includes('<code>#代码 **literal** _ &lt;script&gt; path\\</code>'))
    for (const literal of ['#', '##', '>', '**', '_', '[[color:blue|literal]]']) {
      const literalSource = headingLiteral(escapeLiteral(literal), level, withoutTags, tagsFor)
      assert.equal(noteHtml(parseNote(withoutTags(contentWithTags(literalSource, [])))), `<h${level}>${inlineHtml(parseInline(escapeLiteral(literal)))}</h${level}>`)
      assert.equal(notePlain(parseNote(withoutTags(contentWithTags(literalSource, [])))), literal)
    }
    const codeOnly = headingLiteral(inlineLiteral('_'), level, withoutTags, tagsFor)
    assert.equal(noteHtml(parseNote(withoutTags(contentWithTags(codeOnly, [])))), `<h${level}><code>_</code></h${level}>`)
  }
  for (const literal of ['#', '##']) {
    assert.equal(noteHtml(parseNote(withoutTags(contentWithTags(literal, [])))), `<div>${literal}</div>`)
    assert.equal(notePlain(parseNote(withoutTags(contentWithTags(literal, [])))), literal)
  }
})
