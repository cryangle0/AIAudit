// 种子数据横幅 — 提示用户当前是演示数据
import { Sparkles, RotateCcw } from 'lucide-react'

export default function SeedDataBanner({ tip, onResetSeed }) {
  return (
    <div className="rec-demo-banner">
      <Sparkles size={14}/>
      <span>{tip || '当前数据为演示种子，您可以直接编辑、删除或导入真实数据。'}</span>
      {onResetSeed && (
        <>
          <span className="rec-spacer"/>
          <button className="rec-link-btn" onClick={onResetSeed} title="清空所有数据并重新加载演示种子">
            <RotateCcw size={11}/> 重新加载演示数据
          </button>
        </>
      )}
    </div>
  )
}
