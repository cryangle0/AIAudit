// 店铺配置 — 需求 #16-#18

import { useCallback, useState } from 'react'
import { DEMO_SHOP_PROFILES } from '../core/demoData.js'

const STORAGE_KEY = 'ai-reconcile.shopProfiles'
const CLEARED_KEY = 'ai-reconcile.shopProfiles.cleared'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      return { items: Array.isArray(arr) ? arr : [], isSeed: false }
    }
    if (!localStorage.getItem(CLEARED_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SHOP_PROFILES))
      return { items: DEMO_SHOP_PROFILES, isSeed: true }
    }
    return { items: [], isSeed: false }
  } catch { return { items: [], isSeed: false } }
}

function save(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch { /* ignore */ }
}

function newId() {
  return 'shop_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
}

export function useShopProfiles() {
  const initial = loadInitial()
  const [items, setItems] = useState(initial.items)
  const [isSeed, setIsSeed] = useState(initial.isSeed)

  const add = useCallback((profile) => {
    setItems(prev => {
      const next = [...prev, { id: newId(), createdAt: Date.now(), status: 'active', ...profile }]
      save(next); return next
    })
    setIsSeed(false)
  }, [])

  const update = useCallback((id, patch) => {
    setItems(prev => {
      const next = prev.map(x => x.id === id ? { ...x, ...patch, updatedAt: Date.now() } : x)
      save(next); return next
    })
    setIsSeed(false)
  }, [])

  const remove = useCallback((id) => {
    setItems(prev => {
      const next = prev.filter(x => x.id !== id)
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
    setItems(DEMO_SHOP_PROFILES); save(DEMO_SHOP_PROFILES)
    try { localStorage.removeItem(CLEARED_KEY) } catch { /* ignore */ }
    setIsSeed(true)
  }, [])

  return { items, isSeed, add, update, remove, clearAll, reseed }
}
