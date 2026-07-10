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

  // ── Local Storage Seed Data Initializer ──
  function initLocalStorageSeeds() {
    var seeds = {
      global_settings: {
        id: 1,
        site_title: "Coding House — Learn Programming From Beginner to Professional",
        subheadline: "16 languages · 5 development tracks · 100+ guided projects",
        logo_text: "Coding House",
        contact_email: "support@codinghouse.com",
        meta_description: "Learn 16 programming languages from beginner to professional level. Interactive code playground, real-world projects, coding challenges, and career roadmaps.",
        seo_keywords: "coding, programming, learn to code, python, javascript, rust",
        cta_text: "Start Learning Free",
        cta_url: "#languages",
        enable_ai_helper: 1,
        enable_terminal_animation: 1,
        show_hero: true,
        show_languages: true,
        show_tracks: true,
        show_features: true,
        show_projects: true,
        show_challenges: true,
        show_stories: true,
        show_pricing: true
      },
      hero_section: {
        id: 1,
        headline: "Coding House<br><span class=\"grad\">starts here.</span>",
        description: "Learn Programming From Beginner to Professional Level — with real tracks, real projects, and a portal for every language.",
        code_snippet: "def greet(name):\n    return f\"Hello {name}!\"\n\nprint(greet(\"World\"))",
        stat_languages: 16,
        stat_challenges: 1085,
        stat_projects: 100,
        stat_students: 12500
      },
      languages: [
        { id: 1, name: "Python", tag: "Beginner friendly", ab: "Py", c1: "#3b82f6", c2: "#22d3ee", slug: "python" },
        { id: 2, name: "Java", tag: "Enterprise & Android", ab: "Jv", c1: "#8b5cf6", c2: "#3b82f6", slug: "java" },
        { id: 3, name: "C", tag: "Systems fundamentals", ab: "C", c1: "#22d3ee", c2: "#3b82f6", slug: "c" },
        { id: 4, name: "C++", tag: "Performance & games", ab: "C+", c1: "#3b82f6", c2: "#8b5cf6", slug: "cpp" },
        { id: 5, name: "C#", tag: ".NET & game dev", ab: "C#", c1: "#8b5cf6", c2: "#22d3ee", slug: "csharp" },
        { id: 6, name: "JavaScript", tag: "The web's language", ab: "Js", c1: "#f5b942", c2: "#3b82f6", slug: "javascript" },
        { id: 7, name: "TypeScript", tag: "JavaScript, typed", ab: "Ts", c1: "#3b82f6", c2: "#22d3ee", slug: "typescript" },
        { id: 8, name: "Go", tag: "Cloud & concurrency", ab: "Go", c1: "#22d3ee", c2: "#34e0a1", slug: "go" },
        { id: 9, name: "Rust", tag: "Safe systems code", ab: "Rs", c1: "#f5b942", c2: "#ff5d72", slug: "rust" },
        { id: 10, name: "PHP", tag: "Server-side web", ab: "Php", c1: "#8b5cf6", c2: "#f5b942", slug: "php" },
        { id: 11, name: "Kotlin", tag: "Modern Android", ab: "Kt", c1: "#8b5cf6", c2: "#ff5d72", slug: "kotlin" },
        { id: 12, name: "Swift", tag: "iOS & macOS", ab: "Sw", c1: "#ff5d72", c2: "#f5b942", slug: "swift" },
        { id: 13, name: "Dart", tag: "UI-first language", ab: "Dt", c1: "#22d3ee", c2: "#3b82f6", slug: "dart" },
        { id: 14, name: "Ruby", tag: "Expressive & fast", ab: "Rb", c1: "#ff5d72", c2: "#8b5cf6", slug: "ruby" },
        { id: 15, name: "R", tag: "Statistics & data", ab: "R", c1: "#3b82f6", c2: "#34e0a1", slug: "r" },
        { id: 16, name: "MATLAB", tag: "Engineering & math", ab: "Ml", c1: "#f5b942", c2: "#3b82f6", slug: "matlab" }
      ],
      lessons: [
        { id: 1, language_id: 1, stage: "beginner", topic_key: "what-python", title: "What is Python?", explanation: "Python is a beginner-friendly programming language used for web apps, automation, data science, AI, and backend systems.", code_example: "print(\"Welcome to Coding House\")\nname = \"Learner\"\nprint(\"Hello\", name)" },
        { id: 2, language_id: 1, stage: "beginner", topic_key: "installation", title: "Installation", explanation: "Installation means setting up Python on your computer so you can run .py files from a terminal or code editor.", code_example: "python --version\npython main.py" },
        { id: 3, language_id: 1, stage: "beginner", topic_key: "variables", title: "Variables & data types", explanation: "Variables store values. Data types describe what kind of value you are storing, like text, numbers, booleans, or lists.", code_example: "name = \"Asha\"\nage = 18\nis_learning = True\nskills = [\"Python\", \"HTML\"]" },
        { id: 4, language_id: 1, stage: "beginner", topic_key: "operators", title: "Operators & conditions", explanation: "Operators compare or calculate values. Conditions let your program make decisions based on those values.", code_example: "score = 86\nif score >= 80:\n    print(\"Great work\")\nelse:\n    print(\"Keep practicing\")" },
        { id: 5, language_id: 1, stage: "beginner", topic_key: "loops", title: "Loops & functions", explanation: "Loops repeat work. Functions group reusable logic so you can run it whenever you need.", code_example: "def greet(name):\n    return \"Hello \" + name\n\nfor student in [\"Maya\", \"Ravi\"]:\n    print(greet(student))" },
        { id: 6, language_id: 1, stage: "beginner", topic_key: "collections", title: "Lists, dicts, tuples", explanation: "Collections hold multiple values. Lists are editable, dictionaries use key-value pairs, and tuples are fixed.", code_example: "languages = [\"Python\", \"JavaScript\"]\nprofile = {\"name\": \"Maya\", \"level\": \"Beginner\"}\npoint = (10, 20)\nprint(profile[\"name\"])" }
      ],
      tracks: [
        { id: 1, title: "Web Development", emoji: "🌐", desc: "Master responsive, modern web development from frontend to backend.", tags: ["HTML/CSS", "JavaScript", "React", "Node.js"], hours: "150+", url: "Development tracks/web-development.html", grad1: "#f97316", grad2: "#fb923c" },
        { id: 2, title: "Mobile Development", emoji: "📱", desc: "Build amazing iOS and Android apps that users love.", tags: ["React Native", "Flutter", "Swift", "Kotlin"], hours: "140+", url: "Development tracks/web-development.html", grad1: "#ec4899", grad2: "#f472b6" },
        { id: 3, title: "AI & Machine Learning", emoji: "🤖", desc: "Master deep learning, neural networks, and AI models.", tags: ["Python", "TensorFlow", "PyTorch", "NLP"], hours: "160+", url: "Development tracks/web-development.html", grad1: "#8b5cf6", grad2: "#ec4899" },
        { id: 4, title: "Cyber Security", emoji: "🔒", desc: "Protect systems, detect threats, and master ethical hacking.", tags: ["Networking", "Ethical Hacking", "Cryptography", "Linux"], hours: "130+", url: "Development tracks/web-development.html", grad1: "#ef4444", grad2: "#f97316" },
        { id: 5, title: "Cloud Computing", emoji: "☁️", desc: "Master AWS, Azure, GCP and build scalable applications.", tags: ["AWS", "Kubernetes", "Docker", "DevOps"], hours: "120+", url: "Development tracks/web-development.html", grad1: "#06b6d4", grad2: "#10b981" }
      ],
      features: [
        { id: 1, icon: "</>", title: "Interactive code editor", desc: "Write and run code directly in the browser — no setup required.", tags: ["Editor", "Output console", "Error debugger"] },
        { id: 2, icon: "✦", title: "AI coding assistant", desc: "Stuck on a bug? Ask it to explain, fix, or improve your code line by line.", tags: ["Explain code", "Fix errors", "Suggest improvements"] },
        { id: 3, icon: "↗", title: "Progress tracking", desc: "Watch every course turn into a percentage, a certificate, and a streak.", tags: ["Completion %", "Certificates", "Streaks"] },
        { id: 4, icon: "◆", title: "Coding challenges", desc: "Four difficulty tiers, from your first loop to interview-grade problems.", tags: ["Easy", "Medium", "Hard", "Expert"] },
        { id: 5, icon: "☷", title: "Interview preparation", desc: "Drill the exact rounds companies actually run.", tags: ["Technical Qs", "System design", "DSA", "Mock interviews"] },
        { id: 6, icon: "⌁", title: "Achievements", desc: "Earned, not given — badges that map to real skills shipped.", tags: ["Badges", "Leaderboard", "Milestones"] }
      ],
      projects: [
        { id: 1, num: "01", title: "AI Chatbot", desc: "A conversational assistant built on an LLM API, with memory and a custom persona.", tags: "Python · NLP" },
        { id: 2, num: "02", title: "Face Recognition", desc: "Real-time face detection and identity matching using OpenCV.", tags: "Python · OpenCV" },
        { id: 3, num: "03", title: "E-commerce Backend", desc: "Auth, products, carts, and checkout — a backend that holds up under real traffic.", tags: "Node.js · MongoDB" },
        { id: 4, num: "04", title: "Discord Bot", desc: "Slash commands, moderation, and scheduled tasks for a live community server.", tags: "JavaScript · APIs" },
        { id: 5, num: "05", title: "Stock Market Analyzer", desc: "Pulls live market data and visualizes trends to back a trading thesis.", tags: "Python · Data Science" }
      ],
      challenges: [
        { id: 1, title: "Two Sum", difficulty: "Easy", prompt: "Given an array of integers, return indices of the two numbers such that they add up to a specific target.", solution: "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target-num], i]\n        seen[num] = i" },
        { id: 2, title: "Reverse Linked List", difficulty: "Medium", prompt: "Reverse a singly linked list.", solution: "def reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev" }
      ],
      testimonials: [
        { id: 1, quote: "Started on the Python beginner path with zero background. Six months later I shipped the e-commerce backend project and used it in my interview.", name: "Amara S.", role: "Backend Developer", avatar: "AS" },
        { id: 2, quote: "The interview prep track is the reason I stopped freezing on whiteboard questions. DSA finally clicked.", name: "Rohan K.", role: "Software Engineer", avatar: "RK" },
        { id: 3, quote: "I followed the AI & ML track end to end. The face recognition project became the centerpiece of my portfolio.", name: "Lina M.", role: "ML Engineer", avatar: "LM" }
      ],
      pricing: [
        { id: 1, name: "Free", price: "$0", period: "/forever", bullets: ["3 languages, beginner stage", "Limited coding challenges", "Community access", "Progress tracking"], cta_label: "Get started", cta_url: "login.html", featured: false },
        { id: 2, name: "Pro", price: "Free", period: "/month", bullets: ["All 16 languages, every stage", "All development tracks", "AI coding assistant", "Full challenge library", "Certificates on completion"], cta_label: "Start free trial", cta_url: "login.html", featured: true },
        { id: 3, name: "Lifetime", price: "Free", period: "/one-time", bullets: ["Everything in Pro, forever", "Future languages & tracks included", "Priority AI assistant access", "1:1 mock interview credit"], cta_label: "Buy lifetime", cta_url: "login.html", featured: false }
      ],
      images: [],
      users: [
        { id: 1, name: "Shrestha R.", email: "shrestha@email.com", plan: "Pro", status: "Active", xp: 2840, av: "SR" },
        { id: 2, name: "Aryan K.", email: "aryan@email.com", plan: "Free", status: "New", xp: 4210, av: "AK" },
        { id: 3, name: "Priya S.", email: "priya@email.com", plan: "Lifetime", status: "Active", xp: 3880, av: "PS" }
      ],
      audit_logs: [
        { id: 1, timestamp: new Date().toISOString(), user: "Admin", action: "Updated Global Settings", detail: "Modified site title and layout options" }
      ]
    };

    for (var key in seeds) {
      if (!localStorage.getItem('codinghouse_' + key)) {
        localStorage.setItem('codinghouse_' + key, JSON.stringify(seeds[key]));
      }
    }
  }

  // Initialize immediately
  initLocalStorageSeeds();

  // ── Local Storage Fallback CRUD Handler ──
  function handleLocalFallback(endpoint, options) {
    console.warn('[AdminAPI] Falling back to Local Storage for endpoint:', endpoint);
    var method = (options && options.method) || 'GET';
    method = method.toUpperCase();

    // Parse path segments
    var parts = endpoint.split('?')[0].split('/').filter(Boolean);
    
    // 1. Audit Logs Check
    if (parts.length === 2 && parts[0] === 'content' && parts[1] === 'audit-logs') {
      var logs = JSON.parse(localStorage.getItem('codinghouse_audit_logs') || '[]');
      return { ok: true, data: { logs: logs } };
    }

    // 2. User Stats / Image Stats
    if (parts.length === 2 && parts[0] === 'users' && parts[1] === 'stats') {
      var u = JSON.parse(localStorage.getItem('codinghouse_users') || '[]');
      return { ok: true, data: { total: u.length, active: u.filter(x=>x.status==='Active').length } };
    }
    if (parts.length === 2 && parts[0] === 'images' && parts[1] === 'stats') {
      var img = JSON.parse(localStorage.getItem('codinghouse_images') || '[]');
      return { ok: true, data: { total: img.length, sizeBytes: img.reduce((a,b)=>a+(b.file_size||0), 0) } };
    }

    // 3. User CRUD
    if (parts[0] === 'users') {
      var uList = JSON.parse(localStorage.getItem('codinghouse_users') || '[]');
      if (method === 'GET') {
        if (parts.length === 2) {
          var targetId = parseInt(parts[1]);
          var found = uList.find(x => x.id === targetId);
          return found ? { ok: true, data: found } : { ok: false, error: 'User not found' };
        }
        return { ok: true, data: { users: uList } };
      }
      if (method === 'POST') {
        var body = JSON.parse(options.body);
        body.id = Date.now();
        body.av = (body.name || "US").substring(0,2).toUpperCase();
        uList.push(body);
        localStorage.setItem('codinghouse_users', JSON.stringify(uList));
        addLocalAuditLog("Created User", "Added " + body.name);
        return { ok: true, data: body };
      }
      if (method === 'PUT' && parts.length === 2) {
        var targetId = parseInt(parts[1]);
        var body = JSON.parse(options.body);
        var idx = uList.findIndex(x => x.id === targetId);
        if (idx !== -1) {
          uList[idx] = Object.assign(uList[idx], body);
          localStorage.setItem('codinghouse_users', JSON.stringify(uList));
          addLocalAuditLog("Updated User", "Modified profile details of " + uList[idx].name);
          return { ok: true, data: uList[idx] };
        }
        return { ok: false, error: 'User not found' };
      }
      if (method === 'DELETE' && parts.length === 2) {
        var targetId = parseInt(parts[1]);
        var idx = uList.findIndex(x => x.id === targetId);
        if (idx !== -1) {
          var removed = uList.splice(idx, 1)[0];
          localStorage.setItem('codinghouse_users', JSON.stringify(uList));
          addLocalAuditLog("Deleted User", "Removed user: " + removed.name);
          return { ok: true, data: removed };
        }
        return { ok: false, error: 'User not found' };
      }
    }

    // 4. Image CRUD
    if (parts[0] === 'images') {
      var imgList = JSON.parse(localStorage.getItem('codinghouse_images') || '[]');
      if (method === 'GET') {
        return { ok: true, data: { images: imgList } };
      }
      if (method === 'POST') {
        var body = JSON.parse(options.body);
        body.id = Date.now();
        imgList.push(body);
        localStorage.setItem('codinghouse_images', JSON.stringify(imgList));
        addLocalAuditLog("Uploaded Image", "Added: " + body.filename);
        return { ok: true, data: body };
      }
      if (method === 'DELETE' && parts.length === 2) {
        var targetId = parseInt(parts[1]);
        var idx = imgList.findIndex(x => x.id === targetId);
        if (idx !== -1) {
          var removed = imgList.splice(idx, 1)[0];
          localStorage.setItem('codinghouse_images', JSON.stringify(imgList));
          addLocalAuditLog("Deleted Image", "Removed: " + removed.filename);
          return { ok: true, data: removed };
        }
        return { ok: false, error: 'Image not found' };
      }
    }

    // 5. Content Section CRUD (e.g. /content/languages, /content/lessons, /content/tracks)
    if (parts[0] === 'content' && parts.length >= 2) {
      var section = parts[1];
      var storeKey = 'codinghouse_' + section;

      // Handle simple single-object sections
      if (section === 'global_settings' || section === 'hero_section') {
        if (method === 'GET') {
          var obj = JSON.parse(localStorage.getItem(storeKey) || '{}');
          return { ok: true, data: obj };
        }
        if (method === 'PUT' || method === 'POST') {
          var body = JSON.parse(options.body);
          localStorage.setItem(storeKey, JSON.stringify(body));
          addLocalAuditLog("Updated Settings", "Modified " + section.replace('_', ' '));
          return { ok: true, data: body };
        }
      }

      var items = JSON.parse(localStorage.getItem(storeKey) || '[]');

      if (method === 'GET') {
        // Support simple filters (e.g. lessons filtering by language_id)
        if (options && options.headers && options.headers.params) {
          // fetchContent passes params via query string URL instead
        }
        var searchParams = new URLSearchParams(endpoint.split('?')[1] || '');
        var langIdFilter = searchParams.get('language_id');
        if (langIdFilter) {
          var filtered = items.filter(x => String(x.language_id) === String(langIdFilter));
          return { ok: true, data: filtered };
        }
        return { ok: true, data: items };
      }

      if (method === 'POST') {
        var body = JSON.parse(options.body);
        body.id = Date.now();
        items.push(body);
        localStorage.setItem(storeKey, JSON.stringify(items));
        // Sync languages array with custom storage for other pages
        if (section === 'languages') {
          localStorage.setItem('codinghouse_languages', JSON.stringify(items));
        }
        addLocalAuditLog("Created Content", "Added item to " + section + " (Title: " + (body.title || body.name || body.id) + ")");
        return { ok: true, data: body };
      }

      if (method === 'PUT' && parts.length === 3) {
        var targetId = parseInt(parts[2]);
        var body = JSON.parse(options.body);
        var idx = items.findIndex(x => x.id === targetId);
        if (idx !== -1) {
          items[idx] = Object.assign(items[idx], body);
          localStorage.setItem(storeKey, JSON.stringify(items));
          if (section === 'languages') {
            localStorage.setItem('codinghouse_languages', JSON.stringify(items));
          }
          addLocalAuditLog("Updated Content", "Modified item in " + section + " (Title: " + (items[idx].title || items[idx].name || targetId) + ")");
          return { ok: true, data: items[idx] };
        }
        return { ok: false, error: 'Item not found' };
      }

      if (method === 'DELETE' && parts.length === 3) {
        var targetId = parseInt(parts[2]);
        var idx = items.findIndex(x => x.id === targetId);
        if (idx !== -1) {
          var removed = items.splice(idx, 1)[0];
          localStorage.setItem(storeKey, JSON.stringify(items));
          if (section === 'languages') {
            localStorage.setItem('codinghouse_languages', JSON.stringify(items));
          }
          addLocalAuditLog("Deleted Content", "Removed item from " + section + " (Title: " + (removed.title || removed.name || targetId) + ")");
          return { ok: true, data: removed };
        }
        return { ok: false, error: 'Item not found' };
      }

      if (method === 'PUT' && parts.length === 3 && parts[2] === 'reorder') {
        var body = JSON.parse(options.body); // { orders: [{id, order}] }
        if (body.orders) {
          var orderMap = {};
          body.orders.forEach(function(o) { orderMap[o.id] = o.order; });
          items.forEach(function(item) {
            if (orderMap[item.id] !== undefined) {
              item.order = orderMap[item.id];
            }
          });
          items.sort((a,b)=>(a.order||0)-(b.order||0));
          localStorage.setItem(storeKey, JSON.stringify(items));
          addLocalAuditLog("Reordered Content", "Re-arranged list sorting for " + section);
          return { ok: true, data: items };
        }
      }
    }

    return null;
  }

  function addLocalAuditLog(action, detail) {
    var logs = JSON.parse(localStorage.getItem('codinghouse_audit_logs') || '[]');
    var userObj = JSON.parse(localStorage.getItem('codinghouse_currentUser') || '{"name":"Admin"}');
    logs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: userObj.name || "Admin",
      action: action,
      detail: detail
    });
    // Keep last 100 logs
    if (logs.length > 100) logs.pop();
    localStorage.setItem('codinghouse_audit_logs', JSON.stringify(logs));
  }

  function syncLocalOnWrite(endpoint, options, responseData) {
    var method = (options && options.method) || 'GET';
    method = method.toUpperCase();
    if (method === 'GET') return;

    var parts = endpoint.split('?')[0].split('/').filter(Boolean);
    if (parts[0] === 'content' && parts.length >= 2) {
      var section = parts[1];
      var storeKey = 'codinghouse_' + section;
      // Sync it immediately so they stay in perfect lockstep
      if (section === 'global_settings' || section === 'hero_section') {
        localStorage.setItem(storeKey, JSON.stringify(responseData));
      } else {
        // Fetch full list again from backend if possible to ensure in-sync state
        fetch(ADMIN_CONFIG.API_BASE_URL + '/content/' + section, {
          headers: { 'Authorization': options.headers.Authorization }
        }).then(res => res.json()).then(data => {
          if (Array.isArray(data)) {
            localStorage.setItem(storeKey, JSON.stringify(data));
            if (section === 'languages') {
              localStorage.setItem('codinghouse_languages', JSON.stringify(data));
            }
          }
        }).catch(err => {});
      }
    }
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
        var localResult = handleLocalFallback(endpoint, options);
        if (localResult !== null) return localResult;

        showToast(data.error || 'Request failed', 'error');
        return { ok: false, error: data.error, status: resp.status };
      }

      syncLocalOnWrite(endpoint, options, data);
      return { ok: true, data: data };
    } catch (err) {
      var localResult = handleLocalFallback(endpoint, options);
      if (localResult !== null) return localResult;

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

  async function fetchContent(section, params) {
    var queryStr = '';
    if (params) {
      queryStr = '?' + new URLSearchParams(params).toString();
    }
    return apiFetch('/content/' + section + queryStr);
  }

  async function createContent(section, itemData) {
    var result = await apiFetch('/content/' + section, {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
    if (result.ok) showToast('Item created successfully', 'success');
    return result;
  }

  async function updateContent(section, id, itemData) {
    var result = await apiFetch('/content/' + section + '/' + id, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
    if (result.ok) showToast('Item updated successfully', 'success');
    return result;
  }

  async function deleteContent(section, id) {
    var result = await apiFetch('/content/' + section + '/' + id, { method: 'DELETE' });
    if (result.ok) showToast('Item deleted successfully', 'success');
    return result;
  }

  async function reorderContent(section, orders) {
    var result = await apiFetch('/content/' + section + '/reorder', {
      method: 'PUT',
      body: JSON.stringify({ orders: orders })
    });
    if (result.ok) showToast('Order updated successfully', 'success');
    return result;
  }

  async function fetchAuditLogs() {
    return apiFetch('/content/audit-logs');
  }

  // ── Public API ──
  return {
    showToast:      showToast,
    fetchUsers:     fetchUsers,
    getUser:        getUser,
    createUser:     createUser,
    updateUser:     updateUser,
    deleteUser:     deleteUser,
    getUserStats:   getUserStats,
    fetchImages:    fetchImages,
    getImageStats:  getImageStats,
    uploadImage:    uploadImage,
    updateImage:    updateImage,
    deleteImage:    deleteImage,
    fetchContent:   fetchContent,
    createContent:  createContent,
    updateContent:  updateContent,
    deleteContent:  deleteContent,
    reorderContent: reorderContent,
    fetchAuditLogs: fetchAuditLogs
  };
})();
