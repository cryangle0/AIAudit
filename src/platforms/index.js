import { douyin } from './douyin.js'
import { taobao } from './taobao.js'
import { kuaishou } from './kuaishou.js'
import { pinduoduo } from './pinduoduo.js'
import { xiaohongshu } from './xiaohongshu.js'
import { shipinhao } from './shipinhao.js'
import { weixin_xiaodian } from './weixin_xiaodian.js'

export const PLATFORMS = [
  douyin, taobao, kuaishou, pinduoduo, xiaohongshu, shipinhao, weixin_xiaodian
]

export const platformsById = Object.fromEntries(PLATFORMS.map(p => [p.id, p]))

// 每个平台一个示例店铺；抖音填真实店名
export const MOCK_SHOPS = {
  douyin: [{ id: 'xzf-dehuang', name: '雪中飞德煌童装专卖店' }],
  taobao: [{ id: 'tb-mock', name: '某童装旗舰店' }],
  kuaishou: [{ id: 'ks-mock', name: '某童装快手店' }],
  pinduoduo: [{ id: 'pdd-mock', name: '某童装拼多多店' }],
  xiaohongshu: [{ id: 'xhs-mock', name: '某童装小红书店' }],
  shipinhao: [{ id: 'sph-mock', name: '某童装视频号店' }],
  weixin_xiaodian: [{ id: 'wxd-mock', name: '某童装微信小店' }]
}
