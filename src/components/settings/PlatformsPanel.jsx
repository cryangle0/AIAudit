import { PLATFORMS } from '../../platforms/index.js'

export default function PlatformsPanel({ settings, updateSettings }) {
  const enabled = settings.enabledPlatforms

  function toggle(id) {
    const isEnabled = enabled.includes(id)
    // 不允许取消最后一个
    if (isEnabled && enabled.length === 1) return
    const next = isEnabled
      ? enabled.filter(x => x !== id)
      : [...enabled, id]
    updateSettings({ enabledPlatforms: next })
  }

  return (
    <div>
      <h3 className="rec-settings-section-title">平台管理</h3>
      <div className="rec-settings-hint" style={{ marginBottom: 12 }}>
        勾选要在侧边栏显示的平台。至少保留 1 个。
      </div>

      {PLATFORMS.map(p => {
        const isEnabled = enabled.includes(p.id)
        const isLast = isEnabled && enabled.length === 1
        return (
          <div key={p.id} className="rec-settings-row-item">
            <label className="rec-settings-row-main" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: isLast ? 'not-allowed' : 'pointer' }}>
              <input
                type="checkbox"
                checked={isEnabled}
                disabled={isLast}
                onChange={() => toggle(p.id)}
              />
              <span className="rec-settings-row-label">{p.name}</span>
              <span className={`rec-settings-tag ${p.status === 'ready' ? 'custom' : 'default'}`}>
                {p.status === 'ready' ? '真实' : '演示'}
              </span>
            </label>
            <span className="rec-settings-row-sub" style={{ marginTop: 0 }}>
              uploadSlots: {p.uploadSlots.length}
            </span>
          </div>
        )
      })}
    </div>
  )
}
