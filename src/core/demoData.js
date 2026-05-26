// 演示数据 — 严格按客户《系统初稿模板5.22》Excel 中真实数据搭骨架
// 目的：当用户没有上传真实账单或归集费用时，报表也能展示典型形态

// 账单汇总表 — 4 个店铺的月度账单收支
// 字段顺序与 Excel 一致：平台/店铺/月初余额/收入项(4)/支出项(5)/月末余额
export const DEMO_BILL_SUMMARY = [
  { platform: '抖音', shop: '雪中飞德煌童装专卖店',
    openBalance: 12500.00,
    orderIncome: 438770.18, huabei: 28350.00, techRefund: 1820.50, incomeTotal: 468940.68,
    platformFee: 35920.00, commission: 13105.40, tmallDeposit: 0, transfer: 0, withdraw: 380000.00, expenseTotal: 429025.40,
    endBalance: 52415.28 },
  { platform: '淘宝/天猫', shop: '天猫旗舰店',
    openBalance: 28000.00,
    orderIncome: 693520.63, huabei: 15280.00, techRefund: 3420.00, incomeTotal: 712220.63,
    platformFee: 35920.00, commission: 8050.00, tmallDeposit: 5000.00, transfer: 12000.00, withdraw: 620000.00, expenseTotal: 680970.00,
    endBalance: 59250.63 },
  { platform: '快手', shop: '快手童装店',
    openBalance: 8500.00,
    orderIncome: 156320.00, huabei: 0, techRefund: 0, incomeTotal: 156320.00,
    platformFee: 9379.20, commission: 4690.00, tmallDeposit: 0, transfer: 0, withdraw: 130000.00, expenseTotal: 144069.20,
    endBalance: 20750.80 },
  { platform: '拼多多', shop: '拼多多专卖店',
    openBalance: 5200.00,
    orderIncome: 393520.63, huabei: 0, techRefund: 1500.00, incomeTotal: 395020.63,
    platformFee: 27125.00, commission: 9838.02, tmallDeposit: 0, transfer: 0, withdraw: 350000.00, expenseTotal: 386963.02,
    endBalance: 13257.61 }
]

// 账单明细表 — 订单级
export const DEMO_BILL_DETAIL = [
  { platform: '抖音', shop: '雪中飞德煌童装专卖店', orderId: '6950156655091651754', styleCode: 'X2501326322FXT',
    orderIncome: 179.00, huabei: 0, techRefund: 0, incomeTotal: 179.00,
    platformFee: 8.95, commission: 0, tmallDeposit: 0, transfer: 0, withdraw: 0, expenseTotal: 8.95 },
  { platform: '抖音', shop: '雪中飞德煌童装专卖店', orderId: '6950291725161993463', styleCode: 'X2501326322FXT',
    orderIncome: 179.00, huabei: 0, techRefund: 0, incomeTotal: 179.00,
    platformFee: 8.95, commission: 0, tmallDeposit: 0, transfer: 0, withdraw: 0, expenseTotal: 8.95 },
  { platform: '淘宝/天猫', shop: '天猫旗舰店', orderId: 'TM2025010001', styleCode: 'X250138238FXT',
    orderIncome: 199.00, huabei: 199.00, techRefund: 0, incomeTotal: 398.00,
    platformFee: 9.95, commission: 5.97, tmallDeposit: 2.00, transfer: 0, withdraw: 0, expenseTotal: 17.92 },
  { platform: '淘宝/天猫', shop: '天猫旗舰店', orderId: 'TM2025010002', styleCode: 'X2501326322FXT',
    orderIncome: 179.00, huabei: 0, techRefund: 0, incomeTotal: 179.00,
    platformFee: 8.95, commission: 5.37, tmallDeposit: 1.79, transfer: 0, withdraw: 0, expenseTotal: 16.11 },
  { platform: '快手', shop: '快手童装店', orderId: 'KS2025010001', styleCode: 'X2509329934FXT',
    orderIncome: 69.90, huabei: 0, techRefund: 0, incomeTotal: 69.90,
    platformFee: 4.19, commission: 2.10, tmallDeposit: 0, transfer: 0, withdraw: 0, expenseTotal: 6.29 },
  { platform: '拼多多', shop: '拼多多专卖店', orderId: 'PDD2025010001', styleCode: 'X2509329934FXT',
    orderIncome: 89.00, huabei: 0, techRefund: 0, incomeTotal: 89.00,
    platformFee: 6.23, commission: 2.23, tmallDeposit: 0, transfer: 0, withdraw: 0, expenseTotal: 8.46 }
]

