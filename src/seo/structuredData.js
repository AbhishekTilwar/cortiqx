import { BRAND } from './brand.js'

/**
 * Organization, WebSite, and ProfessionalService graph.
 * Shared by the static index.html injection and the home page JSON-LD.
 * @param {string} origin Canonical origin, no trailing slash.
 */
export function organizationGraph(origin) {
  const siteUrl = String(origin || '').replace(/\/$/, '')
  const abs = (path) => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
  const orgId = `${siteUrl}/#organization`

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': orgId,
    name: BRAND.legalName,
    alternateName: BRAND.name,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: abs('/logo-mark.png'),
      width: 512,
      height: 512,
    },
    image: abs('/og-image.png'),
    description: BRAND.valueProposition,
    slogan: BRAND.slogan,
    email: 'hello@cortiqx.in',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@cortiqx.in',
      contactType: 'sales',
      availableLanguage: ['English'],
      areaServed: 'Worldwide',
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: BRAND.name,
    alternateName: BRAND.legalName,
    url: siteUrl,
    description: BRAND.metaDescription,
    publisher: { '@id': orgId },
    inLanguage: 'en-US',
  }

  const professionalServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteUrl}/#professional-service`,
    name: BRAND.legalName,
    url: siteUrl,
    image: abs('/og-image.png'),
    description: BRAND.valueProposition,
    slogan: BRAND.slogan,
    parentOrganization: { '@id': orgId },
    areaServed: {
      '@type': 'Place',
      name: 'Worldwide',
    },
    serviceType: BRAND.serviceTypes,
    knowsAbout: [
      'Flutter',
      'Cross-platform mobile development',
      'Progressive web applications',
      'User experience design',
      'Machine learning integration',
    ],
  }

  return [orgSchema, websiteSchema, professionalServiceSchema]
}
