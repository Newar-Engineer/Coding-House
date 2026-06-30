/**
 * User Routes — Coding House Admin API
 * All routes are admin-protected (requireAuth + requireAdmin middleware applied in server.js).
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');

// ── GET /api/users/stats — aggregate stats ──
router.get('/stats', async (req, res) => {
  try {
    const [totalRows] = await query('SELECT COUNT(*) AS total FROM users');
    const [activeRows] = await query("SELECT COUNT(*) AS count FROM users WHERE status = 'active'");
    const [newRows] = await query("SELECT COUNT(*) AS count FROM users WHERE status = 'new'");
    const [bannedRows] = await query("SELECT COUNT(*) AS count FROM users WHERE status = 'banned'");
    const [adminRows] = await query("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'");
    const [planRows] = await query(
      'SELECT plan, COUNT(*) AS count FROM users GROUP BY plan'
    );

    const byPlan = {};
    planRows.forEach(r => { byPlan[r.plan] = r.count; });

    res.json({
      total:   totalRows[0].total,
      active:  activeRows[0].count,
      new:     newRows[0].count,
      banned:  bannedRows[0].count,
      admins:  adminRows[0].count,
      byPlan
    });
  } catch (err) {
    console.error('[Users] Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// ── GET /api/users — list all users (paginated, searchable) ──
router.get('/', async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const status = (req.query.status || '').trim();
    const role   = (req.query.role || '').trim();

    let where = [];
    let params = [];

    if (search) {
      where.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status && ['active', 'idle', 'banned', 'new'].includes(status)) {
      where.push('status = ?');
      params.push(status);
    }
    if (role && ['user', 'admin'].includes(role)) {
      where.push('role = ?');
      params.push(role);
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    // Count total matching
    const [countRows] = await query(
      `SELECT COUNT(*) AS total FROM users ${whereClause}`, params
    );

    // Fetch page
    const [rows] = await query(
      `SELECT id, name, email, role, status, plan, xp, avatar_url, created_at, updated_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      users: rows,
      pagination: {
        page,
        limit,
        total: countRows[0].total,
        totalPages: Math.ceil(countRows[0].total / limit)
      }
    });
  } catch (err) {
    console.error('[Users] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ── GET /api/users/:id — single user ──
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await query(
      'SELECT id, name, email, role, status, plan, xp, avatar_url, created_at, updated_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[Users] Get error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ── POST /api/users — create user ──
router.post('/', async (req, res) => {
  try {
    const { name, email, role, status, plan, xp } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const validRoles = ['user', 'admin'];
    const validStatuses = ['active', 'idle', 'banned', 'new'];
    const validPlans = ['free', 'pro', 'lifetime'];

    const safeRole   = validRoles.includes(role) ? role : 'user';
    const safeStatus = validStatuses.includes(status) ? status : 'new';
    const safePlan   = validPlans.includes(plan) ? plan : 'free';
    const safeXp     = parseInt(xp) || 0;

    // Check duplicate email
    const [existing] = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    const [result] = await query(
      `INSERT INTO users (name, email, role, status, plan, xp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.trim().toLowerCase(), safeRole, safeStatus, safePlan, safeXp]
    );

    const [newUser] = await query('SELECT * FROM users WHERE id = ?', [result.insertId]);

    res.status(201).json({ message: 'User created successfully', user: newUser[0] });
  } catch (err) {
    console.error('[Users] Create error:', err.message);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ── PUT /api/users/:id — update user ──
router.put('/:id', async (req, res) => {
  try {
    const { name, email, role, status, plan, xp } = req.body;
    const userId = req.params.id;

    // Check user exists
    const [existing] = await query('SELECT id FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build dynamic update
    const fields = [];
    const params = [];

    if (name !== undefined)   { fields.push('name = ?');   params.push(name.trim()); }
    if (email !== undefined)  {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      // Check no other user has this email
      const [dup] = await query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (dup.length > 0) return res.status(409).json({ error: 'Email already in use by another account' });
      fields.push('email = ?'); params.push(email.trim().toLowerCase());
    }
    if (role !== undefined && ['user', 'admin'].includes(role)) {
      fields.push('role = ?'); params.push(role);
    }
    if (status !== undefined && ['active', 'idle', 'banned', 'new'].includes(status)) {
      fields.push('status = ?'); params.push(status);
    }
    if (plan !== undefined && ['free', 'pro', 'lifetime'].includes(plan)) {
      fields.push('plan = ?'); params.push(plan);
    }
    if (xp !== undefined) {
      fields.push('xp = ?'); params.push(parseInt(xp) || 0);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(userId);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    const [updated] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User updated successfully', user: updated[0] });
  } catch (err) {
    console.error('[Users] Update error:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ── DELETE /api/users/:id — delete user ──
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deleting yourself
    if (req.adminUser && req.adminUser.id === parseInt(userId)) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    const [existing] = await query('SELECT id, name, email FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User deleted successfully', deleted: existing[0] });
  } catch (err) {
    console.error('[Users] Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
