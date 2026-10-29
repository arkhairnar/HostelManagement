-- Academic Living System
-- Initial normalized schema for the prototype.
-- Creates no demo records and does not drop application tables.

create extension if not exists pgcrypto;

-- =========================================================
-- 1. PROFILES
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text not null default '',
  role text not null check (role in ('rector', 'student')),
  email text not null default '',
  phone text,
  hostel_name text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe additive migration for projects where profiles already exists.
alter table public.profiles add column if not exists email text not null default '';
alter table public.profiles add column if not exists hostel_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_path text;

-- =========================================================
-- 2. STUDENTS
-- =========================================================

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  roll_number text not null,
  full_name text not null,
  email text not null,
  phone text not null default '',
  gender text not null default '',
  academic_year text not null default '',
  department text not null default '',
  room_number text,
  bed text,
  parent_name text not null default '',
  parent_phone text not null default '',
  avatar_path text,
  account_status text not null default 'invited'
    check (account_status in ('invited', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (created_by, roll_number),
  unique (email)
);

-- =========================================================
-- 3. ROOMS AND ALLOCATIONS
-- =========================================================

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  room_number text not null,
  floor integer not null default 0,
  block text not null default 'A',
  capacity integer not null check (capacity > 0),
  status text not null default 'active'
    check (status in ('active', 'maintenance', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (created_by, block, room_number)
);

create table if not exists public.room_allocations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete restrict,
  bed_label text,
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

-- =========================================================
-- 4. MESS COMPLAINTS
-- =========================================================

create table if not exists public.mess_complaints (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null,
  description text not null,
  photo_path text,
  status text not null default 'New'
    check (status in ('New', 'In Progress', 'Resolved')),
  rector_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 5. PETITIONS AND SUPPORT
-- =========================================================

create table if not exists public.petitions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null default 'General',
  status text not null default 'gathering_support'
    check (status in (
      'gathering_support',
      'active_management',
      'accepted',
      'delayed',
      'denied'
    )),
  rector_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.petition_support (
  petition_id uuid not null references public.petitions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (petition_id, student_id)
);

-- =========================================================
-- 6. ROOM PROBLEMS
-- =========================================================

create table if not exists public.room_problems (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  category text not null default 'Other',
  title text not null,
  description text not null,
  status text not null default 'Pending'
    check (status in ('Pending', 'Assigned', 'Resolved')),
  assigned_staff text,
  rector_remarks text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- =========================================================
-- 7. LEAVE APPLICATIONS
-- =========================================================

create table if not exists public.leave_applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  date_from date not null,
  date_to date not null,
  reason text not null,
  parent_phone text not null,
  parent_verified boolean not null default false,
  parent_verification_notes text,
  status text not null default 'Pending'
    check (status in ('Pending', 'Approved', 'Rejected')),
  rector_remarks text,
  applied_at timestamptz not null default now(),
  reviewed_at timestamptz,
  check (date_to >= date_from)
);

-- =========================================================
-- 8. ATTENDANCE
-- =========================================================

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  attendance_date date not null default current_date,
  status text not null
    check (status in ('Present', 'Absent', 'Leave')),
  check_in_at timestamptz,
  evidence_path text,
  created_at timestamptz not null default now(),
  unique (student_id, attendance_date)
);

-- =========================================================
-- 9. NOTIFICATIONS
-- =========================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  notification_type text not null default 'system',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 10. INDEXES
-- =========================================================

create index if not exists students_created_by_idx
  on public.students(created_by);

create index if not exists rooms_created_by_idx
  on public.rooms(created_by);

create index if not exists room_allocations_student_idx
  on public.room_allocations(student_id);

create index if not exists complaints_student_idx
  on public.mess_complaints(student_id);

create index if not exists petitions_student_idx
  on public.petitions(student_id);

create index if not exists room_problems_student_idx
  on public.room_problems(student_id);

create index if not exists leave_applications_student_idx
  on public.leave_applications(student_id);

create index if not exists attendance_student_date_idx
  on public.attendance_records(student_id, attendance_date desc);

create index if not exists notifications_recipient_idx
  on public.notifications(recipient_user_id, created_at desc);

-- =========================================================
-- 11. SECURITY HELPER FUNCTIONS
-- =========================================================

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    ''
  )
$$;

create or replace function public.owns_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.students s
    where s.id = target_student_id
      and (
        s.auth_user_id = auth.uid()
        or (
          public.current_app_role() = 'rector'
          and s.created_by = auth.uid()
        )
      )
  )
$$;

create or replace function public.is_my_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.students s
    where s.id = target_student_id
      and s.auth_user_id = auth.uid()
  )
$$;

-- =========================================================
-- 12. ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.rooms enable row level security;
alter table public.room_allocations enable row level security;
alter table public.mess_complaints enable row level security;
alter table public.petitions enable row level security;
alter table public.petition_support enable row level security;
alter table public.room_problems enable row level security;
alter table public.leave_applications enable row level security;
alter table public.attendance_records enable row level security;
alter table public.notifications enable row level security;

-- =========================================================
-- 13. PROFILE POLICIES
-- =========================================================

create policy profiles_select_own
on public.profiles
for select to authenticated
using (id = auth.uid());

create policy profiles_update_own
on public.profiles
for update to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = public.current_app_role()
);

-- =========================================================
-- 14. STUDENT POLICIES
-- =========================================================

create policy students_select_scoped
on public.students
for select to authenticated
using (
  auth_user_id = auth.uid()
  or (
    public.current_app_role() = 'rector'
    and created_by = auth.uid()
  )
);

create policy students_update_scoped
on public.students
for update to authenticated
using (
  public.current_app_role() = 'rector'
  and created_by = auth.uid()
)
with check (
  public.current_app_role() = 'rector'
  and created_by = auth.uid()
);

