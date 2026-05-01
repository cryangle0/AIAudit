import { useEffect } from 'react'
import { X } from 'lucide-react'
import './Modal.css'

export default function Modal({ open, title, onClose, children, footer, width = 420, dismissible = true }) {
  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape' && dismissible) onClose?.() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, dismissible])

  if (!open) return null

  return (
    <div className="rec-modal-overlay" onClick={() => dismissible && onClose?.()}>
      <div
        className="rec-modal-card"
        style={{ width }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="rec-modal-header">
          <span className="rec-modal-title">{title}</span>
          {dismissible && (
            <button className="rec-modal-close" onClick={onClose} aria-label="关闭">
              <X size={16}/>
            </button>
          )}
        </div>
        <div className="rec-modal-body">{children}</div>
        {footer && <div className="rec-modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
