# Academic Living System — Email-free student registration

## What changed
- Rector-created student accounts now use a short Student ID (`ALS` + two-digit year + seven random characters).
- A secure 10-character temporary password is generated server-side.
- Credentials are returned once to the Rector interface and displayed in a modal for manual sharing.
- No Resend email is sent.
- Students still sign in with the registered email address and temporary password.
- On first login, students must change the temporary password before entering the dashboard.

## Supabase Dashboard deployment
1. Open your Supabase project → Edge Functions → `create-student`.
2. Replace the function code with `supabase/functions/create-student/index.ts` from this project.
3. Deploy updates.
4. Ensure the function has the built-in `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and either `SUPABASE_ANON_KEY` or `SUPABASE_PUBLISHABLE_KEY` available. Never expose the service role key in frontend environment variables.
5. Test while signed in as a Rector.

## Secrets
`RESEND_API_KEY` and `STUDENT_MAIL_FROM` are no longer used by this function. Remove them from Edge Function secrets only if no other function uses them. Keep Supabase-managed secrets and `RECTOR_REGISTRATION_CODE` if used by other functions.

## Important login detail
Student login currently uses the registered email address plus password. The Student ID is displayed as an additional identifier, but is not itself the Supabase Auth login identifier. Email delivery is disabled; the Rector must share the email/Student ID/password with the student manually.

## Security
The temporary password is returned once to the authenticated Rector UI and is not written to the database. Treat it as a secret and share it directly with the intended student. The generated password is marked for change on first login. This is a prototype workflow; before production, review all RLS policies, rate limits, account recovery, and authorization paths.
