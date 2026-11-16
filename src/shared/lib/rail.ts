/**
 * The railway that runs down the story home is drawn by one feature, but its stations sit on
 * elements owned by other features. Those elements mark themselves with these attributes.
 */
export type RailLine = 'web' | 'app'
/** left = the website line's lane, right = the app line's lane, mid = where both run side by side */
export type RailLane = 'left' | 'right' | 'mid'

/** Spread on an element to put a station beside it. `big` marks the start of a section. */
export const railStop = (line: RailLine, lane: RailLane, big = false) => ({
  'data-rail-stop': line,
  'data-rail-lane': lane,
  ...(big ? { 'data-rail-big': '' } : {}),
})

/** Spread on a block that should wait for its train: it gets `data-arrived` when the train reaches its station. */
export const railReveal = { 'data-rail-reveal': '' } as const

/** Spread on the element both lines end at. */
export const railTerminus = { 'data-rail-terminus': '' } as const

/** ids of the sections the lines pass, in order */
export const RAIL_SECTIONS = {
  top: 'top',
  web: 'web',
  apps: 'apps',
  about: 'about',
  contact: 'contact',
} as const
