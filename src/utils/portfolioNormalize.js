/** Normalize Firestore `portfolio` document for public UI */
export function normalizePortfolioDoc(data, id) {
  return {
    id,
    title: data.title || '',
    shortDescription: data.shortDescription || '',
    fullDescription: data.fullDescription || '',
    domain: data.domain || '',
    url: data.url || '',
    image: typeof data.image === 'string' ? data.image : '',
    images: Array.isArray(data.images) ? data.images.filter(Boolean) : [],
    technologies: Array.isArray(data.technologies) ? data.technologies.filter(Boolean) : [],
    order: Number.isFinite(Number(data.order)) ? Number(data.order) : 0,
  }
}

/** Absolute https URL for live project link, or null */
export function liveUrlHref(url) {
  const u = (url || '').trim()
  if (!u) return null
  if (/^https?:\/\//i.test(u)) return u
  return `https://${u}`
}

/** Deduped gallery: main image first, then additional images */
export function portfolioGalleryImages(project) {
  if (!project) return []
  const seen = new Set()
  const out = []
  const push = (raw) => {
    if (typeof raw !== 'string') return
    const u = raw.trim()
    if (!u || seen.has(u)) return
    seen.add(u)
    out.push(u)
  }
  push(project.image)
  if (Array.isArray(project.images)) project.images.forEach(push)
  return out
}

export function portfolioHeroImage(project) {
  const gallery = portfolioGalleryImages(project)
  return gallery[0] || null
}

/** Screenshot service preview when a project has a URL but no uploaded images */
export function portfolioWebsitePreviewUrl(project, width = 1200) {
  const href = liveUrlHref(project?.url)
  if (!href) return null
  const w = Math.min(1600, Math.max(400, Number(width) || 1200))
  return `https://image.thum.io/get/width/${w}/noanimate/${href}`
}

export const WEB_DEVELOPMENT_DOMAIN = 'web-development'
