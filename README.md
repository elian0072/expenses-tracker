# Annual Expense Tracker

Annual household expense planner with:

- FastAPI backend (Python + `uv`)
- Vite React SPA frontend (React + TypeScript + Material UI)
- PostgreSQL persistence
- Docker Compose orchestration
- Makefile-first developer workflow
- Dark dashboard shell (desktop sidebar, mobile drawer)
- Euro-first currency formatting (`EUR`)
- Role-based access control (admin and member roles)
- Admin user management dashboard (`/users`)
- Self-service profile page (`/profile`) linked from the sidebar identity card
- Shared expense-tracker logo on login and dashboard navigation

## Quick start

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
make bootstrap
```

3. Start local app stack:

```bash
make docker-up
```

Frontend: `http://localhost:3000`  
Backend docs: `http://localhost:8000/docs`

Default route flow:

- Logged out: `/` -> `/login`
- Logged in (session cookie present): `/` -> `/expenses`
- Dashboard pages:
  - All authenticated users: `/expenses`
  - All authenticated users: `/profile` (click user identity at sidebar bottom)
  - Admin only: `/users`, `/activity`

## Development Commands

- `make bootstrap` install backend and frontend dependencies
- `make dev` run db container + backend app in reload mode
- `make dev-frontend` run frontend Vite dev server
- `make test` run backend and frontend tests
- `make lint` run backend and frontend lint checks
- `make docker-up` build and run all services in containers
- `make docker-down` stop and remove services
- `make rebuild` rebuild containers without cache

## UI/UX Notes

- Authenticated routes use a shared responsive shell with a left sidebar.
- The sidebar bottom identity block always shows the signed-in user and links to profile editing.
- Core screens (login, expenses, activity) use MUI components and consistent
  loading/empty/success/error feedback patterns.
- Expense and summary amounts render in euros.
- Role-aware navigation hides admin sections for non-admin accounts.
- Login and sidebar use the same logo asset for consistent branding.

## Performance Checks

- Backend performance tests:

  ```bash
  cd backend && uv run pytest tests/integration/test_expense_performance.py tests/integration/test_year_overview_performance.py tests/integration/test_auth_activity_performance.py -q
  ```

- Frontend production build:

  ```bash
  cd frontend && npm run build
  ```

- Optional Lighthouse quick check:

  ```bash
  cd frontend && npm run perf:lighthouse:hint
  ```

## Demo Credentials

- Email: `owner@example.com`
- Password: `change-me-please`

Create additional users from the admin dashboard:

- Sign in with the demo admin account
- Open `Users` in the left sidebar
- Add/edit/delete users and grant/revoke admin rights

Update your own profile:

- Click your identity card at the bottom of the left sidebar
- Edit `display name` and `email address`
- Save to refresh identity labels across the dashboard
