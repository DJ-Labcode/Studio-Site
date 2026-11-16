import type { Founder } from '@/shared/brand'

/** About-us copy, taken from each founder's own profile. */
export const team: Record<Founder['id'], { story: string; facts: string[] }> = {
  vanashri: {
    story:
      'Vanashri builds for the web. She is a full-stack web developer at Golden Sparrow Point, studying for a BSc (Honours) in Information Technology at K.P.B Hinduja College of Commerce. She makes responsive, easy-to-use websites with HTML, CSS and JavaScript, and uses Firebase for login and data.',
    facts: [
      'Mumbai',
      'Next.js · Tailwind CSS',
      'HTML · CSS · JavaScript',
      'Firebase Auth & Firestore',
    ],
  },
  dhruv: {
    story:
      'Dhruv builds apps. He came to software from Chemical Engineering at TSEC, Mumbai, and shipped HSC-iT, a cross-platform exam-prep app, as a full-stack Flutter developer at Golden Sparrow. He is now building RagLabs, an AI operations platform for Indian manufacturers.',
    facts: ['Mumbai', 'Flutter · Dart', 'FastAPI · Firebase', 'RAG & LLM pipelines'],
  },
}
