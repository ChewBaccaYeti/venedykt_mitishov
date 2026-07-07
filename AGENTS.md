<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Project overview

Personal portfolio site for Venedykt Mitishov.

### Stack

- **Next.js 16** (App Router) — see warning above; read `node_modules/next/dist/docs/` before using Next APIs.
- **React 19** + **TypeScript 5**.
- **Tailwind CSS v4** (`@tailwindcss/postcss`) — config-less, theme in `app/globals.css` via `@theme inline`. Uses v4 arbitrary syntax (e.g. `opacity-(--var)`, `mask-*`, `bg-(--var)`).
- **shadcn/ui** + **radix-ui**, **tw-animate-css**.
- Graphics/anim: **three**, **ogl**, **postprocessing**, **animejs**, **face-api.js**.
- Icons: **lucide-react**, **react-icons**.

### Structure

- `app/` — App Router. `page.tsx` (home), `layout.tsx`, `globals.css`, `fonts/`, `data/` (JSON + images), `anim/` (animation components).
- `components/` — reusable UI: `ReflectiveCard`, `GridBg` (`gridBg.tsx`), `PixelGlass`, `LogoLoop`, `TopLanguages`, `GlareHover`.
- `@/` path alias maps to project root.

### Commands

- `npm run dev` — dev server.
- `npm run build` / `npm run start` — prod build + serve.
- `npm run lint` / `lint:fix` — ESLint (`eslint-config-next`).
- `npm run format` / `format:check` — Prettier (+ `prettier-plugin-tailwindcss`).
