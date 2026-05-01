import KpiCards from './KpiCards.jsx'
import DiffTable from './DiffTable.jsx'
import MonthlyExpensePanel from './MonthlyExpensePanel.jsx'
import UploadZone from './UploadZone.jsx'
import './ReconcileTab.css'

export default function ReconcileTab({
  platform, uploads, onPick, onClear, onStart, canStart,
  reconciling, result, error, parseWarnings, isMock
}) {
  return (
    <div className="rec-tab-content">
      {isMock && (
        <div className="rec-mock-banner">
          🎭 演示数据 — 此平台真实账单接入中。当前数据由原型生成，用于展示 AI对账完整流程
        </div>
      )}

      {error && <div className="rec-error">{error}</div>}
      {parseWarnings.length > 0 && (
        <div className="rec-warn">
          {parseWarnings.length} 行解析失败，已跳过：{parseWarnings.slice(0, 3).join('；')}{parseWarnings.length > 3 ? '…' : ''}
        </div>
      )}

      {!isMock && (
        <UploadZone
          platform={platform}
          uploads={uploads}
          onPick={onPick} onClear={onClear} onStart={onStart}
          canStart={canStart} reconciling={reconciling}/>
      )}

      {result && (
        <>
          {result.kpi.diffCount === 0 && (
            <div className="rec-banner-success">🎉 本月所有订单完全对齐</div>
          )}
          <KpiCards kpi={result.kpi}/>
          <DiffTable rows={result.diffRows}/>
          <MonthlyExpensePanel items={result.monthlyExpense}/>
        </>
      )}
    </div>
  )
}
