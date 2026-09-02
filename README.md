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

# ACCOUNTS

These are the accounts for judges and also for monitoring of System Admin

Judges
1. judge1	judge2026	Judge
2. judge2	judge2026	Judge
3. judge3	judge2026	Judge
4. judge4	judge2026	Judge
5. judge5	judge2026	Judge
6. judge5	judge2026	Judge
7. judge7	judge2026	Judge

System admin
1.admin	admin2026	System admin