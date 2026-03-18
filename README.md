# TripGenie

TripGenie is an AI-powered travel planner built as a monorepo.

Current state: initial production-style setup only. No product features are implemented yet.

## Tech Stack

- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database (planned): MongoDB + Mongoose
- Auth (planned): JWT + bcrypt
- Shared package: workspace types package

## Monorepo Layout

- `frontend`: UI application
- `backend`: API service
- `packages/types`: shared TypeScript types usable by both apps

## Environment Files

- `frontend/.env`
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`
- `backend/.env`
  - `PORT=4000`
  - `NODE_ENV=development`
  - `MONGODB_URI=`
  - `JWT_SECRET=replace-with-a-strong-secret`

## Install

```bash
npm install
```

## Run

From repository root:

```bash
npm run dev:frontend
npm run dev:backend
```

## Build / Quality

```bash
npm run build:types
npm run typecheck:types
npm run build:backend
npm run typecheck:backend
npm run build:frontend
npm run lint:frontend
```

## Notes for Next Steps

- Import shared contracts from `@tripgenie/types` in frontend and backend.
- Keep controllers thin and move business logic to services.
- Implement features step-by-step, starting with auth.
