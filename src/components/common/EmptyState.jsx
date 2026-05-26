// 通用空态组件
import { AlertCircle, Construction, FileSpreadsheet } from 'lucide-react'
import './common.css'

const ICON_MAP = {
  alert: AlertCircle,
  build: Construction,
  file:  FileSpreadsheet
}

export default function EmptyState({ icon = 'alert', title, desc, action }) {
  const Icon = ICON_MAP[icon] || AlertCircle
  return (
    <div className="rec-placeholder">
      <Icon size={28}/>
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
      {action}
    </div>
  )
}
