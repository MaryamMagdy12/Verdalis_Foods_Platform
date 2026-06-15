/**
 * Resolve ?category= URL value or filter id to a numeric category id string.
 * Accepts numeric ids, slugs, exact names, and common partial matches (e.g. "dairy" → "dairy-products").
 */
export function resolveCategoryParam(param, categories = []) {
  if (!param || param === "All") return "All";
  const raw = String(param).trim();
  const lower = raw.toLowerCase();

  const byId = categories.find((c) => String(c.id) === raw);
  if (byId) return String(byId.id);

  const bySlug = categories.find((c) => String(c.slug || "").toLowerCase() === lower);
  if (bySlug) return String(bySlug.id);

  const byName = categories.find((c) => String(c.name || "").toLowerCase() === lower);
  if (byName) return String(byName.id);

  const bySlugPartial = categories.find((c) => {
    const slug = String(c.slug || "").toLowerCase();
    return slug === lower || slug.startsWith(`${lower}-`) || slug.includes(lower);
  });
  if (bySlugPartial) return String(bySlugPartial.id);

  const byNamePartial = categories.find((c) => String(c.name || "").toLowerCase().includes(lower));
  if (byNamePartial) return String(byNamePartial.id);

  return null;
}

/** Prefer slug in shareable URLs; fall back to numeric id. */
export function categoryParamForUrl(categoryId, categories = []) {
  if (!categoryId || categoryId === "All") return null;
  const match = categories.find((c) => String(c.id) === String(categoryId));
  return match?.slug ? String(match.slug) : String(categoryId);
}

export function isResolvableCategoryFilter(filter, categories = []) {
  if (!filter || filter === "All") return true;
  return resolveCategoryParam(filter, categories) != null;
}
