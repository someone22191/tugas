import React, { useState, useEffect } from 'react';
import { supabase, Student } from '../lib/supabase';
import { Plus, Search, Trash2, Edit2, Loader2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function StudentData() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ nis: '', name: '', class_name: '' });

  const classes = ['X TKJ', 'X DKV', 'X AK', 'X BC', 'X MPLB', 'X BD', 'XI TKJ', 'XI DKV', 'XI AK', 'XI BC', 'XI MPLB', 'XI BD', 'XII TKJ', 'XII DKV', 'XII AK', 'XII BC', 'XII MPLB', 'XII BD'];

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    const { data } = await supabase.from('students').select('*').order('name');
    if (data) setStudents(data);
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editingStudent) {
      const { error } = await supabase.from('students').update(formData).eq('id', editingStudent.id);
      if (!error) {
        setEditingStudent(null);
        setIsModalOpen(false);
        fetchStudents();
      }
    } else {
      const { error } = await supabase.from('students').insert([formData]);
      if (!error) {
        setIsModalOpen(false);
        fetchStudents();
      }
    }
    setLoading(false);
  };

  const deleteStudent = async (id: string) => {
    if (confirm('Hapus data siswa ini?')) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (!error) fetchStudents();
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search) ||
    s.class_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Cari NIS, nama, atau kelas..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setEditingStudent(null); setFormData({ nis: '', name: '', class_name: classes[0] }); setIsModalOpen(true); }}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-primary/10"
        >
          <Plus className="h-5 w-5" />
          Tambah Siswa
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold">NIS</th>
              <th className="px-6 py-4 font-bold">Nama Lengkap</th>
              <th className="px-6 py-4 font-bold">Kelas</th>
              <th className="px-12 py-4 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm">{student.nis}</td>
                <td className="px-6 py-4 font-bold">{student.name}</td>
                <td className="px-6 py-4">
                  <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-bold">
                    {student.class_name}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => { setEditingStudent(student); setFormData({ nis: student.nis, name: student.name, class_name: student.class_name }); setIsModalOpen(true); }}
                      className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => deleteStudent(student.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                  Data siswa tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                <h3 className="font-bold text-xl">{editingStudent ? 'Edit Siswa' : 'Tambah Siswa Baru'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">NIS (Nomor Induk Siswa)</label>
                    <input 
                      required 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.nis}
                      onChange={e => setFormData({...formData, nis: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Lengkap Siswa</label>
                    <input 
                      required 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kelas</label>
                    <select 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.class_name}
                      onChange={e => setFormData({...formData, class_name: e.target.value})}
                    >
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 border border-neutral-200 rounded-xl font-bold hover:bg-neutral-50">Batal</button>
                  <button disabled={loading} type="submit" className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Check className="h-5 w-5" /> {editingStudent ? 'Simpan' : 'Tambah'}</>}
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
