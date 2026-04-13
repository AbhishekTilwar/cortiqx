/**
 * Values injected into index.html at dev/build time (Node).
 * Keep defaults aligned with VITE_SITE_URL / siteSeo.js.
 */
import { BRAND } from './brand.js'

export const INDEX_HTML_DEFAULT_ORIGIN = 'https://cortiqx.in'

export function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .trim()
}

export function getIndexHtmlBrandPayload(origin) {
  const base = origin.replace(/\/$/, '')
  const documentTitle = `${BRAND.name} — ${BRAND.homeTitleFocus} | cortiqx.in`
  const ogTitle = documentTitle
  return {
    metaDescription: escapeHtmlAttr(BRAND.metaDescription),
    metaKeywords: escapeHtmlAttr(BRAND.metaKeywords),
    author: escapeHtmlAttr(BRAND.legalName),
    canonical: escapeHtmlAttr(`${base}/`),
    ogUrl: escapeHtmlAttr(`${base}/`),
    ogTitle: escapeHtmlAttr(ogTitle),
    ogDescription: escapeHtmlAttr(BRAND.metaDescription),
    ogImage: escapeHtmlAttr(`${base}/og-image.svg`),
    twitterTitle: escapeHtmlAttr(ogTitle),
    twitterDescription: escapeHtmlAttr(BRAND.metaDescription),
    twitterImage: escapeHtmlAttr(`${base}/og-image.svg`),
    documentTitle: escapeHtmlAttr(documentTitle),
  }
}
