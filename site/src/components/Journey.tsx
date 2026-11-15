import type { CSSProperties } from 'react'
import ScrollFrames, { frameUrls } from './ScrollFrames'

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))

export const PUSH = frameUrls('push', 96)
export const PULL = frameUrls('pull', 108)

/** Hero + scroll into the laptop. Ends on the screen filling the window, handed over to real HTML. */
export function PushIn() {
  return (
    <ScrollFrames urls={PUSH} vh={420} id="top">
      {(p) => (
        <>
          <video className="seq-video" src="frames/hero/hero.mp4" autoPlay muted loop playsInline aria-hidden="true" style={{ opacity: p < 0.004 ? 1 : 0 }} />
          <h1 className="sr-only">DuoForge: we forge apps and websites people love</h1>
          <div className="hero-bar" style={{ opacity: 1 - seg(p, 0.02, 0.12), transform: `translateY(${seg(p, 0, 0.12) * 30}px)` } as CSSProperties}>
            <p className="badge"><span className="dot" /> Open for new projects</p>
            <p className="hero-line">A two-developer studio for websites and mobile apps. Scroll to step inside.</p>
            <a href="#forge" className="btn btn-primary">Start a project <span aria-hidden="true">→</span></a>
          </div>
          <div className="scroll-cue mono" style={{ opacity: 1 - seg(p, 0, 0.05) }}>Scroll to step inside <i /></div>
          {/* the handover: the HTML screen fades in over the last frames */}
          <div className="screen-hand blue-hand" style={{ opacity: seg(p, 0.93, 1) }}>
            <BlueHero />
          </div>
        </>
      )}
    </ScrollFrames>
  )
}

/** The site's first screen: identical to what the laptop shows in the video. */
export function BlueHero() {
  return (
    <div className="blue-hero">
      <div className="bh-nav"><span className="bh-logo"><MiniMark /> DuoForge</span><a href="#forge" className="bh-cta">Start a project</a></div>
      <h1 className="bh-h">WE FORGE APPS<br /><span className="bh-tile" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span> &amp; WEBSITES<br />PEOPLE LOVE.</h1>
      <p className="bh-sub">Two developers. Web and mobile. From idea to launch.</p>
    </div>
  )
}
export function InsideHero() {
  return <section className="inside-hero" id="inside"><BlueHero /></section>
}

const STEPS: Record<number, { n: string; when: string; t: string; d: string }> = {
  2: { n: '01', when: 'Day 1', t: 'Discover', d: 'A free 30-minute call. You get a written scope and a fixed quote.' },
  3: { n: '02', when: 'Week 1', t: 'Design', d: 'Clickable Figma screens. Change anything before code starts.' },
  4: { n: '03', when: 'Weeks 2–6', t: 'Build', d: 'A working build on your phone every Friday.' },
  5: { n: '04', when: 'Launch day', t: 'Launch', d: 'Play Store, App Store and web publishing handled for you.' },
  6: { n: '05', when: 'After launch', t: 'Support', d: '30 days of free fixes, then simple monthly care.' },
}

