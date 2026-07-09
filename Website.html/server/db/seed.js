/**
 * Database Seeding Script — Coding House
 * Seeds default landing page, settings, features, tracks, projects, testimonials, plans, and curriculum.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const { query, getPool } = require('./connection');

const defaultLanguages = [
  { name:"Python", tag:"Beginner friendly", ab:"Py", c1:"#3b82f6", c2:"#22d3ee", slug:"python" },
  { name:"Java", tag:"Enterprise & Android", ab:"Jv", c1:"#8b5cf6", c2:"#3b82f6", slug:"java" },
  { name:"C", tag:"Systems fundamentals", ab:"C", c1:"#22d3ee", c2:"#3b82f6", slug:"c" },
  { name:"C++", tag:"Performance & games", ab:"C+", c1:"#3b82f6", c2:"#8b5cf6", slug:"cpp" },
  { name:"C#", tag:".NET & game dev", ab:"C#", c1:"#8b5cf6", c2:"#22d3ee", slug:"csharp" },
  { name:"JavaScript", tag:"The web's language", ab:"Js", c1:"#f5b942", c2:"#3b82f6", slug:"javascript" },
  { name:"TypeScript", tag:"JavaScript, typed", ab:"Ts", c1:"#3b82f6", c2:"#22d3ee", slug:"typescript" },
  { name:"Go", tag:"Cloud & concurrency", ab:"Go", c1:"#22d3ee", c2:"#34e0a1", slug:"go" },
  { name:"Rust", tag:"Safe systems code", ab:"Rs", c1:"#f5b942", c2:"#ff5d72", slug:"rust" },
  { name:"PHP", tag:"Server-side web", ab:"Php", c1:"#8b5cf6", c2:"#f5b942", slug:"php" },
  { name:"Kotlin", tag:"Modern Android", ab:"Kt", c1:"#8b5cf6", c2:"#ff5d72", slug:"kotlin" },
  { name:"Swift", tag:"iOS & macOS", ab:"Sw", c1:"#ff5d72", c2:"#f5b942", slug:"swift" },
  { name:"Dart", tag:"UI-first language", ab:"Dt", c1:"#22d3ee", c2:"#3b82f6", slug:"dart" },
  { name:"Ruby", tag:"Expressive & fast", ab:"Rb", c1:"#ff5d72", c2:"#8b5cf6", slug:"ruby" },
  { name:"R", tag:"Statistics & data", ab:"R", c1:"#3b82f6", c2:"#34e0a1", slug:"r" },
  { name:"MATLAB", tag:"Engineering & math", ab:"Ml", c1:"#f5b942", c2:"#3b82f6", slug:"matlab" },
];

const defaultTracks = [
  {
    title: "Web Development",
    icon_emoji: "🌐",
    description: "Master responsive, modern web development from frontend to backend.",
    tech_tags: JSON.stringify(["HTML/CSS", "JavaScript", "React", "Node.js"]),
    hours: 150,
    link: "Development tracks/web-development.html"
  },
  {
    title: "Mobile Development",
    icon_emoji: "📱",
    description: "Build amazing iOS and Android apps that users love.",
    tech_tags: JSON.stringify(["React Native", "Flutter", "Swift", "Kotlin"]),
    hours: 140,
    link: "Development tracks/web-development.html"
  },
  {
    title: "AI & Machine Learning",
    icon_emoji: "🤖",
    description: "Master deep learning, neural networks, and AI models.",
    tech_tags: JSON.stringify(["Python", "TensorFlow", "PyTorch", "NLP"]),
    hours: 160,
    link: "Development tracks/web-development.html"
  },
  {
    title: "Cyber Security",
    icon_emoji: "🔒",
    description: "Protect systems, detect threats, and master ethical hacking.",
    tech_tags: JSON.stringify(["Networking", "Ethical Hacking", "Cryptography", "Linux"]),
    hours: 130,
    link: "Development tracks/web-development.html"
  },
  {
    title: "Cloud Computing",
    icon_emoji: "☁️",
    description: "Master AWS, Azure, GCP and build scalable applications.",
    tech_tags: JSON.stringify(["AWS", "Kubernetes", "Docker", "DevOps"]),
    hours: 120,
    link: "Development tracks/web-development.html"
  }
];

const defaultFeatures = [
  { icon: "</>", title: "Interactive code editor", description: "Write and run code directly in the browser — no setup required.", feature_tags: JSON.stringify(["Editor", "Output console", "Error debugger"]) },
  { icon: "✦", title: "AI coding assistant", description: "Stuck on a bug? Ask it to explain, fix, or improve your code line by line.", feature_tags: JSON.stringify(["Explain code", "Fix errors", "Suggest improvements"]) },
  { icon: "↗", title: "Progress tracking", description: "Watch every course turn into a percentage, a certificate, and a streak.", feature_tags: JSON.stringify(["Completion %", "Certificates", "Streaks"]) },
  { icon: "◆", title: "Coding challenges", description: "Four difficulty tiers, from your first loop to interview-grade problems.", feature_tags: JSON.stringify(["Easy", "Medium", "Hard", "Expert"]) },
  { icon: "☷", title: "Interview preparation", description: "Drill the exact rounds companies actually run.", feature_tags: JSON.stringify(["Technical Qs", "System design", "DSA", "Mock interviews"]) },
  { icon: "⌁", title: "Achievements", description: "Earned, not given — badges that map to real skills shipped.", feature_tags: JSON.stringify(["Badges", "Leaderboard", "Milestones"]) }
];

const defaultProjects = [
  { num: "01", title: "AI Chatbot", description: "A conversational assistant built on an LLM API, with memory and a custom persona.", tech_tags: JSON.stringify(["Python", "NLP"]) },
  { num: "02", title: "Face Recognition", description: "Real-time face detection and identity matching using OpenCV.", tech_tags: JSON.stringify(["Python", "OpenCV"]) },
  { num: "03", title: "E-commerce Backend", description: "Auth, products, carts, and checkout — a backend that holds up under real traffic.", tech_tags: JSON.stringify(["Node.js", "MongoDB"]) },
  { num: "04", title: "Discord Bot", description: "Slash commands, moderation, and scheduled tasks for a live community server.", tech_tags: JSON.stringify(["JavaScript", "APIs"]) },
  { num: "05", title: "Stock Market Analyzer", description: "Pulls live market data and visualizes trends to back a trading thesis.", tech_tags: JSON.stringify(["Python", "Data Science"]) }
];

const defaultTestimonials = [
  { quote: "Started on the Python beginner path with zero background. Six months later I shipped the e-commerce backend project and used it in my interview.", name: "Amara S.", initials: "AS", role: "Backend Developer" },
  { quote: "The interview prep track is the reason I stopped freezing on whiteboard questions. DSA finally clicked.", name: "Rohan K.", initials: "RK", role: "Software Engineer" },
  { quote: "I followed the AI & ML track end to end. The face recognition project became the centerpiece of my portfolio.", name: "Lina M.", initials: "LM", role: "ML Engineer" }
];

const defaultPlans = [
  { name: "Free", price: "$0", billing_period: "forever", features: JSON.stringify(["3 languages, beginner stage", "Limited coding challenges", "Community access", "Progress tracking"]), cta_label: "Get started", cta_link: "login.html", is_highlighted: 0 },
  { name: "Pro", price: "Free", billing_period: "month", features: JSON.stringify(["All 16 languages, every stage", "All development tracks", "AI coding assistant", "Full challenge library", "Certificates on completion"]), cta_label: "Start free trial", cta_link: "login.html", is_highlighted: 1 },
  { name: "Lifetime", price: "Free", billing_period: "one-time", features: JSON.stringify(["Everything in Pro, forever", "Future languages & tracks included", "Priority AI assistant access", "1:1 mock interview credit"]), cta_label: "Buy lifetime", cta_link: "login.html", is_highlighted: 0 }
];

const defaultChallenges = [
  { title: "FizzBuzz", difficulty: "easy", prompt: "Write a function that returns 'Fizz' if divisible by 3, 'Buzz' if divisible by 5, and 'FizzBuzz' if divisible by both.", tests: JSON.stringify([{input: "3", output: "Fizz"}, {input: "5", output: "Buzz"}, {input: "15", output: "FizzBuzz"}]), solution: "function fizzBuzz(n) { if (n % 15 === 0) return 'FizzBuzz'; if (n % 3 === 0) return 'Fizz'; if (n % 5 === 0) return 'Buzz'; return n.toString(); }" }
];

async function seed() {
  console.log('[Seed] Starting database seeding...');

  try {
    // 1. Global Settings
    await query('DELETE FROM global_settings');
    await query(`
      INSERT INTO global_settings (site_title, meta_title, meta_description, footer_text, theme_primary, theme_secondary, sections_visibility)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Coding House',
      'Coding House — Learn Programming',
      'Ask questions, share projects, and connect with fellow developers in the Coding House community forum.',
      '© 2026 Coding House. All rights reserved.',
      '#a855f7', '#6366f1',
      JSON.stringify({ hero: true, languages: true, curriculum: true, tracks: true, features: true, projects: true, challenges: true, stories: true, pricing: true })
    ]);
    console.log('[Seed] ✓ Global Settings seeded');

    // 2. Hero Section
    await query('DELETE FROM hero_section');
    await query(`
      INSERT INTO hero_section (headline, subheadline, description, cta_label, cta_link, terminal_snippets, stat_languages, stat_challenges, stat_projects, stat_students)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Coding House starts here.',
      'Learn Programming From Beginner to Professional Level — with real tracks, real projects, and a portal for every language.',
      '16 languages · 5 development tracks · 100+ guided projects',
      'Start Learning Free',
      '#languages',
      JSON.stringify([
        "class Learner:",
        "  def __init__(self, level=\"beginner\"):  self.level = level",
        "  def level_up(self):  return \"professional\""
      ]),
      16, 1085, 100, 12500
    ]);
    console.log('[Seed] ✓ Hero Section seeded');

    // 3. Tracks
    await query('DELETE FROM tracks');
    for (let i = 0; i < defaultTracks.length; i++) {
      const t = defaultTracks[i];
      await query(`
        INSERT INTO tracks (title, icon_emoji, description, tech_tags, hours, link, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [t.title, t.icon_emoji, t.description, t.tech_tags, t.hours, t.link, i]);
    }
    console.log('[Seed] ✓ Tracks seeded');

    // 4. Features
    await query('DELETE FROM platform_features');
    for (let i = 0; i < defaultFeatures.length; i++) {
      const f = defaultFeatures[i];
      await query(`
        INSERT INTO platform_features (icon, title, description, feature_tags, display_order)
        VALUES (?, ?, ?, ?, ?)
      `, [f.icon, f.title, f.description, f.feature_tags, i]);
    }
    console.log('[Seed] ✓ Platform Features seeded');

    // 5. Professional Projects
    await query('DELETE FROM professional_projects');
    for (let i = 0; i < defaultProjects.length; i++) {
      const p = defaultProjects[i];
      await query(`
        INSERT INTO professional_projects (num, title, description, tech_tags, display_order)
        VALUES (?, ?, ?, ?, ?)
      `, [p.num, p.title, p.description, p.tech_tags, i]);
    }
    console.log('[Seed] ✓ Professional Projects seeded');

    // 6. Testimonials
    await query('DELETE FROM testimonials');
    for (let i = 0; i < defaultTestimonials.length; i++) {
      const t = defaultTestimonials[i];
      await query(`
        INSERT INTO testimonials (quote, name, initials, role, display_order)
        VALUES (?, ?, ?, ?, ?)
      `, [t.quote, t.name, t.initials, t.role, i]);
    }
    console.log('[Seed] ✓ Testimonials seeded');

    // 7. Pricing Plans
    await query('DELETE FROM pricing_plans');
    for (let i = 0; i < defaultPlans.length; i++) {
      const p = defaultPlans[i];
      await query(`
        INSERT INTO pricing_plans (name, price, billing_period, features, cta_label, cta_link, is_highlighted, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [p.name, p.price, p.billing_period, p.features, p.cta_label, p.cta_link, p.is_highlighted, i]);
    }
    console.log('[Seed] ✓ Pricing Plans seeded');

    // 8. Challenges
    await query('DELETE FROM coding_challenges');
    for (let i = 0; i < defaultChallenges.length; i++) {
      const c = defaultChallenges[i];
      await query(`
        INSERT INTO coding_challenges (title, difficulty, prompt, tests, solution, display_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [c.title, c.difficulty, c.prompt, c.tests, c.solution, i]);
    }
    console.log('[Seed] ✓ Coding Challenges seeded');

    // 9. Languages and Lessons
    await query('DELETE FROM lessons');
    await query('DELETE FROM languages');

    const topicsDir = path.join(__dirname, '..', '..', 'data', 'topics');
    console.log(`[Seed] Reading curriculum files from: ${topicsDir}`);

    for (let i = 0; i < defaultLanguages.length; i++) {
      const lang = defaultLanguages[i];
      
      const [langResult] = await query(`
        INSERT INTO languages (name, slug, ab, tag, c1, c2, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [lang.name, lang.slug, lang.ab, lang.tag, lang.c1, lang.c2, i]);
      
      const langId = langResult.insertId;
      const jsonFile = path.join(topicsDir, `${lang.slug}.json`);

      if (fs.existsSync(jsonFile)) {
        const fileContent = fs.readFileSync(jsonFile, 'utf8');
        const topics = JSON.parse(fileContent);

        for (const t of topics) {
          const beg = t.beg || {};
          const int = t.int || {};
          const adv = t.adv || {};
          const pro = t.pro || {};

          await query(`
            INSERT INTO lessons (
              language_id, num, title,
              beg_desc, beg_code, beg_usecase,
              int_desc, int_code, int_usecase,
              adv_desc, adv_code, adv_usecase,
              pro_desc, pro_code, pro_usecase
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            langId, t.num, t.title,
            beg.desc || null, beg.code || null, beg.usecase || null,
            int.desc || null, int.code || null, int.usecase || null,
            adv.desc || null, adv.code || null, adv.usecase || null,
            pro.desc || null, pro.code || null, pro.usecase || null
          ]);
        }
        console.log(`[Seed] ✓ Seeded ${topics.length} topics for ${lang.name}`);
      } else {
        console.warn(`[Seed] ⚠ JSON file not found: ${jsonFile}`);
      }
    }

    console.log('[Seed] ✓ Dynamic seeding completed successfully! 🎉');
  } catch (err) {
    console.error('[Seed] ✕ Seeding failed:', err);
  } finally {
    const pool = getPool();
    await pool.end();
    console.log('[Seed] Database pool closed.');
  }
}

seed();
