import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    '[Launch Business] Supabase environment variables are missing. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel project settings. ' +
      'The app will render but data features will be unavailable.',
  );
}

let supabaseClient: SupabaseClient;

try {
  supabaseClient = isConfigured
    ? createClient(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
} catch (error) {
  console.error('[Launch Business] Failed to initialize Supabase client:', error);
  supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabase = supabaseClient;
export const supabaseReady = isConfigured;