// 店铺利润表 — 严格按 Excel 5月示例的 4 个店铺
export const DEMO_SHOP_PROFIT = [
  buildDemoShopRow('天猫旗舰店', 693520.63, 305353.53, 388167.10, 305353.53, 2245, 78575, 6735, 1347, 35920),
  buildDemoShopRow('唯品会店', 1693520.63, 1305353.53, 388167.10, 1305353.53, 9598, 335930, 28794, 5758.8, 153568),
  buildDemoShopRow('拼多多专卖店', 393520.63, 105353.53, 288167.10, 105353.53, 775, 27125, 2325, 465, 12400),
  buildDemoShopRow('抖音雪中飞专卖店', 593520.63, 305353.53, 288167.10, 305353.53, 2245, 78575, 6735, 1347, 35920)
]

function buildDemoShopRow(shopName, revenue, noAfterSale, refund, netRevenue,
  shippedQty, productCost, shippingCost, platformFee, subsidy) {
  const costTotal = productCost + shippingCost
  const feeTotal = platformFee + subsidy
  const profit = netRevenue - costTotal - feeTotal
  return {
    shopName, revenue, noAfterSale, refund, netRevenue,
    shippedQty, returnedQty: 0,
    productCost, tagCost: 0, accessoryCost: 0, shippingCost, costTotal,
    platformFee, commission: 0, promoFee: 0, insurance: 0, redPacket: 0, subsidy, feeTotal,
    profit,
    profitRate: netRevenue > 0 ? profit / netRevenue : 0,
    returnRate: 0,
    confirmRate: revenue > 0 ? netRevenue / revenue : 0
  }
}

