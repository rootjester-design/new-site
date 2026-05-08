import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../../components/ui/Base';
import { Users, BookOpen, CreditCard, Plus, Check, X, MoreVertical, Search, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function TutorDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tutor/dashboard', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, [token]);

  const handlePayment = async (id: number, status: 'approved' | 'rejected') => {
    const res = await fetch('/api/tutor/approve-payment', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paymentId: id, status })
    });
    if (res.ok) {
       // Refresh
       const d = await fetch('/api/tutor/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
       setData(d);
    }
  };

  if (loading) return <div className="p-8 animate-pulse space-y-4"><div className="h-20 bg-slate-200 rounded-3xl" /><div className="h-96 bg-slate-200 rounded-3xl" /></div>;

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tutor Command Center</h1>
          <p className="text-slate-500 font-medium">Manage your courses, students and earnings.</p>
        </div>
        <Button className="h-12 px-8">
          <Plus className="w-5 h-5 mr-2" /> Create New Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard label="Students" value={data.studentsCount} trend="Top 2%" trendColor="text-blue-600 bg-blue-50" />
        <StatsCard label="Active Classes" value={data.courses.length} trend="Active" trendColor="text-red-600 bg-red-50" />
        <StatsCard label="Revenue" value="LKR 142k" trend="+8% Month" trendColor="text-green-600 bg-green-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Pending Payments Section */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Awaiting Verification</h3>
            <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider">{data.pendingPayments.length} Pending Slips</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.pendingPayments.length > 0 ? data.pendingPayments.map((p: any) => (
              <div key={p.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{p.first_name} {p.last_name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.course_name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="text-red-600 font-black text-sm">LKR {p.amount}</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handlePayment(p.id, 'approved')}
                      className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <a 
                      href={`/${p.payment_slip}`} 
                      target="_blank" 
                      className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 border border-slate-200/50"
                    >
                      <Search className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium italic">Your verification queue is clear.</p>
              </div>
            )}
          </div>
        </div>

        {/* My Courses Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Managed Content</h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
                <Button variant="ghost" size="sm" className="w-full text-[10px] font-black uppercase tracking-widest">Inventory Settings</Button>
            </div>
            <div className="divide-y divide-slate-50">
              {data.courses.map((c: any) => (
                <div key={c.id} className="p-5 flex gap-4 transition-colors hover:bg-slate-50/50">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                    <img src={c.thumbnail || `https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate text-sm">{c.name}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Users className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase">124</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <CreditCard className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase">Rs. 45k</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-red-600 self-center">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, trend, trendColor }: any) {
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
