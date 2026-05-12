# Monorepo — CLAUDE.md

Project rules, architecture, and conventions for Claude Code sessions.

---

## Repository Structure

```
/
├── apps/
│   ├── api/          Express.js REST API (clean architecture)
│   └── web/          Next.js 15 frontend
├── packages/
│   ├── shared/       Zod schemas + inferred TypeScript types
│   ├── database/     Prisma v7 client + schema + migrations
│   ├── ui/           Shared shadcn/ui component library
│   └── typescript-config/  Base tsconfig files
├── scripts/
│   ├── setup.sh      Start dev environment
│   ├── teardown.sh   Stop dev environment
│   └── reset-db.sh   Wipe and re-seed database
├── docker-compose.yml       Production Docker Compose
├── docker-compose.dev.yml   Dev Docker Compose (PostgreSQL only)
└── .env.example
```

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Monorepo   | Turborepo + pnpm workspaces             |
| Database   | PostgreSQL 17 (Docker)                  |
| ORM        | Prisma **v7**                           |
| Backend    | Express.js 4, TypeScript (ESM)          |
| Frontend   | Next.js 15, React 19, TypeScript        |
| UI Library | shadcn/ui + Radix UI + TailwindCSS 3    |
| Data fetch | TanStack Query v5                       |
| Validation | Zod v3 (shared across API + web)        |
| Auth       | JWT (jsonwebtoken + bcryptjs)           |

---

## Shared Packages — Rules

### `@repo/shared`
- **Single source of truth** for all Zod schemas and TypeScript types.
- Add a Zod schema first; derive the TypeScript type with `z.infer<>`.
- Both `apps/api` and `apps/web` must import types from here — never duplicate types locally.
- No runtime dependencies beyond `zod`.

### `@repo/database`
- Prisma **v7** only. Do not downgrade.
- Schema lives at `packages/database/prisma/schema.prisma`.
- After any schema change: `pnpm db:generate` then `pnpm db:migrate`.
- Export the singleton Prisma client from `packages/database/src/index.ts`.
- Never instantiate `PrismaClient` directly in `apps/api`; always import from `@repo/database`.

### `@repo/ui`
- Built on shadcn/ui primitives with Radix UI.
- Add new components here (not in `apps/web/src/components`) when they will be reused.
- Local, one-off components belong in `apps/web/src/components`.
- Import CSS variables from `@repo/ui/globals.css` — do not duplicate the CSS variable definitions.

---

## Backend (apps/api) — Clean Architecture

Four strict layers; dependencies point inward only:

```
Presentation  →  Application  →  Domain  ←  Infrastructure
```

### Layer responsibilities

| Layer          | Location                              | Contains                                                  |
|----------------|---------------------------------------|-----------------------------------------------------------|
| Domain         | `src/domain/`                         | Entities (interfaces), Repository interfaces              |
| Application    | `src/application/use-cases/`          | Use cases (business logic), DTOs                          |
| Infrastructure | `src/infrastructure/`                 | Prisma repository impls, AuthService, external services   |
| Presentation   | `src/presentation/`                   | Express routes, controllers, middleware                   |

### Rules
- Domain entities have **no Prisma imports**. Use plain TypeScript interfaces.
- Repository interfaces live in `domain/repositories/`. Prisma implementations live in `infrastructure/repositories/`.
- Use cases coordinate the flow; they do not import Express types.
- Controllers are thin: parse the request, call a use case, send the response.
- All user-facing errors go through `AppError` subclasses (`NotFoundError`, `UnauthorizedError`, etc.).
- Validate request bodies/params/query with the `validate()` middleware using `@repo/shared` Zod schemas.
- Never throw raw errors in controllers — use `next(err)`.

### REST conventions
- `GET    /api/resource`       — paginated list
- `GET    /api/resource/:id`   — single item
- `POST   /api/resource`       — create (201)
- `PATCH  /api/resource/:id`   — partial update
- `DELETE /api/resource/:id`   — delete (204)
- Pagination query: `?page=1&limit=20&sortBy=createdAt&sortOrder=desc`
- Response envelope: `{ data: T }` or `{ data: T[], meta: PaginationMeta }`
- Error envelope: `{ message: string, code?: string, errors?: Record<string, string[]> }`

---

## Frontend (apps/web) — Next.js 15

### Routing strategy

