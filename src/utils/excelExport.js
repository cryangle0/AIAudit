// 通用 Excel 导出工具 — 替代 CSV
// 使用 xlsx (SheetJS), 已经是项目依赖

import * as XLSX from 'xlsx'

/**
 * 导出二维数组为 xlsx 文件
 * @param {Array<Array<any>>} aoa - [['表头1','表头2'], ['值1','值2']]
 * @param {string} fileName - 不含扩展名
 * @param {string} sheetName - 工作表名
 */
export function exportAOA(aoa, fileName, sheetName = 'Sheet1') {
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}

/**
 * 导出对象数组为 xlsx，支持多 sheet
 * @param {Array<{name, columns, rows}>} sheets - 多 sheet 配置
 *   columns: [{key:'orderId', label:'订单号'}, ...]
 *   rows: [{orderId:'A1', ...}]
 * @param {string} fileName
 */
export function exportSheets(sheets, fileName) {
  const wb = XLSX.utils.book_new()
  for (const sheet of sheets) {
    const aoa = [
      sheet.columns.map(c => c.label),
      ...sheet.rows.map(r => sheet.columns.map(c => formatCell(r[c.key], c.type)))
    ]
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    // 设置列宽
    ws['!cols'] = sheet.columns.map(c => ({ wch: c.width || 14 }))
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31)) // Excel 限制 31 字符
  }
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}

function formatCell(v, type) {
  if (v == null) return ''
  if (type === 'money' && typeof v === 'number') return Number(v.toFixed(2))
  if (type === 'pct' && typeof v === 'number') return Number((v * 100).toFixed(2)) + '%'
  return v
}
