// 分配标准 — 持久化
// Standard: { id, name, feeTypes:[], method, scope, periods, priority, memo }
//   method:
//     'byRevenue'   按销售收入比例分摊
//     'byQuantity'  按销售件数比例分摊
//     'byOrderCount' 按订单数比例分摊
//     'byEqual'     平均分摊到所有商品
//     'directOrder' 直接挂订单号（费用记录已带 platformOrderId 时使用）
//   scope:
//     'org'        分到组织（停在组织维度，不下钻）
//     'shop'       分到店铺（停在店铺维度）
//     'sku'        分到订单商品 SKU（最深三层分配）
//   periods: '*' 表示全部期间，或具体 'YYYY-MM'

import { useCallback, useState } from 'react'

const STORAGE_KEY = 'ai-reconcile.allocStandards'

export const METHOD_OPTIONS = [
  { value: 'byRevenue',    label: '按销售收入比例', desc: '按订单销售收入占比分摊' },
  { value: 'byQuantity',   label: '按销售件数比例', desc: '按销售件数占比分摊' },
  { value: 'byOrderCount', label: '按订单数比例',   desc: '按订单笔数占比分摊' },
  { value: 'byEqual',      label: '平均分摊',       desc: '在所有匹配维度上等额分摊' },
  { value: 'directOrder',  label: '直接挂订单',     desc: '费用直接落到 platformOrderId' }
]

export const SCOPE_OPTIONS = [
  { value: 'sku',  label: '订单商品（三层分配，最深）' },
  { value: 'shop', label: '店铺（停在店铺）' },
  { value: 'org',  label: '组织（停在组织）' }
]

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STANDARDS
    const arr = JSON.parse(raw)
    return Array.isArray(arr) && arr.length > 0 ? arr : DEFAULT_STANDARDS
  } catch { return DEFAULT_STANDARDS }
}

function save(arr) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch { /* ignore */ }
}

function newId() { return 'std_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8) }

// 默认 5 条分配标准（覆盖客户模板里提到的常见费用）
export const DEFAULT_STANDARDS = [
  { id: 'std_default_1', name: '直挂订单', feeTypes: ['平台服务费', '佣金', '订单退款'],
    method: 'directOrder', scope: 'sku', periods: '*', priority: 1,
    memo: '费用记录已携带订单号，直接挂到对应商品' },
  { id: 'std_default_2', name: '推广费按收入分摊', feeTypes: ['推广费'],
    method: 'byRevenue', scope: 'sku', periods: '*', priority: 2,
    memo: '推广拉新难以追溯到具体订单，按销售收入分摊' },
  { id: 'std_default_3', name: '运费险按订单数分摊', feeTypes: ['运费险'],
    method: 'byOrderCount', scope: 'sku', periods: '*', priority: 3,
    memo: '一笔订单一份运费险' },
  { id: 'std_default_4', name: '红包/补贴按收入分摊', feeTypes: ['红包', '补贴'],
    method: 'byRevenue', scope: 'sku', periods: '*', priority: 4,
    memo: '促销补贴按销售贡献比例分摊' },
  { id: 'std_default_5', name: '其他公共费用按收入分摊', feeTypes: ['保险费', '提现手续费', '快递费', '其他'],
    method: 'byRevenue', scope: 'sku', periods: '*', priority: 5,
    memo: '兜底规则' }
]

export function useAllocStandards() {
  const [items, setItems] = useState(load)

  const setAll = useCallback(next => { setItems(next); save(next) }, [])

  const add = useCallback(s => {
    setItems(prev => {
      const next = [...prev, { id: newId(), ...s }]
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

  const resetDefaults = useCallback(() => { setItems(DEFAULT_STANDARDS); save(DEFAULT_STANDARDS) }, [])

  return { items, setAll, add, update, remove, resetDefaults }
}
