import { describe, it, expect } from 'vitest'
import { realProfit, profitDiff, isAmountEqual, isProfitAnomaly } from '../../src/core/profit.js'
import { PROFIT_ANOMALY_ABS, PROFIT_ANOMALY_PCT } from '../../src/core/constants.js'

describe('profit core', () => {
  it('realProfit = netSettled - shippedCost', () => {
    expect(realProfit({ netSettled: 170.05, shippedCost: 90 })).toBeCloseTo(80.05, 2)
  })

  it('profitDiff = realProfit - systemProfit', () => {
    expect(profitDiff({ netSettled: 170, shippedCost: 90, systemProfit: 89 })).toBeCloseTo(-9, 2)
  })

  it('isAmountEqual uses 0.01 epsilon', () => {
    expect(isAmountEqual(179, 179.001)).toBe(true)
    expect(isAmountEqual(179, 179.02)).toBe(false)
    expect(isAmountEqual(-179, -179)).toBe(true)
  })

  it('profit anomaly: above absolute threshold AND above percent threshold', () => {
    // diff=40, system=100 → 40% > 30%, 40 > 20 → anomaly
    expect(isProfitAnomaly(40, 100)).toBe(true)
    // diff=10, system=100 → below abs threshold (20)
    expect(isProfitAnomaly(10, 100)).toBe(false)
    // diff=40, system=10000 → 0.4% < 30%, but 40 > 20 → still need both, false
    expect(isProfitAnomaly(40, 10000)).toBe(false)
  })

  it('constants are sane', () => {
    expect(PROFIT_ANOMALY_ABS).toBeGreaterThan(0)
    expect(PROFIT_ANOMALY_PCT).toBeGreaterThan(0)
    expect(PROFIT_ANOMALY_PCT).toBeLessThan(1)
  })
})
