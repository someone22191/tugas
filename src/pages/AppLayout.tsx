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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    <div className="flex h-screen bg-neutral-50 overflow-hidden relative">
      {/* Sidebar */}
      <aside className={cn(
        "w-[260px] bg-white border-r border-border-theme flex flex-col shadow-sm transition-all duration-300 ease-in-out z-50",
        !isSidebarOpen && "-ml-[260px]"
      )}>
        <div className="p-6 border-b border-border-theme flex items-center justify-between gap-3">
          <Link to="/app" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              U
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[11px] leading-tight text-primary uppercase">SMK PRIMA</span>
              <span className="font-bold text-[11px] leading-tight text-primary uppercase">UNGGUL</span>
            </div>
          </Link>
          
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-primary transition-colors"
            title="Tutup Menu"
          >
            <LogOut className="h-4 w-4 rotate-180" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto pt-6 pb-4">
          <div className="px-4 space-y-1">
            {filteredMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 transition-all text-[14px]",
                  location.pathname === item.path 
                    ? "bg-primary-light text-primary border-r-4 border-primary font-semibold" 
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-primary"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Rekap Submenu */}
          {['admin', 'guru'].includes(role) && (
            <div className="px-4 mt-2">
              <button 
                onClick={() => setRekapOpen(!rekapOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-6 py-3 transition-all text-[14px] text-neutral-500 hover:bg-neutral-50",
                  (location.pathname.includes('rekap-siswa') || location.pathname.includes('rekap-karyawan')) && "text-primary font-semibold"
                )}
              >
                <div className="flex items-center gap-3">
                  <UsersRound className="h-5 w-5" />
                  Rekap Absensi
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", rekapOpen && "rotate-180")} />
              </button>
              
              {(rekapOpen || location.pathname.includes('rekap')) && (
                <div className="pl-14 pt-1 space-y-1">
                  <Link 
                    to="/app/rekap-siswa" 
                    className={cn(
                      "block py-2 text-[13px] transition-all",
                      location.pathname === '/app/rekap-siswa' ? "text-primary font-semibold" : "text-neutral-500 hover:text-primary"
                    )}
                  >
                    Rekap Siswa
                  </Link>
                  {role === 'admin' && (
                    <Link 
                      to="/app/rekap-karyawan" 
                      className={cn(
                        "block py-2 text-[13px] transition-all",
                        location.pathname === '/app/rekap-karyawan' ? "text-primary font-semibold" : "text-neutral-500 hover:text-primary"
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

        <div className="p-6 border-t border-border-theme">
          <div className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">
            Admin Mode: <span className="text-primary font-bold">Active v1.0.4</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="h-[64px] bg-white border-b border-border-theme px-8 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-neutral-100 rounded-lg text-primary transition-colors border border-primary/20"
                title="Buka Menu"
              >
                <LayoutDashboard className="h-5 w-5" />
              </button>
            )}
            <div className="text-[13px] text-neutral-400 font-medium">
              Dashboard / <span className="capitalize">{location.pathname.split('/').pop() || 'Overview'}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-[14px] font-bold leading-tight">{profile?.full_name}</div>
              <div className="text-[11px] text-neutral-400">{profile?.email}</div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="px-4 py-2 border border-primary text-primary rounded-md text-[13px] font-semibold hover:bg-primary hover:text-white transition-all"
            >
              Log Out
            </button>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
