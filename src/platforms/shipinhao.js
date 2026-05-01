import { generateMockBundle } from './_mockGenerator.js'

const SKUS = [
  { styleCode: 'SPH-冬装外套-001', productName: '童装冬装外套 (视频号直播款)', price: 199, cost: 92 },
  { styleCode: 'SPH-加绒卫衣-002', productName: '加绒卫衣', price: 129, cost: 58 },
  { styleCode: 'SPH-保暖套装-003', productName: '保暖三件套', price: 159, cost: 70 }
]

export const shipinhao = {
  id: 'shipinhao',
  name: '视频号小店',
  status: 'mock',
  uploadSlots: [],
  getMockBundle: () => generateMockBundle({
    platformPrefix: 'SPH',
    shopName: '视频号-某童装小店',
    skus: SKUS,
    orderCount: 68,
    refundRate: 0.05,
    duplicatedCount: 1,
    anomalyCount: 1,
    missingInJstCount: 0,
    missingInPlatformCount: 1,
    platformFeeRate: 0.05,
    commissionRate: 0.03,
    promoFeeRate: 0,
    monthlyExpenseScenes: [
      { scene: '微信豆充值', count: 6, totalAmount: -480 },
      { scene: '提现手续费', count: 2, totalAmount: -16 }
    ]
  }),
  transform() { throw new Error('shipinhao is mock platform; use getMockBundle()') }
}
