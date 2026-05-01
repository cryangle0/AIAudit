# AI对账 原型 — 设计文档

**日期**：2026-05-01
**状态**：设计已确认，待实施计划
**业务领域**：童装电商多平台店铺销售/利润对账

---

## 1. 背景与目标

童装业务在多个自媒体/电商平台（抖音、快手、淘宝/天猫、京东、拼多多、小红书、视频号、微信小店等）经营店铺。每月需要把**平台账单**与**内部 ERP（聚水潭）**和**会计系统（金蝶）**核对，确保：

1. 每笔订单平台到账金额 = 聚水潭记录金额
2. 真实利润（平台净入账 − 实发成本）≈ 聚水潭"销售毛利"
3. 月度公共扣费（权益保险、提现费、偏远物流费等）有清晰登记

**原型目的**：搭建一个**纯前端、上传驱动**的最小可用工具，覆盖"平台↔聚水潭"双表对账与利润核对，并为后续接入金蝶/真实 API/多平台数据做好架构预留。

**核心定位**
- **精准优先**：对账业务对金额准确性要求极高，匹配/计算逻辑全部确定性程序逻辑，**前期 AI 占比少**，仅做轻量辅助（差异原因一句话提示）
- **多平台预留**：架构上把"平台"作为一等公民，但首版只接入抖音真实数据，其他平台 mock 灰显

---

## 2. 数据现实（基于示例 `抖音店铺对账数据.xlsx`）

样例 5 张表是一条数据链：

```
[抖音资金账单] 3381条平台原始流水（订单+月度公共扣费 599条）
       │ 按订单号聚合
       ▼
[抖音账单汇总] 2488订单 × (销售收入 / 已核对收入 / 差异) ← 示例为对账完成态
       ▲ 按订单号交叉
[聚水潭导出]  2581行 × 86列 (实发金额/实发成本/销售毛利/退货金额/抖音资金账单金额)
       │ 按款式聚合
       ▼
[销售汇总]    33款 × (件数/金额) 总计 2482件 / ¥438,770.18
```

**从数据中读出的事实**
- 抖音销售收入合计 ¥877,540 = 已核对 ¥877,540（含退款负单），聚水潭"金额"列合计 ¥438,770（退款单与销售单已抵消）
- 78 单出现"聚水潭金额翻倍"——同一订单因售后/换货被记多行，最后一列"抖音资金账单金额"被重复累加
- 599 笔订单号为空的资金流水：权益保险 588、提现 9、偏远物流费 15 等月度公共扣费
- 平台单笔扣费典型值：`平台服务费` 约售价的 5%（如 −8.95 / 179）

**业务规则（原型采用）**
- 利润 = 平台净入账（动账金额累加）− 聚水潭实发成本
- **不分摊**月度公共扣费到单笔订单，而是另起一块列出
- 金额比较一律 epsilon = 0.01

---

## 3. 整体架构

### 3.1 技术栈

- **React 19 + Vite 8**（与 `E:\angsa\dailaixi\opencut` 完全对齐，复用其 ESLint 配置与视觉风格）
- **xlsx (SheetJS)** — 浏览器侧 .xlsx 解析，零后端
- **lucide-react** — 图标（opencut 已用）
- **不引入** UI 组件库；CSS 沿用 opencut 的 module 化方式
- **状态层**：单内存 store（useReducer 或 zustand 二选一，实施阶段定）

### 3.2 目录结构

