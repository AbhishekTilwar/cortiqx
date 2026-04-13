import { Helmet } from 'react-helmet-async'
import { SITE_URL, SITE_NAME, SITE_NAME_FULL, absoluteUrl } from './siteSeo.js'
import { BRAND } from './brand.js'

const orgId = `${SITE_URL}/#organization`
const serviceId = `${SITE_URL}/#professional-service`

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': orgId,
  name: SITE_NAME_FULL,
  alternateName: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl('/favicon.svg'),
  image: absoluteUrl('/og-image.svg'),
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
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME_FULL,
  url: SITE_URL,
  description: BRAND.metaDescription,
  publisher: { '@id': orgId },
  inLanguage: 'en-US',
}

const professionalServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': serviceId,
  name: SITE_NAME_FULL,
  url: SITE_URL,
  image: absoluteUrl('/og-image.svg'),
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

export default function HomeJsonLd() {
  const json = JSON.stringify([orgSchema, websiteSchema, professionalServiceSchema])

  return (
    <Helmet>
      <script type="application/ld+json">{json}</script>
    </Helmet>
  )
}
