import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key are missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export type Role = 'admin' | 'guru' | 'kependidikan';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  email: string;
  created_at: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  class_name: string;
}

export interface AttendanceEmployee {
  id: string;
  user_id: string;
  date: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alfa';
  check_in_time: string | null;
}

export interface AttendanceStudent {
  id: string;
  student_id: string;
  teacher_id: string;
  date: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alfa';
}
