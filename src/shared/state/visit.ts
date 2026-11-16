import { create } from 'zustand'

export type Need = 'website' | 'app' | 'both'

type Visit = {
  /** what the visitor said they want to build; chosen on the home screen, reused on the contact ticket */
  need: Need
  /** true once the visitor has picked an answer themselves */
  chosen: boolean
  choose: (need: Need) => void
  /** the project description: started on the home screen ("I want to build ..."), finished on the ticket */
  brief: string
  setBrief: (brief: string) => void
  /** true once the opening splash has finished (or was skipped) */
  introDone: boolean
  finishIntro: () => void
}

/** Small facts about this visit that more than one feature needs. */
export const useVisit = create<Visit>((set) => ({
  need: 'both',
  chosen: false,
  choose: (need) => set({ need, chosen: true }),
  brief: '',
  setBrief: (brief) => set({ brief }),
  introDone: false,
  finishIntro: () => set({ introDone: true }),
}))
