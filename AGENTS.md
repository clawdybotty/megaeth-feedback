# MegaETH Tester Feedback App

## Overview
A lightweight web app replacing a Google Sheet for collecting structured feedback from MegaETH testnet app testers. Two views: tester-facing (card-based, one app at a time) and assessor dashboard (aggregated scores, drill-down).

## Goals
- **Tester UX**: Mobile-first, ~15 seconds per app rating, not overwhelming
- **Assessor UX**: Instant aggregations, per-app drill-down, per-tester completion tracking
- **Zero friction auth**: Just enter Telegram handle, no passwords
- **Dark mode**: Always

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: SQLite via better-sqlite3 (small data: ~16 apps × ~20 testers)
- **Deployment**: VPS on port 3200 (Tailscale accessible)

## Directory Structure
```
src/
  app/
    page.tsx                  # Landing: enter telegram handle → redirect
    tester/
      page.tsx                # App grid with completion status
      [appSlug]/
        page.tsx              # Rating form for single app
    dashboard/
      page.tsx                # Assessor overview: aggregated scores
      app/[appSlug]/
        page.tsx              # Per-app detail: all reviews
      tester/[handle]/
        page.tsx              # Per-tester completion view
    api/
      reviews/
        route.ts              # GET/POST reviews
      apps/
        route.ts              # GET apps list
      stats/
        route.ts              # GET aggregated stats
  lib/
    db.ts                     # SQLite connection + schema init
    types.ts                  # Shared types
    apps.ts                   # App list + known issues (static data)
  components/
    StarRating.tsx            # Tap-to-rate stars (1-5)
    AppCard.tsx               # App card with name + completion indicator
    ReviewForm.tsx            # Full rating form for one app
    StatsCard.tsx             # Aggregated score display
    Layout.tsx                # Dark mode shell + nav
db/
  feedback.db                 # SQLite file (gitignored)
```

## Data Model

### Apps (static, in code)
```ts
{
  slug: string          // "aave", "avon", etc.
  name: string          // "Aave", "Avon", etc.
  knownIssues?: string  // "Can't login through phone"
}
```

### Reviews (SQLite)
```sql
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tester_name TEXT NOT NULL,
  telegram_handle TEXT NOT NULL,
  app_slug TEXT NOT NULL,
  wallet_connection INTEGER CHECK(wallet_connection BETWEEN 1 AND 5),
  ui_ux_quality INTEGER CHECK(ui_ux_quality BETWEEN 1 AND 5),
  core_functionality INTEGER CHECK(core_functionality BETWEEN 1 AND 5),
  mobile_experience INTEGER CHECK(mobile_experience BETWEEN 1 AND 5),
  speed_performance INTEGER CHECK(speed_performance BETWEEN 1 AND 5),
  overall_rating INTEGER CHECK(overall_rating BETWEEN 1 AND 5),
  needs_access_code BOOLEAN DEFAULT FALSE,
  bugs_issues TEXT,
  general_comments TEXT,
  date_tested TEXT DEFAULT (date('now')),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(telegram_handle, app_slug)
);
```

UNIQUE constraint means one review per tester per app (upsert on resubmit).

## The 16 Apps
Aave, Avon, Blackhaven, Brix, Dorado, Euphoria, Hit.One, Kumbaya, Nectar, Supernova, WCM, Showdown, TopStrike, Hello.trade, Blitzo

Known issues:
- WCM: Can't login through phone
- Supernova: Can't connect to wallet through phone
- Kumbaya: Can connect to wallet but faces RPC rate limits on phone

## Coding Conventions
- Use `"use client"` only where needed (forms, interactive components)
- Server components by default
- Tailwind for all styling, no CSS modules
- shadcn/ui for form controls (Input, Button, Label, Card, Badge, Tabs)
- All API routes return JSON with consistent shape: `{ data, error? }`
- Mobile-first responsive design (test at 375px width)
- Dark mode via Tailwind `dark:` classes with `class` strategy

## Commands
```bash
npm run dev          # Dev server on port 3200
npm run build        # Production build
npm run lint         # ESLint
npm test             # Vitest
```

## Key UX Decisions
1. **No login wall** — tester enters name + handle on landing, stored in localStorage
2. **Card grid** — each app shows ✅/⬜ completion status
3. **Star ratings** — large tap targets for mobile, emoji feedback (😕→😊)
4. **Progressive form** — ratings visible immediately, bugs/comments expandable
5. **Auto-advance** — after submit, suggest next unrated app
6. **Dashboard** — no auth, anyone with the URL can view aggregated results
