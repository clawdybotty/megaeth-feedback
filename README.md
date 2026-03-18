# MegaETH Feedback App

A lightweight web app for collecting structured feedback from MegaETH testnet app testers.

## Features

- **Tester Flow**: Mobile-first card interface for rating 15 MegaETH apps
- **Dashboard**: Aggregated stats with drill-down to app and tester details
- **Dark Mode**: Always-on dark theme
- **Simple Auth**: No passwords, just name + Telegram handle
- **Export**: CSV export of all aggregated data

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- SQLite via better-sqlite3
- Vitest for testing

## Development

```bash
# Install dependencies
npm install

# Run dev server (port 3200)
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## Testing

- 8 DB layer tests: CRUD operations, stats aggregation
- 5 API structure tests: data validation
- All tests pass with `npm test`

## Database

SQLite database is created automatically at `db/feedback.db` on first run.

Schema includes one table:
- `reviews`: stores all review data with UNIQUE constraint on (telegram_handle, app_slug) for upsert behavior

## Deployment

The app is designed to run on a VPS accessible via Tailscale on port 3200.

### Systemd Service

Create `/etc/systemd/system/megaeth-feedback.service`:

```ini
[Unit]
Description=MegaETH Feedback App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/clawd/projects/megaeth-feedback
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
systemctl enable megaeth-feedback
systemctl start megaeth-feedback
```

## Project Structure

```
app/
  api/          # API routes (reviews, apps, stats)
  tester/       # Tester flow pages
  dashboard/    # Assessor dashboard pages
  layout.tsx    # Root layout with nav
  globals.css   # Tailwind + custom styles
components/     # Reusable UI components
lib/
  db.ts         # SQLite layer
  types.ts      # TypeScript types
  apps.ts       # Static app list
tests/          # Vitest tests
```

## Apps Included

Aave, Avon, Blackhaven, Brix, Dorado, Euphoria, Hit.One, Kumbaya, Nectar, Supernova, WCM, Showdown, TopStrike, Hello.trade, Blitzo

(15 total)
