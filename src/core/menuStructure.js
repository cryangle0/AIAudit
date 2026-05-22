// 系统菜单结构 — 严格按"系统初稿模板5.22"客户菜单图定义
// 两大模块：利润核算中心 + 报表中心

export const MENU_GROUPS = [
  {
    id: 'profit-center',
    label: '利润核算中心',
    items: [
      { id: 'product-cost',   label: '商品成本',
        desc: '按照期间/商品维度维护商品成本。支持批量导入' },
      { id: 'data-aggregate', label: '数据归集',
        desc: '支持各种费用类型的费用归集，到组织/店铺/平台单号维度。支持批量导入' },
      { id: 'alloc-standard', label: '分配标准',
        desc: '支持自定义费用/收入分配标准' },
      { id: 'data-allocate',  label: '数据分配',
        desc: '支持费用/收入三层分配：组织 → 店铺 → 订单商品' },
      { id: 'profit-analyze', label: '利润分析表',
        desc: '支持部门/平台/品类/店铺/商品多维度利润分析' }
    ]
  },
  {
    id: 'reports',
    label: '报表中心',
    items: [
      { id: 'recv-summary',   label: '应收汇总表',
        desc: '汇总维度-店铺/商品。期初结余 → 本期应收 → 本期核销 → 期末结余（数量+金额）' },
      { id: 'recv-detail',    label: '应收明细表',
        desc: '明细维度。期初结余 → 本期应收 → 本期核销 → 期末结余（数量+金额）' },
      { id: 'bill-summary',   label: '账单汇总表',
        desc: '汇总维度-店铺/账务类型/业务类型。期初结余 → 本期账单 → 本期核销 → 期末结余（金额）' },
      { id: 'bill-detail',    label: '账单明细表',
        desc: '明细维度。期初结余 → 本期账单 → 本期核销 → 期末结余（金额）' },
      { id: 'shop-profit',    label: '店铺利润表',
        desc: '汇总维度-店铺。销售收入/销售成本/销售费用/店铺利润/毛利率/退货率' },
      { id: 'diff-analyze',   label: '差异分析表',
        desc: '汇总维度-店铺/平台单号。发货/退货/收款/退款金额、差额调整、净收入。双击下钻订单细节' },
      { id: 'product-profit', label: '商品利润表',
        desc: '汇总维度-店铺/商品。订单号/款式编码/商品编码/商品名称/品类/数量/单价/销售金额/成本/标费/辅料/毛利润/毛利率' }
    ]
  }
]

// 反向索引：pageId → { groupId, label, desc }
export const PAGE_META = (() => {
  const m = {}
  for (const g of MENU_GROUPS) {
    for (const it of g.items) {
      m[it.id] = { ...it, groupId: g.id, groupLabel: g.label }
    }
  }
  return m
})()

export const DEFAULT_PAGE = 'diff-analyze'
