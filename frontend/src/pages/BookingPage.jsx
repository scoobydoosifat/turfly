import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from '../router'
import { ArrowRight, CalendarDays, Check, Clock3, LockKeyhole, MapPin } from 'lucide-react'
import { api } from '../api'
import { demoPitches, money } from '../data'
import { useAuth } from '../context/AuthContext'
import LoadingButton from '../components/LoadingButton'

const pad = (value) => String(value).padStart(2, '0')
const localDate = (offset = 0) => {
  const date = new Date(); date.setDate(date.getDate() + offset)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
const demoSlots = Array.from({ length: 12 }, (_, index) => {
  const total = 7 * 60 + index * 90
  const end = total + 90
  return { startTime: `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`, endTime: `${pad(Math.floor(end / 60) % 24)}:${pad(end % 60)}`, available: ![3, 7].includes(index) }
})
const prettyTime = (time) => new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

export default function BookingPage() {
  const [params] = useSearchParams()
  const [pitches, setPitches] = useState(demoPitches)
  const [pitchId, setPitchId] = useState(params.get('pitch') || '')
  const [date, setDate] = useState(localDate(1))
  const [slots, setSlots] = useState(demoSlots)
  const [selected, setSelected] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  const chosenPitch = useMemo(() => pitches.find((item) => item.id === pitchId) || pitches[0], [pitches, pitchId])

  useEffect(() => {
    api('/api/pitches').then((data) => {
      if (!data.length) return
      setPitches(data)
      if (!pitchId || pitchId.startsWith('demo-')) setPitchId(data[0].id)
    }).catch(() => { if (!pitchId) setPitchId(demoPitches[0].id) })
  }, [])

  useEffect(() => {
    setSelected('')
    if (!pitchId || pitchId.startsWith('demo-')) { setSlots(demoSlots); return }
    api(`/api/bookings/availability?pitchId=${encodeURIComponent(pitchId)}&date=${date}`)
      .then((data) => setSlots(data.slots)).catch((error) => setMessage(error.message))
  }, [pitchId, date])

  async function book() {
    if (busy) return
    if (!user) { navigate('/login', { state: { from: `/book?pitch=${pitchId}` } }); return }
    if (!selected || !phone) { setMessage('Choose a time and enter your phone number.'); return }
    if (pitchId.startsWith('demo-')) { setMessage('Connect MongoDB to create live bookings. The booking interface is ready.'); return }
    setBusy(true); setMessage('')
    try {
      const booking = await api('/api/bookings', { method: 'POST', body: JSON.stringify({ pitchId, bookingDate: date, startTime: selected, phone }) })
      if (user.role === 'ADMIN') {
        navigate('/dashboard?booking=confirmed')
        return
      }
      const checkout = await api(`/api/payments/checkout/${booking.id}`, { method: 'POST' })
      if (checkout.demoMode) {
        await api(`/api/payments/demo-complete/${booking.id}`, { method: 'POST' })
        navigate('/payment/success')
      } else {
        // Open the hosted SSLCommerz checkout from the user's click. If the browser
        // blocks a popup, fall back to the same-tab flow so payment still works.
        const paymentWindow = window.open(checkout.checkoutUrl, 'turfly_sslcommerz_checkout', 'popup,width=520,height=760,resizable=yes,scrollbars=yes')
        if (!paymentWindow) window.location.assign(checkout.checkoutUrl)
      }
    } catch (error) { setMessage(error.message) } finally { setBusy(false) }
  }

  return <main className="booking-page">
    <section className="page-banner"><div className="page-shell"><p className="eyebrow light"><span /> Live availability</p><h1>Choose the time.<br /><em>We’ll hold the turf.</em></h1><p>Every reservation is a 90-minute session.</p></div></section>
    <section className="page-shell booking-layout">
      <div className="booking-main">
        <div className="booking-step"><span>1</span><div><h2>Choose a ground</h2><p>Pick the space that fits your game.</p></div></div>
        <div className="select-pitches">
          {pitches.map((pitch) => <button key={pitch.id} className={chosenPitch?.id === pitch.id ? 'selected' : ''} onClick={() => setPitchId(pitch.id)}><img src={pitch.imageUrl} alt="" /><span><strong>{pitch.name}</strong><small>{pitch.sport.replace('_', ' ')} · {money(pitch.pricePerHour)}/hr</small></span>{chosenPitch?.id === pitch.id && <Check />}</button>)}
        </div>
        <div className="booking-step"><span>2</span><div><h2>Choose a day</h2><p>Bookings open from today onward.</p></div></div>
        <label className="date-picker"><CalendarDays /><input type="date" min={localDate()} value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <div className="booking-step"><span>3</span><div><h2>Choose a time</h2><p>Times shown in Dhaka local time.</p></div></div>
        <div className="slot-grid">{slots.map((slot) => <button key={slot.startTime} disabled={!slot.available} className={selected === slot.startTime ? 'selected' : ''} onClick={() => setSelected(slot.startTime)}><Clock3 size={16} />{prettyTime(slot.startTime)}<small>{slot.available ? 'Available' : 'Booked'}</small></button>)}</div>
      </div>
      <aside className="booking-summary">
        {chosenPitch && <><img src={chosenPitch.imageUrl} alt={chosenPitch.name} /><p className="eyebrow"><span /> Your booking</p><h2>{chosenPitch.name}</h2><p className="summary-line"><MapPin size={16} /> {chosenPitch.location}</p><dl><div><dt>Date</dt><dd>{new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</dd></div><div><dt>Time</dt><dd>{selected ? `${prettyTime(selected)} · 90 min` : 'Choose a slot'}</dd></div><div><dt>Total</dt><dd>{money(Number(chosenPitch.pricePerHour) * 1.5)}</dd></div></dl><label>Booking phone<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" /></label>{message && <p className="form-note">{message}</p>}<LoadingButton type="button" className="button button-accent full" loading={busy} loadingText="Securing your slot…" onClick={book}>{user ? 'Continue to payment' : 'Sign in to book'} <ArrowRight size={17} /></LoadingButton><small className="secure-note"><LockKeyhole size={13} /> Secure checkout powered by SSLCommerz</small></>}
      </aside>
    </section>
  </main>
}
