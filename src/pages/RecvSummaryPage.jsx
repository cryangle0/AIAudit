// 应收汇总表 — 店铺/商品维度
// 期初+应收+核销+期末（数量+金额）

import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { fmtMoney, fmtNumber } from '../utils/format.js'
import { buildRecvSummary } from '../core/reportBuilder.js'
import { DEMO_RECV_SUMMARY } from '../core/demoData.js'
import PageHeader from '../components/common/PageHeader.jsx'
import './pages.css'

export default function RecvSummaryPage({ reconcileResult, shopName }) {
  const [useDemo, setUseDemo] = useState(false)

  const realRows = useMemo(() => {
    if (!reconcileResult) return []
    return buildRecvSummary({ reconcileResult, shopName })
  }, [reconcileResult, shopName])

  const showDemo = !reconcileResult || useDemo
  const rows = showDemo ? DEMO_RECV_SUMMARY : realRows

  const totals = rows.reduce((acc, r) => ({
    openQty: acc.openQty + r.openQty, openAmount: acc.openAmount + r.openAmount,
    recvQty: acc.recvQty + r.recvQty, recvAmount: acc.recvAmount + r.recvAmount,
    writeoffQty: acc.writeoffQty + r.writeoffQty, writeoffAmount: acc.writeoffAmount + r.writeoffAmount,
    endQty: acc.endQty + r.endQty, endAmount: acc.endAmount + r.endAmount
  }), { openQty: 0, openAmount: 0, recvQty: 0, recvAmount: 0,
       writeoffQty: 0, writeoffAmount: 0, endQty: 0, endAmount: 0 })

  return (
    <div className="rec-page">
      <PageHeader title="应收汇总表"
        subtitle="汇总维度-店铺/商品。期初结余 → 本期应收 → 本期核销 → 期末结余（数量 + 金额）"/>

      {showDemo && (
        <div className="rec-demo-banner">
          <Sparkles size={14}/>
          <span>当前显示演示数据（按客户模板典型形态）。</span>
          {!reconcileResult ? <span>完成对账后将生成真实数据。</span>
            : <button className="rec-link-btn" onClick={() => setUseDemo(false)}>切换到真实数据</button>}
        </div>
      )}

      {!showDemo && reconcileResult && (
        <div className="rec-toolbar">
          <span className="rec-spacer"/>
          <button className="rec-btn" onClick={() => setUseDemo(true)}>
            <Sparkles size={14}/> 查看演示数据
          </button>
        </div>
      )}

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
            {rows.map((r, i) => (
              <tr key={i}>
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
