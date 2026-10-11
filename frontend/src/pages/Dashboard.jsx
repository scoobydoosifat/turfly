import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, Download, MapPin, Search, Star, TicketCheck, UserRound, X, Trash2 } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { money } from '../data'
import LoadingButton, { ButtonSpinner } from '../components/LoadingButton'
import ConfirmDialog from '../components/ConfirmDialog'

const isCompleted = (booking) => {
  if (booking.status !== 'CONFIRMED') return false
  const end = new Date(`${booking.bookingDate}T${booking.endTime || '00:00'}`)
  if ((booking.endTime || '') < (booking.startTime || '')) end.setDate(end.getDate() + 1)
  return end < new Date()
}

export default function Dashboard() {
  const { user, setUser } = useAuth()
  const { logout } = useAuth()
  const [bookings, setBookings] = useState([])
  const [reviewed, setReviewed] = useState(new Set())
  const [profile, setProfile] = useState({ name: user.name, phone: user.phone })
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ALL')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState('')
  const [bookingToCancel, setBookingToCancel] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [reviewBooking, setReviewBooking] = useState(null)
  const [deletePasswordOpen, setDeletePasswordOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deletePasswordError, setDeletePasswordError] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)

  const load = () => Promise.all([api('/api/bookings/me'), api('/api/reviews/me')])
    .then(([items, reviews]) => { setBookings(items); setReviewed(new Set(reviews.map((item) => item.bookingId))) })
    .catch((error) => setMessage(error.message))
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => bookings.filter((booking) => {
    const matchesStatus = status === 'ALL' || booking.status === status
    const text = `${booking.pitchName} ${booking.bookingDate} ${booking.paymentStatus}`.toLowerCase()
    return matchesStatus && text.includes(query.trim().toLowerCase())
  }), [bookings, query, status])

  async function saveProfile(event) {
    event.preventDefault(); if (saving) return; setSaving(true); setMessage('')
    try { const updated = await api('/api/users/me', { method: 'PUT', body: JSON.stringify(profile) }); setUser(updated); setMessage('Profile saved.') } catch (error) { setMessage(error.message) } finally { setSaving(false) }
  }

  async function cancel() {
    const id = bookingToCancel?.id
    if (!id || cancelling) return
    setCancelling(id)
    try {
      await Promise.all([api(`/api/bookings/${id}`, { method: 'DELETE' }), new Promise((resolve) => window.setTimeout(resolve, 700))])
      setBookings((items) => items.map((item) => item.id === id ? { ...item, status: 'CANCELLED' } : item))
      setMessage('Booking cancelled.')
    } catch (error) { setMessage(error.message) } finally { setCancelling(''); setBookingToCancel(null) }
  }

  async function verifyDeletePassword(event) {
    event.preventDefault(); if (deleteBusy) return
    setDeletePasswordError('')
    setDeleteBusy(true)
    try {
      await api('/api/users/me/verify-password', { method: 'POST', body: JSON.stringify({ password: deletePassword }) })
      setDeletePasswordOpen(false); setDeleteConfirmOpen(true)
    } catch (error) { setDeletePasswordError(error.message || 'Password is incorrect') } finally { setDeleteBusy(false) }
  }

  async function deleteAccount() {
    if (deleteBusy) return
    setDeleteBusy(true)
    try {
      await api('/api/users/me', { method: 'DELETE', body: JSON.stringify({ password: deletePassword }) })
      logout()
      window.location.href = '/'
    } catch (error) { setMessage(error.message); setDeleteConfirmOpen(false) } finally { setDeleteBusy(false) }
  }

  return <main className="dashboard-page"><div className="page-shell">
    <div className="dashboard-heading"><div><p className="eyebrow"><span /> Player dashboard</p><h1>Hello, {user.name.split(' ')[0]}.</h1><p>Your games, receipts and reviews in one place.</p></div><div className="profile-chip"><UserRound /><span><strong>{user.name}</strong><small>{user.email}</small></span></div></div>
    <div className="dashboard-grid"><section className="panel bookings-panel"><header><div><h2>My bookings</h2><p>{bookings.length ? `${bookings.length} reservation${bookings.length > 1 ? 's' : ''}` : 'Your bookings will appear here.'}</p></div><TicketCheck /></header>
      <div className="booking-filters"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pitch or date" /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">All statuses</option><option value="PENDING_PAYMENT">Pending payment</option><option value="AWAITING_APPROVAL">Awaiting approval</option><option value="CONFIRMED">Confirmed</option><option value="CANCELLED">Cancelled</option></select></div>
      {filtered.length ? <div className="booking-list">{filtered.map((booking) => <article key={booking.id}><div className="booking-date"><strong>{new Date(`${booking.bookingDate}T12:00`).toLocaleDateString('en-US', { day: '2-digit' })}</strong><span>{new Date(`${booking.bookingDate}T12:00`).toLocaleDateString('en-US', { month: 'short' })}</span></div><div className="booking-info"><h3>{booking.pitchName}</h3><p><CalendarDays /> {booking.bookingDate} <Clock3 /> {booking.startTime?.slice(0, 5)}</p><p><MapPin /> Niketon, Dhaka</p>{booking.couponCode && <small className="coupon-used">Coupon {booking.couponCode} · saved {money(booking.discountAmount)}</small>}</div><div className="booking-status"><span className={`status ${booking.status.toLowerCase()}`}>{booking.status.replaceAll('_', ' ')}</span><strong>{money(booking.amount)}</strong><div className="booking-card-actions"><button onClick={() => setReceipt(booking)}><Download /> Receipt</button>{isCompleted(booking) && !reviewed.has(booking.id) && <button onClick={() => setReviewBooking(booking)}><Star /> Review</button>}{booking.paymentStatus !== 'PAID' && booking.status !== 'CANCELLED' && <button disabled={Boolean(cancelling)} onClick={() => setBookingToCancel(booking)}>{cancelling === booking.id ? <><ButtonSpinner /> Cancelling…</> : 'Cancel'}</button>}</div></div></article>)}</div> : <div className="empty-state"><CalendarDays /><h3>No matching bookings</h3><p>Change the filters or book your next game.</p><a className="button button-dark" href="/book">Find a slot</a></div>}
    </section>
      <aside className="panel profile-panel"><header><div><h2>Profile</h2><p>Keep your booking details current.</p></div><UserRound /></header><form onSubmit={saveProfile}><label>Full name<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label><label>Email<input disabled value={user.email} /></label><label>Phone<input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>{message && <p className="form-note">{message}</p>}<LoadingButton className="button button-dark full" loading={saving} loadingText="Saving profile…">Save changes</LoadingButton></form><div className="account-danger"><div><strong>Delete account</strong><p>Permanently remove your Turfly account and sign out.</p></div><button type="button" className="button button-danger button-small" onClick={() => { setDeletePassword(''); setDeletePasswordError(''); setDeletePasswordOpen(true) }}><Trash2 size={15} /> Delete</button></div></aside>
    </div>
  </div>
  <ConfirmDialog open={Boolean(bookingToCancel)} title="Cancel this booking?" message={bookingToCancel ? `${bookingToCancel.pitchName} on ${bookingToCancel.bookingDate} will be released for another player.` : ''} eyebrow="Cancel booking" cancelText="No, keep booking" confirmText="Yes, cancel booking" loading={Boolean(cancelling)} loadingText="Cancelling…" onClose={() => setBookingToCancel(null)} onConfirm={cancel} />
  {receipt && <ReceiptModal booking={receipt} user={user} onClose={() => setReceipt(null)} />}
  {reviewBooking && <ReviewModal booking={reviewBooking} onClose={() => setReviewBooking(null)} onSaved={(bookingId) => { setReviewed((items) => new Set(items).add(bookingId)); setReviewBooking(null); setMessage('Thanks! Your review is now live.') }} />}
  {deletePasswordOpen && <DeletePasswordModal password={deletePassword} setPassword={(value) => { setDeletePassword(value); setDeletePasswordError('') }} error={deletePasswordError} busy={deleteBusy} onClose={() => { setDeletePasswordOpen(false); setDeletePasswordError('') }} onSubmit={verifyDeletePassword} />}
  <ConfirmDialog open={deleteConfirmOpen} eyebrow="Delete account" title="Are you sure you want to delete your account?" message="This permanently removes your account. Your completed booking records may remain for payment and venue history." cancelText="No, keep account" confirmText="Yes, delete account" loading={deleteBusy} loadingText="Deleting…" onClose={() => setDeleteConfirmOpen(false)} onConfirm={deleteAccount} />
  </main>
}