// 商品利润表 — 严格按 Excel 模板 12 行示例
export const DEMO_PRODUCT_PROFIT = [
  { shopName: '雪中飞德煌童装专卖店', orderId: '2022-1-1', styleCode: '栾银银', productCode: 'A3', productName: '名称1', category: '100G', qty: 1114, price: 4, revenue: 4456, cost: 741, tagFee: 0, accessoryFee: 0, profit: 3715, profitRate: 0.834, memo: '' },
  { shopName: '雪中飞德煌童装专卖店', orderId: '2022-2-2', styleCode: '张璐璐', productCode: 'A4', productName: '名称2', category: '60支/盒', qty: 120, price: 6, revenue: 720, cost: 647, tagFee: 0, accessoryFee: 0, profit: 73, profitRate: 0.101, memo: '' },
  { shopName: '雪中飞德煌童装专卖店', orderId: '2022-3-3', styleCode: '张璐璐', productCode: 'A5', productName: '名称3', category: '500ML', qty: 60, price: 16, revenue: 960, cost: 820, tagFee: 0, accessoryFee: 0, profit: 140, profitRate: 0.146, memo: '' },
  { shopName: '雪中飞德煌童装专卖店', orderId: '2022-4-4', styleCode: '宋立成', productCode: 'A6', productName: '名称4', category: '100 pers', qty: 1980, price: 2, revenue: 3960, cost: 1104, tagFee: 0, accessoryFee: 0, profit: 2856, profitRate: 0.721, memo: '' },
  { shopName: '雪中飞德煌童装专卖店', orderId: '2022-6-5', styleCode: '宋立成', productCode: 'A9', productName: '名称5', category: '5 ml', qty: 598, price: 2, revenue: 1196, cost: 933, tagFee: 0, accessoryFee: 0, profit: 263, profitRate: 0.220, memo: '' },
  { shopName: '雪中飞德煌童装专卖店', orderId: '2022-7-6', styleCode: '宋立成', productCode: 'A10', productName: '名称6', category: '500ml', qty: 363, price: 6, revenue: 2178, cost: 1140, tagFee: 0, accessoryFee: 0, profit: 1038, profitRate: 0.477, memo: '' },
  { shopName: '雪中飞德煌童装专卖店', orderId: '2022-8-7', styleCode: '宋立成', productCode: 'A11', productName: '名称7', category: '50ml*2', qty: 640, price: 2, revenue: 1280, cost: 660, tagFee: 0, accessoryFee: 0, profit: 620, profitRate: 0.484, memo: '' },
  { shopName: '雪中飞德煌童装专卖店', orderId: '2022-9-8', styleCode: '宋立成', productCode: 'A12', productName: '名称8', category: '96T', qty: 3488, price: 2, revenue: 6976, cost: 748, tagFee: 0, accessoryFee: 0, profit: 6228, profitRate: 0.893, memo: '' },
  { shopName: '雪中飞德煌童装专卖店', orderId: '2022-10-9', styleCode: '宋立成', productCode: 'A13', productName: '名称9', category: '2 x 96 tests', qty: 2310, price: 2, revenue: 4620, cost: 1094, tagFee: 0, accessoryFee: 0, profit: 3526, profitRate: 0.763, memo: '' },
  { shopName: '雪中飞德煌童装专卖店', orderId: '2022-11-10', styleCode: '宋立成', productCode: 'A14', productName: '名称10', category: '2 x 96 tests', qty: 2310, price: 1, revenue: 2310, cost: 1105, tagFee: 0, accessoryFee: 0, profit: 1205, profitRate: 0.522, memo: '' },
  { shopName: '雪中飞德煌童装专卖店', orderId: '2022-12-11', styleCode: '宋立成', productCode: 'A15', productName: '名称11', category: '2 x 97 tests', qty: 2800, price: 3, revenue: 8400, cost: 816, tagFee: 0, accessoryFee: 0, profit: 7584, profitRate: 0.903, memo: '' },
  { shopName: '雪中飞德煌童装专卖店', orderId: '2022-5-11', styleCode: '宋立成', productCode: 'A15', productName: '名称12', category: '2 x 97 tests', qty: 1200, price: 3, revenue: 3600, cost: 1068, tagFee: 0, accessoryFee: 0, profit: 2532, profitRate: 0.703, memo: '' }
]

// 月份统计（模板右侧"智能分析区"）
export const DEMO_MONTHLY_STATS = [
  { month: '1月',  amount: 4456 },
  { month: '2月',  amount: 720 },
  { month: '3月',  amount: 960 },
  { month: '4月',  amount: 3960 },
  { month: '5月',  amount: 3600 },
  { month: '6月',  amount: 1196 },
  { month: '7月',  amount: 2178 },
  { month: '8月',  amount: 1280 },
  { month: '9月',  amount: 6976 },
  { month: '10月', amount: 4620 },
  { month: '11月', amount: 2310 },
  { month: '12月', amount: 8400 }
]

// 关键指标
export const DEMO_KEY_METRICS = {
  totalQty: 49,             // 总销量
  totalAmount: 40656,       // 总销售金额
  totalCost: 10876,         // 总成本
  totalProfit: 29780,       // 总毛利润
  profitRate: 0.7325        // 毛利率
}


// ============================================================================
// 应收汇总表 — 店铺/商品维度
// ============================================================================
export const DEMO_RECV_SUMMARY = [
  { shop: '雪中飞德煌童装专卖店', styleCode: 'X2501326322FXT', productCode: 'I568150018164', productName: '冬款保暖羽绒服',
    openQty: 0, openAmount: 0, recvQty: 280, recvAmount: 50120.00,
    writeoffQty: 265, writeoffAmount: 47436.05, endQty: 15, endAmount: 2683.95 },
  { shop: '雪中飞德煌童装专卖店', styleCode: 'X2509329934FXT', productCode: 'I687014417827', productName: '春秋款卫衣',
    openQty: 0, openAmount: 0, recvQty: 156, recvAmount: 10920.40,
    writeoffQty: 156, writeoffAmount: 10374.40, endQty: 0, endAmount: 546.00 },
  { shop: '雪中飞德煌童装专卖店', styleCode: 'X250138238FXT', productCode: 'H626415547402', productName: '童装连衣裙',
    openQty: 0, openAmount: 0, recvQty: 89, recvAmount: 17711.00,
    writeoffQty: 80, writeoffAmount: 15124.00, endQty: 9, endAmount: 2587.00 },
  { shop: '雪中飞德煌童装专卖店', styleCode: 'X2501324376FXT', productCode: 'I180814417600', productName: '童装毛衣',
    openQty: 12, openAmount: 2148.00, recvQty: 67, recvAmount: 11993.00,
    writeoffQty: 70, writeoffAmount: 12530.00, endQty: 9, endAmount: 1611.00 }
]

