# AI对账 原型 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建一个纯前端、上传驱动的童装多平台对账原型，覆盖"抖音平台账单 ↔ 聚水潭"双表对账与利润核对，复用 opencut 视觉风格，多平台/AI 接口预留。

**Architecture:** React 19 + Vite 8 + SheetJS。`platforms/` adapter 层屏蔽各平台账单格式差异，`core/reconcile.js` 负责确定性匹配/分桶/利润计算（TDD），UI 分对账明细 / 款式利润榜两个 Tab。无后端，全部内存态。

**Tech Stack:** React 19、Vite 8、SheetJS (`xlsx`)、lucide-react、vitest（仅测 core/* 与 platforms/*）、原生 CSS

**Spec:** `docs/superpowers/specs/2026-05-01-ai-reconciliation-prototype-design.md`

**Project root:** `E:\angsa\beiji\AI对账` （Windows，bash shell）

---

## 文件清单

### 新建
- `package.json` `vite.config.js` `eslint.config.js` `index.html` `.gitignore`
- `src/main.jsx` `src/App.jsx` `src/App.css` `src/index.css`
- `src/components/`：`LoginPage.jsx/.css`、`Sidebar.jsx/.css`、`TopBar.jsx/.css`、`UploadZone.jsx/.css`、`ReconcileTab.jsx/.css`、`SkuProfitTab.jsx/.css`、`KpiCards.jsx/.css`、`DiffTable.jsx/.css`、`DiffDrawer.jsx/.css`、`MonthlyExpensePanel.jsx/.css`
- `src/platforms/`：`index.js`、`douyin.js`、`taobao.js`、`kuaishou.js`、`pinduoduo.js`、`xiaohongshu.js`、`shipinhao.js`、`weixin_xiaodian.js`
- `src/core/`：`constants.js`、`profit.js`、`jushuitan.js`、`reconcile.js`、`aiHint.js`
- `src/hooks/useReconcileStore.js`
- `src/utils/excel.js`、`src/utils/format.js`
- `tests/core/profit.test.js`、`tests/core/reconcile.test.js`、`tests/core/aiHint.test.js`、`tests/platforms/douyin.test.js`、`tests/core/jushuitan.test.js`
- `tests/fixtures/sample-rows.js`

### 已有（不动）
- `抖音店铺对账数据.xlsx`（保留作样例验收）
- `docs/superpowers/specs/2026-05-01-ai-reconciliation-prototype-design.md`

---

## Task 1：项目脚手架（Vite + React + 依赖）

**Files:**
- Create: `package.json`、`vite.config.js`、`eslint.config.js`、`index.html`、`.gitignore`

- [ ] **Step 1: 创建 `package.json`**

```json
{
  "name": "ai-reconcile",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "lucide-react": "^1.7.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "vite": "^8.0.4",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: 创建 `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js']
  }
})
```

- [ ] **Step 3: 创建 `index.html`**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI对账</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: 创建 `.gitignore`**

```
node_modules
dist
.vite
*.log
.DS_Store
```

- [ ] **Step 5: 创建 `eslint.config.js`（复制 opencut 同名文件）**

参考 `E:\angsa\dailaixi\opencut\eslint.config.js`，原样拷贝即可。

- [ ] **Step 6: 安装依赖**

Run: `npm install`
Expected: `node_modules/` 生成，无错误

- [ ] **Step 7: 初始化 git + 首次提交**

```bash
git init
git add .
git commit -m "chore: project scaffold (vite + react + sheetjs)"
```

> 项目原本不是 git 仓库；本计划要求频繁 commit，从这里开始全部用 git。如不使用 git，所有 commit 步骤可跳过。

---

## Task 2：全局样式 + 入口壳

**Files:**
- Create: `src/main.jsx`、`src/App.jsx`、`src/index.css`、`src/App.css`

- [ ] **Step 1: 创建 `src/index.css`**

复制 opencut 的 `src/index.css` 全文（已读取过，token 系统稳定）。但把这两处替换：
- `--sidebar-width: 76px;` → `--sidebar-width: 240px;`（设计稿是 240）
- 其余保留

- [ ] **Step 2: 创建 `src/App.css`**

```css
.app-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: transparent;
}
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}
```

- [ ] **Step 3: 创建 `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 4: 创建占位 `src/App.jsx`**

```jsx
import './App.css'

export default function App() {
  return (
    <div className="app-layout">
      <div className="main-area">
        <h1 style={{ padding: 24 }}>AI对账 — Hello</h1>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 启动 dev server 验证**

Run: `npm run dev`
Expected: `http://localhost:5173/` 显示 "AI对账 — Hello"，无控制台报错。Ctrl+C 停止。

- [ ] **Step 6: 提交**

```bash
git add .
git commit -m "feat: app shell + global styles from opencut"
```

---

## Task 3：核心常量与利润公式（TDD）

**Files:**
- Create: `src/core/constants.js`、`src/core/profit.js`
- Test: `tests/core/profit.test.js`

- [ ] **Step 1: 写失败的测试 `tests/core/profit.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { realProfit, profitDiff, isAmountEqual, isProfitAnomaly } from '../../src/core/profit.js'
import { PROFIT_ANOMALY_ABS, PROFIT_ANOMALY_PCT } from '../../src/core/constants.js'

describe('profit core', () => {
  it('realProfit = netSettled - shippedCost', () => {
    expect(realProfit({ netSettled: 170.05, shippedCost: 90 })).toBeCloseTo(80.05, 2)
  })

  it('profitDiff = realProfit - systemProfit', () => {
    expect(profitDiff({ netSettled: 170, shippedCost: 90, systemProfit: 89 })).toBeCloseTo(-9, 2)
  })

  it('isAmountEqual uses 0.01 epsilon', () => {
    expect(isAmountEqual(179, 179.001)).toBe(true)
    expect(isAmountEqual(179, 179.02)).toBe(false)
    expect(isAmountEqual(-179, -179)).toBe(true)
  })

  it('profit anomaly: above absolute threshold AND above percent threshold', () => {
    // diff=20, system=100 → 20% > 5%, 20 > 10 → anomaly
    expect(isProfitAnomaly(20, 100)).toBe(true)
    // diff=2, system=100 → below abs threshold
    expect(isProfitAnomaly(2, 100)).toBe(false)
    // diff=20, system=10000 → 0.2% < 5%, but 20 > 10 → still need both, false
    expect(isProfitAnomaly(20, 10000)).toBe(false)
  })

  it('constants are sane', () => {
    expect(PROFIT_ANOMALY_ABS).toBeGreaterThan(0)
    expect(PROFIT_ANOMALY_PCT).toBeGreaterThan(0)
    expect(PROFIT_ANOMALY_PCT).toBeLessThan(1)
  })
})
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npx vitest run tests/core/profit.test.js`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 `src/core/constants.js`**

```js
export const AMOUNT_EPSILON = 0.01
export const PROFIT_ANOMALY_ABS = 10        // ¥
export const PROFIT_ANOMALY_PCT = 0.05      // 5%
```

- [ ] **Step 4: 实现 `src/core/profit.js`**

```js
import { AMOUNT_EPSILON, PROFIT_ANOMALY_ABS, PROFIT_ANOMALY_PCT } from './constants.js'

export function realProfit({ netSettled, shippedCost }) {
  return (netSettled || 0) - (shippedCost || 0)
}

export function profitDiff({ netSettled, shippedCost, systemProfit }) {
  return realProfit({ netSettled, shippedCost }) - (systemProfit || 0)
}

export function isAmountEqual(a, b) {
  return Math.abs((a || 0) - (b || 0)) < AMOUNT_EPSILON
}

export function isProfitAnomaly(diff, systemProfit) {
  const abs = Math.abs(diff)
  const pct = systemProfit === 0 ? 0 : abs / Math.abs(systemProfit)
  return abs > PROFIT_ANOMALY_ABS && pct > PROFIT_ANOMALY_PCT
}
```

- [ ] **Step 5: 运行测试，确认通过**

Run: `npx vitest run tests/core/profit.test.js`
Expected: 5 passed

- [ ] **Step 6: 提交**

```bash
git add src/core tests/core/profit.test.js
git commit -m "feat(core): profit calc + amount epsilon + anomaly threshold"
```

---

## Task 4：测试 fixture（精简的真实数据）

**Files:**
- Create: `tests/fixtures/sample-rows.js`

- [ ] **Step 1: 创建 `tests/fixtures/sample-rows.js`**

提供后续 reconcile 测试用的最小数据集。覆盖 6 种情况：matched / duplicated / missing_in_jst / missing_in_platform / refund / profit_anomaly。

```js
// 模拟 SheetJS 读出的 row-array (列名为 key)，已 strip 单引号

export const douyinFundRows = [
  // 订单 A: 正常销售一笔流水
  { '订单号': '6001', '动账金额': 170.05, '销售收入': 179, '平台服务费': -8.95,
    '佣金': 0, '订单退款': 0, '站外推广费': 0, '动账场景': '货款结算入账', '动帐流水号': 'F1' },
  // 订单 B: 销售 + 退款两笔
  { '订单号': '6002', '动账金额': 170.05, '销售收入': 179, '平台服务费': -8.95,
    '佣金': 0, '订单退款': 0, '站外推广费': 0, '动账场景': '货款结算入账', '动帐流水号': 'F2' },
  { '订单号': '6002', '动账金额': -179, '销售收入': -179, '平台服务费': 0,
    '佣金': 0, '订单退款': 0, '站外推广费': 0, '动账场景': '退款-结算后退款-退用户', '动帐流水号': 'F3' },
  // 订单 C: duplicated 情形（聚水潭那侧多行）
  { '订单号': '6003', '动账金额': 170.05, '销售收入': 179, '平台服务费': -8.95,
    '佣金': 0, '订单退款': 0, '站外推广费': 0, '动账场景': '货款结算入账', '动帐流水号': 'F4' },
  // 订单 D: missing in jst (聚水潭没有这单)
  { '订单号': '6004', '动账金额': 95, '销售收入': 99, '平台服务费': -4,
    '佣金': 0, '订单退款': 0, '站外推广费': 0, '动账场景': '货款结算入账', '动帐流水号': 'F5' },
  // 月度公共扣费（订单号空）
  { '订单号': null, '动账金额': -22.86, '销售收入': 0, '平台服务费': 0,
    '佣金': 0, '订单退款': 0, '站外推广费': 0, '动账场景': '权益保险',
    '动帐流水号': 'F6', '备注': '保费扣除（6笔）' },
  { '订单号': null, '动账金额': -3.81, '销售收入': 0, '平台服务费': 0,
    '佣金': 0, '订单退款': 0, '站外推广费': 0, '动账场景': '权益保险',
    '动帐流水号': 'F7', '备注': '保费扣除（1笔）' }
]

export const douyinSummaryRows = [
  { '订单号': '6001', '求和项:销售收入': 179, '已核对收入': 179, '差异': 0 },
  { '订单号': '6002', '求和项:销售收入': 0, '已核对收入': 0, '差异': 0 },
  { '订单号': '6003', '求和项:销售收入': 179, '已核对收入': 179, '差异': 0 },
  { '订单号': '6004', '求和项:销售收入': 99, '已核对收入': 99, '差异': 0 }
]

export const jstRows = [
  // 订单 A 正常
  { '原始线上订单号': '6001', '款式编码': 'X001', '商品简称': 'A款',
    '实发金额': 179, '实发成本': 90, '销售毛利': 89, '当期实退金额': 0,
    '抖音资金账单金额': 179, '件数': 1, '金额': 179 },
  // 订单 B 退款（一行）
  { '原始线上订单号': '6002', '款式编码': 'X001', '商品简称': 'A款',
    '实发金额': 179, '实发成本': 90, '销售毛利': 89, '当期实退金额': 179,
    '抖音资金账单金额': 0, '件数': 0, '金额': 0 },
  // 订单 C duplicated: 同订单两行（销售+换货），「抖音资金账单金额」被重复累加
  { '原始线上订单号': '6003', '款式编码': 'X002', '商品简称': 'B款',
    '实发金额': 179, '实发成本': 90, '销售毛利': 89, '当期实退金额': 0,
    '抖音资金账单金额': 179, '件数': 1, '金额': 179 },
  { '原始线上订单号': '6003', '款式编码': 'X002', '商品简称': 'B款',
    '实发金额': 0, '实发成本': 0, '销售毛利': 0, '当期实退金额': 0,
    '抖音资金账单金额': 179, '件数': 0, '金额': 0 },
  // 订单 E: missing_in_platform (平台没有这单)
  { '原始线上订单号': '6005', '款式编码': 'X003', '商品简称': 'C款',
    '实发金额': 199, '实发成本': 100, '销售毛利': 99, '当期实退金额': 0,
    '抖音资金账单金额': 0, '件数': 1, '金额': 199 },
  // 订单 F: profit_anomaly（成本异常高，导致计算利润远低于系统毛利）
  { '原始线上订单号': '6006', '款式编码': 'X004', '商品简称': 'D款',
    '实发金额': 179, '实发成本': 200, '销售毛利': 89, '当期实退金额': 0,
    '抖音资金账单金额': 179, '件数': 1, '金额': 179 }
]

// 为 6006 也加平台流水
douyinFundRows.push({
  '订单号': '6006', '动账金额': 170.05, '销售收入': 179, '平台服务费': -8.95,
  '佣金': 0, '订单退款': 0, '站外推广费': 0,
  '动账场景': '货款结算入账', '动帐流水号': 'F8'
})
```

- [ ] **Step 2: 提交**

```bash
git add tests/fixtures
git commit -m "test: shared fixture rows for adapters & engine"
```

---

## Task 5：抖音 adapter（TDD）

**Files:**
- Create: `src/platforms/douyin.js`
- Test: `tests/platforms/douyin.test.js`

- [ ] **Step 1: 写失败的测试**

```js
// tests/platforms/douyin.test.js
import { describe, it, expect } from 'vitest'
import { douyin } from '../../src/platforms/douyin.js'
import { douyinFundRows, douyinSummaryRows } from '../fixtures/sample-rows.js'

describe('douyin adapter', () => {
  const result = douyin.transform({ fundRows: douyinFundRows, summaryRows: douyinSummaryRows })

  it('returns standard shape', () => {
    expect(result).toHaveProperty('orders')
    expect(result).toHaveProperty('fundFlow')
    expect(result).toHaveProperty('monthlyExpense')
  })

  it('aggregates orders by orderId, sums numeric fields', () => {
    const order6002 = result.orders.find(o => o.orderId === '6002')
    expect(order6002.saleRevenue).toBeCloseTo(0, 2)        // 179 + (-179)
    expect(order6002.netSettled).toBeCloseTo(170.05 - 179, 2)
    expect(order6002.flows).toHaveLength(2)
  })

  it('strips leading apostrophe from order id', () => {
    const tricky = douyin.transform({
      fundRows: [{ '订单号': "'9999", '动账金额': 1, '销售收入': 1,
        '平台服务费': 0, '佣金': 0, '订单退款': 0, '站外推广费': 0,
        '动账场景': '货款结算入账', '动帐流水号': 'X' }],
      summaryRows: []
    })
    expect(tricky.orders[0].orderId).toBe('9999')
  })

  it('separates monthlyExpense rows (orderId == null) by 动账场景', () => {
    const insur = result.monthlyExpense.find(e => e.scene === '权益保险')
    expect(insur.count).toBe(2)
    expect(insur.totalAmount).toBeCloseTo(-22.86 + -3.81, 2)
    expect(insur.samples).toHaveLength(2)
  })

  it('does not put non-order rows into orders', () => {
    expect(result.orders.find(o => o.orderId === null)).toBeUndefined()
  })

  it('exposes platform metadata', () => {
    expect(douyin.id).toBe('douyin')
    expect(douyin.name).toBe('抖音')
    expect(douyin.status).toBe('ready')
    expect(Array.isArray(douyin.uploadSlots)).toBe(true)
    expect(douyin.uploadSlots.length).toBeGreaterThanOrEqual(2)
  })
})
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npx vitest run tests/platforms/douyin.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 `src/platforms/douyin.js`**

```js
function stripQuote(s) {
  if (s == null) return null
  const str = String(s).trim()
  return str.startsWith("'") ? str.slice(1) : str
}

function num(v) {
  if (v == null || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function transform({ fundRows = [], summaryRows = [] }) {
  const orderMap = new Map()
  const monthlyMap = new Map()
  const fundFlow = []

  for (const r of fundRows) {
    const oid = stripQuote(r['订单号'])
    const flow = {
      orderId: oid,
      time: r['动账时间'] ?? null,
      flowId: stripQuote(r['动帐流水号']),
      direction: r['动账方向'] ?? null,
      amount: num(r['动账金额']),
      account: r['动账账户'] ?? null,
      scene: r['动账场景'] ?? null,
      billing: r['计费类型'] ?? null,
      saleRevenue: num(r['销售收入']),
      platformFee: num(r['平台服务费']),
      commission: num(r['佣金']),
      refundAmount: num(r['订单退款']),
      promoFee: num(r['站外推广费']),
      memo: r['备注'] ?? null
    }
    fundFlow.push(flow)

    if (oid == null || oid === '') {
      const key = flow.scene || '其他'
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { scene: key, count: 0, totalAmount: 0, samples: [] })
      }
      const m = monthlyMap.get(key)
      m.count += 1
      m.totalAmount += flow.direction === '出账' ? -flow.amount : flow.amount
      if (m.samples.length < 5) {
        m.samples.push({ time: flow.time, amount: flow.amount, memo: flow.memo })
      }
      continue
    }

    if (!orderMap.has(oid)) {
      orderMap.set(oid, {
        orderId: oid,
        saleRevenue: 0, netSettled: 0, platformFee: 0,
        commission: 0, refundAmount: 0, promoFee: 0, flows: []
      })
    }
    const o = orderMap.get(oid)
    o.saleRevenue += flow.saleRevenue
    o.netSettled += (flow.direction === '出账' ? -flow.amount : flow.amount)
    o.platformFee += flow.platformFee
    o.commission += flow.commission
    o.refundAmount += flow.refundAmount
    o.promoFee += flow.promoFee
    o.flows.push(flow)
  }

  // summaryRows 暂时不参与聚合（资金账单已够用）；保留接口以后用
  const summaryById = {}
  for (const r of summaryRows) {
    summaryById[stripQuote(r['订单号'])] = num(r['求和项:销售收入'])
  }

  return {
    orders: Array.from(orderMap.values()),
    fundFlow,
    monthlyExpense: Array.from(monthlyMap.values()),
    summaryById
  }
}

export const douyin = {
  id: 'douyin',
  name: '抖音',
  status: 'ready',
  uploadSlots: [
    { key: 'fund', label: '抖音资金账单', required: true,
      sheetName: '抖音资金账单', requiredColumns: ['订单号', '动账金额', '销售收入', '动账场景'] },
    { key: 'summary', label: '抖音账单汇总（可选）', required: false,
      sheetName: '抖音账单汇总', requiredColumns: ['订单号', '求和项:销售收入'] }
  ],
  transform
}
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `npx vitest run tests/platforms/douyin.test.js`
Expected: 6 passed

- [ ] **Step 5: 提交**

```bash
git add src/platforms/douyin.js tests/platforms/douyin.test.js
git commit -m "feat(platforms): douyin adapter with monthly expense extraction"
```

---

## Task 6：聚水潭 parser（TDD）

**Files:**
- Create: `src/core/jushuitan.js`
- Test: `tests/core/jushuitan.test.js`

- [ ] **Step 1: 写失败的测试**

```js
// tests/core/jushuitan.test.js
import { describe, it, expect } from 'vitest'
import { parseJushuitan } from '../../src/core/jushuitan.js'
import { jstRows } from '../fixtures/sample-rows.js'

describe('jushuitan parser', () => {
  const orders = parseJushuitan(jstRows)

  it('aggregates by orderId', () => {
    const o = orders.find(x => x.orderId === '6003')
    expect(o.rowCount).toBe(2)
    expect(o.jstBillAmountSum).toBeCloseTo(358, 2)
    expect(o.shippedAmount).toBeCloseTo(179, 2)
  })

  it('captures cost / profit / refund', () => {
    const o = orders.find(x => x.orderId === '6001')
    expect(o.shippedCost).toBeCloseTo(90, 2)
    expect(o.grossProfit).toBeCloseTo(89, 2)
    expect(o.refundedAmount).toBeCloseTo(0, 2)
  })

  it('preserves styleCode and productName from first row', () => {
    const o = orders.find(x => x.orderId === '6005')
    expect(o.styleCode).toBe('X003')
    expect(o.productName).toBe('C款')
  })

  it('strips apostrophe from order id', () => {
    const out = parseJushuitan([{ '原始线上订单号': "'12345", '款式编码': 'Y',
      '商品简称': 'Z', '实发金额': 1, '实发成本': 0, '销售毛利': 1,
      '当期实退金额': 0, '抖音资金账单金额': 1, '件数': 1, '金额': 1 }])
    expect(out[0].orderId).toBe('12345')
  })
})
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npx vitest run tests/core/jushuitan.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 `src/core/jushuitan.js`**

```js
function stripQuote(s) {
  if (s == null) return null
  const str = String(s).trim()
  return str.startsWith("'") ? str.slice(1) : str
}

function num(v) {
  if (v == null || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function parseJushuitan(rows = []) {
  const map = new Map()
  for (const r of rows) {
    const oid = stripQuote(r['原始线上订单号'])
    if (oid == null || oid === '') continue
    if (!map.has(oid)) {
      map.set(oid, {
        orderId: oid,
        styleCode: r['款式编码'] ?? null,
        productName: r['商品简称'] ?? null,
        shippedAmount: 0, shippedCost: 0, grossProfit: 0,
        refundedAmount: 0, jstBillAmountSum: 0,
        qty: 0, amount: 0,
        rowCount: 0, rows: []
      })
    }
    const o = map.get(oid)
    o.shippedAmount += num(r['实发金额'])
    o.shippedCost += num(r['实发成本'])
    o.grossProfit += num(r['销售毛利'])
    o.refundedAmount += num(r['当期实退金额'])
    o.jstBillAmountSum += num(r['抖音资金账单金额'])
    o.qty += num(r['件数'])
    o.amount += num(r['金额'])
    o.rowCount += 1
    o.rows.push(r)
  }
  return Array.from(map.values())
}
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `npx vitest run tests/core/jushuitan.test.js`
Expected: 4 passed

- [ ] **Step 5: 提交**

```bash
git add src/core/jushuitan.js tests/core/jushuitan.test.js
git commit -m "feat(core): jushuitan order aggregator"
```

---

## Task 7：对账引擎 reconcile（TDD，核心）

**Files:**
- Create: `src/core/reconcile.js`
- Test: `tests/core/reconcile.test.js`

- [ ] **Step 1: 写失败的测试**

```js
// tests/core/reconcile.test.js
import { describe, it, expect } from 'vitest'
import { runReconcile } from '../../src/core/reconcile.js'
import { douyin } from '../../src/platforms/douyin.js'
import { parseJushuitan } from '../../src/core/jushuitan.js'
import { douyinFundRows, douyinSummaryRows, jstRows } from '../fixtures/sample-rows.js'

describe('reconcile engine', () => {
  const platform = douyin.transform({ fundRows: douyinFundRows, summaryRows: douyinSummaryRows })
  const jst = parseJushuitan(jstRows)
  const out = runReconcile(platform, jst)

  it('produces a row for every union of order ids', () => {
    const ids = new Set(out.diffRows.map(r => r.orderId))
    expect(ids.has('6001')).toBe(true)
    expect(ids.has('6002')).toBe(true)
    expect(ids.has('6003')).toBe(true)
    expect(ids.has('6004')).toBe(true)
    expect(ids.has('6005')).toBe(true)
    expect(ids.has('6006')).toBe(true)
  })

  it('6001 is matched', () => {
    const r = out.diffRows.find(x => x.orderId === '6001')
    expect(r.bucket).toBe('matched')
  })

  it('6003 is duplicated (jst sums to 2x platform)', () => {
    const r = out.diffRows.find(x => x.orderId === '6003')
    expect(r.bucket).toBe('duplicated')
  })

  it('6004 is missing_in_jst', () => {
    expect(out.diffRows.find(x => x.orderId === '6004').bucket).toBe('missing_in_jst')
  })

  it('6005 is missing_in_platform', () => {
    expect(out.diffRows.find(x => x.orderId === '6005').bucket).toBe('missing_in_platform')
  })

  it('6006 is profit_anomaly (cost too high)', () => {
    expect(out.diffRows.find(x => x.orderId === '6006').bucket).toBe('profit_anomaly')
  })

  it('kpi totals match', () => {
    expect(out.kpi.totalOrders).toBe(out.diffRows.length)
    expect(out.kpi.diffCount).toBeGreaterThan(0)
    expect(out.kpi.duplicatedCount).toBeGreaterThanOrEqual(1)
    expect(out.kpi.missingCount).toBeGreaterThanOrEqual(2)
    expect(out.kpi.anomalyCount).toBeGreaterThanOrEqual(1)
  })

  it('skuStats aggregates by styleCode', () => {
    const x001 = out.skuStats.find(s => s.styleCode === 'X001')
    expect(x001).toBeDefined()
    expect(x001.qty).toBeGreaterThan(0)
  })

  it('passes monthlyExpense through unchanged', () => {
    expect(out.monthlyExpense).toBe(platform.monthlyExpense)
  })
})
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npx vitest run tests/core/reconcile.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 `src/core/reconcile.js`**

```js
import { isAmountEqual, profitDiff, isProfitAnomaly } from './profit.js'

function classify(p, j) {
  // p: PlatformOrder | undefined ; j: JstOrder | undefined
  if (p && !j) return 'missing_in_jst'
  if (!p && j) return 'missing_in_platform'

  // duplicated: jst rowCount >= 2 AND jstBillAmountSum approximately = platform.saleRevenue * N
  if (j.rowCount >= 2 && Math.abs(p.saleRevenue) > 0.01) {
    const ratio = j.jstBillAmountSum / p.saleRevenue
    if (ratio >= 1.5 && Math.abs(ratio - Math.round(ratio)) < 0.05) {
      return 'duplicated'
    }
  }

  // matched: revenue and net settled both align
  if (isAmountEqual(p.saleRevenue, j.shippedAmount - j.refundedAmount) &&
      isAmountEqual(p.saleRevenue, j.jstBillAmountSum)) {
    return 'matched'
  }
  // matched relaxed: revenue == 0 (sale + refund offset) and jstBillAmountSum == 0
  if (isAmountEqual(p.saleRevenue, 0) && isAmountEqual(j.jstBillAmountSum, 0)) {
    return 'matched'
  }

  // fall through: treat as profit_anomaly candidate (will recheck below)
  return 'matched'
}

function buildDiffRow(orderId, p, j) {
  let bucket = classify(p, j)

  const saleRevenue = p?.saleRevenue ?? 0
  const netSettled = p?.netSettled ?? 0
  const shippedCost = j?.shippedCost ?? 0
  const systemProfit = j?.grossProfit ?? 0

  // duplicated: 用按 rowCount 归一化后的金额参与利润计算
  let normShippedCost = shippedCost
  if (bucket === 'duplicated' && j.rowCount > 1) {
    normShippedCost = shippedCost  // 成本本身就是按行计算 — 已经是正确的；金额翻倍是抖音资金账单金额列被重复
  }

  const realProfit = netSettled - normShippedCost
  const diff = realProfit - systemProfit

  // upgrade matched → profit_anomaly if applicable
  if ((bucket === 'matched' || bucket === 'duplicated') &&
      p && j && isProfitAnomaly(diff, systemProfit)) {
    bucket = 'profit_anomaly'
  }

  return {
    orderId,
    styleCode: j?.styleCode ?? null,
    productName: j?.productName ?? null,
    saleRevenue,
    netSettled,
    shippedCost: normShippedCost,
    realProfit,
    systemProfit,
    profitDiff: diff,
    bucket,
    aiHint: null,        // 后续 Task 8 填充
    platformFlows: p?.flows ?? [],
    jstRows: j?.rows ?? []
  }
}

function buildSkuStats(jstOrders) {
  const m = new Map()
  for (const o of jstOrders) {
    const key = o.styleCode || '(空白)'
    if (!m.has(key)) {
      m.set(key, { styleCode: key, productName: o.productName,
        qty: 0, revenue: 0, cost: 0, profit: 0, profitRate: 0 })
    }
    const s = m.get(key)
    s.qty += o.qty
    s.revenue += o.amount
    s.cost += (o.shippedCost - 0)  // 已是行级累加
    s.profit += o.grossProfit
  }
  for (const s of m.values()) {
    s.profitRate = s.revenue === 0 ? 0 : s.profit / s.revenue
  }
  return Array.from(m.values()).sort((a, b) => b.profit - a.profit)
}

export function runReconcile(platformResult, jstOrders) {
  const platMap = new Map(platformResult.orders.map(o => [o.orderId, o]))
  const jstMap = new Map(jstOrders.map(o => [o.orderId, o]))

  const allIds = new Set([...platMap.keys(), ...jstMap.keys()])
  const diffRows = []
  for (const id of allIds) {
    diffRows.push(buildDiffRow(id, platMap.get(id), jstMap.get(id)))
  }

  const kpi = {
    totalOrders: diffRows.length,
    revenue: diffRows.reduce((s, r) => s + r.saleRevenue, 0),
    cost: diffRows.reduce((s, r) => s + r.shippedCost, 0),
    realProfit: diffRows.reduce((s, r) => s + r.realProfit, 0),
    systemProfit: diffRows.reduce((s, r) => s + r.systemProfit, 0),
    diffCount: diffRows.filter(r => r.bucket !== 'matched').length,
    duplicatedCount: diffRows.filter(r => r.bucket === 'duplicated').length,
    missingCount: diffRows.filter(r => r.bucket.startsWith('missing')).length,
    anomalyCount: diffRows.filter(r => r.bucket === 'profit_anomaly').length
  }

  const skuStats = buildSkuStats(jstOrders)

  return {
    kpi,
    diffRows,
    skuStats,
    monthlyExpense: platformResult.monthlyExpense
  }
}
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `npx vitest run tests/core/reconcile.test.js`
Expected: 9 passed

- [ ] **Step 5: 跑全部测试看回归**

Run: `npm test`
Expected: 全部通过（profit + jushuitan + douyin + reconcile）

- [ ] **Step 6: 提交**

```bash
git add src/core/reconcile.js tests/core/reconcile.test.js
git commit -m "feat(core): reconcile engine with bucket classification"
```

---

## Task 8：AI hint 规则映射（TDD）

**Files:**
- Create: `src/core/aiHint.js`
- Test: `tests/core/aiHint.test.js`
- Modify: `src/core/reconcile.js`（在 buildDiffRow 末尾调用 attachHint）

- [ ] **Step 1: 写失败的测试**

```js
// tests/core/aiHint.test.js
import { describe, it, expect } from 'vitest'
import { generateHint } from '../../src/core/aiHint.js'

describe('aiHint', () => {
  it('returns null for matched', () => {
    expect(generateHint({ bucket: 'matched' })).toBeNull()
  })
  it('explains duplicated with multiplier', () => {
    const hint = generateHint({ bucket: 'duplicated', saleRevenue: 179,
      jstBillAmountSum: 358 })
    expect(hint).toMatch(/聚水潭|多行|售后/)
    expect(hint).toMatch(/2/)  // 倍数
  })
  it('explains missing_in_jst', () => {
    expect(generateHint({ bucket: 'missing_in_jst' })).toMatch(/平台.*聚水潭/)
  })
  it('explains missing_in_platform', () => {
    expect(generateHint({ bucket: 'missing_in_platform' })).toMatch(/聚水潭.*平台|跨月|在途/)
  })
  it('explains profit_anomaly with diff amount', () => {
    const hint = generateHint({ bucket: 'profit_anomaly', profitDiff: -25.5 })
    expect(hint).toMatch(/毛利|成本|退款/)
    expect(hint).toMatch(/25/)
  })
})
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `npx vitest run tests/core/aiHint.test.js`
Expected: FAIL

- [ ] **Step 3: 实现 `src/core/aiHint.js`**

```js
function fmtAmount(n) {
  return Math.abs(n).toFixed(2)
}

export function generateHint(row) {
  switch (row.bucket) {
    case 'matched':
      return null
    case 'duplicated': {
      const mult = row.saleRevenue ? Math.round(row.jstBillAmountSum / row.saleRevenue) : 0
      return `聚水潭同订单多行（售后/换货）金额累计为平台的 ${mult} 倍，需人工确认是否为重复登记`
    }
    case 'missing_in_jst':
      return '平台有此单，聚水潭未导出，可能未发货或导出条件遗漏'
    case 'missing_in_platform':
      return '聚水潭有此单，平台账单未结算，可能跨月或在途'
    case 'profit_anomaly':
      return `毛利偏离系统记录 ¥${fmtAmount(row.profitDiff)}，请核对成本价或退款金额`
    default:
      return null
  }
}
```

- [ ] **Step 4: 修改 `src/core/reconcile.js`，在 buildDiffRow 中接入 hint**

在文件顶部新增 import：

```js
import { generateHint } from './aiHint.js'
```

把 `buildDiffRow` 末尾 `aiHint: null` 改为：

```js
const row = {
  orderId,
  styleCode: j?.styleCode ?? null,
  productName: j?.productName ?? null,
  saleRevenue,
  netSettled,
  shippedCost: normShippedCost,
  realProfit,
  systemProfit,
  profitDiff: diff,
  bucket,
  jstBillAmountSum: j?.jstBillAmountSum ?? 0,  // hint 用得到
  platformFlows: p?.flows ?? [],
  jstRows: j?.rows ?? []
}
row.aiHint = generateHint(row)
return row
```

- [ ] **Step 5: 运行所有测试，确认通过**

Run: `npm test`
Expected: 全部通过

- [ ] **Step 6: 提交**

```bash
git add src/core/aiHint.js tests/core/aiHint.test.js src/core/reconcile.js
git commit -m "feat(core): rule-based ai hint for diff buckets"
```

---

## Task 9：平台 registry + 占位平台

**Files:**
- Create: `src/platforms/index.js`、`src/platforms/taobao.js`、`src/platforms/kuaishou.js`、`src/platforms/pinduoduo.js`、`src/platforms/xiaohongshu.js`、`src/platforms/shipinhao.js`、`src/platforms/weixin_xiaodian.js`

- [ ] **Step 1: 创建占位平台（同模板，仅名字不同）**

`src/platforms/taobao.js`：

```js
export const taobao = {
  id: 'taobao',
  name: '淘宝/天猫',
  status: 'planned',
  uploadSlots: [],
  transform() { throw new Error('taobao adapter not implemented') }
}
```

按同样模板创建其余 5 个平台：

| 文件 | id | name |
|---|---|---|
| `kuaishou.js` | `kuaishou` | `快手` |
| `pinduoduo.js` | `pinduoduo` | `拼多多` |
| `xiaohongshu.js` | `xiaohongshu` | `小红书` |
| `shipinhao.js` | `shipinhao` | `视频号` |
| `weixin_xiaodian.js` | `weixin_xiaodian` | `微信小店` |

- [ ] **Step 2: 创建 `src/platforms/index.js`**

```js
import { douyin } from './douyin.js'
import { taobao } from './taobao.js'
import { kuaishou } from './kuaishou.js'
import { pinduoduo } from './pinduoduo.js'
import { xiaohongshu } from './xiaohongshu.js'
import { shipinhao } from './shipinhao.js'
import { weixin_xiaodian } from './weixin_xiaodian.js'

export const PLATFORMS = [
  douyin, taobao, kuaishou, pinduoduo, xiaohongshu, shipinhao, weixin_xiaodian
]

export const platformsById = Object.fromEntries(PLATFORMS.map(p => [p.id, p]))

// Mock 店铺：每个平台 1 个示例店铺；抖音填真实店名
export const MOCK_SHOPS = {
  douyin: [{ id: 'xzf-dehuang', name: '雪中飞德煌童装专卖店' }],
  taobao: [{ id: 'tb-mock', name: '某童装旗舰店' }],
  kuaishou: [{ id: 'ks-mock', name: '某童装快手店' }],
  pinduoduo: [{ id: 'pdd-mock', name: '某童装拼多多店' }],
  xiaohongshu: [{ id: 'xhs-mock', name: '某童装小红书店' }],
  shipinhao: [{ id: 'sph-mock', name: '某童装视频号店' }],
  weixin_xiaodian: [{ id: 'wxd-mock', name: '某童装微信小店' }]
}
```

- [ ] **Step 3: 提交**

```bash
git add src/platforms
git commit -m "feat(platforms): registry + 6 placeholder adapters"
```

---

## Task 10：工具函数 + Excel 读取

**Files:**
- Create: `src/utils/excel.js`、`src/utils/format.js`

- [ ] **Step 1: 创建 `src/utils/excel.js`**

```js
import * as XLSX from 'xlsx'

// 读取 File 对象，返回 { [sheetName]: rowsArrayOfObjects }
export async function readWorkbook(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array', cellDates: true })
  const out = {}
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName]
    out[sheetName] = XLSX.utils.sheet_to_json(ws, { defval: null, raw: true })
  }
  return out
}

// 校验某 sheet 必备列
export function validateColumns(rows, requiredColumns) {
  if (!rows || rows.length === 0) return ['工作表为空']
  const firstRow = rows[0]
  return requiredColumns.filter(c => !(c in firstRow))
}
```

- [ ] **Step 2: 创建 `src/utils/format.js`**

```js
const FMT = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 2 })
export function fmtMoney(n) {
  if (n == null || isNaN(n)) return '—'
  return FMT.format(n)
}
export function fmtNumber(n) {
  if (n == null || isNaN(n)) return '—'
  return new Intl.NumberFormat('zh-CN').format(n)
}
export function fmtPct(n) {
  if (n == null || isNaN(n)) return '—'
  return (n * 100).toFixed(1) + '%'
}
```

- [ ] **Step 3: 提交**

```bash
git add src/utils
git commit -m "feat(utils): excel reader + currency/number formatters"
```

---

## Task 11：状态管理 hook

**Files:**
- Create: `src/hooks/useReconcileStore.js`

- [ ] **Step 1: 创建 `src/hooks/useReconcileStore.js`**

```js
import { useReducer, useCallback } from 'react'

const initial = {
  authed: (() => { try { return JSON.parse(localStorage.getItem('ai-reconcile.authed')) === true } catch { return false } })(),
  darkMode: false,
  platformId: 'douyin',
  shopId: 'xzf-dehuang',
  month: '2026-01',
  activeTab: 'reconcile',     // 'reconcile' | 'sku'
  uploads: {},                 // { [slotKey]: { fileName, rows, meta } }
  reconciling: false,
  result: null,                // { kpi, diffRows, skuStats, monthlyExpense } | null
  error: null,
  parseWarnings: []
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':    return { ...state, authed: true }
    case 'LOGOUT':   return { ...initial, authed: false }
    case 'TOGGLE_DARK': return { ...state, darkMode: !state.darkMode }
    case 'SELECT_SCOPE': return {
      ...state,
      platformId: action.platformId, shopId: action.shopId, month: action.month,
      uploads: {}, result: null, error: null
    }
    case 'SET_TAB':  return { ...state, activeTab: action.tab }
    case 'SET_UPLOAD': return { ...state, uploads: { ...state.uploads, [action.key]: action.payload } }
    case 'CLEAR_UPLOAD': {
      const next = { ...state.uploads }; delete next[action.key]
      return { ...state, uploads: next, result: null }
    }
    case 'RECONCILE_START': return { ...state, reconciling: true, error: null }
    case 'RECONCILE_DONE':  return { ...state, reconciling: false, result: action.result, parseWarnings: action.warnings || [] }
    case 'RECONCILE_FAIL':  return { ...state, reconciling: false, error: action.error }
    default: return state
  }
}

export function useReconcileStore() {
  const [state, dispatch] = useReducer(reducer, initial)

  const login = useCallback(() => {
    localStorage.setItem('ai-reconcile.authed', 'true'); dispatch({ type: 'LOGIN' })
  }, [])
  const logout = useCallback(() => {
    localStorage.setItem('ai-reconcile.authed', 'false'); dispatch({ type: 'LOGOUT' })
  }, [])

  return { state, dispatch, login, logout }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks
git commit -m "feat(state): useReconcileStore reducer"
```

---

## Task 12：LoginPage（复用 opencut）

**Files:**
- Create: `src/components/LoginPage.jsx`、`src/components/LoginPage.css`

- [ ] **Step 1: 复制 opencut 的 LoginPage**

直接复制 `E:\angsa\dailaixi\opencut\src\components\LoginPage.jsx` 与 `LoginPage.css` 到本项目对应位置。

- [ ] **Step 2: 把 LoginPage 顶部 logo/title 文字改成"AI对账"**

打开 `src/components/LoginPage.jsx`，搜索 opencut 的标题/产品名（多见于 `<h1>`、`<h2>` 或 `品牌名` 字符串），改为 `AI对账`。具体行号取决于复制后的内容。

- [ ] **Step 3: 提交**

```bash
git add src/components/LoginPage.*
git commit -m "feat(ui): login page reused from opencut"
```

---

## Task 13：Sidebar（平台树 + 月份）

**Files:**
- Create: `src/components/Sidebar.jsx`、`src/components/Sidebar.css`

- [ ] **Step 1: 创建 `src/components/Sidebar.jsx`**

```jsx
import { ChevronRight, ChevronDown, Moon, Sun, LogOut, Settings } from 'lucide-react'
import { useState } from 'react'
import { PLATFORMS, MOCK_SHOPS } from '../platforms/index.js'
import './Sidebar.css'

const MONTH_OPTIONS = ['2025-12', '2026-01', '2026-02', '2026-03']

export default function Sidebar({
  platformId, shopId, month, darkMode,
  onScopeChange, onToggleDark, onLogout
}) {
  const [expanded, setExpanded] = useState({ [platformId]: true })

  return (
    <aside className="rec-sidebar">
      <div className="rec-sidebar-brand">🏷️ AI对账</div>

      <nav className="rec-sidebar-nav">
        {PLATFORMS.map(p => {
          const open = expanded[p.id]
          const isPlanned = p.status === 'planned'
          const shops = MOCK_SHOPS[p.id] || []
          return (
            <div key={p.id} className={`rec-platform ${isPlanned ? 'planned' : ''}`}>
              <button
                className="rec-platform-row"
                disabled={isPlanned}
                onClick={() => setExpanded(e => ({ ...e, [p.id]: !e[p.id] }))}
                title={isPlanned ? '敬请期待' : ''}
              >
                {open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                <span className="rec-platform-name">{p.name}</span>
                {isPlanned && <span className="rec-tag">规划中</span>}
              </button>
              {open && shops.map(s => (
                <button
                  key={s.id}
                  className={`rec-shop-row ${platformId === p.id && shopId === s.id ? 'active' : ''}`}
                  disabled={isPlanned}
                  onClick={() => onScopeChange({ platformId: p.id, shopId: s.id, month })}
                >• {s.name}</button>
              ))}
            </div>
          )
        })}
      </nav>

      <div className="rec-sidebar-section">
        <label className="rec-month-label">📅 月份</label>
        <select
          className="rec-month-select"
          value={month}
          onChange={e => onScopeChange({ platformId, shopId, month: e.target.value })}
        >
          {MONTH_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="rec-sidebar-footer">
        <button onClick={onToggleDark} title="暗色">
          {darkMode ? <Sun size={16}/> : <Moon size={16}/>}
        </button>
        <button title="设置"><Settings size={16}/></button>
        <button onClick={onLogout} title="退出"><LogOut size={16}/></button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: 创建 `src/components/Sidebar.css`**

```css
.rec-sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex; flex-direction: column;
  padding: 16px 12px;
  gap: 18px;
}
.rec-sidebar-brand {
  font-weight: 600; font-size: var(--font-size-md);
  padding: 4px 8px; color: var(--text-primary);
}
.rec-sidebar-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto; }
.rec-platform.planned { opacity: 0.45; }
.rec-platform-row {
  display: flex; align-items: center; gap: 6px;
  width: 100%; padding: 6px 8px;
  background: transparent; border: none; cursor: pointer;
  font-size: var(--font-size-base); color: var(--text-primary);
  border-radius: 6px;
}
.rec-platform-row:hover:not(:disabled) { background: var(--bg-hover); }
.rec-platform-row:disabled { cursor: not-allowed; }
.rec-platform-name { flex: 1; text-align: left; }
.rec-tag {
  font-size: var(--font-size-xs); padding: 2px 6px;
  background: var(--bg-active); border-radius: 4px;
  color: var(--text-muted);
}
.rec-shop-row {
  display: block; width: 100%; text-align: left;
  padding: 5px 8px 5px 28px;
  background: transparent; border: none; cursor: pointer;
  font-size: var(--font-size-sm); color: var(--text-secondary);
  border-radius: 6px;
}
.rec-shop-row:hover:not(:disabled) { background: var(--bg-hover); }
.rec-shop-row.active { background: var(--accent-soft); color: var(--accent); }
.rec-sidebar-section { display: flex; flex-direction: column; gap: 6px; padding: 0 8px; }
.rec-month-label { font-size: var(--font-size-sm); color: var(--text-secondary); }
.rec-month-select {
  padding: 6px 8px; border: 1px solid var(--border-color);
  border-radius: 6px; background: var(--bg-card); color: var(--text-primary);
  font-size: var(--font-size-sm);
}
.rec-sidebar-footer {
  display: flex; gap: 6px; padding: 8px;
  border-top: 1px solid var(--border-color);
}
.rec-sidebar-footer button {
  flex: 1; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: 1px solid var(--border-color);
  border-radius: 6px; cursor: pointer; color: var(--icon-default);
}
.rec-sidebar-footer button:hover { background: var(--bg-hover); }
```

- [ ] **Step 3: 提交**

```bash
git add src/components/Sidebar.*
git commit -m "feat(ui): sidebar with platform tree + month picker"
```

---

## Task 14：TopBar（标题 + Tab）

**Files:**
- Create: `src/components/TopBar.jsx`、`src/components/TopBar.css`

- [ ] **Step 1: 创建 `src/components/TopBar.jsx`**

```jsx
import { Download, HelpCircle, User } from 'lucide-react'
import './TopBar.css'

const TABS = [
  { id: 'reconcile', label: '对账明细' },
  { id: 'sku', label: '款式利润榜' }
]

export default function TopBar({ platformName, shopName, month, activeTab, onTabChange, onExport, canExport }) {
  return (
    <header className="rec-topbar">
      <div className="rec-topbar-row">
        <div className="rec-topbar-title">
          <strong>{platformName}</strong>
          <span className="rec-topbar-sep">·</span>
          <span>{shopName}</span>
          <span className="rec-topbar-sep">·</span>
          <span>{month}</span>
        </div>
        <div className="rec-topbar-actions">
          <button onClick={onExport} disabled={!canExport} title="导出 CSV">
            <Download size={14}/> 导出
          </button>
          <button title="帮助"><HelpCircle size={14}/> 帮助</button>
          <button title="账户"><User size={14}/></button>
        </div>
      </div>
      <div className="rec-topbar-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`rec-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >{t.label}</button>
        ))}
      </div>
    </header>
  )
}
```

- [ ] **Step 2: 创建 `src/components/TopBar.css`**

```css
.rec-topbar {
  background: var(--bg-elevated);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
}
.rec-topbar-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 24px;
}
.rec-topbar-title { font-size: var(--font-size-md); color: var(--text-primary); }
.rec-topbar-title strong { color: var(--accent); }
.rec-topbar-sep { margin: 0 8px; color: var(--text-muted); }
.rec-topbar-actions { display: flex; gap: 8px; }
.rec-topbar-actions button {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 10px; border: 1px solid var(--border-color);
  background: var(--bg-card); border-radius: 6px; cursor: pointer;
  font-size: var(--font-size-sm); color: var(--text-primary);
}
.rec-topbar-actions button:hover:not(:disabled) { background: var(--bg-hover); }
.rec-topbar-actions button:disabled { opacity: 0.4; cursor: not-allowed; }
.rec-topbar-tabs {
  display: flex; gap: 0; padding: 0 24px;
}
.rec-tab {
  padding: 10px 18px;
  background: transparent; border: none; cursor: pointer;
  font-size: var(--font-size-md); color: var(--text-secondary);
  border-bottom: 2px solid transparent;
}
.rec-tab:hover { color: var(--text-primary); }
.rec-tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 500; }
```

- [ ] **Step 3: 提交**

```bash
git add src/components/TopBar.*
git commit -m "feat(ui): topbar with title + tabs"
```

---

## Task 15：UploadZone

**Files:**
- Create: `src/components/UploadZone.jsx`、`src/components/UploadZone.css`

- [ ] **Step 1: 创建 `src/components/UploadZone.jsx`**

```jsx
import { useRef } from 'react'
import { Upload, CheckCircle2, X, FileSpreadsheet } from 'lucide-react'
import './UploadZone.css'

const JST_SLOT = {
  key: 'jst', label: '聚水潭导出', required: true,
  sheetName: '聚水潭导出店铺数据', requiredColumns: ['原始线上订单号', '款式编码', '实发金额', '实发成本']
}

function Slot({ slot, value, onPick, onClear }) {
  const inputRef = useRef()
  const handleFile = e => {
    const file = e.target.files?.[0]
    if (file) onPick(slot, file)
    e.target.value = ''
  }
  return (
    <div className={`rec-slot ${value ? 'filled' : ''}`}>
      <input ref={inputRef} type="file" accept=".xlsx" onChange={handleFile} hidden/>
      {value ? (
        <>
          <CheckCircle2 size={18} className="rec-slot-icon" color="#3aaf6b"/>
          <div className="rec-slot-info">
            <div className="rec-slot-label">{slot.label}</div>
            <div className="rec-slot-meta">{value.fileName} · {value.rows?.length ?? '—'} 行</div>
          </div>
          <button className="rec-slot-clear" onClick={() => onClear(slot)} title="清除"><X size={14}/></button>
        </>
      ) : (
        <button className="rec-slot-cta" onClick={() => inputRef.current.click()}>
          <Upload size={18}/>
          <div className="rec-slot-info">
            <div className="rec-slot-label">{slot.label}{slot.required ? <span className="req">*</span> : ''}</div>
            <div className="rec-slot-meta">点击或拖拽 .xlsx 文件</div>
          </div>
        </button>
      )}
    </div>
  )
}

export default function UploadZone({ platform, uploads, onPick, onClear, onStart, canStart, reconciling }) {
  const slots = [...platform.uploadSlots, JST_SLOT]
  return (
    <div className="rec-upload-zone">
      <div className="rec-upload-header">
        <FileSpreadsheet size={18}/>
        <span>上传 {platform.name} 对账文件</span>
      </div>
      <div className="rec-upload-grid">
        {slots.map(s => (
          <Slot key={s.key} slot={s} value={uploads[s.key]} onPick={onPick} onClear={onClear}/>
        ))}
      </div>
      <div className="rec-upload-actions">
        <button className="rec-primary" disabled={!canStart || reconciling} onClick={onStart}>
          {reconciling ? '对账中…' : '开始对账'}
        </button>
        {!canStart && <span className="rec-upload-hint">请上传所有必需文件</span>}
      </div>
    </div>
  )
}

export { JST_SLOT }
```

- [ ] **Step 2: 创建 `src/components/UploadZone.css`**

```css
.rec-upload-zone {
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 12px; padding: 18px; box-shadow: var(--shadow-sm);
}
.rec-upload-header {
  display: flex; align-items: center; gap: 8px;
  font-size: var(--font-size-md); font-weight: 500;
  margin-bottom: 14px;
}
.rec-upload-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}
.rec-slot {
  display: flex; align-items: center; gap: 10px;
  border: 1px dashed var(--border-strong); border-radius: 10px;
  padding: 14px; min-height: 72px;
  transition: all 0.15s;
}
.rec-slot.filled { border-style: solid; background: var(--bg-hover); }
.rec-slot-cta {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 0; background: transparent; border: none; cursor: pointer;
  text-align: left; color: var(--text-primary);
}
.rec-slot-cta:hover { color: var(--accent); }
.rec-slot-info { flex: 1; min-width: 0; }
.rec-slot-label { font-size: var(--font-size-base); font-weight: 500; }
.rec-slot-label .req { color: var(--accent); margin-left: 4px; }
.rec-slot-meta { font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rec-slot-clear {
  background: transparent; border: none; cursor: pointer;
  color: var(--text-muted); padding: 4px;
}
.rec-slot-clear:hover { color: var(--accent); }
.rec-upload-actions {
  display: flex; align-items: center; gap: 12px; margin-top: 16px;
}
.rec-primary {
  background: var(--accent); color: white; border: none;
  padding: 8px 18px; border-radius: 6px; cursor: pointer;
  font-size: var(--font-size-base); font-weight: 500;
}
.rec-primary:hover:not(:disabled) { background: var(--accent-hover); }
.rec-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.rec-upload-hint { font-size: var(--font-size-sm); color: var(--text-muted); }
```

- [ ] **Step 3: 提交**

```bash
git add src/components/UploadZone.*
git commit -m "feat(ui): upload zone with slot grid + start button"
```

---

## Task 16：KpiCards

**Files:**
- Create: `src/components/KpiCards.jsx`、`src/components/KpiCards.css`

- [ ] **Step 1: 创建 `src/components/KpiCards.jsx`**

```jsx
import { fmtMoney, fmtNumber } from '../utils/format.js'
import './KpiCards.css'

export default function KpiCards({ kpi }) {
  if (!kpi) return null
  const cards = [
    { label: '总订单', value: fmtNumber(kpi.totalOrders), tone: 'neutral' },
    { label: '营收（平台口径）', value: fmtMoney(kpi.revenue), tone: 'neutral' },
    { label: '成本', value: fmtMoney(kpi.cost), tone: 'neutral' },
    { label: '真实利润', value: fmtMoney(kpi.realProfit), tone: kpi.realProfit >= 0 ? 'good' : 'bad' },
    { label: `差异 / 异常`, value: `${kpi.diffCount} 单`, tone: kpi.diffCount > 0 ? 'warn' : 'good',
      sub: `重复 ${kpi.duplicatedCount} · 缺失 ${kpi.missingCount} · 利润异常 ${kpi.anomalyCount}` }
  ]
  return (
    <div className="rec-kpi-wrap">
      <div className="rec-kpi-caption">数据口径：抖音平台账单（含退款负单）</div>
      <div className="rec-kpi-grid">
        {cards.map((c, i) => (
          <div key={i} className={`rec-kpi-card tone-${c.tone}`}>
            <div className="rec-kpi-label">{c.label}</div>
            <div className="rec-kpi-value">{c.value}</div>
            {c.sub && <div className="rec-kpi-sub">{c.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 `src/components/KpiCards.css`**

```css
.rec-kpi-wrap { display: flex; flex-direction: column; gap: 6px; }
.rec-kpi-caption { font-size: var(--font-size-xs); color: var(--text-muted); padding: 0 4px; }
.rec-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.rec-kpi-card {
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 10px; padding: 14px; box-shadow: var(--shadow-sm);
}
.rec-kpi-label { font-size: var(--font-size-sm); color: var(--text-secondary); }
.rec-kpi-value {
  font-size: 22px; font-weight: 600; margin-top: 6px; letter-spacing: -0.02em;
}
.rec-kpi-sub { font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px; }
.rec-kpi-card.tone-good .rec-kpi-value { color: #2f9d68; }
.rec-kpi-card.tone-bad .rec-kpi-value { color: #d23a3a; }
.rec-kpi-card.tone-warn .rec-kpi-value { color: #c98412; }
@media (max-width: 1280px) {
  .rec-kpi-grid { grid-template-columns: repeat(3, 1fr); }
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/KpiCards.*
git commit -m "feat(ui): kpi cards"
```

---

## Task 17：DiffTable + DiffDrawer

**Files:**
- Create: `src/components/DiffTable.jsx`、`src/components/DiffTable.css`、`src/components/DiffDrawer.jsx`、`src/components/DiffDrawer.css`

- [ ] **Step 1: 创建 `src/components/DiffDrawer.jsx`**

```jsx
import { X } from 'lucide-react'
import { fmtMoney } from '../utils/format.js'
import './DiffDrawer.css'

export default function DiffDrawer({ row, onClose }) {
  if (!row) return null
  return (
    <div className="rec-drawer-mask" onClick={onClose}>
      <aside className="rec-drawer" onClick={e => e.stopPropagation()}>
        <header>
          <h3>订单 {row.orderId}</h3>
          <button onClick={onClose}><X size={16}/></button>
        </header>
        <section>
          <h4>资金流水（{row.platformFlows.length} 笔）</h4>
          <table className="rec-mini">
            <thead><tr><th>时间</th><th>方向</th><th>金额</th><th>场景</th><th>备注</th></tr></thead>
            <tbody>
              {row.platformFlows.map((f, i) => (
                <tr key={i}>
                  <td>{f.time ? new Date(f.time).toLocaleString('zh-CN') : '—'}</td>
                  <td>{f.direction}</td>
                  <td>{fmtMoney(f.amount * (f.direction === '出账' ? -1 : 1))}</td>
                  <td>{f.scene}</td>
                  <td>{f.memo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section>
          <h4>聚水潭原始行（{row.jstRows.length}）</h4>
          <pre className="rec-jst-raw">{JSON.stringify(row.jstRows, null, 2)}</pre>
        </section>
      </aside>
    </div>
  )
}
```

- [ ] **Step 2: 创建 `src/components/DiffDrawer.css`**

```css
.rec-drawer-mask {
  position: fixed; inset: 0; background: rgba(15, 17, 22, 0.4);
  display: flex; justify-content: flex-end; z-index: 100;
}
.rec-drawer {
  width: 640px; max-width: 90vw; height: 100%;
  background: var(--bg-card); padding: 20px; overflow-y: auto;
  box-shadow: var(--shadow-lg);
}
.rec-drawer header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.rec-drawer header button { background: transparent; border: none; cursor: pointer; color: var(--icon-default); }
.rec-drawer h3 { font-size: 16px; }
.rec-drawer h4 { font-size: 13px; margin: 18px 0 8px; color: var(--text-secondary); }
.rec-mini { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
.rec-mini th, .rec-mini td { padding: 6px 8px; border-bottom: 1px solid var(--border-color); text-align: left; }
.rec-mini th { color: var(--text-muted); font-weight: 500; }
.rec-jst-raw {
  background: var(--bg-hover); padding: 10px; border-radius: 6px;
  font-size: 11px; max-height: 360px; overflow: auto;
}
```

- [ ] **Step 3: 创建 `src/components/DiffTable.jsx`**

```jsx
import { useState, useMemo } from 'react'
import { MessageSquare } from 'lucide-react'
import { fmtMoney } from '../utils/format.js'
import DiffDrawer from './DiffDrawer.jsx'
import './DiffTable.css'

const FILTERS = [
  { id: 'all', label: '全部' },
  { id: 'matched', label: '一致' },
  { id: 'duplicated', label: '金额翻倍' },
  { id: 'missing_in_jst', label: '聚水潭缺失' },
  { id: 'missing_in_platform', label: '平台缺失' },
  { id: 'profit_anomaly', label: '利润异常' }
]

const BUCKET_LABEL = {
  matched: '一致', duplicated: '翻倍',
  missing_in_jst: '聚水潭缺', missing_in_platform: '平台缺',
  profit_anomaly: '利润异常'
}

export default function DiffTable({ rows }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(null)

  const filtered = useMemo(() => {
    let r = filter === 'all' ? rows : rows.filter(x => x.bucket === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      r = r.filter(x => x.orderId?.toLowerCase().includes(q) || x.styleCode?.toLowerCase().includes(q))
    }
    return r
  }, [rows, filter, search])

  return (
    <div className="rec-difftable">
      <div className="rec-difftable-toolbar">
        {FILTERS.map(f => (
          <button key={f.id}
            className={`rec-pill ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
        <input
          className="rec-search"
          placeholder="搜索订单号/款式编码"
          value={search} onChange={e => setSearch(e.target.value)}/>
        <span className="rec-count">{filtered.length} 单</span>
      </div>
      <div className="rec-difftable-scroll">
        <table>
          <thead>
            <tr>
              <th></th><th>订单号</th><th>款式</th>
              <th>销售收入</th><th>净入账</th><th>成本</th>
              <th>真实利润</th><th>系统毛利</th><th>毛利差</th>
              <th>状态</th><th>AI</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.orderId} className={`bucket-${r.bucket}`} onClick={() => setOpen(r)}>
                <td>{r.bucket === 'matched' ? '✓' : '!'}</td>
                <td className="mono">{r.orderId}</td>
                <td>{r.styleCode || '—'}</td>
                <td>{fmtMoney(r.saleRevenue)}</td>
                <td>{fmtMoney(r.netSettled)}</td>
                <td>{fmtMoney(r.shippedCost)}</td>
                <td>{fmtMoney(r.realProfit)}</td>
                <td>{fmtMoney(r.systemProfit)}</td>
                <td className={r.profitDiff < 0 ? 'neg' : ''}>{fmtMoney(r.profitDiff)}</td>
                <td><span className={`badge bk-${r.bucket}`}>{BUCKET_LABEL[r.bucket]}</span></td>
                <td title={r.aiHint || ''}>
                  {r.aiHint ? <MessageSquare size={14}/> : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="rec-empty">本筛选条件下没有订单</div>}
      </div>
      <DiffDrawer row={open} onClose={() => setOpen(null)}/>
    </div>
  )
}
```

- [ ] **Step 4: 创建 `src/components/DiffTable.css`**

```css
.rec-difftable {
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 12px; box-shadow: var(--shadow-sm); overflow: hidden;
}
.rec-difftable-toolbar {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  border-bottom: 1px solid var(--border-color); flex-wrap: wrap;
}
.rec-pill {
  padding: 5px 12px; border-radius: 999px;
  background: var(--bg-hover); color: var(--text-secondary);
  border: 1px solid transparent; cursor: pointer;
  font-size: var(--font-size-sm);
}
.rec-pill.active { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); }
.rec-search {
  padding: 6px 10px; border: 1px solid var(--border-color);
  border-radius: 6px; background: var(--bg-secondary);
  font-size: var(--font-size-sm); width: 220px;
}
.rec-count { margin-left: auto; font-size: var(--font-size-sm); color: var(--text-muted); }
.rec-difftable-scroll { max-height: 540px; overflow: auto; }
.rec-difftable table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
.rec-difftable th, .rec-difftable td {
  padding: 8px 10px; text-align: left;
  border-bottom: 1px solid var(--border-color);
}
.rec-difftable th { background: var(--bg-secondary); color: var(--text-muted); font-weight: 500;
  position: sticky; top: 0; }
.rec-difftable tbody tr { cursor: pointer; }
.rec-difftable tbody tr:hover { background: var(--bg-hover); }
.rec-difftable .mono { font-family: ui-monospace, Menlo, monospace; font-size: 11px; }
.rec-difftable .neg { color: #d23a3a; }
.badge {
  padding: 2px 8px; border-radius: 4px; font-size: var(--font-size-xs);
}
.badge.bk-matched { background: rgba(58, 175, 107, 0.14); color: #2f9d68; }
.badge.bk-duplicated { background: rgba(241, 178, 56, 0.18); color: #c98412; }
.badge.bk-missing_in_jst, .badge.bk-missing_in_platform {
  background: rgba(114, 132, 161, 0.18); color: #62718a;
}
.badge.bk-profit_anomaly { background: rgba(210, 58, 58, 0.14); color: #d23a3a; }
.rec-empty { padding: 40px; text-align: center; color: var(--text-muted); }
```

- [ ] **Step 5: 提交**

```bash
git add src/components/DiffTable.* src/components/DiffDrawer.*
git commit -m "feat(ui): diff table with filters + detail drawer"
```

---

## Task 18：MonthlyExpensePanel

**Files:**
- Create: `src/components/MonthlyExpensePanel.jsx`、`src/components/MonthlyExpensePanel.css`

- [ ] **Step 1: 创建 `src/components/MonthlyExpensePanel.jsx`**

```jsx
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { fmtMoney } from '../utils/format.js'
import './MonthlyExpensePanel.css'

export default function MonthlyExpensePanel({ items }) {
  const [open, setOpen] = useState(false)
  if (!items || items.length === 0) return null
  const total = items.reduce((s, i) => s + i.totalAmount, 0)
  return (
    <section className="rec-monthly">
      <button className="rec-monthly-head" onClick={() => setOpen(!open)}>
        {open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
        <span>月度公共扣费</span>
        <span className="rec-monthly-total">{fmtMoney(total)}</span>
      </button>
      {open && (
        <div className="rec-monthly-body">
          {items.map(i => (
            <div key={i.scene} className="rec-monthly-row">
              <div className="rec-monthly-scene">{i.scene}</div>
              <div className="rec-monthly-count">{i.count} 笔</div>
              <div className="rec-monthly-amount">{fmtMoney(i.totalAmount)}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: 创建 `src/components/MonthlyExpensePanel.css`**

```css
.rec-monthly { background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 12px; overflow: hidden; }
.rec-monthly-head {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 12px 16px; background: transparent; border: none; cursor: pointer;
  font-size: var(--font-size-base); color: var(--text-primary);
}
.rec-monthly-head:hover { background: var(--bg-hover); }
.rec-monthly-total { margin-left: auto; color: #d23a3a; font-weight: 500; }
.rec-monthly-body { padding: 4px 16px 12px; }
.rec-monthly-row {
  display: flex; align-items: center; gap: 16px;
  padding: 6px 0; border-top: 1px solid var(--border-color);
  font-size: var(--font-size-sm);
}
.rec-monthly-scene { flex: 1; }
.rec-monthly-count { color: var(--text-muted); }
.rec-monthly-amount { color: #d23a3a; min-width: 100px; text-align: right; }
```

- [ ] **Step 3: 提交**

```bash
git add src/components/MonthlyExpensePanel.*
git commit -m "feat(ui): monthly expense collapsible panel"
```

---

## Task 19：SkuProfitTab

**Files:**
- Create: `src/components/SkuProfitTab.jsx`、`src/components/SkuProfitTab.css`

- [ ] **Step 1: 创建 `src/components/SkuProfitTab.jsx`**

```jsx
import { useMemo, useState } from 'react'
import { fmtMoney, fmtNumber, fmtPct } from '../utils/format.js'
import './SkuProfitTab.css'

export default function SkuProfitTab({ result }) {
  const [sortKey, setSortKey] = useState('profit')
  const [filter, setFilter] = useState('all')

  const items = useMemo(() => {
    if (!result) return []
    let arr = [...result.skuStats]
    if (filter === 'positive') arr = arr.filter(s => s.profit > 0)
    if (filter === 'negative') arr = arr.filter(s => s.profit <= 0)
    arr.sort((a, b) => b[sortKey] - a[sortKey])
    return arr
  }, [result, sortKey, filter])

  if (!result) {
    return <div className="rec-sku-empty">先在「对账明细」上传文件并完成对账</div>
  }

  const totals = items.reduce((acc, s) => {
    acc.qty += s.qty; acc.revenue += s.revenue; acc.cost += s.cost; acc.profit += s.profit
    return acc
  }, { qty: 0, revenue: 0, cost: 0, profit: 0 })
  const maxProfit = Math.max(...items.map(s => Math.abs(s.profit)), 1)

  return (
    <div className="rec-sku-tab">
      <div className="rec-sku-toolbar">
        <span>排序：</span>
        {['profit', 'qty', 'profitRate'].map(k => (
          <button key={k} className={`rec-pill ${sortKey === k ? 'active' : ''}`}
            onClick={() => setSortKey(k)}>
            {k === 'profit' ? '按毛利↓' : k === 'qty' ? '按销量↓' : '按毛利率↓'}
          </button>
        ))}
        <span style={{ marginLeft: 24 }}>显示：</span>
        {[['all', '全部'], ['positive', '盈利'], ['negative', '亏损/0']].map(([k, l]) => (
          <button key={k} className={`rec-pill ${filter === k ? 'active' : ''}`}
            onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      <div className="rec-sku-caption">数据口径：聚水潭（退款抵销后净额）</div>

      <div className="rec-sku-table-wrap">
        <table className="rec-sku-table">
          <thead>
            <tr><th>款式编码</th><th>件数</th><th>营收</th><th>成本</th>
              <th>真实毛利</th><th>毛利率</th><th>占比柱</th></tr>
          </thead>
          <tbody>
            {items.map(s => {
              const w = (Math.abs(s.profit) / maxProfit) * 100
              return (
                <tr key={s.styleCode}>
                  <td className="mono">{s.styleCode}</td>
                  <td>{fmtNumber(s.qty)}</td>
                  <td>{fmtMoney(s.revenue)}</td>
                  <td>{fmtMoney(s.cost)}</td>
                  <td className={s.profit < 0 ? 'neg' : 'pos'}>{fmtMoney(s.profit)}</td>
                  <td>{fmtPct(s.profitRate)}</td>
                  <td><div className="rec-sku-bar" style={{ width: `${w}%`,
                    background: s.profit < 0 ? '#d23a3a' : '#2f9d68' }}/></td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>总计</strong></td>
              <td>{fmtNumber(totals.qty)}</td>
              <td>{fmtMoney(totals.revenue)}</td>
              <td>{fmtMoney(totals.cost)}</td>
              <td>{fmtMoney(totals.profit)}</td>
              <td>{fmtPct(totals.revenue ? totals.profit / totals.revenue : 0)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 `src/components/SkuProfitTab.css`**

```css
.rec-sku-tab { display: flex; flex-direction: column; gap: 10px; padding: 20px 24px; }
.rec-sku-toolbar { display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  font-size: var(--font-size-sm); color: var(--text-secondary); }
.rec-sku-caption { font-size: var(--font-size-xs); color: var(--text-muted); }
.rec-sku-table-wrap {
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 12px; overflow: auto; box-shadow: var(--shadow-sm);
}
.rec-sku-table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
.rec-sku-table th, .rec-sku-table td { padding: 8px 10px; border-bottom: 1px solid var(--border-color); text-align: left; }
.rec-sku-table th { background: var(--bg-secondary); color: var(--text-muted); font-weight: 500; }
.rec-sku-table tfoot td { background: var(--bg-secondary); font-weight: 500; }
.rec-sku-table .mono { font-family: ui-monospace, Menlo, monospace; font-size: 11px; }
.rec-sku-table .neg { color: #d23a3a; }
.rec-sku-table .pos { color: #2f9d68; }
.rec-sku-bar { height: 8px; border-radius: 4px; }
.rec-sku-empty { padding: 60px; text-align: center; color: var(--text-muted); }
```

- [ ] **Step 3: 提交**

```bash
git add src/components/SkuProfitTab.*
git commit -m "feat(ui): sku profit ranking tab"
```

---

## Task 20：ReconcileTab + 把所有东西串起来

**Files:**
- Create: `src/components/ReconcileTab.jsx`、`src/components/ReconcileTab.css`
- Modify: `src/App.jsx`

- [ ] **Step 1: 创建 `src/components/ReconcileTab.jsx`**

```jsx
import KpiCards from './KpiCards.jsx'
import DiffTable from './DiffTable.jsx'
import MonthlyExpensePanel from './MonthlyExpensePanel.jsx'
import UploadZone from './UploadZone.jsx'
import './ReconcileTab.css'

export default function ReconcileTab({
  platform, uploads, onPick, onClear, onStart, canStart,
  reconciling, result, error, parseWarnings
}) {
  return (
    <div className="rec-tab-content">
      {error && <div className="rec-error">{error}</div>}
      {parseWarnings.length > 0 && (
        <div className="rec-warn">
          {parseWarnings.length} 行解析失败，已跳过：{parseWarnings.slice(0, 3).join('；')}{parseWarnings.length > 3 ? '…' : ''}
        </div>
      )}

      <UploadZone
        platform={platform}
        uploads={uploads}
        onPick={onPick} onClear={onClear} onStart={onStart}
        canStart={canStart} reconciling={reconciling}/>

      {result && (
        <>
          {result.kpi.diffCount === 0 && (
            <div className="rec-banner-success">🎉 本月所有订单完全对齐</div>
          )}
          <KpiCards kpi={result.kpi}/>
          <DiffTable rows={result.diffRows}/>
          <MonthlyExpensePanel items={result.monthlyExpense}/>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 创建 `src/components/ReconcileTab.css`**

```css
.rec-tab-content {
  padding: 20px 24px; display: flex; flex-direction: column; gap: 16px;
  overflow-y: auto; flex: 1;
}
.rec-error {
  background: rgba(210, 58, 58, 0.12); color: #d23a3a;
  padding: 10px 14px; border-radius: 8px; font-size: var(--font-size-sm);
}
.rec-warn {
  background: rgba(241, 178, 56, 0.18); color: #c98412;
  padding: 10px 14px; border-radius: 8px; font-size: var(--font-size-sm);
}
.rec-banner-success {
  background: rgba(58, 175, 107, 0.14); color: #2f9d68;
  padding: 12px 16px; border-radius: 8px; font-size: var(--font-size-md);
  text-align: center; font-weight: 500;
}
```

- [ ] **Step 3: 替换 `src/App.jsx`**

```jsx
import { useCallback, useMemo } from 'react'
import './App.css'
import LoginPage from './components/LoginPage.jsx'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import ReconcileTab from './components/ReconcileTab.jsx'
import SkuProfitTab from './components/SkuProfitTab.jsx'
import { useReconcileStore } from './hooks/useReconcileStore.js'
import { platformsById, MOCK_SHOPS } from './platforms/index.js'
import { JST_SLOT } from './components/UploadZone.jsx'
import { readWorkbook, validateColumns } from './utils/excel.js'
import { parseJushuitan } from './core/jushuitan.js'
import { runReconcile } from './core/reconcile.js'
import { useEffect } from 'react'

function findFirstSheet(book, candidates) {
  for (const name of candidates) {
    if (book[name]) return book[name]
  }
  // fallback: first sheet
  const keys = Object.keys(book)
  return keys.length ? book[keys[0]] : null
}

export default function App() {
  const { state, dispatch, login, logout } = useReconcileStore()

  useEffect(() => {
    document.body.classList.toggle('dark', state.darkMode)
  }, [state.darkMode])

  const platform = platformsById[state.platformId]
  const shops = MOCK_SHOPS[state.platformId] || []
  const shop = shops.find(s => s.id === state.shopId) || shops[0]

  const requiredSlots = useMemo(() => {
    return [...platform.uploadSlots.filter(s => s.required), JST_SLOT]
  }, [platform])

  const canStart = requiredSlots.every(s => !!state.uploads[s.key])

  const onPick = useCallback(async (slot, file) => {
    try {
      const book = await readWorkbook(file)
      const rows = findFirstSheet(book, [slot.sheetName])
      if (!rows) {
        dispatch({ type: 'RECONCILE_FAIL', error: `${slot.label}: 未找到工作表 "${slot.sheetName}"` })
        return
      }
      const missing = validateColumns(rows, slot.requiredColumns || [])
      if (missing.length) {
        dispatch({ type: 'RECONCILE_FAIL', error: `${slot.label} 缺少必需列：${missing.join('、')}` })
        return
      }
      dispatch({ type: 'SET_UPLOAD', key: slot.key, payload: { fileName: file.name, rows } })
    } catch (e) {
      dispatch({ type: 'RECONCILE_FAIL', error: `${slot.label} 解析失败：${e.message}` })
    }
  }, [dispatch])

  const onClear = useCallback(slot => dispatch({ type: 'CLEAR_UPLOAD', key: slot.key }), [dispatch])

  const onStart = useCallback(() => {
    dispatch({ type: 'RECONCILE_START' })
    setTimeout(() => {
      try {
        const fundRows = state.uploads.fund?.rows || []
        const summaryRows = state.uploads.summary?.rows || []
        const jstRows = state.uploads.jst?.rows || []
        const platformResult = platform.transform({ fundRows, summaryRows })
        const jstOrders = parseJushuitan(jstRows)
        const result = runReconcile(platformResult, jstOrders)
        dispatch({ type: 'RECONCILE_DONE', result, warnings: [] })
      } catch (e) {
        dispatch({ type: 'RECONCILE_FAIL', error: '对账失败：' + e.message })
      }
    }, 200)
  }, [state.uploads, platform, dispatch])

  const onScopeChange = useCallback(scope => dispatch({ type: 'SELECT_SCOPE', ...scope }), [dispatch])
  const onTabChange = useCallback(tab => dispatch({ type: 'SET_TAB', tab }), [dispatch])
  const onExport = useCallback(() => {
    if (!state.result) return
    const head = ['订单号','款式','销售收入','净入账','成本','真实利润','系统毛利','毛利差','状态']
    const lines = [head.join(',')]
    for (const r of state.result.diffRows) {
      lines.push([r.orderId, r.styleCode || '', r.saleRevenue, r.netSettled,
        r.shippedCost, r.realProfit, r.systemProfit, r.profitDiff, r.bucket].join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `对账_${state.platformId}_${state.month}.csv`; a.click()
    URL.revokeObjectURL(url)
  }, [state.result, state.platformId, state.month])

  if (!state.authed) return <LoginPage onLogin={login}/>

  if (platform.status === 'planned') {
    return (
      <div className="app-layout">
        <Sidebar
          platformId={state.platformId} shopId={state.shopId} month={state.month}
          darkMode={state.darkMode}
          onScopeChange={onScopeChange}
          onToggleDark={() => dispatch({ type: 'TOGGLE_DARK' })}
          onLogout={logout}/>
        <div className="main-area">
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <h2>{platform.name}</h2>
            <p>该平台正在接入中。已规划：淘宝/天猫、快手、拼多多、小红书、视频号、微信小店</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar
        platformId={state.platformId} shopId={state.shopId} month={state.month}
        darkMode={state.darkMode}
        onScopeChange={onScopeChange}
        onToggleDark={() => dispatch({ type: 'TOGGLE_DARK' })}
        onLogout={logout}/>
      <div className="main-area">
        <TopBar
          platformName={platform.name} shopName={shop?.name || ''} month={state.month}
          activeTab={state.activeTab} onTabChange={onTabChange}
          onExport={onExport} canExport={!!state.result}/>
        {state.activeTab === 'reconcile' ? (
          <ReconcileTab
            platform={platform} uploads={state.uploads}
            onPick={onPick} onClear={onClear} onStart={onStart}
            canStart={canStart} reconciling={state.reconciling}
            result={state.result} error={state.error} parseWarnings={state.parseWarnings}/>
        ) : (
          <SkuProfitTab result={state.result}/>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 启动 dev，肉眼测试**

Run: `npm run dev`
Expected：
- 看到登录页 → 输入任意手机号登录 → 进入主界面
- Sidebar 显示 7 个平台，抖音可点、其它灰色
- 选中抖音 → 雪中飞德煌，TopBar 显示标题
- 上传 3 个文件（用样例 `抖音店铺对账数据.xlsx` 模拟时——它本身一个文件含 5 个 sheet——见 Task 22 对此特殊处理）

> **注意**：样例文件是单文件多 sheet。Task 22 会增加"单文件兼容模式"。当前 Task 20 端到端走过即可。

- [ ] **Step 5: 提交**

```bash
git add .
git commit -m "feat: wire reconcile tab + sku tab + app shell end-to-end"
```

---

## Task 21：浏览器端到端样例验收 + 单文件兼容

**Files:**
- Modify: `src/App.jsx`（增加单文件兼容：当上传一个文件而它包含多个目标 sheet 时，自动分别填充槽位）

- [ ] **Step 1: 在 `src/App.jsx` 中替换 `onPick`，改为：**

```jsx
const onPick = useCallback(async (slot, file) => {
  try {
    const book = await readWorkbook(file)

    // 兼容：如果用户上传的是包含全部 5 个 sheet 的样例文件，一次性塞满槽位
    const allSlotMap = {
      [platform.uploadSlots[0].sheetName]: platform.uploadSlots[0],
      ...(platform.uploadSlots[1] ? { [platform.uploadSlots[1].sheetName]: platform.uploadSlots[1] } : {}),
      [JST_SLOT.sheetName]: JST_SLOT
    }
    let stuffed = false
    for (const [sheetName, slotDef] of Object.entries(allSlotMap)) {
      if (book[sheetName]) {
        const missing = validateColumns(book[sheetName], slotDef.requiredColumns || [])
        if (missing.length === 0) {
          dispatch({ type: 'SET_UPLOAD', key: slotDef.key,
            payload: { fileName: file.name + ` · ${sheetName}`, rows: book[sheetName] } })
          stuffed = true
        }
      }
    }
    if (stuffed) return

    // 否则按当前 slot 处理
    const rows = book[slot.sheetName] || Object.values(book)[0]
    if (!rows) {
      dispatch({ type: 'RECONCILE_FAIL', error: `${slot.label}: 未找到工作表 "${slot.sheetName}"` })
      return
    }
    const missing = validateColumns(rows, slot.requiredColumns || [])
    if (missing.length) {
      dispatch({ type: 'RECONCILE_FAIL', error: `${slot.label} 缺少必需列：${missing.join('、')}` })
      return
    }
    dispatch({ type: 'SET_UPLOAD', key: slot.key, payload: { fileName: file.name, rows } })
  } catch (e) {
    dispatch({ type: 'RECONCILE_FAIL', error: `${slot.label} 解析失败：${e.message}` })
  }
}, [dispatch, platform])
```

- [ ] **Step 2: 启动 dev，端到端走样例**

Run: `npm run dev`

操作：
1. 登录 → 选抖音 → 任一上传槽位拖入 `E:\angsa\beiji\AI对账\抖音店铺对账数据.xlsx`
2. 因含全部目标 sheet，三个槽位应同时变绿
3. 点「开始对账」
4. 验证：
   - KPI 总订单 ≈ 2488，营收 ≈ ¥877,540
   - 差异列表能切到「金额翻倍」筛选，看到约 78 单
   - 切到「款式利润榜」，X2501326322FXT 排在最前，件数 ≈ 2280
   - 月度公共扣费可展开，含「权益保险」≈ 588 笔
5. 点击差异行，抽屉打开显示资金流水 + 聚水潭原行
6. 「导出 CSV」可下载

- [ ] **Step 3: 跑全测试**

Run: `npm test`
Expected: 全部通过

- [ ] **Step 4: 提交**

```bash
git add src/App.jsx
git commit -m "feat: single-file shortcut for bundled sample workbook"
```

---

## Task 22：最终视觉抛光 + README

**Files:**
- Create: `README.md`
- Modify: 视觉细节按肉眼审

- [ ] **Step 1: 浏览器中肉眼对照 opencut 检查**

打开 `http://localhost:5173/` 与 opencut（如可启动）。检查：
- 字体（Inter + 中文回退）
- 圆角（10–12px）
- 阴影（卡片用 --shadow-sm）
- 颜色（accent 用 #ef5d4e）
- 暗色模式切换正常

如有偏差，调整对应组件 CSS。

- [ ] **Step 2: 写 `README.md`**

```markdown
# AI对账原型

童装多平台店铺销售/利润对账原型。纯前端 React + Vite，无需后端。

## 启动

\`\`\`bash
npm install
npm run dev
\`\`\`

## 测试

\`\`\`bash
npm test
\`\`\`

## 用样例数据试

任意上传槽拖入 `抖音店铺对账数据.xlsx`，三个槽自动填满，点「开始对账」。

详见 `docs/superpowers/specs/2026-05-01-ai-reconciliation-prototype-design.md`。
```

- [ ] **Step 3: 提交**

```bash
git add README.md src/components
git commit -m "docs: README + visual polish"
```

---

## 验收清单（来自 spec §8）

- [ ] 用样例 xlsx 完整跑通对账流程
- [ ] Tab 1 KPI：总订单 ≈ 2488、营收 ≈ ¥877,540
- [ ] Tab 2 款式榜：总计件数 ≈ 2482、营收 ≈ ¥438,770
- [ ] 两个 Tab 的口径差异在 UI 上有小字标注
- [ ] 差异列表能识别约 78 单 duplicated
- [ ] 月度公共扣费列出权益保险/提现/偏远物流
- [ ] 切到非抖音平台显示"接入中"
- [ ] 视觉与 opencut 一致
- [ ] `npm test` 全部通过

---

## Self-Review 备忘

**Spec 覆盖**：每节 spec 都有对应任务；§3 架构 → Task 1-2；§4 UI → Task 12-20；§5 引擎 → Task 3-8；§6 边界 → Task 15/20；§7 不做的 → 已严格遵循（没加多店铺看板/三表对账/真实API/路由）。

**类型一致性**：DiffRow 字段 `bucket`、`saleRevenue`、`netSettled`、`shippedCost`、`realProfit`、`systemProfit`、`profitDiff`、`platformFlows`、`jstRows`、`aiHint` 在 reconcile/aiHint/UI 间一致。

**风险点**：
1. opencut 的 `LoginPage` 复制可能含其它依赖（如 logo 图）—Task 12 复制后如发现 import 缺失需补/删
2. 真实样例数据里"动账金额"在退款流水里是正数+方向="出账"，引擎已用 `direction === '出账' ? -amount : amount` 处理
3. 78 单 duplicated 检测的 ratio 容差 0.05 可能偏紧；首次跑数据如检出过少，调到 0.1
