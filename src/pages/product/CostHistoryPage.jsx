// 成本修改记录 — 需求 #4

import { useMemo, useState } from 'react'
import { History, Trash2, Download } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { exportSheets } from '../../utils/excelExport.js'
import { fmtMoney } from '../../utils/format.js'
import '../pages.css'

const ACTION_LABEL = {
  create: '新增', update: '修改', delete: '删除', import: '批量导入'
}

export default function CostHistoryPage({ costHistory }) {
  const { logs, clearAll } = costHistory
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    return filter === 'all' ? logs : logs.filter(l => l.action === filter)
  }, [logs, filter])

  const onExport = () => {
    exportSheets([{
      name: '成本修改记录',
      columns: [
        { key: 'time', label: '修改时间', width: 18 },
        { key: 'operator', label: '修改人', width: 12 },
        { key: 'action', label: '操作', width: 10 },
        { key: 'period', label: '期间', width: 10 },
        { key: 'styleCode', label: '款式编码', width: 18 },
        { key: 'productCode', label: '商品编码', width: 22 },
        { key: 'field', label: '字段', width: 12 },
        { key: 'oldValue', label: '修改前', width: 12 },
        { key: 'newValue', label: '修改后', width: 12 }
      ],
      rows: logs.map(l => ({
        time: new Date(l.timestamp).toLocaleString(),
        operator: l.operator, action: ACTION_LABEL[l.action] || l.action,
        period: l.period, styleCode: l.styleCode, productCode: l.productCode,
        field: l.field, oldValue: l.oldValue, newValue: l.newValue
      }))
    }], `成本修改记录_${Date.now()}`)
  }

  if (logs.length === 0) {
    return (
      <div className="rec-page">
        <PageHeader title="成本修改记录" subtitle="记录每次成本变更的时间/操作人/前后值（需求 #4）"/>
        <EmptyState icon="alert" title="暂无修改记录"
          desc="商品成本被新增、修改或导入时会自动生成记录。"/>
      </div>
    )
  }

  return (
    <div className="rec-page">
      <PageHeader
        title="成本修改记录"
        subtitle="记录每次成本变更的时间/操作人/前后值（需求 #4）"
        extra={
          <>
            <button className="rec-btn" onClick={onExport}>
              <Download size={14}/> 导出 Excel
            </button>
            <button className="rec-btn danger" onClick={() => {
              if (confirm(`确认清空 ${logs.length} 条历史记录？此操作不可恢复。`)) clearAll()
            }}>
              <Trash2 size={14}/> 清空
            </button>
          </>
        }/>

      <div className="rec-toolbar">
        <span>筛选：</span>
        {[
          ['all', '全部'], ['create', '新增'], ['update', '修改'],
          ['delete', '删除'], ['import', '批量导入']
        ].map(([k, l]) => (
          <button key={k} className={`rec-pill ${filter === k ? 'active' : ''}`}
            onClick={() => setFilter(k)}>{l}</button>
        ))}
        <span className="rec-spacer"/>
        <span className="rec-muted">{filtered.length} 条记录</span>
      </div>

      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr>
              <th>时间</th><th>操作人</th><th>操作</th>
              <th>期间</th><th>款式编码</th><th>商品编码</th>
              <th>字段</th><th>修改前</th><th>修改后</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 500).map(l => (
              <tr key={l.id}>
                <td>{new Date(l.timestamp).toLocaleString()}</td>
                <td>{l.operator}</td>
                <td>
                  <span className={`rec-tag-${l.action === 'delete' ? 'neg' : 'pos'}`}>
                    {ACTION_LABEL[l.action] || l.action}
                  </span>
                </td>
                <td>{l.period || '—'}</td>
                <td className="mono">{l.styleCode || '—'}</td>
                <td className="mono">{l.productCode || '—'}</td>
                <td>{l.field || '—'}</td>
                <td className="rec-muted">{formatVal(l.oldValue)}</td>
                <td><strong>{formatVal(l.newValue)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function formatVal(v) {
  if (v == null || v === '') return '—'
  if (typeof v === 'number') return fmtMoney(v)
  return String(v)
}
