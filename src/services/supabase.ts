import { createClient, SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_DUMMY_URL = 'https://placeholder.supabase.co';
const FALLBACK_DUMMY_KEY = 'placeholder-public-anon-key';

const envUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const isSupabaseConfigured: boolean = Boolean(
  envUrl &&
    envKey &&
    envUrl.startsWith('https://') &&
    envUrl !== FALLBACK_DUMMY_URL &&
    !envUrl.includes('your-project-id')
);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing or incomplete. Please create a .env file.'
  );
}

export const supabase: SupabaseClient = createClient(
  envUrl.startsWith('https://') ? envUrl : FALLBACK_DUMMY_URL,
  envKey || FALLBACK_DUMMY_KEY
);
