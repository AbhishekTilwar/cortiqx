import { Helmet } from 'react-helmet-async'
import { SITE_URL, absoluteUrl } from './siteSeo.js'

const offers = [
  { name: 'Frontend Development', price: '799', description: 'Basic app package' },
  { name: 'MVP Development', price: '2499', description: 'Complete starter package' },
  { name: 'Full-Cycle App Development', price: '4499', description: 'User app, business app, and admin' },
  { name: 'Essential Care', price: '299', description: 'Monthly app maintenance' },
  { name: 'Growth Care', price: '799', description: 'Monthly feature and support plan' },
]

export default function PricingJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'CortiqX development plans',
    url: absoluteUrl('/pricing'),
    itemListElement: offers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      description: offer.description,
      url: absoluteUrl('/pricing'),
      price: offer.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: { '@id': `${SITE_URL}/#organization` },
    })),
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}
