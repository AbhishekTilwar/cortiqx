/**
 * Values injected into index.html at dev/build time (Node).
 * Keep defaults aligned with VITE_SITE_URL / siteSeo.js.
 */
import { BRAND } from './brand.js'
import { organizationGraph } from './structuredData.js'

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
  const documentTitle = `${BRAND.name} | ${BRAND.homeTitleFocus}`
  const ogTitle = documentTitle
  const jsonLd = JSON.stringify(organizationGraph(base)).replace(/</g, '\\u003c')
  return {
    metaDescription: escapeHtmlAttr(BRAND.metaDescription),
    metaKeywords: escapeHtmlAttr(BRAND.metaKeywords),
    author: escapeHtmlAttr(BRAND.legalName),
    canonical: escapeHtmlAttr(`${base}/`),
    ogUrl: escapeHtmlAttr(`${base}/`),
    ogTitle: escapeHtmlAttr(ogTitle),
    ogDescription: escapeHtmlAttr(BRAND.metaDescription),
    ogImage: escapeHtmlAttr(`${base}/og-image.png`),
    twitterTitle: escapeHtmlAttr(ogTitle),
    twitterDescription: escapeHtmlAttr(BRAND.metaDescription),
    twitterImage: escapeHtmlAttr(`${base}/og-image.png`),
    documentTitle: escapeHtmlAttr(documentTitle),
    jsonLd,
  }
}
