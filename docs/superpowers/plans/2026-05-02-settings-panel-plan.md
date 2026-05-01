# 设置面板 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把侧边栏底部的"设置"按钮接入一个真正承载业务配置的面板（平台/店铺/数据源/对账规则），状态持久化到 localStorage。原型阶段：UI 演示，不接入对账核心逻辑。

**Architecture:** Settings 独立于现有 store，通过 `useSettings()` 自定义 hook 同步 localStorage。底层 `settingsDefaults.js` 提供纯函数（load/save/merge）方便单测。Sidebar 读 `settings.enabledPlatforms` 过滤平台、合并 `MOCK_SHOPS + customShops` 显示店铺。`<SettingsModal>` 做壳子（左 nav + 右 content），下挂 4 个独立 panel 组件。

**Tech Stack:** React 19 + Vite 8 + lucide-react + vitest（仅核心纯函数）

**参考设计稿：** `docs/superpowers/specs/2026-05-02-settings-panel-design.md`

---

## File Structure

**新增：**
```
src/core/settingsDefaults.js                 默认值常量 + 纯函数 (load/save/merge/clear)
src/hooks/useSettings.js                     React hook，包装上面的纯函数
src/components/SettingsModal.jsx             设置弹窗壳（左 nav + 右 content）
src/components/settings/PlatformsPanel.jsx   平台启用/禁用
src/components/settings/ShopsPanel.jsx       店铺列表 + CRUD 入口
src/components/settings/ShopEditDialog.jsx   新增/编辑店铺的小弹窗
src/components/settings/DataSourcePanel.jsx  聚水潭/金蝶配置
src/components/settings/RulesPanel.jsx       对账规则
src/components/settings/settings.css         所有 settings 子面板共用样式
tests/core/settingsDefaults.test.js          纯函数单测
```

**修改：**
```
src/components/Sidebar.jsx                   读 settings 过滤平台/店铺；接入 SettingsModal
src/App.jsx                                  调 useSettings()，透传；加边界保护 effect
```

---

## Task 1: settingsDefaults — 默认值 + 纯函数（TDD）

**Files:**
- Create: `src/core/settingsDefaults.js`
- Test: `tests/core/settingsDefaults.test.js`

- [ ] **Step 1.1: Write the failing test**

Create `tests/core/settingsDefaults.test.js`:

```javascript
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
  it('contains all 7 platforms enabled by default', () => {
    expect(DEFAULT_SETTINGS.enabledPlatforms).toEqual([
      'douyin', 'taobao', 'kuaishou', 'pinduoduo',
      'xiaohongshu', 'shipinhao', 'weixin_xiaodian'
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
```

- [ ] **Step 1.2: Run test to verify it fails**

Run: `npm test -- settingsDefaults`
Expected: FAIL with "Cannot find module '../../src/core/settingsDefaults.js'"

- [ ] **Step 1.3: Implement settingsDefaults**

Create `src/core/settingsDefaults.js`:

```javascript
export const STORAGE_KEY = 'ai-reconcile.settings'

export const DEFAULT_SETTINGS = {
  enabledPlatforms: [
    'douyin', 'taobao', 'kuaishou', 'pinduoduo',
    'xiaohongshu', 'shipinhao', 'weixin_xiaodian'
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
```

- [ ] **Step 1.4: Run test to verify it passes**

Run: `npm test -- settingsDefaults`
Expected: PASS, all 11 tests green

- [ ] **Step 1.5: Commit**

```bash
git add src/core/settingsDefaults.js tests/core/settingsDefaults.test.js
git commit -m "feat(settings): defaults + storage 纯函数 + 单测"
```

---

## Task 2: useSettings hook（薄壳）

**Files:**
- Create: `src/hooks/useSettings.js`

- [ ] **Step 2.1: Implement the hook**

Create `src/hooks/useSettings.js`:

```javascript
import { useCallback, useState } from 'react'
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  clearSettings
} from '../core/settingsDefaults.js'

export function useSettings() {
  const [settings, setSettings] = useState(() => loadSettings())

  // updater(prev) => next，或者直接传 partial 对象
  const updateSettings = useCallback(updater => {
    setSettings(prev => {
      const next = typeof updater === 'function'
        ? updater(prev)
        : { ...prev, ...updater }
      saveSettings(next)
      return next
    })
  }, [])

  const resetSettings = useCallback(() => {
    clearSettings()
    setSettings({ ...DEFAULT_SETTINGS })
  }, [])

  return [settings, updateSettings, resetSettings]
}
```

- [ ] **Step 2.2: Verify build still works**

Run: `npm run build`
Expected: build success, no errors

- [ ] **Step 2.3: Commit**

```bash
git add src/hooks/useSettings.js
git commit -m "feat(settings): useSettings hook，包装 localStorage 同步"
```

---

## Task 3: App.jsx 接入 useSettings + 边界保护

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 3.1: Modify App.jsx**

Open `src/App.jsx`, find:

```javascript
import { useReconcileStore } from './hooks/useReconcileStore.js'
```

Add below it:

```javascript
import { useSettings } from './hooks/useSettings.js'
```

Find:

```javascript
export default function App() {
  const { state, dispatch, login, logout } = useReconcileStore()
```

Add right after that line:

