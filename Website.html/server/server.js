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

// Allow Chrome Private Network Access (PNA) from public HTTPS sites to local HTTP backend
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  
  // Intercept and handle OPTIONS preflight requests directly to ensure PNA headers are sent
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(204);
  }
  next();
});

const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://coding-house-1eotqvl9u-beastmr9766-1274s-projects.vercel.app',
  'https://coding-house.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.indexOf('localhost') !== -1 || origin.indexOf('127.0.0.1') !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
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

// ── PUBLIC ROUTES ──
app.get('/api/public/images', async (req, res) => {
  try {
    const { query } = require('./db/connection');
    const category = (req.query.category || '').trim();
    const search   = (req.query.search || '').trim();

    let where = [];
    let params = [];

    if (category && ['course_banner', 'track_icon', 'instructor'].includes(category)) {
      where.push('category = ?');
      params.push(category);
    }
    if (search) {
      where.push('(filename LIKE ? OR alt_text LIKE ? OR linked_slug LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const [rows] = await query(
      `SELECT id, filename, url, category, linked_slug, alt_text
       FROM images
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    res.json({ images: rows });
  } catch (err) {
    console.error('[Public Images] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch public images' });
  }
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
