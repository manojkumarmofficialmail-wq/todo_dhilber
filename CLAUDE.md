# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev`: start the Vite dev server (http://localhost:5173)
- `npm test`: run all tests once (Vitest + React Testing Library, jsdom)
- `npm run test:watch`: run tests in watch mode
- `npx vitest run -t "edits a task"`: run a single test by name
- `npm run build`: type-check with `tsc` (no emit), then build to `dist/`
- `npm run preview`: serve the production build (at `/todo_dhiber/`; the only way to test the service worker locally)
- `node scripts/generate-icons.mjs`: regenerate the PNG app icons in `public/icons/`

There is no linter configured. Type errors are only caught by `tsc` during `npm run build`. `tsconfig.json` is strict and sets `noUnusedLocals`/`noUnusedParameters`.

## Architecture

A client-only React 18 + TypeScript to-do app. There is no backend. Tasks persist in the browser's `localStorage`.

- **All task state and mutations live in `src/hooks/useTodos.ts`.** It loads from `localStorage` (key `todos`, exported as `STORAGE_KEY`) on first render. A `useEffect` writes the whole list back after every change. Both reads and writes are wrapped in try/catch, so corrupt or blocked storage falls back to an empty list instead of crashing. Text is trimmed there: blank adds are ignored, and saving an edit as empty text deletes the task.
- **`src/App.tsx` owns the filter state** (`all | today | active | completed`) and derives the visible list and counts. Components in `src/components/` are presentational and receive callbacks as props. The `FilterBar` footer only renders when at least one task exists.
- **Due dates** are optional local `YYYY-MM-DD` strings (never `toISOString()`, which is UTC), so string comparison orders them. `src/utils/date.ts` holds the helpers. The "Today" view (`inTodayView`) is tasks due today plus incomplete overdue ones.
- **`DueDatePicker`** lays an invisible native `<input type="date">` over custom content: tapping opens the system picker on phones, and `showPicker()` handles desktop clicks.
- **Backups (`src/utils/backup.ts`)**: `parseTodos` validates both the backup file format (`{ todos: [...] }`) and the bare-array localStorage format, and drops invalid entries. Import merges by `id`, so it never overwrites or duplicates. Files are read with `FileReader` because jsdom lacks `Blob.text()`.
- **Installable/offline app**: `public/manifest.webmanifest` plus a hand-written `public/sw.js`, registered in `main.tsx` in production builds only. Pages are network-first and hashed assets are cache-first. Bump `CACHE` in `sw.js` when changing its caching rules. All manifest/SW paths are relative so they work under the `/todo_dhiber/` base.
- **Inline editing (`TodoItem.tsx`)** uses a `finished` ref so the blur event that fires as the edit input unmounts doesn't save a second time, or save after Escape cancels.
- Shared types (`Todo`, `Filter`) are in `src/types.ts`. Styles are a single `src/App.css` using CSS variables, with a `prefers-color-scheme: dark` override.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs tests, builds, and publishes `dist/` to GitHub Pages. `base: '/todo_dhiber/'` in `vite.config.ts` must match the GitHub repo name, or the deployed page loads blank.

## Tests

The tests in `src/App.test.tsx` render the full `<App />` and drive it via `userEvent`, querying by accessible labels (e.g. `"New task"`, `"Edit task"`, `Delete "<text>"`, `Mark "<text>" as done`). Changing those `aria-label`s will break tests. `src/setupTests.ts` clears `localStorage` and unmounts after each test.
