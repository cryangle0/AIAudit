import { useState } from 'react'
import { Layers, Store, Database, Sliders } from 'lucide-react'
import Modal from './Modal.jsx'
import PlatformsPanel from './settings/PlatformsPanel.jsx'
import ShopsPanel from './settings/ShopsPanel.jsx'
import DataSourcePanel from './settings/DataSourcePanel.jsx'
import RulesPanel from './settings/RulesPanel.jsx'
import './settings/settings.css'

const TABS = [
  { id: 'platforms',  label: '平台',     icon: Layers   },
  { id: 'shops',      label: '店铺',     icon: Store    },
  { id: 'datasource', label: '数据源',   icon: Database },
  { id: 'rules',      label: '对账规则', icon: Sliders  }
]

export default function SettingsModal({
  open, onClose,
  settings, updateSettings, resetSettings
}) {
  const [activeTab, setActiveTab] = useState('platforms')
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <>
      <Modal
        open={open}
        title="设置"
        onClose={onClose}
        width={720}
        footer={
          <>
            <button
              className="rec-modal-btn"
              onClick={() => setConfirmReset(true)}
            >恢复默认</button>
            <button className="rec-modal-btn" onClick={onClose}>关闭</button>
          </>
        }
      >
        <div className="rec-settings-shell">
          <nav className="rec-settings-nav">
            {TABS.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  className={`rec-settings-nav-item ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <Icon size={14} style={{ verticalAlign: 'middle', marginRight: 6 }}/>
                  {t.label}
                </button>
              )
            })}
          </nav>
          <div className="rec-settings-content">
            {activeTab === 'platforms'  && <PlatformsPanel  settings={settings} updateSettings={updateSettings}/>}
            {activeTab === 'shops'      && <ShopsPanel      settings={settings} updateSettings={updateSettings}/>}
            {activeTab === 'datasource' && <DataSourcePanel settings={settings} updateSettings={updateSettings}/>}
            {activeTab === 'rules'      && <RulesPanel      settings={settings} updateSettings={updateSettings}/>}
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmReset}
        title="恢复默认设置"
        onClose={() => setConfirmReset(false)}
        width={360}
        footer={
          <>
            <button className="rec-modal-btn" onClick={() => setConfirmReset(false)}>取消</button>
            <button
              className="rec-modal-btn danger"
              onClick={() => {
                resetSettings()
                setConfirmReset(false)
              }}
            >确认恢复</button>
          </>
        }
      >
        所有设置（启用平台、自定义店铺、数据源、对账规则）将恢复为默认值。此操作不可撤销。
      </Modal>
    </>
  )
}
