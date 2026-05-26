// 系统菜单结构 — 严格按客户需求表 + 系统初稿模板
// 6 大模块：商品管理 / 订单管理 / 汇率管理 / 利润核算中心 / 报表中心(数据中心) / 系统设置

export const MENU_GROUPS = [
  {
    id: 'product-mgmt',
    label: '商品管理',
    items: [
      { id: 'product-master',    label: '商品资料',
        desc: '导入款式编码/商品编码/商品名称/品类等基础信息（需求 #1）' },
      { id: 'product-cost',      label: '商品成本',
        desc: '维护标费/辅料，支持在线编辑、变更只影响后续数据（需求 #2 #3）' },
      { id: 'cost-history',      label: '成本修改记录',
        desc: '记录每次成本修改的时间/人/前后值（需求 #4）' }
    ]
  },
  {
    id: 'profit-center',
    label: '利润核算中心',
    items: [
      { id: 'data-aggregate', label: '数据归集',
        desc: '费用类型/组织/店铺/平台单号维度，支持批量导入' },
      { id: 'alloc-standard', label: '分配标准',
        desc: '自定义费用/收入分配标准' },
      { id: 'data-allocate',  label: '数据分配',
        desc: '组织 → 店铺 → 订单商品三层分配' },
      { id: 'profit-analyze', label: '利润分析表',
        desc: '部门/平台/品类/店铺/商品多维度' }
    ]
  },
  {
    id: 'reports',
    label: '数据中心',
    items: [
      { id: 'recv-summary',   label: '应收汇总表',
        desc: '汇总维度-店铺/商品。期初/应收/核销/期末（数量+金额）' },
      { id: 'recv-detail',    label: '应收明细表',
        desc: '明细维度。期初/应收/核销/期末（数量+金额）' },
      { id: 'bill-summary',   label: '账单汇总表',
        desc: '平台/店铺/账务类型。期初/账单/核销/期末（金额）需求 #13' },
      { id: 'bill-detail',    label: '账单明细表',
        desc: '订单/款式编码维度（需求 #14）' },
      { id: 'shop-profit',    label: '店铺利润表',
        desc: '销售收入/退货/销售成本/平台服务费/佣金/推广费/毛利/毛利率/退货率/确收率（需求 #15）' },
      { id: 'diff-analyze',   label: '差异分析表',
        desc: '对账主流程，发货/退货/收款/退款金额、差额调整、净收入' },
      { id: 'product-profit', label: '商品利润表',
        desc: '扣税收入/参考成本/分配费用/利润/毛利率（需求 #16）' }
    ]
  },
  {
    id: 'fx-mgmt',
    label: '汇率管理',
    items: [
      { id: 'fx-rates',  label: '汇率维护',
        desc: '多币种汇率：CNY/USD/RUB/GBP，按月维护（需求 #10 #11 #12）' }
    ]
  },
  {
    id: 'shop-mgmt',
    label: '店铺管理',
    items: [
      { id: 'shop-profiles',  label: '店铺/平台配置',
        desc: '店铺基础信息+平台+币种（需求 #16 #17 #18 #19）' }
    ]
  },
  {
    id: 'system',
    label: '系统设置',
    items: [
      { id: 'sys-roles',   label: '角色管理',
        desc: '财务/运营/管理员等角色（需求 #17）' },
      { id: 'sys-perms',   label: '权限管理',
        desc: '基于角色的功能/数据权限（需求 #18）' },
      { id: 'sys-backup',  label: '数据备份',
        desc: '账单和成本数据定期备份（需求 #20）' }
    ]
  }
]

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
