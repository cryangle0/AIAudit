// 店铺/平台/币种配置 — 需求 #16-#18
import { useMemo, useState } from 'react'
import { Plus, Trash2, Power, PowerOff } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { PLATFORMS } from '../../platforms/index.js'
import { CURRENCIES } from '../../core/currency.js'
import '../pages.css'

export default function ShopProfilesPage({ shopProfiles }) {
  const { items, add, update, remove } = shopProfiles
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('') // platformId

  const filtered = useMemo(() => {
    return filter ? items.filter(x => x.platformId === filter) : items
  }, [items, filter])

  return (
    <div className="rec-page">
      <PageHeader
        title="店铺/平台配置"
        subtitle="维护店铺基础信息（店铺名称/所属平台/状态/默认币种），关联汇率管理与对账流程"/>

      <div className="rec-toolbar">
        <select className="rec-input" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">全部平台</option>
          {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <span className="rec-spacer"/>
        <button className="rec-btn primary" onClick={() => setEditing({
          name: '', platformId: PLATFORMS[0].id, currency: PLATFORMS[0].currency || 'CNY',
          status: 'active', settlementRule: '', memo: ''
        })}>
          <Plus size={14}/> 新增店铺
        </button>
      </div>

      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr>
              <th>店铺名称</th><th>所属平台</th><th>地区</th>
              <th>结算币种</th><th>状态</th><th>结算规则</th><th>备注</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="rec-empty-cell">
                暂无店铺记录。点击「新增店铺」开始
              </td></tr>
            )}
            {filtered.map(s => {
              const platform = PLATFORMS.find(p => p.id === s.platformId)
              return (
                <tr key={s.id} onClick={() => setEditing(s)}>
                  <td><strong>{s.name}</strong></td>
                  <td>{platform?.name || s.platformId}</td>
                  <td>{platform?.region === 'overseas' ? '海外' : '国内'}</td>
                  <td><span className="rec-tag-fee">{s.currency}</span></td>
                  <td>
                    {s.status === 'active'
                      ? <span className="rec-tag-pos">营业中</span>
                      : <span className="rec-tag-neg">已停用</span>}
                  </td>
                  <td className="rec-muted">{s.settlementRule || '—'}</td>
                  <td className="rec-muted">{s.memo || '—'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="rec-icon-btn"
                      title={s.status === 'active' ? '停用' : '启用'}
                      onClick={() => update(s.id, { status: s.status === 'active' ? 'inactive' : 'active' })}>
                      {s.status === 'active' ? <PowerOff size={13}/> : <Power size={13}/>}
                    </button>
                    <button className="rec-icon-btn" title="删除"
                      onClick={() => { if (confirm('确认删除此店铺？')) remove(s.id) }}>
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
        <ShopEditDialog
          rec={editing}
          onClose={() => setEditing(null)}
          onSave={r => {
            if (r.id) update(r.id, r); else add(r)
            setEditing(null)
          }}/>
      )}
    </div>
  )
}

function ShopEditDialog({ rec, onClose, onSave }) {
  const [form, setForm] = useState(rec)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const platform = PLATFORMS.find(p => p.id === form.platformId)
  return (
    <div className="rec-dialog-mask" onClick={onClose}>
      <div className="rec-dialog" onClick={e => e.stopPropagation()} style={{ width: 560 }}>
        <h3>{rec.id ? '编辑店铺' : '新增店铺'}</h3>
        <div className="rec-form-grid">
          <label style={{ gridColumn: 'span 2' }}>
            <span>店铺名称</span>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="例：雪中飞德煌童装专卖店"/>
          </label>
          <label>
            <span>所属平台</span>
            <select value={form.platformId} onChange={e => {
              const p = PLATFORMS.find(x => x.id === e.target.value)
              set('platformId', e.target.value)
              if (p?.currency) set('currency', p.currency)
            }}>
              {PLATFORMS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.region === 'overseas' ? '🌍 ' : ''}{p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>结算币种</span>
            <select value={form.currency} onChange={e => set('currency', e.target.value)}>
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
              ))}
            </select>
            {platform?.currency && form.currency !== platform.currency && (
              <em style={{ color: '#c98412' }}>提示：该平台默认币种为 {platform.currency}</em>
            )}
          </label>
          <label>
            <span>状态</span>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">营业中</option>
              <option value="inactive">已停用</option>
            </select>
          </label>
          <label style={{ gridColumn: 'span 2' }}>
            <span>结算规则 <em>(可选)</em></span>
            <input value={form.settlementRule || ''} onChange={e => set('settlementRule', e.target.value)}
              placeholder="例：T+15 周结，跨境收款手续费 1.2%"/>
          </label>
          <label style={{ gridColumn: 'span 2' }}>
            <span>备注</span>
            <input value={form.memo || ''} onChange={e => set('memo', e.target.value)}/>
          </label>
        </div>
        <div className="rec-dialog-foot">
          <button className="rec-btn" onClick={onClose}>取消</button>
          <button className="rec-btn primary" onClick={() => {
            if (!form.name) return alert('请填写店铺名称')
            onSave(form)
          }}>保存</button>
        </div>
      </div>
    </div>
  )
}
