export default function Duo() {
  return (
    <section className="duo" id="team" aria-labelledby="duo-title" data-dim>
      <h2 id="duo-title" className="sr-only">The team</h2>
      <article className="half half-d">
        <p className="mono">Half one</p>
        <h3>Dhruv<br />Jain</h3>
        <p className="half-role">Co-founder · Full-stack & Flutter</p>
        <ul className="half-list">
          <li>Flutter apps</li><li>FastAPI backends</li><li>AI &amp; RAG</li><li>System design</li>
        </ul>
      </article>
      <div className="stroke" aria-hidden="true"><span className="mono">one shared stroke</span></div>
      <article className="half half-f">
        <p className="mono">Half two</p>
        <h3>Vanashri</h3>
        <p className="half-role">Co-founder · Developer</p>
        <ul className="half-list">
          <li>Skills coming soon</li>
        </ul>
      </article>
    </section>
  )
}
