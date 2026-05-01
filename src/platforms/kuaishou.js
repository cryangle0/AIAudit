import { transformFromStandardRows, remapRowsToStandard } from './_shared.js'
import { generateMockRawData, renameRowsByMap } from './_mockGenerator.js'

const COLUMN_MAP = {
  '订单号': '订单编号',
  '动账时间': '流水时间',
  '动帐流水号': '流水编号',
  '动账方向': '流水方向',
  '动账金额': '结算金额',
  '动账场景': '业务场景',
  '销售收入': '商品总价',
  '平台服务费': '技术服务费',
  '佣金': '达人推广佣金',
  '订单退款': '退款',
  '站外推广费': '磁力金牛扣费',
  '备注': '备注'
}
const DIRECTION_VALUE_MAP = { '入账': '收', '出账': '付' }
const DIRECTION_REVERSE = { '收': '入账', '付': '出账' }

const FUND_SHEET = '快手商家结算单'
const JST_BILL_PREFIX = '快手'

const SKUS = [
  { styleCode: 'KS-儿童羽绒服-001', productName: '儿童羽绒服 (快手主推)', price: 169, cost: 88 },
  { styleCode: 'KS-加绒卫衣-002', productName: '加绒卫衣', price: 89, cost: 38 },
  { styleCode: 'KS-冬装套装-003', productName: '冬装两件套', price: 139, cost: 65 },
  { styleCode: 'KS-亲子装-004', productName: '亲子装外套', price: 199, cost: 95 }
]

const MOCK_PARAMS = {
  platformPrefix: 'KS',
  jstBillColumnPrefix: JST_BILL_PREFIX,
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

export const kuaishou = {
  id: 'kuaishou',
  name: '快手',
  status: 'demo',
  uploadSlots: [
    { key: 'fund', label: '快手商家结算单', required: true,
      sheetName: FUND_SHEET,
      requiredColumns: ['订单编号', '结算金额', '商品总价', '业务场景'] }
  ],
  sampleFileUrl: '/sample-data/kuaishou.xlsx',
  transform,
  getMockSampleData
}
