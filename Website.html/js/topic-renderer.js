/**
 * Coding House — Topic Renderer Engine v2.0
 * Pagination · Search · Level Switching · Copy Code · Animations
 */
(function () {
  'use strict';

  class TopicRenderer {
    constructor(containerId, topicsData, options) {
      options = options || {};
      this.container = document.getElementById(containerId);
      this.allTopics = topicsData || [];
      this.currentLevel = 'beg';
      this.currentPage = 1;
      this.perPage = options.perPage || 10;
      this.searchQuery = '';
      this.langLabel = options.langLabel || 'Topic';
      this.accentColor = options.accentColor || '#6366f1';
      
      var defaultLang = window.location.pathname.split('/').pop().replace('.html', '') || 'javascript';
      this.lang = options.lang || defaultLang;

      var self = this;
      this._loadPrism(function () {
        self._init();
      });
    }

    _loadPrism(callback) {
      if (window.Prism) {
        callback();
        return;
      }

      if (!document.getElementById('prism-css')) {
        var link = document.createElement('link');
        link.id = 'prism-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
        document.head.appendChild(link);
      }

      var self = this;
      var script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
      script.onload = function () {
        if (self.lang === 'javascript' || self.lang === 'html' || self.lang === 'css') {
          callback();
          return;
        }
        var compScript = document.createElement('script');
        compScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-' + self.lang + '.min.js';
        compScript.onload = callback;
        compScript.onerror = callback;
        document.head.appendChild(compScript);
      };
      script.onerror = callback;
      document.head.appendChild(script);
    }

    /* ── Bootstrap ── */
    _init() {
      this._injectSearch();
      this._bindLevelBtns();
      this._updateTopicCount();
      this.render();
    }

    _injectSearch() {
      var wrap = document.createElement('div');
      wrap.className = 'tr-search-wrap';
      wrap.innerHTML =
        '<div class="tr-search-box">' +
          '<span class="tr-search-icon">\uD83D\uDD0D</span>' +
          '<input type="text" id="tr-search" class="tr-search-input" placeholder="Search ' + this.allTopics.length + ' topics\u2026">' +
        '</div>';
      this.container.parentNode.insertBefore(wrap, this.container);

      var self = this;
      document.getElementById('tr-search').addEventListener('input', function (e) {
        self.searchQuery = e.target.value.toLowerCase().trim();
        self.currentPage = 1;
        self.render();
      });
    }

    _bindLevelBtns() {
      var self = this;
      document.querySelectorAll('.level-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          document.querySelectorAll('.level-btn').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          self.currentLevel = btn.dataset.level;
          self.currentPage = 1;
          self.render();
        });
      });
    }

    _updateTopicCount() {
      var badge = document.getElementById('topic-total-badge');
      if (badge) badge.textContent = this.allTopics.length + ' Topics';
    }

    /* ── Filter ── */
    _filtered() {
      if (!this.searchQuery) return this.allTopics;
      var q = this.searchQuery;
      return this.allTopics.filter(function (t) {
        return t.title.toLowerCase().indexOf(q) !== -1;
      });
    }

    /* ── Render ── */
    render() {
      var filtered = this._filtered();
      var total = filtered.length;
      var pages = Math.ceil(total / this.perPage) || 1;
      if (this.currentPage > pages) this.currentPage = pages;
      var start = (this.currentPage - 1) * this.perPage;
      var slice = filtered.slice(start, start + this.perPage);

      var html = '';

      /* Counter bar */
      html += '<div class="tr-counter">' +
        '<div class="tr-counter-left"><span class="tr-badge">' + total + '</span> topics' +
        (this.searchQuery ? ' matching \u201C<em>' + this._esc(this.searchQuery) + '</em>\u201D' : ' available') +
        '</div>' +
        '<div class="tr-counter-right">Page ' + this.currentPage + ' / ' + pages + '</div>' +
      '</div>';

      /* Cards */
      for (var i = 0; i < slice.length; i++) {
        var t = slice[i];
        var d = t[this.currentLevel];
        var delay = (i * 0.055).toFixed(3);
        html += '<div class="topic-card tr-enter" style="animation-delay:' + delay + 's">' +
          '<div class="topic-header">' +
            '<span class="topic-num">' + t.num + '</span>' +
            '<h3 class="topic-title">' + t.title + '</h3>' +
            '<span class="tr-tier-label">' + this.langLabel + '</span>' +
          '</div>' +
          '<p class="code-desc">' + d.desc + '</p>' +
          '<div class="code-container">' +
            '<button class="tr-copy" data-idx="' + i + '">Copy</button>' +
            '<pre style="margin:0" class="language-' + this.lang + '"><code class="language-' + this.lang + '" data-idx="' + i + '">' + this._esc(d.code) + '</code></pre>' +
          '</div>' +
          '<div class="code-usecase">' + d.usecase + '</div>' +
        '</div>';
      }

      /* Pagination */
      if (pages > 1) {
        html += '<div class="tr-pagination">';
        html += '<button class="tr-page-btn" data-p="' + (this.currentPage - 1) + '"' + (this.currentPage <= 1 ? ' disabled' : '') + '>\u2190 Prev</button>';
        html += '<div class="tr-page-nums">';
        var range = this._pageRange(this.currentPage, pages);
        for (var j = 0; j < range.length; j++) {
          var p = range[j];
          if (p === '...') {
            html += '<span class="tr-dots">\u2026</span>';
          } else {
            html += '<button class="tr-page-num' + (p === this.currentPage ? ' active' : '') + '" data-p="' + p + '">' + p + '</button>';
          }
        }
        html += '</div>';
        html += '<button class="tr-page-btn" data-p="' + (this.currentPage + 1) + '"' + (this.currentPage >= pages ? ' disabled' : '') + '>Next \u2192</button>';
        html += '</div>';
      }

      this.container.innerHTML = html;

      // Trigger Prism highlighting on rendered code elements
      if (window.Prism) {
        this.container.querySelectorAll('code').forEach(function (block) {
          window.Prism.highlightElement(block);
        });
      }

      this._bindPagination(pages);
      this._bindCopy();
    }

    /* ── Pagination helpers ── */
    _pageRange(cur, tot) {
      if (tot <= 7) { var a = []; for (var i = 1; i <= tot; i++) a.push(i); return a; }
      var r = [1];
      if (cur > 3) r.push('...');
      for (var i = Math.max(2, cur - 1); i <= Math.min(tot - 1, cur + 1); i++) r.push(i);
      if (cur < tot - 2) r.push('...');
      r.push(tot);
      return r;
    }

    _bindPagination(pages) {
      var self = this;
      this.container.querySelectorAll('[data-p]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var p = parseInt(btn.dataset.p);
          if (p >= 1 && p <= pages) {
            self.currentPage = p;
            self.render();
            self.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }

    _bindCopy() {
      this.container.querySelectorAll('.tr-copy').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var code = btn.parentElement.querySelector('code');
          if (code && navigator.clipboard) {
            navigator.clipboard.writeText(code.innerText).then(function () {
              btn.textContent = '\u2713 Copied!';
              btn.classList.add('copied');
              setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1600);
            });
          }
        });
      });
    }

    /* ── Escape HTML ── */
    _esc(text) {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    /* ── Public API ── */
    goPage(n) {
      var pages = Math.ceil(this._filtered().length / this.perPage) || 1;
      if (n >= 1 && n <= pages) { this.currentPage = n; this.render(); }
    }
  }

  window.TopicRenderer = TopicRenderer;
})();
