import emailjs from '@emailjs/browser'

export type Brief = { name: string; email: string; message: string; summary?: string }

const cfg = {
  service: import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined,
  template: import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined,
  key: import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined,
}

export const isConfigured = () => Boolean(cfg.service && cfg.template && cfg.key)

/** Sends a project brief through EmailJS. Throws if the keys in .env are missing or the send fails. */
export async function sendBrief(brief: Brief): Promise<void> {
  if (!cfg.service || !cfg.template || !cfg.key)
    throw new Error('EmailJS is not configured: fill in .env (see .env.example)')
  await emailjs.send(cfg.service, cfg.template, brief, { publicKey: cfg.key })
}
