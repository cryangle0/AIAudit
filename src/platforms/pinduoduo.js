import { transformFromStandardRows, remapRowsToStandard } from './_shared.js'
import { generateMockRawData, renameRowsByMap } from './_mockGenerator.js'

const COLUMN_MAP = {
  '订单号': '订单号',
  '动账时间': '结算时间',
  '动帐流水号': '流水号',
  '动账方向': '收支方向',
  '动账金额': '实结金额',
  '动账场景': '业务类型',
  '销售收入': '商品金额',
  '平台服务费': '平台佣金',
  '佣金': '主播佣金',
  '订单退款': '退款',
  '站外推广费': '推广扣费',
  '备注': '备注'
}
const DIRECTION_VALUE_MAP = { '入账': '进账', '出账': '出账' }
const DIRECTION_REVERSE = { '进账': '入账', '出账': '出账' }

const FUND_SHEET = '拼多多结算明细'
const JST_BILL_PREFIX = '拼多多'

const SKUS = [
  { styleCode: 'PDD-儿童棉服-001', productName: '儿童棉服 (拼多多)', price: 49, cost: 22 },
  { styleCode: 'PDD-保暖内衣-002', productName: '保暖内衣套装', price: 39, cost: 15 },
  { styleCode: 'PDD-加绒裤-003', productName: '加绒打底裤', price: 29, cost: 11 },
  { styleCode: 'PDD-冬装外套-004', productName: '冬装连帽外套', price: 79, cost: 35 },
  { styleCode: 'PDD-毛绒玩偶-005', productName: '童装毛绒装', price: 59, cost: 24 }
]

const MOCK_PARAMS = {
  platformPrefix: 'PDD',
  jstBillColumnPrefix: JST_BILL_PREFIX,
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

export const pinduoduo = {
  id: 'pinduoduo',
  name: '拼多多',
  status: 'demo',
  uploadSlots: [
    { key: 'fund', label: '拼多多结算明细', required: true,
      sheetName: FUND_SHEET,
      requiredColumns: ['订单号', '实结金额', '商品金额', '业务类型'] }
  ],
  sampleFileUrl: '/sample-data/pinduoduo.xlsx',
  transform,
  getMockSampleData
}
