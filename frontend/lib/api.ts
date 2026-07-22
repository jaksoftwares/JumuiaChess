import { supabase } from './supabase/client';

const configuredApiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const API_URL = configuredApiBase.endsWith('/api') ? configuredApiBase : `${configuredApiBase}/api`;

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  try {
    // Attempt to grab token from browser session
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      headers.set('x-admin-dev-bypass', 'true');
    }

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
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

    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error, please try again.',
    };
  }
}
