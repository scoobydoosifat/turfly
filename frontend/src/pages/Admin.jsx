import { useEffect, useState } from 'react'
import { ArrowLeft, BarChart3, CalendarCheck, Check, CheckCircle2, CreditCard, Edit3, ImagePlus, Inbox, LayoutGrid, Plus, Trash2, UsersRound, XCircle } from 'lucide-react'
import { api } from '../api'
import { money } from '../data'
import LoadingButton, { ButtonSpinner } from '../components/LoadingButton'
import ConfirmDialog from '../components/ConfirmDialog'

const emptyPitch = { name: '', sport: 'FOOTBALL', description: '', location: 'Niketon, Dhaka', pricePerHour: 1800, capacity: 10, imageUrl: '/images/pitch-football.png', features: ['Floodlights', 'Changing room'], active: true }

export default function Admin() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState({ users: 0, pitches: 0, bookings: 0, confirmedBookings: 0, unreadMessages: 0 })
  const [bookings, setBookings] = useState([])
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [pitches, setPitches] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [pitchForm, setPitchForm] = useState(emptyPitch)
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [pitchToRemove, setPitchToRemove] = useState(null)
  const [editingPitch, setEditingPitch] = useState(null)
  const [editImageFile, setEditImageFile] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState('')
  const [pendingPitchUpdate, setPendingPitchUpdate] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [bookingDecision, setBookingDecision] = useState(null)
  const [messageToResolve, setMessageToResolve] = useState(null)

  const load = () => Promise.all([
    api('/api/admin/stats'), api('/api/admin/bookings'), api('/api/admin/messages'), api('/api/admin/users'), api('/api/pitches'),
  ]).then(([s, b, m, u, p]) => { setStats(s); setBookings(b); setMessages(m); setUsers(u); setPitches(p) }).catch((e) => setNotice(e.message))
  useEffect(() => { load() }, [])

  async function createPitch(event) {
    event.preventDefault(); if (saving) return; setSaving(true); setNotice('')
    try {
      let imageUrl = pitchForm.imageUrl
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        const upload = await api('/api/admin/pitches/upload', { method: 'POST', body: formData })
        imageUrl = upload.imageUrl
      }
      await api('/api/admin/pitches', { method: 'POST', body: JSON.stringify({ ...pitchForm, imageUrl, pricePerHour: Number(pitchForm.pricePerHour), capacity: Number(pitchForm.capacity) }) })
      closePitchForm(); await load(); setNotice('Pitch created and ready for booking.')
    } catch (e) { setNotice(e.message) } finally { setSaving(false) }
  }
  function closePitchForm() {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setShowForm(false); setPitchForm(emptyPitch); setImageFile(null); setImagePreview('')
  }
  function chooseImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file); setImagePreview(URL.createObjectURL(file))
  }
  function openEditPitch(pitch) {
    if (actionId || updating) return
    setPitchForm({ ...pitch, pricePerHour: Number(pitch.pricePerHour), capacity: Number(pitch.capacity), features: pitch.features || [] })
    setEditingPitch(pitch); setEditImageFile(null); setEditImagePreview(pitch.imageUrl || '')
  }
  function closeEditPitch() {
    if (editImagePreview?.startsWith('blob:')) URL.revokeObjectURL(editImagePreview)
    setEditingPitch(null); setEditImageFile(null); setEditImagePreview('')
  }
  function chooseEditImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (editImagePreview?.startsWith('blob:')) URL.revokeObjectURL(editImagePreview)
    setEditImageFile(file); setEditImagePreview(URL.createObjectURL(file))
  }
  function submitPitchUpdate(event) {
    event.preventDefault()
    if (updating || !editingPitch) return
    setPendingPitchUpdate({ pitch: editingPitch, form: { ...pitchForm }, imageFile: editImageFile })
  }
  async function confirmPitchUpdate() {
    if (!pendingPitchUpdate || updating) return
    setUpdating(true); setNotice('')
    try {
      let imageUrl = pendingPitchUpdate.form.imageUrl
      if (pendingPitchUpdate.imageFile) {
        const formData = new FormData(); formData.append('file', pendingPitchUpdate.imageFile)
        const upload = await api('/api/admin/pitches/upload', { method: 'POST', body: formData })
        imageUrl = upload.imageUrl
      }
      const form = pendingPitchUpdate.form
      await api(`/api/admin/pitches/${pendingPitchUpdate.pitch.id}`, { method: 'PUT', body: JSON.stringify({ ...form, imageUrl, pricePerHour: Number(form.pricePerHour), capacity: Number(form.capacity) }) })
      await load(); setNotice(`${form.name} was updated.`); setPendingPitchUpdate(null); closeEditPitch()
    } catch (e) { setNotice(e.message) } finally { setUpdating(false) }
  }
  function removePitch(pitch) {
    if (actionId) return
    setPitchToRemove(pitch)
  }
  async function confirmRemovePitch() {
    if (!pitchToRemove || actionId) return
    const id = pitchToRemove.id
    setActionId(id)
    try {
      await Promise.all([
        api(`/api/admin/pitches/${id}`, { method: 'DELETE' }),
        new Promise((resolve) => window.setTimeout(resolve, 900)),
      ])
      await load()
      setNotice(`${pitchToRemove.name} was removed.`)
    } catch (e) { setNotice(e.message) } finally { setActionId(''); setPitchToRemove(null) }
  }
  async function confirmResolve() {
    const id = messageToResolve?.id
    if (!id || actionId) return
    setActionId(id)
    try {
      await Promise.all([api(`/api/admin/messages/${id}/resolve`, { method: 'PUT' }), new Promise((resolve) => window.setTimeout(resolve, 700))])
      await load(); setNotice('Message marked as resolved.')
    } catch (e) { setNotice(e.message) } finally { setActionId(''); setMessageToResolve(null) }
  }
  function updateBooking(booking, decision) {
    if (actionId) return
    setBookingDecision({ booking, decision })
  }
  async function confirmBookingDecision() {
    if (!bookingDecision || actionId) return
    const { booking, decision } = bookingDecision
    const id = booking.id
    const key = `${decision}-${id}`
    setActionId(key); setNotice('')
    try {
      await Promise.all([
        api(`/api/admin/bookings/${id}/${decision}`, { method: 'PUT' }),
        new Promise((resolve) => window.setTimeout(resolve, 700)),
      ])
      await load()
      setNotice(decision === 'confirm' ? 'Booking confirmed.' : 'Booking rejected. Review any required refund in SSLCommerz.')
    } catch (e) { setNotice(e.message) } finally { setActionId(''); setBookingDecision(null) }
  }

  const nav = [['overview', BarChart3, 'Overview'], ['bookings', CalendarCheck, 'Bookings'], ['pitches', LayoutGrid, 'Pitches'], ['messages', Inbox, 'Messages'], ['users', UsersRound, 'Users']]
  return <main className="admin-page"><aside className="admin-sidebar"><div className="brand brand-light"><span className="brand-mark"><span /></span><span>Tur<span className="brand-accent">fly</span></span></div><p>ADMIN CONSOLE</p><nav>{nav.map(([id, Icon, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon />{label}{id === 'messages' && stats.unreadMessages > 0 && <span>{stats.unreadMessages}</span>}</button>)}</nav><a className="admin-back" href="/"><ArrowLeft /> Back to home page</a></aside>
    <section className="admin-content"><header><div><p className="eyebrow"><span /> Management</p><h1>{nav.find(([id]) => id === tab)?.[2]}</h1></div><div className="admin-header-actions"><a className="button button-outline admin-home-button" href="/"><ArrowLeft /> Website</a>{tab === 'pitches' && <button className="button button-dark" onClick={() => setShowForm(true)}><Plus /> Add pitch</button>}</div></header>{notice && <p className="admin-notice">{notice}</p>}
      {tab === 'overview' && <><div className="stat-grid">{[['Pitches', stats.pitches, LayoutGrid], ['All bookings', stats.bookings, CalendarCheck], ['Confirmed', stats.confirmedBookings, Check], ['New messages', stats.unreadMessages, Inbox]].map(([label, value, Icon]) => <article key={label}><Icon /><span>{label}</span><strong>{value}</strong></article>)}</div><section className="panel"><header><div><h2>Recent bookings</h2><p>Paid bookings stay here until you approve or reject them.</p></div></header><BookingTable bookings={bookings.slice(0, 6)} actionId={actionId} onDecision={updateBooking} /></section></>}
      {tab === 'bookings' && <section className="panel"><header><div><h2>Booking approvals</h2><p>Verify the paid badge, then confirm or reject the request.</p></div></header><BookingTable bookings={bookings} actionId={actionId} onDecision={updateBooking} /></section>}
      {tab === 'pitches' && <section className="admin-card-grid">{pitches.map((pitch) => <article className={actionId === pitch.id ? 'removing' : ''} key={pitch.id}><div className="admin-pitch-image"><img src={pitch.imageUrl} alt={`${pitch.name} turf`} /><span>{pitch.active ? 'Live' : 'Hidden'}</span></div><div><span className="status confirmed">{pitch.sport.replace('_', ' ')}</span><h2>{pitch.name}</h2><p>{pitch.location}</p><strong>{money(pitch.pricePerHour)}/hour</strong><div className="admin-pitch-actions"><button type="button" className="admin-edit-button" disabled={Boolean(actionId) || updating} onClick={() => openEditPitch(pitch)}><Edit3 /> Edit pitch</button><LoadingButton type="button" className="admin-remove-button" loading={actionId === pitch.id} disabled={Boolean(actionId) || updating} loadingText="Removing pitch…" onClick={() => removePitch(pitch)}><Trash2 /> Remove</LoadingButton></div></div>{actionId === pitch.id && <div className="pitch-removing-overlay" role="status" aria-live="polite"><ButtonSpinner /><strong>Removing pitch…</strong><span>Please wait</span></div>}</article>)}</section>}
      {tab === 'messages' && <section className="message-list">{messages.map((message) => <article className={message.resolved ? 'resolved' : ''} key={message.id}><header><div><h3>{message.subject}</h3><p>{message.name} · {message.email} · {message.phone}</p></div><span>{message.createdAt ? new Date(message.createdAt).toLocaleDateString() : ''}</span></header><p>{message.message}</p>{!message.resolved && <LoadingButton type="button" className="button button-outline" loading={actionId === message.id} disabled={Boolean(actionId)} loadingText="Resolving…" onClick={() => setMessageToResolve(message)}><Check /> Mark resolved</LoadingButton>}</article>)}</section>}
      {tab === 'users' && <section className="panel table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.phone}</td><td><span className="status">{user.role}</span></td></tr>)}</tbody></table></section>}
    </section>
    {showForm && <div className="modal-backdrop" onMouseDown={() => !saving && closePitchForm()}><form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={createPitch}><header><div><p className="eyebrow"><span /> New venue</p><h2>Add a new pitch</h2></div><button type="button" disabled={saving} onClick={closePitchForm}>×</button></header><label>Name<input required value={pitchForm.name} onChange={(e) => setPitchForm({ ...pitchForm, name: e.target.value })} /></label><div className="form-row"><label>Sport<select value={pitchForm.sport} onChange={(e) => setPitchForm({ ...pitchForm, sport: e.target.value })}><option>FOOTBALL</option><option>CRICKET</option><option>MULTI_SPORT</option></select></label><label>Capacity<input type="number" min="2" max="30" value={pitchForm.capacity} onChange={(e) => setPitchForm({ ...pitchForm, capacity: e.target.value })} /></label></div><label>Description<textarea required maxLength="1000" value={pitchForm.description} onChange={(e) => setPitchForm({ ...pitchForm, description: e.target.value })} /></label><label>Location<input required value={pitchForm.location} onChange={(e) => setPitchForm({ ...pitchForm, location: e.target.value })} /></label><label>Price per hour<input type="number" min="100" value={pitchForm.pricePerHour} onChange={(e) => setPitchForm({ ...pitchForm, pricePerHour: e.target.value })} /></label><label className="image-upload"><span>Pitch picture</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} /><div>{imagePreview ? <img src={imagePreview} alt="New pitch preview" /> : <><ImagePlus /><strong>Choose a pitch photo</strong><small>JPG, PNG or WEBP · up to 4 MB</small></>}</div></label><LoadingButton className="button button-dark full" loading={saving} loadingText="Uploading and creating…">Create pitch</LoadingButton></form></div>}
    {editingPitch && <div className="modal-backdrop" onMouseDown={() => !updating && !pendingPitchUpdate && closeEditPitch()}><form className="modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={submitPitchUpdate}><header><div><p className="eyebrow"><span /> Edit venue</p><h2>Update pitch</h2></div><button type="button" disabled={updating} onClick={closeEditPitch}>×</button></header><label>Name<input required value={pitchForm.name} onChange={(e) => setPitchForm({ ...pitchForm, name: e.target.value })} /></label><div className="form-row"><label>Sport<select value={pitchForm.sport} onChange={(e) => setPitchForm({ ...pitchForm, sport: e.target.value })}><option>FOOTBALL</option><option>CRICKET</option><option>MULTI_SPORT</option></select></label><label>Capacity<input type="number" min="2" max="30" value={pitchForm.capacity} onChange={(e) => setPitchForm({ ...pitchForm, capacity: e.target.value })} /></label></div><label>Description<textarea required maxLength="1000" value={pitchForm.description} onChange={(e) => setPitchForm({ ...pitchForm, description: e.target.value })} /></label><label>Location<input required value={pitchForm.location} onChange={(e) => setPitchForm({ ...pitchForm, location: e.target.value })} /></label><label>Price per hour<input type="number" min="100" value={pitchForm.pricePerHour} onChange={(e) => setPitchForm({ ...pitchForm, pricePerHour: e.target.value })} /></label><label className="image-upload"><span>Pitch picture</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseEditImage} /><div>{editImagePreview ? <img src={editImagePreview} alt="Pitch preview" /> : <><ImagePlus /><strong>Choose a pitch photo</strong><small>JPG, PNG or WEBP · up to 4 MB</small></>}</div></label><LoadingButton className="button button-dark full" loading={updating} loadingText="Saving changes…">Review changes</LoadingButton></form></div>}
    <ConfirmDialog open={Boolean(pitchToRemove)} eyebrow="Remove pitch" title="Are you sure you want to remove this pitch?" message={pitchToRemove ? <><strong>{pitchToRemove.name}</strong> will disappear from live booking. This action cannot be undone.</> : ''} cancelText="No, keep it" confirmText="Yes, remove pitch" loading={actionId === pitchToRemove?.id} loadingText="Removing…" onClose={() => setPitchToRemove(null)} onConfirm={confirmRemovePitch} />
    <ConfirmDialog open={Boolean(pendingPitchUpdate)} tone="approve" eyebrow="Save pitch changes" title="Save these pitch changes?" message={pendingPitchUpdate ? <><strong>{pendingPitchUpdate.form.name}</strong> will be updated with the new details.</> : ''} cancelText="No, keep editing" confirmText="Yes, save changes" loading={updating} loadingText="Saving changes…" onClose={() => !updating && setPendingPitchUpdate(null)} onConfirm={confirmPitchUpdate} />
    <ConfirmDialog open={Boolean(bookingDecision)} tone={bookingDecision?.decision === 'confirm' ? 'approve' : 'danger'} eyebrow={bookingDecision?.decision === 'confirm' ? 'Confirm booking' : 'Reject booking'} title={bookingDecision?.decision === 'confirm' ? 'Approve this paid booking?' : 'Reject this paid booking?'} message={bookingDecision ? (bookingDecision.decision === 'confirm' ? `${bookingDecision.booking.customerName} will receive confirmed status for ${bookingDecision.booking.pitchName}.` : `${bookingDecision.booking.customerName}'s slot will be released. Any required refund should be reviewed in SSLCommerz.`) : ''} cancelText="No, go back" confirmText={bookingDecision?.decision === 'confirm' ? 'Yes, confirm booking' : 'Yes, reject booking'} loading={Boolean(actionId)} loadingText={bookingDecision?.decision === 'confirm' ? 'Confirming…' : 'Rejecting…'} onClose={() => setBookingDecision(null)} onConfirm={confirmBookingDecision} />
    <ConfirmDialog open={Boolean(messageToResolve)} tone="approve" eyebrow="Resolve message" title="Mark this message as resolved?" message={messageToResolve ? `“${messageToResolve.subject}” will move to the resolved state.` : ''} cancelText="No, keep open" confirmText="Yes, mark resolved" loading={actionId === messageToResolve?.id} loadingText="Resolving…" onClose={() => setMessageToResolve(null)} onConfirm={confirmResolve} />
  </main>
}

function BookingTable({ bookings, actionId, onDecision }) {
  if (!bookings.length) return <div className="empty-state"><CalendarCheck /><h3>No bookings yet</h3></div>
  return <div className="table-wrap"><table><thead><tr><th>Player</th><th>Pitch</th><th>Schedule</th><th>Amount</th><th>Payment</th><th>Booking</th><th>Action</th></tr></thead><tbody>{bookings.map((booking) => { const waiting = booking.status === 'AWAITING_APPROVAL' && booking.paymentStatus === 'PAID'; return <tr key={booking.id}><td><strong>{booking.customerName}</strong><small>{booking.customerEmail}</small></td><td>{booking.pitchName}</td><td>{booking.bookingDate}<small>{booking.startTime?.slice(0, 5)}–{booking.endTime?.slice(0, 5)}</small></td><td><strong>{money(booking.amount)}</strong></td><td><span className={`payment-pill ${booking.paymentStatus.toLowerCase()}`}><CreditCard />{booking.paymentStatus}</span></td><td><span className={`status ${booking.status.toLowerCase()}`}>{booking.status.replaceAll('_', ' ')}</span></td><td>{waiting ? <div className="booking-actions"><button className="approve" disabled={Boolean(actionId)} onClick={() => onDecision(booking, 'confirm')}>{actionId === `confirm-${booking.id}` ? <ButtonSpinner /> : <CheckCircle2 />} Confirm</button><button className="reject" disabled={Boolean(actionId)} onClick={() => onDecision(booking, 'reject')}>{actionId === `reject-${booking.id}` ? <ButtonSpinner /> : <XCircle />} Reject</button></div> : <span className="no-action">—</span>}</td></tr>})}</tbody></table></div>
}
