import { useState, useCallback } from 'react'
import { DEMO_PRODUCT_COST } from '../core/demoData.js'

const STORAGE_KEY = 'ai-reconcile.productCost'
const CLEARED_KEY = 'ai-reconcile.productCost.cleared'

function buildSeed() {
  const t = Date.now()
  return DEMO_PRODUCT_COST.map(x => ({ ...x, updatedAt: t }))
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      return { items: Array.isArray(arr) ? arr : [], isSeed: false }
    }
    if (!localStorage.getItem(CLEARED_KEY)) {
      const seeded = buildSeed()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
      return { items: seeded, isSeed: true }
    }
    return { items: [], isSeed: false }
  } catch { return { items: [], isSeed: false } }
}

function save(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch { /* ignore */ }
}

export function useProductCost() {
  const initial = loadInitial()
  const [items, setItems] = useState(initial.items)
  const [isSeed, setIsSeed] = useState(initial.isSeed)

  const setAll = useCallback(next => {
    setItems(next); save(next); setIsSeed(false)
  }, [])

  const addOrUpdate = useCallback(rec => {
    setItems(prev => {
      const key = `${rec.period}|${rec.styleCode || ''}|${rec.productCode || ''}`
      const idx = prev.findIndex(x => `${x.period}|${x.styleCode || ''}|${x.productCode || ''}` === key)
      const merged = { ...rec, updatedAt: Date.now() }
      const next = idx >= 0 ? prev.map((x, i) => i === idx ? merged : x) : [...prev, merged]
      save(next); return next
    })
    setIsSeed(false)
  }, [])

  const remove = useCallback(rec => {
    setItems(prev => {
      const next = prev.filter(x => x !== rec)
      save(next); return next
    })
    setIsSeed(false)
  }, [])

  const clearAll = useCallback(() => {
    setItems([]); save([])
    try { localStorage.setItem(CLEARED_KEY, '1') } catch { /* ignore */ }
    setIsSeed(false)
  }, [])

  const reseed = useCallback(() => {
    const seeded = buildSeed()
    setItems(seeded); save(seeded)
    try { localStorage.removeItem(CLEARED_KEY) } catch { /* ignore */ }
    setIsSeed(true)
  }, [])

  return { items, isSeed, setAll, addOrUpdate, remove, clearAll, reseed }
}

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
