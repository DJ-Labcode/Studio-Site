import { useState, type FormEvent, type ReactNode } from 'react'
import type { Project } from '../data'

/* Working, clickable versions of the websites: real pages, filters and forms with sample data. */

function Done({ title, body, reset }: { title: string; body: string; reset: () => void }) {
  return (
    <div className="ls-done" role="status">
      <span className="ls-tick" aria-hidden="true">✓</span>
      <b>{title}</b>
      <p>{body}</p>
      <button className="ls-btn ghost" onClick={reset}>Back</button>
    </div>
  )
}

/* ── Bloom & Brew ── */
const MENU = [
  { n: 'Cold brew', p: 180, c: 'Coffee' }, { n: 'Flat white', p: 190, c: 'Coffee' }, { n: 'Masala chai', p: 90, c: 'Coffee' },
  { n: 'Butter croissant', p: 140, c: 'Bakes' }, { n: 'Banana bread', p: 160, c: 'Bakes' },
  { n: 'Avocado toast', p: 260, c: 'Plates' }, { n: 'Shakshuka', p: 320, c: 'Plates' },
]
function Cafe({ page, go }: { page: string; go: (p: string) => void }) {
  const [cat, setCat] = useState('All')
  const [slot, setSlot] = useState('7:30 pm')
  const [guests, setGuests] = useState(2)
  const [booked, setBooked] = useState(false)
  if (page === 'menu')
    return (
      <div className="ls-page">
        <h4>Menu</h4>
        <div className="ls-chips">{['All', 'Coffee', 'Bakes', 'Plates'].map((c) => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}</div>
        {MENU.filter((m) => cat === 'All' || m.c === cat).map((m) => (
          <div key={m.n} className="ls-line"><span>{m.n}</span><b>₹{m.p}</b></div>
        ))}
      </div>
    )
  if (page === 'book')
    return booked ? (
      <Done title={`Table for ${guests} at ${slot}`} body="Booking sent to the café’s WhatsApp. You’ll get a confirmation in a minute." reset={() => setBooked(false)} />
    ) : (
      <form className="ls-page" onSubmit={(e: FormEvent) => { e.preventDefault(); setBooked(true) }}>
        <h4>Book a table · Saturday</h4>
        <p className="ls-label">Time</p>
        <div className="ls-chips">{['6:00 pm', '7:30 pm', '9:00 pm'].map((t) => <button type="button" key={t} className={slot === t ? 'on' : ''} onClick={() => setSlot(t)}>{t}</button>)}</div>
        <p className="ls-label">Guests</p>
        <div className="ls-stepper">
          <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} aria-label="Fewer guests">−</button>
          <b>{guests}</b>
          <button type="button" onClick={() => setGuests(Math.min(8, guests + 1))} aria-label="More guests">+</button>
        </div>
        <input className="ls-input" id="ls-cafe-name" placeholder="Your name" required />
        <button className="ls-btn" type="submit">Confirm booking</button>
      </form>
    )
  return (
    <div className="ls-page">
      <div className="ls-hero img"><b>Coffee, slow.</b><span>Fresh bakes every morning from 8 am</span><button className="ls-btn" onClick={() => go('book')}>Book a table</button></div>
      <h4>Today’s favourites</h4>
      <div className="ls-grid3">{MENU.slice(0, 3).map((m, i) => <button key={m.n} className="ls-tile img" style={{ filter: `hue-rotate(${i * -12}deg)` }} onClick={() => go('menu')}><span>{m.n}</span></button>)}</div>
    </div>
  )
}

