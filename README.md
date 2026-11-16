# DuoForge studio site

Three complete versions of the site live side by side, one per folder. Each folder is a full project: you can run it, edit it and deploy it without touching the other two.

| Folder | What it is |
|---|---|
| `software_studio/` | The laptop design. A laptop boots, you scroll into its screen, and every section is a software window: a browser of websites, a phone simulator of apps, a planner, a terminal, a README and a message window. |
| `railway_studio/` | The railway design. Two train lines run down the page, projects are coaches, and contact is a ticket. |
| `blender_studio/` | The Blender design. A pre-rendered desk scene that glides into a laptop and back out as you scroll. Its Blender pipeline is in `blender_studio/tools/blender`. |

## Run one

Install once, from this folder:

```bash
npm install
```

Then start whichever version you want to see:

```bash
npm run dev:software
```

```bash
npm run dev:railway
```

```bash
npm run dev:blender
```

Each opens at the address Vite prints (usually http://localhost:5173).

## Edit one

Open that folder and work inside it. Nothing is shared between the folders, so a change in one never affects another. Inside each folder:

- `src/content/` holds the words and the project list. Add a project in `src/content/projects.ts` and it appears everywhere that version lists projects.
- `src/shared/brand/` holds the company name, the founders and their links.
- `src/shared/styles/index.css` holds the colours and fonts.
- `src/features/` holds one folder per part of the page.

## Check everything

These run in all three folders:

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm test
```

```bash
npm run build
```

To run a command in one folder only, add `-w <folder>`, for example `npm run build -w software_studio`.

## Settings

Copy `.env.example` to `.env` inside the folder you are running and fill in what you need:

- **EmailJS keys** so the contact form sends email. Without them it opens the visitor's mail app.
- **`VITE_WHATSAPP_NUMBER`** (software_studio) for the WhatsApp button.
- **`VITE_PLANNER_URL`** (software_studio) to connect the planner to a live AI model. Without it the planner uses built-in rules and costs nothing.
