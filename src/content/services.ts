import type { World } from '@/shared/brand'

/** What each side of the studio does, in the order the lines appear on scroll. */
export const services: Record<World, { title: string; lines: string[]; code: string[] }> = {
  web: {
    title: 'Web',
    lines: [
      'Responsive websites',
      'Landing pages',
      'Next.js & Tailwind CSS',
      'Login & data with Firebase',
      'Forms that reach you',
    ],
    code: [
      '<section class="hero">',
      '  <h1>{headline}</h1>',
      '</section>',
      'await addDoc(admissions, form)',
    ],
  },
  app: {
    title: 'Apps',
    lines: [
      'Android & iOS with Flutter',
      'Payments & subscriptions',
      'Firebase & FastAPI backends',
      'AI assistants on your data',
      'Play Store launch',
    ],
    code: [
      'Widget build(BuildContext context)',
      'final plan = await billing.buy(id);',
      'POST /api/orders → 201',
      'answer = rag.ask(question)',
    ],
  },
}
