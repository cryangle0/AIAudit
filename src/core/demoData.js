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
  {
    shopName: '天猫旗舰店',
    revenue: 693520.63, noAfterSale: 305353.53, refund: 388167.10, netRevenue: 305353.53,
    shippedQty: 2245, returnedQty: 0, productCost: 78575, tagCost: 0, accessoryCost: 0, shippingCost: 6735, costTotal: 85310,
    platformFee: 1347, commission: 0, promoFee: 0, insurance: 0, redPacket: 0, subsidy: 35920, feeTotal: 37267,
    profit: 305353.53 - 85310 - 37267,
    profitRate: (305353.53 - 85310 - 37267) / 305353.53,
    returnRate: 0
  },
  {
    shopName: '唯品会店',
    revenue: 1693520.63, noAfterSale: 1305353.53, refund: 388167.10, netRevenue: 1305353.53,
    shippedQty: 9598, returnedQty: 0, productCost: 335930, tagCost: 0, accessoryCost: 0, shippingCost: 28794, costTotal: 364724,
    platformFee: 5758.8, commission: 0, promoFee: 0, insurance: 0, redPacket: 0, subsidy: 153568, feeTotal: 159326.8,
    profit: 1305353.53 - 364724 - 159326.8,
    profitRate: (1305353.53 - 364724 - 159326.8) / 1305353.53,
    returnRate: 0
  },
  {
    shopName: '拼多多专卖店',
    revenue: 393520.63, noAfterSale: 105353.53, refund: 288167.10, netRevenue: 105353.53,
    shippedQty: 775, returnedQty: 0, productCost: 27125, tagCost: 0, accessoryCost: 0, shippingCost: 2325, costTotal: 29450,
    platformFee: 465, commission: 0, promoFee: 0, insurance: 0, redPacket: 0, subsidy: 12400, feeTotal: 12865,
    profit: 105353.53 - 29450 - 12865,
    profitRate: (105353.53 - 29450 - 12865) / 105353.53,
    returnRate: 0
  },
  {
    shopName: '抖音雪中飞专卖店',
    revenue: 593520.63, noAfterSale: 305353.53, refund: 288167.10, netRevenue: 305353.53,
    shippedQty: 2245, returnedQty: 0, productCost: 78575, tagCost: 0, accessoryCost: 0, shippingCost: 6735, costTotal: 85310,
    platformFee: 1347, commission: 0, promoFee: 0, insurance: 0, redPacket: 0, subsidy: 35920, feeTotal: 37267,
    profit: 305353.53 - 85310 - 37267,
    profitRate: (305353.53 - 85310 - 37267) / 305353.53,
    returnRate: 0
  }
]

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
