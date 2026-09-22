// ─────────────────────────────────────────────────────────────
// routes/auth.js — Register & Login endpoints
// ─────────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const { JWT_SECRET } = require('../middleware/auth');

// ── Shared validation rules ────────────────────────────────
const validateCredentials = [
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Turn validation errors into a 400 response
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// ── POST /api/auth/register ─────────────────────────────────
router.post('/register', validateCredentials, handleValidation, (req, res) => {
  const { email, password } = req.body;

  // Check for duplicate email
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Hash password (10 salt rounds is the standard default)
  const hashedPassword = bcrypt.hashSync(password, 10);

  const result = db
    .prepare('INSERT INTO users (email, password) VALUES (?, ?)')
    .run(email, hashedPassword);

  // Issue a token immediately so the user is logged in after registering
  const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, {
    expiresIn: '7d',
  });

  res.status(201).json({
    message: 'User registered successfully',
    user: { id: result.lastInsertRowid, email },
    token,
  });
});

// ── POST /api/auth/login ────────────────────────────────────
router.post('/login', validateCredentials, handleValidation, (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({
    message: 'Login successful',
    user: { id: user.id, email: user.email },
    token,
  });
});

module.exports = router;
