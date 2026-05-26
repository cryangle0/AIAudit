// 数据归集 — 费用记录持久化

import { useCallback, useState } from 'react'
import { DEMO_FEE_RECORDS } from '../core/demoData.js'

const STORAGE_KEY = 'ai-reconcile.feeRecords'
const CLEARED_KEY = 'ai-reconcile.feeRecords.cleared'

export const FEE_TYPES = [
  '平台服务费', '佣金', '推广费', '运费险', '红包',
  '补贴', '保险费', '提现手续费', '快递费', '其他'
]

export const ORG_OPTIONS = [
  { id: 'default', name: '童装事业部' }
]

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      return { items: Array.isArray(arr) ? arr : [], isSeed: false }
    }
    if (!localStorage.getItem(CLEARED_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_FEE_RECORDS))
      return { items: DEMO_FEE_RECORDS, isSeed: true }
    }
    return { items: [], isSeed: false }
  } catch { return { items: [], isSeed: false } }
}

function save(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch { /* ignore */ }
}

function newId() {
  return 'fee_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
}

export function useFeeRecords() {
  const initial = loadInitial()
  const [items, setItems] = useState(initial.items)
  const [isSeed, setIsSeed] = useState(initial.isSeed)

  const setAll = useCallback(next => { setItems(next); save(next); setIsSeed(false) }, [])

  const add = useCallback(rec => {
    setItems(prev => {
      const next = [...prev, { id: newId(), createdAt: Date.now(), ...rec }]
      save(next); return next
    })
    setIsSeed(false)
  }, [])

  const addMany = useCallback(records => {
    setItems(prev => {
      const stamped = records.map(r => ({ id: newId(), createdAt: Date.now(), ...r }))
      const next = [...prev, ...stamped]
      save(next); return next
    })
    setIsSeed(false)
  }, [])

  const update = useCallback((id, patch) => {
    setItems(prev => {
      const next = prev.map(x => x.id === id ? { ...x, ...patch } : x)
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
    setItems(DEMO_FEE_RECORDS); save(DEMO_FEE_RECORDS)
    try { localStorage.removeItem(CLEARED_KEY) } catch { /* ignore */ }
    setIsSeed(true)
  }, [])

  return { items, isSeed, setAll, add, addMany, update, remove, clearAll, reseed }
}
