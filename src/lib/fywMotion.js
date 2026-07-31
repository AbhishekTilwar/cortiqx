/** Shared motion tokens for a consistent, premium scroll feel across the marketing site. */
export const FYW_EASE = [0.22, 1, 0.36, 1]

/**
 * Default viewport. The bottom margin is POSITIVE so the root is expanded
 * downward: reveals begin firing while the element is still ~18% below the
 * fold, so content is already fading in as it scrolls into view instead of
 * sitting as a blank white block until the threshold is crossed.
 */
export const FYW_VIEWPORT = { once: true, amount: 0.01, margin: '0px 0px 18% 0px' }

/** Headers that should re-animate when scrolling back (e.g. sticky project stack). */
export const FYW_VIEWPORT_REPEAT = { once: false, amount: 0.01, margin: '0px 0px 18% 0px' }

export function fywRevealTransition(delay = 0) {
  return { duration: 0.55, ease: FYW_EASE, delay }
}
