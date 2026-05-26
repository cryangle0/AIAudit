// 店铺配置 — 按需求 #16-#18
// ShopProfile: { id, platformId, name, currency, status('active'|'inactive'), settlementRule, memo }
//
// 与 useSettings.customShops 配合：customShops 是简单的 [{ id, name }]
// 这里的 ShopProfile 是更完整的店铺档案

import { useCallback, useState } from 'react'

const STORAGE_KEY = 'ai-reconcile.shopProfiles'

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

function newId() {
  return 'shop_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
}

export function useShopProfiles() {
  const [items, setItems] = useState(load)

  const add = useCallback((profile) => {
    setItems(prev => {
      const next = [...prev, { id: newId(), createdAt: Date.now(), status: 'active', ...profile }]
      save(next); return next
    })
  }, [])

  const update = useCallback((id, patch) => {
    setItems(prev => {
      const next = prev.map(x => x.id === id ? { ...x, ...patch, updatedAt: Date.now() } : x)
      save(next); return next
    })
  }, [])

  const remove = useCallback((id) => {
    setItems(prev => {
      const next = prev.filter(x => x.id !== id)
      save(next); return next
    })
  }, [])

  return { items, add, update, remove }
}