```
src/
  App.jsx                    路由壳：LoginPage → Workspace
  components/
    Sidebar.jsx              平台→店铺→月份 树
    TopBar.jsx               标题 + Tab切换 + 导出/帮助
    UploadZone.jsx           多槽位上传区（按平台动态生成）
    ReconcileTab.jsx         对账明细 Tab
    SkuProfitTab.jsx         款式利润榜 Tab
    KpiCards.jsx             5 张 KPI 卡
    DiffTable.jsx            差异列表（核心）
    DiffDrawer.jsx           差异行详情抽屉（流水+聚水潭原行）
    MonthlyExpensePanel.jsx  月度公共扣费折叠区
    LoginPage.jsx            复用 opencut
  platforms/                 ★ 平台适配器
    index.js                 registry: { douyin: {name, slots, parser, status} }
    douyin.js                抖音解析（资金账单 + 账单汇总）
    taobao.js                占位 status:'planned'
    kuaishou.js              占位
    pinduoduo.js             占位
    xiaohongshu.js           占位
    shipinhao.js             占位
    weixin_xiaodian.js       占位
  core/
    jushuitan.js             聚水潭统一解析（多平台共用）
    reconcile.js             对账引擎（确定性逻辑）
    profit.js                利润计算公式
    constants.js             阈值常量（epsilon、利润异常阈值等）
  hooks/
    useReconcileStore.js     单 store
  styles/
    *.css
docs/superpowers/specs/
  2026-05-01-ai-reconciliation-prototype-design.md  ← 本文档
```

### 3.3 关键架构决策

- **纯前端原型**：xlsx 文件由 SheetJS 解析，全部留在浏览器内存里，**不持久化**。刷新即丢——这是原型阶段刻意的简化。
- **Adapter 模式**：每个平台一个 `parse(file) → { orders, fundFlow, monthlyExpense }` 标准产出。聚水潭是公共下游解析，不分平台。
- **登录页**：复用 opencut 的 `LoginPage`（手机号验证码假登录），保持视觉一致；后续可换 SSO，但不在本原型范围。

---

## 4. 导航与界面布局

### 4.1 三段式骨架

```
┌──────────┬──────────────────────────────────────────────┐
│ Sidebar  │ TopBar                                        │
│ 240px    ├──────────────────────────────────────────────┤
│ 深色     │ MainContent                                   │
│          │   Tab 1: 对账明细 / Tab 2: 款式利润榜          │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 4.2 Sidebar — 平台→店铺→月份

```
🏷️ AI对账
─────────────
▼ 抖音
  • 雪中飞德煌                ← 当前选中（高亮）
▶ 淘宝/天猫 (灰)              ← status:'planned'，不可点
▶ 快手 (灰)
▶ 拼多多 (灰)
▶ 小红书 (灰)
▶ 视频号 (灰)
▶ 微信小店 (灰)
─────────────
📅 月份: 2026-01 ▾
─────────────
⚙️ 设置 / 🌙 暗色 / 🚪 退出
```

### 4.3 TopBar

```
抖音 · 雪中飞德煌童装专卖店 · 2026-01      [导出] [帮助] [👤]
─────────────────────────────────────────────────────────
[对账明细]  [款式利润榜]
```

### 4.4 Tab 1「对账明细」四段一屏

1. **上传槽位**（已上传则折叠为绿色 chip "✓ 抖音资金账单 3381条"）
   - 抖音平台 3 个槽位：`抖音资金账单.xlsx`（必需）/ `抖音账单汇总.xlsx`（可选，未传则程序从资金账单聚合）/ `聚水潭导出.xlsx`（必需）
   - 「开始对账」按钮，必需文件齐全才亮
2. **KPI 卡片** 5 张一行：总订单 / 营收 / 成本 / 真实利润 / 差异单数
   - 营收口径：平台账单口径（含退款负单），= sum(diffRows[*].saleRevenue) ≈ ¥877k
   - 成本/真实利润：基于 sum(diffRows[*].shippedCost) 与 sum(diffRows[*].netSettled)
   - 卡片上方一行小字注明 "数据口径：抖音平台账单"
3. **差异列表**（核心）—— 见 §5
4. **月度公共扣费**（折叠面板，默认收起）
   - 权益保险 N 笔 −¥X / 提现费 N 笔 −¥X / 偏远物流费 N 笔 −¥X

### 4.5 Tab 2「款式利润榜」

按聚水潭 `款式编码` 聚合：

```
排序: [按毛利↓] [按销量↓] [按毛利率↓]   显示: [全部] [盈] [亏]
─────────────────────────────────────────────────────
款式编码          | 件数 | 营收  | 成本  | 真实毛利| 毛利率| 微缩柱
X2501326322FXT   | 2280 | 407K  | 198K  | +209K  | 51.4% | ▇▇▇▇▇
X250138238FXT    |   54 | 10.6K | 5.7K  | +4.9K  | 46.2% | ▇▇▇
…
```

### 4.6 交互规则

- 未上传文件时，Tab 1 中段只显示大号上传引导，KPI/差异列表/月度扣费整体隐藏
- 「开始对账」点击后 0.5–2 秒进度条 → 一次性渲染所有结果
- 切换平台/店铺/月份 → Workspace 状态重置回到上传引导态
- AI 提示 💬 仅出现在差异≠0 的行；点开是一句话解释
- 「款式利润榜」Tab 在未对账时点开，显示"先在对账明细上传文件"引导

---

## 5. 数据流与对账引擎

### 5.1 数据流

```
[资金账单.xlsx]  [账单汇总.xlsx(可选)]  [聚水潭.xlsx]
       │                  │                   │
       ▼                  ▼                   ▼
   platforms/douyin.parse                core/jushuitan.parse
       │ {orders, fundFlow, monthlyExpense}   │ {orders}
       └──────────────────┬──────────────────┘
                          ▼
                  core/reconcile.run
                          │
                          ▼
        { kpi, diffRows[], skuStats[], monthlyExpense[] }
                          │
                          ▼
                  UI 状态（单 store）
