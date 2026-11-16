import { useState, type FormEvent } from 'react'
import { brand } from '@/shared/brand'
import { cn } from '@/shared/lib/cn'
import { RAIL_SECTIONS, railTerminus } from '@/shared/lib/rail'
import { useVisit, type Need } from '@/shared/state/visit'
import { Eyebrow } from '@/shared/ui/Eyebrow'
import { Lane } from '@/shared/ui/Lane'
import { isConfigured, sendBrief } from './sendBrief'

const NEEDS: { need: Need; label: string }[] = [
  { need: 'website', label: 'A website' },
  { need: 'app', label: 'An app' },
  { need: 'both', label: 'Both' },
]
type State = 'idle' | 'sending' | 'sent' | 'error'

const label = 'text-muted grid gap-1.5 text-[0.8125rem] font-medium'
const field =
  'border-line bg-paper text-ink w-full rounded-[10px] border px-3.5 py-3 text-base font-normal focus:outline-2 focus:outline-offset-1 focus:outline-ember'
const small = 'text-muted text-[0.6875rem] font-medium tracking-[0.14em] uppercase'

/**
 * The last stop. Both lines end in a ring above an orange block that holds a ticket:
 * the form is the ticket, and its tear-off stub lists the two people who will work on the project.
 * Whatever the visitor typed on the home screen is already written on it.
 */
