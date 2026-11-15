/** URLs of a numbered frame sequence in /public/frames/<name>/0001.webp … */
export function frameUrls(name: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `/frames/${name}/${String(i + 1).padStart(4, '0')}.webp`,
  )
}

const cache = new Map<string, HTMLImageElement>()

/** the decoded image for a URL, or undefined while it is still loading (or failed) */
export function loadedFrame(url: string | undefined): HTMLImageElement | undefined {
  const im = url ? cache.get(url) : undefined
  return im?.complete && im.naturalWidth > 0 ? im : undefined
}

/** start loading frames; resolves when every one has loaded or failed. `onEach` reports progress. */
export function preloadFrames(urls: readonly string[], onEach?: () => void): Promise<void> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const done = () => {
            onEach?.()
            resolve()
          }
          const existing = cache.get(url)
          if (existing?.complete) return done()
          const im = existing ?? new Image()
          im.decoding = 'async'
          im.addEventListener('load', done, { once: true })
          im.addEventListener('error', done, { once: true })
          if (!existing) {
            cache.set(url, im)
            im.src = url
          }
        }),
    ),
  ).then(() => undefined)
}

/** index of the loaded frame closest to `wanted`, so a slow connection never shows a blank */
export function nearestLoaded(urls: readonly string[], wanted: number): number | undefined {
  for (let d = 0; d < urls.length; d++) {
    if (loadedFrame(urls[wanted - d])) return wanted - d
    if (loadedFrame(urls[wanted + d])) return wanted + d
  }
  return undefined
}
