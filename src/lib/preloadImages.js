const seen = new Set()

/**
 * Hint the browser to fetch image URLs early (Firestore-backed assets, etc.).
 * Dedupes by URL for the lifetime of the page.
 */
export function preloadImageUrl(href) {
  if (typeof document === 'undefined' || !href || seen.has(href)) return
  seen.add(href)
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = href
  document.head.appendChild(link)
}

export function preloadImageUrls(urls, limit = Infinity) {
  let n = 0
  for (const u of urls) {
    if (n >= limit) break
    if (u) {
      preloadImageUrl(u)
      n++
    }
  }
}
