import { useEffect, useMemo, useRef, useState } from 'react'
import { Bold, CalendarDays, Code, Italic, List, ListOrdered, Quote, X } from 'lucide-react'
import { clearNoteDraft, loadNoteDraft, saveNoteDraft } from './store'
import type { Note } from './types'
import { Modal } from './Modal'
import { markdownToEditorHtml, editorHtmlToMarkdown } from './noteFormat'
import { escapeHtml } from './noteCodec'
import { canUseTemplate, noteTemplates } from './noteTemplates'
import type { NoteTemplate } from './noteTemplates'
import { today, dateKey, dateLabel, tagsFor, withoutTags, normaliseTag, contentWithTags } from './recordTools'

type AllowedCommand = 'formatBlock' | 'bold' | 'italic' | 'insertUnorderedList' | 'insertOrderedList'
const emptyToolbar = { block: '', bold: false, italic: false, unordered: false, ordered: false, code: false }
function rangeOwned(editor: HTMLElement, range: Range) {
  return editor.isConnected && range.startContainer.isConnected && range.endContainer.isConnected && editor.contains(range.startContainer) && editor.contains(range.endContainer)
}
const rangeElement = (node: Node) => node instanceof HTMLElement ? node : node.parentElement
const rangeBlock = (node: Node, editor: HTMLElement) => rangeElement(node)?.closest('p,div,h2,h3,li,blockquote,pre') ?? editor
function ownedQuote(editor: HTMLElement, range: Range) {
  const first=rangeElement(range.startContainer)?.closest('blockquote'),last=rangeElement(range.endContainer)?.closest('blockquote')
  return first&&first===last&&editor.contains(first)?first:null
}
function canInsertCode(editor: HTMLElement, range: Range) {
  return rangeOwned(editor, range) && !range.collapsed && !!range.toString().trim() && rangeBlock(range.startContainer, editor) === rangeBlock(range.endContainer, editor) && !rangeElement(range.startContainer)?.closest('code,pre') && !rangeElement(range.endContainer)?.closest('code,pre') && !range.cloneContents().querySelector('code,pre')
}

