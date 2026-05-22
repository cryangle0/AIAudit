// 差异分析表（报表中心 → 差异分析）
// 严格按客户模板：发货金额/退货金额/收款金额/退款金额/差额调整/净收入
// 双击行下钻订单细节

import { PartyPopper } from 'lucide-react'
import KpiCards from '../components/KpiCards.jsx'
import DiffTable from '../components/DiffTable.jsx'
import MonthlyExpensePanel from '../components/MonthlyExpensePanel.jsx'
import UploadZone from '../components/UploadZone.jsx'
import './pages.css'

export default function DiffAnalyzePage({
  platform, uploads, onPick, onClear, onStart, canStart,
  reconciling, result, error, parseWarnings, onLoadSample
}) {
  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>差异分析表</h2>
        <div className="rec-page-sub">
          按店铺/平台单号汇总：发货金额、退货金额、收款金额、退款金额、差额调整、净收入。
          双击行查看对应平台单号的对账明细（订单/发货/退货/收款/退款/调整/其他）。
        </div>
      </div>

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
