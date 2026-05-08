import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input } from '../../components/ui/Base';
import { Phone, User, Calendar, MapPin, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Register() {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Form
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    firstName: '',
    lastName: '',
    birthday: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp: formData.otp })
      });
      if (!res.ok) throw new Error('Invalid OTP');
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-red-50 rounded-full blur-3xl opacity-50" />
      
      <motion.div 
        layout
        className="w-full max-w-xl bg-white p-10 rounded-[2.5rem] shadow-sleek border border-slate-100 relative z-10"
      >
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">Create <span className="text-red-600">Account</span></h1>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">Status: Step {step} of 3</p>
          </div>
          <div className="flex gap-1.5 bg-slate-50 p-1 rounded-full">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 w-6 rounded-full transition-all duration-500 ${s <= step ? 'bg-red-600' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRequestOTP}
              className="space-y-8"
            >
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-5">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-600 border border-slate-100/50">
                  <Phone className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Cellular Link</h3>
                  <p className="text-xs text-slate-400 font-medium">Verify your primary identification number</p>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Universal Phone Number</label>
                <Input
                  placeholder="077-XXXXXXX"
                  value={formData.phone}
                  onChange={e => updateForm('phone', e.target.value)}
                  className="h-12 text-sm px-6"
                  required
                />
              </div>

              <Button type="submit" className="w-full group h-12 text-xs font-black uppercase tracking-widest shadow-lg shadow-red-100" disabled={loading}>
                {loading ? 'Processing...' : 'Request Credentials'}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOTP}
              className="space-y-8"
            >
              <div className="text-center space-y-2 py-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Verification Code</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{formData.phone}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center block">One-Time Passcode</label>
                <Input
                  placeholder="000 000"
                  maxLength={6}
                  value={formData.otp}
                  onChange={e => updateForm('otp', e.target.value)}
                  className="h-16 text-center text-3xl font-black tracking-[0.5em] focus:bg-red-50/50"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-12 text-xs font-black uppercase tracking-widest shadow-lg shadow-red-100" disabled={loading}>
                {loading ? 'Validating...' : 'Unlock Form'}
              </Button>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors"
              >
                Reconnect Number
              </button>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleRegister}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                    <Input value={formData.firstName} onChange={e => updateForm('firstName', e.target.value)} required className="h-11 text-sm" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                    <Input value={formData.lastName} onChange={e => updateForm('lastName', e.target.value)} required className="h-11 text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Birth Date</label>
                <Input type="date" value={formData.birthday} onChange={e => updateForm('birthday', e.target.value)} required className="h-11 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Physical Address</label>
                <Input value={formData.address} onChange={e => updateForm('address', e.target.value)} required className="h-11 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Master Password</label>
                    <Input type="password" value={formData.password} onChange={e => updateForm('password', e.target.value)} required className="h-11 text-sm" />
                </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verify Pass</label>
                    <Input type="password" value={formData.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} required className="h-11 text-sm" />
                </div>
              </div>

              <Button type="submit" className="w-full h-14 mt-6 text-xs font-black uppercase tracking-widest shadow-xl shadow-red-100" disabled={loading}>
                {loading ? 'Initializing Profile...' : 'Establish Membership'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {error && <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-red-600 text-center">{error}</p>}

        <div className="mt-10 text-center border-t border-slate-50 pt-8">
          <p className="text-xs text-slate-500 font-medium">
            Member of NexusLMS? <Link to="/login" className="text-red-600 font-black hover:underline ml-1">Access Portal</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
