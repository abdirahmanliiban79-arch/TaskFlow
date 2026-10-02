# TaskFlow 5d

TaskFlow 5d is a weekly task planner built with Next.js. It organizes tasks across a five-day work week (Monday–Friday) in a Kanban-style board, with email/password authentication and a floating AI assistant.

## Features

- **Email/password authentication (Better Auth)** with Prisma/MongoDB persistence and session-protected UI. Signed-out visitors see a landing prompt; signed-in users see their board. Sign-up uses `autoSignIn: false`, so new users are redirected to sign in.
- **5-day Kanban board (Mon–Fri)** with native HTML5 drag & drop between day columns. Day changes are applied optimistically and rolled back if the server action returns an error.
- **Task CRUD via Next.js Server Actions**, all scoped to the authenticated user:
  - Create through a modal (title, description, priority, day)
  - Delete a task
  - Toggle status between `PENDING` and `COMPLETED`
  - Move a task to another day
- **Gemini-powered floating AI assistant**: a chat drawer that posts to `/api/chat`, which calls `@google/genai` with the `gemini-3.6-flash` model.
- **Dark UI** built with Tailwind CSS v4 and `lucide-react` icons.

## Tech stack

- **Next.js 16.3.1** (App Router, Turbopack, React Server Components, Server Actions)
- **React 19.2.8** and **TypeScript 5**
- **Tailwind CSS v4** (via `@tailwindcss/postcss`), global styles in `src/app/globals.css`
- **Prisma ORM 6.19.3** with **MongoDB** (`Task`, `User`, `Session`, `Account`, `Verification` models)
- **Better Auth 1.7.1** with the Prisma adapter and email/password provider
- **@google/genai 2.18.0** for the Gemini chat endpoint
- **lucide-react** icons, **clsx** + **tailwind-merge** (`cn` helper in `src/lib/utils.ts`)
- `framer-motion` is declared in `package.json` but is not currently imported anywhere in `src/`

## Data model

Defined in `prisma/schema.prisma` (MongoDB, `ObjectId` primary keys):

- `Task`: `userId`, `title`, `description?`, `status` (`PENDING` by default), `priority` (`MEDIUM` by default), `dayOfWeek` (`mon` by default), timestamps, relation to `User`
- `User`: `name`, unique `email`, `emailVerified`, `image?`, timestamps, relations to sessions/accounts/tasks
- `Session`, `Account`, `Verification`: standard Better Auth tables

Task priority values used by the UI: `LOW`, `MEDIUM`, `HIGH`, `URGENT`. Days: `mon`, `tue`, `wed`, `thu`, `fri`.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/app/page.tsx` | Home page: reads the session, loads tasks, renders board / auth prompt |
| `src/app/layout.tsx` | Root layout, Geist fonts, global CSS |
| `src/app/sign-in/page.tsx`, `src/app/sign-up/page.tsx` | Dedicated auth pages |
| `src/app/actions/tasks.ts` | Server Actions: `getTasks`, `createTask`, `updateTaskDay`, `updateTaskStatus`, `deleteTask` (user-scoped) |
| `src/app/api/auth/[...all]/route.ts` | Better Auth Next.js route handler |
| `src/app/api/chat/route.ts` | Gemini chat endpoint (`gemini-3.6-flash`) |
| `src/components/KanbanBoard.tsx` | 5-day drag & drop board with optimistic updates |
| `src/components/taskCard.tsx` | Task card: priority badge, status toggle, delete, drag handle |
| `src/components/addTaskModal.tsx` | Create-task modal wired to `createTask` |
| `src/components/AIAssistant.tsx` | Floating Gemini chat drawer |
| `src/components/AuthModal.tsx`, `src/components/HeaderAuth.tsx` | Auth modal and header sign-in/out controls |
| `src/lib/auth.ts` | Better Auth server config (Prisma adapter, `baseURL`, `trustedOrigins`) |
| `src/lib/auth-client.ts` | `createAuthClient()` — resolves the API relative to the current origin |
| `src/lib/prisma.ts` | PrismaClient singleton |
| `src/lib/utils.ts` | `cn()` class-name helper |
| `prisma/schema.prisma` | MongoDB schema |

## Environment variables

Names only; values live in the git-ignored `.env.local` (with some defaults in `.env`):

- `DATABASE_URL` — MongoDB connection string
- `BETTER_AUTH_SECRET` — secret used to sign sessions
- `BETTER_AUTH_URL` — canonical app URL (e.g. `http://localhost:3000`)
- `GEMINI_API_KEY` — Google Gemini API key

`GEMINI_API_KEY` is required by `/api/chat`; without it the route returns `500 API key missing`.

### Trusted origins

Better Auth validates the `Origin` header for non-GET auth requests. `src/lib/auth.ts` sets `baseURL` from `BETTER_AUTH_URL` and, outside production, additionally trusts the local dev origins `http://localhost:3000`, `http://localhost:3001`, and `http://localhost:*` (any localhost port). This keeps dev working when Next.js falls back to another port (for example when port 3000 is already in use). In production, set `BETTER_AUTH_URL` to the deployed origin; trusted origins are limited to that URL (plus `BETTER_AUTH_TRUSTED_ORIGINS` if provided).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build and serve
- `npm run lint` — ESLint
- `npm run db:push` — `dotenv -e .env.local -- prisma db push`
