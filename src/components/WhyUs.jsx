import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView } from 'framer-motion'
import { FYW_VIEWPORT, FYW_EASE, fywRevealTransition } from '../lib/fywMotion.js'

const stats = [
  { label: 'Client Satisfaction', count: 98, suffix: '%' },
  { label: 'Technologies Mastered', count: 20, suffix: '+' },
  { label: 'On-time Delivery', count: 100, suffix: '%' },
  { label: 'Years of Experience', count: 4, suffix: '+' },
]

function StatCounter({ end, suffix, duration = 1.2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    const ctrl = animate(0, end, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setN(Math.round(latest)),
    })
    return () => ctrl.stop()
  }, [inView, end, duration])

  return (
    <p ref={ref} className="fyw-stat__value">
      {n}
      {suffix}
    </p>
  )
}

export default function WhyUs() {
  return (
    <section id="why-us" className="fyw-section fyw-why">
      <div className="fyw-container">
        <motion.h2
          className="fyw-section__title"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={FYW_VIEWPORT}
          transition={fywRevealTransition(0)}
        >
          Why Us
        </motion.h2>
        <motion.p
          className="fyw-section__lede"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={FYW_VIEWPORT}
          transition={fywRevealTransition(0.06)}
        >
          Passionate app developers dedicated to empowering businesses with innovative tech.
        </motion.p>

        <div className="fyw-why__stats">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="fyw-stat"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={FYW_VIEWPORT}
              transition={{ ...fywRevealTransition(i * 0.07), ease: FYW_EASE }}
            >
              <p className="fyw-stat__label">{s.label}</p>
              {'count' in s ? (
                <StatCounter end={s.count} suffix={s.suffix} duration={s.count <= 10 ? 0.85 : 1.2} />
              ) : (
                <p className="fyw-stat__value">{s.value}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
