import { Link } from 'react-router-dom'
import logoSrc from '../assets/logo.png'

/**
 * Brand lockup. The PNG already contains the "Cortiqx" wordmark, so the
 * separate text span is off by default to avoid a duplicate wordmark.
 * Pass `showName` if you ever need an icon-only mark plus text.
 */
export default function BrandLogo({
  linkClassName = 'fyw-logo',
  imgClassName = '',
  showName = false,
  'aria-label': ariaLabel = 'CortiqX home',
}) {
  return (
    <Link to="/" className={linkClassName} aria-label={ariaLabel}>
      <img
        src={logoSrc}
        alt="CortiqX"
        className={['fyw-logo__img', imgClassName].filter(Boolean).join(' ')}
        decoding="async"
        width="760"
        height="259"
      />
      {showName && (
        <span className="fyw-logo__text">
          Cortiq<span className="fyw-gradient-text">X</span>
        </span>
      )}
    </Link>
  )
}
