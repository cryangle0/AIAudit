import { AMOUNT_EPSILON, PROFIT_ANOMALY_ABS, PROFIT_ANOMALY_PCT } from './constants.js'

export function realProfit({ netSettled, shippedCost }) {
  return (netSettled || 0) - (shippedCost || 0)
}

export function profitDiff({ netSettled, shippedCost, systemProfit }) {
  return realProfit({ netSettled, shippedCost }) - (systemProfit || 0)
}

export function isAmountEqual(a, b) {
  return Math.abs((a || 0) - (b || 0)) < AMOUNT_EPSILON
}

export function isProfitAnomaly(diff, systemProfit) {
  const abs = Math.abs(diff)
  const pct = systemProfit === 0 ? 0 : abs / Math.abs(systemProfit)
  return abs > PROFIT_ANOMALY_ABS && pct > PROFIT_ANOMALY_PCT
}
