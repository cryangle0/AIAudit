import { describe, it, expect } from 'vitest'
import {
  buildRecvSummary, buildRecvDetail,
  buildBillSummary, buildBillDetail,
  buildProfitAnalyze
} from '../../src/core/reportBuilder.js'

const sampleReconcileResult = {
  diffRows: [
    { orderId: 'A1', styleCode: 'X1', productCode: 'X1-001', productName: '童装T恤',
      qty: 2, saleRevenue: 100, netSettled: 80, shippedCost: 30,
      refundAmount: 0, bucket: 'matched',
      platformFlows: [
        { direction: '入账', amount: 100, scene: '订单收入', time: '2026-01-01', flowId: 'F1' },
        { direction: '出账', amount: 20, scene: '平台服务费', time: '2026-01-02', flowId: 'F2' }
      ] },
    { orderId: 'A2', styleCode: 'X2', productCode: 'X2-001', productName: '童装裤子',
      qty: 1, saleRevenue: 200, netSettled: 180, shippedCost: 60,
      refundAmount: 0, bucket: 'matched',
      platformFlows: [
        { direction: '入账', amount: 200, scene: '订单收入', time: '2026-01-03', flowId: 'F3' }
      ] }
  ]
}

describe('reportBuilder', () => {
  describe('应收汇总表', () => {
    it('按店铺/商品维度汇总', () => {
      const rows = buildRecvSummary({
        reconcileResult: sampleReconcileResult,
        shopName: '测试店'
      })
      expect(rows).toHaveLength(2)
      const x1 = rows.find(r => r.styleCode === 'X1')
      expect(x1.recvQty).toBe(2)
      expect(x1.recvAmount).toBe(100)
      expect(x1.writeoffAmount).toBe(80)
      expect(x1.endAmount).toBe(20)  // 100 - 80
    })

    it('包含期初结余', () => {
      const rows = buildRecvSummary({
        reconcileResult: sampleReconcileResult,
        shopName: '测试店',
        openingBalances: [{ shop: '测试店', styleCode: 'X1', qty: 5, amount: 250 }]
      })
      const x1 = rows.find(r => r.styleCode === 'X1')
      expect(x1.openQty).toBe(5)
      expect(x1.openAmount).toBe(250)
      expect(x1.endAmount).toBe(270)  // 250 + 100 - 80
    })
  })

  describe('应收明细表', () => {
    it('每个订单一行', () => {
      const rows = buildRecvDetail({
        reconcileResult: sampleReconcileResult,
        shopName: '测试店', period: '2026-01'
      })
      expect(rows).toHaveLength(2)
      expect(rows[0].orderId).toBe('A1')
      expect(rows[0].period).toBe('2026-01')
    })
  })

  describe('账单汇总表', () => {
    it('按账务类型 + 业务类型聚合', () => {
      const rows = buildBillSummary({
        reconcileResult: sampleReconcileResult, shopName: '测试店'
      })
      const incomeRow = rows.find(r => r.businessType === '订单收入')
      expect(incomeRow.accountType).toBe('收入项')
      expect(incomeRow.billAmount).toBe(300)  // 100 + 200
      const feeRow = rows.find(r => r.businessType === '平台服务费')
      expect(feeRow.accountType).toBe('支出项')
      expect(feeRow.billAmount).toBe(-20)
    })
  })

  describe('账单明细表', () => {
    it('每条流水一行', () => {
      const rows = buildBillDetail({
        reconcileResult: sampleReconcileResult,
        shopName: '测试店', period: '2026-01'
      })
      expect(rows).toHaveLength(3)
      expect(rows[0].docNo).toBe('F1')
    })
  })

  describe('利润分析表', () => {
    it('SKU 维度 + 维度上卷', () => {
      const result = buildProfitAnalyze({
        reconcileResult: sampleReconcileResult,
        allocResult: { allocations: [
          { platformOrderId: 'A1', amount: 10 },
          { platformOrderId: 'A2', amount: 20 }
        ] },
        costItems: [],
        shopName: '测试店',
        platformId: 'douyin',
        period: '2026-01'
      })
      // SKU
      expect(result.sku).toHaveLength(2)
      const x1 = result.sku.find(r => r.styleCode === 'X1')
      expect(x1.revenue).toBe(100)
      expect(x1.cost).toBe(30)        // 用聚水潭 shippedCost
      expect(x1.fee).toBe(10)
      expect(x1.profit).toBe(60)      // 100 - 30 - 10
      // 店铺维度上卷
      expect(result.byShop).toHaveLength(1)
      expect(result.byShop[0].profit).toBe(60 + (200 - 60 - 20))   // 60 + 120 = 180
    })

    it('使用自维护商品成本', () => {
      const result = buildProfitAnalyze({
        reconcileResult: sampleReconcileResult,
        allocResult: { allocations: [] },
        costItems: [{ period: '2026-01', styleCode: 'X1',
          baseCost: 10, tagFee: 2, accessoryFee: 1 }],   // 单件 13 元
        shopName: '测试店',
        platformId: 'douyin',
        period: '2026-01'
      })
      const x1 = result.sku.find(r => r.styleCode === 'X1')
      expect(x1.cost).toBe(26)   // 13 * 2
    })
  })
})
