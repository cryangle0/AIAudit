import { X } from 'lucide-react'
import { fmtMoney } from '../utils/format.js'
import './DiffDrawer.css'

export default function DiffDrawer({ row, onClose }) {
  if (!row) return null
  return (
    <div className="rec-drawer-mask" onClick={onClose}>
      <aside className="rec-drawer" onClick={e => e.stopPropagation()}>
        <header>
          <h3>订单 {row.orderId}</h3>
          <button onClick={onClose}><X size={16}/></button>
        </header>

        {row.aiHint && (
          <div className="rec-drawer-hint">
            <span className="rec-drawer-hint-tag">💬 AI</span>
            {row.aiHint}
          </div>
        )}

        <div className="rec-drawer-summary">
          <div><span>款式</span><strong>{row.styleCode || '—'}</strong></div>
          <div><span>商品</span><strong>{row.productName || '—'}</strong></div>
          <div><span>销售收入</span><strong>{fmtMoney(row.saleRevenue)}</strong></div>
          <div><span>净入账</span><strong>{fmtMoney(row.netSettled)}</strong></div>
          <div><span>成本</span><strong>{fmtMoney(row.shippedCost)}</strong></div>
          <div><span>真实利润</span><strong className={row.realProfit < 0 ? 'neg' : 'pos'}>{fmtMoney(row.realProfit)}</strong></div>
          <div><span>系统毛利</span><strong>{fmtMoney(row.systemProfit)}</strong></div>
          <div><span>毛利差</span><strong className={row.profitDiff < 0 ? 'neg' : ''}>{fmtMoney(row.profitDiff)}</strong></div>
        </div>

        <section>
          <h4>资金流水（{row.platformFlows.length} 笔）</h4>
          {row.platformFlows.length === 0 ? <div className="rec-drawer-empty">无</div> : (
            <table className="rec-mini">
              <thead><tr><th>时间</th><th>方向</th><th>金额</th><th>场景</th><th>备注</th></tr></thead>
              <tbody>
                {row.platformFlows.map((f, i) => (
                  <tr key={i}>
                    <td>{f.time ? String(f.time) : '—'}</td>
                    <td>{f.direction}</td>
                    <td>{fmtMoney(f.amount * (f.direction === '出账' ? -1 : 1))}</td>
                    <td>{f.scene}</td>
                    <td>{f.memo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section>
          <h4>聚水潭原始行（{row.jstRows.length}）</h4>
          {row.jstRows.length === 0 ? <div className="rec-drawer-empty">无</div> : (
            <pre className="rec-jst-raw">{JSON.stringify(row.jstRows, null, 2)}</pre>
          )}
        </section>
      </aside>
    </div>
  )
}
