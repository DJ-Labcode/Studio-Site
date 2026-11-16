import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { projects } from '@/content/projects'
import { brand } from '@/shared/brand'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { scrollToId } from '@/shared/lib/scrollTo'
import { SECTIONS } from '@/shared/lib/sections'
import { useVisit } from '@/shared/state/visit'
import { Window } from '@/shared/ui/Window'
import { lengthOf, studioCode, typed } from './code'

const HINTS = [
  'a booking app for my clinic',
  'a website for my coaching class',
  'an online store for my shop',
  'an app for my students',
]

function MenuBar() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const tick = window.setInterval(() => setTime(new Date()), 30_000)
    return () => window.clearInterval(tick)
  }, [])
  return (
    <div className="menubar">
      <span className="brand">
        {brand.nameParts[0]}
        <b>{brand.nameParts[1]}</b>
      </span>
      <span className="sys" aria-hidden="true">
        <span>{brand.location.split(',')[0]}</span>
        <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <i className="bat">
          <i />
        </i>
      </span>
    </div>
  )
}

/** The editor types the studio's description once the laptop has started. */
function CodeEditor() {
  const still = useReducedMotion()
  const started = useVisit((s) => s.introDone)
  const lines = useMemo(
    () =>
      studioCode({
        name: brand.name,
        city: brand.location.split(',')[0] ?? '',
        team: brand.founders.map((f) => f.name.split(' ')[0] ?? ''),
        shipped: projects.length,
      }),
    [],
  )
  const total = lengthOf(lines) + lines.length
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!started || still) return
    const type = window.setInterval(() => setCount((c) => (c >= total ? c : c + 2)), 22)
    return () => window.clearInterval(type)
  }, [started, still, total])
  const done = still || count >= total
  const shown = done ? lines : typed(lines, count)
  return (
    <Window title="studio.ts" className="editor">
      <pre className="code" aria-label={`${brand.description}`}>
        {shown.map((line, i) => (
          <span key={i} className="l">
            {line.length === 0
              ? ' '
              : line.map(([text, tone], k) =>
                  tone ? (
                    <span key={k} className={tone}>
                      {text}
                    </span>
                  ) : (
                    text
                  ),
                )}
            {i === shown.length - 1 && <span className="caret" />}
          </span>
        ))}
      </pre>
    </Window>
  )
}

/** Beside the code: a website and an app taking shape, block by block, on a loop. */
function LivePreview() {
  const delay = (s: number) => ({ animationDelay: `${s}s` })
  return (
    <Window title="Live preview" className="preview" aria-hidden="true">
      <div className="pv">
        <div className="site">
          <i className="nav" style={delay(0.2)} />
          <i className="heroB" style={delay(0.8)} />
          <i className="tx" style={delay(1.4)} />
          <i className="tx s2" style={delay(1.7)} />
          <div className="cards">
            <i style={delay(2.2)} />
            <i style={delay(2.6)} />
            <i style={delay(3)} />
          </div>
        </div>
        <div className="phone">
          <i className="h" style={delay(3.6)} />
          <i className="r" style={delay(4)} />
          <i className="r" style={delay(4.3)} />
          <i className="r" style={delay(4.6)} />
          <i className="b" style={delay(5)} />
        </div>
      </div>
    </Window>
  )
}

/** The one input on the home screen. What the visitor types goes to the planner. */
function CommandBar() {
  const [hint, setHint] = useState(0)
  useEffect(() => {
    const turn = window.setInterval(() => setHint((h) => (h + 1) % HINTS.length), 2600)
    return () => window.clearInterval(turn)
  }, [])
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const idea = String(new FormData(form).get('idea') ?? '').trim()
    if (idea) useVisit.getState().askPlanner(idea)
    form.reset()
    scrollToId(SECTIONS.planner)
  }
  return (
    <div className="cmd">
      <form onSubmit={submit}>
        <label htmlFor="idea">I want to build</label>
        <input id="idea" name="idea" autoComplete="off" placeholder={HINTS[hint]} />
        <button type="submit">
          Plan it <span aria-hidden="true">→</span>
        </button>
      </form>
      <p>
        Type your idea and press <kbd>Enter</kbd>. The planner turns it into a first plan.
      </p>
    </div>
  )
}

/** What the laptop's screen shows first: a menu bar, the code editor, the live preview and the command bar. */
export function Desktop() {
  return (
    <>
      <MenuBar />
      <div className="desk">
        <h1 className="sr-only">{brand.description}</h1>
        <CodeEditor />
        <LivePreview />
        <CommandBar />
      </div>
    </>
  )
}
