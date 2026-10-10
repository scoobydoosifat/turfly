import { AlertTriangle, CheckCircle2, ShieldCheck, X } from 'lucide-react'
import LoadingButton from './LoadingButton'

export default function ConfirmDialog({
  open,
  title,
  message,
  eyebrow = 'Please confirm',
  confirmText = 'Yes, continue',
  loadingText = 'Please wait…',
  cancelText = 'No, go back',
  tone = 'danger',
  loading = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null
  const Icon = tone === 'approve' ? CheckCircle2 : tone === 'session' ? ShieldCheck : AlertTriangle
  const confirmClass = tone === 'danger' ? 'button button-danger' : 'button button-accent'

  return <div className="confirm-backdrop" onMouseDown={() => !loading && onClose()}>
    <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-action-title" onMouseDown={(event) => event.stopPropagation()}>
      <button className="confirm-close" type="button" disabled={loading} onClick={onClose} aria-label="Close confirmation"><X size={19} /></button>
      <div className={`confirm-icon ${tone === 'danger' ? 'danger' : ''}`}><Icon /></div>
      <p className="eyebrow"><span /> {eyebrow}</p>
      <h2 id="confirm-action-title">{title}</h2>
      <p>{message}</p>
      <div className="confirm-actions">
        <button type="button" className="button button-outline" disabled={loading} onClick={onClose}>{cancelText}</button>
        <LoadingButton type="button" className={confirmClass} loading={loading} loadingText={loadingText} onClick={onConfirm}>{confirmText}</LoadingButton>
      </div>
    </section>
  </div>
}
