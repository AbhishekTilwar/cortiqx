/** Shared motion tokens for a consistent, premium scroll feel across the marketing site. */
export const FYW_EASE = [0.22, 1, 0.36, 1]

/** Default viewport: triggers slightly before the section fully enters (feels more intentional). */
export const FYW_VIEWPORT = { once: true, amount: 0.18, margin: '0px 0px -12% 0px' }

/** Headers that should re-animate when scrolling back (e.g. sticky project stack). */
export const FYW_VIEWPORT_REPEAT = { once: false, amount: 0.16, margin: '0px 0px -12% 0px' }

export function fywRevealTransition(delay = 0) {
  return { duration: 0.68, ease: FYW_EASE, delay }
}
