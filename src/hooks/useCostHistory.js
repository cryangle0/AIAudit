// 成本修改历史 — 按客户需求 #4
// LogEntry: { id, timestamp, operator, action, period, styleCode, productCode,
//   field, oldValue, newValue, snapshot }

import { useCallback, useState } from 'react'

const STORAGE_KEY = 'ai-reconcile.costHistory'

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
  return 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
}

export function useCostHistory() {
  const [logs, setLogs] = useState(load)

  const append = useCallback((entry) => {
    setLogs(prev => {
      const item = {
        id: newId(),
        timestamp: Date.now(),
        operator: entry.operator || '当前用户',
        ...entry
      }
      const next = [item, ...prev].slice(0, 1000) // 最多保留 1000 条
      save(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => { setLogs([]); save([]) }, [])

  return { logs, append, clearAll }
}
