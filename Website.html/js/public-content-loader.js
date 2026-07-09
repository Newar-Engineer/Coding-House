/**
 * Public Content Loader — Coding House
 * Fetches landing page data from /api/public/content and patches
 * the existing static DOM elements with dynamic values.
 * This is a progressive enhancement — if the API is unreachable
 * the page falls back to its hardcoded static content.
 */
(function() {
  'use strict';

  var API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : '';

  async function loadPublicContent() {
    try {
      var res = await fetch(API_BASE + '/api/public/content');
      if (!res.ok) return;
      var data = await res.json();

      // ── Hero Section ──
      if (data.hero) {
        var h = data.hero;
        var headlineEl = document.querySelector('.hero-headline, .hero h1, [data-content="headline"]');
        if (headlineEl && h.headline) headlineEl.innerHTML = h.headline;

        var descEl = document.querySelector('.hero-description, .hero p, [data-content="description"]');
        if (descEl && h.description) descEl.textContent = h.description;

        // Counter stats
        if (h.stat_languages) {
          var langStat = document.querySelector('[data-stat="languages"]');
          if (langStat) langStat.setAttribute('data-target', h.stat_languages);
        }
        if (h.stat_challenges) {
          var challStat = document.querySelector('[data-stat="challenges"]');
          if (challStat) challStat.setAttribute('data-target', h.stat_challenges);
        }
        if (h.stat_projects) {
          var projStat = document.querySelector('[data-stat="projects"]');
          if (projStat) projStat.setAttribute('data-target', h.stat_projects);
        }
        if (h.stat_students) {
          var studStat = document.querySelector('[data-stat="students"]');
          if (studStat) studStat.setAttribute('data-target', h.stat_students);
        }
      }

      // ── Global Settings (SEO, CTA) ──
      if (data.settings) {
        var s = data.settings;
        if (s.site_title) document.title = s.site_title;
        if (s.meta_description) {
          var metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.setAttribute('content', s.meta_description);
        }
        if (s.seo_keywords) {
          var metaKw = document.querySelector('meta[name="keywords"]');
          if (metaKw) metaKw.setAttribute('content', s.seo_keywords);
        }
        if (s.cta_text) {
          var ctaBtn = document.querySelector('[data-content="cta"]');
          if (ctaBtn) {
            ctaBtn.textContent = s.cta_text;
            if (s.cta_url) ctaBtn.setAttribute('href', s.cta_url);
          }
        }
      }

      console.log('[ContentLoader] Dynamic content loaded successfully');
    } catch (err) {
      console.warn('[ContentLoader] API unavailable — using static fallback', err.message);
    }
  }

  // Load after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPublicContent);
  } else {
    loadPublicContent();
  }
})();
