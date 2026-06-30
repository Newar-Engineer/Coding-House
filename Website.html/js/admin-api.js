/**
 * Admin API Client — Coding House
 * Fetch wrapper for Express backend + Supabase Storage uploads.
 * Requires: admin-config.js + admin-auth.js loaded first.
 */

var AdminAPI = (function() {

  // ── Toast notification helper ──
  function showToast(message, type) {
    // type: 'success' | 'error' | 'info'
    var existing = document.getElementById('admin-toast');
    if (existing) existing.remove();

    var colors = {
      success: { bg: 'rgba(16,185,129,.15)', border: 'rgba(16,185,129,.4)', text: '#10b981' },
      error:   { bg: 'rgba(244,63,94,.15)',  border: 'rgba(244,63,94,.4)',  text: '#f43f5e' },
      info:    { bg: 'rgba(168,85,247,.15)', border: 'rgba(168,85,247,.4)', text: '#c084fc' }
    };
    var c = colors[type] || colors.info;
    var icons = { success: '✓', error: '✕', info: 'ℹ' };

    var toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.style.cssText =
      'position:fixed;top:24px;right:24px;z-index:9999;padding:14px 22px;border-radius:12px;' +
      'font-size:14px;font-weight:600;font-family:Inter,sans-serif;display:flex;align-items:center;gap:10px;' +
      'animation:toastIn .3s ease;max-width:420px;box-shadow:0 8px 32px rgba(0,0,0,.4);' +
      'background:' + c.bg + ';border:1px solid ' + c.border + ';color:' + c.text + ';';
    toast.innerHTML = '<span style="font-size:18px">' + (icons[type] || 'ℹ') + '</span> ' + message;

    // Animation keyframes
    if (!document.getElementById('toast-keyframes')) {
      var style = document.createElement('style');
      style.id = 'toast-keyframes';
      style.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}' +
        '@keyframes toastOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(30px)}}';
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(function() {
      toast.style.animation = 'toastOut .3s ease forwards';
      setTimeout(function() { toast.remove(); }, 300);
    }, 4000);
  }

  // ── Generic fetch with auth ──
  async function apiFetch(endpoint, options) {
    var headers = await AdminAuth.getAuthHeaders();
    var url = ADMIN_CONFIG.API_BASE_URL + endpoint;

    var config = Object.assign({}, options || {}, { headers: headers });

    try {
      var resp = await fetch(url, config);
      var data = await resp.json();

      if (!resp.ok) {
        showToast(data.error || 'Request failed', 'error');
        return { ok: false, error: data.error, status: resp.status };
      }

      return { ok: true, data: data };
    } catch (err) {
      showToast('Network error: ' + err.message, 'error');
      return { ok: false, error: err.message };
    }
  }

  // ═══════════════════════════════════════
  //  USER CRUD
  // ═══════════════════════════════════════

  async function fetchUsers(page, search, filters) {
    var params = new URLSearchParams();
    if (page)    params.set('page', page);
    if (search)  params.set('search', search);
    if (filters) {
      if (filters.status) params.set('status', filters.status);
      if (filters.role)   params.set('role', filters.role);
      if (filters.limit)  params.set('limit', filters.limit);
    }
    return apiFetch('/users?' + params.toString());
  }

  async function getUser(id) {
    return apiFetch('/users/' + id);
  }

  async function createUser(userData) {
    var result = await apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (result.ok) showToast('User created successfully', 'success');
    return result;
  }

  async function updateUser(id, userData) {
    var result = await apiFetch('/users/' + id, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    if (result.ok) showToast('User updated successfully', 'success');
    return result;
  }

  async function deleteUser(id) {
    var result = await apiFetch('/users/' + id, { method: 'DELETE' });
    if (result.ok) showToast('User deleted successfully', 'success');
    return result;
  }

  async function getUserStats() {
    return apiFetch('/users/stats');
  }

  // ═══════════════════════════════════════
  //  IMAGE CRUD + SUPABASE STORAGE
  // ═══════════════════════════════════════

  async function fetchImages(category, search) {
    var params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search)   params.set('search', search);
    return apiFetch('/images?' + params.toString());
  }

  async function getImageStats() {
    return apiFetch('/images/stats');
  }

  /**
   * Upload image to Supabase Storage, then save metadata to MySQL via API.
   * @param {File} file — the File object from an input[type=file]
   * @param {{ category: string, linked_slug?: string, alt_text?: string }} metadata
   * @returns {{ ok: boolean, data?: object, error?: string }}
   */
  async function uploadImage(file, metadata) {
    // Client-side validation
    if (!ADMIN_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      showToast('Invalid file type. Allowed: JPEG, PNG, WebP, SVG', 'error');
      return { ok: false, error: 'Invalid file type' };
    }
    if (file.size > ADMIN_CONFIG.MAX_FILE_SIZE) {
      showToast('File too large. Maximum size: 5 MB', 'error');
      return { ok: false, error: 'File too large' };
    }

    // Generate unique filename
    var ext = file.name.split('.').pop().toLowerCase();
    var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
    var storagePath = metadata.category + '/' + Date.now() + '_' + safeName;

    try {
      // Upload to Supabase Storage
      var client = AdminAuth.getSupabaseClient();
      var uploadResult = await client.storage
        .from(ADMIN_CONFIG.STORAGE_BUCKET)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadResult.error) {
        showToast('Upload failed: ' + uploadResult.error.message, 'error');
        return { ok: false, error: uploadResult.error.message };
      }

      // Get public URL
      var urlResult = client.storage
        .from(ADMIN_CONFIG.STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      var publicUrl = urlResult.data.publicUrl;

      // Save metadata to MySQL via API
      var apiResult = await apiFetch('/images', {
        method: 'POST',
        body: JSON.stringify({
          filename:     file.name,
          storage_path: storagePath,
          url:          publicUrl,
          category:     metadata.category,
          linked_slug:  metadata.linked_slug || null,
          alt_text:     metadata.alt_text || null,
          file_size:    file.size,
          mime_type:    file.type
        })
      });

      if (apiResult.ok) {
        showToast('Image uploaded successfully', 'success');
      }
      return apiResult;
    } catch (err) {
      showToast('Upload error: ' + err.message, 'error');
      return { ok: false, error: err.message };
    }
  }

  async function updateImage(id, metadata) {
    var result = await apiFetch('/images/' + id, {
      method: 'PUT',
      body: JSON.stringify(metadata)
    });
    if (result.ok) showToast('Image metadata updated', 'success');
    return result;
  }

  async function deleteImage(id) {
    var result = await apiFetch('/images/' + id, { method: 'DELETE' });
    if (result.ok) showToast('Image deleted successfully', 'success');
    return result;
  }

  // ── Public API ──
  return {
    showToast:     showToast,
    fetchUsers:    fetchUsers,
    getUser:       getUser,
    createUser:    createUser,
    updateUser:    updateUser,
    deleteUser:    deleteUser,
    getUserStats:  getUserStats,
    fetchImages:   fetchImages,
    getImageStats: getImageStats,
    uploadImage:   uploadImage,
    updateImage:   updateImage,
    deleteImage:   deleteImage
  };
})();
