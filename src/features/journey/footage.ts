import { frameUrls } from '@/shared/lib/frames'

/** The three pieces of footage the journey plays. Swap the files in /public/frames to change the film. */
export const HERO_LOOP = '/frames/hero/hero.mp4'
export const PUSH_FRAMES = frameUrls('push', 96)
export const PULL_FRAMES = frameUrls('pull', 108)

/** frames worth waiting for before the splash lifts: enough to start scrolling smoothly */
export const FIRST_FRAMES = PUSH_FRAMES.slice(0, 24)
