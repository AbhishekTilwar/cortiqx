import { motion } from 'framer-motion'
import { FYW_VIEWPORT, fywRevealTransition } from '../lib/fywMotion.js'

const steps = [
  {
    n: '01',
    rail: 'Discover',
    title: 'DISCOVERY CALL',
    desc: 'First, we learn your vision and requirements to define a clear project strategy.',
  },
  {
    n: '02',
    rail: 'Design',
    title: 'DESIGN',
    desc: 'We craft the right UX and visual strategy aligned with your goals.',
  },
  {
    n: '03',
    rail: 'Develop',
    title: 'DEVELOPMENT',
    desc: 'Our developers turn your designs into clean, scalable code built for the future.',
  },
  {
    n: '04',
    rail: 'Test',
    title: 'TESTING',
    desc: 'Rigorous testing ensures your app is bug-free, responsive, and seamless across devices.',
  },
  {
    n: '05',
    rail: 'Deploy',
    title: 'DEPLOYMENT',
    desc: 'We ship to App Store & Play Store and support a smooth go-live.',
  },
]

function HowProcessRail({ steps: items }) {
  return (
    <div className="fyw-how-rail fyw-how-rail--static">
      <div className="fyw-how-rail__scroll" role="region" aria-label="Five delivery stages">
        <div className="fyw-how-rail__track">
          <div className="fyw-how-rail__wrap">
            <div className="fyw-how-rail__line" aria-hidden>
              <div className="fyw-how-rail__line-bg" />
              <div className="fyw-how-rail__line-fill fyw-how-rail__line-fill--complete" />
            </div>
            <div className="fyw-how-rail__stops">
              {items.map((step) => (
                <div key={step.n} className="fyw-how-rail__stop fyw-how-rail__stop--active">
                  <span className="fyw-how-rail__dot" />
                  <div className="fyw-how-rail__content">
                    <div className="fyw-how-rail__meta">
                      <span className="fyw-how-rail__step-label">
                        Step {step.n}: {step.rail}
                      </span>
                    </div>
                    <div className="fyw-how-rail__description">
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="fyw-section fyw-how">
      <div className="fyw-container fyw-how__inner">
        <div className="fyw-how__title-block">
          <motion.h2
            className="fyw-how__title-vertical"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={FYW_VIEWPORT}
            transition={fywRevealTransition(0)}
          >
            <span className="fyw-how__title-line">HOW</span>
            <span className="fyw-how__title-line">IT</span>
            <span className="fyw-how__title-line fyw-how__title-line--accent">WORKS</span>
          </motion.h2>
          <motion.p
            className="fyw-how__title-tagline"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={FYW_VIEWPORT}
            transition={fywRevealTransition(0.08)}
          >
            Five stages from first call to stores
          </motion.p>
        </div>

        <div className="fyw-how__column">
          <motion.p
            className="fyw-section__lede fyw-how__lede"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={FYW_VIEWPORT}
            transition={fywRevealTransition(0.05)}
          >
            Our streamlined process for building
            <br className="fyw-how__lede-br" />
            high-quality Flutter apps.
          </motion.p>

          <HowProcessRail steps={steps} />
        </div>
      </div>
    </section>
  )
}
