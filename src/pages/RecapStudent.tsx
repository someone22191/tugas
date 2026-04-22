import { useState, useEffect } from 'react';
import { supabase, Student, AttendanceStudent } from '../lib/supabase';
import { Search, Filter, FileSpreadsheet, Loader2, Calendar } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

export default function RecapStudent() {
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('X TKJ');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [recapData, setRecapData] = useState<any[]>([]);

  const classes = ['X TKJ', 'X DKV', 'X AK', 'X BC', 'X MPLB', 'X BD', 'XI TKJ', 'XI DKV', 'XI AK', 'XI BC', 'XI MPLB', 'XI BD', 'XII TKJ', 'XII DKV', 'XII AK', 'XII BC', 'XII MPLB', 'XII BD'];

  useEffect(() => {
    fetchRecap();
  }, [selectedClass, selectedDate]);

  async function fetchRecap() {
    setLoading(true);
    
    // 1. Get all students in class
    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('class_name', selectedClass)
      .order('name');

    if (students) {
      // 2. Get attendance for these students on selected date
      const { data: attendance } = await supabase
        .from('attendance_students')
        .select(`
          *,
          teacher:profiles(full_name)
        `)
        .eq('date', selectedDate)
        .in('student_id', students.map(s => s.id));

      const combined = students.map(s => {
        const att = attendance?.find(a => a.student_id === s.id);
        return {
          ...s,
          attendance: att || null
        };
      });

      setRecapData(combined);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-border-theme shadow-sm grid md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <label className="text-[12px] font-bold text-[#90A4AE] uppercase flex items-center gap-1 mt-1 tracking-wider">
            <Filter className="h-3 w-3" /> Filter Kelas
          </label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full font-bold text-[16px] outline-none bg-transparent"
          >
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[12px] font-bold text-[#90A4AE] uppercase flex items-center gap-1 mt-1 tracking-wider">
            <Calendar className="h-3 w-3" /> Tanggal Absensi
          </label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full font-bold text-[16px] outline-none bg-transparent"
          />
        </div>

        <div className="flex items-end">
          <button className="w-full bg-[#4CAF50] text-white px-6 py-2.5 rounded-md font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all text-[14px]">
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-8 py-4 font-bold">Siswa</th>
              <th className="px-8 py-4 font-bold">Status</th>
              <th className="px-8 py-4 font-bold">Guru Pengabsen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {recapData.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-8 py-4">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">{item.nis}</p>
                </td>
                <td className="px-8 py-4">
                  {item.attendance ? (
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      item.attendance.status === 'hadir' ? "bg-green-50 text-green-600 border border-green-100" :
                      item.attendance.status === 'sakit' ? "bg-orange-50 text-orange-600 border border-orange-100" :
                      item.attendance.status === 'izin' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                      "bg-red-50 text-red-600 border border-red-100"
                    )}>
                      {item.attendance.status}
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-300 italic">Belum Diabsen</span>
                  )}
                </td>
                <td className="px-8 py-4 text-sm text-neutral-500">
                  {item.attendance?.teacher?.full_name || '-'}
                </td>
              </tr>
            ))}
            {recapData.length === 0 && !loading && (
              <tr>
                <td colSpan={3} className="px-8 py-12 text-center text-neutral-400">Pilih kelas dan tanggal untuk melihat rekap.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <div className="flex justify-center p-12"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}
    </div>
  );
}
