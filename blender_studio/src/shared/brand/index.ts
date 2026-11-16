/**
 * Everything that names the company and its people lives here.
 * If the company name changes, this is the only file to edit (plus index.html's <title>).
 */
export const brand = {
  name: 'DuoForge',
  /** split used by the two-tone wordmark */
  nameParts: ['Duo', 'Forge'] as const,
  tagline: 'We forge apps & websites people love.',
  description:
    'A two-developer studio in Mumbai that designs, builds and ships websites and mobile apps.',
  location: 'Mumbai, India',
  founders: [
    {
      id: 'vanashri',
      name: 'Vanashri Raut',
      initial: 'V',
      world: 'web',
      role: 'Co-founder · Full-stack web developer',
      email: 'vanashriraut111@gmail.com',
      linkedin: 'https://www.linkedin.com/in/vanashri-raut-31aab5400/',
    },
    {
      id: 'dhruv',
      name: 'Dhruv Jain',
      initial: 'D',
      world: 'app',
      role: 'Co-founder · Flutter & backend developer',
      email: 'Dhruvjain3214@gmail.com',
      linkedin: 'https://www.linkedin.com/in/dhruvjain1815/',
    },
  ],
} as const

export type Founder = (typeof brand.founders)[number]
export type World = Founder['world']
