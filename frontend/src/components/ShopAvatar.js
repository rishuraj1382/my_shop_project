// frontend/src/components/ShopAvatar.js
import React from 'react';

// Shops created before the real-upload feature shipped still have this literal
// URL stored (it was the old schema default) — treated as "no real image" too,
// so old shops fall back to the same professional icon as brand-new ones.
export const LEGACY_PLACEHOLDER_SHOP_IMAGE = 'https://placehold.co/600x400/6366f1/white?text=My+Shop';

export function hasRealShopImage(url) {
  return !!url && url !== LEGACY_PLACEHOLDER_SHOP_IMAGE;
}

// The backend generates and stores exactly two real objects per shop at upload
// time (S3 has no on-the-fly transform-by-URL the way the app's old Cloudinary
// setup did): `shops/<id>/full.jpg` (the canonical stored `shopImage` URL) and
// `shops/<id>/thumb.jpg` (a pre-generated 400x400-capped variant). List/card
// views ask for the thumb by swapping the filename in the known, fixed URL
// shape — no extra request, no backend round-trip. Falls through untouched for
// any URL that doesn't match this app's own naming convention (e.g. the legacy
// placeholder, or a differently-shaped URL from some future storage change).
export function getShopThumbnailUrl(url) {
  if (!hasRealShopImage(url)) return url;
  if (!url.endsWith('/full.jpg')) return url;
  return url.slice(0, -'/full.jpg'.length) + '/thumb.jpg';
}

const SIZE_CLASSES = {
  sm: 'w-10 h-10 rounded-xl',
  md: 'w-16 h-16 rounded-xl',
  lg: 'w-24 h-24 rounded-2xl',
  cover: 'w-full h-full rounded-none',
};

const ICON_SIZE_CLASSES = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  cover: 'text-6xl',
};

/**
 * ShopAvatar — the one place that decides "real photo vs. professional fallback"
 * for a shop image, used consistently everywhere a shop's photo is shown.
 * @param {string} src - shop.shopImage
 * @param {string} alt - shop name, for both the <img> alt text and icon aria-label
 * @param {'sm'|'md'|'lg'|'cover'} [size]
 * @param {boolean} [useThumbnail] - use the pre-generated 400x400-capped variant instead of the full master (list/card views); the detail/settings/checkout views that show a larger image should leave this off
 * @param {boolean} [lazy] - defaults true; set false for above-the-fold hero-style usage
 */
function ShopAvatar({ src, alt, size = 'md', useThumbnail = false, lazy = true, className = '' }) {
  const isReal = hasRealShopImage(src);
  const displaySrc = isReal && useThumbnail ? getShopThumbnailUrl(src) : src;

  if (isReal) {
    return (
      <img
        src={displaySrc}
        alt={alt || 'Shop'}
        loading={lazy ? 'lazy' : undefined}
        className={`${SIZE_CLASSES[size]} object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt ? `${alt} — no photo uploaded` : 'No shop photo uploaded'}
      className={`${SIZE_CLASSES[size]} bg-primary-container flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <span className={`material-symbols-outlined ${ICON_SIZE_CLASSES[size]} text-on-primary/30`}>storefront</span>
    </div>
  );
}

export default ShopAvatar;
