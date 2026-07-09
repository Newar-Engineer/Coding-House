/**
 * Content Routes — Coding House Admin & Public API
 * Handles database CRUD operations for all dynamic page sections.
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// ── helper for logging audit trails ──
async function logAudit(adminUser, action, table, details) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, user_email, action, target_table, change_details)
       VALUES (?, ?, ?, ?, ?)`,
      [adminUser ? adminUser.id : null, adminUser ? adminUser.email : 'System', action, table, details]
    );
  } catch (err) {
    console.error('[Audit Log] Failed to insert log:', err.message);
  }
}

// =========================================================================
//  PUBLIC API ENDPOINTS (No authentication required)
// =========================================================================

// ── GET /api/public/content — fetch all landing page components ──
router.get('/public/content', async (req, res) => {
  try {
    const [settings] = await query('SELECT * FROM global_settings LIMIT 1');
    const [hero]     = await query('SELECT * FROM hero_section LIMIT 1');
    const [tracks]   = await query('SELECT * FROM tracks ORDER BY display_order ASC');
    const [features] = await query('SELECT * FROM platform_features ORDER BY display_order ASC');
    const [projects] = await query('SELECT * FROM professional_projects ORDER BY display_order ASC');
    const [stories]  = await query('SELECT * FROM testimonials ORDER BY display_order ASC');
    const [pricing]  = await query('SELECT * FROM pricing_plans ORDER BY display_order ASC');

    res.json({
      settings: settings[0] || null,
      hero:     hero[0] || null,
      tracks:   tracks,
      features: features,
      projects: projects,
      testimonials: stories,
      pricing:  pricing
    });
  } catch (err) {
    console.error('[Public API] fetch landing content error:', err.message);
    res.status(500).json({ error: 'Failed to fetch page content' });
  }
});

// ── GET /api/public/languages — fetch all languages ──
router.get('/public/languages', async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM languages ORDER BY name ASC');
    res.json({ languages: rows });
  } catch (err) {
    console.error('[Public API] fetch languages error:', err.message);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

// ── GET /api/public/languages/:slug/topics — fetch topics for a language ──
router.get('/public/languages/:slug/topics', async (req, res) => {
  try {
    const { slug } = req.params;
    const [langRows] = await query('SELECT id, name, slug FROM languages WHERE slug = ?', [slug]);
    
    if (langRows.length === 0) {
      return res.status(404).json({ error: 'Language not found' });
    }

    const language = langRows[0];
    const [topicRows] = await query(
      `SELECT num, title,
              beg_desc AS begDesc, beg_code AS begCode, beg_usecase AS begUsecase,
              int_desc AS intDesc, int_code AS intCode, int_usecase AS intUsecase,
              adv_desc AS advDesc, adv_code AS advCode, adv_usecase AS advUsecase,
              pro_desc AS proDesc, pro_code AS proCode, pro_usecase AS proUsecase
       FROM lessons
       WHERE language_id = ?
       ORDER BY num ASC`,
      [language.id]
    );

    // Format output to match local JSON structures
    const formattedTopics = topicRows.map(r => {
      const topic = {
        num: r.num,
        title: r.title
      };
      if (r.begDesc || r.begCode || r.begUsecase) {
        topic.beg = { desc: r.begDesc, code: r.begCode, usecase: r.begUsecase };
      }
      if (r.intDesc || r.intCode || r.intUsecase) {
        topic.int = { desc: r.intDesc, code: r.intCode, usecase: r.intUsecase };
      }
      if (r.advDesc || r.advCode || r.advUsecase) {
        topic.adv = { desc: r.advDesc, code: r.advCode, usecase: r.advUsecase };
      }
      if (r.proDesc || r.proCode || r.proUsecase) {
        topic.pro = { desc: r.proDesc, code: r.proCode, usecase: r.proUsecase };
      }
      return topic;
    });

    res.json(formattedTopics);
  } catch (err) {
    console.error('[Public API] fetch topics error:', err.message);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// =========================================================================
//  ADMIN API ENDPOINTS (Protected)
// =========================================================================

const VALID_SECTIONS = [
  'global_settings', 'hero_section', 'languages', 'lessons', 'tracks',
  'platform_features', 'professional_projects', 'coding_challenges',
  'testimonials', 'pricing_plans', 'audit_logs'
];

// Helper validation for section names
function validateSection(req, res, next) {
  const { section } = req.params;
  if (!VALID_SECTIONS.includes(section)) {
    return res.status(400).json({ error: `Invalid content section: ${section}` });
  }
  next();
}

// Apply admin protection & validate section
router.use('/content/:section', requireAuth, requireAdmin, validateSection);
router.use('/content', requireAuth, requireAdmin);

// ── GET /api/content/audit-logs — fetch audit logs ──
router.get('/content/audit-logs', async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
    res.json({ logs: rows });
  } catch (err) {
    console.error('[Admin API] fetch audit logs error:', err.message);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// ── GET /api/content/:section — list items in a section ──
router.get('/content/:section', async (req, res) => {
  try {
    const { section } = req.params;
    let rows;

    if (section === 'global_settings' || section === 'hero_section') {
      [rows] = await query(`SELECT * FROM ${section} LIMIT 1`);
      return res.json(rows[0] || {});
    }

    let orderField = 'id';
    if (['tracks', 'platform_features', 'professional_projects', 'testimonials', 'pricing_plans', 'coding_challenges'].includes(section)) {
      orderField = 'display_order';
    } else if (section === 'languages') {
      orderField = 'display_order, name';
    } else if (section === 'lessons') {
      orderField = 'language_id, num';
    }

    let where = [];
    const params = [];
    if (section === 'lessons' && req.query.language_id) {
      where.push('language_id = ?');
      params.push(req.query.language_id);
    }
    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    [rows] = await query(`SELECT * FROM ${section} ${whereClause} ORDER BY ${orderField} ASC`, params);
    res.json({ items: rows });
  } catch (err) {
    console.error(`[Admin API] fetch ${req.params.section} error:`, err.message);
    res.status(500).json({ error: `Failed to fetch ${req.params.section}` });
  }
});

// ── POST /api/content/:section — create item ──
router.post('/content/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const body = req.body;

    if (section === 'global_settings' || section === 'hero_section') {
      return res.status(400).json({ error: 'Single-row sections can only be updated' });
    }

    // Build fields and params dynamically from req.body
    const fields = [];
    const placeholders = [];
    const params = [];

    // Auto calculate display order if missing
    if (['tracks', 'platform_features', 'professional_projects', 'testimonials', 'pricing_plans', 'coding_challenges'].includes(section) && body.display_order === undefined) {
      const [maxRow] = await query(`SELECT COALESCE(MAX(display_order), -1) AS maxOrder FROM ${section}`);
      body.display_order = maxRow[0].maxOrder + 1;
    }

    Object.keys(body).forEach(key => {
      fields.push(key);
      placeholders.push('?');
      let val = body[key];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      params.push(val);
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }

    const [result] = await query(
      `INSERT INTO ${section} (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
      params
    );

    await logAudit(req.adminUser, 'CREATE', section, `Created item ID ${result.insertId}: ${JSON.stringify(body)}`);

    res.status(201).json({ id: result.insertId, message: 'Item created successfully' });
  } catch (err) {
    console.error(`[Admin API] create ${req.params.section} error:`, err.message);
    res.status(500).json({ error: `Failed to create item in ${req.params.section}` });
  }
});

// ── PUT /api/content/:section/:id — update single-row or by-id ──
router.put('/content/:section/:id', async (req, res) => {
  try {
    const { section, id } = req.params;
    const body = req.body;

    const fields = [];
    const params = [];

    Object.keys(body).forEach(key => {
      if (key === 'id') return; // protect id field
      fields.push(`${key} = ?`);
      let val = body[key];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      params.push(val);
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No data provided for update' });
    }

    if (section === 'global_settings' || section === 'hero_section') {
      await query(`UPDATE ${section} SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
      await logAudit(req.adminUser, 'UPDATE', section, `Updated single row configuration`);
    } else {
      const [check] = await query(`SELECT id FROM ${section} WHERE id = ?`, [id]);
      if (check.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      await query(`UPDATE ${section} SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
      await logAudit(req.adminUser, 'UPDATE', section, `Updated item ID ${id}: ${JSON.stringify(body)}`);
    }

    res.json({ message: 'Item updated successfully' });
  } catch (err) {
    console.error(`[Admin API] update ${req.params.section} error:`, err.message);
    res.status(500).json({ error: `Failed to update item in ${req.params.section}` });
  }
});

// ── DELETE /api/content/:section/:id — delete item ──
router.delete('/content/:section/:id', async (req, res) => {
  try {
    const { section, id } = req.params;

    if (section === 'global_settings' || section === 'hero_section') {
      return res.status(400).json({ error: 'Single-row configurations cannot be deleted' });
    }

    const [check] = await query(`SELECT id FROM ${section} WHERE id = ?`, [id]);
    if (check.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await query(`DELETE FROM ${section} WHERE id = ?`, [id]);
    await logAudit(req.adminUser, 'DELETE', section, `Deleted item ID ${id}`);

    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error(`[Admin API] delete ${req.params.section} error:`, err.message);
    res.status(500).json({ error: `Failed to delete item from ${req.params.section}` });
  }
});

// ── PUT /api/content/:section/reorder — update drag-and-drop order ──
router.put('/content/:section/reorder', async (req, res) => {
  try {
    const { section } = req.params;
    const { orders } = req.body; // e.g. [{"id": 3, "order": 0}, {"id": 1, "order": 1}]

    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'Invalid orders format. Must be an array of objects.' });
    }

    for (const item of orders) {
      await query(`UPDATE ${section} SET display_order = ? WHERE id = ?`, [item.order, item.id]);
    }

    await logAudit(req.adminUser, 'REORDER', section, `Reordered items`);
    res.json({ message: 'Items reordered successfully' });
  } catch (err) {
    console.error(`[Admin API] reorder ${req.params.section} error:`, err.message);
    res.status(500).json({ error: `Failed to reorder items in ${req.params.section}` });
  }
});

module.exports = router;
