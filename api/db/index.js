// Database utilities for gamification
import { sql } from '@vercel/postgres';

// Get user ID (mock in dev, real in prod)
const DEV_MODE = process.env.NODE_ENV === 'development';
const MOCK_USER_ID = 'dev-user-123';

// Get user ID (mock in dev, real in prod)
export function getUserId(req) {
  // TODO: Replace with real auth when available
  if (DEV_MODE) {
    return MOCK_USER_ID;
  }
  // For now, accept user_id from query/body or use mock
  return req.query?.user_id || req.body?.user_id || MOCK_USER_ID;
}

// Get today's UTC date as YYYY-MM-DD
export function getTodayUTC() {
  return new Date().toISOString().split('T')[0];
}

// Get date string for a given date
export function getDateString(date) {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date;
}

// Initialize database tables (run once)
export async function initDatabase() {
  try {
    // Check if tables exist by trying to query them
    await sql`SELECT 1 FROM events LIMIT 1`;
    await sql`SELECT 1 FROM daily_counters LIMIT 1`;
    await sql`SELECT 1 FROM milestones_granted LIMIT 1`;
    console.log('Database tables already exist');
  } catch (error) {
    console.log('Database tables need to be created. Run schema.sql first.');
    throw error;
  }
}