```

### 5.2 数据形状

```js
// 平台订单（按订单号聚合后）
PlatformOrder = {
  orderId,             // 字符串，已 strip 前导 '
  saleRevenue,         // 销售收入累加（含负值）
  netSettled,          // 动账金额累加（净入账，平台扣完费）
  platformFee,         // 平台服务费累加（通常负值）
  commission,          // 佣金累加
  refundAmount,        // 订单退款累加
  promoFee,            // 站外推广费累加
  flows: RawFlow[],    // 原始流水行（用于详情抽屉）
}

JstOrder = {
  orderId,             // 原始线上订单号
  styleCode,           // 款式编码 X2501326322FXT
  productName,         // 商品简称
  shippedAmount,       // 实发金额累加
  shippedCost,         // 实发成本累加
  grossProfit,         // 销售毛利累加（聚水潭已算）
  refundedAmount,      // 当期实退金额累加
  jstBillAmountSum,    // sum(抖音资金账单金额) — 用于检测翻倍
  rowCount,            // 同订单聚水潭行数
  rows: RawRow[],
}

DiffRow = {
  orderId, styleCode, productName,
  saleRevenue, netSettled,    // 平台
  shippedCost,                 // 聚水潭成本
  realProfit,                  // = netSettled - shippedCost
  systemProfit,                // 聚水潭销售毛利
  profitDiff,                  // realProfit - systemProfit
  bucket,                      // 'matched' | 'duplicated' | 'missing_in_jst'
                               // | 'missing_in_platform' | 'profit_anomaly'
  aiHint?,                     // 仅有差异时
  platformFlows, jstRows,      // 抽屉展开
}

KPI = {
  totalOrders, revenue, cost, realProfit, systemProfit,
  diffCount, duplicatedCount, missingCount, anomalyCount,
}

SkuStat = { styleCode, productName, qty, revenue, cost, profit, profitRate }

MonthlyExpense = {
  scene,               // 权益保险 / 提现 / 偏远地区物流服务 / ...
  count,
  totalAmount,
  samples: [{ time, amount, memo }],
}
```

### 5.3 对账引擎规则（`core/reconcile.js`）

```
run(platformResult, jstResult)：

