/**
 * Lightweight in-memory cache with per-key TTL.
 * Completely zero-dependency — just a Map.
 *
 * Usage:
 *   import cache from './cache';
 *   cache.set('key', data, 60_000);   // store for 60s
 *   cache.get('key');                  // returns data or undefined
 *   cache.invalidate('key');           // bust a single key
 *   cache.invalidatePrefix('team:');   // bust all keys starting with prefix
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private sweepInterval: NodeJS.Timeout;

  constructor() {
    // Sweep expired entries every 2 minutes to prevent memory leak
    this.sweepInterval = setInterval(() => this.sweep(), 2 * 60 * 1_000);
    this.sweepInterval.unref?.(); // Don't keep process alive for sweep alone
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  /** Flush all entries (e.g. for testing). */
  flush(): void {
    this.store.clear();
  }

  private sweep(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
}

// Singleton shared across the whole backend process
const cache = new MemoryCache();
export default cache;
