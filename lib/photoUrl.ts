/**
 * A pasted photo URL is often a page (imgur.com/aBc1D, a Google Photos share
 * link) rather than the raw image the site's <img>/<Image> needs -- that
 * loads nothing and, without this, fails silently with no clue why. This
 * fixes the one case people actually paste by mistake (an imgur page link)
 * and flags anything else that doesn't look like a direct image so admin can
 * say so instead of just showing a blank tile.
 */
export function normalizePhotoUrl(raw: string): string {
  const url = raw.trim();
  const imgurPage = url.match(/^https?:\/\/(?:www\.)?imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]+)$/);
  if (imgurPage) return `https://i.imgur.com/${imgurPage[1]}.jpg`;
  return url;
}

const IMAGE_EXTENSION = /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i;
const KNOWN_DIRECT_IMAGE_HOST = /^https?:\/\/(i\.imgur\.com|raw\.githubusercontent\.com|.*\.googleusercontent\.com)\//i;

/** True when a URL looks like it points straight at an image file, not a page that merely shows one. */
export function looksLikeDirectImageUrl(url: string): boolean {
  return IMAGE_EXTENSION.test(url) || KNOWN_DIRECT_IMAGE_HOST.test(url);
}