export function ContactSection() {
  const need = useVisit((s) => s.need)
  const choose = useVisit((s) => s.choose)
  const brief = useVisit((s) => s.brief)
  const setBrief = useVisit((s) => s.setBrief)
  const [state, setState] = useState<State>('idle')
  const needLabel = NEEDS.find((n) => n.need === need)?.label ?? 'Both'

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const sent = {
      name: String(data.get('name')),
      email: String(data.get('email')),
      message: brief,
      summary: needLabel,
    }
    if (!isConfigured()) {
      // no EmailJS keys yet: open the visitor's mail app with the brief filled in
      const to = brand.founders.map((f) => f.email).join(',')
      const body = `Name: ${sent.name}\nEmail: ${sent.email}\nNeed: ${needLabel}\n\n${sent.message}`
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(`New project: ${needLabel}`)}&body=${encodeURIComponent(body)}`
      return
    }
    setState('sending')
    try {
      await sendBrief(sent)
      setState('sent')
    } catch {
      setState('error')
    }
  }

  return (
    <section id={RAIL_SECTIONS.contact} className="scroll-mt-10 pt-24 pb-10 md:pt-30">
      <Lane className="grid justify-items-center">
        <div {...railTerminus} className="size-[72px]" />
      </Lane>
      <div className="mx-auto mt-7 w-full max-w-6xl px-4">
        <div className="bg-ember grid gap-[clamp(24px,4vw,40px)] rounded-[26px] p-[clamp(22px,5vw,60px)] text-white md:rounded-[36px]">
          <header className="grid gap-3.5">
            <Eyebrow className="text-[#ffe0d3]">Last stop · Contact</Eyebrow>
            <h2 className="text-[clamp(2.3rem,6vw,4.6rem)] leading-none font-bold">
              Next stop: <span className="text-ink">your project.</span>
            </h2>
            <p className="max-w-[44ch] text-[1.0625rem] text-[#fff1ea]">
              Fill in the ticket. One of us replies, and both of us work on it.
            </p>
          </header>

          <div className="bg-surface text-ink relative grid rounded-[22px] shadow-[0_34px_50px_-34px_rgb(110_30_0/0.75)] md:grid-cols-[minmax(0,1fr)_270px]">
            {state === 'sent' ? (
              <div role="status" className="grid content-center gap-2 p-[clamp(18px,3vw,32px)]">
                <p className="font-display text-3xl font-bold">Ticket booked.</p>
                <p className="text-muted">Thanks, we’ve got your brief and will reply by email.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="grid min-w-0 gap-[18px] p-[clamp(18px,3vw,32px)]">
                <div className="border-line flex items-end gap-3.5 border-b pb-[18px]">
                  <div className="grid gap-1">
                    <span className={small}>From</span>
                    <strong className="font-display text-[clamp(1.15rem,2.4vw,1.7rem)] leading-[1.1] font-bold tracking-tight">
                      Your idea
                    </strong>
                  </div>
                  <i
                    aria-hidden="true"
                    className="relative mb-[0.7em] h-0.5 min-w-5 flex-1 bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_8px,transparent_8px_15px)]"
                  >
                    <span className="border-l-ember absolute -top-[5px] -right-0.5 border-y-[6px] border-l-[10px] border-y-transparent" />
                  </i>
                  <div className="grid gap-1">
                    <span className={small}>To</span>
                    <strong className="font-display text-[clamp(1.15rem,2.4vw,1.7rem)] leading-[1.1] font-bold tracking-tight">
                      Launch day
                    </strong>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className={label}>
                    Your name
                    <input
                      id="contact-name"
                      name="name"
                      required
                      autoComplete="name"
                      className={field}
                    />
                  </label>
                  <label className={label}>
                    Your email
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className={field}
                    />
                  </label>
                </div>
                <fieldset>
                  <legend className={cn(label, 'mb-2')}>What do you need?</legend>
                  <div className="flex flex-wrap gap-2">
                    {NEEDS.map((n) => (
                      <label key={n.need} className="relative inline-flex">
                        <input
                          type="radio"
                          name="need"
                          id={`contact-need-${n.need}`}
                          value={n.need}
                          checked={need === n.need}
                          onChange={() => choose(n.need)}
                          className="peer absolute size-px opacity-0"
                        />
                        <span className="border-line peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline-ember cursor-pointer rounded-full border-[1.5px] px-[18px] py-2.5 text-[0.9375rem] transition peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                          {n.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className={label}>
                  Tell us about it
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={4}
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="What it should do, and when you need it"
                    className={cn(field, 'resize-y')}
                  />
                </label>
                <div className="flex flex-wrap items-center gap-x-[18px] gap-y-3">
                  <button
                    type="submit"
                    disabled={state === 'sending'}
                    className="bg-ember hover:bg-ember-deep cursor-pointer rounded-xl px-[22px] py-4 leading-none font-semibold text-white transition disabled:opacity-60"
                  >
                    {state === 'sending' ? 'Sending…' : 'Send project brief →'}
                  </button>
                  {state === 'error' && (
                    <p role="alert" className="text-muted text-sm">
                      That didn’t send. Please email us at{' '}
                      <span className="select-all">{brand.founders[0].email}</span>.
                    </p>
                  )}
                </div>
              </form>
            )}

            <aside className="border-line relative grid content-start gap-[18px] border-t-2 border-dashed px-[18px] py-[22px] md:border-t-0 md:border-l-2 md:px-6 md:py-8">
              {/* the two notches where the stub tears off */}
              <i
                aria-hidden="true"
                className="bg-ember absolute -top-[13px] -left-3 size-6 rounded-full md:-top-3 md:-left-[13px]"
              />
              <i
                aria-hidden="true"
                className="bg-ember absolute -top-[13px] -right-3 size-6 rounded-full md:top-auto md:right-auto md:-bottom-3 md:-left-[13px]"
              />
              <span className={small}>Your crew</span>
              {brand.founders.map((f) => (
                <div key={f.id} className="grid gap-0.5">
                  <strong className="font-display text-lg leading-tight font-bold tracking-tight">
                    {f.name}
                  </strong>
                  <span className="text-muted text-sm">
                    {f.world === 'web' ? 'Websites' : 'Apps'}
                  </span>
                  <a
                    href={f.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold underline underline-offset-4"
                  >
                    LinkedIn
                  </a>
                </div>
              ))}
              <div>
                <span className={small}>Admit</span>
                <p className="font-display mt-1 text-2xl leading-none font-bold tracking-tight">
                  One <span className="text-ember">project</span>
                </p>
              </div>
              <div
                aria-hidden="true"
                className="h-[46px] bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_2px,transparent_2px_5px,var(--color-ink)_5px_6px,transparent_6px_10px,var(--color-ink)_10px_13px,transparent_13px_15px)]"
              />
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
