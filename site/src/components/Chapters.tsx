const chapters = [
  {
    stage: 1, title: <>Two developers.</>,
    body: 'Dhruv builds apps and backends. Vanashri builds websites. Each of us can take a product from blank screen to launch alone.',
  },
  {
    stage: 2, title: <span className="ember">One forge.</span>,
    body: 'Our logo is two letters that share a single stroke. That’s how we work: one team, one codebase, one point of contact.',
  },
  {
    stage: 3, title: <>It starts with your idea.</>,
    body: 'A sketch, a voice note, a competitor you like. On a free call we turn it into a clear plan: who it’s for, what it must do, and what it can skip.',
  },
  {
    stage: 4, title: <>We draw it first.</>,
    body: 'Wireframes, then clickable Figma screens. You change anything you want before a single line of code exists.',
  },
  {
    stage: 5, title: <>Then we build it.</>,
    body: 'React and Next.js for the web, Flutter for Android and iOS, Firebase or FastAPI behind them. A new build to try every Friday.',
  },
]

export function Hero() {
  return (
    <section className="chapter hero" id="top" data-stage="0">
      <div className="wrap chapter-inner">
        <div className="chapter-copy">
          <p className="badge"><span className="dot" /> Open for new projects</p>
          <h1>Every product starts at <span className="ember zero">0%</span>.</h1>
          <p className="lead">
            We’re DuoForge, a two-developer studio for websites and mobile apps. Scroll, and watch us forge one
            from raw pixels to a shipped product.
          </p>
          <div className="hero-cta">
            <a href="#forge" className="btn btn-primary">Start a project <span aria-hidden="true">→</span></a>
            <a href="#work" className="btn btn-ghost">See our work</a>
          </div>
        </div>
      </div>
      <p className="scroll-hint mono" aria-hidden="true">Scroll to forge <i /></p>
    </section>
  )
}

export function Chapters() {
  return (
    <>
      {chapters.map((c) => (
        <section key={c.stage} className="chapter" data-stage={c.stage}>
          <div className="wrap chapter-inner">
            <div className="chapter-copy">
              <p className="mono chapter-pct">{Math.round((c.stage / 8) * 100)}%</p>
              <h2 className="chapter-h">{c.title}</h2>
              <p className="lead">{c.body}</p>
            </div>
          </div>
        </section>
      ))}
    </>
  )
}

export function Launch() {
  return (
    <section className="chapter launch" data-stage="7">
      <div className="wrap chapter-inner">
        <div className="chapter-copy">
          <p className="mono chapter-pct">88%</p>
          <h2 className="chapter-h">Launch day.</h2>
          <p className="lead">We publish to the Play Store, the App Store and the web, then stay on with 30 days of free fixes.</p>
        </div>
      </div>
    </section>
  )
}

export function Forged() {
  return (
    <section className="chapter forged" data-stage="8">
      <div className="wrap chapter-inner">
        <div className="chapter-copy">
          <p className="mono chapter-pct ember">100%</p>
          <h2 className="chapter-h">Forged.</h2>
          <p className="lead">Your product, live and in your users’ hands. What should we forge next?</p>
          <div className="hero-cta">
            <a href="#forge" className="btn btn-primary">Forge my idea <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    </section>
  )
}
