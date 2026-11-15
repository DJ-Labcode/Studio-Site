import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { projects, type Owner } from '../data'
import { AppDevice, WebDevice } from './Devices'
import CaseStudy from './CaseStudy'

type Filter = 'All' | Owner

export default function Work() {
  const [filter, setFilter] = useState<Filter>('All')
  // the open case study lives in the URL hash (#case-hsc-it) so it can be linked to
  const read = () => (location.hash.startsWith('#case-') ? location.hash.slice(6) : null)
  const [openId, setOpenId] = useState<string | null>(read)
  useEffect(() => {
    const on = () => setOpenId(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const openCase = (id: string) => { location.hash = `case-${id}` }
  const close = useCallback(() => {
    history.replaceState(null, '', location.pathname + location.search)
    setOpenId(null)
  }, [])
  const open = projects.find((p) => p.id === openId)
  const list = projects.filter((p) => filter === 'All' || p.owner === filter)
  const count = (f: Filter) => projects.filter((p) => f === 'All' || p.owner === f).length
  return (
    <section className="section work" id="work" data-stage="6">
      <div className="wrap">
        <header className="work-head">
          <div>
            <p className="eyebrow"><i className="px" /> Out of the forge</p>
            <h2>Apps install. Websites load. <span className="ember">Everything ships.</span></h2>
          </div>
          <div className="tabs" role="tablist" aria-label="Filter projects by developer">
            {(['All', 'Dhruv', 'Vanashri'] as Filter[]).map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
                {f === 'All' ? 'All work' : `${f}’s`} <span className="mono">{count(f)}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="showcase" data-dim>
          {list.map((p, i) => (
            <article key={p.name} className={`show ${i % 2 ? 'flip' : ''}`} style={{ '--hue': p.hue } as CSSProperties}>
              <div className="show-copy">
                <p className="mono show-kind">
                  <span className={`type-pill ${p.type}`}>{p.type === 'app' ? 'Mobile app' : 'Website'}</span>
                  {p.kind}
                </p>
                <h3>{p.name}</h3>
                <p className="show-sum">{p.summary}</p>
                <p className="show-result"><i className="px" /> {p.result}</p>
                <ul className="chips">{p.stack.map((t) => <li key={t}>{t}</li>)}</ul>
                <div className="show-actions">
                  <button className="btn btn-primary" onClick={() => openCase(p.id)}>
                    {p.type === 'app' ? 'Open the app' : 'Visit the site'} <span aria-hidden="true">→</span>
                  </button>
                  <p className="show-by mono">Forged by <b>{p.owner}</b></p>
                </div>
              </div>
              <button className="show-dev" onClick={() => openCase(p.id)} aria-label={`Open ${p.name} case study`}>
                {p.type === 'app' ? <AppDevice p={p} /> : <WebDevice p={p} />}
                <span className="show-try mono">Click to try it →</span>
              </button>
            </article>
          ))}
        </div>
      </div>
      {open && <CaseStudy p={open} onClose={close} onGo={openCase} />}
    </section>
  )
}