// ============================================================================
// 应收明细表 — 订单级
// ============================================================================
export const DEMO_RECV_DETAIL = [
  { period: '2026-01', shop: '雪中飞德煌童装专卖店', orderId: '6950156655091651754', styleCode: 'X2501326322FXT', productCode: 'I568150018164', productName: '冬款保暖羽绒服',
    openQty: 0, openAmount: 0, recvQty: 1, recvAmount: 179.00, writeoffQty: 1, writeoffAmount: 170.05, endQty: 0, endAmount: 8.95, bucket: 'matched' },
  { period: '2026-01', shop: '雪中飞德煌童装专卖店', orderId: '6950144136995607613', styleCode: 'X2509329934FXT', productCode: 'I687014417827', productName: '春秋款卫衣',
    openQty: 0, openAmount: 0, recvQty: 1, recvAmount: 69.90, writeoffQty: 1, writeoffAmount: 66.40, endQty: 0, endAmount: 3.50, bucket: 'matched' },
  { period: '2026-01', shop: '雪中飞德煌童装专卖店', orderId: '6923805849049201907', styleCode: 'X250138238FXT', productCode: 'H626415547402', productName: '童装连衣裙',
    openQty: 0, openAmount: 0, recvQty: 1, recvAmount: 199.00, writeoffQty: 1, writeoffAmount: 189.05, endQty: 0, endAmount: 9.95, bucket: 'matched' },
  { period: '2026-01', shop: '雪中飞德煌童装专卖店', orderId: '6924339045381930971', styleCode: 'X2501324376FXT', productCode: 'I180814417600', productName: '童装毛衣',
    openQty: 1, openAmount: 179.00, recvQty: 0, recvAmount: 0, writeoffQty: 1, writeoffAmount: 170.05, endQty: 0, endAmount: 8.95, bucket: 'matched' }
]

// ============================================================================
// 利润分析表 — 多维度
// ============================================================================
export const DEMO_PROFIT_ANALYZE = {
  sku: [
    { styleCode: 'X2501326322FXT', productName: '冬款保暖羽绒服', shop: '雪中飞德煌童装专卖店',
      qty: 280, revenue: 50120, cost: 24276, fee: 2506, profit: 23338,
      profitRate: 0.466 },
    { styleCode: 'X2509329934FXT', productName: '春秋款卫衣', shop: '雪中飞德煌童装专卖店',
      qty: 156, revenue: 10920, cost: 4680, fee: 546, profit: 5694,
      profitRate: 0.521 },
    { styleCode: 'X250138238FXT',  productName: '童装连衣裙', shop: '雪中飞德煌童装专卖店',
      qty: 89, revenue: 17711, cost: 9372, fee: 886, profit: 7453,
      profitRate: 0.421 },
    { styleCode: 'X2501324376FXT', productName: '童装毛衣', shop: '雪中飞德煌童装专卖店',
      qty: 67, revenue: 11993, cost: 5159, fee: 600, profit: 6234,
      profitRate: 0.520 }
  ],
  byShop: [
    { key: '雪中飞德煌童装专卖店', qty: 592, revenue: 90744, cost: 43487, fee: 4538, profit: 42719, profitRate: 0.471 }
  ],
  byPlatform: [
    { key: 'douyin', qty: 592, revenue: 90744, cost: 43487, fee: 4538, profit: 42719, profitRate: 0.471 }
  ],
  byCategory: [
    { key: '童装外套', qty: 369, revenue: 67831, cost: 33648, fee: 3392, profit: 30791, profitRate: 0.454 },
    { key: '童装连衣裙', qty: 89,  revenue: 17711, cost: 9372,  fee: 886,  profit: 7453,  profitRate: 0.421 },
    { key: '童装毛衣',  qty: 67,  revenue: 11993, cost: 5159,  fee: 600,  profit: 6234,  profitRate: 0.520 },
    { key: '童装卫衣',  qty: 156, revenue: 10920, cost: 4680,  fee: 546,  profit: 5694,  profitRate: 0.521 }
  ]
}

