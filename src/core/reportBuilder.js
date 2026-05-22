// 报表生成器 — 严格按客户模板字段
//
// 核心数据流：
//   订单/SKU（来自对账 diffRows）+ 期初结余（人工录入或上月结转，原型阶段假设为 0）
//   + 本期账单（来自平台 fundFlow）+ 核销（订单完结即视为核销）
//   = 4 张报表的所有字段

function num(v) { return Number(v || 0) }

// 通用：把对账结果按"店铺-商品"维度聚合为基础数据
function buildBaseAggregates(reconcileResult, shopName) {
  const diffRows = reconcileResult?.diffRows || []
  const byShopSku = new Map() // key: shop|styleCode → { qty, billAmount, settledAmount, refundAmount }

  for (const r of diffRows) {
    const key = `${shopName}||${r.styleCode || '—'}`
    if (!byShopSku.has(key)) {
      byShopSku.set(key, {
        shop: shopName, styleCode: r.styleCode || '—',
        productCode: r.productCode || '—', productName: r.productName || '—',
        qty: 0,                    // 销售件数
        billAmount: 0,             // 本期账单金额（销售收入）
        settledAmount: 0,          // 本期已核销（净入账，正数视为核销）
        refundAmount: 0,           // 退款金额
        orderCount: 0
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

// 应收汇总表：店铺/商品维度，期初+应收+核销+期末（数量+金额）
export function buildRecvSummary({ reconcileResult, shopName, openingBalances = [] }) {
  const aggregates = buildBaseAggregates(reconcileResult, shopName)
  const openMap = new Map(openingBalances.map(o => [`${o.shop}||${o.styleCode}`, o]))

  return aggregates.map(a => {
    const open = openMap.get(`${a.shop}||${a.styleCode}`) || { qty: 0, amount: 0 }
    const openQty = num(open.qty)
    const openAmount = num(open.amount)
    const recvQty = a.qty
    const recvAmount = a.billAmount
    // 核销数量 = 已结算 / 平均单价（近似），核销金额 = settledAmount
    const avgPrice = recvQty > 0 ? recvAmount / recvQty : 0
    const writeoffAmount = a.settledAmount
    const writeoffQty = avgPrice > 0 ? Math.round(writeoffAmount / avgPrice) : 0
    return {
      shop: a.shop, styleCode: a.styleCode, productCode: a.productCode, productName: a.productName,
      openQty, openAmount,
      recvQty, recvAmount,
      writeoffQty, writeoffAmount,
      endQty: openQty + recvQty - writeoffQty,
      endAmount: openAmount + recvAmount - writeoffAmount
    }
  }).sort((a, b) => b.recvAmount - a.recvAmount)
}

// 应收明细表：订单级
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
      openQty: 0, openAmount: 0,
      recvQty, recvAmount,
      writeoffQty, writeoffAmount,
      endQty: recvQty - writeoffQty,
      endAmount: recvAmount - writeoffAmount,
      bucket: r.bucket
    }
  })
}

// 账单汇总表：店铺/账务类型/业务类型，仅金额
// 账务类型：收入项 / 支出项；业务类型：订单收入/退款/平台服务费/佣金/推广费 等
const FUND_BUSINESS_MAP = {
  // direction === '入账'
  income: ['订单收入', '花呗交易', '保证金退款', '其他入账'],
  expense: ['平台服务费', '佣金', '推广费', '红包', '运费险', '提现', '其他出账']
}

function classifyBusiness(scene, direction) {
  if (!scene) return direction === '入账' ? '订单收入' : '其他出账'
  // 简化分类：根据场景关键字归类
  const s = String(scene)
  if (direction === '入账') {
    if (s.includes('订单') || s.includes('收入')) return '订单收入'
    if (s.includes('保证金')) return '保证金退款'
    if (s.includes('花呗')) return '花呗交易'
    return '其他入账'
  } else {
    if (s.includes('服务费') || s.includes('技术')) return '平台服务费'
    if (s.includes('佣金') || s.includes('返点')) return '佣金'
    if (s.includes('推广') || s.includes('广告')) return '推广费'
    if (s.includes('红包') || s.includes('补贴')) return '红包'
    if (s.includes('保险') || s.includes('运费险')) return '运费险'
    if (s.includes('提现')) return '提现'
    return '其他出账'
  }
}

export function buildBillSummary({ reconcileResult, shopName }) {
  const platformFlows = []
  // 从 diffRows 里收集所有 flows
  for (const r of reconcileResult?.diffRows || []) {
    for (const f of r.platformFlows || []) platformFlows.push(f)
  }

  const map = new Map()
  for (const f of platformFlows) {
    const accountType = f.direction === '入账' ? '收入项' : '支出项'
    const businessType = classifyBusiness(f.scene, f.direction)
    const key = `${shopName}||${accountType}||${businessType}`
    if (!map.has(key)) {
      map.set(key, {
        shop: shopName, accountType, businessType,
        openAmount: 0, billAmount: 0, writeoffAmount: 0, endAmount: 0,
        count: 0
      })
    }
    const m = map.get(key)
    const signed = f.direction === '出账' ? -f.amount : f.amount
    m.billAmount += signed
    m.writeoffAmount += signed   // 平台流水即时核销
    m.count += 1
  }
  // 期末 = 期初 + 账单 - 核销 = 0（已即时核销）
  for (const v of map.values()) v.endAmount = v.openAmount + v.billAmount - v.writeoffAmount

  return Array.from(map.values())
    .sort((a, b) => Math.abs(b.billAmount) - Math.abs(a.billAmount))
}

// 账单明细表：每条流水一行
export function buildBillDetail({ reconcileResult, shopName, period }) {
  const out = []
  for (const r of reconcileResult?.diffRows || []) {
    for (const f of r.platformFlows || []) {
      const accountType = f.direction === '入账' ? '收入项' : '支出项'
      const businessType = classifyBusiness(f.scene, f.direction)
      const signed = f.direction === '出账' ? -f.amount : f.amount
      out.push({
        period, shop: shopName,
        accountType, businessType,
        docNo: f.flowId || r.orderId,
        orderId: r.orderId,
        scene: f.scene,
        time: f.time,
        openAmount: 0,
        billAmount: signed,
        writeoffAmount: signed,
        endAmount: 0
      })
    }
  }
  return out
}

// 利润分析表：多维度（部门/平台/品类/店铺/商品）
// 当前阶段以 styleCode/shop/platform 为主轴，品类暂用 styleCode 前缀近似
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

  // 商品维度（最细）
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
    ...x,
    profit: x.revenue - x.cost - x.fee,
    profitRate: x.revenue > 0 ? (x.revenue - x.cost - x.fee) / x.revenue : 0
  }))

  // 上卷生成各维度
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
      ...x,
      profitRate: x.revenue > 0 ? x.profit / x.revenue : 0
    })).sort((a, b) => b.profit - a.profit)
  }

  return {
    sku: skuRows.sort((a, b) => b.profit - a.profit),
    byPlatform: rollup('platform', '平台'),
    byShop:     rollup('shop', '店铺'),
    byCategory: rollup('category', '品类')
  }
}

// 简易品类推断：取款式编码前 3 位作为品类（占位实现，未来可改字典映射）
function inferCategory(styleCode) {
  if (!styleCode || styleCode === '—') return '未分类'
  return styleCode.slice(0, 3) + '*'
}
