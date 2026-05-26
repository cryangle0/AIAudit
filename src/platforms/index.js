import { douyin } from './douyin.js'
import { taobao } from './taobao.js'
import { kuaishou } from './kuaishou.js'
import { pinduoduo } from './pinduoduo.js'
import { xiaohongshu } from './xiaohongshu.js'
import { shipinhao } from './shipinhao.js'
import { weixin_xiaodian } from './weixin_xiaodian.js'
// 海外平台
import { ozon } from './ozon.js'
import { wildberries } from './wildberries.js'
import { tiktok_uk } from './tiktok_uk.js'
import { amazon_us } from './amazon_us.js'

// 给国内平台加上 region/currency 标记（便于汇率引擎识别）
const domesticPlatforms = [douyin, taobao, kuaishou, pinduoduo, xiaohongshu, shipinhao, weixin_xiaodian]
  .map(p => ({ ...p, region: 'domestic', currency: 'CNY' }))

const overseasPlatforms = [ozon, wildberries, tiktok_uk, amazon_us]

export const PLATFORMS = [...domesticPlatforms, ...overseasPlatforms]

export const platformsById = Object.fromEntries(PLATFORMS.map(p => [p.id, p]))

// 默认演示店铺
export const MOCK_SHOPS = {
  douyin: [{ id: 'xzf-dehuang', name: '雪中飞德煌童装专卖店' }],
  taobao: [{ id: 'tb-mock', name: '某童装旗舰店' }],
  kuaishou: [{ id: 'ks-mock', name: '某童装快手店' }],
  pinduoduo: [{ id: 'pdd-mock', name: '某童装拼多多店' }],
  xiaohongshu: [{ id: 'xhs-mock', name: '某童装小红书店' }],
  shipinhao: [{ id: 'sph-mock', name: '某童装视频号店' }],
  weixin_xiaodian: [{ id: 'wxd-mock', name: '某童装微信小店' }],
  ozon: [{ id: 'ozon-mock', name: 'OZON 童装旗舰店' }],
  wildberries: [{ id: 'wb-mock', name: 'Wildberries 童装店' }],
  tiktok_uk: [{ id: 'tt-uk-mock', name: 'TikTok UK 童装店' }],
  amazon_us: [{ id: 'amz-us-mock', name: 'Amazon US 童装店' }]
}
