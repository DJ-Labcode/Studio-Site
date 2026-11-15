import { useEffect, useState } from 'react'
import { Logo } from './Logo'

const links = [
  ['Web', '#web'],
  ['Apps', '#apps'],
  ['Team', '#team'],
  ['Pricing', '#forge'],
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="wrap nav-inner">
        <a href="#top" aria-label="DuoForge home"><Logo /></a>
        <nav className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Main">
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <a href="#contact" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>Start a project</a>
        </nav>
        <button className="nav-toggle" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
      </div>
    </header>
  )
}
