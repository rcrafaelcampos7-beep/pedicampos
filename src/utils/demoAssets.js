import neguinhoBanner from "../assets/neguinho-banner.webp";
import gordinhoBanner from "../assets/gordinho-banner.webp";

// Stable references stored by the optional demo seeds. They keep the current
// repository assets working until each file is deliberately migrated to
// Supabase Storage; they are not remote URLs and must not be used for products.
const DEMO_ASSETS = Object.freeze({
  "asset:demo/neguinhodoacai/banner": neguinhoBanner,
  "asset:demo/gordinhoburguer/banner": gordinhoBanner,
});

export function resolveDemoAssetReference(value) {
  return DEMO_ASSETS[value] || value || "";
}

export function preserveDemoAssetReference(reference, resolvedValue) {
  if (resolvedValue === undefined) return undefined;
  if (reference && resolveDemoAssetReference(reference) === resolvedValue) return reference;
  return resolvedValue;
}
