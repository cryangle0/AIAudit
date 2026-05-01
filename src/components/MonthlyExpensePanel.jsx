import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { fmtMoney } from '../utils/format.js'
import './MonthlyExpensePanel.css'

export default function MonthlyExpensePanel({ items }) {
  const [open, setOpen] = useState(false)
  if (!items || items.length === 0) return null
  const total = items.reduce((s, i) => s + i.totalAmount, 0)
  return (
    <section className="rec-monthly">
      <button className="rec-monthly-head" onClick={() => setOpen(!open)}>
        {open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
        <span>月度公共扣费</span>
        <span className="rec-monthly-meta">{items.length} 类</span>
        <span className="rec-monthly-total">{fmtMoney(total)}</span>
      </button>
      {open && (
        <div className="rec-monthly-body">
          {items.map(i => (
            <div key={i.scene} className="rec-monthly-row">
              <div className="rec-monthly-scene">{i.scene}</div>
              <div className="rec-monthly-count">{i.count} 笔</div>
              <div className={`rec-monthly-amount ${i.totalAmount < 0 ? 'neg' : ''}`}>{fmtMoney(i.totalAmount)}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
