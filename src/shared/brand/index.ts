/**
 * Everything that names or colours the company lives here.
 * If the company name changes, this is the only file to edit (plus index.html's <title>).
 */
export const brand = {
  name: 'DuoForge',
  /** split used by the two-tone wordmark */
  nameParts: ['Duo', 'Forge'] as const,
  tagline: 'We forge apps & websites people love.',
  description: 'A two-developer studio that designs, builds and ships websites and mobile apps.',
  email: 'hello@example.com', // TODO: real address
  founders: [
    {
      id: 'vanashri',
      name: 'Vanashri',
      initial: 'V',
      world: 'web',
      role: 'Co-founder · Web developer',
    },
    {
      id: 'dhruv',
      name: 'Dhruv Jain',
      initial: 'D',
      world: 'app',
      role: 'Co-founder · App & backend developer',
    },
  ],
} as const

export type World = (typeof brand.founders)[number]['world']
