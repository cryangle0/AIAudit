// 差异分析表（数据中心 → 差异分析）
// 上传 + 对账主入口。未对账时显示演示数据帮助用户理解界面形态

import { useState } from 'react'
import { PartyPopper, Sparkles } from 'lucide-react'
import KpiCards from '../components/KpiCards.jsx'
import DiffTable from '../components/DiffTable.jsx'
import MonthlyExpensePanel from '../components/MonthlyExpensePanel.jsx'
import UploadZone from '../components/UploadZone.jsx'
import { DEMO_RECONCILE_RESULT } from '../core/demoData.js'
import './pages.css'

export default function DiffAnalyzePage({
  platform, uploads, onPick, onClear, onStart, canStart,
  reconciling, result, error, parseWarnings, onLoadSample
}) {
  const [useDemo, setUseDemo] = useState(false)
  const showDemo = !result || useDemo
  const display = showDemo ? DEMO_RECONCILE_RESULT : result

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

      {showDemo && (
        <div className="rec-demo-banner">
          <Sparkles size={14}/>
          <span>当前为演示对账结果（2,541 单示例）。</span>
          {!result
            ? <span>上传账单并点击「开始对账」即可生成真实数据。</span>
            : <button className="rec-link-btn" onClick={() => setUseDemo(false)}>切换到真实数据</button>}
        </div>
      )}

      {!showDemo && result?.kpi.diffCount === 0 && (
        <div className="rec-banner-success"><PartyPopper size={16} /> 本月所有订单完全对齐</div>
      )}

      {!showDemo && result && (
        <div className="rec-toolbar">
          <span className="rec-spacer"/>
          <button className="rec-btn" onClick={() => setUseDemo(true)}>
            <Sparkles size={14}/> 查看演示数据
          </button>
        </div>
      )}

      {display && (
        <>
          <KpiCards kpi={display.kpi}/>
          <DiffTable rows={display.diffRows}/>
          <MonthlyExpensePanel items={display.monthlyExpense}/>
        </>
      )}
    </div>
  )
}
