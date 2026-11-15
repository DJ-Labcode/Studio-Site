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
    hero/       opening statement
    services/   what we do: web and apps
    team/       about us
    projects/   work showcase and project footage
    contact/    brief form, EmailJS
    journey/    the Blender version: splash and scroll-scrubbed footage
    builder/    app estimator (pricing logic, UI to come)
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

## Switching the home page

Two versions of the home page live in the repo. Pick one with a single line in `src/content/site.ts`:

```ts
homeVariant: 'story' // or 'blender'
```

The Blender version is also always reachable at `/journey`.

## Status

Both home versions run. To do: add real project screenshots (put images in `public/work/<slug>/`
and list them in `shots` in `src/content/projects.ts`), and add EmailJS keys so the contact form sends.
