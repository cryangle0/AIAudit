// 俄罗斯 OZON
import { transformFromStandardRows, remapRowsToStandard } from './_shared.js'

const COLUMN_MAP = {
  '订单号': 'Order Number',
  '动账方向': 'Direction',
  '动账金额': 'Amount',
  '销售收入': 'Revenue',
  '平台服务费': 'Commission',
  '动账场景': 'Type',
  '动帐流水号': 'Transaction ID',
  '动账时间': 'Date',
  '备注': 'Note'
}

const DIRECTION_MAP = { 'Income': '入账', 'Expense': '出账', '收入': '入账', '支出': '出账' }

function transform({ fundRows = [] }) {
  const remapped = remapRowsToStandard(fundRows, COLUMN_MAP, DIRECTION_MAP)
  return transformFromStandardRows(remapped)
}

export const ozon = {
  id: 'ozon',
  name: '俄罗斯 OZON',
  region: 'overseas',
  currency: 'RUB',
  status: 'demo',
  uploadSlots: [
    { key: 'fund', label: 'OZON 账单', required: true,
      sheetName: 'Sheet1', requiredColumns: ['Order Number', 'Amount'] }
  ],
  sampleFileUrl: null,
  transform
}