// ============================================================================
// 数据分配 — 演示分配明细
// ============================================================================
export const DEMO_ALLOCATION = {
  allocations: [
    { id: 'a1', feeType: '推广费', platformOrderId: '6950156655091651754', styleCode: 'X2501326322FXT',
      amount: 2.50, ratio: 0.025, basisField: 'saleRevenue', standardName: '推广费按收入分摊', level: 'sku' },
    { id: 'a2', feeType: '推广费', platformOrderId: '6950144136995607613', styleCode: 'X2509329934FXT',
      amount: 1.25, ratio: 0.0125, basisField: 'saleRevenue', standardName: '推广费按收入分摊', level: 'sku' },
    { id: 'a3', feeType: '运费险', platformOrderId: '6950156655091651754', styleCode: 'X2501326322FXT',
      amount: 1.00, ratio: 0.01, basisField: 'orderCount', standardName: '运费险按订单数分摊', level: 'sku' },
    { id: 'a4', feeType: '红包', platformOrderId: '6923805849049201907', styleCode: 'X250138238FXT',
      amount: 0.80, ratio: 0.008, basisField: 'saleRevenue', standardName: '红包/补贴按收入分摊', level: 'sku' },
    { id: 'a5', feeType: '平台服务费', platformOrderId: '6924339045381930971', styleCode: 'X2501324376FXT',
      amount: 8.95, ratio: 1, basisField: 'directOrder', standardName: '直挂订单', level: 'sku' }
  ],
  summary: {
    totalFees: 14.50, allocated: 14.50, unallocated: 0, unmatchedReasons: {},
    byOrg: [{ key: 'default', count: 5, amount: 14.50, byFeeType: { '推广费': 3.75, '运费险': 1.00, '红包': 0.80, '平台服务费': 8.95 } }],
    byShop: [{ key: '雪中飞德煌童装专卖店', count: 5, amount: 14.50, byFeeType: { '推广费': 3.75, '运费险': 1.00, '红包': 0.80, '平台服务费': 8.95 } }],
    bySku: [
      { key: 'X2501326322FXT', count: 2, amount: 3.50, byFeeType: { '推广费': 2.50, '运费险': 1.00 } },
      { key: 'X2509329934FXT', count: 1, amount: 1.25, byFeeType: { '推广费': 1.25 } },
      { key: 'X250138238FXT',  count: 1, amount: 0.80, byFeeType: { '红包': 0.80 } },
      { key: 'X2501324376FXT', count: 1, amount: 8.95, byFeeType: { '平台服务费': 8.95 } }
    ],
    byOrder: [
      { key: '6950156655091651754', count: 2, amount: 3.50, byFeeType: { '推广费': 2.50, '运费险': 1.00 } },
      { key: '6924339045381930971', count: 1, amount: 8.95, byFeeType: { '平台服务费': 8.95 } }
    ]
  }
}


