import { isAmountEqual, isProfitAnomaly } from './profit.js'
import { generateHint } from './aiHint.js'

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

// 在指定 period 下，按 styleCode 优先、productCode 兜底查找商品成本
function findCustomCost(items, period, styleCode, productCode) {
  if (!items || items.length === 0) return null
  for (const x of items) {
    if (x.period !== period) continue
    if (styleCode && x.styleCode === styleCode) return x
  }
  for (const x of items) {
    if (x.period !== period) continue
    if (productCode && x.productCode === productCode) return x
  }
  return null
}

function buildDiffRow(orderId, p, j, opts = {}) {
  let bucket = classify(p, j)

  const saleRevenue = p?.saleRevenue ?? 0
  const netSettled = p?.netSettled ?? 0
  const qty = j?.qty ?? 0
  const styleCode = j?.styleCode ?? null
  const productCode = j?.productCode ?? null

  // 成本：优先查商品成本表，没找到则回落聚水潭实发成本
  let shippedCost = j?.shippedCost ?? 0
  let costSource = 'jushuitan'
  if (opts.costItems && opts.period) {
    const c = findCustomCost(opts.costItems, opts.period, styleCode, productCode)
    if (c) {
      const unitCost = Number(c.baseCost || 0) + Number(c.tagFee || 0) + Number(c.accessoryFee || 0)
      shippedCost = unitCost * (qty || 1)
      costSource = 'custom'
    }
  }

  const systemProfit = j?.grossProfit ?? 0
  const realProfit = netSettled - shippedCost
  const diff = realProfit - systemProfit

  // upgrade matched/duplicated → profit_anomaly if applicable
  if ((bucket === 'matched' || bucket === 'duplicated') &&
      p && j && (j.refundedAmount || 0) === 0 &&
      isProfitAnomaly(diff, systemProfit)) {
    bucket = 'profit_anomaly'
  }

  return {
    orderId,
    styleCode,
    productCode,
    productName: j?.productName ?? null,
    qty,
    saleRevenue,
    netSettled,
    shippedCost,
    costSource,
    realProfit,
    systemProfit,
    profitDiff: diff,
    bucket,
    aiHint: generateHint({ bucket, saleRevenue, profitDiff: diff,
      jstBillAmountSum: j?.jstBillAmountSum ?? 0 }),
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

export function runReconcile(platformResult, jstOrders, opts = {}) {
  const platMap = new Map(platformResult.orders.map(o => [o.orderId, o]))
  const jstMap = new Map(jstOrders.map(o => [o.orderId, o]))

  const allIds = new Set([...platMap.keys(), ...jstMap.keys()])
  const diffRows = []
  for (const id of allIds) {
    diffRows.push(buildDiffRow(id, platMap.get(id), jstMap.get(id), opts))
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
    anomalyCount: diffRows.filter(r => r.bucket === 'profit_anomaly').length,
    customCostCount: diffRows.filter(r => r.costSource === 'custom').length
  }

  const skuStats = buildSkuStats(jstOrders)

  return {
    kpi,
    diffRows,
    skuStats,
    monthlyExpense: platformResult.monthlyExpense
  }
}
