import { transformFromStandardRows, remapRowsToStandard } from './_shared.js'
import { generateMockRawData, renameRowsByMap } from './_mockGenerator.js'

const COLUMN_MAP = {
  '订单号': '订单号',
  '动账时间': '入账时间',
  '动帐流水号': '流水号',
  '动账方向': '资金方向',
  '动账金额': '结算金额',
  '动账场景': '资金场景',
  '销售收入': '商品金额',
  '平台服务费': '平台手续费',
  '佣金': '推广佣金',
  '订单退款': '退款',
  '站外推广费': '推广费',
  '备注': '备注'
}
const DIRECTION_VALUE_MAP = { '入账': '收入', '出账': '支出' }
const DIRECTION_REVERSE = { '收入': '入账', '支出': '出账' }

const FUND_SHEET = '微信小店结算单'
const JST_BILL_PREFIX = '微信小店'

const SKUS = [
  { styleCode: 'WX-童装外套-001', productName: '童装外套 (微信小店私域款)', price: 219, cost: 95 },
  { styleCode: 'WX-亲子套装-002', productName: '亲子套装', price: 299, cost: 130 },
  { styleCode: 'WX-毛衣-003', productName: '童装毛衣', price: 119, cost: 50 }
]

const MOCK_PARAMS = {
  platformPrefix: 'WX',
  jstBillColumnPrefix: JST_BILL_PREFIX,
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
}

function transform({ fundRows = [] }) {
  const stdRows = remapRowsToStandard(fundRows, COLUMN_MAP, DIRECTION_REVERSE)
  return transformFromStandardRows(stdRows)
}

export function getMockSampleData() {
  const { fundRowsStd, jstRows } = generateMockRawData(MOCK_PARAMS)
  const fundRowsPlat = renameRowsByMap(fundRowsStd, COLUMN_MAP, DIRECTION_VALUE_MAP)
  return { fundRowsPlat, jstRows, fundSheet: FUND_SHEET }
}

export const weixin_xiaodian = {
  id: 'weixin_xiaodian',
  name: '微信小店',
  status: 'demo',
  uploadSlots: [
    { key: 'fund', label: '微信小店结算单', required: true,
      sheetName: FUND_SHEET,
      requiredColumns: ['订单号', '结算金额', '商品金额', '资金场景'] }
  ],
  sampleFileUrl: '/sample-data/weixin_xiaodian.xlsx',
  transform,
  getMockSampleData
}
