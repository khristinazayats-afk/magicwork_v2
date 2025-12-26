import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tbfwvdcvohmykwdfgiqy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jKfaSWRtxFAR47a6ruk4yQ_vOxPYeuU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);






