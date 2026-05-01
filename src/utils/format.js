const FMT = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 2 })
export function fmtMoney(n) {
  if (n == null || isNaN(n)) return '—'
  return FMT.format(n)
}
export function fmtNumber(n) {
  if (n == null || isNaN(n)) return '—'
  return new Intl.NumberFormat('zh-CN').format(n)
}
export function fmtPct(n) {
  if (n == null || isNaN(n)) return '—'
  return (n * 100).toFixed(1) + '%'
}
