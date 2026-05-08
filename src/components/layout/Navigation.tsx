import React from 'react';
import { Home, BookOpen, ShoppingBag, Settings, LogOut, User } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Base';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: `/${user?.role}/dashboard/home` },
    { icon: BookOpen, label: 'My Courses', path: `/${user?.role}/dashboard/courses` },
    { icon: ShoppingBag, label: 'Course Store', path: '/store' },
    { icon: Settings, label: 'Settings', path: `/${user?.role}/dashboard/settings` },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-slate-100 sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
        <span className="text-xl font-bold tracking-tight text-slate-900">Nexus<span className="text-red-600">LMS</span></span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all
              ${isActive ? 'bg-red-50 text-red-600' : 'text-slate-500 hover:bg-slate-50'}
            `}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 space-y-4">
        <div className="card-dark">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-600 rounded-full opacity-20"></div>
          <p className="text-xs font-medium text-slate-400">Standard Tier</p>
          <p className="text-sm font-bold mt-1">Upgrade for Certificate</p>
          <button className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">View Plans</button>
        </div>

        <div className="flex items-center gap-3 py-4 border-t border-slate-100">
           <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-red-600 ring-offset-2">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="Profile" />
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-xs font-bold text-slate-900 truncate">{user?.firstName} {user?.lastName}</p>
             <p className="text-[10px] text-slate-400 font-medium uppercase">{user?.role}</p>
           </div>
           <button onClick={handleLogout} className="text-slate-400 hover:text-red-600">
             <LogOut className="w-4 h-4" />
           </button>
        </div>
      </div>
    </aside>
  );
};

export const BottomNav = () => {
  const { user } = useAuth();
  const navItems = [
    { icon: Home, label: 'Home', path: `/${user?.role}/dashboard/home` },
    { icon: BookOpen, label: 'Courses', path: `/${user?.role}/dashboard/courses` },
    { icon: ShoppingBag, label: 'Store', path: '/store' },
    { icon: Settings, label: 'Settings', path: `/${user?.role}/dashboard/settings` },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 flex items-center justify-between z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `
            flex flex-col items-center gap-1 transition-all
            ${isActive ? 'text-primary-red' : 'text-slate-400'}
          `}
        >
          <item.icon className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