function DeletePasswordModal({ password, setPassword, error, busy, onClose, onSubmit }) {
  return <div className="modal-backdrop" onMouseDown={() => !busy && onClose()}><form className="modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={onSubmit}><header><div><p className="eyebrow"><span /> Security check</p><h2>Confirm your password</h2></div><button type="button" disabled={busy} onClick={onClose}><X /></button></header><p className="delete-password-copy">Enter your current password before we continue.</p><label>Password<input autoFocus required type="password" value={password} aria-invalid={Boolean(error)} aria-describedby={error ? 'delete-password-error' : undefined} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p id="delete-password-error" className="form-note form-error" role="alert">{error}</p>}<LoadingButton className="button button-danger full" loading={busy} loadingText="Checking…">Continue</LoadingButton></form></div>
}

function ReceiptModal({ booking, user, onClose }) {
  return <div className="modal-backdrop"><section className="modal receipt-modal"><header><div><p className="eyebrow"><span /> Booking receipt</p><h2>Turfly receipt</h2></div><button type="button" onClick={onClose}><X /></button></header><div className="receipt-print"><div className="receipt-brand">TURFLY <small>Niketon, Dhaka</small></div><dl><div><dt>Receipt ID</dt><dd>{booking.id}</dd></div><div><dt>Player</dt><dd>{booking.customerName || user.name}</dd></div><div><dt>Pitch</dt><dd>{booking.pitchName}</dd></div><div><dt>Schedule</dt><dd>{booking.bookingDate} · {booking.startTime?.slice(0, 5)}–{booking.endTime?.slice(0, 5)}</dd></div><div><dt>Payment</dt><dd>{booking.paymentStatus}</dd></div>{booking.paymentTransactionId && <div><dt>Transaction</dt><dd>{booking.paymentTransactionId}</dd></div>}{Number(booking.discountAmount) > 0 && <><div><dt>Original</dt><dd>{money(booking.originalAmount)}</dd></div><div><dt>Coupon</dt><dd>{booking.couponCode} · −{money(booking.discountAmount)}</dd></div></>}<div className="receipt-total"><dt>Total</dt><dd>{money(booking.amount)}</dd></div></dl></div><button className="button button-dark full" onClick={() => window.print()}><Download /> Print or save PDF</button></section></div>
}

function ReviewModal({ booking, onClose, onSaved }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(event) {
    event.preventDefault(); if (saving) return; setSaving(true); setMessage('')
    try {
      await api('/api/reviews', { method: 'POST', body: JSON.stringify({ bookingId: booking.id, rating, comment }) })
      onSaved(booking.id)
    } catch (error) { setMessage(error.message) } finally { setSaving(false) }
  }
  return <div className="modal-backdrop"><form className="modal review-modal" onSubmit={submit}><header><div><p className="eyebrow"><span /> Match review</p><h2>Rate {booking.pitchName}</h2></div><button type="button" disabled={saving} onClick={onClose}><X /></button></header><div className="star-picker" aria-label="Rating">{[1, 2, 3, 4, 5].map((value) => <button type="button" className={value <= rating ? 'active' : ''} onClick={() => setRating(value)} key={value}><Star /></button>)}</div><label>Your experience<textarea required maxLength="700" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Tell other players about the surface, lighting and overall experience." /></label>{message && <p className="form-note">{message}</p>}<LoadingButton className="button button-dark full" loading={saving} loadingText="Publishing review…">Publish review</LoadingButton></form></div>
}
