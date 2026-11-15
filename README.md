# Studio site

Marketing site for a two-developer studio (working name: **DuoForge**): a scroll-driven story that
moves from a sunny desk into a laptop, splits into a Web world and an App world, and comes back out.

**Stack:** React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · React Router · Three.js (React Three Fiber)
· Motion · Lenis · EmailJS · Vitest · Playwright.

## Commands

```bash
npm install
npm run dev          # start the dev server
npm run build        # type-check and build to dist/
npm test             # unit tests (Vitest)
npm run lint         # ESLint, including the architecture rules
npm run format       # Prettier
npm run e2e          # browser tests (needs: npx playwright install chromium)
```

Copy `.env.example` to `.env` and fill in the EmailJS keys to make the contact form send.

## Architecture

```
src/
  app/        entry point, router, root layout
  pages/      one file per route; pages compose features
  features/   one folder per part of the site, each with an index.ts as its public surface
    journey/    splash, hero, scroll sequences
    worlds/     split screen, Web world, App world
    projects/   case studies and working demos
    builder/    app estimator (pure pricing logic + UI)
    process/    "How we work"
    team/       the two founders
    contact/    brief form, EmailJS
  three/      WebGL scenes, always imported lazily
  content/    data only: projects, pricing
  shared/     brand, ui, hooks, lib, styles (design tokens)
tools/blender/  how the scroll footage is rendered
e2e/            Playwright tests
```

### Rules (enforced by `npm run lint`)

| Layer        | May import                                                               |
| ------------ | ------------------------------------------------------------------------ |
| `shared`     | `shared`                                                                 |
| `content`    | `content`, `shared`                                                      |
| `three`      | `three`, `content`, `shared`                                             |
| `features/x` | its own folder, `three`, `content`, `shared`. **Never another feature.** |
| `pages`      | features and everything below                                            |
| `app`        | everything                                                               |

- **Logic is separate from UI.** Anything that can be a plain function (pricing, scroll maths) is one, with a test beside it.
- **Content is data.** Add a project in `src/content/projects.ts`; no component changes needed.
- **Brand in one place.** Name, founders and tagline live in `src/shared/brand`; colours and fonts in `src/shared/styles/index.css`.
- **Heavy code is lazy.** Pages are lazy routes; anything using three.js is behind a dynamic import.

## Status

Foundation only: tooling, structure, brand, tokens, routing, pricing logic and tests.
Features are being moved in from the prototype one at a time.
