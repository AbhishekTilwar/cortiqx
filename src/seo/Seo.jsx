import { Helmet } from 'react-helmet-async'
import { SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE_PATH, absoluteUrl } from './siteSeo.js'
import { BRAND } from './brand.js'

/**
 * @param {object} props
 * @param {string} props.title - Page title (site name appended when fullTitle is false)
 * @param {string} [props.description]
 * @param {string} props.path - Pathname including leading slash (e.g. "/pricing")
 * @param {boolean} [props.fullTitle] - If true, title is used as-is
 * @param {boolean} [props.noindex]
 * @param {string} [props.imagePath] - Public path for og:image (default DEFAULT_OG_IMAGE_PATH)
 */
export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  fullTitle = false,
  noindex = false,
  imagePath = DEFAULT_OG_IMAGE_PATH,
}) {
  const canonical = absoluteUrl(path)
  const pageTitle = fullTitle ? title : `${title} | ${SITE_NAME}`
  const imageUrl = imagePath.startsWith('http') ? imagePath : absoluteUrl(imagePath)

  const ogAlt = `${SITE_NAME} — ${BRAND.tagline}`

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <meta name="author" content={BRAND.legalName} />
      <meta name="keywords" content={BRAND.metaKeywords} />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="en" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/svg+xml" />
      <meta property="og:image:alt" content={ogAlt} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={ogAlt} />
    </Helmet>
  )
}
