TaskHub V2 — Company Task Management (React + Firebase)

Overview
- TaskHub is a lightweight task management app for companies with two roles: admin and member.
- Supports public (company) and personal tasks, each with optional subtasks and status transitions.
- Enforces strict Firestore security rules for company scoping, approvals, roles, and status constraints.
- Cloud Functions keep user stats in sync and mark overdue tasks as missed.

Key Features
- Public vs Personal tasks: Public tasks are visible to approved users in the same company; personal tasks are private to their owners.
- Subtasks: A task can include up to 10 subtasks. A task can only be completed if all its subtasks are completed.
- Status model: pending, progress, completed, missed. Completed/missed tasks are immutable (no further edits).
- Roles & approvals: Admins can create public and personal tasks; members can create personal tasks. Members require approval (pendingApproval=false) to access company data.
- Company scoping: All reads are restricted to the user’s companyId; switching companyId requires approval unless creating a new company as admin.
- Admin controls: Admin can edit company logo and theme; can delete public tasks if not in progress and without subtasks in progress.

Tech Stack
- Frontend: React + Vite, Tailwind CSS
- Firebase: Auth, Firestore, Storage, Cloud Functions
- Tooling: ESLint

Monorepo Layout
- `src/` React app
- `functions/` Firebase Cloud Functions (Node 22)
- `firestore.rules` Firestore security rules
- `firebase.json` Firebase hosting & emulators config

Local Setup
1) Create a Firebase project and enable Auth, Firestore, and Storage.
2) Update `src/auth/firebaseConfig.js` with your Firebase config.
3) Install dependencies:
   - `npm install`
   - `cd functions && npm install && cd ..`
4) Start the app:
   - `npm run dev` (Vite)
5) Optional: Run emulators for local dev
   - `firebase emulators:start --only firestore,functions`

Security Rules (Summary)
- Users (`users/{uid}`):
  - Read: user can read their doc; approved users can read users in their company.
  - Update (self): can change firstName, lastName, photo, email, companyId, pendingApproval.
    - Switching to existing companyId -> must set pendingApproval=true.
    - Switching to a new companyId -> only admin may do it, pendingApproval=false.
  - Admin can update role and pendingApproval for users within the same company.
- Companies (`companies/{companyId}`):
  - get: allowed without auth to let registration check if the company exists.
  - read: approved users in that company only.
  - create/update: admin of that company only; can only change logo and theme. createdBy/createdAt immutable.
- Tasks (`tasks/{taskId}`):
  - Read public: approved users in the same company.
  - Read personal: only owner (createdBy).
  - Create: personal by admin or member; public by admin only; companyId must match userCompanyId.
  - Update/Delete personal: only owner; immutable fields enforced; no edits if completed or missed.
  - Update public (admin/assignee): limited fields; no edits if completed or missed; admin also blocked if status is progress.
  - Delete public: admin only, not allowed if status is progress or any subtask is progress.
  - Complete requires all subtasks completed.

Cloud Functions (Summary)
- `taskCreated`: increments pending stats on creation (public -> assignee; personal -> creator).
- `taskUpdated`: handles transitions to completed (increments completed stats, decrements pending). Requires all subtasks completed to count.
- `taskDeleted`: decrements pending stats if a pending task is deleted.
- `markMissedDaily` (scheduled): marks overdue active tasks as missed and adjusts stats.
- `markMissedNow` (HTTP): manual trigger for testing missed logic with an optional secret key.

Common Scripts
- App:
  - `npm run dev` — start Vite dev server
  - `npm run build` — build for production
  - `npm run preview` — preview production build
  - `npm run lint` — lint
- Functions:
  - `npm --prefix functions run serve` — run only functions emulator
  - `npm --prefix functions run deploy` — deploy functions

Deploy
- Deploy Firestore rules:
  - `firebase deploy --only firestore:rules`
- Deploy Cloud Functions:
  - `firebase deploy --only functions`

Notes
- This repo intentionally keeps UI strings in Spanish. Only developer comments were translated to English.
- When debugging Safari console noise from Firestore streaming, consider silencing logs or enabling long polling.
