import { clamp01, segment } from '@/shared/lib/math'

/** Key moments of the splash, in milliseconds from the start. */
export const SPLASH = {
  enter: 150,
  hit: 950,
  open: 1420,
  opened: 2220,
  hold: 2820,
  landed: 3520,
  end: 4150,
} as const

export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

export type SplashProgress = {
  /** 0..1 the two halves and their letters sliding in (linear; ease it where it is used) */
  enter: number
  /** letter scale: a small, quickly fading bounce right after the hit */
  settle: number
  /** 0..1 life of the ring and sparks, or null when they are not on screen */
  strike: number | null
  /** 0..1 the orange half folding into the F */
  fold: number
  /** 0..1 "uo" sliding out of the D */
  uo: number
  /** 0..1 "orge" sliding out of the F */
  orge: number
  /** 0..1 width of the underline (grows, then leaves) */
  underline: number
  /** 0..1 opacity of the tagline */
  tag: number
  /** 0..1 the wordmark travelling from the centre to the header */
  fly: number
  /** 0..1 the page showing through */
  reveal: number
}

/** Everything the splash draws is a pure function of time, so any moment can be rendered and tested. */
export function splashProgress(t: number): SplashProgress {
  const T = SPLASH
  const strike = segment(t, T.hit, T.hit + 700)
  return {
    enter: segment(t, T.enter, T.hit),
    settle: t > T.hit ? 1 + 0.07 * Math.exp(-(t - T.hit) / 90) * Math.cos((t - T.hit) / 55) : 1,
    strike: strike > 0 && strike < 1 ? strike : null,
    fold: easeInOut(segment(t, T.hit + 300, T.open + 220)),
    uo: easeInOut(segment(t, T.open, T.open + 560)),
    orge: easeInOut(segment(t, T.open + 220, T.opened)),
    underline:
      easeOut(segment(t, T.opened - 120, T.opened + 380)) * (1 - segment(t, T.hold, T.hold + 220)),
    tag: segment(t, T.opened + 60, T.opened + 420) * (1 - segment(t, T.hold - 60, T.hold + 160)),
    fly: easeInOut(segment(t, T.hold, T.landed)),
    reveal: easeInOut(clamp01(segment(t, T.hold + 150, T.landed + 250))),
  }
}

/** A letter's offset on its way in from a corner: starts at (sx, sy), ends at (0, 0). */
export const entryOffset = (enter: number, sx: number, sy: number): [number, number] => {
  const rest = 1 - easeOut(enter)
  return [sx * rest, sy * rest]
}
