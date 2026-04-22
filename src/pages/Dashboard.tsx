import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib/supabase';
import { Users, UserCheck, ClipboardCheck, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    students: 0,
    todayAttendance: 0
  });

  useEffect(() => {
    async function fetchStats() {
      // Fetch count of students
      const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
      // Fetch count of employees (profiles)
      const { count: employeeCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      // Today attendee count
      const { count: todayCount } = await supabase
        .from('attendance_employees')
        .select('*', { count: 'exact', head: true })
        .eq('date', new Date().toISOString().split('T')[0]);

      setStats({
        students: studentCount || 0,
        employees: employeeCount || 0,
        todayAttendance: todayCount || 0
      });
    }

    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Siswa', value: stats.students, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Karyawan', value: stats.employees, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Absensi Karyawan Hari Ini', value: stats.todayAttendance, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-neutral-900">Halo, {profile?.full_name}! 👋</h1>
        <p className="text-neutral-500 mt-2">Selamat datang di dashboard Sistem Informasi Absensi SMK Prima Unggul.</p>
      </header>

      <div className="grid sm:grid-columns-2 lg:grid-columns-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center gap-6"
          >
            <div className={cn("p-4 rounded-2xl", card.bg)}>
              <card.icon className={cn("h-8 w-8", card.color)} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">{card.title}</p>
              <p className="text-3xl font-bold mt-1">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="grid lg:grid-columns-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ClipboardCheck className="text-primary h-5 w-5" />
            Informasi Sekolah
          </h3>
          <div className="space-y-4">
            <div className="grid grid-columns-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Akreditasi</p>
                <p className="text-lg font-bold">A (Sangat Baik)</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Total Jurusan</p>
                <p className="text-lg font-bold">6 Bidang Keahlian</p>
              </div>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              SMK Prima Unggul terus berkomitmen meningkatkan kualitas absensi digital untuk efisiensi operasional dan monitoring prestasi siswa yang lebih baik.
            </p>
          </div>
        </div>

        <div className="bg-primary text-white p-8 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Pemberitahuan Sistem</h3>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Pastikan Anda melakukan absensi mandiri setiap hari melalui menu "Absensi Karyawan" sebelum jam 08:00 WIB.
            </p>
            <button 
              onClick={() => navigate('/app/absensi-karyawan')}
              className="bg-white text-primary px-6 py-2 rounded-full font-bold text-sm hover:bg-neutral-100 transition-colors"
            >
              Absen Sekarang
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
function navigate(path: string) { window.location.href = path; } 
// Fixed import issues in the layout above
