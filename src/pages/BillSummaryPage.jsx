// 账单汇总表 — 店铺/账务类型/业务类型，仅金额

import { useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import { fmtMoney } from '../utils/format.js'
import { buildBillSummary } from '../core/reportBuilder.js'
import './pages.css'

export default function BillSummaryPage({ reconcileResult, shopName }) {
  const rows = useMemo(() => {
    if (!reconcileResult) return []
    return buildBillSummary({ reconcileResult, shopName })
  }, [reconcileResult, shopName])

  if (!reconcileResult) return <Empty/>

  const totals = rows.reduce((acc, r) => {
    acc.openAmount += r.openAmount
    acc.billAmount += r.billAmount
    acc.writeoffAmount += r.writeoffAmount
    acc.endAmount += r.endAmount
    return acc
  }, { openAmount: 0, billAmount: 0, writeoffAmount: 0, endAmount: 0 })

  // 按账务类型分组
  const incomeRows = rows.filter(r => r.accountType === '收入项')
  const expenseRows = rows.filter(r => r.accountType === '支出项')
  const incomeTotal = incomeRows.reduce((s, r) => s + r.billAmount, 0)
  const expenseTotal = expenseRows.reduce((s, r) => s + r.billAmount, 0)

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>账单汇总表</h2>
        <div className="rec-page-sub">
          汇总维度-店铺/账务类型/业务类型。期初结余 → 本期账单 → 本期核销 → 期末结余（金额）。
        </div>
      </div>

      <div className="rec-kpi-grid rec-kpi-grid-4">
        <div className="rec-kpi-card tone-good">
          <div className="rec-kpi-label">收入项合计</div>
          <div className="rec-kpi-value">{fmtMoney(incomeTotal)}</div>
        </div>
        <div className="rec-kpi-card tone-bad">
          <div className="rec-kpi-label">支出项合计</div>
          <div className="rec-kpi-value">{fmtMoney(expenseTotal)}</div>
        </div>
        <div className={`rec-kpi-card tone-${incomeTotal + expenseTotal >= 0 ? 'good' : 'bad'}`}>
          <div className="rec-kpi-label">净额</div>
          <div className="rec-kpi-value">{fmtMoney(incomeTotal + expenseTotal)}</div>
        </div>
        <div className="rec-kpi-card tone-neutral">
          <div className="rec-kpi-label">流水条数</div>
          <div className="rec-kpi-value">{rows.reduce((s, r) => s + r.count, 0)}</div>
        </div>
      </div>

      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr>
              <th>店铺</th><th>账务类型</th><th>业务类型</th>
              <th>期初结余</th><th>本期账单</th><th>本期核销</th><th>期末结余</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={`${r.shop}|${r.accountType}|${r.businessType}`}>
                <td>{r.shop}</td>
                <td><span className={r.accountType === '收入项' ? 'rec-tag-pos' : 'rec-tag-neg'}>{r.accountType}</span></td>
                <td>{r.businessType}</td>
                <td>{fmtMoney(r.openAmount)}</td>
                <td className={r.billAmount < 0 ? 'neg' : 'pos'}>{fmtMoney(r.billAmount)}</td>
                <td>{fmtMoney(r.writeoffAmount)}</td>
                <td>{fmtMoney(r.endAmount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}><strong>合计</strong></td>
              <td>{fmtMoney(totals.openAmount)}</td>
              <td className={totals.billAmount < 0 ? 'neg' : 'pos'}>{fmtMoney(totals.billAmount)}</td>
              <td>{fmtMoney(totals.writeoffAmount)}</td>
              <td>{fmtMoney(totals.endAmount)}</td>
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
        <h2>账单汇总表</h2>
      </div>
      <div className="rec-placeholder">
        <AlertCircle size={28}/>
        <h3>请先完成对账</h3>
        <p>到「差异分析表」上传账单并对账后自动生成本表。</p>
      </div>
    </div>
  )
}