/** Inside the laptop: how we work, drawn as a wireframe that turns into a real screen as you scroll. */
export function InsideIntro() {
  return (
    <ScrollFrames urls={[]} vh={260} id="how">
      {(p) => {
        const wire = seg(p, 0.05, 0.42), fill = seg(p, 0.42, 0.75)
        const boxes: [number, number, number, number][] = [[4, 4, 92, 9], [4, 18, 52, 40], [60, 18, 36, 18], [60, 40, 36, 18], [4, 63, 28, 31], [36, 63, 28, 31], [68, 63, 28, 31]]
        const step = p < 0.42 ? 0 : p < 0.75 ? 1 : 2
        return (
          <div className="inside" style={{ '--fill': fill } as CSSProperties}>
            <p className="inside-step mono">{['01 · We sketch it', '02 · We build it', '03 · You launch it'][step]}</p>
            <svg className="inside-wire" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={{ opacity: 1 - fill * 0.85 }}>
              {boxes.map(([x, y, w, h], i) => {
                const k = clamp01(wire * 1.7 - i * 0.1)
                return <rect key={i} x={x} y={y} width={w} height={h} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} vectorEffect="non-scaling-stroke" />
              })}
            </svg>
            <div className="inside-ui" aria-hidden={fill < 0.5}>
              {boxes.map(([x, y, w, h], i) => (
                <div key={i} className={`iu iu${i}`} style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, opacity: clamp01(fill * 2.2 - i * 0.15), transform: `scale(${0.94 + 0.06 * clamp01(fill * 2.2 - i * 0.15)})` }}>
                  {i === 0 && (
                    <ol className="iu-strip">{['Idea', 'Design', 'Build', 'Launch', 'Support'].map((t, k) => <li key={t}><b>{k + 1}</b>{t}</li>)}</ol>
                  )}
                  {STEPS[i] && (
                    <div className="iu-step">
                      <span className="mono">{STEPS[i].n} · {STEPS[i].when}</span>
                      <b>{STEPS[i].t}</b>
                      <p>{STEPS[i].d}</p>
                    </div>
                  )}
                </div>
              ))}
              <div className="inside-copy" style={{ opacity: seg(p, 0.6, 0.8) }}>
                <p className="eyebrow"><i className="px" /> How we work</p>
                <h2>Two developers.<br /><span className="ember">One forge.</span></h2>
                <p className="lead">From first call to launch in five clear steps. You always know what happens next and what it costs.</p>
              </div>
            </div>
          </div>
        )
      }}
    </ScrollFrames>
  )
}

function MiniMark() {
  return (
    <svg viewBox="0 0 18 16" width="30" height="27" shapeRendering="crispEdges" aria-hidden="true">
      {LOGO.map((v, i) => <rect key={i} x={v.c} y={v.r} width="0.9" height="0.9" fill={v.f === '#14141A' ? '#FFFFFF' : v.f} />)}
    </svg>
  )
}

/** Hands the site back to the 3D world: the screen looks exactly like the first frame of the pull-out. */
export function PullOut() {
  return (
    <ScrollFrames urls={PULL} vh={420} id="forged">
      {(p) => (
        <>
          <div className="screen-hand forged-hand" style={{ opacity: 1 - seg(p, 0.0, 0.05) }}>
            <ForgedCard />
          </div>
          <div className="hero-bar end-bar" style={{ opacity: seg(p, 0.86, 0.97) }}>
            <p className="hero-line"><b>Forged by DuoForge.</b> Your idea could be next.</p>
            <a href="#forge" className="btn btn-primary">Forge my idea <span aria-hidden="true">→</span></a>
          </div>
        </>
      )}
    </ScrollFrames>
  )
}

const blk = (c0: number, c1: number, r0: number, r1: number) => { const o: [number, number][] = []; for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) o.push([c, r]); return o }
const LOGO = [
  ...[...blk(0, 1, 2, 15), ...blk(2, 5, 2, 3), ...blk(2, 5, 14, 15), ...blk(6, 7, 4, 5), ...blk(6, 7, 12, 13)].map(([c, r]) => ({ c, r, f: '#14141A' })),
  ...[...blk(8, 9, 2, 15), ...blk(10, 15, 2, 3), ...blk(10, 13, 8, 9)].map(([c, r]) => ({ c, r, f: '#FF5A1F' })),
  ...[...blk(16, 17, 0, 1), [15, 5] as [number, number]].map(([c, r]) => ({ c, r, f: '#FFB020' })),
]
export function ForgedCard() {
  return (
    <div className="forged-card">
      <svg viewBox="0 0 18 16" shapeRendering="crispEdges" aria-hidden="true">{LOGO.map((v, i) => <rect key={i} x={v.c} y={v.r} width="0.9" height="0.9" fill={v.f === '#14141A' ? '#FFFFFF' : v.f} />)}</svg>
      <b>100% · FORGED.</b>
      <span>Your product, live.</span>
    </div>
  )
}
