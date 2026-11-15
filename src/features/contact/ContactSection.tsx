import { useState, type FormEvent } from 'react'
import { brand } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { isConfigured, sendBrief } from './sendBrief'

const NEEDS = ['Website', 'Mobile app', 'Both', 'Not sure yet'] as const
type State = 'idle' | 'sending' | 'sent' | 'error'

const label = 'grid gap-2 font-mono text-[0.7rem] tracking-widest text-muted uppercase'
const field =
  'w-full rounded-md border border-line bg-surface px-4 py-3.5 font-sans text-base tracking-normal text-ink normal-case placeholder:text-muted/60 focus:border-ember focus:outline-none'

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
    <section id="contact" className="border-line relative border-t px-5 py-28">
      <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-2">
        <div className="grid content-start gap-6">
          <p className="text-ember font-mono text-[0.7rem] tracking-[0.18em] uppercase">Contact</p>
          <h2 className="text-[clamp(2.4rem,6vw,5.4rem)] leading-none font-medium uppercase">
            Let’s forge <span className="text-ember">yours.</span>
          </h2>
          <p className="text-muted max-w-md text-lg">
            Tell us what you want to build. We reply within one working day with questions, a rough
            timeline and a price range.
          </p>
          <ul className="border-line grid gap-3 border-t pt-6">
            {brand.founders.map((f) => (
              <li key={f.id} className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-display text-xl font-medium">{f.name}</span>
                <span className="text-muted font-mono text-sm select-all">{f.email}</span>
              </li>
            ))}
            <li className="text-muted font-mono text-[0.7rem] tracking-widest uppercase">
              {brand.location}
            </li>
          </ul>
        </div>

        {state === 'sent' ? (
          <div
            role="status"
            className="border-line bg-surface/60 grid content-center gap-3 rounded-2xl border p-8"
          >
            <p className="font-display text-3xl font-medium">Thanks, we’ve got it.</p>
            <p className="text-muted">We’ll reply within one working day.</p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="border-line bg-surface/60 grid content-start gap-5 rounded-2xl border p-6 backdrop-blur-sm sm:p-8"
          >
            <fieldset className="grid gap-3">
              <legend className="text-muted mb-3 font-mono text-[0.7rem] tracking-widest uppercase">
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
                        : 'border-line text-ink hover:border-muted',
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={label}>
                Name
                <input
                  id="contact-name"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className={field}
                />
              </label>
              <label className={label}>
                Email
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={field}
                />
              </label>
            </div>
            <label className={label}>
              Project
              <textarea
                id="contact-message"
                name="message"
                required
                rows={4}
                placeholder="A booking app for my clinic, Android first…"
                className={cn(field, 'resize-y')}
              />
            </label>
            <Button type="submit" disabled={state === 'sending'}>
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
