export function slugify(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uniqueSlug(baseSlug, stores, currentStoreId = null) {
  const base = slugify(baseSlug) || "loja";
  let candidate = base;
  let index = 2;

  while (
    stores.some((store) => store.slug === candidate && store.id !== currentStoreId)
  ) {
    candidate = `${base}-${index}`;
    index += 1;
  }

  return candidate;
}
