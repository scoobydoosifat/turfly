import { useEffect, useState } from 'react'
import { Link } from '../router'
import {
  ArrowRight, CalendarCheck, Car, Check, Clock3, Coffee, MapPin,
  ShieldCheck, Shirt, Sparkles, Star, Trophy, Wifi, Zap,
} from 'lucide-react'
import { api } from '../api'
import { contact, demoPitches, money } from '../data'
import Reveal from '../components/Reveal'

const amenities = [
  [ShieldCheck, 'Maintained turf', 'Match-ready surfaces checked for every session.'],
  [Shirt, 'Changing space', 'Arrive, reset, and leave comfortably after the game.'],
  [Coffee, 'Player lounge', 'A place for the team to regroup before kick-off.'],
  [Car, 'Easy arrival', 'A convenient Niketon location for teams across Dhaka.'],
  [Wifi, 'Connected venue', 'Stay online while you wait for your session.'],
  [Zap, 'Floodlit nights', 'Bright evening play until 1 AM, every day.'],
]

export default function Home() {
  const [pitches, setPitches] = useState(demoPitches)
  useEffect(() => {
    let mounted = true
    const refreshPitches = () => api('/api/pitches', { cache: 'no-store' })
      .then((data) => mounted && data.length && setPitches(data))
      .catch(() => {})
    refreshPitches()
    window.addEventListener('focus', refreshPitches)
    return () => { mounted = false; window.removeEventListener('focus', refreshPitches) }
  }, [])

  return <main>
    <section className="hero">
      <div className="hero-backdrop" />
      <div className="hero-grid-lines" />
      <div className="page-shell hero-layout">
        <div className="hero-content">
          <p className="eyebrow light hero-kicker"><span /> Niketon · live booking <i>Open now</i></p>
          <h1>Own the pitch.<br /><em>Play your game.</em></h1>
          <p className="hero-copy">Premium football and cricket turf in Dhaka. See a live slot, secure it online, and arrive ready to play.</p>
          <div className="hero-actions">
            <Link className="button button-accent button-large" to="/book">Book a field <ArrowRight size={18} /></Link>
            <a className="button button-ghost button-large" href="#pitches">Explore arenas</a>
          </div>
          <div className="hero-stats">
            <div><strong>03</strong><span>Live arenas</span></div>
            <div><strong>7AM–1AM</strong><span>Every day</span></div>
            <div><strong>90 MIN</strong><span>Focused sessions</span></div>
          </div>
        </div>

        <div className="hero-playground" aria-hidden="true">
          <div className="pitch-board">
            <span className="pitch-halfway" /><span className="pitch-center-circle" />
            <span className="pitch-box pitch-box-left" /><span className="pitch-box pitch-box-right" />
            <span className="pitch-goal pitch-goal-left" /><span className="pitch-goal pitch-goal-right" />
          </div>
          <div className="orbit orbit-one sport-orbit"><span className="orbit-football">⚽</span></div>
          <div className="orbit orbit-two sport-orbit"><span className="orbit-bat"><i /></span></div>
          <div className="hero-card hero-card-live">
            <span className="live-dot" />
            <small>LIVE SLOTS</small>
            <strong>Tonight is open</strong>
            <span>Choose your arena →</span>
          </div>
          <div className="hero-card hero-card-score">
            <Trophy size={18} />
            <span><small>THE NEXT MATCH</small><strong>Starts with Turfly</strong></span>
          </div>
        </div>
      </div>
      <div className="hero-index">01 <span /> 04</div>
      <a href="#pitches" className="scroll-cue"><span /> Explore the venue</a>
    </section>

    <div className="motion-strip" aria-hidden="true">
      <div>FOOTBALL <span>✦</span> CRICKET <span>✦</span> FLOODLIGHTS <span>✦</span> LIVE SLOTS <span>✦</span> NIKETON <span>✦</span> FOOTBALL <span>✦</span> CRICKET <span>✦</span> FLOODLIGHTS <span>✦</span></div>
    </div>

    <section className="quick-book-section">
      <Reveal className="page-shell quick-book">
        <div className="quick-intro"><p className="eyebrow"><span /> Fast lane</p><h2>Three choices.<br />Then game on.</h2></div>
        <div className="quick-fields">
          <label><MapPin size={19} /><span><small>Venue</small>{contact.address}</span></label>
          <label><CalendarCheck size={19} /><span><small>Day</small>Choose your date</span></label>
          <label><Clock3 size={19} /><span><small>Session</small>Pick a live slot</span></label>
          <Link to="/book" className="button button-dark">Find a slot <ArrowRight size={17} /></Link>
        </div>
      </Reveal>
    </section>

    <section className="section page-shell arena-section" id="pitches">
      <Reveal className="section-heading">
        <div><p className="eyebrow"><span /> Arenas & pricing</p><h2>Pick the energy<br />that fits your team.</h2></div>
        <div className="section-side"><span className="section-count">01 / 03</span><p>Purpose-built surfaces, clear pricing, and booking that takes less time than the group chat.</p></div>
      </Reveal>
      <div className="pitch-grid">
        {pitches.slice(0, 3).map((pitch, index) => <Reveal key={pitch.id} delay={index * 90} className="pitch-card">
          <div className="pitch-image">
            <img src={pitch.imageUrl} alt={`${pitch.name} turf`} />
            <span>{pitch.sport.replace('_', ' ')}</span>
            <b>0{index + 1}</b>
            <Link className="card-image-link" to={`/book?pitch=${pitch.id}`}><ArrowRight /></Link>
          </div>
          <div className="pitch-card-body">
            <div><div><small>{pitch.capacity} PLAYERS · FLOODLIT</small><h3>{pitch.name}</h3></div><p><MapPin size={14} /> {pitch.location}</p></div>
            <p>{pitch.description}</p>
            <div className="feature-row">{pitch.features?.slice(0, 3).map((feature) => <span key={feature}><Check size={13} />{feature}</span>)}</div>
            <div className="card-bottom"><p>From <strong>{money(pitch.pricePerHour)}</strong><small>/ hour</small></p><Link to={`/book?pitch=${pitch.id}`}>View live slots <ArrowRight size={16} /></Link></div>
          </div>
        </Reveal>)}
      </div>
    </section>

    <section className="experience-section">
      <div className="page-shell experience-grid">
        <Reveal className="experience-photo">
          <img src="/images/pitch-night.png" alt="Floodlit Turfly football pitch" />
          <div className="photo-frame" />
          <span className="floating-badge"><Sparkles size={20} /><b>Night-ready</b> bright lights, serious play</span>
          <span className="vertical-copy">TURFLY · NIKETON · DHAKA</span>
        </Reveal>
        <Reveal className="experience-copy">
          <p className="eyebrow light"><span /> Why Turfly</p>
          <h2>A better surface changes the whole match.</h2>
          <p>Built for quick passes, late finishes, and the teams that keep showing up. Turfly removes friction before the first whistle.</p>
          <div className="experience-points">
            <article><span>01</span><div><h3>Quality underfoot</h3><p>Consistent surfaces maintained for reliable grip and bounce.</p></div></article>
            <article><span>02</span><div><h3>Booking without calls</h3><p>Choose the venue, day, and time from one clear flow.</p></div></article>
            <article><span>03</span><div><h3>Built around teams</h3><p>Football and cricket spaces ready for your regular group.</p></div></article>
          </div>
          <Link to="/book" className="inline-link light">See what’s open <ArrowRight size={17} /></Link>
        </Reveal>
      </div>
    </section>

    <section className="section page-shell amenities-section">
      <Reveal className="section-heading">
        <div><p className="eyebrow"><span /> Match-day essentials</p><h2>More than<br />a rectangle of turf.</h2></div>
        <p>Useful details around the pitch make it easier to arrive, play, and head home happy.</p>
      </Reveal>
      <div className="amenity-grid">
        {amenities.map(([Icon, title, copy], index) => <Reveal className="amenity-card" delay={index * 55} key={title}>
          <span>0{index + 1}</span><Icon /><div><h3>{title}</h3><p>{copy}</p></div>
        </Reveal>)}
      </div>
    </section>

    <section className="process-section">
      <div className="page-shell">
        <Reveal className="section-heading centered"><div><p className="eyebrow"><span /> The simple route</p><h2>From “who’s free?”<br />to confirmed.</h2></div><p>Three quick steps. Your reservation stays available in your player dashboard.</p></Reveal>
        <div className="steps">
          {[['01', 'Choose the arena', 'Compare surfaces, capacity, and hourly price.'], ['02', 'Claim a live time', 'Pick a date and an available 90-minute session.'], ['03', 'Pay, play, repeat', 'Complete secure checkout and bring the team.']].map((step, index) => <Reveal key={step[0]} delay={index * 100} className="step"><span>{step[0]}</span><div className="step-icon">{index === 0 ? <Trophy /> : index === 1 ? <Clock3 /> : <Star />}</div><h3>{step[1]}</h3><p>{step[2]}</p>{index < 2 && <ArrowRight />}</Reveal>)}
        </div>
      </div>
    </section>

    <section className="cta-section">
      <div className="cta-glow" />
      <div className="page-shell cta-inner">
        <Reveal><p className="eyebrow light"><span /> Your move</p><h2>Turn tonight into<br /><em>match night.</em></h2></Reveal>
        <Reveal><p>Live slots in Niketon are ready when your team is.</p><Link className="button button-accent button-large" to="/book">Book your turf <ArrowRight size={18} /></Link></Reveal>
      </div>
    </section>
  </main>
}
