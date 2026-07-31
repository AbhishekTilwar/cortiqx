import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FYW_VIEWPORT, FYW_EASE, fywRevealTransition } from '../lib/fywMotion.js'

/**
 * Compact pricing teaser for the homepage. Numbers mirror the full Pricing
 * page (USD) so nothing on the site contradicts itself. Links through to the
 * full page for detail rather than making pricing a blind nav click.
 */
const tiers = [
  { name: 'Frontend build', from: '$799', note: 'Design → working app' },
  { name: 'MVP build', from: '$2,499', note: 'App + backend + stores', popular: true },
  { name: 'Full-cycle app', from: '$4,499', note: 'User, business & admin' },
]

export default function PricingPreview() {
  return (
    <section id="pricing-preview" className="fyw-section fyw-price-preview">
      <div className="fyw-container">
        <motion.h2
          className="fyw-section__title"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={FYW_VIEWPORT}
          transition={fywRevealTransition(0)}
        >
          Simple, transparent pricing
        </motion.h2>
        <motion.p
          className="fyw-section__lede"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={FYW_VIEWPORT}
          transition={fywRevealTransition(0.06)}
        >
          Fixed-scope packages with everything included to launch — starting from $799 for a
          working app and $2,499 for a full MVP build.
        </motion.p>

        <div className="fyw-price-preview__grid">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              className={`fyw-price-preview__tile${t.popular ? ' is-popular' : ''}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={FYW_VIEWPORT}
              transition={{ ...fywRevealTransition(0.1 + i * 0.07), ease: FYW_EASE }}
            >
              {t.popular && <span className="fyw-price-preview__badge">Most popular</span>}
              <p className="fyw-price-preview__name">{t.name}</p>
              <p className="fyw-price-preview__from">
                <span>from</span> {t.from}
              </p>
              <p className="fyw-price-preview__note">{t.note}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="fyw-price-preview__cta"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={FYW_VIEWPORT}
          transition={fywRevealTransition(0.28)}
        >
          <Link to="/pricing" className="fyw-btn fyw-btn--primary fyw-btn--lg">
            See full pricing
          </Link>
          <p className="fyw-price-preview__fineprint">
            Maintenance plans and custom scopes available — no hidden fees.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
