import { Link, useSearchParams } from '../router'
import { CheckCircle2, CircleX, LoaderCircle } from 'lucide-react'

export default function PaymentResult() {
  const [params] = useSearchParams()
  const status = params.get('status')
  const success = status === 'success'
  const title = success ? 'Payment successful' : 'Payment failed'
  const message = success
    ? 'Your payment was received successfully. Your booking is now waiting for approval from the admin.'
    : 'We could not complete this payment. Your slot has not been confirmed. Please try again from the booking page.'

  return <main className="simple-page payment-result-page">
    <section className={`simple-card success-state payment-result-card ${success ? 'payment-ok' : 'payment-failed'}`} role="alert">
      {success ? <CheckCircle2 /> : <CircleX />}
      <p className="eyebrow"><span /> {success ? 'Payment received' : 'Payment not completed'}</p>
      <h1>{title}</h1>
      <p>{message}</p>
      {success && <div className="payment-pending-note"><LoaderCircle size={16} /> Waiting for admin approval</div>}
      <div className="success-actions">
        <Link className="button button-dark" to={success ? '/dashboard' : '/book'}>{success ? 'Track my booking' : 'Try payment again'}</Link>
        <Link className="button button-outline" to="/">Back home</Link>
      </div>
    </section>
  </main>
}
