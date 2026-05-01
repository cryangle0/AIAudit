import { generateMockBundle } from './_mockGenerator.js'

const SKUS = [
  { styleCode: 'WX-童装外套-001', productName: '童装外套 (微信小店私域款)', price: 219, cost: 95 },
  { styleCode: 'WX-亲子套装-002', productName: '亲子套装', price: 299, cost: 130 },
  { styleCode: 'WX-毛衣-003', productName: '童装毛衣', price: 119, cost: 50 }
]

export const weixin_xiaodian = {
  id: 'weixin_xiaodian',
  name: '微信小店',
  status: 'mock',
  uploadSlots: [],
  getMockBundle: () => generateMockBundle({
    platformPrefix: 'WX',
    shopName: '微信小店-某童装店',
    skus: SKUS,
    orderCount: 42,
    refundRate: 0.03,
    duplicatedCount: 1,
    anomalyCount: 1,
    missingInJstCount: 0,
    missingInPlatformCount: 1,
    platformFeeRate: 0.006,
    commissionRate: 0,
    promoFeeRate: 0,
    monthlyExpenseScenes: [
      { scene: '提现手续费', count: 3, totalAmount: -18 }
    ]
  }),
  transform() { throw new Error('weixin_xiaodian is mock platform; use getMockBundle()') }
}
