import { useState } from 'react'
import { Link, useLocation, useNavigate } from '../router'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import LoadingButton from '../components/LoadingButton'

export default function AuthPage({ mode }) {
  const register = mode === 'register'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { saveAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function submit(event) {
    event.preventDefault(); if (busy) return; setError(''); setBusy(true)
    try {
      const body = register ? form : { email: form.email, password: form.password }
      const data = await api(`/api/auth/${register ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(body) })
      saveAuth(data)
      navigate(location.state?.from || (data.user.role === 'ADMIN' ? '/admin' : '/dashboard'))
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return <main className="auth-page">
    <section className="auth-visual"><Link to="/" className="brand brand-light"><span className="brand-mark"><span /></span><span>Tur<span className="brand-accent">fly</span></span></Link><div><p className="eyebrow light"><span /> Game on</p><h1>{register ? 'Your next match starts here.' : 'Welcome back to the game.'}</h1><p>Book quality turf in Niketon without the phone calls.</p></div></section>
    <section className="auth-form-wrap">
      <div className="auth-form">
        <p className="eyebrow"><span /> {register ? 'Create account' : 'Sign in'}</p>
        <h2>{register ? 'Join Turfly' : 'Good to see you.'}</h2>
        <p>{register ? 'Already have an account?' : 'New to Turfly?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create one'}</Link></p>
        <form onSubmit={submit}>
          {register && <label>Full name<input required maxLength="100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>}
          <label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
          {register && <label>Phone number<input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" /></label>}
          <label>Password<div className="password-input"><input required minLength="8" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
          {!register && <Link className="forgot-link" to="/forgot-password">Forgot password?</Link>}
          {error && <p className="form-error">{error}</p>}
          <LoadingButton className="button button-dark full" loading={busy} loadingText={register ? 'Creating account…' : 'Signing in…'}>{register ? 'Create account' : 'Sign in'} <ArrowRight size={17} /></LoadingButton>
        </form>
      </div>
    </section>
  </main>
}
