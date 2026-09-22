// ─────────────────────────────────────────────────────────────
// server.js — Express application entry point
// ─────────────────────────────────────────────────────────────
require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Global middleware ───────────────────────────────────────
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// ── Health check ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'Task API is running',
    endpoints: {
      auth: '/api/auth/register, /api/auth/login',
      tasks: '/api/tasks (GET, POST, PUT, DELETE)',
    },
  });
});

// ── Catch-all 404 for unknown routes ────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
