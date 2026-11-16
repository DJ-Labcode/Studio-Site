import { useRef, useState, type FormEvent } from 'react'
import { brand } from '@/shared/brand'
import { useVisit, type Need } from '@/shared/state/visit'
import { Rise } from '@/shared/ui/Rise'
import { TitleBar } from '@/shared/ui/Window'
import { isConfigured, sendBrief } from './sendBrief'
import { briefAsText, whatsappUrl } from './whatsapp'

const NEEDS: { need: Need; label: string }[] = [
  { need: 'website', label: 'A website' },
  { need: 'app', label: 'An app' },
  { need: 'both', label: 'Both' },
]
type State = 'idle' | 'sending' | 'sent' | 'error'
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined

/**
 * Contact, as a new message addressed to both founders. Whatever the planner or a project wrote
 * is already in the message. It can be sent by email (through EmailJS) or opened in WhatsApp.
 */
export function MessageWindow() {
  const need = useVisit((s) => s.need)
  const brief = useVisit((s) => s.brief)
  const { setNeed, setBrief } = useVisit.getState()
  const [state, setState] = useState<State>('idle')
  const form = useRef<HTMLFormElement>(null)
  const needLabel = NEEDS.find((n) => n.need === need)?.label ?? 'Both'

  const read = () => {
    const data = new FormData(form.current ?? undefined)
    return {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: brief,
      summary: needLabel,
    }
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const sent = read()
    if (!isConfigured()) {
      // no EmailJS keys yet: open the visitor's mail app with the message filled in
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
  const openWhatsApp = () => {
    const { name, message } = read()
    window.open(
      whatsappUrl(briefAsText({ name, need: needLabel, message }), whatsappNumber),
      '_blank',
      'noopener',
    )
  }

  return (
    <Rise>
      <form ref={form} className="win" style={{ display: 'block' }} onSubmit={submit}>
        <TitleBar title="New message" />
        {state === 'sent' ? (
          <div className="mail" role="status">
            <h3>Message sent.</h3>
            <p style={{ margin: 0 }}>Thanks, we’ve got it and will reply by email.</p>
          </div>
        ) : (
          <div className="mail">
            <div className="to">
              To:{' '}
              {brand.founders.map((f) => (
                <b key={f.id}>{f.name}</b>
              ))}
            </div>
            <div className="two">
              <label className="f">
                Your name
                <input id="contact-name" name="name" required autoComplete="name" />
              </label>
              <label className="f">
                Your email
                <input id="contact-email" name="email" type="email" required autoComplete="email" />
              </label>
            </div>
            <fieldset>
              <legend>What do you need?</legend>
              {NEEDS.map((n) => (
                <label key={n.need} className="pill">
                  <input
                    type="radio"
                    name="need"
                    id={`contact-need-${n.need}`}
                    checked={need === n.need}
                    onChange={() => setNeed(n.need)}
                  />
                  <span>{n.label}</span>
                </label>
              ))}
            </fieldset>
            <label className="f">
              Your message
              <textarea
                id="contact-message"
                name="message"
                required
                placeholder="What it should do, and when you need it"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
              />
            </label>
            <div className="send">
              <button type="submit" disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : 'Send message →'}
              </button>
              <button
                type="button"
                className="wa"
                aria-label="Send on WhatsApp"
                title="Send on WhatsApp"
                onClick={openWhatsApp}
              >
                <svg viewBox="0 0 32 32" aria-hidden="true">
                  <path
                    fill="#fff"
                    d="M16 4.5A11.4 11.4 0 0 0 6.2 21.7L4.6 27.4l5.9-1.5A11.4 11.4 0 1 0 16 4.5Zm0 2.1a9.3 9.3 0 1 1-4.7 17.3l-.4-.2-3.3.9.9-3.2-.3-.4A9.3 9.3 0 0 1 16 6.6Z"
                  />
                  <path
                    fill="#fff"
                    d="M12.3 10.6c-.3-.6-.5-.6-.8-.6h-.7c-.2 0-.6.1-.9.5-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.5c.2.2 2.4 3.8 5.900 5.2 2.9 1.100 3.5.9 4.100.8.6-.1 2-.8 2.3-1.600.3-.8.3-1.500.2-1.600-.1-.2-.3-.2-.7-.4l-2.300-1.100c-.3-.1-.5-.2-.8.2l-1 1.300c-.2.2-.4.3-.7.1-.4-.2-1.500-.6-2.800-1.800-1-.9-1.700-2.100-1.900-2.400-.2-.4 0-.5.2-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2.1-.4 0-.6l-1.100-2.500Z"
                  />
                </svg>
              </button>
              {state === 'error' && (
                <span id="sent" role="alert">
                  That didn’t send. Please email{' '}
                  <span style={{ userSelect: 'all' }}>{brand.founders[0].email}</span>.
                </span>
              )}
            </div>
          </div>
        )}
      </form>
    </Rise>
  )
}
