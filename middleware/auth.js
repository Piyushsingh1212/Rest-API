// ─────────────────────────────────────────────────────────────
// middleware/auth.js — JWT verification middleware
// ─────────────────────────────────────────────────────────────
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

/**
 * Reads the `Authorization: Bearer <token>` header,
 * verifies the JWT, and attaches `req.userId` for
 * every downstream route handler.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  // No header at all, or wrong format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId; // attach for route handlers
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authenticate, JWT_SECRET };
