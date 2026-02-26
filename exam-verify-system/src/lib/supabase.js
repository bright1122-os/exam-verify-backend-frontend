import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Exported so upload/query code can check this before making network calls
// rather than letting them silently fail against the placeholder URL.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    '[ExamVerify] VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are not set.\n' +
    'Add these to your .env.local file for local development, or to Vercel → Settings → ' +
    'Environment Variables for production.\n' +
    'Authentication, image upload, and all database queries will fail until they are set.'
  );
}

// createClient requires non-empty strings. Always provide fallback values so the
// module initialises cleanly even when env vars are absent. Actual requests will
// fail at the network level with a clear error rather than throwing at import time.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
