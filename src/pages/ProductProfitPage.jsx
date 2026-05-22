// 商品利润表 — 严格按客户《系统初稿模板5.22》Excel 表头
// 列：店铺名称 | 订单号 | 款式编码 | 商品编码 | 商品名称 | 品类 | 数量 | 单价 |
//   销售金额 | 成本 | 标费 | 辅料 | 毛利润 | 毛利率 | 备注
// + 右侧"智能分析区域"：关键指标卡片 + 月份统计柱形图

import { useMemo, useState } from 'react'
import { Sparkles, TrendingUp, DollarSign, Package } from 'lucide-react'
import { fmtMoney, fmtNumber, fmtPct } from '../utils/format.js'
import { buildProductProfitFromReconcile } from '../core/reportBuilder.js'
import { DEMO_PRODUCT_PROFIT, DEMO_MONTHLY_STATS, DEMO_KEY_METRICS } from '../core/demoData.js'
import './pages.css'

export default function ProductProfitPage({
  reconcileResult, costItems, currentPeriod, feeRecords, allocStandards, shopName
}) {
  const [useDemo, setUseDemo] = useState(false)

  const realRows = useMemo(() => {
    if (!reconcileResult) return []
    return buildProductProfitFromReconcile({
      reconcileResult, costItems, feeRecords, allocStandards, period: currentPeriod, shopName
    })
  }, [reconcileResult, costItems, feeRecords, allocStandards, currentPeriod, shopName])

  const showDemo = !reconcileResult || useDemo
  const rows = showDemo ? DEMO_PRODUCT_PROFIT : realRows

  // 关键指标
  const metrics = useMemo(() => {
    if (showDemo) return DEMO_KEY_METRICS
    return {
      totalQty: rows.reduce((s, r) => s + r.qty, 0),
      totalAmount: rows.reduce((s, r) => s + r.revenue, 0),
      totalCost: rows.reduce((s, r) => s + r.cost + r.tagFee + r.accessoryFee, 0),
      totalProfit: rows.reduce((s, r) => s + r.profit, 0),
      profitRate: (() => {
        const rev = rows.reduce((s, r) => s + r.revenue, 0)
        const profit = rows.reduce((s, r) => s + r.profit, 0)
        return rev ? profit / rev : 0
      })()
    }
  }, [showDemo, rows])

  const monthlyStats = showDemo ? DEMO_MONTHLY_STATS : []
  const maxMonthly = Math.max(...monthlyStats.map(m => m.amount), 1)

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>商品利润表</h2>
        <div className="rec-page-sub">
          按客户模板表头：店铺名称 / 订单号 / 款式编码 / 商品编码 / 商品名称 / 品类 / 数量 / 单价 /
          销售金额 / 成本 / 标费 / 辅料 / 毛利润 / 毛利率 / 备注
        </div>
      </div>

      {showDemo && (
        <div className="rec-demo-banner">
          <Sparkles size={14}/> 当前显示演示数据。
          {!reconcileResult ? '完成对账后将生成真实商品利润数据。' :
            <button className="rec-link-btn" onClick={() => setUseDemo(false)}>切换到真实数据</button>}
        </div>
      )}

      {/* 主表 + 右侧智能分析区双栏布局 */}
      <div className="rec-product-profit-layout">
        {/* 左侧：主表 */}
        <div className="rec-product-profit-main">
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
                  <th>店铺名称</th>
                  <th>订单号</th>
                  <th>款式编码</th>
                  <th>商品编码</th>
                  <th>商品名称</th>
                  <th>品类</th>
                  <th>数量</th>
                  <th>单价</th>
                  <th>销售金额</th>
                  <th>成本</th>
                  <th>标费</th>
                  <th>辅料</th>
                  <th>毛利润</th>
                  <th>毛利率</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 500).map((r, i) => (
                  <tr key={i}>
                    <td>{r.shopName}</td>
                    <td className="mono">{r.orderId}</td>
                    <td className="mono">{r.styleCode}</td>
                    <td className="mono">{r.productCode}</td>
                    <td>{r.productName}</td>
                    <td>{r.category}</td>
                    <td>{fmtNumber(r.qty)}</td>
                    <td>{fmtMoney(r.price)}</td>
                    <td>{fmtMoney(r.revenue)}</td>
                    <td>{fmtMoney(r.cost)}</td>
                    <td>{fmtMoney(r.tagFee)}</td>
                    <td>{fmtMoney(r.accessoryFee)}</td>
                    <td className={r.profit < 0 ? 'neg' : 'pos'}><strong>{fmtMoney(r.profit)}</strong></td>
                    <td>{fmtPct(r.profitRate)}</td>
                    <td className="rec-muted">{r.memo || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 右侧：智能分析区 */}
        <aside className="rec-product-profit-side">
          <div className="rec-side-card">
            <div className="rec-side-card-title">关键指标</div>
            <div className="rec-side-metric">
              <Package size={16}/>
              <div>
                <div className="rec-side-metric-label">总销量</div>
                <div className="rec-side-metric-value">{fmtNumber(metrics.totalQty)}</div>
              </div>
            </div>
            <div className="rec-side-metric">
              <DollarSign size={16}/>
              <div>
                <div className="rec-side-metric-label">总销售金额</div>
                <div className="rec-side-metric-value">{fmtMoney(metrics.totalAmount)}</div>
              </div>
            </div>
            <div className="rec-side-metric">
              <DollarSign size={16}/>
              <div>
                <div className="rec-side-metric-label">总成本</div>
                <div className="rec-side-metric-value">{fmtMoney(metrics.totalCost)}</div>
              </div>
            </div>
            <div className="rec-side-metric">
              <TrendingUp size={16}/>
              <div>
                <div className="rec-side-metric-label">总毛利润</div>
                <div className="rec-side-metric-value rec-side-metric-good">{fmtMoney(metrics.totalProfit)}</div>
              </div>
            </div>
            <div className="rec-side-metric">
              <TrendingUp size={16}/>
              <div>
                <div className="rec-side-metric-label">毛利率</div>
                <div className="rec-side-metric-value rec-side-metric-good">{fmtPct(metrics.profitRate)}</div>
              </div>
            </div>
          </div>

          {monthlyStats.length > 0 && (
            <div className="rec-side-card">
              <div className="rec-side-card-title">全年销售金额</div>
              <div className="rec-monthly-bars">
                {monthlyStats.map(m => (
                  <div key={m.month} className="rec-monthly-bar">
                    <div className="rec-monthly-bar-label">{m.month}</div>
                    <div className="rec-monthly-bar-track">
                      <div className="rec-monthly-bar-fill"
                        style={{ width: `${(m.amount / maxMonthly) * 100}%` }}/>
                    </div>
                    <div className="rec-monthly-bar-value">{fmtMoney(m.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
