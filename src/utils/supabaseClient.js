import { createClient } from '@supabase/supabase-js';

// Default Supabase config storage key
const STORAGE_KEY = 'mqst_supabase_config';

/**
 * Get active Supabase configuration:
 * 1. Checks localStorage (allows users to configure directly from GitHub Pages UI!)
 * 2. Checks Vite env variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 * 3. Default fallback placeholders
 */
export function getSupabaseConfig() {
  let localConfig = null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      localConfig = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to parse saved supabase config:', e);
  }

  const url = localConfig?.url || import.meta.env.VITE_SUPABASE_URL || '';
  const anonKey = localConfig?.anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: url.trim(),
    anonKey: anonKey.trim(),
    isConfigured: Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 20)
  };
}

export function isSupabaseConfigured() {
  return getSupabaseConfig().isConfigured;
}

/**
 * Save user-provided Supabase credentials to localStorage
 */
export function saveSupabaseConfig(url, anonKey) {
  const cleanedUrl = (url || '').trim();
  const cleanedKey = (anonKey || '').trim();

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    url: cleanedUrl,
    anonKey: cleanedKey,
    updatedAt: new Date().toISOString()
  }));

  // Reset cached client instance so next call uses new credentials
  cachedClient = null;
}

/**
 * Clear custom Supabase config
 */
export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY);
  cachedClient = null;
}

let cachedClient = null;

/**
 * Get Supabase client singleton
 */
export function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const { url, anonKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return null;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    return cachedClient;
  } catch (err) {
    console.error('Error creating Supabase client:', err);
    return null;
  }
}

/**
 * Test connectivity with current or provided Supabase credentials
 */
export async function testSupabaseConnection(overrideUrl, overrideKey) {
  let client;
  if (overrideUrl && overrideKey) {
    try {
      client = createClient(overrideUrl.trim(), overrideKey.trim());
    } catch (e) {
      return { success: false, message: 'Format URL atau Key Supabase tidak valid: ' + e.message };
    }
  } else {
    client = getSupabaseClient();
  }

  if (!client) {
    return { success: false, message: 'Kredensial Supabase (URL & Anon Key) belum diisi.' };
  }

  try {
    const { data, error } = await client
      .from('works')
      .select('id')
      .limit(1);

    if (error) {
      // If table doesn't exist yet, but connection succeeded
      if (error.code === '42P01') {
        return { 
          success: false, 
          tableMissing: true,
          message: 'Terkoneksi ke Supabase, tapi tabel "works" belum dibuat. Silakan jalankan script supabase_schema.sql di Supabase SQL Editor.' 
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Berhasil terhubung ke Supabase Database & siap digunakan di GitHub Pages!', data };
  } catch (err) {
    return { success: false, message: 'Gagal terhubung ke Supabase: ' + err.message };
  }
}

/**
 * Resolve asset URLs:
 * - If url is a Supabase public storage URL, returns it
 * - If url is data: or https://, returns it
 * - If url is old localhost:5000/uploads/... or /uploads/..., maps to base_url/uploads/... so existing assets load on GitHub Pages!
 */
export function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Already an external https link (e.g. Supabase Storage)
  if (trimmed.startsWith('https://') && !trimmed.includes('localhost:5000')) {
    return trimmed;
  }

  // Convert old localhost:5000/uploads/ or /uploads/ to base URL relative path
  const uploadsMatch = trimmed.match(/\/uploads\/(.+)$/);
  if (uploadsMatch) {
    const filename = uploadsMatch[1];
    const baseUrl = import.meta.env.BASE_URL || '/';
    // ensure trailing slash
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    return `${cleanBase}uploads/${filename}`;
  }

  return trimmed;
}
