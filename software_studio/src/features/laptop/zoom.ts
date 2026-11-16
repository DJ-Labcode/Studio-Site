import { clamp01, segment } from '@/shared/lib/math'

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

/** The share of the hero's scroll distance spent zooming; the rest holds the full-screen desktop still. */
export const ZOOM_SHARE = 0.72

/**
 * How the laptop looks at a point in the scroll. `progress` is 0 at the top of the page and 1 when
 * the screen has filled the browser. A narrow (phone) screen starts a little larger.
 */
export function zoomAt(progress: number, narrow: boolean) {
  const p = clamp01(progress)
  const start = narrow ? 0.6 : 0.56
  return {
    /** the screen is drawn at full size and scaled down, so at 1 it fills the browser exactly */
    scale: start + (1 - start) * easeInOut(p),
    /** lifted slightly while small, to leave room for the keyboard base below it (in vh) */
    lift: -2.5 * (1 - p),
    /** opacity of the wordmark and hint shown around the laptop */
    around: 1 - segment(p, 0, 0.35),
    /** the dock appears once the visitor is nearly inside */
    inside: p > 0.9,
    /** the desktop only takes clicks once it is full size */
    live: p > 0.97,
  }
}
