import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BarChart3, CalendarCheck, Check, CheckCircle2, CreditCard, Edit3, ImagePlus, Inbox, LayoutGrid, MessageSquareText, Plus, Search, Tags, Trash2, UsersRound, XCircle } from 'lucide-react'
import { api } from '../api'
import { money } from '../data'
import LoadingButton, { ButtonSpinner } from '../components/LoadingButton'
import ConfirmDialog from '../components/ConfirmDialog'

const pad = (value) => String(value).padStart(2, '0')
const localDate = (offset = 0) => { const date = new Date(); date.setDate(date.getDate() + offset); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` }
const emptyPitch = { name: '', sport: 'FOOTBALL', description: '', location: 'Niketon, Dhaka', pricePerHour: 1800, capacity: 10, imageUrl: '/images/pitch-football.png', features: ['Floodlights', 'Changing room'], active: true }
const emptyCoupon = () => ({ code: '', discountType: 'PERCENTAGE', discountValue: 10, expiresOn: localDate(30), maxUses: 100, active: true })

export default function Admin() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState({ users: 0, pitches: 0, bookings: 0, confirmedBookings: 0, unreadMessages: 0 })
  const [bookings, setBookings] = useState([])
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [pitches, setPitches] = useState([])
  const [coupons, setCoupons] = useState([])
  const [notice, setNotice] = useState('')
  const [actionId, setActionId] = useState('')
  const [bookingQuery, setBookingQuery] = useState('')
  const [bookingStatus, setBookingStatus] = useState('ALL')
  const [paymentStatus, setPaymentStatus] = useState('ALL')

  const [showPitchForm, setShowPitchForm] = useState(false)
  const [pitchForm, setPitchForm] = useState(emptyPitch)
  const [savingPitch, setSavingPitch] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [editingPitch, setEditingPitch] = useState(null)
  const [pendingPitchUpdate, setPendingPitchUpdate] = useState(null)
  const [pitchToRemove, setPitchToRemove] = useState(null)

  const [showManual, setShowManual] = useState(false)
  const [pendingManual, setPendingManual] = useState(null)
  const [showCoupon, setShowCoupon] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [pendingCoupon, setPendingCoupon] = useState(null)
  const [couponToDelete, setCouponToDelete] = useState(null)
  const [editingMessage, setEditingMessage] = useState(null)
  const [bookingDecision, setBookingDecision] = useState(null)
  const [messageToResolve, setMessageToResolve] = useState(null)

  const load = () => Promise.all([
    api('/api/admin/stats'), api('/api/admin/bookings'), api('/api/admin/messages'),
    api('/api/admin/users'), api('/api/pitches'), api('/api/admin/coupons'),
  ]).then(([s, b, m, u, p, c]) => { setStats(s); setBookings(b); setMessages(m); setUsers(u); setPitches(p); setCoupons(c) })
    .catch((error) => setNotice(error.message))
  useEffect(() => { load() }, [])

  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    const text = `${booking.customerName} ${booking.customerEmail} ${booking.pitchName} ${booking.bookingDate}`.toLowerCase()
    return text.includes(bookingQuery.trim().toLowerCase())
      && (bookingStatus === 'ALL' || booking.status === bookingStatus)
      && (paymentStatus === 'ALL' || booking.paymentStatus === paymentStatus)
  }), [bookings, bookingQuery, bookingStatus, paymentStatus])

  function closePitchForm() {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setShowPitchForm(false); setEditingPitch(null); setPitchForm(emptyPitch); setImageFile(null); setImagePreview('')
  }
  function chooseImage(event) {
    const file = event.target.files?.[0]; if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) { setNotice('Use a JPG, PNG or WEBP image.'); event.target.value = ''; return }
    if (file.size > 8 * 1024 * 1024) { setNotice('Pitch images must be 8 MB or smaller.'); event.target.value = ''; return }
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImageFile(file); setImagePreview(URL.createObjectURL(file))
  }
  function openEditPitch(pitch) {
    if (actionId) return
    setEditingPitch(pitch); setPitchForm({ ...pitch, pricePerHour: Number(pitch.pricePerHour), capacity: Number(pitch.capacity), features: pitch.features || [] }); setImagePreview(pitch.imageUrl || ''); setImageFile(null)
  }
  async function uploadPitchImage(fallback) {
    if (!imageFile) return fallback
    const formData = new FormData(); formData.append('file', imageFile)
    return (await api('/api/admin/pitches/upload', { method: 'POST', body: formData })).imageUrl
  }
  async function createPitch(event) {
    event.preventDefault(); if (savingPitch) return; setSavingPitch(true); setNotice('')
    try {
      const imageUrl = await uploadPitchImage(pitchForm.imageUrl)
      await api('/api/admin/pitches', { method: 'POST', body: JSON.stringify({ ...pitchForm, imageUrl, pricePerHour: Number(pitchForm.pricePerHour), capacity: Number(pitchForm.capacity) }) })
      closePitchForm(); await load(); setNotice('Pitch created and ready for booking.')
    } catch (error) { setNotice(error.message) } finally { setSavingPitch(false) }
  }
  function reviewPitchUpdate(event) { event.preventDefault(); if (!savingPitch && editingPitch) setPendingPitchUpdate({ pitch: editingPitch, form: { ...pitchForm } }) }
  async function confirmPitchUpdate() {
    if (!pendingPitchUpdate || savingPitch) return; setSavingPitch(true); setNotice('')
    try {
      const imageUrl = await uploadPitchImage(pendingPitchUpdate.form.imageUrl)
      const form = pendingPitchUpdate.form
      await api(`/api/admin/pitches/${pendingPitchUpdate.pitch.id}`, { method: 'PUT', body: JSON.stringify({ ...form, imageUrl, pricePerHour: Number(form.pricePerHour), capacity: Number(form.capacity) }) })
      setPendingPitchUpdate(null); closePitchForm(); await load(); setNotice(`${form.name} was updated.`)
    } catch (error) { setNotice(error.message) } finally { setSavingPitch(false) }
  }
  async function confirmRemovePitch() {
    if (!pitchToRemove || actionId) return; const id = pitchToRemove.id; setActionId(id)
    try { await Promise.all([api(`/api/admin/pitches/${id}`, { method: 'DELETE' }), wait(700)]); await load(); setNotice(`${pitchToRemove.name} was removed.`) } catch (error) { setNotice(error.message) } finally { setActionId(''); setPitchToRemove(null) }
  }

  async function confirmManualBooking() {
    if (!pendingManual || actionId) return; setActionId('manual')
    try { await api('/api/admin/bookings/manual', { method: 'POST', body: JSON.stringify(pendingManual) }); setPendingManual(null); setShowManual(false); await load(); setNotice('Manual booking created and confirmed.') } catch (error) { setNotice(error.message) } finally { setActionId('') }
  }
  async function confirmCouponSave() {
    if (!pendingCoupon || actionId) return; setActionId('coupon-save')
    try {
      const target = editingCoupon ? `/api/admin/coupons/${editingCoupon.id}` : '/api/admin/coupons'
      await api(target, { method: editingCoupon ? 'PUT' : 'POST', body: JSON.stringify(pendingCoupon) })
      setPendingCoupon(null); setShowCoupon(false); setEditingCoupon(null); await load(); setNotice('Coupon saved successfully.')
    } catch (error) { setNotice(error.message) } finally { setActionId('') }
  }
  async function confirmCouponDelete() {
    if (!couponToDelete || actionId) return; setActionId(`coupon-${couponToDelete.id}`)
    try { await Promise.all([api(`/api/admin/coupons/${couponToDelete.id}`, { method: 'DELETE' }), wait(600)]); await load(); setNotice('Coupon removed.') } catch (error) { setNotice(error.message) } finally { setActionId(''); setCouponToDelete(null) }
  }
  function openCoupon(coupon = null) { setEditingCoupon(coupon); setShowCoupon(true) }

  async function saveMessage(update) {
    if (!editingMessage || actionId) return; setActionId(`message-${editingMessage.id}`)
    try { await api(`/api/admin/messages/${editingMessage.id}`, { method: 'PUT', body: JSON.stringify(update) }); setEditingMessage(null); await load(); setNotice('Message status and note updated.') } catch (error) { setNotice(error.message) } finally { setActionId('') }
  }
  async function confirmResolve() {
    if (!messageToResolve || actionId) return; setActionId(`message-${messageToResolve.id}`)
    try { await Promise.all([api(`/api/admin/messages/${messageToResolve.id}/resolve`, { method: 'PUT' }), wait(600)]); await load(); setNotice('Message marked as resolved.') } catch (error) { setNotice(error.message) } finally { setActionId(''); setMessageToResolve(null) }
  }
  function updateBooking(booking, decision) { if (!actionId) setBookingDecision({ booking, decision }) }
  async function confirmBookingDecision() {
    if (!bookingDecision || actionId) return
    const { booking, decision } = bookingDecision; setActionId(`${decision}-${booking.id}`); setNotice('')
    try { await Promise.all([api(`/api/admin/bookings/${booking.id}/${decision}`, { method: 'PUT' }), wait(650)]); await load(); setNotice(decision === 'confirm' ? 'Booking confirmed.' : 'Booking rejected. Review any required refund in SSLCommerz.') } catch (error) { setNotice(error.message) } finally { setActionId(''); setBookingDecision(null) }
  }

  const nav = [['overview', BarChart3, 'Overview'], ['bookings', CalendarCheck, 'Bookings'], ['pitches', LayoutGrid, 'Pitches'], ['coupons', Tags, 'Coupons'], ['messages', Inbox, 'Messages'], ['users', UsersRound, 'Users']]
  return <main className="admin-page"><aside className="admin-sidebar"><div className="brand brand-light"><span className="brand-mark"><span /></span><span>Tur<span className="brand-accent">fly</span></span></div><p>ADMIN CONSOLE</p><nav>{nav.map(([id, Icon, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon />{label}{id === 'messages' && stats.unreadMessages > 0 && <span>{stats.unreadMessages}</span>}</button>)}</nav><a className="admin-back" href="/"><ArrowLeft /> Back to home page</a></aside>
    <section className="admin-content"><header><div><p className="eyebrow"><span /> Management</p><h1>{nav.find(([id]) => id === tab)?.[2]}</h1></div><div className="admin-header-actions"><a className="button button-outline admin-home-button" href="/"><ArrowLeft /> Back to home page</a>{tab === 'bookings' && <button className="button button-dark" onClick={() => setShowManual(true)}><Plus /> Manual booking</button>}{tab === 'pitches' && <button className="button button-dark" onClick={() => setShowPitchForm(true)}><Plus /> Add pitch</button>}{tab === 'coupons' && <button className="button button-dark" onClick={() => openCoupon()}><Plus /> Add coupon</button>}</div></header>{notice && <p className="admin-notice">{notice}</p>}
      {tab === 'overview' && <><div className="stat-grid">{[['Pitches', stats.pitches, LayoutGrid], ['All bookings', stats.bookings, CalendarCheck], ['Confirmed', stats.confirmedBookings, Check], ['New messages', stats.unreadMessages, Inbox]].map(([label, value, Icon]) => <article key={label}><Icon /><span>{label}</span><strong>{value}</strong></article>)}</div><section className="panel"><header><div><h2>Recent bookings</h2><p>Paid bookings stay here until you approve or reject them.</p></div></header><BookingTable bookings={bookings.slice(0, 6)} actionId={actionId} onDecision={updateBooking} /></section></>}
      {tab === 'bookings' && <section className="panel"><header><div><h2>Booking management</h2><p>Search and filter reservations, then review paid requests.</p></div></header><BookingFilters query={bookingQuery} setQuery={setBookingQuery} status={bookingStatus} setStatus={setBookingStatus} payment={paymentStatus} setPayment={setPaymentStatus} /><BookingTable bookings={filteredBookings} actionId={actionId} onDecision={updateBooking} /></section>}
      {tab === 'pitches' && <section className="admin-card-grid">{pitches.map((pitch) => <article className={actionId === pitch.id ? 'removing' : ''} key={pitch.id}><div className="admin-pitch-image"><img src={pitch.imageUrl} alt={`${pitch.name} turf`} /><span>{pitch.active ? 'Live' : 'Hidden'}</span></div><div><span className="status confirmed">{pitch.sport.replace('_', ' ')}</span><h2>{pitch.name}</h2><p>{pitch.location}</p><strong>{money(pitch.pricePerHour)}/hour</strong><div className="admin-pitch-actions"><button type="button" className="admin-edit-button" disabled={Boolean(actionId)} onClick={() => openEditPitch(pitch)}><Edit3 /> Edit pitch</button><LoadingButton type="button" className="admin-remove-button" loading={actionId === pitch.id} disabled={Boolean(actionId)} loadingText="Removing pitch…" onClick={() => setPitchToRemove(pitch)}><Trash2 /> Remove</LoadingButton></div></div>{actionId === pitch.id && <div className="pitch-removing-overlay"><ButtonSpinner /><strong>Removing pitch…</strong><span>Please wait</span></div>}</article>)}</section>}
      {tab === 'coupons' && <CouponTable coupons={coupons} actionId={actionId} onEdit={openCoupon} onDelete={setCouponToDelete} />}
      {tab === 'messages' && <MessageList messages={messages} actionId={actionId} onEdit={setEditingMessage} onResolve={setMessageToResolve} />}
      {tab === 'users' && <section className="panel table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.phone}</td><td><span className="status">{user.role}</span></td></tr>)}</tbody></table></section>}
    </section>

    {showPitchForm && <PitchModal title="Add a new pitch" form={pitchForm} setForm={setPitchForm} preview={imagePreview} onImage={chooseImage} saving={savingPitch} onClose={closePitchForm} onSubmit={createPitch} submitText="Create pitch" />}
    {editingPitch && <PitchModal title="Update pitch" form={pitchForm} setForm={setPitchForm} preview={imagePreview} onImage={chooseImage} saving={savingPitch} onClose={closePitchForm} onSubmit={reviewPitchUpdate} submitText="Review changes" />}
    {showManual && <ManualBookingModal pitches={pitches} busy={actionId === 'manual'} onClose={() => setShowManual(false)} onReview={setPendingManual} />}
    {showCoupon && <CouponModal coupon={editingCoupon} busy={actionId === 'coupon-save'} onClose={() => { setShowCoupon(false); setEditingCoupon(null) }} onReview={setPendingCoupon} />}
    {editingMessage && <MessageModal message={editingMessage} busy={actionId === `message-${editingMessage.id}`} onClose={() => setEditingMessage(null)} onSave={saveMessage} />}

    <ConfirmDialog open={Boolean(pitchToRemove)} eyebrow="Remove pitch" title="Are you sure you want to remove this pitch?" message={pitchToRemove ? <><strong>{pitchToRemove.name}</strong> will disappear from live booking.</> : ''} cancelText="No, keep it" confirmText="Yes, remove pitch" loading={actionId === pitchToRemove?.id} loadingText="Removing…" onClose={() => setPitchToRemove(null)} onConfirm={confirmRemovePitch} />
    <ConfirmDialog open={Boolean(pendingPitchUpdate)} tone="approve" eyebrow="Save pitch changes" title="Save these pitch changes?" message={pendingPitchUpdate ? <><strong>{pendingPitchUpdate.form.name}</strong> will be updated.</> : ''} cancelText="No, keep editing" confirmText="Yes, save changes" loading={savingPitch} loadingText="Saving…" onClose={() => setPendingPitchUpdate(null)} onConfirm={confirmPitchUpdate} />
    <ConfirmDialog open={Boolean(pendingManual)} tone="approve" eyebrow="Manual booking" title="Create and confirm this booking?" message={pendingManual ? `${pendingManual.customerName} · ${pendingManual.bookingDate} at ${pendingManual.startTime}` : ''} cancelText="No, edit details" confirmText="Yes, create booking" loading={actionId === 'manual'} loadingText="Creating…" onClose={() => setPendingManual(null)} onConfirm={confirmManualBooking} />
    <ConfirmDialog open={Boolean(pendingCoupon)} tone="approve" eyebrow="Coupon management" title="Save this coupon?" message={pendingCoupon ? `${pendingCoupon.code} will offer a ${pendingCoupon.discountType === 'PERCENTAGE' ? `${pendingCoupon.discountValue}%` : money(pendingCoupon.discountValue)} discount.` : ''} cancelText="No, keep editing" confirmText="Yes, save coupon" loading={actionId === 'coupon-save'} loadingText="Saving…" onClose={() => setPendingCoupon(null)} onConfirm={confirmCouponSave} />
    <ConfirmDialog open={Boolean(couponToDelete)} eyebrow="Remove coupon" title="Remove this coupon?" message={couponToDelete ? `${couponToDelete.code} will no longer be available.` : ''} cancelText="No, keep it" confirmText="Yes, remove coupon" loading={actionId === `coupon-${couponToDelete?.id}`} loadingText="Removing…" onClose={() => setCouponToDelete(null)} onConfirm={confirmCouponDelete} />
    <ConfirmDialog open={Boolean(bookingDecision)} tone={bookingDecision?.decision === 'confirm' ? 'approve' : 'danger'} eyebrow={bookingDecision?.decision === 'confirm' ? 'Confirm booking' : 'Reject booking'} title={bookingDecision?.decision === 'confirm' ? 'Approve this paid booking?' : 'Reject this paid booking?'} message={bookingDecision ? `${bookingDecision.booking.customerName} · ${bookingDecision.booking.pitchName}` : ''} cancelText="No, go back" confirmText={bookingDecision?.decision === 'confirm' ? 'Yes, confirm booking' : 'Yes, reject booking'} loading={Boolean(actionId)} loadingText="Updating…" onClose={() => setBookingDecision(null)} onConfirm={confirmBookingDecision} />
    <ConfirmDialog open={Boolean(messageToResolve)} tone="approve" eyebrow="Resolve message" title="Mark this message as resolved?" message={messageToResolve?.subject || ''} cancelText="No, keep open" confirmText="Yes, mark resolved" loading={actionId === `message-${messageToResolve?.id}`} loadingText="Resolving…" onClose={() => setMessageToResolve(null)} onConfirm={confirmResolve} />
  </main>
}

const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

function BookingFilters({ query, setQuery, status, setStatus, payment, setPayment }) {
  return <div className="admin-filters"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Player, pitch, email or date" /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">All booking statuses</option><option value="PENDING_PAYMENT">Pending payment</option><option value="AWAITING_APPROVAL">Awaiting approval</option><option value="CONFIRMED">Confirmed</option><option value="CANCELLED">Cancelled</option></select><select value={payment} onChange={(event) => setPayment(event.target.value)}><option value="ALL">All payments</option><option value="UNPAID">Unpaid</option><option value="PAID">Paid</option><option value="REFUNDED">Refunded</option></select></div>
}

function BookingTable({ bookings, actionId, onDecision }) {
  if (!bookings.length) return <div className="empty-state"><CalendarCheck /><h3>No matching bookings</h3></div>
  return <div className="table-wrap"><table><thead><tr><th>Player</th><th>Pitch</th><th>Schedule</th><th>Amount</th><th>Payment</th><th>Booking</th><th>Action</th></tr></thead><tbody>{bookings.map((booking) => { const waiting = booking.status === 'AWAITING_APPROVAL' && booking.paymentStatus === 'PAID'; return <tr key={booking.id}><td><strong>{booking.customerName}</strong><small>{booking.customerEmail}</small></td><td>{booking.pitchName}</td><td>{booking.bookingDate}<small>{booking.startTime?.slice(0, 5)}–{booking.endTime?.slice(0, 5)}</small></td><td><strong>{money(booking.amount)}</strong>{booking.couponCode && <small>{booking.couponCode}</small>}</td><td><span className={`payment-pill ${booking.paymentStatus.toLowerCase()}`}><CreditCard />{booking.paymentStatus}</span></td><td><span className={`status ${booking.status.toLowerCase()}`}>{booking.status.replaceAll('_', ' ')}</span></td><td>{waiting ? <div className="booking-actions"><button className="approve" disabled={Boolean(actionId)} onClick={() => onDecision(booking, 'confirm')}>{actionId === `confirm-${booking.id}` ? <ButtonSpinner /> : <CheckCircle2 />} Confirm</button><button className="reject" disabled={Boolean(actionId)} onClick={() => onDecision(booking, 'reject')}>{actionId === `reject-${booking.id}` ? <ButtonSpinner /> : <XCircle />} Reject</button></div> : <span className="no-action">—</span>}</td></tr>})}</tbody></table></div>
}

function CouponTable({ coupons, actionId, onEdit, onDelete }) {
  return <section className="panel"><header><div><h2>Coupon codes</h2><p>Create simple percentage or fixed discounts.</p></div><Tags /></header>{coupons.length ? <div className="table-wrap"><table><thead><tr><th>Code</th><th>Discount</th><th>Expires</th><th>Usage</th><th>Status</th><th>Actions</th></tr></thead><tbody>{coupons.map((coupon) => <tr key={coupon.id}><td><strong>{coupon.code}</strong></td><td>{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : money(coupon.discountValue)}</td><td>{coupon.expiresOn}</td><td>{coupon.usedCount}/{coupon.maxUses}</td><td><span className={`status ${coupon.active ? 'confirmed' : 'cancelled'}`}>{coupon.active ? 'ACTIVE' : 'INACTIVE'}</span></td><td><div className="booking-actions"><button className="approve" disabled={Boolean(actionId)} onClick={() => onEdit(coupon)}><Edit3 /> Edit</button><button className="reject" disabled={Boolean(actionId)} onClick={() => onDelete(coupon)}><Trash2 /> Remove</button></div></td></tr>)}</tbody></table></div> : <div className="empty-state"><Tags /><h3>No coupons yet</h3><p>Create one when you are ready to run an offer.</p></div>}</section>
}

function MessageList({ messages, actionId, onEdit, onResolve }) {
  return <section className="message-list">{messages.map((message) => <article className={message.status === 'RESOLVED' ? 'resolved' : ''} key={message.id}><header><div><span className={`message-state ${message.status.toLowerCase()}`}>{message.status}</span><h3>{message.subject}</h3><p>{message.name} · {message.email} · {message.phone}</p></div><span>{message.createdAt ? new Date(message.createdAt).toLocaleDateString() : ''}</span></header><p>{message.message}</p>{message.adminNote && <div className="admin-note"><strong>Admin note</strong>{message.adminNote}</div>}<div className="message-actions"><button className="button button-outline" disabled={Boolean(actionId)} onClick={() => onEdit(message)}><MessageSquareText /> Update & note</button>{message.status !== 'RESOLVED' && <button className="button button-dark" disabled={Boolean(actionId)} onClick={() => onResolve(message)}><Check /> Resolve</button>}</div></article>)}</section>
}

function PitchModal({ title, form, setForm, preview, onImage, saving, onClose, onSubmit, submitText }) {
  return <div className="modal-backdrop" onMouseDown={() => !saving && onClose()}><form className="modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={onSubmit}><header><div><p className="eyebrow"><span /> Venue</p><h2>{title}</h2></div><button type="button" disabled={saving} onClick={onClose}>×</button></header><label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><div className="form-row"><label>Sport<select value={form.sport} onChange={(event) => setForm({ ...form, sport: event.target.value })}><option>FOOTBALL</option><option>CRICKET</option><option>MULTI_SPORT</option></select></label><label>Capacity<input type="number" min="2" max="30" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} /></label></div><label>Description<textarea required maxLength="1000" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label>Location<input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label><label>Price per hour<input type="number" min="100" value={form.pricePerHour} onChange={(event) => setForm({ ...form, pricePerHour: event.target.value })} /></label><label className="image-upload"><span>Pitch picture</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={onImage} /><div>{preview ? <img src={preview} alt="Pitch preview" /> : <><ImagePlus /><strong>Choose a pitch photo</strong><small>JPG, PNG or WEBP · up to 4 MB</small></>}</div></label><LoadingButton className="button button-dark full" loading={saving} loadingText="Saving…">{submitText}</LoadingButton></form></div>
}

function ManualBookingModal({ pitches, busy, onClose, onReview }) {
  const [form, setForm] = useState({ customerName: '', customerEmail: '', customerPhone: '', pitchId: pitches[0]?.id || '', bookingDate: localDate(1), startTime: '', paid: false })
  const [slots, setSlots] = useState([])
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (!form.pitchId) return
    api(`/api/bookings/availability?pitchId=${encodeURIComponent(form.pitchId)}&date=${form.bookingDate}`).then((data) => setSlots(data.slots)).catch((error) => setMessage(error.message))
  }, [form.pitchId, form.bookingDate])
  return <div className="modal-backdrop"><form className="modal" onSubmit={(event) => { event.preventDefault(); if (!form.startTime) { setMessage('Choose an available time slot.'); return }; onReview(form) }}><header><div><p className="eyebrow"><span /> Admin reservation</p><h2>Create manual booking</h2></div><button type="button" disabled={busy} onClick={onClose}>×</button></header><div className="form-row"><label>Customer name<input required value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} /></label><label>Customer email<input required type="email" value={form.customerEmail} onChange={(event) => setForm({ ...form, customerEmail: event.target.value })} /></label></div><label>Customer phone<input required value={form.customerPhone} onChange={(event) => setForm({ ...form, customerPhone: event.target.value })} /></label><div className="form-row"><label>Pitch<select value={form.pitchId} onChange={(event) => setForm({ ...form, pitchId: event.target.value, startTime: '' })}>{pitches.map((pitch) => <option value={pitch.id} key={pitch.id}>{pitch.name}</option>)}</select></label><label>Date<input type="date" min={localDate()} value={form.bookingDate} onChange={(event) => setForm({ ...form, bookingDate: event.target.value, startTime: '' })} /></label></div><label>Available slot<select required value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })}><option value="">Choose a slot</option>{slots.filter((slot) => slot.available).map((slot) => <option value={slot.startTime} key={slot.startTime}>{slot.startTime.slice(0, 5)}–{slot.endTime.slice(0, 5)}</option>)}</select></label><label className="checkbox-label"><input type="checkbox" checked={form.paid} onChange={(event) => setForm({ ...form, paid: event.target.checked })} /> Payment already received</label>{message && <p className="form-note">{message}</p>}<LoadingButton className="button button-dark full" loading={busy} loadingText="Creating…">Review booking</LoadingButton></form></div>
}

function CouponModal({ coupon, busy, onClose, onReview }) {
  const [form, setForm] = useState(coupon ? { ...coupon, discountValue: Number(coupon.discountValue) } : emptyCoupon())
  const review = (event) => {
    event.preventDefault()
    onReview({ code: form.code.trim().toUpperCase(), discountType: form.discountType,
      discountValue: Number(form.discountValue), expiresOn: form.expiresOn,
      maxUses: Number(form.maxUses), active: form.active })
  }
  return <div className="modal-backdrop"><form className="modal" onSubmit={review}><header><div><p className="eyebrow"><span /> Promotion</p><h2>{coupon ? 'Edit coupon' : 'Add coupon'}</h2></div><button type="button" disabled={busy} onClick={onClose}>×</button></header><label>Coupon code<input required maxLength="30" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="WELCOME10" /></label><div className="form-row"><label>Discount type<select value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value })}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed BDT</option></select></label><label>Discount value<input required type="number" min="1" max={form.discountType === 'PERCENTAGE' ? 100 : undefined} value={form.discountValue} onChange={(event) => setForm({ ...form, discountValue: event.target.value })} /></label></div><div className="form-row"><label>Expiry date<input required type="date" min={localDate()} value={form.expiresOn} onChange={(event) => setForm({ ...form, expiresOn: event.target.value })} /></label><label>Maximum uses<input required type="number" min="1" value={form.maxUses} onChange={(event) => setForm({ ...form, maxUses: event.target.value })} /></label></div><label className="checkbox-label"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Coupon is active</label><LoadingButton className="button button-dark full" loading={busy} loadingText="Saving…">Review coupon</LoadingButton></form></div>
}

function MessageModal({ message, busy, onClose, onSave }) {
  const [status, setStatus] = useState(message.status || 'NEW')
  const [adminNote, setAdminNote] = useState(message.adminNote || '')
  return <div className="modal-backdrop"><form className="modal" onSubmit={(event) => { event.preventDefault(); onSave({ status, adminNote }) }}><header><div><p className="eyebrow"><span /> Message tracking</p><h2>{message.subject}</h2></div><button type="button" disabled={busy} onClick={onClose}>×</button></header><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="NEW">New</option><option value="READ">Read</option><option value="RESOLVED">Resolved</option></select></label><label>Internal admin note<textarea maxLength="1000" value={adminNote} onChange={(event) => setAdminNote(event.target.value)} placeholder="What was discussed or what should happen next?" /></label><LoadingButton className="button button-dark full" loading={busy} loadingText="Saving…">Save status and note</LoadingButton></form></div>
}