/* ── Nimbus Realty ── */
const HOMES = [
  { id: 1, area: 'Baner', bhk: 2, price: 72, sq: 1050 }, { id: 2, area: 'Wakad', bhk: 2, price: 64, sq: 980 },
  { id: 3, area: 'Aundh', bhk: 3, price: 118, sq: 1480 }, { id: 4, area: 'Hinjewadi', bhk: 1, price: 41, sq: 640 },
  { id: 5, area: 'Kothrud', bhk: 3, price: 96, sq: 1320 }, { id: 6, area: 'Baner', bhk: 1, price: 46, sq: 610 },
]
function Realty({ page, go }: { page: string; go: (p: string) => void }) {
  const [bhk, setBhk] = useState(0)
  const [max, setMax] = useState(100)
  const [sent, setSent] = useState(false)
  const id = Number(page.split('/')[1])
  const home = HOMES.find((h) => h.id === id)
  if (home)
    return sent ? (
      <Done title="Enquiry sent" body={`WhatsApp opened with: “Hi, I’m interested in the ${home.bhk} BHK in ${home.area} (₹${home.price}L).”`} reset={() => setSent(false)} />
    ) : (
      <div className="ls-page">
        <button className="ls-back" onClick={() => go('home')}>← All listings</button>
        <div className="ls-hero img short"><b>{home.bhk} BHK · {home.area}</b><span>{home.sq} sq ft · ready to move</span></div>
        <div className="ls-specs"><div><b>₹{home.price}L</b><span>price</span></div><div><b>{home.sq}</b><span>sq ft</span></div><div><b>{home.bhk}</b><span>bedrooms</span></div></div>
        <button className="ls-btn" onClick={() => setSent(true)}>Enquire on WhatsApp</button>
      </div>
    )
  const list = HOMES.filter((h) => (bhk === 0 || h.bhk === bhk) && h.price <= max)
  return (
    <div className="ls-page">
      <h4>Homes in Pune</h4>
      <div className="ls-chips">{[0, 1, 2, 3].map((b) => <button key={b} className={bhk === b ? 'on' : ''} onClick={() => setBhk(b)}>{b === 0 ? 'Any' : `${b} BHK`}</button>)}</div>
      <label className="ls-range">Budget up to <b>₹{max}L</b><input id="ls-budget" type="range" min={40} max={120} step={5} value={max} onChange={(e) => setMax(Number(e.target.value))} /></label>
      <div className="ls-grid2">
        {list.map((h) => (
          <button key={h.id} className="ls-home" onClick={() => go(`home/${h.id}`)}>
            <span className="img" style={{ filter: `hue-rotate(${h.id * 25}deg)` }} />
            <b>₹{h.price}L</b><small>{h.bhk} BHK · {h.area}</small>
          </button>
        ))}
        {list.length === 0 && <p className="ls-empty">No homes match. Try a higher budget.</p>}
      </div>
    </div>
  )
}

/* ── PulseFit ── */
const PLANS = [{ n: 'Basic', p: 999, f: 'Gym floor' }, { n: 'Pro', p: 1799, f: 'Gym + all classes' }, { n: 'Elite', p: 2999, f: 'Everything + trainer' }]
const DAYS: Record<string, string[]> = {
  Mon: ['7:00 HIIT', '18:00 Strength'], Tue: ['6:30 Yoga', '19:00 Boxing'], Wed: ['7:00 Spin', '18:30 Core'],
  Thu: ['7:00 HIIT', '19:00 Boxing'], Fri: ['6:30 Yoga', '18:00 Zumba'], Sat: ['9:00 Bootcamp'],
}
function Gym({ page, go }: { page: string; go: (p: string) => void }) {
  const [plan, setPlan] = useState(1)
  const [day, setDay] = useState('Mon')
  const [joined, setJoined] = useState(false)
  if (page === 'classes')
    return (
      <div className="ls-page">
        <h4>Class timetable</h4>
        <div className="ls-chips">{Object.keys(DAYS).map((d) => <button key={d} className={day === d ? 'on' : ''} onClick={() => setDay(d)}>{d}</button>)}</div>
        {DAYS[day].map((c) => <div key={c} className="ls-line"><span>{c.split(' ')[1]}</span><b>{c.split(' ')[0]}</b></div>)}
      </div>
    )
  if (page === 'join')
    return joined ? (
      <Done title={`Welcome to ${PLANS[plan].n}`} body={`Razorpay checkout for ₹${PLANS[plan].p.toLocaleString('en-IN')} would open here. Your first week is free.`} reset={() => setJoined(false)} />
    ) : (
      <div className="ls-page">
        <h4>Pick a plan</h4>
        <div className="ls-grid3">
          {PLANS.map((p, i) => (
            <button key={p.n} className={`ls-plan ${plan === i ? 'on' : ''}`} onClick={() => setPlan(i)}>
              <span>{p.n}</span><b>₹{p.p.toLocaleString('en-IN')}</b><small>{p.f}</small>
            </button>
          ))}
        </div>
        <button className="ls-btn" onClick={() => setJoined(true)}>Join {PLANS[plan].n} · pay online</button>
      </div>
    )
  return (
    <div className="ls-page">
      <div className="ls-hero dark"><b>Train with Pulse.</b><span>First week free. No joining fee this month.</span><button className="ls-btn" onClick={() => go('join')}>Join now</button></div>
      <button className="ls-line ls-link" onClick={() => go('classes')}><span>See this week’s classes</span><b>→</b></button>
    </div>
  )
}