step1  按 orderId 聚合 platform 行 → platformOrderMap
step2  按 orderId 聚合 jst 行       → jstOrderMap
step3  全键并集遍历，每订单产出 DiffRow，分桶：

   规则A — matched（一致）
     |saleRevenue - jstShippedAmount| < 0.01
     AND |netSettled - jstBillAmountSum| < 0.01

   规则B — duplicated（翻倍）
     同订单 jst 多行（rowCount ≥ 2）
     且 jstBillAmountSum = saleRevenue × N (N≥2)
     → 按行数归一化金额参与利润计算，并打 duplicated 标
     （样例数据中 78 单属于此情况）

   规则C — missing
     platform 有 / jst 无 → 'missing_in_jst'
     jst 有 / platform 无 → 'missing_in_platform'

   规则D — profit_anomaly（利润异常）
     已落在 matched/duplicated 后，进一步检查：
     |realProfit - systemProfit| > max(¥10, systemProfit × 5%)
     则升级标为 'profit_anomaly'
     （阈值常量在 core/constants.js，便于后续调整）

step4  按 styleCode 聚合 jst → SkuStat[]
step5  从 platform.fundFlow 中筛 orderId == null 的行
       → 按"动账场景"分桶 → MonthlyExpense[]
step6  汇总 KPI

输出: { kpi, diffRows, skuStats, monthlyExpense }
```

### 5.4 实现注意

- **订单号 strip**：聚水潭/抖音里订单号都是 `'6923...` 形式，解析时统一去掉前导单引号
- **负数订单（退款单）**：当作正常订单参与匹配，规则A同样适用
- **金额比较 epsilon = 0.01**
- **款式编码**：抖音订单里没有，DiffRow.styleCode 取自聚水潭；missing_in_jst 单的 styleCode 留空
- **性能**：2500 单数据量纯 JS Map 查找够用，无需 Web Worker；差异列表 5000 行内不需虚拟滚动

### 5.5 AI 介入点（极小）

`core/reconcile.js` 跑完后，对每条非 matched 的 DiffRow 生成一句话提示。**前期不调真实 AI**——用 bucket → 文案的规则映射：

```js
'duplicated'          → "聚水潭同订单多行（售后）金额累计为平台 N 倍，需人工确认"
'missing_in_jst'      → "平台有此单，聚水潭未导出，可能未发货或导出条件遗漏"
'missing_in_platform' → "聚水潭有此单，平台账单未结算，可能跨月或在途"
'profit_anomaly'      → "毛利偏离系统记录 ¥X，请核对成本价或退款金额"
```

后期接 Claude API 时，把这一段换成真实推理（输出原因+建议动作），其余逻辑不动。

---

## 6. 边界、错误与空态

### 6.1 上传阶段

| 情况 | 行为 |
|---|---|
| 拖拽非 .xlsx | toast 红色 "仅支持 .xlsx 文件" |
| Sheet 名/列名对不上 | 显示具体缺失："抖音资金账单 缺少必需列：动账金额、订单号" + 取消上传 |
| 「抖音账单汇总」未上传 | 不阻塞，程序自己从资金账单聚合 |
| 「资金账单」或「聚水潭」缺一 | 「开始对账」按钮保持灰，悬停提示缺什么 |
| 同一槽位重传 | 直接覆盖，无确认 |
| 文件超过 ~50MB | 警告"文件较大，解析可能需要几秒"，但仍解析 |

### 6.2 解析阶段

- 单元格 `'6923...` 单引号前缀统一 strip
- 空字符串 / `None` / `'-'` → 0（金额列）或 空（文本列）
- 时间列 SheetJS 默认转 Date，失败保留字符串
- 解析异常的单行：跳过 + 计数，顶部黄条提示 "12 行解析失败，已跳过"

### 6.3 对账阶段

- 进度条 4 段：解析平台账单 → 解析聚水潭 → 匹配中 → 汇总指标
- 任一阶段抛错 → 整体回滚到上传态，红条置顶 + 折叠堆栈
- 不做"部分成功"

### 6.4 空态

| 场景 | UI |
|---|---|
| 首次进 Workspace（未上传） | 大号居中"上传你的对账文件 →" + 3 个空槽位 |
| 「款式利润榜」未对账时点开 | "先在「对账明细」上传文件" |
| 全部 matched | 绿色横幅 "🎉 本月所有订单完全对齐"，差异表收起 |
| 切换到 status:'planned' 平台 | "该平台正在接入中" + 已规划平台列表 |

