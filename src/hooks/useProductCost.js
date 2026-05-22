import { useState, useCallback } from 'react'

const STORAGE_KEY = 'ai-reconcile.productCost'

// 商品成本表：{ period: '2026-01', styleCode, productCode, productName, baseCost, tagFee, accessoryFee, totalCost, updatedAt }
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

function save(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch { /* ignore */ }
}

export function useProductCost() {
  const [items, setItems] = useState(load)

  const setAll = useCallback(next => { setItems(next); save(next) }, [])

  const addOrUpdate = useCallback(rec => {
    setItems(prev => {
      const key = `${rec.period}|${rec.styleCode || ''}|${rec.productCode || ''}`
      const idx = prev.findIndex(x => `${x.period}|${x.styleCode || ''}|${x.productCode || ''}` === key)
      const merged = { ...rec, updatedAt: Date.now() }
      const next = idx >= 0 ? prev.map((x, i) => i === idx ? merged : x) : [...prev, merged]
      save(next)
      return next
    })
  }, [])

  const remove = useCallback(rec => {
    setItems(prev => {
      const next = prev.filter(x => x !== rec)
      save(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setItems([])
    save([])
  }, [])

  return { items, setAll, addOrUpdate, remove, clearAll }
}

// 在指定 period 下，按 productCode 优先、styleCode 兜底查找商品成本
export function findCost(items, period, styleCode, productCode) {
  if (!items || items.length === 0) return null
  const sameP = items.filter(x => x.period === period)
  if (productCode) {
    const hit = sameP.find(x => x.productCode === productCode)
    if (hit) return hit
  }
  if (styleCode) {
    const hit = sameP.find(x => x.styleCode === styleCode)
    if (hit) return hit
  }
  return null
}
