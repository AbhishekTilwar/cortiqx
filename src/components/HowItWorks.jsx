import { useLayoutEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { FYW_VIEWPORT, FYW_EASE, fywRevealTransition } from '../lib/fywMotion.js'

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

function useStepReveal(scroll, t0, t1) {
  const fadeEnd = Math.min(t0 + 0.09, t1)
  const opacity = useTransform(scroll, [t0, fadeEnd, 1], [0, 1, 1])
  const y = useTransform(scroll, [t0, t1, 1], [12, 0, 0])
  return { opacity, y }
}

function syncScrollToProgress(el, t) {
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  if (max <= 0) return
  el.scrollLeft = t * max
}

function activeStepIndex(t) {
  return Math.min(4, Math.max(0, Math.floor(Number(t) * 5)))
}

function HowProcessRail({ progress, steps: items, railScrollRef, activeStep }) {
  const lineFill = useTransform(progress, [0, 1], [0, 1])
  // Tighter scroll bands so the rail completes in ~65% of section progress (snappier than 0–0.86)
  const s0 = useStepReveal(progress, 0, 0.12)
  const s1 = useStepReveal(progress, 0.13, 0.25)
  const s2 = useStepReveal(progress, 0.26, 0.38)
  const s3 = useStepReveal(progress, 0.39, 0.51)
  const s4 = useStepReveal(progress, 0.52, 0.64)
  const stopsMotion = [s0, s1, s2, s3, s4]

  return (
    <div className="fyw-how-rail">
      <p className="fyw-how-rail__label">
        <span className="fyw-how-rail__label-desktop">Process line — scroll this section to trace each stage</span>
        <span className="fyw-how-rail__label-mobile">
          Scroll the page — the timeline and cards <strong>slide with each stage</strong>
        </span>
      </p>
      <div
        ref={railScrollRef}
        className="fyw-how-rail__scroll"
        role="region"
        aria-roledescription="carousel"
        aria-label="Five delivery stages — follows scroll on small screens"
        tabIndex={0}
      >
        <div className="fyw-how-rail__track">
          <div className="fyw-how-rail__wrap">
            <div className="fyw-how-rail__line" aria-hidden>
              <div className="fyw-how-rail__line-bg" />
              <motion.div
                className="fyw-how-rail__line-fill"
                style={{
                  scaleX: typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches ? 1 : lineFill,
                  scaleY: typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches ? lineFill : 1,
                }}
              />
            </div>
            <div className="fyw-how-rail__stops">
              {items.map((step, i) => (
                <motion.div
                  key={step.n}
                  className={`fyw-how-rail__stop${activeStep === i ? ' fyw-how-rail__stop--active' : ''}`}
                  style={{ opacity: stopsMotion[i].opacity, y: stopsMotion[i].y }}
                >
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
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="fyw-how-rail__dots" aria-hidden>
        {items.map((step, i) => (
          <span
            key={step.n}
            className={`fyw-how-rail__dot-pip${activeStep === i ? ' fyw-how-rail__dot-pip--active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function HowItWorks() {
  const trackRef = useRef(null)
  const railScrollRef = useRef(null)
  const detailScrollRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const [activeStep, setActiveStep] = useState(0)

  // Track is 400vh to give plenty of room for 5 stages
  const trackVh = 400

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })

  // Snappier spring than featured stack: this section is informational, not snap-aligned
  const progress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 36,
    mass: 0.28,
    restDelta: 0.0002,
  })

  useMotionValueEvent(progress, 'change', (latest) => {
    const next = activeStepIndex(latest)
    setActiveStep((prev) => (prev === next ? prev : next))
  })

  useLayoutEffect(() => {
    const v = progress.get()
    setActiveStep(activeStepIndex(v))
  }, [progress])

  return (
    <section ref={trackRef} className="fyw-how-track" style={{ height: `${trackVh}vh` }}>
      <div className="fyw-how-pin">
        <div id="how-it-works" className="fyw-section fyw-how">
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

              <HowProcessRail
                progress={progress}
                steps={steps}
                railScrollRef={railScrollRef}
                activeStep={activeStep}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
