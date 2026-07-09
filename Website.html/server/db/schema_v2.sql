-- ============================================
-- Coding House Admin Panel — MySQL Schema V2
-- ============================================
-- Run this file against your MySQL server:
--   mysql -u root -p < schema_v2.sql
-- ============================================

USE codinghouse;

-- ── 1. GLOBAL SETTINGS ──
CREATE TABLE IF NOT EXISTS global_settings (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  site_title          VARCHAR(255) NOT NULL DEFAULT 'Coding House',
  meta_title          VARCHAR(255) DEFAULT NULL,
  meta_description    TEXT DEFAULT NULL,
  logo_url            VARCHAR(512) DEFAULT NULL,
  footer_text         VARCHAR(255) DEFAULT '© 2026 Coding House.',
  theme_primary       VARCHAR(50) DEFAULT '#a855f7',
  theme_secondary     VARCHAR(50) DEFAULT '#6366f1',
  theme_bg            VARCHAR(50) DEFAULT '#07030f',
  theme_surface       VARCHAR(50) DEFAULT '#0e0819',
  sections_visibility JSON DEFAULT NULL, -- e.g. {"hero": true, "languages": true, ...}
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── 2. HERO / LANDING ──
CREATE TABLE IF NOT EXISTS hero_section (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  headline            VARCHAR(255) NOT NULL,
  subheadline         VARCHAR(255) DEFAULT NULL,
  description         TEXT DEFAULT NULL,
  cta_label           VARCHAR(100) DEFAULT 'Start Learning',
  cta_link            VARCHAR(255) DEFAULT '#languages',
  terminal_snippets   JSON DEFAULT NULL, -- Array of strings for animation
  stat_languages      INT DEFAULT 16,
  stat_challenges     INT DEFAULT 500,
  stat_projects       INT DEFAULT 50,
  stat_students       INT DEFAULT 10000,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── 3. LANGUAGES ──
CREATE TABLE IF NOT EXISTS languages (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  ab            VARCHAR(10) DEFAULT NULL,
  tag           VARCHAR(100) DEFAULT NULL,
  c1            VARCHAR(50) DEFAULT NULL,
  c2            VARCHAR(50) DEFAULT NULL,
  icon_url      VARCHAR(512) DEFAULT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── 4. LESSONS / TOPICS ──
CREATE TABLE IF NOT EXISTS lessons (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  language_id   INT NOT NULL,
  num           VARCHAR(10) NOT NULL, -- e.g. "01", "02"
  title         VARCHAR(255) NOT NULL,
  
  -- Beginner level
  beg_desc      TEXT DEFAULT NULL,
  beg_code      TEXT DEFAULT NULL,
  beg_usecase   TEXT DEFAULT NULL,

  -- Intermediate level
  int_desc      TEXT DEFAULT NULL,
  int_code      TEXT DEFAULT NULL,
  int_usecase   TEXT DEFAULT NULL,

  -- Advanced level
  adv_desc      TEXT DEFAULT NULL,
  adv_code      TEXT DEFAULT NULL,
  adv_usecase   TEXT DEFAULT NULL,

  -- Professional Projects level
  pro_desc      TEXT DEFAULT NULL,
  pro_code      TEXT DEFAULT NULL,
  pro_usecase   TEXT DEFAULT NULL,

  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_lang_num (language_id, num)
) ENGINE=InnoDB;

-- ── 5. DEVELOPMENT TRACKS ──
CREATE TABLE IF NOT EXISTS tracks (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(100) NOT NULL,
  icon_emoji    VARCHAR(50) DEFAULT '💻',
  description   TEXT DEFAULT NULL,
  tech_tags     JSON DEFAULT NULL, -- Array of strings
  hours         INT DEFAULT 0,
  link          VARCHAR(255) DEFAULT '#',
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- ── 6. PLATFORM FEATURES ──
CREATE TABLE IF NOT EXISTS platform_features (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  icon          VARCHAR(100) DEFAULT '🚀',
  title         VARCHAR(100) NOT NULL,
  description   TEXT DEFAULT NULL,
  feature_tags  JSON DEFAULT NULL, -- Array of strings
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- ── 7. PROFESSIONAL PROJECTS ──
CREATE TABLE IF NOT EXISTS professional_projects (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  num           VARCHAR(10) DEFAULT '01',
  title         VARCHAR(255) NOT NULL,
  description   TEXT DEFAULT NULL,
  tech_tags     JSON DEFAULT NULL, -- Array of strings
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- ── 8. CODING CHALLENGES / PROBLEM BANK ──
CREATE TABLE IF NOT EXISTS coding_challenges (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  difficulty    ENUM('easy', 'medium', 'hard', 'expert') NOT NULL DEFAULT 'easy',
  prompt        TEXT NOT NULL,
  tests         JSON DEFAULT NULL, -- e.g. [{"input": "5", "output": "10"}]
  solution      TEXT DEFAULT NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- ── 9. COMMUNITY / TESTIMONIALS ──
CREATE TABLE IF NOT EXISTS testimonials (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  quote         TEXT NOT NULL,
  name          VARCHAR(100) NOT NULL,
  initials      VARCHAR(10) DEFAULT NULL,
  role          VARCHAR(100) DEFAULT NULL,
  avatar_url    VARCHAR(512) DEFAULT NULL,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- ── 10. PRICING PLANS ──
CREATE TABLE IF NOT EXISTS pricing_plans (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(50) NOT NULL,
  price         VARCHAR(50) NOT NULL, -- e.g. "$0", "$29", "$99"
  billing_period VARCHAR(50) DEFAULT NULL, -- e.g. "per month", "one-time"
  features      JSON DEFAULT NULL, -- Array of strings
  cta_label     VARCHAR(100) DEFAULT 'Get Started',
  cta_link      VARCHAR(255) DEFAULT '#',
  is_highlighted TINYINT(1) DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- ── 11. AUDIT LOGS ──
CREATE TABLE IF NOT EXISTS audit_logs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT DEFAULT NULL,
  user_email    VARCHAR(255) DEFAULT NULL,
  action        VARCHAR(100) NOT NULL, -- e.g. "CREATE", "UPDATE", "DELETE"
  target_table  VARCHAR(100) NOT NULL, -- e.g. "lessons", "pricing_plans"
  change_details TEXT DEFAULT NULL,    -- description of changes (e.g. JSON diff or text)
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
