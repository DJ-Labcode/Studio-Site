import { useEffect, useState } from 'react'
import type { Project } from '../data'

/* Working, tappable versions of the three apps. Everything runs locally with sample data. */

function Tabs({ tabs, tab, set }: { tabs: string[]; tab: number; set: (i: number) => void }) {
  return (
    <nav className="lv-tabs" aria-label="App tabs">
      {tabs.map((t, i) => (
        <button key={t} className={tab === i ? 'on' : ''} onClick={() => set(i)} aria-current={tab === i}>
          <i aria-hidden="true" />
          {t}
        </button>
      ))}
    </nav>
  )
}

/* ── HSC-iT ── */
const QUESTIONS = [
  { q: 'Which OSI layer handles routing?', a: ['Transport', 'Network', 'Session', 'Data link'], c: 1, why: 'The Network layer (layer 3) picks the path packets take.' },
  { q: 'Which HTML tag makes a hyperlink?', a: ['<link>', '<href>', '<a>', '<url>'], c: 2, why: '<a href="…"> creates a hyperlink.' },
  { q: 'What does SQL’s WHERE clause do?', a: ['Sorts rows', 'Filters rows', 'Joins tables', 'Deletes tables'], c: 1, why: 'WHERE keeps only rows that match a condition.' },
]
const CHAPTERS = [
  { n: 'Advanced web design', p: 82 }, { n: 'Introduction to SEO', p: 64 }, { n: 'Advanced JavaScript', p: 47 },
  { n: 'E-commerce & e-governance', p: 71 }, { n: 'Networking basics', p: 28 },
]
function Hscit() {
  const [tab, setTab] = useState(1)
  const [qi, setQi] = useState(0)
  const [pick, setPick] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [open, setOpen] = useState<number | null>(null)
  const done = qi >= QUESTIONS.length
  const Q = QUESTIONS[Math.min(qi, QUESTIONS.length - 1)]
  const choose = (i: number) => {
    if (pick !== null) return
    setPick(i)
    if (i === Q.c) setScore((s) => s + 1)
  }
  return (
    <>
      <div className="lv-body">
        {tab === 0 && (
          <div className="lv-stack">
            <p className="lv-k">Syllabus · tap a chapter</p>
            {CHAPTERS.map((c, i) => (
              <button key={c.n} className="lv-card lv-chapter" onClick={() => setOpen(open === i ? null : i)}>
                <span className="lv-row"><b>{c.n}</b><small>{c.p}%</small></span>
                <span className="lv-meter"><i style={{ width: `${c.p}%` }} /></span>
                {open === i && <span className="lv-note">Short theory, 20 MCQs and 2 practicals in this chapter.</span>}
              </button>
            ))}
          </div>
        )}
        {tab === 1 && (
          <div className="lv-stack">
            {!done ? (
              <>
                <p className="lv-k">Quiz · question {qi + 1} of {QUESTIONS.length}</p>
                <p className="lv-q">{Q.q}</p>
                {Q.a.map((o, i) => (
                  <button key={o} className={`lv-opt ${pick === null ? '' : i === Q.c ? 'right' : i === pick ? 'wrong' : 'dim'}`} onClick={() => choose(i)}>
                    {o}
                  </button>
                ))}
                {pick !== null && (
                  <>
                    <p className="lv-why">{pick === Q.c ? 'Correct. ' : 'Not quite. '}{Q.why}</p>
                    <button className="lv-btn" onClick={() => { setQi(qi + 1); setPick(null) }}>
                      {qi + 1 < QUESTIONS.length ? 'Next question' : 'See result'}
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="lv-result">
                <p className="lv-k">Result</p>
                <p className="lv-big">{score}/{QUESTIONS.length}</p>
                <p className="lv-note">Weakest chapter: Networking basics. We added 10 practice MCQs to your list.</p>
                <button className="lv-btn" onClick={() => { setQi(0); setScore(0); setPick(null) }}>Try again</button>
              </div>
            )}
          </div>
        )}
        {tab === 2 && (
          <div className="lv-stack">
            <p className="lv-k">Your progress</p>
            <div className="lv-stats"><div><b>{58 + score * 4}%</b><span>syllabus done</span></div><div><b>12</b><span>day streak</span></div></div>
            <p className="lv-k">Weakest first</p>
            {[...CHAPTERS].sort((a, b) => a.p - b.p).map((c) => (
              <div key={c.n} className="lv-row lv-line"><span>{c.n}</span><span className={c.p < 50 ? 'bad' : ''}>{c.p}%</span></div>
            ))}
          </div>
        )}
      </div>
      <Tabs tabs={['Learn', 'Quiz', 'Progress']} tab={tab} set={setTab} />
    </>
  )
}

/* ── StreamForge ── */
const VIDEOS = [
  { t: 'Building an HLS pipeline', d: '12:40', v: '12K' },
  { t: 'FastAPI in 20 minutes', d: '19:05', v: '8.4K' },
  { t: 'Redis caching, explained', d: '9:12', v: '5.1K' },
  { t: 'Docker for Flutter devs', d: '14:30', v: '3.9K' },
]
const UPLOAD_STEPS = ['Uploading', 'Transcoding 1080p', 'Transcoding 720p', 'Transcoding 360p', 'Writing HLS playlist', 'Ready to stream']
function Stream() {
  const [tab, setTab] = useState(0)
  const [vid, setVid] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [q, setQ] = useState('Auto')
  const [up, setUp] = useState(-1)
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setT((x) => (x >= 100 ? 0 : x + 1)), 120)
    return () => clearInterval(id)
  }, [playing])
  useEffect(() => {
    if (up < 0 || up >= UPLOAD_STEPS.length - 1) return
    const id = setTimeout(() => setUp(up + 1), 900)
    return () => clearTimeout(id)
  }, [up])
  return (
    <>
      <div className="lv-body">
        {tab === 0 && (
          <div className="lv-stack">
            <p className="lv-k">For you · tap to play</p>
            {VIDEOS.map((v, i) => (
              <button key={v.t} className="lv-video-row" onClick={() => { setVid(i); setT(0); setPlaying(true); setTab(1) }}>
                <span className="lv-thumb" style={{ filter: `hue-rotate(${i * 40}deg)` }}><small>{v.d}</small></span>
                <span><b>{v.t}</b><small>{v.v} views</small></span>
              </button>
            ))}
          </div>
        )}
        {tab === 1 && (
          <div className="lv-stack">
            <button className="lv-player" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'}>
              <span className={playing ? 'lv-pause' : 'lv-play'} />
              <span className="lv-q-badge">{q === 'Auto' ? 'Auto · 720p' : q}</span>
              <span className="lv-scrub"><i style={{ width: `${t}%` }} /></span>
            </button>
            <p className="lv-q">{VIDEOS[vid].t}</p>
            <p className="lv-k">Quality</p>
            <div className="lv-chips">
              {['Auto', '1080p', '720p', '360p'].map((x) => (
                <button key={x} className={q === x ? 'on' : ''} onClick={() => setQ(x)}>{x}</button>
              ))}
            </div>
            <p className="lv-note">Playback switches quality automatically with your network speed (HLS).</p>
          </div>
        )}
        {tab === 2 && (
          <div className="lv-stack">
            <p className="lv-k">Upload a video</p>
            {up < 0 ? (
              <button className="lv-drop" onClick={() => setUp(0)}>+ Choose demo-video.mp4</button>
            ) : (
              <div className="lv-pipeline">
                {UPLOAD_STEPS.map((s, i) => (
                  <div key={s} className={`lv-step ${i < up ? 'done' : i === up ? 'now' : ''}`}><i />{s}</div>
                ))}
                {up === UPLOAD_STEPS.length - 1 && <button className="lv-btn" onClick={() => setUp(-1)}>Upload another</button>}
              </div>
            )}
          </div>
        )}
      </div>
      <Tabs tabs={['Home', 'Player', 'Upload']} tab={tab} set={setTab} />
    </>
  )
}

