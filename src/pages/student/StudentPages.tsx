import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar, BottomNav } from '../../components/layout/Navigation';
import { Input, Button } from '../../components/ui/Base';
import { Search, Filter, Star, Info, Play, FileText, Download, Calendar, MessageSquare, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- My Courses Tab ---
export const MyCourses = () => {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/dashboard', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setCourses(data.enrolledCourses);
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-16 px-8 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-30">
        <h1 className="text-xl font-bold text-slate-900">My Learning Journey</h1>
        <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">{courses.length} Active Enrollments</span>
            <div className="w-8 h-8 rounded-full border-2 border-red-600 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="" />
            </div>
        </div>
      </header>

      <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto pb-24 lg:pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
            >
              <div className="relative h-40 bg-slate-900 group">
                <img src={course.thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800`} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                   <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{course.tutor_name}</p>
                   <h3 className="text-white font-bold truncate">{course.name}</h3>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Progress</span>
                    <span className="text-red-600 text-xs">68%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-red-600 h-full transition-all duration-1000" style={{ width: '68%' }} />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                       <Play className="w-4 h-4 text-red-600" />
                       <span className="text-[10px] font-bold text-slate-500 uppercase">Lesson 12 of 32</span>
                   </div>
                   <Button size="sm" className="h-9 px-6 text-xs uppercase tracking-widest font-black" disabled={course.enrollment_status !== 'active'}>
                     {course.enrollment_status === 'active' ? 'Resume' : 'Pending'}
                   </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Store Tab ---
export const Store = () => {
  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const { token, user } = useAuth();
  
  const [enrollData, setEnrollData] = useState({ reference: '', notes: '', slip: null as File | null });

  useEffect(() => {
    Promise.all([
      fetch('/api/store/courses').then(res => res.json()),
      fetch('/api/store/tutors').then(res => res.json())
    ]).then(([c, t]) => {
      setCourses(c);
      setTutors(t);
      setLoading(false);
    });
  }, []);

  const handleEnroll = async () => {
    if (!enrollData.slip || !selectedCourse) return;
    
    const formData = new FormData();
    formData.append('courseId', selectedCourse.id);
    formData.append('amount', selectedCourse.price.toString());
    formData.append('reference', enrollData.reference);
    formData.append('notes', enrollData.notes);
    formData.append('slip', enrollData.slip);

    const res = await fetch('/api/store/enroll', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    if (res.ok) {
      alert('Enrollment requested successfully!');
      setSelectedCourse(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
       <header className="h-16 px-8 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-md sticky top-0 z-30">
        <h1 className="text-xl font-bold text-slate-900">Learning Store</h1>
        <div className="flex items-center gap-6">
            <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 w-64">
              <Search className="w-3 h-3 text-slate-400" />
              <input type="text" placeholder="Search courses..." className="bg-transparent border-none outline-none text-[10px] px-2 w-full text-slate-600" />
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-red-600 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="" />
            </div>
        </div>
      </header>

      <div className="flex-1 p-8 space-y-12 max-w-7xl mx-auto pb-24 lg:pb-8">
        {/* Tutors Section */}
        <section>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
             Master Instructors
             <span className="h-px bg-slate-100 flex-1" />
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scroll-hide">
            {tutors.map((tutor: any) => (
              <motion.div 
                key={tutor.id}
                whileHover={{ y: -4 }}
                className="flex-shrink-0 w-60 bg-white border border-slate-100 p-6 rounded-[2rem] text-center shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl overflow-hidden shadow-sm ring-4 ring-slate-50">
                  <img src={tutor.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tutor.id}`} alt="" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{tutor.display_name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Advanced Tutor</p>
                <div className="flex items-center justify-center gap-0.5 text-red-600 my-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
                <Button variant="outline" size="sm" className="w-full text-[10px] font-black uppercase tracking-widest rounded-xl border-slate-100 hover:bg-slate-50">Details</Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Courses Section */}
        <section>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
             Available Courses
             <span className="h-px bg-slate-100 flex-1" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {courses.map((course: any) => (
              <div key={course.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                <div className="h-44 relative bg-slate-900 overflow-hidden">
                  <img src={course.thumbnail || `https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full shadow-lg">
                    <span className="text-xs font-black text-red-600">LKR {course.price}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                     <div className="w-5 h-5 rounded-full bg-slate-100 border-2 border-red-600/20 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.tutor_id}`} alt="" />
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.tutor_name}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{course.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 h-8 mb-6">{course.description}</p>
                  <div className="flex gap-3">
                    <Button className="flex-1 h-10 text-xs font-black uppercase tracking-widest" onClick={() => setSelectedCourse(course)}>Enroll</Button>
                    <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modal (Improved) */}
        <AnimatePresence>
          {selectedCourse && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative border border-slate-100"
              >
                <div className="space-y-1 mb-8">
                    <h2 className="text-2xl font-black text-slate-900">Secure Enrollment</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">NexusLMS Payment Portal</p>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-red-50 rounded-2xl border border-red-100 text-red-600">
                    <p className="text-xs font-black uppercase tracking-widest leading-loose">
                        Please deposit <span className="text-lg block text-red-700">LKR {selectedCourse.price}</span> 
                        to BOC: 8872334 (Nexus LMS)
                    </p>
                  </div>

                  <Input 
                     label="Transaction ID" 
                     placeholder="REF-XXXX-XXXX"
                     value={enrollData.reference} 
                     onChange={e => setEnrollData({...enrollData, reference: e.target.value})}
                  />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Proof (Slip/Screenshot)</label>
                    <input 
                      type="file" 
                      onChange={e => setEnrollData({...enrollData, slip: e.target.files?.[0] || null})}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer bg-slate-50 rounded-xl p-2" 
                    />
                  </div>

                  <div className="flex gap-4 mt-8">
                      <Button variant="ghost" className="flex-1 h-12 text-xs font-black uppercase tracking-widest" onClick={() => setSelectedCourse(null)}>Cancel</Button>
                      <Button className="flex-[2] h-12 text-xs font-black uppercase tracking-widest" onClick={handleEnroll}>Complete Enrollment</Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
