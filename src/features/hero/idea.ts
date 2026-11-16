import type { Need } from '@/shared/state/visit'

/** The sentence the home screen starts and the ticket continues. */
export const briefFromIdea = (idea: string) => `I want to build ${idea.trim()}`

/** What the visitor seems to need, read from their own words; null when it does not say. */
export function needFromIdea(idea: string): Need | null {
  const app = /\bapps?\b/i.test(idea)
  const website = /web|\bsite\b|store|shop|landing/i.test(idea)
  if (app && website) return 'both'
  if (app) return 'app'
  if (website) return 'website'
  return null
}
