import { generateMockBundle } from './_mockGenerator.js'

const SKUS = [
  { styleCode: 'KS-儿童羽绒服-001', productName: '儿童羽绒服 (快手主推)', price: 169, cost: 88 },
  { styleCode: 'KS-加绒卫衣-002', productName: '加绒卫衣', price: 89, cost: 38 },
  { styleCode: 'KS-冬装套装-003', productName: '冬装两件套', price: 139, cost: 65 },
  { styleCode: 'KS-亲子装-004', productName: '亲子装外套', price: 199, cost: 95 }
]

export const kuaishou = {
  id: 'kuaishou',
  name: '快手',
  status: 'mock',
  uploadSlots: [],
  getMockBundle: () => generateMockBundle({
    platformPrefix: 'KS',
    shopName: '快手-某童装小店',
    skus: SKUS,
    orderCount: 220,
    refundRate: 0.07,
    duplicatedCount: 3,
    anomalyCount: 2,
    missingInJstCount: 1,
    missingInPlatformCount: 1,
    platformFeeRate: 0.05,
    commissionRate: 0.05,
    promoFeeRate: 0.03,
    monthlyExpenseScenes: [
      { scene: '磁力金牛广告', count: 18, totalAmount: -2640 },
      { scene: '保证金占用利息', count: 1, totalAmount: -180 }
    ]
  }),
  transform() { throw new Error('kuaishou is mock platform; use getMockBundle()') }
}
