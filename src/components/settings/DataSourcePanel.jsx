import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Select from '../Select.jsx'

const SOURCE_OPTIONS = [
  { value: 'jushuitan', label: '聚水潭' },
  { value: 'kingdee',   label: '金蝶' },
  { value: 'manual',    label: '手动 xlsx' }
]

export default function DataSourcePanel({ settings, updateSettings }) {
  const ds = settings.dataSource
  const [showToken, setShowToken] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)  // null | 'ok'

  function setPrimary(primary) {
    updateSettings(prev => ({
      ...prev,
      dataSource: { ...prev.dataSource, primary }
    }))
  }

  function setJushuitan(patch) {
    updateSettings(prev => ({
      ...prev,
      dataSource: {
        ...prev.dataSource,
        jushuitan: { ...prev.dataSource.jushuitan, ...patch }
      }
    }))
  }

  function setColumnMap(key, value) {
    updateSettings(prev => ({
      ...prev,
      dataSource: {
        ...prev.dataSource,
        jushuitan: {
          ...prev.dataSource.jushuitan,
          columnMap: { ...prev.dataSource.jushuitan.columnMap, [key]: value }
        }
      }
    }))
  }

  function testConnection() {
    setTesting(true)
    setTestResult(null)
    setTimeout(() => {
      setTesting(false)
      setTestResult('ok')
    }, 1000)
  }

  return (
    <div>
      <h3 className="rec-settings-section-title">数据源设置</h3>

      <div className="rec-settings-row-item">
        <div className="rec-settings-row-main">
          <div className="rec-settings-row-label">主数据源</div>
          <div style={{ marginTop: 8, maxWidth: 240 }}>
            <Select
              value={ds.primary}
              options={SOURCE_OPTIONS}
              onChange={setPrimary}
              width="100%"
            />
          </div>
        </div>
      </div>

      {ds.primary === 'jushuitan' && (
        <>
          <h4 className="rec-settings-section-title" style={{ marginTop: 16, fontSize: 'var(--font-size-sm)' }}>
            聚水潭配置
          </h4>
          <div className="rec-settings-row-item">
            <div className="rec-settings-row-main">
              <div className="rec-settings-row-label">API 地址</div>
              <input
                className="rec-settings-input"
                style={{ width: '100%', marginTop: 6 }}
                placeholder="https://api.jushuitan.com/..."
                value={ds.jushuitan.apiUrl}
                onChange={e => setJushuitan({ apiUrl: e.target.value })}
              />
            </div>
          </div>
          <div className="rec-settings-row-item">
            <div className="rec-settings-row-main">
              <div className="rec-settings-row-label">Token</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <input
                  className="rec-settings-input"
                  type={showToken ? 'text' : 'password'}
                  style={{ flex: 1 }}
                  placeholder="••••••••"
                  value={ds.jushuitan.token}
                  onChange={e => setJushuitan({ token: e.target.value })}
                />
                <button
                  className="rec-settings-icon-btn"
                  type="button"
                  onClick={() => setShowToken(s => !s)}
                  title={showToken ? '隐藏' : '显示'}
                >
                  {showToken ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>
          </div>
          <div className="rec-settings-row-item">
            <div className="rec-settings-row-main">
              <div className="rec-settings-row-label">连接状态</div>
              <div className="rec-settings-row-sub">
                {testing && '测试中…'}
                {!testing && testResult === 'ok' && '✓ 连接成功（演示）'}
                {!testing && testResult === null && '未测试'}
              </div>
            </div>
            <button
              className="rec-modal-btn"
              disabled={testing}
              onClick={testConnection}
            >测试连接</button>
          </div>

          <h4 className="rec-settings-section-title" style={{ marginTop: 16, fontSize: 'var(--font-size-sm)' }}>
            列名映射
          </h4>
          {Object.entries(ds.jushuitan.columnMap).map(([key, value]) => (
            <div key={key} className="rec-settings-row-item">
              <div className="rec-settings-row-main">
                <div className="rec-settings-row-label">{key}</div>
              </div>
              <input
                className="rec-settings-input"
                style={{ width: 200 }}
                value={value}
                onChange={e => setColumnMap(key, e.target.value)}
              />
            </div>
          ))}
        </>
      )}

      {ds.primary === 'kingdee' && (
        <>
          <h4 className="rec-settings-section-title" style={{ marginTop: 16, fontSize: 'var(--font-size-sm)' }}>
            金蝶配置
            <span className="rec-settings-tag default" style={{ marginLeft: 8 }}>开发中</span>
          </h4>
          <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
            <div className="rec-settings-row-item">
              <div className="rec-settings-row-main">
                <div className="rec-settings-row-label">API 地址</div>
                <input className="rec-settings-input" style={{ width: '100%', marginTop: 6 }} placeholder="即将上线"/>
              </div>
            </div>
            <div className="rec-settings-row-item">
              <div className="rec-settings-row-main">
                <div className="rec-settings-row-label">Token</div>
                <input className="rec-settings-input" type="password" style={{ width: '100%', marginTop: 6 }} placeholder="即将上线"/>
              </div>
            </div>
          </div>
        </>
      )}

      {ds.primary === 'manual' && (
        <div className="rec-settings-hint" style={{ marginTop: 16 }}>
          手动模式下，每次对账需在主页面上传聚水潭/金蝶的导出 xlsx 文件。无需配置 API。
        </div>
      )}
    </div>
  )
}
