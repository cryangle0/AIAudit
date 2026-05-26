// 汇率与币种核心
//
// 客户规则（《汇率规则说明》）:
//   1. 取值日期: 固定取账单所属月份的次月1日
//      例: 1月账单 → 取2月1日汇率
//   2. 币种范围: CNY / RUB / GBP / USD
//   3. 换算方向: 海外平台收入统一换算为人民币
//   4. 异常处理: 若次月1日为节假日，取前一个工作日

export const CURRENCIES = [
  { code: 'CNY', name: '人民币', symbol: '¥', isBase: true },
  { code: 'USD', name: '美元', symbol: '$' },
  { code: 'RUB', name: '俄罗斯卢布', symbol: '₽' },
  { code: 'GBP', name: '英镑', symbol: '£' }
]

// 默认汇率（2026年初的近似值，作为兜底；用户可在汇率管理页面更新）
// rate 为该外币兑 1 CNY 需要多少；换算到 CNY 时用 amount / rate
// 实际客户填的是 1 外币 = N CNY，所以 rate 直接是 1 外币兑 CNY
export const DEFAULT_RATES = {
  // 期间格式 "YYYY-MM" → { code: 1外币兑CNY }
  '2026-01': { CNY: 1, USD: 7.18, RUB: 0.082, GBP: 9.05 },
  '2026-02': { CNY: 1, USD: 7.20, RUB: 0.080, GBP: 9.10 },
  '2026-03': { CNY: 1, USD: 7.15, RUB: 0.083, GBP: 9.15 },
  '2025-12': { CNY: 1, USD: 7.25, RUB: 0.075, GBP: 9.00 }
}

/**
 * 计算账单期间应使用的汇率取值期
 * 1月账单 → 2月1日 → 期间记为 '2026-02'
 * @param {string} billPeriod - 'YYYY-MM'
 */
export function getRateLookupPeriod(billPeriod) {
  if (!billPeriod) return null
  const [y, m] = billPeriod.split('-').map(Number)
  if (!y || !m) return null
  if (m === 12) return `${y + 1}-01`
  return `${y}-${String(m + 1).padStart(2, '0')}`
}

/**
 * 查询某期间某币种汇率（外币 → CNY）
 * @param {object} ratesByPeriod - { 'YYYY-MM': { USD: 7.18, ... } }
 * @param {string} billPeriod - 账单期间
 * @param {string} currency - 币种 code
 * @returns {number|null}
 */
export function lookupRate(ratesByPeriod, billPeriod, currency) {
  if (currency === 'CNY' || !currency) return 1
  const lookupPeriod = getRateLookupPeriod(billPeriod)
  const periodRates = ratesByPeriod?.[lookupPeriod]
  if (periodRates && periodRates[currency] != null) return periodRates[currency]
  // 兜底：默认值
  return DEFAULT_RATES[lookupPeriod]?.[currency] ?? null
}

/**
 * 把外币金额换算为 CNY
 * @returns {{ amountCNY, rate, lookupPeriod }}
 */
export function convertToCNY(amount, currency, billPeriod, ratesByPeriod) {
  if (!amount) return { amountCNY: 0, rate: 1, lookupPeriod: null }
  if (currency === 'CNY' || !currency) {
    return { amountCNY: amount, rate: 1, lookupPeriod: null }
  }
  const rate = lookupRate(ratesByPeriod, billPeriod, currency)
  const lookupPeriod = getRateLookupPeriod(billPeriod)
  if (rate == null) return { amountCNY: null, rate: null, lookupPeriod }
  return { amountCNY: amount * rate, rate, lookupPeriod }
}

export function getCurrencyInfo(code) {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0]
}
