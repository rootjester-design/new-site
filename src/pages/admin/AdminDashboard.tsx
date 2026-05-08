import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../../components/ui/Base';
import { ShieldCheck, UserPlus, Users, BookOpen, DollarSign, ArrowUpRight, Search, Edit2, Trash2, Ban } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTutorModal, setShowTutorModal] = useState(false);
  
  const [newTutor, setNewTutor] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(d => {
        setStats(d);
        setLoading(false);
      });
  }, [token]);

  const handleCreateTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/create-tutor', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTutor)
    });
    if (res.ok) {
       alert('Tutor created successfully');
       setShowTutorModal(false);
       setNewTutor({ firstName: '', lastName: '', displayName: '', phone: '', password: '' });
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Restoring system controls...</div>;

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight underline decoration-primary-red decoration-4 transition-all pb-1">Super Admin</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              System Status: Optimal
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowTutorModal(true)}>
            <UserPlus className="w-5 h-5 mr-2" /> Add Tutor
          </Button>
          <Button variant="ghost" className="border border-slate-200">System Logs</Button>
        </div>
      </div>

      {/* Numerical Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsTile label="Total Students" value={stats.totalStudents} icon={Users} color="bg-blue-600" />
        <StatsTile label="Total Tutors" value={stats.totalTutors} icon={UserPlus} color="bg-primary-red" />
        <StatsTile label="Active Courses" value={stats.totalCourses} icon={BookOpen} color="bg-indigo-600" />
        <StatsTile label="Total Revenue" value={`LKR ${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="glass p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">Manage Tutors</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input placeholder="Search tutors..." className="pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary-red/20" />
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Dummy data for visual representation of list */}
              {[1, 2].map(i => (
                <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100" />
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight">Master Tutor {i}</h4>
                      <p className="text-xs text-slate-500 font-medium">9 active courses • 450 students</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-500"><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900"><Ban className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
         </div>

         <div className="glass p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-slate-900 mb-8">Quick System Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <QuickAction label="Banner Settings" icon={BookOpen} color="text-blue-500" />
              <QuickAction label="Announcements" icon={DollarSign} color="text-orange-500" />
              <QuickAction label="Categories" icon={Users} color="text-emerald-500" />
              <QuickAction label="Security Audit" icon={ShieldCheck} color="text-primary-red" />
            </div>
         </div>
      </div>

      {/* Tutor Modal */}
      {showTutorModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl relative">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Create Tutor Account</h2>
            <form onSubmit={handleCreateTutor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" value={newTutor.firstName} onChange={e => setNewTutor({...newTutor, firstName: e.target.value})} required />
                <Input label="Last Name" value={newTutor.lastName} onChange={e => setNewTutor({...newTutor, lastName: e.target.value})} required />
              </div>
              <Input label="Display Name" value={newTutor.displayName} onChange={e => setNewTutor({...newTutor, displayName: e.target.value})} required />
              <Input label="Phone Number" value={newTutor.phone} onChange={e => setNewTutor({...newTutor, phone: e.target.value})} required />
              <Input type="password" label="Initial Password" value={newTutor.password} onChange={e => setNewTutor({...newTutor, password: e.target.value})} required />
              <div className="flex gap-3 mt-6">
                 <Button variant="ghost" type="button" className="flex-1" onClick={() => setShowTutorModal(false)}>Cancel</Button>
                 <Button type="submit" className="flex-[2]">Create Tutor</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatsTile({ label, value, icon: Icon, color }: any) {
  return (
    <div className="p-6 bg-white border border-slate-100 rounded-3xl relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${color} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform`} />
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${color} bg-opacity-10 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-white group-hover:${color} transition-all`}>
           <Icon className="w-5 h-5 flex-shrink-0" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-300" />
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function QuickAction({ label, icon: Icon, color }: any) {
  return (
    <button className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-3xl gap-3 hover:bg-white hover:border-primary-red/20 hover:shadow-lg transition-all group">
      <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{label}</span>
    </button>
  );
}
