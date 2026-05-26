// 应收明细表 — 订单级

import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { fmtMoney, fmtNumber } from '../utils/format.js'
import { buildRecvDetail } from '../core/reportBuilder.js'
import { DEMO_RECV_DETAIL } from '../core/demoData.js'
import PageHeader from '../components/common/PageHeader.jsx'
import './pages.css'

export default function RecvDetailPage({ reconcileResult, shopName, period }) {
  const [search, setSearch] = useState('')
  const [useDemo, setUseDemo] = useState(false)

  const realRows = useMemo(() => {
    if (!reconcileResult) return []
    return buildRecvDetail({ reconcileResult, shopName, period })
  }, [reconcileResult, shopName, period])

  const showDemo = !reconcileResult || useDemo
  const baseRows = showDemo ? DEMO_RECV_DETAIL : realRows
  const filtered = search
    ? baseRows.filter(r => r.orderId?.includes(search) || r.styleCode?.includes(search))
    : baseRows
  const visible = filtered.slice(0, 500)

  const totals = filtered.reduce((acc, r) => ({
    recvQty: acc.recvQty + r.recvQty, recvAmount: acc.recvAmount + r.recvAmount,
    writeoffQty: acc.writeoffQty + r.writeoffQty, writeoffAmount: acc.writeoffAmount + r.writeoffAmount,
    endQty: acc.endQty + r.endQty, endAmount: acc.endAmount + r.endAmount
  }), { recvQty: 0, recvAmount: 0, writeoffQty: 0, writeoffAmount: 0, endQty: 0, endAmount: 0 })

  return (
    <div className="rec-page">
      <PageHeader title="应收明细表"
        subtitle="明细维度-订单/商品。期初 → 本期应收 → 本期核销 → 期末（数量 + 金额）"/>

      {showDemo && (
        <div className="rec-demo-banner">
          <Sparkles size={14}/>
          <span>当前显示演示数据。</span>
          {!reconcileResult ? <span>完成对账后将生成真实数据。</span>
            : <button className="rec-link-btn" onClick={() => setUseDemo(false)}>切换到真实数据</button>}
        </div>
      )}

      <div className="rec-toolbar">
        <input className="rec-input" placeholder="搜索 订单号/款式编码"
          value={search} onChange={e => setSearch(e.target.value)}/>
        <span className="rec-spacer"/>
        {!showDemo && reconcileResult && (
          <button className="rec-btn" onClick={() => setUseDemo(true)}>
            <Sparkles size={14}/> 查看演示数据
          </button>
        )}
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
