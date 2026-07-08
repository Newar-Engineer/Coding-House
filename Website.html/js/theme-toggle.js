/**
 * Coding House — Theme Toggle (Dark ↔ Light)
 * Persists preference in localStorage.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ch_theme';

  function getPreferred() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return 'dark'; // Default to the premium dark developer theme
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    var btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
  }

  function toggle() {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Apply on load
  applyTheme(getPreferred());

  // Bind button when DOM is ready
  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(getPreferred());
    var btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.addEventListener('click', toggle);
  });

  window.CodingHouseTheme = { toggle: toggle, apply: applyTheme };
})();
