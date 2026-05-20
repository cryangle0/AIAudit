import * as XLSX from 'xlsx'

// 读取 File 对象，返回 { [sheetName]: rowsArrayOfObjects }
export async function readWorkbook(file) {
  const buf = await file.arrayBuffer()
  // dense: false + cellDates 保持兼容；大文件（>10MB）给出警告但不阻断
  const wb = XLSX.read(buf, { type: 'array', cellDates: true })
  const out = {}
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName]
    out[sheetName] = XLSX.utils.sheet_to_json(ws, { defval: null, raw: true })
  }
  return out
}

// 校验某 sheet 必备列
export function validateColumns(rows, requiredColumns) {
  if (!rows || rows.length === 0) return ['工作表为空']
  const firstRow = rows[0]
  return requiredColumns.filter(c => !(c in firstRow))
}