export function NoteComposer({note,availableTags,onClose,onSave}:{note?:Note;availableTags:string[];onClose:()=>void;onSave:(draft:Omit<Note,'id'|'createdAt'>,id?:string)=>void}) {
  const draftKey=note?.id??'new', draft=useMemo(()=>loadNoteDraft(draftKey),[draftKey])
  const initialSavedContent=draft?.content??note?.content??'', initialContent=withoutTags(initialSavedContent)
  const [content,setContent]=useState(initialContent), [date,setDate]=useState(draft?.scheduledDate??note?.scheduledDate??today())
  const [tags,setTags]=useState(()=>tagsFor(initialSavedContent)), [tagInput,setTagInput]=useState(''), [picker,setPicker]=useState(false)
  const [draftStatus,setDraftStatus]=useState(draft?'已恢复草稿':note?'编辑记录':'草稿仅保留在本机')
  const [toolbar,setToolbar]=useState(emptyToolbar)
  const ref=useRef<HTMLDivElement>(null), committed=useRef(false), composing=useRef(false)
  const savedRange=useRef<Range|null>(null), latestBody=useRef(initialContent)
  const savedContent=contentWithTags(content,tags)
  const addTag=(value:string)=>{const tag=normaliseTag(value);if(tag)setTags(items=>items.includes(tag)?items:[...items,tag]);setTagInput('')}
  const captureSelection=()=>{
    const editor=ref.current, selection=document.getSelection()
    if(!editor||!selection?.rangeCount||!selection.anchorNode||!selection.focusNode||!editor.contains(selection.anchorNode)||!editor.contains(selection.focusNode))return
    const range=selection.getRangeAt(0)
    if(!rangeOwned(editor,range))return
    savedRange.current=range.cloneRange()
    const first=rangeBlock(range.startContainer,editor),last=rangeBlock(range.endContainer,editor)
    setToolbar({block:ownedQuote(editor,range)?'blockquote':first===last?first.tagName.toLowerCase():'',bold:document.queryCommandState('bold'),italic:document.queryCommandState('italic'),unordered:document.queryCommandState('insertUnorderedList'),ordered:document.queryCommandState('insertOrderedList'),code:!!canInsertCode(editor,range)})
  }
  const syncFromEditor=()=>{
    const editor=ref.current
    if(!editor)return latestBody.current
    const body=editorHtmlToMarkdown(editor)
    latestBody.current=body
    setContent(body)
    captureSelection()
    return body
  }
  const restoreRange=()=>{
    const editor=ref.current, active=document.activeElement
    if(!editor||(!editor.contains(active)&&!active?.closest('.editor-toolbar'))){setDraftStatus('请先在正文中选择或定位');return null}
    const selection=document.getSelection()
    if(!selection)return null
    // Mouse tools preserve the active editor selection; keyboard tools restore it.
    if(editor.contains(active)&&selection.rangeCount&&selection.anchorNode&&selection.focusNode&&editor.contains(selection.anchorNode)&&editor.contains(selection.focusNode)){
      const current=selection.getRangeAt(0)
      if(rangeOwned(editor,current))return current
    }
    const range=savedRange.current
    if(!range||!rangeOwned(editor,range)){setDraftStatus('请先在正文中选择或定位');return null}
    editor.focus({preventScroll:true})
    selection.removeAllRanges();selection.addRange(range)
    return range
  }
  const runCommand=(command:AllowedCommand,value?:string)=>{
    if(committed.current||composing.current)return
    const range=restoreRange(),editor=ref.current
    if(!range||!editor)return
    const listCommand=command==='insertUnorderedList'||command==='insertOrderedList'
    const caret=listCommand&&range.collapsed&&range.startContainer.nodeType===Node.TEXT_NODE?{node:range.startContainer,offset:range.startOffset,text:range.startContainer.textContent??''}:null
    const leaveQuote=command==='formatBlock'&&(value==='p'||value==='h2'||value==='h3')&&!!ownedQuote(editor,range)
    let accepted=document.execCommand(leaveQuote?'outdent':command,false,leaveQuote?undefined:value)
    // Heading transitions use two native history steps; plain body needs only outdent.
    if(accepted&&leaveQuote&&value!=='p')accepted=document.execCommand(command,false,value)
    if(accepted&&caret){
      const selection=document.getSelection(),after=selection?.rangeCount?selection.getRangeAt(0):null
      let target=caret.node.isConnected&&editor.contains(caret.node)?caret.node:null
      // List commands can replace Text; recover only an identical owned collapsed point.
      if(!target&&after?.collapsed&&rangeOwned(editor,after)&&after.startContainer.nodeType===Node.TEXT_NODE&&after.startContainer.textContent===caret.text)target=after.startContainer
      if(target)selection?.collapse(target,Math.min(caret.offset,target.textContent?.length??0))
    }
    syncFromEditor()
    if(!accepted)setDraftStatus('此格式暂不可用，可以继续编辑正文')
  }
  const insertCode=()=>{
    const editor=ref.current
    if(!editor||committed.current||composing.current)return
    const range=restoreRange()
    if(!range||!canInsertCode(editor,range))return
    const accepted=document.execCommand('insertHTML',false,`<code>${escapeHtml(range.toString())}</code>`)
    syncFromEditor()
    if(!accepted)setDraftStatus('此格式暂不可用，可以继续编辑正文')
  }
  useEffect(()=>{
    if(ref.current)ref.current.innerHTML=markdownToEditorHtml(initialContent)
    const timer=setTimeout(()=>{ref.current?.focus({preventScroll:true});captureSelection()},30)
    document.addEventListener('selectionchange',captureSelection)
    return ()=>{clearTimeout(timer);document.removeEventListener('selectionchange',captureSelection)}
  },[])
  useEffect(()=>{
    if(committed.current)return
    const unchanged=!!note&&savedContent===note.content&&date===(note.scheduledDate??today())
    try {
      if(content.trim()&&!unchanged){
        saveNoteDraft({content:savedContent,status:'none',scheduledDate:date,savedAt:new Date().toISOString()},draftKey)
        setDraftStatus(draft&&savedContent===draft.content&&date===draft.scheduledDate?'已恢复草稿 · 保留在本机':'草稿已保留在本机')
      } else { clearNoteDraft(draftKey); setDraftStatus(note?'编辑记录':'草稿仅保留在本机') }
    } catch { setDraftStatus('草稿未能保留，请保存记录后再关闭') }
  },[content,date,savedContent,draftKey,note,draft])
  const commit=()=>{
    if(committed.current||composing.current||!ref.current)return
    const body=syncFromEditor()
    if(!body.trim())return
    committed.current=true
    clearNoteDraft(draftKey)
    onSave({content:contentWithTags(body,tags),status:'none',scheduledDate:date,done:note?.done??false,deletedAt:note?.deletedAt},note?.id)
  }
  const offerTemplates=canUseTemplate({hasNote:!!note,hasDraft:!!draft,body:content})
  const applyTemplate=(template:NoteTemplate)=>{
    const editor=ref.current
    if(!editor||committed.current||composing.current||!canUseTemplate({hasNote:!!note,hasDraft:!!draft,body:editorHtmlToMarkdown(editor),visibleText:editor.textContent??''}))return
    editor.focus({preventScroll:true})
    const range=document.createRange();range.selectNodeContents(editor)
    const selection=document.getSelection();if(!selection)return
    selection.removeAllRanges();selection.addRange(range)
    const accepted=document.execCommand('insertHTML',false,markdownToEditorHtml(template.body))
    syncFromEditor()
    if(!accepted)setDraftStatus('模板暂不可用，可以直接开始记录')
  }
  const toolMouseDown=(event:React.MouseEvent<HTMLButtonElement>)=>{captureSelection();event.preventDefault()}
  return <Modal title={note?'编辑记录':'新建记录'} onClose={onClose}>
    <section className="composer rich-composer" onKeyDown={event=>{
      if(composing.current||event.nativeEvent.isComposing||event.keyCode===229||event.repeat)return
      if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();commit()}
    }}>
      <header><div><span>{note?'编辑记录':'新建记录'}</span><small>把此刻留下，慢慢整理也没关系</small></div><button aria-label="关闭" onClick={onClose}><X size={21}/></button></header>
      <div className="editor-toolbar" role="group" aria-label="正文排版">
        <div className="toolbar-group">{[['p','正文'],['h2','标题'],['h3','小标题']].map(([block,label])=><button className="block-tool" key={block} aria-pressed={toolbar.block===block||(block==='p'&&toolbar.block==='div')} onMouseDown={toolMouseDown} onClick={()=>runCommand('formatBlock',block)}>{label}</button>)}</div>
        <div className="toolbar-group">
          <button title="粗体" aria-label="粗体" aria-pressed={toolbar.bold} onMouseDown={toolMouseDown} onClick={()=>runCommand('bold')}><Bold size={17}/></button>
          <button title="斜体" aria-label="斜体" aria-pressed={toolbar.italic} onMouseDown={toolMouseDown} onClick={()=>runCommand('italic')}><Italic size={17}/></button>
          <button title="无序列表" aria-label="无序列表" aria-pressed={toolbar.unordered} onMouseDown={toolMouseDown} onClick={()=>runCommand('insertUnorderedList')}><List size={18}/></button>
          <button title="有序列表" aria-label="有序列表" aria-pressed={toolbar.ordered} onMouseDown={toolMouseDown} onClick={()=>runCommand('insertOrderedList')}><ListOrdered size={18}/></button>
          <button title="引用" aria-label="引用" aria-pressed={toolbar.block==='blockquote'} onMouseDown={toolMouseDown} onClick={()=>runCommand('formatBlock','blockquote')}><Quote size={17}/></button>
          <button title="选择同一段文字后使用" aria-label="行内代码：选择同一段文字后使用" disabled={!toolbar.code} onMouseDown={toolMouseDown} onClick={insertCode}><Code size={18}/></button>
        </div>
      </div>
      {offerTemplates&&<div className="starter-templates" aria-label="起笔模板"><span>从空白开始，或用</span>{noteTemplates.map(template=><button key={template.name} onClick={()=>applyTemplate(template)}>{template.name}</button>)}</div>}
      <div ref={ref} role="textbox" aria-label="记录正文" aria-multiline="true" className="visual-editor" contentEditable suppressContentEditableWarning data-placeholder="此刻想记下什么？" onInput={syncFromEditor} onCompositionStart={()=>{composing.current=true}} onCompositionEnd={()=>{composing.current=false;syncFromEditor()}}/>
      <div className="tag-editor"><div className="selected-tags">{tags.map((tag,index)=><button aria-label={`移除标签${tag}`} className={`tag-chip tone-${index%5}`} key={tag} onClick={()=>setTags(items=>items.filter(item=>item!==tag))}>{tag}<X size={12}/></button>)}</div><input aria-label="添加标签" value={tagInput} onChange={event=>setTagInput(event.target.value)} onKeyDown={event=>{if(event.nativeEvent.isComposing||event.keyCode===229||event.repeat||event.ctrlKey||event.metaKey)return;if(event.key==='Enter'){event.preventDefault();addTag(tagInput)}}} placeholder="添加标签"/><button className="add-tag" disabled={!normaliseTag(tagInput)} onClick={()=>addTag(tagInput)}>添加</button>{availableTags.filter(tag=>!tags.includes(tag)).slice(0,5).map((tag,index)=><button className={`tag-suggestion tone-${index%5}`} key={tag} onClick={()=>addTag(tag)}>{tag}</button>)}</div>
      <div className="schedule-row"><button aria-expanded={picker} className="date-trigger" onClick={()=>setPicker(v=>!v)}><CalendarDays size={16}/>{dateLabel(date)}</button></div>
      {picker&&<DateWheelPicker value={date} onChange={setDate}/>}
      <footer className="composer-footer"><div className="composer-save-info"><span role="status" className="draft-status">{draftStatus}</span><span className="save-shortcut"><kbd>Ctrl / ⌘</kbd> + <kbd>Enter</kbd> 保存</span></div><button className="save" disabled={!content.trim()} onClick={commit}>保存记录</button></footer>
    </section>
  </Modal>
}
function DateWheelPicker({value,onChange}:{value:string;onChange:(value:string)=>void}) { const initial=new Date(`${value}T12:00:00`); const current=Number.isNaN(initial.valueOf())?new Date():initial; const y=current.getFullYear(),m=current.getMonth()+1,d=current.getDate(); const years=Array.from({length:13},(_,i)=>new Date().getFullYear()-5+i),months=Array.from({length:12},(_,i)=>i+1),days=Array.from({length:new Date(y,m,0).getDate()},(_,i)=>i+1); const change=(part:'y'|'m'|'d',num:number)=>{const nextY=part==='y'?num:y,nextM=part==='m'?num:m,nextD=Math.min(part==='d'?num:d,new Date(nextY,nextM,0).getDate()); onChange(dateKey(new Date(nextY,nextM-1,nextD)))}; return <div className="wheel-picker"><Wheel label="年" values={years} selected={y} onChange={n=>change('y',n)}/><Wheel label="月" values={months} selected={m} onChange={n=>change('m',n)}/><Wheel label="日" values={days} selected={d} onChange={n=>change('d',n)}/></div> }
function Wheel({label,values,selected,onChange}:{label:string;values:number[];selected:number;onChange:(n:number)=>void}) { const ref=useRef<HTMLDivElement>(null),interacting=useRef(false),timer=useRef<number | undefined>(undefined); useEffect(()=>{if(interacting.current)return; ref.current?.querySelector<HTMLElement>('[data-selected="true"]')?.scrollIntoView({block:'center'})},[selected]); useEffect(()=>()=>window.clearTimeout(timer.current),[]); const settle=()=>{window.clearTimeout(timer.current);timer.current=window.setTimeout(()=>{interacting.current=false},120)}; const selectClosest=()=>{const list=ref.current;if(!list)return;const center=list.getBoundingClientRect().top+list.clientHeight/2;const nearest=Array.from(list.querySelectorAll<HTMLElement>('button')).reduce((closest,button)=>Math.abs(button.getBoundingClientRect().top+button.offsetHeight/2-center)<Math.abs(closest.getBoundingClientRect().top+closest.offsetHeight/2-center)?button:closest);const next=Number(nearest.dataset.value);if(next!==selected)onChange(next)}; return <div className="wheel"><b>{label}</b><div ref={ref} onScroll={()=>{interacting.current=true;selectClosest();settle()}}>{values.map(n=><button data-value={n} data-selected={n===selected} className={n===selected?'selected':''} key={n} onClick={e=>{interacting.current=true;e.currentTarget.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});onChange(n);settle()}}>{n}</button>)}</div></div> }
