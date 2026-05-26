// 演示数据横幅 — 报表无真实数据时显示
import { Sparkles } from 'lucide-react'
import './common.css'

export default function DemoBanner({ canSwitchToReal, onSwitchToReal, hasReal }) {
  return (
    <div className="rec-demo-banner">
      <Sparkles size={14}/>
      <span>当前显示演示数据。</span>
      {hasReal
        ? <button className="rec-link-btn" onClick={onSwitchToReal}>切换到真实数据</button>
        : <span>完成对账后将生成真实数据。</span>}
    </div>
  )
}
