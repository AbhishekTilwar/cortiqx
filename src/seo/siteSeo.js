import { BRAND } from './brand.js'

/** Canonical site origin (no trailing slash). Override with VITE_SITE_URL in production. */
export const SITE_URL = String(import.meta.env.VITE_SITE_URL || 'https://cortiqx.in').replace(
  /\/$/,
  '',
)

export const SITE_NAME = BRAND.name
export const SITE_NAME_FULL = BRAND.legalName

export const DEFAULT_DESCRIPTION = BRAND.metaDescription
export const BRAND_TAGLINE = BRAND.tagline
export const BRAND_VALUE_PROPOSITION = BRAND.valueProposition

/** Relative path under public/; replace with a 1200×630 JPG/PNG for best social preview support. */
export const DEFAULT_OG_IMAGE_PATH = '/og-image.svg'

export function absoluteUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${p}`
}
