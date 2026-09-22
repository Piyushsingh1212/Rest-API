// ─────────────────────────────────────────────────────────────
// routes/tasks.js — Full CRUD for tasks, scoped per user
// ─────────────────────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

// ── Every task route requires a valid JWT ───────────────────
router.use(authenticate);

// Validation helper
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Validation rules for creating / updating a task
const taskValidation = [
  body('title')
    .optional()       // optional on PUT, we check required-ness per route
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'done'])
    .withMessage('Status must be pending, in_progress, or done'),
];

// ── GET /api/tasks — List all tasks for the logged-in user ──
router.get('/', (req, res) => {
  const tasks = db
    .prepare('SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC')
    .all(req.userId);

  res.json({ count: tasks.length, tasks });
});

// ── GET /api/tasks/:id — Get a single task ──────────────────
router.get('/:id', (req, res) => {
  const task = db
    .prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?')
    .get(req.params.id, req.userId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json({ task });
});

// ── POST /api/tasks — Create a new task ─────────────────────
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'done'])
      .withMessage('Status must be pending, in_progress, or done'),
  ],
  handleValidation,
  (req, res) => {
    const { title, description = '', status = 'pending' } = req.body;

    const result = db
      .prepare(
        `INSERT INTO tasks (title, description, status, userId)
         VALUES (?, ?, ?, ?)`
      )
      .run(title, description, status, req.userId);

    const task = db
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json({ message: 'Task created', task });
  }
);

// ── PUT /api/tasks/:id — Update an existing task ────────────
router.put('/:id', taskValidation, handleValidation, (req, res) => {
  // First, confirm the task exists AND belongs to this user
  const existing = db
    .prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?')
    .get(req.params.id, req.userId);

  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Merge: use new value if provided, otherwise keep the old one
  const title = req.body.title ?? existing.title;
  const description = req.body.description ?? existing.description;
  const status = req.body.status ?? existing.status;

  db.prepare(
    `UPDATE tasks
     SET title = ?, description = ?, status = ?, updatedAt = datetime('now')
     WHERE id = ? AND userId = ?`
  ).run(title, description, status, req.params.id, req.userId);

  const updated = db
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .get(req.params.id);

  res.json({ message: 'Task updated', task: updated });
});

// ── DELETE /api/tasks/:id — Delete a task ───────────────────
router.delete('/:id', (req, res) => {
  const existing = db
    .prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?')
    .get(req.params.id, req.userId);

  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }

  db.prepare('DELETE FROM tasks WHERE id = ? AND userId = ?').run(
    req.params.id,
    req.userId
  );

  res.json({ message: 'Task deleted' });
});

module.exports = router;
