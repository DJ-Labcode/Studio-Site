import { STAGES } from '../hooks'

/** the always-visible build meter: 0% at the top of the page, 100% at the end */
export default function Hud({ pct, idx }: { pct: number; idx: number }) {
  const segs = 24
  const filled = Math.round((pct / 100) * segs)
  return (
    <>
      <div className="hud-bar" aria-hidden="true">
        {Array.from({ length: segs }, (_, i) => <i key={i} className={i < filled ? 'on' : ''} />)}
      </div>
      <div className="hud" role="status" aria-live="off" aria-label={`Forging ${pct}%: ${STAGES[idx]}`}>
        <span className="hud-k mono">{pct >= 100 ? 'Forged' : 'Forging'}</span>
        <span className="hud-n">{String(pct).padStart(3, '0')}<small>%</small></span>
        <span className="hud-s mono">{STAGES[idx]}</span>
      </div>
    </>
  )
}