-- Student creation must use a trusted server-side Edge Function.

-- =========================================================
-- 15. ROOM POLICIES
-- =========================================================

create policy rooms_select_scoped
on public.rooms
for select to authenticated
using (
  created_by = auth.uid()
  and public.current_app_role() = 'rector'
);

create policy rooms_select_student_allocation
on public.rooms
for select to authenticated
using (
  exists (
    select 1
    from public.room_allocations ra
    join public.students s on s.id = ra.student_id
    where ra.room_id = rooms.id
      and s.auth_user_id = auth.uid()
  )
);

create policy rooms_insert_scoped
on public.rooms
for insert to authenticated
with check (
  created_by = auth.uid()
  and public.current_app_role() = 'rector'
);

create policy rooms_update_scoped
on public.rooms
for update to authenticated
using (
  created_by = auth.uid()
  and public.current_app_role() = 'rector'
)
with check (
  created_by = auth.uid()
  and public.current_app_role() = 'rector'
);

-- =========================================================
-- 16. ROOM ALLOCATION POLICIES
-- =========================================================

create policy allocations_select_scoped
on public.room_allocations
for select to authenticated
using (
  (
    created_by = auth.uid()
    and public.current_app_role() = 'rector'
  )
  or public.is_my_student(student_id)
);

create policy allocations_insert_scoped
on public.room_allocations
for insert to authenticated
with check (
  created_by = auth.uid()
  and public.current_app_role() = 'rector'
  and public.owns_student(student_id)
);

-- =========================================================
-- 17. MESS COMPLAINT POLICIES
-- =========================================================

create policy mess_select_scoped
on public.mess_complaints
for select to authenticated
using (public.owns_student(student_id));

create policy mess_insert_own
on public.mess_complaints
for insert to authenticated
with check (public.is_my_student(student_id));

create policy mess_update_scoped
on public.mess_complaints
for update to authenticated
using (
  public.current_app_role() = 'rector'
  and public.owns_student(student_id)
)
with check (
  public.current_app_role() = 'rector'
  and public.owns_student(student_id)
);

-- =========================================================
-- 18. PETITION POLICIES
-- =========================================================

create policy petitions_select_scoped
on public.petitions
for select to authenticated
using (public.owns_student(student_id));

create policy petitions_insert_own
on public.petitions
for insert to authenticated
with check (public.is_my_student(student_id));

create policy petitions_update_scoped
on public.petitions
for update to authenticated
using (
  public.current_app_role() = 'rector'
  and public.owns_student(student_id)
)
with check (
  public.current_app_role() = 'rector'
  and public.owns_student(student_id)
);

create policy support_select_scoped
on public.petition_support
for select to authenticated
using (public.owns_student(student_id));

create policy support_insert_own
on public.petition_support
for insert to authenticated
with check (public.is_my_student(student_id));

create policy support_delete_own
on public.petition_support
for delete to authenticated
using (public.is_my_student(student_id));

-- =========================================================
-- 19. ROOM PROBLEM POLICIES
-- =========================================================

create policy problems_select_scoped
on public.room_problems
for select to authenticated
using (public.owns_student(student_id));

create policy problems_insert_own
on public.room_problems
for insert to authenticated
with check (public.is_my_student(student_id));

create policy problems_update_scoped
on public.room_problems
for update to authenticated
using (
  public.current_app_role() = 'rector'
  and public.owns_student(student_id)
)
with check (
  public.current_app_role() = 'rector'
  and public.owns_student(student_id)
);

-- =========================================================
-- 20. LEAVE APPLICATION POLICIES
-- =========================================================

create policy leaves_select_scoped
on public.leave_applications
for select to authenticated
using (public.owns_student(student_id));

create policy leaves_insert_own
on public.leave_applications
for insert to authenticated
with check (public.is_my_student(student_id));

create policy leaves_update_scoped
on public.leave_applications
for update to authenticated
using (
  public.current_app_role() = 'rector'
  and public.owns_student(student_id)
)
with check (
  public.current_app_role() = 'rector'
  and public.owns_student(student_id)
);

-- =========================================================
-- 21. ATTENDANCE POLICIES
-- =========================================================

create policy attendance_select_scoped
on public.attendance_records
for select to authenticated
using (public.owns_student(student_id));

create policy attendance_insert_own
on public.attendance_records
for insert to authenticated
with check (public.is_my_student(student_id));

create policy attendance_update_scoped
on public.attendance_records
for update to authenticated
using (
  public.current_app_role() = 'rector'
  and public.owns_student(student_id)
)
with check (
  public.current_app_role() = 'rector'
  and public.owns_student(student_id)
);

-- =========================================================
-- 22. NOTIFICATION POLICIES
-- =========================================================

create policy notifications_select_own
on public.notifications
for select to authenticated
using (recipient_user_id = auth.uid());

create policy notifications_update_own
on public.notifications
for update to authenticated
using (recipient_user_id = auth.uid())
with check (recipient_user_id = auth.uid());

-- =========================================================
-- 23. PRIVATE PROFILE-PICTURE STORAGE
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'hostel-profiles',
  'hostel-profiles',
  false,
  51200,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 51200,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create policy "Profile owners can read own files"
on storage.objects
for select to authenticated
using (
  bucket_id = 'hostel-profiles'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Profile owners can update own files" on storage.objects;
create policy "Profile owners can update own files"
on storage.objects
for update to authenticated
using (
  bucket_id = 'hostel-profiles'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'hostel-profiles'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Profile owners can upload own files"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'hostel-profiles'
  and (storage.foldername(name))[1] = auth.uid()::t

