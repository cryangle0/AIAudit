import { useMemo, useState } from 'react'
import { fmtMoney, fmtNumber, fmtPct } from '../utils/format.js'
import './SkuProfitTab.css'

export default function SkuProfitTab({ result }) {
  const [sortKey, setSortKey] = useState('profit')
  const [filter, setFilter] = useState('all')

  const items = useMemo(() => {
    if (!result) return []
    let arr = [...result.skuStats]
    if (filter === 'positive') arr = arr.filter(s => s.profit > 0)
    if (filter === 'negative') arr = arr.filter(s => s.profit <= 0)
    arr.sort((a, b) => b[sortKey] - a[sortKey])
    return arr
  }, [result, sortKey, filter])

  if (!result) {
    return <div className="rec-sku-empty">先在「对账明细」上传文件并完成对账</div>
  }

  const totals = items.reduce((acc, s) => {
    acc.qty += s.qty; acc.revenue += s.revenue; acc.cost += s.cost; acc.profit += s.profit
    return acc
  }, { qty: 0, revenue: 0, cost: 0, profit: 0 })
  const maxProfit = Math.max(...items.map(s => Math.abs(s.profit)), 1)

  return (
    <div className="rec-sku-tab">
      <div className="rec-sku-toolbar">
        <span>排序：</span>
        {['profit', 'qty', 'profitRate'].map(k => (
          <button key={k} className={`rec-pill ${sortKey === k ? 'active' : ''}`}
            onClick={() => setSortKey(k)}>
            {k === 'profit' ? '按毛利↓' : k === 'qty' ? '按销量↓' : '按毛利率↓'}
          </button>
        ))}
        <span style={{ marginLeft: 24 }}>显示：</span>
        {[['all', '全部'], ['positive', '盈利'], ['negative', '亏损/0']].map(([k, l]) => (
          <button key={k} className={`rec-pill ${filter === k ? 'active' : ''}`}
            onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      <div className="rec-sku-caption">数据口径：聚水潭（退款抵销后净额，与销售汇总对齐）</div>

      <div className="rec-sku-table-wrap">
        <table className="rec-sku-table">
          <thead>
            <tr><th>款式编码</th><th>件数</th><th>营收</th><th>成本</th>
              <th>真实毛利</th><th>毛利率</th><th>占比柱</th></tr>
          </thead>
          <tbody>
            {items.map(s => {
              const w = (Math.abs(s.profit) / maxProfit) * 100
              return (
                <tr key={s.styleCode}>
                  <td className="mono">{s.styleCode}</td>
                  <td>{fmtNumber(s.qty)}</td>
                  <td>{fmtMoney(s.revenue)}</td>
                  <td>{fmtMoney(s.cost)}</td>
                  <td className={s.profit < 0 ? 'neg' : 'pos'}>{fmtMoney(s.profit)}</td>
                  <td>{fmtPct(s.profitRate)}</td>
                  <td><div className="rec-sku-bar" style={{ width: `${w}%`,
                    background: s.profit < 0 ? '#d23a3a' : '#2f9d68' }}/></td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>总计</strong></td>
              <td>{fmtNumber(totals.qty)}</td>
              <td>{fmtMoney(totals.revenue)}</td>
              <td>{fmtMoney(totals.cost)}</td>
              <td>{fmtMoney(totals.profit)}</td>
              <td>{fmtPct(totals.revenue ? totals.profit / totals.revenue : 0)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
