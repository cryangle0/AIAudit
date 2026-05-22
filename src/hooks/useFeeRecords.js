// 数据归集 — 费用记录持久化
// FeeRecord: { id, period, feeType, org, shopId, platformOrderId, amount, date, memo }
// 严格按客户模板字段：费用类型 / 组织 / 店铺 / 平台单号 / 费用金额 / 费用日期 / 备注

import { useCallback, useState } from 'react'

const STORAGE_KEY = 'ai-reconcile.feeRecords'

// 客户模板里强调的费用类型（可在分配标准里映射）
export const FEE_TYPES = [
  '平台服务费',
  '佣金',
  '推广费',
  '运费险',
  '红包',
  '补贴',
  '保险费',
  '提现手续费',
  '快递费',
  '其他'
]

// 组织维度（默认童装事业部，未来可扩展）
export const ORG_OPTIONS = [
  { id: 'default', name: '童装事业部' }
]

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
  return 'fee_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
}

export function useFeeRecords() {
  const [items, setItems] = useState(load)

  const setAll = useCallback(next => { setItems(next); save(next) }, [])

  const add = useCallback(rec => {
    setItems(prev => {
      const next = [...prev, { id: newId(), createdAt: Date.now(), ...rec }]
      save(next); return next
    })
  }, [])

  const addMany = useCallback(records => {
    setItems(prev => {
      const stamped = records.map(r => ({ id: newId(), createdAt: Date.now(), ...r }))
      const next = [...prev, ...stamped]
      save(next); return next
    })
  }, [])

  const update = useCallback((id, patch) => {
    setItems(prev => {
      const next = prev.map(x => x.id === id ? { ...x, ...patch } : x)
      save(next); return next
    })
  }, [])

  const remove = useCallback(id => {
    setItems(prev => {
      const next = prev.filter(x => x.id !== id)
      save(next); return next
    })
  }, [])

  const clearAll = useCallback(() => { setItems([]); save([]) }, [])

  return { items, setAll, add, addMany, update, remove, clearAll }
}
