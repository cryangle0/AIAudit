import { useCallback, useMemo, useEffect } from 'react'
import './App.css'
import LoginPage from './components/LoginPage.jsx'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import ReconcileTab from './components/ReconcileTab.jsx'
import SkuProfitTab from './components/SkuProfitTab.jsx'
import { useReconcileStore } from './hooks/useReconcileStore.js'
import { platformsById, MOCK_SHOPS } from './platforms/index.js'
import { JST_SLOT } from './components/UploadZone.jsx'
import { readWorkbook, validateColumns } from './utils/excel.js'
import { parseJushuitan } from './core/jushuitan.js'
import { runReconcile } from './core/reconcile.js'

export default function App() {
  const { state, dispatch, login, logout } = useReconcileStore()

  useEffect(() => {
    document.body.classList.toggle('dark', state.darkMode)
  }, [state.darkMode])

  const platform = platformsById[state.platformId]
  const shops = MOCK_SHOPS[state.platformId] || []
  const shop = shops.find(s => s.id === state.shopId) || shops[0]
  const isMock = platform.status === 'mock'

  // 选中 mock 平台时，自动喂 mock 数据给引擎
  useEffect(() => {
    if (!state.authed) return
    if (!isMock) return
    if (state.result) return
    try {
      const bundle = platform.getMockBundle()
      const result = runReconcile(bundle.platformResult, bundle.jstOrders)
      dispatch({ type: 'RECONCILE_DONE', result, warnings: [] })
    } catch (e) {
      dispatch({ type: 'RECONCILE_FAIL', error: 'Mock 数据加载失败：' + e.message })
    }
  }, [state.authed, state.platformId, isMock, platform, state.result, dispatch])

  const requiredSlots = useMemo(() => {
    return [...platform.uploadSlots.filter(s => s.required), JST_SLOT]
  }, [platform])

  const canStart = requiredSlots.every(s => !!state.uploads[s.key])

  const onPick = useCallback(async (slot, file) => {
    try {
      const book = await readWorkbook(file)

      // 兼容：如果用户上传的是包含全部目标 sheet 的样例文件，一次性塞满槽位
      const allSlotMap = {}
      for (const s of platform.uploadSlots) allSlotMap[s.sheetName] = s
      allSlotMap[JST_SLOT.sheetName] = JST_SLOT
      let stuffed = false
      for (const [sheetName, slotDef] of Object.entries(allSlotMap)) {
        if (book[sheetName]) {
          const missing = validateColumns(book[sheetName], slotDef.requiredColumns || [])
          if (missing.length === 0) {
            dispatch({ type: 'SET_UPLOAD', key: slotDef.key,
              payload: { fileName: `${file.name} · ${sheetName}`, rows: book[sheetName] } })
            stuffed = true
          }
        }
      }
      if (stuffed) return

      const rows = book[slot.sheetName] || Object.values(book)[0]
      if (!rows) {
        dispatch({ type: 'RECONCILE_FAIL', error: `${slot.label}: 未找到工作表 "${slot.sheetName}"` })
        return
      }
      const missing = validateColumns(rows, slot.requiredColumns || [])
      if (missing.length) {
        dispatch({ type: 'RECONCILE_FAIL', error: `${slot.label} 缺少必需列：${missing.join('、')}` })
        return
      }
      dispatch({ type: 'SET_UPLOAD', key: slot.key, payload: { fileName: file.name, rows } })
    } catch (e) {
      dispatch({ type: 'RECONCILE_FAIL', error: `${slot.label} 解析失败：${e.message}` })
    }
  }, [dispatch, platform])

  const onClear = useCallback(slot => dispatch({ type: 'CLEAR_UPLOAD', key: slot.key }), [dispatch])

  const onStart = useCallback(() => {
    dispatch({ type: 'RECONCILE_START' })
    setTimeout(() => {
      try {
        const fundRows = state.uploads.fund?.rows || []
        const summaryRows = state.uploads.summary?.rows || []
        const jstRows = state.uploads.jst?.rows || []
        const platformResult = platform.transform({ fundRows, summaryRows })
        const jstOrders = parseJushuitan(jstRows)
        const result = runReconcile(platformResult, jstOrders)
        dispatch({ type: 'RECONCILE_DONE', result, warnings: [] })
      } catch (e) {
        dispatch({ type: 'RECONCILE_FAIL', error: '对账失败：' + e.message })
      }
    }, 200)
  }, [state.uploads, platform, dispatch])

  const onScopeChange = useCallback(scope => dispatch({ type: 'SELECT_SCOPE', ...scope }), [dispatch])
  const onTabChange = useCallback(tab => dispatch({ type: 'SET_TAB', tab }), [dispatch])
  const onExport = useCallback(() => {
    if (!state.result) return
    const head = ['订单号','款式','销售收入','净入账','成本','真实利润','系统毛利','毛利差','状态']
    const lines = [head.join(',')]
    for (const r of state.result.diffRows) {
      lines.push([r.orderId, r.styleCode || '', r.saleRevenue, r.netSettled,
        r.shippedCost, r.realProfit, r.systemProfit, r.profitDiff, r.bucket].join(','))
    }
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `对账_${state.platformId}_${state.month}.csv`; a.click()
    URL.revokeObjectURL(url)
  }, [state.result, state.platformId, state.month])

  if (!state.authed) return <LoginPage onLogin={login}/>

  return (
    <div className="app-layout">
      <Sidebar
        platformId={state.platformId} shopId={state.shopId} month={state.month}
        darkMode={state.darkMode}
        onScopeChange={onScopeChange}
        onToggleDark={() => dispatch({ type: 'TOGGLE_DARK' })}
        onLogout={logout}/>
      <div className="main-area">
        <TopBar
          platformName={platform.name} shopName={shop?.name || ''} month={state.month}
          activeTab={state.activeTab} onTabChange={onTabChange}
          onExport={onExport} canExport={!!state.result}/>
        {state.activeTab === 'reconcile' ? (
          <ReconcileTab
            platform={platform} uploads={state.uploads}
            onPick={onPick} onClear={onClear} onStart={onStart}
            canStart={canStart} reconciling={state.reconciling}
            result={state.result} error={state.error} parseWarnings={state.parseWarnings}
            isMock={isMock}/>
        ) : (
          <SkuProfitTab result={state.result}/>
        )}
      </div>
    </div>
  )
}
