// 分配引擎 — 三层分配（组织 → 店铺 → 订单商品）
//
// 输入：
//   feeRecords:   FeeRecord[]   （数据归集得到，含费用类型/组织/店铺/平台单号/金额）
//   standards:    Standard[]    （分配标准，按 priority 升序匹配）
//   reconcileResult:  runReconcile() 输出（包含 diffRows 已携带订单/SKU/收入/件数）
//   period:       'YYYY-MM'
//   shopMap:      { shopId: { id, name, platformId } }
//
// 输出：
//   allocations: Allocation[] {
//     id, feeRecordId, feeType, amount,
//     orgId, shopId, platformOrderId, styleCode, productCode,
//     standardId, standardName, method, scope, level('org'|'shop'|'sku'),
//     ratio, basisField, basisValue
//   }
//   summary: { totalFees, allocated, unallocated, byOrg, byShop, bySku }

function pickStandard(standards, feeType) {
  const sorted = [...(standards || [])].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
  // 精确匹配 feeType
  for (const s of sorted) {
    if ((s.feeTypes || []).includes(feeType)) return s
  }
  // 兜底：包含 '其他' 的标准
  for (const s of sorted) {
    if ((s.feeTypes || []).includes('其他')) return s
  }
  return null
}

// 把 diffRows 按 shopId 过滤；当前阶段一个对账周期对应一个 shop，没有 shop 维度过滤需求
function shopBasisRows(diffRows, shopId) {
  if (!shopId) return diffRows
  return diffRows.filter(r => r.shopId == null || r.shopId === shopId)
}

function basisOf(row, basisField) {
  switch (basisField) {
    case 'saleRevenue': return Math.max(row.saleRevenue || 0, 0)
    case 'qty':         return Math.max(row.qty || 0, 0)
    case 'orderCount':  return 1
    default:            return 1
  }
}

function methodToBasisField(method) {
  switch (method) {
    case 'byRevenue':    return 'saleRevenue'
    case 'byQuantity':   return 'qty'
    case 'byOrderCount': return 'orderCount'
    case 'byEqual':      return 'equal'
    case 'directOrder':  return 'directOrder'
    default:             return 'saleRevenue'
  }
}

function newId() { return 'alloc_' + Math.random().toString(36).slice(2, 10) }

