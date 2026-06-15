import Hero from '../components/Hero.jsx'
import Services from '../components/Services.jsx'
import WhyUs from '../components/WhyUs.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import TransformCta from '../components/TransformCta.jsx'
import Projects from '../components/Projects.jsx'
import PortfolioSection from '../components/PortfolioSection.jsx'
import Testimonials from '../components/Testimonials.jsx'
import ClientsSection from '../components/ClientsSection.jsx'
import ContactSection from '../components/ContactSection.jsx'
import Seo from '../seo/Seo.jsx'
import HomeJsonLd from '../seo/HomeJsonLd.jsx'
import { DEFAULT_DESCRIPTION } from '../seo/siteSeo.js'
import { BRAND } from '../seo/brand.js'

export default function Home() {
  return (
    <>
      <Seo title={BRAND.homeTitleFocus} description={DEFAULT_DESCRIPTION} path="/" />
      <HomeJsonLd />
      <div className="fyw-home">
        <Hero />
        <ClientsSection />
        <Services />
        <WhyUs />
        <HowItWorks />
        <TransformCta />
        <Projects />
        <PortfolioSection />
        <Testimonials />
        <ContactSection />
      </div>
    </>
  )
}
