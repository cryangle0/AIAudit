// 商品成本（利润核算中心 → 商品成本）
// 按客户模板字段：款式编码 / 商品编码 / 标费 / 辅料 (+ 商品成本本体 = 总成本)
// 支持按期间维护、批量导入、Excel 模板下载

import { useRef, useState, useMemo } from 'react'
import { Upload, Plus, Trash2, Download, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { readWorkbook } from '../utils/excel.js'
import { fmtMoney } from '../utils/format.js'
import './pages.css'

const COLUMNS = [
  { key: 'period',       label: '期间',     hint: 'YYYY-MM' },
  { key: 'styleCode',    label: '款式编码', hint: '' },
  { key: 'productCode',  label: '商品编码', hint: '' },
  { key: 'productName',  label: '商品名称', hint: '' },
  { key: 'baseCost',     label: '商品成本', hint: '元' },
  { key: 'tagFee',       label: '标费',     hint: '元' },
  { key: 'accessoryFee', label: '辅料',     hint: '元' }
]

// Excel 列名 → 内部 key 的映射（容忍中英文/空格）
const EXCEL_HEADER_MAP = {
  '期间': 'period', '月份': 'period',
  '款式编码': 'styleCode', '款式': 'styleCode',
  '商品编码': 'productCode', '货号': 'productCode',
  '商品名称': 'productName', '品名': 'productName',
  '商品成本': 'baseCost', '成本': 'baseCost',
  '标费': 'tagFee',
  '辅料': 'accessoryFee'
}

function num(v) {
  if (v == null || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function calcTotal(rec) {
  return num(rec.baseCost) + num(rec.tagFee) + num(rec.accessoryFee)
}

export default function ProductCostPage({ productCost, currentPeriod }) {
  const { items, setAll, addOrUpdate, remove, clearAll } = productCost
  const [periodFilter, setPeriodFilter] = useState(currentPeriod || '')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // 新增/编辑表单
  const fileRef = useRef()

  const filtered = useMemo(() => {
    let arr = [...items]
    if (periodFilter) arr = arr.filter(x => x.period === periodFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      arr = arr.filter(x =>
        (x.styleCode || '').toLowerCase().includes(q) ||
        (x.productCode || '').toLowerCase().includes(q) ||
        (x.productName || '').toLowerCase().includes(q))
    }
    return arr.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
  }, [items, periodFilter, search])

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
        for (const [excelKey, val] of Object.entries(r)) {
          const k = EXCEL_HEADER_MAP[excelKey?.trim?.() ?? excelKey]
          if (k) rec[k] = val
        }
        if (!rec.styleCode && !rec.productCode) continue
        rec.period = String(rec.period || currentPeriod || '').slice(0, 7)
        rec.baseCost = num(rec.baseCost)
        rec.tagFee = num(rec.tagFee)
        rec.accessoryFee = num(rec.accessoryFee)
        records.push(rec)
      }
      // 合并：同 period+styleCode+productCode 覆盖
      const map = new Map(items.map(x => [`${x.period}|${x.styleCode || ''}|${x.productCode || ''}`, x]))
      for (const r of records) {
        map.set(`${r.period}|${r.styleCode || ''}|${r.productCode || ''}`, { ...r, updatedAt: Date.now() })
      }
      setAll(Array.from(map.values()))
      alert(`导入完成：${records.length} 条记录`)
    } catch (e) {
      alert('导入失败：' + e.message)
    }
  }

  const onDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['期间', '款式编码', '商品编码', '商品名称', '商品成本', '标费', '辅料'],
      ['2026-01', 'X2501122980FXT', 'X2501122980FXT-100', '示例商品', 35, 4, 1]
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '商品成本')
    XLSX.writeFile(wb, '商品成本导入模板.xlsx')
  }

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>商品成本</h2>
        <div className="rec-page-sub">
          按期间维护商品成本（商品成本 + 标费 + 辅料 = 总成本）。优先用于对账与利润计算，未维护时回落到聚水潭实发成本。
        </div>
      </div>

      <div className="rec-toolbar">
        <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} className="rec-input">
          <option value="">全部期间</option>
          {periods.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input className="rec-input" placeholder="搜索 款式/商品编码/名称"
          value={search} onChange={e => setSearch(e.target.value)} />

        <span className="rec-spacer" />

        <button className="rec-btn" onClick={onDownloadTemplate}>
          <Download size={14}/> 下载模板
        </button>
        <input ref={fileRef} type="file" accept=".xlsx" hidden
          onChange={e => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = '' }} />
        <button className="rec-btn" onClick={() => fileRef.current.click()}>
          <Upload size={14}/> 批量导入
        </button>
        <button className="rec-btn primary" onClick={() => setEditing({
          period: currentPeriod || periodFilter || '',
          styleCode: '', productCode: '', productName: '',
          baseCost: 0, tagFee: 0, accessoryFee: 0
        })}>
          <Plus size={14}/> 新增
        </button>
      </div>

      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr>
              {COLUMNS.map(c => <th key={c.key}>{c.label}</th>)}
              <th>总成本</th><th>更新时间</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={COLUMNS.length + 3} className="rec-empty-cell">
                <FileSpreadsheet size={20}/> 暂无数据。点击「批量导入」或「新增」开始维护
              </td></tr>
            )}
            {filtered.map((r, i) => (
              <tr key={`${r.period}|${r.styleCode}|${r.productCode}|${i}`}
                onClick={() => setEditing(r)}>
                <td>{r.period}</td>
                <td className="mono">{r.styleCode || '—'}</td>
                <td className="mono">{r.productCode || '—'}</td>
                <td>{r.productName || '—'}</td>
                <td>{fmtMoney(r.baseCost)}</td>
                <td>{fmtMoney(r.tagFee)}</td>
                <td>{fmtMoney(r.accessoryFee)}</td>
                <td><strong>{fmtMoney(calcTotal(r))}</strong></td>
                <td className="rec-muted">{r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '—'}</td>
                <td>
                  <button className="rec-icon-btn" title="删除"
                    onClick={e => { e.stopPropagation(); if (confirm('确认删除此条记录？')) remove(r) }}>
                    <Trash2 size={13}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr><td colSpan={4}><strong>共 {filtered.length} 条</strong></td>
                <td>{fmtMoney(filtered.reduce((s, x) => s + num(x.baseCost), 0))}</td>
                <td>{fmtMoney(filtered.reduce((s, x) => s + num(x.tagFee), 0))}</td>
                <td>{fmtMoney(filtered.reduce((s, x) => s + num(x.accessoryFee), 0))}</td>
                <td>{fmtMoney(filtered.reduce((s, x) => s + calcTotal(x), 0))}</td>
                <td colSpan={2}></td></tr>
            </tfoot>
          )}
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="rec-toolbar" style={{ marginTop: 12 }}>
          <span className="rec-spacer" />
          <button className="rec-btn danger" onClick={() => {
            if (confirm(`确认清空当前 ${filtered.length} 条记录？此操作不可恢复。`)) clearAll()
          }}>
            <Trash2 size={14}/> 清空全部
          </button>
        </div>
      )}

      {editing && (
        <EditDialog
          rec={editing}
          onClose={() => setEditing(null)}
          onSave={r => { addOrUpdate(r); setEditing(null) }}
        />
      )}
    </div>
  )
}

