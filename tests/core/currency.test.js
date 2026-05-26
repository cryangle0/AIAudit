import { describe, it, expect } from 'vitest'
import { getRateLookupPeriod, lookupRate, convertToCNY } from '../../src/core/currency.js'

describe('currency 汇率引擎', () => {
  describe('getRateLookupPeriod', () => {
    it('1月 → 取 2月1日 → 期间记为 YYYY-02', () => {
      expect(getRateLookupPeriod('2026-01')).toBe('2026-02')
    })

    it('12月 → 取次年1月1日', () => {
      expect(getRateLookupPeriod('2025-12')).toBe('2026-01')
    })

    it('空值返回 null', () => {
      expect(getRateLookupPeriod(null)).toBeNull()
      expect(getRateLookupPeriod('')).toBeNull()
    })
  })

  describe('lookupRate', () => {
    const rates = {
      '2026-02': { CNY: 1, USD: 7.20, RUB: 0.080, GBP: 9.10 }
    }
    it('CNY 永远是 1', () => {
      expect(lookupRate(rates, '2026-01', 'CNY')).toBe(1)
    })

    it('1月账单 → 取 2月1日 USD 汇率', () => {
      expect(lookupRate(rates, '2026-01', 'USD')).toBe(7.20)
    })

    it('找不到对应期间 → 兜底默认值或 null', () => {
      const r = lookupRate({}, '2026-01', 'USD')
      // 默认值有 2026-02
      expect(r).toBe(7.20)
    })
  })

  describe('convertToCNY', () => {
    const rates = {
      '2026-02': { CNY: 1, USD: 7.20, RUB: 0.080, GBP: 9.10 }
    }

    it('USD 100 在 2026-01 期间 → 720 CNY', () => {
      const r = convertToCNY(100, 'USD', '2026-01', rates)
      expect(r.amountCNY).toBe(720)
      expect(r.rate).toBe(7.20)
      expect(r.lookupPeriod).toBe('2026-02')
    })

    it('CNY 不需要换算', () => {
      const r = convertToCNY(100, 'CNY', '2026-01', rates)
      expect(r.amountCNY).toBe(100)
      expect(r.rate).toBe(1)
    })

    it('零金额', () => {
      const r = convertToCNY(0, 'USD', '2026-01', rates)
      expect(r.amountCNY).toBe(0)
    })
  })
})
