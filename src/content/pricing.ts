/** Builder prices in INR. Example numbers: set the real rates before launch. */
export type Feature = { id: string; name: string; note: string; weeks: number; price: number }
export type Platform = 'android' | 'ios' | 'web'

export const base = { weeks: 2, price: 40_000 } as const

export const features: Feature[] = [
  {
    id: 'login',
    name: 'Login & profiles',
    note: 'Email, phone OTP, Google',
    weeks: 0.5,
    price: 12_000,
  },
  { id: 'pay', name: 'Payments', note: 'Razorpay, UPI, subscriptions', weeks: 1, price: 22_000 },
  {
    id: 'chat',
    name: 'Chat & notifications',
    note: 'Real-time chat, push alerts',
    weeks: 1.5,
    price: 30_000,
  },
  {
    id: 'book',
    name: 'Bookings & calendar',
    note: 'Slots, reminders, cancellations',
    weeks: 1,
    price: 20_000,
  },
  {
    id: 'maps',
    name: 'Maps & location',
    note: 'Live tracking, nearby search',
    weeks: 1,
    price: 18_000,
  },
  {
    id: 'admin',
    name: 'Admin dashboard',
    note: 'Web panel to run the business',
    weeks: 2,
    price: 38_000,
  },
  { id: 'ai', name: 'AI assistant', note: 'Answers from your own data', weeks: 2, price: 45_000 },
  {
    id: 'offline',
    name: 'Offline mode',
    note: 'Works without internet, syncs later',
    weeks: 1,
    price: 16_000,
  },
]

/** each platform after the first adds this share of time and cost */
export const extraPlatform = { weeks: 0.1, price: 0.15 } as const
/** the quote is shown as a range around the computed figure */
export const range = { low: 0.9, high: 1.15, weeksHigh: 1.25 } as const
