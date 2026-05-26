// 成本修改历史 — 按客户需求 #4

import { useCallback, useState } from 'react'
import { DEMO_COST_HISTORY } from '../core/demoData.js'

const STORAGE_KEY = 'ai-reconcile.costHistory'
const CLEARED_KEY = 'ai-reconcile.costHistory.cleared'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      return { logs: Array.isArray(arr) ? arr : [], isSeed: false }
    }
    if (!localStorage.getItem(CLEARED_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_COST_HISTORY))
      return { logs: DEMO_COST_HISTORY, isSeed: true }
    }
    return { logs: [], isSeed: false }
  } catch { return { logs: [], isSeed: false } }
}

function save(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch { /* ignore */ }
}

function newId() {
  return 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
}

export function useCostHistory() {
  const initial = loadInitial()
  const [logs, setLogs] = useState(initial.logs)
  const [isSeed, setIsSeed] = useState(initial.isSeed)

  const append = useCallback((entry) => {
    setLogs(prev => {
      const item = {
        id: newId(),
        timestamp: Date.now(),
        operator: entry.operator || '当前用户',
        ...entry
      }
      const next = [item, ...prev].slice(0, 1000)
      save(next)
      return next
    })
    setIsSeed(false)
  }, [])

  const clearAll = useCallback(() => {
    setLogs([]); save([])
    try { localStorage.setItem(CLEARED_KEY, '1') } catch { /* ignore */ }
    setIsSeed(false)
  }, [])

  const reseed = useCallback(() => {
    setLogs(DEMO_COST_HISTORY); save(DEMO_COST_HISTORY)
    try { localStorage.removeItem(CLEARED_KEY) } catch { /* ignore */ }
    setIsSeed(true)
  }, [])

  return { logs, isSeed, append, clearAll, reseed }
}
