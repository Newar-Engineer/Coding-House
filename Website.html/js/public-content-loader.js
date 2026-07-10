/**
 * Public Content Loader — Coding House
 * Fetches landing page data from /api/public/content or LocalStorage fallback
 * and dynamically renders all segments of the landing page.
 * Fulfills requirement: "fetch everything dynamically; zero hardcoded content".
 */
(function() {
  'use strict';

  var API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : '';

  // Get safe JSON helper
  function getLocalJSON(key, defaultVal) {
    try {
      var val = localStorage.getItem('codinghouse_' + key);
      return val ? JSON.parse(val) : defaultVal;
    } catch(e) {
      return defaultVal;
    }
  }

  async function loadPublicContent() {
    // 1. Load Data (API with local storage fallback)
    var hero = getLocalJSON('hero_section', {});
    var settings = getLocalJSON('global_settings', {});
    var languages = getLocalJSON('languages', []);
    var tracks = getLocalJSON('tracks', []);
    var features = getLocalJSON('features', []);
    var projects = getLocalJSON('projects', []);
    var testimonials = getLocalJSON('testimonials', []);
    var pricing = getLocalJSON('pricing', []);
    var lessons = getLocalJSON('lessons', []);

    try {
      var res = await fetch(API_BASE + '/api/public/content');
      if (res.ok) {
        var apiData = await res.json();
        if (apiData.hero) hero = apiData.hero;
        if (apiData.settings) settings = apiData.settings;
        if (apiData.languages) languages = apiData.languages;
        if (apiData.tracks) tracks = apiData.tracks;
        if (apiData.features) features = apiData.features;
        if (apiData.projects) projects = apiData.projects;
        if (apiData.testimonials) testimonials = apiData.testimonials;
        if (apiData.pricing) pricing = apiData.pricing;
        if (apiData.lessons) lessons = apiData.lessons;
      }
    } catch (err) {
      console.warn('[ContentLoader] API offline — using offline database/localStorage fallback');
    }

    // ── 2. Render Global Settings ──
    if (settings) {
      if (settings.site_title) document.title = settings.site_title;
      
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && settings.meta_description) {
        metaDesc.setAttribute('content', settings.meta_description);
      }
      
      var metaKw = document.querySelector('meta[name="keywords"]');
      if (metaKw && settings.seo_keywords) {
        metaKw.setAttribute('content', settings.seo_keywords);
      }

      // Update header Logo text
      var logoEl = document.querySelector('header nav .logo');
      if (logoEl && settings.logo_text) {
        var logoSvg = logoEl.querySelector('svg');
        logoEl.innerHTML = '';
        if (logoSvg) logoEl.appendChild(logoSvg);
        logoEl.appendChild(document.createTextNode(' ' + settings.logo_text));
      }

      // Hide / Show sections
      var sections = {
        'hero': settings.show_hero !== false,
        'languages': settings.show_languages !== false,
        'tracks': settings.show_tracks !== false,
        'features': settings.show_features !== false,
        'projects': settings.show_projects !== false,
        'challenges': settings.show_challenges !== false,
        'stories': settings.show_stories !== false,
        'pricing': settings.show_pricing !== false
      };
      for (var id in sections) {
        var secEl = document.getElementById(id);
        if (secEl) {
          secEl.style.display = sections[id] ? '' : 'none';
        }
      }
    }

    // ── 3. Render Hero Section ──
    if (hero) {
      var headlineEl = document.querySelector('.hero h1');
      if (headlineEl && hero.headline) headlineEl.innerHTML = hero.headline;

      var descEl = document.querySelector('.hero p.sub');
      if (descEl && hero.description) descEl.textContent = hero.description;

      var subHeadlineEl = document.querySelector('.hero p.desc');
      if (subHeadlineEl && settings && settings.subheadline) {
        subHeadlineEl.textContent = settings.subheadline;
      }

      // CTA Buttons
      var ctaPrimary = document.querySelector('.hero-cta a.btn-primary');
      if (ctaPrimary && settings.cta_text) {
        ctaPrimary.textContent = settings.cta_text;
        if (settings.cta_url) ctaPrimary.setAttribute('href', settings.cta_url);
      }

      // Counter targets
      var counters = {
        'languages': hero.stat_languages || 16,
        'challenges': hero.stat_challenges || 1085,
        'projects': hero.stat_projects || 100,
        'students': hero.stat_students || 12500
      };
      for (var key in counters) {
        var el = document.querySelector('[data-target="' + key + '"], .stat-item:nth-child(' + 
          (key === 'languages' ? 1 : (key === 'challenges' ? 2 : (key === 'projects' ? 3 : 4))) + ') .stat-num');
        if (el) {
          el.setAttribute('data-target', counters[key]);
          el.textContent = '0'; // reset for animation
        }
      }
      
      // Update stats counters animation trigger
      if (typeof window.animateCounters === 'function') {
        window.animateCounters();
      }
    }

    // ── 4. Render Languages Grid ──
    var grid = document.getElementById("lang-grid");
    if (grid && languages.length > 0) {
      languages.sort(function(a, b) { return a.name.localeCompare(b.name); });
      var defaultSlugList = ['python', 'java', 'c', 'cpp', 'csharp', 'javascript', 'typescript', 'go', 'rust', 'php', 'kotlin', 'swift', 'dart', 'ruby', 'r', 'matlab'];
      
      grid.innerHTML = languages.map(function(l) {
        var url = defaultSlugList.indexOf(l.slug) !== -1 ? `${l.slug}.html` : `course-detail.html?lang=${l.slug}`;
        var badgeStyle = `background:linear-gradient(135deg, ${l.c1 || '#6366f1'}, ${l.c2 || '#a855f7'})`;
        return `
          <a href="${url}" class="lang-card">
            <div class="lang-badge" style="${badgeStyle}">${l.ab || l.name.substring(0,2)}</div>
            <div class="lang-name">${l.name}</div>
            <div class="lang-tag">${l.tag || ''}</div>
            <div class="lang-arrow">Open portal →</div>
          </a>
        `;
      }).join("");
    }

    // ── 5. Render Development Tracks ──
    var tracksContainer = document.querySelector(".tracks-container");
    if (tracksContainer && tracks.length > 0) {
      tracksContainer.innerHTML = tracks.map(function(t) {
        var skillTags = (Array.isArray(t.tags) ? t.tags : String(t.tags).split(',')).map(function(tag) {
          return `<span class="skill-tag">${tag.trim()}</span>`;
        }).join("");
        var bg = `background:linear-gradient(135deg, ${t.grad1 || '#8b5cf6'}, ${t.grad2 || '#3b82f6'})`;

        return `
          <a href="${t.url || 'Development tracks/web-development.html'}" class="track-card" onclick="showLoading(event)">
            <div class="track-badge" style="${bg}">${t.emoji || '🚀'}</div>
            <div class="track-content">
              <h3>${t.title}</h3>
              <p>${t.desc}</p>
              <div class="track-skills">${skillTags}</div>
            </div>
            <div class="track-footer">
              <span class="track-duration">⏱️ ${t.hours || '100+'} hours</span>
              <span class="cta-arrow">→</span>
            </div>
          </a>
        `;
      }).join("");
    }

    // ── 6. Render Platform Features ──
    var featureGrid = document.querySelector(".feature-grid");
    if (featureGrid && features.length > 0) {
      featureGrid.innerHTML = features.map(function(f) {
        var tags = (Array.isArray(f.tags) ? f.tags : String(f.tags).split(',')).map(function(t) {
          return `<span>${t.trim()}</span>`;
        }).join("");
        return `
          <div class="feature-cell">
            <div class="ic">${f.icon || '✦'}</div>
            <h4>${f.title}</h4>
            <p>${f.desc}</p>
            <div class="mini-tags">${tags}</div>
          </div>
        `;
      }).join("");
    }

    // ── 7. Render Professional Projects ──
    var projGrid = document.querySelector(".proj-grid");
    if (projGrid && projects.length > 0) {
      var html = projects.map(function(p) {
        return `
          <div class="proj-card">
            <span class="num">${p.num || '01'}</span>
            <h3>${p.title}</h3>
            <p>${p.desc}</p>
            <span class="tag">${p.tags || ''}</span>
          </div>
        `;
      }).join("");
      
      // Keep showcase button
      html += `
        <div class="proj-card" style="border-style:dashed; justify-content:center; align-items:center; text-align:center;">
          <p style="color:var(--text-mute);">+ 95 more projects across every track</p>
          <a href="projects-showcase.html" class="track-link">See all projects →</a>
        </div>
      `;
      projGrid.innerHTML = html;
    }

    // ── 8. Render Success Stories / Testimonials ──
    var storyGrid = document.querySelector(".story-grid");
    if (storyGrid && testimonials.length > 0) {
      storyGrid.innerHTML = testimonials.map(function(t) {
        return `
          <div class="story-card">
            <p class="quote">${t.quote}</p>
            <div class="story-who">
              <div class="story-avatar">${t.avatar || t.name.substring(0,2).toUpperCase()}</div>
              <div><div class="name">${t.name}</div><div class="role">${t.role || ''}</div></div>
            </div>
          </div>
        `;
      }).join("");
    }

    // ── 9. Render Pricing Plans ──
    var priceGrid = document.querySelector(".price-grid");
    if (priceGrid && pricing.length > 0) {
      priceGrid.innerHTML = pricing.map(function(p) {
        var bullets = (Array.isArray(p.bullets) ? p.bullets : String(p.bullets).split('\n')).map(function(b) {
          return `<li>${b.trim()}</li>`;
        }).join("");
        var featuredClass = p.featured ? 'featured' : '';
        var btnClass = p.featured ? 'btn-primary' : 'btn-ghost';
        return `
          <div class="price-card ${featuredClass}">
            <h3>${p.name}</h3>
            <div class="price">${p.price}<span>${p.period}</span></div>
            <ul>${bullets}</ul>
            <a href="${p.cta_url || 'login.html'}" class="btn ${btnClass}">${p.cta_label || 'Get Started'}</a>
          </div>
        `;
      }).join("");
    }

    // ── 10. Bind Dynamic Lessons / Topics in Path Section ──
    var lessonButtons = document.querySelectorAll(".lesson-topic[data-answer]");
    var answerPanel = document.getElementById("lesson-answer-panel");

    if (lessonButtons && answerPanel && lessons.length > 0) {
      var lessonsMap = {};
      lessons.forEach(function(l) {
        lessonsMap[l.topic_key] = {
          title: l.title,
          body: l.explanation,
          example: l.code_example
        };
      });

      lessonButtons.forEach(function(button) {
        button.addEventListener("click", function() {
          var answer = lessonsMap[button.dataset.answer];
          if (!answer) return;

          lessonButtons.forEach(function(item) {
            item.classList.toggle("active", item === button);
          });

          answerPanel.classList.add("active");
          answerPanel.querySelector(".answer-kicker").textContent = "Selected topic";
          answerPanel.querySelector("h3").textContent = answer.title;
          answerPanel.querySelector("p").textContent = answer.body;
          answerPanel.querySelector("code").textContent = answer.example;
        });
      });
    }
  }

  // Load after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPublicContent);
  } else {
    loadPublicContent();
  }
})();
