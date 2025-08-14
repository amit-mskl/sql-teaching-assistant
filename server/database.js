import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database connection
const dbPath = path.join(__dirname, 'owlstein.db');
console.log(`🗄️ Database path: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize database with tables
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🔧 Initializing database schema...');
      
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT,
          display_name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1,
          last_login DATETIME
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating users table:', err);
          reject(err);
        } else {
          console.log('✅ Users table ready');
        }
      });

      // Create chat_sessions table (for future chat history)
      db.run(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating chat_sessions table:', err);
          reject(err);
        } else {
          console.log('✅ Chat sessions table ready');
        }
      });

      // Create messages table (for future chat history)
      db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id INTEGER NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
          content TEXT NOT NULL,
          tokens_used INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating messages table:', err);
          reject(err);
        } else {
          console.log('✅ Messages table ready');
          resolve();
        }
      });
    });
  });
};

// User database operations
export const userDb = {
  
  // Create new user
  create: async (email, passwordHash, firstName, lastName = null) => {
    return new Promise((resolve, reject) => {
      const displayName = lastName ? `${firstName} ${lastName}` : firstName;
      
      console.log(`👤 Creating user: ${email} (${displayName})`);
      
      const stmt = db.prepare(`
        INSERT INTO users (email, password_hash, first_name, last_name, display_name) 
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run([email, passwordHash, firstName, lastName, displayName], function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            console.log(`❌ User already exists: ${email}`);
            reject(new Error('EMAIL_EXISTS'));
          } else {
            console.error('❌ Error creating user:', err);
            reject(err);
          }
        } else {
          console.log(`✅ User created with ID: ${this.lastID}`);
          resolve({
            id: this.lastID,
            email,
            first_name: firstName,
            last_name: lastName,
            display_name: displayName
          });
        }
      });
      
      stmt.finalize();
    });
  },

  // Find user by email
  findByEmail: async (email) => {
    return new Promise((resolve, reject) => {
      console.log(`🔍 Looking up user: ${email}`);
      
      db.get(`
        SELECT id, email, password_hash, first_name, last_name, display_name, 
               created_at, last_login, is_active 
        FROM users 
        WHERE email = ? AND is_active = 1
      `, [email], (err, row) => {
        if (err) {
          console.error('❌ Database error:', err);
          reject(err);
        } else {
          if (row) {
            console.log(`✅ User found: ${row.display_name} (${row.email})`);
          } else {
            console.log(`❌ User not found: ${email}`);
          }
          resolve(row);
        }
      });
    });
  },

  // Find user by ID
  findById: async (id) => {
    return new Promise((resolve, reject) => {
      console.log(`🔍 Looking up user ID: ${id}`);
      
      db.get(`
        SELECT id, email, first_name, last_name, display_name, 
               created_at, last_login, is_active 
        FROM users 
        WHERE id = ? AND is_active = 1
      `, [id], (err, row) => {
        if (err) {
          console.error('❌ Database error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Update last login timestamp
  updateLastLogin: async (userId) => {
    return new Promise((resolve, reject) => {
      console.log(`📅 Updating last login for user ID: ${userId}`);
      
      db.run(`
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [userId], (err) => {
        if (err) {
          console.error('❌ Error updating last login:', err);
          reject(err);
        } else {
          console.log('✅ Last login updated');
          resolve();
        }
      });
    });
  },

  // Get user count (for admin purposes)
  getUserCount: async () => {
    return new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users WHERE is_active = 1', (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  },

  // Soft delete user (deactivate instead of delete)
  deactivateUser: async (userId) => {
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE users 
        SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
};

// Chat session operations (for future use)
export const chatDb = {
  
  // Create new chat session
  createSession: async (userId, title = 'New Chat') => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO chat_sessions (user_id, title) 
        VALUES (?, ?)
      `);
      
      stmt.run([userId, title], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, user_id: userId, title });
        }
      });
      
      stmt.finalize();
    });
  },

  // Get user's chat sessions
  getUserSessions: async (userId) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT id, title, created_at, updated_at 
        FROM chat_sessions 
        WHERE user_id = ? 
        ORDER BY updated_at DESC
      `, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Get or create current session for user
  getOrCreateCurrentSession: async (userId) => {
    return new Promise((resolve, reject) => {
      console.log(`🗨️ Getting current session for user ${userId}`);
      
      // First, try to get the most recent session
      db.get(`
        SELECT id, title, created_at, updated_at 
        FROM chat_sessions 
        WHERE user_id = ? 
        ORDER BY updated_at DESC 
        LIMIT 1
      `, [userId], async (err, row) => {
        if (err) {
          console.error('❌ Error getting session:', err);
          reject(err);
        } else if (row) {
          console.log(`✅ Found existing session: ${row.id}`);
          resolve(row);
        } else {
          console.log('📝 Creating new session for user');
          try {
            const newSession = await chatDb.createSession(userId, 'SQL Chat Session');
            resolve(newSession);
          } catch (createErr) {
            reject(createErr);
          }
        }
      });
    });
  },

  // Update session timestamp
  updateSessionTimestamp: async (sessionId) => {
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE chat_sessions 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [sessionId], (err) => {
        if (err) {
          console.error('❌ Error updating session timestamp:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  // Save message to database
  saveMessage: async (sessionId, role, content, tokensUsed = null) => {
    return new Promise((resolve, reject) => {
      console.log(`💾 Saving ${role} message to session ${sessionId}`);
      
      const stmt = db.prepare(`
        INSERT INTO messages (session_id, role, content, tokens_used) 
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run([sessionId, role, content, tokensUsed], function(err) {
        if (err) {
          console.error('❌ Error saving message:', err);
          reject(err);
        } else {
          console.log(`✅ Message saved with ID: ${this.lastID}`);
          resolve({
            id: this.lastID,
            session_id: sessionId,
            role,
            content,
            tokens_used: tokensUsed
          });
        }
      });
      
      stmt.finalize();
    });
  },

  // Get messages for a session
  getSessionMessages: async (sessionId) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT id, role, content, tokens_used, created_at 
        FROM messages 
        WHERE session_id = ? 
        ORDER BY created_at ASC
      `, [sessionId], (err, rows) => {
        if (err) {
          console.error('❌ Error getting messages:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
};

// Graceful database closure
export const closeDatabase = () => {
  return new Promise((resolve) => {
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed');
      }
      resolve();
    });
  });
};

export default db;