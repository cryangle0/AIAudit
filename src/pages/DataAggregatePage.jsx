// 数据归集 — 费用记录维护
// 严格按客户字段：费用类型 / 组织 / 店铺 / 平台单号 / 费用金额 / 费用日期 / 备注

import { useRef, useState, useMemo } from 'react'
import { Upload, Plus, Trash2, Download, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { FEE_TYPES, ORG_OPTIONS } from '../hooks/useFeeRecords.js'
import { readWorkbook } from '../utils/excel.js'
import { fmtMoney } from '../utils/format.js'
import { PLATFORMS, MOCK_SHOPS } from '../platforms/index.js'
import './pages.css'

const COLUMNS = [
  { key: 'period',          label: '期间',     hint: 'YYYY-MM' },
  { key: 'feeType',         label: '费用类型', hint: '' },
  { key: 'org',             label: '组织',     hint: '' },
  { key: 'platformId',      label: '平台',     hint: '' },
  { key: 'shopId',          label: '店铺',     hint: '' },
  { key: 'platformOrderId', label: '平台单号', hint: '可选' },
  { key: 'amount',          label: '费用金额', hint: '元' },
  { key: 'date',            label: '费用日期', hint: 'YYYY-MM-DD' },
  { key: 'memo',            label: '备注',     hint: '' }
]

const EXCEL_HEADER_MAP = {
  '期间': 'period', '月份': 'period',
  '费用类型': 'feeType',
  '组织': 'org', '部门': 'org',
  '平台': 'platformId',
  '店铺': 'shopId', '店铺名称': 'shopId',
  '平台单号': 'platformOrderId', '订单号': 'platformOrderId',
  '费用金额': 'amount', '金额': 'amount',
  '费用日期': 'date', '日期': 'date',
  '备注': 'memo'
}

function num(v) {
  if (v == null || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export default function DataAggregatePage({ feeRecords, currentPeriod }) {
  const { items, setAll, add, addMany, remove, clearAll } = feeRecords
  const [periodFilter, setPeriodFilter] = useState(currentPeriod || '')
  const [feeTypeFilter, setFeeTypeFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const fileRef = useRef()

  const filtered = useMemo(() => {
    let arr = [...items]
    if (periodFilter) arr = arr.filter(x => x.period === periodFilter)
    if (feeTypeFilter) arr = arr.filter(x => x.feeType === feeTypeFilter)
    return arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  }, [items, periodFilter, feeTypeFilter])

  const periods = useMemo(() => {
    const s = new Set(items.map(x => x.period).filter(Boolean))
    return Array.from(s).sort().reverse()
  }, [items])

  const onImport = async file => {
    try {
      const book = await readWorkbook(file)
      const rows = book[Object.keys(book)[0]] || []
      const records = []
      for (const r of rows) {
        const rec = {}
        for (const [k, v] of Object.entries(r)) {
          const target = EXCEL_HEADER_MAP[k?.trim?.() ?? k]
          if (target) rec[target] = v
        }
        if (!rec.feeType) continue
        rec.period = String(rec.period || currentPeriod || '').slice(0, 7)
        rec.amount = num(rec.amount)
        records.push(rec)
      }
      addMany(records)
      alert(`导入完成：${records.length} 条费用记录`)
    } catch (e) {
      alert('导入失败：' + e.message)
    }
  }

  const onDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['期间', '费用类型', '组织', '平台', '店铺', '平台单号', '费用金额', '费用日期', '备注'],
      ['2026-01', '推广费', '童装事业部', 'douyin', 'xzf-dehuang', '', 5000, '2026-01-15', '巨量引擎投放']
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '费用归集')
    XLSX.writeFile(wb, '费用归集导入模板.xlsx')
  }

  const total = filtered.reduce((s, x) => s + num(x.amount), 0)

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>数据归集</h2>
        <div className="rec-page-sub">
          按费用类型归集到组织/店铺/平台单号维度。每条费用记录将在「数据分配」按对应分配标准分摊到订单商品。
        </div>
      </div>

      <div className="rec-toolbar">
        <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} className="rec-input">
          <option value="">全部期间</option>
          {periods.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={feeTypeFilter} onChange={e => setFeeTypeFilter(e.target.value)} className="rec-input">
          <option value="">全部费用类型</option>
          {FEE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="rec-spacer"/>
        <button className="rec-btn" onClick={onDownloadTemplate}>
          <Download size={14}/> 下载模板
        </button>
        <input ref={fileRef} type="file" accept=".xlsx" hidden
          onChange={e => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = '' }}/>
        <button className="rec-btn" onClick={() => fileRef.current.click()}>
          <Upload size={14}/> 批量导入
        </button>
        <button className="rec-btn primary" onClick={() => setEditing({
          period: currentPeriod || '', feeType: FEE_TYPES[0],
          org: 'default', platformId: '', shopId: '',
          platformOrderId: '', amount: 0, date: '', memo: ''
        })}>
          <Plus size={14}/> 新增
        </button>
      </div>

      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr>
              {COLUMNS.map(c => <th key={c.key}>{c.label}</th>)}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={COLUMNS.length + 1} className="rec-empty-cell">
                <FileSpreadsheet size={20}/> 暂无费用记录。点击「批量导入」或「新增」开始
              </td></tr>
            )}
            {filtered.map(r => (
              <tr key={r.id} onClick={() => setEditing(r)}>
                <td>{r.period}</td>
                <td><span className="rec-tag-fee">{r.feeType}</span></td>
                <td>{r.org === 'default' ? '童装事业部' : r.org}</td>
                <td>{r.platformId || '—'}</td>
                <td>{r.shopId || '—'}</td>
                <td className="mono">{r.platformOrderId || '—'}</td>
                <td><strong>{fmtMoney(r.amount)}</strong></td>
                <td className="rec-muted">{r.date || '—'}</td>
                <td className="rec-muted">{r.memo || '—'}</td>
                <td>
                  <button className="rec-icon-btn" title="删除"
                    onClick={e => { e.stopPropagation(); if (confirm('确认删除？')) remove(r.id) }}>
                    <Trash2 size={13}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={6}><strong>共 {filtered.length} 条</strong></td>
                <td><strong>{fmtMoney(total)}</strong></td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="rec-toolbar" style={{ marginTop: 12 }}>
          <span className="rec-spacer"/>
          <button className="rec-btn danger" onClick={() => {
            if (confirm(`确认清空当前 ${filtered.length} 条费用记录？`)) clearAll()
          }}>
            <Trash2 size={14}/> 清空全部
          </button>
        </div>
      )}

      {editing && (
        <FeeEditDialog
          rec={editing}
          onClose={() => setEditing(null)}
          onSave={r => {
            if (r.id) {
              setAll(items.map(x => x.id === r.id ? r : x))
            } else {
              add(r)
            }
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function FeeEditDialog({ rec, onClose, onSave }) {
  const [form, setForm] = useState(rec)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const shops = MOCK_SHOPS[form.platformId] || []
  return (
    <div className="rec-dialog-mask" onClick={onClose}>
      <div className="rec-dialog" onClick={e => e.stopPropagation()}>
        <h3>{rec.id ? '编辑费用记录' : '新增费用记录'}</h3>
        <div className="rec-form-grid">
          <label><span>期间 (YYYY-MM)</span>
            <input value={form.period} onChange={e => set('period', e.target.value)} placeholder="2026-01"/></label>
          <label><span>费用类型</span>
            <select value={form.feeType} onChange={e => set('feeType', e.target.value)}>
              {FEE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select></label>
          <label><span>组织</span>
            <select value={form.org} onChange={e => set('org', e.target.value)}>
              {ORG_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select></label>
          <label><span>平台</span>
            <select value={form.platformId} onChange={e => { set('platformId', e.target.value); set('shopId', '') }}>
              <option value="">公共费用（无平台）</option>
              {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></label>
          <label><span>店铺</span>
            <select value={form.shopId} onChange={e => set('shopId', e.target.value)} disabled={!form.platformId}>
              <option value="">不限店铺</option>
              {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select></label>
          <label><span>平台单号 <em>(可选，直挂订单时填)</em></span>
            <input value={form.platformOrderId || ''} onChange={e => set('platformOrderId', e.target.value)}/></label>
          <label><span>费用金额 <em>(元)</em></span>
            <input type="number" value={form.amount} onChange={e => set('amount', num(e.target.value))}/></label>
          <label><span>费用日期</span>
            <input type="date" value={form.date || ''} onChange={e => set('date', e.target.value)}/></label>
          <label style={{ gridColumn: 'span 2' }}><span>备注</span>
            <input value={form.memo || ''} onChange={e => set('memo', e.target.value)}/></label>
        </div>
        <div className="rec-dialog-foot">
          <button className="rec-btn" onClick={onClose}>取消</button>
          <button className="rec-btn primary" onClick={() => {
            if (!form.period) return alert('请填写期间')
            if (!form.feeType) return alert('请选择费用类型')
            if (!form.amount) return alert('请填写费用金额')
            onSave(form)
          }}>保存</button>
        </div>
      </div>
    </div>
  )
}
