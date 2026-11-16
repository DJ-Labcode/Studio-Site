import { create } from 'zustand'

export type Need = 'website' | 'app' | 'both'

type Visit = {
  /** true once the laptop has finished starting up (or the start-up was skipped) */
  introDone: boolean
  finishIntro: () => void
  /** true once the visitor has scrolled into the laptop's screen */
  inside: boolean
  setInside: (inside: boolean) => void
  /** an idea typed in the command bar, waiting for the planner to pick it up */
  idea: string
  askPlanner: (idea: string) => void
  /** what the visitor needs and their message so far; filled by the planner or a project, finished in the message window */
  need: Need
  brief: string
  setNeed: (need: Need) => void
  setBrief: (brief: string) => void
}

/** Small facts about this visit that more than one feature needs. */
export const useVisit = create<Visit>((set) => ({
  introDone: false,
  finishIntro: () => set({ introDone: true }),
  inside: false,
  setInside: (inside) => set({ inside }),
  idea: '',
  askPlanner: (idea) => set({ idea }),
  need: 'both',
  brief: '',
  setNeed: (need) => set({ need }),
  setBrief: (brief) => set({ brief }),
}))
