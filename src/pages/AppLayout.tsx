import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  ClipboardCheck, 
  UsersRound, 
  Settings, 
  LogOut, 
  ChevronDown,
  GraduationCap
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function AppLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [rekapOpen, setRekapOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const role = profile?.role || 'guru';

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/app', roles: ['admin', 'guru', 'kependidikan'] },
    { label: 'Absensi Karyawan', icon: UserCheck, path: '/app/absensi-karyawan', roles: ['admin', 'guru', 'kependidikan'] },
    { label: 'Absensi Siswa', icon: ClipboardCheck, path: '/app/absensi-siswa', roles: ['admin', 'guru'] },
    { label: 'Data Siswa', icon: Users, path: '/app/data-siswa', roles: ['admin'] },
    { label: 'User Management', icon: Settings, path: '/app/user-management', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-100">
          <Link to="/app" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <GraduationCap className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">SMK Prima Unggul</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                location.pathname === item.path 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-neutral-500 hover:bg-neutral-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}

          {/* Rekap Submenu */}
          {['admin', 'guru'].includes(role) && (
            <div className="space-y-1">
              <button 
                onClick={() => setRekapOpen(!rekapOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-neutral-500 hover:bg-neutral-100",
                  (location.pathname.includes('rekap-siswa') || location.pathname.includes('rekap-karyawan')) && "bg-neutral-50 text-neutral-900 font-bold"
                )}
              >
                <div className="flex items-center gap-3">
                  <UsersRound className="h-5 w-5" />
                  Rekap Absensi
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", rekapOpen && "rotate-180")} />
              </button>
              
              {(rekapOpen || location.pathname.includes('rekap')) && (
                <div className="pl-12 space-y-1">
                  <Link 
                    to="/app/rekap-siswa" 
                    className={cn(
                      "block py-2 text-sm transition-all",
                      location.pathname === '/app/rekap-siswa' ? "text-primary font-bold" : "text-neutral-500 hover:text-neutral-900"
                    )}
                  >
                    Rekap Siswa
                  </Link>
                  {role === 'admin' && (
                    <Link 
                      to="/app/rekap-karyawan" 
                      className={cn(
                        "block py-2 text-sm transition-all",
                        location.pathname === '/app/rekap-karyawan' ? "text-primary font-bold" : "text-neutral-500 hover:text-neutral-900"
                      )}
                    >
                      Rekap Karyawan
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-neutral-100">
          <div className="bg-neutral-50 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold uppercase">
              {profile?.full_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{profile?.full_name}</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{profile?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-neutral-200 px-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-800">
            {filteredMenu.find(m => m.path === location.pathname)?.label || 
              (location.pathname.includes('rekap-siswa') ? 'Rekap Absensi Siswa' : 
               location.pathname.includes('rekap-karyawan') ? 'Rekap Absensi Karyawan' : 'Aplikasi')}
          </h2>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 px-4 py-2 rounded-xl text-neutral-700 transition-all font-medium text-sm"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
