# Kanban Task Board

A full-stack Kanban Task Board built with React (Vite + Tailwind CSS) on the frontend and Express + MongoDB (Mongoose) on the backend, with JWT-based authentication.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express, MongoDB Atlas, Mongoose
- **Auth**: JWT (JSON Web Tokens), bcrypt password hashing

## Project Structure

```
kanban-task-board/
  backend/
    config/         # Database connection
    controllers/    # Route handler logic (auth, tasks)
    middleware/      # JWT auth middleware
    models/         # Mongoose schemas (User, Task)
    routes/         # Express route definitions
    server.js       # App entry point
  frontend/
    src/
      api/          # Axios instance (base URL + auth headers)
      components/   # Reusable UI pieces (Navbar, TaskCard, Column, etc.)
      context/      # AuthContext (global auth state)
      pages/        # Full page views (Login, Register, Board)
  week2/
    Day1/           # Snapshot of the project as it stood at the end of Day 1
```

## Local Setup

### Backend

```
cd backend
npm install
```

Create a `backend/.env` file (see `.env` keys below), then:

```
npm run dev
```

Backend runs on `http://localhost:5000`.

**Required `.env` variables:**
```
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<any random secret string>
PORT=5000
```

### Frontend

```
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (or next available port). A `frontend/.env` file can optionally set `VITE_API_URL` (defaults to `http://localhost:5000/api` if not set).

## Day 1 — Foundation & Authentication

### What was built

- **Project setup**: separate `frontend`/`backend` apps, connected via REST API (Axios on the client, Express on the server), MongoDB Atlas as the database, environment variables for secrets/config.
- **Database models**: `User` (name, email, password, timestamps) and `Task` (title, description, status, priority, owner, timestamps). `Task.owner` is a `ObjectId` reference to `User`, establishing a one-to-many relationship (one user has many tasks).
- **Authentication**: register and login endpoints. Passwords are hashed with bcrypt before being stored — plain-text passwords are never persisted. On successful register/login, a JWT (signed with a server-side secret, 7-day expiry) is issued and returned to the client.
- **Protected routes**: an `authMiddleware` verifies the JWT on incoming requests and attaches the authenticated user's ID to `req.user`. Task endpoints (`GET /api/tasks`, `POST /api/tasks`) are wrapped with this middleware and scoped to `req.user.id`, so a user can only ever read or create their own tasks.
- **Frontend auth flow**: `AuthContext` holds the logged-in user and exposes `login`/`register`/`logout`. Axios interceptors automatically attach the JWT to outgoing requests and redirect to `/login` on a `401` response (e.g. expired token). `ProtectedRoute` guards the `/board` route from unauthenticated access.
- **Basic Kanban UI**: a Navbar (logo, logged-in user info, logout), a stats row (Total / In Progress / Completed, computed from the fetched tasks), and three columns (To Do, In Progress, Done) rendering task cards (title + priority). Drag-and-drop was intentionally left out per Day 1 scope.

### Key architectural decisions

- **Auth state lives in React Context (`AuthContext`)** rather than being passed via props, since multiple unrelated components (Navbar, ProtectedRoute, Login/Register pages) all need read/write access to it.
- **JWT stored in `localStorage`** (rather than an httpOnly cookie) — simpler to reason about and implement for a first pass; the token is attached via an Axios request interceptor rather than manually on every call.
- **Ownership is enforced server-side, not just hidden client-side** — every task query/mutation is filtered by `req.user.id` taken from the verified JWT, never trusted from the request body. This is what actually prevents one user from accessing another user's tasks, regardless of what the frontend does.
- **`VITE_API_URL` environment variable** with a `localhost` fallback in `axiosInstance.js`, so the same code works unmodified in local development and in a deployed environment.

### Testing performed (manual)

Verified via direct API calls (curl) and through the UI:
- New user registration succeeds and is persisted (with a bcrypt-hashed password, never plain text).
- Duplicate email registration is rejected.
- Login with correct credentials succeeds and returns a valid JWT; incorrect credentials are rejected with a generic error message.
- Requests to `/api/tasks` without a token are rejected (`401`).
- An authenticated user can fetch and create their own tasks.
- A task created by one user does not appear for a different authenticated user (ownership isolation confirmed).

### Known limitations / not done on Day 1

- No drag-and-drop, editing, or deleting tasks yet (planned for later days per the original scope).
- The backend is not deployed to a cloud host — free-tier providers tried (Render, Cyclic, Koyeb, DigitalOcean) all required card verification, which the card on hand failed on repeated attempts. The app is fully functional when both frontend and backend are run locally (see Local Setup above). The frontend is deployed to Vercel for UI preview purposes only; without a hosted backend, login/register/board data-fetching will not work on that live link.
