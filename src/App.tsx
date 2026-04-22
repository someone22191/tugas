import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AppLayout from './pages/AppLayout';
import Dashboard from './pages/Dashboard';
import AttendanceEmployee from './pages/AttendanceEmployee';
import AttendanceStudent from './pages/AttendanceStudent';
import RecapEmployee from './pages/RecapEmployee';
import RecapStudent from './pages/RecapStudent';
import StudentData from './pages/StudentData';
import UserManagement from './pages/UserManagement';

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const { session, profile, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/app" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/app" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="absensi-karyawan" element={<AttendanceEmployee />} />
            
            {/* Guru & Admin routes */}
            <Route path="absensi-siswa" element={
              <ProtectedRoute roles={['admin', 'guru']}>
                <AttendanceStudent />
              </ProtectedRoute>
            } />
            <Route path="rekap-siswa" element={
              <ProtectedRoute roles={['admin', 'guru']}>
                <RecapStudent />
              </ProtectedRoute>
            } />

            {/* Admin only routes */}
            <Route path="rekap-karyawan" element={
              <ProtectedRoute roles={['admin']}>
                <RecapEmployee />
              </ProtectedRoute>
            } />
            <Route path="data-siswa" element={
              <ProtectedRoute roles={['admin']}>
                <StudentData />
              </ProtectedRoute>
            } />
            <Route path="user-management" element={
              <ProtectedRoute roles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
