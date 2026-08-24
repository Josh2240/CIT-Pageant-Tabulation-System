# PCLU Tabulation System (Minimal Fullstack)

This workspace contains a minimal fullstack tabulation system.

Quick start (Next.js fullstack):

1. Install dependencies

```bash
npm install
```

2. Create a `.env` from `.env.example` and adjust your MySQL credentials

3. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

Tech stack:
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Bootstrap 5, Bootstrap Icons
- Backend: Next.js API routes, MySQL (via `mysql2`), JWT / bcryptjs available for authentication

Notes on migration:
- This repository now contains a Next.js app at the project root. API routes are under `app/api/` and use MySQL. If you prefer SQLite or the previous Express backend, that code remains in `Backend/`.

# CIT-Pageant-Tabulation-System


### UPDATES:

- changing from MySQL to PostgreSQL# PCLU-PAGEANT-TABULATION-SYSTEM-ORIGINAL-
