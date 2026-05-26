export const STORAGE_KEY = 'ai-reconcile.settings'

export const DEFAULT_SETTINGS = {
  enabledPlatforms: [
    // 国内
    'douyin', 'taobao', 'kuaishou', 'pinduoduo',
    'xiaohongshu', 'shipinhao', 'weixin_xiaodian',
    // 海外（需求 #6）
    'ozon', 'wildberries', 'tiktok_uk', 'amazon_us'
  ],
  customShops: {},
  dataSource: {
    primary: 'jushuitan',
    jushuitan: {
      apiUrl: '',
      token: '',
      columnMap: {
        orderId: '订单编号',
        sku: '商品编码',
        skuName: '商品名称',
        cost: '商品成本',
        quantity: '商品数量',
        date: '订单时间',
        shopName: '店铺名称'
      }
    },
    kingdee: { apiUrl: '', token: '' }
  },
  reconcileRules: {
    matchedThreshold: 0.01,
    minorThreshold: 5,
    severeThreshold: 50,
    includeRefunds: true,
    deductShipping: false,
    matchStrategy: 'orderId'
  }
}

// 浅+1层深度合并：top-level keys + dataSource 内部
export function mergeWithDefaults(stored) {
  if (!stored || typeof stored !== 'object') return { ...DEFAULT_SETTINGS }
  return {
    enabledPlatforms: Array.isArray(stored.enabledPlatforms)
      ? stored.enabledPlatforms : DEFAULT_SETTINGS.enabledPlatforms,
    customShops: (stored.customShops && typeof stored.customShops === 'object')
      ? stored.customShops : {},
    dataSource: {
      primary: stored.dataSource?.primary || DEFAULT_SETTINGS.dataSource.primary,
      jushuitan: { ...DEFAULT_SETTINGS.dataSource.jushuitan, ...(stored.dataSource?.jushuitan || {}) },
      kingdee: { ...DEFAULT_SETTINGS.dataSource.kingdee, ...(stored.dataSource?.kingdee || {}) }
    },
    reconcileRules: { ...DEFAULT_SETTINGS.reconcileRules, ...(stored.reconcileRules || {}) }
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return mergeWithDefaults(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // localStorage 满了 / 隐私模式：静默失败
  }
}

export function clearSettings() {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
}
