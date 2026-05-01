// 生成 6 个非抖音平台的 sample .xlsx，输出到 public/sample-data/
// 每份含两个 sheet：<平台>结算单（自家列名）+ 聚水潭导出店铺数据
//
// 抖音的样例文件用项目根目录下的「抖音店铺对账数据.xlsx」（真实数据），
// 通过 vite public/ 目录映射，需要把它复制一份到 public/sample-data/douyin.xlsx
//
// 执行：node scripts/build-samples.mjs

import { writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'

import { taobao } from '../src/platforms/taobao.js'
import { kuaishou } from '../src/platforms/kuaishou.js'
import { pinduoduo } from '../src/platforms/pinduoduo.js'
import { xiaohongshu } from '../src/platforms/xiaohongshu.js'
import { shipinhao } from '../src/platforms/shipinhao.js'
import { weixin_xiaodian } from '../src/platforms/weixin_xiaodian.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '..', 'public', 'sample-data')
const JST_SHEET = '聚水潭导出店铺数据'

mkdirSync(OUT_DIR, { recursive: true })

function buildXlsx(platform, outPath) {
  const { fundRowsPlat, jstRows, fundSheet } = platform.getMockSampleData()
  const wb = XLSX.utils.book_new()
  const fundWs = XLSX.utils.json_to_sheet(fundRowsPlat)
  const jstWs = XLSX.utils.json_to_sheet(jstRows)
  XLSX.utils.book_append_sheet(wb, fundWs, fundSheet)
  XLSX.utils.book_append_sheet(wb, jstWs, JST_SHEET)
  XLSX.writeFile(wb, outPath)
  console.log(`  ✓ ${outPath} (fund=${fundRowsPlat.length}, jst=${jstRows.length})`)
}

const platforms = [taobao, kuaishou, pinduoduo, xiaohongshu, shipinhao, weixin_xiaodian]
console.log('生成样例 xlsx 文件…')
for (const p of platforms) {
  buildXlsx(p, resolve(OUT_DIR, `${p.id}.xlsx`))
}

// 把抖音真实样例 复制 到 public/sample-data/douyin.xlsx
const douyinSrc = resolve(__dirname, '..', '抖音店铺对账数据.xlsx')
const douyinDst = resolve(OUT_DIR, 'douyin.xlsx')
if (existsSync(douyinSrc)) {
  copyFileSync(douyinSrc, douyinDst)
  console.log(`  ✓ ${douyinDst} (抖音真实数据复制)`)
} else {
  console.warn(`  ! 未找到 ${douyinSrc}，跳过抖音样例复制`)
}

console.log('完成')
