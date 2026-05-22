// 应收明细表 — 订单级

import { useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { fmtMoney, fmtNumber } from '../utils/format.js'
import { buildRecvDetail } from '../core/reportBuilder.js'
import './pages.css'

export default function RecvDetailPage({ reconcileResult, shopName, period }) {
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    if (!reconcileResult) return []
    return buildRecvDetail({ reconcileResult, shopName, period })
  }, [reconcileResult, shopName, period])

  if (!reconcileResult) {
    return <Empty/>
  }

  const filtered = search
    ? rows.filter(r => r.orderId?.includes(search) || r.styleCode?.includes(search))
    : rows
  const visible = filtered.slice(0, 500)

  const totals = filtered.reduce((acc, r) => {
    acc.recvQty += r.recvQty; acc.recvAmount += r.recvAmount
    acc.writeoffQty += r.writeoffQty; acc.writeoffAmount += r.writeoffAmount
    acc.endQty += r.endQty; acc.endAmount += r.endAmount
    return acc
  }, { recvQty: 0, recvAmount: 0, writeoffQty: 0, writeoffAmount: 0, endQty: 0, endAmount: 0 })

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>应收明细表</h2>
        <div className="rec-page-sub">
          明细维度-订单/商品。期初结余 → 本期应收 → 本期核销 → 期末结余（数量 + 金额）。
        </div>
      </div>

      <div className="rec-toolbar">
        <input className="rec-input" placeholder="搜索 订单号/款式编码"
          value={search} onChange={e => setSearch(e.target.value)}/>
        <span className="rec-spacer"/>
        <span className="rec-muted">{filtered.length} 条{filtered.length > 500 ? '（仅显示前 500）' : ''}</span>
      </div>

      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr>
              <th>期间</th><th>店铺</th><th>订单号</th><th>款式</th>
              <th>本期应收数量</th><th>本期应收金额</th>
              <th>本期核销数量</th><th>本期核销金额</th>
              <th>期末数量</th><th>期末金额</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(r => (
              <tr key={r.orderId} className={`bucket-${r.bucket}`}>
                <td>{r.period}</td>
                <td>{r.shop}</td>
                <td className="mono">{r.orderId}</td>
                <td className="mono">{r.styleCode}</td>
                <td>{fmtNumber(r.recvQty)}</td>
                <td>{fmtMoney(r.recvAmount)}</td>
                <td>{fmtNumber(r.writeoffQty)}</td>
                <td>{fmtMoney(r.writeoffAmount)}</td>
                <td>{fmtNumber(r.endQty)}</td>
                <td className={r.endAmount > 0 ? 'neg' : ''}>{fmtMoney(r.endAmount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}><strong>合计 ({filtered.length} 条)</strong></td>
              <td>{fmtNumber(totals.recvQty)}</td>
              <td>{fmtMoney(totals.recvAmount)}</td>
              <td>{fmtNumber(totals.writeoffQty)}</td>
              <td>{fmtMoney(totals.writeoffAmount)}</td>
              <td>{fmtNumber(totals.endQty)}</td>
              <td className={totals.endAmount > 0 ? 'neg' : ''}>{fmtMoney(totals.endAmount)}</td>
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
        <h2>应收明细表</h2>
      </div>
      <div className="rec-placeholder">
        <AlertCircle size={28}/>
        <h3>请先完成对账</h3>
        <p>到「差异分析表」上传账单并对账后自动生成本表。</p>
      </div>
    </div>
  )
}
