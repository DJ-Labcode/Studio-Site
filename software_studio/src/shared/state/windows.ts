import { create } from 'zustand'
import type { World } from '@/shared/brand'

type Windows = {
  /** slug of the project whose window is open on top, if any */
  project: string | null
  /** the All work window: closed, or open with a filter */
  allWork: World | 'all' | null
  openProject: (slug: string) => void
  openAllWork: (filter?: World | 'all') => void
  /** closes the top window only: a project first, then All work */
  closeTop: () => void
  closeAll: () => void
}

/** Which windows are open on top of the desktop. Any feature can open one. */
export const useWindows = create<Windows>((set) => ({
  project: null,
  allWork: null,
  openProject: (project) => set({ project }),
  openAllWork: (allWork = 'all') => set({ allWork }),
  closeTop: () => set((s) => (s.project ? { project: null } : { allWork: null })),
  closeAll: () => set({ project: null, allWork: null }),
}))
