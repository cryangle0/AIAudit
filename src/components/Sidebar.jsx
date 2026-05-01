import { ChevronRight, ChevronDown, Moon, Sun, LogOut, Settings, Sparkles, Calendar } from 'lucide-react'
import { useState } from 'react'
import { PLATFORMS, MOCK_SHOPS } from '../platforms/index.js'
import logoImg from '../assets/logo.png'
import Modal from './Modal.jsx'
import Select from './Select.jsx'
import SettingsModal from './SettingsModal.jsx'
import './Sidebar.css'

const MONTH_OPTIONS = ['2025-12', '2026-01', '2026-02', '2026-03']

function formatMonth(m) {
  // "2026-01" -> "2026年1月"
  const [y, mm] = m.split('-')
  return `${y}年${parseInt(mm, 10)}月`
}

const MONTH_SELECT_OPTIONS = MONTH_OPTIONS.map(m => ({ value: m, label: formatMonth(m) }))

export default function Sidebar({
  platformId, shopId, month, darkMode,
  settings, updateSettings, resetSettings,
  onScopeChange, onToggleDark, onLogout
}) {
  const [expanded, setExpanded] = useState(() => Object.fromEntries(PLATFORMS.map(p => [p.id, p.id === platformId])))
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  return (
    <aside className="rec-sidebar">
      <div className="rec-sidebar-brand">
        <img src={logoImg} alt="爱对" className="rec-brand-logo" />
        <span>爱对</span>
      </div>

      <nav className="rec-sidebar-nav">
        {PLATFORMS.filter(p => settings.enabledPlatforms.includes(p.id)).map(p => {
          const open = expanded[p.id]
          const isDemo = p.status === 'demo'
          const shops = [
            ...(MOCK_SHOPS[p.id] || []),
            ...(settings.customShops?.[p.id] || [])
          ]
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
        <Select
          value={month}
          options={MONTH_SELECT_OPTIONS}
          onChange={m => onScopeChange({ platformId, shopId, month: m })}
          placement="top"
          width="100%"
        />
      </div>

      <div className="rec-sidebar-footer">
        <button onClick={onToggleDark} title={darkMode ? '亮色' : '暗色'}>
          {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
        </button>
        <button onClick={() => setSettingsOpen(true)} title="设置"><Settings size={16}/></button>
        <button onClick={() => setConfirmLogout(true)} title="退出"><LogOut size={16}/></button>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
        resetSettings={resetSettings}
      />

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
