import { segment } from '@/shared/lib/math'

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

export const BOOT_LINES = [
  'loading websites',
  'loading apps',
  'loading planner',
  'starting DuoForge',
]
/** milliseconds: the lid opens, then one log line every LINE_EVERY, then the desktop */
const LID = [150, 1050] as const
const LOG_START = 1150
const LINE_EVERY = 420
export const BOOT_END = LOG_START + BOOT_LINES.length * LINE_EVERY + 320

/** The start-up at time t (ms): how far the lid is open, which log lines show, and the progress bar. */
export function bootAt(t: number) {
  return {
    /** degrees the lid is tipped back from open: -88 is shut flat on the keyboard, 0 is open */
    lid: -88 * (1 - easeInOut(segment(t, LID[0], LID[1]))),
    lines: BOOT_LINES.flatMap((text, i) => {
      const k = segment(t, LOG_START + i * LINE_EVERY, LOG_START + i * LINE_EVERY + 300)
      return k > 0 ? [{ text, dots: Math.round(k * 3), ok: k >= 1 }] : []
    }),
    bar: segment(t, LOG_START, BOOT_END - 200),
    done: t >= BOOT_END,
  }
}
