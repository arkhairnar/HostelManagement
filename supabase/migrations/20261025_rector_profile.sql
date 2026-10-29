-- Apply this migration in Supabase SQL Editor to update an existing project.
-- Rector profile fields only; no department or office-location fields are added.
alter table public.profiles add column if not exists email text not null default '';
alter table public.profiles add column if not exists hostel_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_path text;

-- Keep profile photographs private and allow a Rector to replace their own image.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hostel-profiles', 'hostel-profiles', false, 51200, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 51200,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Profile owners can read own files" on storage.objects;
create policy "Profile owners can read own files" on storage.objects
for select to authenticated using (
  bucket_id = 'hostel-profiles' and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Profile owners can upload own files" on storage.objects;
create policy "Profile owners can upload own files" on storage.objects
for insert to authenticated with check (
  bucket_id = 'hostel-profiles' and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Profile owners can update own files" on storage.objects;
create policy "Profile owners can update own files" on storage.objects
for update to authenticated
using (bucket_id = 'hostel-profiles' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'hostel-profiles' and (storage.foldername(name))[1] = auth.uid()::text);
