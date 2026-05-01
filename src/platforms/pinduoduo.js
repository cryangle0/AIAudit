import { generateMockBundle } from './_mockGenerator.js'

const SKUS = [
  { styleCode: 'PDD-儿童棉服-001', productName: '儿童棉服 (拼多多)', price: 49, cost: 22 },
  { styleCode: 'PDD-保暖内衣-002', productName: '保暖内衣套装', price: 39, cost: 15 },
  { styleCode: 'PDD-加绒裤-003', productName: '加绒打底裤', price: 29, cost: 11 },
  { styleCode: 'PDD-冬装外套-004', productName: '冬装连帽外套', price: 79, cost: 35 },
  { styleCode: 'PDD-毛绒玩偶-005', productName: '童装毛绒装', price: 59, cost: 24 }
]

export const pinduoduo = {
  id: 'pinduoduo',
  name: '拼多多',
  status: 'mock',
  uploadSlots: [],
  getMockBundle: () => generateMockBundle({
    platformPrefix: 'PDD',
    shopName: '拼多多-某童装专营店',
    skus: SKUS,
    orderCount: 850,
    refundRate: 0.12,
    duplicatedCount: 8,
    anomalyCount: 4,
    missingInJstCount: 3,
    missingInPlatformCount: 2,
    platformFeeRate: 0.006,
    commissionRate: 0,
    promoFeeRate: 0.04,
    monthlyExpenseScenes: [
      { scene: '推广搜索', count: 28, totalAmount: -4280 },
      { scene: '场景推广', count: 22, totalAmount: -3120 },
      { scene: '保证金扣费', count: 1, totalAmount: -50 }
    ]
  }),
  transform() { throw new Error('pinduoduo is mock platform; use getMockBundle()') }
}
