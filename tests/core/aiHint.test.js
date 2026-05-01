import { describe, it, expect } from 'vitest'
import { generateHint } from '../../src/core/aiHint.js'

describe('aiHint', () => {
  it('returns null for matched', () => {
    expect(generateHint({ bucket: 'matched' })).toBeNull()
  })
  it('explains duplicated with multiplier', () => {
    const hint = generateHint({ bucket: 'duplicated', saleRevenue: 179,
      jstBillAmountSum: 358 })
    expect(hint).toMatch(/聚水潭|多行|售后/)
    expect(hint).toMatch(/2/)
  })
  it('explains missing_in_jst', () => {
    expect(generateHint({ bucket: 'missing_in_jst' })).toMatch(/平台.*聚水潭/)
  })
  it('explains missing_in_platform', () => {
    expect(generateHint({ bucket: 'missing_in_platform' })).toMatch(/聚水潭.*平台|跨月|在途/)
  })
  it('explains profit_anomaly with diff amount', () => {
    const hint = generateHint({ bucket: 'profit_anomaly', profitDiff: -25.5 })
    expect(hint).toMatch(/毛利|成本|退款/)
    expect(hint).toMatch(/25/)
  })
})
