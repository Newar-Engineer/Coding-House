/**
 * Image Routes — Coding House Admin API
 * Manages image metadata in MySQL. Actual files live in Supabase Storage.
 */
const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const { getSupabaseAdmin } = require('../middleware/auth');

const STORAGE_BUCKET = 'course-images';

// ── GET /api/images/stats ──
router.get('/stats', async (req, res) => {
  try {
    const [totalRows] = await query('SELECT COUNT(*) AS total FROM images');
    const [catRows] = await query(
      'SELECT category, COUNT(*) AS count FROM images GROUP BY category'
    );
    const byCategory = {};
    catRows.forEach(r => { byCategory[r.category] = r.count; });

    res.json({ total: totalRows[0].total, byCategory });
  } catch (err) {
    console.error('[Images] Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch image stats' });
  }
});

// ── GET /api/images — list all images ──
router.get('/', async (req, res) => {
  try {
    const category = (req.query.category || '').trim();
    const search   = (req.query.search || '').trim();

    let where = [];
    let params = [];

    if (category && ['course_banner', 'track_icon', 'instructor'].includes(category)) {
      where.push('i.category = ?');
      params.push(category);
    }
    if (search) {
      where.push('(i.filename LIKE ? OR i.alt_text LIKE ? OR i.linked_slug LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const [rows] = await query(
      `SELECT i.*, u.name AS uploader_name
       FROM images i
       LEFT JOIN users u ON i.uploaded_by = u.id
       ${whereClause}
       ORDER BY i.created_at DESC`,
      params
    );

    res.json({ images: rows });
  } catch (err) {
    console.error('[Images] List error:', err.message);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// ── POST /api/images — save image metadata after Supabase upload ──
router.post('/', async (req, res) => {
  try {
    const { filename, storage_path, url, category, linked_slug, alt_text, file_size, mime_type } = req.body;

    if (!filename || !storage_path || !url || !category) {
      return res.status(400).json({ error: 'filename, storage_path, url, and category are required' });
    }

    const validCategories = ['course_banner', 'track_icon', 'instructor'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category. Must be: ' + validCategories.join(', ') });
    }

    const uploadedBy = req.adminUser ? req.adminUser.id : null;

    const [result] = await query(
      `INSERT INTO images (filename, storage_path, url, category, linked_slug, alt_text, file_size, mime_type, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [filename, storage_path, url, category, linked_slug || null, alt_text || null,
       parseInt(file_size) || null, mime_type || null, uploadedBy]
    );

    const [newImg] = await query('SELECT * FROM images WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Image metadata saved', image: newImg[0] });
  } catch (err) {
    console.error('[Images] Create error:', err.message);
    res.status(500).json({ error: 'Failed to save image metadata' });
  }
});

// ── PUT /api/images/:id — update metadata ──
router.put('/:id', async (req, res) => {
  try {
    const { alt_text, linked_slug, category } = req.body;
    const imgId = req.params.id;

    const [existing] = await query('SELECT id FROM images WHERE id = ?', [imgId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Image not found' });

    const fields = [];
    const params = [];

    if (alt_text !== undefined)    { fields.push('alt_text = ?');    params.push(alt_text); }
    if (linked_slug !== undefined) { fields.push('linked_slug = ?'); params.push(linked_slug); }
    if (category !== undefined && ['course_banner', 'track_icon', 'instructor'].includes(category)) {
      fields.push('category = ?'); params.push(category);
    }

    if (fields.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    params.push(imgId);
    await query(`UPDATE images SET ${fields.join(', ')} WHERE id = ?`, params);

    const [updated] = await query('SELECT * FROM images WHERE id = ?', [imgId]);
    res.json({ message: 'Image updated', image: updated[0] });
  } catch (err) {
    console.error('[Images] Update error:', err.message);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// ── DELETE /api/images/:id — delete from MySQL + Supabase Storage ──
router.delete('/:id', async (req, res) => {
  try {
    const imgId = req.params.id;

    const [existing] = await query('SELECT * FROM images WHERE id = ?', [imgId]);
    if (existing.length === 0) return res.status(404).json({ error: 'Image not found' });

    const img = existing[0];

    // Delete from Supabase Storage
    try {
      const supabase = getSupabaseAdmin();
      const { error: storageErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([img.storage_path]);

      if (storageErr) {
        console.warn('[Images] Supabase Storage delete warning:', storageErr.message);
      }
    } catch (storageErr) {
      console.warn('[Images] Supabase Storage delete failed (non-fatal):', storageErr.message);
    }

    // Delete from MySQL
    await query('DELETE FROM images WHERE id = ?', [imgId]);

    res.json({ message: 'Image deleted successfully', deleted: img });
  } catch (err) {
    console.error('[Images] Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
