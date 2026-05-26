// 汇率维护页 — 严格按客户《汇率规则说明》
// 取值规则: 1月账单 → 取2月1日汇率 → 期间记为该月

import { useMemo, useState } from 'react'
import { Plus, Save, Trash2, RotateCcw, Info } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { CURRENCIES } from '../../core/currency.js'
import { fmtNumber } from '../../utils/format.js'
import '../pages.css'

const FOREIGN = CURRENCIES.filter(c => c.code !== 'CNY')

export default function FxRatesPage({ exchangeRates }) {
  const { rates, updatePeriod, removePeriod, resetDefaults } = exchangeRates
  const [editing, setEditing] = useState(null)

  const periods = useMemo(() => {
    return Object.keys(rates).sort().reverse()
  }, [rates])

  return (
    <div className="rec-page">
      <PageHeader
        title="汇率维护"
        subtitle="海外平台收入按 次月1日 汇率统一换算为人民币。例：1月账单 → 取2月1日汇率"
        extra={
          <>
            <button className="rec-btn" onClick={() => {
              if (confirm('恢复默认汇率？将覆盖你当前的修改。')) resetDefaults()
            }}>
              <RotateCcw size={14}/> 恢复默认
            </button>
            <button className="rec-btn primary" onClick={() => setEditing({
              period: '', rates: Object.fromEntries(FOREIGN.map(c => [c.code, '']))
            })}>
              <Plus size={14}/> 新增期间
            </button>
          </>
        }/>

      <div className="rec-fx-rule-card">
        <Info size={14}/>
        <div>
          <div><strong>取值规则</strong>：固定取账单所属月份的次月1日汇率</div>
          <div><strong>币种范围</strong>：人民币(CNY) / 美元(USD) / 俄罗斯卢布(RUB) / 英镑(GBP)</div>
          <div><strong>异常处理</strong>：若次月1日为节假日，取前一个工作日汇率</div>
        </div>
      </div>

      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr>
              <th>取值期间（次月1日）</th>
              {FOREIGN.map(c => <th key={c.code}>{c.name} ({c.code})<br/><span className="rec-muted" style={{ fontSize: 11 }}>1 {c.code} → CNY</span></th>)}
              <th>更新</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {periods.length === 0 && (
              <tr><td colSpan={FOREIGN.length + 3} className="rec-empty-cell">
                暂无汇率数据。点击「新增期间」开始
              </td></tr>
            )}
            {periods.map(p => {
              const r = rates[p]
              return (
                <tr key={p} onClick={() => setEditing({ period: p, rates: { ...r } })}>
                  <td><strong>{p}</strong></td>
                  {FOREIGN.map(c => (
                    <td key={c.code}>{r?.[c.code] != null ? fmtNumber(r[c.code]) : '—'}</td>
                  ))}
                  <td className="rec-muted">{p}</td>
                  <td>
                    <button className="rec-icon-btn" title="删除"
                      onClick={e => { e.stopPropagation(); if (confirm(`删除 ${p} 汇率？`)) removePeriod(p) }}>
                      <Trash2 size={13}/>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <FxEditDialog
          rec={editing}
          existing={Object.keys(rates)}
          onClose={() => setEditing(null)}
          onSave={(period, periodRates) => {
            updatePeriod(period, periodRates)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function FxEditDialog({ rec, existing, onClose, onSave }) {
  const [period, setPeriod] = useState(rec.period)
  const [vals, setVals] = useState(rec.rates)
  const isNew = !existing.includes(rec.period)
  return (
    <div className="rec-dialog-mask" onClick={onClose}>
      <div className="rec-dialog" onClick={e => e.stopPropagation()}>
        <h3>{isNew ? '新增汇率期间' : `编辑 ${rec.period} 汇率`}</h3>
        <div className="rec-form-grid">
          <label style={{ gridColumn: 'span 2' }}>
            <span>取值期间 (YYYY-MM)</span>
            <input value={period} onChange={e => setPeriod(e.target.value)}
              placeholder="2026-01" disabled={!isNew}/>
            <em>注意填写「次月1日」对应的期间。例如 2026-02 用于 2026-01 月的账单换算。</em>
          </label>
          {FOREIGN.map(c => (
            <label key={c.code}>
              <span>{c.name} ({c.code}) <em>1 {c.code} = ? CNY</em></span>
              <input type="number" step="0.0001" value={vals[c.code] ?? ''}
                onChange={e => setVals({ ...vals, [c.code]: e.target.value })}
                placeholder="例: 7.18"/>
            </label>
          ))}
        </div>
        <div className="rec-dialog-foot">
          <button className="rec-btn" onClick={onClose}>取消</button>
          <button className="rec-btn primary" onClick={() => {
            if (!/^\d{4}-\d{2}$/.test(period)) return alert('期间格式应为 YYYY-MM')
            const cleaned = {}
            for (const c of FOREIGN) {
              const v = Number(vals[c.code])
              if (!Number.isFinite(v) || v <= 0) return alert(`${c.code} 汇率必须为正数`)
              cleaned[c.code] = v
            }
            onSave(period, cleaned)
          }}>
            <Save size={14}/> 保存
          </button>
        </div>
      </div>
    </div>
  )
}
