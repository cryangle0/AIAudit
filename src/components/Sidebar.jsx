import { ChevronRight, ChevronDown, Moon, Sun, LogOut, Settings, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { PLATFORMS, MOCK_SHOPS } from '../platforms/index.js'
import './Sidebar.css'

const MONTH_OPTIONS = ['2025-12', '2026-01', '2026-02', '2026-03']

export default function Sidebar({
  platformId, shopId, month, darkMode,
  onScopeChange, onToggleDark, onLogout
}) {
  const [expanded, setExpanded] = useState(() => Object.fromEntries(PLATFORMS.map(p => [p.id, p.id === platformId])))

  return (
    <aside className="rec-sidebar">
      <div className="rec-sidebar-brand">
        <span className="rec-brand-emoji">📊</span>
        <span>AI对账</span>
      </div>

      <nav className="rec-sidebar-nav">
        {PLATFORMS.map(p => {
          const open = expanded[p.id]
          const isMock = p.status === 'mock'
          const shops = MOCK_SHOPS[p.id] || []
          return (
            <div key={p.id} className="rec-platform">
              <button
                className="rec-platform-row"
                onClick={() => setExpanded(e => ({ ...e, [p.id]: !e[p.id] }))}
              >
                {open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                <span className="rec-platform-name">{p.name}</span>
                {isMock && <span className="rec-tag rec-tag-demo"><Sparkles size={10}/>演示</span>}
                {p.status === 'ready' && <span className="rec-tag rec-tag-real">真实</span>}
              </button>
              {open && shops.map(s => (
                <button
                  key={s.id}
                  className={`rec-shop-row ${platformId === p.id && shopId === s.id ? 'active' : ''}`}
                  onClick={() => onScopeChange({ platformId: p.id, shopId: s.id, month })}
                >• {s.name}</button>
              ))}
            </div>
          )
        })}
      </nav>

      <div className="rec-sidebar-section">
        <label className="rec-month-label">📅 月份</label>
        <select
          className="rec-month-select"
          value={month}
          onChange={e => onScopeChange({ platformId, shopId, month: e.target.value })}
        >
          {MONTH_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="rec-sidebar-footer">
        <button onClick={onToggleDark} title={darkMode ? '亮色' : '暗色'}>
          {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
        </button>
        <button title="设置"><Settings size={16}/></button>
        <button onClick={onLogout} title="退出"><LogOut size={16}/></button>
      </div>
    </aside>
  )
}
