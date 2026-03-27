import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const getSupabase = () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith('http')) {
        console.warn('⚠️ Supabase credentials not found or invalid.');
        return null;
    }
    return createClient(supabaseUrl, supabaseKey);
}

const supabase = getSupabase();

export default supabase;
export const envStatus = {
    urlSet: !!process.env.SUPABASE_URL,
    urlValue: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 10) + '...' : 'none',
    keySet: !!process.env.SUPABASE_KEY
};
