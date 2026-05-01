// 共享：把"标准列名"的资金流水 raw rows 聚合为 PlatformOrder/fundFlow/monthlyExpense
// 标准列名（来自抖音）：订单号 / 动账方向(入账|出账) / 动账金额 / 销售收入 / 平台服务费 /
//   佣金 / 订单退款 / 站外推广费 / 动账场景 / 动帐流水号 / 动账时间 / 备注

function stripQuote(s) {
  if (s == null) return null
  const str = String(s).trim()
  return str.startsWith("'") ? str.slice(1) : str
}

function num(v) {
  if (v == null || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function transformFromStandardRows(fundRows = []) {
  const orderMap = new Map()
  const monthlyMap = new Map()
  const fundFlow = []

  for (const r of fundRows) {
    const oid = stripQuote(r['订单号'])
    const flow = {
      orderId: oid,
      time: r['动账时间'] ?? null,
      flowId: stripQuote(r['动帐流水号']),
      direction: r['动账方向'] ?? null,
      amount: num(r['动账金额']),
      account: r['动账账户'] ?? null,
      scene: r['动账场景'] ?? null,
      billing: r['计费类型'] ?? null,
      saleRevenue: num(r['销售收入']),
      platformFee: num(r['平台服务费']),
      commission: num(r['佣金']),
      refundAmount: num(r['订单退款']),
      promoFee: num(r['站外推广费']),
      memo: r['备注'] ?? null
    }
    fundFlow.push(flow)

    const signed = flow.direction === '出账' ? -flow.amount : flow.amount

    if (oid == null || oid === '') {
      const key = flow.scene || '其他'
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { scene: key, count: 0, totalAmount: 0, samples: [] })
      }
      const m = monthlyMap.get(key)
      m.count += 1
      m.totalAmount += signed
      if (m.samples.length < 5) {
        m.samples.push({ time: flow.time, amount: flow.amount, memo: flow.memo })
      }
      continue
    }

    if (!orderMap.has(oid)) {
      orderMap.set(oid, {
        orderId: oid,
        saleRevenue: 0, netSettled: 0, platformFee: 0,
        commission: 0, refundAmount: 0, promoFee: 0, flows: []
      })
    }
    const o = orderMap.get(oid)
    o.saleRevenue += flow.saleRevenue
    o.netSettled += signed
    o.platformFee += flow.platformFee
    o.commission += flow.commission
    o.refundAmount += flow.refundAmount
    o.promoFee += flow.promoFee
    o.flows.push(flow)
  }

  return {
    orders: Array.from(orderMap.values()),
    fundFlow,
    monthlyExpense: Array.from(monthlyMap.values())
  }
}

// 把 raw rows 按 columnMap (std → platform) 反向重命名为标准列名
export function remapRowsToStandard(rawRows, columnMap, directionValueMap) {
  // columnMap: { '订单号': '子订单编号', ... }
  // directionValueMap: { '收入': '入账', '支出': '出账' }  (可选)
  const reverse = Object.fromEntries(Object.entries(columnMap).map(([k, v]) => [v, k]))
  return rawRows.map(r => {
    const out = {}
    for (const [platCol, val] of Object.entries(r)) {
      const stdCol = reverse[platCol] || platCol
      out[stdCol] = val
    }
    if (directionValueMap && out['动账方向'] != null) {
      const v = String(out['动账方向']).trim()
      out['动账方向'] = directionValueMap[v] || v
    }
    return out
  })
}
