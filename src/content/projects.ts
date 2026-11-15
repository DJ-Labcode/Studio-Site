import type { World } from '@/shared/brand'

export type Project = {
  slug: string
  name: string
  world: World
  kind: string
  summary: string
  /** two or three concrete points, straight from the builder's profile or resume */
  highlights: string[]
  stack: string[]
  /** accent colour for this project */
  hue: string
  device: 'phone' | 'browser'
  /** real screenshots in /public/work/<slug>/, shown inside the device frame; empty until they are added */
  shots: string[]
  link?: { label: string; href: string }
  status?: string
}

/**
 * Only projects named in the founders' own profiles appear here.
 * To add screenshots: put the images in public/work/<slug>/ and list their paths in `shots`.
 * Adding one is all it takes to list it and give it a /work/:slug page.
 */
export const projects: Project[] = [
  {
    slug: 'mind-of-finance',
    name: 'Mind of Finance',
    world: 'web',
    kind: 'Education · Website',
    summary: 'Website for an ACCA-focused finance education brand.',
    highlights: ['Responsive website built with HTML, CSS and JavaScript'],
    stack: ['HTML', 'CSS', 'JavaScript'],
    hue: '#1F9D6B',
    device: 'browser',
    shots: [],
  },
  {
    slug: 'opticalearn',
    name: 'Opticalearn',
    world: 'web',
    kind: 'Education · Website',
    summary: 'Website for Amar Institute of Optical Management, an optometry institute.',
    highlights: [
      'Admission form for prospective students',
      'Responsive website built with HTML, CSS and JavaScript',
    ],
    stack: ['HTML', 'CSS', 'JavaScript'],
    hue: '#14B8A6',
    device: 'browser',
    shots: [],
  },
  {
    slug: 'hsc-it',
    name: 'HSC-iT',
    world: 'app',
    kind: 'EdTech · Android & iOS',
    summary: 'Exam-prep app for 12th-standard students: theory, MCQs, quizzes and practicals.',
    highlights: [
      '100+ active learners',
      'Weak-chapter analytics and PDF reports',
      'Google and phone-OTP login, push notifications, in-app subscriptions',
    ],
    stack: ['Flutter', 'Provider', 'Firebase', 'In-app purchases'],
    hue: '#3D7BFF',
    device: 'phone',
    shots: [],
    link: {
      label: 'Google Play',
      href: 'https://play.google.com/store/apps/details?id=in.hscit.hscittesting',
    },
    status: 'Live on Google Play',
  },
  {
    slug: 'raglabs',
    name: 'RagLabs',
    world: 'app',
    kind: 'Manufacturing · Android, iOS & Web',
    summary:
      'AI operations platform for Indian manufacturers: orders, GST invoices, inventory, production and maintenance in one app.',
    highlights: [
      'Ask AI answers shop-floor questions from the company’s own documents, with sources',
      'Voice input and read-aloud in English, Hindi and Gujarati',
      '29 REST endpoints, per-tenant data isolation, 170+ automated tests',
    ],
    stack: ['Flutter', 'BLoC', 'FastAPI', 'PostgreSQL + pgvector', 'LangGraph', 'Docker'],
    hue: '#2FBF71',
    device: 'phone',
    shots: [],
    status: 'In progress',
  },
  {
    slug: 'video-streaming',
    name: 'Video streaming platform',
    world: 'app',
    kind: 'Media · Flutter app + backend',
    summary: 'A YouTube-style streaming app with a Flutter client and a FastAPI backend.',
    highlights: [
      'FFmpeg transcoding and HLS segmented streaming on AWS S3',
      '10+ REST endpoints with sub-200 ms average query response',
      'Docker and Redis caching: 60% faster retrieval under simulated load',
    ],
    stack: ['Flutter', 'FastAPI', 'AWS S3', 'Redis', 'Docker', 'PostgreSQL'],
    hue: '#FF4D6D',
    device: 'phone',
    shots: [],
  },
]

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug)
export const projectsIn = (world: World) => projects.filter((p) => p.world === world)
