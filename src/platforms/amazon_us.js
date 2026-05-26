// 美国 Amazon
import { transformFromStandardRows, remapRowsToStandard } from './_shared.js'

const COLUMN_MAP = {
  '订单号': 'order-id',
  '动账方向': 'transaction-type',
  '动账金额': 'amount',
  '销售收入': 'product-sales',
  '平台服务费': 'selling-fees',
  '佣金': 'fba-fees',
  '动账场景': 'description',
  '动帐流水号': 'settlement-id',
  '动账时间': 'posted-date',
  '备注': 'reason'
}

const DIRECTION_MAP = { 'Order': '入账', 'Refund': '出账', 'Service Fee': '出账' }

function transform({ fundRows = [] }) {
  const remapped = remapRowsToStandard(fundRows, COLUMN_MAP, DIRECTION_MAP)
  return transformFromStandardRows(remapped)
}

export const amazon_us = {
  id: 'amazon_us',
  name: '美国 Amazon',
  region: 'overseas',
  currency: 'USD',
  status: 'demo',
  uploadSlots: [
    { key: 'fund', label: 'Amazon 结算报告', required: true,
      sheetName: 'Sheet1', requiredColumns: ['order-id', 'amount'] }
  ],
  sampleFileUrl: null,
  transform
}