```javascript
  const [settings, updateSettings, resetSettings] = useSettings()
```

Find the `useEffect` for darkMode body class and add a new effect after it:

```javascript
  // 设置变化导致当前选中的平台/店铺不可用时，自动切换到合法值
  useEffect(() => {
    const enabled = settings.enabledPlatforms
    if (enabled.length === 0) return // UI 层禁止全部取消，不会到这里

    let nextPid = state.platformId
    if (!enabled.includes(nextPid)) nextPid = enabled[0]

    const allShops = [
      ...(MOCK_SHOPS[nextPid] || []),
      ...(settings.customShops[nextPid] || [])
    ]
    const ids = allShops.map(s => s.id)
    let nextSid = state.shopId
    if (!ids.includes(nextSid)) nextSid = allShops[0]?.id

    if (nextPid !== state.platformId || nextSid !== state.shopId) {
      dispatch({ type: 'SELECT_SCOPE', platformId: nextPid, shopId: nextSid, month: state.month })
    }
  }, [settings.enabledPlatforms, settings.customShops, state.platformId, state.shopId, state.month, dispatch])
```

Find the `<Sidebar ... />` JSX and update its props. Replace:

```jsx
      <Sidebar
        platformId={state.platformId} shopId={state.shopId} month={state.month}
        darkMode={state.darkMode}
        onScopeChange={onScopeChange}
        onToggleDark={() => dispatch({ type: 'TOGGLE_DARK' })}
        onLogout={logout}/>
```

With:

```jsx
      <Sidebar
        platformId={state.platformId} shopId={state.shopId} month={state.month}
        darkMode={state.darkMode}
        settings={settings}
        updateSettings={updateSettings}
        resetSettings={resetSettings}
        onScopeChange={onScopeChange}
        onToggleDark={() => dispatch({ type: 'TOGGLE_DARK' })}
        onLogout={logout}/>
```

- [ ] **Step 3.2: Verify build**

Run: `npm run build`
Expected: build success

- [ ] **Step 3.3: Commit**

```bash
git add src/App.jsx
git commit -m "feat(settings): App 接入 useSettings + 边界保护 effect"
```

---

## Task 4: SettingsModal 壳子（左 nav + 右 content 占位）

**Files:**
- Create: `src/components/SettingsModal.jsx`
- Create: `src/components/settings/settings.css`
- Modify: `src/components/Sidebar.jsx`

- [ ] **Step 4.1: Create settings.css**

Create `src/components/settings/settings.css`:

```css
.rec-settings-shell {
  display: flex;
  min-height: 480px;
  max-height: calc(80vh - 120px);
}
.rec-settings-nav {
  width: 160px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-color);
  display: flex; flex-direction: column;
  padding: 8px;
  gap: 2px;
}
.rec-settings-nav-item {
  text-align: left;
  background: transparent;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}
.rec-settings-nav-item:hover { background: var(--bg-hover); }
.rec-settings-nav-item.active {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 500;
}
.rec-settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  color: var(--text-primary);
}
.rec-settings-section-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--text-primary);
}
.rec-settings-hint {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: 8px;
}
.rec-settings-banner {
  background: rgba(241, 178, 56, 0.12);
  border: 1px solid rgba(241, 178, 56, 0.4);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: var(--font-size-sm);
  color: #c98412;
  margin-bottom: 14px;
}
.rec-settings-row-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
  gap: 12px;
}
.rec-settings-row-item:last-child { border-bottom: none; }
.rec-settings-row-main { flex: 1; min-width: 0; }
.rec-settings-row-label { color: var(--text-primary); font-size: var(--font-size-sm); }
.rec-settings-row-sub { color: var(--text-secondary); font-size: var(--font-size-xs); margin-top: 2px; }

.rec-settings-input,
.rec-settings-select {
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-family: inherit;
}
.rec-settings-input:focus,
.rec-settings-select:focus {
  outline: none;
  border-color: var(--accent);
}
.rec-settings-input.invalid { border-color: #d9534f; }

.rec-settings-radio-group {
  display: flex; flex-direction: column; gap: 6px;
}
.rec-settings-radio {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.rec-settings-tag {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: var(--font-size-xs);
  margin-left: 6px;
}
.rec-settings-tag.default { background: var(--bg-hover); color: var(--text-secondary); }
.rec-settings-tag.custom { background: var(--accent-soft); color: var(--accent); }

.rec-settings-icon-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 4px 6px;
  cursor: pointer;
  color: var(--icon-default);
  display: inline-flex; align-items: center; justify-content: center;
}
.rec-settings-icon-btn:hover:not(:disabled) { background: var(--bg-hover); }
.rec-settings-icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.rec-settings-icon-btn + .rec-settings-icon-btn { margin-left: 4px; }
```

- [ ] **Step 4.2: Create SettingsModal**

Create `src/components/SettingsModal.jsx`:

