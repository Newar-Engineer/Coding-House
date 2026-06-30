/**
 * Admin Auth — Coding House
 * Handles Supabase Auth login/logout/session for admin pages.
 * Requires: supabase-js CDN + admin-config.js loaded first.
 */

var AdminAuth = (function() {
  var supabase = null;

  function getClient() {
    if (!supabase) {
      if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
        console.error('[AdminAuth] Supabase JS client not loaded. Add the CDN script tag.');
        return null;
      }
      supabase = window.supabase.createClient(
        ADMIN_CONFIG.SUPABASE_URL,
        ADMIN_CONFIG.SUPABASE_ANON_KEY
      );
    }
    return supabase;
  }

  /**
   * Login with email/password via Supabase Auth.
   * On success, verifies admin role via Express API.
   * @returns {{ success: boolean, error?: string, user?: object }}
   */
  async function login(email, password) {
    try {
      var client = getClient();
      if (!client) return { success: false, error: 'Supabase client not initialized' };

      var result = await client.auth.signInWithPassword({ email: email, password: password });

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      // Verify admin role via Express API
      var token = result.data.session.access_token;
      var verifyResp = await fetch(ADMIN_CONFIG.API_BASE_URL + '/auth/verify-admin', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (!verifyResp.ok) {
        var errData = await verifyResp.json().catch(function() { return {}; });
        await client.auth.signOut();
        return { success: false, error: errData.error || 'Admin access denied' };
      }

      var adminData = await verifyResp.json();

      // Store admin info in session
      sessionStorage.setItem('codinghouse_admin', JSON.stringify(adminData.user));

      return { success: true, user: adminData.user };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    }
  }

  /**
   * Logout — signs out of Supabase and clears session.
   */
  async function logout() {
    try {
      var client = getClient();
      if (client) await client.auth.signOut();
    } catch (e) { /* ignore */ }
    sessionStorage.removeItem('codinghouse_admin');
    window.location.href = 'admin-login.html';
  }

  /**
   * Get current session access token (JWT).
   * @returns {Promise<string|null>}
   */
  async function getToken() {
    var client = getClient();
    if (!client) return null;
    var result = await client.auth.getSession();
    if (result.data && result.data.session) {
      return result.data.session.access_token;
    }
    return null;
  }

  /**
   * Get Authorization headers for API calls.
   * @returns {Promise<object>}
   */
  async function getAuthHeaders() {
    var token = await getToken();
    return {
      'Authorization': 'Bearer ' + (token || ''),
      'Content-Type': 'application/json'
    };
  }

  /**
   * Guard — redirect to admin-login.html if not authenticated.
   * Call this at the top of every admin page.
   */
  async function requireAdminSession() {
    var client = getClient();
    if (!client) {
      window.location.href = 'admin-login.html';
      return false;
    }

    var result = await client.auth.getSession();
    if (!result.data || !result.data.session) {
      window.location.href = 'admin-login.html';
      return false;
    }

    // Verify admin role is still valid
    var token = result.data.session.access_token;
    try {
      var resp = await fetch(ADMIN_CONFIG.API_BASE_URL + '/auth/verify-admin', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!resp.ok) {
        window.location.href = 'admin-login.html';
        return false;
      }
      var data = await resp.json();
      sessionStorage.setItem('codinghouse_admin', JSON.stringify(data.user));
      return true;
    } catch (e) {
      // If API is unreachable, allow access if session exists (graceful degradation)
      console.warn('[AdminAuth] API unreachable, using cached session');
      return !!sessionStorage.getItem('codinghouse_admin');
    }
  }

  /**
   * Get cached admin user info.
   */
  function getAdminUser() {
    try {
      return JSON.parse(sessionStorage.getItem('codinghouse_admin'));
    } catch (e) {
      return null;
    }
  }

  /**
   * Get the Supabase client (for storage uploads).
   */
  function getSupabaseClient() {
    return getClient();
  }

  return {
    login: login,
    logout: logout,
    getToken: getToken,
    getAuthHeaders: getAuthHeaders,
    requireAdminSession: requireAdminSession,
    getAdminUser: getAdminUser,
    getSupabaseClient: getSupabaseClient
  };
})();
