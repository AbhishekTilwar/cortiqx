import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import { DOMAINS } from '../data/portfolioData'
import { normalizePortfolioDoc, portfolioHeroImage } from '../utils/portfolioNormalize'
import { preloadImageUrls } from '../lib/preloadImages.js'
import { FYW_VIEWPORT, fywRevealTransition } from '../lib/fywMotion.js'
import './PortfolioSection.css'

const HOME_LIMIT = 6

function liveUrlHref(url) {
  const u = (url || '').trim()
  if (!u) return null
  if (/^https?:\/\//i.test(u)) return u
  return `https://${u}`
}

function usePortfolioProjects() {
  const [projects, setProjects] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'portfolio'), orderBy('order', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data()
          return {
            ...normalizePortfolioDoc(data, d.id),
            projectStatus: data.projectStatus === 'ongoing' ? 'ongoing' : 'delivered',
          }
        })
        preloadImageUrls(
          list.map((row) => portfolioHeroImage(row)).filter(Boolean),
          12
        )
        setProjects(list)
        setReady(true)
      },
      (err) => {
        console.warn('[Portfolio section]', err?.code, err?.message)
        setProjects([])
        setReady(true)
      }
    )
    return () => unsub()
  }, [])

  return { projects, ready }
}

export default function PortfolioSection() {
  const { projects, ready } = usePortfolioProjects()

  if (!ready) return null
  if (projects.length === 0) return null

  const visible = projects.slice(0, HOME_LIMIT)
  const hasMore = projects.length > HOME_LIMIT

  return (
    <section id="portfolio" className="fyw-section fyw-portfolio" aria-labelledby="fyw-portfolio-heading">
      <div className="fyw-container">
        <motion.h2
          id="fyw-portfolio-heading"
          className="fyw-section__title"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={FYW_VIEWPORT}
          transition={fywRevealTransition(0)}
        >
          Portfolio
        </motion.h2>
        <motion.p
          className="fyw-section__lede fyw-portfolio__lede"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={FYW_VIEWPORT}
          transition={fywRevealTransition(0.06)}
        >
          Work we ship across web, mobile, product design, and custom software.
        </motion.p>

        <ul className="fyw-portfolio__grid">
          {visible.map((p, index) => {
            const src = portfolioHeroImage(p)
            const domainMeta = DOMAINS[p.domain] || { label: p.domain || 'Project', color: 'var(--fyw-accent)' }
            const href = liveUrlHref(p.url)
            const eager = index < 4

            return (
              <motion.li
                key={p.id}
                className="fyw-portfolio__card"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={FYW_VIEWPORT}
                transition={fywRevealTransition(0.08 + index * 0.05)}
              >
                <div className="fyw-portfolio__card-inner">
                  <div className="fyw-portfolio__preview">
                    {src ? (
                      <img
                        src={src}
                        alt=""
                        loading={eager ? 'eager' : 'lazy'}
                        decoding="async"
                        {...(index < 2 ? { fetchPriority: 'high' } : index >= 4 ? { fetchPriority: 'low' } : {})}
                      />
                    ) : (
                      <div
                        className="fyw-portfolio__preview-placeholder"
                        style={{ '--pp-domain': domainMeta.color }}
                      >
                        <span aria-hidden>{(p.title || '?').slice(0, 1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="fyw-portfolio__body">
                    <div className="fyw-portfolio__meta-row">
                      <span
                        className="fyw-portfolio__domain"
                        style={{ borderColor: domainMeta.color, color: domainMeta.color }}
                      >
                        {domainMeta.label}
                      </span>
                      {p.projectStatus === 'ongoing' ? (
                        <span className="fyw-portfolio__status-badge">Ongoing</span>
                      ) : null}
                    </div>
                    <h3 className="fyw-portfolio__card-title">{p.title || 'Untitled'}</h3>
                    <p className="fyw-portfolio__card-desc">{p.shortDescription || p.fullDescription || '—'}</p>
                    {(p.technologies || []).length > 0 && (
                      <ul className="fyw-portfolio__tech">
                        {p.technologies.slice(0, 6).map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    )}
                    {href ? (
                      <div className="fyw-portfolio__card-actions">
                        <a
                          className="fyw-btn fyw-btn--outline fyw-portfolio__visit-btn"
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Visit site
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.li>
            )
          })}
        </ul>

        {hasMore ? (
          <motion.div
            className="fyw-portfolio__footer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={FYW_VIEWPORT}
            transition={fywRevealTransition(0.2)}
          >
            <Link to="/Projects" className="fyw-btn fyw-btn--primary fyw-portfolio__view-all">
              View all projects
            </Link>
          </motion.div>
        ) : null}
      </div>
    </section>
  )
}
