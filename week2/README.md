# Week 2 — Daily Snapshots

This folder contains a full, standalone copy of the project as it stood at the end of each day. Each `DayN` folder is independently runnable (own `package.json`, `src/`, etc.) and is cumulative — `Day2` includes Day 1 + Day 2 work, and so on.

- **Day1/** — Project foundation: frontend/backend setup, MongoDB connection, User & Task models, JWT-based register/login/logout, auth middleware, protected task routes, and a basic Kanban board UI (Navbar, stats, 3 columns, task cards). See `Day1/README.md` for details.
- **Day2/** — Full task CRUD: create/edit/delete tasks, due dates, ownership-checked `GET/PUT/DELETE /api/tasks/:id`, an Add/Edit Task modal, and status transitions (To Do → In Progress → Done) wired into the Kanban board. See `Day2/README.md` for details.
