// 商品资料 — 需求 #1
// 字段: 款式编码 / 商品编码 / 商品名称 / 品类 / 备注

import { useRef, useState, useMemo } from 'react'
import { Upload, Plus, Trash2, Download, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import { readWorkbook } from '../../utils/excel.js'
import '../pages.css'

const COLUMNS = [
  { key: 'styleCode',   label: '款式编码' },
  { key: 'productCode', label: '商品编码' },
  { key: 'productName', label: '商品名称' },
  { key: 'category',    label: '品类' },
  { key: 'memo',        label: '备注' }
]

const HEADER_MAP = {
  '款式编码': 'styleCode',  '款式': 'styleCode',
  '商品编码': 'productCode', '货号': 'productCode',
  '商品名称': 'productName', '品名': 'productName',
  '品类': 'category', '类目': 'category',
  '备注': 'memo'
}

export default function ProductMasterPage({ productMaster }) {
  const { items, addOrUpdate, addMany, remove, clearAll } = productMaster
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const fileRef = useRef()

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.trim().toLowerCase()
    return items.filter(x =>
      (x.styleCode || '').toLowerCase().includes(q) ||
      (x.productCode || '').toLowerCase().includes(q) ||
      (x.productName || '').toLowerCase().includes(q) ||
      (x.category || '').toLowerCase().includes(q))
  }, [items, search])

  const onImport = async (file) => {
    try {
      const book = await readWorkbook(file)
      const rows = book[Object.keys(book)[0]] || []
      const records = []
      for (const r of rows) {
        const rec = {}
        for (const [k, v] of Object.entries(r)) {
          const target = HEADER_MAP[k?.trim?.() ?? k]
          if (target) rec[target] = v
        }
        if (rec.styleCode || rec.productCode) records.push(rec)
      }
      addMany(records)
      alert(`导入完成：${records.length} 条商品`)
    } catch (e) {
      alert('导入失败：' + e.message)
    }
  }

  const onDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['款式编码', '商品编码', '商品名称', '品类', '备注'],
      ['X2501122980FXT', 'X2501122980FXT-100', '冬款保暖羽绒服', '童装外套', '示例']
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '商品资料')
    XLSX.writeFile(wb, '商品资料导入模板.xlsx')
  }

  return (
    <div className="rec-page">
      <PageHeader
        title="商品资料"
        subtitle="维护款式编码 / 商品编码 / 商品名称 / 品类等基础信息（需求 #1）"/>

      <div className="rec-toolbar">
        <input className="rec-input" placeholder="搜索 款式/商品编码/名称/品类"
          value={search} onChange={e => setSearch(e.target.value)}/>
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
          styleCode: '', productCode: '', productName: '', category: '', memo: ''
        })}>
          <Plus size={14}/> 新增
        </button>
      </div>

      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr>{COLUMNS.map(c => <th key={c.key}>{c.label}</th>)}<th>更新时间</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={COLUMNS.length + 2} className="rec-empty-cell">
                <FileSpreadsheet size={20}/> 暂无商品资料。点击「批量导入」或「新增」开始
              </td></tr>
            )}
            {filtered.map((r, i) => (
              <tr key={i} onClick={() => setEditing(r)}>
                <td className="mono">{r.styleCode || '—'}</td>
                <td className="mono">{r.productCode || '—'}</td>
                <td>{r.productName || '—'}</td>
                <td>{r.category || '—'}</td>
                <td className="rec-muted">{r.memo || '—'}</td>
                <td className="rec-muted">{r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '—'}</td>
                <td>
                  <button className="rec-icon-btn" title="删除"
                    onClick={e => { e.stopPropagation(); if (confirm('确认删除？')) remove(r) }}>
                    <Trash2 size={13}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr><td colSpan={COLUMNS.length + 2}><strong>共 {filtered.length} 条</strong></td></tr>
            </tfoot>
          )}
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="rec-toolbar" style={{ marginTop: 12 }}>
          <span className="rec-spacer"/>
          <button className="rec-btn danger" onClick={() => {
            if (confirm(`确认清空当前 ${filtered.length} 条商品资料？`)) clearAll()
          }}>
            <Trash2 size={14}/> 清空全部
          </button>
        </div>
      )}

      {editing && (
        <EditDialog rec={editing} onClose={() => setEditing(null)}
          onSave={r => { addOrUpdate(r); setEditing(null) }}/>
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
        <h3>{rec.updatedAt ? '编辑商品' : '新增商品'}</h3>
        <div className="rec-form-grid">
          {COLUMNS.map(c => (
            <label key={c.key} style={c.key === 'memo' ? { gridColumn: 'span 2' } : {}}>
              <span>{c.label}</span>
              <input value={form[c.key] ?? ''} onChange={e => set(c.key, e.target.value)}/>
            </label>
          ))}
        </div>
        <div className="rec-dialog-foot">
          <button className="rec-btn" onClick={onClose}>取消</button>
          <button className="rec-btn primary" onClick={() => {
            if (!form.styleCode && !form.productCode) return alert('款式编码和商品编码至少填一项')
            onSave(form)
          }}>保存</button>
        </div>
      </div>
    </div>
  )
}
