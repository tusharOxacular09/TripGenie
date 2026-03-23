# TripGenie

AI-powered full-stack travel planner built as a production-style monorepo.

---

## Project Description

TripGenie is an AI-powered full-stack travel planner where users can create personalized trips using destination, duration, budget, and interests.  
The platform generates structured day-by-day itineraries, budget breakdowns, and hotel suggestions using Gemini AI, then lets users edit plans dynamically (add, remove, and regenerate day activities).  
It is built with secure JWT authentication, strict multi-user data isolation, reusable modular architecture, and a polished responsive UI.

---

## Demo Video (YouTube)

- [Watch on YouTube](https://www.youtube.com/watch?v=29FUxIzZ4UA)

### Video Preview

[![TripGenie Walkthrough Thumbnail](https://img.youtube.com/vi/29FUxIzZ4UA/maxresdefault.jpg)](https://www.youtube.com/watch?v=29FUxIzZ4UA)

<iframe
  width="100%"
  height="420"
  src="https://www.youtube.com/embed/29FUxIzZ4UA"
  title="TripGenie Application Walkthrough"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen
></iframe>

---

## Live Deployment URLs

- Frontend: [https://tripgenie.enrolbee.com](https://tripgenie.enrolbee.com)
- Backend API: [https://api.tripgenie.enrolbee.com](https://api.tripgenie.enrolbee.com)

---

## GitHub Repository

- Repository: [https://github.com/tusharOxacular09/TripGenie](https://github.com/tusharOxacular09/TripGenie)

---

## Tech Stack

### Frontend
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Redux Toolkit
- Axios
- Lucide React

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT (access + refresh token strategy)
- bcryptjs

### AI
- Google Gemini API (itinerary generation, day regeneration, budget, hotels)
- MongoDB cache layer with TTL for AI responses

### Monorepo
- npm workspaces
- Shared types package: `@tripgenie/types`

---

## Monorepo Structure

```text
TripGenie/
├─ frontend/            # Next.js app
├─ backend/             # Express API
├─ packages/
│  └─ types/            # Shared TS contracts
├─ package.json         # Root workspace scripts
└─ README.md
```

---

## Core Features

- User registration and login
- JWT authentication with refresh flow
- Protected multi-user dashboard
- Create trip from:
  - pickup point
  - destination
  - number of days
  - budget type
  - interests
- AI-generated:
  - day-by-day itinerary
  - budget breakdown
  - hotel suggestions
- Itinerary editing:
  - add activity
  - remove activity
  - regenerate specific day
- Delete trip
- Global 404 page with quick navigation

---

## Frontend Routes & Pages

| Route | Page | Access |
|---|---|---|
| `/` | Root redirect handler | Public (smart redirect) |
| `/login` | Login page | Public (redirects to dashboard when authenticated) |
| `/register` | Register page | Public (redirects to dashboard when authenticated) |
| `/dashboard` | User trip listing | Protected |
| `/trips/new` | Create trip form | Protected |
| `/trips/[id]` | Trip details + itinerary editor | Protected |
| `/profile` | User profile view/update | Protected |
| `*` | Global not found (`not-found.tsx`) | Public |

---

## Frontend Feature Modules

- `src/features/auth`
  - auth thunks and validation
- `src/features/trips`
  - trip validators
  - itinerary day editor
- `src/services/api`
  - centralized axios client
  - auth/trips API wrappers
  - token attach + refresh handling
- `src/components`
  - reusable UI: app shell, auth layout, cards, states
- `src/store`
  - Redux store + auth slice + typed hooks

---

## Backend API Docs (Minimal)

Base URL (local): `http://localhost:4000`

### System
- `GET /` - backend info
- `GET /health` - health check (`OK`)

### Auth APIs
Base: `/api/auth`

- `POST /register`
  - body: `{ "name": "John", "email": "john@example.com", "password": "secret123" }`
- `POST /login`
  - body: `{ "email": "john@example.com", "password": "secret123" }`
- `POST /refresh`
  - body: `{ "refreshToken": "..." }`
- `GET /me` (protected)
- `PUT /profile` (protected)
  - body: `{ "name": "Updated Name", "email": "updated@example.com" }`

### Trip APIs
Base: `/api/trips` (all protected)

- `POST /`
  - body: `{ "pickupPoint": "Delhi, India", "destination": "Tokyo", "days": 4, "budgetType": "medium", "interests": ["food", "culture"] }`
- `GET /`
- `GET /:id`
- `DELETE /:id`
- `PATCH /:id/add-activity`
  - body: `{ "day": 2, "activity": "Visit Tsukiji Market" }`
- `PATCH /:id/remove-activity`
  - body: `{ "day": 2, "activity": "Visit Tsukiji Market" }`
- `PATCH /:id/regenerate-day`
  - body: `{ "day": 2, "preferences": "More outdoor places" }`

---

## Authentication & Authorization

- Access token is kept in Redux state (short-lived)
- Refresh token is stored in `localStorage` (long-lived)
- Axios interceptor:
  - attaches access token
  - refreshes token on demand
  - retries protected request after refresh
- Backend middleware enforces auth and user scoping
- Trip APIs filter by authenticated `userId`, ensuring strict data isolation

---

## AI Design (Gemini)

- AI service generates structured trip plans using prompt constraints
- Expected response includes itinerary, budget, and hotel suggestions
- Regenerate-day API only updates a specific day
- Graceful fallback values are used if AI parsing fails
- AI cache:
  - hash-based key from input
  - stored in MongoDB
  - TTL expiry (7 days) to reduce cost and latency

---

## Environment Variables

### `frontend/.env`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### `backend/.env`
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=<your-mongodb-uri>
MONGODB_DB_NAME=tripgenie
ACCESS_TOKEN_SECRET=<strong-secret>
REFRESH_TOKEN_SECRET=<strong-secret>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
GEMINI_API_KEY=<your-gemini-api-key>
```

---

## Setup Instructions

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment
- Create/update `frontend/.env`
- Create/update `backend/.env`

### 3) Run in development
```bash
npm run dev:backend
npm run dev:frontend
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:4000`

---

## Build, Start, and Quality Commands

From repo root:

```bash
# Build
npm run build:types
npm run build:backend
npm run build:frontend

# Start (production mode)
npm run start:backend
npm run start:frontend

# Quality
npm run typecheck:types
npm run typecheck:backend
npm run lint:frontend
```

---

## API Response Shape

All APIs follow a consistent envelope:

```json
{
  "status": "success | error",
  "message": "Human readable message",
  "data": {},
  "error": null
}
```

---

## Engineering Highlights

- Clean separation: controllers, services, middleware, models
- Thin controllers, business logic in services
- Shared contracts package for cross-app type consistency
- Structured error handling on frontend and backend
- Responsive, componentized UI aligned to product design

---

## Known Limitations / Next Improvements

- Implement a full automated integration/e2e test suite.
- Enforce API rate limiting on authentication endpoints.
- Define deployment infrastructure using IaC/config files.
- Improve observability with request tracing and centralized logging.
- Strengthen identity verification with email OTP / phone OTP flows.
- Provide direct outbound hotel booking links (official hotel/OTA pages) for better conversion and backlink opportunities.
- Introduce a RAG-enhanced travel intelligence pipeline so AI responses are grounded in fresher, destination-specific context.
- Upgrade to a more capable paid LLM tier for better itinerary quality, more reliable cost reasoning, and larger token context.
