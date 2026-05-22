// 占位页（用于未来实现的菜单项）
// 显示按客户模板规范的字段结构 + 字段说明 + 待实现状态

import { Construction } from 'lucide-react'
import { PAGE_META } from '../core/menuStructure.js'
import './pages.css'

// 不同 page 的字段规范（严格按客户模板"系统初稿模板5.22"的列说明）
const FIELD_SPECS = {
  'data-aggregate': {
    desc: '支持各种费用类型的费用归集，到组织/店铺/平台单号维度。支持批量导入。',
    columns: ['费用类型', '组织', '店铺', '平台单号', '费用金额', '费用日期', '备注']
  },
  'alloc-standard': {
    desc: '支持自定义费用/收入分配标准。',
    columns: ['标准名称', '适用类型 (费用/收入)', '分配方式', '分配权重字段', '生效期间', '备注']
  },
  'data-allocate': {
    desc: '支持费用/收入三层分配：组织 → 店铺 → 订单商品。',
    columns: ['期间', '组织维度', '店铺维度', '订单商品维度', '原始金额', '分配金额', '分配标准']
  },
  'profit-analyze': {
    desc: '支持部门/平台/品类/店铺/商品多维度利润分析。',
    columns: ['维度', '维度值', '收入', '成本', '费用', '利润', '毛利率']
  },
  'recv-summary': {
    desc: '汇总维度-店铺/商品。期初结余 → 本期应收 → 本期核销 → 期末结余（数量+金额）。',
    columns: ['店铺', '商品', '期初结余数量', '期初结余金额',
              '本期应收数量', '本期应收金额',
              '本期核销数量', '本期核销金额',
              '期末结余数量', '期末结余金额']
  },
  'recv-detail': {
    desc: '明细维度。期初结余 → 本期应收 → 本期核销 → 期末结余（数量+金额）。',
    columns: ['期间', '店铺', '订单号', '商品', '期初结余数量', '期初结余金额',
              '本期应收数量', '本期应收金额', '本期核销数量', '本期核销金额',
              '期末结余数量', '期末结余金额']
  },
  'bill-summary': {
    desc: '汇总维度-店铺/账务类型/业务类型。期初结余 → 本期账单 → 本期核销 → 期末结余（金额）。',
    columns: ['店铺', '账务类型', '业务类型', '期初结余金额',
              '本期账单金额', '本期核销金额', '期末结余金额']
  },
  'bill-detail': {
    desc: '明细维度。期初结余 → 本期账单 → 本期核销 → 期末结余（金额）。',
    columns: ['期间', '店铺', '账务类型', '业务类型', '订单/单据号',
              '期初结余金额', '本期账单金额', '本期核销金额', '期末结余金额']
  }
}

export default function PlaceholderPage({ pageId }) {
  const meta = PAGE_META[pageId]
  const spec = FIELD_SPECS[pageId]
  if (!meta) return <div className="rec-page">未知页面</div>

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>{meta.label}</h2>
        <div className="rec-page-sub">{spec?.desc || meta.desc}</div>
      </div>

      <div className="rec-placeholder">
        <Construction size={28} />
        <h3>功能建设中</h3>
        <p>已按客户模板锁定字段规范，等数据归集 / 分配标准 / 分配引擎落地后即可生成此报表。</p>

        {spec && (
          <div className="rec-field-spec">
            <div className="rec-field-spec-title">报表列规范（共 {spec.columns.length} 列）</div>
            <div className="rec-field-spec-grid">
              {spec.columns.map((c, i) => (
                <div key={i} className="rec-field-spec-item">{c}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
