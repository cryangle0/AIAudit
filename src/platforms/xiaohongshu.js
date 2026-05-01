import { transformFromStandardRows, remapRowsToStandard } from './_shared.js'
import { generateMockRawData, renameRowsByMap } from './_mockGenerator.js'

const COLUMN_MAP = {
  '订单号': '订单号',
  '动账时间': '结算时间',
  '动帐流水号': '流水号',
  '动账方向': '收支类型',
  '动账金额': '结算金额',
  '动账场景': '业务类型',
  '销售收入': '商品销售额',
  '平台服务费': '平台手续费',
  '佣金': '达人佣金',
  '订单退款': '退款金额',
  '站外推广费': '聚光投放费',
  '备注': '备注'
}
const DIRECTION_VALUE_MAP = { '入账': '入账', '出账': '出账' }
const DIRECTION_REVERSE = { '入账': '入账', '出账': '出账' }

const FUND_SHEET = '小红书聚光结算'
const JST_BILL_PREFIX = '小红书'

const SKUS = [
  { styleCode: 'XHS-种草款外套-001', productName: '童装外套 (小红书种草款)', price: 269, cost: 110 },
  { styleCode: 'XHS-亲子装-002', productName: '母女亲子装', price: 359, cost: 150 },
  { styleCode: 'XHS-公主裙-003', productName: '公主蓬蓬裙', price: 189, cost: 75 },
  { styleCode: 'XHS-毛呢大衣-004', productName: '毛呢小大衣', price: 329, cost: 140 }
]

const MOCK_PARAMS = {
  platformPrefix: 'XHS',
  jstBillColumnPrefix: JST_BILL_PREFIX,
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

export const xiaohongshu = {
  id: 'xiaohongshu',
  name: '小红书',
  status: 'demo',
  uploadSlots: [
    { key: 'fund', label: '小红书聚光结算', required: true,
      sheetName: FUND_SHEET,
      requiredColumns: ['订单号', '结算金额', '商品销售额', '业务类型'] }
  ],
  sampleFileUrl: '/sample-data/xiaohongshu.xlsx',
  transform,
  getMockSampleData
}
