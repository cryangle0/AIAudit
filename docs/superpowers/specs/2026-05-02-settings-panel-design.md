# 设置面板设计文档

- **日期**：2026-05-02
- **状态**：已设计 / 待实现
- **范围**：把侧边栏底部的"设置"按钮接入一个真正承载业务配置的面板，覆盖平台、店铺、数据源（聚水潭/金蝶）、对账规则四类。
- **阶段定位**：UI 演示。所有配置实时持久化到 localStorage，但**不参与对账核心计算**。原型先把"配得了什么"展现出来。

---

## 1. 背景与目标

当前 `Sidebar.jsx` 底部的"设置"按钮没有 onClick 处理，点击无反应。第一次接入时我用了一个通用占位弹窗，但与本项目业务无关——本项目的核心是 **多平台电商利润对账**，真正值得"设置"的对象是：

- **平台**：7 个平台（抖音/淘宝/快手/拼多多/小红书/视频号/微信小店）写死在 `src/platforms/*`，目前没有"启用/禁用"的开关。
- **店铺**：每个平台只有 1 个 mock 店铺，写死在 `MOCK_SHOPS`，无 CRUD 入口。
- **聚水潭**：解析逻辑在 `src/core/jushuitan.js`，列名硬编码，无配置入口。
- **金蝶**：项目目标里提了，但代码尚未接入。
- **对账规则**：分桶阈值、退款单是否计入等规则写死在 `src/core/reconcile.js`。

本设计的目标是把这些"被写死的可调对象"提到 UI 层，让用户**看得见、能调整**，并把调整结果落到 localStorage。是否真正影响对账计算，留给后续阶段。

---

## 2. 状态架构

### 2.1 选型

候选方案：

| 方案 | 默认数据 | 用户改动 | 复杂度 |
|---|---|---|---|
| **A. 设置独立存 localStorage**（采用） | 只读、不可改 | 存到独立的 `customShops` / `enabledPlatforms` | ⭐ |
| B. 设置改写 store 里的店铺/平台 | 启动时拷贝到 store，可改 | 跟默认混在一起 | ⭐⭐⭐ |
| C. 默认数据可"隐藏"不可"删除" | 只读但有 hidden 标记 | 与默认分离 + 隐藏标记 | ⭐⭐ |

**采用 A**，理由：

- 默认平台/店铺保持原样不被污染。
- settings 只存"用户偏好/差异"，重置容易（清一个 key）。
- 默认 mock 店铺不允许删；点删除按钮提示"默认演示数据不可删"，避免破坏 demo。
- 如未来要把平台 adapter 完全数据化，再迁到方案 B/C 也容易。

### 2.2 数据形状

存储 key：`ai-reconcile.settings`

```js
{
  enabledPlatforms: ['douyin', 'taobao', 'kuaishou', 'pinduoduo',
                     'xiaohongshu', 'shipinhao', 'weixin_xiaodian'],

  customShops: {
    // 'taobao': [{ id: 'tb-custom-1', name: '我的淘宝小店' }],
  },

  dataSource: {
    primary: 'jushuitan',           // 'jushuitan' | 'kingdee' | 'manual'
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
    kingdee: { apiUrl: '', token: '' }    // UI 标"开发中"
  },

  reconcileRules: {
    matchedThreshold: 0.01,         // ≤ 这个绝对值算"相符"（元）
    minorThreshold: 5,              // ≤ 这个绝对值算"偏差"
    severeThreshold: 50,            // > 上述视为"严重"
    includeRefunds: true,
    deductShipping: false,
    matchStrategy: 'orderId'        // 'orderId' | 'skuTime' | 'auto'
  }
}
```

读写：通过新 hook `useSettings()` 包装 `useState` + `useEffect` 同步 localStorage。返回 `[settings, updateSettings, resetSettings]`。

### 2.3 关于不影响对账逻辑

- 这份 settings 在原型阶段**只影响 UI**：
  - `enabledPlatforms` → 影响侧边栏显示哪些平台
  - `customShops` → 影响侧边栏每个平台底下的店铺列表
  - `dataSource` / `reconcileRules` → 仅在设置面板里展示，**不读到 reconcile 逻辑里**
