import { useState, useMemo } from 'react'
import { MessageSquare } from 'lucide-react'
import { fmtMoney } from '../utils/format.js'
import DiffDrawer from './DiffDrawer.jsx'
import './DiffTable.css'

const FILTERS = [
  { id: 'all', label: '全部' },
  { id: 'matched', label: '一致' },
  { id: 'duplicated', label: '金额翻倍' },
  { id: 'missing_in_jst', label: '聚水潭缺失' },
  { id: 'missing_in_platform', label: '平台缺失' },
  { id: 'profit_anomaly', label: '利润异常' }
]

const BUCKET_LABEL = {
  matched: '一致', duplicated: '翻倍',
  missing_in_jst: '聚水潭缺', missing_in_platform: '平台缺',
  profit_anomaly: '利润异常'
}

export default function DiffTable({ rows }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(null)

  const filtered = useMemo(() => {
    let r = filter === 'all' ? rows : rows.filter(x => x.bucket === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      r = r.filter(x => x.orderId?.toLowerCase().includes(q) || x.styleCode?.toLowerCase().includes(q))
    }
    return r
  }, [rows, filter, search])

  // 默认非匹配优先显示
  const sorted = useMemo(() => {
    const order = { profit_anomaly: 0, duplicated: 1, missing_in_jst: 2, missing_in_platform: 3, matched: 4 }
    return [...filtered].sort((a, b) => (order[a.bucket] ?? 9) - (order[b.bucket] ?? 9))
  }, [filtered])

  // 仅渲染前 500 行（保护浏览器；用户可以筛选）
  const visible = sorted.slice(0, 500)

  return (
    <div className="rec-difftable">
      <div className="rec-difftable-toolbar">
        {FILTERS.map(f => (
          <button key={f.id}
            className={`rec-pill ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
        <input
          className="rec-search"
          placeholder="搜索订单号/款式编码"
          value={search} onChange={e => setSearch(e.target.value)}/>
        <span className="rec-count">{filtered.length} 单{filtered.length > 500 ? '（仅显示前 500）' : ''}</span>
      </div>
      <div className="rec-difftable-scroll">
        <table>
          <thead>
            <tr>
              <th></th><th>订单号</th><th>款式</th>
              <th>销售收入</th><th>净入账</th><th>成本</th>
              <th>真实利润</th><th>系统毛利</th><th>毛利差</th>
              <th>状态</th><th>AI</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(r => (
              <tr key={r.orderId} className={`bucket-${r.bucket}`} onClick={() => setOpen(r)}>
                <td>{r.bucket === 'matched' ? '✓' : '!'}</td>
                <td className="mono">{r.orderId}</td>
                <td>{r.styleCode || '—'}</td>
                <td>{fmtMoney(r.saleRevenue)}</td>
                <td>{fmtMoney(r.netSettled)}</td>
                <td>{fmtMoney(r.shippedCost)}</td>
                <td className={r.realProfit < 0 ? 'neg' : ''}>{fmtMoney(r.realProfit)}</td>
                <td>{fmtMoney(r.systemProfit)}</td>
                <td className={r.profitDiff < 0 ? 'neg' : ''}>{fmtMoney(r.profitDiff)}</td>
                <td><span className={`badge bk-${r.bucket}`}>{BUCKET_LABEL[r.bucket]}</span></td>
                <td title={r.aiHint || ''}>
                  {r.aiHint ? <MessageSquare size={14}/> : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <div className="rec-empty">本筛选条件下没有订单</div>}
      </div>
      <DiffDrawer row={open} onClose={() => setOpen(null)}/>
    </div>
  )
}
