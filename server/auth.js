import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userDb } from './database.js';

// PHASE C: SQLITE DATABASE AUTHENTICATION
// Now using real database instead of hardcoded users!

// JWT Secret (should be in .env file for production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Helper Functions - Now using real database!
export const authService = {
  
  // Find user by email (real database lookup)
  findUserByEmail: async (email) => {
    console.log(`🔍 Database lookup for user: ${email}`);
    try {
      const user = await userDb.findByEmail(email);
      return user;
    } catch (error) {
      console.error('❌ Database error in findUserByEmail:', error);
      return null;
    }
  },

  // Find user by ID (real database lookup)
  findUserById: async (id) => {
    console.log(`🔍 Database lookup for user ID: ${id}`);
    try {
      const user = await userDb.findById(id);
      return user;
    } catch (error) {
      console.error('❌ Database error in findUserById:', error);
      return null;
    }
  },

  // Create new user (register)
  createUser: async (email, password, firstName, lastName = null) => {
    console.log(`👤 Creating new user: ${email}`);
    try {
      const passwordHash = await authService.hashPassword(password);
      const user = await userDb.create(email, passwordHash, firstName, lastName);
      return user;
    } catch (error) {
      console.error('❌ Database error in createUser:', error);
      throw error;
    }
  },

  // Hash password (for when we add signup later)
  hashPassword: async (password) => {
    console.log('🔒 Hashing password...');
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  },

  // Verify password
  verifyPassword: async (plainPassword, hashedPassword) => {
    console.log('🔐 Verifying password...');
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log(`${isValid ? '✅ Password correct' : '❌ Password incorrect'}`);
    return isValid;
  },

  // Generate JWT token
  generateToken: (user) => {
    console.log(`🎟️ Generating token for user: ${user.email} (${user.auth_provider || 'local'})`);
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.display_name, // Using display_name from database
      firstName: user.first_name,
      lastName: user.last_name,
      authProvider: user.auth_provider || 'local',
      githubUsername: user.github_username || null,
      avatarUrl: user.avatar_url || null
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  },

  // Verify JWT token
  verifyToken: (token) => {
    try {
      console.log('🎟️ Verifying token...');
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token valid');
      return decoded;
    } catch (error) {
      console.log('❌ Token invalid:', error.message);
      return null;
    }
  }
};

// Middleware to protect routes (checks if user is logged in)
export const requireAuth = (req, res, next) => {
  console.log('\n🛡️ Checking authentication...');
  
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN_HERE

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Verify token
  const decoded = authService.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Access denied. Invalid token.' });
  }

  // Add user info to request object
  req.user = decoded;
  console.log(`✅ User authenticated: ${decoded.email}`);
  next();
};

// Helper to create initial hashed passwords (for development)
export const createHashedPassword = async (password) => {
  const hashed = await authService.hashPassword(password);
  console.log(`Original: ${password}`);
  console.log(`Hashed: ${hashed}`);
  return hashed;
};

export default authService;