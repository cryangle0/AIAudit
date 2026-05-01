import Select from '../Select.jsx'

const STRATEGIES = [
  { value: 'orderId', label: '订单号优先（推荐）' },
  { value: 'skuTime', label: 'SKU + 时间窗' },
  { value: 'auto',    label: '自动选择' }
]

export default function RulesPanel({ settings, updateSettings }) {
  const r = settings.reconcileRules

  function set(patch) {
    updateSettings(prev => ({
      ...prev,
      reconcileRules: { ...prev.reconcileRules, ...patch }
    }))
  }

  // 三个阈值需满足 matched < minor < severe
  const matchedInvalid = r.matchedThreshold >= r.minorThreshold
  const minorInvalid   = r.minorThreshold >= r.severeThreshold

  return (
    <div>
      <h3 className="rec-settings-section-title">对账规则</h3>

      <div className="rec-settings-banner">
        ⚠️ 演示阶段，本面板规则暂不参与实际对账计算。
      </div>

      <h4 className="rec-settings-section-title" style={{ fontSize: 'var(--font-size-sm)' }}>
        利润差异分桶
      </h4>

      <div className="rec-settings-row-item">
        <div className="rec-settings-row-main">
          <div className="rec-settings-row-label">相符阈值</div>
          <div className="rec-settings-row-sub">绝对值 ≤ 此值 → 视为"相符"</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`rec-settings-input ${matchedInvalid ? 'invalid' : ''}`}
            style={{ width: 100 }}
            value={r.matchedThreshold}
            onChange={e => set({ matchedThreshold: parseFloat(e.target.value) || 0 })}
          />
          <span className="rec-settings-row-sub" style={{ marginTop: 0 }}>元</span>
        </div>
      </div>

      <div className="rec-settings-row-item">
        <div className="rec-settings-row-main">
          <div className="rec-settings-row-label">偏差阈值</div>
          <div className="rec-settings-row-sub">绝对值 ≤ 此值 → 视为"偏差"，超过则"严重"</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="number"
            step="0.5"
            min="0"
            className={`rec-settings-input ${minorInvalid ? 'invalid' : ''}`}
            style={{ width: 100 }}
            value={r.minorThreshold}
            onChange={e => set({ minorThreshold: parseFloat(e.target.value) || 0 })}
          />
          <span className="rec-settings-row-sub" style={{ marginTop: 0 }}>元</span>
        </div>
      </div>

      <div className="rec-settings-row-item">
        <div className="rec-settings-row-main">
          <div className="rec-settings-row-label">严重偏差阈值</div>
          <div className="rec-settings-row-sub">超过此值视为"严重"</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="number"
            step="1"
            min="0"
            className="rec-settings-input"
            style={{ width: 100 }}
            value={r.severeThreshold}
            onChange={e => set({ severeThreshold: parseFloat(e.target.value) || 0 })}
          />
          <span className="rec-settings-row-sub" style={{ marginTop: 0 }}>元</span>
        </div>
      </div>

      {(matchedInvalid || minorInvalid) && (
        <div className="rec-settings-hint" style={{ color: '#d9534f' }}>
          阈值需满足：相符 &lt; 偏差 &lt; 严重
        </div>
      )}

      <h4 className="rec-settings-section-title" style={{ marginTop: 16, fontSize: 'var(--font-size-sm)' }}>
        数据范围
      </h4>

      <div className="rec-settings-row-item">
        <label className="rec-settings-row-main" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            checked={r.includeRefunds}
            onChange={e => set({ includeRefunds: e.target.checked })}
          />
          <span className="rec-settings-row-label">包含退款单</span>
        </label>
      </div>

      <div className="rec-settings-row-item">
        <label className="rec-settings-row-main" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            checked={r.deductShipping}
            onChange={e => set({ deductShipping: e.target.checked })}
          />
          <span className="rec-settings-row-label">抵扣运费</span>
        </label>
      </div>

      <h4 className="rec-settings-section-title" style={{ marginTop: 16, fontSize: 'var(--font-size-sm)' }}>
        匹配策略
      </h4>

      <div style={{ maxWidth: 240 }}>
        <Select
          value={r.matchStrategy}
          options={STRATEGIES}
          onChange={v => set({ matchStrategy: v })}
          width="100%"
        />
      </div>
    </div>
  )
}
