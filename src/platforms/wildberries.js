// 俄罗斯 Wildberries (野莓)
import { transformFromStandardRows, remapRowsToStandard } from './_shared.js'

const COLUMN_MAP = {
  '订单号': 'srid',
  '动账方向': 'doc_type',
  '动账金额': 'realizationreport_id',
  '销售收入': 'retail_amount',
  '平台服务费': 'commission_percent',
  '动账场景': 'subject_name',
  '动帐流水号': 'rid',
  '动账时间': 'date_from',
  '备注': 'comment'
}

const DIRECTION_MAP = { 'sale': '入账', 'return': '出账', '销售': '入账', '退货': '出账' }

function transform({ fundRows = [] }) {
  const remapped = remapRowsToStandard(fundRows, COLUMN_MAP, DIRECTION_MAP)
  return transformFromStandardRows(remapped)
}

export const wildberries = {
  id: 'wildberries',
  name: '俄罗斯野莓',
  region: 'overseas',
  currency: 'RUB',
  status: 'demo',
  uploadSlots: [
    { key: 'fund', label: 'Wildberries 销售报告', required: true,
      sheetName: 'Sheet1', requiredColumns: ['srid', 'retail_amount'] }
  ],
  sampleFileUrl: null,
  transform
}
