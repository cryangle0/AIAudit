// 生成"标准列名"的 mock raw rows，可直接喂给 transformFromStandardRows，
// 也可通过 columnMap 重命名列后写入各平台特定格式的 .xlsx。
//
// 输出形状：
//   {
//     fundRowsStd: [{ '订单号', '动账方向', '动账金额', '销售收入', '平台服务费',
//                    '佣金', '订单退款', '站外推广费', '动账场景',
//                    '动帐流水号', '动账时间', '备注' }, ...],
//     jstRows:     [{ '原始线上订单号', '款式编码', '商品简称', '实发金额',
//                    '实发成本', '销售毛利', '当期实退金额', '<前缀>资金账单金额',
//                    '件数', '金额' }, ...]
//   }

function rng(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function fmtTime(d) {
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function generateMockRawData({
  platformPrefix = 'MK',
  jstBillColumnPrefix = '抖音',     // 「抖音资金账单金额」、「淘宝资金账单金额」等
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
  const fundRowsStd = []
  const jstRows = []
  const billCol = `${jstBillColumnPrefix}资金账单金额`

  // 每订单一笔正常入账 + 对应聚水潭一行
  const baseOrders = []   // {orderId, sku, price, cost}
  for (let i = 0; i < orderCount; i++) {
    const orderId = `${platformPrefix}${(2026000000 + i).toString()}`
    const sku = skus[Math.floor(rand() * skus.length)]
    baseOrders.push({ orderId, sku, price: sku.price, cost: sku.cost })

    const platformFee = -Math.round(sku.price * platformFeeRate * 100) / 100
    const commission = -Math.round(sku.price * commissionRate * 100) / 100
    const promoFee = -Math.round(sku.price * promoFeeRate * 100) / 100
    const netSettled = Math.round((sku.price + platformFee + commission + promoFee) * 100) / 100
    const time = fmtTime(new Date(2026, 0, 1 + Math.floor(rand() * 28),
      Math.floor(rand() * 24), Math.floor(rand() * 60)))

    fundRowsStd.push({
      '订单号': orderId,
      '动账时间': time,
      '动帐流水号': `${platformPrefix}F${i}`,
      '动账方向': '入账',
      '动账金额': netSettled,
      '动账场景': '货款结算入账',
      '销售收入': sku.price,
      '平台服务费': platformFee,
      '佣金': commission,
      '订单退款': 0,
      '站外推广费': promoFee,
      '备注': '订单结算'
    })

    jstRows.push({
      '原始线上订单号': orderId,
      '款式编码': sku.styleCode,
      '商品简称': sku.productName,
      '店铺': shopName,
      '实发金额': sku.price,
      '实发成本': sku.cost,
      '销售毛利': Math.round((sku.price - sku.cost) * 100) / 100,
      '当期实退金额': 0,
      [billCol]: sku.price,
      '件数': 1,
      '金额': sku.price
    })
  }

  // refunds：前 refundCount 个订单加一笔反向流水 + 聚水潭标记退款
  const refundCount = Math.floor(orderCount * refundRate)
  for (let i = 0; i < refundCount; i++) {
    const o = baseOrders[i]
    if (!o) continue
    fundRowsStd.push({
      '订单号': o.orderId,
      '动账时间': fmtTime(new Date(2026, 0, 20, 10, 0)),
      '动帐流水号': `${platformPrefix}R${i}`,
      '动账方向': '出账',
      '动账金额': o.price,
      '动账场景': '退款-结算后退款-退用户',
      '销售收入': -o.price,
      '平台服务费': 0,
      '佣金': 0,
      '订单退款': 0,
      '站外推广费': 0,
      '备注': '已退款'
    })
    jstRows[i]['当期实退金额'] = o.price
    jstRows[i][billCol] = 0
    jstRows[i]['金额'] = 0
    jstRows[i]['件数'] = 0
  }

  // duplicated：聚水潭多一行重复
  for (let i = 0; i < duplicatedCount; i++) {
    const idx = orderCount - 1 - i - 5
    if (idx < 0 || !jstRows[idx]) continue
    const o = baseOrders[idx]
    if (!o || (jstRows[idx]['当期实退金额'] || 0) > 0) continue
    jstRows[idx][billCol] = o.price * 2
    jstRows.push({
      '原始线上订单号': o.orderId,
      '款式编码': o.sku.styleCode,
      '商品简称': o.sku.productName,
      '店铺': shopName,
      '实发金额': 0,
      '实发成本': 0,
      '销售毛利': 0,
      '当期实退金额': 0,
      [billCol]: o.price,
      '件数': 0,
      '金额': 0
    })
  }

  // missing_in_jst：只在平台账单出现
  for (let i = 0; i < missingInJstCount; i++) {
    const sku = skus[i % skus.length]
    const orderId = `${platformPrefix}MJ${i}`
    const platformFee = -Math.round(sku.price * platformFeeRate * 100) / 100
    const commission = -Math.round(sku.price * commissionRate * 100) / 100
    const netSettled = Math.round((sku.price + platformFee + commission) * 100) / 100
    fundRowsStd.push({
      '订单号': orderId,
      '动账时间': fmtTime(new Date(2026, 0, 25, 14, 0)),
      '动帐流水号': `${platformPrefix}MJF${i}`,
      '动账方向': '入账',
      '动账金额': netSettled,
      '动账场景': '货款结算入账',
      '销售收入': sku.price,
      '平台服务费': platformFee,
      '佣金': commission,
      '订单退款': 0,
      '站外推广费': 0,
      '备注': '订单结算'
    })
  }

  // missing_in_platform：只在聚水潭出现
  for (let i = 0; i < missingInPlatformCount; i++) {
    const sku = skus[(i + 2) % skus.length]
    const orderId = `${platformPrefix}MP${i}`
    jstRows.push({
      '原始线上订单号': orderId,
      '款式编码': sku.styleCode,
      '商品简称': sku.productName,
      '店铺': shopName,
      '实发金额': sku.price,
      '实发成本': sku.cost,
      '销售毛利': Math.round((sku.price - sku.cost) * 100) / 100,
      '当期实退金额': 0,
      [billCol]: 0,
      '件数': 1,
      '金额': sku.price
    })
  }

  // anomaly：聚水潭实发成本远高于真实成本
  for (let i = 0; i < anomalyCount; i++) {
    const idx = Math.floor(orderCount / 2) + i
    if (!jstRows[idx]) continue
    const o = baseOrders[idx]
    if (!o) continue
    jstRows[idx]['实发成本'] = Math.round(o.price * 1.5 * 100) / 100
    // 销售毛利保持不变，体现"系统数据异常"
  }

  // 月度公共扣费
  for (let idx = 0; idx < monthlyExpenseScenes.length; idx++) {
    const m = monthlyExpenseScenes[idx]
    const each = m.totalAmount / Math.max(1, m.count)
    const dir = m.totalAmount < 0 ? '出账' : '入账'
    for (let k = 0; k < m.count; k++) {
      fundRowsStd.push({
        '订单号': null,
        '动账时间': fmtTime(new Date(2026, 0, 5 + k * 2, 10, 0)),
        '动帐流水号': `${platformPrefix}ME${idx}_${k}`,
        '动账方向': dir,
        '动账金额': Math.abs(each),
        '动账场景': m.scene,
        '销售收入': 0,
        '平台服务费': 0,
        '佣金': 0,
        '订单退款': 0,
        '站外推广费': 0,
        '备注': m.memo || `${m.scene}扣除`
      })
    }
  }

  return { fundRowsStd, jstRows }
}

// 把 std cols rows 通过 columnMap (std → platform) 重命名为各平台 raw rows
// directionValueMap (std → platform): { '入账': '收入', '出账': '支出' }
export function renameRowsByMap(stdRows, columnMap, directionValueMap) {
  return stdRows.map(r => {
    const out = {}
    for (const [stdCol, val] of Object.entries(r)) {
      const platCol = columnMap[stdCol] || stdCol
      let v = val
      if (stdCol === '动账方向' && directionValueMap && val != null) {
        v = directionValueMap[val] || val
      }
      out[platCol] = v
    }
    return out
  })
}