function EditDialog({ rec, onClose, onSave }) {
  const [form, setForm] = useState(rec)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div className="rec-dialog-mask" onClick={onClose}>
      <div className="rec-dialog" onClick={e => e.stopPropagation()}>
        <h3>{rec.updatedAt ? '编辑商品成本' : '新增商品成本'}</h3>
        <div className="rec-form-grid">
          {COLUMNS.map(c => (
            <label key={c.key}>
              <span>{c.label}{c.hint ? <em> ({c.hint})</em> : ''}</span>
              <input
                value={form[c.key] ?? ''}
                onChange={e => set(c.key,
                  ['baseCost', 'tagFee', 'accessoryFee'].includes(c.key) ? num(e.target.value) : e.target.value)}
                placeholder={c.hint} />
            </label>
          ))}
          <label className="rec-form-readonly">
            <span>总成本（自动）</span>
            <strong>{fmtMoney(calcTotal(form))}</strong>
          </label>
        </div>
        <div className="rec-dialog-foot">
          <button className="rec-btn" onClick={onClose}>取消</button>
          <button className="rec-btn primary" onClick={() => {
            if (!form.styleCode && !form.productCode) return alert('款式编码和商品编码至少填一项')
            if (!form.period) return alert('请填写期间')
            onSave(form)
          }}>保存</button>
        </div>
      </div>
    </div>
  )
}
