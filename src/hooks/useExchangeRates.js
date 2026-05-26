// 汇率数据持久化 hook
//
// 数据形态: { 'YYYY-MM': { USD: 7.18, RUB: 0.082, GBP: 9.05 } }

import { useCallback, useState } from 'react'
import { DEFAULT_RATES } from '../core/currency.js'

const STORAGE_KEY = 'ai-reconcile.exchangeRates'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_RATES }
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : { ...DEFAULT_RATES }
  } catch {
    return { ...DEFAULT_RATES }
  }
}

function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* ignore */ }
}

export function useExchangeRates() {
  const [rates, setRates] = useState(load)

  const updateRate = useCallback((period, currency, value) => {
    setRates(prev => {
      const next = {
        ...prev,
        [period]: { ...(prev[period] || {}), [currency]: Number(value) || 0, CNY: 1 }
      }
      save(next)
      return next
    })
  }, [])

  const updatePeriod = useCallback((period, periodRates) => {
    setRates(prev => {
      const next = { ...prev, [period]: { ...periodRates, CNY: 1 } }
      save(next)
      return next
    })
  }, [])

  const removePeriod = useCallback((period) => {
    setRates(prev => {
      const next = { ...prev }
      delete next[period]
      save(next)
      return next
    })
  }, [])

  const resetDefaults = useCallback(() => {
    setRates({ ...DEFAULT_RATES })
    save({ ...DEFAULT_RATES })
  }, [])

  return { rates, updateRate, updatePeriod, removePeriod, resetDefaults }
}
