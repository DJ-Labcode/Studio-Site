import { useState, type FormEvent } from 'react'
import { brand } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { isConfigured, sendBrief } from './sendBrief'

const NEEDS = ['Website', 'Mobile app', 'Both', 'Not sure yet'] as const
type State = 'idle' | 'sending' | 'sent' | 'error'

const field =
  'w-full rounded-md border border-white/20 bg-white/5 px-4 py-3.5 text-paper placeholder:text-paper/40 focus:border-ember focus:outline-none'

/** The last page: one short form, plus direct addresses for people who prefer email. */
export function ContactSection() {
  const [need, setNeed] = useState<(typeof NEEDS)[number]>('Website')
  const [state, setState] = useState<State>('idle')

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const brief = {
      name: String(data.get('name')),
      email: String(data.get('email')),
      message: String(data.get('message')),
      summary: need,
    }
    if (!isConfigured()) {
      // no EmailJS keys yet: open the visitor's mail app with the brief filled in
      const to = brand.founders.map((f) => f.email).join(',')
      const body = `Name: ${brief.name}\nEmail: ${brief.email}\nNeed: ${need}\n\n${brief.message}`
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(`New project: ${need}`)}&body=${encodeURIComponent(body)}`
      return
    }
    setState('sending')
    try {
      await sendBrief(brief)
      setState('sent')
    } catch {
      setState('error')
    }
  }

  return (
    <section id="contact" className="bg-ink text-paper relative px-5 py-28">
      <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-2">
        <div className="grid content-start gap-6">
          <p className="text-ember font-mono text-xs tracking-[0.2em] uppercase">Contact</p>
          <h2 className="text-[clamp(3rem,8vw,7rem)] leading-[0.92] uppercase">
            Let’s forge <span className="text-ember">yours.</span>
          </h2>
          <p className="text-paper/70 max-w-md text-lg">
            Tell us what you want to build. We reply within one working day with questions, a rough
            timeline and a price range.
          </p>
          <ul className="grid gap-3 border-t border-white/15 pt-6">
            {brand.founders.map((f) => (
              <li key={f.id} className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-display text-xl font-bold">{f.name}</span>
                <span className="text-paper/80 font-mono text-sm select-all">{f.email}</span>
              </li>
            ))}
            <li className="text-paper/50 font-mono text-xs tracking-widest uppercase">
              {brand.location}
            </li>
          </ul>
        </div>

        {state === 'sent' ? (
          <div
            role="status"
            className="grid content-center gap-3 rounded-2xl border border-white/15 p-8"
          >
            <p className="font-display text-3xl font-bold">Thanks, we’ve got it.</p>
            <p className="text-paper/70">We’ll reply within one working day.</p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="grid content-start gap-5 rounded-2xl border border-white/15 p-6 sm:p-8"
          >
            <fieldset className="grid gap-3">
              <legend className="text-paper/60 mb-3 font-mono text-xs tracking-widest uppercase">
                What do you need?
              </legend>
              <div className="flex flex-wrap gap-2">
                {NEEDS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={need === n}
                    onClick={() => setNeed(n)}
                    className={cn(
                      'rounded-md border px-4 py-2.5 text-sm font-semibold transition',
                      need === n
                        ? 'border-ember bg-ember text-white'
                        : 'text-paper border-white/20 hover:border-white/50',
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-paper/60 grid gap-2 font-mono text-xs tracking-widest uppercase">
                Name
                <input
                  id="contact-name"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className={cn(field, 'font-sans text-base tracking-normal normal-case')}
                />
              </label>
              <label className="text-paper/60 grid gap-2 font-mono text-xs tracking-widest uppercase">
                Email
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={cn(field, 'font-sans text-base tracking-normal normal-case')}
                />
              </label>
            </div>
            <label className="text-paper/60 grid gap-2 font-mono text-xs tracking-widest uppercase">
              Project
              <textarea
                id="contact-message"
                name="message"
                required
                rows={4}
                placeholder="A booking app for my clinic, Android first…"
                className={cn(field, 'resize-y font-sans text-base tracking-normal normal-case')}
              />
            </label>
            <Button
              type="submit"
              disabled={state === 'sending'}
              className="shadow-[4px_4px_0_var(--color-paper)] hover:shadow-[6px_6px_0_var(--color-paper)]"
            >
              {state === 'sending' ? 'Sending…' : 'Send project brief →'}
            </Button>
            {state === 'error' && (
              <p role="alert" className="text-spark text-sm">
                That didn’t send. Please email us directly at {brand.founders[0].email}.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
