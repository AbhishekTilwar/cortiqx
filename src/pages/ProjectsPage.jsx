import { useEffect, useLayoutEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import { DOMAINS } from '../data/portfolioData'
import { normalizePortfolioDoc, portfolioHeroImage } from '../utils/portfolioNormalize'
import { preloadImageUrls } from '../lib/preloadImages.js'
import Seo from '../seo/Seo.jsx'
import { BRAND } from '../seo/brand.js'
import './ProjectsPage.css'

function liveUrlHref(url) {
  const u = (url || '').trim()
  if (!u) return null
  if (/^https?:\/\//i.test(u)) return u
  return `https://${u}`
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
        const heroUrls = list.map((row) => portfolioHeroImage(row)).filter(Boolean)
        preloadImageUrls(heroUrls, 16)
        heroUrls.forEach((src) => {
          const img = new Image()
          img.src = src
        })

        setProjects(list)
        setReady(true)
      },
      (err) => {
        console.warn('[Projects page / portfolio]', err?.code, err?.message)
        setProjects([])
        setReady(true)
      }
    )
    return () => unsub()
  }, [])

  return (
    <div className="projects-page">
      <Seo title="Portfolio & Case Studies" description={BRAND.portfolioMetaDescription} path="/Projects" />
      <section className="projects-page__section" aria-labelledby="projects-page-heading">
        <div className="fyw-container projects-page__intro">
          <motion.h1
            id="projects-page-heading"
            className="fyw-section__title projects-page__title"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Portfolio
          </motion.h1>
          <motion.p
            className="fyw-section__lede projects-page__lede"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            Work we ship across web, mobile, product design, and custom software.
          </motion.p>
          {!ready && <p className="projects-page__status">Loading projects…</p>}
          {ready && projects.length === 0 && (
            <div className="projects-page__empty">
              <p>No portfolio projects yet.</p>
              <Link to="/" className="fyw-btn fyw-btn--outline projects-page__back">
                Back to home
              </Link>
            </div>
          )}
        </div>

        {ready && projects.length > 0 && (
          <div className="fyw-container projects-page__grid-wrap">
            <ul className="projects-page__grid">
              {projects.map((p, index) => {
                const src = portfolioHeroImage(p)
                const domainMeta = DOMAINS[p.domain] || { label: p.domain || 'Project', color: 'var(--fyw-accent)' }
                const href = liveUrlHref(p.url)
                const eager = index < 8
                return (
                  <li key={p.id} className="projects-page__card">
                    <div className="projects-page__card-inner">
                      <div className="projects-page__preview">
                        {src ? (
                          <img
                            src={src}
                            alt=""
                            loading={eager ? 'eager' : 'lazy'}
                            decoding="async"
                            {...(index < 3 ? { fetchPriority: 'high' } : index >= 8 ? { fetchPriority: 'low' } : {})}
                          />
                        ) : (
                          <div
                            className="projects-page__preview-placeholder"
                            style={{ '--pp-domain': domainMeta.color }}
                          >
                            <span aria-hidden>{(p.title || '?').slice(0, 1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="projects-page__body">
                        <div className="projects-page__meta-row">
                          <span
                            className="projects-page__domain"
                            style={{ borderColor: domainMeta.color, color: domainMeta.color }}
                          >
                            {domainMeta.label}
                          </span>
                          {p.projectStatus === 'ongoing' ? (
                            <span className="projects-page__status-badge">Ongoing</span>
                          ) : null}
                        </div>
                        <h2 className="projects-page__card-title">{p.title || 'Untitled'}</h2>
                        <p className="projects-page__card-desc">{p.shortDescription || p.fullDescription || '—'}</p>
                        {(p.technologies || []).length > 0 && (
                          <ul className="projects-page__tech">
                            {p.technologies.slice(0, 8).map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        )}
                        {href ? (
                          <div className="projects-page__card-actions">
                            <a
                              className="fyw-btn fyw-btn--outline projects-page__visit-btn"
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
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}
