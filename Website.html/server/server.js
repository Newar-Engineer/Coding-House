/**
 * Coding House Admin Server — Express Entry Point
 * Bridges frontend ↔ MySQL, with Supabase Auth verification.
 */
require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');

const { testConnection } = require('./db/connection');
const { requireAuth, requireAdmin } = require('./middleware/auth');
const usersRouter  = require('./routes/users');
const imagesRouter = require('./routes/images');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── MIDDLEWARE ──
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting: 100 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// ── HEALTH CHECK (no auth) ──
app.get('/api/health', async (req, res) => {
  const dbOk = await testConnection();
  res.json({
    status: dbOk ? 'healthy' : 'degraded',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ── ADMIN ROLE VERIFICATION ENDPOINT (used by frontend after Supabase login) ──
app.get('/api/auth/verify-admin', requireAuth, requireAdmin, (req, res) => {
  res.json({
    admin: true,
    user: {
      id: req.adminUser.id,
      name: req.adminUser.name,
      email: req.adminUser.email,
      role: req.adminUser.role
    }
  });
});

// ── PROTECTED ROUTES ──
app.use('/api/users',  requireAuth, requireAdmin, usersRouter);
app.use('/api/images', requireAuth, requireAdmin, imagesRouter);

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ── ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── START ──
async function start() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   Coding House Admin Server           ║');
  console.log('╚═══════════════════════════════════════╝');

  const dbReady = await testConnection();
  if (!dbReady) {
    console.error('[Server] ⚠ MySQL not reachable — server will start but API calls will fail');
  }

  app.listen(PORT, () => {
    console.log(`[Server] ✓ Running on http://localhost:${PORT}`);
    console.log(`[Server] ✓ API base: http://localhost:${PORT}/api`);
    console.log(`[Server] ✓ Health:   http://localhost:${PORT}/api/health`);
  });
}

start();
