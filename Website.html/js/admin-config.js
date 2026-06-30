/**
 * Admin Config — Coding House
 * Shared configuration for all admin pages.
 * ──────────────────────────────────────────
 * UPDATE THESE VALUES with your Supabase project credentials.
 */
var ADMIN_CONFIG = {
  // Supabase (replace with your project values)
  SUPABASE_URL:      'https://rokoucsmglnwdyufvozs.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJva291Y3NtZ2xud2R5dWZ2b3pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjI1NzksImV4cCI6MjA5NzYzODU3OX0.d-DIiisvTWOR5Hty_E1ba3LQBHKr-EbxKbA0uBaecgc',

  // Express API server
  API_BASE_URL: 'http://localhost:3001/api',

  // Supabase Storage bucket for course/track images
  STORAGE_BUCKET: 'course-images',

  // Upload constraints
  MAX_FILE_SIZE:  5 * 1024 * 1024,  // 5 MB
  ALLOWED_TYPES:  ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  ALLOWED_EXTS:   ['.jpg', '.jpeg', '.png', '.webp', '.svg'],

  // Image categories
  IMAGE_CATEGORIES: [
    { value: 'course_banner', label: 'Course Banner' },
    { value: 'track_icon',    label: 'Track Icon' },
    { value: 'instructor',    label: 'Instructor Photo' }
  ]
};
