import { transformFromStandardRows, remapRowsToStandard } from './_shared.js'
import { generateMockRawData, renameRowsByMap } from './_mockGenerator.js'

const COLUMN_MAP = {
  '订单号': '订单号',
  '动账时间': '入账时间',
  '动帐流水号': '流水号',
  '动账方向': '资金方向',
  '动账金额': '实付金额',
  '动账场景': '资金场景',
  '销售收入': '商品金额',
  '平台服务费': '平台技术服务费',
  '佣金': '直播分销佣金',
  '订单退款': '退款',
  '站外推广费': '推广费',
  '备注': '备注'
}
const DIRECTION_VALUE_MAP = { '入账': '入', '出账': '出' }
const DIRECTION_REVERSE = { '入': '入账', '出': '出账' }

const FUND_SHEET = '视频号小店结算账单'
const JST_BILL_PREFIX = '视频号'

const SKUS = [
  { styleCode: 'SPH-冬装外套-001', productName: '童装冬装外套 (视频号直播款)', price: 199, cost: 92 },
  { styleCode: 'SPH-加绒卫衣-002', productName: '加绒卫衣', price: 129, cost: 58 },
  { styleCode: 'SPH-保暖套装-003', productName: '保暖三件套', price: 159, cost: 70 }
]

const MOCK_PARAMS = {
  platformPrefix: 'SPH',
  jstBillColumnPrefix: JST_BILL_PREFIX,
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

export const shipinhao = {
  id: 'shipinhao',
  name: '视频号小店',
  status: 'demo',
  uploadSlots: [
    { key: 'fund', label: '视频号小店结算账单', required: true,
      sheetName: FUND_SHEET,
      requiredColumns: ['订单号', '实付金额', '商品金额', '资金场景'] }
  ],
  sampleFileUrl: '/sample-data/shipinhao.xlsx',
  transform,
  getMockSampleData
}
