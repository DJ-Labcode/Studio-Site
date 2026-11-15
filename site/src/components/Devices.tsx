import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import type { Project } from '../data'
import { useInView } from '../hooks'

/** counts 0 -> 100 over `ms` once `run` is true */
function useCount(run: boolean, ms: number, delay = 0) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf = 0
    let start = 0
    const tick = (now: number) => {
      if (!start) start = now + delay
      const p = Math.min(Math.max((now - start) / ms, 0), 1)
      setN(Math.round((1 - Math.pow(1 - p, 2)) * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, ms, delay])
  return n
}

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* ───────────── Apps: a phone turns in, installs 0→100%, then opens ───────────── */

function AppScreen({ kind }: { kind: Project['screen'] }) {
  if (kind === 'quiz')
    return (
      <div className="app-ui">
        <p className="ui-k i1">Chapter 4 · Quiz</p>
        <p className="ui-q i2">Which OSI layer handles routing?</p>
        {['Transport', 'Network', 'Session', 'Data link'].map((o, i) => (
          <div key={o} className={`ui-opt i${i + 3} ${i === 1 ? 'pick' : ''}`}>{o}</div>
        ))}
        <div className="ui-bar i7"><span className="run" /></div>
        <div className="ui-score i7"><b>8/10</b> <span>Weak: Networking</span></div>
      </div>
    )
  if (kind === 'video')
    return (
      <div className="app-ui">
        <div className="ui-video i1"><span className="play" /><div className="ui-bar on-video"><span className="run" /></div></div>
        <p className="ui-q i2">Building an HLS pipeline</p>
        <p className="ui-k i2">12K views · 1080p</p>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`ui-row i${i + 3}`}><span className="thumb" /><span className="lines"><i /><i /></span></div>
        ))}
      </div>
    )
  return (
    <div className="app-ui">
      <p className="ui-k i1">Today · Line 2</p>
      <div className="ui-stats i2">
        <div><b>1,240</b><span>units</span></div>
        <div><b>96%</b><span>uptime</span></div>
      </div>
      <div className="ui-chart i3">
        {[40, 62, 55, 78, 70, 88, 64].map((h, i) => <span key={i} style={{ '--h': `${h}%`, animationDelay: `${i * 0.12}s` } as CSSProperties} />)}
      </div>
      <div className="ui-ask i4"><span className="typing">Which licence expires next?</span></div>
      <div className="ui-answer i5">Fire NOC · renews in 18 days</div>
    </div>
  )
}

export function AppDevice({ p }: { p: Project }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  const run = seen || prefersReduced()
  const pct = useCount(run, 1500, 500)
  const open = pct >= 100
  return (
    <div ref={ref} className={`app-dev ${run ? 'go' : ''} ${open ? 'open' : ''}`} style={{ '--hue': p.hue } as CSSProperties}>
      <div className="app-shadow" aria-hidden="true" />
      <div className="app-phone">
        <div className="app-notch" />
        <div className="app-screen">
          <div className="install" aria-hidden={open}>
            <div className="app-icon"><span>{p.name.slice(0, 1)}</span></div>
            <p className="install-name">{p.name}</p>
            <div className="ring-wrap"><div className="ring" style={{ '--p': pct } as CSSProperties} /><b className="mono">{pct}%</b></div>
            <p className="install-label mono">{open ? 'Opening…' : 'Installing'}</p>
          </div>
          <AppScreen kind={p.screen} />
        </div>
      </div>
      <p className="dev-tag mono"><i className="px" /> app · {open ? 'installed' : `${pct}%`}</p>
    </div>
  )
}

/* ───────────── Websites: a browser loads 0→100%, skeleton renders, page scrolls ───────────── */

const Sk = ({ c = '', s, children }: { c?: string; s?: CSSProperties; children?: ReactNode }) => (
  <div className={`sk ${c}`} style={s}>{children}</div>
)

