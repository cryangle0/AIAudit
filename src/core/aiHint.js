function fmtAmount(n) {
  return Math.abs(n).toFixed(2)
}

export function generateHint(row) {
  switch (row.bucket) {
    case 'matched':
      return null
    case 'duplicated': {
      const mult = row.saleRevenue ? Math.round(row.jstBillAmountSum / row.saleRevenue) : 0
      return `聚水潭同订单多行（售后/换货）金额累计为平台的 ${mult} 倍，需人工确认是否为重复登记`
    }
    case 'missing_in_jst':
      return '平台有此单，聚水潭未导出，可能未发货或导出条件遗漏'
    case 'missing_in_platform':
      return '聚水潭有此单，平台账单未结算，可能跨月或在途'
    case 'profit_anomaly':
      return `毛利偏离系统记录 ¥${fmtAmount(row.profitDiff)}，请核对成本价或退款金额`
    default:
      return null
  }
}
