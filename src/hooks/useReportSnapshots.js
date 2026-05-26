// 报表快照 — 实现客户需求 #3 "成本版本控制"
//
// 客户原话：成本更改后不影响之前已生成的报表数据，历史数据保持锁定
//
// 设计：用户在某个期间生成报表后，可以"锁定"快照存到 localStorage
// 后续如果商品成本改了，已锁定快照不变；新对账才用新成本
//
// Snapshot: { id, period, platformId, shopId, lockedAt, costItemsAtLock, reconcileResult }

import { useCallback, useState } from 'react'

const STORAGE_KEY = 'ai-reconcile.reportSnapshots'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

function save(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch { /* localStorage 满 */ }
}

function newId() {
  return 'snap_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
}

export function useReportSnapshots() {
  const [snapshots, setSnapshots] = useState(load)

  const create = useCallback((entry) => {
    setSnapshots(prev => {
      const next = [{ id: newId(), lockedAt: Date.now(), ...entry }, ...prev]
      save(next)
      return next
    })
  }, [])

  const remove = useCallback((id) => {
    setSnapshots(prev => {
      const next = prev.filter(x => x.id !== id)
      save(next)
      return next
    })
  }, [])

  const findByScope = useCallback((period, platformId, shopId) => {
    return snapshots.find(s =>
      s.period === period && s.platformId === platformId && s.shopId === shopId)
  }, [snapshots])

  return { snapshots, create, remove, findByScope }
}
