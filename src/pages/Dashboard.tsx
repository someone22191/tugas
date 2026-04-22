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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-xl border border-border-theme shadow-sm"
          >
            <span className="text-[12px] color-[#78909C] uppercase tracking-[0.5px] mb-2 block font-medium">
              {card.title}
            </span>
            <div className="text-[24px] font-bold text-text-main line-clamp-1">
              {card.value}
            </div>
            <div className="text-[11px] mt-1 text-[#4CAF50]">
              {i === 2 ? '93.3% Rate Today' : i === 0 ? 'All Class Integrated' : '+2 new this week'}
            </div>
          </motion.div>
        ))}
      </div>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-border-theme shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border-theme flex justify-between items-center bg-white">
            <h3 className="font-semibold text-[15px]">Log Absensi Terbaru</h3>
            <span className="text-[12px] text-primary font-semibold cursor-pointer">View All Logs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#FAFBFC] border-b border-border-theme">
                  <th className="text-left px-6 py-3 text-[#90A4AE] font-semibold">Waktu</th>
                  <th className="text-left px-6 py-3 text-[#90A4AE] font-semibold">Nama</th>
                  <th className="text-left px-6 py-3 text-[#90A4AE] font-semibold text-center">Status</th>
                  <th className="text-left px-6 py-3 text-[#90A4AE] font-semibold">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F3F5]">
                <tr>
                  <td className="px-6 py-3.5">07:15 AM</td>
                  <td className="px-6 py-3.5 font-medium">Contoh Data Guru</td>
                  <td className="px-6 py-3.5 text-center">
                    <span className="bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-1 rounded-full text-[11px] font-semibold">Hadir</span>
                  </td>
                  <td className="px-6 py-3.5 text-neutral-500">TKJ Lab 1</td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5">07:22 AM</td>
                  <td className="px-6 py-3.5 font-medium">Contoh Data Staf</td>
                  <td className="px-6 py-3.5 text-center">
                    <span className="bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-1 rounded-full text-[11px] font-semibold">Hadir</span>
                  </td>
                  <td className="px-6 py-3.5 text-neutral-500">Ruang Guru</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border-theme shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-theme bg-white">
            <h3 className="font-semibold text-[15px]">Informasi Sekolah</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-[12px] text-[#90A4AE] mb-3 font-medium uppercase tracking-wider">JURUSAN AKTIF</p>
              <div className="flex flex-wrap gap-2">
                {['TKJ', 'DKV', 'AK', 'BC', 'MPLB', 'BD'].map(j => (
                  <span key={j} className="bg-[#ECEFF1] text-[#546E7A] text-[10px] px-2.5 py-1 rounded font-bold">{j}</span>
                ))}
              </div>
            </div>
            
            <div className="bg-[#F8F9FA] p-4 rounded-lg border-l-4 border-primary">
              <p className="text-[13px] font-bold mb-1">Pengumuman Admin</p>
              <p className="text-[12px] text-[#607D8B] leading-relaxed">
                Rekapitulasi bulanan periode ini akan dikunci otomatis pada akhir bulan pukul 23:59 WIB.
              </p>
            </div>
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
