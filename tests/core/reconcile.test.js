import { describe, it, expect } from 'vitest'
import { runReconcile } from '../../src/core/reconcile.js'
import { douyin } from '../../src/platforms/douyin.js'
import { parseJushuitan } from '../../src/core/jushuitan.js'
import { douyinFundRows, douyinSummaryRows, jstRows } from '../fixtures/sample-rows.js'

describe('reconcile engine', () => {
  const platform = douyin.transform({ fundRows: douyinFundRows, summaryRows: douyinSummaryRows })
  const jst = parseJushuitan(jstRows)
  const out = runReconcile(platform, jst)

  it('produces a row for every union of order ids', () => {
    const ids = new Set(out.diffRows.map(r => r.orderId))
    expect(ids.has('6001')).toBe(true)
    expect(ids.has('6002')).toBe(true)
    expect(ids.has('6003')).toBe(true)
    expect(ids.has('6004')).toBe(true)
    expect(ids.has('6005')).toBe(true)
    expect(ids.has('6006')).toBe(true)
  })

  it('6001 is matched', () => {
    const r = out.diffRows.find(x => x.orderId === '6001')
    expect(r.bucket).toBe('matched')
  })

  it('6003 is duplicated (jst sums to 2x platform)', () => {
    const r = out.diffRows.find(x => x.orderId === '6003')
    expect(r.bucket).toBe('duplicated')
  })

  it('6004 is missing_in_jst', () => {
    expect(out.diffRows.find(x => x.orderId === '6004').bucket).toBe('missing_in_jst')
  })

  it('6005 is missing_in_platform', () => {
    expect(out.diffRows.find(x => x.orderId === '6005').bucket).toBe('missing_in_platform')
  })

  it('6006 is profit_anomaly (cost too high)', () => {
    expect(out.diffRows.find(x => x.orderId === '6006').bucket).toBe('profit_anomaly')
  })

  it('kpi totals match', () => {
    expect(out.kpi.totalOrders).toBe(out.diffRows.length)
    expect(out.kpi.diffCount).toBeGreaterThan(0)
    expect(out.kpi.duplicatedCount).toBeGreaterThanOrEqual(1)
    expect(out.kpi.missingCount).toBeGreaterThanOrEqual(2)
    expect(out.kpi.anomalyCount).toBeGreaterThanOrEqual(1)
  })

  it('skuStats aggregates by styleCode', () => {
    const x001 = out.skuStats.find(s => s.styleCode === 'X001')
    expect(x001).toBeDefined()
    expect(x001.qty).toBeGreaterThan(0)
  })

  it('passes monthlyExpense through unchanged', () => {
    expect(out.monthlyExpense).toBe(platform.monthlyExpense)
  })
})
