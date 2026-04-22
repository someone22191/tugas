import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { GraduationCap, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-columns-2">
      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="flex flex-col items-center text-center">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-primary p-2 rounded-lg">
                <GraduationCap className="text-white h-6 w-6" />
              </div>
              <span className="font-bold text-xl">SMK Prima Unggul</span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Selamat Datang</h1>
            <p className="text-neutral-500 mt-2">Silakan masuk untuk mengakses sistem absensi</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 ml-1">Email Sekolah</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-neutral-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="email@smkprimaunggul.sch.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-neutral-400" />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Masuk Sekarang'}
            </button>
          </form>

          <p className="text-center text-xs text-neutral-400">
            Masalah saat login? Hubungi IT Support SMK Prima Unggul
          </p>
        </motion.div>
      </div>

      {/* Banner Side */}
      <div className="hidden lg:flex bg-primary items-center justify-center p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        <div className="z-10 text-white max-w-lg">
          <h2 className="text-5xl font-bold leading-tight uppercase tracking-tighter">
            Unggul dalam Prestasi, Terdepan dalam Teknologi.
          </h2>
          <p className="mt-6 text-white/80 text-lg leading-relaxed">
            Sistem informasi terpadu SMK Prima Unggul memudahkan administrasi harian untuk guru dan tenaga kependidikan.
          </p>
        </div>
      </div>
    </div>
  );
}