```jsx
import { useState } from 'react'
import { Layers, Store, Database, Sliders } from 'lucide-react'
import Modal from './Modal.jsx'
import PlatformsPanel from './settings/PlatformsPanel.jsx'
import ShopsPanel from './settings/ShopsPanel.jsx'
import DataSourcePanel from './settings/DataSourcePanel.jsx'
import RulesPanel from './settings/RulesPanel.jsx'
import './settings/settings.css'

const TABS = [
  { id: 'platforms',  label: '平台',     icon: Layers   },
  { id: 'shops',      label: '店铺',     icon: Store    },
  { id: 'datasource', label: '数据源',   icon: Database },
  { id: 'rules',      label: '对账规则', icon: Sliders  }
]

export default function SettingsModal({
  open, onClose,
  settings, updateSettings, resetSettings
}) {
  const [activeTab, setActiveTab] = useState('platforms')
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <>
      <Modal
        open={open}
        title="设置"
        onClose={onClose}
        width={720}
        footer={
          <>
            <button
              className="rec-modal-btn"
              onClick={() => setConfirmReset(true)}
            >恢复默认</button>
            <button className="rec-modal-btn" onClick={onClose}>关闭</button>
          </>
        }
      >
        <div className="rec-settings-shell">
          <nav className="rec-settings-nav">
            {TABS.map(t => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  className={`rec-settings-nav-item ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <Icon size={14} style={{ verticalAlign: 'middle', marginRight: 6 }}/>
                  {t.label}
                </button>
              )
            })}
          </nav>
          <div className="rec-settings-content">
            {activeTab === 'platforms'  && <PlatformsPanel  settings={settings} updateSettings={updateSettings}/>}
            {activeTab === 'shops'      && <ShopsPanel      settings={settings} updateSettings={updateSettings}/>}
            {activeTab === 'datasource' && <DataSourcePanel settings={settings} updateSettings={updateSettings}/>}
            {activeTab === 'rules'      && <RulesPanel      settings={settings} updateSettings={updateSettings}/>}
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmReset}
        title="恢复默认设置"
        onClose={() => setConfirmReset(false)}
        width={360}
        footer={
          <>
            <button className="rec-modal-btn" onClick={() => setConfirmReset(false)}>取消</button>
            <button
              className="rec-modal-btn danger"
              onClick={() => {
                resetSettings()
                setConfirmReset(false)
              }}
            >确认恢复</button>
          </>
        }
      >
        所有设置（启用平台、自定义店铺、数据源、对账规则）将恢复为默认值。此操作不可撤销。
      </Modal>
    </>
  )
}
```

- [ ] **Step 4.3: Stub the 4 panel files (so SettingsModal imports work)**

Create `src/components/settings/PlatformsPanel.jsx`:
```jsx
export default function PlatformsPanel() {
  return <div>平台管理（待实现）</div>
}
```

Create `src/components/settings/ShopsPanel.jsx`:
```jsx
export default function ShopsPanel() {
  return <div>店铺管理（待实现）</div>
}
```

Create `src/components/settings/DataSourcePanel.jsx`:
```jsx
export default function DataSourcePanel() {
  return <div>数据源（待实现）</div>
}
```

Create `src/components/settings/RulesPanel.jsx`:
```jsx
export default function RulesPanel() {
  return <div>对账规则（待实现）</div>
}
```

- [ ] **Step 4.4: Wire SettingsModal into Sidebar**

Open `src/components/Sidebar.jsx`. At the top imports, add:

```jsx
import SettingsModal from './SettingsModal.jsx'
```

Update the `Sidebar` function signature to accept the new props:

Replace:
```jsx
export default function Sidebar({
  platformId, shopId, month, darkMode,
  onScopeChange, onToggleDark, onLogout
}) {
```

With:
```jsx
export default function Sidebar({
  platformId, shopId, month, darkMode,
  settings, updateSettings, resetSettings,
  onScopeChange, onToggleDark, onLogout
}) {
```

Find the existing settings `<Modal>` block (the placeholder one with "主题"/"关于"/"更多设置" rows) and **replace it entirely** with:

```jsx
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
        resetSettings={resetSettings}
      />
```

The "退出登录" 确认 Modal stays as-is.

- [ ] **Step 4.5: Verify build**

Run: `npm run build`
Expected: build success

- [ ] **Step 4.6: Manual smoke test**

Run: `npm run dev`. Login → 点侧边栏底部齿轮 → 应弹出 720px 宽设置弹窗，左侧 4 个 tab 可切换，右侧分别显示 4 个"待实现"占位文字。点关闭/ESC/遮罩可关闭。点"恢复默认"弹二次确认对话框。

- [ ] **Step 4.7: Commit**

```bash
git add src/components/SettingsModal.jsx \
        src/components/settings/settings.css \
        src/components/settings/PlatformsPanel.jsx \
        src/components/settings/ShopsPanel.jsx \
        src/components/settings/DataSourcePanel.jsx \
        src/components/settings/RulesPanel.jsx \
        src/components/Sidebar.jsx
git commit -m "feat(settings): Modal 壳 + 左 nav 4 tab + 占位面板 + 接入 Sidebar"
```

---

## Task 5: Sidebar 读 settings 过滤平台/店铺

**Files:**
- Modify: `src/components/Sidebar.jsx`

- [ ] **Step 5.1: 过滤 PLATFORMS + 合并店铺**

Open `src/components/Sidebar.jsx`. Find the navigation render block:

```jsx
        {PLATFORMS.map(p => {
          const open = expanded[p.id]
          const isDemo = p.status === 'demo'
          const shops = MOCK_SHOPS[p.id] || []
```

Replace with:

```jsx
        {PLATFORMS.filter(p => settings.enabledPlatforms.includes(p.id)).map(p => {
          const open = expanded[p.id]
          const isDemo = p.status === 'demo'
          const shops = [
            ...(MOCK_SHOPS[p.id] || []),
            ...(settings.customShops?.[p.id] || [])
          ]
```

- [ ] **Step 5.2: Verify build**

Run: `npm run build`
Expected: build success

- [ ] **Step 5.3: Manual smoke test**

`npm run dev` → 打开浏览器开发者工具 → console 执行：
```js
localStorage.setItem('ai-reconcile.settings', JSON.stringify({ enabledPlatforms: ['douyin'] }))
```
然后刷新。期望：侧边栏只显示"抖音"一个平台。再执行：
```js
localStorage.setItem('ai-reconcile.settings', JSON.stringify({
  enabledPlatforms: ['douyin', 'taobao'],
  customShops: { taobao: [{ id: 'tb-test', name: '测试淘宝店' }] }
}))
```
刷新。期望：侧边栏显示抖音 + 淘宝；展开淘宝看到默认 mock 店 + "测试淘宝店"两条。

最后清掉：`localStorage.removeItem('ai-reconcile.settings')`，回到全部启用。

- [ ] **Step 5.4: Commit**

```bash
git add src/components/Sidebar.jsx
git commit -m "feat(settings): Sidebar 按 settings 过滤平台 + 合并自定义店铺"
```

---

## Task 6: PlatformsPanel — 启用/禁用平台

**Files:**
- Modify: `src/components/settings/PlatformsPanel.jsx`

- [ ] **Step 6.1: Implement PlatformsPanel**

Replace the stub in `src/components/settings/PlatformsPanel.jsx` with:

```jsx
import { PLATFORMS } from '../../platforms/index.js'

export default function PlatformsPanel({ settings, updateSettings }) {
  const enabled = settings.enabledPlatforms

  function toggle(id) {
    const isEnabled = enabled.includes(id)
    // 不允许取消最后一个
    if (isEnabled && enabled.length === 1) return
    const next = isEnabled
      ? enabled.filter(x => x !== id)
      : [...enabled, id]
    updateSettings({ enabledPlatforms: next })
  }

  return (
    <div>
      <h3 className="rec-settings-section-title">平台管理</h3>
      <div className="rec-settings-hint" style={{ marginBottom: 12 }}>
        勾选要在侧边栏显示的平台。至少保留 1 个。
      </div>

      {PLATFORMS.map(p => {
        const isEnabled = enabled.includes(p.id)
        const isLast = isEnabled && enabled.length === 1
        return (
          <div key={p.id} className="rec-settings-row-item">
            <label className="rec-settings-row-main" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: isLast ? 'not-allowed' : 'pointer' }}>
              <input
                type="checkbox"
                checked={isEnabled}
                disabled={isLast}
                onChange={() => toggle(p.id)}
              />
              <span className="rec-settings-row-label">{p.name}</span>
              <span className={`rec-settings-tag ${p.status === 'ready' ? 'custom' : 'default'}`}>
                {p.status === 'ready' ? '真实' : '演示'}
              </span>
            </label>
            <span className="rec-settings-row-sub" style={{ marginTop: 0 }}>
              uploadSlots: {p.uploadSlots.length}
            </span>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 6.2: Verify build**

Run: `npm run build`
Expected: build success

- [ ] **Step 6.3: Manual smoke test**

`npm run dev` → 打开设置 → 平台 tab → 取消勾选"微信小店" → 关闭设置。侧边栏底部不再有微信小店。重新打开设置 → 勾选回来 → 微信小店重新出现。尝试取消所有平台到只剩 1 个，最后那个的复选框应该灰显（disabled）。

- [ ] **Step 6.4: Commit**

```bash
git add src/components/settings/PlatformsPanel.jsx
git commit -m "feat(settings): 平台管理面板（启用/禁用 + 至少保留 1 个）"
```

---

## Task 7: ShopsPanel + ShopEditDialog（CRUD + 删除确认）

**Files:**
- Create: `src/components/settings/ShopEditDialog.jsx`
- Modify: `src/components/settings/ShopsPanel.jsx`

- [ ] **Step 7.1: Create ShopEditDialog**

Create `src/components/settings/ShopEditDialog.jsx`:

```jsx
import { useState, useEffect } from 'react'
import Modal from '../Modal.jsx'
import { PLATFORMS } from '../../platforms/index.js'

export default function ShopEditDialog({
  open, mode, initial, enabledPlatformIds, onSave, onClose
}) {
  // mode: 'create' | 'edit'
  const [name, setName] = useState('')
  const [platformId, setPlatformId] = useState('')

  useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setPlatformId(initial?.platformId || enabledPlatformIds[0] || '')
    }
  }, [open, initial, enabledPlatformIds])

  const canSave = name.trim().length > 0 && !!platformId

  return (
    <Modal
      open={open}
      title={mode === 'create' ? '新增店铺' : '编辑店铺'}
      onClose={onClose}
      width={400}
      footer={
        <>
          <button className="rec-modal-btn" onClick={onClose}>取消</button>
          <button
            className="rec-modal-btn primary"
            disabled={!canSave}
            onClick={() => onSave({ name: name.trim(), platformId })}
          >保存</button>
        </>
      }
    >
      <div className="rec-settings-row-item">
        <div className="rec-settings-row-main">
          <div className="rec-settings-row-label">店铺名称</div>
          <input
            className="rec-settings-input"
            style={{ width: '100%', marginTop: 6 }}
            placeholder="例如：我的淘宝小店"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <div className="rec-settings-row-item" style={{ borderBottom: 'none' }}>
        <div className="rec-settings-row-main">
          <div className="rec-settings-row-label">所属平台</div>
          <select
            className="rec-settings-select"
            style={{ width: '100%', marginTop: 6 }}
            value={platformId}
            onChange={e => setPlatformId(e.target.value)}
            disabled={mode === 'edit'}
          >
            {PLATFORMS.filter(p => enabledPlatformIds.includes(p.id)).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {mode === 'edit' && (
            <div className="rec-settings-row-sub">编辑模式下不可改变所属平台</div>
          )}
        </div>
      </div>
    </Modal>
  )
}
```

- [ ] **Step 7.2: Implement ShopsPanel**

Replace the stub in `src/components/settings/ShopsPanel.jsx` with:

```jsx
import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { PLATFORMS, MOCK_SHOPS, platformsById } from '../../platforms/index.js'
import Modal from '../Modal.jsx'
import ShopEditDialog from './ShopEditDialog.jsx'

export default function ShopsPanel({ settings, updateSettings }) {
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null)        // { mode, initial?, platformId? } | null
  const [confirmDel, setConfirmDel] = useState(null)  // { platformId, shopId, name } | null

  const enabledIds = settings.enabledPlatforms

  // 拼出所有可见行
  const rows = []
  for (const p of PLATFORMS) {
    if (filter !== 'all' && filter !== p.id) continue
    for (const s of (MOCK_SHOPS[p.id] || [])) {
      rows.push({ ...s, platformId: p.id, platformName: p.name, isDefault: true })
    }
    for (const s of (settings.customShops?.[p.id] || [])) {
      rows.push({ ...s, platformId: p.id, platformName: p.name, isDefault: false })
    }
  }

  function addCustom({ name, platformId }) {
    const id = `${platformId}-custom-${Date.now()}`
    const list = settings.customShops?.[platformId] || []
    updateSettings(prev => ({
      ...prev,
      customShops: { ...prev.customShops, [platformId]: [...list, { id, name }] }
    }))
    setEditing(null)
  }

  function editCustom({ name, platformId }) {
    const list = settings.customShops?.[platformId] || []
    const next = list.map(s => s.id === editing.initial.id ? { ...s, name } : s)
    updateSettings(prev => ({
      ...prev,
      customShops: { ...prev.customShops, [platformId]: next }
    }))
    setEditing(null)
  }

  function deleteCustom(platformId, shopId) {
    const list = settings.customShops?.[platformId] || []
    const next = list.filter(s => s.id !== shopId)
    updateSettings(prev => ({
      ...prev,
      customShops: { ...prev.customShops, [platformId]: next }
    }))
    setConfirmDel(null)
  }

  return (
    <div>
      <h3 className="rec-settings-section-title">店铺管理</h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <span className="rec-settings-row-sub" style={{ marginTop: 0 }}>平台筛选</span>
        <select
          className="rec-settings-select"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">全部</option>
          {PLATFORMS.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <div style={{ flex: 1 }}/>
        <button
          className="rec-modal-btn primary"
          onClick={() => setEditing({ mode: 'create' })}
          disabled={enabledIds.length === 0}
        >
          <Plus size={12} style={{ verticalAlign: 'middle', marginRight: 4 }}/>新增店铺
        </button>
      </div>

      {rows.length === 0 && (
        <div className="rec-settings-row-sub">暂无店铺</div>
      )}

      {rows.map(row => (
        <div key={`${row.platformId}-${row.id}`} className="rec-settings-row-item">
          <div className="rec-settings-row-main">
            <div className="rec-settings-row-label">
              {row.name}
              <span className={`rec-settings-tag ${row.isDefault ? 'default' : 'custom'}`}>
                {row.isDefault ? '默认' : '自定义'}
              </span>
            </div>
            <div className="rec-settings-row-sub">{row.platformName}</div>
          </div>
          <div>
            <button
              className="rec-settings-icon-btn"
              disabled={row.isDefault}
              title={row.isDefault ? '默认演示数据不可修改' : '编辑'}
              onClick={() => setEditing({ mode: 'edit', initial: row })}
            ><Pencil size={12}/></button>
            <button
              className="rec-settings-icon-btn"
              disabled={row.isDefault}
              title={row.isDefault ? '默认演示数据不可删除' : '删除'}
              onClick={() => setConfirmDel(row)}
            ><Trash2 size={12}/></button>
          </div>
        </div>
      ))}

      <ShopEditDialog
        open={!!editing}
        mode={editing?.mode}
        initial={editing?.initial}
        enabledPlatformIds={enabledIds}
        onSave={data => editing?.mode === 'create' ? addCustom(data) : editCustom(data)}
        onClose={() => setEditing(null)}
      />

      <Modal
        open={!!confirmDel}
        title="删除店铺"
        onClose={() => setConfirmDel(null)}
        width={360}
        footer={
          <>
            <button className="rec-modal-btn" onClick={() => setConfirmDel(null)}>取消</button>
            <button
              className="rec-modal-btn danger"
              onClick={() => deleteCustom(confirmDel.platformId, confirmDel.id)}
            >确认删除</button>
          </>
        }
      >
        {confirmDel && (
          <>确定要删除 <strong>{confirmDel.name}</strong>（{platformsById[confirmDel.platformId]?.name}）吗？</>
        )}
      </Modal>
    </div>
  )
}
```

- [ ] **Step 7.3: Verify build**

Run: `npm run build`
Expected: build success

- [ ] **Step 7.4: Manual smoke test**

`npm run dev` → 设置 → 店铺 tab：
1. 看到 7 个默认店铺，标签 [默认]，编辑/删除按钮置灰
2. 点 "+ 新增店铺" → 弹小弹窗 → 输入"我的测试店"+ 选淘宝 → 保存
3. 列表立刻多一行"我的测试店"标签 [自定义]
4. 关掉设置 → 侧边栏淘宝下出现"我的测试店"
5. 重新打开设置 → 店铺 → 点编辑 → 改名"测试店2" → 保存 → 列表更新
6. 点删除 → 弹确认对话框 → 确认 → 这行消失，侧边栏也同步消失
7. 平台筛选下拉切到"淘宝"，列表只剩淘宝相关店铺

- [ ] **Step 7.5: Commit**

```bash
git add src/components/settings/ShopsPanel.jsx \
        src/components/settings/ShopEditDialog.jsx
git commit -m "feat(settings): 店铺管理（CRUD + 默认店铺只读 + 删除确认）"
```

---

## Task 8: DataSourcePanel — 主数据源 + 聚水潭/金蝶配置

**Files:**
- Modify: `src/components/settings/DataSourcePanel.jsx`

- [ ] **Step 8.1: Implement DataSourcePanel**

Replace the stub with:

```jsx
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const SOURCE_OPTIONS = [
  { id: 'jushuitan', label: '聚水潭' },
  { id: 'kingdee',   label: '金蝶' },
  { id: 'manual',    label: '手动 xlsx' }
]

export default function DataSourcePanel({ settings, updateSettings }) {
  const ds = settings.dataSource
  const [showToken, setShowToken] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)  // null | 'ok'

  function setPrimary(primary) {
    updateSettings(prev => ({
      ...prev,
      dataSource: { ...prev.dataSource, primary }
    }))
  }

  function setJushuitan(patch) {
    updateSettings(prev => ({
      ...prev,
      dataSource: {
        ...prev.dataSource,
        jushuitan: { ...prev.dataSource.jushuitan, ...patch }
      }
    }))
  }

  function setColumnMap(key, value) {
    updateSettings(prev => ({
      ...prev,
      dataSource: {
        ...prev.dataSource,
        jushuitan: {
          ...prev.dataSource.jushuitan,
          columnMap: { ...prev.dataSource.jushuitan.columnMap, [key]: value }
        }
      }
    }))
  }

  function testConnection() {
    setTesting(true)
    setTestResult(null)
    setTimeout(() => {
      setTesting(false)
      setTestResult('ok')
    }, 1000)
  }

  return (
    <div>
      <h3 className="rec-settings-section-title">数据源设置</h3>

      <div className="rec-settings-row-item">
        <div className="rec-settings-row-main">
          <div className="rec-settings-row-label">主数据源</div>
          <div className="rec-settings-radio-group" style={{ marginTop: 8, flexDirection: 'row', gap: 16 }}>
            {SOURCE_OPTIONS.map(o => (
              <label key={o.id} className="rec-settings-radio">
                <input
                  type="radio"
                  name="ds-primary"
                  checked={ds.primary === o.id}
                  onChange={() => setPrimary(o.id)}
                />
                {o.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {ds.primary === 'jushuitan' && (
        <>
          <h4 className="rec-settings-section-title" style={{ marginTop: 16, fontSize: 'var(--font-size-sm)' }}>
            聚水潭配置
          </h4>
          <div className="rec-settings-row-item">
            <div className="rec-settings-row-main">
              <div className="rec-settings-row-label">API 地址</div>
              <input
                className="rec-settings-input"
                style={{ width: '100%', marginTop: 6 }}
                placeholder="https://api.jushuitan.com/..."
                value={ds.jushuitan.apiUrl}
                onChange={e => setJushuitan({ apiUrl: e.target.value })}
              />
            </div>
          </div>
          <div className="rec-settings-row-item">
            <div className="rec-settings-row-main">
              <div className="rec-settings-row-label">Token</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <input
                  className="rec-settings-input"
                  type={showToken ? 'text' : 'password'}
                  style={{ flex: 1 }}
                  placeholder="••••••••"
                  value={ds.jushuitan.token}
                  onChange={e => setJushuitan({ token: e.target.value })}
                />
                <button
                  className="rec-settings-icon-btn"
                  type="button"
                  onClick={() => setShowToken(s => !s)}
                  title={showToken ? '隐藏' : '显示'}
                >
                  {showToken ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>
          </div>
          <div className="rec-settings-row-item">
            <div className="rec-settings-row-main">
              <div className="rec-settings-row-label">连接状态</div>
              <div className="rec-settings-row-sub">
                {testing && '测试中…'}
                {!testing && testResult === 'ok' && '✓ 连接成功（演示）'}
                {!testing && testResult === null && '未测试'}
              </div>
            </div>
            <button
              className="rec-modal-btn"
              disabled={testing}
              onClick={testConnection}
            >测试连接</button>
          </div>

          <h4 className="rec-settings-section-title" style={{ marginTop: 16, fontSize: 'var(--font-size-sm)' }}>
            列名映射
          </h4>
          {Object.entries(ds.jushuitan.columnMap).map(([key, value]) => (
            <div key={key} className="rec-settings-row-item">
              <div className="rec-settings-row-main">
                <div className="rec-settings-row-label">{key}</div>
              </div>
              <input
                className="rec-settings-input"
                style={{ width: 200 }}
                value={value}
                onChange={e => setColumnMap(key, e.target.value)}
              />
            </div>
          ))}
        </>
      )}

      {ds.primary === 'kingdee' && (
        <>
          <h4 className="rec-settings-section-title" style={{ marginTop: 16, fontSize: 'var(--font-size-sm)' }}>
            金蝶配置
            <span className="rec-settings-tag default" style={{ marginLeft: 8 }}>开发中</span>
          </h4>
          <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
            <div className="rec-settings-row-item">
              <div className="rec-settings-row-main">
                <div className="rec-settings-row-label">API 地址</div>
                <input className="rec-settings-input" style={{ width: '100%', marginTop: 6 }} placeholder="即将上线"/>
              </div>
            </div>
            <div className="rec-settings-row-item">
              <div className="rec-settings-row-main">
                <div className="rec-settings-row-label">Token</div>
                <input className="rec-settings-input" type="password" style={{ width: '100%', marginTop: 6 }} placeholder="即将上线"/>
              </div>
            </div>
          </div>
        </>
      )}

      {ds.primary === 'manual' && (
        <div className="rec-settings-hint" style={{ marginTop: 16 }}>
          手动模式下，每次对账需在主页面上传聚水潭/金蝶的导出 xlsx 文件。无需配置 API。
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 8.2: Verify build**

Run: `npm run build`
Expected: build success

- [ ] **Step 8.3: Manual smoke test**

`npm run dev` → 设置 → 数据源 tab：
1. 默认选中"聚水潭"，下方显示聚水潭配置区域
2. API 地址输入"https://test.com" → 关闭设置 → 重开 → 仍是"https://test.com"
3. Token 输入 → 默认 password 显示 → 点眼睛图标变明文 → 再点变密文
4. 点"测试连接" → 1 秒后显示"✓ 连接成功（演示）"
5. 列名映射 7 行，改其中一项 → 关闭刷新仍保留
6. 切到"金蝶" → 整块灰显，标"开发中"
7. 切到"手动 xlsx" → 显示提示文字

- [ ] **Step 8.4: Commit**

```bash
git add src/components/settings/DataSourcePanel.jsx
git commit -m "feat(settings): 数据源面板（聚水潭实可配 + 金蝶占位 + 手动模式）"
```

---

## Task 9: RulesPanel — 对账规则

**Files:**
- Modify: `src/components/settings/RulesPanel.jsx`

- [ ] **Step 9.1: Implement RulesPanel**

Replace the stub with:

```jsx
const STRATEGIES = [
  { id: 'orderId', label: '订单号优先（推荐）' },
  { id: 'skuTime', label: 'SKU + 时间窗' },
  { id: 'auto',    label: '自动选择' }
]

export default function RulesPanel({ settings, updateSettings }) {
  const r = settings.reconcileRules

  function set(patch) {
    updateSettings(prev => ({
      ...prev,
      reconcileRules: { ...prev.reconcileRules, ...patch }
    }))
  }

  // 三个阈值需满足 matched < minor < severe
  const matchedInvalid = r.matchedThreshold >= r.minorThreshold
  const minorInvalid   = r.minorThreshold >= r.severeThreshold

  return (
    <div>
      <h3 className="rec-settings-section-title">对账规则</h3>

      <div className="rec-settings-banner">
        ⚠️ 演示阶段，本面板规则暂不参与实际对账计算。
      </div>

      <h4 className="rec-settings-section-title" style={{ fontSize: 'var(--font-size-sm)' }}>
        利润差异分桶
      </h4>

      <div className="rec-settings-row-item">
        <div className="rec-settings-row-main">
          <div className="rec-settings-row-label">相符阈值</div>
          <div className="rec-settings-row-sub">绝对值 ≤ 此值 → 视为"相符"</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`rec-settings-input ${matchedInvalid ? 'invalid' : ''}`}
            style={{ width: 100 }}
            value={r.matchedThreshold}
            onChange={e => set({ matchedThreshold: parseFloat(e.target.value) || 0 })}
          />
          <span className="rec-settings-row-sub" style={{ marginTop: 0 }}>元</span>
        </div>
      </div>

      <div className="rec-settings-row-item">
        <div className="rec-settings-row-main">
          <div className="rec-settings-row-label">偏差阈值</div>
          <div className="rec-settings-row-sub">绝对值 ≤ 此值 → 视为"偏差"，超过则"严重"</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="number"
            step="0.5"
            min="0"
            className={`rec-settings-input ${minorInvalid ? 'invalid' : ''}`}
            style={{ width: 100 }}
            value={r.minorThreshold}
            onChange={e => set({ minorThreshold: parseFloat(e.target.value) || 0 })}
          />
          <span className="rec-settings-row-sub" style={{ marginTop: 0 }}>元</span>
        </div>
      </div>

      <div className="rec-settings-row-item">
        <div className="rec-settings-row-main">
          <div className="rec-settings-row-label">严重偏差阈值</div>
          <div className="rec-settings-row-sub">超过此值视为"严重"</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="number"
            step="1"
            min="0"
            className="rec-settings-input"
            style={{ width: 100 }}
            value={r.severeThreshold}
            onChange={e => set({ severeThreshold: parseFloat(e.target.value) || 0 })}
          />
          <span className="rec-settings-row-sub" style={{ marginTop: 0 }}>元</span>
        </div>
      </div>

      {(matchedInvalid || minorInvalid) && (
        <div className="rec-settings-hint" style={{ color: '#d9534f' }}>
          阈值需满足：相符 &lt; 偏差 &lt; 严重
        </div>
      )}

      <h4 className="rec-settings-section-title" style={{ marginTop: 16, fontSize: 'var(--font-size-sm)' }}>
        数据范围
      </h4>

      <div className="rec-settings-row-item">
        <label className="rec-settings-row-main" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            checked={r.includeRefunds}
            onChange={e => set({ includeRefunds: e.target.checked })}
          />
          <span className="rec-settings-row-label">包含退款单</span>
        </label>
      </div>

      <div className="rec-settings-row-item">
        <label className="rec-settings-row-main" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            checked={r.deductShipping}
            onChange={e => set({ deductShipping: e.target.checked })}
          />
          <span className="rec-settings-row-label">抵扣运费</span>
        </label>
      </div>

      <h4 className="rec-settings-section-title" style={{ marginTop: 16, fontSize: 'var(--font-size-sm)' }}>
        匹配策略
      </h4>

      <div className="rec-settings-radio-group" style={{ paddingLeft: 4 }}>
        {STRATEGIES.map(s => (
          <label key={s.id} className="rec-settings-radio">
            <input
              type="radio"
              name="match-strategy"
              checked={r.matchStrategy === s.id}
              onChange={() => set({ matchStrategy: s.id })}
            />
            {s.label}
          </label>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 9.2: Verify build**

Run: `npm run build`
Expected: build success

- [ ] **Step 9.3: Manual smoke test**

`npm run dev` → 设置 → 对账规则 tab：
1. 顶部黄色 banner "演示阶段不生效"
2. 三个阈值输入：默认 0.01 / 5 / 50
3. 把"相符阈值"改成 100 → 输入框红边 + 底部红字提示阈值大小关系不对
4. 改回 0.01 → 红色消失
5. 切换"包含退款单" / "抵扣运费" toggle
6. 切换匹配策略 radio
7. 关闭设置刷新页面 → 所有值保留

- [ ] **Step 9.4: Commit**

```bash
git add src/components/settings/RulesPanel.jsx
git commit -m "feat(settings): 对账规则面板（阈值 + 范围 + 匹配策略 + 演示 banner）"
```

---

## Task 10: 收尾 — 全量手动验收

**Files:** 无新增/修改，只验收 + 部署。

- [ ] **Step 10.1: 全量手动验收**

按设计稿 §8 逐条核对：
- [ ] 侧边栏底部"设置"按钮点击弹出新面板，左侧 4 个 tab 切换流畅
- [ ] 平台管理：勾掉某平台 → 立刻从侧边栏消失；勾回 → 恢复显示
- [ ] 平台管理：取消到只剩 1 个，最后那个 disabled
- [ ] 店铺管理：新增淘宝店铺 → 立刻出现在侧边栏淘宝下
- [ ] 店铺管理：编辑/删除立即生效；默认 mock 店铺无法编辑/删除
- [ ] 数据源/对账规则：调整后关闭弹窗、刷新页面、再次打开 → 值保留
- [ ] 全局"恢复默认"：二次确认后，设置回到默认（侧边栏所有平台/店铺恢复默认）
- [ ] 关闭面板：ESC / 点遮罩 / 点关闭按钮 都能关
- [ ] 边界：禁用当前选中的平台 → App.jsx effect 自动切到第一个启用平台
- [ ] 边界：删除当前选中的自定义店铺 → 自动切到该平台第一个店铺

- [ ] **Step 10.2: Run all tests**

Run: `npm test`
Expected: PASS（包括新加的 settingsDefaults.test.js + 已有所有测试）

- [ ] **Step 10.3: Final build + push**

```bash
npm run build
git push origin main
```

期待：约 1-2 分钟后 GitHub Actions 部署成功，
访问 https://cryangle0.github.io/AIAudit/ 设置面板按上述行为工作。

---

## 完成标准

- 全部 10 个 task 的 commit 都在 main 分支
- `npm test` 全绿
- `npm run build` 无 error
- 部署到 Pages 后，逐项手动验收通过
- 设置面板的所有改动重启浏览器后保留
