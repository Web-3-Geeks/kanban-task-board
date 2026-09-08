# Kanban Task Board

A full-stack Kanban Task Board built with React (Vite + Tailwind CSS) on the frontend and Express + MongoDB (Mongoose) on the backend, with JWT-based authentication.

## Live Demo

- **Frontend**: https://kanban-task-board-pi-blue.vercel.app
- **Backend API**: https://kanban-task-board-api.vercel.app

Both are deployed on Vercel (backend as a serverless Node/Express function) and fully wired together — register/login/board all work end-to-end on the live link.

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
    Day2/           # Snapshot of the project as it stood at the end of Day 2
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
- Same checks re-verified against the deployed live backend (see Live Demo above), not just locally.

### Known limitations / not done on Day 1

- No drag-and-drop, editing, or deleting tasks yet (planned for later days per the original scope).

## Day 2 — Task Management (CRUD)

### What was built

- **Task model extended**: added a `dueDate` field (optional `Date`, defaults to `null`).
- **Full task CRUD API**: `POST /api/tasks`, `GET /api/tasks`, `GET /api/tasks/:id`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id` — all protected by `authMiddleware` and scoped to the authenticated user's own tasks. Create/update validate `status` and `priority` against their allowed enum values before hitting the database, and reject a blank/whitespace-only title.
- **Ownership checks on individual tasks**: `getTaskById`, `updateTask`, and `deleteTask` all look up the task by ID, then verify `task.owner` matches `req.user.id` — returning `404` (not `403`) when it doesn't, so a user can't tell whether a task exists at all if it isn't theirs.
- **Frontend task API layer** (`api/taskApi.js`): thin wrapper functions (`getTasks`, `createTask`, `updateTask`, `deleteTask`) around the shared Axios instance.
- **Add/Edit Task modal** (`TaskModal`): a single reusable form for both creating and editing a task (title, description, priority, due date; status field only shown when editing). The same `onSubmit` callback is used for both — the caller (`Board`) decides whether to call `createTask` or `updateTask`.
- **Task cards** now show a due date (when set) and a description preview, plus hover-revealed edit/delete actions and a "Start →" / "Complete →" button to move a task to the next status.
- **Board page wiring**: local `tasks` state is updated directly after create/update/delete (no full re-fetch needed), so the UI reflects changes immediately; a page refresh re-fetches from the API, confirming persistence.

### Key architectural decisions

- **`TaskModal` is reusable for both create and edit**, driven by an `initialTask` prop (`null` for create) — avoids duplicating the form markup and validation logic.
- **`key={editingTask?._id ?? "new"}` on `TaskModal`** forces React to fully remount the modal whenever the task being edited changes, so its internal form state can be initialized directly from `initialTask` via `useState`, instead of syncing it with a `useEffect` (avoids an unnecessary effect and the extra render it would cause).
- **Status transitions use a fixed forward flow** (`todo → in-progress → done`) via a single "next step" button rather than a free-form dropdown, matching the Day 2 note that drag-and-drop/dropdowns are optional and simple buttons are an acceptable first pass.
- **404, not 403, for tasks that exist but belong to another user** — prevents leaking information about what task IDs exist to a user who doesn't own them.

### Testing performed (manual)

Verified via curl and through the UI:
- A task can be created, appears in the "To Do" column, and is scoped to the creating user.
- A task's title, description, priority, and due date can be edited and the change is reflected immediately.
- A task can move `To Do → In Progress → Done` via the "Start"/"Complete" buttons, and the new status persists after a page refresh.
- A task can be deleted (after a confirmation prompt) and disappears from the UI.
- A second, unrelated user gets `404` when trying to `GET`, `PUT`, or `DELETE` the first user's task — ownership is enforced server-side, not just hidden in the UI.
- An invalid `status` value on update is rejected with `400`.
- A request to any task endpoint without a token is rejected with `401`.

### Known limitations / not done on Day 2

- Status changes are forward-only (no "move back a step" button) and use simple buttons rather than drag-and-drop, per the Day 2 note that this is acceptable for a first pass.
- "Assigned User" from the original task field list is not implemented as a separate concept — tasks are only ever owned by their creator; there is no multi-user assignment/collaboration in this app yet.
