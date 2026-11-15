import { useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { BASE, features, platforms } from '../data'

const inr = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(n >= 1000000 ? 0 : 1).replace(/\.0$/, '')}L` : `₹${Math.round(n / 1000)}k`

export default function Builder() {
  const [picked, setPicked] = useState<string[]>(['login', 'pay', 'chat', 'book'])
  const [plats, setPlats] = useState<string[]>(['android', 'ios'])
  const [sent, setSent] = useState(false)

  const toggle = (list: string[], set: (v: string[]) => void, id: string, keepOne = false) => {
    if (list.includes(id)) {
      if (keepOne && list.length === 1) return
      set(list.filter((x) => x !== id))
    } else set([...list, id])
  }

  const chosen = features.filter((f) => picked.includes(f.id))
  const est = useMemo(() => {
    const extraPlatforms = Math.max(plats.length - 1, 0)
    const mult = 1 + extraPlatforms * 0.15
    const weeks = (BASE.weeks + chosen.reduce((a, f) => a + f.weeks, 0)) * (1 + extraPlatforms * 0.1)
    const price = (BASE.price + chosen.reduce((a, f) => a + f.price, 0)) * mult
    const stack = new Set<string>()
    plats.forEach((p) => stack.add(platforms.find((x) => x.id === p)!.stack))
    chosen.forEach((f) => f.stack.forEach((s) => stack.add(s)))
    return { weeks: [Math.floor(weeks), Math.ceil(weeks * 1.25)], price: [price * 0.9, price * 1.15], stack: [...stack] }
  }, [chosen, plats])

  const onlyWeb = plats.length === 1 && plats[0] === 'web'
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSent(true) // demo: production sends the blueprint with EmailJS
  }

  return (
    <section className="section builder" id="forge" data-dim>
      <div className="wrap">
        <header className="builder-head">
          <p className="eyebrow"><i className="px" /> Forge your app</p>
          <h2>Pick the parts. <span className="ember">Watch it take shape.</span></h2>
          <p className="section-intro">
            Every feature is a block. Drop in what your app needs and get a timeline and price range
            straight away, then send the blueprint to us.
          </p>
        </header>

        <div className="builder-grid">
          <div className="builder-parts">
            <fieldset>
              <legend className="mono">1 · Where should it run?</legend>
              <div className="pick">
                {platforms.map((p) => (
                  <button type="button" key={p.id} aria-pressed={plats.includes(p.id)} className={plats.includes(p.id) ? 'on' : ''} onClick={() => toggle(plats, setPlats, p.id, true)}>
                    {p.name}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mono">2 · Add blocks</legend>
              <div className="parts">
                {features.map((f) => {
                  const on = picked.includes(f.id)
                  return (
                    <button type="button" key={f.id} className={`part ${on ? 'on' : ''}`} aria-pressed={on} style={{ '--c': f.color } as CSSProperties} onClick={() => toggle(picked, setPicked, f.id)}>
                      <span className="part-swatch" aria-hidden="true" />
                      <span className="part-text">
                        <b>{f.name}</b>
                        <small>{f.note}</small>
                      </span>
                      <span className="part-mark mono" aria-hidden="true">{on ? '−' : '+'}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          </div>

          <div className="builder-out">
            <div className={`device ${onlyWeb ? 'device-web' : ''}`}>
              <div className="device-bar" aria-hidden="true"><i /><i /><i /></div>
              <div className="stack" aria-label={`Blocks in your app: ${['Core screens', ...chosen.map((c) => c.name)].join(', ')}`}>
                {[...chosen].reverse().map((f) => (
                  <div key={f.id} className="block" style={{ '--c': f.color, gridColumn: `span ${onlyWeb ? Math.min(f.span[0] * 2, 12) : f.span[0]}`, gridRow: `span ${f.span[1]}` } as CSSProperties}>
                    <span>{f.name}</span>
                  </div>
                ))}
                <div className="block block-core" style={{ gridColumn: '1 / -1' }}><span>Core screens · design · launch</span></div>
              </div>
            </div>

            <div className="estimate">
              <div>
                <p className="mono muted">Timeline</p>
                <p className="est-n">{est.weeks[0]}–{est.weeks[1]} <small>weeks</small></p>
              </div>
              <div>
                <p className="mono muted">Price range</p>
                <p className="est-n">{inr(est.price[0])}–{inr(est.price[1])}</p>
              </div>
              <ul className="chips est-stack">{est.stack.map((s) => <li key={s}>{s}</li>)}</ul>
              <p className="mono muted est-note">Rough estimate. You get a fixed quote after a free 30-minute call.</p>
            </div>
          </div>
        </div>

        <form className="send" id="contact" onSubmit={submit}>
          {sent ? (
            <div className="send-done" role="status">
              <p className="eyebrow"><i className="px" /> Blueprint ready</p>
              <h3>Thanks. On the live site this lands in our inbox and we reply within one working day.</h3>
              <p className="muted">Demo only: nothing was sent.</p>
              <button type="button" className="btn btn-ghost" onClick={() => setSent(false)}>Edit blueprint</button>
            </div>
          ) : (
            <>
              <div className="send-copy">
                <h3>Send this blueprint</h3>
                <p className="muted">{chosen.length + 1} blocks · {plats.map((p) => platforms.find((x) => x.id === p)!.name).join(' + ')}</p>
              </div>
              <label>Name<input id="b-name" required placeholder="Your name" /></label>
              <label>Email<input id="b-email" type="email" required placeholder="you@company.com" /></label>
              <label className="send-wide">Anything else?<input id="b-msg" placeholder="A booking app for my clinic, launch by March…" /></label>
              <button className="btn btn-primary" type="submit">Send to DuoForge <span aria-hidden="true">→</span></button>
            </>
          )}
        </form>
      </div>
    </section>
  )
}
