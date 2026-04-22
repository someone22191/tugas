# Database Schema SMK Prima Unggul

Run these SQL commands in your Supabase SQL Editor:

```sql
-- 1. Create Profiles Table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('admin', 'guru', 'kependidikan')),
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Students Table
create table if not exists students (
  id uuid default gen_random_uuid() primary key,
  nis text unique not null,
  name text not null,
  class_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Attendance Tables
create table if not exists attendance_employees (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date default current_date not null,
  status text not null check (status in ('hadir', 'izin', 'sakit', 'alfa')),
  check_in_time time with time zone default now(),
  unique(user_id, date)
);

create table if not exists attendance_students (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) on delete cascade not null,
  teacher_id uuid references profiles(id) on delete cascade not null,
  date date default current_date not null,
  status text not null check (status in ('hadir', 'izin', 'sakit', 'alfa')),
  unique(student_id, date)
);

-- 4. Enable RLS
alter table profiles enable row level security;
alter table students enable row level security;
alter table attendance_employees enable row level security;
alter table attendance_students enable row level security;

-- 5. FUNCTION: First User is Admin logic
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_first_user boolean;
begin
  -- Search for existing profiles
  select count(*) = 0 into is_first_user from public.profiles;

  insert into public.profiles (id, full_name, role, email)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'User Baru'), 
    -- If no profiles exist, this user becomes admin
    case when is_first_user then 'admin' else coalesce(new.raw_user_meta_data->>'role', 'guru') end,
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- 6. TRIGGER: Auto create profile on auth signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. RLS Policies
-- Profiles: Users can read their own profile, Admins can read all.
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Admins can read all profiles" on profiles for select 
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Students: Staff (Admin/Guru) can manage students.
create policy "Staff manage students" on students for all 
  using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'guru')));

-- Employee Attendance: Own record or Admin management.
create policy "Users manage own attendance" on attendance_employees for all using (auth.uid() = user_id);
create policy "Admins manage all employee attendance" on attendance_employees for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Student Attendance: Guru and Admin.
create policy "Guru/Admin manage student attendance" on attendance_students for all
  using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'guru')));
```
