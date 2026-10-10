import { useState } from 'react'
import { Mail, MapPin, Phone } from 'lucide-react'
import { api } from '../api'
import { contact } from '../data'
import LoadingButton from '../components/LoadingButton'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    setBusy(true); setNotice('')
    try {
      await api('/api/contact', { method: 'POST', body: JSON.stringify(form) })
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
      setNotice('Thanks — your message is in our inbox.')
    } catch (error) { setNotice(error.message) } finally { setBusy(false) }
  }

  const change = (field) => (event) => setForm({ ...form, [field]: event.target.value })
  return <main className="contact-page">
    <section className="page-banner contact-banner"><div className="page-shell"><p className="eyebrow light"><span /> Talk to the team</p><h1>Questions before<br /><em>kick-off?</em></h1><p>We are happy to help with facilities, group bookings and match-day details.</p></div></section>
    <section className="page-shell contact-layout">
      <aside><p className="eyebrow"><span /> Reach us directly</p><h2>Come play in Niketon.</h2><p>Our team responds to messages as quickly as possible during opening hours.</p><a href={`tel:${contact.phone}`}><Phone /><span><small>Phone</small>{contact.phone}</span></a><a href={`mailto:${contact.email}`}><Mail /><span><small>Email</small>{contact.email}</span></a><div><MapPin /><span><small>Address</small>{contact.address}</span></div></aside>
      <form className="contact-form" onSubmit={submit}><div className="form-row"><label>Your name<input required maxLength="100" value={form.name} onChange={change('name')} /></label><label>Email address<input required type="email" maxLength="180" value={form.email} onChange={change('email')} /></label></div><div className="form-row"><label>Phone number<input required maxLength="20" value={form.phone} onChange={change('phone')} /></label><label>Subject<input required maxLength="120" value={form.subject} onChange={change('subject')} /></label></div><label>How can we help?<textarea required maxLength="1500" value={form.message} onChange={change('message')} /></label>{notice && <p className="form-note">{notice}</p>}<LoadingButton className="button button-dark" loading={busy} loadingText="Sending message…">Send message</LoadingButton></form>
    </section>
  </main>
}

