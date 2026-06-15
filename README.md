# Smartcomply · Transaction Monitoring Dashboard

A responsive transaction monitoring console for compliance analysts. Built as the technical assessment for the Smartcomply Frontend Engineer role.

The app simulates a live AML / fraud monitoring workspace: KPI metrics, weekly volume, risk distribution, and a searchable, filterable transactions table with a detail drawer that breaks down customer, risk, history, and activity timeline.

It also ships a full **alert / case-management workflow** — a triage queue of compliance cases derived from flagged and high-risk transactions, each with status workflow, assignment, investigator notes, an audit trail, and SAR (Suspicious Activity Report) escalation. An **AI assistant (Claude, via the Vercel AI Gateway)** drafts the risk assessment and the SAR narrative, streaming token-by-token, with the analyst keeping the final decision.

---

## Demo credentials

```
Email:    analyst@smartcomply.com
Password: Compliance123!
```

(The login form is pre-filled with these for convenience.)

---

## Stack

| Concern              | Choice                                                   |
| -------------------- | -------------------------------------------------------- |
| Framework            | **Next.js 16** (App Router) on **React 19**              |
| Language             | **TypeScript** (strict)                                  |
| Styling              | **Tailwind CSS v4** with HSL design tokens               |
| Server state         | **TanStack Query v5** (polling, caching, devtools)       |
| AI                   | **Vercel AI SDK** (`ai`) + **AI Gateway** → **Claude**, streamed |
| Client / auth state  | **Zustand** with `persist` middleware (localStorage)     |
| Forms & validation   | **react-hook-form** + **Zod** (`@hookform/resolvers`)    |
| Charts               | **Recharts** (Area chart with gradients)                 |
| Animations           | **Framer Motion** (page, list, layout-id, SVG meter)     |
| Theme                | **next-themes** (light / dark / system, no flash)        |
| Icons                | **lucide-react**                                         |
| Testing              | **Vitest** + **React Testing Library** + **jsdom**       |
| Containerization     | Multi-stage **Dockerfile** with Next standalone output   |

---

## Getting started

```bash
# 1. Install
npm install

# 2. (Optional) enable the AI features — copy the example env and add a key
cp .env.example .env.local   # then set AI_GATEWAY_API_KEY

# 3. Dev server (http://localhost:3000)
npm run dev

# 4. Production build + serve
npm run build && npm start

# 5. Run the test suite (one-shot)
npm test

# 6. Tests in watch mode
npm run test:watch

# 7. Typecheck
npm run typecheck

# 8. Lint
npm run lint
```

### Docker

```bash
docker build -t smartcomply-assessment .
docker run -p 3000:3000 smartcomply-assessment
```

The image uses Next's `output: "standalone"` so the runner stage ships only the minimal server bundle (no `npm install` at runtime). It runs as an unprivileged user.

---

## Folder structure

```
src/
├── app/
│   ├── (auth)/login/page.tsx           # Public login route
│   ├── dashboard/
│   │   ├── layout.tsx                  # Protected shell (auth guard + sidebar/topbar)
│   │   ├── page.tsx                    # KPI overview + charts
│   │   └── transactions/page.tsx       # Table + filters + drawer
│   ├── api/
│   │   ├── auth/login/route.ts         # Mock authentication endpoint
│   │   ├── stats/route.ts              # Dashboard stats endpoint
│   │   └── transactions/
│   │       ├── route.ts                # List, search, filter, paginate
│   │       └── [id]/route.ts           # Single transaction
│   ├── layout.tsx                      # Theme + Query providers
│   ├── page.tsx                        # Root redirector (auth-aware)
│   └── globals.css                     # Design tokens (light + dark)
│
├── components/
│   ├── ui/                             # Primitives: Button, Input, Card, Badge,
│   │                                   # Avatar, Drawer, Skeleton, Select, EmptyState
│   ├── layout/                         # Sidebar, Topbar, ThemeToggle, AppShell
│   ├── dashboard/                      # KpiCard, VolumeChart, RiskDistribution, LiveIndicator
│   ├── transactions/                   # Table, Filters, Pagination, Drawer
│   ├── alerts/                         # Queue table, filters, case drawer, AI panels
│   ├── auth/                           # LoginForm
│   └── providers/                      # ThemeProvider
│
├── hooks/                              # use-stats, use-transactions, use-alerts, use-streaming, ...
│
├── lib/
│   ├── ai/                             # Claude prompts + context builder (AI Gateway)
│   ├── api/                            # Typed fetch wrappers (auth, transactions, alerts)
│   ├── mock/                           # Seeded RNG, data generator, mutable case store
│   ├── query/                          # QueryClientProvider + query-key registry
│   ├── store/                          # Zustand auth store
│   ├── types/                          # Shared domain types
│   ├── ui-mappings.ts                  # status/risk → tone + label
│   └── utils.ts                        # cn, formatters, sleep, initials
│
└── test/                               # Vitest setup (jest-dom + cleanup)
```