function WebPage({ kind, name }: { kind: Project['screen']; name: string }) {
  const nav = (
    <div className="w-nav">
      <Sk c="w-logo">{name}</Sk>
      <div className="w-links"><Sk>Home</Sk><Sk>About</Sk><Sk c="w-cta">Contact</Sk></div>
    </div>
  )
  if (kind === 'menu')
    return (
      <div className="w-page">
        {nav}
        <Sk c="w-hero w-img"><b>Coffee, slow.</b><span>Fresh bakes every morning</span><i className="w-btn">Book a table</i></Sk>
        <Sk c="w-h">Today’s menu</Sk>
        {[['Cold brew', '₹180'], ['Butter croissant', '₹140'], ['Avocado toast', '₹260'], ['Masala chai', '₹90']].map(([a, b]) => (
          <div key={a} className="w-line"><Sk>{a}</Sk><Sk c="w-price">{b}</Sk></div>
        ))}
        <div className="w-grid3"><Sk c="w-img sq" /><Sk c="w-img sq" /><Sk c="w-img sq" /></div>
        <Sk c="w-form"><span>Reserve · Sat 7:30 pm · 2 guests</span><i className="w-btn">Confirm</i></Sk>
      </div>
    )
  if (kind === 'listing')
    return (
      <div className="w-page">
        {nav}
        <Sk c="w-search">Search Pune · 2 BHK · under ₹80L</Sk>
        <div className="w-chips"><Sk>2 BHK</Sk><Sk>Parking</Sk><Sk>Ready to move</Sk></div>
        <Sk c="w-map w-img"><i className="pin" style={{ left: '30%', top: '40%' }} /><i className="pin" style={{ left: '62%', top: '58%' }} /><i className="pin" style={{ left: '48%', top: '25%' }} /></Sk>
        <div className="w-grid2">
          {['₹72L · Baner', '₹64L · Wakad', '₹79L · Aundh', '₹58L · Hinjewadi'].map((t) => (
            <div key={t} className="w-card"><Sk c="w-img card" /><Sk>{t}</Sk></div>
          ))}
        </div>
      </div>
    )
  if (kind === 'plans')
    return (
      <div className="w-page">
        {nav}
        <Sk c="w-hero w-dark"><b>Train with Pulse.</b><span>First week free</span><i className="w-btn">Join now</i></Sk>
        <div className="w-grid3">
          {[['Basic', '₹999'], ['Pro', '₹1,799'], ['Elite', '₹2,999']].map(([a, b], i) => (
            <Sk key={a} c={`w-plan ${i === 1 ? 'hot' : ''}`}><span>{a}</span><b>{b}</b><small>/month</small></Sk>
          ))}
        </div>
        <Sk c="w-h">This week</Sk>
        <div className="w-table">
          {['Mon · HIIT 7am', 'Tue · Yoga 6pm', 'Wed · Spin 7am', 'Thu · Boxing 6pm', 'Fri · HIIT 7am', 'Sat · Zumba 9am'].map((t) => <Sk key={t}>{t}</Sk>)}
        </div>
      </div>
    )
  if (kind === 'gallery')
    return (
      <div className="w-page">
        {nav}
        <Sk c="w-h big">Illustration &amp; picture books</Sk>
        <div className="w-masonry">
          {[64, 40, 52, 70, 44, 58].map((h, i) => <Sk key={i} c="w-img" s={{ height: h, '--shade': i } as CSSProperties} />)}
        </div>
        <Sk c="w-form"><span>Open for commissions · 2026</span><i className="w-btn">Enquire</i></Sk>
      </div>
    )
  return (
    <div className="w-page">
      {nav}
      <Sk c="w-h big">Billing that runs itself.</Sk>
      <Sk c="w-sub">GST invoices, reminders and payments in one place.</Sk>
      <div className="w-row"><i className="w-btn">Start free trial</i><Sk c="w-ghost">See pricing</Sk></div>
      <Sk c="w-dash w-img"><span className="d1" /><span className="d2" /><span className="d3" /></Sk>
      <div className="w-grid3"><Sk>Auto reminders</Sk><Sk>UPI links</Sk><Sk>GST reports</Sk></div>
      <div className="w-grid3">
        {[['Starter', '₹0'], ['Growth', '₹499'], ['Scale', '₹1,499']].map(([a, b], i) => (
          <Sk key={a} c={`w-plan ${i === 1 ? 'hot' : ''}`}><span>{a}</span><b>{b}</b></Sk>
        ))}
      </div>
    </div>
  )
}

export function WebDevice({ p }: { p: Project }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  const run = seen || prefersReduced()
  const pct = useCount(run, 1800, 400)
  const done = pct >= 100
  const typed = p.url.slice(0, Math.ceil((Math.min(pct, 50) / 50) * p.url.length))
  return (
    <div ref={ref} className={`web-dev ${run ? 'go' : ''} ${done ? 'done' : ''}`} style={{ '--hue': p.hue } as CSSProperties}>
      <div className="browser">
        <div className="b-bar">
          <span className="b-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="b-url mono">https://{typed}<span className="caret" /></span>
          <span className="b-pct mono">{pct}%</span>
          <span className="b-load" style={{ width: `${pct}%` }} />
        </div>
        <div className={`b-view ${pct > 35 ? 'drawn' : ''}`}>
          <div className="b-scroll">
            <WebPage kind={p.screen} name={p.name} />
          </div>
        </div>
      </div>
      <p className="dev-tag mono"><i className="px" /> website · {done ? 'live' : `loading ${pct}%`}</p>
    </div>
  )
}
