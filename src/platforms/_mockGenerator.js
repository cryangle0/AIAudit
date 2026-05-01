// 共享 mock 数据生成器
// 输出严格匹配 douyin.transform 与 parseJushuitan 的形状

function rng(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function fmtTime(d) {
  return d.toISOString().replace('T', ' ').slice(0, 19)
}

export function generateMockBundle({
  platformPrefix = 'MK',
  shopName = '示例童装店',
  skus = [],
  orderCount = 100,
  refundRate = 0.06,
  duplicatedCount = 3,
  anomalyCount = 2,
  missingInJstCount = 1,
  missingInPlatformCount = 1,
  platformFeeRate = 0.05,
  commissionRate = 0,
  promoFeeRate = 0,
  monthlyExpenseScenes = []
}) {
  const rand = rng(orderCount * 31 + skus.length * 17 + platformPrefix.charCodeAt(0))
  const orders = []
  const jstOrders = []
  const fundFlow = []

  for (let i = 0; i < orderCount; i++) {
    const orderId = `${platformPrefix}${(2026000000 + i).toString()}`
    const sku = skus[Math.floor(rand() * skus.length)]
    const price = sku.price
    const cost = sku.cost
    const platformFee = -Math.round(price * platformFeeRate * 100) / 100
    const commission = -Math.round(price * commissionRate * 100) / 100
    const promoFee = -Math.round(price * promoFeeRate * 100) / 100
    const netSettled = Math.round((price + platformFee + commission + promoFee) * 100) / 100

    const time = fmtTime(new Date(2026, 0, 1 + Math.floor(rand() * 28),
      Math.floor(rand() * 24), Math.floor(rand() * 60)))

    const flow = {
      orderId, time, flowId: `${platformPrefix}F${i}`,
      direction: '入账', amount: netSettled,
      account: '聚合账户', scene: '货款结算入账',
      saleRevenue: price, platformFee, commission,
      refundAmount: 0, promoFee, memo: '订单结算'
    }
    fundFlow.push(flow)

    orders.push({
      orderId, saleRevenue: price, netSettled,
      platformFee, commission, refundAmount: 0, promoFee,
      flows: [flow]
    })

    jstOrders.push({
      orderId, styleCode: sku.styleCode, productName: sku.productName,
      shippedAmount: price, shippedCost: cost, grossProfit: price - cost,
      refundedAmount: 0, jstBillAmountSum: price,
      qty: 1, amount: price, rowCount: 1,
      rows: [{ '原始线上订单号': orderId, '款式编码': sku.styleCode, '店铺': shopName,
        '实发金额': price, '实发成本': cost, '销售毛利': price - cost,
        '抖音资金账单金额': price }]
    })
  }

  // refunds
  const refundCount = Math.floor(orderCount * refundRate)
  for (let i = 0; i < refundCount; i++) {
    const o = orders[i]
    if (!o) continue
    const sku = skus[i % skus.length]
    const refundFlow = {
      orderId: o.orderId, time: fmtTime(new Date(2026, 0, 20)),
      flowId: `${platformPrefix}R${i}`, direction: '出账', amount: sku.price,
      account: '聚合账户', scene: '退款-结算后退款-退用户',
      saleRevenue: -sku.price, platformFee: 0, commission: 0,
      refundAmount: 0, promoFee: 0, memo: '已退款'
    }
    o.flows.push(refundFlow)
    fundFlow.push(refundFlow)
    o.saleRevenue += -sku.price
    o.netSettled -= sku.price
    jstOrders[i].refundedAmount = sku.price
    jstOrders[i].jstBillAmountSum = 0
    jstOrders[i].amount = 0
    jstOrders[i].qty = 0
  }

  // duplicated: jst 增加重复行
  for (let i = 0; i < duplicatedCount; i++) {
    const idx = orders.length - 1 - i - 5  // 避开 refund 区
    if (idx < 0 || !jstOrders[idx]) continue
    const realPrice = jstOrders[idx].shippedAmount  // 用 jstOrder 实际价格而不是随机sku
    if (realPrice <= 0) continue
    jstOrders[idx].rowCount = 2
    jstOrders[idx].jstBillAmountSum = realPrice * 2
    jstOrders[idx].rows.push({ '原始线上订单号': jstOrders[idx].orderId,
      '款式编码': jstOrders[idx].styleCode, '抖音资金账单金额': realPrice, '售后单号': `S${idx}` })
  }

  // missing_in_jst
  for (let i = 0; i < missingInJstCount; i++) {
    const sku = skus[i % skus.length]
    const orderId = `${platformPrefix}MJ${i}`
    const platformFee = -Math.round(sku.price * platformFeeRate * 100) / 100
    const commission = -Math.round(sku.price * commissionRate * 100) / 100
    const netSettled = Math.round((sku.price + platformFee + commission) * 100) / 100
    const flow = {
      orderId, time: fmtTime(new Date(2026, 0, 25)),
      flowId: `${platformPrefix}MJF${i}`, direction: '入账', amount: netSettled,
      account: '聚合账户', scene: '货款结算入账',
      saleRevenue: sku.price, platformFee, commission,
      refundAmount: 0, promoFee: 0, memo: '订单结算'
    }
    fundFlow.push(flow)
    orders.push({ orderId, saleRevenue: sku.price, netSettled,
      platformFee, commission, refundAmount: 0, promoFee: 0, flows: [flow] })
  }

  // missing_in_platform
  for (let i = 0; i < missingInPlatformCount; i++) {
    const sku = skus[(i + 2) % skus.length]
    const orderId = `${platformPrefix}MP${i}`
    jstOrders.push({
      orderId, styleCode: sku.styleCode, productName: sku.productName,
      shippedAmount: sku.price, shippedCost: sku.cost,
      grossProfit: sku.price - sku.cost,
      refundedAmount: 0, jstBillAmountSum: 0,
      qty: 1, amount: sku.price, rowCount: 1,
      rows: [{ '原始线上订单号': orderId, '款式编码': sku.styleCode, '店铺': shopName,
        '实发金额': sku.price, '实发成本': sku.cost, '抖音资金账单金额': 0 }]
    })
  }

  // anomaly: 真实成本远高于聚水潭记录的（用 1.5x 真实价做实成本，但 grossProfit 保持 price-原成本）
  for (let i = 0; i < anomalyCount; i++) {
    const idx = Math.floor(orderCount / 2) + i
    if (!jstOrders[idx]) continue
    const realPrice = jstOrders[idx].shippedAmount
    if (realPrice <= 0) continue
    jstOrders[idx].shippedCost = Math.round(realPrice * 1.5 * 100) / 100
    // grossProfit 保持原值（聚水潭按旧成本算的毛利），real cost 才是异常的
  }

  // 月度公共扣费
  const monthlyExpense = monthlyExpenseScenes.map((m, idx) => {
    const samples = []
    const each = m.totalAmount / Math.max(1, m.count)
    for (let k = 0; k < Math.min(3, m.count); k++) {
      samples.push({
        time: fmtTime(new Date(2026, 0, 5 + k * 7)),
        amount: Math.abs(each),
        memo: m.memo || `${m.scene}扣除`
      })
      fundFlow.push({
        orderId: null, time: fmtTime(new Date(2026, 0, 5 + k * 7)),
        flowId: `${platformPrefix}ME${idx}_${k}`,
        direction: m.totalAmount < 0 ? '出账' : '入账',
        amount: Math.abs(each), scene: m.scene,
        saleRevenue: 0, platformFee: 0, commission: 0,
        refundAmount: 0, promoFee: 0,
        memo: m.memo || `${m.scene}扣除`
      })
    }
    return { scene: m.scene, count: m.count, totalAmount: m.totalAmount, samples }
  })

  return {
    platformResult: { orders, fundFlow, monthlyExpense },
    jstOrders
  }
}
