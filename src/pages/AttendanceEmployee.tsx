import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle2, UserCheck, Clock, Loader2, UserPlus, X, ShieldCheck, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate, formatTime, cn } from '../lib/utils';

export default function AttendanceEmployee() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Admin Features
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ email: '', password: '', full_name: '', role: 'guru' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    if (profile) {
      checkTodayAttendance();
      if (profile.role === 'admin') {
        fetchAllEmployees();
      }
    }
    return () => clearInterval(timer);
  }, [profile]); // Triggers when profile is loaded

  const fetchAllEmployees = async () => {
    try {
      const today = formatDate(new Date());
      const { data: profiles, error: pError } = await supabase.from('profiles').select('*').order('full_name');
      const { data: attendance, error: aError } = await supabase.from('attendance_employees').select('*').eq('date', today);

      if (pError) throw pError;

      if (profiles) {
        const combined = profiles.map(p => ({
          ...p,
          todayStatus: attendance?.find(a => a.user_id === p.id)?.status || 'belum'
        }));
        setAllEmployees(combined);
      }
    } catch (err: any) {
      console.error('Error fetching employees:', err.message);
    }
  };

  const checkTodayAttendance = async () => {
    const today = formatDate(new Date());
    const { data } = await supabase
      .from('attendance_employees')
      .select('*')
      .eq('user_id', profile?.id)
      .eq('date', today)
      .single();
    
    if (data) setAlreadyCheckedIn(data);
  };

  const handleAttendance = async (status: 'hadir' | 'izin' | 'sakit' | 'alfa', targetUserId?: string) => {
    const userId = targetUserId || profile?.id;
    if (!userId) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('attendance_employees')
        .upsert({
          user_id: userId,
          date: formatDate(new Date()),
          status,
          check_in_time: formatTime(new Date())
        }, { onConflict: 'user_id,date' });

      if (error) throw error;
      
      await checkTodayAttendance();
      if (profile?.role === 'admin') {
        await fetchAllEmployees();
      }
    } catch (err: any) {
      alert('Gagal mencatat absensi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      // Immediate fetch with small delay to ensure DB consistency
      setTimeout(async () => {
        await fetchData();
        setActionLoading(false);
        setIsAddModalOpen(false);
        setNewEmployee({ email: '', password: '', full_name: '', role: 'guru' });
        alert('Karyawan ' + newEmployee.full_name + ' berhasil ditambahkan!');
      }, 1000);
    } catch (err: any) {
      alert('Error: ' + err.message);
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm text-center">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="text-primary h-10 w-10" />
        </div>
        <h2 className="text-4xl font-bold tracking-tighter">{formatTime(currentTime)}</h2>
        <p className="text-neutral-500 font-medium mt-1">{formatDate(currentTime)}</p>
      </div>

      {alreadyCheckedIn ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-100 p-10 rounded-3xl text-center"
        >
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-800">Presensi Berhasil Dikirim</h3>
          <p className="text-green-600 mt-2">
            Status: <span className="font-bold uppercase">{alreadyCheckedIn.status}</span> 
            {alreadyCheckedIn.check_in_time && ` • Jam: ${alreadyCheckedIn.check_in_time}`}
          </p>
          <p className="text-neutral-400 text-xs mt-6">Anda sudah melakukan presensi hari ini.</p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-6">
          <button
            onClick={() => handleAttendance('hadir')}
            disabled={loading}
            className="group bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm hover:border-green-500 hover:shadow-lg hover:shadow-green-500/10 transition-all flex flex-col items-center gap-4 group"
          >
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
              <UserCheck className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">Hadir</p>
              <p className="text-xs text-neutral-400 mt-1">Masuk kerja normal</p>
            </div>
          </button>

          <button
            onClick={() => handleAttendance('izin')}
            disabled={loading}
            className="group bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Loader2 className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">Izin</p>
              <p className="text-xs text-neutral-400 mt-1">Keperluan mendesak</p>
            </div>
          </button>

          <button
            onClick={() => handleAttendance('sakit')}
            disabled={loading}
            className="group bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
              <Loader2 className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">Sakit</p>
              <p className="text-xs text-neutral-400 mt-1">Kurang sehat hari ini</p>
            </div>
          </button>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="font-bold text-primary">Mengirim Presensi...</p>
          </div>
        </div>
      )}

      {/* Admin Management Section */}
      {profile?.role === 'admin' && (
        <div className="space-y-6 pt-10 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-border-theme shadow-sm gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary-light p-3 rounded-xl">
                 <UserPlus className="text-primary h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-text-main">Kelola Kehadiran Staf</h3>
                <p className="text-[12px] text-neutral-400 font-medium">Administrator Panel • Total {allEmployees.length} Karyawan</p>
              </div>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-primary/10"
            >
              <UserPlus className="h-4 w-4" /> Tambah Karyawan Baru
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-border-theme overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-[#FAFBFC] text-[#90A4AE] uppercase tracking-wider border-b border-border-theme font-bold text-[11px]">
                   <tr>
                     <th className="px-6 py-4">Karyawan</th>
                     <th className="px-6 py-4">Jabatan</th>
                     <th className="px-6 py-4 text-center">Status Kehadiran Hari Ini</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#F1F3F5]">
                   {allEmployees.length > 0 ? (
                     allEmployees.map((emp) => (
                       <tr key={emp.id} className="hover:bg-neutral-50 transition-colors">
                         <td className="px-6 py-4">
                            <div className="font-bold text-text-main text-[14px]">{emp.full_name}</div>
                            <div className="text-[11px] text-neutral-400 font-mono">{emp.email}</div>
                         </td>
                         <td className="px-6 py-4">
                            <span className="bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-neutral-200">
                              {emp.role}
                            </span>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex justify-center flex-wrap gap-1.5">
                              {['hadir', 'sakit', 'izin', 'alfa'].map((st) => (
                                <button
                                  key={st}
                                  disabled={loading}
                                  onClick={() => handleAttendance(st as any, emp.id)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border min-w-[60px]",
                                    emp.todayStatus === st
                                      ? st === 'hadir' ? "bg-green-600 text-white border-green-600 shadow-sm"
                                      : st === 'sakit' ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                      : st === 'izin' ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                      : "bg-red-600 text-white border-red-600 shadow-sm"
                                      : "bg-white text-neutral-400 border-neutral-200 hover:border-neutral-300 hover:text-primary"
                                  )}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                         </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                       <td colSpan={3} className="px-6 py-10 text-center text-neutral-400 italic">
                         Memuat data karyawan...
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Karyawan */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-border-theme"
            >
              <div className="px-6 py-4 border-b border-border-theme flex justify-between items-center bg-[#FAFBFC]">
                <h3 className="font-bold text-[15px] text-text-main text-primary uppercase tracking-wider">Register Karyawan Baru</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 hover:bg-neutral-100 rounded-lg"><X className="h-5 w-5 text-neutral-400" /></button>
              </div>
              <form onSubmit={handleAddEmployee} className="p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#90A4AE] uppercase tracking-wider">Email Akun</label>
                  <input required type="email" className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-border-theme rounded-xl outline-none focus:border-primary text-sm" placeholder="email@sekolah.sch.id" value={newEmployee.email} onChange={e => setNewEmployee({...newEmployee, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#90A4AE] uppercase tracking-wider">Password (Min 6 Karakter)</label>
                  <input required type="password" minLength={6} className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-border-theme rounded-xl outline-none focus:border-primary text-sm" placeholder="••••••••" value={newEmployee.password} onChange={e => setNewEmployee({...newEmployee, password: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#90A4AE] uppercase tracking-wider">Nama Lengkap</label>
                  <input required className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-border-theme rounded-xl outline-none focus:border-primary text-sm" placeholder="Nama Lengkap" value={newEmployee.full_name} onChange={e => setNewEmployee({...newEmployee, full_name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#90A4AE] uppercase tracking-wider">Jabatan / Role</label>
                  <select required className="w-full px-4 py-2.5 bg-[#F8F9FA] border border-border-theme rounded-xl outline-none focus:border-primary text-sm font-bold" value={newEmployee.role} onChange={e => setNewEmployee({...newEmployee, role: e.target.value as any})}>
                    <option value="guru">Guru</option>
                    <option value="kependidikan">Tenaga Kependidikan</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-6 py-3 border border-border-theme rounded-xl font-bold text-[13px] hover:bg-neutral-50">Batal</button>
                  <button disabled={actionLoading} type="submit" className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold text-[13px] hover:bg-black transition-all flex items-center justify-center gap-2">
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShieldCheck className="h-4 w-4" /> Daftarkan</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
