// 商品资料 — 需求 #1
// 首次访问（无数据且未显式清空）使用种子数据，isSeed=true 提醒用户

import { useCallback, useRef, useState } from 'react'
import { DEMO_PRODUCT_MASTER } from '../core/demoData.js'

const STORAGE_KEY = 'ai-reconcile.productMaster'
const CLEARED_KEY = 'ai-reconcile.productMaster.cleared'

function buildSeed() {
  const t = Date.now()
  return DEMO_PRODUCT_MASTER.map(x => ({ ...x, createdAt: t, updatedAt: t }))
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

export function useProductMaster() {
  const initial = loadInitial()
  const [items, setItems] = useState(initial.items)
  const [isSeed, setIsSeed] = useState(initial.isSeed)

  const addOrUpdate = useCallback((rec) => {
    setItems(prev => {
      const key = `${rec.styleCode || ''}|${rec.productCode || ''}`
      const idx = prev.findIndex(x => `${x.styleCode || ''}|${x.productCode || ''}` === key)
      const stamped = { ...rec, updatedAt: Date.now(),
        createdAt: idx >= 0 ? prev[idx].createdAt : Date.now() }
      const next = idx >= 0 ? prev.map((x, i) => i === idx ? stamped : x) : [...prev, stamped]
      save(next); return next
    })
    setIsSeed(false)
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
    setIsSeed(false)
  }, [])

  const remove = useCallback((rec) => {
    setItems(prev => {
      const next = prev.filter(x => !(x.styleCode === rec.styleCode && x.productCode === rec.productCode))
      save(next); return next
    })
    setIsSeed(false)
  }, [])

  const clearAll = useCallback(() => {
    setItems([])
    save([])
    try { localStorage.setItem(CLEARED_KEY, '1') } catch { /* ignore */ }
    setIsSeed(false)
  }, [])

  const reseed = useCallback(() => {
    const seeded = buildSeed()
    setItems(seeded); save(seeded)
    try { localStorage.removeItem(CLEARED_KEY) } catch { /* ignore */ }
    setIsSeed(true)
  }, [])

  return { items, isSeed, addOrUpdate, addMany, remove, clearAll, reseed }
}
