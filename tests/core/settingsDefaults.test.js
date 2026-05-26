import { describe, it, expect, beforeEach } from 'vitest'
import {
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  mergeWithDefaults,
  loadSettings,
  saveSettings,
  clearSettings
} from '../../src/core/settingsDefaults.js'

// 给 node env 临时塞一个内存 localStorage
beforeEach(() => {
  const store = {}
  globalThis.localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: k => { delete store[k] },
    clear: () => { for (const k of Object.keys(store)) delete store[k] }
  }
})

describe('DEFAULT_SETTINGS', () => {
  it('contains all 11 platforms enabled by default (7 domestic + 4 overseas)', () => {
    expect(DEFAULT_SETTINGS.enabledPlatforms).toEqual([
      'douyin', 'taobao', 'kuaishou', 'pinduoduo',
      'xiaohongshu', 'shipinhao', 'weixin_xiaodian',
      'ozon', 'wildberries', 'tiktok_uk', 'amazon_us'
    ])
  })

  it('has empty customShops by default', () => {
    expect(DEFAULT_SETTINGS.customShops).toEqual({})
  })

  it('jushuitan is the default data source', () => {
    expect(DEFAULT_SETTINGS.dataSource.primary).toBe('jushuitan')
  })

  it('reconcile thresholds satisfy matched < minor < severe', () => {
    const r = DEFAULT_SETTINGS.reconcileRules
    expect(r.matchedThreshold).toBeLessThan(r.minorThreshold)
    expect(r.minorThreshold).toBeLessThan(r.severeThreshold)
  })
})

describe('mergeWithDefaults', () => {
  it('returns full defaults when stored is null', () => {
    expect(mergeWithDefaults(null)).toEqual(DEFAULT_SETTINGS)
  })

  it('preserves stored top-level keys, fills missing ones', () => {
    const stored = { enabledPlatforms: ['douyin'] }
    const merged = mergeWithDefaults(stored)
    expect(merged.enabledPlatforms).toEqual(['douyin'])
    expect(merged.dataSource).toEqual(DEFAULT_SETTINGS.dataSource)
    expect(merged.reconcileRules).toEqual(DEFAULT_SETTINGS.reconcileRules)
  })

  it('deep-merges nested dataSource', () => {
    const stored = { dataSource: { primary: 'kingdee' } }
    const merged = mergeWithDefaults(stored)
    expect(merged.dataSource.primary).toBe('kingdee')
    expect(merged.dataSource.jushuitan).toEqual(DEFAULT_SETTINGS.dataSource.jushuitan)
  })
})

describe('loadSettings / saveSettings / clearSettings', () => {
  it('returns defaults when nothing stored', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('round-trips through save/load', () => {
    const updated = { ...DEFAULT_SETTINGS, enabledPlatforms: ['douyin'] }
    saveSettings(updated)
    expect(loadSettings()).toEqual(updated)
  })

  it('returns defaults if stored JSON is corrupted', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json')
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('clearSettings removes the storage key', () => {
    saveSettings({ ...DEFAULT_SETTINGS, enabledPlatforms: ['douyin'] })
    clearSettings()
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })
})