export function runAllocation({ feeRecords = [], standards = [], reconcileResult, period, shopId }) {
  const diffRows = reconcileResult?.diffRows || []
  const allocations = []

  // 维度索引：方便 directOrder 直挂
  const orderIndex = new Map(diffRows.map(r => [r.orderId, r]))

  let unallocatedAmount = 0
  let unmatchedReasons = {}

  for (const fee of feeRecords) {
    if (fee.period !== period) continue
    if (shopId && fee.shopId && fee.shopId !== shopId) continue
    const amount = Number(fee.amount || 0)
    if (!amount) continue

    const std = pickStandard(standards, fee.feeType)
    if (!std) {
      unallocatedAmount += amount
      unmatchedReasons[fee.feeType] = (unmatchedReasons[fee.feeType] || 0) + amount
      continue
    }

    // 1) directOrder：直接挂到 platformOrderId
    if (std.method === 'directOrder') {
      const oid = fee.platformOrderId
      if (oid && orderIndex.has(oid)) {
        const r = orderIndex.get(oid)
        allocations.push({
          id: newId(), feeRecordId: fee.id, feeType: fee.feeType, amount,
          orgId: fee.org || 'default', shopId: fee.shopId,
          platformOrderId: oid, styleCode: r.styleCode, productCode: r.productCode,
          standardId: std.id, standardName: std.name, method: std.method, scope: 'sku',
          level: 'sku', ratio: 1, basisField: 'directOrder', basisValue: amount
        })
        continue
      }
      // directOrder 但订单号未匹配 → 留作未分配
      unallocatedAmount += amount
      unmatchedReasons['订单未匹配'] = (unmatchedReasons['订单未匹配'] || 0) + amount
      continue
    }

    // 2) scope='org' 或 'shop'：直接停在该层级（不下钻）
    if (std.scope === 'org' || std.scope === 'shop') {
      allocations.push({
        id: newId(), feeRecordId: fee.id, feeType: fee.feeType, amount,
        orgId: fee.org || 'default', shopId: fee.shopId,
        platformOrderId: null, styleCode: null, productCode: null,
        standardId: std.id, standardName: std.name, method: std.method, scope: std.scope,
        level: std.scope, ratio: 1, basisField: 'aggregate', basisValue: amount
      })
      continue
    }

    // 3) scope='sku'：按 method 在所有 diffRows 上分摊
    const basisField = methodToBasisField(std.method)
    const baseRows = shopBasisRows(diffRows, fee.shopId)
    if (baseRows.length === 0) {
      unallocatedAmount += amount
      unmatchedReasons['本期无订单可分摊'] = (unmatchedReasons['本期无订单可分摊'] || 0) + amount
      continue
    }

    if (basisField === 'equal') {
      const per = amount / baseRows.length
      for (const r of baseRows) {
        allocations.push({
          id: newId(), feeRecordId: fee.id, feeType: fee.feeType, amount: per,
          orgId: fee.org || 'default', shopId: fee.shopId,
          platformOrderId: r.orderId, styleCode: r.styleCode, productCode: r.productCode,
          standardId: std.id, standardName: std.name, method: std.method, scope: 'sku',
          level: 'sku', ratio: 1 / baseRows.length, basisField: 'equal', basisValue: 1
        })
      }
      continue
    }

    // 收入/件数/订单数：归一化分摊
    const totals = baseRows.reduce((s, r) => s + basisOf(r, basisField), 0)
    if (totals <= 0) {
      // 全部基数为 0（如全是亏损 + 件数 0），退化为平均分
      const per = amount / baseRows.length
      for (const r of baseRows) {
        allocations.push({
          id: newId(), feeRecordId: fee.id, feeType: fee.feeType, amount: per,
          orgId: fee.org || 'default', shopId: fee.shopId,
          platformOrderId: r.orderId, styleCode: r.styleCode, productCode: r.productCode,
          standardId: std.id, standardName: std.name, method: std.method, scope: 'sku',
          level: 'sku', ratio: 1 / baseRows.length, basisField: 'fallback-equal', basisValue: 1
        })
      }
      continue
    }
    for (const r of baseRows) {
      const v = basisOf(r, basisField)
      if (v <= 0) continue
      const ratio = v / totals
      allocations.push({
        id: newId(), feeRecordId: fee.id, feeType: fee.feeType, amount: amount * ratio,
        orgId: fee.org || 'default', shopId: fee.shopId,
        platformOrderId: r.orderId, styleCode: r.styleCode, productCode: r.productCode,
        standardId: std.id, standardName: std.name, method: std.method, scope: 'sku',
        level: 'sku', ratio, basisField, basisValue: v
      })
    }
  }

  const totalFees = feeRecords
    .filter(f => f.period === period && (!shopId || !f.shopId || f.shopId === shopId))
    .reduce((s, f) => s + Number(f.amount || 0), 0)
  const allocated = allocations.reduce((s, a) => s + a.amount, 0)

  // 按维度聚合
  const byOrg = aggregateBy(allocations, a => a.orgId || '—')
  const byShop = aggregateBy(allocations, a => a.shopId || '—')
  const bySku = aggregateBy(allocations, a => a.styleCode || '—')
  const byOrder = aggregateBy(allocations, a => a.platformOrderId || '—')

  return {
    allocations,
    summary: {
      totalFees, allocated, unallocated: unallocatedAmount,
      unmatchedReasons, byOrg, byShop, bySku, byOrder
    }
  }
}

function aggregateBy(allocations, keyFn) {
  const map = new Map()
  for (const a of allocations) {
    const k = keyFn(a)
    if (!map.has(k)) map.set(k, { key: k, amount: 0, count: 0, byFeeType: {} })
    const m = map.get(k)
    m.amount += a.amount
    m.count += 1
    m.byFeeType[a.feeType] = (m.byFeeType[a.feeType] || 0) + a.amount
  }
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount)
}

// 给定订单/SKU，查询其分配费用合计
export function feeForOrder(allocations, orderId) {
  return (allocations || [])
    .filter(a => a.platformOrderId === orderId)
    .reduce((s, a) => s + a.amount, 0)
}

export function feeForStyleCode(allocations, styleCode) {
  return (allocations || [])
    .filter(a => a.styleCode === styleCode)
    .reduce((s, a) => s + a.amount, 0)
}
