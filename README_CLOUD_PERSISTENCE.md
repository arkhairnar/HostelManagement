# Academic Living System — Cloud Persistence Update

This version connects the existing operational forms to Supabase's normalized tables instead of relying only on in-memory React state.

## What's wired to Supabase

- Student and room records are loaded from `students` and `rooms`.
- Mess complaints: create, load, and Rector status/notes updates.
- Petitions: create, load, support/withdraw support, and Rector decisions/notes.
- Room problems: create, load, assign staff, update status and remarks.
- Leave applications: create, load, parent verification, approval/rejection and remarks.
- Attendance: upsert one record per student/day.
- Notifications: load, insert, mark one read, and mark all read.
- Student credentials still come from the `create-student` Edge Function. Email delivery is not used.

The UI updates optimistically in some flows. Check the browser console and Supabase Logs if a database operation is rejected; a local UI update alone is not proof that the cloud write succeeded.

## Apply the database policy migration

The base schema is already part of the project at `supabase/schema.sql`. If it has already been applied to your Supabase project, **do not rerun it just to apply this update**.

1. Open Supabase Dashboard → SQL Editor → New query.
2. Open `supabase/migrations/20261029_operational_cloud_persistence.sql`.
3. Paste the full SQL into the editor and run it.
4. Confirm the query completes without errors.

This migration updates the policies that allow authenticated students to browse collective petitions/support counts and allows notification inserts only to the user themselves, a student's assigned Rector, or students created by the signed-in Rector. It does not delete application tables or records.

## Run locally

From the project directory in VS Code terminal:

```bash
npm install
npm run dev
```

Open the exact Local URL printed by Vite (this project's script normally uses `http://localhost:3000`).

The `.env.local` file should contain the public Supabase project URL and publishable/anon key:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

Never put a Supabase service-role/secret key in `VITE_*` variables or browser code. The service-role key belongs only in Supabase Edge Function secrets.

## Smoke-test checklist

1. Sign in as a student.
2. Submit a mess complaint; verify a row appears in `mess_complaints`.
3. Submit a room problem; verify a row appears in `room_problems`.
4. Submit a leave application; verify a row appears in `leave_applications`.
5. Create a petition and support it; verify rows appear in `petitions` and `petition_support`.
6. Record attendance; verify a row appears in `attendance_records`.
7. Sign in as the Rector and update complaint/problem/leave/petition status; verify those database rows update.
8. Mark a notification read and refresh the page.
9. Refresh both dashboards and verify persisted records are loaded again.

If an insert/update fails, check the browser DevTools Console and Supabase Logs. A common cause is a missing base schema, missing migration, or a row-level security (RLS) policy rejection.

## Remaining limitations (do not treat these as completed)

- Attendance capture/verification is still a prototype simulation; this update stores attendance records but does not implement face liveness or geolocation verification.
- Student profile photo selection remains local preview unless a separate Storage upload flow has been implemented.
- The current data model does not fully model multiple hostel scopes; Rector visibility is bounded by the existing `created_by` ownership model.
- Cloud persistence should be smoke-tested against the actual Supabase project before deploying the frontend to Vercel.