// ============================================================================
// 商品资料 - 种子数据（localStorage 为空时首次加载使用）
// ============================================================================
export const DEMO_PRODUCT_MASTER = [
  { styleCode: 'X2501326322FXT', productCode: 'I568150018164', productName: '冬款保暖羽绒服', category: '童装外套', memo: '主推款' },
  { styleCode: 'X2501326322FXT', productCode: 'I568150018600', productName: '冬款保暖羽绒服', category: '童装外套', memo: '主推款' },
  { styleCode: 'X2501326322FXT', productCode: 'I568150018700', productName: '冬款保暖羽绒服', category: '童装外套', memo: '主推款' },
  { styleCode: 'X2509329934FXT', productCode: 'I687014417827', productName: '春秋款卫衣', category: '童装卫衣', memo: '' },
  { styleCode: 'X2509329934FXT', productCode: 'I687051663823', productName: '春秋款卫衣', category: '童装卫衣', memo: '' },
  { styleCode: 'X250138238FXT', productCode: 'H626415547402', productName: '童装连衣裙', category: '童装连衣裙', memo: '' },
  { styleCode: 'X250138238FXT', productCode: 'H626414417140', productName: '童装连衣裙', category: '童装连衣裙', memo: '' },
  { styleCode: 'X2501324376FXT', productCode: 'I180814417600', productName: '童装毛衣', category: '童装毛衣', memo: '' },
  { styleCode: 'X250138648FXT', productCode: 'H598714417302', productName: '童装牛仔裤', category: '童装裤子', memo: '' },
  { styleCode: 'X401410108FXT', productCode: 'G082114417302', productName: '童装运动套装', category: '童装套装', memo: '' }
]

// ============================================================================
// 商品成本 - 种子数据（包含 2026-01 与 2025-12 两个期间，演示「成本变更只影响后续」）
// ============================================================================
export const DEMO_PRODUCT_COST = [
  // 2026-01
  { period: '2026-01', styleCode: 'X2501326322FXT', productCode: 'I568150018164', productName: '冬款保暖羽绒服', baseCost: 86.70, tagFee: 4, accessoryFee: 1.5 },
  { period: '2026-01', styleCode: 'X2509329934FXT', productCode: 'I687014417827', productName: '春秋款卫衣', baseCost: 29.90, tagFee: 2, accessoryFee: 0.5 },
  { period: '2026-01', styleCode: 'X250138238FXT', productCode: 'H626415547402', productName: '童装连衣裙', baseCost: 105.30, tagFee: 4, accessoryFee: 1 },
  { period: '2026-01', styleCode: 'X2501324376FXT', productCode: 'I180814417600', productName: '童装毛衣', baseCost: 76.00, tagFee: 3, accessoryFee: 1 },
  { period: '2026-01', styleCode: 'X250138648FXT', productCode: 'H598714417302', productName: '童装牛仔裤', baseCost: 85.50, tagFee: 3, accessoryFee: 1 },
  // 2025-12（旧成本，演示成本变更）
  { period: '2025-12', styleCode: 'X2501326322FXT', productCode: 'I568150018164', productName: '冬款保暖羽绒服', baseCost: 80.00, tagFee: 3.5, accessoryFee: 1.5 },
  { period: '2025-12', styleCode: 'X2509329934FXT', productCode: 'I687014417827', productName: '春秋款卫衣', baseCost: 28.50, tagFee: 2, accessoryFee: 0.5 }
]

// ============================================================================
// 成本修改记录 - 种子数据
// ============================================================================
const NOW = Date.now()
const DAY = 86400000
export const DEMO_COST_HISTORY = [
  { id: 'log_demo_5', timestamp: NOW - 1 * DAY,  operator: '财务-王芳', action: 'update', period: '2026-01',
    styleCode: 'X2501326322FXT', productCode: 'I568150018164', field: '商品成本', oldValue: 80.00, newValue: 86.70 },
  { id: 'log_demo_4', timestamp: NOW - 2 * DAY,  operator: '财务-王芳', action: 'create', period: '2026-01',
    styleCode: 'X250138648FXT', productCode: 'H598714417302', field: '总成本', oldValue: 0, newValue: 89.50 },
  { id: 'log_demo_3', timestamp: NOW - 5 * DAY,  operator: '财务-王芳', action: 'import', period: '',
    styleCode: '', productCode: '', field: '批量', oldValue: 0, newValue: 156 },
  { id: 'log_demo_2', timestamp: NOW - 12 * DAY, operator: '运营-李明', action: 'update', period: '2025-12',
    styleCode: 'X2509329934FXT', productCode: 'I687014417827', field: '标费', oldValue: 1.5, newValue: 2 },
  { id: 'log_demo_1', timestamp: NOW - 18 * DAY, operator: '管理员',   action: 'create', period: '2025-12',
    styleCode: 'X2501326322FXT', productCode: 'I568150018164', field: '总成本', oldValue: 0, newValue: 85 }
]

