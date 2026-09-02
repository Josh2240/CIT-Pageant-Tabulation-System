# PCLU Tabulation System (Minimal Fullstack)

This workspace contains a minimal fullstack tabulation system.

Quick start (Next.js fullstack):

1. Install dependencies

```bash
npm install
```

1. Create a `.env` from `.env.example` and adjust your MySQL credentials

1. Run the dev server

```bash
npm run dev
```

Open <http://localhost:3000>

Tech stack:
Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Bootstrap 5, Bootstrap Icons

Backend: Next.js API routes, MySQL (via `mysql2`), JWT / bcryptjs available for authentication

Notes on migration:
This repository now contains a Next.js app at the project root. API routes are under `app/api/` and use MySQL. If you prefer SQLite or the previous Express backend, that code remains in `Backend/`.

## Accounts

These are the accounts for judges and the System Admin.

### Judges

| # | Username | Password |
|---|----------|----------|
| 1 | judge1 | judge2026 |
| 2 | judge2 | judge2026 |
| 3 | judge3 | judge2026 |
| 4 | judge4 | judge2026 |
| 5 | judge5 | judge2026 |
| 6 | judge6 | judge2026 |
| 7 | judge7 | judge2026 |

### System admin

| Username | Password | Role |
|----------|----------|------|
| admin | admin2026 | System admin |
