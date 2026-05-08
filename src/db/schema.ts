import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('lms.db');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tutors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      display_name TEXT,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      bio TEXT,
      experience TEXT,
      qualifications TEXT,
      profile_picture TEXT,
      cover_banner TEXT,
      subjects TEXT, -- JSON array
      social_links TEXT, -- JSON object
      contact_info TEXT, -- JSON object
      status TEXT CHECK(status IN ('active', 'suspended', 'pending')) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      birthday DATE,
      address TEXT,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      profile_picture TEXT,
      is_verified INTEGER DEFAULT 0,
      status TEXT CHECK(status IN ('active', 'suspended')) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      category_id INTEGER REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tutor_id INTEGER REFERENCES tutors(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      thumbnail TEXT,
      price REAL DEFAULT 0,
      monthly_fee REAL DEFAULT 0,
      duration TEXT,
      subject_id INTEGER REFERENCES subjects(id),
      status TEXT CHECK(status IN ('pending', 'active', 'archived')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      status TEXT CHECK(status IN ('pending', 'active', 'rejected')) DEFAULT 'pending',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER REFERENCES students(id),
      course_id INTEGER REFERENCES courses(id),
      amount REAL NOT NULL,
      payment_slip TEXT NOT NULL,
      reference TEXT,
      notes TEXT,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recordings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS zoom_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      link TEXT NOT NULL,
      scheduled_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      tutor_id INTEGER REFERENCES tutors(id),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS course_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS otp_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      is_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      user_role TEXT CHECK(user_role IN ('student', 'tutor', 'admin')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure created_at exists in otp_tokens (migration for existing dbs)
  try {
    db.prepare('ALTER TABLE otp_tokens ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP').run();
  } catch (e) {
    // Column might already exist
  }

  // Insert default Super Admin if not exists
  const adminExists = db.prepare('SELECT id FROM admins LIMIT 1').get();
  if (!adminExists) {
    // Default password 'admin123' hashed (you should change this)
    // Using manual hash for now since bcrypt is async
    const hashedPassword = '$2a$10$rB7.S.o.3.v.V.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.'; // Just a placeholder, will update in script
    db.prepare('INSERT INTO admins (first_name, last_name, phone, password) VALUES (?, ?, ?, ?)').run(
      'Super', 'Admin', '0000000000', '$2a$10$Zf8.m6m5m5m5m5m5m5m5m5m5m5m5m5m5m5m5m5m5m5m5m5m5m' 
    );
  }
}

export default db;
