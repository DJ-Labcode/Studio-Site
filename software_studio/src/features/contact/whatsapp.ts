/**
 * A link that opens WhatsApp with `text` already typed.
 * With a number (digits with country code, e.g. 919876543210) it opens a chat with that number;
 * without one, WhatsApp lets the visitor pick who to send it to.
 */
export function whatsappUrl(text: string, number?: string) {
  const digits = (number ?? '').replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

/** The message a visitor sends, as one block of text. */
export function briefAsText(b: { name: string; need: string; message: string }) {
  return [`Hi, I'm ${b.name || 'a visitor'}.`, `I need: ${b.need}.`, b.message]
    .filter(Boolean)
    .join('\n')
}
