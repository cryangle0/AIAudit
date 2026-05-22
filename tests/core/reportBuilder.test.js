import { describe, it, expect } from 'vitest'
import {
  buildBillSummaryFromReconcile, buildBillDetailFromReconcile,
  buildShopProfitFromReconcile, buildProductProfitFromReconcile,
  buildRecvSummary, buildRecvDetail, buildProfitAnalyze
} from '../../src/core/reportBuilder.js'

const sampleReconcileResult = {
  diffRows: [
    { orderId: 'A1', styleCode: 'X1', productCode: 'X1-001', productName: '童装T恤',
      qty: 2, saleRevenue: 100, netSettled: 80, shippedCost: 30,
      refundAmount: 0, bucket: 'matched',
      platformFlows: [
        { direction: '入账', amount: 100, scene: '订单收入', flowId: 'F1' },
        { direction: '出账', amount: 20, scene: '平台服务费', flowId: 'F2' }
      ] },
    { orderId: 'A2', styleCode: 'X2', productCode: 'X2-001', productName: '童装裤子',
      qty: 1, saleRevenue: 200, netSettled: 180, shippedCost: 60,
      refundAmount: 0, bucket: 'matched',
      platformFlows: [
        { direction: '入账', amount: 200, scene: '订单收入', flowId: 'F3' }
      ] }
  ]
}

describe('reportBuilder — 客户模板表头', () => {
  describe('账单汇总表', () => {
    it('字段严格按 Excel 表头', () => {
      const rows = buildBillSummaryFromReconcile({
        reconcileResult: sampleReconcileResult,
        shopName: '测试店', platformName: '抖音', openBalance: 1000
      })
      expect(rows).toHaveLength(1)
      const r = rows[0]
      expect(r.platform).toBe('抖音')
      expect(r.shop).toBe('测试店')
      expect(r.openBalance).toBe(1000)
      expect(r.orderIncome).toBe(300)   // 100 + 200
      expect(r.huabei).toBe(0)
      expect(r.techRefund).toBe(0)
      expect(r.incomeTotal).toBe(300)
      expect(r.platformFee).toBe(20)
      expect(r.expenseTotal).toBe(20)
      expect(r.endBalance).toBe(1000 + 300 - 20)  // = 1280
    })
  })

  describe('账单明细表', () => {
    it('每订单一行', () => {
      const rows = buildBillDetailFromReconcile({
        reconcileResult: sampleReconcileResult,
        shopName: '测试店', platformName: '抖音'
      })
      expect(rows).toHaveLength(2)
      expect(rows[0].orderId).toBe('A1')
      expect(rows[0].incomeTotal).toBe(100)
      expect(rows[0].expenseTotal).toBe(20)
    })
  })

  describe('店铺利润表', () => {
    it('字段严格按 Excel: 销售收入/销售成本/销售费用/店铺利润/毛利率/退货率', () => {
      const r = buildShopProfitFromReconcile({
        reconcileResult: sampleReconcileResult, shopName: '测试店',
        costItems: [], feeRecords: [], allocStandards: [], period: '2026-01'
      })
      expect(r.shopName).toBe('测试店')
      expect(r.revenue).toBe(300)            // 100 + 200
      expect(r.netRevenue).toBe(300)
      expect(r.shippedQty).toBe(3)           // 2 + 1
      expect(r.productCost).toBe(90)         // 30 + 60（聚水潭兜底）
      expect(r.costTotal).toBe(90)
      expect(r.profit).toBe(210)             // 300 - 90 - 0
    })

    it('使用商品成本表', () => {
      const r = buildShopProfitFromReconcile({
        reconcileResult: sampleReconcileResult, shopName: '测试店',
        costItems: [{ period: '2026-01', styleCode: 'X1',
          baseCost: 10, tagFee: 2, accessoryFee: 1 }],
        feeRecords: [], allocStandards: [], period: '2026-01'
      })
      expect(r.productCost).toBe(20 + 60)    // X1: 10*2 自维护; X2: 60 兜底
      expect(r.tagCost).toBe(4)              // X1: 2*2
      expect(r.accessoryCost).toBe(2)        // X1: 1*2
    })
  })

  describe('商品利润表', () => {
    it('字段严格按 Excel: 店铺/订单号/款式/商品编码/商品名称/品类/数量/单价/销售金额/成本/标费/辅料/毛利润/毛利率', () => {
      const rows = buildProductProfitFromReconcile({
        reconcileResult: sampleReconcileResult,
        costItems: [], feeRecords: [], allocStandards: [],
        period: '2026-01', shopName: '测试店'
      })
      expect(rows).toHaveLength(2)
      const r1 = rows[0]
      expect(r1.shopName).toBe('测试店')
      expect(r1.orderId).toBe('A1')
      expect(r1.styleCode).toBe('X1')
      expect(r1.productCode).toBe('X1-001')
      expect(r1.qty).toBe(2)
      expect(r1.price).toBe(50)        // 100 / 2
      expect(r1.revenue).toBe(100)
      expect(r1.cost).toBe(30)
      expect(r1.profit).toBe(70)       // 100 - 30
    })
  })

  describe('应收汇总（旧版兼容）', () => {
    it('店铺/商品维度汇总', () => {
      const rows = buildRecvSummary({
        reconcileResult: sampleReconcileResult, shopName: '测试店'
      })
      expect(rows).toHaveLength(2)
    })
  })

  describe('应收明细（旧版兼容）', () => {
    it('订单级', () => {
      const rows = buildRecvDetail({
        reconcileResult: sampleReconcileResult,
        shopName: '测试店', period: '2026-01'
      })
      expect(rows).toHaveLength(2)
    })
  })

  describe('利润分析（多维度）', () => {
    it('SKU + 平台/店铺/品类上卷', () => {
      const result = buildProfitAnalyze({
        reconcileResult: sampleReconcileResult,
        allocResult: { allocations: [
          { platformOrderId: 'A1', amount: 10 },
          { platformOrderId: 'A2', amount: 20 }
        ] },
        costItems: [], shopName: '测试店',
        platformId: 'douyin', period: '2026-01'
      })
      expect(result.sku).toHaveLength(2)
      const x1 = result.sku.find(r => r.styleCode === 'X1')
      expect(x1.profit).toBe(60)  // 100 - 30 - 10
    })
  })
})
