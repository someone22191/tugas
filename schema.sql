# Database Schema SMK Prima Unggul

Run these SQL commands in your Supabase SQL Editor:

```sql
-- 1. Create Profiles Table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('admin', 'guru', 'kependidikan')),
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Students Table
create table students (
  id uuid default gen_random_uuid() primary key,
  nis text unique not null,
  name text not null,
  class_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Attendance Employees
create table attendance_employees (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date default current_date not null,
  status text not null check (status in ('hadir', 'izin', 'sakit', 'alfa')),
  check_in_time time with time zone default now(),
  unique(user_id, date)
);

-- 4. Create Attendance Students
create table attendance_students (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) on delete cascade not null,
  teacher_id uuid references profiles(id) on delete cascade not null,
  date date default current_date not null,
  status text not null check (status in ('hadir', 'izin', 'sakit', 'alfa')),
  unique(student_id, date)
);

-- 5. Enable RLS
alter table profiles enable row level security;
alter table students enable row level security;
alter table attendance_employees enable row level security;
alter table attendance_students enable row level security;

-- 6. RLS Policies

-- Profiles: Users can read their own profile, Admins can read all.
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Admins can read all profiles" on profiles for select 
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Students: Everyone with role 'admin' or 'guru' can read.
create policy "Staff can read students" on students for select 
  using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'guru')));
create policy "Admins can manage students" on students for all 
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Employee Attendance: Own record or Admin recap.
create policy "Users can manage own attendance" on attendance_employees for all using (auth.uid() = user_id);
create policy "Admins can read all employee attendance" on attendance_employees for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Student Attendance: Guru and Admin.
create policy "Guru/Admin manage student attendance" on attendance_students for all
  using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'guru')));
```
