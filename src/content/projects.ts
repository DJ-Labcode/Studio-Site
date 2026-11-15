import type { World } from '@/shared/brand'

export type Project = {
  slug: string
  name: string
  world: World
  kind: string
  summary: string
  result: string
  stack: string[]
  /** accent colour for this project */
  hue: string
  /** true = sample entry to be replaced with the real project */
  placeholder?: boolean
}

/** Projects are data. Adding one here is all it takes to list it and give it a /work/:slug page. */
export const projects: Project[] = [
  {
    slug: 'hsc-it',
    name: 'HSC-iT',
    world: 'app',
    kind: 'EdTech · Android & iOS',
    summary:
      'Exam-prep app for 12th-standard students with theory, MCQs, quizzes and analytics that find each student’s weak chapters.',
    result: '100+ active learners, paid plans via Razorpay',
    stack: ['Flutter', 'Firebase', 'Razorpay'],
    hue: '#3D7BFF',
  },
]

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug)
export const projectsIn = (world: World) => projects.filter((p) => p.world === world)
