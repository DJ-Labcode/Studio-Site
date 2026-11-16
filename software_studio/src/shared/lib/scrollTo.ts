type Target = HTMLElement | number
type Driver = { to: (target: Target) => void; lock: (locked: boolean) => void }

let driver: Driver | null = null

/** The app registers its smooth scroller here; without one, scrolling is the browser's own. */
export const setScrollDriver = (next: Driver | null) => {
  driver = next
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Travel to a position down the page, in pixels. */
export function scrollToY(top: number) {
  if (driver) driver.to(top)
  else window.scrollTo({ top, behavior: reduced() ? 'auto' : 'smooth' })
}

/** Travel to the element with this id, the same way a click on an in-page link does. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (driver) driver.to(el)
  else el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' })
}

/** Stop the page from scrolling (while the laptop starts up, or a window is open on top), and let it go again. */
export function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? 'hidden' : ''
  driver?.lock(locked)
}
