import React, { useEffect, useRef, useId } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isConfirmDisabled?: boolean
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isConfirmDisabled,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (open && dialogRef.current) {
      // Move focus to dialog on open
      dialogRef.current.focus()
    }
  }, [open])
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? descId : undefined}
        tabIndex={-1}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel()
        }}
      >
        <h3 id={titleId}>{title}</h3>
        {message ? <div id={descId} style={{ color: '#475569', marginTop: 4 }}>{message}</div> : null}
        <div className="modal-actions">
          <button className="secondary" type="button" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="danger" type="button" onClick={onConfirm} disabled={isConfirmDisabled}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}