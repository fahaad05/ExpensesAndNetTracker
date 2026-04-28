# Expenses and Net Tracker

A local-first Next.js app for:

- monthly expense reviews with reflection notes
- quarterly net-worth reviews
- fixed monthly and yearly expense tracking
- investment contribution and valuation snapshots
- Cashew CSV import with review preparation
- shared-account transaction tracking with usage split, charts, and one-time Notion import

## Stack

- Next.js App Router
- TypeScript
- SQLite via `better-sqlite3`
- Recharts for dashboard charts

## Run locally

```bash
npm install
npm run db:seed
npm run dev
```

Then open `http://localhost:3000`.

## Demo vs personal setup

Recommended split:

- `live demo`: deploy a clean instance with seeded demo data only
- `personal use`: keep a separate local instance and point the SQLite file to a private path

The database path can be configured with:

```bash
TRACKER_DB_PATH=/absolute/path/to/tracker.sqlite
```

Optional demo auto-seed on first boot:

```bash
DEMO_SEED_ON_BOOT=true
```

You can put this in `.env`.

Example for a personal local setup:

```bash
TRACKER_DB_PATH="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Finance/expenses-tracker/tracker.sqlite"
```

This lets you keep the production demo and your personal data fully separate.

For a public demo deployment, set `DEMO_SEED_ON_BOOT=true` and leave `TRACKER_DB_PATH` pointing to a demo-only database location.

## Demo data

`npm run db:seed` loads starter demo data for:

- monthly reviews
- quarterly reviews
- fixed expenses
- investments
- shared-account transactions
- Cashew imported transactions and review-builder data

The seed is safe to re-run because it only fills an empty database.

## Data areas

- `monthly_reviews`: income, expenses, savings, wins, challenges, actions
- `quarterly_reviews`: assets, liabilities, net worth, invested capital, wins, challenges, actions
- `fixed_expenses`: recurring costs with monthly or yearly cadence
- `investments`: invested amount versus current value by account
- `shared_account_transactions`: manual entries tagged as `me`, `other`, or `shared`

## Export endpoints

- `/api/export/json`
- `/api/export/shared-account-csv`

## Notes

- the SQLite files under `data/` are local runtime files and are ignored by git
- for a public deployment, avoid using your personal database
- for your own daily use, a local instance with `TRACKER_DB_PATH` pointing to iCloud is the safest setup
