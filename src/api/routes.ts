import { Router } from 'express';
import db from '../db/schema.js';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../lib/auth-utils.js';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure storage for uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Middleware to protect routes by role
export const authorize = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !roles.includes(decoded.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  };
};

// --- AUTH ROUTES ---

// OTP Verification (Mocking text.lk API)
router.post('/auth/request-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // In a real app, send OTP via text.lk here
  console.log(`[TEXT.LK MOCK] Sending OTP ${otp} to ${phone}`);

  db.prepare('INSERT INTO otp_tokens (phone, token, expires_at) VALUES (?, ?, ?)').run(phone, otp, expiresAt);
  res.json({ message: 'OTP sent successfully' });
});

router.post('/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  const tokenRecord = db.prepare('SELECT * FROM otp_tokens WHERE phone = ? AND token = ? AND is_used = 0 ORDER BY created_at DESC LIMIT 1').get(phone, otp);

  if (!tokenRecord || new Date(tokenRecord.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  db.prepare('UPDATE otp_tokens SET is_used = 1 WHERE id = ?').run(tokenRecord.id);
  res.json({ message: 'Phone verified' });
});

// Student Register
router.post('/auth/register', async (req, res) => {
  const { firstName, lastName, birthday, address, phone, password } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    const result = db.prepare(`
      INSERT INTO students (first_name, last_name, birthday, address, phone, password, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(firstName, lastName, birthday, address, phone, hashedPassword);
    
    const token = generateToken({ id: Number(result.lastInsertRowid), role: 'student', phone });
    res.json({ token, user: { id: result.lastInsertRowid, firstName, lastName, phone, role: 'student' } });
  } catch (err: any) {
    if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Phone number already registered' });
    res.status(500).json({ error: err.message });
  }
});

// General Login
router.post('/auth/login', async (req, res) => {
  const { phone, password, role } = req.body;
  let user: any;

  if (role === 'student') {
    user = db.prepare('SELECT * FROM students WHERE phone = ?').get(phone);
  } else if (role === 'tutor') {
    user = db.prepare('SELECT * FROM tutors WHERE phone = ? AND status = \'active\'').get(phone);
  } else if (role === 'admin') {
    user = db.prepare('SELECT * FROM admins WHERE phone = ?').get(phone);
  }

  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken({ id: user.id, role, phone: user.phone });
  res.json({ token, user: { ...user, role, password: Buffer.from('') } });
});

// --- STUDENT DASHBOARD ---
router.get('/student/dashboard', authorize(['student']), (req: any, res) => {
  const studentId = req.user.id;
  const enrolledCourses = db.prepare(`
    SELECT courses.*, tutors.display_name as tutor_name, enrollments.status as enrollment_status
    FROM enrollments
    JOIN courses ON enrollments.course_id = courses.id
    JOIN tutors ON courses.tutor_id = tutors.id
    WHERE enrollments.student_id = ?
  `).all(studentId);

  const announcements = db.prepare(`
    SELECT announcements.*, courses.name as course_name
    FROM announcements
    JOIN courses ON announcements.course_id = courses.id
    JOIN enrollments ON courses.id = enrollments.course_id
    WHERE enrollments.student_id = ? AND enrollments.status = 'active'
    ORDER BY announcements.created_at DESC LIMIT 5
  `).all(studentId);

  const payments = db.prepare('SELECT * FROM payments WHERE student_id = ? ORDER BY created_at DESC').all(studentId);

  res.json({ enrolledCourses, announcements, payments });
});

// --- STORE ---
router.get('/store/tutors', (req, res) => {
  const tutors = db.prepare('SELECT id, display_name, profile_picture, subjects, bio, experience, qualifications FROM tutors WHERE status = \'active\'').all();
  res.json(tutors);
});

router.get('/store/courses', (req, res) => {
  const courses = db.prepare(`
    SELECT courses.*, tutors.display_name as tutor_name 
    FROM courses 
    JOIN tutors ON courses.tutor_id = tutors.id 
    WHERE courses.status = 'active'
  `).all();
  res.json(courses);
});

router.post('/store/enroll', authorize(['student']), upload.single('slip'), (req: any, res) => {
  const { courseId, amount, reference, notes } = req.body;
  const studentId = req.user.id;
  const slipPath = req.file?.path;

  if (!slipPath) return res.status(400).json({ error: 'Payment slip is required' });

  db.transaction(() => {
    db.prepare('INSERT INTO payments (student_id, course_id, amount, payment_slip, reference, notes) VALUES (?, ?, ?, ?, ?, ?)').run(
      studentId, courseId, amount, slipPath, reference, notes
    );
    db.prepare('INSERT OR IGNORE INTO enrollments (student_id, course_id, status) VALUES (?, ?, \'pending\')').run(studentId, courseId);
  })();

  res.json({ message: 'Submission successful. Waiting for approval.' });
});

// --- TUTOR ROUTES ---
router.get('/tutor/dashboard', authorize(['tutor']), (req: any, res) => {
  const tutorId = req.user.id;
  const courses = db.prepare('SELECT * FROM courses WHERE tutor_id = ?').all(tutorId);
  const studentsCount = db.prepare('SELECT COUNT(DISTINCT student_id) as count FROM enrollments JOIN courses ON enrollments.course_id = courses.id WHERE courses.tutor_id = ?').get(tutorId);
  const pendingPayments = db.prepare('SELECT payments.*, students.first_name, students.last_name, courses.name as course_name FROM payments JOIN students ON payments.student_id = students.id JOIN courses ON payments.course_id = courses.id WHERE courses.tutor_id = ? AND payments.status = \'pending\'').all(tutorId);
  
  res.json({ courses, studentsCount: studentsCount.count, pendingPayments });
});

router.post('/tutor/approve-payment', authorize(['tutor']), (req: any, res) => {
  const { paymentId, status } = req.body; // 'approved' or 'rejected'
  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
  
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  db.transaction(() => {
    db.prepare('UPDATE payments SET status = ? WHERE id = ?').run(status, paymentId);
    if (status === 'approved') {
      db.prepare('UPDATE enrollments SET status = \'active\' WHERE student_id = ? AND course_id = ?').run(payment.student_id, payment.course_id);
    } else {
      db.prepare('UPDATE enrollments SET status = \'rejected\' WHERE student_id = ? AND course_id = ?').run(payment.student_id, payment.course_id);
    }
  })();

  res.json({ message: `Payment ${status}` });
});

// --- ADMIN ROUTES ---
router.get('/admin/stats', authorize(['admin']), (req, res) => {
  const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
  const totalTutors = db.prepare('SELECT COUNT(*) as count FROM tutors').get().count;
  const totalCourses = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;
  const totalRevenue = db.prepare('SELECT SUM(amount) as sum FROM payments WHERE status = \'approved\'').get().sum || 0;
  
  res.json({ totalStudents, totalTutors, totalCourses, totalRevenue });
});

router.post('/admin/create-tutor', authorize(['admin']), async (req, res) => {
  const { firstName, lastName, phone, password, displayName } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    db.prepare('INSERT INTO tutors (first_name, last_name, phone, password, display_name) VALUES (?, ?, ?, ?, ?)').run(
      firstName, lastName, phone, hashedPassword, displayName
    );
    res.json({ message: 'Tutor created successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
