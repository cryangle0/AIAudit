import { fmtMoney, fmtNumber } from '../utils/format.js'
import './KpiCards.css'

export default function KpiCards({ kpi, captionText }) {
  if (!kpi) return null
  const cards = [
    { label: '总订单', value: fmtNumber(kpi.totalOrders), tone: 'neutral' },
    { label: '营收（平台口径）', value: fmtMoney(kpi.revenue), tone: 'neutral' },
    { label: '成本', value: fmtMoney(kpi.cost), tone: 'neutral' },
    { label: '真实利润', value: fmtMoney(kpi.realProfit), tone: kpi.realProfit >= 0 ? 'good' : 'bad' },
    { label: `差异 / 异常`, value: `${kpi.diffCount} 单`, tone: kpi.diffCount > 0 ? 'warn' : 'good',
      sub: `重复 ${kpi.duplicatedCount} · 缺失 ${kpi.missingCount} · 利润异常 ${kpi.anomalyCount}` }
  ]
  return (
    <div className="rec-kpi-wrap">
      <div className="rec-kpi-caption">{captionText || '数据口径：平台账单（含退款负单）'}</div>
      <div className="rec-kpi-grid">
        {cards.map((c, i) => (
          <div key={i} className={`rec-kpi-card tone-${c.tone}`}>
            <div className="rec-kpi-label">{c.label}</div>
            <div className="rec-kpi-value">{c.value}</div>
            {c.sub && <div className="rec-kpi-sub">{c.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
