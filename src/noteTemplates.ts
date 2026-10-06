export type NoteTemplate = { name: string; body: string }
export const noteTemplates: readonly NoteTemplate[] = [
  { name: '日记', body: '# 今日记录\n## 发生了什么\n\n## 此刻感受\n' },
  { name: '会议纪要', body: '# 会议纪要\n## 讨论要点\n- \n## 后续行动\n- ' },
  { name: '阅读随记', body: '# 阅读随记\n## 阅读内容\n\n## 摘录\n> \n## 我的想法\n' },
]
export const canUseTemplate = ({ hasNote, hasDraft, body, visibleText = '' }: { hasNote: boolean; hasDraft: boolean; body: string; visibleText?: string }) => !hasNote && !hasDraft && !body.trim() && !visibleText.trim()
