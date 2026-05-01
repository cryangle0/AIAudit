import { transformFromStandardRows, remapRowsToStandard } from './_shared.js'
import { generateMockRawData, renameRowsByMap } from './_mockGenerator.js'

// 淘宝/天猫 字段映射（std → platform）
const COLUMN_MAP = {
  '订单号': '子订单编号',
  '动账时间': '入账时间',
  '动帐流水号': '流水号',
  '动账方向': '收支类型',
  '动账金额': '实付金额',
  '动账场景': '业务类型',
  '销售收入': '商品金额',
  '平台服务费': '平台手续费',
  '佣金': '主播佣金',
  '订单退款': '退款金额',
  '站外推广费': '直通车扣费',
  '备注': '备注'
}
const DIRECTION_VALUE_MAP = { '入账': '收入', '出账': '支出' }
const DIRECTION_REVERSE = { '收入': '入账', '支出': '出账' }

const FUND_SHEET = '淘宝天猫结算明细'
const JST_BILL_PREFIX = '淘宝'

const SKUS = [
  { styleCode: 'TB-儿童轻薄羽绒服-001', productName: '儿童轻薄羽绒服 (天猫爆款)', price: 199, cost: 100 },
  { styleCode: 'TB-冬季外套-002', productName: '冬季加厚外套', price: 259, cost: 130 },
  { styleCode: 'TB-毛衣套装-003', productName: '毛衣两件套', price: 168, cost: 78 },
  { styleCode: 'TB-连衣裙-004', productName: '童装连衣裙', price: 129, cost: 55 },
  { styleCode: 'TB-保暖内衣-005', productName: '加绒保暖内衣套装', price: 89, cost: 32 }
]

const MOCK_PARAMS = {
  platformPrefix: 'TB',
  jstBillColumnPrefix: JST_BILL_PREFIX,
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
}

function transform({ fundRows = [] }) {
  const stdRows = remapRowsToStandard(fundRows, COLUMN_MAP, DIRECTION_REVERSE)
  return transformFromStandardRows(stdRows)
}

// 给样例文件生成器用
export function getMockSampleData() {
  const { fundRowsStd, jstRows } = generateMockRawData(MOCK_PARAMS)
  const fundRowsPlat = renameRowsByMap(fundRowsStd, COLUMN_MAP, DIRECTION_VALUE_MAP)
  return { fundRowsPlat, jstRows, fundSheet: FUND_SHEET }
}

export const taobao = {
  id: 'taobao',
  name: '淘宝/天猫',
  status: 'demo',
  uploadSlots: [
    { key: 'fund', label: '淘宝/天猫结算明细', required: true,
      sheetName: FUND_SHEET,
      requiredColumns: ['子订单编号', '实付金额', '商品金额', '业务类型'] }
  ],
  sampleFileUrl: '/sample-data/taobao.xlsx',
  transform,
  getMockSampleData
}
