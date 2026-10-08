import { useCallback, useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import {
  liveUrlHref,
  portfolioGalleryImages,
  portfolioWebsitePreviewUrl,
} from '../utils/portfolioNormalize'
import './PortfolioPreview.css'

/**
 * Portfolio card media: image carousel, website screenshot preview, or letter placeholder.
 */
export default function PortfolioPreview({
  project,
  domainColor,
  eager = false,
  fetchPriority,
  className = '',
}) {
  const gallery = portfolioGalleryImages(project)
  const href = liveUrlHref(project?.url)
  const websitePreview = gallery.length === 0 && href ? portfolioWebsitePreviewUrl(project) : null

  const [index, setIndex] = useState(0)
  const [previewFailed, setPreviewFailed] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    setIndex(0)
    setPreviewFailed(false)
    setPaused(false)
  }, [project?.id, gallery.length, websitePreview])

  const count = gallery.length
  const go = useCallback(
    (dir) => {
      if (count < 2) return
      setIndex((i) => (i + dir + count) % count)
    },
    [count]
  )

  useEffect(() => {
    if (count < 2 || paused) return undefined
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return undefined
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, 4500)
    return () => window.clearInterval(id)
  }, [count, project?.id, paused])

  const title = project?.title || 'Project'
  const placeholder = (
    <div
      className="portfolio-preview__placeholder"
      style={{ '--pp-domain': domainColor }}
    >
      <span aria-hidden>{title.slice(0, 1)}</span>
    </div>
  )

  let media = null

  if (count > 0) {
    media = (
      <div className="portfolio-preview__carousel" role="group" aria-roledescription="carousel" aria-label={`${title} images`}>
        <div className="portfolio-preview__track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {gallery.map((src, i) => (
            <div key={src} className="portfolio-preview__slide">
              <img
                src={src}
                alt=""
                loading={eager && i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                {...(i === 0 && fetchPriority ? { fetchPriority } : {})}
                draggable={false}
              />
            </div>
          ))}
        </div>
        {count > 1 ? (
          <>
            <button
              type="button"
              className="portfolio-preview__nav portfolio-preview__nav--prev"
              aria-label="Previous image"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                go(-1)
              }}
            >
              <FiChevronLeft aria-hidden />
            </button>
            <button
              type="button"
              className="portfolio-preview__nav portfolio-preview__nav--next"
              aria-label="Next image"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                go(1)
              }}
            >
              <FiChevronRight aria-hidden />
            </button>
            <div className="portfolio-preview__dots" role="tablist" aria-label="Image slides">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Image ${i + 1} of ${count}`}
                  className={`portfolio-preview__dot${i === index ? ' is-active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIndex(i)
                  }}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    )
  } else if (websitePreview && !previewFailed) {
    media = (
      <div className="portfolio-preview__website">
        <img
          src={websitePreview}
          alt={`Preview of ${title}`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          {...(fetchPriority ? { fetchPriority } : {})}
          onError={() => setPreviewFailed(true)}
        />
        {href ? (
          <span className="portfolio-preview__website-badge" aria-hidden>
            Live site
          </span>
        ) : null}
      </div>
    )
  } else {
    media = placeholder
  }

  return (
    <div
      className={`portfolio-preview ${className}`.trim()}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
      }}
    >
      {media}
    </div>
  )
}
