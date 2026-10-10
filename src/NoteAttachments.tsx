import { useState } from 'react'
import { Download, FileText, X } from 'lucide-react'
import type { NoteAttachment } from './types'
import { downloadAttachment, isPreviewImage } from './attachmentFiles'
import { Modal } from './Modal'

export function NoteAttachments({ files = [], onRemove }: { files?: NoteAttachment[]; onRemove?: (id: string) => void }) {
  const [preview, setPreview] = useState<NoteAttachment | null>(null)
  if (!files.length) return null
  return <>
    <div className="note-attachments" aria-label="记录附件">{files.map(file => <div className="note-attachment" key={file.id}>
      {isPreviewImage(file) ? <button className="attachment-image" aria-label={`查看图片 ${file.name}`} onClick={() => setPreview(file)}><img src={file.data} alt={file.name} loading="lazy"/></button> : <FileText size={24}/>}
      <span className="attachment-name" title={file.name}>{file.name}<small>{file.size < 1024 ? `${file.size} B` : file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`}</small></span>
      <button aria-label={`下载 ${file.name}`} title="下载原文件" onClick={() => downloadAttachment(file)}><Download size={16}/></button>
      {onRemove && <button aria-label={`移除附件 ${file.name}`} title="移除附件" onClick={() => onRemove(file.id)}><X size={16}/></button>}
    </div>)}</div>
    {preview && <div onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();setPreview(null)}}}><Modal title={preview.name} onClose={() => setPreview(null)} className="attachment-preview"><header><span>{preview.name}</span><button aria-label="关闭图片预览" onClick={() => setPreview(null)}><X size={20}/></button></header><img src={preview.data} alt={preview.name}/></Modal></div>}
  </>
}
