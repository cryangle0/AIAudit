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
