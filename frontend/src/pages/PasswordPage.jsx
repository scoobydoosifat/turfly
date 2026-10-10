import { useState } from 'react'
import { Link, useSearchParams } from '../router'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { api } from '../api'
import LoadingButton from '../components/LoadingButton'

export default function PasswordPage({ reset = false }) {
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault(); if (busy) return; setBusy(true); setError('')
    try {
      const body = reset ? { token: params.get('token') || '', newPassword: password } : { email }
      const result = await api(`/api/auth/${reset ? 'reset-password' : 'forgot-password'}`, { method: 'POST', body: JSON.stringify(body) })
      setMessage(result.message)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return <main className="simple-page"><section className="simple-card">
    <Link className="back-link" to="/login"><ArrowLeft size={16} /> Back to sign in</Link>
    {message ? <div className="success-state"><CheckCircle2 /><h1>{reset ? 'Password updated' : 'Check your inbox'}</h1><p>{message}</p><Link className="button button-dark" to="/login">Continue to sign in</Link></div> : <>
      <p className="eyebrow"><span /> Account recovery</p><h1>{reset ? 'Choose a new password.' : 'Forgot your password?'}</h1><p>{reset ? 'Use at least eight characters for your new password.' : 'Enter your email and we’ll send a secure reset link.'}</p>
      <form onSubmit={submit}><label>{reset ? 'New password' : 'Email address'}<input required minLength={reset ? 8 : undefined} type={reset ? 'password' : 'email'} value={reset ? password : email} onChange={(e) => reset ? setPassword(e.target.value) : setEmail(e.target.value)} /></label>{error && <p className="form-error">{error}</p>}<LoadingButton className="button button-dark full" loading={busy} loadingText={reset ? 'Updating password…' : 'Sending link…'}>{reset ? 'Update password' : 'Send reset link'}</LoadingButton></form>
    </>}
  </section></main>
}
