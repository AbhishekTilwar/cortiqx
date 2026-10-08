import { Link } from 'react-router-dom'
import Seo from '../seo/Seo.jsx'

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page not found"
        description="That page is not on CortiqX. Visit the homepage for Flutter, web, UX, and AI product work."
        noindex
      />
      <section className="fyw-section">
        <div className="fyw-container">
          <h1 className="fyw-section__title">Page not found</h1>
          <p className="fyw-section__lede">
            That address is not part of CortiqX. The homepage has our work, pricing, and a way to book a call.
          </p>
          <Link to="/" className="fyw-btn fyw-btn--primary">
            Back to CortiqX
          </Link>
        </div>
      </section>
    </>
  )
}
