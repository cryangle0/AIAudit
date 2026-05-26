// 页头组件 — 统一标题 + 子标题
import './common.css'

export default function PageHeader({ title, subtitle, extra }) {
  return (
    <div className="rec-page-head rec-page-head-flex">
      <div>
        <h2>{title}</h2>
        {subtitle && <div className="rec-page-sub">{subtitle}</div>}
      </div>
      {extra && <div className="rec-page-head-extra">{extra}</div>}
    </div>
  )
}
