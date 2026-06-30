/**
 * Auth Middleware — Coding House Admin
 * Verifies Supabase JWT and checks admin role in MySQL.
 */
const { createClient } = require('@supabase/supabase-js');
const { query } = require('../db/connection');

// Supabase admin client (service role — server-side only)
let supabaseAdmin = null;
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabaseAdmin;
}

/**
 * requireAuth — verifies the Bearer JWT token via Supabase.
 * Attaches req.user = { id, email, ... } from Supabase Auth.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.supabaseUser = data.user;
    next();
  } catch (err) {
    console.error('[Auth] Token verification error:', err.message);
    return res.status(500).json({ error: 'Authentication service error' });
  }
}

/**
 * requireAdmin — after requireAuth, checks the MySQL users table
 * for role = 'admin' matching the Supabase email.
 * Also links supabase_id if not yet linked.
 */
async function requireAdmin(req, res, next) {
  try {
    const email = req.supabaseUser.email;
    const supabaseId = req.supabaseUser.id;

    const [rows] = await query(
      'SELECT id, name, email, role, status FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: 'Account not found in system' });
    }

    const dbUser = rows[0];

    if (dbUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (dbUser.status === 'banned') {
      return res.status(403).json({ error: 'Account is suspended' });
    }

    // Link supabase_id if not yet set
    await query(
      'UPDATE users SET supabase_id = ? WHERE id = ? AND supabase_id IS NULL',
      [supabaseId, dbUser.id]
    );

    req.adminUser = dbUser;
    next();
  } catch (err) {
    console.error('[Auth] Admin check error:', err.message);
    return res.status(500).json({ error: 'Authorization check failed' });
  }
}

module.exports = { requireAuth, requireAdmin, getSupabaseAdmin };
