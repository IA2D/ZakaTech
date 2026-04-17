const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// PostgreSQL connection using DATABASE_URL (Vercel/Supabase compatible)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initDatabase() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        stage TEXT,
        is_admin INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Test results table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_results (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        test_key TEXT NOT NULL,
        test_name TEXT NOT NULL,
        scientist TEXT NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        percentage INTEGER NOT NULL,
        level TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create admin user if not exists
    await createAdminUser();
    console.log('PostgreSQL database initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

async function createAdminUser() {
  const adminEmail = 'admin@zakatech.com';
  const adminPassword = 'admin123'; // Change this in production

  try {
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    if (result.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminId = 'admin-' + uuidv4();
      await pool.query(
        `INSERT INTO users (id, email, password_hash, full_name, age, gender, stage, is_admin)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [adminId, adminEmail, hashedPassword, 'System Administrator', 30, 'male', 'admin', 1]
      );
      console.log('Admin user created:', adminEmail);
    }
  } catch (err) {
    console.error('Error creating admin:', err);
  }
}

// Initialize on module load
initDatabase();

// User functions
const User = {
  async create(userData) {
    const { email, password, fullName, age, gender, stage } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    try {
      await pool.query(
        `INSERT INTO users (id, email, password_hash, full_name, age, gender, stage)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, email.toLowerCase(), hashedPassword, fullName, age, gender, stage]
      );
      return { id, email, fullName, age, gender, stage };
    } catch (err) {
      if (err.code === '23505') { // PostgreSQL unique violation
        throw new Error('Email already exists');
      }
      throw err;
    }
  },

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT id, email, full_name, age, gender, stage, is_admin, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  async getAll() {
    const result = await pool.query(
      'SELECT id, email, full_name, age, gender, stage, created_at FROM users WHERE is_admin = 0 ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 AND is_admin = 0',
      [id]
    );
    return { changes: result.rowCount };
  }
};

// Test Results functions
const TestResult = {
  async create(resultData) {
    const {
      userId, testKey, testName, scientist,
      score, total, percentage, level, details
    } = resultData;
    const id = uuidv4();
    const detailsJson = details ? JSON.stringify(details) : null;

    await pool.query(
      `INSERT INTO test_results (id, user_id, test_key, test_name, scientist, score, total, percentage, level, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, userId, testKey, testName, scientist, score, total, percentage, level, detailsJson]
    );
    return {
      id, userId, testKey, testName, scientist,
      score, total, percentage, level, details
    };
  },

  async getByUserId(userId) {
    const result = await pool.query(
      `SELECT * FROM test_results WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows.map(row => ({
      ...row,
      details: row.details ? JSON.parse(row.details) : null
    }));
  },

  async getLatestByUserId(userId) {
    const result = await pool.query(
      `SELECT tr.* , u.email, u.full_name, u.age, u.gender, u.stage
       FROM test_results tr
       JOIN users u ON tr.user_id = u.id
       WHERE tr.user_id = $1 ORDER BY tr.created_at DESC LIMIT 1`,
      [userId]
    );
    const row = result.rows[0];
    if (row && row.details) {
      row.details = JSON.parse(row.details);
    }
    return row;
  },

  async getAll() {
    const result = await pool.query(
      `SELECT tr.*, u.email, u.full_name, u.age, u.gender, u.stage
       FROM test_results tr
       JOIN users u ON tr.user_id = u.id
       ORDER BY tr.created_at DESC`
    );
    return result.rows.map(row => ({
      ...row,
      details: row.details ? JSON.parse(row.details) : null
    }));
  },

  async deleteByUserId(userId) {
    const result = await pool.query(
      'DELETE FROM test_results WHERE user_id = $1',
      [userId]
    );
    return { changes: result.rowCount };
  },

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM test_results WHERE id = $1',
      [id]
    );
    return { changes: result.rowCount };
  },

  async getStats() {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_tests,
        COUNT(DISTINCT user_id) as total_users,
        AVG(percentage) as avg_score
       FROM test_results`
    );
    return result.rows[0];
  }
};

module.exports = { User, TestResult, pool };
