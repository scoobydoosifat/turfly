import { useEffect, useState } from 'react'
import { CalendarDays, Clock3, MapPin, TicketCheck, UserRound } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { money } from '../data'
import LoadingButton, { ButtonSpinner } from '../components/LoadingButton'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Dashboard() {
  const { user, setUser } = useAuth()
  const [bookings, setBookings] = useState([])
  const [profile, setProfile] = useState({ name: user.name, phone: user.phone })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState('')
  const [bookingToCancel, setBookingToCancel] = useState(null)
  useEffect(() => { api('/api/bookings/me').then(setBookings).catch((e) => setMessage(e.message)) }, [])

  async function saveProfile(event) {
    event.preventDefault(); if (saving) return; setSaving(true); setMessage('')
    try { const updated = await api('/api/users/me', { method: 'PUT', body: JSON.stringify(profile) }); setUser(updated); setMessage('Profile saved.') } catch (e) { setMessage(e.message) } finally { setSaving(false) }
  }

  async function cancel() {
    const id = bookingToCancel?.id
    if (!id) return
    if (cancelling) return
    setCancelling(id)
    try {
      await Promise.all([api(`/api/bookings/${id}`, { method: 'DELETE' }), new Promise((resolve) => window.setTimeout(resolve, 700))])
      setBookings((items) => items.map((item) => item.id === id ? { ...item, status: 'CANCELLED' } : item))
      setMessage('Booking cancelled.')
    } catch (e) { setMessage(e.message) } finally { setCancelling(''); setBookingToCancel(null) }
  }

  return <main className="dashboard-page"><div className="page-shell">
    <div className="dashboard-heading"><div><p className="eyebrow"><span /> Player dashboard</p><h1>Hello, {user.name.split(' ')[0]}.</h1><p>Your games and account details, in one place.</p></div><div className="profile-chip"><UserRound /><span><strong>{user.name}</strong><small>{user.email}</small></span></div></div>
    <div className="dashboard-grid"><section className="panel bookings-panel"><header><div><h2>My bookings</h2><p>{bookings.length ? `${bookings.length} reservation${bookings.length > 1 ? 's' : ''}` : 'Your bookings will appear here.'}</p></div><TicketCheck /></header>{bookings.length ? <div className="booking-list">{bookings.map((booking) => <article key={booking.id}><div className="booking-date"><strong>{new Date(`${booking.bookingDate}T12:00`).toLocaleDateString('en-US', { day: '2-digit' })}</strong><span>{new Date(`${booking.bookingDate}T12:00`).toLocaleDateString('en-US', { month: 'short' })}</span></div><div className="booking-info"><h3>{booking.pitchName}</h3><p><CalendarDays /> {booking.bookingDate} <Clock3 /> {booking.startTime?.slice(0, 5)}</p><p><MapPin /> Niketon, Dhaka</p></div><div className="booking-status"><span className={`status ${booking.status.toLowerCase()}`}>{booking.status.replaceAll('_', ' ')}</span><strong>{money(booking.amount)}</strong>{booking.paymentStatus !== 'PAID' && booking.status !== 'CANCELLED' && <button disabled={Boolean(cancelling)} onClick={() => setBookingToCancel(booking)}>{cancelling === booking.id ? <><ButtonSpinner /> Cancelling…</> : 'Cancel'}</button>}</div></article>)}</div> : <div className="empty-state"><CalendarDays /><h3>No games booked yet</h3><p>Choose a pitch and make the next plan official.</p><a className="button button-dark" href="/book">Find a slot</a></div>}</section>
      <aside className="panel profile-panel"><header><div><h2>Profile</h2><p>Keep your booking details current.</p></div><UserRound /></header><form onSubmit={saveProfile}><label>Full name<input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label><label>Email<input disabled value={user.email} /></label><label>Phone<input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>{message && <p className="form-note">{message}</p>}<LoadingButton className="button button-dark full" loading={saving} loadingText="Saving profile…">Save changes</LoadingButton></form></aside>
    </div>
  </div><ConfirmDialog open={Boolean(bookingToCancel)} title="Cancel this booking?" message={bookingToCancel ? `${bookingToCancel.pitchName} on ${bookingToCancel.bookingDate} will be released for another player.` : ''} eyebrow="Cancel booking" cancelText="No, keep booking" confirmText="Yes, cancel booking" loading={Boolean(cancelling)} loadingText="Cancelling…" onClose={() => setBookingToCancel(null)} onConfirm={cancel} /></main>
}