/* ── Studio Kala ── */
const ART = ['Monsoon market', 'Grandma’s kitchen', 'Night bus', 'Paper boats', 'Kite festival', 'Old Pune wada']
function Gallery({ page }: { page: string }) {
  const [open, setOpen] = useState<number | null>(null)
  const [sent, setSent] = useState(false)
  if (page === 'commission')
    return sent ? (
      <Done title="Request received" body="Kala replies within 2 days with a sketch idea and a quote." reset={() => setSent(false)} />
    ) : (
      <form className="ls-page" onSubmit={(e: FormEvent) => { e.preventDefault(); setSent(true) }}>
        <h4>Commission a piece</h4>
        <div className="ls-chips">{['Book cover', 'Wall art', 'Portrait'].map((c, i) => <button type="button" key={c} className={i === 0 ? 'on' : ''}>{c}</button>)}</div>
        <input className="ls-input" id="ls-art-email" type="email" placeholder="Your email" required />
        <button className="ls-btn" type="submit">Send request</button>
      </form>
    )
  return (
    <div className="ls-page">
      <h4>Selected work · tap to open</h4>
      <div className="ls-masonry">
        {ART.map((a, i) => (
          <button key={a} className="img" style={{ height: [90, 60, 76, 100, 64, 84][i], filter: `hue-rotate(${i * 22}deg)` }} onClick={() => setOpen(i)} aria-label={`Open ${a}`} />
        ))}
      </div>
      {open !== null && (
        <div className="ls-lightbox" role="dialog" aria-label={ART[open]}>
          <div className="img big" style={{ filter: `hue-rotate(${open * 22}deg)` }} />
          <div className="ls-row"><button onClick={() => setOpen((open + ART.length - 1) % ART.length)} aria-label="Previous">←</button><b>{ART[open]}</b><button onClick={() => setOpen((open + 1) % ART.length)} aria-label="Next">→</button></div>
          <button className="ls-btn ghost" onClick={() => setOpen(null)}>Close</button>
        </div>
      )}
    </div>
  )
}

/* ── LedgerLite ── */
function Saas({ page, go }: { page: string; go: (p: string) => void }) {
  const [yearly, setYearly] = useState(true)
  const [started, setStarted] = useState(false)
  const price = (m: number) => (yearly ? Math.round(m * 0.8) : m)
  if (page === 'pricing')
    return (
      <div className="ls-page">
        <h4>Simple pricing</h4>
        <button className="ls-toggle" onClick={() => setYearly(!yearly)} aria-pressed={yearly}>
          <span className={!yearly ? 'on' : ''}>Monthly</span><span className={yearly ? 'on' : ''}>Yearly −20%</span>
        </button>
        <div className="ls-grid3">
          {[['Starter', 0], ['Growth', 499], ['Scale', 1499]].map(([n, p], i) => (
            <div key={n} className={`ls-plan ${i === 1 ? 'on' : ''}`}><span>{n}</span><b>₹{price(p as number)}</b><small>/month</small></div>
          ))}
        </div>
        <button className="ls-btn" onClick={() => go('signup')}>Start free trial</button>
      </div>
    )
  if (page === 'signup')
    return started ? (
      <Done title="Your 14-day trial has started" body="We sent a magic link to your inbox. No card needed." reset={() => setStarted(false)} />
    ) : (
      <form className="ls-page" onSubmit={(e: FormEvent) => { e.preventDefault(); setStarted(true) }}>
        <h4>Start your free trial</h4>
        <input className="ls-input" id="ls-saas-biz" placeholder="Business name" required />
        <input className="ls-input" id="ls-saas-email" type="email" placeholder="Work email" required />
        <button className="ls-btn" type="submit">Create account</button>
      </form>
    )
  return (
    <div className="ls-page">
      <div className="ls-hero"><b>Billing that runs itself.</b><span>GST invoices, reminders and UPI payments in one place.</span><button className="ls-btn" onClick={() => go('signup')}>Start free trial</button></div>
      <div className="ls-dash img"><i /><i /><i /></div>
      <button className="ls-line ls-link" onClick={() => go('pricing')}><span>See pricing</span><b>→</b></button>
    </div>
  )
}

const ROUTES: Record<string, [string, string][]> = {
  menu: [['home', 'Home'], ['menu', 'Menu'], ['book', 'Book']],
  listing: [['home', 'Listings']],
  plans: [['home', 'Home'], ['classes', 'Classes'], ['join', 'Join']],
  gallery: [['home', 'Work'], ['commission', 'Commission']],
  saas: [['home', 'Product'], ['pricing', 'Pricing'], ['signup', 'Sign up']],
}

export default function LiveSite({ p }: { p: Project }) {
  const [page, setPage] = useState('home')
  const go = (to: string) => setPage(to)
  let view: ReactNode
  if (p.screen === 'menu') view = <Cafe page={page} go={go} />
  else if (p.screen === 'listing') view = <Realty page={page} go={go} />
  else if (p.screen === 'plans') view = <Gym page={page} go={go} />
  else if (p.screen === 'gallery') view = <Gallery page={page} />
  else view = <Saas page={page} go={go} />
  const routes = ROUTES[p.screen]
  return (
    <div className="ls-browser" style={{ ['--hue' as string]: p.hue }}>
      <div className="b-bar">
        <span className="b-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="b-url mono">https://{p.url}{page === 'home' ? '' : `/${page}`}</span>
      </div>
      <div className="ls-nav">
        <button className="ls-logo" onClick={() => go('home')}>{p.name}</button>
        <nav>
          {routes.map(([id, label]) => (
            <button key={id} className={page.split('/')[0] === id ? 'on' : ''} onClick={() => go(id)}>{label}</button>
          ))}
        </nav>
      </div>
      <div className="ls-view" key={page}>{view}</div>
    </div>
  )
}
