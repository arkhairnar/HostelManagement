# Academic Living System — Supabase Auth & Database Setup

This setup uses the current Supabase project URL:
`https://ukfdlubklyfqdhpqwdar.supabase.co`

## Before you start

- Back up any existing Supabase data before applying schema changes.
- The SQL below intentionally drops the old `public.hostel_app_state` shared-JSON table because its former broad policies were unsafe for real student data. Do not run it if that table contains data you need to preserve; export and migrate that data first.
- No sample/demo students or rector accounts are inserted.
- Do not put a Supabase secret/service-role key in `.env.local`, React code, or Git.

## 1. Configure frontend

Copy `.env.example` to `.env.local` and replace the placeholder with the project's **publishable key** (or legacy anon key):

```env
VITE_SUPABASE_URL=https://ukfdlubklyfqdhpqwdar.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Restart Vite after changing `.env.local`.

## 2. Create tables and Row Level Security

In the Supabase dashboard, open SQL Editor and run `supabase/schema.sql` after reviewing the destructive note above. It creates normalized tables for profiles, students, rooms, allocations, mess complaints, petitions/support, room problems, leave applications, attendance, notifications, and a private profile-photo bucket limited to 50 KB.

The app's authentication role is read from trusted `app_metadata`, not user-editable `user_metadata`. Student creation is server-side. Rector data is scoped to the rector who created it; students can read their own record and related operational records.

## 3. Set Edge Function secrets

In Supabase Dashboard → Edge Functions → Secrets, set:

- `RECTOR_REGISTRATION_CODE`: the confidential code you already created in Supabase Secrets. The rector registration and validation functions have been aligned to this exact name.
- `RESEND_API_KEY`: API key from your Resend account.
- `STUDENT_MAIL_FROM`: verified sender address/domain in Resend, e.g. `Academic Living System <accounts@your-verified-domain.example>`.

Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to deployed Edge Functions. Never expose the service-role key in frontend code.

Do not paste the code into frontend files, `.env.local`, screenshots, or source control.

## 4. Deploy Edge Functions

Install/use the Supabase CLI and authenticate:

```powershell
npx supabase login
npx supabase link --project-ref ukfdlubklyfqdhpqwdar
npx supabase functions deploy register-rector
npx supabase functions deploy validate-rector-code
npx supabase functions deploy create-student
```

Set the secrets in the Dashboard before testing. The `create-student` function requires Resend sender configuration and rolls back the newly created account if email delivery fails.

## 5. Rector registration and login

- Rector registration: username (`@Rahul123`), strong password, and shared confidential code.
- The server creates a Supabase Auth user with a synthetic internal email alias and trusted `app_metadata.role = rector`; no real rector email is needed for this prototype path. Because this alias is not a mailbox, account recovery must be designed before production use.
- Every rector login uses username, password, and code. The server validates both the authenticated user's trusted role and the code.
- Do not use a mobile number alone as a password.

## 6. Student creation and login

- An authenticated rector enters student details in the Add Student form.
- The Edge Function creates the Auth account, profile, and student record; generates a random temporary password; and emails the Student ID and temporary password.
- Student login uses the student's registered email and the emailed temporary password.
- Configure Resend first. If email delivery fails, the function deletes the newly created records/account rather than leaving an account whose credentials were not delivered.

## 7. Current integration boundary

Authentication, rector registration, the student roster, room records, and student creation are wired to the normalized schema. Other operational screens (complaints, petitions, leave, attendance, notifications) now have dedicated database tables and RLS policies, but their existing UI actions still need to be migrated feature-by-feature from local component state to those tables. Do not treat those screens as cloud-persistent until that migration is complete.

The local development-only dashboard preview remains available for UI inspection. It is not an authenticated session and should never be used as production access control.
