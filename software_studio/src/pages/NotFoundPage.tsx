import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <section
      className="wrap part"
      style={{
        minHeight: '80svh',
        alignContent: 'center',
        justifyItems: 'center',
        textAlign: 'center',
      }}
    >
      <p className="eyebrow">404</p>
      <h1>This page was never built.</h1>
      <div className="links">
        <Link to="/">Back home</Link>
      </div>
    </section>
  )
}
