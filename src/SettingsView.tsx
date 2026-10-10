import { Download, FileUp, Moon, Sparkles, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { SoftButton } from './SoftInteraction'

export function SettingsView({ theme, onTheme, onExport, onImport, ambientEnabled, reducedMotion, onAmbient, petShown, onPet, petName, onOpenWardrobe }: {
  ambientEnabled: boolean; reducedMotion: boolean; onAmbient(): void; petShown: boolean; onPet(): void; petName: string; onOpenWardrobe(): void
  theme: 'light' | 'dark'; onTheme(): void; onExport(): void; onImport(): void
}) {
  return <div className="content settings-view"><div className="heading"><div><p className="eyebrow">偏好与数据</p><h1>设置</h1><p className="subtle">你的数据只存放在这台设备上。</p></div></div><Setting title="外观" description="在浅色与深色之间切换" action={<button className="soft-button" onClick={onTheme}>{theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}{theme === 'light' ? '使用深色' : '使用浅色'}</button>} /><Setting title="动态效果" description={reducedMotion ? '已随系统减少动态效果，静态关联仍可操作' : '让主体光场、记录节点与关联流光缓缓呼吸'} action={<button aria-pressed={ambientEnabled} className="soft-button" onClick={onAmbient}><Sparkles size={16} />{ambientEnabled ? '关闭动态' : '开启动效'}</button>} /><Setting title="宠物伙伴" description={`让${petName}陪你留一点晴朗，可随时收起或重新开启`} action={<div className="pet-setting-actions"><button aria-pressed={petShown} className="soft-button" onClick={onPet}><Sparkles size={16} />{petShown ? '收起伙伴' : '显示伙伴'}</button><SoftButton className="soft-button" onClick={onOpenWardrobe}>挑选装扮</SoftButton></div>} /><Setting title="导出备份" description="下载包含所有记录、待办和账目的 JSON 文件" action={<button className="soft-button" onClick={onExport}><Download size={16} />导出</button>} /><Setting title="导入备份" description="导入会替换当前设备上的记录、待办和账目" action={<button className="soft-button" onClick={onImport}><FileUp size={16} />导入</button>} /></div>
}

function Setting({ title, description, action }: { title: string; description: string; action: ReactNode }) {
  return <section className="settings-card"><div><b>{title}</b><p>{description}</p></div>{action}</section>
}
