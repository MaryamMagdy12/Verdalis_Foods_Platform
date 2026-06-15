import { apiGet } from "../api/client";

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const memory = new Map();

function cacheKey(path, params = {}) {
  const sorted = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      const val = params[key];
      if (val != null && val !== "") acc[key] = val;
      return acc;
    }, {});
  return `${path}:${JSON.stringify(sorted)}`;
}

export function clearCatalogCache(prefix = "") {
  if (!prefix) {
    memory.clear();
    return;
  }
  for (const key of memory.keys()) {
    if (key.startsWith(prefix)) memory.delete(key);
  }
}

export async function cachedApiGet(path, params = {}, ttlMs = DEFAULT_TTL_MS) {
  const key = cacheKey(path, params);
  const hit = memory.get(key);
  if (hit && Date.now() - hit.at < ttlMs) {
    return hit.data;
  }
  const data = await apiGet(path, params);
  memory.set(key, { data, at: Date.now() });
  return data;
}
