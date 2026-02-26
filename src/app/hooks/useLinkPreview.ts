import React from "react";

// ── Types ──────────────────────────────────────────────────────────
export interface LinkPreview {
  title?: string;
  description?: string;
  image?: string;
  logo?: string;
}

// ── Caches ─────────────────────────────────────────────────────────
const STORAGE_KEY = "besthelp_link_previews";
const memoryCache = new Map<string, LinkPreview>();

// In-flight promise de-duplication so we don't fire multiple fetches for the
// same URL while one is already pending.
const inflight = new Map<string, Promise<LinkPreview>>();

// Limit concurrency so we don't blast the API with 20 parallel requests.
let activeCount = 0;
const MAX_CONCURRENT = 4;
const queue: Array<() => void> = [];

function enqueue(): Promise<void> {
  if (activeCount < MAX_CONCURRENT) {
    activeCount++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    queue.push(() => {
      activeCount++;
      resolve();
    });
  });
}

function dequeue(): void {
  activeCount--;
  if (queue.length > 0) {
    const next = queue.shift();
    next?.();
  }
}

// ── LocalStorage helpers ───────────────────────────────────────────
function loadStorageCache(): Record<string, LinkPreview> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, LinkPreview>;
  } catch {
    return {};
  }
}

function saveToStorage(url: string, data: LinkPreview): void {
  try {
    const cache = loadStorageCache();
    cache[url] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full — silently fail
  }
}

// Hydrate memory cache from localStorage on module load
(function hydrateFromStorage() {
  const stored = loadStorageCache();
  for (const [url, data] of Object.entries(stored)) {
    memoryCache.set(url, data);
  }
})();

// ── OG / meta-tag parser ───────────────────────────────────────────
function getMetaContent(html: string, property: string): string | undefined {
  // Match both property="og:..." and name="..." patterns
  // Handles single quotes, double quotes, and varying attribute order
  const patterns = [
    // <meta property="og:title" content="...">
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    // <meta content="..." property="og:title">
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
      "i"
    ),
    // <meta name="description" content="...">
    new RegExp(
      `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`,
      "i"
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeHTMLEntities(m[1]);
  }
  return undefined;
}

function getTitleTag(html: string): string | undefined {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m?.[1] ? decodeHTMLEntities(m[1].trim()) : undefined;
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function parseOGFromHTML(html: string): LinkPreview {
  const title =
    getMetaContent(html, "og:title") ??
    getMetaContent(html, "twitter:title") ??
    getTitleTag(html);

  const description =
    getMetaContent(html, "og:description") ??
    getMetaContent(html, "twitter:description") ??
    getMetaContent(html, "description");

  const image =
    getMetaContent(html, "og:image") ??
    getMetaContent(html, "twitter:image") ??
    getMetaContent(html, "twitter:image:src");

  // Some sites use relative image URLs — resolve them
  const logo =
    getMetaContent(html, "og:logo") ??
    getMetaContent(html, "msapplication-TileImage");

  return {
    title: title || undefined,
    description: description || undefined,
    image: image || undefined,
    logo: logo || undefined,
  };
}

// CORS proxies (free, no key required) — we try them in order
const CORS_PROXIES = [
  (url: string) =>
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) =>
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

// ── Core fetch function ────────────────────────────────────────────
async function fetchPreview(url: string): Promise<LinkPreview> {
  // Check memory first
  const cached = memoryCache.get(url);
  if (cached) return cached;

  // De-duplicate in-flight requests
  const existing = inflight.get(url);
  if (existing) return existing;

  const promise = (async (): Promise<LinkPreview> => {
    await enqueue();
    try {
      let html: string | null = null;

      for (const proxyFn of CORS_PROXIES) {
        try {
          const proxyUrl = proxyFn(url);
          const res = await fetch(proxyUrl, {
            signal: AbortSignal.timeout(8000),
          });
          if (res.ok) {
            // Only read first 50kB — we only need the <head>
            const reader = res.body?.getReader();
            if (reader) {
              const decoder = new TextDecoder("utf-8", { fatal: false });
              const parts: string[] = [];
              let totalBytes = 0;
              const MAX_BYTES = 50_000;
              while (totalBytes < MAX_BYTES) {
                const { done, value } = await reader.read();
                if (done || !value) break;
                parts.push(decoder.decode(value, { stream: true }));
                totalBytes += value.length;
              }
              // Flush the decoder
              parts.push(decoder.decode());
              reader.cancel().catch(() => {});
              html = parts.join("");
            } else {
              const text = await res.text();
              html = text.slice(0, 50_000);
            }
            break; // success — stop trying proxies
          }
        } catch {
          // try next proxy
        }
      }

      const preview: LinkPreview = html ? parseOGFromHTML(html) : {};

      memoryCache.set(url, preview);
      saveToStorage(url, preview);
      return preview;
    } catch {
      // Network error / timeout — cache an empty result to avoid re-fetching
      const empty: LinkPreview = {};
      memoryCache.set(url, empty);
      return empty;
    } finally {
      dequeue();
      inflight.delete(url);
    }
  })();

  inflight.set(url, promise);
  return promise;
}

// ── Public: imperative fetch (for pre-filling form titles) ─────────
export { fetchPreview as fetchLinkPreview };

// ── Public: cached lookup (sync, no fetch) ─────────────────────────
export function getCachedPreview(url: string): LinkPreview | undefined {
  return memoryCache.get(url);
}

// ── Public: React hook ─────────────────────────────────────────────
export function useLinkPreview(url: string | undefined) {
  const [preview, setPreview] = React.useState<LinkPreview | undefined>(
    url ? memoryCache.get(url) : undefined
  );
  const [loading, setLoading] = React.useState(!preview && !!url);

  React.useEffect(() => {
    if (!url) {
      setPreview(undefined);
      setLoading(false);
      return;
    }

    // Sync check
    const cached = memoryCache.get(url);
    if (cached) {
      setPreview(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchPreview(url).then((result) => {
      if (!cancelled) {
        setPreview(result);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { preview, loading };
}