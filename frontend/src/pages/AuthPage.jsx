import { useState } from 'react'
import { Link, useLocation, useNavigate } from '../router'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import LoadingButton from '../components/LoadingButton'

export default function AuthPage({ mode }) {
  const register = mode === 'register'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [otp, setOtp] = useState('')
  const [verificationStep, setVerificationStep] = useState(false)
  const [notice, setNotice] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { saveAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function requestOtp() {
    const result = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(form) })
    setNotice(result.message)
    setOtp('')
    setVerificationStep(true)
  }

  async function submit(event) {
    event.preventDefault(); if (busy) return; setError(''); setBusy(true)
    try {
      if (register && !verificationStep) {
        await requestOtp()
        return
      }
      const path = register ? '/api/auth/register/verify' : '/api/auth/login'
      const body = register ? { email: form.email, otp } : { email: form.email, password: form.password }
      const data = await api(path, { method: 'POST', body: JSON.stringify(body) })
      saveAuth(data)
      navigate(location.state?.from || (data.user.role === 'ADMIN' ? '/admin' : '/dashboard'))
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function resendOtp() {
    if (busy) return
    setBusy(true); setError(''); setNotice('')
    try { await requestOtp() } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return <main className="auth-page">
    <section className="auth-visual"><Link to="/" className="brand brand-light"><span className="brand-mark"><span /></span><span>Tur<span className="brand-accent">fly</span></span></Link><div><p className="eyebrow light"><span /> Game on</p><h1>{register ? 'Your next match starts here.' : 'Welcome back to the game.'}</h1><p>Book quality turf in Niketon without the phone calls.</p></div></section>
    <section className="auth-form-wrap">
      <div className="auth-form">
        <p className="eyebrow"><span /> {register ? (verificationStep ? 'Verify email' : 'Create account') : 'Sign in'}</p>
        <h2>{register ? (verificationStep ? 'Check your inbox.' : 'Join Turfly') : 'Good to see you.'}</h2>
        {!verificationStep && <p>{register ? 'Already have an account?' : 'New to Turfly?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create one'}</Link></p>}
        <form onSubmit={submit}>
          {verificationStep ? <>
            <p className="verification-copy">We sent a 6-digit code to <strong>{form.email}</strong>. It expires in 10 minutes.</p>
            <label>Verification code<input className="otp-input" autoFocus required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" /></label>
            {notice && <p className="form-note">{notice}</p>}
          </> : <>
            {register && <label>Full name<input required maxLength="100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>}
            <label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
            {register && <label>Phone number<input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" /></label>}
            <label>Password<div className="password-input"><input required minLength="8" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
            {!register && <Link className="forgot-link" to="/forgot-password">Forgot password?</Link>}
          </>}
          {error && <p className="form-error">{error}</p>}
          <LoadingButton className="button button-dark full" loading={busy} loadingText={register ? (verificationStep ? 'Verifying…' : 'Sending code…') : 'Signing in…'}>{register ? (verificationStep ? 'Verify and create account' : 'Send verification code') : 'Sign in'} <ArrowRight size={17} /></LoadingButton>
          {verificationStep && <div className="verification-actions"><button type="button" disabled={busy} onClick={resendOtp}>Resend code</button><button type="button" disabled={busy} onClick={() => { setVerificationStep(false); setOtp(''); setNotice(''); setError('') }}>Change details</button></div>}
        </form>
      </div>
    </section>
  </main>
}
