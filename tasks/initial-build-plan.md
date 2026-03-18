# MegaETH Feedback App — Initial Build Plan

**Goal:** Replace the Google Sheet with a card-based feedback app that's intuitive for testers and gives assessors instant aggregated insights.
**Architecture:** Next.js 14 App Router with SQLite backend. Two main flows: tester (identify → pick app → rate → next) and dashboard (aggregated scores → drill-down).
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, better-sqlite3, Vitest

---

### Task 1: Project Scaffold + DB Layer

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
- Create: `src/lib/db.ts` — SQLite connection, schema init, CRUD functions
- Create: `src/lib/types.ts` — TypeScript interfaces
- Create: `src/lib/apps.ts` — static app list with known issues
- Test: `tests/db.test.ts`

**Steps:**
1. Initialize Next.js project with TypeScript + Tailwind
2. Install deps: better-sqlite3, @types/better-sqlite3
3. Install shadcn/ui (init + components: button, card, input, label, badge, tabs, textarea, toggle, separator)
4. Write `src/lib/types.ts` with Review, App, AppStats interfaces
5. Write `src/lib/apps.ts` with all 16 apps + known issues
6. Write failing test: `tests/db.test.ts` — test createReview, getReviewsByApp, getReviewsByTester, getStats
7. Verify tests FAIL
8. Write `src/lib/db.ts` — SQLite schema init + CRUD
9. Verify tests PASS
10. Commit: `feat: project scaffold + db layer - tests pass`

### Task 2: API Routes

**Files:**
- Create: `src/app/api/reviews/route.ts` — GET (query by app/tester) + POST (upsert review)
- Create: `src/app/api/apps/route.ts` — GET all apps
- Create: `src/app/api/stats/route.ts` — GET aggregated stats
- Test: `tests/api.test.ts`

**Steps:**
1. Write failing test for POST /api/reviews (submit a review, verify stored)
2. Write failing test for GET /api/reviews?app=aave (get reviews for app)
3. Write failing test for GET /api/stats (aggregated scores)
4. Verify tests FAIL
5. Implement API routes
6. Verify tests PASS
7. Commit: `feat: api routes for reviews and stats - tests pass`

### Task 3: Shared Components

**Files:**
- Create: `src/components/StarRating.tsx` — interactive 1-5 star selector with large tap targets
- Create: `src/components/AppCard.tsx` — app card with name, known issues badge, completion indicator
- Create: `src/components/ReviewForm.tsx` — full review form (5 ratings + toggle + text fields)
- Create: `src/components/StatsCard.tsx` — aggregated score display for dashboard
- Create: `src/app/layout.tsx` — dark mode root layout with nav
- Create: `src/app/globals.css` — Tailwind base styles

**Steps:**
1. Create root layout with dark mode, Inter font, nav bar (Tester | Dashboard links)
2. Build StarRating — 5 clickable stars, onChange callback, large mobile targets (min 44px)
3. Build AppCard — shows app name, completion checkmark, known issues warning
4. Build ReviewForm — uses StarRating ×5, overall rating, access code toggle, collapsible bugs/comments
5. Build StatsCard — shows app name, average scores per category, review count
6. Commit: `feat: shared UI components - dark mode, star ratings, cards`

### Task 4: Tester Flow

**Files:**
- Create: `src/app/page.tsx` — landing: name + telegram handle form → localStorage → redirect to /tester
- Create: `src/app/tester/page.tsx` — grid of AppCards with completion status
- Create: `src/app/tester/[appSlug]/page.tsx` — ReviewForm for single app, submit → suggest next

**Steps:**
1. Build landing page: two inputs (name, telegram handle), submit → save to localStorage → redirect /tester
2. Build tester grid: fetch apps + user's reviews, show completion per app
3. Build app review page: load existing review (if any) for editing, ReviewForm, submit via POST, show success + next app link
4. Test full flow manually
5. Commit: `feat: tester flow - identify, pick app, rate, next`

### Task 5: Dashboard

**Files:**
- Create: `src/app/dashboard/page.tsx` — overview with aggregated scores per app
- Create: `src/app/dashboard/app/[appSlug]/page.tsx` — all reviews for one app
- Create: `src/app/dashboard/tester/[handle]/page.tsx` — all reviews by one tester

**Steps:**
1. Build dashboard overview: table/grid of apps with avg scores, review counts, sortable
2. Build app detail: list of all reviews with scores + comments
3. Build tester detail: all apps reviewed by this tester, completion percentage
4. Add CSV export button on dashboard
5. Commit: `feat: assessor dashboard with drill-down and export`

### Task 6: Polish + Deploy

**Steps:**
1. Add loading states and error handling
2. Mobile responsive check (375px, 768px breakpoints)
3. Add favicon + page titles
4. Configure port 3200 in next.config.js
5. Test full flow end-to-end
6. Set up systemd service for VPS deployment
7. Commit: `feat: polish, responsive, deploy config`

---

## Definition of Done
- [ ] Tester can identify with telegram handle, see 16 apps, rate each one in <15 seconds
- [ ] Ratings persist and can be edited (upsert)
- [ ] Dashboard shows aggregated scores across all testers
- [ ] Drill-down to per-app and per-tester views
- [ ] CSV export works
- [ ] Mobile-friendly (tested at 375px)
- [ ] Dark mode throughout
- [ ] Runs on port 3200
