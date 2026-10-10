import { Link } from '../router'
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { contact } from '../data'

export default function Footer() {
  return <footer className="footer" id="contact">
    <div className="footer-top page-shell">
      <div>
        <Link to="/" className="brand brand-light"><span className="brand-mark"><span /></span><span>Tur<span className="brand-accent">fly</span></span></Link>
        <p>Match-day energy, premium turf, and live booking in the heart of Dhaka.</p>
        <Link to="/book" className="footer-book">Reserve a slot <ArrowUpRight size={16} /></Link>
      </div>
      <div>
        <h3>Explore</h3>
        <Link to="/book">Book a turf</Link><Link to="/dashboard">My bookings</Link><Link to="/contact">Contact</Link><Link to="/login">Sign in</Link>
      </div>
      <div>
        <h3>Find us</h3>
        <a href={`tel:${contact.phone}`}><Phone size={16} /> {contact.phone}</a>
        <a href={`mailto:${contact.email}`}><Mail size={16} /> {contact.email}</a>
        <span><MapPin size={16} /> {contact.address}</span>
      </div>
      <div>
        <h3>Opening hours</h3>
        <p>Every day<br /><strong>7:00 AM — 1:00 AM</strong></p>
      </div>
    </div>
    <div className="footer-bottom page-shell"><span>© {new Date().getFullYear()} Turfly · Niketon, Dhaka</span><span>Built for the next game.</span></div>
  </footer>
}
