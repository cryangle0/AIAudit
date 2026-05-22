import { describe, it, expect } from 'vitest'
import { runAllocation } from '../../src/core/allocate.js'
import { DEFAULT_STANDARDS } from '../../src/hooks/useAllocStandards.js'

const sampleReconcileResult = {
  diffRows: [
    { orderId: 'A1', styleCode: 'X1', productCode: 'X1-001', qty: 2, saleRevenue: 100,
      netSettled: 80, shippedCost: 30, refundAmount: 0, bucket: 'matched' },
    { orderId: 'A2', styleCode: 'X2', productCode: 'X2-001', qty: 1, saleRevenue: 200,
      netSettled: 180, shippedCost: 60, refundAmount: 0, bucket: 'matched' },
    { orderId: 'A3', styleCode: 'X1', productCode: 'X1-002', qty: 1, saleRevenue: 100,
      netSettled: 95, shippedCost: 30, refundAmount: 0, bucket: 'matched' }
  ]
}

describe('allocate engine', () => {
  it('directOrder: 直接挂单订单', () => {
    const fees = [{ id: 'f1', period: '2026-01', feeType: '平台服务费',
      platformOrderId: 'A1', amount: 10 }]
    const result = runAllocation({
      feeRecords: fees, standards: DEFAULT_STANDARDS,
      reconcileResult: sampleReconcileResult, period: '2026-01'
    })
    expect(result.allocations).toHaveLength(1)
    expect(result.allocations[0].platformOrderId).toBe('A1')
    expect(result.allocations[0].amount).toBe(10)
    expect(result.summary.unallocated).toBe(0)
  })

  it('byRevenue: 按收入比例分摊', () => {
    const fees = [{ id: 'f1', period: '2026-01', feeType: '推广费', amount: 100 }]
    const result = runAllocation({
      feeRecords: fees, standards: DEFAULT_STANDARDS,
      reconcileResult: sampleReconcileResult, period: '2026-01'
    })
    // 收入：100/200/100 = 总 400，比例 25%/50%/25%
    expect(result.allocations).toHaveLength(3)
    const a1 = result.allocations.find(a => a.platformOrderId === 'A1')
    const a2 = result.allocations.find(a => a.platformOrderId === 'A2')
    expect(a1.amount).toBeCloseTo(25)
    expect(a2.amount).toBeCloseTo(50)
    expect(result.summary.allocated).toBeCloseTo(100)
  })

  it('byOrderCount: 按订单数分摊（运费险）', () => {
    const fees = [{ id: 'f1', period: '2026-01', feeType: '运费险', amount: 30 }]
    const result = runAllocation({
      feeRecords: fees, standards: DEFAULT_STANDARDS,
      reconcileResult: sampleReconcileResult, period: '2026-01'
    })
    expect(result.allocations).toHaveLength(3)
    expect(result.allocations[0].amount).toBeCloseTo(10)
  })

  it('未匹配的费用类型 → 兜底标准', () => {
    const fees = [{ id: 'f1', period: '2026-01', feeType: '其他', amount: 50 }]
    const result = runAllocation({
      feeRecords: fees, standards: DEFAULT_STANDARDS,
      reconcileResult: sampleReconcileResult, period: '2026-01'
    })
    // 兜底走 '其他公共费用按收入分摊'
    expect(result.summary.allocated).toBeCloseTo(50)
  })

  it('期间不匹配 → 跳过', () => {
    const fees = [{ id: 'f1', period: '2025-12', feeType: '推广费', amount: 100 }]
    const result = runAllocation({
      feeRecords: fees, standards: DEFAULT_STANDARDS,
      reconcileResult: sampleReconcileResult, period: '2026-01'
    })
    expect(result.allocations).toHaveLength(0)
    expect(result.summary.totalFees).toBe(0)
  })

  it('directOrder 但订单未匹配 → 未分配', () => {
    const fees = [{ id: 'f1', period: '2026-01', feeType: '佣金',
      platformOrderId: 'NOTEXIST', amount: 20 }]
    const result = runAllocation({
      feeRecords: fees, standards: DEFAULT_STANDARDS,
      reconcileResult: sampleReconcileResult, period: '2026-01'
    })
    expect(result.summary.unallocated).toBe(20)
    expect(result.summary.unmatchedReasons['订单未匹配']).toBe(20)
  })

  it('summary 维度上卷', () => {
    const fees = [{ id: 'f1', period: '2026-01', feeType: '推广费', amount: 100 }]
    const result = runAllocation({
      feeRecords: fees, standards: DEFAULT_STANDARDS,
      reconcileResult: sampleReconcileResult, period: '2026-01'
    })
    // bySku: X1 = 25 + 25 = 50, X2 = 50
    const x1 = result.summary.bySku.find(x => x.key === 'X1')
    expect(x1.amount).toBeCloseTo(50)
    expect(x1.count).toBe(2)
  })
})