| Route group      | Rendering | Auth required |
|------------------|-----------|---------------|
| `(public)/`      | **SSR**   | No            |
| `(dashboard)/`   | **CSR**   | Yes (redirect to /login if unauthenticated) |

- Public pages use async server components to fetch data server-side.
- Dashboard pages use `'use client'` + TanStack Query hooks.
- Auth check in `(dashboard)/layout.tsx`: if `useMe()` returns an error, redirect to `/login`.

### TanStack Query

- All query keys are defined in `src/lib/query-keys.ts` — never use inline string arrays.
- Custom hooks live in `src/hooks/` (`use-posts.ts`, `use-auth.ts`, etc.).
- After mutations that modify a list, `invalidateQueries` the parent key (`queryKeys.posts.all()`).
- Set `retry: false` for 401 errors so the user is redirected promptly.
- Use `useInfiniteQuery` for infinite scroll; use standard `useQuery` + `page` state for paginated tables.

### API Client

- `src/lib/api-client.ts` — thin fetch wrapper with `ApiError` for typed error handling.
- Auth token is stored in `localStorage` under `auth_token`.
- The client attaches the `Authorization` header automatically.
- On the server (SSR pages) the client has no token; only fetch public endpoints server-side.

### UI Components

- Import from `@repo/ui` first. Only create a local component in `apps/web/src/components/` if it is truly app-specific.
- Use `cn()` from `@repo/ui` for conditional class merging.
- All forms use shadcn/ui `Input`, `Label`, `Button`, `Select` — do not use raw HTML form elements styled from scratch.

---

## Docker

### Development
Only PostgreSQL runs in Docker during local development:
```bash
pnpm setup          # first-time: starts postgres, installs deps, migrates, seeds
pnpm dev            # starts Next.js + Express with hot reload (runs on host)
pnpm teardown       # stops postgres container (keeps volume)
pnpm teardown -- --destroy   # stops + destroys volume (wipes data)
```

### Production
Full stack in Docker:
```bash
docker compose up --build
```
Services: `postgres`, `api`, `web`.

### Rules
- Never commit `.env`. Copy from `.env.example` and fill in secrets.
- `DATABASE_URL` in Docker uses the service hostname `postgres` as host; locally use `localhost`.
- Dockerfiles use multi-stage builds. `production` stage only has the compiled output.

---

## Environment Variables

| Variable               | Used by        | Description                            |
|------------------------|----------------|----------------------------------------|
| `DATABASE_URL`         | api, database  | Prisma connection string               |
| `POSTGRES_*`           | docker-compose | PostgreSQL container config            |
| `JWT_SECRET`           | api            | Must be a long random string in prod   |
| `JWT_EXPIRES_IN`       | api            | Token lifetime (default `7d`)          |
| `CORS_ORIGIN`          | api            | Allowed frontend origin                |
| `API_PORT`             | api            | Port the Express server listens on     |
| `NEXT_PUBLIC_API_URL`  | web            | API base URL accessible from browser   |

---

## Development Workflow

```bash
# First time
pnpm setup

# Daily
pnpm dev                # run all apps concurrently via Turborepo

# After changing Prisma schema
pnpm db:generate        # regenerate client
pnpm db:migrate         # create + apply migration

# After adding/changing Zod schemas in packages/shared
pnpm --filter @repo/shared build   # rebuild before web/api can pick up changes

# Type check everything
pnpm typecheck

# Format
pnpm format
```

---

## Code Style

- TypeScript strict mode across all packages.
- `exactOptionalPropertyTypes: true` in backend tsconfig; relaxed in Next.js tsconfig.
- No `any` — use `unknown` and narrow.
- ESM throughout (`"type": "module"`). Use `.js` extensions in imports for Node ESM resolution.
- No barrel re-exports inside `apps/` — import directly from the source file.
- Comments only when the **why** is non-obvious. No JSDoc on obvious functions.
- Prefer `const` functions in controllers/services to allow `this` binding in class methods.

---

## Security

- Passwords hashed with bcrypt (cost 12).
- JWT verified on every authenticated request via `authenticate` middleware.
- Rate limiting: 100 requests per 15 minutes (express-rate-limit).
- CORS restricted to `CORS_ORIGIN` env var.
- Helmet sets secure HTTP headers.
- Request body size capped at 10 KB.
- Never log passwords, tokens, or secrets.
