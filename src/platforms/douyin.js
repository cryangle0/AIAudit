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

function transform({ fundRows = [], summaryRows = [] }) {
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

  const summaryById = {}
  for (const r of summaryRows) {
    summaryById[stripQuote(r['订单号'])] = num(r['求和项:销售收入'])
  }

  return {
    orders: Array.from(orderMap.values()),
    fundFlow,
    monthlyExpense: Array.from(monthlyMap.values()),
    summaryById
  }
}

export const douyin = {
  id: 'douyin',
  name: '抖音',
  status: 'ready',
  uploadSlots: [
    { key: 'fund', label: '抖音资金账单', required: true,
      sheetName: '抖音资金账单', requiredColumns: ['订单号', '动账金额', '销售收入', '动账场景'] },
    { key: 'summary', label: '抖音账单汇总（可选）', required: false,
      sheetName: '抖音账单汇总', requiredColumns: ['订单号', '求和项:销售收入'] }
  ],
  transform
}
