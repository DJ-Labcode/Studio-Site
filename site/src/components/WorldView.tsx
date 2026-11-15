import { useEffect, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { projects } from '../data'
import { AppDevice, WebDevice } from './Devices'
import { PixelLetter } from './Worlds'
import { openCase } from '../caseStore'

export type WorldKind = 'web' | 'app'
export const openWorld = (k: WorldKind) => dispatchEvent(new CustomEvent('df:world', { detail: k }))

const META = {
  web: { ch: 'V' as const, name: 'Web world', who: 'Vanashri', line: 'Websites that load fast and bring in customers.', word: 'WEBSITES' },
  app: { ch: 'D' as const, name: 'App world', who: 'Dhruv', line: 'Android and iOS apps, from idea to the Play Store.', word: 'APPS' },
}

/** A full-screen environment for one developer: their projects drift past on a moving belt. */
export default function WorldView({ kind, onClose }: { kind: WorldKind; onClose: () => void }) {
  const m = META[kind]
  const list = projects.filter((p) => p.type === kind)
  // repeat so the belt is always full, then double it for a seamless loop
  const base = Array.from({ length: Math.ceil(6 / list.length) }, () => list).flat()
  const belt = [...base, ...base]
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && !location.hash.startsWith('#case-')) onClose() }
    document.addEventListener('keydown', key)
    document.documentElement.classList.add('no-scroll')
    return () => { document.removeEventListener('keydown', key); document.documentElement.classList.remove('no-scroll') }
  }, [onClose])
  return createPortal(
    <div className={`wv wv-${kind}`} role="dialog" aria-modal="true" aria-label={m.name}>
      <div className="wv-word" aria-hidden="true"><span>{`${m.word} · `.repeat(8)}</span></div>
      <header className="wv-top">
        <div className="wv-id"><PixelLetter ch={m.ch} /><div><b>{m.name}</b><span>{m.who}</span></div></div>
        <button className="wv-close" onClick={onClose}>← Back to DuoForge</button>
      </header>
      <div className="wv-head">
        <h2>{kind === 'web' ? <>Vanashri builds<br />the web.</> : <>Dhruv builds<br />apps.</>}</h2>
        <p>{m.line} <b>{list.length} projects</b> are moving below. Click any one to open it and try it.</p>
      </div>
      <div className="wv-belt">
        <div className="wv-track" style={{ '--n': base.length } as CSSProperties}>
          {belt.map((p, i) => (
            <button key={i} className="wv-item" onClick={() => openCase(p.id)} style={{ '--hue': p.hue, '--i': i % base.length } as CSSProperties} aria-hidden={i >= base.length} tabIndex={i >= base.length ? -1 : 0}>
              <span className="wv-dev">{kind === 'web' ? <WebDevice p={p} /> : <AppDevice p={p} />}</span>
              <span className="wv-name">{p.name}</span>
              <span className="wv-kind mono">{p.kind}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}
