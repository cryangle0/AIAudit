import { useRef } from 'react'
import { Upload, CheckCircle2, X, FileSpreadsheet, Sparkles } from 'lucide-react'
import './UploadZone.css'

export const JST_SLOT = {
  key: 'jst', label: '聚水潭导出', required: true,
  sheetName: '聚水潭导出店铺数据', requiredColumns: ['原始线上订单号', '款式编码', '实发金额', '实发成本'],
  hint: '支持多月数据，自动识别含必需列的工作表'
}

function Slot({ slot, value, onPick, onClear }) {
  const inputRef = useRef()
  const handleFile = e => {
    const file = e.target.files?.[0]
    if (file) onPick(slot, file)
    e.target.value = ''
  }
  return (
    <div className={`rec-slot ${value ? 'filled' : ''}`}>
      <input ref={inputRef} type="file" accept=".xlsx" onChange={handleFile} hidden/>
      {value ? (
        <>
          <CheckCircle2 size={18} className="rec-slot-icon" color="#3aaf6b"/>
          <div className="rec-slot-info">
            <div className="rec-slot-label">{slot.label}</div>
            <div className="rec-slot-meta">{value.fileName} · {value.rows?.length ?? '—'} 行</div>
          </div>
          <button className="rec-slot-clear" onClick={() => onClear(slot)} title="清除"><X size={14}/></button>
        </>
      ) : (
        <button className="rec-slot-cta" onClick={() => inputRef.current.click()}>
          <Upload size={18}/>
          <div className="rec-slot-info">
            <div className="rec-slot-label">{slot.label}{slot.required ? <span className="req">*</span> : ''}</div>
            <div className="rec-slot-meta">{slot.hint || '点击或拖拽 .xlsx 文件'}</div>
          </div>
        </button>
      )}
    </div>
  )
}

export default function UploadZone({ platform, uploads, onPick, onClear, onStart, canStart, reconciling, onLoadSample }) {
  const slots = [...platform.uploadSlots, JST_SLOT]
  return (
    <div className="rec-upload-zone">
      <div className="rec-upload-header">
        <FileSpreadsheet size={18}/>
        <span>上传 {platform.name} 对账文件</span>
        {platform.sampleFileUrl && (
          <button className="rec-load-sample" onClick={onLoadSample}>
            <Sparkles size={14}/> 加载演示数据
          </button>
        )}
      </div>
      <div className="rec-upload-grid">
        {slots.map(s => (
          <Slot key={s.key} slot={s} value={uploads[s.key]} onPick={onPick} onClear={onClear}/>
        ))}
      </div>
      <div className="rec-upload-actions">
        <button className="rec-primary" disabled={!canStart || reconciling} onClick={onStart}>
          {reconciling ? '对账中…' : '开始对账'}
        </button>
        {!canStart && <span className="rec-upload-hint">请上传所有必需文件</span>}
      </div>
    </div>
  )
}
