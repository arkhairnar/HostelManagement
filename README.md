# Academic Living System — Authentication & Database Foundation

React + Vite + TypeScript hostel-management prototype for KKWIEER.

## Start locally

1. Install Node.js (LTS).
2. Copy `.env.example` to `.env.local` and add the Supabase publishable key.
3. Run `npm install`.
4. Run `npm run dev` and open the local URL shown in the terminal.
5. The local-only demo preview remains available for inspecting both dashboards without authenticating.

## Supabase setup

Read [`supabase/SETUP_AUTH_AND_DATABASE.md`](supabase/SETUP_AUTH_AND_DATABASE.md) before applying the SQL or deploying Edge Functions. The schema is in `supabase/schema.sql`.

### Implemented in this package

- Rector registration using a username, strong password, and server-validated shared rector code.
- Rector sign-in requires username, password, and the confidential code.
- Trusted rector/student role stored in Supabase Auth `app_metadata`.
- Student creation via a server-side Edge Function, with random temporary password emailed using Resend.
- Normalized database schema and Row Level Security policies for core hostel features.
- Student roster and rooms load from normalized Supabase tables.
- Private profile-picture Storage bucket with a 50 KB per-file limit.

### Still needs integration work

The existing UI for mess complaints, petitions, leave applications, attendance, and notifications has corresponding normalized database tables and RLS, but those UI actions must still be wired to the tables. Do not treat these screens as cloud-persistent yet.

Never commit `.env.local`, the rector access code, Resend API key, or a service-role key.


## Supabase integration status

- The frontend uses `src/lib/supabase.ts`, which safely supports a missing local configuration.
- The Edge Functions `register-rector` and `validate-rector-code` both read the custom Supabase secret `RECTOR_REGISTRATION_CODE`.
- After applying these source changes, redeploy both functions from the Supabase Dashboard or Supabase CLI. Editing local files does not update functions already deployed in Supabase.
- Student account creation also requires the `create-student` Edge Function and valid `RESEND_API_KEY` and `STUDENT_MAIL_FROM` secrets. Do not test student creation until those are configured.
- Operational feature screens still need feature-by-feature database wiring; do not assume every form currently persists to Supabase.
- Never include `.env.local`, `node_modules`, or `dist` when sharing the source archive.

## Rector-created student registration update

The Rector's **Add New Student** form collects exactly these six required details:

- Student full name (first name and surname in one field)
- Phone number
- Email address
- Academic year
- Department
- Room number

The backend generates a unique Student ID and random temporary password. It creates the Supabase Auth account and student/profile records, then emails the Student ID and temporary password to the student's email address through Resend. If the email cannot be delivered, the function rolls back the newly created records rather than leaving an account whose credentials were not delivered.

### Apply and deploy this update

1. In the Supabase SQL Editor, run `supabase/migrations/20261025_student_registration_fields.sql`.
2. Ensure these server-side Edge Function secrets are configured: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `STUDENT_MAIL_FROM`. The `STUDENT_MAIL_FROM` sender must be verified with Resend.
3. From this project folder, deploy the changed student function:

   ```bash
   npx supabase link --project-ref ukfdlubklyfqdhpqwdar
   npx supabase functions deploy create-student
   ```

4. Install/update frontend dependencies if needed and run `npm run dev`.

The student form no longer asks the Rector to enter a roll number or gender. The system generates an internal Student ID and saves the student's department and room number on the student record. The existing dashboard and Rector dashboard UI are unchanged.