- 在 `RulesPanel` 顶部放醒目 banner："演示阶段，规则暂不生效"

---

## 3. 弹窗布局

```
Modal (width: 720px, maxHeight: 80vh)
└─ rec-settings-shell                    flex row
   ├─ rec-settings-nav (左侧 180px)
   │  ├─ "平台"
   │  ├─ "店铺"
   │  ├─ "数据源"
   │  └─ "对账规则"
   ├─ rec-settings-content (右侧 flex)
   │  └─ {根据 active tab 渲染对应 panel}
   └─ rec-settings-footer
      ├─ [恢复默认]    全局 reset，需二次确认
      └─ [关闭]
```

- 默认 active tab：平台
- 弹窗复用现有 `<Modal>` 组件，宽度撑到 720px
- 所有改动**实时生效 + 实时存 localStorage**，无需"保存"按钮

---

## 4. 四个面板

### 4.1 平台管理 PlatformsPanel

```
┌────────────────────────────────────────────────┐
│ 7 个平台                                        │
├────────────────────────────────────────────────┤
│ ☑ 抖音       [真实]   uploadSlots: 2           │
│ ☑ 淘宝/天猫  [演示]   uploadSlots: 2           │
│ ☑ 快手       [演示]   uploadSlots: 2           │
│ ☑ 拼多多     [演示]   uploadSlots: 2           │
│ ☑ 小红书     [演示]   uploadSlots: 2           │
│ ☑ 视频号小店 [演示]   uploadSlots: 2           │
│ ☐ 微信小店   [演示]   uploadSlots: 2           │
│                                                │
│ 注：禁用的平台不会出现在侧边栏                 │
└────────────────────────────────────────────────┘
```

行为：
- 复选框点击 → 切换 `enabledPlatforms` 中的对应 id
- **强约束**：不能取消最后一个启用平台（按钮禁用 + 提示"至少保留一个平台"）
- 状态徽标 / uploadSlots 数量为只读说明

### 4.2 店铺管理 ShopsPanel

```
┌─────────────────────────────────────────────────────────┐
│ 平台筛选：[全部 ▼]                  [+ 新增店铺]         │
├─────────────────────────────────────────────────────────┤
│ 雪中飞德煌童装专卖店    抖音    [默认]   [-]            │
│ 某童装旗舰店           淘宝    [默认]   [-]            │
│ 我的淘宝小店           淘宝    [自定义] [✎] [🗑]        │
│ ...                                                     │
└─────────────────────────────────────────────────────────┘
```

行为：
- 列表 = `[...MOCK_SHOPS[pid].map(s => ({...s, isDefault: true})), ...customShops[pid]]`
- 默认 mock 店铺：`[默认]` 标签 + 编辑/删除按钮置灰，hover tooltip "默认演示数据不可修改"
- 自定义店铺：`[自定义]` 标签 + 编辑、删除可用
- "+ 新增店铺"：弹小弹窗 `<ShopEditDialog>`，输入店铺名 + 选所属平台（select），保存后写入 `customShops`
- "编辑"：行内编辑（点 ✎ → 把店铺名变成 input，回车/失焦保存；ESC 取消）
- "删除"：复用现有 `<Modal>` 弹确认对话框（与"退出登录"确认风格一致），不用原生 `confirm()`

### 4.3 数据源设置 DataSourcePanel

```
┌─────────────────────────────────────────────────────────┐
│ 主数据源： ◉ 聚水潭   ○ 金蝶   ○ 手动 xlsx              │
│                                                         │
│ ── 聚水潭配置 ─────────────────────────────────────────│
│   API 地址：  [https://api.jushuitan.com/...        ] │
│   Token：    [••••••••••••••••              ] [显示]  │
│   状态：     ⚪ 未连接   [测试连接]                     │
│                                                         │
│   列名映射                                              │
│   订单号 →    [订单编号                            ]   │
│   SKU →      [商品编码                            ]    │
│   成本 →      [商品成本                            ]   │
│   ...                                                   │
│                                                         │
│ ── 金蝶配置（开发中）──────────────────────────────────│
│   [整块灰显，标 "即将上线"]                            │
└─────────────────────────────────────────────────────────┘
```

