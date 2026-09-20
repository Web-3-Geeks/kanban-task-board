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
    Day3/           # Snapshot of the project as it stood at the end of Day 3
    Day4/           # Snapshot of the project as it stood at the end of Day 4
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

## Day 3 — Assignment, Filtering, Sorting, Drag-and-Drop

### What was built

- **Task assignment**: `Task.assignedTo` (optional `ObjectId` ref to `User`). A new `GET /api/users` endpoint lists all registered users (name/email only) to populate the assignee dropdown in the Add/Edit Task modal.
- **Extended authorization model**: a task is now visible to and editable by its **owner or its assignee** (`isOwnerOrAssignee`); only the **owner** can delete it. `GET /api/tasks` returns the union of tasks a user owns or is assigned to.
- **Query-param filtering** on `GET /api/tasks`: `priority`, `status`, `assignedTo` (accepts a user id, or the literal `me`), `search` (case-insensitive match on title/description), and `dueFrom`/`dueTo` (due-date range). Filters combine with AND logic and are always scoped within the tasks the caller can see.
- **Filter bar UI**: search box, priority/assignee/due-date-range filters, a sort dropdown (due date / priority / recently updated — persisted to `localStorage`), and a "Clear Filters" action that only appears when a filter is active.
- **Due-date urgency indicators**: tasks past their due date (and not yet Done) get a red left-border and red due-date text; tasks due within 48 hours get an amber one. Computed client-side from `dueDate`/`status`, so it updates automatically after any edit.
- **Drag-and-drop** (via `@dnd-kit`): dragging a card into a different column updates its status with an **optimistic UI update** — the card moves immediately, the API call fires in the background, and the change is rolled back (with an error toast) if the request fails. A `DragOverlay` shows a floating preview while dragging.
- **Task detail view**: clicking a card (outside its edit/delete/move buttons) opens a slide-over panel showing every field, who created and who's assigned to the task, and Edit/Delete actions.

### Key architectural decisions

- **Filtering happens server-side, sorting happens client-side.** Filters change *which* tasks are visible (and are cheap to push to the database query), while sort order is a per-viewer preference that only matters for display — doing it in the browser avoids a round-trip on every sort-dropdown change.
- **A single global sort control, not per-column.** The spec allowed either; one control is simpler for a user to reason about and matches how the filter bar already works globally.
- **`useDraggable`/`useDroppable` directly, not full `@dnd-kit/sortable` reordering** — the only requirement is moving a card between columns (status change), not reordering within a column, so the simpler primitives are enough.
- **404 (not 403) still applies to assignees**, not just owners — an assignee who loses their assignment shouldn't be able to distinguish "task reassigned away from me" from "task deleted" from the API's response.

### Testing performed (manual)

- A task created and assigned to a second user is visible to and status-editable by that user, but only the creator can delete it (`404` for the assignee's delete attempt).
- `?assignedTo=me`, `?search=`, and `?priority=` filters each return the correct, scoped subset of tasks.
- Dragging a card to another column updates its status in the database and survives a page refresh.
- **Bug found and fixed during testing**: `getTaskById` populated `owner`/`assignedTo` *before* checking authorization, which turned the ownership comparison (`ObjectId.toString()`) into a comparison against a populated document — silently breaking assignee access (an assignee got a `404` on `GET` while the identical check in `PUT` worked, since `updateTask` checks authorization before populating). Fixed by making the owner/assignee comparison helper unwrap a populated `_id` when present, and verified live afterward.

## Day 4 — Comments, Activity History, Notifications, Optimistic Updates

### What was built

- **Comments**: `Comment` model (`task`, `author`, `content`, timestamps). `POST/GET /api/tasks/:id/comments` (any owner-or-assignee can read/add), `PUT/DELETE /api/comments/:id` (author-only). Shown in the task detail view's Comments tab, with inline edit/delete for a user's own comments.
- **Activity history**: `Activity` model (`task`, `user`, `action`, `previousValue`, `newValue`, timestamp). A shared `logActivity()` helper is called from the task controller on create, status/priority/due-date/assignment changes, and delete, and from the comment controller on new comments. Read via `GET /api/tasks/:id/activity`, shown in the detail view's Activity tab (newest first).
- **Notifications**: `Notification` model (`recipient`, `type`, `message`, `task`, `read`). A `notify()` helper fires when: a task is assigned to someone, an assigned task's status/priority/due date changes (notifies "the other party" — whichever of owner/assignee didn't make the change), or someone comments on a task (notifies the other party). `GET /api/notifications` (with unread count), `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`. Shown as a bell icon in the Navbar with an unread badge and a dropdown list.
- **Optimistic updates with rollback**: status changes (drag-and-drop and the "Start/Complete" buttons) and priority changes (click the priority pill to cycle Low → Medium → High) update the UI immediately; if the API call fails, the previous state is restored and an error toast is shown. A `pendingIds` set guards against firing a second request for a task that already has one in flight (also used to prevent double-clicking delete).
- **Board polish**: a loading state while tasks are being fetched, a custom `ConfirmDialog` (replacing `window.confirm`) for delete confirmation, and a toast notification system for success/error feedback.

