import { Link } from '../router'
import { CheckCircle2 } from 'lucide-react'

export default function PaymentSuccess() {
  return <main className="simple-page"><section className="simple-card success-state"><CheckCircle2 /><p className="eyebrow"><span /> Payment received</p><h1>Waiting for admin approval.</h1><p>Your payment was successful and the slot is reserved. The Turfly admin will now verify and confirm your booking.</p><div className="success-actions"><Link className="button button-dark" to="/dashboard">Track my booking</Link><Link className="button button-outline" to="/">Back home</Link></div></section></main>
}
