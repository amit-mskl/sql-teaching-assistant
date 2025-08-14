import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// PHASE A: HARDCODED USERS (for learning)
// In real apps, these would come from a database
const HARDCODED_USERS = [
  {
    id: 1,
    name: "Demo User",
    email: "demo@owlstein.com",
    // Password: "password123" (hashed with bcrypt)
    password: "$2b$10$CssSR2Wek8rUwoONZpZ4S.gF.o1C1zui8QE4p8yiYYkIpMG0Qdyfm"
  },
  {
    id: 2,
    name: "Test User", 
    email: "test@owlstein.com",
    // Password: "test123" (hashed with bcrypt)
    password: "$2b$10$t00sHw0WeStXQX5V4yynHuR77wdWNlFThZQj00r5/KbrX/TB6w1h."
  }
];

// JWT Secret (in real apps, this goes in .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

// Helper Functions
export const authService = {
  
  // Find user by email (simulates database lookup)
  findUserByEmail: (email) => {
    console.log(`🔍 Looking for user with email: ${email}`);
    const user = HARDCODED_USERS.find(user => user.email === email);
    console.log(`${user ? '✅ User found' : '❌ User not found'}`);
    return user;
  },

  // Find user by ID (simulates database lookup)
  findUserById: (id) => {
    console.log(`🔍 Looking for user with ID: ${id}`);
    const user = HARDCODED_USERS.find(user => user.id === parseInt(id));
    return user;
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
    console.log(`🎟️ Generating token for user: ${user.email}`);
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name
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