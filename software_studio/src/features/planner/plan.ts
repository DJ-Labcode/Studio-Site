import type { Need } from '@/shared/state/visit'

export type Plan = {
  need: Need
  /** who would build it, in words */
  type: string
  screens: string[]
  questions: string[]
}

const TOPICS: { match: RegExp; screens: string[]; questions: string[] }[] = [
  {
    match: /clinic|doctor|hospital|patient|appointment|salon|booking/i,
    screens: [
      'Book an appointment',
      'Timings and availability',
      'Reminders by message',
      'Customer login',
    ],
    questions: ['How many bookings do you take in a day?', 'Should customers pay while booking?'],
  },
  {
    match: /coach|class|student|school|tuition|course|exam|learn/i,
    screens: [
      'Courses and batches',
      'Admission or enquiry form',
      'Tests and results',
      'Fees and receipts',
    ],
    questions: ['How many students will use it?', 'Do you want online tests, or only information?'],
  },
  {
    match: /shop|store|sell|product|order|e-?commerce/i,
    screens: ['Product catalogue', 'Cart and checkout', 'Order tracking', 'Offers and coupons'],
    questions: ['How many products will you list?', 'Which payment methods do you need?'],
  },
  {
    match: /restaurant|food|cafe|menu|kitchen/i,
    screens: ['Menu', 'Table booking or ordering', 'Offers', 'Location and hours'],
    questions: ['Do you deliver, or only dine-in?', 'Should orders come to your phone?'],
  },
]
const GENERAL = {
  screens: ['Home', 'What you offer', 'Enquiry form', 'About and contact'],
  questions: [
    'Who will use it most: customers or your own team?',
    'Is there a date you need it by?',
  ],
}
const TYPE: Record<Need, string> = {
  app: 'A mobile app',
  website: 'A website',
  both: 'A website and an app',
}

/**
 * A first plan worked out from the visitor's own words, by simple rules: no network, no cost.
 * It reads whether they need a website or an app, then suggests screens and questions for their kind of business.
 */
export function draftPlan(idea: string): Plan {
  const app = /\bapps?\b|android|ios|mobile/i.test(idea)
  const website = /web|\bsite\b|store|shop|landing|online/i.test(idea)
  const need: Need = app && !website ? 'app' : website && !app ? 'website' : 'both'
  const topic = TOPICS.find((t) => t.match.test(idea)) ?? GENERAL
  return { need, type: TYPE[need], screens: topic.screens, questions: topic.questions }
}

/** The plan as plain text, for the message the visitor sends. */
export const planAsText = (idea: string, plan: Plan) =>
  `I want to build ${idea}.\n\nFirst plan from the planner:\n- ${plan.type}\n- Screens: ${plan.screens.join(', ')}`

const endpoint = import.meta.env.VITE_PLANNER_URL as string | undefined

/** True when a live AI model is connected (see README: VITE_PLANNER_URL). */
export const plannerIsLive = () => Boolean(endpoint)

/**
 * Asks for a plan. With VITE_PLANNER_URL set, the idea is sent to that address, which should answer
 * with a Plan as JSON (this is where a live AI model plugs in). Otherwise, or if that fails, the
 * built-in rules answer.
 */
export async function makePlan(idea: string): Promise<Plan> {
  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      })
      if (res.ok) return (await res.json()) as Plan
    } catch {
      // fall through to the built-in rules
    }
  }
  return draftPlan(idea)
}
