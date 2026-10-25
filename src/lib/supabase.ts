import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read Vite client-side environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  missingKeys: string[];
  url: string | null;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const missingKeys: string[] = [];
  if (!supabaseUrl) missingKeys.push('VITE_SUPABASE_URL');
  if (!supabasePublishableKey) missingKeys.push('VITE_SUPABASE_PUBLISHABLE_KEY');

  const isValidUrl = Boolean(
    supabaseUrl &&
    (supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://localhost')) &&
    !supabaseUrl.includes('your-project')
  );

  const isValidKey = Boolean(
    supabasePublishableKey &&
    supabasePublishableKey.length > 20 &&
    !supabasePublishableKey.includes('your-supabase')
  );

  return {
    isConfigured: isValidUrl && isValidKey,
    missingKeys,
    url: isValidUrl ? supabaseUrl : null,
  };
}

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfigStatus().isConfigured;
};

// Singleton Client initialization
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null;

/**
 * Initiates Google OAuth Sign-in with redirect
 * Official Supabase implementation using pkce flow
 */
export async function signInWithGoogleOAuth(): Promise<{ error: Error | null }> {
  if (!supabase) {
    return {
      error: new Error(
        'Supabase credentials are not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file to enable live Google authentication.'
      ),
    };
  }

  const redirectUrl =
    import.meta.env.VITE_AUTH_REDIRECT_URL || `${window.location.origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  return { error };
}

/**
 * Anonymous Guest Sign-in with attributable guest session
 */
export async function signInAnonymously(): Promise<{ data: any; error: Error | null }> {
  if (!supabase) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  return { data, error };
}

/**
 * Upload an attachment or avatar to Supabase Storage
 */
export async function uploadFileToStorage(
  bucket: 'avatars' | 'attachments',
  path: string,
  file: File
): Promise<{ publicUrl: string | null; error: Error | null }> {
  if (!supabase) {
    const url = URL.createObjectURL(file);
    return { publicUrl: url, error: null };
  }

  // 5MB limit validation
  if (file.size > 5 * 1024 * 1024) {
    return { publicUrl: null, error: new Error('File size exceeds the 5MB limit.') };
  }

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (uploadError) {
    return { publicUrl: null, error: uploadError };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: data.publicUrl, error: null };
}