// ============================================================================
// 数据归集 - 种子费用记录
// ============================================================================
export const DEMO_FEE_RECORDS = [
  { id: 'fee_demo_1', period: '2026-01', feeType: '推广费', org: 'default', platformId: 'douyin', shopId: 'xzf-dehuang',
    platformOrderId: '', amount: 12500, date: '2026-01-15', memo: '巨量引擎信息流投放', createdAt: NOW - 10 * DAY },
  { id: 'fee_demo_2', period: '2026-01', feeType: '运费险', org: 'default', platformId: 'douyin', shopId: 'xzf-dehuang',
    platformOrderId: '', amount: 2800, date: '2026-01-31', memo: '本月运费险扣费', createdAt: NOW - 8 * DAY },
  { id: 'fee_demo_3', period: '2026-01', feeType: '红包', org: 'default', platformId: 'douyin', shopId: 'xzf-dehuang',
    platformOrderId: '', amount: 4200, date: '2026-01-20', memo: '直播间红包活动', createdAt: NOW - 7 * DAY },
  { id: 'fee_demo_4', period: '2026-01', feeType: '快递费', org: 'default', platformId: 'douyin', shopId: 'xzf-dehuang',
    platformOrderId: '', amount: 8650, date: '2026-01-31', memo: '中通月结', createdAt: NOW - 6 * DAY },
  { id: 'fee_demo_5', period: '2026-01', feeType: '保险费', org: 'default', platformId: 'douyin', shopId: 'xzf-dehuang',
    platformOrderId: '', amount: 580, date: '2026-01-05', memo: '商品险', createdAt: NOW - 25 * DAY }
]

// ============================================================================
// 店铺/平台配置 - 种子数据
// ============================================================================
export const DEMO_SHOP_PROFILES = [
  { id: 'shop_demo_1', name: '雪中飞德煌童装专卖店', platformId: 'douyin', currency: 'CNY',
    status: 'active', settlementRule: 'T+1 自动结算，平台手续费 5%', memo: '抖音真实店铺', createdAt: NOW - 30 * DAY },
  { id: 'shop_demo_2', name: '雪中飞天猫旗舰店', platformId: 'taobao', currency: 'CNY',
    status: 'active', settlementRule: 'T+15 半月结', memo: '主营冬款外套', createdAt: NOW - 60 * DAY },
  { id: 'shop_demo_3', name: 'OZON 童装旗舰店', platformId: 'ozon', currency: 'RUB',
    status: 'active', settlementRule: 'T+30 月结，跨境收款手续费 1.2%', memo: '俄罗斯主推', createdAt: NOW - 45 * DAY },
  { id: 'shop_demo_4', name: 'Amazon US 童装店', platformId: 'amazon_us', currency: 'USD',
    status: 'active', settlementRule: 'T+14 双周结', memo: '美国市场', createdAt: NOW - 25 * DAY },
  { id: 'shop_demo_5', name: '老款临时仓店铺', platformId: 'pinduoduo', currency: 'CNY',
    status: 'inactive', settlementRule: '', memo: '清仓后停用', createdAt: NOW - 90 * DAY }
]


