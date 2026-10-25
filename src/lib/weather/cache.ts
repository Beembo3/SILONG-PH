export interface CacheEntry<T> {
  value: T;
  storedAt: number;
}

export class TimedCache<T> {
  private entries = new Map<string, CacheEntry<T>>();
  constructor(
    private ttlMs: number,
    private maxEntries = 250,
  ) {}

  getFresh(key: string, now = Date.now()): T | null {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (now - entry.storedAt > this.ttlMs) return null;
    return entry.value;
  }

  getStale(
    key: string,
    maxStaleMs: number,
    now = Date.now(),
  ): { value: T; ageMs: number } | null {
    const entry = this.entries.get(key);
    if (!entry) return null;
    const ageMs = now - entry.storedAt;
    if (ageMs > maxStaleMs) return null;
    return { value: entry.value, ageMs };
  }

  set(key: string, value: T, now = Date.now()): void {
    if (this.entries.size >= this.maxEntries) {
      const oldest = [...this.entries.entries()].sort((a, b) => a[1].storedAt - b[1].storedAt)[0];
      if (oldest) this.entries.delete(oldest[0]);
    }
    this.entries.set(key, { value, storedAt: now });
  }

  delete(key: string): void {
    this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }

  get size(): number {
    return this.entries.size;
  }
}
