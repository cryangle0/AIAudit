// 分配标准 — 自定义费用/收入分配规则
// 字段：标准名称 / 适用费用类型 / 分配方式 / 范围 / 优先级 / 备注

import { useState } from 'react'
import { Plus, Trash2, FileSpreadsheet, RotateCcw } from 'lucide-react'
import { METHOD_OPTIONS, SCOPE_OPTIONS } from '../hooks/useAllocStandards.js'
import { FEE_TYPES } from '../hooks/useFeeRecords.js'
import './pages.css'

export default function AllocStandardPage({ allocStandards }) {
  const { items, add, update, remove, resetDefaults } = allocStandards
  const [editing, setEditing] = useState(null)

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>分配标准</h2>
        <div className="rec-page-sub">
          定义费用如何分摊到订单/商品。分配引擎按「优先级」从小到大匹配，先命中的标准生效。
          支持 5 种分配方式：按收入比例 / 按件数比例 / 按订单数 / 平均分摊 / 直挂订单。
        </div>
      </div>

      <div className="rec-toolbar">
        <span className="rec-spacer"/>
        <button className="rec-btn" onClick={() => {
          if (confirm('恢复默认 5 条分配标准？这将覆盖你当前的标准列表。')) resetDefaults()
        }}>
          <RotateCcw size={14}/> 恢复默认
        </button>
        <button className="rec-btn primary" onClick={() => setEditing({
          name: '', feeTypes: [], method: 'byRevenue', scope: 'sku',
          periods: '*', priority: items.length + 1, memo: ''
        })}>
          <Plus size={14}/> 新增标准
        </button>
      </div>

      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr>
              <th>优先级</th><th>标准名称</th><th>适用费用类型</th>
              <th>分配方式</th><th>范围</th><th>生效期间</th><th>备注</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={8} className="rec-empty-cell">
                <FileSpreadsheet size={20}/> 暂无分配标准。点击「恢复默认」加载 5 条预置规则
              </td></tr>
            )}
            {[...items].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99)).map(s => (
              <tr key={s.id} onClick={() => setEditing(s)}>
                <td><strong>{s.priority}</strong></td>
                <td>{s.name}</td>
                <td>
                  {(s.feeTypes || []).map(t => <span key={t} className="rec-tag-fee">{t}</span>)}
                </td>
                <td>{METHOD_OPTIONS.find(m => m.value === s.method)?.label || s.method}</td>
                <td>{SCOPE_OPTIONS.find(o => o.value === s.scope)?.label?.split('（')[0] || s.scope}</td>
                <td>{s.periods === '*' ? '全部' : s.periods}</td>
                <td className="rec-muted">{s.memo || '—'}</td>
                <td>
                  <button className="rec-icon-btn" title="删除"
                    onClick={e => { e.stopPropagation(); if (confirm('确认删除此分配标准？')) remove(s.id) }}>
                    <Trash2 size={13}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <StandardEditDialog
          rec={editing}
          onClose={() => setEditing(null)}
          onSave={r => {
            if (r.id) update(r.id, r)
            else add(r)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function StandardEditDialog({ rec, onClose, onSave }) {
  const [form, setForm] = useState(rec)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleFeeType = t => {
    const has = (form.feeTypes || []).includes(t)
    set('feeTypes', has ? form.feeTypes.filter(x => x !== t) : [...(form.feeTypes || []), t])
  }
  return (
    <div className="rec-dialog-mask" onClick={onClose}>
      <div className="rec-dialog" onClick={e => e.stopPropagation()} style={{ width: 600 }}>
        <h3>{rec.id ? '编辑分配标准' : '新增分配标准'}</h3>
        <div className="rec-form-grid">
          <label style={{ gridColumn: 'span 2' }}><span>标准名称</span>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="例：推广费按收入分摊"/></label>
          <label><span>分配方式</span>
            <select value={form.method} onChange={e => set('method', e.target.value)}>
              {METHOD_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select></label>
          <label><span>分配范围</span>
            <select value={form.scope} onChange={e => set('scope', e.target.value)}>
              {SCOPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select></label>
          <label><span>优先级（小→大优先匹配）</span>
            <input type="number" value={form.priority} onChange={e => set('priority', Number(e.target.value))}/></label>
          <label><span>生效期间</span>
            <input value={form.periods} onChange={e => set('periods', e.target.value)} placeholder="* 表示全部期间"/></label>
        </div>

        <div className="rec-fee-type-group">
          <span>适用费用类型 <em>(可多选)</em></span>
          <div className="rec-fee-type-pills">
            {FEE_TYPES.map(t => (
              <button key={t}
                className={`rec-pill ${(form.feeTypes || []).includes(t) ? 'active' : ''}`}
                onClick={() => toggleFeeType(t)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="rec-form-grid" style={{ marginTop: 12 }}>
          <label style={{ gridColumn: 'span 2' }}><span>备注</span>
            <input value={form.memo || ''} onChange={e => set('memo', e.target.value)}/></label>
        </div>

        <div className="rec-dialog-foot">
          <button className="rec-btn" onClick={onClose}>取消</button>
          <button className="rec-btn primary" onClick={() => {
            if (!form.name) return alert('请填写标准名称')
            if (!(form.feeTypes || []).length) return alert('请至少选一个费用类型')
            onSave(form)
          }}>保存</button>
        </div>
      </div>
    </div>
  )
}
