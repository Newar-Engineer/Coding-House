/**
 * Coding House — Topic Renderer Engine v3.0
 * ──────────────────────────────────────────
 * 4-Tier Support · Collapsible Topics · Code Runner · Bookmarks
 * Progress Tracking · Enhanced Search · Pagination · Toast Notifications
 */
(function () {
  'use strict';

  var LEVELS = [
    { key: 'beg', label: 'Beginner',     icon: '\uD83D\uDFE2', color: '#10b981' },
    { key: 'int', label: 'Intermediate',  icon: '\uD83D\uDFE1', color: '#f5b942' },
    { key: 'adv', label: 'Advanced',      icon: '\uD83D\uDFE0', color: '#f97316' },
    { key: 'pro', label: 'Professional',  icon: '\uD83D\uDD34', color: '#ef4444' }
  ];

  var AGENT_LABELS = {
    c: 'C',
    cpp: 'C++',
    csharp: 'C#',
    dart: 'Dart',
    go: 'Go',
    java: 'Java',
    javascript: 'JavaScript',
    kotlin: 'Kotlin',
    matlab: 'MATLAB',
    php: 'PHP',
    python: 'Python',
    r: 'R',
    ruby: 'Ruby',
    rust: 'Rust',
    swift: 'Swift',
    typescript: 'TypeScript'
  };

  class TopicRenderer {
    constructor(containerId, topicsData, options) {
      options = options || {};
      this.container = document.getElementById(containerId);
      this.currentLevel = 'beg';
      this.currentPage = 1;
      this.perPage = options.perPage || 10;
      this.searchQuery = '';
      this.langLabel = options.langLabel || 'Topic';
      this.accentColor = options.accentColor || '#6366f1';
      this.showBookmarksOnly = false;

      var defaultLang = window.location.pathname.split('/').pop().replace('.html', '') || 'javascript';
      this.lang = options.lang || defaultLang;

      this.allTopics = [];
      this._storageKeyBookmarks = 'ch_bookmarks_' + this.lang;
      this._storageKeyComplete = 'ch_complete_' + this.lang;
      this._bookmarks = this._loadJSON(this._storageKeyBookmarks, []);
      this._completed = this._loadJSON(this._storageKeyComplete, []);

      var self = this;

      this._loadPrism(function () {
        var onFetchError = function (err) {
          console.error('Failed to load topics:', err);
          if (window.location.protocol === 'file:') {
            self.container.innerHTML =
              '<div class="topic-card" style="border-color:#f59e0b;background:rgba(245,158,11,0.06);text-align:center;padding:32px">' +
                '<h3 style="color:#f59e0b;margin-bottom:12px;font-family:\'Space Grotesk\',sans-serif">\u26A0\uFE0F Local Security Block (CORS)</h3>' +
                '<p class="code-desc" style="margin-bottom:16px">Browsers restrict loading JSON via <code>file://</code> protocol.</p>' +
                '<div class="code-usecase" style="border-left-color:#f59e0b;color:#f59e0b;text-align:left;background:rgba(245,158,11,0.1)">' +
                  '<strong>How to run:</strong><br>' +
                  '1. Right-click <code>index.html</code> → <strong>"Open with Live Server"</strong> in VS Code<br>' +
                  '2. Or run: <code>npx http-server</code> or <code>python -m http.server</code>' +
                '</div>' +
              '</div>';
          } else {
            self.container.innerHTML = '<p class="code-desc" style="text-align:center">Failed to load course contents. Please refresh.</p>';
          }
        };

        if (!topicsData) {
          var localKey = 'codinghouse_topics_' + self.lang;
          var cached = localStorage.getItem(localKey);
          if (cached) {
            self.allTopics = JSON.parse(cached);
            self._init();
          } else {
            fetch('data/topics/' + self.lang + '.json')
              .then(function (res) { return res.json(); })
              .then(function (data) {
                self.allTopics = data;
                localStorage.setItem(localKey, JSON.stringify(data));
                self._init();
              })
              .catch(onFetchError);
          }
        } else if (typeof topicsData === 'string') {
          fetch(topicsData)
            .then(function (res) { return res.json(); })
            .then(function (data) {
              self.allTopics = data;
              self._init();
            })
            .catch(onFetchError);
        } else if (Array.isArray(topicsData)) {
          self.allTopics = topicsData;
          self._init();
        } else {
          self._init();
        }
      });
    }

    /* ── Prism.js Dynamic Loader ── */
    _loadPrism(callback) {
      if (window.Prism) { callback(); return; }
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
        if (['javascript', 'html', 'css', 'js'].indexOf(self.lang) !== -1) {
          callback(); return;
        }
        var langMap = { cpp: 'cpp', csharp: 'csharp', typescript: 'typescript' };
        var compLang = langMap[self.lang] || self.lang;
        var compScript = document.createElement('script');
        compScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-' + compLang + '.min.js';
        compScript.onload = callback;
        compScript.onerror = callback;
        document.head.appendChild(compScript);
      };
      script.onerror = callback;
      document.head.appendChild(script);
    }

    /* ── Bootstrap ── */
    _init() {
      this._upgradeLevelButtons();
      this._injectSearch();
      this._injectProgressBar();
      this._updateTopicCount();
      this._injectBackToTop();
      this._injectToast();
      this.render();
    }

    /* ── Upgrade Level Buttons to 4 Tiers ── */
    _upgradeLevelButtons() {
      var levelSelector = document.querySelector('.level-selector');
      if (!levelSelector) return;
      levelSelector.innerHTML = '';
      var self = this;
      LEVELS.forEach(function (lv) {
        var btn = document.createElement('button');
        btn.className = 'level-btn' + (lv.key === self.currentLevel ? ' active' : '');
        btn.dataset.level = lv.key;
        btn.textContent = lv.icon + ' ' + lv.label;
        btn.style.cssText = lv.key === self.currentLevel
          ? 'background:linear-gradient(135deg,' + lv.color + ',' + lv.color + '99);border-color:' + lv.color + ';color:#fff;box-shadow:0 4px 12px ' + lv.color + '4d'
          : '';
        btn.addEventListener('click', function () {
          self.currentLevel = lv.key;
          self.currentPage = 1;
          levelSelector.querySelectorAll('.level-btn').forEach(function (b, idx) {
            b.classList.remove('active');
            b.style.cssText = '';
          });
          btn.classList.add('active');
          btn.style.cssText = 'background:linear-gradient(135deg,' + lv.color + ',' + lv.color + '99);border-color:' + lv.color + ';color:#fff;box-shadow:0 4px 12px ' + lv.color + '4d';
          self.render();
        });
        levelSelector.appendChild(btn);
      });
    }

    /* ── Search Bar ── */
    _injectSearch() {
      var wrap = document.createElement('div');
      wrap.className = 'tr-search-wrap';
      wrap.innerHTML =
        '<div class="tr-search-box">' +
          '<span class="tr-search-icon">\uD83D\uDD0D</span>' +
          '<input type="text" id="tr-search" class="tr-search-input" placeholder="Search ' + this.allTopics.length + ' topics\u2026">' +
          '<button id="tr-bookmark-filter" style="position:absolute;right:14px;background:none;border:none;font-size:18px;cursor:pointer;opacity:0.4;padding:4px" title="Show bookmarks only">\u2764</button>' +
        '</div>';
      this.container.parentNode.insertBefore(wrap, this.container);

      var self = this;
      document.getElementById('tr-search').addEventListener('input', function (e) {
        self.searchQuery = e.target.value.toLowerCase().trim();
        self.currentPage = 1;
        self.render();
      });
      document.getElementById('tr-bookmark-filter').addEventListener('click', function () {
        self.showBookmarksOnly = !self.showBookmarksOnly;
        this.style.opacity = self.showBookmarksOnly ? '1' : '0.4';
        this.style.color = self.showBookmarksOnly ? '#ff5d72' : '';
        self.currentPage = 1;
        self.render();
      });
    }

    /* ── Progress Bar ── */
    _injectProgressBar() {
      var wrap = document.createElement('div');
      wrap.className = 'tr-progress-wrap';
      wrap.id = 'tr-progress-wrap';
      this.container.parentNode.insertBefore(wrap, this.container);
    }

    _updateProgressBar() {
      var wrap = document.getElementById('tr-progress-wrap');
      if (!wrap) return;
      var total = this.allTopics.length;
      var done = this._completed.length;
      var pct = total > 0 ? Math.round((done / total) * 100) : 0;
      wrap.innerHTML =
        '<div class="tr-progress-label">' +
          '<span>\u2705 ' + done + ' / ' + total + ' topics completed</span>' +
          '<span style="font-weight:700;color:' + this.accentColor + '">' + pct + '%</span>' +
        '</div>' +
        '<div class="tr-progress-bar"><div class="tr-progress-fill" style="width:' + pct + '%;background:linear-gradient(90deg,' + this.accentColor + ',' + this.accentColor + '99)"></div></div>';
    }

    /* ── Topic Count Badge ── */
    _updateTopicCount() {
      var badge = document.getElementById('topic-total-badge');
      if (badge) badge.textContent = this.allTopics.length + ' Topics';
    }

    /* ── Back to Top ── */
    _injectBackToTop() {
      var btn = document.createElement('button');
      btn.className = 'tr-back-top';
      btn.id = 'tr-back-top';
      btn.innerHTML = '\u2191';
      btn.title = 'Back to top';
      btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      document.body.appendChild(btn);
      window.addEventListener('scroll', function () {
        btn.classList.toggle('show', window.scrollY > 400);
      });
    }

    /* ── Toast ── */
    _injectToast() {
      if (document.getElementById('tr-toast')) return;
      var toast = document.createElement('div');
      toast.className = 'tr-toast';
      toast.id = 'tr-toast';
      document.body.appendChild(toast);
    }

    _showToast(msg) {
      var el = document.getElementById('tr-toast');
      if (!el) return;
      el.textContent = msg;
      el.classList.add('show');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
    }

    /* ── localStorage helpers ── */
    _loadJSON(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) || fallback; }
      catch (e) { return fallback; }
    }
    _saveJSON(key, data) {
      try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* quota */ }
    }

    /* ── Filter ── */
    _filtered() {
      var q = this.searchQuery;
      var self = this;
      var topics = this.allTopics;
      if (this.showBookmarksOnly) {
        topics = topics.filter(function (t) {
          return self._bookmarks.indexOf(t.num) !== -1;
        });
      }
      if (!q) return topics;
      return topics.filter(function (t) {
        var d = t[self.currentLevel] || t.int || {};
        return t.title.toLowerCase().indexOf(q) !== -1 ||
               (d.desc || '').toLowerCase().indexOf(q) !== -1 ||
               (d.code || '').toLowerCase().indexOf(q) !== -1;
      });
    }

    /* ── Main Render ── */
    render() {
      var filtered = this._filtered();
      var total = filtered.length;
      var pages = Math.ceil(total / this.perPage) || 1;
      if (this.currentPage > pages) this.currentPage = pages;
      var start = (this.currentPage - 1) * this.perPage;
      var slice = filtered.slice(start, start + this.perPage);
      var self = this;

      var html = '';

      /* Counter bar */
      html += '<div class="tr-counter">' +
        '<div class="tr-counter-left"><span class="tr-badge">' + total + '</span> topics' +
        (this.searchQuery ? ' matching \u201C<em>' + this._esc(this.searchQuery) + '</em>\u201D' : ' available') +
        (this.showBookmarksOnly ? ' <span style="color:#ff5d72">\u2764 bookmarked</span>' : '') +
        '</div>' +
        '<div class="tr-counter-right">Page ' + this.currentPage + ' / ' + pages + '</div>' +
      '</div>';

      /* Expand/Collapse All */
      html += '<div style="display:flex;gap:8px;margin-bottom:16px">' +
        '<button class="tr-copy" id="tr-expand-all" style="position:static">\u25BC Expand All</button>' +
        '<button class="tr-copy" id="tr-collapse-all" style="position:static">\u25B2 Collapse All</button>' +
      '</div>';

      /* Cards */
      for (var i = 0; i < slice.length; i++) {
        var t = slice[i];
        var d = t[this.currentLevel];
        var hasContent = !!d;
        if (!hasContent) { d = t.int || t.beg || { desc: 'Coming soon...', code: '// Content for this tier is being developed', usecase: 'Check back later!' }; }
        var delay = (i * 0.055).toFixed(3);
        var collapsed = i >= 3 ? ' collapsed' : '';
        var isBookmarked = this._bookmarks.indexOf(t.num) !== -1;
        var isComplete = this._completed.indexOf(t.num + '_' + this.currentLevel) !== -1;
        var topicId = 'topic-' + t.num + '-' + this.currentLevel;
        var agentLabel = AGENT_LABELS[this.lang] || this.langLabel.replace(/\s+Tier$/i, '') || this.lang;
        var agentHref = 'user/ai-assistant.html?language=' + encodeURIComponent(this.lang) +
          '&topic=' + encodeURIComponent(t.title);

        html += '<div class="topic-card tr-enter' + collapsed + '" data-topic="' + t.num + '" style="animation-delay:' + delay + 's" id="' + topicId + '">';

        /* Header */
        html += '<div class="topic-header" data-toggle="' + topicId + '">' +
            '<span class="topic-num">' + t.num + '</span>' +
            '<h3 class="topic-title" style="flex:1;margin-left:12px">' + t.title + '</h3>' +
            '<button class="tr-bookmark' + (isBookmarked ? ' active' : '') + '" data-num="' + t.num + '" title="Bookmark">' +
              (isBookmarked ? '\u2764\uFE0F' : '\uD83E\uDD0D') +
            '</button>' +
            '<span class="tr-tier-label">' + this.langLabel + '</span>' +
            '<span class="expand-icon" style="margin-left:12px">\u25BC</span>' +
          '</div>';

        /* Body (collapsible) */
        html += '<div class="topic-body">';

        if (!hasContent) {
          html += '<div style="padding:16px 0"><span style="background:rgba(249,115,22,0.15);color:#f97316;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600">\uD83D\uDEA7 Coming Soon — Advanced content is being developed</span></div>';
        }

        html += '<p class="code-desc">' + d.desc + '</p>' +
          '<div class="code-container">' +
            '<button class="tr-copy" data-idx="' + (start + i) + '">Copy</button>';

        /* Run button for JavaScript */
        if (this.lang === 'javascript' || this.lang === 'js') {
          html += '<button class="tr-run" data-code-idx="' + (start + i) + '">\u25B6 Run</button>';
        }

        html += '<pre style="margin:0" class="language-' + this.lang + '"><code class="language-' + this.lang + '" data-idx="' + (start + i) + '">' + this._esc(d.code) + '</code></pre>' +
          '</div>';

        /* Output panel (JS only) */
        if (this.lang === 'javascript' || this.lang === 'js') {
          html += '<div class="tr-output" id="output-' + (start + i) + '" style="display:none">' +
            '<div class="tr-output-header"><span>\u25B6 Output</span><button class="tr-copy" style="position:static;font-size:10px" data-clear="' + (start + i) + '">Clear</button></div>' +
            '<div class="output-content"></div>' +
          '</div>';
        }

        html += '<div class="code-usecase">' + d.usecase + '</div>';

        html += '<div class="tr-agent-row">' +
          '<a class="tr-agent-btn" href="' + agentHref + '">Ask ' + this._esc(agentLabel) + ' Agent</a>' +
          '<span>Answers stay locked to ' + this._esc(agentLabel) + '</span>' +
        '</div>';

        /* Completion checkbox */
        html += '<label class="tr-complete' + (isComplete ? ' done' : '') + '">' +
          '<input type="checkbox" data-complete="' + t.num + '_' + this.currentLevel + '"' + (isComplete ? ' checked' : '') + '>' +
          '<span>' + (isComplete ? '\u2705 Completed' : 'Mark as complete') + '</span>' +
        '</label>';

        html += '</div>'; /* topic-body */
        html += '</div>'; /* topic-card */
      }

      /* Pagination */
      if (pages > 1) {
        html += '<div class="tr-pagination">';
        html += '<button class="tr-page-btn" data-p="' + (this.currentPage - 1) + '"' + (this.currentPage <= 1 ? ' disabled' : '') + '>\u2190 Prev</button>';
        html += '<div class="tr-page-nums">';
        var range = this._pageRange(this.currentPage, pages);
        for (var j = 0; j < range.length; j++) {
          if (range[j] === '...') {
            html += '<span class="tr-dots">\u2026</span>';
          } else {
            html += '<button class="tr-page-num' + (range[j] === this.currentPage ? ' active' : '') + '" data-p="' + range[j] + '">' + range[j] + '</button>';
          }
        }
        html += '</div>';
        html += '<button class="tr-page-btn" data-p="' + (this.currentPage + 1) + '"' + (this.currentPage >= pages ? ' disabled' : '') + '>Next \u2192</button>';
        html += '</div>';
      }

      this.container.innerHTML = html;

      /* Post-render bindings */
      if (window.Prism) {
        this.container.querySelectorAll('code').forEach(function (block) {
          window.Prism.highlightElement(block);
        });
      }

      this._bindPagination(pages);
      this._bindCopy();
      this._bindCollapse();
      this._bindBookmarks();
      this._bindComplete();
      this._bindRunCode();
      this._updateProgressBar();
    }

    /* ── Pagination ── */
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

    /* ── Copy Code ── */
    _bindCopy() {
      var self = this;
      this.container.querySelectorAll('.tr-copy[data-idx]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var code = btn.parentElement.querySelector('code');
          if (code && navigator.clipboard) {
            navigator.clipboard.writeText(code.innerText).then(function () {
              btn.textContent = '\u2713 Copied!';
              btn.classList.add('copied');
              self._showToast('\u2705 Code copied to clipboard!');
              setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1600);
            });
          }
        });
      });
    }

    /* ── Collapse/Expand ── */
    _bindCollapse() {
      var self = this;
      this.container.querySelectorAll('.topic-header[data-toggle]').forEach(function (header) {
        header.addEventListener('click', function (e) {
          if (e.target.closest('.tr-bookmark')) return;
          var card = header.closest('.topic-card');
          card.classList.toggle('collapsed');
        });
      });

      var expandBtn = document.getElementById('tr-expand-all');
      var collapseBtn = document.getElementById('tr-collapse-all');
      if (expandBtn) {
        expandBtn.addEventListener('click', function () {
          self.container.querySelectorAll('.topic-card').forEach(function (c) { c.classList.remove('collapsed'); });
        });
      }
      if (collapseBtn) {
        collapseBtn.addEventListener('click', function () {
          self.container.querySelectorAll('.topic-card').forEach(function (c) { c.classList.add('collapsed'); });
        });
      }
    }

    /* ── Bookmarks ── */
    _bindBookmarks() {
      var self = this;
      this.container.querySelectorAll('.tr-bookmark').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var num = btn.dataset.num;
          var idx = self._bookmarks.indexOf(num);
          if (idx === -1) {
            self._bookmarks.push(num);
            btn.classList.add('active');
            btn.innerHTML = '\u2764\uFE0F';
            self._showToast('\u2764 Topic bookmarked!');
          } else {
            self._bookmarks.splice(idx, 1);
            btn.classList.remove('active');
            btn.innerHTML = '\uD83E\uDD0D';
            self._showToast('Bookmark removed');
          }
          self._saveJSON(self._storageKeyBookmarks, self._bookmarks);
        });
      });
    }

    /* ── Completion ── */
    _bindComplete() {
      var self = this;
      this.container.querySelectorAll('[data-complete]').forEach(function (input) {
        input.addEventListener('change', function () {
          var key = input.dataset.complete;
          var label = input.closest('.tr-complete');
          if (input.checked) {
            if (self._completed.indexOf(key) === -1) self._completed.push(key);
            label.classList.add('done');
            label.querySelector('span').textContent = '\u2705 Completed';
            self._showToast('\u2705 Topic marked as complete!');
          } else {
            var idx = self._completed.indexOf(key);
            if (idx !== -1) self._completed.splice(idx, 1);
            label.classList.remove('done');
            label.querySelector('span').textContent = 'Mark as complete';
          }
          self._saveJSON(self._storageKeyComplete, self._completed);
          self._updateProgressBar();
        });
      });
    }

    /* ── Code Runner (JS sandbox) ── */
    _bindRunCode() {
      var self = this;
      this.container.querySelectorAll('.tr-run').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idx = btn.dataset.codeIdx;
          var codeEl = self.container.querySelector('code[data-idx="' + idx + '"]');
          var outputEl = document.getElementById('output-' + idx);
          if (!codeEl || !outputEl) return;

          outputEl.style.display = 'block';
          var outputContent = outputEl.querySelector('.output-content');
          outputContent.textContent = '';

          var code = codeEl.innerText;
          try {
            var logs = [];
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            var iframeWin = iframe.contentWindow;
            iframeWin.console = {
              log: function () { logs.push(Array.from(arguments).map(function(a){ return typeof a === 'object' ? JSON.stringify(a,null,2) : String(a); }).join(' ')); },
              error: function () { logs.push('\u274C ' + Array.from(arguments).join(' ')); },
              warn: function () { logs.push('\u26A0\uFE0F ' + Array.from(arguments).join(' ')); },
              info: function () { logs.push('\u2139\uFE0F ' + Array.from(arguments).join(' ')); }
            };
            iframeWin.eval(code);
            document.body.removeChild(iframe);
            outputContent.textContent = logs.length > 0 ? logs.join('\n') : '(No output)';
            outputContent.style.color = '#a8ff60';
            self._showToast('\u25B6 Code executed successfully!');
          } catch (err) {
            outputContent.textContent = '\u274C Error: ' + err.message;
            outputContent.style.color = '#ff5d72';
          }
        });
      });

      /* Clear buttons */
      this.container.querySelectorAll('[data-clear]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idx = btn.dataset.clear;
          var outputEl = document.getElementById('output-' + idx);
          if (outputEl) { outputEl.style.display = 'none'; }
        });
      });
    }

    /* ── Escape HTML ── */
    _esc(text) {
      if (!text) return '';
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
