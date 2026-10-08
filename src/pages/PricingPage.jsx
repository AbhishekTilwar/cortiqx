import Pricing from '../components/Pricing.jsx'
import Seo from '../seo/Seo.jsx'
import PricingJsonLd from '../seo/PricingJsonLd.jsx'
import { BRAND } from '../seo/brand.js'

export default function PricingPage() {
  return (
    <>
      <Seo title="Pricing & Plans" description={BRAND.pricingMetaDescription} path="/pricing" />
      <PricingJsonLd />
      <Pricing />
    </>
  )
}
