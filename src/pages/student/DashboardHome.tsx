import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Clock, Bell, DollarSign, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', progress: 40 },
  { name: 'Tue', progress: 55 },
  { name: 'Wed', progress: 48 },
  { name: 'Thu', progress: 70 },
  { name: 'Fri', progress: 85 },
  { name: 'Sat', progress: 75 },
  { name: 'Sun', progress: 90 },
];

export default function StudentDashboardHome() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, [token]);

  if (loading) return (
    <div className="space-y-8 animate-pulse p-8">
      <div className="h-20 bg-slate-200 rounded-3xl w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-slate-200 rounded-3xl" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-16 px-8 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 w-96">
          <Play className="w-4 h-4 text-slate-400 rotate-90" />
          <input type="text" placeholder="Search your courses..." className="bg-transparent border-none outline-none text-sm px-2 w-full text-slate-600 placeholder:text-slate-400" />
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Bell className="w-6 h-6 text-slate-500" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white"></span>
          </div>
          <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider">ST-92841</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden ring-2 ring-red-600 ring-offset-2">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="Profile" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-8 space-y-8 overflow-y-auto pb-24 lg:pb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">Welcome back, <span className="text-red-600 font-black">{user?.firstName}!</span></h1>
            <p className="text-slate-500 mt-1 font-medium italic">"The beautiful thing about learning is that no one can take it from you."</p>
          </div>
          <div className="hidden md:flex gap-3">
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live: 2 sessions today
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Enrolled Courses" value={stats.enrolledCourses.length} trend="+2 new" trendColor="text-green-600 bg-green-50" />
          <StatCard label="Active Hours" value="24.5" trend="Top 5%" trendColor="text-blue-600 bg-blue-50" />
          <StatCard label="Completed" value="3" trend="Keep it up" trendColor="text-slate-400 bg-slate-50" />
          <StatCard label="Total Spent" value={`LKR ${stats.payments.reduce((acc: number, p: any) => acc + p.amount, 0).toLocaleString()}`} trend="Recent: Jan" trendColor="text-red-600 bg-red-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Chart Container */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              Your Study Progress
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded uppercase font-black tracking-widest">Active Week</span>
            </h2>
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="progress" stroke="#DC2626" strokeWidth={3} fillOpacity={1} fill="url(#colorProgress)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: Events / Ads */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Upcoming Events</h2>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="space-y-5">
                {stats.announcements.length > 0 ? stats.announcements.map((ann: any, idx: number) => (
                  <div key={ann.id} className={`flex gap-4 ${idx > 0 ? 'border-t border-slate-50 pt-5' : ''}`}>
                    <div className={`flex-none w-12 h-12 rounded-xl flex flex-col items-center justify-center ${idx === 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                      <span className="text-[10px] font-bold uppercase">FEB</span>
                      <span className="text-lg font-black leading-none">{14 + idx}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{ann.title}</p>
                      <p className="text-xs text-slate-500 font-medium line-clamp-1">{ann.course_name}</p>
                      <p className={`text-[10px] font-bold mt-1 uppercase ${idx === 0 ? 'text-red-600' : 'text-slate-400'}`}>15:00 - 17:00</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-8 text-slate-400 text-sm">No events scheduled</p>
                )}
              </div>
              <button className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xl transition-colors">
                View Calendar
              </button>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-red-600 rounded-full opacity-20 blur-2xl"></div>
              <h3 className="font-bold relative z-10">Advanced Learning</h3>
              <p className="text-xs text-white/60 mb-6 font-medium">Join our global tutor community</p>
              <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest relative z-10 transition-all active:scale-95 shadow-lg shadow-red-600/20">
                Register Tutor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, trendColor }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm glass-hover">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
      <div className={`mt-3 text-[10px] font-black uppercase tracking-widest w-fit px-2 py-0.5 rounded ${trendColor}`}>
        {trend}
      </div>
    </div>
  );
}
