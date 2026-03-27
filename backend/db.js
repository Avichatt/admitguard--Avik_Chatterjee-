import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_')) {
    console.warn('⚠️ Supabase credentials not found. Set SUPABASE_URL and SUPABASE_KEY in Netlify env vars.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
