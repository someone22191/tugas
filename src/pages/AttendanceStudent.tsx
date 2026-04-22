import { useState, useEffect } from 'react';
import { supabase, Student, type AttendanceStudent as AttendanceStudentType } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { Search, Loader2, Save, Filter, Check, X, UserPlus } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AttendanceStudent() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedClass, setSelectedClass] = useState('X TKJ');
  const [attendance, setAttendance] = useState<Record<string, 'hadir' | 'izin' | 'sakit' | 'alfa'>>({});
  const [todayAttendance, setTodayAttendance] = useState<AttendanceStudentType[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ nis: '', name: '' });
  const [addLoading, setAddLoading] = useState(false);

  const classes = ['X TKJ', 'X DKV', 'X AK', 'X BC', 'X MPLB', 'X BD', 'XI TKJ', 'XI DKV', 'XI AK', 'XI BC', 'XI MPLB', 'XI BD', 'XII TKJ', 'XII DKV', 'XII AK', 'XII BC', 'XII MPLB', 'XII BD'];

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [selectedClass, profile]);

  async function fetchData() {
    setLoading(true);
    const today = formatDate(new Date());

    // 1. Fetch students in class
    const { data: studentData } = await supabase
      .from('students')
      .select('*')
      .eq('class_name', selectedClass)
      .order('name');
    
    if (studentData) {
      setStudents(studentData);
      
      // 2. Fetch today's attendance records
      const { data: attendanceData } = await supabase
        .from('attendance_students')
        .select('*')
        .eq('date', today)
        .in('student_id', studentData.map(s => s.id));

      if (attendanceData) {
        setTodayAttendance(attendanceData);
        const attMap: any = {};
        studentData.forEach(s => {
          const record = attendanceData.find(a => a.student_id === s.id);
          attMap[s.id] = record ? record.status : 'hadir'; // Default to 'hadir'
        });
        setAttendance(attMap);
      } else {
        const attMap: any = {};
        studentData.forEach(s => attMap[s.id] = 'hadir');
        setAttendance(attMap);
      }
    }
    setLoading(false);
  }

  const handleStatusChange = (studentId: string, status: any) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const today = formatDate(new Date());

    const records = students.map(s => ({
      student_id: s.id,
      teacher_id: profile.id,
      date: today,
      status: attendance[s.id] || 'hadir'
    }));

    const { error } = await supabase
      .from('attendance_students')
      .upsert(records, { onConflict: 'student_id,date' });

    if (!error) {
      alert('Data absensi siswa berhasil disimpan!');
      fetchData();
    } else {
      alert('Gagal menyimpan absensi: ' + error.message);
    }
    setSaving(false);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.nis || !newStudent.name) return;
    setAddLoading(true);
    try {
      const { error } = await supabase.from('students').insert({
        nis: newStudent.nis.trim(),
        name: newStudent.name.trim(),
        class_name: selectedClass
      });
      if (error) throw error;
      
      // Reset
      setNewStudent({ nis: '', name: '' });
      setIsAddModalOpen(false);
      
      // Delay slightly for consistency
      setTimeout(async () => {
        await fetchData();
        setAddLoading(false);
        alert('Siswa berhasil ditambahkan!');
      }, 800);
    } catch (err: any) {
      alert('Gagal menambah siswa: ' + err.message);
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <Filter className="text-primary h-6 w-6" />
          </div>
          <div>
            <label className="text-[12px] font-bold text-[#90A4AE] uppercase tracking-widest block mb-1">Filter Kelas</label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="font-bold text-[16px] outline-none bg-transparent"
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
             <span className="font-bold text-neutral-900 text-[15px]">{students.length} Siswa</span>
             <span className="text-[11px] text-neutral-400 uppercase font-bold tracking-wider">Total Terdaftar</span>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary-light text-primary p-3 rounded-xl hover:bg-primary hover:text-white transition-all border border-primary/10 shadow-sm"
            title="Tambah Siswa Baru ke Kelas Ini"
          >
            <UserPlus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-8 py-4 font-bold">Identitas Siswa</th>
                <th className="px-8 py-4 font-bold text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-lg">{student.name}</p>
                    <p className="text-neutral-400 font-mono text-xs mt-0.5">{student.nis}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                       {['hadir', 'sakit', 'izin', 'alfa'].map((status) => (
                         <button
                           key={status}
                           onClick={() => handleStatusChange(student.id, status)}
                           className={cn(
                             "px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border",
                             attendance[student.id] === status 
                               ? status === 'hadir' ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-200"
                               : status === 'sakit' ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200"
                               : status === 'izin' ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                               : "bg-red-600 text-white border-red-600 shadow-md shadow-red-200"
                               : "bg-white text-neutral-400 border-neutral-200 hover:border-neutral-300"
                           )}
                         >
                           {status}
                         </button>
                       ))}
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && !loading && (
                <tr>
                  <td colSpan={2} className="px-6 py-20 text-center text-neutral-400">
                    Belum ada data siswa untuk kelas ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {students.length > 0 && (
          <div className="p-8 bg-neutral-50 border-t border-neutral-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Simpan Absensi Hari Ini</>}
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center p-20">
           <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      )}

      {/* Modal Tambah Siswa */}
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
                <h3 className="font-bold text-[15px] text-text-main">Tambah Siswa Baru ({selectedClass})</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 hover:bg-neutral-100 rounded-lg"><X className="h-5 w-5 text-neutral-400" /></button>
              </div>
              <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#90A4AE] uppercase tracking-wider">NIS (Nomor Induk Siswa)</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 bg-[#F8F9FA] border border-border-theme rounded-xl outline-none focus:border-primary transition-all text-[14px]"
                    placeholder="Contoh: 12345"
                    value={newStudent.nis}
                    onChange={e => setNewStudent({...newStudent, nis: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#90A4AE] uppercase tracking-widest">Nama Lengkap Siswa</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 bg-[#F8F9FA] border border-border-theme rounded-xl outline-none focus:border-primary transition-all text-[14px]"
                    placeholder="Nama Lengkap Siswa"
                    value={newStudent.name}
                    onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-border-theme rounded-xl font-bold text-[13px] hover:bg-neutral-50 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={addLoading}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold text-[13px] hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    {addLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tambahkan'}
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
