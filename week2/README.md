# Week 2 — Daily Snapshots

This folder contains a full, standalone copy of the project as it stood at the end of each day. Each `DayN` folder is independently runnable (own `package.json`, `src/`, etc.) and is cumulative — `Day2` includes Day 1 + Day 2 work, and so on.

- **Day1/** — Project foundation: frontend/backend setup, MongoDB connection, User & Task models, JWT-based register/login/logout, auth middleware, protected task routes, and a basic Kanban board UI (Navbar, stats, 3 columns, task cards). See `Day1/README.md` for details.
- **Day2/** — Full task CRUD: create/edit/delete tasks, due dates, ownership-checked `GET/PUT/DELETE /api/tasks/:id`, an Add/Edit Task modal, and status transitions (To Do → In Progress → Done) wired into the Kanban board. See `Day2/README.md` for details.
- **Day3/** — Task assignment (owner-or-assignee authorization), `GET /api/users`, query-param filtering/search on `GET /api/tasks`, client-side sorting, due-date urgency indicators, drag-and-drop status changes (dnd-kit, optimistic + rollback), and a task detail slide-over. See the "Day 3" section of `README.md` for details.
- **Day4/** — Task comments, activity history, in-app notifications, optimistic priority-cycling, a custom confirm dialog and toast system, plus fixes found during end-to-end testing (an authorization check broken by premature `populate()`, and a dnd-kit drag sensor swallowing card clicks). See the "Day 4" section of `README.md` for details.
