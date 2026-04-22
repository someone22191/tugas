import { useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { FileSpreadsheet, Loader2, Calendar, UserCheck } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { cn } from '../lib/utils';

export default function RecapEmployee() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [recapData, setRecapData] = useState<any[]>([]);

  useEffect(() => {
    fetchRecap();
  }, [selectedDate]);

  async function fetchRecap() {
    setLoading(true);
    
    // 1. Get all employees (exclude super admin if desired)
    const { data: employees } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    if (employees) {
      // 2. Get attendance for selected date
      const { data: attendance } = await supabase
        .from('attendance_employees')
        .select('*')
        .eq('date', selectedDate);

      const combined = employees.map(e => {
        const att = attendance?.find(a => a.user_id === e.id);
        return {
          ...e,
          attendance: att || null
        };
      });

      setRecapData(combined);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <UserCheck className="text-primary h-6 w-6" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-400 uppercase flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Tanggal Rekap
            </label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="font-bold text-lg outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="flex items-center">
          <button className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-100">
            <FileSpreadsheet className="h-5 w-5" />
            Download Laporan Harian
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-8 py-4 font-bold">Karyawan</th>
              <th className="px-8 py-4 font-bold text-center">Status</th>
              <th className="px-8 py-4 font-bold text-center">Jam Absen</th>
              <th className="px-8 py-4 font-bold">Jabatan/Peran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {recapData.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-primary">
                      {item.full_name?.charAt(0)}
                    </div>
                    <span className="font-bold text-sm">{item.full_name}</span>
                  </div>
                </td>
                <td className="px-8 py-4 text-center">
                  {item.attendance ? (
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                      item.attendance.status === 'hadir' ? "bg-green-50 text-green-600 border-green-100" :
                      item.attendance.status === 'sakit' ? "bg-orange-50 text-orange-600 border-orange-100" :
                      item.attendance.status === 'izin' ? "bg-blue-50 text-blue-600 border-blue-100" :
                      "bg-red-50 text-red-600 border-red-100"
                    )}>
                      {item.attendance.status}
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-300 italic">Tanpa Keterangan</span>
                  )}
                </td>
                <td className="px-8 py-4 text-center font-mono text-xs text-neutral-500">
                  {item.attendance?.check_in_time || '--:--'}
                </td>
                <td className="px-8 py-4">
                   <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider bg-neutral-50 px-3 py-1 rounded-full border border-neutral-100">
                     {item.role}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <div className="flex justify-center p-12"><Loader2 className="h-10 w-10 text-primary animate-spin" /></div>}
    </div>
  );
}
