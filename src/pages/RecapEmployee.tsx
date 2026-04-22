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
      <div className="bg-white p-6 rounded-xl border border-border-theme shadow-sm flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary-light p-3 rounded-lg">
            <UserCheck className="text-primary h-6 w-6" />
          </div>
          <div className="space-y-1">
            <label className="text-[12px] font-bold text-[#90A4AE] uppercase flex items-center gap-1 tracking-wider">
              <Calendar className="h-3 w-3" /> Tanggal Rekap
            </label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="font-bold text-[16px] outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="flex items-center">
          <button className="bg-[#4CAF50] text-white px-8 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-md text-[14px]">
            <FileSpreadsheet className="h-4 w-4" />
            Download Laporan Harian
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border-theme shadow-sm overflow-hidden text-[13px]">
        <table className="w-full text-left">
          <thead className="bg-[#FAFBFC] text-[#90A4AE] uppercase tracking-wider border-b border-border-theme">
            <tr>
              <th className="px-8 py-4 font-semibold">Karyawan</th>
              <th className="px-8 py-4 font-semibold text-center">Status</th>
              <th className="px-8 py-4 font-semibold text-center">Jam Absen</th>
              <th className="px-8 py-4 font-semibold">Jabatan/Peran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F3F5]">
            {recapData.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-primary">
                      {item.full_name?.charAt(0)}
                    </div>
                    <span className="font-bold text-text-main">{item.full_name}</span>
                  </div>
                </td>
                <td className="px-8 py-4 text-center">
                  {item.attendance ? (
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider inline-block min-w-[80px]",
                      item.attendance.status === 'hadir' ? "bg-[#E8F5E9] text-[#2E7D32]" :
                      item.attendance.status === 'sakit' ? "bg-[#FFF3E0] text-[#EF6C00]" :
                      item.attendance.status === 'izin' ? "bg-[#FFEBEE] text-[#C62828]" :
                      "bg-[#FFEBEE] text-[#C62828]"
                    )}>
                      {item.attendance.status}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#90A4AE] italic">Tanpa Keterangan</span>
                  )}
                </td>
                <td className="px-8 py-4 text-center font-mono text-xs text-[#90A4AE]">
                  {item.attendance?.check_in_time || '--:--'}
                </td>
                <td className="px-8 py-4 font-medium text-[#607D8B]">
                   <span className="bg-[#F8F9FA] px-2 py-1 rounded text-[11px] border border-border-theme uppercase tracking-wider">
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
