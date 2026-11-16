import { segment } from '@/shared/lib/math'

/** Key moments of the splash, in milliseconds from the start. */
export const SPLASH = {
  arrive: 200,
  coupled: 1300,
  lift: 1850,
  lifted: 2550,
  depart: 2150,
  departed: 3050,
  fly: 3050,
  landed: 3750,
  end: 3950,
} as const

export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
export const easeIn = (x: number) => x * x * x
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

export type SplashProgress = {
  /** 0..1 the two trains rolling in until they couple */
  arrive: number
  /** -1..1 the small, quickly fading jolt right after coupling */
  jolt: number
  /** 0..1 life of the ring and sparks, or null when they are not on screen */
  strike: number | null
  /** 0..1 the letters rising off the coaches and closing up into the name */
  lift: number
  /** true from the moment the letters leave the coaches */
  lifted: boolean
  /** 0..1 the empty trains driving away */
  depart: number
  /** 0..1 the name travelling to the header */
  fly: number
  /** 0..1 the page showing through */
  reveal: number
  /** 0..1 opacity of the rail the trains stand on */
  rail: number
}

/** Everything the splash draws is a pure function of time, so any moment can be rendered and tested. */
export function splashProgress(t: number): SplashProgress {
  const T = SPLASH
  const strike = segment(t, T.coupled, T.coupled + 700)
  const since = t - T.coupled
  return {
    arrive: easeOut(segment(t, T.arrive, T.coupled)),
    jolt: since > 0 ? Math.exp(-since / 110) * Math.cos(since / 60) : 0,
    strike: strike > 0 && strike < 1 ? strike : null,
    lift: easeInOut(segment(t, T.lift, T.lifted)),
    lifted: t >= T.lift,
    depart: easeIn(segment(t, T.depart, T.departed)),
    fly: easeInOut(segment(t, T.fly, T.landed)),
    reveal: easeInOut(segment(t, T.fly + 60, T.landed + 120)),
    rail: segment(t, T.arrive, T.arrive + 500) * (1 - segment(t, T.departed - 300, T.departed)),
  }
}

const mix = (a: number, b: number, k: number) => a + (b - a) * k

/** A value that goes from `start` to `mid` as the letters lift, then on to `end` as the name flies to the header. */
export const threeStops = (start: number, mid: number, end: number, lift: number, fly: number) =>
  mix(mix(start, mid, lift), end, fly)
