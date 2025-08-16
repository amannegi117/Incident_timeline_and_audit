import React from 'react'

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
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {message ? <div style={{ color: '#475569', marginTop: 4 }}>{message}</div> : null}
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