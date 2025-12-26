import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tbfwvdcvohmykwdfgiqy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZnd2ZGN2b2hteWt3ZGZnaXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NDYzNDksImV4cCI6MjA4MjIyMjM0OX0.iqqtfeXxSFPkGjRHAYWi3F1sOuT-RA34DpsM8PzM7_g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);






