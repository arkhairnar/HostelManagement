# Rector profile setup

The Rector profile UI is now wired to the authenticated Supabase user. It includes full name, username (read-only), contact email, phone, hostel name, profile photograph, and password change. Department and office location are intentionally not included.

## 1. Apply the database and Storage migration

In the Supabase dashboard, open **SQL Editor** for your project and run the contents of:

`supabase/migrations/20261025_rector_profile.sql`

This adds the profile columns and configures the private `hostel-profiles` Storage bucket and per-user photo policies. Existing profile records are preserved.

## 2. Deploy the updated Rector registration function

From the project root, run:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy register-rector
```

Keep `SUPABASE_SERVICE_ROLE_KEY` and `RECTOR_REGISTRATION_CODE` in Supabase Edge Function secrets only. Never put these in `.env.local` or frontend code.

The updated registration form now sends full name, contact email, optional phone, optional hostel name, username, password, and Rector verification code. The authentication login identifier remains the Rector username for compatibility with existing accounts; the entered email is stored as the profile contact email.

## 3. Start the frontend

Ensure `.env.local` contains your own project URL and publishable key, then run:

```bash
npm install
npm run dev -- --port 3001
```

## 4. Student account emails

The existing `create-student` Edge Function sends student account details to the student's email address using the configured `STUDENT_MAIL_FROM` sender. That sender must be verified/configured with the email provider. The Rector's contact email is profile information; it is not automatically used as the email sender, because sender domains must be verified by the email provider.

## Validation

`npm run lint` passed for the updated TypeScript source. The project bundle build could not be run in this environment because the supplied `node_modules` contains Windows-specific optional Vite/Rolldown binaries; install dependencies on your development machine before running the build.
