import { supabase } from './supabase/client';

const configuredApiBase = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');
export const API_URL = configuredApiBase.endsWith('/api') ? configuredApiBase : `${configuredApiBase}/api`;

// ─── Session Token Cache ────────────────────────────────────────────────────
// All parallel API calls on the same page share one getSession() lookup.
let _cachedToken: string | null = null;
let _tokenExpiry = 0;
let _inflightSession: Promise<string | null> | null = null;

async function getAuthToken(): Promise<string | null> {
  if (_cachedToken !== null && Date.now() < _tokenExpiry) return _cachedToken;
  if (!_inflightSession) {
    _inflightSession = supabase.auth.getSession().then(({ data: { session } }) => {
      _cachedToken = session?.access_token ?? null;
      _tokenExpiry = Date.now() + 5_000; // 5-second TTL
      _inflightSession = null;
      return _cachedToken;
    });
  }
  return _inflightSession;
}

/** Call this after sign-out to immediately invalidate the cached token. */
export function clearAuthTokenCache() {
  _cachedToken = null;
  _tokenExpiry = 0;
  _inflightSession = null;
}
// ───────────────────────────────────────────────────────────────────────────

// ─── Response Cache (GET only) ─────────────────────────────────────────────
// Caches successful GET responses in-memory per endpoint. Avoids hammering
// the backend when navigating between admin pages in the same session.
//
// TTLs (in ms) by endpoint prefix:
const RESPONSE_TTLS: Record<string, number> = {
  '/settings':    120_000, // 2 min  — changes very rarely
  '/partners':     60_000, // 1 min
  '/team':         60_000, // 1 min
  '/blog':         60_000, // 1 min
  '/gallery':      60_000, // 1 min
  '/tournaments':  60_000, // 1 min
  '/shop/products':60_000, // 1 min
  '/shop/orders':  15_000, // 15 s   — updates more frequently
  '/registrations':15_000, // 15 s
};

interface RCEntry { data: unknown; expiresAt: number }
const _responseCache = new Map<string, RCEntry>();

function getRCTtl(endpoint: string): number | null {
  for (const [prefix, ttl] of Object.entries(RESPONSE_TTLS)) {
    if (endpoint.startsWith(prefix)) return ttl;
  }
  return null;
}

/** Immediately bust all cached GET responses for a given endpoint prefix. */
export function bustResponseCache(prefix: string) {
  for (const key of Array.from(_responseCache.keys())) {
    if (key.startsWith(prefix)) _responseCache.delete(key);
  }
}

/**
 * Warm up all admin datasets concurrently in background.
 * Call this when the admin layout mounts so switching subpages is instant (0ms).
 */
export function warmupAdminData() {
  const endpoints = [
    '/tournaments',
    '/registrations',
    '/blog',
    '/videos',
    '/gallery',
    '/shop/products',
    '/shop/orders',
    '/team',
    '/partners',
    '/settings',
    '/donations',
  ];
  endpoints.forEach((ep) => {
    apiRequest(ep).catch(() => {});
  });
}
// ───────────────────────────────────────────────────────────────────────────

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const method = (options.method ?? 'GET').toUpperCase();
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // ── Serve from response cache for GET requests ──────────────────────────
  if (method === 'GET') {
    const ttl = getRCTtl(normalizedEndpoint);
    if (ttl !== null) {
      const entry = _responseCache.get(normalizedEndpoint);
      if (entry && Date.now() < entry.expiresAt) {
        return entry.data as { success: boolean; data?: T };
      }
    }
  }

  try {
    const token = await getAuthToken();

    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      headers.set('x-admin-dev-bypass', 'true');
    }

    const response = await fetch(`${API_URL}${normalizedEndpoint}`, {
      ...options,
      headers,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Request failed with status ${response.status}`,
      };
    }

    // ── Store successful GET responses in cache ──────────────────────────
    if (method === 'GET' && result.success) {
      const ttl = getRCTtl(normalizedEndpoint);
      if (ttl !== null) {
        _responseCache.set(normalizedEndpoint, { data: result, expiresAt: Date.now() + ttl });
      }
    }

    // ── Bust cache on mutating requests so subsequent GETs are fresh ─────
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      // Derive the collection prefix to bust (e.g. DELETE /team/123 → /team)
      const collectionPrefix = '/' + normalizedEndpoint.split('/')[1];
      bustResponseCache(collectionPrefix);
    }

    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error, please try again.',
    };
  }
}

export async function uploadFile(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const token = await getAuthToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['x-admin-dev-bypass'] = 'true';
    }

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Upload failed' };
    }

    return { success: true, url: result.url };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error uploading file' };
  }
}
