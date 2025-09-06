const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class DevDatabase {
  constructor() {
    this.db = new Database('./dev-database.sqlite'); // Persistent database file
    this.init();
  }

  init() {
    // Create users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        isEmailVerified BOOLEAN DEFAULT 0,
        emailVerificationToken TEXT,
        emailVerificationExpires DATETIME,
        passwordResetToken TEXT,
        passwordResetExpires DATETIME,
        otpCode TEXT,
        otpExpires DATETIME,
        otpAttempts INTEGER DEFAULT 0,
        lastOtpRequest DATETIME,
        role TEXT DEFAULT 'user',
        isActive BOOLEAN DEFAULT 1,
        lastLogin DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Development database initialized');
  }

  // User methods
  async createUser(userData) {
    const { name, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    try {
      const stmt = this.db.prepare(`
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
      `);
      
      const result = stmt.run(name, email, hashedPassword);
      return { success: true, userId: result.lastInsertRowid };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('User already exists with this email');
      }
      throw error;
    }
  }

  async findUserByEmail(email) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  async findUserById(id) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  async updateUser(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE users SET ${fields} WHERE id = ?`);
    return stmt.run(...values);
  }

  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }

  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Close database
  close() {
    this.db.close();
  }
}

module.exports = DevDatabase; 