行为：
- 主数据源 radio：选中哪个，就展开哪个区块的详细配置
- "测试连接"：点击 → 按钮变 "测试中..." 1 秒 → 显示 ✓ "连接成功（演示）"。不真发请求。
- 列名映射：左边写死键，右边 input；输入直接写 `dataSource.jushuitan.columnMap[key]`
- 金蝶区块：放置占位 input，整块用半透明 + "开发中" 角标

### 4.4 对账规则 RulesPanel

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ 演示阶段，本面板规则暂不参与实际对账计算              │
├─────────────────────────────────────────────────────────┤
│ 利润差异分桶                                             │
│   相符（绝对值≤）  [0.01] 元                           │
│   偏差（绝对值≤）  [5]    元                           │
│   严重偏差         > 上述值                             │
│                                                         │
│ 数据范围                                                 │
│   ☑ 包含退款单                                          │
│   ☐ 抵扣运费                                            │
│                                                         │
│ 匹配策略                                                 │
│   ◉ 订单号优先（推荐）                                  │
│   ○ SKU + 时间窗                                        │
│   ○ 自动选择                                            │
└─────────────────────────────────────────────────────────┘
```

行为：
- 顶部黄色 banner 醒目提示"演示阶段不生效"
- 三个数字 input + 两个 toggle + 一个 radio 组，全部直接写 `reconcileRules`
- 阈值之间有大小约束（matched < minor < severe），破坏约束时输入框红边+提示，但不阻止保存（演示阶段）

---

## 5. 侧边栏接入

`Sidebar.jsx`：

```js
// 旧
{PLATFORMS.map(p => ...)}
const shops = MOCK_SHOPS[p.id] || []

// 新
const visiblePlatforms = PLATFORMS.filter(p =>
  settings.enabledPlatforms.includes(p.id)
)
{visiblePlatforms.map(p => ...)}
const shops = [
  ...(MOCK_SHOPS[p.id] || []),
  ...(settings.customShops[p.id] || [])
]
```

`App.jsx` 加 effect 处理边界：
- 当前选中的 `platformId` 不在 `enabledPlatforms` → 切到第一个启用平台
- 当前选中的 `shopId` 不在该平台的 shops 列表里 → 切到该平台第一个店铺

`Sidebar.jsx` 把"设置"按钮 onClick 接到 `setSettingsOpen(true)`，弹窗换成 `<SettingsModal>`。

---

## 6. 文件结构

```
src/
├── hooks/
│   └── useSettings.js                       新增
├── core/
│   └── settingsDefaults.js                  新增：默认 settings 常量
└── components/
    ├── Sidebar.jsx                           改：读 settings 过滤
    ├── SettingsModal.jsx                     新增：壳（左 nav + 右 content）
    └── settings/                             新增子目录
        ├── PlatformsPanel.jsx
        ├── ShopsPanel.jsx
        ├── ShopEditDialog.jsx
        ├── DataSourcePanel.jsx
        ├── RulesPanel.jsx
        └── settings.css
```

`App.jsx` 改动：
- `const [settings, updateSettings, resetSettings] = useSettings()`
- `<Sidebar>` 接收 `settings`（只读消费：过滤平台/店铺）
- `<SettingsModal>` 接收 `settings, updateSettings, resetSettings`（读写）

---

## 7. 不做的事（YAGNI）

- 不做"导入/导出 settings json"
- 不做权限/多用户
- 不连接真实 API（"测试连接"假装成功）
- 不做 customShops 排序、拖拽
- 不做平台 uploadSlots 字段映射的可视化编辑
- settings 里的对账规则**不接入** `core/reconcile.js`

---

## 8. 验收标准

- 侧边栏底部"设置"按钮点击弹出新面板，左侧 4 个 tab 切换流畅
- 平台管理：勾掉某个平台 → 该平台立刻从侧边栏消失；勾回 → 恢复显示
- 店铺管理：新增一个淘宝店铺 → 立刻出现在侧边栏淘宝下；编辑/删除立即生效；默认店铺无法删除
- 数据源/对账规则：调整后关闭弹窗、刷新页面、再次打开，所有值保持
- 全局"恢复默认"：二次确认后清空 settings、所有面板回到默认值
- 关闭面板：ESC / 点遮罩 / 点关闭按钮 都能关
