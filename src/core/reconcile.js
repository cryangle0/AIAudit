import { isAmountEqual, isProfitAnomaly } from './profit.js'

function classify(p, j) {
  if (p && !j) return 'missing_in_jst'
  if (!p && j) return 'missing_in_platform'

  // duplicated: jst rowCount >= 2 AND jstBillAmountSum approximately = platform.saleRevenue * N (N>=2)
  if (j.rowCount >= 2 && Math.abs(p.saleRevenue) > 0.01) {
    const ratio = j.jstBillAmountSum / p.saleRevenue
    if (ratio >= 1.5 && Math.abs(ratio - Math.round(ratio)) < 0.05) {
      return 'duplicated'
    }
  }

  // matched: revenue 与净额 jstBillAmountSum 都对齐
  if (isAmountEqual(p.saleRevenue, j.jstBillAmountSum)) {
    return 'matched'
  }

  // 收入相互抵消的退款单 (saleRevenue=0, jstBillAmountSum=0) 也是 matched
  if (isAmountEqual(p.saleRevenue, 0) && isAmountEqual(j.jstBillAmountSum, 0)) {
    return 'matched'
  }

  return 'matched' // 兜底；后续会被 profit_anomaly 升级
}

function buildDiffRow(orderId, p, j) {
  let bucket = classify(p, j)

  const saleRevenue = p?.saleRevenue ?? 0
  const netSettled = p?.netSettled ?? 0
  const shippedCost = j?.shippedCost ?? 0
  const systemProfit = j?.grossProfit ?? 0

  const realProfit = netSettled - shippedCost
  const diff = realProfit - systemProfit

  // upgrade matched/duplicated → profit_anomaly if applicable
  if ((bucket === 'matched' || bucket === 'duplicated') &&
      p && j && isProfitAnomaly(diff, systemProfit)) {
    bucket = 'profit_anomaly'
  }

  return {
    orderId,
    styleCode: j?.styleCode ?? null,
    productName: j?.productName ?? null,
    saleRevenue,
    netSettled,
    shippedCost,
    realProfit,
    systemProfit,
    profitDiff: diff,
    bucket,
    aiHint: null,
    jstBillAmountSum: j?.jstBillAmountSum ?? 0,
    platformFlows: p?.flows ?? [],
    jstRows: j?.rows ?? []
  }
}

function buildSkuStats(jstOrders) {
  const m = new Map()
  for (const o of jstOrders) {
    const key = o.styleCode || '(空白)'
    if (!m.has(key)) {
      m.set(key, { styleCode: key, productName: o.productName,
        qty: 0, revenue: 0, cost: 0, profit: 0, profitRate: 0 })
    }
    const s = m.get(key)
    s.qty += o.qty
    s.revenue += o.amount
    s.cost += o.shippedCost
    s.profit += o.grossProfit
  }
  for (const s of m.values()) {
    s.profitRate = s.revenue === 0 ? 0 : s.profit / s.revenue
  }
  return Array.from(m.values()).sort((a, b) => b.profit - a.profit)
}

export function runReconcile(platformResult, jstOrders) {
  const platMap = new Map(platformResult.orders.map(o => [o.orderId, o]))
  const jstMap = new Map(jstOrders.map(o => [o.orderId, o]))

  const allIds = new Set([...platMap.keys(), ...jstMap.keys()])
  const diffRows = []
  for (const id of allIds) {
    diffRows.push(buildDiffRow(id, platMap.get(id), jstMap.get(id)))
  }

  const kpi = {
    totalOrders: diffRows.length,
    revenue: diffRows.reduce((s, r) => s + r.saleRevenue, 0),
    cost: diffRows.reduce((s, r) => s + r.shippedCost, 0),
    realProfit: diffRows.reduce((s, r) => s + r.realProfit, 0),
    systemProfit: diffRows.reduce((s, r) => s + r.systemProfit, 0),
    diffCount: diffRows.filter(r => r.bucket !== 'matched').length,
    duplicatedCount: diffRows.filter(r => r.bucket === 'duplicated').length,
    missingCount: diffRows.filter(r => r.bucket.startsWith('missing')).length,
    anomalyCount: diffRows.filter(r => r.bucket === 'profit_anomaly').length
  }

  const skuStats = buildSkuStats(jstOrders)

  return {
    kpi,
    diffRows,
    skuStats,
    monthlyExpense: platformResult.monthlyExpense
  }
}
