import { useState, useEffect } from 'react';
import { supabase, Student, type AttendanceStudent as AttendanceStudentType } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { Search, Loader2, Save, Filter, Check, X } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { motion } from 'motion/react';

export default function AttendanceStudent() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedClass, setSelectedClass] = useState('X TKJ');
  const [attendance, setAttendance] = useState<Record<string, 'hadir' | 'izin' | 'sakit' | 'alfa'>>({});
  const [todayAttendance, setTodayAttendance] = useState<AttendanceStudentType[]>([]);

  const classes = ['X TKJ', 'X DKV', 'X AK', 'X BC', 'X MPLB', 'X BD', 'XI TKJ', 'XI DKV', 'XI AK', 'XI BC', 'XI MPLB', 'XI BD', 'XII TKJ', 'XII DKV', 'XII AK', 'XII BC', 'XII MPLB', 'XII BD'];

  useEffect(() => {
    fetchData();
  }, [selectedClass]);

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <Filter className="text-primary h-6 w-6" />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-1">Filter Kelas</label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="font-bold text-lg outline-none bg-transparent"
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-neutral-500">
           <span className="font-bold text-neutral-900">{students.length} Siswa</span> di kelas ini
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
    </div>
  );
}
