const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/**
 * One frame of a split-flap display settling on `text`: letters lock in from left to right,
 * and the ones still turning show a random glyph. `pick` supplies the randomness (0..1).
 */
export function flapFrame(text: string, elapsed: number, pick: () => number = Math.random) {
  let out = ''
  let settled = true
  for (let i = 0; i < text.length; i++) {
    const locked = text[i] === ' ' || elapsed > 260 + i * 42
    if (!locked) settled = false
    out += locked ? text[i] : GLYPHS[Math.floor(pick() * GLYPHS.length) % GLYPHS.length]
  }
  return { text: out, settled }
}
