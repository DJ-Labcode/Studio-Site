import clsx, { type ClassValue } from 'clsx'

/** join class names, skipping falsy values */
export const cn = (...v: ClassValue[]) => clsx(v)
