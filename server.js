require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { User, TestResult } = require('./database');
const { generateToken, authenticateToken, authenticateAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (required for rate-limit behind Vercel/proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Determine base path for files (Vercel: /api, Local: root)
const basePath = process.env.VERCEL === '1'
  ? path.join(__dirname, '..')
  : __dirname;

// Static files - serve BEFORE rate limiting
app.use(express.static(basePath));

// Rate limiting - only for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500 // higher limit for API
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20 // 20 attempts per hour
});

// ====================
// AUTH ROUTES
// ====================

// Register
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { email, password, fullName, age, gender, stage } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      return res.status(400).json({ error: 'Please enter your full name (at least 2 words)' });
    }

    const user = await User.create({
      email,
      password,
      fullName,
      age,
      gender,
      stage
    });

    const token = generateToken({ ...user, is_admin: 0 });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        age: user.age,
        gender: user.gender,
        stage: user.stage
      },
      token
    });
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await User.verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        age: user.age,
        gender: user.gender,
        stage: user.stage,
        isAdmin: user.is_admin === 1
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      age: user.age,
      gender: user.gender,
      stage: user.stage,
      isAdmin: user.is_admin === 1
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ====================
// TEST RESULTS ROUTES
// ====================

// Save test result
app.post('/api/results', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const {
      testKey, testName, scientist,
      score, total, percentage, level, details
    } = req.body;

    if (!testKey || !testName || score === undefined || total === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await TestResult.create({
      userId: req.user.id,
      testKey,
      testName,
      scientist,
      score,
      total,
      percentage,
      level,
      details
    });

    res.status(201).json({
      message: 'Test result saved successfully',
      result
    });
  } catch (error) {
    console.error('Save result error:', error);
    res.status(500).json({ error: 'Failed to save test result' });
  }
});

// Get user's test results
app.get('/api/results/my', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const results = await TestResult.getByUserId(req.user.id);
    res.json(results);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to get test results' });
  }
});

// Get latest test result
app.get('/api/results/latest', apiLimiter, authenticateToken, async (req, res) => {
  try {
    const result = await TestResult.getLatestByUserId(req.user.id);
    if (!result) {
      return res.status(404).json({ error: 'No test results found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Get latest result error:', error);
    res.status(500).json({ error: 'Failed to get test result' });
  }
});

// ====================
// ADMIN ROUTES
// ====================

// Get all users (admin only)
app.get('/api/admin/users', apiLimiter, authenticateAdmin, async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:id', apiLimiter, authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await TestResult.deleteByUserId(id);
    const result = await User.delete(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found or cannot delete admin' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all test results (admin only)
app.get('/api/admin/results', apiLimiter, authenticateAdmin, async (req, res) => {
  try {
    const results = await TestResult.getAll();
    res.json(results);
  } catch (error) {
    console.error('Get all results error:', error);
    res.status(500).json({ error: 'Failed to get test results' });
  }
});

// Get statistics (admin only)
app.get('/api/admin/stats', apiLimiter, authenticateAdmin, async (req, res) => {
  try {
    const stats = await TestResult.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Delete test result (admin only)
app.delete('/api/admin/results/:id', apiLimiter, authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await TestResult.delete(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json({ message: 'Test result deleted successfully' });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({ error: 'Failed to delete test result' });
  }
});

// ====================
// HEALTH CHECK
// ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ====================
// SERVE FRONTEND (for Vercel and root path)
// ====================

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(basePath, 'index.html'));
});

// Serve index.html for admin page
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(basePath, 'admin.html'));
});

// Catch-all route: serve index.html for any non-API route (SPA support)
// This handles client-side routing for single page application
app.get('*', (req, res) => {
  // Don't interfere with API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(basePath, 'index.html'));
});

// ====================
// ERROR HANDLING
// ====================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ====================
// START SERVER (only for local dev)
// ====================

// Only listen if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`
========================================
  Zeka Tech Server Running
========================================
  Port: ${PORT}
  URL: http://localhost:${PORT}
  API: http://localhost:${PORT}/api
  
  Admin Login:
    Email: admin@zakatech.com
    Password: admin123
    
  Change admin password in production!
========================================
  `);
  });
}

module.exports = app;
