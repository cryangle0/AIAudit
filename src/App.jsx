import { useCallback, useMemo, useEffect } from 'react'
import './App.css'
import LoginPage from './components/LoginPage.jsx'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import DiffAnalyzePage from './pages/DiffAnalyzePage.jsx'
import ProductCostPage from './pages/ProductCostPage.jsx'
import ProductProfitPage from './pages/ProductProfitPage.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import { useReconcileStore } from './hooks/useReconcileStore.js'
import { useSettings } from './hooks/useSettings.js'
import { useProductCost } from './hooks/useProductCost.js'
import { platformsById, MOCK_SHOPS } from './platforms/index.js'
import { JST_SLOT } from './components/UploadZone.jsx'
import { readWorkbook, validateColumns } from './utils/excel.js'
import { parseJushuitan } from './core/jushuitan.js'
import { runReconcile } from './core/reconcile.js'
import { PAGE_META, DEFAULT_PAGE } from './core/menuStructure.js'

async function pickFromBook(book, slot, platform, dispatch, fileLabel) {
  // 把 book 里所有匹配的 sheet 一次性塞进对应槽位（兼容含多 sheet 的样例文件）
  const allSlotMap = {}
  for (const s of platform.uploadSlots) allSlotMap[s.sheetName] = s
  allSlotMap[JST_SLOT.sheetName] = JST_SLOT
  let stuffed = false
  for (const [sheetName, slotDef] of Object.entries(allSlotMap)) {
    if (book[sheetName]) {
      const missing = validateColumns(book[sheetName], slotDef.requiredColumns || [])
      if (missing.length === 0) {
        dispatch({ type: 'SET_UPLOAD', key: slotDef.key,
          payload: { fileName: `${fileLabel} · ${sheetName}`, rows: book[sheetName] } })
        stuffed = true
      }
    }
  }

  // 聚水潭模糊匹配：如果精确 sheet 名没命中 JST 槽位，尝试找包含必需列的 sheet
  const jstStuffed = stuffed && book[JST_SLOT.sheetName] &&
    validateColumns(book[JST_SLOT.sheetName], JST_SLOT.requiredColumns).length === 0
  if (!jstStuffed) {
    for (const [sheetName, rows] of Object.entries(book)) {
      if (!rows || rows.length === 0) continue
      const missing = validateColumns(rows, JST_SLOT.requiredColumns)
      if (missing.length === 0) {
        dispatch({ type: 'SET_UPLOAD', key: JST_SLOT.key,
          payload: { fileName: `${fileLabel} · ${sheetName}`, rows } })
        stuffed = true
        break
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
  dispatch({ type: 'SET_UPLOAD', key: slot.key, payload: { fileName: fileLabel, rows } })
}

export default function App() {
  const { state, dispatch, login, logout } = useReconcileStore()
  const [settings, updateSettings, resetSettings] = useSettings()
  const productCost = useProductCost()

  const pageId = state.pageId || DEFAULT_PAGE

  useEffect(() => {
    document.body.classList.toggle('dark', state.darkMode)
  }, [state.darkMode])

  // 设置变化导致当前选中的平台/店铺不可用时，自动切换到合法值
  useEffect(() => {
    const enabled = settings.enabledPlatforms
    if (enabled.length === 0) return

    let nextPid = state.platformId
    if (!enabled.includes(nextPid)) nextPid = enabled[0]

    const allShops = [
      ...(MOCK_SHOPS[nextPid] || []),
      ...(settings.customShops[nextPid] || [])
    ]
    const ids = allShops.map(s => s.id)
    let nextSid = state.shopId
    if (!ids.includes(nextSid)) nextSid = allShops[0]?.id

    if (nextPid !== state.platformId || nextSid !== state.shopId) {
      dispatch({ type: 'SELECT_SCOPE', platformId: nextPid, shopId: nextSid, month: state.month })
    }
  }, [settings.enabledPlatforms, settings.customShops, state.platformId, state.shopId, state.month, dispatch])

  const platform = platformsById[state.platformId]
  const shops = MOCK_SHOPS[state.platformId] || []
  const shop = shops.find(s => s.id === state.shopId) || shops[0]

  const requiredSlots = useMemo(() => {
    return [...platform.uploadSlots.filter(s => s.required), JST_SLOT]
  }, [platform])

  const canStart = requiredSlots.every(s => !!state.uploads[s.key])

  const onPick = useCallback(async (slot, file) => {
    try {
      const book = await readWorkbook(file)
      await pickFromBook(book, slot, platform, dispatch, file.name)
    } catch (e) {
      dispatch({ type: 'RECONCILE_FAIL', error: `${slot.label} 解析失败：${e.message}` })
    }
  }, [dispatch, platform])

  const onClear = useCallback(slot => dispatch({ type: 'CLEAR_UPLOAD', key: slot.key }), [dispatch])

  const onLoadSample = useCallback(async () => {
    if (!platform.sampleFileUrl) return
    try {
      const url = import.meta.env.BASE_URL + platform.sampleFileUrl.replace(/^\//, '')
      const resp = await fetch(url)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const blob = await resp.blob()
      const file = new File([blob], `${platform.id}.xlsx`, { type: blob.type })
      const book = await readWorkbook(file)
      const fakeSlot = platform.uploadSlots[0]
      await pickFromBook(book, fakeSlot, platform, dispatch, `演示数据 · ${platform.name}`)
    } catch (e) {
      dispatch({ type: 'RECONCILE_FAIL', error: `加载演示数据失败：${e.message}` })
    }
  }, [platform, dispatch])

  const onStart = useCallback(() => {
    dispatch({ type: 'RECONCILE_START' })
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          const fundRows = state.uploads.fund?.rows || []
          const summaryRows = state.uploads.summary?.rows || []
          const jstRows = state.uploads.jst?.rows || []
          const platformResult = platform.transform({ fundRows, summaryRows })
          const jstOrders = parseJushuitan(jstRows)
          // 把当前期间的商品成本传给对账引擎
          const result = runReconcile(platformResult, jstOrders, {
            costItems: productCost.items,
            period: state.month
          })
          dispatch({ type: 'RECONCILE_DONE', result, warnings: [] })
        } catch (e) {
          dispatch({ type: 'RECONCILE_FAIL', error: '对账失败：' + e.message })
        }
      }, 50)
    })
  }, [state.uploads, state.month, platform, dispatch, productCost.items])

  const onScopeChange = useCallback(scope => dispatch({ type: 'SELECT_SCOPE', ...scope }), [dispatch])
  const onPageChange = useCallback(p => dispatch({ type: 'SET_PAGE', pageId: p }), [dispatch])

  const onExport = useCallback(() => {
    if (!state.result) return
    const head = ['订单号','款式','商品编码','销售收入','净入账','销售件数','成本','成本来源','真实利润','系统毛利','毛利差','状态']
    const csvCell = v => {
      const s = String(v ?? '')
      return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = [head.join(',')]
    for (const r of state.result.diffRows) {
      lines.push([
        csvCell(r.orderId), csvCell(r.styleCode || ''), csvCell(r.productCode || ''),
        r.saleRevenue, r.netSettled, r.qty || 0,
        r.shippedCost, r.costSource === 'custom' ? '自维护' : '聚水潭',
        r.realProfit, r.systemProfit, r.profitDiff, r.bucket
      ].join(','))
    }
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `对账_${state.platformId}_${state.month}.csv`; a.click()
    URL.revokeObjectURL(url)
  }, [state.result, state.platformId, state.month])

  if (!state.authed) return <LoginPage onLogin={login}/>

  // 当前页是否需要 TopBar 显示对账上下文
  const isReconcileContextPage = ['diff-analyze', 'product-profit'].includes(pageId)

  const renderPage = () => {
    switch (pageId) {
      case 'diff-analyze':
        return (
          <DiffAnalyzePage
            platform={platform} uploads={state.uploads}
            onPick={onPick} onClear={onClear} onStart={onStart}
            canStart={canStart} reconciling={state.reconciling}
            result={state.result} error={state.error} parseWarnings={state.parseWarnings}
            onLoadSample={onLoadSample}/>
        )
      case 'product-cost':
        return <ProductCostPage currentPeriod={state.month}/>
      case 'product-profit':
        return <ProductProfitPage
          result={state.result} costItems={productCost.items} currentPeriod={state.month}/>
      default:
        return <PlaceholderPage pageId={pageId}/>
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        pageId={pageId}
        platformId={state.platformId} shopId={state.shopId} month={state.month}
        darkMode={state.darkMode}
        settings={settings}
        updateSettings={updateSettings}
        resetSettings={resetSettings}
        onPageChange={onPageChange}
        onScopeChange={onScopeChange}
        onToggleDark={() => dispatch({ type: 'TOGGLE_DARK' })}
        onLogout={logout}/>
      <div className="main-area">
        <TopBar
          pageMeta={PAGE_META[pageId]}
          showScope={isReconcileContextPage}
          platformName={platform.name} shopName={shop?.name || ''} month={state.month}
          onExport={onExport}
          canExport={!!state.result && pageId === 'diff-analyze'}/>
        {renderPage()}
      </div>
    </div>
  )
}
