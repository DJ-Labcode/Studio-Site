import { useEffect, useRef, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { projects, type Project } from '../data'
import LiveApp from './LiveApp'
import LiveSite from './LiveSite'

export default function CaseStudy({ p, onClose, onGo }: { p: Project; onClose: () => void; onGo: (id: string) => void }) {
  const panel = useRef<HTMLDivElement>(null)
  const i = projects.findIndex((x) => x.id === p.id)
  const prev = projects[(i + projects.length - 1) % projects.length]
  const next = projects[(i + 1) % projects.length]

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', key)
    document.documentElement.classList.add('no-scroll')
    panel.current?.focus()
    return () => {
      document.removeEventListener('keydown', key)
      document.documentElement.classList.remove('no-scroll')
    }
  }, [onClose])
  useEffect(() => { panel.current?.scrollTo({ top: 0 }) }, [p.id])

  return createPortal(
    <div className="case" role="dialog" aria-modal="true" aria-labelledby="case-title" style={{ '--hue': p.hue } as CSSProperties}>
      <div className="case-backdrop" onClick={onClose} />
      <div className="case-panel" ref={panel} tabIndex={-1}>
        <header className="case-top">
          <p className="mono"><i className="px" /> Case study · {String(i + 1).padStart(2, '0')}/{String(projects.length).padStart(2, '0')}</p>
          <button className="case-close" onClick={onClose} aria-label="Close case study">✕</button>
        </header>

        <section className="case-hero">
          <p className="mono case-kind"><span className={`type-pill ${p.type}`}>{p.type === 'app' ? 'Mobile app' : 'Website'}</span>{p.kind}</p>
          <h2 id="case-title">{p.name}</h2>
          <p className="case-sum">{p.summary}</p>
          <dl className="case-meta">
            <div><dt>Client</dt><dd>{p.client}</dd></div>
            <div><dt>Built by</dt><dd>{p.owner}</dd></div>
            <div><dt>Timeline</dt><dd>{p.duration}</dd></div>
            <div><dt>{p.type === 'app' ? 'Platforms' : 'Address'}</dt><dd>{p.type === 'app' ? p.platforms : p.url}</dd></div>
          </dl>
        </section>

        <section className="case-body">
          <div className="case-live">
            <p className="mono case-live-k"><span className="live-dot" /> Working demo · {p.type === 'app' ? 'tap through the app' : 'click around the site'}</p>
            {p.type === 'app' ? <LiveApp p={p} key={p.id} /> : <LiveSite p={p} key={p.id} />}
            <p className="case-live-note">Runs right here with sample data.</p>
          </div>
          <div className="case-story">
            <div className="case-metrics">
              {p.metrics.map((m) => <div key={m.k}><b>{m.v}</b><span>{m.k}</span></div>)}
            </div>
            <article>
              <h3>The problem</h3>
              <p>{p.problem}</p>
            </article>
            <article>
              <h3>What we built</h3>
              <p>{p.built}</p>
            </article>
            <article>
              <h3>Features</h3>
              <ul className="case-features">{p.features.map((f) => <li key={f}><i className="px" />{f}</li>)}</ul>
            </article>
            <article>
              <h3>Tech stack</h3>
              <ul className="chips">{p.stack.map((t) => <li key={t}>{t}</li>)}</ul>
            </article>
            {p.placeholder && <p className="case-flag mono">Sample project · replace with real details</p>}
          </div>
        </section>

        <footer className="case-foot">
          <button className="case-nav" onClick={() => onGo(prev.id)}><span className="mono">← Previous</span><b>{prev.name}</b></button>
          <a href="#forge" className="btn btn-primary" onClick={onClose}>Want one like this? <span aria-hidden="true">→</span></a>
          <button className="case-nav right" onClick={() => onGo(next.id)}><span className="mono">Next →</span><b>{next.name}</b></button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
