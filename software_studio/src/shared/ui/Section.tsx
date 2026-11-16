import type { ReactNode } from 'react'

/** One part of the page: a small label naming the kind of window, a heading, and the window itself. */
export function Section({
  id,
  label,
  note,
  title,
  lead,
  children,
}: {
  id: string
  label: string
  note: string
  title: string
  lead?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="wrap part">
      <header>
        <p className="eyebrow">
          {label} <i>·</i> {note}
        </p>
        <h2>{title}</h2>
        {lead && <p className="lead">{lead}</p>}
      </header>
      {children}
    </section>
  )
}
