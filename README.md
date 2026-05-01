# 爱对 — 多平台店铺 AI 对账原型

童装电商业务的多平台店铺销售 / 利润智能对账原型。纯前端 React + Vite，无后端。

---

## 它解决什么

童装业务在多个自媒体 / 电商平台开店，每月需要把**平台账单**和内部 ERP（聚水潭）对账，确认：

1. 每笔订单平台到账金额 = 聚水潭记录金额
2. 真实利润（平台净入账 − 实发成本）和聚水潭"销售毛利"对得上
3. 月度公共扣费（权益保险、提现费、推广费等）有清晰登记

**核心定位**：自动化精准对账为主，AI 仅做轻量辅助（差异原因一句话提示）。

---

## 平台覆盖

| 平台 | 状态 | 数据来源 |
|---|---|---|
| 抖音 | 真实 | 真实账单 `抖音店铺对账数据.xlsx` |
| 淘宝/天猫 | 演示 | `public/sample-data/taobao.xlsx` |
| 快手 | 演示 | `public/sample-data/kuaishou.xlsx` |
| 拼多多 | 演示 | `public/sample-data/pinduoduo.xlsx` |
| 小红书 | 演示 | `public/sample-data/xiaohongshu.xlsx` |
| 视频号小店 | 演示 | `public/sample-data/shipinhao.xlsx` |
| 微信小店 | 演示 | `public/sample-data/weixin_xiaodian.xlsx` |

每个平台账单**列名格式不同**（如抖音叫"订单号 / 动账方向 / 销售收入"，淘宝叫"子订单编号 / 收支类型 / 商品金额"），通过 `src/platforms/<platform>.js` 里的 `COLUMN_MAP` 映射到统一形状，再交给共享对账引擎处理。

---

## 启动

```bash
npm install
npm run dev          # 启动开发服务器
npm test             # 跑核心引擎单元测试（29 个用例）
npm run build        # 生产构建
npm run samples      # 重新生成 6 个平台的样例 xlsx
```

打开 `http://localhost:5173/` 任意手机号 + 任意验证码（≥4 位）登录。

**最快试用方式**：登录后，左侧选任一平台 → 点 UploadZone 顶部「✨ 加载演示数据」按钮 → 点「开始对账」。
真实抖音数据：把项目根目录的 `抖音店铺对账数据.xlsx` 拖到任一上传槽，三个槽自动填充。

---

## 架构

```
src/
  App.jsx                      路由壳 + 上传/对账编排
  components/                  React 组件
    LoginPage / Sidebar / TopBar
    UploadZone / ReconcileTab / SkuProfitTab
    KpiCards / DiffTable / DiffDrawer / MonthlyExpensePanel
  platforms/                   ★ 平台适配器层
    _shared.js                   核心：标准列名 → PlatformOrder
    _mockGenerator.js            生成标准 mock raw rows
    douyin.js                    抖音真实 adapter
    taobao.js / kuaishou.js / ... 6 个平台（自家列名 + COLUMN_MAP）
    index.js                     注册表
  core/
    constants.js                 阈值（金额 epsilon、利润异常）
    profit.js                    利润公式
    jushuitan.js                 聚水潭统一解析（自适应「<前缀>资金账单金额」列）
    reconcile.js                 ★ 对账引擎（matched / duplicated / missing / profit_anomaly）
    aiHint.js                    差异桶 → 一句话规则化提示
  hooks/useReconcileStore.js   单 store
  utils/excel.js               SheetJS 包装
  utils/format.js              ¥/数字/% 格式化
scripts/
  build-samples.mjs            生成 6 份样例 xlsx → public/sample-data/
public/sample-data/            7 份样例 xlsx（dev/prod 都能 fetch）
tests/                         核心引擎 vitest（29 个用例）
docs/superpowers/
  specs/2026-05-01-...md       设计文档
  plans/2026-05-01-...md       实施计划
```

### 数据流

```
.xlsx → SheetJS 解析 → raw rows {<平台列名>: ...}
  → adapter.transform()
    → COLUMN_MAP 反向映射 → standard rows {订单号, 动账金额, 销售收入, ...}
    → transformFromStandardRows() → { orders, fundFlow, monthlyExpense }
  ↘
聚水潭.xlsx → parseJushuitan() → JstOrder[]
                                   ↓
                         runReconcile(platformResult, jstOrders)
                                   ↓
              { kpi, diffRows, skuStats, monthlyExpense }
```

### 对账规则

| 桶 | 触发条件 | 含义 |
|---|---|---|
| `matched` | 平台 `销售收入` ≈ 聚水潭 `<前缀>资金账单金额` | 一致 |
| `duplicated` | 聚水潭多行且金额累计 = 平台×N (N≥2) | 售后/换货行重复登记 |
| `missing_in_jst` | 平台有此单，聚水潭无 | 未发货或导出条件遗漏 |
| `missing_in_platform` | 聚水潭有此单，平台账单无 | 未结算 / 跨月 / 在途 |
| `profit_anomaly` | \|真实利润 − 系统毛利\| > max(¥20, 30%) 且无退款 | 成本错登 / 退款漏冲 |

### 技术栈

- React 19 + Vite 8（与 opencut 视觉对齐）
- xlsx (SheetJS) — 浏览器侧解析，零后端
- lucide-react — 图标
- vitest — 仅测 `core/*` 与 `platforms/douyin.js`（其他平台测试通过 sample xlsx 端到端验证）

---

## 不在原型范围（YAGNI）

- 后端 / 持久化（刷新即丢，刻意简化）
- 真实 Claude API 调用（前期 AI 占比少，规则映射 + 静态文案够用）
- 金蝶（会计端）三表对账（拿到金蝶导出格式后再扩展）
- 跨月对比 / 趋势图 / 多店铺看板
- 协作工作流 / 标记备注

---

## 设计文档

- 设计：`docs/superpowers/specs/2026-05-01-ai-reconciliation-prototype-design.md`
- 实施计划：`docs/superpowers/plans/2026-05-01-ai-reconciliation-prototype.md`
