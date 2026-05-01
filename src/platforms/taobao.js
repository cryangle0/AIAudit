import { generateMockBundle } from './_mockGenerator.js'

const SKUS = [
  { styleCode: 'TB-儿童轻薄羽绒服-001', productName: '儿童轻薄羽绒服 (天猫爆款)', price: 199, cost: 100 },
  { styleCode: 'TB-冬季外套-002', productName: '冬季加厚外套', price: 259, cost: 130 },
  { styleCode: 'TB-毛衣套装-003', productName: '毛衣两件套', price: 168, cost: 78 },
  { styleCode: 'TB-连衣裙-004', productName: '童装连衣裙', price: 129, cost: 55 },
  { styleCode: 'TB-保暖内衣-005', productName: '加绒保暖内衣套装', price: 89, cost: 32 }
]

export const taobao = {
  id: 'taobao',
  name: '淘宝/天猫',
  status: 'mock',
  uploadSlots: [],
  getMockBundle: () => generateMockBundle({
    platformPrefix: 'TB',
    shopName: '淘宝-某童装旗舰店',
    skus: SKUS,
    orderCount: 380,
    refundRate: 0.08,
    duplicatedCount: 5,
    anomalyCount: 3,
    missingInJstCount: 2,
    missingInPlatformCount: 1,
    platformFeeRate: 0.06,
    commissionRate: 0,
    promoFeeRate: 0.02,
    monthlyExpenseScenes: [
      { scene: '直通车广告费', count: 31, totalAmount: -8520, memo: '直通车日扣' },
      { scene: '钻展推广', count: 12, totalAmount: -3200 },
      { scene: '提现手续费', count: 4, totalAmount: -28 }
    ]
  }),
  transform() { throw new Error('taobao is mock platform; use getMockBundle()') }
}
