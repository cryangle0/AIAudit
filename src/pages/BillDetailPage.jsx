// 账单明细表 — 流水级

import { useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { fmtMoney } from '../utils/format.js'
import { buildBillDetail } from '../core/reportBuilder.js'
import './pages.css'

export default function BillDetailPage({ reconcileResult, shopName, period }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const rows = useMemo(() => {
    if (!reconcileResult) return []
    return buildBillDetail({ reconcileResult, shopName, period })
  }, [reconcileResult, shopName, period])

  if (!reconcileResult) return <Empty/>

  let filtered = rows
  if (typeFilter) filtered = filtered.filter(r => r.accountType === typeFilter)
  if (search) filtered = filtered.filter(r =>
    (r.docNo || '').includes(search) || (r.orderId || '').includes(search))
  const visible = filtered.slice(0, 500)

  const totals = filtered.reduce((acc, r) => {
    acc.billAmount += r.billAmount
    acc.writeoffAmount += r.writeoffAmount
    return acc
  }, { billAmount: 0, writeoffAmount: 0 })

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>账单明细表</h2>
        <div className="rec-page-sub">
          明细维度-单据级。期初结余 → 本期账单 → 本期核销 → 期末结余（金额）。
        </div>
      </div>

      <div className="rec-toolbar">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="rec-input">
          <option value="">全部账务类型</option>
          <option value="收入项">收入项</option>
          <option value="支出项">支出项</option>
        </select>
        <input className="rec-input" placeholder="搜索 单据号/订单号"
          value={search} onChange={e => setSearch(e.target.value)}/>
        <span className="rec-spacer"/>
        <span className="rec-muted">{filtered.length} 条{filtered.length > 500 ? '（仅显示前 500）' : ''}</span>
      </div>

      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr>
              <th>期间</th><th>店铺</th><th>账务类型</th><th>业务类型</th>
              <th>单据号</th><th>关联订单</th><th>本期账单</th><th>本期核销</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr key={`${r.docNo}|${i}`}>
                <td>{r.period}</td>
                <td>{r.shop}</td>
                <td><span className={r.accountType === '收入项' ? 'rec-tag-pos' : 'rec-tag-neg'}>{r.accountType}</span></td>
                <td>{r.businessType}</td>
                <td className="mono">{r.docNo}</td>
                <td className="mono">{r.orderId}</td>
                <td className={r.billAmount < 0 ? 'neg' : 'pos'}>{fmtMoney(r.billAmount)}</td>
                <td>{fmtMoney(r.writeoffAmount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6}><strong>合计 ({filtered.length} 条)</strong></td>
              <td className={totals.billAmount < 0 ? 'neg' : 'pos'}>{fmtMoney(totals.billAmount)}</td>
              <td>{fmtMoney(totals.writeoffAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function Empty() {
  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>账单明细表</h2>
      </div>
      <div className="rec-placeholder">
        <AlertCircle size={28}/>
        <h3>请先完成对账</h3>
        <p>到「差异分析表」上传账单并对账后自动生成本表。</p>
      </div>
    </div>
  )
}
