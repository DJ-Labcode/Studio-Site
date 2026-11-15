import type { CSSProperties, ReactNode } from 'react'

/** The floating pill at the bottom of the footage: one line and one action. */
export function ActionBar({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={style}
      className="bg-paper/85 absolute inset-x-4 bottom-[5vh] z-10 mx-auto flex w-auto max-w-max flex-col items-start gap-3 rounded-2xl p-4 shadow-[0_20px_50px_-20px_rgb(40_25_10/0.35)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-5 sm:rounded-full sm:py-3 sm:pr-3 sm:pl-5"
    >
      {children}
    </div>
  )
}
