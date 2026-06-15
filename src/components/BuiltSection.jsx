import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { db } from '../firebase/config'
import { DOMAINS, projects as staticProjects } from '../data/portfolioData'
import './BuiltCarousel.css'
import {
  normalizePortfolioDoc,
  portfolioHeroImage,
  WEB_DEVELOPMENT_DOMAIN,
} from '../utils/portfolioNormalize.js'
import { FYW_VIEWPORT, FYW_EASE, fywRevealTransition } from '../lib/fywMotion.js'
import { preloadImageUrls } from '../lib/preloadImages.js'

const staticWebProjects = staticProjects.filter((p) => p.domain === WEB_DEVELOPMENT_DOMAIN)

function liveUrlHref(url) {
  const u = (url || '').trim()
  if (!u) return null
  if (/^https?:\/\//i.test(u)) return u
  return `https://${u}`
}

function DesktopWindow({ children, className = '' }) {
  return (
    <div className={`fyw-built__window ${className}`.trim()}>
      <div className="fyw-built__window-titlebar" aria-hidden>
        <span className="fyw-built__window-dots">
          <span className="fyw-built__window-dot fyw-built__window-dot--close" />
          <span className="fyw-built__window-dot fyw-built__window-dot--minimize" />
          <span className="fyw-built__window-dot fyw-built__window-dot--maximize" />
        </span>
      </div>
      <div className="fyw-built__window-viewport">{children}</div>
    </div>
  )
}

function useWebDevelopmentPortfolio() {
  const [projects, setProjects] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'portfolio'), orderBy('order', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) => normalizePortfolioDoc(d.data(), d.id))
        const web = all.filter((p) => p.domain === WEB_DEVELOPMENT_DOMAIN)
        const list = web.length > 0 ? web : snap.docs.length === 0 ? staticWebProjects : []
        preloadImageUrls(
          list.map((p) => portfolioHeroImage(p)).filter(Boolean),
          12
        )
        setProjects(list)
        setReady(true)
      },
      (err) => {
        console.warn('[Built section / portfolio]', err?.code, err?.message)
        preloadImageUrls(
          staticWebProjects.map((p) => portfolioHeroImage(p)).filter(Boolean),
          12
        )
        setProjects(staticWebProjects)
        setReady(true)
      }
    )
    return () => unsub()
  }, [])

  return { projects, ready }
}

function BuiltProjectCard({ project, domainMeta, imgPriority }) {
  const src = portfolioHeroImage(project)
  const href = liveUrlHref(project.url)

  return (
    <article className="fyw-built-premium__card">
      <div className="fyw-built-premium__preview">
        <DesktopWindow className="fyw-built__window--premium">
          {src ? (
            <img
              src={src}
              alt=""
              loading={imgPriority ? 'eager' : 'lazy'}
              decoding="async"
              {...(imgPriority ? { fetchPriority: 'high' } : { fetchPriority: 'low' })}
            />
          ) : (
            <div
              className="fyw-built__img-placeholder fyw-built__img-placeholder--in-window"
              style={{ '--built-placeholder': domainMeta?.color || '#ff6b6b' }}
            >
              <span aria-hidden>{(project.title || '?').slice(0, 1)}</span>
            </div>
          )}
        </DesktopWindow>
      </div>

      <div className="fyw-built-premium__copy">
        <p className="fyw-service-card__tag">{domainMeta?.label || 'Web Development'}</p>
        <h3>{project.title}</h3>
        <p className="fyw-service-card__desc">{project.shortDescription || project.fullDescription}</p>

        {(project.technologies || []).length > 0 && (
          <div className="fyw-built__tech-side">
            <p className="fyw-built__tech-title">Technologies</p>
            <div className="fyw-built__tech-list">
              {(project.technologies || []).map((tech) => (
                <span key={tech} className="fyw-built__tech-chip">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="fyw-built__links">
          <Link className="fyw-built__cta-link fyw-built__cta-link--primary" to="/#projects">
            View details
          </Link>
          {href && (
            <a className="fyw-built__cta-link fyw-built__cta-link--secondary" href={href} target="_blank" rel="noreferrer">
              Live site
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

function BuiltPremiumCarousel({ projects }) {
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()
  const n = projects.length
  const domainMeta = DOMAINS[WEB_DEVELOPMENT_DOMAIN]

  const goTo = useCallback(
    (index) => {
      setActive(((index % n) + n) % n)
    },
    [n]
  )

  const goPrev = useCallback(() => {
    setDirection(-1)
    goTo(active - 1)
  }, [active, goTo])

  const goNext = useCallback(() => {
    setDirection(1)
    goTo(active + 1)
  }, [active, goTo])

  useEffect(() => {
    if (reduceMotion || n <= 1) return undefined
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % n)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [n, reduceMotion])

  const slideVariants = {
    enter: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 48 : -48,
      scale: 0.97,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.55, ease: FYW_EASE },
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction > 0 ? -48 : 48,
      scale: 0.97,
      transition: { duration: 0.4, ease: FYW_EASE },
    }),
  }

  const [direction, setDirection] = useState(0)

  if (reduceMotion) {
    return (
      <div className="fyw-built__simple-wrap">
        <div className="fyw-container fyw-built-premium__simple">
          {projects.map((p, i) => (
            <BuiltProjectCard key={p.id} project={p} domainMeta={domainMeta} imgPriority={i < 2} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fyw-built-premium">
      <div className="fyw-built-premium__stage" aria-live="polite">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={projects[active].id}
            className="fyw-built-premium__slide"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <BuiltProjectCard
              project={projects[active]}
              domainMeta={domainMeta}
              imgPriority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {n > 1 && (
        <div className="fyw-built-premium__controls">
          <button
            type="button"
            className="fyw-built-premium__nav"
            onClick={goPrev}
            aria-label="Previous project"
          >
            <IoChevronBack aria-hidden />
          </button>

          <div className="fyw-built-premium__dots" role="tablist" aria-label="Portfolio projects">
            {projects.map((p, i) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Show ${p.title}`}
                className={`fyw-built-premium__dot${i === active ? ' is-active' : ''}`}
                onClick={() => {
                  setDirection(i > active ? 1 : -1)
                  goTo(i)
                }}
              />
            ))}
          </div>

          <button
            type="button"
            className="fyw-built-premium__nav"
            onClick={goNext}
            aria-label="Next project"
          >
            <IoChevronForward aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}

export default function BuiltSection() {
  const { projects, ready } = useWebDevelopmentPortfolio()

  if (!ready) return null
  if (projects.length === 0) return null

  return (
    <section id="built" className="fyw-section fyw-built" aria-labelledby="fyw-built-heading">
      <div className="fyw-container">
        <div className="fyw-built__header">
          <motion.h2
            id="fyw-built-heading"
            className="fyw-section__title"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={FYW_VIEWPORT}
            transition={fywRevealTransition(0)}
          >
            CortiqX is <span className="fyw-gradient-text">built</span>
          </motion.h2>
          <motion.p
            className="fyw-section__lede"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={FYW_VIEWPORT}
            transition={fywRevealTransition(0.06)}
          >
            Web development work from our portfolio—crafted with precision and shipped with confidence.
          </motion.p>
        </div>

        <BuiltPremiumCarousel projects={projects} />
      </div>
    </section>
  )
}
