type Scroller = (el: HTMLElement) => void

let smooth: Scroller | null = null

/** The app registers its smooth scroller here; without one, scrolling is instant. */
export const setScroller = (scroller: Scroller | null) => {
  smooth = scroller
}

/** Travel to the element with this id, the same way a click on an in-page link does. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (smooth) smooth(el)
  else el.scrollIntoView()
}
