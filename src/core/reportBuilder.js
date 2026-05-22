// 报表生成器 — 严格按客户《系统初稿模板5.22》字段
//
// 4 个核心报表：
//   buildBillSummaryFromReconcile  — 账单汇总表（店铺级）
//   buildBillDetailFromReconcile   — 账单明细表（订单级）
//   buildShopProfitFromReconcile   — 店铺利润表（店铺级，单店或多店）
//   buildProductProfitFromReconcile — 商品利润表（商品级）
//
// 应收汇总/明细仍保留旧实现，用于「应收」体系。

import { runAllocation } from './allocate.js'

function num(v) { return Number(v || 0) }

// 根据 fund flow 的 scene 关键字归类业务类型
function classifyIncome(scene) {
  const s = String(scene || '')
  if (s.includes('花呗')) return 'huabei'
  if (s.includes('保证金') && (s.includes('退') || s.includes('返'))) return 'techRefund'
  if (s.includes('技术服务') && (s.includes('退') || s.includes('返'))) return 'techRefund'
  return 'orderIncome'
}

function classifyExpense(scene) {
  const s = String(scene || '')
  if (s.includes('服务费') || s.includes('技术')) return 'platformFee'
  if (s.includes('佣金') || s.includes('返点') || s.includes('淘宝客') || s.includes('积分')) return 'commission'
  if (s.includes('保证金') || s.includes('理赔')) return 'tmallDeposit'
  if (s.includes('转账')) return 'transfer'
  if (s.includes('提现')) return 'withdraw'
  return 'platformFee'  // 兜底
}

// ============================================================================
// 账单汇总表 — 按客户模板字段
// ============================================================================
export function buildBillSummaryFromReconcile({ reconcileResult, shopName, platformName, openBalance = 0 }) {
  const flows = []
  for (const r of reconcileResult?.diffRows || []) {
    for (const f of r.platformFlows || []) flows.push(f)
  }

  const row = {
    platform: platformName || '-', shop: shopName || '-',
    openBalance: openBalance,
    orderIncome: 0, huabei: 0, techRefund: 0, incomeTotal: 0,
    platformFee: 0, commission: 0, tmallDeposit: 0, transfer: 0, withdraw: 0, expenseTotal: 0,
    endBalance: 0
  }

  for (const f of flows) {
    const amt = num(f.amount)
    if (f.direction === '入账') {
      const k = classifyIncome(f.scene)
      row[k] += amt
    } else if (f.direction === '出账') {
      const k = classifyExpense(f.scene)
      row[k] += amt
    }
  }
  row.incomeTotal = row.orderIncome + row.huabei + row.techRefund
  row.expenseTotal = row.platformFee + row.commission + row.tmallDeposit + row.transfer + row.withdraw
  row.endBalance = row.openBalance + row.incomeTotal - row.expenseTotal

  return [row]
}

// ============================================================================
// 账单明细表 — 按订单聚合
// ============================================================================
export function buildBillDetailFromReconcile({ reconcileResult, shopName, platformName }) {
  const out = []
  for (const r of reconcileResult?.diffRows || []) {
    const row = {
      platform: platformName || '-', shop: shopName || '-',
      orderId: r.orderId, styleCode: r.styleCode || '—',
      orderIncome: 0, huabei: 0, techRefund: 0, incomeTotal: 0,
      platformFee: 0, commission: 0, tmallDeposit: 0, transfer: 0, withdraw: 0, expenseTotal: 0
    }
    for (const f of r.platformFlows || []) {
      const amt = num(f.amount)
      if (f.direction === '入账') {
        row[classifyIncome(f.scene)] += amt
      } else if (f.direction === '出账') {
        row[classifyExpense(f.scene)] += amt
      }
    }
    row.incomeTotal = row.orderIncome + row.huabei + row.techRefund
    row.expenseTotal = row.platformFee + row.commission + row.tmallDeposit + row.transfer + row.withdraw
    if (row.incomeTotal > 0 || row.expenseTotal > 0) out.push(row)
  }
  return out
}

