import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib/supabase';
import { Users, UserCheck, GraduationCap, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getAttendanceAnalysis } from '../services/geminiService';
import { formatDate } from '../lib/utils';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    students: 0,
    todayAttendance: 0
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartView, setChartView] = useState<'Staf' | 'Siswa'>('Staf');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    fetchData();
  }, [chartView]);

  async function fetchData() {
    const today = formatDate(new Date());

    // Counts
    const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
    const { count: employeeCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    
    // Recent logs (joining with profiles)
    const { data: logs } = await supabase
      .from('attendance_employees')
      .select('*, profiles(full_name)')
      .eq('date', today)
      .order('check_in_time', { ascending: false })
      .limit(5);

    if (logs) setRecentLogs(logs);

    // Dynamic Chart Data based on view
    if (chartView === 'Staf') {
      const { data: allToday } = await supabase
        .from('attendance_employees')
        .select('status')
        .eq('date', today);

      const statusMap = { hadir: 0, izin: 0, sakit: 0, alfa: 0 };
      allToday?.forEach(a => {
        if (a.status in statusMap) statusMap[a.status as keyof typeof statusMap]++;
      });

      setChartData([
        { name: 'Hadir', value: statusMap.hadir, color: '#2E7D32' },
        { name: 'Izin', value: statusMap.izin, color: '#1976D2' },
        { name: 'Sakit', value: statusMap.sakit, color: '#F57C00' },
        { name: 'Alfa', value: statusMap.alfa, color: '#D32F2F' },
      ]);
    } else {
      const { data: studentToday } = await supabase
        .from('attendance_students')
        .select('status')
        .eq('date', today);

      const statusMap = { hadir: 0, izin: 0, sakit: 0, alfa: 0 };
      studentToday?.forEach(a => {
        if (a.status in statusMap) statusMap[a.status as keyof typeof statusMap]++;
      });

      setChartData([
        { name: 'Hadir', value: statusMap.hadir, color: '#2E7D32' },
        { name: 'Izin', value: statusMap.izin, color: '#1976D2' },
        { name: 'Sakit', value: statusMap.sakit, color: '#F57C00' },
        { name: 'Alfa', value: statusMap.alfa, color: '#D32F2F' },
      ]);
    }

    // Update Stats based on Employees for the card
    const { data: empAt } = await supabase.from('attendance_employees').select('id', { count: 'exact' }).eq('date', today);
    setStats({
      students: studentCount || 0,
      employees: employeeCount || 0,
      todayAttendance: empAt?.length || 0
    });

    // AI Insight (only run once or when needed)
    if (!aiInsight) {
      setLoadingAi(true);
      const analysis = await getAttendanceAnalysis({
        total_students: studentCount,
        total_staff: employeeCount
      });
      setAiInsight(analysis);
      setLoadingAi(false);
    }
  }

  const cards = [
    { title: 'Total Siswa', value: stats.students, icon: GraduationCap, trend: 'All Integrated', color: 'text-blue-600' },
    { title: 'Total Karyawan', value: stats.employees, icon: Users, trend: '+2 new profiles', color: 'text-purple-600' },
    { title: 'Absensi Hari Ini', value: stats.todayAttendance, icon: UserCheck, trend: `${((stats.todayAttendance / (stats.employees || 1)) * 100).toFixed(1)}% Rate`, color: 'text-green-600' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Halo, {profile?.full_name}! 👋</h1>
          <p className="text-neutral-500 mt-1 font-medium">Sistem Monitoring Terpadu SMK Prima Unggul.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-neutral-600 uppercase tracking-widest">{formatDate(new Date())}</span>
        </div>
      </header>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-border-theme shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
          >
            <div className={`p-3 rounded-2xl ${card.color.replace('text', 'bg')}/10 w-fit mb-4 group-hover:scale-110 transition-transform`}>
               <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <span className="text-[12px] text-neutral-400 uppercase font-bold tracking-wider mb-1 block">
              {card.title}
            </span>
            <div className="text-3xl font-black text-neutral-900 tracking-tighter">
              {card.value}
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3" />
              {card.trend}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-border-theme shadow-sm h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg tracking-tight">Grafik Kehadiran Hari Ini ({chartView})</h3>
              <div className="flex gap-2">
                {(['Staf', 'Siswa'] as const).map(t => (
                  <button 
                    key={t} 
                    onClick={() => setChartView(t)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${chartView === t ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} dy={10} />
                  <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Section */}
          <div className="bg-neutral-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-xl shadow-neutral-950/20">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="h-24 w-24" />
            </div>
            <div className="flex items-center gap-3 mb-4">
               <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                  <Sparkles className="text-primary h-5 w-5" />
               </div>
               <h3 className="font-bold text-lg tracking-wider">AI INSIGHTS ANALYST</h3>
            </div>
            {loadingAi ? (
              <div className="flex items-center gap-3 text-neutral-400 italic">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menganalisis data absensi...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
                  {aiInsight || "Tidak cukup data untuk analisis AI hari ini. Pastikan staf sudah mulai melakukan absensi."}
                </p>
              </div>
            )}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 text-[10px] uppercase font-bold tracking-[2px] text-neutral-500">
              <AlertCircle className="h-3 w-3" />
              Powered by Google Gemini AI
            </div>
          </div>
        </div>

        {/* Right Info Panels */}
        <div className="space-y-8">
          {/* Logs Panel */}
          <div className="bg-white rounded-3xl border border-border-theme shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-border-theme bg-[#FAFBFC] flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-widest text-[#90A4AE]">Log Terbaru</h3>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
            <div className="p-2">
              {recentLogs.length > 0 ? recentLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-neutral-50 rounded-2xl transition-all cursor-default group">
                   <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                     {log.profiles?.full_name?.charAt(0)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-neutral-900 truncate">{log.profiles?.full_name}</p>
                      <p className="text-[11px] text-neutral-400 font-medium">{log.check_in_time} • Presensi Masuk</p>
                   </div>
                   <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        log.status === 'hadir' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {log.status}
                      </span>
                   </div>
                </div>
              )) : (
                <div className="p-10 text-center text-neutral-400 italic text-sm">Belum ada absensi hari ini.</div>
              )}
            </div>
          </div>

          {/* Mottos/Stats Section */}
          <div className="bg-white p-8 rounded-3xl border border-border-theme shadow-sm space-y-8">
            <div>
              <p className="text-[11px] font-bold text-[#90A4AE] uppercase tracking-[3px] mb-4">Motto Sekolah</p>
              <h4 className="text-xl font-black text-neutral-900 leading-tight italic">
                "Unggul dalam Prestasi, Terdepan dalam Teknologi."
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-4 rounded-2xl">
                 <p className="text-[20px] font-black text-primary">100%</p>
                 <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Digitalize</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-2xl">
                 <p className="text-[20px] font-black text-primary">24/7</p>
                 <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
