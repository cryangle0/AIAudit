import { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import { PLATFORMS } from '../../platforms/index.js'

export default function ShopEditDialog({
  open, mode, initial, enabledPlatformIds, onSave, onClose
}) {
  // mode: 'create' | 'edit'
  const [name, setName] = useState('')
  const [platformId, setPlatformId] = useState('')

  useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setPlatformId(initial?.platformId || enabledPlatformIds[0] || '')
    }
  }, [open, initial, enabledPlatformIds])

  const canSave = name.trim().length > 0 && !!platformId

  return (
    <Modal
      open={open}
      title={mode === 'create' ? '新增店铺' : '编辑店铺'}
      onClose={onClose}
      width={400}
      footer={
        <>
          <button className="rec-modal-btn" onClick={onClose}>取消</button>
          <button
            className="rec-modal-btn primary"
            disabled={!canSave}
            onClick={() => onSave({ name: name.trim(), platformId })}
          >保存</button>
        </>
      }
    >
      <div className="rec-settings-row-item">
        <div className="rec-settings-row-main">
          <div className="rec-settings-row-label">店铺名称</div>
          <input
            className="rec-settings-input"
            style={{ width: '100%', marginTop: 6 }}
            placeholder="例如：我的淘宝小店"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <div className="rec-settings-row-item" style={{ borderBottom: 'none' }}>
        <div className="rec-settings-row-main">
          <div className="rec-settings-row-label">所属平台</div>
          <select
            className="rec-settings-select"
            style={{ width: '100%', marginTop: 6 }}
            value={platformId}
            onChange={e => setPlatformId(e.target.value)}
            disabled={mode === 'edit'}
          >
            {PLATFORMS.filter(p => enabledPlatformIds.includes(p.id)).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {mode === 'edit' && (
            <div className="rec-settings-row-sub">编辑模式下不可改变所属平台</div>
          )}
        </div>
      </div>
    </Modal>
  )
}
