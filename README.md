# Hello World React + Supabase-ready Backend

This project contains:

- `frontend/`: a Vite + React + TypeScript app that renders one screen with `Hello World`.
- `backend/`: a minimal Express API prepared to connect to a Supabase Postgres database.

## 1) Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App runs on the default Vite URL (usually `http://localhost:5173`).

## 2) Database (Supabase) setup

1. Create a project in [Supabase](https://supabase.com/).
2. In the Supabase dashboard, open **Project Settings -> Database**.
3. Copy the connection string and use the **transaction pooler** URI.
4. Create `backend/.env` from `backend/.env.example` and fill in `DATABASE_URL`.

Example:

```env
PORT=4000
DATABASE_URL=postgresql://postgres:<your-password>@<project-ref>.pooler.supabase.com:6543/postgres
```

## 3) Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your real Supabase connection string
npm run dev
```

Available API routes:

- `GET /api/health` -> basic health response
- `GET /api/hello` -> runs a simple Postgres query and returns `{ "message": "Hello World" }`

## 4) Hosting-ready notes

- Frontend can be deployed to Vercel directly from `frontend/`.
- Backend can be deployed to any Node host (Render, Railway, Fly.io, etc.).
- Supabase hosts the Postgres database in the cloud.
