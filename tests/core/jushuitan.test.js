import { describe, it, expect } from 'vitest'
import { parseJushuitan } from '../../src/core/jushuitan.js'
import { jstRows } from '../fixtures/sample-rows.js'

describe('jushuitan parser', () => {
  const orders = parseJushuitan(jstRows)

  it('aggregates by orderId', () => {
    const o = orders.find(x => x.orderId === '6003')
    expect(o.rowCount).toBe(2)
    expect(o.jstBillAmountSum).toBeCloseTo(358, 2)
    expect(o.shippedAmount).toBeCloseTo(179, 2)
  })

  it('captures cost / profit / refund', () => {
    const o = orders.find(x => x.orderId === '6001')
    expect(o.shippedCost).toBeCloseTo(90, 2)
    expect(o.grossProfit).toBeCloseTo(89, 2)
    expect(o.refundedAmount).toBeCloseTo(0, 2)
  })

  it('preserves styleCode and productName from first row', () => {
    const o = orders.find(x => x.orderId === '6005')
    expect(o.styleCode).toBe('X003')
    expect(o.productName).toBe('C款')
  })

  it('strips apostrophe from order id', () => {
    const out = parseJushuitan([{ '原始线上订单号': "'12345", '款式编码': 'Y',
      '商品简称': 'Z', '实发金额': 1, '实发成本': 0, '销售毛利': 1,
      '当期实退金额': 0, '抖音资金账单金额': 1, '件数': 1, '金额': 1 }])
    expect(out[0].orderId).toBe('12345')
  })
})
