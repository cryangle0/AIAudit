import { Download, HelpCircle, User } from 'lucide-react'
import './TopBar.css'

export default function TopBar({
  pageMeta, showScope,
  platformName, shopName, month,
  onExport, canExport
}) {
  return (
    <header className="rec-topbar">
      <div className="rec-topbar-row">
        <div className="rec-topbar-title">
          <span className="rec-topbar-group">{pageMeta?.groupLabel}</span>
          <span className="rec-topbar-sep">/</span>
          <strong>{pageMeta?.label}</strong>
          {showScope && (
            <>
              <span className="rec-topbar-sep">·</span>
              <span>{platformName}</span>
              <span className="rec-topbar-sep">·</span>
              <span>{shopName}</span>
              <span className="rec-topbar-sep">·</span>
              <span>{month}</span>
            </>
          )}
        </div>
        <div className="rec-topbar-actions">
          {onExport && (
            <button onClick={onExport} disabled={!canExport} title="导出 CSV">
              <Download size={14}/> 导出
            </button>
          )}
          <button title="帮助"><HelpCircle size={14}/> 帮助</button>
          <button title="账户"><User size={14}/></button>
        </div>
      </div>
    </header>
  )
}
