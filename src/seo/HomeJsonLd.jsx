import { Helmet } from 'react-helmet-async'
import { SITE_URL } from './siteSeo.js'
import { organizationGraph } from './structuredData.js'

export default function HomeJsonLd() {
  const json = JSON.stringify(organizationGraph(SITE_URL))

  return (
    <Helmet>
      <script type="application/ld+json">{json}</script>
    </Helmet>
  )
}