### Key architectural decisions

- **Notifications never target the actor themselves** — the `notify()` helper is a no-op if the recipient and the person performing the action are the same user, so you don't get notified about your own changes.
- **A single `applyOptimisticUpdate(task, patch, revertMessage)` helper** backs both drag-and-drop status changes and priority cycling — one rollback code path instead of two nearly-identical ones.
- **Activity logging is fire-and-forget relative to the response** but still `await`ed inside the same request/response cycle (not queued) — simpler to reason about for a project this size, at the cost of a few extra milliseconds per mutating request.
- **A task's activity log becomes inaccessible once the task is deleted** (the endpoint checks the task still exists before returning its activity), even though a `"deleted"` activity record is written just before deletion. This is an intentional, documented simplification rather than building a separate "detached" activity view for deleted tasks.

### Testing performed (manual)

- Full collaboration scenario end-to-end: User A creates a task and assigns it to User B → User B receives an "assigned" notification, updates the status, and adds a comment → User A receives notifications for both, and sees the comment plus the full activity trail (created → assigned → status changed → comment added) in the detail view.
- A user can edit/delete their own comments; attempting to edit/delete another user's comment is rejected.
- Marking a single notification read, and "mark all as read", both update the unread badge count correctly and persist after refresh.
- Simulated a failed status-change request (stopping the backend mid-drag) — the dragged card snapped back to its original column and an error toast appeared, with no inconsistent leftover state.
- All Day 2/Day 3 CRUD, ownership, and filtering behavior re-verified as still working (regression check).
- Full end-to-end pass against the **live deployed site** using a headless browser (Playwright), not just curl — this caught two bugs that curl-only testing couldn't have: the SPA rewrite issue and the drag-sensor/click conflict below.

### Bugs found in live browser testing (and fixed)

- **Direct navigation/refresh 404'd on any route but `/`.** Vercel's static hosting doesn't know to serve `index.html` for client-side routes by default, so opening `/login` or `/board` directly (or refreshing on them) returned a raw 404 from Vercel itself, before React Router ever got a chance to run. Fixed with a `frontend/vercel.json` rewrite (`"/(.*)" → "/index.html"`).
- **Clicking a task card silently failed to open the detail view.** `dnd-kit`'s `useDraggable` has no default activation distance, so it captured the pointer-down of an ordinary click as a (zero-distance) drag attempt and swallowed the subsequent click event — this worked fine with a mouse in casual testing but failed reliably under an automated click. Fixed by configuring `PointerSensor` with `activationConstraint: { distance: 8 }`, so a plain click no longer registers as a drag.
- **`getTaskById` returned 404 for a task's assignee** (documented above in Day 3) even though the identical ownership check worked in `updateTask` — caused by populating `owner`/`assignedTo` before running the authorization check, turning an `ObjectId` comparison into a comparison against a populated document.

None of these three were caught by curl-only testing (curl doesn't run JavaScript, doesn't simulate real click/pointer event sequences, and hits the API server directly rather than the static frontend host) — they only surfaced once the live site was driven with an actual browser.

### Known limitations / not done on Day 4

- Notifications are fetched on load and when the bell dropdown opens — there's no real-time push (WebSockets), per the Day 4 instruction not to add that.
- No per-notification-type preferences — every relevant event notifies the other party, with no way to mute a specific task or event type.
