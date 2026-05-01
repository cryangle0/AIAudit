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

function findBillAmountKey(row) {
  // 自适应：取第一个以「资金账单金额」结尾的列
  // 兼容 抖音/淘宝/快手/拼多多/小红书/视频号/微信小店
  for (const k of Object.keys(row)) {
    if (typeof k === 'string' && k.endsWith('资金账单金额')) return k
  }
  return null
}

export function parseJushuitan(rows = []) {
  const map = new Map()
  let billKey = null
  for (const r of rows) {
    if (!billKey) billKey = findBillAmountKey(r)
    const oid = stripQuote(r['原始线上订单号'])
    if (oid == null || oid === '') continue
    if (!map.has(oid)) {
      map.set(oid, {
        orderId: oid,
        styleCode: r['款式编码'] ?? null,
        productName: r['商品简称'] ?? null,
        shippedAmount: 0, shippedCost: 0, grossProfit: 0,
        refundedAmount: 0, jstBillAmountSum: 0,
        qty: 0, amount: 0,
        rowCount: 0, rows: []
      })
    }
    const o = map.get(oid)
    o.shippedAmount += num(r['实发金额'])
    o.shippedCost += num(r['实发成本'])
    o.grossProfit += num(r['销售毛利'])
    o.refundedAmount += num(r['当期实退金额'])
    o.jstBillAmountSum += billKey ? num(r[billKey]) : 0
    o.qty += num(r['件数'])
    o.amount += num(r['金额'])
    o.rowCount += 1
    o.rows.push(r)
  }
  return Array.from(map.values())
}
