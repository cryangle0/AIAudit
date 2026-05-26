// 店铺利润表 — 严格按客户《系统初稿模板5.22》Excel 表头
// 列：店铺名称 | 销售收入(销售收入·无售后或售后取消·退款金额·销售净收入)
//   | 销售成本(发货数量·退货数量·商品成本·标费成本·辅料成本·快递成本·成本合计)
//   | 销售费用(平台服务费·佣金·推广费·运费险·红包·补贴·费用合计)
//   | 店铺利润 | 毛利率 | 退货率 | 确收率（需求 #15 新增）

import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { fmtMoney, fmtNumber, fmtPct } from '../utils/format.js'
import { buildShopProfitFromReconcile } from '../core/reportBuilder.js'
import { DEMO_SHOP_PROFIT } from '../core/demoData.js'
import './pages.css'

export default function ShopProfitPage({ reconcileResult, shopName, costItems, feeRecords, allocStandards, period }) {
  const [useDemo, setUseDemo] = useState(false)

  const realRow = useMemo(() => {
    if (!reconcileResult) return null
    return buildShopProfitFromReconcile({ reconcileResult, shopName, costItems, feeRecords, allocStandards, period })
  }, [reconcileResult, shopName, costItems, feeRecords, allocStandards, period])

  const showDemo = !reconcileResult || useDemo
  const rows = showDemo ? DEMO_SHOP_PROFIT : (realRow ? [realRow] : [])

  const totals = rows.reduce((a, r) => ({
    revenue: a.revenue + r.revenue,
    noAfterSale: a.noAfterSale + r.noAfterSale,
    refund: a.refund + r.refund,
    netRevenue: a.netRevenue + r.netRevenue,
    shippedQty: a.shippedQty + r.shippedQty,
    returnedQty: a.returnedQty + r.returnedQty,
    productCost: a.productCost + r.productCost,
    tagCost: a.tagCost + r.tagCost,
    accessoryCost: a.accessoryCost + r.accessoryCost,
    shippingCost: a.shippingCost + r.shippingCost,
    costTotal: a.costTotal + r.costTotal,
    platformFee: a.platformFee + r.platformFee,
    commission: a.commission + r.commission,
    promoFee: a.promoFee + r.promoFee,
    insurance: a.insurance + r.insurance,
    redPacket: a.redPacket + r.redPacket,
    subsidy: a.subsidy + r.subsidy,
    feeTotal: a.feeTotal + r.feeTotal,
    profit: a.profit + r.profit
  }), { revenue: 0, noAfterSale: 0, refund: 0, netRevenue: 0,
       shippedQty: 0, returnedQty: 0, productCost: 0, tagCost: 0, accessoryCost: 0, shippingCost: 0, costTotal: 0,
       platformFee: 0, commission: 0, promoFee: 0, insurance: 0, redPacket: 0, subsidy: 0, feeTotal: 0,
       profit: 0 })

  return (
    <div className="rec-page">
      <div className="rec-page-head">
        <h2>{period ? `${period.split('-')[1]}月店铺销售利润表` : '店铺销售利润表'}</h2>
        <div className="rec-page-sub">
          按客户模板表头：店铺名称 / 销售收入(4) / 销售成本(7) / 销售费用(7) / 店铺利润 / 毛利率 / 退货率
        </div>
      </div>

      {showDemo && (
        <div className="rec-demo-banner">
          <Sparkles size={14}/> 当前显示演示数据（4 个店铺典型场景）。
          {!reconcileResult ? '完成对账后将生成真实店铺利润数据。' :
            <button className="rec-link-btn" onClick={() => setUseDemo(false)}>切换到真实数据</button>}
        </div>
      )}
      {!showDemo && reconcileResult && (
        <div className="rec-toolbar">
          <span className="rec-spacer"/>
          <button className="rec-btn" onClick={() => setUseDemo(true)}>
            <Sparkles size={14}/> 查看演示数据
          </button>
        </div>
      )}

      <div className="rec-table-card">
        <table className="rec-data-table">
          <thead>
            <tr>
              <th rowSpan={2}>店铺名称</th>
              <th colSpan={4} className="rec-grouped-h-pos">销售收入</th>
              <th colSpan={7} className="rec-grouped-h-cost">销售成本</th>
              <th colSpan={7} className="rec-grouped-h-neg">销售费用</th>
              <th rowSpan={2}>店铺利润</th>
              <th rowSpan={2}>毛利率</th>
              <th rowSpan={2}>退货率</th>
              <th rowSpan={2}>确收率</th>
            </tr>
            <tr>
              <th>销售收入</th><th>无售后或售后取消</th><th>退款金额</th><th>销售净收入</th>
              <th>发货数量</th><th>退货数量</th><th>商品成本</th><th>标费成本</th><th>辅料成本</th><th>快递成本</th><th>成本合计</th>
              <th>平台服务费</th><th>佣金</th><th>推广费</th><th>运费险</th><th>红包</th><th>补贴</th><th>费用合计</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td><strong>{r.shopName}</strong></td>
                <td>{fmtMoney(r.revenue)}</td>
                <td>{fmtMoney(r.noAfterSale)}</td>
                <td>{fmtMoney(r.refund)}</td>
                <td className="pos"><strong>{fmtMoney(r.netRevenue)}</strong></td>
                <td>{fmtNumber(r.shippedQty)}</td>
                <td>{fmtNumber(r.returnedQty)}</td>
                <td>{fmtMoney(r.productCost)}</td>
                <td>{fmtMoney(r.tagCost)}</td>
                <td>{fmtMoney(r.accessoryCost)}</td>
                <td>{fmtMoney(r.shippingCost)}</td>
                <td className="cost-total"><strong>{fmtMoney(r.costTotal)}</strong></td>
                <td>{fmtMoney(r.platformFee)}</td>
                <td>{fmtMoney(r.commission)}</td>
                <td>{fmtMoney(r.promoFee)}</td>
                <td>{fmtMoney(r.insurance)}</td>
                <td>{fmtMoney(r.redPacket)}</td>
                <td>{fmtMoney(r.subsidy)}</td>
                <td className="neg"><strong>{fmtMoney(r.feeTotal)}</strong></td>
                <td className={r.profit < 0 ? 'neg' : 'pos'}><strong>{fmtMoney(r.profit)}</strong></td>
                <td>{fmtPct(r.profitRate)}</td>
                <td>{fmtPct(r.returnRate)}</td>
                <td>{fmtPct(r.confirmRate)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>合计</strong></td>
              <td>{fmtMoney(totals.revenue)}</td>
              <td>{fmtMoney(totals.noAfterSale)}</td>
              <td>{fmtMoney(totals.refund)}</td>
              <td className="pos">{fmtMoney(totals.netRevenue)}</td>
              <td>{fmtNumber(totals.shippedQty)}</td>
              <td>{fmtNumber(totals.returnedQty)}</td>
              <td>{fmtMoney(totals.productCost)}</td>
              <td>{fmtMoney(totals.tagCost)}</td>
              <td>{fmtMoney(totals.accessoryCost)}</td>
              <td>{fmtMoney(totals.shippingCost)}</td>
              <td>{fmtMoney(totals.costTotal)}</td>
              <td>{fmtMoney(totals.platformFee)}</td>
              <td>{fmtMoney(totals.commission)}</td>
              <td>{fmtMoney(totals.promoFee)}</td>
              <td>{fmtMoney(totals.insurance)}</td>
              <td>{fmtMoney(totals.redPacket)}</td>
              <td>{fmtMoney(totals.subsidy)}</td>
              <td className="neg">{fmtMoney(totals.feeTotal)}</td>
              <td className={totals.profit < 0 ? 'neg' : 'pos'}>{fmtMoney(totals.profit)}</td>
              <td>{fmtPct(totals.netRevenue ? totals.profit / totals.netRevenue : 0)}</td>
              <td>—</td>
              <td>—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
