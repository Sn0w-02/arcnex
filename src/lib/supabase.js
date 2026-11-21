import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase 연결 정보가 없습니다. 프로젝트 루트의 .env.local을 확인하세요.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
