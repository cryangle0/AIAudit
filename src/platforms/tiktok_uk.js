// 英国 TikTok Shop
import { transformFromStandardRows, remapRowsToStandard } from './_shared.js'

const COLUMN_MAP = {
  '订单号': 'Order ID',
  '动账方向': 'Transaction Type',
  '动账金额': 'Amount',
  '销售收入': 'Order Amount',
  '平台服务费': 'Platform Fee',
  '佣金': 'Commission',
  '动账场景': 'Reason',
  '动帐流水号': 'Statement ID',
  '动账时间': 'Statement Time',
  '备注': 'Notes'
}

const DIRECTION_MAP = { 'Settlement': '入账', 'Refund': '出账', 'Fee': '出账' }

function transform({ fundRows = [] }) {
  const remapped = remapRowsToStandard(fundRows, COLUMN_MAP, DIRECTION_MAP)
  return transformFromStandardRows(remapped)
}

export const tiktok_uk = {
  id: 'tiktok_uk',
  name: '英国 TikTok Shop',
  region: 'overseas',
  currency: 'GBP',
  status: 'demo',
  uploadSlots: [
    { key: 'fund', label: 'TikTok UK 结算报告', required: true,
      sheetName: 'Sheet1', requiredColumns: ['Order ID', 'Amount'] }
  ],
  sampleFileUrl: null,
  transform
}
