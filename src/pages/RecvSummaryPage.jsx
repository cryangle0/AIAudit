// 应收汇总表 — 店铺/商品维度，期初+应收+核销+期末（数量+金额）

import { useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import { fmtMoney, fmtNumber } from '../utils/format.js'
import { buildRecvSummary } from '../core/reportBuilder.js'
import './pages.css'

export default function RecvSummaryPage({ reconcileResult, shopName }) {
  const rows = useMemo(() => {
    if (!reconcileResult) return []
    return buildRecvSummary({ reconcileResult, shopName })
  }, [reconcileResult, shopName])

  if (!reconcileResult) {
    return <EmptyState/>
  }

  const totals = rows.reduce((acc, r) => {
    acc.openQty += r.openQty; acc.openAmount += r.openAmount
    acc.recvQty += r.recvQty; acc.recvAmount += r.recvAmount
    acc.writeoffQty += r.writeoffQty; acc.writeoffAmount += r.writeoffAmount
    acc.endQty += r.endQty; acc.endAmount += r.endAmount
    return acc
  }, { openQty: 0, openAmount: 0, recvQty: 0, recvAmount: 0,
       writeoffQty: 0, writeoffAmount: 0, endQty: 0, endAmount: 0 })

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>应收汇总表</h2>
        <div className="rec-page-sub">
          汇总维度-店铺/商品。期初结余 → 本期应收 → 本期核销 → 期末结余（数量 + 金额）。
        </div>
      </div>

      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr>
              <th rowSpan={2}>店铺</th>
              <th rowSpan={2}>款式编码</th>
              <th rowSpan={2}>商品名称</th>
              <th colSpan={2}>期初结余</th>
              <th colSpan={2}>本期应收</th>
              <th colSpan={2}>本期核销</th>
              <th colSpan={2}>期末结余</th>
            </tr>
            <tr>
              <th>数量</th><th>金额</th>
              <th>数量</th><th>金额</th>
              <th>数量</th><th>金额</th>
              <th>数量</th><th>金额</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={`${r.shop}|${r.styleCode}`}>
                <td>{r.shop}</td>
                <td className="mono">{r.styleCode}</td>
                <td>{r.productName}</td>
                <td>{fmtNumber(r.openQty)}</td><td>{fmtMoney(r.openAmount)}</td>
                <td>{fmtNumber(r.recvQty)}</td><td>{fmtMoney(r.recvAmount)}</td>
                <td>{fmtNumber(r.writeoffQty)}</td><td>{fmtMoney(r.writeoffAmount)}</td>
                <td>{fmtNumber(r.endQty)}</td>
                <td className={r.endAmount > 0 ? 'neg' : ''}>{fmtMoney(r.endAmount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}><strong>合计</strong></td>
              <td>{fmtNumber(totals.openQty)}</td><td>{fmtMoney(totals.openAmount)}</td>
              <td>{fmtNumber(totals.recvQty)}</td><td>{fmtMoney(totals.recvAmount)}</td>
              <td>{fmtNumber(totals.writeoffQty)}</td><td>{fmtMoney(totals.writeoffAmount)}</td>
              <td>{fmtNumber(totals.endQty)}</td>
              <td className={totals.endAmount > 0 ? 'neg' : ''}>{fmtMoney(totals.endAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>应收汇总表</h2>
        <div className="rec-page-sub">
          汇总维度-店铺/商品。期初 → 本期应收 → 本期核销 → 期末（数量+金额）。
        </div>
      </div>
      <div className="rec-placeholder">
        <AlertCircle size={28}/>
        <h3>请先完成对账</h3>
        <p>到「差异分析表」上传账单并对账后自动生成本表。</p>
      </div>
    </div>
  )
}
