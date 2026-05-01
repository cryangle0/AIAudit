import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import './Select.css'

/**
 * 自定义下拉选择器（替代原生 <select>）
 *
 * @param {string|number} value         当前值
 * @param {Array<{value, label, disabled?}>} options
 * @param {(value) => void} onChange
 * @param {string} placeholder          未选中时占位文字
 * @param {boolean} disabled            整个控件禁用
 * @param {'bottom' | 'top'} placement  下拉菜单展开方向（默认 bottom）
 * @param {string|number} width         宽度（默认填满父容器 100%）
 * @param {string} className            额外 className 加到外层
 */
export default function Select({
  value,
  options = [],
  onChange,
  placeholder = '请选择',
  disabled = false,
  placement = 'bottom',
  width,
  className = ''
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = options.find(o => o.value === value)
  const style = width ? { width } : undefined

  return (
    <div
      className={`rec-select ${className} ${disabled ? 'disabled' : ''}`}
      ref={ref}
      style={style}
    >
      <button
        type="button"
        className="rec-select-trigger"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={current ? 'rec-select-value' : 'rec-select-placeholder'}>
          {current ? current.label : placeholder}
        </span>
        <ChevronDown size={14} className={`rec-select-chevron ${open ? 'open' : ''}`}/>
      </button>
      {open && (
        <div className={`rec-select-dropdown placement-${placement}`} role="listbox">
          {options.length === 0 && (
            <div className="rec-select-empty">无选项</div>
          )}
          {options.map(o => {
            const selected = o.value === value
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={`rec-select-option ${selected ? 'selected' : ''} ${o.disabled ? 'disabled' : ''}`}
                disabled={o.disabled}
                onClick={() => {
                  if (o.disabled) return
                  onChange?.(o.value)
                  setOpen(false)
                }}
              >
                <span>{o.label}</span>
                {selected && <Check size={14}/>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
