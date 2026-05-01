import { generateMockBundle } from './_mockGenerator.js'

const SKUS = [
  { styleCode: 'XHS-种草款外套-001', productName: '童装外套 (小红书种草款)', price: 269, cost: 110 },
  { styleCode: 'XHS-亲子装-002', productName: '母女亲子装', price: 359, cost: 150 },
  { styleCode: 'XHS-公主裙-003', productName: '公主蓬蓬裙', price: 189, cost: 75 },
  { styleCode: 'XHS-毛呢大衣-004', productName: '毛呢小大衣', price: 329, cost: 140 }
]

export const xiaohongshu = {
  id: 'xiaohongshu',
  name: '小红书',
  status: 'mock',
  uploadSlots: [],
  getMockBundle: () => generateMockBundle({
    platformPrefix: 'XHS',
    shopName: '小红书-某童装品牌店',
    skus: SKUS,
    orderCount: 95,
    refundRate: 0.04,
    duplicatedCount: 2,
    anomalyCount: 1,
    missingInJstCount: 1,
    missingInPlatformCount: 1,
    platformFeeRate: 0.05,
    commissionRate: 0.10,
    promoFeeRate: 0,
    monthlyExpenseScenes: [
      { scene: '聚光投放', count: 11, totalAmount: -2840 },
      { scene: '蒲公英达人合作', count: 5, totalAmount: -3500, memo: '达人坑位费' }
    ]
  }),
  transform() { throw new Error('xiaohongshu is mock platform; use getMockBundle()') }
}
