import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input } from '../../components/ui/Base';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Phone, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'tutor' | 'admin'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, role }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      
      login(data.token, data.user);
      navigate(`/${role}/dashboard`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-red-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-slate-50 rounded-full blur-3xl opacity-50" />

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-sleek border border-slate-100 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-200">
            <LogIn className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Nexus<span className="text-red-600">Portal</span></h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Management System v2.0</p>
        </div>

        <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 border border-slate-100">
          {(['student', 'tutor', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl capitalize transition-all ${
                role === r ? 'bg-white text-red-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Identification</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="07X XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-12 h-12 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Token</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-12 text-sm"
                required
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[10px] font-bold text-red-600 text-center uppercase tracking-wider"
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" className="w-full h-12 text-xs font-black uppercase tracking-widest shadow-lg shadow-red-100" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In Securely'}
          </Button>
        </form>

        {role === 'student' && (
          <div className="mt-10 text-center pt-8 border-t border-slate-50">
            <p className="text-xs text-slate-500 font-medium">
              New to the platform?{' '}
              <Link to="/register" className="text-red-600 font-black hover:underline ml-1">
                Establish Account
              </Link>
            </p>
          </div>
        )}
        
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-300 text-[10px] uppercase tracking-widest font-black">
          <ShieldCheck className="w-3 h-3" />
          <span>Encrypted Session</span>
        </div>
      </motion.div>
    </div>
  );
}
