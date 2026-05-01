import { PartyPopper } from 'lucide-react'
import KpiCards from './KpiCards.jsx'
import DiffTable from './DiffTable.jsx'
import MonthlyExpensePanel from './MonthlyExpensePanel.jsx'
import UploadZone from './UploadZone.jsx'
import './ReconcileTab.css'

export default function ReconcileTab({
  platform, uploads, onPick, onClear, onStart, canStart,
  reconciling, result, error, parseWarnings, onLoadSample
}) {
  return (
    <div className="rec-tab-content">
      {error && <div className="rec-error">{error}</div>}
      {parseWarnings.length > 0 && (
        <div className="rec-warn">
          {parseWarnings.length} 行解析失败，已跳过：{parseWarnings.slice(0, 3).join('；')}{parseWarnings.length > 3 ? '…' : ''}
        </div>
      )}

      <UploadZone
        platform={platform}
        uploads={uploads}
        onPick={onPick} onClear={onClear} onStart={onStart}
        canStart={canStart} reconciling={reconciling}
        onLoadSample={onLoadSample}/>

      {result && (
        <>
          {result.kpi.diffCount === 0 && (
            <div className="rec-banner-success"><PartyPopper size={16} /> 本月所有订单完全对齐</div>
          )}
          <KpiCards kpi={result.kpi}/>
          <DiffTable rows={result.diffRows}/>
          <MonthlyExpensePanel items={result.monthlyExpense}/>
        </>
      )}
    </div>
  )
}
