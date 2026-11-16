import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { scrollToId } from '@/shared/lib/scrollTo'
import { SECTIONS } from '@/shared/lib/sections'
import { useVisit } from '@/shared/state/visit'
import { Rise } from '@/shared/ui/Rise'
import { TitleBar } from '@/shared/ui/Window'
import { makePlan, planAsText, plannerIsLive, type Plan } from './plan'

const SUGGESTIONS = [
  'a booking app for my clinic',
  'a website for my coaching class',
  'an online store for my shop',
]
type Turn = { idea: string; plan: Plan | null }

/**
 * The planner: a small chat. The visitor describes what they want; it answers with a first plan
 * and offers to put that plan into the message to the studio. Ideas typed in the home screen's
 * command bar arrive here too.
 */
export function Planner() {
  const [turns, setTurns] = useState<Turn[]>([])

  const ask = useCallback((raw: string) => {
    const idea = raw.trim()
    if (!idea) return
    setTurns((t) => [...t, { idea, plan: null }])
    // a short pause so the answer reads as a reply, not a flash
    const wait = new Promise((resolve) => setTimeout(resolve, 900))
    void Promise.all([makePlan(idea), wait]).then(([plan]) =>
      setTurns((t) =>
        t.map((turn) => (turn.idea === idea && !turn.plan ? { ...turn, plan } : turn)),
      ),
    )
  }, [])

  // pick up an idea typed in the command bar
  const pending = useVisit((s) => s.idea)
  useEffect(() => {
    if (!pending) return
    useVisit.getState().askPlanner('')
    ask(pending)
  }, [pending, ask])

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    ask(String(new FormData(form).get('idea') ?? ''))
    form.reset()
  }
  function send(turn: Turn) {
    if (!turn.plan) return
    const visit = useVisit.getState()
    visit.setBrief(planAsText(turn.idea, turn.plan))
    visit.setNeed(turn.plan.need)
    scrollToId(SECTIONS.contact)
  }

  return (
    <Rise>
      <div className="win ai">
        <div style={{ display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)' }}>
          <TitleBar title={plannerIsLive() ? 'DuoForge AI planner' : 'DuoForge planner'} />
          <div className="chat" aria-live="polite">
            <div className="msg bot">
              <p>
                <span className="spark">✦</span>Hi. What do you want to build? One sentence is
                enough.
              </p>
            </div>
            {turns.length === 0 && (
              <div className="chips">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => ask(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {turns.map((turn, i) => (
              <div key={i} style={{ display: 'contents' }}>
                <div className="msg me">
                  <p>{turn.idea}</p>
                </div>
                {turn.plan ? (
                  <div className="msg bot swap">
                    <div className="plan">
                      <h3>
                        <span className="spark">✦</span>A first plan
                      </h3>
                      <dl>
                        <dt>You need</dt>
                        <dd>{turn.plan.type}</dd>
                        <dt>Screens</dt>
                        <dd>{turn.plan.screens.join(' · ')}</dd>
                        <dt>We’d ask</dt>
                        <dd>
                          {turn.plan.questions.map((q) => (
                            <span key={q} style={{ display: 'block' }}>
                              {q}
                            </span>
                          ))}
                        </dd>
                        <dt>Steps</dt>
                        <dd>Idea → design → build → launch</dd>
                      </dl>
                      <div className="links">
                        <button type="button" className="want" onClick={() => send(turn)}>
                          Send this plan to us →
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="msg bot">
                    <p className="dots" aria-label="Working on it">
                      <i />
                      <i />
                      <i />
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <form className="ask" onSubmit={submit}>
          <input
            name="idea"
            aria-label="Describe what you want to build"
            placeholder="Describe what you want to build"
            autoComplete="off"
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </Rise>
  )
}
