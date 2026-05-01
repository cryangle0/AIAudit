import { describe, it, expect } from 'vitest'
import { douyin } from '../../src/platforms/douyin.js'
import { douyinFundRows, douyinSummaryRows } from '../fixtures/sample-rows.js'

describe('douyin adapter', () => {
  const result = douyin.transform({ fundRows: douyinFundRows, summaryRows: douyinSummaryRows })

  it('returns standard shape', () => {
    expect(result).toHaveProperty('orders')
    expect(result).toHaveProperty('fundFlow')
    expect(result).toHaveProperty('monthlyExpense')
  })

  it('aggregates orders by orderId, sums numeric fields', () => {
    const order6002 = result.orders.find(o => o.orderId === '6002')
    expect(order6002.saleRevenue).toBeCloseTo(0, 2)        // 179 + (-179)
    // 入账 +170.05 出账 -179
    expect(order6002.netSettled).toBeCloseTo(170.05 - 179, 2)
    expect(order6002.flows).toHaveLength(2)
  })

  it('strips leading apostrophe from order id', () => {
    const tricky = douyin.transform({
      fundRows: [{ '订单号': "'9999", '动账方向': '入账', '动账金额': 1, '销售收入': 1,
        '平台服务费': 0, '佣金': 0, '订单退款': 0, '站外推广费': 0,
        '动账场景': '货款结算入账', '动帐流水号': 'X' }],
      summaryRows: []
    })
    expect(tricky.orders[0].orderId).toBe('9999')
  })

  it('separates monthlyExpense rows (orderId == null) by 动账场景', () => {
    const insur = result.monthlyExpense.find(e => e.scene === '权益保险')
    expect(insur.count).toBe(2)
    // 出账 → totalAmount 为负
    expect(insur.totalAmount).toBeCloseTo(-22.86 - 3.81, 2)
    expect(insur.samples).toHaveLength(2)
  })

  it('does not put non-order rows into orders', () => {
    expect(result.orders.find(o => o.orderId === null)).toBeUndefined()
  })

  it('exposes platform metadata', () => {
    expect(douyin.id).toBe('douyin')
    expect(douyin.name).toBe('抖音')
    expect(douyin.status).toBe('ready')
    expect(Array.isArray(douyin.uploadSlots)).toBe(true)
    expect(douyin.uploadSlots.length).toBeGreaterThanOrEqual(2)
  })
})
