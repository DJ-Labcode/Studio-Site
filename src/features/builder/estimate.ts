import { base, extraPlatform, features, range, type Platform } from '@/content/pricing'

export type Estimate = { weeks: [number, number]; price: [number, number] }

/**
 * Pure pricing logic for the "forge your app" builder: no React, no DOM.
 * Unknown feature ids are ignored; at least one platform is always assumed.
 */
export function estimate(featureIds: readonly string[], platforms: readonly Platform[]): Estimate {
  const picked = features.filter((f) => featureIds.includes(f.id))
  const extra = Math.max(new Set(platforms).size - 1, 0)
  const weeks =
    (base.weeks + picked.reduce((a, f) => a + f.weeks, 0)) * (1 + extra * extraPlatform.weeks)
  const price =
    (base.price + picked.reduce((a, f) => a + f.price, 0)) * (1 + extra * extraPlatform.price)
  return {
    weeks: [Math.floor(weeks), Math.ceil(weeks * range.weeksHigh)],
    price: [Math.round(price * range.low), Math.round(price * range.high)],
  }
}

/** ₹97k, ₹1.2L, ₹12L */
export function formatInr(n: number): string {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(n >= 1_000_000 ? 0 : 1).replace(/\.0$/, '')}L`
  return `₹${Math.round(n / 1000)}k`
}
