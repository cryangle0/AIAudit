// 利润分析表 — 多维度（部门/平台/品类/店铺/商品）

import { useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { fmtMoney, fmtNumber, fmtPct } from '../utils/format.js'
import { runAllocation } from '../core/allocate.js'
import { buildProfitAnalyze } from '../core/reportBuilder.js'
import './pages.css'

const DIMENSIONS = [
  { id: 'sku', label: '商品' },
  { id: 'byShop', label: '店铺' },
  { id: 'byPlatform', label: '平台' },
  { id: 'byCategory', label: '品类' }
]

export default function ProfitAnalyzePage({
  reconcileResult, feeRecords, allocStandards, costItems, period, platformId, shopName
}) {
  const [dim, setDim] = useState('sku')

  const data = useMemo(() => {
    if (!reconcileResult) return null
    const allocResult = runAllocation({
      feeRecords, standards: allocStandards, reconcileResult, period
    })
    return buildProfitAnalyze({
      reconcileResult, allocResult, costItems, shopName, platformId, period
    })
  }, [reconcileResult, feeRecords, allocStandards, costItems, period, platformId, shopName])

  if (!reconcileResult) {
    return (
      <div className="rec-page">
        <div className="rec-page-head">
          <h2>利润分析表</h2>
          <div className="rec-page-sub">多维度利润分析：部门/平台/品类/店铺/商品。</div>
        </div>
        <div className="rec-placeholder">
          <AlertCircle size={28}/>
          <h3>请先完成对账</h3>
          <p>到「差异分析表」上传账单并对账，再到「数据归集」录入本期费用，即可生成多维度利润分析。</p>
        </div>
      </div>
    )
  }

  const rows = dim === 'sku'
    ? data.sku
    : data[dim]
  const totals = rows.reduce((acc, r) => {
    acc.qty += r.qty || 0; acc.revenue += r.revenue
    acc.cost += r.cost; acc.fee += r.fee; acc.profit += r.profit
    return acc
  }, { qty: 0, revenue: 0, cost: 0, fee: 0, profit: 0 })

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>利润分析表</h2>
        <div className="rec-page-sub">
          多维度利润分析。利润 = 销售收入 − 参考成本 − 分配费用。
          参考成本优先取自维护商品成本，分配费用来自分配引擎。
        </div>
      </div>

      <div className="rec-kpi-grid rec-kpi-grid-4">
        <div className="rec-kpi-card tone-neutral">
          <div className="rec-kpi-label">销售收入</div>
          <div className="rec-kpi-value">{fmtMoney(totals.revenue)}</div>
        </div>
        <div className="rec-kpi-card tone-neutral">
          <div className="rec-kpi-label">参考成本</div>
          <div className="rec-kpi-value">{fmtMoney(totals.cost)}</div>
        </div>
        <div className="rec-kpi-card tone-neutral">
          <div className="rec-kpi-label">分配费用</div>
          <div className="rec-kpi-value">{fmtMoney(totals.fee)}</div>
        </div>
        <div className={`rec-kpi-card tone-${totals.profit >= 0 ? 'good' : 'bad'}`}>
          <div className="rec-kpi-label">利润</div>
          <div className="rec-kpi-value">{fmtMoney(totals.profit)}</div>
          <div className="rec-kpi-sub">毛利率 {fmtPct(totals.revenue ? totals.profit / totals.revenue : 0)}</div>
        </div>
      </div>

      <div className="rec-toolbar">
        <span>分析维度：</span>
        {DIMENSIONS.map(d => (
          <button key={d.id} className={`rec-pill ${dim === d.id ? 'active' : ''}`}
            onClick={() => setDim(d.id)}>{d.label}</button>
        ))}
      </div>

      <div className="rec-table-card">
        <table className="rec-data-table">
          {dim === 'sku' ? (
            <>
              <thead>
                <tr><th>款式编码</th><th>商品名称</th><th>件数</th><th>销售收入</th>
                  <th>参考成本</th><th>分配费用</th><th>利润</th><th>毛利率</th></tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.styleCode}>
                    <td className="mono">{r.styleCode}</td>
                    <td>{r.productName || '—'}</td>
                    <td>{fmtNumber(r.qty)}</td>
                    <td>{fmtMoney(r.revenue)}</td>
                    <td>{fmtMoney(r.cost)}</td>
                    <td>{fmtMoney(r.fee)}</td>
                    <td className={r.profit < 0 ? 'neg' : 'pos'}>{fmtMoney(r.profit)}</td>
                    <td>{fmtPct(r.profitRate)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}><strong>合计</strong></td>
                  <td>{fmtNumber(totals.qty)}</td>
                  <td>{fmtMoney(totals.revenue)}</td>
                  <td>{fmtMoney(totals.cost)}</td>
                  <td>{fmtMoney(totals.fee)}</td>
                  <td className={totals.profit < 0 ? 'neg' : 'pos'}>{fmtMoney(totals.profit)}</td>
                  <td>{fmtPct(totals.revenue ? totals.profit / totals.revenue : 0)}</td>
                </tr>
              </tfoot>
            </>
          ) : (
            <>
              <thead>
                <tr><th>维度值</th><th>件数</th><th>销售收入</th>
                  <th>参考成本</th><th>分配费用</th><th>利润</th><th>毛利率</th></tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.key}>
                    <td className="mono">{r.key}</td>
                    <td>{fmtNumber(r.qty)}</td>
                    <td>{fmtMoney(r.revenue)}</td>
                    <td>{fmtMoney(r.cost)}</td>
                    <td>{fmtMoney(r.fee)}</td>
                    <td className={r.profit < 0 ? 'neg' : 'pos'}>{fmtMoney(r.profit)}</td>
                    <td>{fmtPct(r.profitRate)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>合计</strong></td>
                  <td>{fmtNumber(totals.qty)}</td>
                  <td>{fmtMoney(totals.revenue)}</td>
                  <td>{fmtMoney(totals.cost)}</td>
                  <td>{fmtMoney(totals.fee)}</td>
                  <td className={totals.profit < 0 ? 'neg' : 'pos'}>{fmtMoney(totals.profit)}</td>
                  <td>{fmtPct(totals.revenue ? totals.profit / totals.revenue : 0)}</td>
                </tr>
              </tfoot>
            </>
          )}
        </table>
      </div>
    </div>
  )
}
