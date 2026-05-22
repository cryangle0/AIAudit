// 商品利润表（报表中心 → 商品利润）
// 严格按客户模板字段：店铺/商品 / 扣税收入 / 参考成本 / 分配费用 / 利润
// 当前阶段：基于聚水潭+商品成本表，用销售净收入作扣税收入近似，分配费用暂留 0
// 月度趋势 + 关键指标卡（对应模板"智能分析区域"）

import { useMemo, useState } from 'react'
import { fmtMoney, fmtNumber, fmtPct } from '../utils/format.js'
import { findCost } from '../hooks/useProductCost.js'
import './pages.css'

export default function ProductProfitPage({ result, costItems, currentPeriod }) {
  const [sortKey, setSortKey] = useState('profit')
  const [filter, setFilter] = useState('all')

  const items = useMemo(() => {
    if (!result) return []
    return result.skuStats.map(s => {
      const customCost = findCost(costItems || [], currentPeriod, s.styleCode, null)
      const refCost = customCost
        ? (Number(customCost.baseCost || 0) + Number(customCost.tagFee || 0) + Number(customCost.accessoryFee || 0)) * (s.qty || 0)
        : s.cost
      const taxedRevenue = s.revenue                  // 扣税收入：当前用聚水潭实发金额近似
      const allocatedFee = 0                          // 分配费用：待"数据分配"模块实现后填入
      const profit = taxedRevenue - refCost - allocatedFee
      return {
        ...s,
        taxedRevenue,
        refCost,
        costSource: customCost ? 'custom' : 'jushuitan',
        allocatedFee,
        profit,
        profitRate: taxedRevenue ? profit / taxedRevenue : 0
      }
    })
  }, [result, costItems, currentPeriod])

  const filtered = useMemo(() => {
    let arr = [...items]
    if (filter === 'positive') arr = arr.filter(s => s.profit > 0)
    if (filter === 'negative') arr = arr.filter(s => s.profit <= 0)
    arr.sort((a, b) => b[sortKey] - a[sortKey])
    return arr
  }, [items, sortKey, filter])

  if (!result) {
    return <div className="rec-page"><div className="rec-page-head"><h2>商品利润表</h2>
      <div className="rec-page-sub">先在「差异分析」页上传账单完成对账</div>
    </div></div>
  }

  const totals = filtered.reduce((acc, s) => {
    acc.qty += s.qty; acc.taxedRevenue += s.taxedRevenue
    acc.refCost += s.refCost; acc.allocatedFee += s.allocatedFee; acc.profit += s.profit
    return acc
  }, { qty: 0, taxedRevenue: 0, refCost: 0, allocatedFee: 0, profit: 0 })
  const maxProfit = Math.max(...filtered.map(s => Math.abs(s.profit)), 1)

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>商品利润表</h2>
        <div className="rec-page-sub">
          汇总维度：店铺/商品。字段：扣税收入、参考成本、分配费用、利润。
          参考成本优先取「商品成本」自维护数据，缺失时回落到聚水潭实发成本。
        </div>
      </div>

      <div className="rec-kpi-grid rec-kpi-grid-4">
        <div className="rec-kpi-card tone-neutral">
          <div className="rec-kpi-label">总销量</div>
          <div className="rec-kpi-value">{fmtNumber(totals.qty)}</div>
        </div>
        <div className="rec-kpi-card tone-neutral">
          <div className="rec-kpi-label">扣税收入</div>
          <div className="rec-kpi-value">{fmtMoney(totals.taxedRevenue)}</div>
        </div>
        <div className="rec-kpi-card tone-neutral">
          <div className="rec-kpi-label">参考成本</div>
          <div className="rec-kpi-value">{fmtMoney(totals.refCost)}</div>
        </div>
        <div className={`rec-kpi-card tone-${totals.profit >= 0 ? 'good' : 'bad'}`}>
          <div className="rec-kpi-label">利润</div>
          <div className="rec-kpi-value">{fmtMoney(totals.profit)}</div>
          <div className="rec-kpi-sub">毛利率 {fmtPct(totals.taxedRevenue ? totals.profit / totals.taxedRevenue : 0)}</div>
        </div>
      </div>

      <div className="rec-toolbar">
        <span>排序：</span>
        {[['profit', '利润↓'], ['qty', '销量↓'], ['profitRate', '毛利率↓']].map(([k, l]) => (
          <button key={k} className={`rec-pill ${sortKey === k ? 'active' : ''}`}
            onClick={() => setSortKey(k)}>{l}</button>
        ))}
        <span style={{ marginLeft: 16 }}>显示：</span>
        {[['all', '全部'], ['positive', '盈利'], ['negative', '亏损/0']].map(([k, l]) => (
          <button key={k} className={`rec-pill ${filter === k ? 'active' : ''}`}
            onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr><th>款式编码</th><th>件数</th><th>扣税收入</th><th>参考成本</th>
              <th>分配费用</th><th>利润</th><th>毛利率</th><th>占比</th></tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const w = (Math.abs(s.profit) / maxProfit) * 100
              return (
                <tr key={s.styleCode}>
                  <td className="mono">{s.styleCode}
                    {s.costSource === 'custom' && <span className="rec-tag-mini">自维护</span>}
                  </td>
                  <td>{fmtNumber(s.qty)}</td>
                  <td>{fmtMoney(s.taxedRevenue)}</td>
                  <td>{fmtMoney(s.refCost)}</td>
                  <td>{fmtMoney(s.allocatedFee)}</td>
                  <td className={s.profit < 0 ? 'neg' : 'pos'}>{fmtMoney(s.profit)}</td>
                  <td>{fmtPct(s.profitRate)}</td>
                  <td><div className="rec-bar" style={{ width: `${w}%`,
                    background: s.profit < 0 ? '#d23a3a' : '#2f9d68' }}/></td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>合计</strong></td>
              <td>{fmtNumber(totals.qty)}</td>
              <td>{fmtMoney(totals.taxedRevenue)}</td>
              <td>{fmtMoney(totals.refCost)}</td>
              <td>{fmtMoney(totals.allocatedFee)}</td>
              <td>{fmtMoney(totals.profit)}</td>
              <td>{fmtPct(totals.taxedRevenue ? totals.profit / totals.taxedRevenue : 0)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