/* ── PlantIQ ── */
const ANSWERS: Record<string, { a: string; src: string }> = {
  'Which licence expires next?': { a: 'Fire NOC expires on 1 Dec 2026, in 18 days. Renewal needs the latest extinguisher audit.', src: 'Licences/Fire-NOC-2025.pdf' },
  'How much PP granule is left?': { a: '420 kg in store. At this week’s usage that lasts about 6 days. Reorder level is 500 kg.', src: 'Inventory · live' },
  'What did Line 2 make yesterday?': { a: '1,240 units of 500 ml bottles across 3 batches. Downtime: 35 minutes for a mould change.', src: 'Production log · 12 Nov' },
}
function Plant() {
  const [tab, setTab] = useState(0)
  const [stock, setStock] = useState([{ n: 'PP granules', q: 420, min: 500 }, { n: 'Caps 28 mm', q: 18000, min: 10000 }, { n: 'Labels', q: 6500, min: 8000 }, { n: 'Cartons', q: 940, min: 600 }])
  const [ask, setAsk] = useState<string | null>(null)
  const [typed, setTyped] = useState(0)
  useEffect(() => {
    if (!ask) return
    setTyped(0)
    const full = ANSWERS[ask].a.length
    const id = setInterval(() => setTyped((x) => (x >= full ? x : x + 2)), 18)
    return () => clearInterval(id)
  }, [ask])
  return (
    <>
      <div className="lv-body">
        {tab === 0 && (
          <div className="lv-stack">
            <p className="lv-k">Today · Line 2</p>
            <div className="lv-stats"><div><b>1,240</b><span>units</span></div><div><b>96%</b><span>uptime</span></div></div>
            <div className="lv-chart">{[40, 62, 55, 78, 70, 88, 64].map((h, i) => <span key={i} style={{ height: `${h}%` }}><small>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</small></span>)}</div>
            <div className="lv-card warn">Fire NOC renews in 18 days</div>
          </div>
        )}
        {tab === 1 && (
          <div className="lv-stack">
            <p className="lv-k">Inventory · tap restock</p>
            {stock.map((s, i) => (
              <div key={s.n} className="lv-card lv-row">
                <span><b>{s.n}</b><small className={s.q < s.min ? 'bad' : ''}>{s.q.toLocaleString('en-IN')} {s.q < s.min ? '· low' : ''}</small></span>
                <button className="lv-mini" onClick={() => setStock(stock.map((x, j) => (j === i ? { ...x, q: x.q + Math.round(x.min / 2) } : x)))}>+ Restock</button>
              </div>
            ))}
          </div>
        )}
        {tab === 2 && (
          <div className="lv-stack">
            <p className="lv-k">Ask your plant · pick a question</p>
            {Object.keys(ANSWERS).map((q) => (
              <button key={q} className={`lv-ask ${ask === q ? 'on' : ''}`} onClick={() => setAsk(q)}>{q}</button>
            ))}
            {ask && (
              <div className="lv-answer">
                <p>{ANSWERS[ask].a.slice(0, typed)}</p>
                {typed >= ANSWERS[ask].a.length && <small>Source: {ANSWERS[ask].src}</small>}
              </div>
            )}
          </div>
        )}
      </div>
      <Tabs tabs={['Today', 'Stock', 'Ask']} tab={tab} set={setTab} />
    </>
  )
}

export default function LiveApp({ p }: { p: Project }) {
  return (
    <div className="lv-phone" style={{ ['--hue' as string]: p.hue }}>
      <div className="lv-notch" />
      <div className="lv-screen">
        <div className="lv-status mono"><span>9:41</span><span>{p.name}</span><span>●●●</span></div>
        {p.screen === 'quiz' ? <Hscit /> : p.screen === 'video' ? <Stream /> : <Plant />}
      </div>
    </div>
  )
}
