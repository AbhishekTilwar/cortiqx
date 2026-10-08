/**
 * Single source of truth for CortiqX brand + SEO-facing copy.
 * Used by siteSeo, Helmet, JSON-LD, layout components, and Vite index.html injection.
 */

export const BRAND = {
  /** Legal / formal name */
  legalName: 'CortiqX Labs',

  /** Short public name */
  name: 'CortiqX',

  /** One line—buttons, OG subtitle, social card */
  tagline: 'Ideas to launch. Products that last.',

  /**
   * Core promise: who you help, what you deliver, why it matters.
   * Keep in sync with hero sub and footer.
   */
  valueProposition:
    'We partner with startups and growing teams to design, build, and ship Flutter and cross-platform apps, web products, UX, and AI features—with clear scope, fast iteration, and support after launch.',

  /**
   * Primary meta description (~155–160 chars for SERP).
   * No unescaped `"` (build injects into HTML attributes).
   */
  metaDescription:
    'CortiqX Labs builds Flutter apps, web products, UX, and AI for startups. Clear scope, fast launches, App Store-ready delivery, and support after you go live.',

  metaKeywords: [
    'CortiqX',
    'CortiqX Labs',
    'Flutter development',
    'mobile app development',
    'cross-platform apps',
    'MVP development',
    'product studio',
    'custom software development',
    'UI UX design',
    'web application development',
    'AI integration',
    'App Store submission',
    'digital product agency',
    'software consulting',
    'startup technology partner',
  ].join(', '),

  /** First segment of the home <title> before | CortiqX */
  homeTitleFocus: 'Flutter, Web, UX & AI Product Studio',

  /** Hero supporting line (visible on page—aligned with meta) */
  heroSub:
    'We design and ship Flutter apps, web products, and AI-powered features—so you move from roadmap to real users without losing momentum.',

  /** Footer brand paragraph */
  footerBlurb:
    'CortiqX Labs is a product delivery partner: mobile and web software, UX, and AI—built for clarity, speed, and launches that hold up after day one.',

  pricingMetaDescription:
    'CortiqX Labs pricing: transparent plans for MVPs, full product builds, and ongoing support. Flutter, web, and design—scoped for startups and growing teams.',

  portfolioMetaDescription:
    'Browse the CortiqX Labs portfolio: Flutter apps, web products, UX, and custom software we have shipped, plus case studies and live work across industries.',

  /** JSON-LD: Organization.slogan */
  slogan: 'Ideas to launch. Products that last.',

  /** Schema service categories */
  serviceTypes: [
    'Mobile application development',
    'Web development',
    'User interface design',
    'Artificial intelligence consulting',
    'Software maintenance and support',
  ],
}
