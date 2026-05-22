// 数据分配 — 三层分配引擎执行结果
// 显示：原始费用 → 分配标准 → 分配到组织/店铺/订单商品

import { useMemo, useState } from 'react'
import { GitBranch, AlertCircle } from 'lucide-react'
import { fmtMoney, fmtPct } from '../utils/format.js'
import { runAllocation } from '../core/allocate.js'
import './pages.css'

export default function DataAllocatePage({ feeRecords, allocStandards, reconcileResult, period, shopId }) {
  const [view, setView] = useState('detail') // detail | byOrg | byShop | bySku | byOrder

  const result = useMemo(() => {
    if (!reconcileResult) return null
    return runAllocation({
      feeRecords, standards: allocStandards, reconcileResult, period, shopId
    })
  }, [feeRecords, allocStandards, reconcileResult, period, shopId])

  if (!reconcileResult) {
    return (
      <div className="rec-page">
        <div className="rec-page-head">
          <h2>数据分配</h2>
          <div className="rec-page-sub">分配引擎需要对账数据作为分摊基数。</div>
        </div>
        <div className="rec-placeholder">
          <AlertCircle size={28}/>
          <h3>请先完成对账</h3>
          <p>到「差异分析表」上传账单并点击「开始对账」，分配引擎会自动按当期订单数据分摊费用。</p>
        </div>
      </div>
    )
  }

  if (!result || result.allocations.length === 0) {
    return (
      <div className="rec-page">
        <div className="rec-page-head">
          <h2>数据分配</h2>
          <div className="rec-page-sub">三层分配：组织 → 店铺 → 订单商品。</div>
        </div>
        <div className="rec-placeholder">
          <GitBranch size={28}/>
          <h3>暂无可分配的费用</h3>
          <p>请到「数据归集」录入本期 ({period}) 费用记录，并确保「分配标准」覆盖对应费用类型。</p>
        </div>
      </div>
    )
  }

  const { allocations, summary } = result

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>数据分配</h2>
        <div className="rec-page-sub">
          按当期 ({period}) 费用记录 + 分配标准生成的分配明细。每条费用按方式分摊到组织/店铺/订单/商品。
        </div>
      </div>

      <div className="rec-kpi-grid rec-kpi-grid-4">
        <div className="rec-kpi-card tone-neutral">
          <div className="rec-kpi-label">本期费用合计</div>
          <div className="rec-kpi-value">{fmtMoney(summary.totalFees)}</div>
        </div>
        <div className="rec-kpi-card tone-good">
          <div className="rec-kpi-label">已分配</div>
          <div className="rec-kpi-value">{fmtMoney(summary.allocated)}</div>
          <div className="rec-kpi-sub">{fmtPct(summary.totalFees ? summary.allocated / summary.totalFees : 0)}</div>
        </div>
        <div className={`rec-kpi-card tone-${summary.unallocated > 0 ? 'bad' : 'neutral'}`}>
          <div className="rec-kpi-label">未分配</div>
          <div className="rec-kpi-value">{fmtMoney(summary.unallocated)}</div>
          <div className="rec-kpi-sub">{summary.unallocated > 0 ? '请检查分配标准覆盖' : '全部已分配'}</div>
        </div>
        <div className="rec-kpi-card tone-neutral">
          <div className="rec-kpi-label">分配条数</div>
          <div className="rec-kpi-value">{allocations.length}</div>
          <div className="rec-kpi-sub">{summary.bySku.length} 个 SKU 受影响</div>
        </div>
      </div>

      <div className="rec-toolbar">
        <span>视图：</span>
        {[
          ['detail', '分配明细'],
          ['byOrg', '按组织'],
          ['byShop', '按店铺'],
          ['bySku', '按商品'],
          ['byOrder', '按订单']
        ].map(([k, l]) => (
          <button key={k} className={`rec-pill ${view === k ? 'active' : ''}`}
            onClick={() => setView(k)}>{l}</button>
        ))}
      </div>

      {view === 'detail' && <DetailView allocations={allocations}/>}
      {view === 'byOrg' && <RollupView rows={summary.byOrg} keyLabel="组织"/>}
      {view === 'byShop' && <RollupView rows={summary.byShop} keyLabel="店铺"/>}
      {view === 'bySku' && <RollupView rows={summary.bySku} keyLabel="款式编码"/>}
      {view === 'byOrder' && <RollupView rows={summary.byOrder} keyLabel="平台单号"/>}

      {Object.keys(summary.unmatchedReasons).length > 0 && (
        <div className="rec-warn" style={{ marginTop: 12 }}>
          <AlertCircle size={14}/> 未分配原因：
          {Object.entries(summary.unmatchedReasons)
            .map(([k, v]) => `${k} ${fmtMoney(v)}`).join('；')}
        </div>
      )}
    </div>
  )
}

function DetailView({ allocations }) {
  const [search, setSearch] = useState('')
  const filtered = search
    ? allocations.filter(a =>
        (a.platformOrderId || '').includes(search) ||
        (a.styleCode || '').includes(search) ||
        (a.feeType || '').includes(search))
    : allocations
  const visible = filtered.slice(0, 500)
  return (
    <>
      <div className="rec-toolbar">
        <input className="rec-input" placeholder="搜索 订单号/款式/费用类型"
          value={search} onChange={e => setSearch(e.target.value)}/>
        <span className="rec-spacer"/>
        <span className="rec-muted">{filtered.length} 条{filtered.length > 500 ? '（仅显示前 500）' : ''}</span>
      </div>
      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr><th>费用类型</th><th>订单号</th><th>款式编码</th>
              <th>分配金额</th><th>占比</th><th>基数字段</th><th>使用标准</th><th>层级</th></tr>
          </thead>
          <tbody>
            {visible.map(a => (
              <tr key={a.id}>
                <td><span className="rec-tag-fee">{a.feeType}</span></td>
                <td className="mono">{a.platformOrderId || '—'}</td>
                <td className="mono">{a.styleCode || '—'}</td>
                <td><strong>{fmtMoney(a.amount)}</strong></td>
                <td>{fmtPct(a.ratio)}</td>
                <td>{a.basisField}</td>
                <td>{a.standardName}</td>
                <td>{a.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function RollupView({ rows, keyLabel }) {
  const total = rows.reduce((s, r) => s + r.amount, 0)
  const max = Math.max(...rows.map(r => r.amount), 1)
  return (
    <div className="rec-table-card">
      <table className="rec-data-table">
        <thead>
          <tr><th>{keyLabel}</th><th>条数</th><th>分配金额</th><th>占比</th>
            <th>明细 (按费用类型)</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.key}>
              <td className="mono">{r.key}</td>
              <td>{r.count}</td>
              <td><strong>{fmtMoney(r.amount)}</strong>
                <div className="rec-bar"
                  style={{ width: `${(r.amount / max) * 100}%`,
                    background: '#3aaf6b', marginTop: 4 }}/></td>
              <td>{fmtPct(total ? r.amount / total : 0)}</td>
              <td className="rec-muted">
                {Object.entries(r.byFeeType).map(([t, v]) =>
                  <span key={t} style={{ marginRight: 8 }}>{t} {fmtMoney(v)}</span>)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td><strong>合计</strong></td>
            <td>{rows.reduce((s, r) => s + r.count, 0)}</td>
            <td><strong>{fmtMoney(total)}</strong></td>
            <td colSpan={2}></td></tr>
        </tfoot>
      </table>
    </div>
  )
}
