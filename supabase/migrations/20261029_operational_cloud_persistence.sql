-- Academic Living System: operational data access and notification persistence.
-- Run this file in Supabase SQL Editor after the base schema.
-- Safe to rerun: policies are dropped/recreated, data is not deleted.

-- Students must be able to browse petitions and support counts across the
-- hostel, while private student records remain protected by their own policies.
drop policy if exists petitions_select_scoped on public.petitions;
create policy petitions_select_scoped
on public.petitions
for select to authenticated
using (true);

drop policy if exists support_select_scoped on public.petition_support;
create policy support_select_scoped
on public.petition_support
for select to authenticated
using (true);

-- Persist in-app notifications. A user may notify themselves; a student may
-- notify only their own Rector; a Rector may notify only students they created.
drop policy if exists notifications_insert_scoped on public.notifications;
create policy notifications_insert_scoped
on public.notifications
for insert to authenticated
with check (
  recipient_user_id = auth.uid()
  or (
    public.current_app_role() = 'student'
    and exists (
      select 1 from public.students s
      where s.auth_user_id = auth.uid()
        and s.created_by = notifications.recipient_user_id
    )
  )
  or (
    public.current_app_role() = 'rector'
    and exists (
      select 1 from public.students s
      where s.auth_user_id = notifications.recipient_user_id
        and s.created_by = auth.uid()
    )
  )
);

-- Helpful indexes for dashboard retrieval.
create index if not exists mess_complaints_created_at_idx
  on public.mess_complaints(created_at desc);
create index if not exists petitions_created_at_idx
  on public.petitions(created_at desc);
create index if not exists room_problems_created_at_idx
  on public.room_problems(created_at desc);
create index if not exists leave_applications_applied_at_idx
  on public.leave_applications(applied_at desc);
