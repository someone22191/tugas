import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle2, UserCheck, Clock, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate, formatTime } from '../lib/utils';

export default function AttendanceEmployee() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    checkTodayAttendance();
    return () => clearInterval(timer);
  }, []);

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

  const handleAttendance = async (status: 'hadir' | 'izin' | 'sakit') => {
    if (!profile) return;
    setLoading(true);

    const { error } = await supabase
      .from('attendance_employees')
      .upsert({
        user_id: profile.id,
        date: formatDate(new Date()),
        status,
        check_in_time: formatTime(new Date())
      });

    if (!error) {
      checkTodayAttendance();
    }
    setLoading(false);
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
        <div className="grid sm:grid-columns-3 gap-6">
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
    </div>
  );
}
