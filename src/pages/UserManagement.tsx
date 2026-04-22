import React, { useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import { UserPlus, Search, Trash2, Edit2, Loader2, X, Check, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    full_name: '', 
    role: 'guru' as any 
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('full_name');
    if (data) setUsers(data);
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editingUser) {
        // Update local profile first
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: formData.full_name, role: formData.role })
          .eq('id', editingUser.id);
        
        if (error) throw error;
        setIsModalOpen(false);
        fetchUsers();
      } else {
        // Call our server API for admin user creation (which syncs with Auth)
        const res = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await res.json();
        
        if (!res.ok) throw new Error(result.error);
        
        setIsModalOpen(false);
        fetchUsers();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (confirm('PERINGATAN: Menghapus user akan menghapus data login dan profil selamanya. Lanjutkan?')) {
      setActionLoading(true);
      try {
        const res = await fetch(`/api/admin/delete-user/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        fetchUsers();
      } catch (err: any) {
        alert('Error: ' + err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold">Kelola Pengguna</h1>
          <p className="text-neutral-500 text-sm">Tambah guru, admin, atau tenaga kependidikan baru.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setFormData({ email: '', password: '', full_name: '', role: 'guru' }); setIsModalOpen(true); }}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-primary/10"
        >
          <UserPlus className="h-5 w-5" />
          Tambah User
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-8 py-4 font-bold">User</th>
              <th className="px-8 py-4 font-bold">Role</th>
              <th className="px-8 py-4 font-bold">Email</th>
              <th className="px-8 py-4 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-primary">
                      {user.full_name?.charAt(0)}
                    </div>
                    <span className="font-bold">{user.full_name}</span>
                  </div>
                </td>
                <td className="px-8 py-4">
                   <span className={cn(
                     "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                     user.role === 'admin' ? "bg-red-50 text-red-600 border-red-100" :
                     user.role === 'guru' ? "bg-blue-50 text-blue-600 border-blue-100" :
                     "bg-neutral-100 text-neutral-600 border-neutral-200"
                   )}>
                     {user.role}
                   </span>
                </td>
                <td className="px-8 py-4 text-neutral-500 text-sm">{user.email}</td>
                <td className="px-8 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => { setEditingUser(user); setFormData({ email: user.email, password: '', full_name: user.full_name, role: user.role }); setIsModalOpen(true); }}
                      className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => deleteUser(user.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>}

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
                <h3 className="font-bold text-xl">{editingUser ? 'Edit Profil User' : 'Tambah User Auth Baru'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {!editingUser && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-400 uppercase">Email</label>
                      <input required type="email" className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-400 uppercase">Password</label>
                      <input required type="password" underline className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                      <p className="text-[10px] text-neutral-400 mt-1">*Minimal 6 karakter</p>
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase">Nama Lengkap</label>
                  <input required className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase">Peran (Role)</label>
                  <select className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                    <option value="admin">Admin</option>
                    <option value="guru">Guru</option>
                    <option value="kependidikan">Tenaga Kependidikan</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 border border-neutral-200 rounded-xl font-bold bg-neutral-50">Tutup</button>
                  <button disabled={actionLoading} type="submit" className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                    {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ShieldCheck className="h-5 w-5" /> {editingUser ? 'Simpan' : 'Daftarkan'}</>}
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
