# Incident_timeline_and_audit
 Log incidents, manage timelines, implement search and role-based access control

## Design notes

### RBAC model
- **Roles**: `REPORTER`, `REVIEWER`, `ADMIN` (see Prisma `User.role`).
- **Enforcement**: JWT auth (`authenticateToken`) attaches `req.user`; role checks via middleware:
  - `requireReporter`: Reporter, Reviewer, Admin
  - `requireReviewer`: Reviewer, Admin
  - `requireAdmin`: Admin only
- **Permissions**:
  - Reporter: create incidents, add timeline items; can view only incidents they created; can edit own incidents only while status is `OPEN`.
  - Reviewer: can review incidents and transition statuses (`OPEN → IN_REVIEW`, `IN_REVIEW → APPROVED/REJECTED`).
  - Admin: all reviewer abilities, plus delete incidents and create share links.
- **Additional scoping**: List and detail endpoints restrict reporters to their own incidents server-side.

### Search approach
- **Text search**: Case-insensitive `contains` across:
  - Incident `title`
  - `tags` array (via `hasSome`)
  - Nested `timelineEvents.content`
- **Filters**: Optional `severity`, `status`, `tags[]`, and date range (`createdAt` between `dateFrom`/`dateTo`).
- **Pagination**: `page`, `limit` with total counts and `totalPages` in response.
- **Ordering**: Incidents ordered by `createdAt desc`.
- **Role-aware**: Reporters only see their incidents; reviewers/admins see all.

### Share link token strategy
- **Creation**: Admin-only endpoint generates a random 32-byte token (`crypto.randomBytes(32).toString('hex')`).
- **Storage**: Saved in `share_links` with `incidentId`, `token` (unique), `expiresAt`, and `createdBy`.
- **Access**: Public read-only endpoint resolves by `token`, includes incident with timeline and reviews, and returns `410 Gone` after expiry.
- **URL**: Frontend link built as `${FRONTEND_URL}/share/<token>`; frontend consumes at `/share/:token`.
- **Abuse controls**: Share-link creation is rate-limited; tokens are unguessable and time-bound.

## setup:
- Install Docker desktop
- **Run on your terminal**: docker compose up --build
- This will start your db, backendand frontend servers

