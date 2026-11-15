const G: Record<string, string[]> = {
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
}

function PixelWord() {
  const word = 'DUOFORGE'
  const cells: { x: number; y: number; ember: boolean }[] = []
  ;[...word].forEach((ch, i) =>
    G[ch].forEach((row, y) => [...row].forEach((v, x) => v === '1' && cells.push({ x: i * 6 + x, y, ember: i >= 3 }))),
  )
  return (
    <svg className="pixel-word" viewBox={`0 0 ${word.length * 6 - 1} 7`} role="img" aria-label="DuoForge" shapeRendering="crispEdges">
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width="1" height="1" className={c.ember ? 'pw-e' : 'pw-a'} style={{ animationDelay: `${(c.x * 0.012).toFixed(3)}s` }} />
      ))}
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <p className="footer-cta">Got something to build? <a href="#forge" className="ember">Start forging →</a></p>
          <nav className="footer-links" aria-label="Footer">
            <a href="#web">Web</a>
            <a href="#apps">Apps</a>
            <a href="#forge">Pricing</a>
            <a href="#team">Team</a>
          </nav>
        </div>
        <PixelWord />
        <div className="footer-bottom mono muted">
          <span>Web &amp; mobile app studio by Dhruv &amp; Vanashri</span>
          <span>© 2026 DuoForge</span>
        </div>
      </div>
    </footer>
  )
}
