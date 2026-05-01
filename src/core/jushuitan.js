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

export function parseJushuitan(rows = []) {
  const map = new Map()
  for (const r of rows) {
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
    o.jstBillAmountSum += num(r['抖音资金账单金额'])
    o.qty += num(r['件数'])
    o.amount += num(r['金额'])
    o.rowCount += 1
    o.rows.push(r)
  }
  return Array.from(map.values())
}