// ============================================================================
// 店铺利润表 — 按客户 Excel 真实表头
// ============================================================================
export function buildShopProfitFromReconcile({
  reconcileResult, shopName, costItems = [], feeRecords = [], allocStandards = [], period
}) {
  const diffRows = reconcileResult?.diffRows || []

  // 销售收入板块
  const revenue = diffRows.reduce((s, r) => s + r.saleRevenue, 0)
  const refund = diffRows
    .filter(r => r.saleRevenue < 0)
    .reduce((s, r) => s + Math.abs(r.saleRevenue), 0)
  const noAfterSale = revenue + refund   // = "毛收入"
  const netRevenue = revenue              // 销售净收入

  // 销售成本板块（基于商品成本表 + 聚水潭兜底）
  let productCost = 0, tagCost = 0, accessoryCost = 0
  let shippedQty = 0, returnedQty = 0
  for (const r of diffRows) {
    const qty = r.qty || 0
    if (qty > 0) {
      shippedQty += qty
      const c = (costItems || []).find(x =>
        x.period === period && (x.styleCode === r.styleCode || x.productCode === r.productCode))
      if (c) {
        productCost += num(c.baseCost) * qty
        tagCost += num(c.tagFee) * qty
        accessoryCost += num(c.accessoryFee) * qty
      } else {
        productCost += r.shippedCost || 0
      }
    } else if (qty < 0) {
      returnedQty += Math.abs(qty)
    }
  }
  const shippingCost = 0 // 待"快递费"费用类型录入
  const costTotal = productCost + tagCost + accessoryCost + shippingCost

  // 销售费用板块 — 来自分配引擎
  const allocResult = runAllocation({
    feeRecords, standards: allocStandards, reconcileResult, period
  })
  let platformFee = 0, commission = 0, promoFee = 0, insurance = 0, redPacket = 0, subsidy = 0
  for (const a of allocResult.allocations) {
    switch (a.feeType) {
      case '平台服务费': platformFee += a.amount; break
      case '佣金': commission += a.amount; break
      case '推广费': promoFee += a.amount; break
      case '运费险': insurance += a.amount; break
      case '红包': redPacket += a.amount; break
      case '补贴': subsidy += a.amount; break
    }
  }
  const feeTotal = platformFee + commission + promoFee + insurance + redPacket + subsidy

  const profit = netRevenue - costTotal - feeTotal
  const profitRate = netRevenue > 0 ? profit / netRevenue : 0
  const returnRate = (shippedQty + returnedQty) > 0 ? returnedQty / (shippedQty + returnedQty) : 0

  return {
    shopName: shopName || '-',
    revenue, noAfterSale, refund, netRevenue,
    shippedQty, returnedQty, productCost, tagCost, accessoryCost, shippingCost, costTotal,
    platformFee, commission, promoFee, insurance, redPacket, subsidy, feeTotal,
    profit, profitRate, returnRate
  }
}

// ============================================================================
// 商品利润表 — 按客户 Excel 真实表头（订单级）
// ============================================================================
export function buildProductProfitFromReconcile({
  reconcileResult, costItems = [], feeRecords = [], allocStandards = [], period, shopName
}) {
  const diffRows = reconcileResult?.diffRows || []

  // 分配费用 → 按订单
  const allocResult = runAllocation({
    feeRecords, standards: allocStandards, reconcileResult, period
  })
  const allocByOrder = new Map()
  for (const a of allocResult.allocations) {
    if (!a.platformOrderId) continue
    allocByOrder.set(a.platformOrderId, (allocByOrder.get(a.platformOrderId) || 0) + a.amount)
  }

  return diffRows.map(r => {
    const qty = r.qty || 0
    const revenue = r.saleRevenue || 0
    const price = qty > 0 ? revenue / qty : 0

    // 成本：自维护 → 聚水潭兜底
    const c = (costItems || []).find(x =>
      x.period === period && (x.styleCode === r.styleCode || x.productCode === r.productCode))
    const cost = c ? num(c.baseCost) * qty : (r.shippedCost || 0)
    const tagFee = c ? num(c.tagFee) * qty : 0
    const accessoryFee = c ? num(c.accessoryFee) * qty : 0
    const allocFee = allocByOrder.get(r.orderId) || 0

    const profit = revenue - cost - tagFee - accessoryFee - allocFee
    const profitRate = revenue > 0 ? profit / revenue : 0

    return {
      shopName: shopName || '-',
      orderId: r.orderId,
      styleCode: r.styleCode || '—',
      productCode: r.productCode || '—',
      productName: r.productName || '—',
      category: '—',
      qty, price, revenue,
      cost, tagFee, accessoryFee,
      profit, profitRate,
      memo: r.bucket !== 'matched' ? r.bucket : ''
    }
  }).filter(r => r.qty !== 0)
}

// ============================================================================
// 旧版应收表（保持兼容）
// ============================================================================

function buildBaseAggregates(reconcileResult, shopName) {
  const diffRows = reconcileResult?.diffRows || []
  const byShopSku = new Map()

  for (const r of diffRows) {
    const key = `${shopName}||${r.styleCode || '—'}`
    if (!byShopSku.has(key)) {
      byShopSku.set(key, {
        shop: shopName, styleCode: r.styleCode || '—',
        productCode: r.productCode || '—', productName: r.productName || '—',
        qty: 0, billAmount: 0, settledAmount: 0, refundAmount: 0, orderCount: 0
      })
    }
    const a = byShopSku.get(key)
    a.qty += r.qty || 0
    a.billAmount += r.saleRevenue || 0
    a.settledAmount += Math.max(r.netSettled || 0, 0)
    a.refundAmount += r.refundAmount || 0
    a.orderCount += 1
  }
  return Array.from(byShopSku.values())
}

