export const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)

/** 0 before `a`, 1 after `b`, linear in between: the building block of scroll-driven animation */
export const segment = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))

/** which frame of an `n`-frame sequence to show at progress p (0..1) */
export const frameAt = (p: number, n: number) => Math.round(clamp01(p) * (n - 1))