### 6.5 状态边界

- 刷新页面 → 内存清空 → 回到登录页或上传引导
- 浏览器后退 → 同上
- 多文件上传时一个失败 → 其它已上传保留，仅失败那个清空

---

## 7. 范围 / 不做的（YAGNI 边界）

| 项 | 不做的原因 | 后续阶段 |
|---|---|---|
| 后端 / 持久化 | 原型纯前端，刷新即丢；接后端时数据流形状不变 | 接入真实 API |
| 真实 Claude API 调用 | 前期 AI 占比少，规则映射 + mock 文案够用 | AI 增强阶段 |
| 多平台真实数据接入 | 当前只有抖音 1 份样例 | 拿到淘宝/快手等账单后逐个加 adapter |
| 月度公共扣费按订单分摊 | 已确认"不分摊"，另起一块列出即可 | 若财务侧要求分摊再加 |
| 金蝶（会计端）三表对账 | 原型聚焦 平台↔聚水潭 双表；金蝶留位但不接 | 拿到金蝶导出格式后扩展 |
| 跨月对比 / 趋势图 | 单店单月闭环够交付价值 | 看板阶段 |
| 多店铺看板首页 | Sidebar 已体现扩展性，看板是另一类工作流 | 业务量上来后 |
| 标记 / 备注 / 协作 | 差异列表暂不支持人工备注、状态流转、多人协作 | 工作流阶段 |
| 导出 .xlsx 报表 | 原型先支持「导出 CSV」（浏览器侧 1 行实现） | 真正交付时换 xlsx |
| 路由 / URL 同步状态 | 全是单 store 内存态；地址栏不动 | 接后端时统一规划 |
| 国际化 | 全中文 UI，硬编码 | — |
| 移动端响应式 | 桌面优先，最小宽度 1280 | — |
| 用户/权限管理 | 复用 opencut 假登录页 | 真实部署接 SSO |

### 7.1 测试策略

- **引擎层**：vitest 5–8 个用例，用精简 mock 数据驱动
  - matched / duplicated（取真实 78 单代表）/ missing 双向 / 负数退款单 / 利润异常阈值
- **解析层**：手测，依赖 SheetJS 自身稳定性
- **UI 层**：原型阶段不写测试

### 7.2 性能目标

- 2500 单 + 3400 流水 + 86 列聚水潭：**端到端解析+对账 < 3 秒**（普通笔记本）

---

## 8. 验收清单

- [ ] 用 `抖音店铺对账数据.xlsx` 中的资金账单 + 聚水潭，能完整跑通对账流程
- [ ] **Tab 1 KPI**（平台口径）：总订单 ≈ 2488、营收 ≈ ¥877,540（含退款负单，与抖音账单汇总一致）
- [ ] **Tab 2 款式利润榜**（聚水潭口径）：总计件数 ≈ 2482、营收 ≈ ¥438,770（退款已抵销，与「销售汇总」一致）
- [ ] 两个 Tab 的口径差异在 UI 上有明确说明（KPI 卡上方一行小字标注口径来源）
- [ ] 差异列表能识别出约 78 单 duplicated 桶，且 AI 一句话提示正确
- [ ] 月度公共扣费板块能列出权益保险 588 笔、提现 9 笔、偏远物流 15 笔
- [ ] 切换到非抖音平台显示"接入中"占位
- [ ] 视觉风格与 opencut 一致（侧边栏深色 / 顶栏 / 卡片圆角等）

---

## 9. 后续路线（不在本原型范围）

1. **金蝶接入**：扩展为 平台↔聚水潭↔金蝶 三表对账
2. **真实平台 API**：替换 xlsx 上传为 OpenAPI 拉取
3. **AI 增强**：接入 Claude，对差异给出推理 + 建议动作；自然语言查询
4. **多店铺看板**：跨店铺/跨月趋势分析
5. **协作工作流**：差异标注、负责人指派、状态流转