export function buildRecvSummary({ reconcileResult, shopName, openingBalances = [] }) {
  const aggregates = buildBaseAggregates(reconcileResult, shopName)
  const openMap = new Map(openingBalances.map(o => [`${o.shop}||${o.styleCode}`, o]))

  return aggregates.map(a => {
    const open = openMap.get(`${a.shop}||${a.styleCode}`) || { qty: 0, amount: 0 }
    const openQty = num(open.qty), openAmount = num(open.amount)
    const recvQty = a.qty, recvAmount = a.billAmount
    const avgPrice = recvQty > 0 ? recvAmount / recvQty : 0
    const writeoffAmount = a.settledAmount
    const writeoffQty = avgPrice > 0 ? Math.round(writeoffAmount / avgPrice) : 0
    return {
      shop: a.shop, styleCode: a.styleCode, productCode: a.productCode, productName: a.productName,
      openQty, openAmount, recvQty, recvAmount, writeoffQty, writeoffAmount,
      endQty: openQty + recvQty - writeoffQty, endAmount: openAmount + recvAmount - writeoffAmount
    }
  }).sort((a, b) => b.recvAmount - a.recvAmount)
}

export function buildRecvDetail({ reconcileResult, shopName, period }) {
  const diffRows = reconcileResult?.diffRows || []
  return diffRows.map(r => {
    const recvQty = r.qty || 0
    const recvAmount = r.saleRevenue || 0
    const writeoffAmount = Math.max(r.netSettled || 0, 0)
    const avgPrice = recvQty > 0 ? recvAmount / recvQty : 0
    const writeoffQty = avgPrice > 0 ? Math.round(writeoffAmount / avgPrice) : 0
    return {
      period, shop: shopName, orderId: r.orderId,
      styleCode: r.styleCode || '—', productCode: r.productCode || '—', productName: r.productName || '—',
      openQty: 0, openAmount: 0, recvQty, recvAmount, writeoffQty, writeoffAmount,
      endQty: recvQty - writeoffQty, endAmount: recvAmount - writeoffAmount,
      bucket: r.bucket
    }
  })
}

// 旧版（保留以兼容老 import）
export const buildBillSummary = buildBillSummaryFromReconcile
export const buildBillDetail = buildBillDetailFromReconcile

// ============================================================================
// 利润分析表 — 多维度
// ============================================================================
function inferCategory(styleCode) {
  if (!styleCode || styleCode === '—') return '未分类'
  return styleCode.slice(0, 3) + '*'
}

export function buildProfitAnalyze({ reconcileResult, allocResult, costItems, shopName, platformId, period }) {
  const diffRows = reconcileResult?.diffRows || []
  const allocations = allocResult?.allocations || []

  const allocByOrder = new Map()
  for (const a of allocations) {
    if (!a.platformOrderId) continue
    allocByOrder.set(a.platformOrderId, (allocByOrder.get(a.platformOrderId) || 0) + a.amount)
  }

  const findCustomCost = (styleCode, productCode) => {
    if (!costItems) return null
    for (const x of costItems) {
      if (x.period !== period) continue
      if (styleCode && x.styleCode === styleCode) return x
    }
    for (const x of costItems) {
      if (x.period !== period) continue
      if (productCode && x.productCode === productCode) return x
    }
    return null
  }

  const skuMap = new Map()
  for (const r of diffRows) {
    const key = r.styleCode || '—'
    if (!skuMap.has(key)) {
      skuMap.set(key, {
        dimension: '商品',
        styleCode: key, productCode: r.productCode, productName: r.productName,
        shop: shopName, platform: platformId, category: inferCategory(key),
        revenue: 0, cost: 0, fee: 0, qty: 0
      })
    }
    const m = skuMap.get(key)
    m.revenue += r.saleRevenue || 0
    m.qty += r.qty || 0
    const customCost = findCustomCost(r.styleCode, r.productCode)
    if (customCost) {
      const unitCost = num(customCost.baseCost) + num(customCost.tagFee) + num(customCost.accessoryFee)
      m.cost += unitCost * (r.qty || 1)
    } else {
      m.cost += r.shippedCost || 0
    }
    m.fee += allocByOrder.get(r.orderId) || 0
  }

  const skuRows = Array.from(skuMap.values()).map(x => ({
    ...x, profit: x.revenue - x.cost - x.fee,
    profitRate: x.revenue > 0 ? (x.revenue - x.cost - x.fee) / x.revenue : 0
  }))

  const rollup = (groupKey, dimensionLabel) => {
    const map = new Map()
    for (const s of skuRows) {
      const k = s[groupKey] || '—'
      if (!map.has(k)) map.set(k, { dimension: dimensionLabel, key: k,
        revenue: 0, cost: 0, fee: 0, profit: 0, qty: 0 })
      const m = map.get(k)
      m.revenue += s.revenue; m.cost += s.cost; m.fee += s.fee; m.qty += s.qty
      m.profit += s.profit
    }
    return Array.from(map.values()).map(x => ({
      ...x, profitRate: x.revenue > 0 ? x.profit / x.revenue : 0
    })).sort((a, b) => b.profit - a.profit)
  }

  return {
    sku: skuRows.sort((a, b) => b.profit - a.profit),
    byPlatform: rollup('platform', '平台'),
    byShop: rollup('shop', '店铺'),
    byCategory: rollup('category', '品类')
  }
}
