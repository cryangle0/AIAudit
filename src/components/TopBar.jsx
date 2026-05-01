import { Download, HelpCircle, User } from 'lucide-react'
import './TopBar.css'

const TABS = [
  { id: 'reconcile', label: '对账明细' },
  { id: 'sku', label: '款式利润榜' }
]

export default function TopBar({ platformName, shopName, month, activeTab, onTabChange, onExport, canExport }) {
  return (
    <header className="rec-topbar">
      <div className="rec-topbar-row">
        <div className="rec-topbar-title">
          <strong>{platformName}</strong>
          <span className="rec-topbar-sep">·</span>
          <span>{shopName}</span>
          <span className="rec-topbar-sep">·</span>
          <span>{month}</span>
        </div>
        <div className="rec-topbar-actions">
          <button onClick={onExport} disabled={!canExport} title="导出 CSV">
            <Download size={14}/> 导出
          </button>
          <button title="帮助"><HelpCircle size={14}/> 帮助</button>
          <button title="账户"><User size={14}/></button>
        </div>
      </div>
      <div className="rec-topbar-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`rec-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >{t.label}</button>
        ))}
      </div>
    </header>
  )
}
