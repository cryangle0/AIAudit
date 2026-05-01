import { ChevronRight, ChevronDown, Moon, Sun, LogOut, Settings, Sparkles, Calendar, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { PLATFORMS, MOCK_SHOPS } from '../platforms/index.js'
import logoImg from '../assets/logo.png'
import Modal from './Modal.jsx'
import './Sidebar.css'

const MONTH_OPTIONS = ['2025-12', '2026-01', '2026-02', '2026-03']

function formatMonth(m) {
  // "2026-01" -> "2026年1月"
  const [y, mm] = m.split('-')
  return `${y}年${parseInt(mm, 10)}月`
}

export default function Sidebar({
  platformId, shopId, month, darkMode,
  onScopeChange, onToggleDark, onLogout
}) {
  const [expanded, setExpanded] = useState(() => Object.fromEntries(PLATFORMS.map(p => [p.id, p.id === platformId])))
  const [monthOpen, setMonthOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const monthRef = useRef(null)

  // click outside closes month dropdown
  useEffect(() => {
    if (!monthOpen) return
    const onDown = e => {
      if (monthRef.current && !monthRef.current.contains(e.target)) setMonthOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [monthOpen])

  return (
    <aside className="rec-sidebar">
      <div className="rec-sidebar-brand">
        <img src={logoImg} alt="爱对" className="rec-brand-logo" />
        <span>爱对</span>
      </div>

      <nav className="rec-sidebar-nav">
        {PLATFORMS.map(p => {
          const open = expanded[p.id]
          const isDemo = p.status === 'demo'
          const shops = MOCK_SHOPS[p.id] || []
          return (
            <div key={p.id} className="rec-platform">
              <button
                className="rec-platform-row"
                onClick={() => setExpanded(e => ({ ...e, [p.id]: !e[p.id] }))}
              >
                {open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                <span className="rec-platform-name">{p.name}</span>
                {isDemo && <span className="rec-tag rec-tag-demo"><Sparkles size={10}/>演示</span>}
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
        <label className="rec-month-label"><Calendar size={14}/> 月份</label>
        <div className="rec-month-picker" ref={monthRef}>
          <button
            type="button"
            className="rec-month-trigger"
            onClick={() => setMonthOpen(o => !o)}
            aria-haspopup="listbox"
            aria-expanded={monthOpen}
          >
            <span>{formatMonth(month)}</span>
            <ChevronDown size={14} className={`rec-month-chevron ${monthOpen ? 'open' : ''}`}/>
          </button>
          {monthOpen && (
            <div className="rec-month-dropdown" role="listbox">
              {MONTH_OPTIONS.map(m => {
                const selected = m === month
                return (
                  <button
                    key={m}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`rec-month-option ${selected ? 'selected' : ''}`}
                    onClick={() => {
                      onScopeChange({ platformId, shopId, month: m })
                      setMonthOpen(false)
                    }}
                  >
                    <span>{formatMonth(m)}</span>
                    {selected && <Check size={14}/>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rec-sidebar-footer">
        <button onClick={onToggleDark} title={darkMode ? '亮色' : '暗色'}>
          {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
        </button>
        <button onClick={() => setSettingsOpen(true)} title="设置"><Settings size={16}/></button>
        <button onClick={() => setConfirmLogout(true)} title="退出"><LogOut size={16}/></button>
      </div>

      <Modal
        open={settingsOpen}
        title="设置"
        onClose={() => setSettingsOpen(false)}
        footer={
          <button className="rec-modal-btn" onClick={() => setSettingsOpen(false)}>关闭</button>
        }
      >
        <div className="rec-settings-row">
          <div>
            <div className="rec-settings-label">主题</div>
            <div className="rec-settings-sub">切换暗色 / 亮色界面</div>
          </div>
          <button className="rec-modal-btn" onClick={onToggleDark}>
            {darkMode ? '切换到亮色' : '切换到暗色'}
          </button>
        </div>
        <div className="rec-settings-row">
          <div>
            <div className="rec-settings-label">关于"爱对"</div>
            <div className="rec-settings-sub">多平台电商利润对账原型 · v0.0.0</div>
          </div>
        </div>
        <div className="rec-settings-row">
          <div>
            <div className="rec-settings-label">更多设置</div>
            <div className="rec-settings-sub">账号、AI 助手偏好、对账规则等正在开发中</div>
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmLogout}
        title="确认退出"
        onClose={() => setConfirmLogout(false)}
        width={360}
        footer={
          <>
            <button className="rec-modal-btn" onClick={() => setConfirmLogout(false)}>取消</button>
            <button
              className="rec-modal-btn danger"
              onClick={() => {
                setConfirmLogout(false)
                onLogout?.()
              }}
            >确认退出</button>
          </>
        }
      >
        确定要退出登录吗？未保存的对账数据将会丢失。
      </Modal>
    </aside>
  )
}
