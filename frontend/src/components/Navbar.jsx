import { useState } from 'react'
import { Link, NavLink, useNavigate } from '../router'
import { Clock3, MapPin, Menu, Phone, X, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { contact } from '../data'
import ConfirmDialog from './ConfirmDialog'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const close = () => setOpen(false)

  function signOut() {
    logout()
    setConfirmSignOut(false)
    close()
    navigate('/')
  }

  function openPitches(event) {
    event.preventDefault()
    close()

    const scrollToPitches = (attempt = 0) => {
      const section = document.getElementById('pitches')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (attempt < 10) {
        window.setTimeout(() => scrollToPitches(attempt + 1), 40)
      }
    }

    if (window.location.pathname !== '/') navigate('/')
    window.setTimeout(scrollToPitches, 0)
  }

  return <>
  <header className="site-header">
    <div className="utility-bar">
      <div className="nav-shell utility-inner">
        <span><MapPin size={13} /> {contact.address}</span>
        <span><Clock3 size={13} /> Open daily · 7 AM – 1 AM</span>
        <a href={`tel:${contact.phone}`}><Phone size={13} /> {contact.phone}</a>
      </div>
    </div>
    <div className="nav-shell main-nav">
      <Link to="/" className="brand" onClick={close} aria-label="Turfly home">
        <span className="brand-mark"><span /></span>
        <span>Tur<span className="brand-accent">fly</span></span>
      </Link>
      <div className="mobile-controls">
        <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <nav className={open ? 'nav-links open' : 'nav-links'}>
        <NavLink to="/" onClick={close}>Home</NavLink>
        <NavLink to="/book" onClick={close}>Book a turf</NavLink>
        <a href="/#pitches" onClick={openPitches}>Pitches</a>
        <NavLink to="/contact" onClick={close}>Contact</NavLink>
        {user?.role === 'ADMIN' && <NavLink to="/admin" onClick={close}>Admin</NavLink>}
        {user ? <>
          <NavLink to="/dashboard" className="nav-user" onClick={close}><UserRound size={17} /> {user.name.split(' ')[0]}</NavLink>
          <button className="text-button" onClick={() => setConfirmSignOut(true)}>Sign out</button>
        </> : <>
          <NavLink to="/login" onClick={close}>Sign in</NavLink>
          <NavLink to="/register" className="button button-small button-accent" onClick={close}>Join Turfly</NavLink>
        </>}
      </nav>
    </div>
  </header>
  <ConfirmDialog open={confirmSignOut} tone="session" eyebrow="Account session" title="Are you sure you want to sign out?" message="You’ll need to sign in again to view your bookings and account dashboard." cancelText="No, stay signed in" confirmText="Yes, sign out" onClose={() => setConfirmSignOut(false)} onConfirm={signOut} />
  </>
}
