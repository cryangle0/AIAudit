// 商品资料 — 需求 #1
// MasterRecord: { styleCode, productCode, productName, category, memo, createdAt, updatedAt }

import { useCallback, useState } from 'react'

const STORAGE_KEY = 'ai-reconcile.productMaster'

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

export function useProductMaster() {
  const [items, setItems] = useState(load)

  const addOrUpdate = useCallback((rec) => {
    setItems(prev => {
      const key = `${rec.styleCode || ''}|${rec.productCode || ''}`
      const idx = prev.findIndex(x => `${x.styleCode || ''}|${x.productCode || ''}` === key)
      const stamped = { ...rec, updatedAt: Date.now(),
        createdAt: idx >= 0 ? prev[idx].createdAt : Date.now() }
      const next = idx >= 0 ? prev.map((x, i) => i === idx ? stamped : x) : [...prev, stamped]
      save(next); return next
    })
  }, [])

  const addMany = useCallback((records) => {
    setItems(prev => {
      const map = new Map(prev.map(x => [`${x.styleCode || ''}|${x.productCode || ''}`, x]))
      for (const r of records) {
        const key = `${r.styleCode || ''}|${r.productCode || ''}`
        map.set(key, { ...map.get(key), ...r, updatedAt: Date.now() })
      }
      const next = Array.from(map.values())
      save(next); return next
    })
  }, [])

  const remove = useCallback((rec) => {
    setItems(prev => {
      const next = prev.filter(x => !(x.styleCode === rec.styleCode && x.productCode === rec.productCode))
      save(next); return next
    })
  }, [])

  const clearAll = useCallback(() => { setItems([]); save([]) }, [])

  return { items, addOrUpdate, addMany, remove, clearAll }
}
