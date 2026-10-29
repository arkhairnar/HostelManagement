-- Additive migration for the Rector-created student registration workflow.
-- Safe to run on an existing database; it does not remove or recreate records.
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS department TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS room_number TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS hostel_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_path TEXT;

NOTIFY pgrst, 'reload schema';
