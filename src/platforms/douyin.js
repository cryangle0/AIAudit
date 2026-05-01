import { transformFromStandardRows } from './_shared.js'

function transform({ fundRows = [] }) {
  return transformFromStandardRows(fundRows)
}

export const douyin = {
  id: 'douyin',
  name: '抖音',
  status: 'ready',
  uploadSlots: [
    { key: 'fund', label: '抖音资金账单', required: true,
      sheetName: '抖音资金账单', requiredColumns: ['订单号', '动账金额', '销售收入', '动账场景'] },
    { key: 'summary', label: '抖音账单汇总（可选）', required: false,
      sheetName: '抖音账单汇总', requiredColumns: ['订单号', '求和项:销售收入'] }
  ],
  sampleFileUrl: '/sample-data/douyin.xlsx',
  transform
}