---

## Architecture decisions

### 1. Server state vs client state — separated by purpose

- **TanStack Query** owns everything fetched from the API: stats, transactions, single transaction. It handles caching, deduping, background refetch, and `keepPreviousData` for smooth pagination.
- **Zustand** owns what React Query shouldn't: the authenticated user, the token, and a `hydrated` flag.

This split keeps the auth slice tiny (and persisted to `localStorage` via Zustand's `persist` middleware) while letting the heavier server cache live where it's optimized.

### 2. Polling simulation

`useStats` and `useTransactions` set `refetchInterval` (15s and 20s respectively) with `refetchIntervalInBackground: false`, so the dashboard feels live without burning cycles on a hidden tab. The `LiveIndicator` component subscribes to `isFetching` and `dataUpdatedAt` to show a pulsing badge — a small UX detail that makes the live-data behavior visible.

The `/api/stats` route layers a sinusoidal drift over two of its metrics so polling produces visible movement.

### 3. Auth flow

Mocked, but realistic in shape:

1. `LoginForm` validates with Zod, submits via a `useMutation`.
2. On 200, the payload is stored in the Zustand `useAuthStore` (token + user).
3. The persist middleware writes to `localStorage` so refresh keeps you signed in.
4. The `AppShell` (dashboard layout) waits for hydration and redirects to `/login` if there is no user.
5. The root `/` route is itself a tiny redirector: it sends you to `/dashboard` or `/login` based on the same hydrated store.

This is intentionally client-side because the brief allowed mocked auth — wiring middleware-based gating would be the next step for a real backend.

### 4. Design system

The UI is intentionally **not** dependent on shadcn or another kit — the primitives in `components/ui/` are small, composable, and tone-driven.

Theming uses **HSL CSS variables** set on `:root` and `.dark`, exposed to Tailwind v4 via `@theme inline`. That means every component reads colors like `text-foreground` / `bg-surface` and inherits the active theme without prop drilling. Dark mode is toggled via `next-themes` (`attribute="class"`) and three options (light / system / dark) inside an animated segmented control (`framer-motion` `layoutId`).

### 5. Accessibility & UX

- Interactive table rows are keyboard-focusable (`role="button"`, `tabIndex`, Enter/Space activation).
- The Drawer traps body scroll, closes on Escape, and the backdrop is dismissible by click.
- Inputs surface validation messages via `aria-invalid` + `aria-describedby` and live `role="alert"` regions for server errors.
- Loading states use shimmering skeletons sized to match real rows, so the layout doesn't shift when data arrives.
- Animations rely on opacity + small transforms so reduced-motion users get a graceful experience.

### 6. Performance

- TanStack Query `staleTime` (30s) prevents redundant refetches across navigation.
- `keepPreviousData` on the transactions query keeps the table populated during pagination instead of flashing skeletons every page.
- Search input is debounced (300ms) before triggering a new query.
- The chart uses Recharts' `ResponsiveContainer` so it only re-renders on real size changes.
- The Dockerfile uses Next standalone output, so the runtime image stays small.

### 7. Mock data is deterministic

`SeededRng` (xorshift32) gives reproducible fixtures across cold starts. The whole dataset (84 transactions, customer profiles, risk indicators, history, activity events) is generated once per process from a fixed seed and cached. That means tests, screenshots, and review sessions all see the same data.

---

## Testing

Thirty-three unit tests across seven files cover the highest-leverage units:

| File                                          | Covers                                                          |
| --------------------------------------------- | --------------------------------------------------------------- |
| `lib/utils.test.ts`                           | `cn` / `tailwind-merge` behavior, currency / number / initials  |
| `lib/mock/seed.test.ts`                       | Deterministic RNG + stats payload coherence                     |
| `lib/mock/cases.test.ts`                      | Case derivation, queue counts/sorting/filtering, mutations      |
| `hooks/use-debounced-value.test.ts`           | Debounce behavior with fake timers                              |
| `components/ui/badge.test.tsx`                | Tone classes, dot indicator                                     |
| `components/ui/markdown.test.tsx`             | Headings, lists, inline bold, blank-line handling               |
| `components/transactions/pagination.test.tsx` | Range rendering, disabled boundaries, click handlers            |

```bash
npm test                # one-shot
npm run test:watch      # watch mode
npm run test:ui         # Vitest UI in browser
```

---

## Mock API surface

All endpoints live under `src/app/api/` and add 250–700ms of artificial latency so loading states are observable.

| Method | Route                          | Purpose                                                |
| ------ | ------------------------------ | ------------------------------------------------------ |
| POST   | `/api/auth/login`              | Mock auth (returns 401 for any non-demo credentials)   |
| GET    | `/api/stats`                   | Dashboard KPIs + weekly volume + risk distribution     |
| GET    | `/api/transactions`            | Paginated, searchable, filterable list                 |
| GET    | `/api/transactions/[id]`       | Single transaction with full timeline                  |
| GET    | `/api/alerts`                  | Paginated case queue + per-status counts               |
| GET    | `/api/alerts/[id]`             | Single case joined with its transaction                |
| PATCH  | `/api/alerts/[id]`             | Update case status and/or assignee                     |
| POST   | `/api/alerts/[id]/notes`       | Append an investigator note                            |
| POST   | `/api/alerts/[id]/escalate`    | Escalate the case to SAR                               |
| POST   | `/api/alerts/[id]/sar`         | Save / approve a SAR narrative                         |
| POST   | `/api/alerts/[id]/analyze`     | **Streams** an AI risk assessment (Claude)             |
| POST   | `/api/alerts/[id]/sar/draft`   | **Streams** an AI-drafted SAR narrative (Claude)       |

### `/api/transactions` query parameters

| Param      | Type                                                                | Notes                                          |
| ---------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| `search`   | string                                                              | Matches customer name, reference, counterparty |
| `status`   | `completed \| pending \| flagged \| failed \| review \| all`        |                                                |
| `risk`     | `low \| medium \| high \| critical \| all`                          |                                                |
| `page`     | integer (default 1)                                                 |                                                |
| `pageSize` | integer (default 10, max 50)                                        |                                                |

---

## Bonus features delivered

- **Dark mode** with system / manual toggle (animated segmented control)
- **Animations & micro-interactions** — page-load fades, layout-id pill on theme toggle & nav, animated SVG risk meter, framer-staggered list reveals
- **Polling simulation** — TanStack Query `refetchInterval` + drifting mock stats + live indicator
- **Alert / case management** — a triage queue with status workflow, assignment, notes, audit trail, and SAR escalation. See [Alerts & AI](#alerts--ai-assisted-case-management) below.
- **AI-assisted triage (Claude)** — streaming risk assessments and SAR narratives via the Vercel AI SDK + AI Gateway.
- **Global search with command-palette UX** — `⌘K` / `Ctrl K` from anywhere, debounced dropdown with top 5 matches (avatar, customer, reference, badges, amount), keyboard navigation (↑/↓, Enter, Esc), substring highlighting, and a "View all results" fallback that pushes to the transactions page with the filter applied. See [Global search](#global-search) below.
- **Unit tests** — Vitest + RTL, 20 tests across 5 files
- **Docker setup** — multi-stage build, standalone output, non-root user

---

## Global search

The header search ([src/components/layout/global-search.tsx](src/components/layout/global-search.tsx)) is a small command-palette built on top of TanStack Query:

- Type 2+ characters → 250 ms debounce → top 5 transaction matches appear in a floating dropdown.
- The dropdown row shows: avatar · highlighted customer name · highlighted reference · status & risk badges · relative time · amount.
- **Keyboard:** `↑/↓` to navigate, `Enter` to activate, `Esc` to clear/close. Press **⌘K / Ctrl K** anywhere on the dashboard to focus the input.
- Clicking a result navigates to `/dashboard/transactions?search=<q>&open=<id>` — the transactions page reads those params and auto-opens the drawer for that transaction.
- The footer row "View all N results for *foo*" navigates to `/dashboard/transactions?search=<q>` for the full filterable table.
- The dropdown's `useQuery` shares its cache key (`queryKeys.transactions(...)`) with the table, so navigating from the header to the transactions page is a cache hit — no second fetch.

---

## Alerts & AI-assisted case management

The **Alerts** workspace ([src/app/dashboard/alerts/page.tsx](src/app/dashboard/alerts/page.tsx)) turns the monitoring dashboard into a working investigations tool.

### The queue

- Cases are **derived** from the transaction data: any flagged / under-review transaction, or anything high- or critical-risk, opens a case ([src/lib/mock/cases.ts](src/lib/mock/cases.ts)).
- The queue is sorted by priority, filterable by status and priority, searchable, and paginated. Four KPI tiles count cases by status (Open / Investigating / Escalated / Closed), and the sidebar **Alerts** badge shows the live count of active cases.

### The case view

Opening a case (drawer, [src/components/alerts/case-drawer.tsx](src/components/alerts/case-drawer.tsx)) exposes the full analyst workflow:

- **Status workflow** — `open → investigating → escalated → closed`, plus assignment to an analyst.
- **Escalate to SAR** — one click flips the case to escalated and marks the disposition `sar_filed`.
- **Investigator notes** — free-text notes, each appended to the case.
- **Audit trail** — every status change, assignment, note, and SAR action is recorded as an immutable timeline entry.

Mutations go through a small **mutable in-memory store** so actions persist for the lifetime of the dev server (the brief allowed mocked data; this keeps the demo stateful without a database). TanStack Query mutations write the updated case back into the cache and invalidate the queue, so the UI stays in sync.

### The AI layer

Two features call **Claude through the Vercel AI Gateway** ([src/lib/ai/triage.ts](src/lib/ai/triage.ts)), both **streamed token-by-token**:

- **AI triage assistant** (`/api/alerts/[id]/analyze`) — reads the transaction, customer, risk indicators, history, and notes, then drafts a structured risk assessment with a recommended disposition.
- **AI SAR drafting** (`/api/alerts/[id]/sar/draft`) — drafts the regulatory narrative, which the analyst can edit before saving a draft or approving the filing.

Both routes use `streamText(...).toTextStreamResponse()`; the client reads the response body as a stream ([src/hooks/use-streaming.ts](src/hooks/use-streaming.ts)) and renders it live through a tiny dependency-free markdown component. The analyst always makes the final decision — the AI assists, it doesn't decide.

> **No key? Still works.** Without `AI_GATEWAY_API_KEY` the app runs normally; only the two AI actions return a friendly "AI is not configured" message (the routes guard on credentials and respond `503`). See [.env.example](.env.example).

