import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { PLATFORMS, MOCK_SHOPS, platformsById } from '../../platforms/index.js'
import Modal from '../Modal.jsx'
import Select from '../Select.jsx'
import ShopEditDialog from './ShopEditDialog.jsx'

const FILTER_OPTIONS = [
  { value: 'all', label: '全部' },
  ...PLATFORMS.map(p => ({ value: p.id, label: p.name }))
]

export default function ShopsPanel({ settings, updateSettings }) {
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null)        // { mode, initial?, platformId? } | null
  const [confirmDel, setConfirmDel] = useState(null)  // { platformId, shopId, name } | null

  const enabledIds = settings.enabledPlatforms

  // 拼出所有可见行
  const rows = []
  for (const p of PLATFORMS) {
    if (filter !== 'all' && filter !== p.id) continue
    for (const s of (MOCK_SHOPS[p.id] || [])) {
      rows.push({ ...s, platformId: p.id, platformName: p.name, isDefault: true })
    }
    for (const s of (settings.customShops?.[p.id] || [])) {
      rows.push({ ...s, platformId: p.id, platformName: p.name, isDefault: false })
    }
  }

  function addCustom({ name, platformId }) {
    const id = `${platformId}-custom-${Date.now()}`
    updateSettings(prev => {
      const list = prev.customShops?.[platformId] || []
      return {
        ...prev,
        customShops: { ...prev.customShops, [platformId]: [...list, { id, name }] }
      }
    })
    setEditing(null)
  }

  function editCustom({ name, platformId }) {
    updateSettings(prev => {
      const list = prev.customShops?.[platformId] || []
      const next = list.map(s => s.id === editing.initial.id ? { ...s, name } : s)
      return {
        ...prev,
        customShops: { ...prev.customShops, [platformId]: next }
      }
    })
    setEditing(null)
  }

  function deleteCustom(platformId, shopId) {
    updateSettings(prev => {
      const list = prev.customShops?.[platformId] || []
      const next = list.filter(s => s.id !== shopId)
      return {
        ...prev,
        customShops: { ...prev.customShops, [platformId]: next }
      }
    })
    setConfirmDel(null)
  }

  return (
    <div>
      <h3 className="rec-settings-section-title">店铺管理</h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <span className="rec-settings-row-sub" style={{ marginTop: 0 }}>平台筛选</span>
        <Select
          value={filter}
          options={FILTER_OPTIONS}
          onChange={setFilter}
          width={160}
        />
        <div style={{ flex: 1 }}/>
        <button
          className="rec-modal-btn primary"
          onClick={() => setEditing({ mode: 'create' })}
          disabled={enabledIds.length === 0}
        >
          <Plus size={12} style={{ verticalAlign: 'middle', marginRight: 4 }}/>新增店铺
        </button>
      </div>

      {rows.length === 0 && (
        <div className="rec-settings-row-sub">暂无店铺</div>
      )}

      {rows.map(row => (
        <div key={`${row.platformId}-${row.id}`} className="rec-settings-row-item">
          <div className="rec-settings-row-main">
            <div className="rec-settings-row-label">
              {row.name}
              <span className={`rec-settings-tag ${row.isDefault ? 'default' : 'custom'}`}>
                {row.isDefault ? '默认' : '自定义'}
              </span>
            </div>
            <div className="rec-settings-row-sub">{row.platformName}</div>
          </div>
          <div>
            <button
              className="rec-settings-icon-btn"
              disabled={row.isDefault}
              title={row.isDefault ? '默认演示数据不可修改' : '编辑'}
              onClick={() => setEditing({ mode: 'edit', initial: row })}
            ><Pencil size={12}/></button>
            <button
              className="rec-settings-icon-btn"
              disabled={row.isDefault}
              title={row.isDefault ? '默认演示数据不可删除' : '删除'}
              onClick={() => setConfirmDel(row)}
            ><Trash2 size={12}/></button>
          </div>
        </div>
      ))}

      <ShopEditDialog
        open={!!editing}
        mode={editing?.mode}
        initial={editing?.initial}
        enabledPlatformIds={enabledIds}
        onSave={data => editing?.mode === 'create' ? addCustom(data) : editCustom(data)}
        onClose={() => setEditing(null)}
      />

      <Modal
        open={!!confirmDel}
        title="删除店铺"
        onClose={() => setConfirmDel(null)}
        width={360}
        footer={
          <>
            <button className="rec-modal-btn" onClick={() => setConfirmDel(null)}>取消</button>
            <button
              className="rec-modal-btn danger"
              onClick={() => deleteCustom(confirmDel.platformId, confirmDel.id)}
            >确认删除</button>
          </>
        }
      >
        {confirmDel && (
          <>确定要删除 <strong>{confirmDel.name}</strong>（{platformsById[confirmDel.platformId]?.name}）吗？</>
        )}
      </Modal>
    </div>
  )
}
