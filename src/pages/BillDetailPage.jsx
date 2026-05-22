// 账单明细表 — 严格按客户《系统初稿模板5.22》Excel 表头
// 列：平台 | 店铺 | 订单号 | 款式编码 | 收入项(4) | 支出项(5)

import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { fmtMoney } from '../utils/format.js'
import { buildBillDetailFromReconcile } from '../core/reportBuilder.js'
import { DEMO_BILL_DETAIL } from '../core/demoData.js'
import './pages.css'

export default function BillDetailPage({ reconcileResult, shopName, platformName, period }) {
  const [search, setSearch] = useState('')
  const [useDemo, setUseDemo] = useState(false)

  const realRows = useMemo(() => {
    if (!reconcileResult) return []
    return buildBillDetailFromReconcile({ reconcileResult, shopName, platformName })
  }, [reconcileResult, shopName, platformName])

  const showDemo = !reconcileResult || useDemo
  const baseRows = showDemo ? DEMO_BILL_DETAIL : realRows
  const filtered = search
    ? baseRows.filter(r => (r.orderId || '').includes(search) || (r.styleCode || '').includes(search))
    : baseRows
  const visible = filtered.slice(0, 500)

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>{period ? `${period.split('-')[1]}月店铺账单明细表` : '店铺账单明细表'}</h2>
        <div className="rec-page-sub">
          按客户模板表头：平台 / 店铺 / 订单号 / 款式编码 / 收入项 / 支出项
        </div>
      </div>

      {showDemo && (
        <div className="rec-demo-banner">
          <Sparkles size={14}/> 当前显示演示数据。
          {!reconcileResult ? '完成对账后将生成真实数据。' :
            <button className="rec-link-btn" onClick={() => setUseDemo(false)}>切换到真实数据</button>}
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
              <th rowSpan={2}>平台</th>
              <th rowSpan={2}>店铺</th>
              <th rowSpan={2}>订单号</th>
              <th rowSpan={2}>款式编码</th>
              <th colSpan={4} className="rec-grouped-h-pos">收入项</th>
              <th colSpan={6} className="rec-grouped-h-neg">支出项</th>
            </tr>
            <tr>
              <th>订单收入</th><th>花呗交易</th><th>技术服务费/保证金退款</th><th>收入合计</th>
              <th>平台服务费</th><th>积分/佣金/淘宝客</th><th>天猫保证金/理赔/其它</th>
              <th>转账</th><th>提现</th><th>支出合计</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr key={i}>
                <td>{r.platform}</td>
                <td>{r.shop}</td>
                <td className="mono">{r.orderId}</td>
                <td className="mono">{r.styleCode}</td>
                <td>{fmtMoney(r.orderIncome)}</td>
                <td>{fmtMoney(r.huabei)}</td>
                <td>{fmtMoney(r.techRefund)}</td>
                <td className="pos"><strong>{fmtMoney(r.incomeTotal)}</strong></td>
                <td>{fmtMoney(r.platformFee)}</td>
                <td>{fmtMoney(r.commission)}</td>
                <td>{fmtMoney(r.tmallDeposit)}</td>
                <td>{fmtMoney(r.transfer)}</td>
                <td>{fmtMoney(r.withdraw)}</td>
                <td className="neg"><strong>{fmtMoney(r.expenseTotal)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
