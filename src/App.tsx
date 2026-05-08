import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboardHome from './pages/student/DashboardHome';
import { MyCourses, Store } from './pages/student/StudentPages';
import { Sidebar, BottomNav } from './components/layout/Navigation';

import TutorDashboard from './pages/tutor/TutorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return <>{children}</>;
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={<Navigate to="/student/dashboard/home" />} />
        <Route path="/student/dashboard/*" element={
          <ProtectedRoute roles={['student']}>
            <DashboardLayout>
              <Routes>
                <Route path="home" element={<StudentDashboardHome />} />
                <Route path="courses" element={<MyCourses />} />
                <Route path="settings" element={<div className="p-8 text-2xl font-bold">Settings Coming Soon</div>} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Tutor Routes */}
        <Route path="/tutor/dashboard" element={<Navigate to="/tutor/dashboard/home" />} />
        <Route path="/tutor/dashboard/*" element={
          <ProtectedRoute roles={['tutor']}>
            <DashboardLayout>
              <Routes>
                <Route path="home" element={<TutorDashboard />} />
                <Route path="courses" element={<div className="p-8 text-2xl font-bold">Course Management Coming Soon</div>} />
                <Route path="settings" element={<div className="p-8 text-2xl font-bold">Settings Coming Soon</div>} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<Navigate to="/admin/dashboard/home" />} />
        <Route path="/admin/dashboard/*" element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout>
              <Routes>
                <Route path="home" element={<AdminDashboard />} />
                <Route path="tutors" element={<div className="p-8 text-2xl font-bold">Tutor Management Extended</div>} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/store" element={
           <div className="flex bg-slate-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden"><Store /></main>
            <BottomNav />
          </div>
        } />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}
