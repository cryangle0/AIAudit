// 账单汇总表 — 严格按客户《系统初稿模板5.22》Excel 表头
// 列：平台 | 店铺 | 月初余额 | 收入项(订单收入·花呗交易·技术服务费/保证金退款·收入合计)
//   | 支出项(平台服务费·积分/佣金/淘宝客·天猫保证金/理赔/其它·转账·提现·支出合计) | 月末余额

import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { fmtMoney } from '../utils/format.js'
import { buildBillSummaryFromReconcile } from '../core/reportBuilder.js'
import { DEMO_BILL_SUMMARY } from '../core/demoData.js'
import './pages.css'

export default function BillSummaryPage({ reconcileResult, shopName, platformName, period }) {
  const [useDemo, setUseDemo] = useState(false)

  const realRows = useMemo(() => {
    if (!reconcileResult) return []
    return buildBillSummaryFromReconcile({ reconcileResult, shopName, platformName })
  }, [reconcileResult, shopName, platformName])

  const showDemo = !reconcileResult || useDemo
  const rows = showDemo ? DEMO_BILL_SUMMARY : realRows

  const totals = rows.reduce((a, r) => ({
    openBalance: a.openBalance + r.openBalance,
    orderIncome: a.orderIncome + r.orderIncome,
    huabei: a.huabei + r.huabei,
    techRefund: a.techRefund + r.techRefund,
    incomeTotal: a.incomeTotal + r.incomeTotal,
    platformFee: a.platformFee + r.platformFee,
    commission: a.commission + r.commission,
    tmallDeposit: a.tmallDeposit + r.tmallDeposit,
    transfer: a.transfer + r.transfer,
    withdraw: a.withdraw + r.withdraw,
    expenseTotal: a.expenseTotal + r.expenseTotal,
    endBalance: a.endBalance + r.endBalance
  }), { openBalance: 0, orderIncome: 0, huabei: 0, techRefund: 0, incomeTotal: 0,
       platformFee: 0, commission: 0, tmallDeposit: 0, transfer: 0, withdraw: 0,
       expenseTotal: 0, endBalance: 0 })

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>{period ? `${period.split('-')[1]}月店铺账单汇总表` : '店铺账单汇总表'}</h2>
        <div className="rec-page-sub">
          按客户模板表头：平台 / 店铺 / 月初余额 / 收入项（订单收入·花呗交易·技术服务费/保证金退款·收入合计）/
          支出项（平台服务费·积分/佣金/淘宝客·天猫保证金/理赔/其它·转账·提现·支出合计）/ 月末余额
        </div>
      </div>

      {showDemo && (
        <div className="rec-demo-banner">
          <Sparkles size={14}/> 当前显示演示数据（按客户模板典型形态）。
          {!reconcileResult ? '完成对账后将生成真实数据。' :
            <button className="rec-link-btn" onClick={() => setUseDemo(false)}>切换到真实数据</button>}
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
              <th rowSpan={2}>平台</th>
              <th rowSpan={2}>店铺</th>
              <th rowSpan={2}>月初余额</th>
              <th colSpan={4} className="rec-grouped-h-pos">收入项</th>
              <th colSpan={6} className="rec-grouped-h-neg">支出项</th>
              <th rowSpan={2}>月末余额</th>
            </tr>
            <tr>
              <th>订单收入</th>
              <th>花呗交易</th>
              <th>技术服务费/保证金退款</th>
              <th>收入合计</th>
              <th>平台服务费</th>
              <th>积分/佣金/淘宝客</th>
              <th>天猫保证金/理赔/其它</th>
              <th>转账</th>
              <th>提现</th>
              <th>支出合计</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.platform}</td>
                <td>{r.shop}</td>
                <td>{fmtMoney(r.openBalance)}</td>
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
                <td><strong>{fmtMoney(r.endBalance)}</strong></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}><strong>合计</strong></td>
              <td>{fmtMoney(totals.openBalance)}</td>
              <td>{fmtMoney(totals.orderIncome)}</td>
              <td>{fmtMoney(totals.huabei)}</td>
              <td>{fmtMoney(totals.techRefund)}</td>
              <td className="pos">{fmtMoney(totals.incomeTotal)}</td>
              <td>{fmtMoney(totals.platformFee)}</td>
              <td>{fmtMoney(totals.commission)}</td>
              <td>{fmtMoney(totals.tmallDeposit)}</td>
              <td>{fmtMoney(totals.transfer)}</td>
              <td>{fmtMoney(totals.withdraw)}</td>
              <td className="neg">{fmtMoney(totals.expenseTotal)}</td>
              <td>{fmtMoney(totals.endBalance)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
