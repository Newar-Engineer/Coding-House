-- ============================================
-- Coding House Admin Panel — MySQL Schema
-- ============================================
-- Run this file against your MySQL server:
--   mysql -u root -p < schema.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS codinghouse
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE codinghouse;

-- ── USERS TABLE ──
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  supabase_id  VARCHAR(255) UNIQUE DEFAULT NULL,
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  role         ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  status       ENUM('active', 'idle', 'banned', 'new') NOT NULL DEFAULT 'new',
  plan         ENUM('free', 'pro', 'lifetime') NOT NULL DEFAULT 'free',
  xp           INT NOT NULL DEFAULT 0,
  avatar_url   VARCHAR(512) DEFAULT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email   (email),
  INDEX idx_role    (role),
  INDEX idx_status  (status),
  INDEX idx_plan    (plan)
) ENGINE=InnoDB;

-- ── IMAGES TABLE ──
CREATE TABLE IF NOT EXISTS images (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  filename      VARCHAR(255) NOT NULL,
  storage_path  VARCHAR(512) NOT NULL,
  url           VARCHAR(1024) NOT NULL,
  category      ENUM('course_banner', 'track_icon', 'instructor') NOT NULL,
  linked_slug   VARCHAR(100) DEFAULT NULL,
  alt_text      VARCHAR(255) DEFAULT NULL,
  file_size     INT DEFAULT NULL,
  mime_type     VARCHAR(50) DEFAULT NULL,
  uploaded_by   INT DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_category    (category),
  INDEX idx_linked_slug (linked_slug)
) ENGINE=InnoDB;

-- ── SEED DATA ──
-- Default admin account (update email to match your Supabase Auth admin user)
INSERT INTO users (name, email, role, status, plan, xp)
VALUES ('Admin', 'admin@codinghouse.com', 'admin', 'active', 'lifetime', 99999)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Default student accounts (matching existing localStorage seed data)
INSERT INTO users (name, email, role, status, plan, xp)
VALUES
  ('Shrestha R.', 'shrestha@email.com', 'user', 'active', 'pro', 2840),
  ('Aryan K.',    'aryan@email.com',    'user', 'new',    'free', 4210),
  ('Priya S.',    'priya@email.com',    'user', 'active', 'lifetime', 3880)
ON DUPLICATE KEY UPDATE name = VALUES(name);
