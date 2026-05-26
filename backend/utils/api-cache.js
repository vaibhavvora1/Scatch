const store = new Map();
const tagIndex = new Map();
const MAX_ENTRIES = 100;

function normalizeUrl(req) {
  return `${req.method}:${req.baseUrl}${req.path}?${new URLSearchParams(
    req.query,
  ).toString()}`;
}

function addTag(tag, key) {
  if (!tagIndex.has(tag)) tagIndex.set(tag, new Set());
  tagIndex.get(tag).add(key);
}

function removeKey(key) {
  const entry = store.get(key);
  if (!entry) return;

  for (const tag of entry.tags) {
    const keys = tagIndex.get(tag);
    if (!keys) continue;
    keys.delete(key);
    if (keys.size === 0) tagIndex.delete(tag);
  }

  store.delete(key);
}

function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) removeKey(key);
  }

  while (store.size > MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    removeKey(oldestKey);
  }
}

function cache(ttlSeconds, tags = []) {
  return (req, res, next) => {
    if (req.method !== "GET") return next();

    const key = normalizeUrl(req);
    const hit = store.get(key);
    const now = Date.now();

    if (hit && hit.expiresAt > now) {
      res.set("X-Cache", "HIT");
      return res.status(hit.statusCode).json(hit.body);
    }

    if (hit) removeKey(key);
    pruneCache();

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const cachedBody = JSON.parse(JSON.stringify(body));
        store.set(key, {
          body: cachedBody,
          statusCode: res.statusCode,
          expiresAt: now + ttlSeconds * 1000,
          tags,
        });
        tags.forEach((tag) => addTag(tag, key));
        pruneCache();
        res.set("X-Cache", "MISS");
      }

      return originalJson(body);
    };

    return next();
  };
}

function clearCacheTags(tags) {
  for (const tag of tags) {
    const keys = tagIndex.get(tag);
    if (!keys) continue;

    for (const key of [...keys]) {
      removeKey(key);
    }
  }
}

function clearAllCache() {
  store.clear();
  tagIndex.clear();
}

module.exports = {
  cache,
  clearAllCache,
  clearCacheTags,
};