// ============================================================================
// 差异分析表 - 演示对账结果（用于未上传账单时的展示）
// ============================================================================
export const DEMO_RECONCILE_RESULT = {
  kpi: {
    totalOrders: 2541,
    revenue: 438770.18,
    cost: 220014.28,
    realProfit: 196545.41,
    systemProfit: 218755.90,
    diffCount: 192,
    duplicatedCount: 73,
    missingCount: 54,
    anomalyCount: 65,
    customCostCount: 0
  },
  diffRows: [
    { orderId: '6950156655091651754', styleCode: 'X2501326322FXT', productCode: 'I568150018164',
      productName: '冬款保暖羽绒服', qty: 1, saleRevenue: 179.00, netSettled: 170.05,
      shippedCost: 86.70, costSource: 'jushuitan', realProfit: 83.35, systemProfit: 92.30,
      profitDiff: -8.95, bucket: 'matched',
      aiHint: '', jstBillAmountSum: 179.00, platformFlows: [], jstRows: [] },
    { orderId: '6950144136995607613', styleCode: 'X2509329934FXT', productCode: 'I687014417827',
      productName: '春秋款卫衣', qty: 1, saleRevenue: 69.90, netSettled: 66.40,
      shippedCost: 0, costSource: 'jushuitan', realProfit: 66.40, systemProfit: 29.90,
      profitDiff: 36.50, bucket: 'profit_anomaly',
      aiHint: '毛利偏离系统记录 ¥36.50，请核对成本价或退款金额',
      jstBillAmountSum: 69.90, platformFlows: [], jstRows: [] },
    { orderId: '6923805849049201907', styleCode: 'X250138238FXT', productCode: 'H626415547402',
      productName: '童装连衣裙', qty: 1, saleRevenue: 199.00, netSettled: 189.05,
      shippedCost: 105.30, costSource: 'jushuitan', realProfit: 83.75, systemProfit: 93.70,
      profitDiff: -9.95, bucket: 'matched',
      aiHint: '', jstBillAmountSum: 199.00, platformFlows: [], jstRows: [] },
    { orderId: '6924339045381930971', styleCode: 'X2501324376FXT', productCode: 'I180814417600',
      productName: '童装毛衣', qty: 1, saleRevenue: 179.00, netSettled: 170.05,
      shippedCost: 162.70, costSource: 'jushuitan', realProfit: 7.35, systemProfit: 298.30,
      profitDiff: -290.95, bucket: 'duplicated',
      aiHint: '聚水潭同订单多行（售后/换货）金额累计为平台的 3 倍',
      jstBillAmountSum: 537.00, platformFlows: [], jstRows: [] },
    { orderId: '6950156878352356395', styleCode: null, productCode: null,
      productName: null, qty: 0, saleRevenue: 0, netSettled: 0,
      shippedCost: 0, costSource: 'jushuitan', realProfit: 0, systemProfit: 0,
      profitDiff: 0, bucket: 'missing_in_jst',
      aiHint: '平台有此单，聚水潭未导出', jstBillAmountSum: 0, platformFlows: [], jstRows: [] },
    { orderId: 'JST_5113153766063040445', styleCode: 'X2501122980FXT', productCode: 'I997450918302',
      productName: '基础款外套', qty: 0, saleRevenue: 0, netSettled: 0,
      shippedCost: 400, costSource: 'jushuitan', realProfit: -400, systemProfit: 400,
      profitDiff: -800, bucket: 'missing_in_platform',
      aiHint: '聚水潭有此单，平台账单未结算', jstBillAmountSum: 0, platformFlows: [], jstRows: [] }
  ],
  skuStats: [
    { styleCode: 'X2501326322FXT', productName: '冬款保暖羽绒服', qty: 280, revenue: 50120, cost: 24276, profit: 25844, profitRate: 0.516 },
    { styleCode: 'X2509329934FXT', productName: '春秋款卫衣', qty: 156, revenue: 10920, cost: 4680, profit: 6240, profitRate: 0.571 },
    { styleCode: 'X250138238FXT',  productName: '童装连衣裙', qty: 89, revenue: 17711, cost: 9372, profit: 8339, profitRate: 0.471 },
    { styleCode: 'X2501324376FXT', productName: '童装毛衣', qty: 67, revenue: 11993, cost: 5159, profit: 6834, profitRate: 0.570 }
  ],
  monthlyExpense: [
    { scene: '权益保险', count: 28, totalAmount: -2350.00, samples: [{ time: '2026-01-15', amount: 84, memo: '保险扣费' }] },
    { scene: '提现手续费', count: 4, totalAmount: -180.00, samples: [{ time: '2026-01-31', amount: 45, memo: '提现' }] },
    { scene: '推广费', count: 12, totalAmount: -3500.00, samples: [{ time: '2026-01-20', amount: 500, memo: '巨量引擎' }] }
  ]
}
